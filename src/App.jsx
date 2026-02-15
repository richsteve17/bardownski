import React, { useState, useEffect, useRef } from 'react';
import { Send, Zap } from 'lucide-react';
import { useUmpire } from './hooks/useUmpire';
import { talkToSully } from './services/sullyAI';
import { judgePressResponse } from './pressAI';
import LockerRoom from './LockerRoom';
import ScoutingDrill from './ScoutingDrill';
import MatchView from './components/MatchView';
import PressConference from './PressConference';
import TradeBlock from './components/TradeBlock';
import ScrapEngine from './components/ScrapEngine';
import Rink from './Rink';

const TRUST = 65;
const SCOUT_LOW_CUTOFF = 12;
const MIN_SHIFTS_PER_PERIOD = 5;
const MAX_SHIFTS_PER_PERIOD = 12;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const rollShiftsForPeriod = (period, flowScore) => {
  const baseByPeriod = period === 1 ? 8 : period === 2 ? 9 : 10;
  const flowModifier = flowScore > 35 ? 2 : flowScore > 10 ? 1 : flowScore < -20 ? -1 : 0;
  const variance = Math.floor(Math.random() * 4) - 1; // -1 to +2
  return clamp(baseByPeriod + flowModifier + variance, MIN_SHIFTS_PER_PERIOD, MAX_SHIFTS_PER_PERIOD);
};

