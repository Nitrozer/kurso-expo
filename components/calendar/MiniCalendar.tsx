import { useState, useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import { getMonthName } from '../../lib/utils';
import type { ScheduleEvent } from '../../types';

type Props = {
  events: ScheduleEvent[];
  onSelectDay?: (date: Date) => void;
};

const DAY_HEADERS = ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function MiniCalendar({ events, onSelectDay }: Props) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  const todayKey = toDateKey(today);

  const eventDays = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      const d = new Date(e.start_time);
      set.add(toDateKey(d));
    });
    return set;
  }, [events]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday = 0 in our grid
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days: { date: Date; inMonth: boolean }[] = [];

    // Previous month fill
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, inMonth: false });
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), inMonth: true });
    }

    // Next month fill
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        days.push({ date: new Date(year, month + 1, i), inMonth: false });
      }
    }

    return days;
  }, [year, month]);

  const goToPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDayPress = (date: Date) => {
    const key = toDateKey(date);
    setSelectedDate(key);
    onSelectDay?.(date);
  };

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-md">
        <View className="flex-row items-baseline gap-xs">
          <KText preset="monthName" color={colors.ink}>
            {getMonthName(viewDate)}
          </KText>
          <KText preset="calDay" color={colors.inkMuted}>
            {year}
          </KText>
        </View>
        <View className="flex-row gap-xs">
          <Pressable onPress={goToPrevMonth} hitSlop={8}>
            <ChevronLeft size={16} strokeWidth={1.6} color={colors.ink} />
          </Pressable>
          <Pressable onPress={goToNextMonth} hitSlop={8}>
            <ChevronRight size={16} strokeWidth={1.6} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      {/* Day headers */}
      <View className="flex-row mb-xs">
        {DAY_HEADERS.map((d) => (
          <View key={d} style={{ flex: 1, alignItems: 'center' }}>
            <KText preset="calHeader" color={colors.inkGhost}>
              {d}
            </KText>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View className="flex-row flex-wrap">
        {calendarDays.map((item, idx) => {
          const key = toDateKey(item.date);
          const isToday = key === todayKey;
          const isSelected = key === selectedDate;
          const hasEvent = eventDays.has(key);

          return (
            <Pressable
              key={idx}
              onPress={() => handleDayPress(item.date)}
              style={{
                width: '14.285%',
                aspectRatio: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={[
                  {
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  isToday && { backgroundColor: colors.dark },
                  isSelected && !isToday && { borderWidth: 1, borderColor: colors.blue },
                ]}
              >
                <KText
                  preset="calDay"
                  color={
                    isToday
                      ? colors.darkText
                      : item.inMonth
                      ? colors.ink
                      : colors.inkDim
                  }
                >
                  {item.date.getDate()}
                </KText>
              </View>
              {hasEvent && (
                <View
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: colors.blue,
                    marginTop: 1,
                  }}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
