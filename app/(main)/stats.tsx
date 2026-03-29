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
      <Text style={{ fontFamily: 'Fraunces_900Black', fontSize: 32, color: colors.ink, letterSpacing: -1, marginBottom: 4 }}>
        Progression Hebdo
      </Text>
      <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#5F5E5E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 32 }}>
        {weekLabel}
      </Text>

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

      <View style={{ backgroundColor: colors.dark, borderRadius: 14, padding: 32, marginBottom: 32 }}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontFamily: 'Fraunces_300Light_Italic', fontSize: 22, color: '#FFFFFF' }}>
            Maitrise des taches
          </Text>
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
            Completion du programme
          </Text>
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
