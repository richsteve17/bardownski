import React, { useState } from 'react';
import { Play, Activity } from 'lucide-react';
import { simulateShift } from '../MatchEngine';

export default function MatchView({
  lineup,
  momentum,
  chemistry,
  powerPlayBuff = false,
  period = 1,
  shiftsRemaining = 0,
  shiftsThisPeriod = 0,
  homeScore = 0,
  awayScore = 0,
  isFinal = false,
  onMatchEnd,
}) {
  const [log, setLog] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const startShift = () => {
    if (isSimulating || isFinal || shiftsRemaining <= 0) return;
    setIsSimulating(true);
    setLog([{ text: "Whistle blows. New shift starts.", type: "SYSTEM" }]);

    let result;
    try {
      result = simulateShift(lineup, momentum, chemistry, { powerPlayBuff });
    } catch {
      result = { events: [{ text: "Engine hiccup. Running emergency neutral shift.", type: "ERROR" }], shiftScore: 0, swaggerGain: 0 };
    }

    const events = Array.isArray(result?.events) && result.events.length > 0
      ? result.events
      : [{ text: "No clean lane opened. Grinding neutral shift.", type: "NEUTRAL" }];

    // Animate the ticker
    events.forEach((event, i) => {
      setTimeout(() => {
        setLog((prev) => [...prev, event]);
        if (i === events.length - 1) {
          setIsSimulating(false);
          onMatchEnd?.({ ...result, events });
        }
      }, (i + 1) * 1100);
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Live Match Engine</h2>
          <p className="text-xl font-black italic">BARDOWNSKI <span className="text-goal-red">LIVE</span></p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Period {period} • Shifts {shiftsRemaining}/{shiftsThisPeriod}
          </p>
          {powerPlayBuff && (
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Power Play Buff Active
            </p>
          )}
        </div>
        <Activity className={isSimulating ? "text-goal-red animate-pulse" : "text-zinc-800"} />
      </div>
      <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Score</p>
        <p className="text-sm font-black text-white">
          Bardownski {homeScore} - {awayScore} Rivals
        </p>
      </div>

      <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-4 overflow-y-auto space-y-3 shadow-inner">
        {log.map((entry, i) => (
          <div key={i} className={`p-3 rounded-lg border-l-4 text-xs font-bold leading-relaxed animate-in fade-in slide-in-from-left-2
            ${entry.type === 'GOAL' ? 'bg-goal-red/10 border-goal-red text-white' :
              entry.type === 'OPP_GOAL' ? 'bg-purple-500/10 border-purple-400 text-purple-300' :
              entry.type === 'POWER_PLAY' ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300' :
              entry.type === 'SCRAP_TRIGGER' ? 'bg-red-500/10 border-red-500 text-red-300' :
              entry.type === 'SYSTEM' ? 'bg-blue-500/10 border-blue-400 text-blue-300' :
              entry.type === 'ERROR' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-300' :
              entry.type === 'TILT' ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 
              'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
          >
            {entry.text}
          </div>
        ))}
      </div>

      {!isSimulating && !isFinal && (
        <button
          onClick={startShift}
          disabled={shiftsRemaining <= 0}
          className="mt-6 w-full py-4 bg-white text-black font-black uppercase italic rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
        >
          <Play size={18} fill="black" /> Drop the Puck
        </button>
      )}
      {isFinal && (
        <div className="mt-6 w-full rounded-xl border border-zinc-800 bg-zinc-900 py-4 text-center text-sm font-black uppercase tracking-widest text-zinc-300">
          Final: Bardownski {homeScore} - {awayScore}
        </div>
      )}
    </div>
  );
}
