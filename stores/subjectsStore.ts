import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Subject } from '../types';

type SubjectsState = {
  subjects: Subject[];
  isLoading: boolean;
  fetchSubjects: (userId: string) => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  getSubject: (id: string) => Subject | undefined;
};

export const useSubjectsStore = create<SubjectsState>((set, get) => ({
  subjects: [],
  isLoading: false,
  fetchSubjects: async (userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase.from('subjects').select('*').eq('user_id', userId).order('name');
    if (!error && data) set({ subjects: data });
    set({ isLoading: false });
  },
  addSubject: async (subject) => {
    const { data, error } = await supabase.from('subjects').insert(subject).select().single();
    if (!error && data) set({ subjects: [...get().subjects, data] });
  },
  updateSubject: async (id, updates) => {
    const { data, error } = await supabase.from('subjects').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (!error && data) set({ subjects: get().subjects.map((s) => (s.id === id ? data : s)) });
  },
  deleteSubject: async (id) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (!error) set({ subjects: get().subjects.filter((s) => s.id !== id) });
  },
  getSubject: (id) => get().subjects.find((s) => s.id === id),
}));
