import { View, Pressable } from 'react-native';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import type { MoodEntry } from '../../types';

type Props = {
  moods: MoodEntry[];
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

const DAY_HEADERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function MoodHeatmap({ moods, month, year, onPrevMonth, onNextMonth }: Props) {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  // Monday-based: 0=Mon, 6=Sun
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const moodMap = new Map<number, string>();
  moods.forEach((m) => {
    const day = parseInt(m.entry_date.split('-')[2], 10);
    moodMap.set(day, m.mood);
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View>
      {/* Month header */}
      <View className="flex-row items-center justify-between mb-md">
        <Pressable onPress={onPrevMonth}>
          <KText style={{ fontFamily: fonts.sans.medium, fontSize: 16, color: colors.ink }}>
            ‹
          </KText>
        </Pressable>
        <KText preset="monthName" color={colors.ink}>
          {MONTH_NAMES[month - 1]} {year}
        </KText>
        <Pressable onPress={onNextMonth}>
          <KText style={{ fontFamily: fonts.sans.medium, fontSize: 16, color: colors.ink }}>
            ›
          </KText>
        </Pressable>
      </View>

      {/* Day headers */}
      <View className="flex-row mb-xs">
        {DAY_HEADERS.map((h, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <KText preset="calHeader" color={colors.inkMuted}>
              {h}
            </KText>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View className="flex-row flex-wrap">
        {cells.map((day, i) => (
          <View
            key={i}
            style={{
              width: `${100 / 7}%`,
              aspectRatio: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {day !== null ? (
              <View style={{ alignItems: 'center' }}>
                {moodMap.has(day) ? (
                  <KText style={{ fontSize: 14 }}>{moodMap.get(day)}</KText>
                ) : (
                  <KText style={{ fontFamily: fonts.sans.light, fontSize: 10, color: colors.inkGhost }}>
                    {day}
                  </KText>
                )}
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}
