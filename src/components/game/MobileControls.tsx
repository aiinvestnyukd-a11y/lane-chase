import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';

interface MobileControlsProps {
  onLane: (delta: -1 | 1) => void;
  onThrottle: (v: number) => void;
}

const BTN: React.CSSProperties = {
  width: 76, height: 76, borderRadius: '50%',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'hsl(var(--card) / 0.85)', color: 'hsl(var(--foreground))',
  border: '2px solid hsl(var(--primary) / 0.5)',
  backdropFilter: 'blur(8px)', touchAction: 'none', userSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
  transition: 'transform 60ms, background-color 60ms',
  cursor: 'pointer',
};

export const MobileControls = ({ onLane, onThrottle }: MobileControlsProps) => {
  const [pedal, setPedal] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);

  // Throttle button — full throttle while pressed.
  useEffect(() => {
    return () => onThrottle(0);
  }, [onThrottle]);

  return (
    <div
      ref={padRef}
      className="fixed inset-x-0 flex justify-between items-end pointer-events-none md:hidden z-40"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
        paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 18px)',
        paddingRight: 'calc(env(safe-area-inset-right, 0px) + 18px)',
      }}
    >
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          type="button"
          aria-label="Lane left"
          style={BTN}
          onPointerDown={(e) => { e.preventDefault(); onLane(-1); }}
        >
          <ArrowLeft size={30} />
        </button>
        <button
          type="button"
          aria-label="Lane right"
          style={BTN}
          onPointerDown={(e) => { e.preventDefault(); onLane(1); }}
        >
          <ArrowRight size={30} />
        </button>
      </div>

      <button
        type="button"
        aria-label="Throttle"
        className="pointer-events-auto"
        style={{
          ...BTN,
          width: 100, height: 100,
          background: pedal ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.7)',
          color: 'hsl(var(--background))',
          borderColor: 'hsl(var(--primary))',
          transform: pedal ? 'scale(0.94)' : 'scale(1)',
          boxShadow: '0 8px 28px hsl(var(--primary) / 0.4)',
        }}
        onPointerDown={(e) => { e.preventDefault(); setPedal(true); onThrottle(1); }}
        onPointerUp={(e) => { e.preventDefault(); setPedal(false); onThrottle(0); }}
        onPointerCancel={() => { setPedal(false); onThrottle(0); }}
        onPointerLeave={() => { setPedal(false); onThrottle(0); }}
      >
        <Zap size={36} />
      </button>
    </div>
  );
};
