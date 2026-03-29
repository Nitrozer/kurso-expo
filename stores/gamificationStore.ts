import { create } from 'zustand';
import { supabase } from '../lib/supabase';

type Badge = {
  id: string;
  user_id: string;
  badge_type: string;
  earned_at: string;
};

type StreakData = {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  freeze_remaining: number;
};

type GamificationState = {
  streak: StreakData;
  todayXP: number;
  dailyGoal: number; // 50 XP by default
  badges: Badge[];
  isLoading: boolean;

  fetchStreak: (userId: string) => Promise<void>;
  fetchTodayXP: (userId: string) => Promise<void>;
  fetchBadges: (userId: string) => Promise<void>;
  logAction: (userId: string, actionType: string) => Promise<void>;
  useFreezeDay: (userId: string) => Promise<void>;
};

// XP values per action
const XP_VALUES: Record<string, number> = {
  task_complete: 10,
  flashcard_review: 5,
  note_created: 15,
  note_edited: 5,
  notebook_page: 10,
  event_created: 10,
  exam_created: 15,
};

// Badge definitions
const BADGE_MILESTONES = [
  { type: 'streak_7', label: '7 jours', requirement: 7 },
  { type: 'streak_30', label: '30 jours', requirement: 30 },
  { type: 'streak_100', label: '100 jours', requirement: 100 },
  { type: 'xp_500', label: '500 XP', requirement: 500 },
  { type: 'xp_2000', label: '2000 XP', requirement: 2000 },
  { type: 'tasks_50', label: '50 taches', requirement: 50 },
];

export const useGamificationStore = create<GamificationState>((set, get) => ({
  streak: { current_streak: 0, longest_streak: 0, last_active_date: null, freeze_remaining: 2 },
  todayXP: 0,
  dailyGoal: 50,
  badges: [],
  isLoading: false,

  fetchStreak: async (userId) => {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No streak row yet, create one
      const { data: newData } = await supabase
        .from('streaks')
        .insert({ user_id: userId, current_streak: 0, longest_streak: 0, freeze_remaining: 2 })
        .select()
        .single();
      if (newData) set({ streak: newData });
    } else if (data) {
      set({ streak: data });
    }
  },

  fetchTodayXP: async (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_activity')
      .select('xp_earned')
      .eq('user_id', userId)
      .eq('activity_date', today)
      .single();

    set({ todayXP: data?.xp_earned ?? 0 });
  },

  fetchBadges: async (userId) => {
    const { data } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (data) set({ badges: data });
  },

  logAction: async (userId, actionType) => {
    const xp = XP_VALUES[actionType] ?? 5;
    const today = new Date().toISOString().split('T')[0];

    // Upsert daily activity
    const { data: existing } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_date', today)
      .single();

    if (existing) {
      await supabase
        .from('daily_activity')
        .update({
          xp_earned: existing.xp_earned + xp,
          actions_count: existing.actions_count + 1,
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('daily_activity')
        .insert({ user_id: userId, activity_date: today, xp_earned: xp, actions_count: 1 });
    }

    // Update streak
    const { streak } = get();
    const lastActive = streak.last_active_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = streak.current_streak;
    if (lastActive !== today) {
      if (lastActive === yesterdayStr || lastActive === null) {
        newStreak = streak.current_streak + 1;
      } else {
        // Check if freeze can save us
        const daysBetween = Math.floor((new Date(today).getTime() - new Date(lastActive ?? today).getTime()) / 86400000);
        if (daysBetween <= 2 && streak.freeze_remaining > 0) {
          newStreak = streak.current_streak + 1;
          await supabase
            .from('streaks')
            .update({ freeze_remaining: streak.freeze_remaining - (daysBetween - 1) })
            .eq('user_id', userId);
        } else {
          newStreak = 1; // Reset streak
        }
      }

      const longestStreak = Math.max(newStreak, streak.longest_streak);
      await supabase
        .from('streaks')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_active_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      set({
        streak: { ...streak, current_streak: newStreak, longest_streak: longestStreak, last_active_date: today },
      });

      // Check for streak badges
      for (const milestone of BADGE_MILESTONES) {
        if (milestone.type.startsWith('streak_') && newStreak >= milestone.requirement) {
          await supabase
            .from('badges')
            .upsert({ user_id: userId, badge_type: milestone.type })
            .select();
        }
      }
    }

    // Update today XP in state
    set({ todayXP: (existing?.xp_earned ?? 0) + xp });
  },

  useFreezeDay: async (userId) => {
    const { streak } = get();
    if (streak.freeze_remaining <= 0) return;
    await supabase
      .from('streaks')
      .update({ freeze_remaining: streak.freeze_remaining - 1, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    set({ streak: { ...streak, freeze_remaining: streak.freeze_remaining - 1 } });
  },
}));

export { BADGE_MILESTONES, XP_VALUES };
