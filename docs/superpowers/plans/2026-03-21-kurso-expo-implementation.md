# Kurso Expo Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Kurso, an iPad-first Expo React Native student life management app with Supabase backend, featuring schedule, notes, notebooks (Skia drawing), tasks, flashcards, pomodoro, mood tracking, and a refined "cahier" design system.

**Architecture:** Monolithique Supabase (single source of truth) with MMKV local cache. iPad 3-column layout (Rail 72px + Main flex + Sidebar 280px). Zustand stores per feature domain with NativeWind v4 for styling.

**Tech Stack:** Expo SDK (latest stable) + expo prebuild, Expo Router v4, Zustand, NativeWind v4, Supabase, @shopify/react-native-skia, @10play/tentap-editor, react-native-reanimated 3, @gorhom/bottom-sheet, @shopify/flash-list, lucide-react-native, expo-av, rrule

**Spec:** `docs/superpowers/specs/2026-03-21-kurso-expo-design.md`

---

## Chunk 1: Foundation — Project Setup, Theme, Supabase, Auth

### Task 1: Initialize Expo project

**Files:**
- Create: `kurso-expo/` (project root via create-expo-app)

- [ ] **Step 1: Create Expo project**

```bash
cd /Users/enzomerfeld/project_perso
npx create-expo-app kurso-expo --template blank-typescript
```

- [ ] **Step 2: Install core dependencies**

```bash
cd /Users/enzomerfeld/project_perso/kurso-expo
npx expo install nativewind tailwindcss react-native-reanimated react-native-mmkv zustand @supabase/supabase-js react-native-url-polyfill expo-font expo-splash-screen lucide-react-native @shopify/flash-list @gorhom/bottom-sheet react-native-gesture-handler react-native-safe-area-context react-native-calendars rrule expo-document-picker expo-notifications @react-native-community/netinfo
```

- [ ] **Step 3: Install dev dependencies**

```bash
npx expo install -- --save-dev tailwindcss@^3
```

- [ ] **Step 4: Run expo prebuild to generate native projects**

```bash
npx expo prebuild
```

- [ ] **Step 5: Verify the app runs**

```bash
npx expo start
```

Expected: Metro bundler starts, app loads on iPad simulator with default Expo screen.

- [ ] **Step 6: Init git and commit**

```bash
cd /Users/enzomerfeld/project_perso/kurso-expo
git init
git add -A
git commit -m "chore: init Expo project with core dependencies"
```

---

### Task 2: Configure NativeWind and Tailwind

**Files:**
- Create: `tailwind.config.js`
- Create: `global.css`
- Modify: `app.json`
- Modify: `babel.config.js`
- Modify: `metro.config.js` (if needed)

- [ ] **Step 1: Create `tailwind.config.js`**

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        parchment:       '#F7F3ED',
        'surface-alt':   '#EDE8E0',
        ink:             '#111111',
        'ink-soft':      '#8A8278',
        'ink-muted':     '#B0A89C',
        'ink-ghost':     '#C8C0B4',
        'ink-dim':       '#D8D0C8',
        accent:          '#3D5AFE',
        'accent-soft':   '#8090EE',
        'accent-bg':     '#EEF0FF',
        'accent-border': '#C8D0FF',
        border:          '#E8E2DA',
        'border-soft':   '#E0D8CE',
        'border-task':   '#F0E8E0',
        dark:            '#111111',
        'dark-text':     '#F7F3ED',
        'dark-muted':    '#666666',
        'dark-subtle':   '#555555',
        'exam-red':      '#8B4B4B',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '28px',
        xxxl: '32px',
      },
      borderRadius: {
        sm: '6px',
        md: '9px',
        lg: '12px',
        xl: '14px',
        '2xl': '16px',
        pill: '20px',
        full: '9999px',
      },
      fontFamily: {
        'serif-black': ['Fraunces_900Black'],
        'serif-bold': ['Fraunces_700Bold'],
        'serif-light-italic': ['Fraunces_300Light_Italic'],
        'sans-light': ['DMSans_300Light'],
        'sans-regular': ['DMSans_400Regular'],
        'sans-medium': ['DMSans_500Medium'],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Create `global.css`**

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Update `babel.config.js`**

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

- [ ] **Step 4: Create `metro.config.js`**

NativeWind v4 requires wrapping metro config with `withNativeWind`. Without this, NativeWind will NOT work.

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

- [ ] **Step 5: Create `nativewind-env.d.ts`**

```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 6: Verify NativeWind works**

Temporarily add a `<View className="bg-parchment flex-1" />` in `app/index.tsx` and run the app. The background should be #F7F3ED.

- [ ] **Step 7: Commit**

```bash
git add tailwind.config.js global.css babel.config.js metro.config.js nativewind-env.d.ts
git commit -m "chore: configure NativeWind v4 with Kurso theme"
```

---

### Task 3: Set up fonts

**Files:**
- Create: `assets/fonts/` (font files)
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Install expo-google-fonts packages**

```bash
npx expo install @expo-google-fonts/fraunces @expo-google-fonts/dm-sans
```

- [ ] **Step 2: Create root layout with font loading**

```tsx
// app/_layout.tsx
import '../global.css';
import { useEffect } from 'react';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Fraunces_900Black,
  Fraunces_700Bold,
  Fraunces_300Light_Italic,
} from '@expo-google-fonts/fraunces';
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_900Black,
    Fraunces_700Bold,
    Fraunces_300Light_Italic,
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <Slot />;
}
```

- [ ] **Step 3: Run app and verify fonts load without crash**

```bash
npx expo start
```

Expected: App loads, splash screen hides after fonts load.

- [ ] **Step 4: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: load Fraunces and DM Sans fonts"
```

---

### Task 4: Create theme files

**Files:**
- Create: `theme/colors.ts`
- Create: `theme/typography.ts`
- Create: `theme/spacing.ts`

- [ ] **Step 1: Create `theme/colors.ts`**

```ts
// theme/colors.ts
// Canonical values for programmatic use (Reanimated, Skia).
// NativeWind classes use the same values via tailwind.config.js.
export const colors = {
  bg:           '#F7F3ED',
  surface:      '#F7F3ED',
  surfaceAlt:   '#EDE8E0',
  ink:          '#111111',
  inkSoft:      '#8A8278',
  inkMuted:     '#B0A89C',
  inkGhost:     '#C8C0B4',
  inkDim:       '#D8D0C8',
  blue:         '#3D5AFE',
  blueSoft:     '#8090EE',
  blueBg:       '#EEF0FF',
  blueBorder:   '#C8D0FF',
  border:       '#E8E2DA',
  borderSoft:   '#E0D8CE',
  borderTask:   '#F0E8E0',
  dark:         '#111111',
  darkText:     '#F7F3ED',
  darkMuted:    '#666666',
  darkSubtle:   '#555555',
  examRed:      '#8B4B4B',
} as const;
```

- [ ] **Step 2: Create `theme/typography.ts`**

