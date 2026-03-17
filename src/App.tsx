import { useState } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import PuzzleGame from './components/PuzzleGame';
import BubbleGame from './components/BubbleGame';

type ActiveGame = 'menu' | 'puzzle' | 'bubble';

function App() {
  const [activeGame, setActiveGame] = useState<ActiveGame>('menu');

  const handleBackToMenu = () => setActiveGame('menu');

  return (
    <div className="app-viewport">
      <main className="main-layout">
        {activeGame === 'menu' && <MainMenu onSelectGame={setActiveGame} />}
        {activeGame === 'puzzle' && <PuzzleGame onBack={handleBackToMenu} />}
        {activeGame === 'bubble' && <BubbleGame onBack={handleBackToMenu} />}
      </main>
    </div>
  );
}

export default App;
