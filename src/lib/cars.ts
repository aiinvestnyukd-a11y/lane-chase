import * as THREE from 'three';

export type BodyShape =
  | 'compact'   // tiny hatchback
  | 'sedan'     // 4-door
  | 'hatch'     // 5-door hatchback
  | 'suv'       // tall, wide
  | 'pickup'    // truck with bed
  | 'coupe'     // 2-door long
  | 'muscle'    // wide, brutal
  | 'roadster'  // low convertible
  | 'super'     // wide low sports
  | 'rally'     // tall hatch with fenders
  | 'lmp'       // le mans prototype
  | 'formula'   // open-wheel
  | 'concept';  // futuristic flat

export interface CarConfig {
  id: string;
  name: string;
  shape: BodyShape;
  bodyColor: number;
  trimColor: number;
  glassColor: number;       // window tint
  accentColor?: number;     // stripes, decals, neons
  hasSpoiler?: boolean;
  hasRoofRack?: boolean;
  hasFenders?: boolean;
  topSpeed: number;         // visual + game units / second (8 = slow, 28 = hyper)
  acceleration: number;     // 0-1 (how quickly speed ramps to top)
  handling: number;         // 0-1 (lateral switch speed)
  unlockLevel: number;      // 1-20
}

// ──────────────────────────────────────────────────────────────────────────
// 20 cars — progression from cheap city runabout to bleeding-edge hypercar.
// ──────────────────────────────────────────────────────────────────────────

export const CARS: CarConfig[] = [
  { id: 'beetle',     name: 'Beetle',         shape: 'compact', bodyColor: 0xfde047, trimColor: 0x1f2937, glassColor: 0x0f172a,                                                       topSpeed:  9, acceleration: 0.30, handling: 0.55, unlockLevel:  1 },
  { id: 'cityhatch',  name: 'City Hatch',     shape: 'hatch',   bodyColor: 0xef4444, trimColor: 0x111827, glassColor: 0x111827,                                                       topSpeed: 10, acceleration: 0.34, handling: 0.58, unlockLevel:  1 },
  { id: 'familysedan',name: 'Family Sedan',   shape: 'sedan',   bodyColor: 0x3b82f6, trimColor: 0x1e3a8a, glassColor: 0x0f172a,                                                       topSpeed: 11, acceleration: 0.36, handling: 0.50, unlockLevel:  2 },
  { id: 'pickup',     name: 'Workhorse',      shape: 'pickup',  bodyColor: 0x65a30d, trimColor: 0x1f2937, glassColor: 0x111827,                                                       topSpeed: 12, acceleration: 0.40, handling: 0.45, unlockLevel:  3 },
  { id: 'suv',        name: 'Trailblazer',    shape: 'suv',     bodyColor: 0x7c2d12, trimColor: 0x44403c, glassColor: 0x111827,                                  hasRoofRack: true, topSpeed: 12, acceleration: 0.42, handling: 0.48, unlockLevel:  3 },
  { id: 'hothatch',   name: 'Hot Hatch',      shape: 'hatch',   bodyColor: 0xfb923c, trimColor: 0x1c1917, glassColor: 0x0a0a0a, accentColor: 0xfacc15, hasSpoiler: true,             topSpeed: 14, acceleration: 0.55, handling: 0.65, unlockLevel:  4 },
  { id: 'sportsedan', name: 'Sport Sedan',    shape: 'sedan',   bodyColor: 0x111827, trimColor: 0xe5e7eb, glassColor: 0x0a0a0a, accentColor: 0xdc2626,                                topSpeed: 15, acceleration: 0.58, handling: 0.62, unlockLevel:  5 },
  { id: 'coupe',      name: 'Sport Coupe',    shape: 'coupe',   bodyColor: 0xf59e0b, trimColor: 0x1c1917, glassColor: 0x0a0a0a, hasSpoiler: true,                                     topSpeed: 16, acceleration: 0.62, handling: 0.68, unlockLevel:  6 },
  { id: 'muscle',     name: 'Muscle 67',      shape: 'muscle',  bodyColor: 0x991b1b, trimColor: 0xfde047, glassColor: 0x111827, accentColor: 0xfde047,                                topSpeed: 17, acceleration: 0.68, handling: 0.55, unlockLevel:  7 },
  { id: 'gt',         name: 'GT Cruiser',     shape: 'coupe',   bodyColor: 0x065f46, trimColor: 0xe5e7eb, glassColor: 0x0a0a0a, hasSpoiler: true,                                     topSpeed: 18, acceleration: 0.70, handling: 0.72, unlockLevel:  8 },
  { id: 'roadster',   name: 'Roadster',       shape: 'roadster',bodyColor: 0xbe123c, trimColor: 0x0a0a0a, glassColor: 0x111827,                                                       topSpeed: 18, acceleration: 0.74, handling: 0.78, unlockLevel:  9 },
  { id: 'sportcoupe', name: 'Track Special',  shape: 'coupe',   bodyColor: 0xfacc15, trimColor: 0x111827, glassColor: 0x0a0a0a, accentColor: 0x000000, hasSpoiler: true,             topSpeed: 19, acceleration: 0.78, handling: 0.80, unlockLevel: 10 },
  { id: 'rallybeast', name: 'Rally Beast',    shape: 'rally',   bodyColor: 0x0ea5e9, trimColor: 0xfde047, glassColor: 0x111827, accentColor: 0xfde047, hasFenders: true,             topSpeed: 19, acceleration: 0.80, handling: 0.85, unlockLevel: 11 },
  { id: 'super1',     name: 'Phantom S',      shape: 'super',   bodyColor: 0x0f172a, trimColor: 0xfbbf24, glassColor: 0x000000, hasSpoiler: true,                                     topSpeed: 22, acceleration: 0.86, handling: 0.82, unlockLevel: 12 },
  { id: 'super2',     name: 'Vortex GTX',     shape: 'super',   bodyColor: 0xa3e635, trimColor: 0x111827, glassColor: 0x0a0a0a, hasSpoiler: true, accentColor: 0x111827,             topSpeed: 23, acceleration: 0.88, handling: 0.85, unlockLevel: 13 },
  { id: 'hyper1',     name: 'Astra Hyper',    shape: 'super',   bodyColor: 0xec4899, trimColor: 0x0f172a, glassColor: 0x000000, hasSpoiler: true, accentColor: 0x06b6d4,             topSpeed: 25, acceleration: 0.92, handling: 0.88, unlockLevel: 14 },
  { id: 'lmp',        name: 'LMP Prototype',  shape: 'lmp',     bodyColor: 0x06b6d4, trimColor: 0x0f172a, glassColor: 0x000000, accentColor: 0xfbbf24, hasSpoiler: true,             topSpeed: 26, acceleration: 0.94, handling: 0.93, unlockLevel: 15 },
  { id: 'formula1',   name: 'F-Spec One',     shape: 'formula', bodyColor: 0xdc2626, trimColor: 0x0a0a0a, glassColor: 0x000000, accentColor: 0xffffff, hasSpoiler: true,             topSpeed: 27, acceleration: 0.96, handling: 0.95, unlockLevel: 17 },
  { id: 'conceptEV',  name: 'Concept EV',     shape: 'concept', bodyColor: 0xe5e7eb, trimColor: 0x06b6d4, glassColor: 0x000000, accentColor: 0x06b6d4,                                topSpeed: 26, acceleration: 0.98, handling: 0.92, unlockLevel: 18 },
  { id: 'hyperEV',    name: 'Nyx Hyperion',   shape: 'concept', bodyColor: 0x111827, trimColor: 0xfbbf24, glassColor: 0x000000, accentColor: 0xfbbf24, hasSpoiler: true,             topSpeed: 28, acceleration: 1.00, handling: 0.98, unlockLevel: 20 },
];

