/**
 * 20 circuits, each evoking a real city through stylised skyline silhouettes
 * drawn into the 2D background canvas. Not photo-realistic — distinct enough
 * that "London" reads London and "Paris" reads Paris.
 */

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
export type Weather = 'clear' | 'rain' | 'fog';

export type LandmarkShape =
  | 'block'        // simple skyscraper
  | 'spire'        // pointed tower (Big Ben / clock tower)
  | 'eiffel'       // Eiffel Tower silhouette
  | 'pyramid'      // pyramidal mass
  | 'dome'         // capitol-style dome (Hagia Sophia, St Basil's etc.)
  | 'twin'         // twin towers (Petronas)
  | 'pagoda'       // tiered Asian roof
  | 'bridge'       // arch / suspension bridge (Tower / Golden Gate)
  | 'mountain'     // Table Mountain / Sugarloaf
  | 'arch'         // Brandenburg / India Gate
  | 'opera'        // Sydney Opera House sails
  | 'crown'        // pointed crown like Chrysler Building
  | 'mosque'       // domed mosque with minaret
  | 'forbidden'    // long low roofs (Forbidden City)
  | 'lotus'        // Lotus Temple petal silhouette
  | 'wave'         // Wave-roof (Marina Bay Sands)
  | 'redeemer'     // Christ the Redeemer on a peak
  | 'colosseum'    // Roman arena
  | 'gate'         // Gateway of India / triumphal arch
  | 'tv-tower';    // Berlin TV tower / Tokyo Skytree

export interface Landmark {
  shape: LandmarkShape;
  /** Horizontal position (0–1 across the skyline strip). */
  x: number;
  /** Height as a fraction of the available skyline strip height (0–1). */
  h: number;
  /** Width as a fraction of strip width (0–1). */
  w: number;
  color?: number;
}

export interface CircuitConfig {
  id: string;
  name: string;
  city: string;
  country: string;
  landmarks: Landmark[];
  /** Total race length in game units. */
  distance: number;
  /** Traffic cars per 100 units of track. */
  traffic: number;
  /** Cap on player speed multiplier (1 = standard, slightly more on highways). */
  speedCap: number;
  time: TimeOfDay;
  weather: Weather;
  /** Player has to have completed unlockAfter to play this circuit. */
  unlockAfter: number; // 0 = always unlocked
}

// ──────────────────────────────────────────────────────────────────────────
// 20 circuits. Distance + traffic ramp up across the list so progression is
// smoother. Landmarks are tuned to read as the right city at a glance.
// ──────────────────────────────────────────────────────────────────────────

