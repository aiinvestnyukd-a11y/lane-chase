import { useCallback, useEffect, useRef, useState } from 'react';
import { CARS, carById } from '@/lib/cars';
import { CIRCUITS, circuitById, type CircuitConfig } from '@/lib/circuits';
import type { GameState, PlayerCar, PowerType, PowerUp, TrafficCar } from '@/types/game';

// ── Tunable constants ────────────────────────────────────────────────────
const LANES = 4;
const COUNTDOWN_MS = 3000;
const BASE_PLAYER_SPEED = 12;       // legacy export — not used in physics
const SPEED_MULTIPLIER = 1.7;       // global multiplier on car.topSpeed
const BOOST_MULTIPLIER = 1.6;
const SLOW_MULTIPLIER = 0.5;
const TRAFFIC_BASE_SPEED = 6;       // units/sec other cars (slightly faster too, but still slower than the player)
const LANE_SWITCH_RATE = 6;         // how fast laneFloat lerps toward lane
const POWERUP_DURATION_MS = 5000;
const COLLISION_RADIUS_Z = 1.2;     // longitudinal hit margin
const COLLISION_RADIUS_LANE = 0.4;  // lateral hit margin (in lane units)
const SCORE_PER_UNIT = 1;           // distance score
const SCORE_PER_KEY = 50;           // power-up collection
const SCORE_PER_LEVEL = 200;        // finishing bonus

const newId = (() => {
  let n = 0;
  return (prefix: string) => `${prefix}-${++n}`;
})();

const trafficCarIdAtIndex = (idx: number): string => {
  // Pick a low-tier visual for traffic — keeps the player feeling faster.
  const trafficPool = CARS.slice(0, 8);
  return trafficPool[idx % trafficPool.length].id;
};

const makePlayer = (carId: string, distance: number): PlayerCar => ({
  carId,
  lane: 1,
  laneFloat: 1,
  z: distance,    // start at the far end, finish line is z = 0
  speed: 0,
  throttle: 0,
  shieldUntilMs: 0,
  boostUntilMs: 0,
  slowUntilMs: 0,
});

const buildTraffic = (circuit: CircuitConfig): TrafficCar[] => {
  const count = Math.round((circuit.distance / 100) * circuit.traffic);
  const arr: TrafficCar[] = [];
  for (let i = 0; i < count; i++) {
    // Skip the first 80 units so the player has clear track at the start.
    const z = 80 + Math.random() * (circuit.distance - 120);
    arr.push({
      id: newId('traffic'),
      lane: Math.floor(Math.random() * LANES),
      z,
      speed: TRAFFIC_BASE_SPEED * (0.6 + Math.random() * 0.8),
      carId: trafficCarIdAtIndex(i),
    });
  }
  return arr;
};

