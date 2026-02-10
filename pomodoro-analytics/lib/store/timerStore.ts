import { create } from 'zustand';
import { saveSession } from '@/app/actions';

export type TimerMode = 'work' | 'short-break' | 'long-break';

interface TimerState {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  
  // Actions
  setMode: (mode: TimerMode) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
}

const DURATIONS = {
  'work': 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60,
};

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: 'work',
  timeLeft: DURATIONS['work'],
  isRunning: false,

  setMode: (mode) => set({ 
    mode, 
    timeLeft: DURATIONS[mode],
    isRunning: false 
  }),

  startTimer: () => set({ isRunning: true }),
  
  pauseTimer: () => set({ isRunning: false }),
  
  resetTimer: () => {
    const { mode } = get();
    set({ 
      isRunning: false, 
      timeLeft: DURATIONS[mode] 
    });
  },

  tick: () => {
    const { timeLeft, mode } = get();
    
    if (timeLeft <= 1) {
       // Timer Finished!
       const duration = DURATIONS[mode];
       
       // Save to Database via Server Action
       saveSession({
         duration: duration,
         type: mode,
         completed: true
       });

       set({ isRunning: false, timeLeft: 0 });
    } else {
       set({ timeLeft: timeLeft - 1 });
    }
  },
}));