```ts
// theme/typography.ts
export const fonts = {
  serif: {
    black:       'Fraunces_900Black',
    bold:        'Fraunces_700Bold',
    lightItalic: 'Fraunces_300Light_Italic',
  },
  sans: {
    light:   'DMSans_300Light',
    regular: 'DMSans_400Regular',
    medium:  'DMSans_500Medium',
  },
} as const;

export const textPresets = {
  heroName:      { fontFamily: fonts.serif.black, fontSize: 48, lineHeight: 52, letterSpacing: -2.4 },
  eyebrow:       { fontFamily: fonts.sans.medium, fontSize: 9, letterSpacing: 1.6, textTransform: 'uppercase' as const },
  statBig:       { fontFamily: fonts.serif.black, fontSize: 38, lineHeight: 38, letterSpacing: -1.9 },
  statLabel:     { fontFamily: fonts.sans.light, fontSize: 9.5, letterSpacing: 0.4 },
  courseTitle:    { fontFamily: fonts.serif.bold, fontSize: 15, letterSpacing: -0.3 },
  courseDetail:   { fontFamily: fonts.sans.light, fontSize: 10.5 },
  timeHour:      { fontFamily: fonts.serif.bold, fontSize: 13, letterSpacing: -0.4 },
  timeMin:       { fontFamily: fonts.sans.light, fontSize: 9 },
  sectionTitle:  { fontFamily: fonts.serif.bold, fontSize: 14, letterSpacing: -0.14 },
  sectionAction: { fontFamily: fonts.sans.regular, fontSize: 10, letterSpacing: 0.2 },
  monthName:     { fontFamily: fonts.serif.bold, fontSize: 16, letterSpacing: -0.48 },
  calDay:        { fontFamily: fonts.sans.light, fontSize: 10 },
  calHeader:     { fontFamily: fonts.sans.medium, fontSize: 8, letterSpacing: 0.48, textTransform: 'uppercase' as const },
  taskText:      { fontFamily: fonts.sans.regular, fontSize: 11.5, lineHeight: 16 },
  taskDue:       { fontFamily: fonts.sans.light, fontSize: 9 },
  noteCategory:  { fontFamily: fonts.sans.medium, fontSize: 8, letterSpacing: 1.12, textTransform: 'uppercase' as const },
  noteTitle:     { fontFamily: fonts.serif.bold, fontSize: 12.5, letterSpacing: -0.25 },
  notePreview:   { fontFamily: fonts.sans.light, fontSize: 10, lineHeight: 15 },
  dateChip:      { fontFamily: fonts.sans.light, fontSize: 10, letterSpacing: 0.6 },
  badgePill:     { fontFamily: fonts.sans.medium, fontSize: 8, letterSpacing: 0.96, textTransform: 'uppercase' as const },
  sectionLabel:  { fontFamily: fonts.sans.medium, fontSize: 9, letterSpacing: 1.26, textTransform: 'uppercase' as const },
} as const;
```

- [ ] **Step 3: Create `theme/spacing.ts`**

```ts
// theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 32,
} as const;

export const radii = {
  sm: 6,
  md: 9,
  lg: 12,
  xl: 14,
  xxl: 16,
  pill: 20,
  full: 9999,
} as const;
```

- [ ] **Step 4: Commit**

```bash
git add theme/
git commit -m "feat: add theme files (colors, typography, spacing)"
```

---

### Task 5: Create TypeScript types

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Create types file**

```ts
// types/index.ts

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
```

- [ ] **Step 2: Commit**

```bash
git add types/
git commit -m "feat: add TypeScript types for all Supabase tables"
```

---

### Task 6: Set up Supabase client

**Files:**
- Create: `lib/supabase.ts`

- [ ] **Step 1: Create Supabase client**

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';
import 'react-native-url-polyfill/auto';

const storage = new MMKV({ id: 'supabase-auth' });

const mmkvStorageAdapter = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: mmkvStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 2: Create `.env` with placeholders**

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 3: Add `.env` to `.gitignore`**

Verify `.env` is already in `.gitignore`. If not, add it.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase.ts .gitignore
git commit -m "feat: set up Supabase client with MMKV auth storage"
```

---

### Task 7: Set up Supabase database tables

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql` (for reference)

- [ ] **Step 1: Create all tables via Supabase MCP**

Use the Supabase MCP server to create each table as defined in the spec (`docs/superpowers/specs/2026-03-21-kurso-expo-design.md`, section "Base de données Supabase"). Create them in this order (respecting FK dependencies):

1. `profiles`
2. `subjects`
3. `schedule_events`
4. `tasks`
5. `notes`
6. `notebooks`
7. `notebook_pages`
8. `exams`
9. `decks`
10. `flashcards`
11. `pomodoro_sessions`
12. `mood_entries`
13. `voice_notes`

- [ ] **Step 2: Enable RLS and create policies on all tables**

For each table, enable RLS and create the policy:
```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own <table>" ON <table> FOR ALL USING (auth.uid() = user_id);
```

For `profiles`:
```sql
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

- [ ] **Step 3: Create indexes**

Create all indexes as defined in the spec:
- `idx_events_user_time`, `idx_events_subject`, `idx_tasks_user_due`, `idx_tasks_subject`, `idx_notes_user_updated`, `idx_notes_subject`, `idx_pages_notebook`, `idx_flashcards_review`, `idx_exams_user_date`, `idx_notebooks_subject`

- [ ] **Step 4: Create storage buckets**

Create `drawings` and `voice-notes` buckets in Supabase Storage with appropriate policies (authenticated users can upload/read their own files).

- [ ] **Step 5: Save migration SQL for reference**

Save the full SQL to `supabase/migrations/001_initial_schema.sql` for documentation.

- [ ] **Step 6: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase schema migration reference"
```

---

### Task 8: Auth store and helpers

**Files:**
- Create: `stores/authStore.ts`
- Create: `lib/auth.ts`

- [ ] **Step 1: Create auth store**

```ts
// stores/authStore.ts
import { create } from 'zustand';
import type { Profile } from '../types';
import type { Session } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ session: null, profile: null, isLoading: false }),
}));
```

- [ ] **Step 2: Create auth helpers**

```ts
// lib/auth.ts
import { supabase } from './supabase';
import type { Profile } from '../types';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function createProfile(userId: string, fullName: string, nickname: string, avatarLetter: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, full_name: fullName, nickname, avatar_letter: avatarLetter })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Pick<Profile, 'full_name' | 'nickname' | 'avatar_letter'>>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 3: Commit**

```bash
git add stores/authStore.ts lib/auth.ts
git commit -m "feat: add auth store and helpers"
```

---

### Task 9: Auth screens (Login, Register)

**Files:**
- Create: `app/(auth)/_layout.tsx`
- Create: `app/(auth)/login.tsx`
- Create: `app/(auth)/register.tsx`

- [ ] **Step 1: Create auth layout**

```tsx
// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
```

- [ ] **Step 2: Create login screen**

```tsx
// app/(auth)/login.tsx
import { useState } from 'react';
import { View, TextInput, Pressable, Text, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { signIn } from '../../lib/auth';
import { textPresets } from '../../theme/typography';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(main)');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-parchment items-center justify-center px-xxl">
      <View className="w-full max-w-[400px]">
        {/* Logo */}
        <View className="flex-row items-baseline mb-xxxl self-center">
          <Text style={[textPresets.heroName, { color: colors.ink }]}>K</Text>
          <Text style={[textPresets.heroName, { fontFamily: 'Fraunces_300Light_Italic', color: colors.blue, fontSize: 32 }]}>°</Text>
        </View>

        {/* Inputs */}
        <TextInput
          className="w-full border border-border-soft rounded-xl px-lg py-md mb-md bg-parchment"
          placeholder="Email"
          placeholderTextColor={colors.inkGhost}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.ink }}
        />
        <TextInput
          className="w-full border border-border-soft rounded-xl px-lg py-md mb-xl bg-parchment"
          placeholder="Mot de passe"
          placeholderTextColor={colors.inkGhost}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.ink }}
        />

        {/* Button */}
        <Pressable
          className="w-full bg-dark rounded-xl py-md items-center"
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.darkText }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Text>
        </Pressable>

        {/* Link to register */}
        <Link href="/(auth)/register" className="mt-lg self-center">
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.blue }}>
            Pas encore de compte ? S'inscrire
          </Text>
        </Link>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Create register screen**

Similar to login but with:
- Full name field
- Nickname field (for "Bonjour X.")
- Avatar letter picker (single character)
- Calls `signUp` then `createProfile`
- Redirects to `/(main)` on success

- [ ] **Step 4: Update root layout to handle auth state**

```tsx
// app/_layout.tsx — update to handle auth routing
import '../global.css';
import { useEffect } from 'react';
import { Slot, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Fraunces_900Black, Fraunces_700Bold, Fraunces_300Light_Italic } from '@expo-google-fonts/fraunces';
import { DMSans_300Light, DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { getProfile } from '../lib/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_900Black, Fraunces_700Bold, Fraunces_300Light_Italic,
    DMSans_300Light, DMSans_400Regular, DMSans_500Medium,
  });

  const { session, isLoading, setSession, setProfile, setLoading } = useAuthStore();
  const segments = useSegments();

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Route protection
  useEffect(() => {
    if (isLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(main)');
    }
  }, [session, isLoading, fontsLoaded, segments]);

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded || isLoading) return null;

  return <Slot />;
}
```

