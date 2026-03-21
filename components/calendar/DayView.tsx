import { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import type { ScheduleEvent } from '../../types';

type Props = {
  events: ScheduleEvent[];
  date: Date;
};

const HOUR_START = 6;
const HOUR_END = 22;
const HOUR_HEIGHT = 56;

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function DayView({ events, date }: Props) {
  const dateKey = toDateKey(date);
  const totalHours = HOUR_END - HOUR_START;

  const dayEvents = useMemo(
    () => events.filter((e) => e.start_time.split('T')[0] === dateKey),
    [events, dateKey],
  );

  return (
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
            <View style={{ width: 44, paddingRight: 8, alignItems: 'flex-end' }}>
              <KText preset="calDay" color={colors.inkGhost}>
                {String(HOUR_START + i).padStart(2, '0')}:00
              </KText>
            </View>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border, marginTop: 5 }} />
          </View>
        ))}

        {/* Event cards */}
        {dayEvents.map((evt) => {
          const start = new Date(evt.start_time);
          const end = new Date(evt.end_time);
          const startMinutes = (start.getHours() - HOUR_START) * 60 + start.getMinutes();
          const endMinutes = (end.getHours() - HOUR_START) * 60 + end.getMinutes();
          const top = (startMinutes / 60) * HOUR_HEIGHT;
          const height = Math.max(((endMinutes - startMinutes) / 60) * HOUR_HEIGHT, 24);

          return (
            <View
              key={evt.id}
              style={{
                position: 'absolute',
                top,
                left: 52,
                right: 8,
                height,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                backgroundColor: colors.bg,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <KText preset="courseTitle" color={colors.ink} numberOfLines={1}>
                {evt.title}
              </KText>
              {evt.location && (
                <KText preset="courseDetail" color={colors.inkMuted} numberOfLines={1}>
                  {evt.location}
                </KText>
              )}
              <KText preset="taskDue" color={colors.inkSoft}>
                {String(start.getHours()).padStart(2, '0')}:{String(start.getMinutes()).padStart(2, '0')}
                {' - '}
                {String(end.getHours()).padStart(2, '0')}:{String(end.getMinutes()).padStart(2, '0')}
              </KText>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
