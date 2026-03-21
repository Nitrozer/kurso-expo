import { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import type { ScheduleEvent } from '../../types';

type Props = {
  events: ScheduleEvent[];
  weekStart: Date;
};

const DAY_NAMES_SHORT = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
const HOUR_START = 7;
const HOUR_END = 20;
const HOUR_HEIGHT = 48;

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function WeekView({ events, weekStart }: Props) {
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, ScheduleEvent[]> = {};
    weekDays.forEach((d) => {
      map[toDateKey(d)] = [];
    });
    events.forEach((e) => {
      const key = e.start_time.split('T')[0];
      if (map[key]) map[key].push(e);
    });
    return map;
  }, [events, weekDays]);

  const today = new Date();
  const todayKey = toDateKey(today);
  const totalHours = HOUR_END - HOUR_START;

  return (
    <View className="flex-1">
      {/* Day headers */}
      <View className="flex-row border-b border-border" style={{ paddingLeft: 36 }}>
        {weekDays.map((day, idx) => {
          const isToday = toDateKey(day) === todayKey;
          return (
            <View key={idx} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
              <KText preset="calHeader" color={isToday ? colors.ink : colors.inkGhost}>
                {DAY_NAMES_SHORT[idx]}
              </KText>
              <View
                style={[
                  {
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 2,
                  },
                  isToday && { backgroundColor: colors.dark },
                ]}
              >
                <KText preset="calDay" color={isToday ? colors.darkText : colors.ink}>
                  {day.getDate()}
                </KText>
              </View>
            </View>
          );
        })}
      </View>

      {/* Time grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ position: 'relative', height: totalHours * HOUR_HEIGHT }}>
          {/* Hour lines */}
          {Array.from({ length: totalHours + 1 }, (_, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                top: i * HOUR_HEIGHT,
                left: 0,
                right: 0,
                flexDirection: 'row',
                alignItems: 'flex-start',
              }}
            >
              <View style={{ width: 36, paddingRight: 4, alignItems: 'flex-end' }}>
                <KText preset="calDay" color={colors.inkGhost}>
                  {String(HOUR_START + i).padStart(2, '0')}:00
                </KText>
              </View>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border, marginTop: 5 }} />
            </View>
          ))}

          {/* Event blocks per day column */}
          {weekDays.map((day, colIdx) => {
            const key = toDateKey(day);
            const dayEvents = eventsByDay[key] || [];

            return dayEvents.map((evt) => {
              const start = new Date(evt.start_time);
              const end = new Date(evt.end_time);
              const startMinutes = (start.getHours() - HOUR_START) * 60 + start.getMinutes();
              const endMinutes = (end.getHours() - HOUR_START) * 60 + end.getMinutes();
              const top = (startMinutes / 60) * HOUR_HEIGHT;
              const height = Math.max(((endMinutes - startMinutes) / 60) * HOUR_HEIGHT, 20);

              return (
                <View
                  key={evt.id}
                  style={{
                    position: 'absolute',
                    top,
                    left: 36 + colIdx * ((100 - 5) / 7) + '%' as any,
                    width: `${(100 - 5) / 7 - 1}%`,
                    height,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    backgroundColor: colors.bg,
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    overflow: 'hidden',
                  }}
                >
                  <KText preset="calDay" color={colors.ink} numberOfLines={2}>
                    {evt.title}
                  </KText>
                </View>
              );
            });
          })}
        </View>
      </ScrollView>
    </View>
  );
}
