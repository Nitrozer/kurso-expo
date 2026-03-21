import { View } from 'react-native';

type Props = { progress: number };

export function ProgressBar({ progress }: Props) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  return (
    <View className="h-[2px] bg-border-soft rounded-full w-full">
      <View className="h-full bg-dark rounded-full relative" style={{ width: `${clampedProgress * 100}%` }}>
        <View className="absolute right-0 top-1/2 w-[6px] h-[6px] rounded-full bg-accent" style={{ transform: [{ translateY: -3 }, { translateX: 3 }] }} />
      </View>
    </View>
  );
}
