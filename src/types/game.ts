export type GameStatus =
  | 'garage'        // pick a car
  | 'circuitSelect' // pick a circuit
  | 'countdown'     // 3-2-1-GO
  | 'racing'        // actually racing
  | 'crashed'       // hit a car (game over for this run)
  | 'finished';     // crossed finish line

export type PowerType = 'boost' | 'shield' | 'slow';

export interface TrafficCar {
  id: string;
  lane: number;       // 0..3
  z: number;          // distance from finish (large at start, 0 at finish line)
  speed: number;      // game units per second
  carId: string;      // visual variant from CARS
}

export interface PowerUp {
  id: string;
  lane: number;       // 0..3
  z: number;
  type: PowerType;
  collected: boolean;
}

export interface PlayerCar {
  carId: string;             // chosen vehicle
  lane: number;              // 0..3 logical target
  laneFloat: number;         // smooth lane position (lerps to `lane`)
  z: number;                 // distance from finish
  speed: number;             // current forward speed
  throttle: number;          // 0..1 (held)
  shieldUntilMs: number;     // shield active until this timestamp
  boostUntilMs: number;      // boost active until
  slowUntilMs: number;       // slowed until
}

export interface GameState {
  status: GameStatus;
  selectedCarId: string;
  selectedCircuitId: string;
  unlockedCarLevel: number;     // highest car-level unlocked
  unlockedCircuits: number;     // highest circuit index reached (so unlockAfter <= this)
  totalScore: number;           // cumulative across races
  raceScore: number;            // this race
  player: PlayerCar;
  traffic: TrafficCar[];
  powerUps: PowerUp[];
  raceDistance: number;         // total length of the active circuit
  raceStartMs: number;          // when racing started (timer base)
  countdownStartMs: number;     // for the 3-2-1 phase
}
