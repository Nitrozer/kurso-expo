import { ScrollView } from 'react-native';
import { useColors } from '../../theme/useColors';

type Props = { children: React.ReactNode };

export function Sidebar({ children }: Props) {
  const colors = useColors();
  return (
    <ScrollView className="flex-1 p-xxl" style={{ backgroundColor: colors.bg }} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}