- [ ] **Step 5: Run app and verify auth flow**

Expected: App opens → redirected to login screen. Can navigate to register. After login, redirected to main.

- [ ] **Step 6: Commit**

```bash
git add app/_layout.tsx app/(auth)/
git commit -m "feat: add auth screens and session management"
```

---

## Chunk 2: Layout & UI Components

### Task 10: Three-column layout

**Files:**
- Create: `components/layout/ThreeColumnLayout.tsx`
- Create: `components/layout/Rail.tsx`
- Create: `components/layout/Sidebar.tsx`
- Create: `app/(main)/_layout.tsx`

- [ ] **Step 1: Create ThreeColumnLayout**

```tsx
// components/layout/ThreeColumnLayout.tsx
import { View } from 'react-native';
import { Rail } from './Rail';
import { Sidebar } from './Sidebar';

type Props = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
};

export function ThreeColumnLayout({ children, sidebar }: Props) {
  return (
    <View className="flex-1 flex-row bg-parchment">
      <Rail />
      <View className="flex-1 border-l border-border">
        {children}
      </View>
      {sidebar && (
        <View className="w-[280px] border-l border-border">
          {sidebar}
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 2: Create Rail component**

```tsx
// components/layout/Rail.tsx
import { View, Pressable, Text } from 'react-native';
import { usePathname, router } from 'expo-router';
import {
  House, Calendar, BookOpen, CheckSquare, BarChart3,
  Timer, Brain, Smile, Calculator, Settings,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../stores/authStore';

const mainItems = [
  { icon: House, path: '/(main)', label: 'Home' },
  { icon: Calendar, path: '/(main)/calendar', label: 'Calendrier' },
  { icon: BookOpen, path: '/(main)/notebooks', label: 'Cahiers' },
  { icon: CheckSquare, path: '/(main)/tasks', label: 'Tâches' },
  { icon: BarChart3, path: '/(main)/stats', label: 'Stats' },
];

const extraItems = [
  { icon: Timer, path: '/(main)/pomodoro', label: 'Pomodoro' },
  { icon: Brain, path: '/(main)/flashcards', label: 'Flashcards' },
  { icon: Smile, path: '/(main)/mood', label: 'Humeur' },
  { icon: Calculator, path: '/(main)/calculator', label: 'Calculatrice' },
];

export function Rail() {
  const pathname = usePathname();
  const profile = useAuthStore((s) => s.profile);

  const isActive = (path: string) => {
    if (path === '/(main)') return pathname === '/' || pathname === '/(main)';
    return pathname.startsWith(path.replace('/(main)', ''));
  };

  const renderItem = ({ icon: Icon, path, label }: typeof mainItems[0]) => {
    const active = isActive(path);
    return (
      <Pressable
        key={path}
        onPress={() => router.push(path)}
        className="w-full items-center py-md relative"
      >
        {active && (
          <View className="absolute left-0 top-[25%] h-[50%] w-[2px] bg-accent rounded-r-full" />
        )}
        <Icon
          size={22}
          strokeWidth={1.6}
          color={active ? colors.ink : colors.inkGhost}
        />
      </Pressable>
    );
  };

  return (
    <View className="w-[72px] bg-parchment items-center py-xxl justify-between">
      {/* Logo */}
      <View className="items-center mb-xxl">
        <View className="flex-row items-baseline">
          <Text style={{ fontFamily: 'Fraunces_900Black', fontSize: 22, color: colors.ink }}>K</Text>
          <Text style={{ fontFamily: 'Fraunces_300Light_Italic', fontSize: 14, color: colors.blue }}>°</Text>
        </View>
      </View>

      {/* Main nav */}
      <View className="flex-1">
        {mainItems.map(renderItem)}

        {/* Separator */}
        <View className="w-[24px] h-[1px] bg-border self-center my-lg" />

        {extraItems.map(renderItem)}
      </View>

      {/* Bottom: avatar + settings */}
      <View className="items-center">
        <Pressable onPress={() => router.push('/(modals)/settings')}>
          <Settings size={20} strokeWidth={1.6} color={colors.inkGhost} />
        </Pressable>
        <View className="w-[32px] h-[32px] rounded-full border border-border-soft items-center justify-center mt-md">
          <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.ink }}>
            {profile?.avatar_letter ?? '?'}
          </Text>
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Create Sidebar component**

```tsx
// components/layout/Sidebar.tsx
import { View, ScrollView } from 'react-native';

type Props = {
  children: React.ReactNode;
};

export function Sidebar({ children }: Props) {
  return (
    <ScrollView className="flex-1 bg-parchment p-xxl" showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}
```

- [ ] **Step 4: Create main layout with three-column structure**

```tsx
// app/(main)/_layout.tsx
import { Slot } from 'expo-router';
import { ThreeColumnLayout } from '../../components/layout/ThreeColumnLayout';

export default function MainLayout() {
  return (
    <ThreeColumnLayout>
      <Slot />
    </ThreeColumnLayout>
  );
}
```

**Sidebar architecture:** Use a React context (`SidebarContext`) in the main layout. Each screen calls `useSidebar(content)` on mount to inject its sidebar content. The context provides `sidebarContent` which `ThreeColumnLayout` reads. This avoids prop drilling and lets each screen own its sidebar.

```tsx
// components/layout/SidebarContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

const SidebarContext = createContext<{
  content: ReactNode | null;
  setSidebar: (content: ReactNode | null) => void;
}>({ content: null, setSidebar: () => {} });

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [content, setSidebar] = useState<ReactNode | null>(null);
  return (
    <SidebarContext.Provider value={{ content, setSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
```

The main layout wraps with `SidebarProvider` and passes `content` to `ThreeColumnLayout`.

- [ ] **Step 5: Create placeholder index screen**

```tsx
// app/(main)/index.tsx
import { View, Text } from 'react-native';
import { textPresets } from '../../theme/typography';
import { colors } from '../../theme/colors';

export default function DashboardScreen() {
  return (
    <View className="flex-1 bg-parchment p-xxl">
      <Text style={[textPresets.heroName, { color: colors.ink }]}>
        Bonjour{'\n'}Enzo
        <Text style={{ fontFamily: 'Fraunces_300Light_Italic', color: colors.blue }}>.</Text>
      </Text>
    </View>
  );
}
```

- [ ] **Step 6: Run app and verify three-column layout displays**

Expected: Rail on left with K° logo and nav icons, main content area with "Bonjour Enzo." text, parchment background everywhere.

- [ ] **Step 7: Commit**

```bash
git add components/layout/ app/(main)/
git commit -m "feat: add three-column iPad layout with rail navigation"
```

---

### Task 11: UI atomic components

**Files:**
- Create: `components/ui/Text.tsx`
- Create: `components/ui/Card.tsx`
- Create: `components/ui/Badge.tsx`
- Create: `components/ui/Checkbox.tsx`
- Create: `components/ui/ProgressBar.tsx`
- Create: `components/ui/IconButton.tsx`
- Create: `components/ui/SectionDivider.tsx`

- [ ] **Step 1: Create Text component**

A wrapper that applies Kurso font presets and handles the italic blue unit pattern.

```tsx
// components/ui/Text.tsx
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { textPresets } from '../../theme/typography';
import { colors } from '../../theme/colors';

type Preset = keyof typeof textPresets;

type Props = TextProps & {
  preset?: Preset;
  color?: string;
};

export function KText({ preset, color, style, ...props }: Props) {
  const presetStyle = preset ? textPresets[preset] : {};
  return (
    <RNText
      style={[presetStyle, color ? { color } : {}, style] as TextStyle[]}
      {...props}
    />
  );
}

// Helper for the italic blue unit pattern: "4h" → <StatValue>4<StatUnit>h</StatUnit></StatValue>
type UnitProps = { children: React.ReactNode };
export function BlueUnit({ children }: UnitProps) {
  return (
    <RNText style={{ fontFamily: 'Fraunces_300Light_Italic', color: colors.blue }}>
      {children}
    </RNText>
  );
}
```

- [ ] **Step 2: Create Card component**

```tsx
// components/ui/Card.tsx
import { View, Pressable, ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolateColor } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = ViewProps & {
  onPress?: () => void;
  inverted?: boolean;
};

export function Card({ onPress, inverted, className, children, ...props }: Props) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(pressed.value, [0, 1], ['#E8E2DA', '#111111']),
  }));

  const bg = inverted ? 'bg-dark' : 'bg-parchment';

  if (onPress) {
    return (
      <AnimatedPressable
        onPressIn={() => { pressed.value = withTiming(1, { duration: 150 }); }}
        onPressOut={() => { pressed.value = withTiming(0, { duration: 150 }); }}
        onPress={onPress}
        className={`border rounded-xl p-lg ${bg} ${className ?? ''}`}
        style={[animatedStyle]}
        {...props}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View className={`border border-border rounded-xl p-lg ${bg} ${className ?? ''}`} {...props}>
      {children}
    </View>
  );
}
```

- [ ] **Step 3: Create Badge component**

```tsx
// components/ui/Badge.tsx
import { View, Text } from 'react-native';
import { textPresets } from '../../theme/typography';

type Props = {
  label: string;
  variant?: 'default' | 'accent' | 'exam';
};

const variantStyles = {
  default: 'bg-dark',
  accent: 'bg-accent',
  exam: 'bg-exam-red',
};

export function Badge({ label, variant = 'default' }: Props) {
  return (
    <View className={`px-sm py-[3px] rounded-pill ${variantStyles[variant]}`}>
      <Text style={[textPresets.badgePill, { color: '#F7F3ED' }]}>{label}</Text>
    </View>
  );
}
```

- [ ] **Step 4: Create Checkbox component**

```tsx
// components/ui/Checkbox.tsx
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { colors } from '../../theme/colors';

type Props = {
  checked: boolean;
  onToggle: () => void;
};

export function Checkbox({ checked, onToggle }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: checked ? colors.ink : 'transparent',
    borderColor: checked ? colors.ink : colors.inkDim,
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withSpring(1, { damping: 15 }),
    );
    onToggle();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        className="w-[14px] h-[14px] rounded-[4px] border-[1.5px] items-center justify-center"
        style={animatedStyle}
      >
        {checked && <Check size={10} color={colors.darkText} strokeWidth={2.5} />}
      </Animated.View>
    </Pressable>
  );
}
```

- [ ] **Step 5: Create ProgressBar component**

```tsx
// components/ui/ProgressBar.tsx
import { View } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
  progress: number; // 0-1
};

export function ProgressBar({ progress }: Props) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  return (
    <View className="h-[2px] bg-border-soft rounded-full w-full">
      <View
        className="h-full bg-dark rounded-full relative"
        style={{ width: `${clampedProgress * 100}%` }}
      >
        {/* Blue dot at the end */}
        <View
          className="absolute right-0 top-1/2 w-[6px] h-[6px] rounded-full bg-accent"
          style={{ transform: [{ translateY: -3 }, { translateX: 3 }] }}
        />
      </View>
    </View>
  );
}
```

- [ ] **Step 6: Create IconButton component**

```tsx
// components/ui/IconButton.tsx
import { Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import type { LucideIcon } from 'lucide-react-native';

type Props = {
  icon: LucideIcon;
  onPress: () => void;
  size?: number;
  active?: boolean;
};

export function IconButton({ icon: Icon, onPress, size = 18, active }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[36px] h-[36px] rounded-md border border-border-soft items-center justify-center"
    >
      <Icon
        size={size}
        strokeWidth={1.6}
        color={active ? colors.ink : colors.inkGhost}
      />
    </Pressable>
  );
}
```

- [ ] **Step 7: Create SectionDivider component**

```tsx
// components/ui/SectionDivider.tsx
import { View, Pressable } from 'react-native';
import { KText } from './Text';
import { colors } from '../../theme/colors';

type Props = {
  title: string;
  action?: string;
  onAction?: () => void;
};

export function SectionDivider({ title, action, onAction }: Props) {
  return (
    <View className="flex-row items-center gap-md my-lg">
      <KText preset="sectionTitle" color={colors.ink}>{title}</KText>
      <View className="flex-1 h-[1px] bg-border" />
      {action && (
        <Pressable onPress={onAction}>
          <KText preset="sectionAction" color={colors.blue}>{action}</KText>
        </Pressable>
      )}
    </View>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add components/ui/
git commit -m "feat: add UI atomic components (Text, Card, Badge, Checkbox, ProgressBar, IconButton, SectionDivider)"
```

---

### Task 12: Utility helpers

**Files:**
- Create: `lib/utils.ts`

- [ ] **Step 1: Create utils**

```ts
// lib/utils.ts
const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export function getDayName(date: Date): string {
  return DAYS_FR[date.getDay()];
}

export function getMonthName(date: Date): string {
  return MONTHS_FR[date.getMonth()];
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function formatDateFR(date: Date): string {
  return `${getDayName(date)} ${date.getDate()} ${getMonthName(date)}`;
}

export function formatTime(date: Date): { hours: string; minutes: string } {
  return {
    hours: date.getHours().toString().padStart(2, '0'),
    minutes: date.getMinutes().toString().padStart(2, '0'),
  };
}

export function getEventDurationMinutes(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / 60000;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

export function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/utils.ts
git commit -m "feat: add date/time utility helpers (French locale)"
```

---

## Chunk 3: Core Features — Dashboard, Schedule Store, Tasks, Calendar

### Task 13: Schedule store

**Files:**
- Create: `stores/scheduleStore.ts`

- [ ] **Step 1: Create schedule store**

```ts
// stores/scheduleStore.ts
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
    const { data, error } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });
    if (!error && data) set({ events: data });
    set({ isLoading: false });
  },

  addEvent: async (event) => {
    const { data, error } = await supabase
      .from('schedule_events')
      .insert(event)
      .select()
      .single();
    if (!error && data) set({ events: [...get().events, data] });
  },

  updateEvent: async (id, updates) => {
    const { data, error } = await supabase
      .from('schedule_events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      set({ events: get().events.map((e) => (e.id === id ? data : e)) });
    }
  },

  deleteEvent: async (id) => {
    const { error } = await supabase
      .from('schedule_events')
      .delete()
      .eq('id', id);
    if (!error) set({ events: get().events.filter((e) => e.id !== id) });
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git add stores/scheduleStore.ts
git commit -m "feat: add schedule events store with Supabase CRUD"
```

---

### Task 14: Tasks store

**Files:**
- Create: `stores/tasksStore.ts`

- [ ] **Step 1: Create tasks store**

```ts
// stores/tasksStore.ts
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Task } from '../types';

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
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });
    if (!error && data) set({ tasks: data });
    set({ isLoading: false });
  },

  addTask: async (task) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, is_done: false, sort_order: 0 })
      .select()
      .single();
    if (!error && data) set({ tasks: [data, ...get().tasks] });
  },

  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const is_done = !task.is_done;
    const done_at = is_done ? new Date().toISOString() : null;
    const { data, error } = await supabase
      .from('tasks')
      .update({ is_done, done_at, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      set({ tasks: get().tasks.map((t) => (t.id === id ? data : t)) });
    }
  },

  deleteTask: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git add stores/tasksStore.ts
git commit -m "feat: add tasks store with Supabase CRUD"
```

---

### Task 15: Subjects store

**Files:**
- Create: `stores/subjectsStore.ts`

- [ ] **Step 1: Create subjects store**

```ts
// stores/subjectsStore.ts
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
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    if (!error && data) set({ subjects: data });
    set({ isLoading: false });
  },

  addSubject: async (subject) => {
    const { data, error } = await supabase
      .from('subjects')
      .insert(subject)
      .select()
      .single();
    if (!error && data) set({ subjects: [...get().subjects, data] });
  },

  updateSubject: async (id, updates) => {
    const { data, error } = await supabase
      .from('subjects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      set({ subjects: get().subjects.map((s) => (s.id === id ? data : s)) });
    }
  },

  deleteSubject: async (id) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (!error) set({ subjects: get().subjects.filter((s) => s.id !== id) });
  },

  getSubject: (id) => get().subjects.find((s) => s.id === id),
}));
```

- [ ] **Step 2: Commit**

```bash
git add stores/subjectsStore.ts
git commit -m "feat: add subjects store with Supabase CRUD"
```

---

### Task 16: Dashboard screen

**Files:**
- Create: `components/dashboard/Header.tsx`
- Create: `components/dashboard/StatsBand.tsx`
- Create: `components/dashboard/StatBlock.tsx`
- Create: `components/dashboard/TimelineCard.tsx`
- Modify: `app/(main)/index.tsx`

- [ ] **Step 1: Create Header component**

Dashboard header with "Bonjour Enzo." greeting, eyebrow with day/week, date chip, and notification button. Follow spec section "Dashboard > Header" exactly.

Key details:
- Eyebrow: `getDayName(now) · Semaine ${getWeekNumber(now)}` in DM Sans Medium 9px uppercase #B8B0A4
- Title: "Bonjour\n{nickname}" in Fraunces Black 48px, "." in Fraunces Light Italic blue
- Date chip: dark pill with formatted date
- Notification bell: circle bordered, optional blue dot

- [ ] **Step 2: Create StatBlock component**

Implements the 4 stat block variants (big, med, sm, accent) with ghost numbers.

Key details:
- `variant` prop controls size and styling
- Ghost number: absolute positioned, bottom-right, 72px, opacity 4-7%
- Blue unit: italic blue for units ("h", "%", etc.)
- Press animation: translateY(-2px) via Reanimated

- [ ] **Step 3: Create StatsBand component**

Horizontal ScrollView of StatBlocks. Calculates stats from stores:
- "Xh cours aujourd'hui" — sum of today's event durations
- "X tâches restantes" — count of undone tasks
- "X rendu demain" — tasks due tomorrow
- "X% semaine complétée" — past events / total events this week

- [ ] **Step 4: Create TimelineCard component**

Renders a single course in the timeline. States: past (opacity 0.38), now (inverted bg-dark + "EN COURS" badge), next (dot black), later (dot grey). Press animation: translateX(3px).

- [ ] **Step 5: Build full Dashboard screen**

Assemble all components in `app/(main)/index.tsx`:
1. Header
2. StatsBand
3. SectionDivider "Aujourd'hui — semaine →"
4. Timeline (list of TimelineCards with time column + vertical line + dots)
5. ProgressBar (week progress)

Wrap in ScrollView. Fetch data from stores on mount.

- [ ] **Step 6: Run app and verify dashboard renders**

Expected: Full dashboard with header, stats, timeline on parchment background. Rail navigation works.

- [ ] **Step 7: Commit**

```bash
git add components/dashboard/ app/(main)/index.tsx
git commit -m "feat: build dashboard screen with header, stats band, timeline"
```

---

### Task 17: Dashboard sidebar

**Files:**
- Create: `components/calendar/MiniCalendar.tsx`
- Modify: `app/(main)/_layout.tsx`
- Modify: `app/(main)/index.tsx`

- [ ] **Step 1: Create MiniCalendar component**

7-column grid calendar for sidebar. Uses `react-native-calendars` or custom grid.
- Today: bg-dark, text-dark-text
- Days with events: small blue dot (3px) below number
- Out-of-month days: text-ink-dim
- Day headers: calHeader preset (uppercase, 8px)
- Month name: monthName preset

- [ ] **Step 2: Update main layout to support per-screen sidebar**

Modify `app/(main)/_layout.tsx` to pass sidebar content based on the current route. The dashboard sidebar contains:
1. MiniCalendar
2. Quick tasks (next 4-5 undone tasks) — reuse TaskItem component
3. Recent notes (last 3) — use NoteCard component (placeholder for now)

- [ ] **Step 3: Integrate sidebar into dashboard**

Wire up the sidebar content for the dashboard screen. The sidebar reads from tasksStore and notesStore.

- [ ] **Step 4: Commit**

```bash
git add components/calendar/MiniCalendar.tsx app/(main)/_layout.tsx app/(main)/index.tsx
git commit -m "feat: add dashboard sidebar with mini calendar, quick tasks, recent notes"
```

---

### Task 18: Tasks screen

**Files:**
- Create: `components/tasks/TaskItem.tsx`
- Create: `components/tasks/TaskList.tsx`
- Create: `app/(main)/tasks.tsx`

- [ ] **Step 1: Create TaskItem component**

A single task row with:
- Checkbox (14px square, radius 4px)
- Task title (taskText preset, strikethrough when done with animation)
- Due date (taskDue preset, blue if upcoming, grey if done)
- Subject color dot (optional)
- Swipe left to delete (using Gesture Handler)

Strikethrough animation: line width 0% → 100% over 300ms ease-in-out.

- [ ] **Step 2: Create TaskList component**

Groups tasks into sections:
- "Aujourd'hui" — due_date is today
- "Cette semaine" — due_date is this week
- "Plus tard" — due_date is later or null
- "Terminées" — is_done = true (collapsed by default)

Each section separated by SectionDivider.

- [ ] **Step 3: Create Tasks screen**

```tsx
// app/(main)/tasks.tsx
import { View } from 'react-native';
import { TaskList } from '../../components/tasks/TaskList';
import { useTasksStore } from '../../stores/tasksStore';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';

export default function TasksScreen() {
  const { tasks, fetchTasks } = useTasksStore();
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (session?.user) fetchTasks(session.user.id);
  }, [session]);

  return (
    <View className="flex-1 bg-parchment p-xxl">
      <TaskList tasks={tasks} />
    </View>
  );
}
```

- [ ] **Step 4: Run and verify tasks screen**

Expected: Navigate to Tasks via rail. See grouped task list. Can check/uncheck tasks with animation.

- [ ] **Step 5: Commit**

```bash
git add components/tasks/ app/(main)/tasks.tsx
git commit -m "feat: add tasks screen with grouped list and checkbox animations"
```

---

### Task 19: Calendar screen

**Files:**
- Create: `components/calendar/MonthView.tsx`
- Create: `components/calendar/WeekView.tsx`
- Create: `components/calendar/DayView.tsx`
- Create: `app/(main)/calendar.tsx`

- [ ] **Step 1: Create MonthView component**

Full-screen month calendar using `react-native-calendars` customized with Kurso theme:
- Background: parchment
- Today: dark circle
- Days with events: blue dots
- Selected day: border accent
- Header: month Fraunces Bold + year DM Sans Light + navigation arrows
- Day cells can show up to 2-3 event bars

- [ ] **Step 2: Create WeekView component**

Horizontal 7-day timeline with hourly grid. Events rendered as blocks positioned by start_time/end_time. Similar to Apple Calendar week view. Uses Kurso card styling (border, no shadow).

- [ ] **Step 3: Create DayView component**

Detailed day view: hour-by-hour timeline (similar to dashboard timeline but full-day, 6:00-22:00). Events as positioned cards.

- [ ] **Step 4: Create Calendar screen with view toggle**

```tsx
// app/(main)/calendar.tsx
// Toggle between MonthView, WeekView, DayView
// Header with view mode pills: "Mois | Semaine | Jour"
// Import ICS button in header
```

The selected day in month view → shown in sidebar with event list.

- [ ] **Step 5: Add ICS import functionality**

Install `ical.js` and create `lib/ics-parser.ts`:
- Parse ICS file or URL content
- Extract events with title, location, start/end times, recurrence rules
- Map to `ScheduleEvent` type
- Handle UTF-8/mojibake cleaning (port from Flutter version's `cleanText()`)

Create `app/(modals)/import-ics.tsx`:
- File picker (expo-document-picker) for .ics files
- URL input for remote ICS
- Preview of parsed events
- Confirm to import into schedule_events table

- [ ] **Step 6: Run and verify calendar**

Expected: Month/week/day views work. Can switch between them. Events show as dots/blocks. ICS import modal works.

- [ ] **Step 7: Commit**

```bash
git add components/calendar/ app/(main)/calendar.tsx lib/ics-parser.ts app/(modals)/import-ics.tsx
git commit -m "feat: add calendar screen with month/week/day views and ICS import"
```

---

### Task 20: New task modal

**Files:**
- Create: `app/(modals)/new-task.tsx`
- Create: `app/(modals)/_layout.tsx`

- [ ] **Step 1: Create modals layout**

```tsx
// app/(modals)/_layout.tsx
import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal', headerShown: false }}>
      <Stack.Screen name="new-task" />
      <Stack.Screen name="new-event" />
      <Stack.Screen name="import-ics" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
```

- [ ] **Step 2: Create new task modal**

Bottom sheet or modal with:
- Title input (DM Sans Regular, placeholder "Nouvelle tâche...")
- Subject picker (horizontal chips from subjectsStore)
- Due date picker (date selector)
- Save button (dark, full width)

Uses `@gorhom/bottom-sheet` styled with Kurso theme.

- [ ] **Step 3: Create new event modal**

Similar modal for creating schedule events:
- Title, location, subject picker
- Start/end time pickers
- Recurrence selector (simple: none, daily, weekly, custom RRULE)
- Toggle "Examen" which shows additional fields (exam-specific notes)
- Save → creates `schedule_events` row (or `exams` row if toggle is on)

- [ ] **Step 4: Commit**

```bash
git add app/(modals)/
git commit -m "feat: add new task and new event modals"
```

---

## Chunk 4: Content Features — Notes, Notebooks, Voice Notes, PDF

### Task 21: Notes store

**Files:**
- Create: `stores/notesStore.ts`

- [ ] **Step 1: Create notes store**

Same pattern as other stores. CRUD for `notes` table. Includes `fetchRecentNotes(userId, limit)` for dashboard sidebar.

- [ ] **Step 2: Commit**

```bash
git add stores/notesStore.ts
git commit -m "feat: add notes store with Supabase CRUD"
```

---

### Task 22: Notes components

**Files:**
- Create: `components/notes/NoteCard.tsx`
- Create: `components/notes/NoteEditor.tsx`

- [ ] **Step 1: Create NoteCard component**

Card with:
- Category label (subject name, noteCategory preset, uppercase blue)
- Title (noteTitle preset, Fraunces Bold 12.5px)
- Preview text (notePreview preset, 2 lines, line-clamp)
- Border → #111 on press animation

- [ ] **Step 2: Create NoteEditor component**

Wrapper around `@10play/tentap-editor`:
- Install: `npx expo install @10play/tentap-editor`
- Configure TipTap with basic extensions: bold, italic, headings, lists, code blocks
- Style content area with DM Sans Regular 14px, line-height 1.7, color #1A1A1A
- Title field: Fraunces Bold, large, no visible border
- Auto-save: debounced (1.5s) write to Supabase on content change
- Saved indicator: "Enregistré" in ink-muted that fades after 2s
- Subject chip in header

- [ ] **Step 3: Add notes list as sub-tab in notebooks screen**

The spec says notes are accessible "via un sous-onglet dans Cahiers". Add a toggle/tab at the top of `app/(main)/notebooks/index.tsx` with two modes: "Cahiers" (notebooks grid) and "Notes" (notes list). The notes list shows NoteCards filtered by subject chips. FAB "+" creates a new note.

- [ ] **Step 4: Commit**

```bash
git add components/notes/
git commit -m "feat: add NoteCard, NoteEditor, and notes list in notebooks screen"
```

---

### Task 23: Notebooks store and components

**Files:**
- Create: `stores/notebooksStore.ts`
- Create: `components/notebooks/NotebookCard.tsx`
- Create: `components/notebooks/PageThumbnail.tsx`
- Create: `app/(main)/notebooks/index.tsx`

- [ ] **Step 1: Create notebooks store**

CRUD for `notebooks` and `notebook_pages` tables. Methods:
- `fetchNotebooks(userId)`
- `fetchPages(notebookId)`
- `addNotebook(...)`, `deleteNotebook(...)`
- `addPage(...)`, `updatePage(...)`, `deletePage(...)`

- [ ] **Step 2: Create NotebookCard**

Card showing notebook with:
- Cover color strip (left border or top bar using notebook's `cover_color`)
- Title (Fraunces Bold)
- Page count (DM Sans Light)
- Subject name chip if linked

- [ ] **Step 3: Create PageThumbnail**

Small preview of a notebook page for the sidebar. Shows thumbnail image (from Supabase Storage) or a placeholder with template pattern.

- [ ] **Step 4: Create notebooks list screen**

```tsx
// app/(main)/notebooks/index.tsx
// Grid/list of NotebookCards
// Filter chips by subject
// FAB "+" to create new notebook
// Tap card → navigate to notebooks/[id]
```

- [ ] **Step 5: Commit**

```bash
git add stores/notebooksStore.ts components/notebooks/NotebookCard.tsx components/notebooks/PageThumbnail.tsx app/(main)/notebooks/index.tsx
git commit -m "feat: add notebooks store, card components, and list screen"
```

---

### Task 24: Skia canvas editor

**Files:**
- Create: `components/notebooks/SkiaCanvas.tsx`
- Create: `components/notebooks/DrawingToolbar.tsx`
- Create: `app/(main)/notebooks/[id].tsx`

- [ ] **Step 1: Install Skia**

```bash
npx expo install @shopify/react-native-skia
npx expo prebuild --clean
```

- [ ] **Step 2: Create SkiaCanvas component**

Drawing canvas using `@shopify/react-native-skia`:
- Full screen in main content area
- Captures touch/pencil input as paths
- Supports pressure sensitivity (stroke width varies)
- Drawing state serialized as JSON (array of paths with points, color, width)
- Undo/redo stack (in-memory array)
- Template rendering: blank, lined (horizontal rules), grid (squares), dotted (dot grid) — drawn as background paths in light ink-dim color

- [ ] **Step 3: Create DrawingToolbar component**

Bottom toolbar:
- Stroke width selector (3 sizes: thin 1px, medium 2px, thick 4px)
- Color selector: black #111, blue #3D5AFE, red #8B4B4B, eraser (white/transparent)
- Undo/redo buttons (IconButton)
- Template selector (4 options)
- Mic button (for voice notes, triggers bottom sheet)
- All buttons use Kurso styling (bordered, stroke icons)

- [ ] **Step 4: Create notebook editor screen**

```tsx
// app/(main)/notebooks/[id].tsx
// Full editor combining:
// - SkiaCanvas (main area)
// - DrawingToolbar (bottom)
// - Text overlay (optional, for typed annotations)
// - Sidebar: PageThumbnail list for page navigation
// - Auto-save drawing_data to Supabase on debounced change
// - Page navigation (prev/next, add page)
// - Export button in header (triggers PDF export)
```

- [ ] **Step 5: Run and verify drawing works on iPad**

Expected: Can draw with finger/pencil. Colors and widths work. Undo/redo works. Templates render. Drawing persists on page change.

- [ ] **Step 6: Commit**

```bash
git add components/notebooks/SkiaCanvas.tsx components/notebooks/DrawingToolbar.tsx app/(main)/notebooks/[id].tsx
git commit -m "feat: add Skia drawing canvas with toolbar and notebook editor"
```

---

### Task 25: Voice notes

**Files:**
- Create: `stores/voiceNotesStore.ts` (or add to notebooksStore)
- Modify: `components/notebooks/DrawingToolbar.tsx`

- [ ] **Step 1: Install expo-av**

```bash
npx expo install expo-av
```

- [ ] **Step 2: Add voice recording to toolbar**

When mic button is tapped:
1. Open bottom sheet with recording UI
2. Request microphone permission
3. Start recording with `expo-av` Audio.Recording (format: m4a/AAC)
4. Show waveform visualization (simplified: animated bars based on metering) + timer
5. Max duration: 5 minutes (auto-stop)
6. On stop: upload to Supabase Storage `voice-notes` bucket
7. Create `voice_notes` row linked to current `notebook_page_id`

- [ ] **Step 3: Add playback UI**

Voice notes for current page shown as pills in sidebar or toolbar area:
- Play/pause button
- Duration label
- Mini progress bar during playback

- [ ] **Step 4: Commit**

```bash
git add stores/ components/notebooks/
git commit -m "feat: add voice note recording and playback in notebook editor"
```

---

### Task 26: PDF export

**Files:**
- Create: `lib/pdf-export.ts`

- [ ] **Step 1: Install expo-print and expo-sharing**

```bash
npx expo install expo-print expo-sharing
```

- [ ] **Step 2: Create PDF export utility**

```ts
// lib/pdf-export.ts
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Export notebook: rasterize each Skia page to image, assemble in HTML, generate PDF
export async function exportNotebookToPdf(pages: { imageBase64: string }[], title: string) {
  const pagesHtml = pages
    .map((p) => `<div style="page-break-after: always;"><img src="data:image/png;base64,${p.imageBase64}" style="width:100%;"/></div>`)
    .join('');

  const html = `<html><body style="margin:0;padding:0;">${pagesHtml}</body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: title });
}

