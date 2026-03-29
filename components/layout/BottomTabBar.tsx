import { View, Pressable, useWindowDimensions } from 'react-native';
import { usePathname, router } from 'expo-router';
import { House, Calendar, BookOpen, CheckSquare, BarChart3 } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const tabs = [
  { icon: House, path: '/(main)', label: 'Home' },
  { icon: Calendar, path: '/(main)/calendar', label: 'Calendrier' },
  { icon: BookOpen, path: '/(main)/notebooks', label: 'Notes' },
  { icon: CheckSquare, path: '/(main)/tasks', label: 'Taches' },
  { icon: BarChart3, path: '/(main)/stats', label: 'Stats' },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  // Only show on mobile (< 768px)
  if (width >= 768) return null;

  const isActive = (path: string) => {
    if (path === '/(main)') return pathname === '/' || pathname === '/(main)';
    return pathname.startsWith(path.replace('/(main)', ''));
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 32,
        backgroundColor: 'rgba(253, 249, 243, 0.8)',
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {tabs.map(({ icon: Icon, path }) => {
        const active = isActive(path);
        return (
          <Pressable
            key={path}
            onPress={() => router.push(path)}
            style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}
          >
            <Icon
              size={22}
              strokeWidth={1.6}
              color={active ? colors.ink : colors.inkGhost}
            />
            {active && (
              <View
                style={{
                  position: 'absolute',
                  bottom: -6,
                  width: '50%',
                  height: 2,
                  backgroundColor: colors.blue,
                  borderRadius: 1,
                }}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
