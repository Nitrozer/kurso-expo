import { ScrollView } from 'react-native';
import { StatBlock } from './StatBlock';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useTasksStore } from '../../stores/tasksStore';
import { isToday, isTomorrow, getEventDurationMinutes } from '../../lib/utils';

function getWeekBounds(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday-based week
  const start = new Date(now);
  start.setDate(now.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function StatsBand() {
  const events = useScheduleStore((s) => s.events);
  const tasks = useTasksStore((s) => s.tasks);

  // Hours of courses today
  const todayEvents = events.filter((e) => isToday(new Date(e.start_time)));
  const todayMinutes = todayEvents.reduce(
    (sum, e) => sum + getEventDurationMinutes(e.start_time, e.end_time),
    0,
  );
  const todayHours = Math.round(todayMinutes / 60);

  // Remaining tasks
  const remainingTasks = tasks.filter((t) => !t.is_done).length;

  // Due tomorrow
  const dueTomorrow = tasks.filter(
    (t) => t.due_date && isTomorrow(new Date(t.due_date)) && !t.is_done,
  ).length;

  // Week completion %
  const { start, end } = getWeekBounds();
  const now = new Date();
  const weekEvents = events.filter((e) => {
    const d = new Date(e.start_time);
    return d >= start && d <= end;
  });
  const pastWeekEvents = weekEvents.filter((e) => new Date(e.end_time) < now);
  const weekPct = weekEvents.length > 0 ? Math.round((pastWeekEvents.length / weekEvents.length) * 100) : 0;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 28, gap: 10 }}
    >
      <StatBlock value={String(todayHours)} unit="h" label="cours aujourd'hui" variant="big" />
      <StatBlock value={String(remainingTasks)} unit="" label="tâches restantes" variant="med" />
      <StatBlock value={String(dueTomorrow)} unit="" label="rendu demain" variant="sm" />
      <StatBlock value={String(weekPct)} unit="%" label="semaine complétée" variant="accent" />
    </ScrollView>
  );
}
