import { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { textPresets } from '../../theme/typography';
import { colors } from '../../theme/colors';
import { formatTime, isToday } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { useSidebar } from '../../components/layout/SidebarContext';
import { Header } from '../../components/dashboard/Header';
import { StatsBand } from '../../components/dashboard/StatsBand';
import { TimelineCard } from '../../components/dashboard/TimelineCard';
import { SectionDivider } from '../../components/ui/SectionDivider';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Checkbox } from '../../components/ui/Checkbox';
import { KText } from '../../components/ui/Text';
import { MiniCalendar } from '../../components/calendar/MiniCalendar';

function getEventStatus(event: { start_time: string; end_time: string }, now: Date): 'past' | 'now' | 'next' | 'later' {
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  if (end < now) return 'past';
  if (start <= now && end >= now) return 'now';
  return 'later'; // will be refined below
}

function SidebarContent() {
  const events = useScheduleStore((s) => s.events);
  const tasks = useTasksStore((s) => s.tasks);
  const toggleTask = useTasksStore((s) => s.toggleTask);

  const todayEvents = events.filter((e) => isToday(new Date(e.start_time)));

  // Next undone tasks (up to 5)
  const undoneTasks = tasks
    .filter((t) => !t.is_done)
    .slice(0, 5);

  return (
    <View>
      <MiniCalendar events={events} />

      <View className="mt-lg">
        <SectionDivider
          title="Taches"
          action="tout >"
          onAction={() => router.push('/(main)/tasks')}
        />
      </View>

      {undoneTasks.length === 0 ? (
        <KText preset="courseDetail" color={colors.inkMuted}>
          Aucune tache
        </KText>
      ) : (
        undoneTasks.map((task) => (
          <View key={task.id} className="flex-row items-center gap-sm py-xs">
            <Checkbox checked={task.is_done} onToggle={() => toggleTask(task.id)} />
            <KText
              preset="taskText"
              color={colors.ink}
              numberOfLines={1}
              style={{ flex: 1 }}
            >
              {task.title}
            </KText>
            {task.due_date && (
              <KText preset="taskDue" color={colors.blue}>
                {new Date(task.due_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </KText>
            )}
          </View>
        ))
      )}

      <View className="mt-lg">
        <SectionDivider title="Notes recentes" />
      </View>
      <KText preset="courseDetail" color={colors.inkMuted}>
        Aucune note
      </KText>
    </View>
  );
}

export default function DashboardScreen() {
  const session = useAuthStore((s) => s.session);
  const fetchEvents = useScheduleStore((s) => s.fetchEvents);
  const fetchTasks = useTasksStore((s) => s.fetchTasks);
  const fetchSubjects = useSubjectsStore((s) => s.fetchSubjects);
  const events = useScheduleStore((s) => s.events);
  const subjects = useSubjectsStore((s) => s.subjects);
  const setSidebar = useSidebar((s) => s.setSidebar);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    fetchEvents(userId);
    fetchTasks(userId);
    fetchSubjects(userId);
  }, [session?.user?.id]);

  // Set sidebar content once on mount
  useEffect(() => {
    setSidebar(<SidebarContent />);
    return () => setSidebar(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = new Date();
  const todayEvents = events.filter((e) => isToday(new Date(e.start_time)));

  // Determine statuses, marking first 'later' as 'next'
  let foundNext = false;
  const eventStatuses = todayEvents.map((event) => {
    let status = getEventStatus(event, now);
    if (status === 'later' && !foundNext) {
      status = 'next';
      foundNext = true;
    }
    return status;
  });

  // Week completion for progress bar
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekEvents = events.filter((e) => {
    const d = new Date(e.start_time);
    return d >= weekStart && d <= weekEnd;
  });
  const pastWeekEvents = weekEvents.filter((e) => new Date(e.end_time) < now);
  const weekProgress = weekEvents.length > 0 ? pastWeekEvents.length / weekEvents.length : 0;

  return (
    <View style={{ flex: 1 }}>
    <ScrollView className="flex-1 bg-parchment" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Header />

      {/* Stats Band */}
      <View className="mb-lg">
        <StatsBand />
      </View>

      {/* Section Divider */}
      <View className="px-xxl">
        <SectionDivider title="Aujourd'hui" action="semaine >" />
      </View>

      {/* Timeline */}
      <View className="px-xxl mb-xl">
        {todayEvents.map((event, index) => {
          const status = eventStatuses[index];
          const time = formatTime(new Date(event.start_time));
          const subject = event.subject_id
            ? subjects.find((s) => s.id === event.subject_id)
            : undefined;

          // Dot color
          let dotColor = '#E8E2DA';
          if (status === 'now') dotColor = '#3D5AFE';
          else if (status === 'next') dotColor = '#111111';

          return (
            <View key={event.id} className="flex-row" style={{ minHeight: 80 }}>
              {/* Time column */}
              <View style={{ width: 44, alignItems: 'flex-end', paddingRight: 12, paddingTop: 2 }}>
                <Text style={[textPresets.timeHour, { color: colors.ink }]}>
                  {time.hours}
                </Text>
                <Text style={[textPresets.timeMin, { color: colors.inkMuted }]}>
                  {time.minutes}
                </Text>
              </View>

              {/* Vertical line + dot */}
              <View style={{ width: 24, alignItems: 'center' }}>
                {index > 0 && (
                  <View style={{ width: 1, backgroundColor: '#E8E2DA', height: 8 }} />
                )}
                {index === 0 && <View style={{ height: 8 }} />}
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
                <View style={{ width: 1, backgroundColor: '#E8E2DA', flex: 1 }} />
              </View>

              {/* Card */}
              <View style={{ flex: 1, paddingBottom: 10, paddingLeft: 4 }}>
                <TimelineCard event={event} status={status} subject={subject} />
              </View>
            </View>
          );
        })}

        {todayEvents.length === 0 && (
          <View className="py-xxl items-center">
            <Text style={[textPresets.courseDetail, { color: colors.inkMuted }]}>
              Aucun cours aujourd'hui
            </Text>
          </View>
        )}
      </View>

      {/* Bottom spacing for floating bar */}
      <View style={{ height: 100 }} />
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
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 9, color: colors.ink, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Progression Journee
        </Text>
        <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 9, color: colors.ink }}>
          {Math.round(weekProgress * 100)}%
        </Text>
      </View>
      <View style={{ height: 2, backgroundColor: '#E0D8CE', borderRadius: 1 }}>
        <View style={{ height: 2, backgroundColor: colors.ink, borderRadius: 1, width: `${Math.round(weekProgress * 100)}%` }} />
      </View>
    </View>
  </View>
  );
}