const buildPowerUps = (circuit: CircuitConfig): PowerUp[] => {
  const total = Math.max(4, Math.floor(circuit.distance / 250));
  const arr: PowerUp[] = [];
  const TYPES: PowerType[] = ['boost', 'shield', 'slow'];
  for (let i = 0; i < total; i++) {
    const z = 50 + Math.random() * (circuit.distance - 100);
    arr.push({
      id: newId('pw'),
      lane: Math.floor(Math.random() * LANES),
      z,
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
      collected: false,
    });
  }
  return arr;
};

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const defaultCircuit = CIRCUITS[0];
    return {
      status: 'garage',
      selectedCarId: CARS[0].id,
      selectedCircuitId: defaultCircuit.id,
      unlockedCarLevel: 1,
      unlockedCircuits: 0,
      totalScore: 0,
      raceScore: 0,
      player: makePlayer(CARS[0].id, defaultCircuit.distance),
      traffic: [],
      powerUps: [],
      raceDistance: defaultCircuit.distance,
      raceStartMs: 0,
      countdownStartMs: 0,
    };
  });

  const throttleRef = useRef(0);    // current throttle 0..1
  const turnRef = useRef(0);        // current turn intent -1..+1 (left/right)
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  // ── State transitions ───────────────────────────────────────────────────
  const selectCar = useCallback((carId: string) => {
    setGameState((prev) => ({ ...prev, selectedCarId: carId }));
  }, []);

  const selectCircuit = useCallback((circuitId: string) => {
    setGameState((prev) => ({ ...prev, selectedCircuitId: circuitId }));
  }, []);

  const goToCircuitSelect = useCallback(() => {
    setGameState((prev) => ({ ...prev, status: 'circuitSelect' }));
  }, []);

  const goToGarage = useCallback(() => {
    setGameState((prev) => ({ ...prev, status: 'garage' }));
  }, []);

  const startCountdown = useCallback(() => {
    setGameState((prev) => {
      const circuit = circuitById(prev.selectedCircuitId);
      return {
        ...prev,
        status: 'countdown',
        player: makePlayer(prev.selectedCarId, circuit.distance),
        traffic: buildTraffic(circuit),
        powerUps: buildPowerUps(circuit),
        raceDistance: circuit.distance,
        raceScore: 0,
        countdownStartMs: performance.now(),
        raceStartMs: 0,
      };
    });
  }, []);

  const restart = useCallback(() => {
    setGameState((prev) => ({ ...prev, status: 'garage' }));
  }, []);

  const setThrottle = useCallback((v: number) => {
    throttleRef.current = Math.max(0, Math.min(1, v));
  }, []);

  const setTurn = useCallback((v: number) => {
    turnRef.current = Math.max(-1, Math.min(1, v));
  }, []);

  const switchLane = useCallback((delta: -1 | 1) => {
    setGameState((prev) => {
      if (prev.status !== 'racing') return prev;
      const lane = Math.max(0, Math.min(LANES - 1, prev.player.lane + delta));
      if (lane === prev.player.lane) return prev;
      return { ...prev, player: { ...prev.player, lane } };
    });
  }, []);

  // ── Main loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = (now: number) => {
      if (lastTickRef.current === null) lastTickRef.current = now;
      const dtMs = now - lastTickRef.current;
      const dt = Math.min(0.05, dtMs / 1000); // clamp big gaps
      lastTickRef.current = now;

      setGameState((prev) => {
        if (prev.status === 'countdown') {
          if (now - prev.countdownStartMs >= COUNTDOWN_MS) {
            return { ...prev, status: 'racing', raceStartMs: now };
          }
          return prev;
        }
        if (prev.status !== 'racing') return prev;

        const car = carById(prev.player.carId);
        const circuit = circuitById(prev.selectedCircuitId);

        // ── Update player ────────────────────────────────────────────────
        const targetThrottle = throttleRef.current;
        const accelRate = car.acceleration * 8; // higher = quicker rev
        const throttle = prev.player.throttle + Math.sign(targetThrottle - prev.player.throttle) * Math.min(Math.abs(targetThrottle - prev.player.throttle), accelRate * dt);
        const baseSpeed = car.topSpeed * throttle * SPEED_MULTIPLIER;
        let speedMul = 1 * circuit.speedCap;
        if (prev.player.boostUntilMs > now) speedMul *= BOOST_MULTIPLIER;
        if (prev.player.slowUntilMs > now) speedMul *= SLOW_MULTIPLIER;
        const speed = baseSpeed * speedMul;

        // z decreases as you move toward finish
        let z = prev.player.z - speed * dt;
        let raceScore = prev.player.z - z; // distance covered this frame
        const scoreSoFar = prev.raceScore + raceScore * SCORE_PER_UNIT;

        // Lane lerp + turn intent
        const targetLane = Math.max(0, Math.min(LANES - 1, prev.player.lane + turnRef.current * 0));
        // turnRef only triggers via switchLane (event), so use prev.player.lane as the target.
        const laneTarget = prev.player.lane;
        const laneFloat = prev.player.laneFloat + (laneTarget - prev.player.laneFloat) * Math.min(1, dt * LANE_SWITCH_RATE * (0.7 + car.handling));

        // Finish line?
        if (z <= 0) {
          // Cross the line!
          const newUnlock = Math.max(prev.unlockedCircuits, CIRCUITS.findIndex((c) => c.id === circuit.id) + 1);
          return {
            ...prev,
            status: 'finished',
            player: { ...prev.player, z: 0, laneFloat, throttle, speed },
            raceScore: scoreSoFar + SCORE_PER_LEVEL,
            totalScore: prev.totalScore + scoreSoFar + SCORE_PER_LEVEL,
            unlockedCircuits: newUnlock,
            unlockedCarLevel: Math.max(prev.unlockedCarLevel, Math.min(CARS.length, newUnlock + 1)),
          };
        }

        // ── Update traffic (they move toward finish too, at slower speeds) ─
        const traffic = prev.traffic
          .map((t) => ({ ...t, z: t.z - t.speed * dt }))
          .filter((t) => t.z > -10); // remove cars that have already crossed

        // ── Collisions: player vs traffic ───────────────────────────────
        const shielded = prev.player.shieldUntilMs > now;
        if (!shielded) {
          for (const t of traffic) {
            if (Math.abs(t.lane - laneFloat) > COLLISION_RADIUS_LANE) continue;
            if (Math.abs(t.z - z) > COLLISION_RADIUS_Z) continue;
            // Crash!
            return {
              ...prev,
              status: 'crashed',
              player: { ...prev.player, z, laneFloat, throttle, speed: 0 },
              traffic,
              raceScore: scoreSoFar,
              totalScore: prev.totalScore + scoreSoFar,
            };
          }
        }

        // ── Power-ups ───────────────────────────────────────────────────
        let bonusScore = 0;
        let shieldUntilMs = prev.player.shieldUntilMs;
        let boostUntilMs = prev.player.boostUntilMs;
        let slowUntilMs = prev.player.slowUntilMs;
        const powerUps = prev.powerUps.map((p) => {
          if (p.collected) return p;
          if (Math.abs(p.lane - laneFloat) > COLLISION_RADIUS_LANE) return p;
          if (Math.abs(p.z - z) > COLLISION_RADIUS_Z) return p;
          if (p.type === 'boost') boostUntilMs = now + POWERUP_DURATION_MS;
          else if (p.type === 'shield') shieldUntilMs = now + POWERUP_DURATION_MS;
          else if (p.type === 'slow') slowUntilMs = now + POWERUP_DURATION_MS;
          bonusScore += SCORE_PER_KEY;
          return { ...p, collected: true };
        });

        return {
          ...prev,
          player: {
            ...prev.player,
            z,
            laneFloat,
            throttle,
            speed,
            shieldUntilMs,
            boostUntilMs,
            slowUntilMs,
          },
          traffic,
          powerUps,
          raceScore: scoreSoFar + bonusScore,
        };
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTickRef.current = null;
    };
  }, []);

  // ── Keyboard ────────────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') setThrottle(1);
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') setThrottle(0);
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { switchLane(-1); e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { switchLane(1); e.preventDefault(); }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') setThrottle(0);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [setThrottle, switchLane]);

  return {
    gameState,
    selectCar,
    selectCircuit,
    goToCircuitSelect,
    goToGarage,
    startCountdown,
    restart,
    setThrottle,
    switchLane,
    LANES,
    BASE_PLAYER_SPEED,
  };
}
