import { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { textPresets } from '../../theme/typography';
import { colors } from '../../theme/colors';
import { formatTime } from '../../lib/utils';
import { isToday } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { Header } from '../../components/dashboard/Header';
import { StatsBand } from '../../components/dashboard/StatsBand';
import { TimelineCard } from '../../components/dashboard/TimelineCard';
import { SectionDivider } from '../../components/ui/SectionDivider';
import { ProgressBar } from '../../components/ui/ProgressBar';

function getEventStatus(event: { start_time: string; end_time: string }, now: Date): 'past' | 'now' | 'next' | 'later' {
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  if (end < now) return 'past';
  if (start <= now && end >= now) return 'now';
  return 'later'; // will be refined below
}

export default function DashboardScreen() {
  const session = useAuthStore((s) => s.session);
  const fetchEvents = useScheduleStore((s) => s.fetchEvents);
  const fetchTasks = useTasksStore((s) => s.fetchTasks);
  const fetchSubjects = useSubjectsStore((s) => s.fetchSubjects);
  const events = useScheduleStore((s) => s.events);
  const subjects = useSubjectsStore((s) => s.subjects);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    fetchEvents(userId);
    fetchTasks(userId);
    fetchSubjects(userId);
  }, [session?.user?.id]);

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
    <ScrollView className="flex-1 bg-parchment" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Header />

      {/* Stats Band */}
      <View className="mb-lg">
        <StatsBand />
      </View>

      {/* Section Divider */}
      <View className="px-xxl">
        <SectionDivider title="Aujourd'hui" action="semaine →" />
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

      {/* Week progress */}
      <View className="px-xxl pb-xxxl">
        <ProgressBar progress={weekProgress} />
      </View>
    </ScrollView>
  );
}
