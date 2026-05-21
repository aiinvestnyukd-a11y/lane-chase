import { Gauge, LogOut, Shield, Trophy, Volume2, VolumeX, Zap } from 'lucide-react';
import { carById } from '@/lib/cars';
import { NyukdMark } from './NyukdMark';
import { ThemeToggle } from './ThemeToggle';
import type { GameState } from '@/types/game';

interface GameHUDProps {
  gameState: GameState;
  onExit: () => void;
  engineMuted: boolean;
  onToggleEngineSound: () => void;
}

export const GameHUD = ({ gameState, onExit, engineMuted, onToggleEngineSound }: GameHUDProps) => {
  const car = carById(gameState.selectedCarId);
  const now = performance.now();
  const remaining = Math.max(0, gameState.player.z);
  const progress = 1 - remaining / Math.max(1, gameState.raceDistance);
  const speedMph = Math.round(gameState.player.speed * 8); // pretty for display

  const boostMs = Math.max(0, gameState.player.boostUntilMs - now);
  const shieldMs = Math.max(0, gameState.player.shieldUntilMs - now);
  const slowMs = Math.max(0, gameState.player.slowUntilMs - now);

  return (
    <div
      style={{
        position: 'fixed',
        top: 'max(env(safe-area-inset-top, 0px), 4px)',
        left: 'max(env(safe-area-inset-left, 0px), 8px)',
        right: 'max(env(safe-area-inset-right, 0px), 8px)',
        zIndex: 50,
      }}
      className="flex justify-between items-center gap-2 px-2 py-1.5 rounded-lg bg-card/80 backdrop-blur-md border md:px-5 md:py-3"
    >
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <NyukdMark inline size={36} />
        <div className="flex items-center gap-1.5">
          <Gauge size={16} style={{ color: 'hsl(var(--primary))' }} />
          <span className="font-bold tabular-nums text-sm md:text-base">{speedMph}<span className="text-xs text-muted-foreground"> mph</span></span>
        </div>
        {boostMs > 0 && <span className="hud-pill" style={{ borderColor: '#fbbf24', color: '#fbbf24' }}><Zap size={12} /> {(boostMs / 1000).toFixed(1)}s</span>}
        {shieldMs > 0 && <span className="hud-pill" style={{ borderColor: '#22c55e', color: '#22c55e' }}><Shield size={12} /> {(shieldMs / 1000).toFixed(1)}s</span>}
        {slowMs > 0 && <span className="hud-pill" style={{ borderColor: '#ef4444', color: '#ef4444' }}>SLOW {(slowMs / 1000).toFixed(1)}s</span>}
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <span className="hidden md:inline text-xs text-muted-foreground uppercase tracking-wider">{car.name}</span>
        <div className="flex items-center gap-1.5">
          <Trophy size={14} style={{ color: 'hsl(var(--accent))' }} />
          <span className="font-bold tabular-nums text-sm md:text-base">{Math.round(gameState.raceScore)}</span>
        </div>
        <div className="flex items-center gap-1.5" style={{ width: 80, height: 8, borderRadius: 4, background: 'hsl(var(--muted))', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, progress * 100)}%`, height: '100%', background: 'hsl(var(--primary))', transition: 'width 120ms' }} />
        </div>
        <button onClick={onToggleEngineSound} aria-label={engineMuted ? 'Unmute' : 'Mute'} className="hud-pill" style={{ width: 36, padding: 0, justifyContent: 'center' }}>
          {engineMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <button onClick={onExit} aria-label="Exit race" className="hud-pill"><LogOut size={14} /><span className="hidden md:inline">Exit</span></button>
        <ThemeToggle inline />
      </div>
    </div>
  );
};
