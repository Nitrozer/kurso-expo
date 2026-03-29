# Stitch Design Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt every screen of the Kurso Expo app to match the Stitch mockups — refined parchment aesthetic with editorial typography, bottom mobile nav, enhanced stat cards, timeline, and formatting toolbar.

**Architecture:** Modify existing files in-place. No new stores or routes needed — this is pure UI/styling work. The main structural change is adding a BottomTabBar for mobile alongside the existing Rail for iPad.

**Tech Stack:** Expo Router, NativeWind (Tailwind), React Native Reanimated, Zustand, Lucide icons, Fraunces + DM Sans fonts

---

## File Map

### New files:
- `components/layout/BottomTabBar.tsx` — Mobile bottom navigation (5 tabs)
- `components/notes/FormattingToolbar.tsx` — Floating formatting toolbar for note editor
- `components/calendar/UpcomingEvents.tsx` — "À venir" section for calendar screen

### Modified files:
- `theme/colors.ts` — Add `surfaceBright` (#FDF9F3)
- `tailwind.config.js` — Add `surface-bright` color
- `components/layout/ThreeColumnLayout.tsx` — Conditionally show BottomTabBar on mobile
- `app/(auth)/login.tsx` — Full redesign matching Stitch connexion screen
- `components/dashboard/StatBlock.tsx` — Taller cards (160px), ghost at top-right
- `components/dashboard/TimelineCard.tsx` — Ring for "now" dot, "restant" timer
- `app/(main)/index.tsx` — Floating progress bar at bottom
- `app/(main)/tasks.tsx` — Stitch header + FAB + task sub-info styling
- `components/tasks/TaskItem.tsx` — Blue italic sub-info line
- `app/(main)/calendar.tsx` — Add UpcomingEvents section
- `app/(main)/notebooks/index.tsx` — Search bar, Stitch card grid
- `components/notes/NoteCard.tsx` — Match Stitch card design
- `app/(main)/notebooks/note/[id].tsx` — Add FormattingToolbar
- `components/notes/NoteEditor.tsx` — Large italic title, manuscript styling
- `app/(main)/stats.tsx` — Full redesign: Weekly Progression, Task Mastery dark card, bar chart, Active Journals

---

### Task 1: Design Tokens — Add surface-bright color

**Files:**
- Modify: `theme/colors.ts`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Add surfaceBright to colors.ts**

In `theme/colors.ts`, add after `surface`:

```typescript
surfaceBright: '#FDF9F3',
```

- [ ] **Step 2: Add surface-bright to tailwind.config.js**

In `tailwind.config.js`, add after `parchment`:

```javascript
'surface-bright': '#FDF9F3',
```

- [ ] **Step 3: Commit**

```bash
git add theme/colors.ts tailwind.config.js
git commit -m "feat: add surface-bright color token (#FDF9F3)"
```

---

### Task 2: Bottom Tab Bar — Mobile Navigation

**Files:**
- Create: `components/layout/BottomTabBar.tsx`
- Modify: `components/layout/ThreeColumnLayout.tsx`

- [ ] **Step 1: Create BottomTabBar component**

Create `components/layout/BottomTabBar.tsx`:

```tsx
import { View, Pressable, useWindowDimensions } from 'react-native';
import { usePathname, router } from 'expo-router';
import { House, Calendar, BookOpen, CheckSquare, BarChart3 } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const tabs = [
  { icon: House, path: '/(main)', label: 'Home' },
  { icon: Calendar, path: '/(main)/calendar', label: 'Calendrier' },
  { icon: BookOpen, path: '/(main)/notebooks', label: 'Notes' },
  { icon: CheckSquare, path: '/(main)/tasks', label: 'Taches' },
  { icon: BarChart3, path: '/(main)/stats', label: 'Stats' },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  // Only show on mobile (< 768px)
  if (width >= 768) return null;

  const isActive = (path: string) => {
    if (path === '/(main)') return pathname === '/' || pathname === '/(main)';
    return pathname.startsWith(path.replace('/(main)', ''));
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 32,
        backgroundColor: 'rgba(253, 249, 243, 0.8)',
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {tabs.map(({ icon: Icon, path }) => {
        const active = isActive(path);
        return (
          <Pressable
            key={path}
            onPress={() => router.push(path)}
            style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}
          >
            <Icon
              size={22}
              strokeWidth={1.6}
              color={active ? colors.ink : colors.inkGhost}
            />
            {active && (
              <View
                style={{
                  position: 'absolute',
                  bottom: -6,
                  width: '50%',
                  height: 2,
                  backgroundColor: colors.blue,
                  borderRadius: 1,
                }}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
```

- [ ] **Step 2: Integrate into ThreeColumnLayout**

Replace the entire content of `components/layout/ThreeColumnLayout.tsx`:

```tsx
import { View, useWindowDimensions } from 'react-native';
import { Rail } from './Rail';
import { BottomTabBar } from './BottomTabBar';

type Props = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
};

export function ThreeColumnLayout({ children, sidebar }: Props) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View className="flex-1 flex-row bg-parchment">
      {isTablet && <Rail />}
      <View className="flex-1 border-l border-border" style={!isTablet ? { borderLeftWidth: 0 } : undefined}>
        {children}
      </View>
      {isTablet && sidebar && (
        <View className="w-[280px] border-l border-border">
          {sidebar}
        </View>
      )}
      <BottomTabBar />
    </View>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/layout/BottomTabBar.tsx components/layout/ThreeColumnLayout.tsx
git commit -m "feat: add mobile bottom tab bar with iPad Rail preserved"
```

---

### Task 3: Login Screen — Stitch Connexion Design

**Files:**
- Modify: `app/(auth)/login.tsx`

- [ ] **Step 1: Rewrite login screen**

Replace the entire content of `app/(auth)/login.tsx`:

```tsx
import { useState } from 'react';
import { View, TextInput, Pressable, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { signIn } from '../../lib/auth';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <KeyboardAvoidingView
      className="flex-1 bg-surface-bright"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decorative "Annotation." text */}
        <Text
          style={{
            position: 'absolute',
            top: 48,
            right: 48,
            fontFamily: 'Fraunces_300Light_Italic',
            fontSize: 64,
            color: colors.ink,
            opacity: 0.08,
          }}
        >
          Annotation.
        </Text>

        <View style={{ width: '100%', maxWidth: 380 }}>
          {/* K° Logo */}
          <View style={{ alignItems: 'center', marginBottom: 64 }}>
            <Text style={{ fontFamily: 'Fraunces_900Black', fontSize: 56, color: colors.ink }}>
              K<Text style={{ fontFamily: 'Fraunces_300Light_Italic', fontSize: 40, color: colors.blue }}>°</Text>
            </Text>
          </View>

          {/* Heading */}
          <View style={{ marginBottom: 40 }}>
            <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 28, color: colors.ink, marginBottom: 8 }}>
              Bienvenue
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#5F5E5E' }}>
              Identifiez-vous pour acceder a vos manuscrits.
            </Text>
          </View>

          {/* Email Field */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 11, color: '#5F5E5E', letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="etudiant@universite.fr"
              placeholderTextColor={colors.inkGhost}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                fontFamily: 'DMSans_400Regular',
                fontSize: 14,
                color: colors.ink,
                height: 56,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: '#E0D8CE',
                borderRadius: 14,
                backgroundColor: 'transparent',
              }}
            />
          </View>

          {/* Password Field */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 11, color: '#5F5E5E', letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              Mot de passe
            </Text>
            <View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.inkGhost}
                secureTextEntry={!showPassword}
                style={{
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 14,
                  color: colors.ink,
                  height: 56,
                  paddingHorizontal: 16,
                  paddingRight: 48,
                  borderWidth: 1,
                  borderColor: '#E0D8CE',
                  borderRadius: 14,
                  backgroundColor: 'transparent',
                }}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 16, top: 18 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.inkGhost} />
                ) : (
                  <Eye size={20} color={colors.inkGhost} />
                )}
              </Pressable>
            </View>
          </View>

          {/* Se connecter button */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={{
              height: 56,
              backgroundColor: colors.ink,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 16, color: '#FDF9F3' }}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </Pressable>

          {/* Mot de passe oublie */}
          <Pressable style={{ alignItems: 'center', marginBottom: 48 }}>
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.blue }}>
              Mot de passe oublie
            </Text>
          </Pressable>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 48 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(197,197,217,0.3)' }} />
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 10, color: colors.inkGhost, letterSpacing: 2, textTransform: 'uppercase', marginHorizontal: 16 }}>
              Ou
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(197,197,217,0.3)' }} />
          </View>

          {/* Google button */}
          <Pressable
            style={{
              height: 56,
              borderWidth: 1,
              borderColor: '#C5C5D9',
              borderRadius: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              backgroundColor: '#F7F3ED',
              marginBottom: 48,
            }}
          >
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.ink }}>
              Continuer avec Google
            </Text>
          </Pressable>

          {/* Create account */}
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#5F5E5E' }}>
              Nouveau ici ?{' '}
            </Text>
            <Link href="/(auth)/register">
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.ink }}>
                Creer un compte
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(auth\)/login.tsx
git commit -m "feat: redesign login screen to match Stitch connexion mockup"
```

---

### Task 4: Dashboard — Stat Cards Enhancement

**Files:**
- Modify: `components/dashboard/StatBlock.tsx`

- [ ] **Step 1: Update StatBlock to match Stitch (taller, ghost at top-right)**

Replace the entire content of `components/dashboard/StatBlock.tsx`:

```tsx
import { Pressable, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { textPresets } from '../../theme/typography';
import { colors } from '../../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'big' | 'med' | 'sm' | 'accent';

type Props = {
  value: string;
  unit: string;
  label: string;
  variant: Variant;
};

const variantConfig = {
  big: {
    minWidth: 130,
    bg: colors.dark,
    borderColor: 'transparent',
    textColor: '#FFFFFF',
    labelColor: colors.darkMuted,
    ghostOpacity: 0.07,
  },
  med: {
    minWidth: 100,
    bg: colors.bg,
    borderColor: colors.borderSoft,
    textColor: colors.ink,
    labelColor: colors.darkMuted,
    ghostOpacity: 0.04,
  },
  sm: {
    minWidth: 100,
    bg: colors.bg,
    borderColor: colors.borderSoft,
    textColor: colors.ink,
    labelColor: colors.darkMuted,
    ghostOpacity: 0.04,
  },
  accent: {
    minWidth: 100,
    bg: '#FDF9F3',
    borderColor: colors.border,
    textColor: colors.ink,
    labelColor: colors.darkMuted,
    ghostOpacity: 0.04,
  },
};

export function StatBlock({ value, unit, label, variant }: Props) {
  const config = variantConfig[variant];
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * -2 }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { pressed.value = withTiming(1, { duration: 150 }); }}
      onPressOut={() => { pressed.value = withTiming(0, { duration: 150 }); }}
      style={[
        animatedStyle,
        {
          minWidth: config.minWidth,
          height: 160,
          backgroundColor: config.bg,
          borderColor: config.borderColor,
          borderWidth: config.borderColor !== 'transparent' ? 1 : 0,
          borderRadius: 14,
          padding: 20,
          overflow: 'hidden',
          justifyContent: 'space-between',
        },
      ]}
    >
      {/* Ghost number — top right like Stitch */}
      <Text
        style={{
          position: 'absolute',
          top: 0,
          right: -4,
          fontSize: 72,
          fontFamily: 'Fraunces_900Black',
          color: config.textColor,
          opacity: config.ghostOpacity,
          lineHeight: 72,
        }}
      >
        {value}
      </Text>

      {/* Value + unit — at top */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', zIndex: 10 }}>
        <Text style={[textPresets.statBig, { color: config.textColor }]}>
          {value}
        </Text>
        {unit ? (
          <Text style={{ fontFamily: 'Fraunces_300Light_Italic', color: colors.blue, fontSize: 20, marginLeft: 2 }}>
            {unit}
          </Text>
        ) : null}
      </View>

      {/* Label — at bottom */}
      <Text
        style={{
          fontFamily: 'DMSans_300Light',
          fontSize: 9.5,
          color: config.labelColor,
          lineHeight: 13,
          maxWidth: 70,
          zIndex: 10,
        }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/StatBlock.tsx
git commit -m "feat: enhance stat cards — taller height, ghost number top-right, Stitch styling"
```

---

### Task 5: Dashboard — Timeline Improvements

**Files:**
- Modify: `app/(main)/index.tsx`

- [ ] **Step 1: Improve timeline dots and add "restant" indicator**

In `app/(main)/index.tsx`, find the timeline section (the `todayEvents.map` block starting at line 163). Replace the dot rendering section (lines 188-204) with enhanced dots:

Replace:
```tsx
              {/* Vertical line + dot */}
              <View style={{ width: 20, alignItems: 'center' }}>
                {/* Top line segment */}
                {index > 0 && (
                  <View style={{ width: 1, backgroundColor: '#E8E2DA', height: 8 }} />
                )}
                {index === 0 && <View style={{ height: 8 }} />}
                {/* Dot */}
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: dotColor,
                  }}
                />
                {/* Bottom line segment */}
                <View style={{ width: 1, backgroundColor: '#E8E2DA', flex: 1 }} />
              </View>
```

With:
```tsx
              {/* Vertical line + dot */}
              <View style={{ width: 24, alignItems: 'center' }}>
                {/* Top line segment */}
                {index > 0 && (
                  <View style={{ width: 1, backgroundColor: '#E8E2DA', height: 8 }} />
                )}
                {index === 0 && <View style={{ height: 8 }} />}
                {/* Dot with ring for "now" */}
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: status === 'now' ? colors.blue : status === 'past' ? colors.bg : colors.ink,
                    borderWidth: status === 'past' ? 2 : 0,
                    borderColor: '#E8E2DA',
                    ...(status === 'now' ? {
                      shadowColor: colors.blue,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                    } : {}),
                  }}
                />
                {/* Bottom line segment */}
                <View style={{ width: 1, backgroundColor: '#E8E2DA', flex: 1 }} />
              </View>
```

- [ ] **Step 2: Add "restant" timer to TimelineCard**

In `components/dashboard/TimelineCard.tsx`, add a remaining time display for "now" events. After the Badge section (line 60), add:

```tsx
      {/* Remaining time for current event */}
      {isNow && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Badge label="EN COURS" variant="accent" />
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            restant {Math.max(0, Math.round((new Date(event.end_time).getTime() - Date.now()) / 60000))}m
          </Text>
        </View>
      )}
```

And remove the standalone Badge block that was there:
```tsx
      {isNow && (
        <View className="mb-sm">
          <Badge label="EN COURS" variant="accent" />
        </View>
      )}
```

- [ ] **Step 3: Add floating progress bar to dashboard**

In `app/(main)/index.tsx`, at the bottom of the return, before the closing `</ScrollView>`, add spacing for the floating bar, and add a new component after the ScrollView:

Replace the end of the component (from `{/* Week progress */}` to the end of return) with:

```tsx
      {/* Bottom spacing for floating bar */}
      <View style={{ height: 80 }} />
    </ScrollView>

    {/* Floating progress bar */}
    <View
      style={{
        position: 'absolute',
        bottom: 96,
        left: 28,
        right: 28,
        backgroundColor: '#FDF9F3',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 9, color: colors.ink, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Progression Journee
          </Text>
          <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 9, color: colors.ink }}>
            {Math.round(weekProgress * 100)}%
          </Text>
        </View>
        <View style={{ height: 2, backgroundColor: '#E0D8CE', borderRadius: 1, overflow: 'visible' }}>
          <View style={{ height: 2, backgroundColor: colors.ink, borderRadius: 1, width: `${Math.round(weekProgress * 100)}%` }} />
        </View>
      </View>
    </View>
```

Note: This requires wrapping the entire return in a parent View:

Replace `return (` with `return (<View style={{ flex: 1 }}>` and add `</View>` at the very end of the return.

- [ ] **Step 4: Commit**

```bash
git add app/\(main\)/index.tsx components/dashboard/TimelineCard.tsx
git commit -m "feat: enhance dashboard timeline with ring dots, restant timer, and floating progress bar"
```

---

### Task 6: Tasks Screen — Stitch Header + FAB + Sub-info

**Files:**
- Modify: `app/(main)/tasks.tsx`
- Modify: `components/tasks/TaskItem.tsx`

- [ ] **Step 1: Redesign tasks screen with Stitch header and FAB**

Replace the entire content of `app/(main)/tasks.tsx`:

```tsx
import { View, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react-native';
import { TaskList } from '../../components/tasks/TaskList';
import { useTasksStore } from '../../stores/tasksStore';
import { useAuthStore } from '../../stores/authStore';
import { KText } from '../../components/ui/Text';
import { colors } from '../../theme/colors';

export default function TasksScreen() {
  const { tasks, fetchTasks, addTask } = useTasksStore();
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    if (session?.user) fetchTasks(session.user.id);
  }, [session]);

  const nickname = profile?.nickname ?? profile?.full_name ?? 'Student';
  const undoneTasks = tasks.filter((t) => !t.is_done);

  const handleAddTask = async () => {
    if (!session?.user) return;
    try {
      await addTask({
        user_id: session.user.id,
        title: 'Nouvelle tache',
        is_done: false,
        due_date: null,
        subject_id: null,
        sort_order: 0,
      });
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <View className="flex-1 bg-parchment">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 28, paddingBottom: 120 }}>
        {/* Stitch header */}
        <View style={{ marginBottom: 32 }}>
          <KText preset="heroName" color={colors.ink} style={{ fontSize: 30, lineHeight: 36 }}>
            Bonjour, {nickname}.
          </KText>
          <KText style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#5F5E5E', marginTop: 8, letterSpacing: 0.3 }}>
            Vous avez {undoneTasks.length} tache{undoneTasks.length > 1 ? 's' : ''} prioritaire{undoneTasks.length > 1 ? 's' : ''} aujourd'hui.
          </KText>
        </View>

        <TaskList tasks={tasks} />
      </ScrollView>

      {/* FAB blue */}
      <Pressable
        onPress={handleAddTask}
        style={{
          position: 'absolute',
          bottom: 96,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.blue,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={22} strokeWidth={1.8} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 2: Update TaskItem with blue italic sub-info**

In `components/tasks/TaskItem.tsx`, replace the due date display and add task detail line. Replace the return statement with:

```tsx
  return (
    <Pressable
      onLongPress={handleLongPress}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0E8E0',
      }}
    >
      <Checkbox checked={task.is_done} onToggle={() => onToggle(task.id)} />

      <View style={{ flex: 1 }}>
        <View style={{ position: 'relative', justifyContent: 'center' }}>
          <KText
            preset="taskText"
            color={task.is_done ? colors.inkGhost : colors.ink}
            numberOfLines={1}
          >
            {task.title}
          </KText>
          {/* Animated strikethrough line */}
          <Animated.View
            style={[
              strikeStyle,
              {
                position: 'absolute',
                top: '50%',
                left: 0,
                height: 1,
                backgroundColor: colors.inkMuted,
              },
            ]}
          />
        </View>
        {/* Sub-info: time/location in blue italic */}
        {task.due_date && (
          <KText
            style={{
              fontFamily: 'DMSans_300Light',
              fontSize: 9,
              color: task.is_done ? colors.inkGhost : colors.blue,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginTop: 4,
            }}
          >
            {task.is_done && task.done_at
              ? `Termine a ${new Date(task.done_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
              : new Date(task.due_date).toLocaleDateString('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
          </KText>
        )}
      </View>

      {subject && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: subject.color,
            marginTop: 4,
          }}
        />
      )}
    </Pressable>
  );
```

- [ ] **Step 3: Commit**

```bash
git add app/\(main\)/tasks.tsx components/tasks/TaskItem.tsx
git commit -m "feat: redesign tasks screen with Stitch header, FAB, and blue italic sub-info"
```

---

### Task 7: Calendar — "A venir" Section

**Files:**
- Create: `components/calendar/UpcomingEvents.tsx`
- Modify: `app/(main)/calendar.tsx`

- [ ] **Step 1: Create UpcomingEvents component**

Create `components/calendar/UpcomingEvents.tsx`:

```tsx
import { View, Text } from 'react-native';
import { colors } from '../../theme/colors';
import type { ScheduleEvent } from '../../types';

type Props = {
  events: ScheduleEvent[];
};

export function UpcomingEvents({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <View style={{ marginTop: 48 }}>
      <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 24, color: colors.ink, marginBottom: 24 }}>
        A venir
      </Text>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {events.slice(0, 3).map((event) => {
          const date = new Date(event.start_time);
          const day = date.getDate();
          const isImportant = event.title.toLowerCase().includes('rendu') || event.title.toLowerCase().includes('examen');

          return (
            <View
              key={event.id}
              style={{
                flex: 1,
                padding: 24,
                backgroundColor: '#FDF9F3',
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              {/* Date circle */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: isImportant ? 'rgba(186,26,26,0.1)' : 'rgba(61,90,254,0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Fraunces_300Light_Italic', fontSize: 20, color: isImportant ? '#BA1A1A' : colors.blue }}>
                  {day}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.ink, marginBottom: 4 }}>
                  {event.title}
                </Text>
                <Text style={{ fontFamily: 'DMSans_300Light', fontSize: 12, color: '#5F5E5E', marginBottom: 12 }}>
                  {event.location
                    ? `${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — ${event.location}`
                    : `Echeance : ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                </Text>
                <View
                  style={{
                    alignSelf: 'flex-start',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 2,
                    backgroundColor: isImportant ? 'rgba(186,26,26,0.1)' : 'rgba(61,90,254,0.1)',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'DMSans_500Medium',
                      fontSize: 10,
                      color: isImportant ? '#BA1A1A' : colors.blue,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    {isImportant ? 'Important' : 'Seminaire'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Add UpcomingEvents to calendar screen**

In `app/(main)/calendar.tsx`, add the import at the top:

```tsx
import { UpcomingEvents } from '../../components/calendar/UpcomingEvents';
```

Then wrap the calendar view in a ScrollView and add UpcomingEvents below. Replace the `{/* Calendar view */}` section (lines 86-101) with:

```tsx
      {/* Calendar view + upcoming */}
      <ScrollView className="flex-1 px-xxl" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {selectedView === 'month' && (
          <MonthView
            events={events}
            selectedDate={selectedDate}
            onDayPress={(date) => setSelectedDate(date)}
          />
        )}
        {selectedView === 'week' && (
          <WeekView events={events} weekStart={getWeekStart(currentDate)} />
        )}
        {selectedView === 'day' && (
          <DayView events={events} date={currentDate} />
        )}

        {/* A venir section */}
        {selectedView === 'month' && (
          <UpcomingEvents
            events={events
              .filter((e) => new Date(e.start_time) > new Date())
              .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())}
          />
        )}
      </ScrollView>
```

Also add `ScrollView` to the react-native imports at the top.

- [ ] **Step 3: Commit**

```bash
git add components/calendar/UpcomingEvents.tsx app/\(main\)/calendar.tsx
git commit -m "feat: add 'A venir' upcoming events section to calendar screen"
```

---

### Task 8: Notes List — Search Bar + Stitch Cards

**Files:**
- Modify: `app/(main)/notebooks/index.tsx`
- Modify: `components/notes/NoteCard.tsx`

- [ ] **Step 1: Add search bar and update notes tab layout**

In `app/(main)/notebooks/index.tsx`, add a search bar state and Search icon import. Add to the imports:

```tsx
import { Search } from 'lucide-react-native';
```

Add state after `subjectFilter`:

```tsx
const [searchQuery, setSearchQuery] = useState('');
```

Update `filteredNotes` to include search:

```tsx
const filteredNotes = notes
  .filter((n) => !subjectFilter || n.subject_id === subjectFilter)
  .filter((n) => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || (n.content_preview ?? '').toLowerCase().includes(searchQuery.toLowerCase()));
```

Add search bar before the subject filter chips (inside the `activeTab === 'notes'` block), before the `ScrollView horizontal`:

```tsx
            {/* Search bar */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#E0D8CE',
                borderRadius: 14,
                marginBottom: 16,
                backgroundColor: '#FDF9F3',
              }}
            >
              <Search size={18} color="#5F5E5E" style={{ marginRight: 12 }} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Chercher dans vos notes..."
                placeholderTextColor="rgba(95,94,94,0.5)"
                style={{
                  flex: 1,
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 14,
                  color: colors.ink,
                }}
              />
            </View>
```

Also add `TextInput` to the react-native imports.

- [ ] **Step 2: Redesign NoteCard to match Stitch**

Replace the entire content of `components/notes/NoteCard.tsx`:

```tsx
import { View, Pressable, Text } from 'react-native';
import { colors } from '../../theme/colors';
import type { Note } from '../../types';

type Props = {
  note: Note;
  subjectName?: string;
  onPress: () => void;
};

export function NoteCard({ note, subjectName, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 20,
        backgroundColor: '#FDF9F3',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        marginBottom: 16,
        gap: 12,
      }}
    >
      {/* Top row: category + timestamp */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {subjectName && (
          <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 8, color: colors.blue, letterSpacing: 2, textTransform: 'uppercase' }}>
            {subjectName}
          </Text>
        )}
        <Text style={{ fontFamily: 'Fraunces_300Light_Italic', fontSize: 10, color: colors.blue }}>
          {note.updated_at
            ? getRelativeTime(new Date(note.updated_at))
            : ''}
        </Text>
      </View>

      {/* Title */}
      <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 12.5, color: colors.ink, lineHeight: 18 }}>
        {note.title || 'Sans titre'}
      </Text>

      {/* Preview */}
      {note.content_preview ? (
        <Text
          numberOfLines={2}
          style={{ fontFamily: 'DMSans_300Light', fontSize: 10, color: '#5F5E5E', lineHeight: 16 }}
        >
          {note.content_preview}
        </Text>
      ) : null}
    </Pressable>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
```

- [ ] **Step 3: Update FAB color on notebooks to match screen context**

In `app/(main)/notebooks/index.tsx`, update the FAB `backgroundColor` to:

```tsx
backgroundColor: activeTab === 'notes' ? colors.dark : colors.dark,
```

The FAB is already dark (#111). This matches the Stitch notes screen.

- [ ] **Step 4: Commit**

```bash
git add app/\(main\)/notebooks/index.tsx components/notes/NoteCard.tsx
git commit -m "feat: add search bar to notes, redesign NoteCard to match Stitch"
```

---

### Task 9: Note Editor — Formatting Toolbar + Manuscript Styling

**Files:**
- Create: `components/notes/FormattingToolbar.tsx`
- Modify: `app/(main)/notebooks/note/[id].tsx`
- Modify: `components/notes/NoteEditor.tsx`

- [ ] **Step 1: Create FormattingToolbar**

Create `components/notes/FormattingToolbar.tsx`:

```tsx
import { View, Pressable } from 'react-native';
import { Bold, Italic, List, FunctionSquare, Plus } from 'lucide-react-native';
import { colors } from '../../theme/colors';

type Props = {
  onBold?: () => void;
  onItalic?: () => void;
  onList?: () => void;
  onFormula?: () => void;
  onAdd?: () => void;
};

export function FormattingToolbar({ onBold, onItalic, onList, onFormula, onAdd }: Props) {
  const buttons = [
    { icon: Bold, onPress: onBold },
    { icon: Italic, onPress: onItalic },
    { icon: List, onPress: onList },
    { icon: FunctionSquare, onPress: onFormula },
  ];

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingBottom: 24,
        paddingTop: 8,
        backgroundColor: 'rgba(253,249,243,0.9)',
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          paddingHorizontal: 16,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#C5C5D9',
          borderRadius: 9999,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {buttons.map(({ icon: Icon, onPress }, i) => (
            <Pressable
              key={i}
              onPress={onPress}
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
              }}
            >
              <Icon size={20} strokeWidth={1.6} color="#444656" />
            </Pressable>
          ))}
        </View>

        <View style={{ width: 1, height: 24, backgroundColor: '#C5C5D9', marginHorizontal: 4 }} />

        <Pressable
          onPress={onAdd}
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            backgroundColor: colors.blue,
          }}
        >
          <Plus size={20} strokeWidth={1.8} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Update NoteEditor styling — large italic title**

In `components/notes/NoteEditor.tsx`, update the title TextInput style:

Replace the title TextInput style:
```tsx
        style={{
          fontFamily: fonts.serif.bold,
          fontSize: 24,
          color: colors.ink,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 8,
        }}
```

With:
```tsx
        style={{
          fontFamily: 'Fraunces_900Black',
          fontSize: 36,
          fontStyle: 'italic',
          color: colors.ink,
          paddingHorizontal: 32,
          paddingTop: 16,
          paddingBottom: 12,
          lineHeight: 42,
          letterSpacing: -0.5,
        }}
```

Also update the content TextInput to have more padding:
```tsx
        style={{
          fontFamily: fonts.sans.regular,
          fontSize: 16,
          lineHeight: 28,
          color: '#444656',
          paddingHorizontal: 32,
          paddingBottom: 120,
          minHeight: 400,
        }}
```

- [ ] **Step 3: Add FormattingToolbar to note editor screen**

In `app/(main)/notebooks/note/[id].tsx`, add import and toolbar:

```tsx
import { FormattingToolbar } from '../../../../components/notes/FormattingToolbar';
```

Add after `<NoteEditor noteId={id!} />`:

```tsx
      <FormattingToolbar />
```

- [ ] **Step 4: Commit**

```bash
git add components/notes/FormattingToolbar.tsx components/notes/NoteEditor.tsx app/\(main\)/notebooks/note/\[id\].tsx
git commit -m "feat: add floating formatting toolbar and manuscript-style note editor"
```

---

### Task 10: Stats Screen — Full Redesign

**Files:**
- Modify: `app/(main)/stats.tsx`

- [ ] **Step 1: Redesign stats screen to match Stitch**

Replace the entire content of `app/(main)/stats.tsx`:

```tsx
import { View, ScrollView, Text } from 'react-native';
import { useEffect, useMemo } from 'react';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../theme/colors';

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function getWeekBounds() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

export default function StatsScreen() {
  const { events, fetchEvents } = useScheduleStore();
  const { tasks, fetchTasks } = useTasksStore();
  const { subjects } = useSubjectsStore();
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (session?.user) {
      fetchEvents(session.user.id);
      fetchTasks(session.user.id);
    }
  }, [session]);

  const { monday, sunday } = useMemo(() => getWeekBounds(), []);

  const weeklyHours = useMemo(() => {
    const hours = [0, 0, 0, 0, 0, 0, 0];
    events.forEach((e) => {
      const start = new Date(e.start_time);
      const end = new Date(e.end_time);
      if (start >= monday && start <= sunday) {
        let dayIndex = start.getDay() - 1;
        if (dayIndex < 0) dayIndex = 6;
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        hours[dayIndex] += duration;
      }
    });
    return hours;
  }, [events, monday, sunday]);

  const totalHours = Math.round(weeklyHours.reduce((a, b) => a + b, 0));
  const maxHours = Math.max(...weeklyHours, 1);
  const todayIndex = new Date().getDay() - 1 < 0 ? 6 : new Date().getDay() - 1;

  const weekTasks = useMemo(() => {
    const total = tasks.filter((t) => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date);
      return d >= monday && d <= sunday;
    });
    const done = total.filter((t) => t.is_done);
    return { total: total.length, done: done.length };
  }, [tasks, monday, sunday]);

  const streak = useMemo(() => {
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasActivity = tasks.some(
        (t) => t.is_done && t.done_at && t.done_at.split('T')[0] === dateStr
      );
      if (hasActivity) count++;
      else if (i > 0) break;
    }
    return count;
  }, [tasks]);

  const weekLabel = `Semaine ${Math.ceil((monday.getTime() - new Date(monday.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}: ${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;

  const completion = weekTasks.total > 0 ? Math.round((weekTasks.done / weekTasks.total) * 100) : 0;

  return (
    <ScrollView className="flex-1 bg-parchment" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 28, paddingBottom: 120 }}>
      {/* Title */}
      <Text style={{ fontFamily: 'Fraunces_900Black', fontSize: 32, color: colors.ink, letterSpacing: -1, marginBottom: 4 }}>
        Progression Hebdo
      </Text>
      <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#5F5E5E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 32 }}>
        {weekLabel}
      </Text>

      {/* Main stats: Total Focus + Current Streak */}
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 32 }}>
        <View style={{ flex: 1, backgroundColor: '#F7F3ED', padding: 24, borderRadius: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(197,197,217,0.3)' }}>
          <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 10, color: '#5F5E5E', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            Heures Focus
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={{ fontFamily: 'Fraunces_900Black', fontSize: 48, color: colors.ink }}>{totalHours}</Text>
            <Text style={{ fontFamily: 'Fraunces_300Light_Italic', fontSize: 28, color: colors.blue }}>h</Text>
          </View>
        </View>
        <View style={{ flex: 1, backgroundColor: '#F7F3ED', padding: 24, borderRadius: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(197,197,217,0.3)' }}>
          <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 10, color: '#5F5E5E', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            Serie en cours
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={{ fontFamily: 'Fraunces_900Black', fontSize: 48, color: colors.ink }}>{streak}</Text>
            <Text style={{ fontFamily: 'Fraunces_300Light_Italic', fontSize: 28, color: colors.blue }}>jours</Text>
          </View>
        </View>
      </View>

      {/* Weekly bar chart */}
      <View style={{ marginBottom: 32 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 192, paddingHorizontal: 8 }}>
          {weeklyHours.map((hours, i) => {
            const isToday = i === todayIndex;
            const barHeight = Math.max(4, (hours / maxHours) * 160);
            return (
              <View key={i} style={{ alignItems: 'center', flex: 1, gap: 12 }}>
                <View
                  style={{
                    width: 8,
                    height: barHeight,
                    backgroundColor: isToday ? colors.blue : '#E6E2DC',
                    borderTopLeftRadius: 9999,
                    borderTopRightRadius: 9999,
                  }}
                />
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 10, color: isToday ? colors.blue : '#5F5E5E' }}>
                  {DAY_LABELS[i]}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={{ height: 1, backgroundColor: 'rgba(197,197,217,0.4)', marginTop: 8 }} />
      </View>

      {/* Task Mastery dark card */}
      <View style={{ backgroundColor: colors.dark, borderRadius: 14, padding: 32, marginBottom: 32 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <View>
            <Text style={{ fontFamily: 'Fraunces_300Light_Italic', fontSize: 22, color: '#FFFFFF' }}>
              Maitrise des taches
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
              Completion du programme
            </Text>
          </View>
        </View>
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={{ fontFamily: 'Fraunces_900Black', fontSize: 48, color: '#FFFFFF' }}>
              {weekTasks.done}
              <Text style={{ fontFamily: 'Fraunces_300Light_Italic', fontSize: 28, color: colors.blue }}>/</Text>
              {weekTasks.total}
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#888' }}>
              {completion}% Complete
            </Text>
          </View>
        </View>
        <View style={{ height: 4, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden' }}>
          <View style={{ height: 4, backgroundColor: colors.blue, borderRadius: 2, width: `${completion}%` }} />
        </View>
      </View>

      {/* Active Journals / Subjects */}
      <View style={{ marginBottom: 32 }}>
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#C5C5D9', paddingBottom: 8, marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Fraunces_300Light_Italic', fontSize: 18, color: colors.ink }}>
            Matieres actives
          </Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {subjects.map((s) => (
            <View
              key={s.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: '#F7F3ED',
                borderWidth: 1,
                borderColor: 'rgba(197,197,217,0.5)',
                borderRadius: 2,
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.color ?? colors.blue }} />
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 11, color: colors.ink, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {s.name}
              </Text>
            </View>
          ))}
          {subjects.length === 0 && (
            <Text style={{ fontFamily: 'DMSans_300Light', fontSize: 12, color: '#5F5E5E' }}>
              Aucune matiere configuree
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(main\)/stats.tsx
git commit -m "feat: redesign stats screen — weekly progression, task mastery dark card, active journals"
```

---

### Task 11: Final Polish — Subject filter chips on notes to match Stitch

**Files:**
- Modify: `app/(main)/notebooks/index.tsx`

- [ ] **Step 1: Update subject chips to use Stitch blue active style**

In `app/(main)/notebooks/index.tsx`, update the "Toutes" chip and subject chips to use blue-filled active style instead of dark:

Replace the "Toutes" chip `backgroundColor` and `borderColor`:
```tsx
borderColor: !subjectFilter ? colors.blue : colors.border,
backgroundColor: !subjectFilter ? colors.blue : 'transparent',
```

And the text color:
```tsx
color={!subjectFilter ? '#FFFFFF' : colors.inkSoft}
```

Do the same for subject chips — when active, use blue instead of subject color:
```tsx
borderColor: subjectFilter === s.id ? colors.blue : colors.border,
backgroundColor: subjectFilter === s.id ? colors.blue : 'transparent',
```

- [ ] **Step 2: Commit**

```bash
git add app/\(main\)/notebooks/index.tsx
git commit -m "feat: update note filter chips to blue active style matching Stitch"
```
