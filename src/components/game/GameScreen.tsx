import { useEffect } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useEngineAudio } from '@/hooks/useEngineAudio';
import { carById } from '@/lib/cars';
import { CircuitSelect } from './CircuitSelect';
import { CountdownOverlay } from './CountdownOverlay';
import { CrashScreen } from './CrashScreen';
import { FinishScreen } from './FinishScreen';
import { Garage } from './Garage';
import { GameHUD } from './GameHUD';
import { MobileControls } from './MobileControls';
import { RaceScene } from './RaceScene';
import { SkylineBackground } from './SkylineBackground';

export const GameScreen = () => {
  const eng = useGameEngine();
  const { gameState } = eng;
  const audio = useEngineAudio();

  // Start the engine audio when entering a race; stop when leaving.
  useEffect(() => {
    if (gameState.status === 'racing' || gameState.status === 'countdown') {
      audio.start();
    }
    // Stop audio if back at garage / circuitSelect / finish / crash for too long? Keep it running.
  }, [gameState.status, audio]);

  // Each frame, feed RPM + throttle into the engine audio model.
  useEffect(() => {
    const car = carById(gameState.selectedCarId);
    const racing = gameState.status === 'racing';
    const rpm = racing ? Math.min(1, gameState.player.speed / (car.topSpeed * 1.2)) : 0;
    const throttle = racing ? gameState.player.throttle : 0;
    audio.setRpm(rpm);
    audio.setThrottle(throttle);
  }, [gameState, audio]);

  // ── Garage ────────────────────────────────────────────────────────────
  if (gameState.status === 'garage') {
    return (
      <Garage
        selectedCarId={gameState.selectedCarId}
        unlockedCarLevel={gameState.unlockedCarLevel}
        onSelectCar={eng.selectCar}
        onNext={eng.goToCircuitSelect}
      />
    );
  }

  // ── Circuit picker ────────────────────────────────────────────────────
  if (gameState.status === 'circuitSelect') {
    return (
      <CircuitSelect
        selectedCircuitId={gameState.selectedCircuitId}
        unlockedCircuits={gameState.unlockedCircuits}
        onSelectCircuit={eng.selectCircuit}
        onBack={eng.goToGarage}
        onStart={eng.startCountdown}
      />
    );
  }

  // ── In-race (countdown / racing / crashed / finished) ────────────────
  return (
    <>
      <SkylineBackground circuitId={gameState.selectedCircuitId} />
      <RaceScene gameState={gameState} />

      <GameHUD
        gameState={gameState}
        onExit={eng.restart}
        engineMuted={audio.isMuted}
        onToggleEngineSound={() => audio.setMuted(!audio.isMuted)}
      />

      <MobileControls
        onLane={eng.switchLane}
        onThrottle={eng.setThrottle}
      />

      {gameState.status === 'countdown' && (
        <CountdownOverlay startedAtMs={gameState.countdownStartMs} durationMs={3000} />
      )}

      {gameState.status === 'crashed' && (
        <CrashScreen
          raceScore={gameState.raceScore}
          circuitId={gameState.selectedCircuitId}
          onRetry={eng.startCountdown}
          onHome={eng.restart}
        />
      )}

      {gameState.status === 'finished' && (
        <FinishScreen
          raceScore={gameState.raceScore}
          totalScore={gameState.totalScore}
          circuitId={gameState.selectedCircuitId}
          onHome={eng.restart}
          onNext={() => {
            // Auto-pick the next circuit and re-enter circuit select for confirmation.
            eng.goToCircuitSelect();
          }}
        />
      )}
    </>
  );
};
