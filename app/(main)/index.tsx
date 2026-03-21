import { View, Text } from 'react-native';
import { textPresets } from '../../theme/typography';
import { colors } from '../../theme/colors';

export default function DashboardScreen() {
  return (
    <View className="flex-1 bg-parchment p-xxl">
      <Text style={[textPresets.heroName, { color: colors.ink }]}>
        Bonjour{'\n'}Enzo
        <Text style={{ fontFamily: 'Fraunces_300Light_Italic', color: colors.blue }}>.</Text>
      </Text>
    </View>
  );
}
