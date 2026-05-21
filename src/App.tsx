import { ThemeProvider } from 'next-themes';
import { GameScreen } from '@/components/game/GameScreen';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="lanechase-theme">
      <GameScreen />
    </ThemeProvider>
  );
}

export default App;
