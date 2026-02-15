import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Zap, Target } from 'lucide-react';

export default function ScrapEngine({ onFinish }) {
  const [balance, setBalance] = useState(50);
  const [oppWill, setOppWill] = useState(100);
  const [isFighting, setIsFighting] = useState(true);
  const [message, setMessage] = useState("KEEP YOUR BALANCE");

  const endFight = useCallback((playerWon) => {
    setIsFighting(false);
    setMessage(playerWon ? "CERTIFIED BEAUTY" : "TEN-PLY PERFORMANCE");
    setTimeout(() => onFinish(playerWon), 2000);
  }, [onFinish]);

  useEffect(() => {
    if (!isFighting) return;

    // The "Social Physics" of the scrap:
    // Opponent constantly tries to knock you off center
    const interval = setInterval(() => {
      setBalance((prev) => {
        const drift = (Math.random() * 6 - 3.2); // Natural drift + opponent pressure
        const next = prev + drift;

        if (next <= 0 || next >= 100) {
          clearInterval(interval);
          endFight(false);
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isFighting, endFight]);

  const throwPunch = () => {
    if (!isFighting) return;

    // Impact: Lowering Will affects your own balance (Recoil)
    setOppWill((prev) => {
      const next = Math.max(0, prev - 8);
      if (next === 0) endFight(true);
      return next;
    });

    // Recoil mechanic: Every punch risks a balance shift
    setBalance((prev) => prev + (Math.random() * 14 - 7));
    setMessage(oppWill < 30 ? "HE'S RATTLED!" : "UNLOAD!");
  };

  return (
    <div className="flex flex-col h-full bg-red-950/30 backdrop-blur-2xl p-8 items-center justify-center">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 text-goal-red animate-pulse mb-2">
          <ShieldAlert size={28} />
          <h2 className="text-4xl font-black italic tracking-tighter">THE SCRAP</h2>
        </div>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">{message}</p>
      </div>

      {/* Opponent Will HUD */}
      <div className="w-full max-w-xs mb-12">
        <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 mb-2">
          <span>Opponent Stamina</span>
          <span className="text-white">{oppWill}%</span>
        </div>
        <div className="h-2 bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden">
          <div
            className="h-full bg-goal-red transition-all duration-300"
            style={{ width: `${oppWill}%` }}
          />
        </div>
      </div>

      {/* Rhythmic Balance Meter */}
      <div className="w-full max-w-xs h-6 bg-zinc-900 rounded-full mb-16 relative border border-zinc-800 shadow-inner">
        {/* Sweet Spot */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-full bg-white/5 border-x border-white/10" />

        {/* Balance Indicator */}
        <div
          className={`absolute top-0 h-full w-1.5 shadow-[0_0_15px] transition-all duration-75
            ${balance < 20 || balance > 80 ? 'bg-goal-red shadow-goal-red' : 'bg-white shadow-white'}`}
          style={{ left: `${balance}%` }}
        />

        <Target className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10" size={12} />
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        <div className="text-center p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <p className="text-[8px] font-black text-zinc-500 uppercase">Balance</p>
          <p className={`text-xl font-black ${balance < 20 || balance > 80 ? 'text-goal-red' : 'text-white'}`}>
            {Math.round(balance)}
          </p>
        </div>
        <div className="text-center p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <p className="text-[8px] font-black text-zinc-500 uppercase">Will</p>
          <p className="text-xl font-black text-white">{oppWill}</p>
        </div>
      </div>

      <button
        onPointerDown={throwPunch}
        disabled={!isFighting}
        className={`mt-12 w-full max-w-xs py-10 rounded-2xl font-black uppercase italic transition-all active:scale-95
          ${isFighting ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-800 text-zinc-600'}`}
      >
        {isFighting ? 'Unload' : 'Match Over'}
      </button>

      <p className="mt-8 text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed text-center">
        Throwing punches shifts your balance.<br />Stay centered or get folded.
      </p>
      <div className="sr-only">
        <Zap size={12} />
      </div>
    </div>
  );
}
