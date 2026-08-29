import { View, Text } from 'react-native';
import { Bell } from 'lucide-react-native';
import { textPresets } from '../../theme/typography';
import { useColors } from '../../theme/useColors';
import { useAuthStore } from '../../stores/authStore';
import { getDayName, getWeekNumber, formatDateFR } from '../../lib/utils';

export function Header() {
  const colors = useColors();
  const profile = useAuthStore((s) => s.profile);
  const now = new Date();
  const nickname = profile?.nickname ?? profile?.full_name ?? 'Etudiant';

  return (
    <View className="px-xxl pt-xxl pb-lg">
      {/* Top row: eyebrow + date chip + bell */}
      <View className="flex-row items-center justify-between mb-md">
        <Text style={[textPresets.eyebrow, { color: colors.inkMuted }]}>
          {getDayName(now)} · Semaine {getWeekNumber(now)}
        </Text>
        <View className="flex-row items-center gap-sm">
          {/* Date chip */}
          <View className="px-md py-xs rounded-pill" style={{ backgroundColor: colors.dark }}>
            <Text style={[textPresets.dateChip, { color: colors.onDark }]}>
              {formatDateFR(now)}
            </Text>
          </View>
          {/* Notification bell */}
          <View className="w-[36px] h-[36px] rounded-full border items-center justify-center" style={{ borderColor: colors.border }}>
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
