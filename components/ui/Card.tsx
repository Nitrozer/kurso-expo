import { View, Pressable, ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolateColor } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = ViewProps & { onPress?: () => void; inverted?: boolean };

export function Card({ onPress, inverted, className, children, ...props }: Props) {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(pressed.value, [0, 1], ['#E8E2DA', '#111111']),
  }));
  const bg = inverted ? 'bg-dark' : 'bg-parchment';

  if (onPress) {
    return (
      <AnimatedPressable
        onPressIn={() => { pressed.value = withTiming(1, { duration: 150 }); }}
        onPressOut={() => { pressed.value = withTiming(0, { duration: 150 }); }}
        onPress={onPress}
        className={`border rounded-xl p-lg ${bg} ${className ?? ''}`}
        style={[animatedStyle]}
        {...props}
      >{children}</AnimatedPressable>
    );
  }
  return <View className={`border border-border rounded-xl p-lg ${bg} ${className ?? ''}`} {...props}>{children}</View>;
}
