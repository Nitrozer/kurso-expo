import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Task } from '../types';
import { useGamificationStore } from './gamificationStore';

type TasksState = {
  tasks: Task[];
  isLoading: boolean;
  fetchTasks: (userId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'is_done' | 'done_at' | 'sort_order'>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,
  fetchTasks: async (userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId).order('sort_order', { ascending: true });
    if (!error && data) set({ tasks: data });
    set({ isLoading: false });
  },
  addTask: async (task) => {
    const { data, error } = await supabase.from('tasks').insert({ ...task, is_done: false, sort_order: 0 }).select().single();
    if (!error && data) set({ tasks: [data, ...get().tasks] });
  },
  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const is_done = !task.is_done;
    const done_at = is_done ? new Date().toISOString() : null;
    const { data, error } = await supabase.from('tasks').update({ is_done, done_at, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (!error && data) {
      set({ tasks: get().tasks.map((t) => (t.id === id ? data : t)) });
      if (is_done && data.user_id) {
        useGamificationStore.getState().logAction(data.user_id, 'task_complete');
      }
    }
  },
  deleteTask: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },
}));
