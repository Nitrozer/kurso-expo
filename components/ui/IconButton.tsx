import { Pressable } from 'react-native';
import { useColors } from '../../theme/useColors';
import type { LucideIcon } from 'lucide-react-native';

type Props = { icon: LucideIcon; onPress: () => void; size?: number; active?: boolean };

export function IconButton({ icon: Icon, onPress, size = 18, active }: Props) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} className="w-[36px] h-[36px] rounded-md border items-center justify-center" style={{ borderColor: colors.borderSoft }}>
      <Icon size={size} strokeWidth={1.6} color={active ? colors.ink : colors.inkGhost} />
    </Pressable>
  );
}
