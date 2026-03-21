import { View, Pressable } from 'react-native';
import { KText } from './Text';
import { colors } from '../../theme/colors';

type Props = { title: string; action?: string; onAction?: () => void };

export function SectionDivider({ title, action, onAction }: Props) {
  return (
    <View className="flex-row items-center gap-md my-lg">
      <KText preset="sectionTitle" color={colors.ink}>{title}</KText>
      <View className="flex-1 h-[1px] bg-border" />
      {action && (
        <Pressable onPress={onAction}>
          <KText preset="sectionAction" color={colors.blue}>{action}</KText>
        </Pressable>
      )}
    </View>
  );
}
