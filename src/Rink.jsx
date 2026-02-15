import React, { useRef, useEffect, useState } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function Rink({ rookieSpeed = 50, chemistry = 0, onGoal, onCellyTrigger }) {
  const canvasRef = useRef(null);
  const puckRef = useRef({ x: 200, y: 300, vx: 0, vy: 0 });
  const rafRef = useRef(0);
  const shakeFramesRef = useRef(0);
  const audioCtxRef = useRef(null);
  const [swipeStart, setSwipeStart] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const speedFactor = clamp(rookieSpeed, 0, 100) / 100;
    const chemistryFactor = clamp(chemistry, -100, 100) / 100;

    const playPing = () => {
      if (typeof window === 'undefined') return;
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextCtor();
      }
      const ctxAudio = audioCtxRef.current;
      const now = ctxAudio.currentTime;
      const osc = ctxAudio.createOscillator();
      const gain = ctxAudio.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1720, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.12);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctxAudio.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    };

    const loop = () => {
      const puck = puckRef.current;
      const friction = 0.985 + speedFactor * 0.005; // Faster rookies carry speed better

      let nextX = puck.x + puck.vx;
      let nextY = puck.y + puck.vy;
      let newVx = puck.vx * friction;
      let newVy = puck.vy * friction;

      // Wall collisions
      if (nextX < 20 || nextX > 380) {
        newVx *= -0.8;
        nextX = clamp(nextX, 20, 380);
      }
      if (nextY < 20 || nextY > 580) {
        newVy *= -0.8;
        nextY = clamp(nextY, 20, 580);
      }

      // Bardown logic (crossbar/goal window)
      if (nextY <= 60 && nextX > 125 && nextX < 275) {
        const speedMagnitude = Math.hypot(newVx, newVy);
        const impactThreshold = 6.2 - chemistryFactor * 0.6;
        if (speedMagnitude > impactThreshold) {
          shakeFramesRef.current = 14;
          playPing();
          onGoal?.("BARDOWNSKI");
          onCellyTrigger?.("BARDOWNSKI");
          nextX = 200;
          nextY = 300;
          newVx = 0;
          newVy = 0;
        }
      }

      puckRef.current = { x: nextX, y: nextY, vx: newVx, vy: newVy };

      // Render
      ctx.save();
      if (shakeFramesRef.current > 0) {
        const intensity = 0.9 + shakeFramesRef.current * 0.2;
        ctx.translate(
          (Math.random() * 2 - 1) * intensity,
          (Math.random() * 2 - 1) * intensity
        );
        shakeFramesRef.current -= 1;
      }
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, 400, 600);

      // Crease/goal box
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(125, 0, 150, 60);

      // Puck
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#0070f3';
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(nextX, nextY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rookieSpeed, chemistry, onGoal, onCellyTrigger]);

  const handlePointerDown = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSwipeStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePointerUp = (e) => {
    if (!swipeStart) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    // Multiplier from '06 Wheels (Scouting Drill)
    const rookieWheelsMult = 1 + (rookieSpeed / 100);

    // Sully Jitter (Chemistry Rift)
    const sullyJitter = chemistry < 0 ? (Math.random() - 0.5) * 0.2 : 0;
    const power = 0.15 * rookieWheelsMult;

    puckRef.current = {
      ...puckRef.current,
      vx: ((endX - swipeStart.x) * power) + sullyJitter,
      vy: ((endY - swipeStart.y) * power) + sullyJitter,
    };
    setSwipeStart(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={600}
      className="w-full h-full touch-none bg-black border-4 border-zinc-900 rounded-3xl"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setSwipeStart(null)}
    />
  );
}
