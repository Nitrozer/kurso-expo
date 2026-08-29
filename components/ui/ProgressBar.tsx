import { View } from 'react-native';
import { useColors } from '../../theme/useColors';

type Props = { progress: number };

export function ProgressBar({ progress }: Props) {
  const colors = useColors();
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <View className="h-[2px] rounded-full w-full" style={{ backgroundColor: colors.borderSoft }}>
      <View
        className="h-full rounded-full relative"
        style={{ width: `${clampedProgress * 100}%`, backgroundColor: colors.dark }}
      >
        <View
          className="absolute right-0 top-1/2 w-[6px] h-[6px] rounded-full"
          style={{ backgroundColor: colors.blue, transform: [{ translateY: -3 }, { translateX: 3 }] }}
        />
      </View>
    </View>
  );
}
