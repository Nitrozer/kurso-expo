import { View, Pressable, Text } from 'react-native';
import { usePathname, router } from 'expo-router';
import {
  House, Calendar, BookOpen, CheckSquare, BarChart3,
  Brain, Calculator, Settings, BookMarked,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useColors } from '../../theme/useColors';
import { useAuthStore } from '../../stores/authStore';
import { useGamificationStore } from '../../stores/gamificationStore';

const mainItems = [
  { icon: House, path: '/(main)', label: 'Home' },
  { icon: Calendar, path: '/(main)/calendar', label: 'Calendrier' },
  { icon: BookOpen, path: '/(main)/notebooks', label: 'Cahiers' },
  { icon: CheckSquare, path: '/(main)/tasks', label: 'Tâches' },
  { icon: BarChart3, path: '/(main)/stats', label: 'Stats' },
  { icon: BookMarked, path: '/(main)/revision', label: 'Révision' },
];

const extraItems = [
  { icon: Brain, path: '/(main)/flashcards', label: 'Flashcards' },
  { icon: Calculator, path: '/(main)/calculator', label: 'Calculatrice' },
];

export function Rail() {
  const pathname = usePathname();
  const profile = useAuthStore((s) => s.profile);
  const streak = useGamificationStore((s) => s.streak);
  const c = useColors();

  const isActive = (path: string) => {
    if (path === '/(main)') return pathname === '/' || pathname === '/(main)';
    return pathname.startsWith(path.replace('/(main)', ''));
  };

  const renderItem = ({ icon: Icon, path, label }: typeof mainItems[0]) => {
    const active = isActive(path);
    return (
      <Pressable
        key={path}
        onPress={() => router.push(path)}
        className="w-full items-center py-md relative"
      >
        {active && (
          <View className="absolute left-0 top-[25%] h-[50%] w-[2px] bg-accent rounded-r-full" />
        )}
        <Icon size={22} strokeWidth={1.6} color={active ? c.ink : c.inkGhost} />
      </Pressable>
    );
  };

  return (
    <View className="w-[72px] items-center py-xxl justify-between" style={{ backgroundColor: c.bg }}>
      <View className="items-center mb-xxl">
        <View className="flex-row items-baseline">
          <Text style={{ fontFamily: 'Fraunces_900Black', fontSize: 22, color: c.ink }}>K</Text>
          <Text style={{ fontFamily: 'Fraunces_300Light_Italic', fontSize: 14, color: c.blue }}>{'\u00B0'}</Text>
        </View>
        <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 10, color: c.inkSoft, marginTop: 4 }}>
          {'\uD83D\uDD25'} {streak.current_streak}
        </Text>
      </View>
      <View className="flex-1">
        {mainItems.map(renderItem)}
        <View className="w-[24px] h-[1px] bg-border self-center my-lg" />
        {extraItems.map(renderItem)}
      </View>
      <View className="items-center">
        <Pressable onPress={() => router.push('/(modals)/settings')}>
          <Settings size={20} strokeWidth={1.6} color={c.inkGhost} />
        </Pressable>
        <View className="w-[32px] h-[32px] rounded-full border border-border-soft items-center justify-center mt-md">
          <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 12, color: c.ink }}>
            {profile?.avatar_letter ?? '?'}
          </Text>
        </View>
      </View>
    </View>
  );
}
