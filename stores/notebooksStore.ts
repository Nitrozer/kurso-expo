import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Notebook, NotebookPage } from '../types';
import { useGamificationStore } from './gamificationStore';

type NotebooksState = {
  notebooks: Notebook[];
  pages: Record<string, NotebookPage[]>;
  isLoading: boolean;
  fetchNotebooks: (userId: string) => Promise<void>;
  fetchPages: (notebookId: string) => Promise<void>;
  addNotebook: (notebook: Omit<Notebook, 'id' | 'created_at' | 'updated_at'>) => Promise<Notebook | null>;
  updateNotebook: (id: string, updates: Partial<Notebook>) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  addPage: (page: Omit<NotebookPage, 'id' | 'created_at' | 'updated_at'>) => Promise<NotebookPage | null>;
  updatePage: (id: string, updates: Partial<NotebookPage>) => Promise<void>;
  deletePage: (id: string, notebookId: string) => Promise<void>;
  getNotebook: (id: string) => Notebook | undefined;
};

export const useNotebooksStore = create<NotebooksState>((set, get) => ({
  notebooks: [],
  pages: {},
  isLoading: false,
  fetchNotebooks: async (userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('notebooks')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (!error && data) set({ notebooks: data });
    set({ isLoading: false });
  },
  fetchPages: async (notebookId) => {
    const { data, error } = await supabase
      .from('notebook_pages')
      .select('*')
      .eq('notebook_id', notebookId)
      .order('page_number', { ascending: true });
    if (!error && data) {
      set({ pages: { ...get().pages, [notebookId]: data } });
    }
  },
  addNotebook: async (notebook) => {
    const { data, error } = await supabase
      .from('notebooks')
      .insert(notebook)
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (data) {
      set({ notebooks: [data, ...get().notebooks] });
      return data;
    }
    return null;
  },
  updateNotebook: async (id, updates) => {
    const { data, error } = await supabase
      .from('notebooks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      set({ notebooks: get().notebooks.map((n) => (n.id === id ? data : n)) });
    }
  },
  deleteNotebook: async (id) => {
    const { error } = await supabase.from('notebooks').delete().eq('id', id);
    if (!error) {
      const newPages = { ...get().pages };
      delete newPages[id];
      set({
        notebooks: get().notebooks.filter((n) => n.id !== id),
        pages: newPages,
      });
    }
  },
  addPage: async (page) => {
    const { data, error } = await supabase
      .from('notebook_pages')
      .insert(page)
      .select()
      .single();
    if (!error && data) {
      const notebookPages = get().pages[data.notebook_id] ?? [];
      set({
        pages: {
          ...get().pages,
          [data.notebook_id]: [...notebookPages, data],
        },
      });
      if (data.user_id) {
        useGamificationStore.getState().logAction(data.user_id, 'notebook_page');
      }
      return data;
    }
    return null;
  },
  updatePage: async (id, updates) => {
    const { data, error } = await supabase
      .from('notebook_pages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      const notebookPages = get().pages[data.notebook_id] ?? [];
      set({
        pages: {
          ...get().pages,
          [data.notebook_id]: notebookPages.map((p) => (p.id === id ? data : p)),
        },
      });
    }
  },
  deletePage: async (id, notebookId) => {
    const { error } = await supabase.from('notebook_pages').delete().eq('id', id);
    if (!error) {
      const notebookPages = get().pages[notebookId] ?? [];
      set({
        pages: {
          ...get().pages,
          [notebookId]: notebookPages.filter((p) => p.id !== id),
        },
      });
    }
  },
  getNotebook: (id) => get().notebooks.find((n) => n.id === id),
}));
