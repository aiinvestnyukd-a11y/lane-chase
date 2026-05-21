import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Lock, Play } from 'lucide-react';
import { CARS } from '@/lib/cars';
import { CarPreview3D } from './CarPreview3D';
import { NyukdMark } from './NyukdMark';
import { ThemeToggle } from './ThemeToggle';

interface GarageProps {
  selectedCarId: string;
  unlockedCarLevel: number;
  onSelectCar: (id: string) => void;
  onNext: () => void;
}

const wrap = (i: number) => ((i % CARS.length) + CARS.length) % CARS.length;

export const Garage = ({ selectedCarId, unlockedCarLevel, onSelectCar, onNext }: GarageProps) => {
  const initialIndex = Math.max(0, CARS.findIndex((c) => c.id === selectedCarId));
  const [index, setIndex] = useState(initialIndex);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    onSelectCar(CARS[index].id);
  }, [index, onSelectCar]);

  const current = CARS[index];
  const prev = CARS[wrap(index - 1)];
  const next = CARS[wrap(index + 1)];
  const locked = current.unlockLevel > unlockedCarLevel;

  const go = (delta: number) => setIndex((i) => wrap(i + delta));

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <NyukdMark />
      <ThemeToggle />

      <div
        className="max-w-3xl w-full px-6 py-8 rounded-xl border text-center"
        style={{
          background: 'hsl(var(--card) / 0.78)',
          backdropFilter: 'blur(8px)',
          borderColor: 'hsl(var(--border))',
        }}
      >
        <span
          className="inline-block mb-2"
          style={{
            padding: '4px 12px', borderRadius: 9999,
            background: 'hsl(var(--primary) / 0.14)', color: 'hsl(var(--primary))',
            fontFamily: 'ui-monospace, Menlo, monospace',
            fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase',
          }}
        >
          NYUKD Gaming
        </span>
        <h1 className="text-5xl md:text-6xl font-bold mb-1" style={{ letterSpacing: '-2px', textShadow: '0 2px 24px hsl(var(--primary) / 0.25)' }}>
          Lane Chase
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mb-4">Pick your ride</p>

        <div
          className="flex items-center justify-center gap-2 md:gap-4 mb-3 select-none"
          onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStart.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            touchStart.current = null;
          }}
        >
          <button onClick={() => go(-1)} aria-label="Previous car" style={arrowStyle}><ChevronLeft size={24} /></button>

          <div className="hidden md:block opacity-40">
            <CarPreview3D key={`p-${prev.id}`} carId={prev.id} size={120} spin={0.4} />
          </div>

          <div style={{ width: 240, height: 240, position: 'relative' }}>
            <CarPreview3D key={`c-${current.id}`} carId={current.id} size={240} spin={0.5} />
            {locked && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(10,14,26,0.6)', borderRadius: 12 }}>
                <Lock size={48} style={{ color: '#fbbf24' }} />
              </div>
            )}
          </div>

          <div className="hidden md:block opacity-40">
            <CarPreview3D key={`n-${next.id}`} carId={next.id} size={120} spin={0.4} />
          </div>

          <button onClick={() => go(1)} aria-label="Next car" style={arrowStyle}><ChevronRight size={24} /></button>
        </div>

        <h3 className="font-bold text-xl md:text-2xl mb-1">{current.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">
          {locked ? `Unlocks at level ${current.unlockLevel}` : `Top ${Math.round(current.topSpeed * 10)} mph · Acceleration ${Math.round(current.acceleration * 10)}/10 · Handling ${Math.round(current.handling * 10)}/10`}
        </p>

        <div className="flex justify-center gap-1.5 mb-5 flex-wrap">
          {CARS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setIndex(i)}
              aria-label={`Select ${c.name}`}
              style={{
                width: i === index ? 22 : 8, height: 8, borderRadius: 4,
                background: i === index ? 'hsl(var(--primary))' : (c.unlockLevel > unlockedCarLevel ? 'hsl(var(--muted-foreground) / 0.2)' : 'hsl(var(--muted-foreground) / 0.5)'),
                border: 'none', padding: 0, cursor: 'pointer', transition: 'all 120ms',
              }}
            />
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={locked}
          className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8"
        >
          <Play size={18} /> {locked ? 'Locked' : 'Choose Circuit'}
        </button>
      </div>
    </div>
  );
};

const arrowStyle: React.CSSProperties = {
  width: 44, height: 44, borderRadius: '50%',
  background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
  color: 'hsl(var(--foreground))',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flex: '0 0 auto',
};
