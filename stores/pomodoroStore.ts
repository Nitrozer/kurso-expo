import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { PomodoroSession } from '../types';

type PomodoroState = {
  duration: number; // minutes
  remaining: number; // seconds
  isRunning: boolean;
  selectedSubjectId: string | null;
  sessions: PomodoroSession[];
  setDuration: (minutes: number) => void;
  setSelectedSubjectId: (id: string | null) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  complete: (userId: string) => Promise<void>;
  fetchSessions: (userId: string) => Promise<void>;
};

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  duration: 25,
  remaining: 25 * 60,
  isRunning: false,
  selectedSubjectId: null,
  sessions: [],
  setDuration: (minutes) => {
    set({ duration: minutes, remaining: minutes * 60, isRunning: false });
  },
  setSelectedSubjectId: (id) => set({ selectedSubjectId: id }),
  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () => set({ remaining: get().duration * 60, isRunning: false }),
  tick: () => {
    const { remaining } = get();
    if (remaining > 0) {
      set({ remaining: remaining - 1 });
    } else {
      set({ isRunning: false });
    }
  },
  complete: async (userId) => {
    const { duration, selectedSubjectId } = get();
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .insert({
        user_id: userId,
        subject_id: selectedSubjectId,
        duration_minutes: duration,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (!error && data) {
      set({ sessions: [data, ...get().sessions] });
    }
    get().reset();
  },
  fetchSessions: async (userId) => {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(20);
    if (!error && data) set({ sessions: data });
  },
}));
