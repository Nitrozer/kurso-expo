import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { colors } from '../../theme/colors';

type Props = { checked: boolean; onToggle: () => void };

export function Checkbox({ checked, onToggle }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: checked ? colors.ink : 'transparent',
    borderColor: checked ? colors.ink : colors.inkDim,
  }));

  const handlePress = () => {
    scale.value = withSequence(withTiming(1.2, { duration: 100 }), withSpring(1, { damping: 15 }));
    onToggle();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View className="w-[14px] h-[14px] rounded-[4px] border-[1.5px] items-center justify-center" style={animatedStyle}>
        {checked && <Check size={10} color={colors.darkText} strokeWidth={2.5} />}
      </Animated.View>
    </Pressable>
  );
}
