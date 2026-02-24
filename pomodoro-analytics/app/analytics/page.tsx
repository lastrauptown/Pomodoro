'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, BarChart3, Clock, Coffee, Sun, CloudSun, Moon } from 'lucide-react';
import clsx from 'clsx';

type WeeklyPoint = {
  day: string;
  sessions: number;
  dominantPeriod?: 'MORNING' | 'AFTERNOON' | 'EVENING' | null;
};

type Periods = {
  morning: number;
  afternoon: number;
  evening: number;
};

export default function AnalyticsPage() {
  const [weeklyData, setWeeklyData] = useState<WeeklyPoint[]>([]);
  const [periods, setPeriods] = useState<Periods | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/analytics-summary');
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            setError('Please log in or sign up to view analytics.');
          } else {
            setError(data.error || 'Failed to load analytics');
          }
          return;
        }
        setWeeklyData(data.weekly || []);
        setPeriods(data.periods || null);
      } catch {
        setError('Network error while loading analytics');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const fixedPeriods =
    periods === null
      ? []
      : [
          { period: 'MORNING', sessions: periods.morning, icon: <Sun size={16} /> },
          { period: 'AFTERNOON', sessions: periods.afternoon, icon: <CloudSun size={16} /> },
          { period: 'EVENING', sessions: periods.evening, icon: <Moon size={16} /> },
        ];

  const max =
    fixedPeriods.length === 0 ? 0 : Math.max(...fixedPeriods.map((p) => p.sessions));
  const min =
    fixedPeriods.length === 0 ? 0 : Math.min(...fixedPeriods.map((p) => p.sessions));

  const productivityLevels =
    fixedPeriods.length === 0
      ? []
      : fixedPeriods.map((p) => {
          let label = 'Medium';
          if (p.sessions === max) label = 'High';
          else if (p.sessions === min) label = 'Low';
          return { ...p, label };
        });

  const periodColors: Record<string, string> = {
    MORNING: 'bg-yellow-100 text-yellow-900',
    AFTERNOON: 'bg-sky-100 text-sky-900',
    EVENING: 'bg-purple-100 text-purple-900',
  };

  const barColors: Record<string, string> = {
    MORNING: '#FACC15',
    AFTERNOON: '#38BDF8',
    EVENING: '#A855F7',
    DEFAULT: '#BF4646',
  };

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-stone-200 p-6 flex flex-col gap-6 bg-white">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="text-stone-900" /> Pomodoro AI
        </h1>
        <nav className="flex flex-col gap-2">
          <NavItem href="/" icon={<Brain size={20} />} label="Dashboard" />
          <NavItem href="/analytics" icon={<BarChart3 size={20} />} label="Analytics" active />
          <NavItem href="/session-summary" icon={<Clock size={20} />} label="Session Summary" />
          <NavItem href="/ai" icon={<Coffee size={20} />} label="AI Tips" />
          <NavItem href="/profile" icon={<Brain size={20} />} label="My Profile" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 flex flex-col gap-12">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Pomodoro Sessions This Week</h2>
          {loading && <p className="text-stone-500 text-sm">Loading analytics…</p>}
          {!loading && error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}
          {!loading && !error && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="sessions">
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={entry.day}
                      fill={
                        barColors[entry.dominantPeriod || 'DEFAULT'] ?? barColors.DEFAULT
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow flex flex-col gap-2">
          {productivityLevels.length === 0 ? (
            <p className="text-sm text-stone-500">
              No sessions in the last 7 days yet. Use the timer on the dashboard to start
              recording data.
            </p>
          ) : (
            productivityLevels.map((p) => (
              <p
                key={p.period}
                className={clsx(
                  'flex items-center gap-2 px-2 py-1 rounded font-medium w-max',
                  periodColors[p.period] || 'bg-stone-100 text-stone-800',
                )}
              >
                {p.icon} <strong>{p.period}:</strong> {p.label} Productivity
              </p>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

// NavItem component copied from dashboard
function NavItem({ href, icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full',
        active
          ? 'bg-stone-100 text-stone-900 font-semibold'
          : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
      )}
    >
      {icon} <span>{label}</span>
    </Link>
  );
}
