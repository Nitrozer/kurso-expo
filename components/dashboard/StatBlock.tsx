import { Pressable, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { textPresets } from '../../theme/typography';
import { colors } from '../../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'big' | 'med' | 'sm' | 'accent';

type Props = {
  value: string;
  unit: string;
  label: string;
  variant: Variant;
};

const variantConfig = {
  big: {
    width: 130,
    bg: colors.dark,
    borderColor: 'transparent',
    textColor: '#FFFFFF',
    ghostOpacity: 0.07,
  },
  med: {
    width: 100,
    bg: colors.bg,
    borderColor: colors.borderSoft,
    textColor: colors.ink,
    ghostOpacity: 0.04,
  },
  sm: {
    width: 88,
    bg: colors.bg,
    borderColor: colors.borderSoft,
    textColor: colors.ink,
    ghostOpacity: 0.04,
  },
  accent: {
    width: 100,
    bg: '#EEF0FF',
    borderColor: '#C8D0FF',
    textColor: colors.blue,
    ghostOpacity: 0.04,
  },
};

export function StatBlock({ value, unit, label, variant }: Props) {
  const config = variantConfig[variant];
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * -2 }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { pressed.value = withTiming(1, { duration: 150 }); }}
      onPressOut={() => { pressed.value = withTiming(0, { duration: 150 }); }}
      style={[
        animatedStyle,
        {
          width: config.width,
          backgroundColor: config.bg,
          borderColor: config.borderColor,
          borderWidth: config.borderColor !== 'transparent' ? 1 : 0,
          borderRadius: 12,
          padding: 14,
          overflow: 'hidden',
        },
      ]}
    >
      {/* Ghost number */}
      <Text
        style={{
          position: 'absolute',
          bottom: -8,
          right: -4,
          fontSize: 72,
          fontFamily: 'Fraunces_900Black',
          color: config.textColor,
          opacity: config.ghostOpacity,
          lineHeight: 72,
        }}
      >
        {value}
      </Text>

      {/* Value + unit */}
      <View className="flex-row items-baseline">
        <Text style={[textPresets.statBig, { color: config.textColor }]}>
          {value}
        </Text>
        <Text style={{ fontFamily: 'Fraunces_300Light_Italic', color: colors.blue, fontSize: 14, marginLeft: 3 }}>
          {unit}
        </Text>
      </View>

      {/* Label */}
      <Text style={[textPresets.statLabel, { color: config.textColor, opacity: 0.7, marginTop: 4 }]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}
