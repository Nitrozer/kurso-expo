import { View } from 'react-native';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

type Props = {
  remaining: number; // seconds
  total: number; // seconds
};

export function TimerCircle({ remaining, total }: Props) {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progress = total > 0 ? remaining / total : 0;

  return (
    <View
      style={{
        width: 220,
        height: 220,
        borderRadius: 110,
        borderWidth: 2,
        borderColor: colors.borderSoft,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        position: 'relative',
      }}
    >
      {/* Progress ring overlay (simple top border approach) */}
      <View
        style={{
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: 110,
          borderWidth: 2,
          borderColor: colors.dark,
          opacity: progress,
        }}
      />
      <KText
        style={{
          fontFamily: fonts.serif.black,
          fontSize: 48,
          color: colors.ink,
          letterSpacing: -2,
        }}
      >
        {formatted}
      </KText>
      {remaining === total && (
        <KText style={{ fontFamily: fonts.sans.light, fontSize: 11, color: colors.inkSoft, marginTop: 2 }}>
          min
        </KText>
      )}
    </View>
  );
}
