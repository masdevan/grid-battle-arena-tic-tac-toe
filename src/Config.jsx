import { useState, useEffect } from 'react';

const sizes = [3, 4, 5, 10, 20, 100];
const SYMS = ['X', 'O', '▲', '■'];
const COLS = ['#fff', '#fff', '#fff', '#fff'];

function loadStats() {
  try { return JSON.parse(localStorage.getItem('gba_stats')) || { won: {}, draw: 0, total: 0 }; }
  catch { return { won: {}, draw: 0, total: 0 }; }
}

export default function Config({onStart}) {
  const [size, setSize] = useState(3);
  const [mode, setMode] = useState('player');
  const [numPlayers, setNumPlayers] = useState(2);
  const [stats, setStats] = useState(loadStats);

  useEffect(() => { setStats(loadStats()); }, []);

  const big = size >= 20;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 select-none">
      <h1 className="text-2xl font-medium text-white">Game Setup</h1>

      <div>
        <div className="text-xs text-[#555] uppercase tracking-wider mb-3 text-center">Board Size</div>
        <div className="flex gap-2 flex-wrap justify-center">
          {sizes.map(s => (
            <button key={s} onClick={() => setSize(s)}
              className="px-4 py-2 text-sm cursor-pointer transition-colors duration-100"
              style={{ background: size === s ? '#fff' : '#0a0a0a', color: size === s ? '#0a0a0a' : '#fff', border: '1px solid #333', minWidth: 56 }}
            >{s}×{s}</button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs text-[#555] uppercase tracking-wider mb-3 text-center">Mode</div>
        <div className="flex gap-3">
          {[
            { key: 'player', label: 'vs Player' },
            { key: 'bot', label: 'vs Bot' },
          ].map(m => (
            <button key={m.key} onClick={() => setMode(m.key)}
              className="px-6 py-2 text-sm cursor-pointer transition-colors duration-100"
              style={{
                background: mode === m.key ? '#fff' : '#0a0a0a',
                color: mode === m.key ? '#0a0a0a' : '#fff',
                border: '1px solid #333',
              }}
            >{m.label}</button>
          ))}
        </div>
      </div>

      {big && (
        <div>
          <div className="text-xs text-[#555] uppercase tracking-wider mb-3 text-center">Players</div>
          <div className="flex gap-2">
            {[2, 3, 4].map(n => (
              <button key={n} onClick={() => setNumPlayers(n)}
                className="w-14 py-2 text-sm cursor-pointer transition-colors duration-100"
                style={{ background: numPlayers === n ? '#fff' : '#0a0a0a', color: numPlayers === n ? '#0a0a0a' : '#fff', border: '1px solid #333' }}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex gap-3 justify-center mt-2">
            {SYMS.slice(0, numPlayers).map((s, i) => (
              <span key={s} className="text-sm" style={{ color: COLS[i] }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-[#444] text-center leading-relaxed">
        {stats.total > 0 ? (
          <>Played: {stats.total} &middot; {Object.entries(stats.won).map(([k, v]) => `${k}:${v}`).join(' ')} &middot; Draw:{stats.draw}</>
        ) : 'No games played yet'}
      </div>

      <button onClick={() => onStart(size, mode, numPlayers)}
        className="px-8 py-2 text-sm font-medium cursor-pointer transition-colors duration-100"
        style={{ background: '#0a0a0a', color: '#fff', border: '1px solid #333' }}
        onMouseEnter={(e) => { e.target.style.background = '#fff'; e.target.style.color = '#0a0a0a'; }}
        onMouseLeave={(e) => { e.target.style.background = '#0a0a0a'; e.target.style.color = '#fff'; }}
      >Start</button>
    </div>
  );
}
