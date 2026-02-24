'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, BarChart3, Coffee, Clock } from 'lucide-react';
import clsx from 'clsx';

type SessionRow = {
  id: number;
  startTime: string;
  type: string;
  duration: number;
  completed: boolean;
  pauseCount: number;
};

export default function SessionSummaryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        // Check auth
        const meRes = await fetch('/api/auth/me', {
          cache: 'no-store',
          credentials: 'include',
        });
        const meData = await meRes.json();
        if (!meData?.user) {
          router.replace('/login');
          return;
        }
        // Load sessions
        const res = await fetch('/api/sessions?limit=20', {
          cache: 'no-store',
          credentials: 'include',
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Failed to load sessions');
          return;
        }
        const data = await res.json();
        setSessions(data.sessions || []);
      } catch {
        setError('Network error while loading sessions');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-500 text-sm">Loading sessions…</p>
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
          <NavItem href="/session-summary" icon={<Clock size={20} />} label="Session Summary" active />
          <NavItem href="/ai" icon={<Coffee size={20} />} label="AI Tips" />
          <NavItem href="/profile" icon={<Brain size={20} />} label="My Profile" />
        </nav>
      </aside>

      <main className="flex-1 p-12 flex flex-col gap-8">
        <h2 className="text-2xl font-bold">Session Summary</h2>

        <div className="bg-white rounded-xl shadow p-6 overflow-auto">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <table className="w-full text-sm">
            <thead className="text-left border-b border-stone-200">
              <tr className="text-stone-500">
                <th className="py-2 pr-4">Started</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Duration</th>
                <th className="py-2 pr-4">Completed</th>
                <th className="py-2 pr-4">Pauses</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-stone-100 last:border-b-0">
                  <td className="py-2 pr-4">{new Date(s.startTime).toLocaleString()}</td>
                  <td className="py-2 pr-4 capitalize">{s.type}</td>
                  <td className="py-2 pr-4">{Math.round(s.duration / 60)} min</td>
                  <td className="py-2 pr-4">{s.completed ? 'Yes' : 'No'}</td>
                  <td className="py-2 pr-4">{s.pauseCount}</td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td className="py-4 text-stone-400" colSpan={5}>
                    No sessions recorded yet. Start a timer from the dashboard to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
