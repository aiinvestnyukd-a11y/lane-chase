# Lane Chase

Top-down / chase-cam 4-lane arcade racer. Pick a vehicle, weave through
traffic across 20 city-themed circuits, collect power-ups, beat the finish
line. Performance scales with the car you pick — later levels need better
machinery.

## Stack

- Vite 5 + React 18 + TypeScript + Tailwind
- Three.js for 3D race scene (road, cars, power-ups)
- 2D canvas for the city-skyline background
- Procedural Web Audio engine sound (no audio files bundled)
- Cloudflare Workers + Static Assets via `wrangler.json`

## Project layout

```
src/
├── App.tsx / main.tsx / index.css     ThemeProvider + GameScreen
├── types/game.ts                      GameState / PlayerCar / Traffic / PowerUp
├── lib/
│   ├── cars.ts                        20 cars + buildCar(group, config)
│   ├── circuits.ts                    20 circuits + landmark data + palette
│   └── skylineRenderer.ts             Draws skyline silhouette to 2D canvas
├── hooks/
│   ├── useGameEngine.ts               Physics, traffic, collisions, levels
│   └── useEngineAudio.ts              RPM-tracking sawtooth + filter + noise
└── components/game/
    ├── GameScreen.tsx                 Top-level router
    ├── Garage.tsx                     Car carousel (3D previews)
    ├── CircuitSelect.tsx              20-tile grid of circuits
    ├── RaceScene.tsx                  3D Three.js scene (cars + road + powerups)
    ├── SkylineBackground.tsx          2D canvas behind the 3D scene
    ├── GameHUD.tsx                    Top bar with speed, score, etc.
    ├── CountdownOverlay.tsx           3-2-1-GO
    ├── CrashScreen.tsx                Game-over modal
    ├── FinishScreen.tsx               Race-cleared modal
    ├── MobileControls.tsx             Left/Right lane buttons + throttle pedal
    ├── CarPreview3D.tsx               Spinning showroom view for one car
    ├── NyukdMark.tsx                  NYUKD "N" mark (inline or fixed)
    └── ThemeToggle.tsx                Sun/moon
```

## Controls

- **Desktop**: ↑/W = throttle (hold), ←/→ or A/D = lane switch
- **Mobile**: bottom-left = lane buttons, bottom-right = throttle pedal (hold)

## Game rules

- 20 cars unlock as you progress (level unlocks)
- 20 circuits unlock sequentially (`unlockAfter`)
- Power-ups: ⚡ boost (+60% speed for 5s), 🛡 shield (immune to crash for 5s),
  🔴 slow-debuff (-50% speed for 5s)
- Score: distance covered (+1/unit) + power-ups (+50) + finish bonus (+200)
- Collision with any traffic car (without shield) = crash

## Deploy

Push to `main` → Cloudflare auto-builds via the GitHub integration. See
`wrangler.json` for the Worker config.
