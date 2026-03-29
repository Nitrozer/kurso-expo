import { View, Text, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import { textPresets } from '../../theme/typography';
import { colors } from '../../theme/colors';
import { Badge } from '../ui/Badge';
import { formatTime } from '../../lib/utils';
import { useNotesStore } from '../../stores/notesStore';
import type { ScheduleEvent, Subject } from '../../types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Status = 'past' | 'now' | 'next' | 'later';

type Props = {
  event: ScheduleEvent;
  status: Status;
  subject?: Subject;
};

export function TimelineCard({ event, status, subject }: Props) {
  const pressed = useSharedValue(0);
  const linkedNote = useNotesStore((s) => s.notes.find((n) => n.event_id === event.id));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pressed.value * 3 }],
  }));

  const isPast = status === 'past';
  const isNow = status === 'now';

  const startTime = formatTime(new Date(event.start_time));
  const endTime = formatTime(new Date(event.end_time));
  const timeRange = `${startTime.hours}:${startTime.minutes} - ${endTime.hours}:${endTime.minutes}`;

  const cardBg = isNow ? colors.dark : colors.bg;
  const cardBorder = isNow ? colors.dark : colors.border;
  const titleColor = isNow ? '#FFFFFF' : colors.ink;
  const detailColor = isNow ? colors.darkMuted : colors.inkSoft;

  return (
    <AnimatedPressable
      onPressIn={() => { pressed.value = withTiming(1, { duration: 150 }); }}
      onPressOut={() => { pressed.value = withTiming(0, { duration: 150 }); }}
      style={[
        animatedStyle,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          borderWidth: 1,
          borderRadius: 12,
          padding: 14,
          opacity: isPast ? 0.38 : 1,
          flex: 1,
        },
      ]}
    >
      {/* Badge for current */}
      {isNow && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Badge label="EN COURS" variant="accent" />
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            restant {Math.max(0, Math.round((new Date(event.end_time).getTime() - Date.now()) / 60000))}m
          </Text>
        </View>
      )}

      {/* Title */}
      <Text style={[textPresets.courseTitle, { color: titleColor }]}>
        {event.title}
      </Text>

      {/* Location + professor */}
      <Text style={[textPresets.courseDetail, { color: detailColor, marginTop: 4 }]}>
        {[event.location, subject?.professor].filter(Boolean).join(' · ') || timeRange}
      </Text>

      {/* Time range (if we showed location above) */}
      {(event.location || subject?.professor) && (
        <Text style={[textPresets.courseDetail, { color: detailColor, marginTop: 2 }]}>
          {timeRange}
        </Text>
      )}

      {/* Linked note indicator */}
      {linkedNote && (
        <Pressable
          onPress={() => router.push({ pathname: '/(main)/notes/[id]', params: { id: linkedNote.id } })}
          hitSlop={8}
          style={{ position: 'absolute', top: 10, right: 10 }}
        >
          <Text style={{ fontSize: 14 }}>{'\uD83D\uDCDD'}</Text>
        </Pressable>
      )}
    </AnimatedPressable>
  );
}