export default function App() {
  const { momentum, addMomentum, setMomentumValue } = useUmpire();
  const [messages, setMessages] = useState([
    { role: 'recruit', text: "Coach, I heard you're looking at that kid from the city league. If he's on the roster, I'm out. I don't play with plugs." }
  ]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'roster' | 'scouting' | 'rink' | 'match' | 'scrap' | 'press' | 'block'
  const [sullyHeat, setSullyHeat] = useState(60); // Tracks the beef
  const [sullyTrust, setSullyTrust] = useState(TRUST);
  const [scoutReport, setScoutReport] = useState('unknown'); // 'high' | 'low' | 'unknown'
  const [rookieTaps, setRookieTaps] = useState(26);
  const [lastMatchEvents, setLastMatchEvents] = useState([]);
  const [powerPlayBuff, setPowerPlayBuff] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(1);
  const [shiftsRemaining, setShiftsRemaining] = useState(0);
  const [shiftsThisPeriod, setShiftsThisPeriod] = useState(0);
  const [teamScore, setTeamScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [matchFinal, setMatchFinal] = useState(false);
  const [pendingTradeConfrontation, setPendingTradeConfrontation] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const hasHydratedRef = useRef(false);
  const scrollRef = useRef(null);
  const chemistry = scoutReport === 'low' ? -20 : scoutReport === 'high' ? 25 : 0;

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
    if (activeTab !== 'match' || matchFinal || shiftsRemaining > 0) return;
    const flowScore = momentum + chemistry - sullyHeat * 0.6;
    const rolledShifts = rollShiftsForPeriod(currentPeriod, flowScore);
    setShiftsThisPeriod(rolledShifts);
    setShiftsRemaining(rolledShifts);
    setMessages((prev) => [
      ...prev,
      {
        role: 'scout',
        text: `Period ${currentPeriod} opens: ${rolledShifts} shifts scheduled based on game flow.`,
      },
    ]);
  }, [activeTab, matchFinal, shiftsRemaining, currentPeriod, momentum, chemistry, sullyHeat]);

  useEffect(() => {
    if (hasHydratedRef.current) return;
    const saved = localStorage.getItem('BARDOWNSKI_STATE');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.momentum === 'number') {
          setMomentumValue(parsed.momentum);
        }
        if (Array.isArray(parsed.messages)) {
          setMessages(parsed.messages);
        }
        if (typeof parsed.sullyHeat === 'number') {
          setSullyHeat(parsed.sullyHeat);
        }
        if (typeof parsed.sullyTrust === 'number') {
          setSullyTrust(parsed.sullyTrust);
        }
        if (typeof parsed.currentPeriod === 'number') {
          setCurrentPeriod(parsed.currentPeriod);
        }
        if (typeof parsed.shiftsRemaining === 'number') {
          setShiftsRemaining(parsed.shiftsRemaining);
        }
        if (typeof parsed.shiftsThisPeriod === 'number') {
          setShiftsThisPeriod(parsed.shiftsThisPeriod);
        }
        if (typeof parsed.teamScore === 'number') {
          setTeamScore(parsed.teamScore);
        }
        if (typeof parsed.opponentScore === 'number') {
          setOpponentScore(parsed.opponentScore);
        }
        if (typeof parsed.matchFinal === 'boolean') {
          setMatchFinal(parsed.matchFinal);
        }
        if (typeof parsed.scoutReport === 'string') {
          setScoutReport(parsed.scoutReport);
        }
        if (typeof parsed.powerPlayBuff === 'boolean') {
          setPowerPlayBuff(parsed.powerPlayBuff);
        }
        if (typeof parsed.pendingTradeConfrontation === 'boolean') {
          setPendingTradeConfrontation(parsed.pendingTradeConfrontation);
        }
        if (typeof parsed.rookieTaps === 'number') {
          setRookieTaps(parsed.rookieTaps);
        }
        if (Array.isArray(parsed.lastMatchEvents)) {
          setLastMatchEvents(parsed.lastMatchEvents);
        }
      } catch {
        // Ignore malformed local storage payloads
      }
    }
    hasHydratedRef.current = true;
  }, [setMomentumValue]);

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    const state = {
      messages,
      momentum,
      sullyHeat,
      sullyTrust,
      scoutReport,
      rookieTaps,
      powerPlayBuff,
      pendingTradeConfrontation,
      lastMatchEvents,
      currentPeriod,
      shiftsRemaining,
      shiftsThisPeriod,
      teamScore,
      opponentScore,
      matchFinal,
    };
    localStorage.setItem('BARDOWNSKI_STATE', JSON.stringify(state));
  }, [messages, momentum, sullyHeat, sullyTrust, scoutReport, rookieTaps, powerPlayBuff, pendingTradeConfrontation, lastMatchEvents, currentPeriod, shiftsRemaining, shiftsThisPeriod, teamScore, opponentScore, matchFinal]);

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
    setRookieTaps(taps);
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
    const teamGoalsThisShift = Number(result?.shiftScore) || 0;
    const opponentGoalsThisShift = Number(result?.opponentScoreGain) || 0;
    const projectedTeamScore = teamScore + teamGoalsThisShift;
    const projectedOpponentScore = opponentScore + opponentGoalsThisShift;

    addMomentum(swaggerGain);
    setLastMatchEvents(result?.events ?? []);
    if (teamGoalsThisShift > 0) {
      setTeamScore((prev) => prev + teamGoalsThisShift);
    }
    if (opponentGoalsThisShift > 0) {
      setOpponentScore((prev) => prev + opponentGoalsThisShift);
    }
    if (result?.usedPowerPlayBuff) {
      setPowerPlayBuff(false);
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

    const nextShifts = Math.max(0, shiftsRemaining - 1);
    setShiftsRemaining(nextShifts);

    const periodEnded = nextShifts === 0;
    const finalReached = periodEnded && currentPeriod >= 3;

    if (periodEnded) {
      if (finalReached) {
        setMatchFinal(true);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: 'scout',
            text: `Final horn: Bardownski ${projectedTeamScore} - ${projectedOpponentScore}.`,
          },
        ]);
        setActiveTab('press');
      } else {
        setCurrentPeriod((prevPeriod) => prevPeriod + 1);
        setShiftsThisPeriod(0);
      }
    }

    const triggeredScrap = result?.events?.some((event) => event.type === 'SCRAP_TRIGGER');
    if (triggeredScrap && !finalReached) {
      setActiveTab('scrap');
    }
  };

  const handleScrapFinish = (playerWon) => {
    if (playerWon) {
      addMomentum(50);
      setSullyTrust((prev) => Math.min(100, prev + 10));
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
          text: "You left me exposed, Coach. If you won't protect your anchor in a scrap, don't ask me to carry this blue line.",
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

  const handlePressFinish = async (payload) => {
    const finalQuestion = payload?.finalQuestion || "";
    const finalAnswer = payload?.finalAnswer || "";

    const mods = await judgePressResponse(finalQuestion, finalAnswer, {
      sullyHeat,
      rookieTaps,
    });

    addMomentum(mods.swaggerMod);
    setSullyTrust((prev) => clamp(prev + mods.trustMod, 0, 100));
    setMessages((prev) => [
      ...prev,
      {
        role: 'scout',
        text: `Press grade: Swagger ${mods.swaggerMod >= 0 ? '+' : ''}${mods.swaggerMod}, Trust ${mods.trustMod >= 0 ? '+' : ''}${mods.trustMod}.`,
      },
    ]);
    setActiveTab('chat');
  };

  const lineup = {
    sully: { heat: sullyHeat, trust: sullyTrust },
    rookie: { scoutReport },
  };
  const RECRUIT_DATA = {
    name: "Sully 'The Wall' Sullivan",
    role: "Enforcer / D-man",
    trust: sullyTrust,
    heat: sullyHeat,
  };
  const navTabs = [
    { id: 'chat', label: 'War Room' },
    { id: 'roster', label: 'Locker Room' },
    { id: 'scouting', label: 'Scouting' },
    { id: 'rink', label: 'Rink' },
    { id: 'match', label: 'Match' },
    { id: 'press', label: 'Press' },
    { id: 'block', label: 'Block' },
  ];
  const shiftStatus = matchFinal ? 'Final' : `${shiftsRemaining}/${Math.max(shiftsThisPeriod, 0)}`;
  const momentumColor = momentum >= 20 ? 'text-emerald-400' : momentum <= -20 ? 'text-red-400' : 'text-orange-400';
  const heatColor = sullyHeat >= 65 ? 'text-red-400' : sullyHeat >= 45 ? 'text-orange-400' : 'text-emerald-400';

  return (
    <div className="flex flex-col w-full max-w-md mx-auto min-h-screen h-[100dvh] bg-black text-white overflow-hidden border-x border-zinc-800 shadow-2xl">
      {/* Header with Navigation */}
      <header className="p-4 bg-zinc-950 border-b border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black italic tracking-tighter">BARDOWNSKI <span className="text-red-600">OS</span></h1>
          <div className="bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 text-[10px] font-bold text-orange-500">
            <Zap size={10} className="inline mr-1" /> {momentum}% SWAGGER
          </div>
        </div>

        {/* Compact Mobile Nav */}
        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => (tab.id === 'block' ? openTradeBlock() : setActiveTab(tab.id))}
                className={`px-3 py-2 rounded-md text-[10px] font-black uppercase tracking-[0.12em] transition-all ${
                  activeTab === tab.id ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Unified Status Strip */}
      <div className="border-b border-zinc-800 bg-zinc-900/60 px-3 py-2">
        <div className="grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-wider sm:grid-cols-6">
          <p className="text-zinc-400">Score <span className="text-white">{teamScore}-{opponentScore}</span></p>
          <p className="text-zinc-400">Period <span className="text-white">{matchFinal ? 'Final' : currentPeriod}</span></p>
          <p className="text-zinc-400">Shifts <span className="text-white">{shiftStatus}</span></p>
          <p className="text-zinc-400">Swag <span className={momentumColor}>{momentum}</span></p>
          <p className="text-zinc-400">Heat <span className={heatColor}>{sullyHeat}</span></p>
          <p className="text-zinc-400">Trust <span className="text-blue-400">{sullyTrust}</span></p>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
          <span className={`rounded px-2 py-0.5 ${chemistry < 0 ? 'bg-red-500/20 text-red-300' : chemistry > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'}`}>
            Chemistry {chemistry}
          </span>
          {powerPlayBuff && (
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
              Power Play Buff
            </span>
          )}
        </div>
      </div>

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
            trust={sullyTrust}
            momentum={momentum}
            scoutReport={scoutReport}
            powerPlayBuff={powerPlayBuff}
          />
        ) : activeTab === 'scouting' ? (
          <ScoutingDrill onComplete={handleScoutComplete} />
        ) : activeTab === 'rink' ? (
          <div className="flex-1 p-4 flex flex-col items-center justify-center">
            <Rink
              rookieSpeed={clamp(rookieTaps || 26, 0, 100)}
              chemistry={chemistry}
              onGoal={() => {
                addMomentum(50);
                setTeamScore(prev => prev + 1);
                setMessages((prev) => [
                  ...prev,
                  {
                    role: 'scout',
                    text: 'BARDOWNSKI! Coach sniped one. Momentum surging.',
                  },
                ]);
                setActiveTab('chat');
              }}
            />
            <p className="mt-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Swipe to Snipe • Aim for the Top Cheese
            </p>
          </div>
        ) : activeTab === 'match' ? (
          <MatchView
            lineup={lineup}
            momentum={momentum}
            chemistry={chemistry}
            powerPlayBuff={powerPlayBuff}
            period={currentPeriod}
            shiftsRemaining={shiftsRemaining}
            shiftsThisPeriod={shiftsThisPeriod}
            homeScore={teamScore}
            awayScore={opponentScore}
            isFinal={matchFinal}
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
            stats={{ sullyHeat, rookieTaps }}
            onFinish={handlePressFinish}
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
