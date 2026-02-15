import React, { useState, useEffect, useRef } from 'react';
import { Send, Zap } from 'lucide-react';
import { useUmpire } from './hooks/useUmpire';
import { talkToSully } from './services/sullyAI';
import LockerRoom from './LockerRoom';
import ScoutingDrill from './ScoutingDrill';
import MatchView from './components/MatchView';
import PressConference from './PressConference';
import TradeBlock from './components/TradeBlock';
import ScrapEngine from './components/ScrapEngine';

const TRUST = 65;
const SCOUT_LOW_CUTOFF = 12;

export default function App() {
  const { momentum, addMomentum } = useUmpire();
  const [messages, setMessages] = useState([
    { role: 'recruit', text: "Coach, I heard you're looking at that kid from the city league. If he's on the roster, I'm out. I don't play with plugs." }
  ]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'roster' | 'scouting' | 'match' | 'scrap' | 'press' | 'block'
  const [sullyHeat, setSullyHeat] = useState(60); // Tracks the beef
  const [scoutReport, setScoutReport] = useState('unknown'); // 'high' | 'low' | 'unknown'
  const [lastMatchEvents, setLastMatchEvents] = useState([]);
  const [powerPlayBuff, setPowerPlayBuff] = useState(false);
  const [pendingTradeConfrontation, setPendingTradeConfrontation] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const hasHydratedRef = useRef(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (hasHydratedRef.current) return;
    const saved = localStorage.getItem('BARDOWNSKI_STATE');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.messages)) {
          setMessages(parsed.messages);
        }
        if (typeof parsed.sullyHeat === 'number') {
          setSullyHeat(parsed.sullyHeat);
        }
        if (typeof parsed.momentum === 'number') {
          addMomentum(parsed.momentum);
        }
      } catch {
        // Ignore malformed local storage payloads
      }
    }
    hasHydratedRef.current = true;
  }, [addMomentum]);

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    const state = { messages, momentum, sullyHeat };
    localStorage.setItem('BARDOWNSKI_STATE', JSON.stringify(state));
  }, [messages, momentum, sullyHeat]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    if (pendingTradeConfrontation) {
      setMessages(prev => [
        ...prev,
        {
          role: 'recruit',
          text: "I heard you're shopping me to Delta City. You really think a bunch of draft picks are gonna anchor this defense? You're ten-ply, Coach.",
        },
      ]);
      setPendingTradeConfrontation(false);
      setIsThinking(false);
      return;
    }

    try {
      const nextMessages = [...messages, userMsg];
      const history = nextMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const sullyResponse = await talkToSully(history);
      setMessages(prev => [...prev, { role: 'recruit', text: sullyResponse }]);
      setSullyHeat(prev => Math.max(0, prev - 4));
    } catch {
      setMessages(prev => [...prev, {
        role: 'recruit',
        text: "Signal's dogshit in this arena, Coach. Try that again?"
      }]);
      setSullyHeat(prev => Math.min(100, prev + 6));
    } finally {
      setIsThinking(false);
    }
  };

  const handleScoutComplete = (taps) => {
    const momentumGain = Math.max(5, Math.min(30, Math.round(taps * 1.2)));
    const report = taps < SCOUT_LOW_CUTOFF ? 'low' : 'high';
    setScoutReport(report);
    addMomentum(momentumGain);
    setSullyHeat(prev => (report === 'high' ? Math.max(0, prev - 8) : Math.min(100, prev + 10)));
    setMessages(prev => [
      ...prev,
      {
        role: 'scout',
        text: `Scout Report: ${report.toUpperCase()} speed. ${taps} taps in 5s. Rookie pops +${momentumGain} swagger.`,
      },
    ]);
    setActiveTab('chat');
  };

  const handleMatchEnd = (result) => {
    const swaggerGain = Number(result?.swaggerGain) || 0;
    addMomentum(swaggerGain);
    setLastMatchEvents(result?.events ?? []);
    if (result?.usedPowerPlayBuff) {
      setPowerPlayBuff(false);
    }

    const triggeredScrap = result?.events?.some((event) => event.type === 'SCRAP_TRIGGER');
    if (triggeredScrap) {
      setActiveTab('scrap');
      return;
    }

    const sullyScored = result?.events?.some((event) => event.type === 'GOAL');
    const ignoredRookie = result?.events?.some((event) => event.type === 'TILT');
    if (sullyScored && ignoredRookie) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'recruit',
          text: "Sully: Told ya, Coach. I sniped it myself. Kid can keep his wheels, anchors finish.",
        },
      ]);
    }

    setActiveTab('press');
  };

  const handleScrapFinish = (playerWon) => {
    if (playerWon) {
      addMomentum(50);
      setPowerPlayBuff(true);
      setMessages((prev) => [
        ...prev,
        {
          role: 'scout',
          text: "Scrap result: Sully dropped him. +50 Swagger. Bench is buzzing and a Power Play buff is live for next shift.",
        },
      ]);
    } else {
      addMomentum(-30);
      setScoutReport('low');
      setMessages((prev) => [
        ...prev,
        {
          role: 'recruit',
          text: "You left me exposed, Coach. Where was my support when that goon jumped in? If you won't protect me, don't ask me to anchor this team.",
        },
      ]);
    }

    setActiveTab('chat');
  };

  const openTradeBlock = () => {
    if (activeTab !== 'block') {
      setMessages(prev => [
        ...prev,
        {
          role: 'scout',
          text: 'Receipt: Coach visited the Trade Block. Front office chatter is now live.',
        },
      ]);
      setPendingTradeConfrontation(true);
    }
    setActiveTab('block');
  };

  const handleTrade = (offer) => {
    setMessages(prev => [
      ...prev,
      {
        role: 'scout',
        text: `Trade call logged: ${offer.team} offered ${offer.return}.`,
      },
    ]);
    setPendingTradeConfrontation(true);
    setActiveTab('chat');
  };

  const lineup = {
    sully: { heat: sullyHeat, trust: TRUST },
    rookie: { scoutReport },
  };
  const chemistry = scoutReport === 'low' ? -20 : scoutReport === 'high' ? 25 : 0;
  const RECRUIT_DATA = {
    name: "Sully 'The Wall' Sullivan",
    role: "Enforcer / D-man",
    trust: TRUST,
    heat: sullyHeat,
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto min-h-screen h-[100dvh] bg-black text-white overflow-hidden border-x border-zinc-800 shadow-2xl">
      {/* Header with Navigation */}
      <header className="p-6 bg-zinc-950 border-b border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black italic tracking-tighter">BARDOWNSKI <span className="text-red-600">OS</span></h1>
          <div className="bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 text-[10px] font-bold text-orange-500">
            <Zap size={10} className="inline mr-1" /> {momentum}% SWAGGER
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-[0.12em] transition-all ${activeTab === 'chat' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
          >
            War Room
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-[0.12em] transition-all ${activeTab === 'roster' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
          >
            Locker Room
          </button>
          <button
            onClick={() => setActiveTab('scouting')}
            className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-[0.12em] transition-all ${activeTab === 'scouting' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
          >
            Scouting
          </button>
          <button
            onClick={() => setActiveTab('match')}
            className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-[0.12em] transition-all ${activeTab === 'match' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
          >
            Match
          </button>
          <button
            onClick={() => setActiveTab('press')}
            className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-[0.12em] transition-all ${activeTab === 'press' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
          >
            Press
          </button>
          <button
            onClick={openTradeBlock}
            className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-[0.12em] transition-all ${activeTab === 'block' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
          >
            Block
          </button>
        </div>
      </header>

      {/* Conditional Rendering */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'chat' ? (
          <div className="h-full min-h-0 flex flex-col p-3 sm:p-4">
            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-tape-blue text-white rounded-tr-none' : msg.role === 'scout' ? 'bg-zinc-800 text-orange-100 border border-orange-700/40 rounded-tl-none' : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none'}`}>
                    {msg.role === 'scout' && (
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-orange-400">
                        The Scout
                      </p>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </div>
        ) : activeTab === 'roster' ? (
          <LockerRoom
            sullyHeat={sullyHeat}
            trust={TRUST}
            momentum={momentum}
            scoutReport={scoutReport}
          />
        ) : activeTab === 'scouting' ? (
          <ScoutingDrill onComplete={handleScoutComplete} />
        ) : activeTab === 'match' ? (
          <MatchView
            lineup={lineup}
            momentum={momentum}
            chemistry={chemistry}
            powerPlayBuff={powerPlayBuff}
            onMatchEnd={handleMatchEnd}
          />
        ) : activeTab === 'scrap' ? (
          <ScrapEngine onFinish={handleScrapFinish} />
        ) : activeTab === 'block' ? (
          <TradeBlock
            sullyStats={RECRUIT_DATA}
            onTrade={(offer) => {
              console.log("TRADE EXECUTED:", offer);
              // Logic: Reset Sully, add new player, drop Swagger to 0
              handleTrade(offer);
              setActiveTab('chat');
            }}
          />
        ) : (
          <PressConference
            lastMatchEvents={lastMatchEvents}
            onFinish={() => setActiveTab('chat')}
          />
        )}
      </main>

      {/* Only show input in chat tab */}
      {activeTab === 'chat' && (
        <footer className="p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] bg-zinc-950 border-t border-zinc-800">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isThinking}
              placeholder="Talk to the recruit..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 px-5 text-sm focus:outline-none focus:border-tape-blue transition-colors pr-12"
            />
            <button
              onClick={handleSend}
              disabled={isThinking}
              className="absolute right-2 p-2 bg-tape-blue rounded-full text-white hover:bg-blue-500 transition-transform active:scale-95 disabled:opacity-50"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </footer>
      )}

      {import.meta.env.DEV && (
        <div className="pointer-events-none absolute left-2 top-2 z-50 rounded-md border border-emerald-400/40 bg-black/70 px-2 py-1 text-[10px] font-bold text-emerald-300 backdrop-blur">
          <span>LIVE</span>
          <span className="mx-1 text-zinc-500">|</span>
          <span>{window.location.hostname}</span>
          <span className="mx-1 text-zinc-500">|</span>
          <span>{viewport.width}x{viewport.height}</span>
        </div>
      )}
    </div>
  );
}
