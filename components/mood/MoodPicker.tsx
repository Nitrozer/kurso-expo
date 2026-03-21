import { View, Pressable, TextInput } from 'react-native';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import type { MoodEntry } from '../../types';

type MoodValue = MoodEntry['mood'];

const MOODS: MoodValue[] = ['😊', '🙂', '😐', '😕', '😢'];

type Props = {
  selectedMood: MoodValue | null;
  note: string;
  onMoodSelect: (mood: MoodValue) => void;
  onNoteChange: (note: string) => void;
  onSave: () => void;
};

export function MoodPicker({ selectedMood, note, onMoodSelect, onNoteChange, onSave }: Props) {
  return (
    <View>
      <View className="flex-row justify-center gap-md mb-lg">
        {MOODS.map((mood) => (
          <Pressable key={mood} onPress={() => onMoodSelect(mood)}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: selectedMood === mood ? colors.blue : colors.border,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <KText style={{ fontSize: 20 }}>{mood}</KText>
            </View>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={note}
        onChangeText={onNoteChange}
        placeholder="Comment te sens-tu ?"
        placeholderTextColor={colors.inkMuted}
        multiline
        style={{
          fontFamily: fonts.sans.regular,
          fontSize: 13,
          color: colors.ink,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 10,
          minHeight: 60,
          marginBottom: 12,
        }}
      />
      <Pressable onPress={onSave} disabled={!selectedMood}>
        <View
          style={{
            backgroundColor: selectedMood ? colors.dark : colors.borderSoft,
            borderRadius: 12,
            paddingVertical: 10,
            alignItems: 'center',
          }}
        >
          <KText style={{ fontFamily: fonts.sans.medium, fontSize: 12, color: selectedMood ? colors.darkText : colors.inkMuted }}>
            Enregistrer
          </KText>
        </View>
      </Pressable>
    </View>
  );
}
