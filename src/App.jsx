import { useState, useEffect, useRef, useCallback } from 'react';
import Welcome from './Welcome.jsx';
import Config from './Config.jsx';

const CELL = 44;
const SYMS = ['X', 'O', '▲', '■'];
const COLS = ['#fff', '#fff', '#fff', '#fff'];

function colorOf(val) {
  const i = SYMS.indexOf(val);
  return i >= 0 ? COLS[i] : '#888';
}

function Square({value, onClick, noBorderRight, noBorderBottom, highlight}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center text-base font-medium cursor-pointer transition-colors duration-100"
      style={{
        width: CELL, height: CELL,
        background: highlight ? '#1a1e1a' : '#0d0d0d',
        color: colorOf(value),
        borderRight: noBorderRight ? 'none' : '1px solid #1a1a1a',
        borderBottom: noBorderBottom ? 'none' : '1px solid #1a1a1a',
      }}
      onMouseEnter={(e) => { if (!value) e.target.style.background = highlight ? '#1a1e1a' : '#141414'; }}
      onMouseLeave={(e) => { if (!value) e.target.style.background = highlight ? '#1a1e1a' : '#0d0d0d'; }}
    >
      {value}
    </button>
  );
}

function Board({squares, onCellClick, size, winLines}) {
  if (!squares) return null;
  const boardPx = CELL * size;
  const highlighted = new Set(winLines?.flatMap(l => l.line) || []);
  const segs = (winLines || []).map(l => {
    const a = l.line[0], b = l.line[l.line.length - 1];
    return {
      x1: (a % size) * CELL + CELL / 2,
      y1: Math.floor(a / size) * CELL + CELL / 2,
      x2: (b % size) * CELL + CELL / 2,
      y2: Math.floor(b / size) * CELL + CELL / 2,
    };
  });

  return (
    <div style={{ position: 'relative', border: '1px solid #1a1a1a', width: boardPx, height: boardPx }}>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${size}, ${CELL}px)`, width: boardPx, lineHeight: 0 }}>
        {squares.map((v, i) => (
          <Square key={i} value={v} onClick={() => onCellClick(i)}
            noBorderRight={(i + 1) % size === 0} noBorderBottom={i >= size * (size - 1)}
            highlight={highlighted.has(i)}
          />
        ))}
      </div>
      {segs.length > 0 && (
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: boardPx, height: boardPx }}>
          {segs.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          ))}
        </svg>
      )}
    </div>
  );
}

function findLines(squares, size) {
  const results = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 3; c++) {
      const i = [r * size + c, r * size + c + 1, r * size + c + 2];
      if (squares[i[0]] && squares[i[0]] === squares[i[1]] && squares[i[0]] === squares[i[2]])
        results.push({ winner: squares[i[0]], line: i });
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - 3; r++) {
      const i = [r * size + c, (r + 1) * size + c, (r + 2) * size + c];
      if (squares[i[0]] && squares[i[0]] === squares[i[1]] && squares[i[0]] === squares[i[2]])
        results.push({ winner: squares[i[0]], line: i });
    }
  }
  for (let r = 0; r <= size - 3; r++) {
    for (let c = 0; c <= size - 3; c++) {
      const i = [r * size + c, (r + 1) * size + (c + 1), (r + 2) * size + (c + 2)];
      if (squares[i[0]] && squares[i[0]] === squares[i[1]] && squares[i[0]] === squares[i[2]])
        results.push({ winner: squares[i[0]], line: i });
    }
  }
  for (let r = 0; r <= size - 3; r++) {
    for (let c = 2; c < size; c++) {
      const i = [r * size + c, (r + 1) * size + (c - 1), (r + 2) * size + (c - 2)];
      if (squares[i[0]] && squares[i[0]] === squares[i[1]] && squares[i[0]] === squares[i[2]])
        results.push({ winner: squares[i[0]], line: i });
    }
  }
  return results;
}

function usePan() {
  const boardRef = useRef(null);
  const s = useRef({ x: 0, y: 0, dragging: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0, moved: false, zoom: 1 });

  const update = useCallback(() => {
    if (boardRef.current)
      boardRef.current.style.transform = `translate(${s.current.x}px, ${s.current.y}px) scale(${s.current.zoom})`;
  }, []);

  const setZoom = useCallback((z) => { s.current.zoom = Math.max(0.3, Math.min(5, z)); update(); }, [update]);
  const getZoom = useCallback(() => s.current.zoom, []);

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    s.current.dragging = true;
    s.current.startX = e.clientX;
    s.current.startY = e.clientY;
    s.current.startPanX = s.current.x;
    s.current.startPanY = s.current.y;
    s.current.moved = false;
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!s.current.dragging) return;
    s.current.x = s.current.startPanX + (e.clientX - s.current.startX);
    s.current.y = s.current.startPanY + (e.clientY - s.current.startY);
    if (Math.abs(s.current.x - s.current.startPanX) > 3 || Math.abs(s.current.y - s.current.startPanY) > 3)
      s.current.moved = true;
    update();
  }, [update]);

  const onMouseUp = useCallback(() => { s.current.dragging = false; }, []);
  const didDrag = useCallback(() => s.current.moved, []);
  const reset = useCallback(() => { s.current.x = 0; s.current.y = 0; s.current.zoom = 1; update(); }, [update]);

  return { boardRef, onMouseDown, onMouseMove, onMouseUp, didDrag, setZoom, getZoom, reset };
}

function saveGame(scores, numPlayers) {
  const stats = (() => { try { return JSON.parse(localStorage.getItem('gba_stats')) || { won: {}, draw: 0, total: 0 }; } catch { return { won: {}, draw: 0, total: 0 }; } })();
  stats.total = (stats.total || 0) + 1;
  const maxScore = Math.max(...Object.values(scores));
  const winners = Object.entries(scores).filter(([, v]) => v === maxScore).map(([k]) => k);
  if (winners.length > 1 || winners.length === 0) stats.draw = (stats.draw || 0) + 1;
  else {
    const w = winners[0];
    stats.won[w] = (stats.won[w] || 0) + 1;
  }
  localStorage.setItem('gba_stats', JSON.stringify(stats));
}

export default function Game(){
  const [screen, setScreen] = useState('welcome');
  const [size, setSize] = useState(3);
  const [mode, setMode] = useState('player');
  const [numPlayers, setNumPlayers] = useState(2);
  const [history, setHistory] = useState(() => [Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [botThinking, setBotThinking] = useState(false);
  const [scores, setScores] = useState({});
  const [showEndModal, setShowEndModal] = useState(false);
  const [gameSaved, setGameSaved] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const players = SYMS.slice(0, numPlayers);
  const currentSquares = history[currentMove];
  const winLines = currentSquares ? findLines(currentSquares, size) : [];
  const isDraw = currentSquares && currentSquares.every(s => s !== null);

  const pan = usePan();
  const viewportRef = useRef(null);
  const prevWinCount = useRef({});

  useEffect(() => {
    const counts = {};
    players.forEach(p => { counts[p] = winLines.filter(l => l.winner === p).length; });
    const updated = {};
    let changed = false;
    players.forEach(p => {
      const prev = prevWinCount.current[p] || 0;
      updated[p] = (scores[p] || 0) + Math.max(0, counts[p] - prev);
      if (counts[p] > prev) changed = true;
    });
    if (changed) setScores(updated);
    prevWinCount.current = counts;
  }, [winLines, players, scores]);

  const botTimer = useRef(null);

  useEffect(() => {
    return () => { if (botTimer.current) clearTimeout(botTimer.current); };
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      pan.setZoom(pan.getZoom() - e.deltaY * 0.002);
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [pan]);

  useEffect(() => {
    if (isDraw && !gameSaved && screen === 'game') {
      saveGame(scores, numPlayers);
      setGameSaved(true);
    }
  }, [isDraw, scores, numPlayers, gameSaved, screen]);

  const handleStart = (s, m, np) => {
    setSize(s);
    setMode(m);
    setNumPlayers(np);
    const p = SYMS.slice(0, np);
    const init = {};
    p.forEach(x => init[x] = 0);
    setScores(init);
    setGameSaved(false);
    prevWinCount.current = {};
    setHistory([Array(s * s).fill(null)]);
    setCurrentMove(0);
    setBotThinking(false);
    pan.reset();
    setScreen('game');
  };

  if (screen === 'welcome') return <Welcome onStart={() => setScreen('config')} />;
  if (screen === 'config') return <Config onStart={handleStart} />;

  const stepBot = (hist, move) => {
    if (mode !== 'bot' || isDraw || !hist) return;
    const nextPlayer = players[move % numPlayers];
    if (nextPlayer === 'X') return;
    const board = hist[move];
    if (!board) return;
    const empty = board.map((s, i) => s === null ? i : -1).filter(i => i >= 0);
    if (empty.length === 0) return;
    const pick = empty[Math.floor(Math.random() * empty.length)];
    setBotThinking(true);
    botTimer.current = setTimeout(() => {
      const botNext = board.slice();
      botNext[pick] = nextPlayer;
      const newHist = [...hist.slice(0, move + 1), botNext];
      const newMove = move + 1;
      setHistory(newHist);
      setCurrentMove(newMove);
      setBotThinking(false);
      stepBot(newHist, newMove);
    }, 300);
  };

  const handleCellClick = (i) => {
    if (pan.didDrag()) return;
    if (currentSquares[i] || isDraw) return;
    const currentPlayer = players[currentMove % numPlayers];
    if (mode === 'bot' && currentPlayer !== 'X') return;
    const next = currentSquares.slice();
    next[i] = currentPlayer;
    const newHistory = [...history.slice(0, currentMove + 1), next];
    const newMove = currentMove + 1;
    setHistory(newHistory);
    setCurrentMove(newMove);
    if (mode === 'bot') stepBot(newHistory, newMove);
  };

  const maxScore = Math.max(...Object.values(scores), 0);
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const leaders = sorted.filter(([, v]) => v === maxScore);
  const isOver = isDraw;
  const statusText = isOver ? (leaders.length > 1 ? 'Draw' : `${leaders[0][0]} wins`) : botThinking ? 'Bot thinking...' : players[currentMove % numPlayers] + '\'s turn';
  const activePlayer = isOver ? null : players[currentMove % numPlayers];
  const statusColor = isOver ? (leaders.length > 1 ? '#555' : colorOf(leaders[0][0])) : colorOf(activePlayer);
  const totalMoves = size * size;

  return (
    <div className="flex min-h-screen select-none" style={{ background: '#0a0a0a' }}>
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="md:hidden fixed top-3 left-3 z-50 text-xs px-2 py-1 cursor-pointer"
        style={{ background: '#111', color: '#555', border: '1px solid #222' }}
      >
        {showSidebar ? '✕' : '☰'}
      </button>

      <aside className={`${showSidebar ? 'flex' : 'hidden'} md:flex fixed md:static inset-0 z-40 md:z-auto w-[220px] h-screen pl-6 pt-12 md:pt-8 flex-col shrink-0 border-r border-[#111] bg-[#0a0a0a]`} style={{ gap: 3 }}>
        <div className="text-[10px] text-[#444] uppercase tracking-wider leading-tight">Grid Battle Arena</div>
        <div className="text-[10px] text-[#333] mb-1">{size}×{size} · {mode === 'bot' ? `Bot ${numPlayers}P` : `${numPlayers}P`}</div>

        <div className="flex flex-col text-xs" style={{ gap: 2 }}>
          {players.map(p => (
            <div key={p} style={{ color: colorOf(p) }}>{p} — <span style={{ color: '#555' }}>{scores[p] || 0}</span></div>
          ))}
        </div>

        <div className="text-xs mt-2 mb-1" style={{ color: statusColor }}>{statusText}</div>
        {!isOver && <div className="text-[10px] text-[#333]">{currentMove}/{totalMoves}</div>}

        <div className="text-[10px] text-[#333] uppercase tracking-wider mt-4 mb-1">Log</div>
        <div className="flex flex-col overflow-y-auto text-[11px] flex-1" style={{ gap: 1, minHeight: 0 }}>
          {history.map((sq, move) => {
            if (move === 0) return null;
            const prev = history[move - 1];
            const pos = sq.findIndex((s, i) => s !== prev[i]);
            const player = players[(move - 1) % numPlayers];
            return (
              <div key={move} style={{ color: move === currentMove ? '#555' : '#333' }}>
                <span style={{ color: colorOf(player) }}>{player}</span>
                <span className="ml-1.5">{pos + 1}</span>
              </div>
            );
          })}
        </div>

        <div className="pb-6">
          <button onClick={() => { if (currentMove === 0) { pan.reset(); setScreen('config'); } else setShowEndModal(true); }}
            className="text-[11px] text-[#444] text-left cursor-pointer transition-colors duration-100 hover:text-white"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >← Back</button>
        </div>
      </aside>

      <main ref={viewportRef}
        className="flex-1 flex items-center justify-center overflow-hidden"
        style={{ height: '100dvh', cursor: 'grab', position: 'relative' }}
        onMouseDown={pan.onMouseDown} onMouseMove={pan.onMouseMove}
        onMouseUp={pan.onMouseUp} onMouseLeave={pan.onMouseUp}
        onClick={() => { if (showSidebar) setShowSidebar(false); }}
      >
        <div style={{ position: 'fixed', top: 12, right: 14, display: 'flex', gap: 14, fontSize: 12, zIndex: 10 }}>
          {players.map(p => (
            <div key={p} style={{ color: colorOf(p) }}>{p} <span style={{ color: '#444' }}>{scores[p] || 0}</span></div>
          ))}
        </div>

        <div ref={pan.boardRef} style={{ transform: 'translate(0px, 0px) scale(1)' }}>
          <Board squares={currentSquares} onCellClick={handleCellClick} size={size} winLines={winLines} />
        </div>
      </main>

      {showEndModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}>
          <div style={{ background: '#111', border: '1px solid #222', padding: '32px 40px', textAlign: 'center' }}>
            <div className="text-sm text-white mb-4">End Game?</div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowEndModal(false)} className="text-sm cursor-pointer transition-colors duration-100 px-4 py-2"
                style={{ background: '#0a0a0a', color: '#fff', border: '1px solid #333' }}
                onMouseEnter={(e) => { e.target.style.background = '#fff'; e.target.style.color = '#0a0a0a'; }}
                onMouseLeave={(e) => { e.target.style.background = '#0a0a0a'; e.target.style.color = '#fff'; }}
              >Cancel</button>
              <button onClick={() => { setShowEndModal(false); pan.reset(); setScreen('config'); }} className="text-sm cursor-pointer transition-colors duration-100 px-4 py-2"
                style={{ background: '#0a0a0a', color: '#888', border: '1px solid #333' }}
                onMouseEnter={(e) => { e.target.style.background = '#fff'; e.target.style.color = '#0a0a0a'; }}
                onMouseLeave={(e) => { e.target.style.background = '#0a0a0a'; e.target.style.color = '#888'; }}
              >End Game</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
