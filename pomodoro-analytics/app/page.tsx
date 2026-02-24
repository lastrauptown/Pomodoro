'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTimerStore, TimerMode } from '@/lib/store/timerStore';
import { Play, Pause, Square, Coffee, Brain, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

export default function Home() {
  const { mode, timeLeft, isRunning, alarmOn, setMode, startTimer, pauseTimer, resetTimer, tick, stopAlarm } =
    useTimerStore();
  const workerRef = useRef<Worker | null>(null);
  const alarmRef = useRef<{ ctx: AudioContext; osc: OscillatorNode } | null>(null);

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

    if (alarmOn) {
      if (!alarmRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.value = 0.05;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        alarmRef.current = { ctx, osc };
      }
    } else {
      if (alarmRef.current) {
        alarmRef.current.osc.stop();
        alarmRef.current.ctx.close();
        alarmRef.current = null;
      }
    }

    return () => {
      if (alarmRef.current) {
        alarmRef.current.osc.stop();
        alarmRef.current.ctx.close();
        alarmRef.current = null;
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
          <NavItem href="/analytics" icon={<BarChart3 size={20} />} label="Analytics" />
          <NavItem href="/session-summary" icon={<Square size={20} />} label="Session Summary" />
          <NavItem href="/ai" icon={<Coffee size={20} />} label="AI Tips" />
          <NavItem href="/profile" icon={<Brain size={20} />} label="My Profile" />
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
              onClick={startTimer}
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
function NavItem({ href, icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full",
        active ? "bg-stone-100 text-stone-900 font-semibold" : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
      )}
    >
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
