import React, { useMemo, useState } from 'react';
import { Mic, Newspaper, TrendingUp, TrendingDown } from 'lucide-react';

export default function PressConference({ lastMatchEvents, stats, onFinish }) {
  const [response, setResponse] = useState("");
  const [answers, setAnswers] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const events = Array.isArray(lastMatchEvents) ? lastMatchEvents : [];
  const hadGoal = events.some((event) => event.type === 'GOAL');
  const hadTilt = events.some((event) => event.type === 'TILT');
  const trend = hadGoal && !hadTilt ? 'up' : hadTilt ? 'down' : 'flat';

  const questions = useMemo(() => ([
    {
      reporter: "Gritty Greg (Local Beat)",
      text: "Coach, Sully looked 'tilted' out there tonight. Is the veteran's ego becoming a liability for this roster?",
    },
    {
      reporter: "Analytics Alice (The Athletic)",
      text: `You hyped up the Rookie's '06 wheels, but he only managed ${stats?.rookieTaps ?? 0} taps in the scouting drill. Was that a scout error, or are you just selling wolf tickets?`,
    },
  ]), [stats?.rookieTaps]);

  const handleAnswer = async () => {
    const cleanResponse = response.trim();
    if (!cleanResponse || isSubmitting) return;

    const currentQuestion = questions[questionIndex];
    const nextAnswers = [
      ...answers,
      {
        reporter: currentQuestion.reporter,
        question: currentQuestion.text,
        answer: cleanResponse,
      },
    ];

    if (questionIndex < questions.length - 1) {
      setAnswers(nextAnswers);
      setQuestionIndex((prev) => prev + 1);
      setResponse("");
      return;
    }

    setIsSubmitting(true);
    try {
      await onFinish?.({
        answers: nextAnswers,
        finalQuestion: currentQuestion.text,
        finalAnswer: cleanResponse,
      });
      setAnswers([]);
      setQuestionIndex(0);
      setResponse("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6">
      <div className="flex items-center gap-2 mb-8 text-zinc-500">
        <Newspaper size={18} />
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Post-Game Press</h2>
      </div>

      <div className="bg-white text-black p-6 rounded-2xl mb-8 relative">
        <div className="absolute -top-3 left-6 bg-zinc-900 text-white text-[8px] font-black px-2 py-1 rounded">
          {questions[questionIndex].reporter}
        </div>
        <p className="font-bold italic text-sm">"{questions[questionIndex].text}"</p>
      </div>

      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-300 flex items-center justify-between">
        <span className="font-bold uppercase tracking-wider text-zinc-400">Media Pulse</span>
        <span className="flex items-center gap-1 font-black uppercase">
          {trend === 'up' ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-goal-red" />}
          {trend === 'up' ? 'Positive' : trend === 'down' ? 'Hostile' : 'Neutral'}
        </span>
      </div>

      <div className="flex-1">
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Give them a quote, Coach..."
          className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm outline-none focus:border-white transition-all resize-none"
        />
      </div>

      <button
        onClick={handleAnswer}
        disabled={isSubmitting || !response.trim()}
        className="mt-6 w-full py-4 bg-goal-red text-white font-black uppercase italic rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Mic size={18} />
        {isSubmitting ? "TRANSMITTING..." : questionIndex < questions.length - 1 ? "Next Question" : "Exit Podium"}
      </button>
    </div>
  );
}
