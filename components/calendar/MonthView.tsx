import { useMemo } from 'react';
import { View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import type { ScheduleEvent } from '../../types';

type Props = {
  events: ScheduleEvent[];
  selectedDate: string;
  onDayPress: (date: string) => void;
};

export function MonthView({ events, selectedDate, onDayPress }: Props) {
  const markedDates = useMemo(() => {
    const marks: Record<string, { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string; selectedTextColor?: string }> = {};

    events.forEach((e) => {
      const dateKey = e.start_time.split('T')[0];
      marks[dateKey] = {
        ...marks[dateKey],
        marked: true,
        dotColor: colors.blue,
      };
    });

    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: 'transparent',
        selectedTextColor: colors.blue,
      };
    }

    return marks;
  }, [events, selectedDate]);

  return (
    <View>
      <Calendar
        onDayPress={(day: DateData) => onDayPress(day.dateString)}
        markedDates={markedDates}
        firstDay={1}
        theme={{
          calendarBackground: colors.bg,
          textSectionTitleColor: colors.inkGhost,
          todayTextColor: colors.darkText,
          todayBackgroundColor: colors.dark,
          selectedDayBackgroundColor: 'transparent',
          selectedDayTextColor: colors.blue,
          dayTextColor: colors.ink,
          textDisabledColor: colors.inkDim,
          monthTextColor: colors.ink,
          textMonthFontFamily: fonts.serif.bold,
          textDayFontFamily: fonts.sans.light,
          textDayHeaderFontFamily: fonts.sans.medium,
          textMonthFontSize: 16,
          textDayFontSize: 12,
          textDayHeaderFontSize: 8,
          arrowColor: colors.ink,
          dotColor: colors.blue,
        }}
      />
    </View>
  );
}
