import './MainMenu.css';

interface MainMenuProps {
  onSelectGame: (game: 'puzzle' | 'bubble') => void;
}

function MainMenu({ onSelectGame }: MainMenuProps) {
  return (
    <div className="container main-menu-container">
      <h1>Абетка 🦄</h1>
      <p className="subtitle">У що будемо грати?</p>
      
      <div className="game-cards">
        <button className="game-card puzzle-card" onClick={() => onSelectGame('puzzle')}>
          <div className="card-icon">🧩</div>
          <div className="card-content">
            <h2>Пазли</h2>
            <p>Збирай картинки та вчи літери</p>
          </div>
        </button>
        
        <button className="game-card bubble-card" onClick={() => onSelectGame('bubble')}>
          <div className="card-icon">🫧</div>
          <div className="card-content">
            <h2>Бульбашки</h2>
            <p>Лопай бульбашки на швидкість</p>
            <span className="badge-new">NEW!</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default MainMenu;
