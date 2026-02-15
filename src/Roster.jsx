import React from 'react';
import { Shield, Zap, AlertTriangle } from 'lucide-react';

export default function Roster({ chemistry }) {
  return (
    <div className="p-4 bg-zinc-950 h-full overflow-y-auto">
      <h2 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-4">First Line Combinations</h2>
      
      <div className="space-y-4">
        {/* Sully - The Anchor */}
        <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg text-blue-500">
              <Shield size={20} />
            </div>
            <div>
              <p className="font-bold text-white leading-tight">Sully Sullivan</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black">Anchor / D-man</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-blue-400">92 OVR</p>
          </div>
        </div>

        {/* The Chemistry Link */}
        <div className="flex flex-col items-center -my-2 relative z-10">
          <div className={`w-1 h-8 ${chemistry < 0 ? 'bg-goal-red animate-pulse' : 'bg-tape-blue'} rounded-full`} />
          <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${chemistry < 0 ? 'bg-goal-red text-white' : 'bg-tape-blue text-white'}`}>
            {chemistry < 0 ? 'Chemistry Rift: High Tilt' : 'Synergy: Locked In'}
          </div>
          <div className={`w-1 h-8 ${chemistry < 0 ? 'bg-goal-red animate-pulse' : 'bg-tape-blue'} rounded-full`} />
        </div>

        {/* The Rookie - The Kid with Wheels */}
        <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-momentum-gold/20 rounded-lg text-momentum-gold">
              <Zap size={20} />
            </div>
            <div>
              <p className="font-bold text-white leading-tight">Leo 'Wheels' Rossi</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black">Sniper / Rookie</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-momentum-gold">78 OVR</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-3 bg-goal-red/10 border border-goal-red/20 rounded-lg flex gap-3">
        <AlertTriangle className="text-goal-red shrink-0" size={18} />
        <p className="text-[11px] text-zinc-300 leading-relaxed">
          <span className="font-bold text-white uppercase">Coach's Warning:</span> Sully is "Tilted." He's likely to freeze the rookie out of the power play. You need to fix this in the War Room before the next puck drop.
        </p>
      </div>
    </div>
  );
}
