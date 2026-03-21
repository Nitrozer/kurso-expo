import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { ScheduleEvent } from '../types';

type ScheduleState = {
  events: ScheduleEvent[];
  isLoading: boolean;
  fetchEvents: (userId: string) => Promise<void>;
  addEvent: (event: Omit<ScheduleEvent, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<ScheduleEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
};

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  events: [],
  isLoading: false,
  fetchEvents: async (userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase.from('schedule_events').select('*').eq('user_id', userId).order('start_time', { ascending: true });
    if (!error && data) set({ events: data });
    set({ isLoading: false });
  },
  addEvent: async (event) => {
    const { data, error } = await supabase.from('schedule_events').insert(event).select().single();
    if (!error && data) set({ events: [...get().events, data] });
  },
  updateEvent: async (id, updates) => {
    const { data, error } = await supabase.from('schedule_events').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (!error && data) set({ events: get().events.map((e) => (e.id === id ? data : e)) });
  },
  deleteEvent: async (id) => {
    const { error } = await supabase.from('schedule_events').delete().eq('id', id);
    if (!error) set({ events: get().events.filter((e) => e.id !== id) });
  },
}));
