export type Subject = {
  id: string;
  user_id: string;
  name: string;
  short_name: string | null;
  professor: string | null;
  icon: string | null;
  color: string;
  coefficient: number | null;
  created_at: string;
  updated_at: string;
};

export type ScheduleEvent = {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  location: string | null;
  start_time: string;
  end_time: string;
  recurrence_rule: string | null;
  recurrence_end: string | null;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  due_date: string | null;
  is_done: boolean;
  done_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  content: Record<string, unknown> | null;
  content_preview: string | null;
  created_at: string;
  updated_at: string;
};

export type Notebook = {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  cover_color: string;
  created_at: string;
  updated_at: string;
};

export type NotebookPage = {
  id: string;
  notebook_id: string;
  user_id: string;
  page_number: number;
  drawing_data: Record<string, unknown> | null;
  text_content: string | null;
  template: 'blank' | 'lined' | 'grid' | 'dotted';
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Exam = {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  exam_date: string;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Deck = {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
};

export type Flashcard = {
  id: string;
  deck_id: string;
  user_id: string;
  front: string;
  back: string;
  ease_factor: number;
  interval: number;
  next_review: string | null;
  created_at: string;
  updated_at: string;
};

export type PomodoroSession = {
  id: string;
  user_id: string;
  subject_id: string | null;
  duration_minutes: number;
  completed_at: string;
};

export type MoodEntry = {
  id: string;
  user_id: string;
  mood: '😊' | '🙂' | '😐' | '😕' | '😢';
  note: string | null;
  entry_date: string;
  created_at: string;
};

export type VoiceNote = {
  id: string;
  user_id: string;
  notebook_page_id: string | null;
  audio_url: string;
  duration_seconds: number | null;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  nickname: string | null;
  avatar_letter: string | null;
  created_at: string;
  updated_at: string;
};
