import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

type Props = {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FlipCard({ front, back, isFlipped, onFlip }: Props) {
  const rotation = useSharedValue(0);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value + 180}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  const handleFlip = () => {
    rotation.value = withSpring(isFlipped ? 0 : 180, { damping: 20, stiffness: 120, mass: 0.8 });
    onFlip();
  };

  return (
    <Pressable onPress={handleFlip} style={{ width: '100%', height: 240 }}>
      {/* Front */}
      <Animated.View
        style={[
          frontStyle,
          {
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: colors.dark,
            borderRadius: 14,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          },
        ]}
      >
        <KText
          style={{
            fontFamily: fonts.serif.bold,
            fontSize: 18,
            color: colors.darkText,
            textAlign: 'center',
          }}
        >
          {front}
        </KText>
      </Animated.View>

      {/* Back */}
      <Animated.View
        style={[
          backStyle,
          {
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: colors.bg,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          },
        ]}
      >
        <KText
          style={{
            fontFamily: fonts.sans.regular,
            fontSize: 16,
            color: colors.ink,
            textAlign: 'center',
          }}
        >
          {back}
        </KText>
      </Animated.View>
    </Pressable>
  );
}
