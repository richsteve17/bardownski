import React from 'react';
import { Play, RotateCcw, CalendarDays } from 'lucide-react';

export default function NewGame({
  gameNumber,
  record,
  isLiveGame,
  matchFinal,
  onOpenMatch,
  onResetGame,
}) {
  return (
    <div className="flex h-full flex-col bg-zinc-950 p-6">
      <div className="mb-8">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Game Hub</h2>
        <h1 className="text-2xl font-black italic">
          NEW <span className="text-tape-blue">GAME</span>
        </h1>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Next Matchup</p>
        <p className="mt-2 text-xl font-black text-white">Game {gameNumber}</p>
        <p className="mt-1 text-sm font-bold text-zinc-400">
          Record: {record.wins}-{record.losses}-{record.ties}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs text-zinc-300">
        <p className="font-black uppercase tracking-wider text-zinc-500">State</p>
        <p className="mt-2">
          {matchFinal
            ? 'Final pending press conference.'
            : isLiveGame
              ? 'Live game in progress.'
              : 'Pregame. Ready for puck drop.'}
        </p>
      </div>

      <div className="mt-auto space-y-3">
        <button
          type="button"
          onClick={onOpenMatch}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 font-black uppercase italic text-black transition-colors hover:bg-zinc-200"
        >
          <Play size={18} />
          {isLiveGame ? 'Resume Match' : 'Drop the Puck'}
        </button>

        <button
          type="button"
          onClick={onResetGame}
          disabled={isLiveGame || matchFinal}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 py-4 font-black uppercase italic text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={16} />
          Reset Match State
        </button>

        <p className="flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-600">
          <CalendarDays size={12} />
          Schedule Control
        </p>
      </div>
    </div>
  );
}
