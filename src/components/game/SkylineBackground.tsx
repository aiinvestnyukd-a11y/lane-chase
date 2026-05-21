import { useEffect, useRef } from 'react';
import { circuitById } from '@/lib/circuits';
import { drawSkyline } from '@/lib/skylineRenderer';

interface SkylineBackgroundProps {
  circuitId: string;
}

/**
 * Full-viewport 2D canvas painting the sky + city skyline behind everything.
 * The 3D RaceScene canvas is rendered on top with a transparent clear.
 */
export const SkylineBackground = ({ circuitId }: SkylineBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawSkyline(ctx, circuitById(circuitId), rect.width, rect.height);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [circuitId]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
};