export const carById = (id: string): CarConfig => CARS.find((c) => c.id === id) ?? CARS[0];

// ──────────────────────────────────────────────────────────────────────────
// Three.js builder — turns a CarConfig into a 3D model from primitives.
// Cars face +Z (north) by default. Body sits with wheel-axles at y=0.
// ──────────────────────────────────────────────────────────────────────────

interface Dims { length: number; width: number; height: number; wheelRadius: number; wheelWidth: number; }

const DIMS: Record<BodyShape, Dims> = {
  compact:  { length: 2.4, width: 1.3, height: 0.55, wheelRadius: 0.22, wheelWidth: 0.18 },
  hatch:    { length: 2.6, width: 1.35, height: 0.6, wheelRadius: 0.24, wheelWidth: 0.18 },
  sedan:    { length: 3.0, width: 1.45, height: 0.55, wheelRadius: 0.25, wheelWidth: 0.20 },
  pickup:   { length: 3.2, width: 1.5, height: 0.7, wheelRadius: 0.30, wheelWidth: 0.25 },
  suv:      { length: 3.0, width: 1.55, height: 0.75, wheelRadius: 0.30, wheelWidth: 0.24 },
  coupe:    { length: 2.8, width: 1.45, height: 0.45, wheelRadius: 0.26, wheelWidth: 0.22 },
  muscle:   { length: 3.1, width: 1.55, height: 0.5, wheelRadius: 0.30, wheelWidth: 0.28 },
  roadster: { length: 2.7, width: 1.45, height: 0.35, wheelRadius: 0.25, wheelWidth: 0.22 },
  super:    { length: 2.9, width: 1.55, height: 0.35, wheelRadius: 0.28, wheelWidth: 0.26 },
  rally:    { length: 2.7, width: 1.55, height: 0.65, wheelRadius: 0.30, wheelWidth: 0.26 },
  lmp:      { length: 3.1, width: 1.65, height: 0.3, wheelRadius: 0.28, wheelWidth: 0.28 },
  formula:  { length: 3.3, width: 1.4, height: 0.25, wheelRadius: 0.28, wheelWidth: 0.30 },
  concept:  { length: 3.0, width: 1.6, height: 0.4, wheelRadius: 0.27, wheelWidth: 0.24 },
};

