import { Home, RotateCw } from 'lucide-react';
import { circuitById } from '@/lib/circuits';

interface CrashScreenProps {
  raceScore: number;
  circuitId: string;
  onRetry: () => void;
  onHome: () => void;
}

export const CrashScreen = ({ raceScore, circuitId, onRetry, onHome }: CrashScreenProps) => {
  const circuit = circuitById(circuitId);
  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-md"
      style={{ background: 'hsl(var(--background) / 0.85)', zIndex: 70 }}
    >
      <div
        className="text-center max-w-md w-full mx-4 px-8 py-10 rounded-xl border"
        style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
      >
        <h2 className="text-4xl font-bold mb-2" style={{ color: '#ef4444' }}>Crash!</h2>
        <p className="mb-6 text-muted-foreground">{circuit.city} got the better of you.</p>

        <div className="mb-8">
          <span className="text-muted-foreground">Score this run </span>
          <span className="font-bold text-2xl text-primary">{Math.round(raceScore)}</span>
        </div>

        <div className="flex gap-2">
          <button onClick={onRetry} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
            <RotateCw size={16} /> Retry
          </button>
          <button onClick={onHome} className="hud-pill flex-1 justify-center" style={{ height: 48, fontSize: 14 }}>
            <Home size={16} /> Garage
          </button>
        </div>
      </div>
    </div>
  );
};
