import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { MoodEntry } from '../types';

type MoodState = {
  moods: MoodEntry[];
  isLoading: boolean;
  fetchMoods: (userId: string) => Promise<void>;
  fetchMoodsByMonth: (userId: string, year: number, month: number) => Promise<void>;
  addMood: (mood: Omit<MoodEntry, 'id' | 'created_at'>) => Promise<void>;
  updateMood: (id: string, updates: Partial<MoodEntry>) => Promise<void>;
  getTodayMood: (userId: string) => Promise<MoodEntry | null>;
};

export const useMoodStore = create<MoodState>((set, get) => ({
  moods: [],
  isLoading: false,
  fetchMoods: async (userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });
    if (!error && data) set({ moods: data });
    set({ isLoading: false });
  },
  fetchMoodsByMonth: async (userId, year, month) => {
    set({ isLoading: true });
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', startDate)
      .lt('entry_date', endDate)
      .order('entry_date', { ascending: true });
    if (!error && data) set({ moods: data });
    set({ isLoading: false });
  },
  addMood: async (mood) => {
    const { data, error } = await supabase.from('mood_entries').insert(mood).select().single();
    if (!error && data) set({ moods: [data, ...get().moods] });
  },
  updateMood: async (id, updates) => {
    const { data, error } = await supabase
      .from('mood_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) set({ moods: get().moods.map((m) => (m.id === id ? data : m)) });
  },
  getTodayMood: async (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', today)
      .single();
    if (!error && data) return data;
    return null;
  },
}));
