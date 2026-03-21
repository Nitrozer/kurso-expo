import { Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import type { LucideIcon } from 'lucide-react-native';

type Props = { icon: LucideIcon; onPress: () => void; size?: number; active?: boolean };

export function IconButton({ icon: Icon, onPress, size = 18, active }: Props) {
  return (
    <Pressable onPress={onPress} className="w-[36px] h-[36px] rounded-md border border-border-soft items-center justify-center">
      <Icon size={size} strokeWidth={1.6} color={active ? colors.ink : colors.inkGhost} />
    </Pressable>
  );
}
