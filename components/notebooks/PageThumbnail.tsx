import { View, Image, Pressable } from 'react-native';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import type { NotebookPage } from '../../types';

type Props = {
  page: NotebookPage;
  isActive: boolean;
  onPress: () => void;
};

const templateLabels: Record<string, string> = {
  blank: 'Vierge',
  lined: 'Ligné',
  grid: 'Grille',
  dotted: 'Points',
};

export function PageThumbnail({ page, isActive, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 60,
        height: 80,
        borderRadius: 6,
        borderWidth: isActive ? 2 : 1,
        borderColor: isActive ? colors.blue : colors.border,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        overflow: 'hidden',
      }}
    >
      {page.thumbnail_url ? (
        <Image
          source={{ uri: page.thumbnail_url }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <>
          <KText preset="noteTitle" color={isActive ? colors.blue : colors.inkSoft}>
            {page.page_number}
          </KText>
          <KText
            preset="notePreview"
            color={colors.inkMuted}
            style={{ fontSize: 7, marginTop: 2 }}
          >
            {templateLabels[page.template] ?? 'Vierge'}
          </KText>
        </>
      )}
    </Pressable>
  );
}
