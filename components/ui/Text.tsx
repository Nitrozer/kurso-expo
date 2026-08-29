import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { textPresets } from '../../theme/typography';
import { useColors } from '../../theme/useColors';

type Preset = keyof typeof textPresets;
type Props = TextProps & { preset?: Preset; color?: string };

export function KText({ preset, color, style, ...props }: Props) {
  const presetStyle = preset ? textPresets[preset] : {};
  return <RNText style={[presetStyle, color ? { color } : {}, style] as TextStyle[]} {...props} />;
}

type UnitProps = { children: React.ReactNode };
export function BlueUnit({ children }: UnitProps) {
  const colors = useColors();
  return <RNText style={{ fontFamily: 'Fraunces_300Light_Italic', color: colors.blue }}>{children}</RNText>;
}
