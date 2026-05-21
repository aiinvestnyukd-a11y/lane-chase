import { Home, Trophy } from 'lucide-react';
import { CIRCUITS, circuitById } from '@/lib/circuits';

interface FinishScreenProps {
  raceScore: number;
  totalScore: number;
  circuitId: string;
  onHome: () => void;
  onNext: () => void;
}

export const FinishScreen = ({ raceScore, totalScore, circuitId, onHome, onNext }: FinishScreenProps) => {
  const circuit = circuitById(circuitId);
  const idx = CIRCUITS.findIndex((c) => c.id === circuitId);
  const hasNext = idx >= 0 && idx + 1 < CIRCUITS.length;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-md"
      style={{ background: 'hsl(var(--background) / 0.85)', zIndex: 70 }}
    >
      <div
        className="text-center max-w-md w-full mx-4 px-8 py-10 rounded-xl border"
        style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
      >
        <Trophy size={48} className="mx-auto mb-2" style={{ color: 'hsl(var(--accent))' }} />
        <h2 className="text-3xl font-bold mb-1" style={{ color: 'hsl(var(--accent))' }}>Finish line!</h2>
        <p className="mb-6 text-muted-foreground">{circuit.name} — {circuit.city} cleared.</p>

        <div className="mb-2">
          <span className="text-muted-foreground">Race score </span>
          <span className="font-bold text-2xl text-primary">{Math.round(raceScore)}</span>
        </div>
        <div className="mb-8 text-sm text-muted-foreground">
          Total <span className="font-bold text-foreground">{Math.round(totalScore)}</span>
        </div>

        <div className="flex gap-2">
          {hasNext && (
            <button onClick={onNext} className="btn-primary flex-1">Next Circuit</button>
          )}
          <button onClick={onHome} className="hud-pill flex-1 justify-center" style={{ height: 48, fontSize: 14 }}>
            <Home size={16} /> Garage
          </button>
        </div>
      </div>
    </div>
  );
};
