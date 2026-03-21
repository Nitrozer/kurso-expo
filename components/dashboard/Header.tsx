import { View, Text } from 'react-native';
import { Bell } from 'lucide-react-native';
import { textPresets } from '../../theme/typography';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../stores/authStore';
import { getDayName, getWeekNumber, formatDateFR } from '../../lib/utils';

export function Header() {
  const profile = useAuthStore((s) => s.profile);
  const now = new Date();
  const nickname = profile?.nickname ?? profile?.full_name ?? 'Etudiant';

  return (
    <View className="px-xxl pt-xxl pb-lg">
      {/* Top row: eyebrow + date chip + bell */}
      <View className="flex-row items-center justify-between mb-md">
        <Text style={[textPresets.eyebrow, { color: '#B8B0A4' }]}>
          {getDayName(now)} · Semaine {getWeekNumber(now)}
        </Text>
        <View className="flex-row items-center gap-sm">
          {/* Date chip */}
          <View className="bg-dark px-md py-xs rounded-pill">
            <Text style={[textPresets.dateChip, { color: '#FFFFFF' }]}>
              {formatDateFR(now)}
            </Text>
          </View>
          {/* Notification bell */}
          <View className="w-[36px] h-[36px] rounded-full border border-border items-center justify-center">
            <Bell size={18} strokeWidth={1.6} color={colors.inkGhost} />
          </View>
        </View>
      </View>

      {/* Hero name */}
      <Text style={[textPresets.heroName, { color: colors.ink }]}>
        Bonjour{'\n'}{nickname}
        <Text style={{ fontFamily: 'Fraunces_300Light_Italic', color: colors.blue }}>.</Text>
      </Text>
    </View>
  );
}
