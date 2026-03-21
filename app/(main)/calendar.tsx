import { useState, useMemo, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { Upload } from 'lucide-react-native';
import { router } from 'expo-router';
import { KText } from '../../components/ui/Text';
import { IconButton } from '../../components/ui/IconButton';
import { MonthView } from '../../components/calendar/MonthView';
import { WeekView } from '../../components/calendar/WeekView';
import { DayView } from '../../components/calendar/DayView';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useAuthStore } from '../../stores/authStore';
import { getMonthName } from '../../lib/utils';
import { colors } from '../../theme/colors';

type ViewMode = 'month' | 'week' | 'day';

const VIEW_LABELS: { key: ViewMode; label: string }[] = [
  { key: 'month', label: 'Mois' },
  { key: 'week', label: 'Semaine' },
  { key: 'day', label: 'Jour' },
];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function CalendarScreen() {
  const [selectedView, setSelectedView] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const { events, fetchEvents } = useScheduleStore();
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (session?.user) fetchEvents(session.user.id);
  }, [session]);

  const currentDate = useMemo(() => new Date(selectedDate + 'T00:00:00'), [selectedDate]);

  return (
    <View className="flex-1 bg-parchment">
      {/* Header */}
      <View className="px-xxl pt-xxl pb-lg">
        <View className="flex-row items-center justify-between mb-lg">
          <KText preset="monthName" color={colors.ink}>
            {getMonthName(currentDate)} {currentDate.getFullYear()}
          </KText>
          <IconButton icon={Upload} onPress={() => router.push('/(modals)/import-ics')} />
        </View>

        {/* View toggle pills */}
        <View className="flex-row gap-sm">
          {VIEW_LABELS.map(({ key, label }) => {
            const active = selectedView === key;
            return (
              <Pressable
                key={key}
                onPress={() => setSelectedView(key)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: active ? colors.dark : colors.border,
                  backgroundColor: active ? colors.dark : 'transparent',
                }}
              >
                <KText preset="calDay" color={active ? colors.darkText : colors.ink}>
                  {label}
                </KText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Calendar view */}
      <View className="flex-1 px-xxl">
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
      </View>
    </View>
  );
}
