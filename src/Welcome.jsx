import { useState } from 'react';

export default function Welcome({onStart}) {
  const [hover, setHover] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 select-none">
      <div className="grid grid-cols-3 border border-[#1a1a1a]">
        {['X','O','','','X','','O','',''].map((v, i) => (
          <div key={i} className="w-10 h-10 flex items-center justify-center text-sm font-medium"
            style={{
              background: v ? '#111' : 'transparent',
              color: v === 'X' ? '#fff' : v === 'O' ? '#888' : '#1a1a1a',
              borderRight: (i + 1) % 3 ? '1px solid #1a1a1a' : 'none',
              borderBottom: i < 6 ? '1px solid #1a1a1a' : 'none',
            }}
          >
            {v || '·'}
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-medium text-white">Grid Battle Arena</h1>
      <p className="text-xs text-[#555] tracking-wider uppercase">Multiplayer · Tic Tac Toe</p>

      <button
        onClick={onStart}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="px-6 py-2 text-sm font-medium cursor-pointer transition-colors duration-150"
        style={{
          background: hover ? '#fff' : '#0a0a0a',
          color: hover ? '#0a0a0a' : '#fff',
          border: '1px solid #333',
        }}
      >
        Start Game
      </button>
    </div>
  );
}
