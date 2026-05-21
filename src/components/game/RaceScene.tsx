import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { buildCar } from '@/lib/cars';
import { circuitById } from '@/lib/circuits';
import type { GameState } from '@/types/game';

interface RaceSceneProps {
  gameState: GameState;
}

const LANE_WIDTH = 1.7;
const ROAD_WIDTH = LANE_WIDTH * 4;
const ROAD_LENGTH_AHEAD = 90;     // how far ahead of camera the road plane reaches
const ROAD_LENGTH_BEHIND = 20;
const LANE_MARKER_SPACING = 5;    // distance between dashes
const DASH_LENGTH = 2.4;
const DASH_WIDTH = 0.16;

const laneToX = (lane: number) => (lane - 1.5) * LANE_WIDTH;

export const RaceScene = ({ gameState }: RaceSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerGroupRef = useRef<THREE.Group | null>(null);
  const trafficGroupRef = useRef<THREE.Group | null>(null);     // parent of traffic car groups
  const powerupGroupRef = useRef<THREE.Group | null>(null);
  const laneMarkersRef = useRef<THREE.Group | null>(null);
  const finishLineRef = useRef<THREE.Mesh | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Re-stable state via ref so the animation loop closes over the latest values.
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  // Cache of built traffic groups keyed by their id so we don't rebuild every frame.
  const trafficCache = useMemo(() => new Map<string, THREE.Group>(), []);

  // ── Init scene ──────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(58, 1, 0.5, 200);
    camera.position.set(0, 3.4, 5.8);
    camera.lookAt(0, 0.5, -6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting — sun-style key + ambient + a slight back-rim
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.05);
    key.position.set(6, 10, 4);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9ecfff, 0.45);
    rim.position.set(-4, 5, -6);
    scene.add(rim);

    // Road
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_LENGTH_AHEAD + ROAD_LENGTH_BEHIND),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.95, metalness: 0.0 }),
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -(ROAD_LENGTH_AHEAD - ROAD_LENGTH_BEHIND) / 2);
    road.receiveShadow = true;
    scene.add(road);

    // Road edges (white side lines)
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xf3f4f6 });
    const edgeL = new THREE.Mesh(new THREE.PlaneGeometry(0.18, ROAD_LENGTH_AHEAD + ROAD_LENGTH_BEHIND), edgeMat);
    edgeL.rotation.x = -Math.PI / 2;
    edgeL.position.set(-ROAD_WIDTH / 2 + 0.01, 0.001, -(ROAD_LENGTH_AHEAD - ROAD_LENGTH_BEHIND) / 2);
    scene.add(edgeL);
    const edgeR = edgeL.clone();
    edgeR.position.x = ROAD_WIDTH / 2 - 0.01;
    scene.add(edgeR);

    // Dashed lane markers — pre-create N dashes and recycle their z positions per frame.
    const laneMarkers = new THREE.Group();
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const dashGeo = new THREE.PlaneGeometry(DASH_WIDTH, DASH_LENGTH);
    const dashesPerLane = Math.ceil((ROAD_LENGTH_AHEAD + ROAD_LENGTH_BEHIND) / LANE_MARKER_SPACING) + 2;
    for (let lane = 1; lane <= 3; lane++) {
      const x = (lane - 2) * LANE_WIDTH;
      for (let i = 0; i < dashesPerLane; i++) {
        const dash = new THREE.Mesh(dashGeo, dashMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(x, 0.002, 0);
        dash.userData.lane = lane;
        dash.userData.i = i;
        laneMarkers.add(dash);
      }
    }
    scene.add(laneMarkers);
    laneMarkersRef.current = laneMarkers;

    // Finish line — bright checker bar
    const finishMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const finishLine = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_WIDTH, 1.0), finishMat);
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.set(0, 0.004, -1000); // park it off-screen until racing
    scene.add(finishLine);
    finishLineRef.current = finishLine;

    // Player car
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);
    playerGroupRef.current = playerGroup;

    // Traffic + powerups parents
    const trafficGroup = new THREE.Group();
    scene.add(trafficGroup);
    trafficGroupRef.current = trafficGroup;

    const powerupGroup = new THREE.Group();
    scene.add(powerupGroup);
    powerupGroupRef.current = powerupGroup;

    // Resize observer keeps WebGL canvas in lockstep with its CSS box.
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    // Animate
    const animate = () => {
      const state = stateRef.current;
      const racing = state.status === 'racing' || state.status === 'countdown' || state.status === 'crashed';

      // ── Player car: rebuild if changed avatar; reposition each frame ──
      if (playerGroupRef.current) {
        const need = playerGroupRef.current.userData.builtCar !== state.player.carId;
        if (need) {
          // Build the player car (and tilt it -90° around Y so it faces forward = -Z)
          buildCar(playerGroupRef.current, getCarById(state.player.carId));
          playerGroupRef.current.rotation.y = Math.PI; // face -Z
          playerGroupRef.current.userData.builtCar = state.player.carId;
        }
        const playerX = laneToX(state.player.laneFloat);
        playerGroupRef.current.position.set(playerX, 0, 0);

        // Boost flash + shield ring
        const now = performance.now();
        const boosted = state.player.boostUntilMs > now;
        const shielded = state.player.shieldUntilMs > now;
        applyBoostShield(playerGroupRef.current, boosted, shielded);
      }

      // ── Lane markers: shift z based on player.z for sense of motion ──
      if (laneMarkersRef.current && racing) {
        const offset = (-state.player.z) % LANE_MARKER_SPACING;
        let idx = 0;
        for (const dash of laneMarkersRef.current.children as THREE.Mesh[]) {
          const i = dash.userData.i as number;
          dash.position.z = ROAD_LENGTH_BEHIND - (i * LANE_MARKER_SPACING) + offset;
          idx++;
        }
      }

      // ── Finish line — position relative to player ──
      if (finishLineRef.current && racing) {
        finishLineRef.current.position.z = -state.player.z;
      }

      // ── Traffic ──
      if (trafficGroupRef.current) {
        const seen = new Set<string>();
        for (const t of state.traffic) {
          seen.add(t.id);
          let g = trafficCache.get(t.id);
          if (!g) {
            g = new THREE.Group();
            buildCar(g, getCarById(t.carId));
            g.rotation.y = Math.PI; // traffic faces forward like player
            trafficCache.set(t.id, g);
            trafficGroupRef.current.add(g);
          }
          const sceneZ = -(state.player.z - t.z); // ahead of player = -Z
          g.position.set(laneToX(t.lane), 0, sceneZ);
        }
        // Remove cached traffic that no longer exists
        for (const [id, g] of trafficCache) {
          if (!seen.has(id)) {
            trafficGroupRef.current.remove(g);
            trafficCache.delete(id);
          }
        }
      }

      // ── Power-ups ──
      if (powerupGroupRef.current) {
        while (powerupGroupRef.current.children.length > state.powerUps.length) {
          powerupGroupRef.current.remove(powerupGroupRef.current.children[powerupGroupRef.current.children.length - 1]);
        }
        for (let i = 0; i < state.powerUps.length; i++) {
          const p = state.powerUps[i];
          let mesh = powerupGroupRef.current.children[i] as THREE.Mesh | undefined;
          if (!mesh) {
            mesh = new THREE.Mesh(
              new THREE.OctahedronGeometry(0.35, 0),
              new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.6, roughness: 0.2, emissive: 0xffffff, emissiveIntensity: 0.4 }),
            );
            powerupGroupRef.current.add(mesh);
          }
          const colour = p.type === 'boost' ? 0xfbbf24 : p.type === 'shield' ? 0x22c55e : 0xef4444;
          (mesh.material as THREE.MeshStandardMaterial).color.setHex(colour);
          (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(colour);
          mesh.visible = !p.collected && p.z >= state.player.z - 8;
          const sceneZ = -(state.player.z - p.z);
          mesh.position.set(laneToX(p.lane), 0.7 + Math.sin(performance.now() / 220 + i) * 0.1, sceneZ);
          mesh.rotation.y = performance.now() / 600 + i;
          mesh.rotation.z = performance.now() / 900 + i;
        }
      }

      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };
    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      ro.disconnect();
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none' }}
    />
  );
};

