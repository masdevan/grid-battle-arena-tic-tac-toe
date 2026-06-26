import { useState } from 'react';

export default function Welcome({onStart}) {
  const [hover, setHover] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 select-none">
      <img src="/logo.png" alt="Grid Battle Arena" className="w-16 h-16" />

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
