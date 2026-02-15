import React, { useState } from 'react';
import { DollarSign, ArrowLeftRight, TrendingDown, Users } from 'lucide-react';

const OFFERS = [
  { id: 1, team: "Metropolis Maulers", return: "Veteran D-Man + 2nd Rd Pick", logic: "They need a physical anchor for a playoff run." },
  { id: 2, team: "Delta City Dragons", return: "Elite Rookie Winger (90 SPD)", logic: "Looking to dump salary and rebuild around youth." }
];

export default function TradeBlock({ sullyStats, onTrade }) {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const leverage = sullyStats?.heat > 65 ? "Low" : "Medium";
  const marketValue = sullyStats?.trust > 70 ? "Very High" : "High";

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6">
      <div className="mb-8">
        <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Asset Liquidation</h2>
        <h1 className="text-2xl font-black italic">TRADE <span className="text-tape-blue">BLOCK</span></h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold">Sully Sullivan</p>
          <span className="bg-goal-red/20 text-goal-red px-2 py-0.5 rounded text-[10px] font-black uppercase">Status: Volatile</span>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 text-center py-2 bg-black/40 rounded border border-zinc-800">
            <p className="text-[8px] text-zinc-500 font-black uppercase flex items-center justify-center gap-1">
              <Users size={10} />
              Market Value
            </p>
            <p className="text-lg font-black text-momentum-gold">{marketValue}</p>
          </div>
          <div className="flex-1 text-center py-2 bg-black/40 rounded border border-zinc-800">
            <p className="text-[8px] text-zinc-500 font-black uppercase flex items-center justify-center gap-1">
              <TrendingDown size={10} />
              Leverage
            </p>
            <p className="text-lg font-black text-goal-red">{leverage}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {OFFERS.map(offer => (
          <div
            key={offer.id}
            onClick={() => setSelectedOffer(offer)}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedOffer?.id === offer.id ? 'border-tape-blue bg-tape-blue/5' : 'border-zinc-800 bg-zinc-900/50'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-sm text-white uppercase italic">{offer.team}</h3>
              <ArrowLeftRight size={14} className="text-zinc-600" />
            </div>
            <p className="text-xs font-bold text-tape-blue mb-2">{offer.return}</p>
            <p className="text-[10px] text-zinc-500 leading-tight italic">"{offer.logic}"</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => selectedOffer && onTrade?.(selectedOffer)}
        disabled={!selectedOffer}
        className={`mt-6 w-full py-4 rounded-xl font-black uppercase italic flex items-center justify-center gap-2 transition-all
          ${selectedOffer ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
      >
        <DollarSign size={18} /> Pull the Trigger
      </button>
    </div>
  );
}
