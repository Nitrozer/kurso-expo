import { View, Text } from 'react-native';
import { textPresets } from '../../theme/typography';
import { useColors } from '../../theme/useColors';

type Props = { label: string; variant?: 'default' | 'accent' | 'exam' };

export function Badge({ label, variant = 'default' }: Props) {
  const colors = useColors();
  const bg = variant === 'accent' ? colors.blue : variant === 'exam' ? colors.examRed : colors.dark;

  return (
    <View className="px-sm py-[3px] rounded-pill" style={{ backgroundColor: bg }}>
      <Text style={[textPresets.badgePill, { color: colors.darkText }]}>{label}</Text>
    </View>
  );
}
