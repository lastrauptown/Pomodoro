'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Brain, BarChart3, Coffee, Clock } from 'lucide-react';
import clsx from 'clsx';

type UserSettings = {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  bestFocusTime: string | null;
  interruptionTrend: string | null;
};

type MeResponse =
  | {
      user: {
        id: number;
        email: string;
        name: string | null;
        settings: UserSettings | null;
      } | null;
    }
  | { user: null };

export default function ProfilePage() {
  const [me, setMe] = useState<MeResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/auth/me');
        const data = (await res.json()) as MeResponse;
        if (data.user) {
          setMe(data.user);
          const settings = data.user.settings;
          if (settings) {
            setWorkDuration(settings.workDuration);
            setShortBreakDuration(settings.shortBreakDuration);
            setLongBreakDuration(settings.longBreakDuration);
          }
        } else {
          setMe(null);
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;
    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/profile/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workDuration,
          shortBreakDuration,
          longBreakDuration,
        }),
      });
      if (!res.ok) {
        setError('Failed to save settings');
      }
    } catch {
      setError('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-500 text-sm">Loading profile…</p>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="bg-white rounded-2xl shadow p-8 space-y-4 text-center">
          <p className="text-stone-700 text-sm">You are not logged in.</p>
          <Link
            href="/login"
            className="inline-block px-4 py-2 rounded-md bg-stone-900 text-white text-sm font-semibold"
          >
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans">
      <aside className="w-64 border-r border-stone-200 p-6 flex flex-col gap-6 bg-white">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="text-stone-900" /> Pomodoro AI
        </h1>
        <nav className="flex flex-col gap-2">
          <NavItem href="/" icon={<Brain size={20} />} label="Dashboard" />
          <NavItem href="/analytics" icon={<BarChart3 size={20} />} label="Analytics" />
          <NavItem href="/session-summary" icon={<Clock size={20} />} label="Session Summary" />
          <NavItem href="/ai" icon={<Coffee size={20} />} label="AI Tips" />
          <NavItem href="/profile" icon={<Brain size={20} />} label="My Profile" active />
        </nav>
      </aside>

      <main className="flex-1 p-12 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Profile</h2>
            <p className="text-sm text-stone-500">{me.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-md border border-stone-300 text-sm text-stone-700 hover:bg-stone-100"
          >
            Log out
          </button>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-6 space-y-6 max-w-lg">
          <h3 className="text-lg font-semibold">Timer defaults</h3>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-stone-600">Work (minutes)</label>
              <input
                type="number"
                min={1}
                value={workDuration}
                onChange={(e) => setWorkDuration(Number(e.target.value))}
                className="w-full rounded-md border border-stone-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-stone-600">Short break</label>
              <input
                type="number"
                min={1}
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                className="w-full rounded-md border border-stone-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-stone-600">Long break</label>
              <input
                type="number"
                min={1}
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                className="w-full rounded-md border border-stone-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-semibold',
              saving ? 'bg-stone-300 text-stone-600' : 'bg-stone-900 text-white hover:bg-stone-800',
            )}
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </form>
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full',
        active
          ? 'bg-stone-100 text-stone-900 font-semibold'
          : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700',
      )}
    >
      {icon} <span>{label}</span>
    </Link>
  );
}