const std = (color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, ...opts });

const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => {
  const x = new THREE.Mesh(g, m);
  x.castShadow = true;
  x.receiveShadow = true;
  return x;
};

const at = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number): T => {
  o.position.set(x, y, z);
  return o;
};

const mirrorX = (o: THREE.Object3D): THREE.Object3D => {
  const c = o.clone();
  c.position.x = -o.position.x;
  return c;
};

export function buildCar(group: THREE.Group, config: CarConfig): void {
  while (group.children.length > 0) group.remove(group.children[0]);

  const d = DIMS[config.shape];
  const body = std(config.bodyColor, { metalness: 0.6, roughness: 0.35, emissive: config.bodyColor, emissiveIntensity: 0.04 });
  const trim = std(config.trimColor, { metalness: 0.8, roughness: 0.25 });
  const glass = std(config.glassColor, { metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.85 });
  const tyre = std(0x111111, { metalness: 0.05, roughness: 0.9 });
  const rim = std(0xd1d5db, { metalness: 0.95, roughness: 0.15 });
  const headlight = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
  const taillight = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
  const accent = config.accentColor ? std(config.accentColor, { metalness: 0.5, roughness: 0.3, emissive: config.accentColor, emissiveIntensity: 0.1 }) : null;

  // ── BODY ────────────────────────────────────────────────────────────────
  // The body is a stack of boxes: lower chassis + upper greenhouse,
  // shape-tuned for the silhouette.
  const chassisH = d.height * 0.65;
  const chassis = mesh(new THREE.BoxGeometry(d.width, chassisH, d.length), body);
  chassis.position.y = chassisH / 2 + d.wheelRadius * 0.5;
  group.add(chassis);

  // Greenhouse / cabin (varies per shape)
  if (config.shape === 'formula') {
    // Open-wheel: a long tapered nose + cockpit pod
    const nose = mesh(new THREE.BoxGeometry(d.width * 0.45, d.height * 0.4, d.length * 0.45), body);
    nose.position.set(0, chassisH * 0.4 + d.wheelRadius * 0.5, d.length * 0.25);
    group.add(nose);
    const cockpit = mesh(new THREE.CylinderGeometry(d.width * 0.3, d.width * 0.3, d.width * 0.55, 12, 1, false, 0, Math.PI), glass);
    cockpit.rotation.z = Math.PI / 2;
    cockpit.position.set(0, chassisH + d.wheelRadius * 0.5, -d.length * 0.05);
    group.add(cockpit);
  } else if (config.shape === 'lmp') {
    // Le Mans prototype: low long nose + bubble canopy
    const canopy = mesh(new THREE.SphereGeometry(d.width * 0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), glass);
    canopy.scale.set(1, 0.55, 1.4);
    canopy.position.set(0, chassisH + d.wheelRadius * 0.5, -d.length * 0.05);
    group.add(canopy);
  } else if (config.shape === 'roadster') {
    // Open-top convertible — just a small windshield
    const windshield = mesh(new THREE.BoxGeometry(d.width * 0.9, d.height * 0.4, 0.05), glass);
    windshield.position.set(0, chassisH + d.height * 0.2 + d.wheelRadius * 0.5, d.length * 0.05);
    windshield.rotation.x = -0.3;
    group.add(windshield);
  } else if (config.shape === 'concept') {
    // Flat futuristic profile with glowing accent strip
    const greenhouse = mesh(new THREE.BoxGeometry(d.width * 0.85, d.height * 0.45, d.length * 0.7), glass);
    greenhouse.position.set(0, chassisH + d.height * 0.22 + d.wheelRadius * 0.5, 0);
    group.add(greenhouse);
    if (accent) {
      const strip = mesh(new THREE.BoxGeometry(d.width * 0.95, 0.03, d.length * 0.85), accent);
      strip.position.set(0, chassisH * 0.65 + d.wheelRadius * 0.5, 0);
      group.add(strip);
    }
  } else {
    // Standard 2-volume / 3-volume profile
    const greenLen = (config.shape === 'sedan' || config.shape === 'coupe' || config.shape === 'muscle') ? d.length * 0.55 : d.length * 0.65;
    const greenZ = (config.shape === 'pickup') ? d.length * 0.2 : 0;
    const greenhouse = mesh(new THREE.BoxGeometry(d.width * 0.88, d.height * 0.55, greenLen), glass);
    greenhouse.position.set(0, chassisH + d.height * 0.3 + d.wheelRadius * 0.5, greenZ);
    group.add(greenhouse);

    // Roof cap (solid trim above the glass)
    const roof = mesh(new THREE.BoxGeometry(d.width * 0.86, 0.04, greenLen * 0.9), trim);
    roof.position.set(0, chassisH + d.height * 0.58 + d.wheelRadius * 0.5, greenZ);
    group.add(roof);

    // Pickup bed
    if (config.shape === 'pickup') {
      const bed = mesh(new THREE.BoxGeometry(d.width * 0.9, d.height * 0.3, d.length * 0.4), trim);
      bed.position.set(0, chassisH * 0.6 + d.wheelRadius * 0.5, -d.length * 0.28);
      group.add(bed);
    }
  }

  // ── ACCENT STRIPE (muscle/sport sedan style) ────────────────────────────
  if (accent && (config.shape === 'muscle' || config.shape === 'sedan')) {
    const stripe = mesh(new THREE.BoxGeometry(d.width * 0.15, 0.04, d.length * 0.9), accent);
    stripe.position.set(-d.width * 0.18, chassisH + d.wheelRadius * 0.5 + 0.01, 0);
    group.add(stripe);
    group.add(mirrorX(stripe));
  }

  // ── WHEELS ──────────────────────────────────────────────────────────────
  const wheelGeo = new THREE.CylinderGeometry(d.wheelRadius, d.wheelRadius, d.wheelWidth, 16);
  const wheelInset = d.width * 0.5 - d.wheelWidth * 0.4;
  const wheelZ = d.length * 0.35;
  const positions: [number, number][] = [
    [-wheelInset,  wheelZ],
    [ wheelInset,  wheelZ],
    [-wheelInset, -wheelZ],
    [ wheelInset, -wheelZ],
  ];
  for (const [x, z] of positions) {
    const w = mesh(wheelGeo, tyre);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, d.wheelRadius, z);
    group.add(w);
    const r = mesh(new THREE.CylinderGeometry(d.wheelRadius * 0.6, d.wheelRadius * 0.6, d.wheelWidth + 0.02, 8), rim);
    r.rotation.z = Math.PI / 2;
    r.position.set(x, d.wheelRadius, z);
    group.add(r);
  }

  // ── FENDER FLARES (rally) ───────────────────────────────────────────────
  if (config.hasFenders) {
    const flare = mesh(new THREE.BoxGeometry(d.wheelWidth + 0.1, 0.12, 0.55), trim);
    flare.position.set(d.width * 0.5 - 0.05, d.wheelRadius * 1.4, wheelZ);
    group.add(flare); group.add(mirrorX(flare));
    const flare2 = flare.clone(); flare2.position.z = -wheelZ; group.add(flare2);
    const flare3 = flare2.clone(); flare3.position.x = -flare2.position.x; group.add(flare3);
  }

  // ── ROOF RACK (SUV) ─────────────────────────────────────────────────────
  if (config.hasRoofRack) {
    const rackBase = mesh(new THREE.BoxGeometry(d.width * 0.75, 0.05, d.length * 0.6), trim);
    rackBase.position.set(0, chassisH + d.height * 0.62 + d.wheelRadius * 0.5, 0);
    group.add(rackBase);
  }

  // ── SPOILER ─────────────────────────────────────────────────────────────
  if (config.hasSpoiler) {
    const spoilerColor = accent ?? trim;
    const stand = mesh(new THREE.BoxGeometry(0.08, 0.18, 0.06), spoilerColor);
    stand.position.set(-d.width * 0.28, chassisH + d.wheelRadius * 0.5 + 0.12, -d.length * 0.48);
    group.add(stand); group.add(mirrorX(stand));
    const wing = mesh(new THREE.BoxGeometry(d.width * 0.85, 0.05, 0.25), spoilerColor);
    wing.position.set(0, chassisH + d.wheelRadius * 0.5 + 0.22, -d.length * 0.5);
    group.add(wing);
  }

  // ── LIGHTS ──────────────────────────────────────────────────────────────
  // Headlights (front, +Z)
  const hl = mesh(new THREE.BoxGeometry(0.18, 0.08, 0.04), headlight);
  hl.position.set(-d.width * 0.28, chassisH * 0.6 + d.wheelRadius * 0.5, d.length * 0.5);
  group.add(hl); group.add(mirrorX(hl));
  // Taillights (rear, -Z)
  const tl = mesh(new THREE.BoxGeometry(0.18, 0.08, 0.04), taillight);
  tl.position.set(-d.width * 0.28, chassisH * 0.6 + d.wheelRadius * 0.5, -d.length * 0.5);
  group.add(tl); group.add(mirrorX(tl));
}
