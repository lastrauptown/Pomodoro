'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTimerStore, TimerMode } from '@/lib/store/timerStore';
import { Play, Pause, Square, Coffee, Brain, BarChart3, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function Home() {
  const router = useRouter();
  const { mode, timeLeft, isRunning, alarmOn, setMode, startTimer, pauseTimer, resetTimer, tick, stopAlarm } =
    useTimerStore();
  const workerRef = useRef<Worker | null>(null);
  const bellIntervalRef = useRef<number | null>(null);
  const primedAudioRef = useRef<AudioContext | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    workerRef.current = new Worker('/timer.worker.js');
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'TICK') tick();
    };
    return () => workerRef.current?.terminate();
  }, [tick]);

  // Send commands to Worker
  useEffect(() => {
    if (isRunning) workerRef.current?.postMessage({ command: 'START' });
    else workerRef.current?.postMessage({ command: 'PAUSE' });
  }, [isRunning]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;

    // One-shot bell chime
    const playBell = (ctx: AudioContext) => {
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.01); // quick attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2); // ring out
      gain.connect(ctx.destination);

      const makePartial = (freq: number, detune: number, type: OscillatorType = 'sine', weight = 1) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (typeof osc.detune !== 'undefined') {
          osc.detune.setValueAtTime(detune, now);
        }
        const partGain = ctx.createGain();
        partGain.gain.setValueAtTime(weight, now);
        osc.connect(partGain);
        partGain.connect(gain);
        osc.start(now);
        osc.stop(now + 1.3);
      };

      // Bell-ish spectrum (fundamental + inharmonic overtones)
      makePartial(880, -6, 'sine', 1);
      makePartial(1320, 3, 'sine', 0.7);
      makePartial(1760, 0, 'sine', 0.5);
      makePartial(1100, -10, 'triangle', 0.4);
      makePartial(2350, 0, 'sine', 0.25);
    };

    if (alarmOn) {
      const ctx = primedAudioRef.current ?? new AudioCtx();
      primedAudioRef.current = ctx;
      try {
        // @ts-ignore
        if (typeof ctx.resume === 'function') ctx.resume();
      } catch {}
      // Play immediately and then repeat periodically
      playBell(ctx);
      if (bellIntervalRef.current == null) {
        bellIntervalRef.current = window.setInterval(() => playBell(ctx), 1200);
      }
    } else {
      if (bellIntervalRef.current != null) {
        window.clearInterval(bellIntervalRef.current);
        bellIntervalRef.current = null;
      }
    }

    return () => {
      if (bellIntervalRef.current != null) {
        window.clearInterval(bellIntervalRef.current);
        bellIntervalRef.current = null;
      }
    };
  }, [alarmOn]);

  // Format Time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-stone-200 p-6 flex flex-col gap-6 bg-white">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="text-stone-900" /> Pomodoro AI
        </h1>
        <nav className="flex flex-col gap-2">
          <NavItem href="/" icon={<Brain size={20} />} label="Dashboard" active />
          <NavItem href="/analytics" icon={<BarChart3 size={20} />} label="Analytics" requiresAuth router={router} />
          <NavItem href="/session-summary" icon={<Clock size={20} />} label="Session Summary" requiresAuth router={router} />
          <NavItem href="/ai" icon={<Coffee size={20} />} label="AI Tips" requiresAuth router={router} />
          <NavItem href="/profile" icon={<Brain size={20} />} label="My Profile" requiresAuth router={router} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-12">
        {/* Timer Display */}
        <div className="text-center mb-12 relative">
           {/* Visual Ring (Simple CSS for now) */}
          <div className="text-[12rem] font-light leading-none tracking-tighter tabular-nums text-stone-900">
            {formatTime(timeLeft)}
          </div>
          <p className="text-xl text-stone-500 uppercase tracking-widest mt-4 font-medium">
            {mode === 'work' ? 'Focus Session' : 'Break Time'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-6 items-center">
          {!isRunning ? (
            <button 
              onClick={() => {
                // Prime audio on user gesture
                if (typeof window !== 'undefined') {
                  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                  if (!primedAudioRef.current) {
                    primedAudioRef.current = new AudioCtx();
                  }
                  try {
                    // @ts-ignore
                    primedAudioRef.current.resume?.();
                  } catch {}
                }
                startTimer();
              }}
              className="flex items-center gap-3 px-10 py-5 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-all shadow-xl hover:shadow-2xl text-xl font-medium"
            >
              <Play fill="currentColor" size={24} /> Start Timer
            </button>
          ) : (
            <button 
              onClick={pauseTimer}
              className="flex items-center gap-3 px-10 py-5 bg-amber-100 text-amber-900 rounded-2xl hover:bg-amber-200 transition-all shadow-lg text-xl font-medium"
            >
              <Pause fill="currentColor" size={24} /> Pause
            </button>
          )}

          <button 
            onClick={resetTimer}
            className="p-5 rounded-2xl border-2 border-stone-200 hover:bg-stone-100 text-stone-400 hover:text-red-500 transition-colors"
            title="Reset Timer"
          >
            <Square size={24} fill="currentColor" />
          </button>
          {alarmOn && (
            <button
              onClick={stopAlarm}
              className="px-6 py-3 rounded-2xl bg-red-100 text-red-900 font-medium border border-red-200 hover:bg-red-200 transition-colors"
            >
              Stop Ringing
            </button>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="mt-16 flex gap-2 bg-stone-100 p-2 rounded-full">
          <ModeButton active={mode === 'work'} onClick={() => setMode('work')}>Work</ModeButton>
          <ModeButton active={mode === 'short-break'} onClick={() => setMode('short-break')}>Short Break</ModeButton>
          <ModeButton active={mode === 'long-break'} onClick={() => setMode('long-break')}>Long Break</ModeButton>
        </div>
      </main>
    </div>
  );
}

// Components
async function handleProtectedNav(e: React.MouseEvent, href: string, router: ReturnType<typeof useRouter>) {
  try {
    e.preventDefault();
    const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
    const data = await res.json();
    if (data?.user) router.push(href);
    else router.push(`/login?from=${encodeURIComponent(href)}`);
  } catch {
    router.push(`/login?from=${encodeURIComponent(href)}`);
  }
}

function NavItem({
  href,
  icon,
  label,
  active,
  requiresAuth,
  router,
}: {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
  requiresAuth?: boolean;
  router?: ReturnType<typeof useRouter>;
}) {
  const classes = clsx(
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full",
    active ? "bg-stone-100 text-stone-900 font-semibold" : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
  );

  if (requiresAuth && router) {
    return (
      <button
        type="button"
        onClick={(e) => { void handleProtectedNav(e as any, href, router); }}
        className={classes}
      >
        {icon} <span>{label}</span>
      </button>
    );
  }

  return (
    <Link href={href} prefetch={false} className={classes}>
      {icon} <span>{label}</span>
    </Link>
  );
}

function ModeButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={clsx(
        "px-6 py-2 rounded-full font-medium transition-all text-sm",
        active ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"
      )}
    >
      {children}
    </button>
  );
}
