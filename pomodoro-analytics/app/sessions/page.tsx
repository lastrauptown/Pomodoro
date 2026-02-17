'use client';

import React, { useMemo, useState } from 'react';
import { Brain, BarChart3, Clock, Coffee, Trash2 } from 'lucide-react';
import clsx from 'clsx';

/* MOCK SESSION HISTORY DATA */
const mockSessions = [
  { id: 1, type: 'Work', duration: 25, time: '8:30 AM', date: 'today' },
  { id: 2, type: 'Break', duration: 5, time: '8:55 AM', date: 'today' },
  { id: 3, type: 'Work', duration: 25, time: '9:00 AM', date: 'today' },
  { id: 4, type: 'Work', duration: 25, time: 'Yesterday 7:00 PM', date: 'weekly' },
  { id: 5, type: 'Break', duration: 5, time: 'Yesterday 7:25 PM', date: 'weekly' },
];

type FilterType = 'today' | 'weekly' | 'all';

export default function SessionSummaryPage() {
  const [filter, setFilter] = useState<FilterType>('today');

  const filteredSessions = useMemo(() => {
    if (filter === 'all') return mockSessions;
    return mockSessions.filter((s) => s.date === filter);
  }, [filter]);

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-stone-200 p-6 flex flex-col gap-6 bg-white">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Brain /> Pomodoro AI
        </h1>
        <nav className="flex flex-col gap-2">
          <NavItem icon={<Brain size={20} />} label="Dashboard" />
          <NavItem icon={<BarChart3 size={20} />} label="Analytics" />
          <NavItem icon={<Clock size={20} />} label="Session Summary" active />
          <NavItem icon={<Coffee size={20} />} label="AI Tips" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 flex flex-col gap-8">
        <h2 className="text-2xl font-bold">Session History</h2>

        {/* Filters */}
        <div className="flex gap-3">
          {(['today', 'weekly', 'all'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-medium transition',
                filter === f
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              )}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-100 text-stone-600">
              <tr>
                <th className="text-left px-6 py-3">Session Type</th>
                <th className="text-left px-6 py-3">Duration</th>
                <th className="text-left px-6 py-3">Time</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id} className="border-t">
                  <td className="px-6 py-4 font-medium">
                    {session.type}
                  </td>
                  <td className="px-6 py-4">
                    {session.duration} min
                  </td>
                  <td className="px-6 py-4">
                    {session.time}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-red-500 hover:text-red-700 transition">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-stone-400">
                    No sessions found
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

/* NavItem (same as analytics/dashboard) */
function NavItem({ icon, label, active }: { icon: any; label: string; active?: boolean }) {
  return (
    <button
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full',
        active
          ? 'bg-stone-100 text-stone-900 font-semibold'
          : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
      )}
    >
      {icon} <span>{label}</span>
    </button>
  );
}
