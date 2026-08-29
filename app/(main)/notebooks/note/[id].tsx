import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { NoteEditor } from '../../../../components/notes/NoteEditor';
import { FormattingToolbar } from '../../../../components/notes/FormattingToolbar';
import { IconButton } from '../../../../components/ui/IconButton';
import { KText } from '../../../../components/ui/Text';
import { useColors } from '../../../../theme/useColors';

export default function NoteEditorScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: 12,
        }}
      >
        <IconButton icon={ChevronLeft} onPress={() => router.back()} />
        <KText preset="sectionTitle" color={colors.ink}>
          Note
        </KText>
      </View>
      <NoteEditor noteId={id!} />
      <FormattingToolbar />
    </View>
  );
}
