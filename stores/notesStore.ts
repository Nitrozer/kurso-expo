import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Note } from '../types';
import { useGamificationStore } from './gamificationStore';

type NotesState = {
  notes: Note[];
  isLoading: boolean;
  fetchNotes: (userId: string) => Promise<void>;
  fetchRecentNotes: (userId: string, limit?: number) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
};

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  fetchNotes: async (userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (!error && data) set({ notes: data });
    set({ isLoading: false });
  },
  fetchRecentNotes: async (userId, limit = 3) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);
    if (!error && data) set({ notes: data });
    set({ isLoading: false });
  },
  addNote: async (note) => {
    const { data, error } = await supabase
      .from('notes')
      .insert(note)
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (data) {
      set({ notes: [data, ...get().notes] });
      if (data.user_id) {
        useGamificationStore.getState().logAction(data.user_id, 'note_created');
      }
      return data;
    }
    return null;
  },
  updateNote: async (id, updates) => {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      set({ notes: get().notes.map((n) => (n.id === id ? data : n)) });
    }
  },
  deleteNote: async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (!error) set({ notes: get().notes.filter((n) => n.id !== id) });
  },
  getNote: (id) => get().notes.find((n) => n.id === id),
}));
