import { View, Text } from 'react-native';
import { textPresets } from '../../theme/typography';

type Props = { label: string; variant?: 'default' | 'accent' | 'exam' };
const variantStyles = { default: 'bg-dark', accent: 'bg-accent', exam: 'bg-exam-red' };

export function Badge({ label, variant = 'default' }: Props) {
  return (
    <View className={`px-sm py-[3px] rounded-pill ${variantStyles[variant]}`}>
      <Text style={[textPresets.badgePill, { color: '#F7F3ED' }]}>{label}</Text>
    </View>
  );
}
