import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Exam } from '../types';

type ExamsState = {
  exams: Exam[];
  isLoading: boolean;
  fetchExams: (userId: string) => Promise<void>;
  addExam: (exam: Omit<Exam, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateExam: (id: string, updates: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  getUpcomingExams: (userId: string, limit?: number) => Promise<Exam[]>;
};

export const useExamsStore = create<ExamsState>((set, get) => ({
  exams: [],
  isLoading: false,
  fetchExams: async (userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('user_id', userId)
      .order('exam_date', { ascending: true });
    if (!error && data) set({ exams: data });
    set({ isLoading: false });
  },
  addExam: async (exam) => {
    const { data, error } = await supabase.from('exams').insert(exam).select().single();
    if (!error && data) set({ exams: [...get().exams, data] });
  },
  updateExam: async (id, updates) => {
    const { data, error } = await supabase
      .from('exams')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) set({ exams: get().exams.map((e) => (e.id === id ? data : e)) });
  },
  deleteExam: async (id) => {
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (!error) set({ exams: get().exams.filter((e) => e.id !== id) });
  },
  getUpcomingExams: async (userId, limit = 5) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('user_id', userId)
      .gt('exam_date', now)
      .order('exam_date', { ascending: true })
      .limit(limit);
    if (!error && data) return data;
    return [];
  },
}));
