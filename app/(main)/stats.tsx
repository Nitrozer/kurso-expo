import { View, ScrollView } from 'react-native';
import { useEffect, useMemo } from 'react';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { useAuthStore } from '../../stores/authStore';
import { KText } from '../../components/ui/Text';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function getWeekBounds() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
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

  // Bar chart data: hours per day of the week
  const weeklyHours = useMemo(() => {
    const hours = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
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

  const maxHours = Math.max(...weeklyHours, 1);

  // Tasks completed this week
  const weekTasks = useMemo(() => {
    const total = tasks.filter((t) => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date);
      return d >= monday && d <= sunday;
    });
    const done = total.filter((t) => t.is_done);
    return { total: total.length, done: done.length };
  }, [tasks, monday, sunday]);

  // Streak: consecutive days with completed tasks (backwards from today)
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
      if (hasActivity) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  }, [tasks]);

  // Progress by subject
  const subjectProgress = useMemo(() => {
    return subjects.map((s) => {
      const subjectTasks = tasks.filter((t) => t.subject_id === s.id);
      const done = subjectTasks.filter((t) => t.is_done).length;
      const total = subjectTasks.length;
      return { subject: s, done, total };
    }).filter((sp) => sp.total > 0);
  }, [subjects, tasks]);

  return (
    <ScrollView className="flex-1 bg-parchment p-xxl" showsVerticalScrollIndicator={false}>
      <KText preset="heroName" color={colors.ink} style={{ marginBottom: 24 }}>
        Statistiques
      </KText>

      {/* Weekly bar chart */}
      <KText preset="sectionTitle" color={colors.ink} style={{ marginBottom: 12 }}>
        Cours cette semaine
      </KText>
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <View className="flex-row items-end justify-between" style={{ height: 120 }}>
          {weeklyHours.map((hours, i) => (
            <View key={i} style={{ alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 24,
                  height: Math.max(4, (hours / maxHours) * 100),
                  backgroundColor: colors.dark,
                  borderTopLeftRadius: 6,
                  borderTopRightRadius: 6,
                }}
              />
              <KText
                style={{
                  fontFamily: fonts.sans.light,
                  fontSize: 9,
                  color: colors.inkSoft,
                  marginTop: 6,
                }}
              >
                {DAY_LABELS[i]}
              </KText>
            </View>
          ))}
        </View>
      </View>

      {/* Stats row */}
      <View className="flex-row gap-sm mb-xl">
        {/* Tasks completed */}
        <View
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            padding: 16,
            alignItems: 'center',
          }}
        >
          <KText preset="statBig" color={colors.ink}>
            {weekTasks.done}/{weekTasks.total}
          </KText>
          <KText preset="statLabel" color={colors.inkSoft} style={{ marginTop: 4 }}>
            Taches complétées
          </KText>
        </View>

        {/* Streak */}
        <View
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            padding: 16,
            alignItems: 'center',
          }}
        >
          <KText preset="statBig" color={colors.ink}>
            {streak}
          </KText>
          <KText preset="statLabel" color={colors.inkSoft} style={{ marginTop: 4 }}>
            Jours de suite
          </KText>
        </View>
      </View>

      {/* Subject progress */}
      <KText preset="sectionTitle" color={colors.ink} style={{ marginBottom: 12 }}>
        Progression par matière
      </KText>
      <View className="gap-md mb-xxl">
        {subjectProgress.map(({ subject, done, total }) => (
          <View key={subject.id}>
            <View className="flex-row justify-between mb-xs">
              <KText style={{ fontFamily: fonts.sans.medium, fontSize: 11, color: colors.ink }}>
                {subject.name}
              </KText>
              <KText style={{ fontFamily: fonts.sans.light, fontSize: 10, color: colors.inkSoft }}>
                {done}/{total}
              </KText>
            </View>
            <ProgressBar progress={total > 0 ? done / total : 0} />
          </View>
        ))}
        {subjectProgress.length === 0 && (
          <KText style={{ fontFamily: fonts.sans.light, fontSize: 11, color: colors.inkSoft }}>
            Aucune donnée pour le moment
          </KText>
        )}
      </View>
    </ScrollView>
  );
}
