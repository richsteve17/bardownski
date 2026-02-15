import React from 'react';
import { Shield, Zap, AlertCircle } from 'lucide-react';

const TILTED_MOMENTUM_THRESHOLD = 55;
const TILTED_TRUST_THRESHOLD = 68;

export default function LockerRoom({
  sullyHeat,
  trust,
  momentum = 0,
  scoutReport = 'unknown',
  rookieStateOverride = 'normal',
  powerPlayBuff = false,
}) {
  const sullyIsTilted = momentum >= TILTED_MOMENTUM_THRESHOLD && trust <= TILTED_TRUST_THRESHOLD;
  const rookieIsRattled = rookieStateOverride === 'rattled' || scoutReport === 'low' || (sullyIsTilted && sullyHeat >= 55);

  const players = {
    sully: {
      name: 'Sully Sullivan',
      role: 'D-Man / Anchor',
      trust,
      state: sullyIsTilted ? 'Tilted' : 'Dialed',
      effect: sullyIsTilted
        ? 'Scraps more often, but defensive positioning drops.'
        : 'Anchor mode holds. Physical play stays controlled.',
    },
    rookie: {
      name: 'Leo Rossi',
      role: "Sniper / '06 Wheels",
      ovr: 78,
      scoutReport,
      state: rookieIsRattled ? 'Rattled' : 'Confident',
      effect: rookieIsRattled
        ? "Shot accuracy drops; he's playing scared of Sully."
        : 'Shot accuracy stays clean with open-ice confidence.',
    },
  };

  return (
    <div className="p-6 bg-zinc-950 h-full">
      <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-6">Active Lineup</h2>
      {powerPlayBuff && (
        <p className="mb-6 text-[10px] font-black uppercase tracking-widest text-emerald-400">
          Power Play Buff queued for next shift
        </p>
      )}
      
      <div className="relative space-y-12">
        {/* Sully - The Anchor */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">{players.sully.name}</h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase">{players.sully.role}</p>
              <p className={`mt-1 text-[10px] font-black uppercase ${players.sully.state === 'Tilted' ? 'text-red-400' : 'text-blue-400'}`}>
                {players.sully.state}
              </p>
              <p className="mt-1 text-[11px] text-zinc-400 leading-tight">{players.sully.effect}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-blue-400">TRUST: {players.sully.trust}%</span>
          </div>
        </div>

        {/* The Connection Line */}
        <div className="absolute left-8 top-16 w-1 h-12 flex flex-col items-center">
          <div className={`w-full h-full ${sullyHeat > 50 ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}`} />
          <div className="absolute top-1/2 -translate-y-1/2 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-[8px] font-black uppercase whitespace-nowrap">
            {sullyHeat > 50 ? 'Rift: High Tension' : 'Stable Pair'}
          </div>
        </div>

        {/* The Rookie */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center opacity-80">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-full text-orange-500">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-300">{players.rookie.name}</h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase">{players.rookie.role}</p>
              <p className={`mt-1 text-[10px] font-black uppercase ${players.rookie.state === 'Rattled' ? 'text-red-400' : 'text-emerald-400'}`}>
                {players.rookie.state}
              </p>
              <p className="mt-1 text-[11px] text-zinc-400 leading-tight">{players.rookie.effect}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-zinc-600">OVR: {players.rookie.ovr}</span>
          </div>
        </div>
      </div>

      {(sullyHeat > 50 || players.sully.state === 'Tilted') && (
        <div className="mt-8 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex gap-3">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <p className="text-xs text-zinc-400 leading-relaxed">
            <span className="text-white font-bold">Locker Room Alert:</span> Sully's ego is taking a hit. Expect him to "forget" his defensive assignments for the rookie.
          </p>
        </div>
      )}
    </div>
  );
}
