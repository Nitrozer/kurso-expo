import { View, useWindowDimensions } from 'react-native';
import { Rail } from './Rail';
import { BottomTabBar } from './BottomTabBar';

type Props = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
};

export function ThreeColumnLayout({ children, sidebar }: Props) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View className="flex-1 flex-row bg-parchment">
      {isTablet && <Rail />}
      <View className="flex-1 border-l border-border" style={!isTablet ? { borderLeftWidth: 0 } : undefined}>
        {children}
      </View>
      {isTablet && sidebar && (
        <View className="w-[280px] border-l border-border">
          {sidebar}
        </View>
      )}
      <BottomTabBar />
    </View>
  );
}
