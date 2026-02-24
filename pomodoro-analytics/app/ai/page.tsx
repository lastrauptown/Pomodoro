'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, BarChart3, Coffee, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function AiTipsPage() {
  const router = useRouter();
  const [tips, setTips] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTips = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/ai-tips', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setError('Please log in or sign up to use AI tips.');
        } else {
          setError(data.error || 'Failed to generate tips');
        }
        setTips(null);
        return;
      }

      setTips(data.tips);
    } catch (e) {
      setError('Network error while calling AI');
      setTips(null);
    } finally {
      setLoading(false);
    }
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
          <NavItem href="/analytics" icon={<BarChart3 size={20} />} label="Analytics" />
          <NavItem href="/session-summary" icon={<Clock size={20} />} label="Session Summary" />
          <NavItem href="/ai" icon={<Coffee size={20} />} label="AI Tips" active />
          <NavItem href="/profile" icon={<Brain size={20} />} label="My Profile" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 gap-6 flex flex-col">
        {/* Page Title */}
        <h2 className="text-2xl font-bold mb-6 w-full text-left">AI Productivity Insights</h2>

        {/* 2-column layout */}
        <div className="flex gap-6 w-full">
          <div className="flex flex-col gap-6 flex-[0.6]">
            <div className="bg-white p-6 rounded-xl shadow flex flex-col">
              <p className="text-lg font-bold mb-2">What this page does</p>
              <p className="text-sm text-stone-600">
                The AI reads your recent Pomodoro sessions from the database and generates
                personalized tips based on your focus habits and break patterns.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow flex flex-col">
              <p className="text-lg font-bold mb-4">How to use it</p>
              <ul className="list-disc pl-5 text-sm text-stone-600 space-y-1">
                <li>Use the timer for a few sessions first.</li>
                <li>Open this page and ask the AI for insights.</li>
                <li>Adjust your work and break schedule based on the suggestions.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-6 flex-[1.4] items-center">
            <div className="w-full p-6 rounded-xl shadow flex flex-col items-center justify-between">
              <p className="text-3xl font-bold mb-4 text-center">Your AI Tips</p>
              <div className="w-full min-h-[180px] rounded-lg bg-white border border-stone-200 p-4 overflow-y-auto whitespace-pre-wrap text-sm">
                {loading && <p className="text-stone-500">Asking AI for insights...</p>}
                {!loading && error && (
                  <p className="text-red-500">
                    {error}
                  </p>
                )}
                {!loading && !error && tips && <p>{tips}</p>}
                {!loading && !error && !tips && (
                  <p className="text-stone-400">
                    No tips yet. Start a few sessions, then click the button below to let the AI analyse your habits.
                  </p>
                )}
              </div>
              <div className="mt-6 w-full flex justify-center">
                <button
                  onClick={handleGenerateTips}
                  disabled={loading}
                  className={clsx(
                    'px-8 py-3 rounded-xl border-2 border-stone-900 font-semibold text-lg transition-colors',
                    loading
                      ? 'bg-stone-200 text-stone-500 border-stone-200 cursor-not-allowed'
                      : 'bg-stone-900 text-white hover:bg-stone-800',
                  )}
                >
                  {loading ? 'Generating...' : 'Ask AI For Tips'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// NavItem component
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
    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full',
    active ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
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
