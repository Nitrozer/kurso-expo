import { View, Pressable, ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolateColor } from 'react-native-reanimated';
import { useColors } from '../../theme/useColors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = ViewProps & { onPress?: () => void; onLongPress?: () => void; inverted?: boolean };

export function Card({ onPress, onLongPress, inverted, className, children, ...props }: Props) {
  const colors = useColors();
  const pressed = useSharedValue(0);

  // Extraits hors du worklet : le hook ne doit pas etre capture sur le thread UI
  const borderIdle = colors.border;
  const borderPressed = colors.ink;
  const backgroundColor = inverted ? colors.dark : colors.bg;

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(pressed.value, [0, 1], [borderIdle, borderPressed]),
  }));

  if (onPress) {
    return (
      <AnimatedPressable
        onPressIn={() => { pressed.value = withTiming(1, { duration: 150 }); }}
        onPressOut={() => { pressed.value = withTiming(0, { duration: 150 }); }}
        onPress={onPress}
        onLongPress={onLongPress}
        className={`border rounded-xl p-lg ${className ?? ''}`}
        style={[{ backgroundColor }, animatedStyle]}
        {...props}
      >{children}</AnimatedPressable>
    );
  }
  return (
    <View
      className={`border rounded-xl p-lg ${className ?? ''}`}
      style={{ backgroundColor, borderColor: colors.border }}
      {...props}
    >{children}</View>
  );
}
