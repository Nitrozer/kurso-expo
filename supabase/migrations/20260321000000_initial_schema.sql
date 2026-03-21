-- Kurso Expo — Initial Schema
-- All tables with RLS, indexes, and storage buckets

-- ============================================
-- TABLES
-- ============================================

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nickname TEXT,
  avatar_letter CHAR(1),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subjects
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  professor TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3D5AFE',
  coefficient REAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Schedule Events
CREATE TABLE schedule_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  recurrence_rule TEXT,
  recurrence_end DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  due_date DATE,
  is_done BOOLEAN DEFAULT false,
  done_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notes (TipTap rich text)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content JSONB,
  content_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notebooks (Skia drawing)
CREATE TABLE notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  cover_color TEXT DEFAULT '#111111',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notebook Pages
CREATE TABLE notebook_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  page_number INTEGER NOT NULL,
  drawing_data JSONB,
  text_content TEXT,
  template TEXT DEFAULT 'blank' CHECK (template IN ('blank', 'lined', 'grid', 'dotted')),
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Exams
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  exam_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Decks (Flashcards)
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Flashcards
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  next_review TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pomodoro Sessions
CREATE TABLE pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Mood Entries
CREATE TABLE mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mood TEXT NOT NULL,
  note TEXT,
  entry_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

-- Voice Notes
CREATE TABLE voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  notebook_page_id UUID REFERENCES notebook_pages(id) ON DELETE SET NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subjects" ON subjects FOR ALL USING (auth.uid() = user_id);

ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own events" ON schedule_events FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notes" ON notes FOR ALL USING (auth.uid() = user_id);

ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notebooks" ON notebooks FOR ALL USING (auth.uid() = user_id);

ALTER TABLE notebook_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pages" ON notebook_pages FOR ALL USING (auth.uid() = user_id);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own exams" ON exams FOR ALL USING (auth.uid() = user_id);

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own decks" ON decks FOR ALL USING (auth.uid() = user_id);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own flashcards" ON flashcards FOR ALL USING (auth.uid() = user_id);

ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pomodoro" ON pomodoro_sessions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mood" ON mood_entries FOR ALL USING (auth.uid() = user_id);

ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own voice_notes" ON voice_notes FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_events_user_time ON schedule_events(user_id, start_time);
CREATE INDEX idx_events_subject ON schedule_events(subject_id);
CREATE INDEX idx_tasks_user_due ON tasks(user_id, due_date) WHERE NOT is_done;
CREATE INDEX idx_tasks_subject ON tasks(subject_id);
CREATE INDEX idx_notes_user_updated ON notes(user_id, updated_at DESC);
CREATE INDEX idx_notes_subject ON notes(subject_id);
CREATE INDEX idx_pages_notebook ON notebook_pages(notebook_id, page_number);
CREATE INDEX idx_flashcards_review ON flashcards(user_id, next_review) WHERE next_review IS NOT NULL;
CREATE INDEX idx_exams_user_date ON exams(user_id, exam_date);
CREATE INDEX idx_notebooks_subject ON notebooks(subject_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('drawings', 'drawings', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-notes', 'voice-notes', false);

-- Storage policies: authenticated users can manage their own files
CREATE POLICY "Users upload own drawings" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'drawings' AND auth.role() = 'authenticated');
CREATE POLICY "Users read own drawings" ON storage.objects FOR SELECT
  USING (bucket_id = 'drawings' AND auth.role() = 'authenticated');
CREATE POLICY "Users delete own drawings" ON storage.objects FOR DELETE
  USING (bucket_id = 'drawings' AND auth.role() = 'authenticated');

CREATE POLICY "Users upload own voice notes" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'voice-notes' AND auth.role() = 'authenticated');
CREATE POLICY "Users read own voice notes" ON storage.objects FOR SELECT
  USING (bucket_id = 'voice-notes' AND auth.role() = 'authenticated');
CREATE POLICY "Users delete own voice notes" ON storage.objects FOR DELETE
  USING (bucket_id = 'voice-notes' AND auth.role() = 'authenticated');
