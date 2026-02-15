import React, { useState, useEffect, useRef } from 'react';
import { Timer, Zap } from 'lucide-react';

export default function ScoutingDrill({ onComplete }) {
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const tapsRef = useRef(0);

  useEffect(() => {
    tapsRef.current = taps;
  }, [taps]);

  useEffect(() => {
    if (!isActive) return undefined;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsActive(false);
          onComplete?.(tapsRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onComplete]);

  const startDrill = () => {
    setTaps(0);
    setTimeLeft(5);
    setIsActive(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-950 p-8 text-center">
      <h2 className="text-xl font-black italic mb-2 text-momentum-gold flex items-center gap-2">
        <Zap size={18} />
        PROVE THE WHEELS
      </h2>
      <p className="text-zinc-500 text-xs mb-8 uppercase tracking-widest">Tap fast to hit '06 Top Speed</p>
      
      <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-4 border-zinc-800 mb-8">
        <div className="text-5xl font-black">{taps}</div>
        <div className="absolute -top-4 bg-goal-red px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
          <Timer size={14} /> {timeLeft}s
        </div>
      </div>

      {!isActive ? (
        <button
          onClick={startDrill}
          className="bg-tape-blue w-full py-4 rounded-xl font-black uppercase italic hover:scale-105 transition-transform"
        >
          {timeLeft === 0 ? 'Run It Back' : 'Drop the Puck'}
        </button>
      ) : (
        <button
          onPointerDown={() => timeLeft > 0 && setTaps(t => t + 1)}
          className="bg-zinc-800 w-full py-12 rounded-xl font-black uppercase italic active:bg-zinc-700 active:scale-95 transition-all select-none"
        >
          TAP!
        </button>
      )}
    </div>
  );
}