// Export note: convert TipTap JSON to HTML, render PDF
export async function exportNoteToPdf(htmlContent: string, title: string) {
  const html = `
    <html>
    <head><style>
      body { font-family: sans-serif; padding: 40px; color: #111; line-height: 1.7; }
      h1 { font-size: 24px; margin-bottom: 16px; }
    </style></head>
    <body><h1>${title}</h1>${htmlContent}</body>
    </html>
  `;
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: title });
}
```

- [ ] **Step 3: Wire export buttons**

Add export button (Download icon) in notebook editor header and note editor header. On press, trigger the appropriate export function.

- [ ] **Step 4: Commit**

```bash
git add lib/pdf-export.ts
git commit -m "feat: add PDF export for notebooks and notes"
```

---

## Chunk 5: Extra Features — Flashcards, Pomodoro, Mood, Calculator, Exams, Stats

### Task 27: Exams store

**Files:**
- Create: `stores/examsStore.ts`

- [ ] **Step 1: Create exams store**

Same pattern as other stores. CRUD for `exams` table. Includes `getUpcomingExams(userId, limit)` for sidebar.

- [ ] **Step 2: Commit**

```bash
git add stores/examsStore.ts
git commit -m "feat: add exams store"
```

---

### Task 28: Flashcards

**Files:**
- Create: `stores/flashcardsStore.ts`
- Create: `components/flashcards/DeckCard.tsx`
- Create: `components/flashcards/FlipCard.tsx`
- Create: `app/(main)/flashcards/index.tsx`
- Create: `app/(main)/flashcards/[deckId].tsx`

- [ ] **Step 1: Create flashcards store**

CRUD for `decks` and `flashcards` tables. Includes SM-2 algorithm implementation:

```ts
// SM-2 algorithm helper
export function calculateSM2(quality: number, easeFactor: number, interval: number) {
  // quality: 0-5 (0-2 = fail, 3-5 = pass)
  let newEase = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEase = Math.max(1.3, newEase);

  let newInterval: number;
  if (quality < 3) {
    newInterval = 0; // reset
  } else if (interval === 0) {
    newInterval = 1;
  } else if (interval === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * newEase);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return { ease_factor: newEase, interval: newInterval, next_review: nextReview.toISOString() };
}
```

Methods: `fetchDecks`, `addDeck`, `deleteDeck`, `fetchCards(deckId)`, `addCard`, `reviewCard(id, quality)`.

- [ ] **Step 2: Create DeckCard component**

Card showing deck with title, card count, due-for-review count, subject chip. Tap → navigate to review screen.

- [ ] **Step 3: Create FlipCard component**

Animated flip card using Reanimated rotateY:
- Front: bg-dark, question in Fraunces Bold white, centered
- Back: bg-parchment, answer in DM Sans Regular, centered
- Tap to flip (400ms spring animation)

- [ ] **Step 4: Create flashcards list screen**

Grid of DeckCards. FAB "+" to create new deck. Shows total cards due for review today.

- [ ] **Step 5: Create flashcard creation/editing UI**

In the deck detail screen or via a bottom sheet:
- Two text inputs: "Recto" (front) and "Verso" (back)
- Subject association inherited from deck
- Save button → calls `addCard` on store
- Edit existing card: tap a card in the deck list to edit front/back
- Swipe to delete card

- [ ] **Step 6: Create review screen**

`app/(main)/flashcards/[deckId].tsx`:
- Shows cards due for review (next_review <= now or null)
- FlipCard in center
- After flip, show 3 difficulty buttons: "Difficile" / "Moyen" / "Facile" (maps to SM-2 quality 2/3/5)
- Progress through deck, show completion when done

- [ ] **Step 7: Commit**

```bash
git add stores/flashcardsStore.ts components/flashcards/ app/(main)/flashcards/
git commit -m "feat: add flashcards with SM-2 algorithm, deck list, card CRUD, and review screen"
```

---

### Task 29: Pomodoro

**Files:**
- Create: `stores/pomodoroStore.ts`
- Create: `components/pomodoro/TimerCircle.tsx`
- Create: `app/(main)/pomodoro.tsx`

- [ ] **Step 1: Create pomodoro store**

State: timer duration, remaining time, is_running, selected subject. Methods: start, pause, reset, complete (saves session to Supabase). History: fetch past sessions.

- [ ] **Step 2: Create TimerCircle component**

Circular timer using Skia or SVG:
- Arc drawn with stroke #111 (2px) on parchment background
- Progress arc fills as time passes
- Center: remaining time in Fraunces Black 48px, "min" in italic blue
- Uses Reanimated for smooth arc animation

- [ ] **Step 3: Create Pomodoro screen**

- TimerCircle centered
- Subject selector (chips)
- Duration selector (15/25/30/45 min pills)
- Start/Pause/Reset buttons (circles bordered, stroke icons)
- Session history below (list of past sessions with date, duration, subject)

- [ ] **Step 4: Commit**

```bash
git add stores/pomodoroStore.ts components/pomodoro/ app/(main)/pomodoro.tsx
git commit -m "feat: add pomodoro timer with history"
```

---

### Task 30: Mood tracking

**Files:**
- Create: `stores/moodStore.ts`
- Create: `components/mood/MoodPicker.tsx`
- Create: `components/mood/MoodHeatmap.tsx`
- Create: `app/(main)/mood.tsx`

- [ ] **Step 1: Create mood store**

CRUD for `mood_entries`. Includes `fetchMoodsByMonth(userId, year, month)` for heatmap.

- [ ] **Step 2: Create MoodPicker**

5 emoji buttons in bordered circles: 😊 🙂 😐 😕 😢. Selected = border accent. Optional note text input below.

- [ ] **Step 3: Create MoodHeatmap**

Calendar grid where each day shows the logged emoji. Empty days show empty square. Uses same grid layout as MiniCalendar.

- [ ] **Step 4: Create Mood screen**

- Today's mood picker at top (if not already logged today)
- MoodHeatmap for current month
- Month navigation arrows
- Optional: streak counter

- [ ] **Step 5: Commit**

```bash
git add stores/moodStore.ts components/mood/ app/(main)/mood.tsx
git commit -m "feat: add mood tracking with emoji picker and heatmap"
```

---

### Task 31: Calculator

**Files:**
- Create: `app/(main)/calculator.tsx`

- [ ] **Step 1: Create Calculator screen**

Self-contained screen, no store needed (local state only).

- Display: Fraunces Black 38px, right-aligned, single line
- Button grid (4 columns):
  - Row 1: AC, ±, %, ÷
  - Row 2: 7, 8, 9, ×
  - Row 3: 4, 5, 6, −
  - Row 4: 1, 2, 3, +
  - Row 5: 0 (2 cols), virgule, =
- Buttons: bordered #E0D8CE, radius 12px
- Digits: Fraunces Bold
- Operators: DM Sans Medium, color accent (blue)
- AC/±/%: DM Sans Medium, color ink-soft
- = button: bg-dark, text-dark-text

Standard calculator logic (two operands, one operator, chain operations).

- [ ] **Step 2: Commit**

```bash
git add app/(main)/calculator.tsx
git commit -m "feat: add basic calculator"
```

---

### Task 32: Stats screen

**Files:**
- Create: `app/(main)/stats.tsx`

- [ ] **Step 1: Create Stats screen**

Dashboard-style stats page with:
- **Cours cette semaine**: bar chart (7 bars for Mon-Sun, height = hours of courses). Bars are #111, labels DM Sans Light.
- **Tâches complétées**: big stat block — completed this week / total this week, with percentage
- **Streak**: consecutive days with at least one completed task or attended course
- **Progression par matière**: list of subjects with progress bars (tasks done / total tasks per subject)

All charts use the Kurso design language (no shadow, border-based, Fraunces for numbers, DM Sans for labels). Use simple View-based bars, no chart library needed.

- [ ] **Step 2: Commit**

```bash
git add app/(main)/stats.tsx
git commit -m "feat: add stats screen with weekly charts and progress"
```

---

## Chunk 6: Polish — Settings, Offline, Realtime, Final Integration

### Task 33: Settings modal

**Files:**
- Create: `app/(modals)/settings.tsx`

- [ ] **Step 1: Create Settings modal**

Sections:
1. **Profil**: Edit nickname, avatar letter. Save via `updateProfile()`.
2. **Matières**: List of subjects with color dot + name. Tap to edit (inline or sub-modal). Swipe to delete with confirmation. "+" button to add. Each subject: name, short_name, professor, color picker (8 predefined colors as circles), icon picker (grid of 20 lucide icons).
3. **Notifications**: Toggle switches for exam reminders (J-1, J-3, J-7) and task reminders. Uses expo-notifications for local notifications.
4. **Données**: "Exporter mes données" button (JSON export via expo-file-system + expo-sharing). "Supprimer mon compte" button (with confirmation, calls supabase.auth.admin or RPC).
5. **À propos**: Version, "Fait avec Kurso".

All styled with Kurso theme (parchment bg, bordered inputs, no shadows).

- [ ] **Step 2: Commit**

```bash
git add app/(modals)/settings.tsx
git commit -m "feat: add settings modal with profile, subjects CRUD, and preferences"
```

---

### Task 34: Supabase Realtime subscriptions

**Files:**
- Modify: `app/(main)/_layout.tsx`

- [ ] **Step 1: Set up realtime subscriptions**

In the main layout, subscribe to Supabase Realtime channels for:
- `tasks` — on INSERT/UPDATE/DELETE, update tasksStore
- `schedule_events` — on INSERT/UPDATE/DELETE, update scheduleStore
- `notes` — on INSERT/UPDATE/DELETE, update notesStore
- `notebook_pages` — on UPDATE, update notebooksStore

```ts
// In app/(main)/_layout.tsx useEffect:
const channel = supabase
  .channel('db-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
    // Refresh tasks store
  })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule_events' }, (payload) => {
    // Refresh schedule store
  })
  // ... etc
  .subscribe();

