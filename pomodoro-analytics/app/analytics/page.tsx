'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, BarChart3, Coffee } from 'lucide-react';
import clsx from 'clsx';

/* MOCK DATA */
const weeklyData = [
  { day: 'Mon', sessions: 3 },
  { day: 'Tue', sessions: 5 },
  { day: 'Wed', sessions: 2 },
  { day: 'Thu', sessions: 4 },
  { day: 'Fri', sessions: 6 },
  { day: 'Sat', sessions: 1 },
  { day: 'Sun', sessions: 0 },
];

// Mock productivity per time period
const mockProductivity = {
  morning: 1,
  afternoon: 7,
  evening: 3,
};

export default function AnalyticsPage() {
  // Compute sorted productivity levels
  const productivityLevels = useMemo(() => {
    const periods = [
      { period: 'MORNING', sessions: mockProductivity.morning },
      { period: 'AFTERNOON', sessions: mockProductivity.afternoon },
      { period: 'EVENING', sessions: mockProductivity.evening },
    ];

    // Sort descending by sessions
    periods.sort((a, b) => b.sessions - a.sessions);

    // Assign High, Medium, Low labels
    const labels = ['High', 'Medium', 'Low'];
    return periods.map((p, i) => ({ ...p, label: labels[i] }));
  }, []);

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-stone-200 p-6 flex flex-col gap-6 bg-white">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="text-stone-900" /> Pomodoro AI
        </h1>
        <nav className="flex flex-col gap-2">
          <NavItem icon={<Brain size={20} />} label="Dashboard" active />
          <NavItem icon={<BarChart3 size={20} />} label="Analytics" active />
          <NavItem icon={<Coffee size={20} />} label="AI Tips" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 flex flex-col gap-12">
        {/* Bar Graph */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Pomodoro Sessions This Week</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#BF4646" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Productivity Levels */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-col gap-2">
          {productivityLevels.map((p) => (
            <p key={p.period}>
              <strong>{p.period}:</strong> {p.label} Productivity
            </p>
          ))}
        </div>
      </main>
    </div>
  );
}

// NavItem component copied from dashboard
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