// ── helpers ──────────────────────────────────────────────────────────────
import { CARS, type CarConfig } from '@/lib/cars';
const getCarById = (id: string): CarConfig => CARS.find((c) => c.id === id) ?? CARS[0];

const applyBoostShield = (group: THREE.Group, boosted: boolean, shielded: boolean) => {
  let halo = group.getObjectByName('boostHalo') as THREE.Mesh | undefined;
  if (boosted) {
    if (!halo) {
      halo = new THREE.Mesh(
        new THREE.RingGeometry(0.9, 1.1, 24),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
      );
      halo.name = 'boostHalo';
      halo.rotation.x = -Math.PI / 2;
      group.add(halo);
    }
    halo.position.set(0, 0.05, 0);
    halo.rotation.z = performance.now() / 200;
  } else if (halo) {
    group.remove(halo);
  }

  let shieldDome = group.getObjectByName('shieldDome') as THREE.Mesh | undefined;
  if (shielded) {
    if (!shieldDome) {
      shieldDome = new THREE.Mesh(
        new THREE.SphereGeometry(1.4, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.18, wireframe: true }),
      );
      shieldDome.name = 'shieldDome';
      shieldDome.position.set(0, 0.5, 0);
      group.add(shieldDome);
    }
  } else if (shieldDome) {
    group.remove(shieldDome);
  }
};