export const CIRCUITS: CircuitConfig[] = [
  {
    id: 'london', name: 'Thames Crossing', city: 'London', country: 'UK',
    landmarks: [
      { shape: 'block', x: 0.05, h: 0.45, w: 0.10 },
      { shape: 'spire', x: 0.25, h: 0.95, w: 0.06 }, // Big Ben
      { shape: 'bridge', x: 0.46, h: 0.55, w: 0.22 }, // Tower Bridge
      { shape: 'block', x: 0.70, h: 0.62, w: 0.09 }, // The Shard-ish
      { shape: 'block', x: 0.85, h: 0.40, w: 0.10 },
    ],
    distance: 1800, traffic: 8, speedCap: 1.0, time: 'dusk', weather: 'fog', unlockAfter: 0,
  },
  {
    id: 'paris', name: 'Champs Sprint', city: 'Paris', country: 'France',
    landmarks: [
      { shape: 'block', x: 0.10, h: 0.50, w: 0.10 },
      { shape: 'arch',  x: 0.32, h: 0.55, w: 0.08 }, // Arc de Triomphe
      { shape: 'eiffel', x: 0.58, h: 1.0,  w: 0.16 },
      { shape: 'block', x: 0.82, h: 0.45, w: 0.10 },
    ],
    distance: 2000, traffic: 10, speedCap: 1.0, time: 'dusk', weather: 'clear', unlockAfter: 1,
  },
  {
    id: 'nyc', name: 'Midtown Run', city: 'New York', country: 'USA',
    landmarks: [
      { shape: 'block', x: 0.05, h: 0.65, w: 0.10 },
      { shape: 'crown', x: 0.20, h: 0.90, w: 0.08 }, // Chrysler
      { shape: 'block', x: 0.36, h: 0.75, w: 0.10 },
      { shape: 'block', x: 0.50, h: 0.95, w: 0.10 }, // Empire State
      { shape: 'block', x: 0.66, h: 0.70, w: 0.10 },
      { shape: 'block', x: 0.82, h: 0.85, w: 0.10 },
    ],
    distance: 2200, traffic: 14, speedCap: 1.0, time: 'night', weather: 'clear', unlockAfter: 2,
  },
  {
    id: 'tokyo', name: 'Shibuya Pulse', city: 'Tokyo', country: 'Japan',
    landmarks: [
      { shape: 'block', x: 0.07, h: 0.55, w: 0.10 },
      { shape: 'pagoda', x: 0.22, h: 0.45, w: 0.07 },
      { shape: 'tv-tower', x: 0.45, h: 1.0, w: 0.05 }, // Tokyo Skytree
      { shape: 'block', x: 0.62, h: 0.65, w: 0.10 },
      { shape: 'block', x: 0.80, h: 0.78, w: 0.10 },
    ],
    distance: 2300, traffic: 16, speedCap: 1.05, time: 'night', weather: 'rain', unlockAfter: 3,
  },
  {
    id: 'sydney', name: 'Harbour Loop', city: 'Sydney', country: 'Australia',
    landmarks: [
      { shape: 'opera', x: 0.25, h: 0.55, w: 0.18 },
      { shape: 'bridge', x: 0.55, h: 0.6, w: 0.30 },
      { shape: 'block', x: 0.85, h: 0.45, w: 0.10 },
    ],
    distance: 2400, traffic: 12, speedCap: 1.05, time: 'day', weather: 'clear', unlockAfter: 4,
  },
  {
    id: 'dubai', name: 'Burj Boulevard', city: 'Dubai', country: 'UAE',
    landmarks: [
      { shape: 'block', x: 0.10, h: 0.55, w: 0.08 },
      { shape: 'block', x: 0.30, h: 0.70, w: 0.08 },
      { shape: 'spire', x: 0.50, h: 1.0,  w: 0.05 }, // Burj Khalifa
      { shape: 'block', x: 0.70, h: 0.65, w: 0.08 },
      { shape: 'block', x: 0.86, h: 0.50, w: 0.08 },
    ],
    distance: 2500, traffic: 14, speedCap: 1.1, time: 'dusk', weather: 'clear', unlockAfter: 5,
  },
  {
    id: 'singapore', name: 'Marina Mile', city: 'Singapore', country: 'Singapore',
    landmarks: [
      { shape: 'block', x: 0.10, h: 0.55, w: 0.08 },
      { shape: 'wave', x: 0.45, h: 0.55, w: 0.30 }, // Marina Bay Sands
      { shape: 'block', x: 0.85, h: 0.50, w: 0.10 },
    ],
    distance: 2400, traffic: 14, speedCap: 1.0, time: 'night', weather: 'clear', unlockAfter: 6,
  },
  {
    id: 'hongkong', name: 'Victoria Rush', city: 'Hong Kong', country: 'China',
    landmarks: [
      { shape: 'block', x: 0.06, h: 0.6, w: 0.08 },
      { shape: 'block', x: 0.18, h: 0.85, w: 0.08 },
      { shape: 'block', x: 0.30, h: 0.7, w: 0.08 },
      { shape: 'block', x: 0.42, h: 0.95, w: 0.08 },
      { shape: 'block', x: 0.54, h: 0.65, w: 0.08 },
      { shape: 'block', x: 0.66, h: 0.85, w: 0.08 },
      { shape: 'block', x: 0.78, h: 0.55, w: 0.08 },
      { shape: 'block', x: 0.90, h: 0.75, w: 0.08 },
    ],
    distance: 2600, traffic: 18, speedCap: 1.05, time: 'night', weather: 'fog', unlockAfter: 7,
  },
  {
    id: 'mumbai', name: 'Marine Drive', city: 'Mumbai', country: 'India',
    landmarks: [
      { shape: 'gate', x: 0.15, h: 0.55, w: 0.12 }, // Gateway of India
      { shape: 'block', x: 0.40, h: 0.7, w: 0.08 },
      { shape: 'dome', x: 0.55, h: 0.55, w: 0.10 }, // Taj Hotel-ish
      { shape: 'block', x: 0.75, h: 0.65, w: 0.10 },
      { shape: 'block', x: 0.88, h: 0.55, w: 0.10 },
    ],
    distance: 2700, traffic: 22, speedCap: 1.0, time: 'dusk', weather: 'clear', unlockAfter: 8,
  },
  {
    id: 'delhi', name: 'India Gate', city: 'Delhi', country: 'India',
    landmarks: [
      { shape: 'lotus', x: 0.18, h: 0.5, w: 0.16 }, // Lotus Temple
      { shape: 'gate', x: 0.50, h: 0.60, w: 0.12 }, // India Gate
      { shape: 'dome', x: 0.78, h: 0.55, w: 0.12 }, // Rashtrapati Bhavan dome
    ],
    distance: 2700, traffic: 22, speedCap: 1.0, time: 'dawn', weather: 'fog', unlockAfter: 9,
  },
  {
    id: 'capetown', name: 'Cape Coast', city: 'Cape Town', country: 'South Africa',
    landmarks: [
      { shape: 'mountain', x: 0.5, h: 0.85, w: 0.7 }, // Table Mountain backdrop
      { shape: 'block', x: 0.10, h: 0.4, w: 0.08 },
      { shape: 'block', x: 0.85, h: 0.45, w: 0.08 },
    ],
    distance: 2700, traffic: 14, speedCap: 1.1, time: 'day', weather: 'clear', unlockAfter: 10,
  },
  {
    id: 'rio', name: 'Copacabana Curve', city: 'Rio de Janeiro', country: 'Brazil',
    landmarks: [
      { shape: 'redeemer', x: 0.5, h: 0.95, w: 0.10 },
      { shape: 'mountain', x: 0.5, h: 0.55, w: 0.85 },
      { shape: 'block', x: 0.10, h: 0.5, w: 0.08 },
      { shape: 'block', x: 0.90, h: 0.5, w: 0.08 },
    ],
    distance: 2800, traffic: 16, speedCap: 1.1, time: 'dusk', weather: 'clear', unlockAfter: 11,
  },
  {
    id: 'sanfran', name: 'Golden Gate', city: 'San Francisco', country: 'USA',
    landmarks: [
      { shape: 'bridge', x: 0.5, h: 0.7, w: 0.5 }, // Golden Gate
      { shape: 'block', x: 0.10, h: 0.55, w: 0.08 },
      { shape: 'block', x: 0.90, h: 0.55, w: 0.08 },
    ],
    distance: 2900, traffic: 16, speedCap: 1.15, time: 'dawn', weather: 'fog', unlockAfter: 12,
  },
  {
    id: 'vegas', name: 'Strip Run', city: 'Las Vegas', country: 'USA',
    landmarks: [
      { shape: 'pyramid', x: 0.20, h: 0.7, w: 0.10 }, // Luxor
      { shape: 'eiffel', x: 0.40, h: 0.7, w: 0.10 }, // Paris LV
      { shape: 'block', x: 0.60, h: 0.7, w: 0.10 },
      { shape: 'block', x: 0.80, h: 0.85, w: 0.10 },
    ],
    distance: 3000, traffic: 18, speedCap: 1.2, time: 'night', weather: 'clear', unlockAfter: 13,
  },
  {
    id: 'berlin', name: 'Unter den Linden', city: 'Berlin', country: 'Germany',
    landmarks: [
      { shape: 'arch', x: 0.25, h: 0.55, w: 0.10 }, // Brandenburg
      { shape: 'tv-tower', x: 0.5, h: 0.95, w: 0.05 }, // Fernsehturm
      { shape: 'block', x: 0.75, h: 0.55, w: 0.10 },
    ],
    distance: 3000, traffic: 16, speedCap: 1.15, time: 'day', weather: 'clear', unlockAfter: 14,
  },
  {
    id: 'rome', name: 'Eternal Lap', city: 'Rome', country: 'Italy',
    landmarks: [
      { shape: 'colosseum', x: 0.35, h: 0.55, w: 0.20 },
      { shape: 'dome', x: 0.70, h: 0.6, w: 0.16 }, // St Peter's
      { shape: 'block', x: 0.10, h: 0.45, w: 0.08 },
    ],
    distance: 3000, traffic: 14, speedCap: 1.1, time: 'dusk', weather: 'clear', unlockAfter: 15,
  },
  {
    id: 'moscow', name: 'Red Square Loop', city: 'Moscow', country: 'Russia',
    landmarks: [
      { shape: 'dome', x: 0.35, h: 0.62, w: 0.20 }, // St Basil's (3 onion domes)
      { shape: 'spire', x: 0.60, h: 0.95, w: 0.05 }, // Kremlin tower
      { shape: 'block', x: 0.85, h: 0.55, w: 0.10 },
    ],
    distance: 3100, traffic: 16, speedCap: 1.1, time: 'night', weather: 'clear', unlockAfter: 16,
  },
  {
    id: 'beijing', name: 'Forbidden Sprint', city: 'Beijing', country: 'China',
    landmarks: [
      { shape: 'forbidden', x: 0.5, h: 0.45, w: 0.7 }, // long low Forbidden City roofs
      { shape: 'pagoda', x: 0.20, h: 0.55, w: 0.08 },
      { shape: 'block', x: 0.85, h: 0.7, w: 0.10 },
    ],
    distance: 3200, traffic: 18, speedCap: 1.15, time: 'dawn', weather: 'fog', unlockAfter: 17,
  },
  {
    id: 'istanbul', name: 'Bosphorus Blitz', city: 'Istanbul', country: 'Türkiye',
    landmarks: [
      { shape: 'mosque', x: 0.30, h: 0.7, w: 0.18 }, // Hagia Sophia
      { shape: 'mosque', x: 0.65, h: 0.75, w: 0.18 }, // Blue Mosque
      { shape: 'bridge', x: 0.90, h: 0.5, w: 0.18 },
    ],
    distance: 3300, traffic: 18, speedCap: 1.15, time: 'dusk', weather: 'clear', unlockAfter: 18,
  },
  {
    id: 'seoul', name: 'Han River Final', city: 'Seoul', country: 'South Korea',
    landmarks: [
      { shape: 'spire', x: 0.30, h: 0.90, w: 0.05 }, // Lotte World Tower
      { shape: 'tv-tower', x: 0.55, h: 0.75, w: 0.05 }, // N Seoul Tower
      { shape: 'block', x: 0.10, h: 0.6, w: 0.10 },
      { shape: 'block', x: 0.80, h: 0.7, w: 0.10 },
    ],
    distance: 3500, traffic: 20, speedCap: 1.2, time: 'night', weather: 'clear', unlockAfter: 19,
  },
];

export const circuitById = (id: string): CircuitConfig =>
  CIRCUITS.find((c) => c.id === id) ?? CIRCUITS[0];

// ──────────────────────────────────────────────────────────────────────────
// Palette per time-of-day. The road, sky and skyline silhouette colour read
// from these so each circuit has a distinct atmosphere.
// ──────────────────────────────────────────────────────────────────────────

export const TIME_PALETTES: Record<TimeOfDay, { skyTop: string; skyBottom: string; silhouette: string; accent: string; }> = {
  dawn:  { skyTop: '#ffb380', skyBottom: '#ffe0c2', silhouette: '#4a3856', accent: '#ffaa55' },
  day:   { skyTop: '#87ceeb', skyBottom: '#cfeaff', silhouette: '#2a2f3a', accent: '#ffffff' },
  dusk:  { skyTop: '#ff7e5f', skyBottom: '#feb47b', silhouette: '#2a1a3a', accent: '#ffcc55' },
  night: { skyTop: '#0a0e1a', skyBottom: '#1a1f3a', silhouette: '#1a1a2e', accent: '#3DD9D6' },
};
