import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = ({ inline = false }: { inline?: boolean }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === 'dark' : true;
  const next = isDark ? 'light' : 'dark';

  return (
    <button
      type="button"
      aria-label={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
      className={`${inline ? '' : 'fixed top-6 right-6 z-50'} inline-flex items-center justify-center transition-colors`}
      style={{
        width: 36, height: 36, borderRadius: 8,
        background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
        color: 'hsl(var(--foreground))',
      }}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};
