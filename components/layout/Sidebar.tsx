import { ScrollView } from 'react-native';

type Props = { children: React.ReactNode };

export function Sidebar({ children }: Props) {
  return (
    <ScrollView className="flex-1 bg-parchment p-xxl" showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}
