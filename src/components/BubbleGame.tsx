import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import './BubbleGame.css';
import { Letter, VOWELS, CONSONANTS, ALL_LETTERS, speakLetter } from '../data/letters';

interface BubbleGameProps {
  onBack: () => void;
}

type BubbleMode = 'vowels' | 'consonants' | 'mixed';
type BubbleSpeed = 'slow' | 'normal' | 'fast';

interface Bubble {
  id: number;
  letter: Letter;
  left: number;
  duration: number;
  size: number;
  status: 'bubble' | 'stone';
  topPos?: number;
}

function BubbleGame({ onBack }: BubbleGameProps) {
  const [gameStep, setGameStep] = useState<'settings' | 'playing'>('settings');
  const [mode, setMode] = useState<BubbleMode>('vowels');
  const [speed, setSpeed] = useState<BubbleSpeed>('normal');
  const [score, setScore] = useState(0);
  const [targetLetter, setTargetLetter] = useState<Letter | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  
  const bubbleIdCounter = useRef(0);
  const spawnTimerRef = useRef<number | null>(null);
  const targetRef = useRef<Letter | null>(null);
  const recentLetters = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, []);

  const getSpeedSettings = () => {
    switch(speed) {
      case 'slow': return { spawnRate: 1800, minDur: 30, maxDur: 40 };
      case 'fast': return { spawnRate: 500, minDur: 8, maxDur: 12 };
      default: return { spawnRate: 950, minDur: 22, maxDur: 28 }; // Average 25s
    }
  };

  const startGame = () => {
    setGameStep('playing');
    setScore(0);
    setBubbles([]);
    recentLetters.current = [];
    
    const pool = getPool(mode);
    const initialTarget = pool[Math.floor(Math.random() * pool.length)];
    setTargetLetter(initialTarget);
    targetRef.current = initialTarget;
    
    speakLetter(initialTarget); 

    // Instant spawn first 5 bubbles with NO delay
    for(let i = 0; i < 5; i++) {
        spawnBubble();
    }
    
    startSpawning();
  };

  const stopGame = () => {
    setGameStep('settings');
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    setBubbles([]);
  };

  const getPool = (currentMode: BubbleMode) => {
    if (currentMode === 'vowels') return VOWELS;
    if (currentMode === 'consonants') return CONSONANTS;
    return ALL_LETTERS;
  };

  const pickNewTarget = () => {
    const pool = getPool(mode);
    const randomLetter = pool[Math.floor(Math.random() * pool.length)];
    setTargetLetter(randomLetter);
    targetRef.current = randomLetter;
    speakLetter(randomLetter);
  };

  const startSpawning = () => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    const settings = getSpeedSettings();
    
    spawnTimerRef.current = window.setInterval(() => {
      spawnBubble();
    }, settings.spawnRate);
  };

  const spawnBubble = () => {
    if (!targetRef.current) return;
    
    const pool = getPool(mode);
    
    // Logic to exclude repeats
    let letterToSpawn: Letter;
    let attempts = 0;
    do {
        const isTarget = Math.random() < 0.25;
        letterToSpawn = isTarget ? targetRef.current : pool[Math.floor(Math.random() * pool.length)];
        attempts++;
    } while (recentLetters.current.includes(letterToSpawn.char) && attempts < 10);

    recentLetters.current.push(letterToSpawn.char);
    if (recentLetters.current.length > 5) recentLetters.current.shift();
    
    const settings = getSpeedSettings();
    const duration = Math.random() * (settings.maxDur - settings.minDur) + settings.minDur;

    const newBubble: Bubble = {
      id: bubbleIdCounter.current++,
      letter: letterToSpawn,
      left: Math.random() * 75 + 5,
      duration: duration,
      size: Math.random() * 30 + 170, // ~170-200px
      status: 'bubble'
    };

    setBubbles(prev => [...prev, newBubble]);

    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== newBubble.id));
    }, duration * 1000 + 1000);
  };

  const handleBubbleClick = (e: React.MouseEvent, bubble: Bubble) => {
    if (!targetLetter || bubble.status === 'stone') return;

    if (bubble.letter.char === targetLetter.char) {
      setScore(s => s + 1);
      setBubbles(prev => prev.filter(b => b.id !== bubble.id));
      
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      confetti({
        particleCount: 40,
        spread: 70,
        origin: { x, y }
      });
      
      setTimeout(() => pickNewTarget(), 800);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setBubbles(prev => prev.map(b => 
        b.id === bubble.id ? { ...b, status: 'stone' as const, topPos: rect.top } : b
      ));
      
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== bubble.id));
      }, 1000);
    }
  };

  return (
    <div className="bubble-game-viewport">
      {gameStep === 'settings' ? (
        <div className="bubble-settings-screen">
          <h1 className="bubble-title">🫧 Бульбашки</h1>
          <div className="settings card bubble-card-settings">
            <h3>Налаштування гри</h3>
            
            <div className="setting-group">
              <label>Які літери ловимо?</label>
              <div className="button-group">
                <button className={mode === 'vowels' ? 'active' : ''} onClick={() => setMode('vowels')}>Голосні</button>
                <button className={mode === 'consonants' ? 'active' : ''} onClick={() => setMode('consonants')}>Приголосні</button>
                <button className={mode === 'mixed' ? 'active' : ''} onClick={() => setMode('mixed')}>Всі разом</button>
              </div>
            </div>

            <div className="setting-group">
              <label>Швидкість бульбашок:</label>
              <div className="button-group">
                <button className={speed === 'slow' ? 'active' : ''} onClick={() => setSpeed('slow')}>🐢 Повільно</button>
                <button className={speed === 'normal' ? 'active' : ''} onClick={() => setSpeed('normal')}>🏃 Нормально</button>
                <button className={speed === 'fast' ? 'active' : ''} onClick={() => setSpeed('fast')}>🚀 Швидко</button>
              </div>
            </div>

            <button className="start-btn bubble-start-btn" onClick={startGame}>Почати пригоду!</button>
            <button className="back-to-menu-btn" onClick={onBack}>↩ До головного меню</button>
          </div>
        </div>
      ) : (
        <div className="bubble-game-area">
          <div className="bubble-top-bar">
            <button className="bubble-home-btn" onClick={stopGame}>🏠</button>
            <div className="bubble-target" onClick={() => targetLetter && speakLetter(targetLetter)}>
               🔊 Знайди: <span className="char-highlight">{targetLetter?.char}</span>
            </div>
            <div className="bubble-score">🏆 {score}</div>
          </div>

          <div className="bubbles-container">
            {bubbles.map(bubble => (
              <div
                key={bubble.id}
                className={`bubble-item ${bubble.status}`}
                style={{
                  left: `${bubble.left}%`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  top: bubble.status === 'stone' ? `${bubble.topPos}px` : undefined,
                  animationDuration: bubble.status === 'stone' ? '0.8s' : `${bubble.duration}s`,
                  animationName: bubble.status === 'stone' ? 'stoneFall' : 'bubbleFloat',
                  pointerEvents: bubble.status === 'stone' ? 'none' : 'auto'
                }}
                onClick={(e) => handleBubbleClick(e, bubble)}
              >
                {bubble.status === 'bubble' && <div className="bubble-shine"></div>}
                <span className="bubble-text">{bubble.letter.char}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BubbleGame;
