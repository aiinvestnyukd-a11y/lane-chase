interface CountdownOverlayProps {
  startedAtMs: number;
  durationMs: number;
}

export const CountdownOverlay = ({ startedAtMs, durationMs }: CountdownOverlayProps) => {
  const elapsed = performance.now() - startedAtMs;
  const remaining = Math.max(0, durationMs - elapsed);
  const seconds = Math.ceil(remaining / 1000);
  const label = seconds <= 0 ? 'GO!' : String(seconds);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        key={label}
        style={{
          fontSize: 'clamp(120px, 22vw, 240px)', fontWeight: 900,
          color: label === 'GO!' ? '#22c55e' : 'hsl(var(--primary))',
          textShadow: '0 6px 40px hsla(0,0%,0%,0.55)',
          animation: 'cd-pop 700ms ease-out',
          letterSpacing: '-6px',
        }}
      >
        {label}
      </div>
      <style>{`
        @keyframes cd-pop {
          0% { transform: scale(2.0); opacity: 0; }
          25% { transform: scale(1.0); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