return () => { supabase.removeChannel(channel); };
```

- [ ] **Step 2: Commit**

```bash
git add app/(main)/_layout.tsx
git commit -m "feat: add Supabase Realtime subscriptions for live sync"
```

---

### Task 35: Offline support

**Files:**
- Create: `lib/offline.ts`
- Modify: `app/(main)/_layout.tsx`

- [ ] **Step 1: Create offline detection and banner**

```ts
// lib/offline.ts
import NetInfo from '@react-native-community/netinfo';
import { create } from 'zustand';

type NetworkState = {
  isOnline: boolean;
  setOnline: (online: boolean) => void;
};

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true,
  setOnline: (isOnline) => set({ isOnline }),
}));
```

Install: `npx expo install @react-native-community/netinfo`

- [ ] **Step 2: Add offline banner to main layout**

When offline, show a discreet banner at top: "Hors ligne" in DM Sans Medium 9px, bg surface-alt, wifi-off icon. Data displayed from MMKV cache (read-only).

- [ ] **Step 3: Implement mutation queue**

Zustand middleware that queues failed mutations (network errors) and replays them when connection returns. Simple array of `{ action, args }` persisted in MMKV.

- [ ] **Step 4: Commit**

```bash
git add lib/offline.ts app/(main)/_layout.tsx
git commit -m "feat: add offline detection, banner, and mutation queue"
```

---

### Task 36: Data fetching on app load

**Files:**
- Modify: `app/(main)/_layout.tsx`

- [ ] **Step 1: Fetch all data on main layout mount**

When the user enters the main layout (authenticated), fetch initial data for all stores:

```ts
useEffect(() => {
  if (!session?.user) return;
  const userId = session.user.id;

  // Fetch all in parallel
  Promise.all([
    subjectsStore.fetchSubjects(userId),
    scheduleStore.fetchEvents(userId),
    tasksStore.fetchTasks(userId),
    notesStore.fetchNotes(userId),
    notebooksStore.fetchNotebooks(userId),
    examsStore.fetchExams(userId),
  ]);
}, [session]);
```

- [ ] **Step 2: Commit**

```bash
git add app/(main)/_layout.tsx
git commit -m "feat: fetch all data on authenticated app load"
```

---

### Task 37: Final integration and polish

- [ ] **Step 1: Wire exams into calendar and dashboard**

- In MonthView/WeekView/DayView: render exams from examsStore as special events with Badge "EXAM" variant exam (red #8B4B4B)
- In calendar sidebar: add "Prochains examens" section using `getUpcomingExams()` with countdown labels (J-3, J-7...)
- In dashboard StatsBand: add exam stat ("1 examen cette semaine") by querying examsStore

- [ ] **Step 2: Add TTL cache refresh**

In `app/(main)/_layout.tsx`, set up a 5-minute interval that re-fetches dashboard data when the app is active:

```ts
useEffect(() => {
  const interval = setInterval(() => {
    if (session?.user) {
      scheduleStore.fetchEvents(session.user.id);
      tasksStore.fetchTasks(session.user.id);
    }
  }, 5 * 60 * 1000); // 5 minutes
  return () => clearInterval(interval);
}, [session]);
```

- [ ] **Step 3: Verify all navigation works**

Test every rail item navigates to the correct screen. Test modals open and close.

- [ ] **Step 4: Verify Kurso design compliance**

Go through each screen and check:
- Background is #F7F3ED everywhere
- Fonts are correct (Fraunces for titles/numbers, DM Sans for body)
- Blue italics on units
- No shadows, no gradients
- Borders are #E8E2DA / #E0D8CE
- Icons are stroke-only, 1.6px

- [ ] **Step 5: Test on iPad simulator**

Run on iPad simulator (or device):
```bash
npx expo run:ios --device "iPad"
```

Verify 3-column layout works, touch targets are appropriate, keyboard doesn't overlap inputs.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: final integration and design polish"
```

---

## Summary

| Chunk | Tasks | Focus |
|-------|-------|-------|
| 1 | 1-9 | Foundation: Expo, NativeWind, theme, fonts, Supabase, types, auth |
| 2 | 10-12 | Layout: 3-column iPad layout, Rail, UI atomic components, utils |
| 3 | 13-20 | Core: stores, dashboard, tasks screen, calendar, modals |
| 4 | 21-26 | Content: notes, notebooks, Skia canvas, voice notes, PDF export |
| 5 | 27-32 | Extras: exams, flashcards, pomodoro, mood, calculator, stats |
| 6 | 33-37 | Polish: settings, realtime, offline, data fetching, exam integration, TTL cache, final QA |
