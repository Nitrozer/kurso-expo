import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { KText } from '../../components/ui/Text';
import { colors } from '../../theme/colors';

export default function SettingsModal() {
  return (
    <View className="flex-1 bg-parchment p-xxl">
      <KText preset="sectionTitle" color={colors.ink} style={{ marginBottom: 20 }}>
        Parametres
      </KText>
      <KText preset="courseDetail" color={colors.inkMuted}>
        Les parametres seront disponibles prochainement.
      </KText>

      <Pressable onPress={() => router.back()} style={{ marginTop: 24, alignItems: 'center' }}>
        <KText preset="sectionAction" color={colors.inkMuted}>
          Fermer
        </KText>
      </Pressable>
    </View>
  );
}
