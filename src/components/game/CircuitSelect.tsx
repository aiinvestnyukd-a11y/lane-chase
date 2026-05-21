import { useState } from 'react';
import { ArrowLeft, Flag, Lock } from 'lucide-react';
import { CIRCUITS, type CircuitConfig } from '@/lib/circuits';
import { NyukdMark } from './NyukdMark';
import { ThemeToggle } from './ThemeToggle';

interface CircuitSelectProps {
  selectedCircuitId: string;
  unlockedCircuits: number; // index of highest available circuit
  onSelectCircuit: (id: string) => void;
  onBack: () => void;
  onStart: () => void;
}

const isCircuitUnlocked = (c: CircuitConfig, unlocked: number) => c.unlockAfter <= unlocked;

export const CircuitSelect = ({ selectedCircuitId, unlockedCircuits, onSelectCircuit, onBack, onStart }: CircuitSelectProps) => {
  const [hovered, setHovered] = useState(selectedCircuitId);

  return (
    <div className="min-h-screen p-4 relative" style={{ overflowY: 'auto' }}>
      <NyukdMark />
      <ThemeToggle />

      <div className="max-w-5xl mx-auto pt-20 pb-12">
        <button onClick={onBack} className="hud-pill mb-4">
          <ArrowLeft size={14} /> Garage
        </button>
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Pick a Circuit</h2>
        <p className="text-muted-foreground mb-6">20 cities, 20 finishes. Earlier circuits unlock harder ones.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {CIRCUITS.map((c) => {
            const unlocked = isCircuitUnlocked(c, unlockedCircuits);
            const selected = c.id === selectedCircuitId;
            return (
              <button
                key={c.id}
                onClick={() => unlocked && onSelectCircuit(c.id)}
                onMouseEnter={() => setHovered(c.id)}
                disabled={!unlocked}
                className="text-left p-3 rounded-lg border transition-all"
                style={{
                  background: selected ? 'hsl(var(--primary) / 0.15)' : 'hsl(var(--card) / 0.7)',
                  borderColor: selected ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                  opacity: unlocked ? 1 : 0.45,
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-muted-foreground">#{(CIRCUITS.indexOf(c) + 1).toString().padStart(2, '0')}</span>
                  {!unlocked && <Lock size={12} />}
                </div>
                <div className="font-bold text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.city}, {c.country}</div>
                <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                  {c.time} · {c.weather}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onStart}
            disabled={!isCircuitUnlocked(CIRCUITS.find((c) => c.id === selectedCircuitId)!, unlockedCircuits)}
            className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8"
          >
            <Flag size={18} /> Start Race
          </button>
        </div>
      </div>
    </div>
  );
};
