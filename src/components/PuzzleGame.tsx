import { useState, useCallback, useRef, useEffect } from 'react'
import confetti from 'canvas-confetti'
import './PuzzleGame.css'
import { Letter, VOWELS, CONSONANTS, ALL_LETTERS, speakLetter, playRandomFeedback, initSpeech } from '../data/letters'

type GameMode = 'vowels' | 'consonants' | 'mixed';

const ABETKA_GAME_PROGRESS = 'ABETKA_GAME_PROGRESS';

interface GameState {
  level: number;
  score: number;
  revealedPieces: number[];
  mode: GameMode;
  difficulty: number;
  maxLevelReached: number;
}

interface PuzzleGameProps {
  onBack: () => void;
}

function PuzzleGame({ onBack }: PuzzleGameProps) {
  const [mode, setMode] = useState<GameMode>('vowels');
  const [difficulty, setDifficulty] = useState<number>(4);
  const [isGameStarted, setIsGameStarted] = useState(false);
  
  const [level, setLevel] = useState(1);
  const [maxLevelReached, setMaxLevelReached] = useState(1);
  const [score, setScore] = useState(0);
  const [revealedPieces, setRevealedPieces] = useState<number[]>([]);
  const [targetLetter, setTargetLetter] = useState<Letter | null>(null);
  const [options, setOptions] = useState<Letter[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const [hasErrorInCurrentRound, setHasErrorInCurrentRound] = useState(false);
  const [savedGame, setSavedGame] = useState<GameState | null>(null);
  
  const lastTargetLetters = useRef<string[]>([]);

  // Load saved game on mount
  useEffect(() => {
    const saved = localStorage.getItem(ABETKA_GAME_PROGRESS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedGame(parsed);
        if (parsed.maxLevelReached) setMaxLevelReached(parsed.maxLevelReached);
      } catch (e) {
        console.error("Failed to parse saved game", e);
      }
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (isGameStarted) {
      const state: GameState = { level, score, revealedPieces, mode, difficulty, maxLevelReached };
      localStorage.setItem(ABETKA_GAME_PROGRESS, JSON.stringify(state));
    }
  }, [level, score, revealedPieces, mode, difficulty, isGameStarted, maxLevelReached]);

  const getGridConfig = (lvl: number) => {
    if (lvl <= 1) return { cols: 2, rows: 2, total: 4 };
    if (lvl <= 3) return { cols: 3, rows: 2, total: 6 };
    if (lvl <= 6) return { cols: 3, rows: 3, total: 9 };
    if (lvl <= 10) return { cols: 4, rows: 3, total: 12 };
    if (lvl <= 15) return { cols: 4, rows: 4, total: 16 };
    return { cols: 5, rows: 4, total: 20 };
  };

  const grid = getGridConfig(level);

  useEffect(() => {
    if (isGameStarted && targetLetter && !isLevelComplete && !isTransitioning) {
      const timer = setTimeout(() => speakLetter(targetLetter), 600);
      return () => clearTimeout(timer);
    }
  }, [targetLetter, isLevelComplete, isTransitioning, isGameStarted]);

  const generateRound = useCallback(() => {
    if (isLevelComplete) return;

    let pool: Letter[];
    if (mode === 'vowels') pool = VOWELS;
    else if (mode === 'consonants') pool = CONSONANTS;
    else pool = ALL_LETTERS;

    let target: Letter;
    do {
      target = pool[Math.floor(Math.random() * pool.length)];
    } while (lastTargetLetters.current.includes(target.char) && pool.length > 3);

    lastTargetLetters.current.push(target.char);
    if (lastTargetLetters.current.length > 3) lastTargetLetters.current.shift();

    setTargetLetter(target);

    const others = pool.filter(l => l.char !== target.char);
    const shuffledOthers = others.sort(() => 0.5 - Math.random());
    const roundOptions = shuffledOthers.slice(0, difficulty - 1);
    roundOptions.push(target);
    
    setOptions(roundOptions.sort(() => 0.5 - Math.random()));
    setSelectedChoices({});
    setHasErrorInCurrentRound(false);
  }, [mode, difficulty, isLevelComplete]);

  // Bootstrap round effect
  useEffect(() => {
    if (isGameStarted && !targetLetter && !isLevelComplete && !isTransitioning) {
      generateRound();
    }
  }, [isGameStarted, targetLetter, isLevelComplete, isTransitioning, generateRound]);

  const handleNewGame = () => {
    initSpeech();
    localStorage.removeItem(ABETKA_GAME_PROGRESS);
    setScore(0);
    setLevel(1);
    setMaxLevelReached(1);
    setRevealedPieces([]);
    setIsLevelComplete(false);
    setTargetLetter(null);
    lastTargetLetters.current = [];
    setIsGameStarted(true);
  };

  const handleContinue = () => {
    if (!savedGame) return;
    initSpeech();
    setScore(savedGame.score);
    setLevel(savedGame.level);
    setMaxLevelReached(savedGame.maxLevelReached || savedGame.level);
    setRevealedPieces(savedGame.revealedPieces);
    setMode(savedGame.mode);
    setDifficulty(savedGame.difficulty);
    setIsLevelComplete(false);
    setTargetLetter(null);
    setIsGameStarted(true);
  };

  const handleRestartLevel = () => {
    if (window.confirm("Почати цей рівень спочатку?")) {
        setRevealedPieces([]);
        setHasErrorInCurrentRound(false);
        setTargetLetter(null);
    }
  };

  const goToLevel = (lvl: number) => {
    if (lvl > maxLevelReached) return;
    setIsTransitioning(true);
    setIsMapOpen(false);
    setTimeout(() => {
      setLevel(lvl);
      setRevealedPieces([]);
      setIsLevelComplete(false);
      setSelectedChoices({});
      setIsTransitioning(false);
      lastTargetLetters.current = [];
      setTargetLetter(null);
    }, 400);
  };

  const handleNextLevel = () => {
    setIsTransitioning(true);
    const nextLvl = level < 20 ? level + 1 : 1;
    if (nextLvl > maxLevelReached) setMaxLevelReached(nextLvl);
    
    setTimeout(() => {
      setLevel(nextLvl);
      setRevealedPieces([]);
      setIsLevelComplete(false);
      setSelectedChoices({});
      setIsTransitioning(false);
      lastTargetLetters.current = [];
      generateRound();
    }, 500);
  };

  const fireFireworks = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleChoice = (letter: Letter) => {
    if (Object.values(selectedChoices).includes('correct') || isTransitioning || isLevelComplete) return;

    if (letter.char === targetLetter?.char) {
      setScore(s => s + 1);
      setSelectedChoices(prev => ({ ...prev, [letter.char]: 'correct' }));
      
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });

      const availablePieces = Array.from({length: grid.total}, (_, i) => i)
                                   .filter(i => !revealedPieces.includes(i));
      
      if (availablePieces.length > 0) {
        const randomPiece = availablePieces[Math.floor(Math.random() * availablePieces.length)];
        const newRevealed = [...revealedPieces, randomPiece];
        setRevealedPieces(newRevealed);

        if (newRevealed.length === grid.total) {
          setIsLevelComplete(true);
          const nextLvl = level + 1;
          if (nextLvl > maxLevelReached && level < 20) setMaxLevelReached(nextLvl);
          
          fireFireworks();
          const audio = new Audio('./audio/praise_20.mp3');
          audio.play().catch(e => console.log("Win sound error", e));
          return;
        }
      }

      playRandomFeedback(true);
      setTimeout(generateRound, 3000);
    } else {
      setSelectedChoices(prev => ({ ...prev, [letter.char]: 'wrong' }));
      
      if (!hasErrorInCurrentRound && revealedPieces.length > 0) {
        setRevealedPieces(prev => {
          const next = [...prev];
          next.splice(Math.floor(Math.random() * next.length), 1);
          return next;
        });
        setHasErrorInCurrentRound(true);
      }

      playRandomFeedback(false);
      if (targetLetter) {
        setTimeout(() => speakLetter(targetLetter), 3500);
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isMapOpen && <div className="map-backdrop" onClick={() => setIsMapOpen(false)} />}

      {/* Level Sidebar */}
      <aside className={`levels-sidebar ${isMapOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
           <h2>Мапа пригод 🗺️</h2>
           <button className="close-map" onClick={() => setIsMapOpen(false)}>✕</button>
        </div>
        <div className="levels-grid">
          {Array.from({length: 20}, (_, i) => i + 1).map(num => (
            <button 
              key={num}
              className={`level-node ${num === level ? 'current' : ''} ${num <= maxLevelReached ? 'unlocked' : 'locked'} ${num < maxLevelReached ? 'completed' : ''}`}
              onClick={() => goToLevel(num)}
              disabled={num > maxLevelReached}
              style={{ 
                backgroundImage: num < maxLevelReached ? `url(./images/puzzles/${num}.jpg)` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="level-overlay">
                <span className="level-number">{num}</span>
                {num > maxLevelReached && <span className="lock-icon">🔒</span>}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="container main-layout">
        {!isGameStarted ? (
          <div className="start-screen">
            <h1>Вчимо абетку 🦄</h1>
            <div className="settings card">
              {savedGame ? (
                <div className="continue-section">
                    <h3>З поверненням!</h3>
                    <button className="continue-btn" onClick={handleContinue}>
                      Продовжити (Рівень {savedGame.level})
                    </button>
                    <div className="divider">або почати спочатку</div>
                </div>
              ) : (
                <h3>Налаштування пазлів</h3>
              )}
              
              <div className="setting-group">
                <label>Що вчимо сьогодні?</label>
                <div className="button-group">
                  <button className={mode === 'vowels' ? 'active' : ''} onClick={() => setMode('vowels')}>Голосні</button>
                  <button className={mode === 'consonants' ? 'active' : ''} onClick={() => setMode('consonants')}>Приголосні</button>
                  <button className={mode === 'mixed' ? 'active' : ''} onClick={() => setMode('mixed')}>Все разом</button>
                </div>
              </div>
              <div className="setting-group">
                <label>Складність:</label>
                <div className="button-group">
                  {[2, 4, 6, 8].map(n => (
                    <button key={n} className={difficulty === n ? 'active' : ''} onClick={() => setDifficulty(n)}>{n} літери</button>
                  ))}
                </div>
              </div>
              <button className="start-btn" onClick={handleNewGame}>
                {savedGame ? 'Нова гра' : 'Почати пригоду!'}
              </button>
              
              <button className="back-to-menu-btn" onClick={onBack} style={{marginTop: '20px', background: 'transparent', color: '#666', border: 'none', textDecoration: 'underline'}}>
                ↩ Повернутися в головне меню
              </button>
            </div>
          </div>
        ) : (
          <div className="game-screen">
            <div className="game-header">
              <div className="header-left">
                  <button className="back-btn" onClick={() => setIsGameStarted(false)} title="Налаштування">⚙️</button>
                  <button className="map-toggle-btn" onClick={() => setIsMapOpen(true)} title="Мапа рівнів">🗺️</button>
                  <button className="restart-btn" onClick={handleRestartLevel} title="Почати рівень спочатку">🔄</button>
              </div>
              <div className="stats">
                <span className="level-badge">Рівень {level}</span>
                <span className="score-badge">Очки: {score}</span>
              </div>
            </div>

            <div className={`main-game-area ${isLevelComplete ? 'level-complete' : ''}`}>
              <div className="puzzle-section">
                <div className={`puzzle-container ${isLevelComplete ? 'zoomed' : ''}`}>
                  <div 
                    className="puzzle-grid" 
                    style={{ 
                      gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
                      gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
                      backgroundImage: `url(./images/puzzles/${level}.jpg)` 
                    }}
                  >
                    {Array.from({length: grid.total}).map((_, i) => (
                      <div 
                        key={`${level}-${i}`}
                        className={`puzzle-piece ${revealedPieces.includes(i) ? 'revealed' : ''}`}
                      >
                        {!revealedPieces.includes(i) && <span className="question-mark">?</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!isLevelComplete ? (
                <div className="quiz-section">
                  <div className="options-grid">
                    {options.map((letter, idx) => (
                      <button 
                        key={idx} 
                        className={`letter-btn ${selectedChoices[letter.char] || ''}`}
                        onClick={() => handleChoice(letter)}
                        disabled={selectedChoices[letter.char] === 'correct' || selectedChoices[letter.char] === 'wrong' || isTransitioning}
                      >
                        {letter.char}
                      </button>
                    ))}
                  </div>

                  <div className="controls-row">
                    <button className="repeat-btn" onClick={() => targetLetter && speakLetter(targetLetter)}>
                      🔊 Повторити звук
                    </button>
                  </div>
                </div>
              ) : (
                <div className="next-level-section">
                  <button className="next-btn" onClick={handleNextLevel}>
                    ДАЛІ ➔
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default PuzzleGame;
