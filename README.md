*[Version française](README.fr.md)*

# Kurso

A student life manager for iPad. Timetable, handwritten notes with the Apple Pencil, tasks, flashcards and revision tracking, all synced through Supabase.

The app is built iPad-first around a three-column layout — navigation rail, main area, contextual sidebar — and falls back to a bottom tab bar below 768px.

## Features

**Timetable** — Month, week and day calendar views, `.ics` file import, exams with a countdown, and a daily timeline on the dashboard that tracks which class has passed, which is running and which comes next.

**Notebooks** — A drawing editor built on native PencilKit: the pencil writes, fingers pan and zoom. Page templates (blank, ruled, grid, dotted) with a margin and hole punches. Photo import as a page background, PDF export, and voice notes attached to a page.

**Notes** — Text editor with title, subject, tags and an optional link to a class in the timetable. Search and filtering by subject or tag.

**Tasks** — Grouped by due date (today, this week, later, done), with subject and deadline.

**Flashcards** — Decks per subject, reviewed with the SM-2 algorithm (ease factor, interval, next review date).

**Revision mode** — Runs through a subject's notes and then its flashcards in a single session, with a progress bar.

**Gamification** — XP per action, a daily streak with freeze days, and milestone badges.

**Also** — Weekly statistics, a scientific calculator, a dark theme, and a full JSON export of your data.

## Stack

- Expo SDK 55 (prebuild workflow) and React Native 0.83
- Expo Router for file-based navigation
- Zustand — one store per domain
- NativeWind 4, backed by a `theme/` directory holding the colors and type presets used outside Tailwind classes
- Supabase — auth, PostgreSQL with RLS, Realtime, Storage
- `expo-pencilkit-ui` for the handwriting canvas, `expo-audio` for voice notes, `expo-print` for PDF export
- Fraunces and DM Sans via `@expo-google-fonts`

## Getting started

You need a development build. The app relies on native modules (PencilKit, MMKV, Reanimated), so **Expo Go will not work**.

```bash
git clone https://github.com/Nitrozer/kurso-expo.git
cd kurso-expo
npm install
```

The `postinstall` step patches `expo-pencilkit-ui` — see [The PencilKit patch](#the-pencilkit-patch) below.

### Supabase

Create a project on [supabase.com](https://supabase.com), then apply the migrations:

```bash
supabase link --project-ref <your-ref>
supabase db push
```

Then create a Storage bucket named `voice-notes` for the audio recordings.

### Environment variables

In a `.env` file at the root:

```
EXPO_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Running it

The `ios/` and `android/` directories are not checked in, so generate them first:

```bash
npx expo prebuild
npm run ios      # or: npm run android
```

## Project structure

```
app/                  screens (expo-router)
  (auth)/             sign in, sign up
  (main)/             three-column layout + main screens
  (modals)/           new task, new event, ICS import, settings
components/           components by domain (calendar, notebooks, notes, tasks, ui…)
stores/               Zustand stores, one per domain
lib/                  Supabase client, auth, ICS parser, PDF export, helpers
theme/                colors, typography, spacing
supabase/migrations/  SQL schema
```

Each store talks to Supabase directly and updates its own local state. There is no repository layer in between — that is deliberate, since the app has a single source of truth.

Screens push their own sidebar content through a dedicated store (`SidebarContext`), which lets each screen decide what belongs there without the layout needing to know about any of them.

## Database

Eleven main tables: `profiles`, `subjects`, `schedule_events`, `tasks`, `notes`, `notebooks`, `notebook_pages`, `exams`, `decks`, `flashcards`, `voice_notes`, plus three for gamification (`daily_activity`, `streaks`, `badges`).

RLS is enabled everywhere with an `auth.uid() = user_id` policy. A trigger on `auth.users` creates the profile automatically on sign-up.

The initial migration also creates `pomodoro_sessions` and `mood_entries`, left over from two features that have since been removed. Nothing in the app uses them.

The main layout subscribes to Realtime changes on `tasks`, `schedule_events`, `notes`, `subjects` and `exams` for multi-device sync, with a fallback refresh every 5 minutes.

## The PencilKit patch

`expo-pencilkit-ui` exposes the canvas but not the settings needed for GoodNotes-like behaviour. `scripts/patch-pencilkit.sh` edits the module's Swift file after install to:

- set `drawingPolicy` to `.pencilOnly` — otherwise a finger draws instead of scrolling
- raise the maximum zoom to 5x
- make the canvas transparent, so the page template (lines, grid, margin) stays visible underneath

The script also restores the package's build files, which npm sometimes strips.

## Known limitations

- **Notebooks are iOS-only.** PencilKit is an Apple API, so the drawing editor does not work on Android.
- **Notifications are disabled.** `lib/notifications.ts` contains stubs only: the Push Notifications capability requires a paid Apple Developer account. Exam and task reminders are already wired up and only need the stubs removed.
- **Recurring classes are not expanded.** The RRULE is stored correctly on ICS import, but it is never expanded client-side, so a weekly class shows up only once in the calendar.
- **The dark theme is partial.** Only the rail and the layout consume `useColors()`; most screens still import the light palette directly.
- **Offline mode is read-only** and backed by in-memory cache alone — it shows a banner, but mutations are not queued for replay.
