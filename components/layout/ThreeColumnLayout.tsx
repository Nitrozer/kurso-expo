import { View } from 'react-native';
import { Rail } from './Rail';

type Props = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
};

export function ThreeColumnLayout({ children, sidebar }: Props) {
  return (
    <View className="flex-1 flex-row bg-parchment">
      <Rail />
      <View className="flex-1 border-l border-border">
        {children}
      </View>
      {sidebar && (
        <View className="w-[280px] border-l border-border">
          {sidebar}
        </View>
      )}
    </View>
  );
}
