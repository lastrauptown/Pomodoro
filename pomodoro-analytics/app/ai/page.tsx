'use client';

import React from 'react';
import { Brain, BarChart3, Clock, Coffee, Sun, CloudSun, Moon } from 'lucide-react';
import clsx from 'clsx';

/* MOCK DATA */
const mockInsights = {
  bestFocusTime: '7:00 PM - 9:00 PM',
  frequentInterruptions: 'After 2:00 PM',
  recommendedInterval: '50 MIN WORK / 10 MIN BREAK',
};

export default function AiTipsPage() {
  const applyRecommendation = () => {
    console.log('Apply recommendation clicked! Timer should change to 50/10 now.');
  };

 // Function to determine tip message based on best focus time
    const getTipMessage = (time: string) => {
        const hour = parseInt(time.split(':')[0]); // extract hour
        if (time.includes('AM') && hour < 12) {
        return (
            <span className="flex items-center justify-center gap-2 p-4 rounded-lg bg-[#FFD400] text-[#A82323] font-medium">
            <Sun size={24} /> Focus more in the <strong>morning</strong> for better productivity!
            </span>
        );
        }
        if (time.includes('PM') && hour < 6) {
        return (
            <span className="flex items-center justify-center gap-2 p-4 rounded-lg bg-[#FF5F00] text-[#F7F0F0] font-medium">
            <CloudSun size={24} /> Focus more in the <strong>afternoon</strong> for better productivity!
            </span>
        );
        }
        return (
        <span className="flex items-center justify-center gap-2 p-4 rounded-lg bg-[#7A73D1] text-[#EBD3F8] font-medium">
            <Moon size={24} /> Focus more in the <strong>evening</strong> for better productivity!
        </span>
        );
    };

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-stone-200 p-6 flex flex-col gap-6 bg-white">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="text-stone-900" /> Pomodoro AI
        </h1>
        <nav className="flex flex-col gap-2">
          <NavItem icon={<Brain size={20} />} label="Dashboard" />
          <NavItem icon={<BarChart3 size={20} />} label="Analytics" />
          <NavItem icon={<Clock size={20} />} label="Session Summary" />
          <NavItem icon={<Coffee size={20} />} label="AI Tips" active />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 gap-6 flex flex-col">
        {/* Page Title */}
        <h2 className="text-2xl font-bold mb-6 w-full text-left">Productivity Insights</h2>

        {/* 2-column layout */}
        <div className="flex gap-6 w-full">
          {/* Left Column - smaller */}
          <div className="flex flex-col gap-6 flex-[0.6]">
            {/* Best Focus Time Card */}
            <div className="bg-white p-6 rounded-xl shadow flex flex-col">
              <p className="text-lg font-bold mb-6">{'Best Focus Time'}</p>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-3xl font-bold">{mockInsights.bestFocusTime}</p>
              </div>
            </div>

            {/* Frequent Interruptions Card */}
            <div className="bg-white p-6 rounded-xl shadow flex flex-col">
              <p className="text-lg font-bold mb-6">{'Frequent Interruptions'}</p>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-3xl font-bold">{mockInsights.frequentInterruptions}</p>
              </div>
            </div>
          </div>

          {/* Right Column - larger */}
          <div className="flex flex-col gap-6 flex-[1.4] items-center">
            {/* Recommended Interval Card */}
            <div className="w-full p-6 rounded-xl shadow flex flex-col items-center justify-between">
            {/* Title */}
            <p className="text-3xl font-bold mb-6 text-center">Recommended Interval</p>

            {/* Square Highlighted Interval */}
            <div className="flex-1 flex items-center justify-center w-full">
                <div 
                    className="w-48 h-48 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: '#BF4646', color: '#FFFFFF' }}
                >
                <p className="font-bold text-2xl text-center">
                    {mockInsights.recommendedInterval}
                </p>
                </div>
            </div>

            {/* Button at bottom */}
            <div className="mt-6 w-full flex justify-center">
                <button
                    onClick={applyRecommendation}
                    className="px-8 py-3 rounded-xl border-2 border-stone-900 text-stone-900 font-semibold text-lg bg-transparent transition-colors hover:bg-stone-900 hover:text-white"
                    >
                    Apply Recommendation
                </button>

            </div>
            </div>
          </div>
        </div>
        {/* Tip Message Below Main Content */}
        <div className="w-full mt-6 p-4 rounded-lg text-center font-medium text-lg">
          {getTipMessage(mockInsights.bestFocusTime)}
        </div>
      </main>
    </div>
  );
}

// NavItem component
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
