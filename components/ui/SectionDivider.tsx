import { View, Pressable } from 'react-native';
import { KText } from './Text';
import { useColors } from '../../theme/useColors';

type Props = { title: string; action?: string; onAction?: () => void };

export function SectionDivider({ title, action, onAction }: Props) {
  const colors = useColors();
  return (
    <View className="flex-row items-center gap-md my-lg">
      <KText preset="sectionTitle" color={colors.ink}>{title}</KText>
      <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
      {action && (
        <Pressable onPress={onAction}>
          <KText preset="sectionAction" color={colors.blue}>{action}</KText>
        </Pressable>
      )}
    </View>
  );
}
