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
    minWidth: 130,
    bg: colors.dark,
    borderColor: 'transparent',
    textColor: '#FFFFFF',
    labelColor: colors.darkMuted,
    ghostOpacity: 0.07,
  },
  med: {
    minWidth: 100,
    bg: colors.bg,
    borderColor: colors.borderSoft,
    textColor: colors.ink,
    labelColor: colors.darkMuted,
    ghostOpacity: 0.04,
  },
  sm: {
    minWidth: 100,
    bg: colors.bg,
    borderColor: colors.borderSoft,
    textColor: colors.ink,
    labelColor: colors.darkMuted,
    ghostOpacity: 0.04,
  },
  accent: {
    minWidth: 100,
    bg: '#FDF9F3',
    borderColor: colors.border,
    textColor: colors.ink,
    labelColor: colors.darkMuted,
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
          minWidth: config.minWidth,
          height: 160,
          backgroundColor: config.bg,
          borderColor: config.borderColor,
          borderWidth: config.borderColor !== 'transparent' ? 1 : 0,
          borderRadius: 14,
          padding: 20,
          overflow: 'hidden',
          justifyContent: 'space-between',
        },
      ]}
    >
      {/* Ghost number — top right like Stitch */}
      <Text
        style={{
          position: 'absolute',
          top: 0,
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

      {/* Value + unit — at top */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', zIndex: 10 }}>
        <Text style={[textPresets.statBig, { color: config.textColor }]}>
          {value}
        </Text>
        {unit ? (
          <Text style={{ fontFamily: 'Fraunces_300Light_Italic', color: colors.blue, fontSize: 20, marginLeft: 2 }}>
            {unit}
          </Text>
        ) : null}
      </View>

      {/* Label — at bottom */}
      <Text
        style={{
          fontFamily: 'DMSans_300Light',
          fontSize: 9.5,
          color: config.labelColor,
          lineHeight: 13,
          maxWidth: 70,
          zIndex: 10,
        }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
