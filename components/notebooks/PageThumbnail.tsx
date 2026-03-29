import { View, Image, Pressable } from 'react-native';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import type { NotebookPage } from '../../types';

type Props = {
  page: NotebookPage;
  isActive: boolean;
  onPress: () => void;
  onDelete?: () => void;
};

const templateLabels: Record<string, string> = {
  blank: 'Vierge',
  lined: 'Ligne',
  grid: 'Grille',
  dotted: 'Points',
};

export function PageThumbnail({ page, isActive, onPress, onDelete }: Props) {
  const thumbnailBase64 = (page.drawing_data as { thumbnail?: string } | null)?.thumbnail;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onDelete}
      delayLongPress={500}
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
      {thumbnailBase64 ? (
        <Image
          source={{ uri: `data:image/png;base64,${thumbnailBase64}` }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : page.thumbnail_url ? (
        <Image
          source={{ uri: page.thumbnail_url }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          {/* Mini template preview */}
          <TemplatePreview template={page.template} />
          <KText preset="noteTitle" color={isActive ? colors.blue : colors.inkSoft} style={{ position: 'absolute' }}>
            {page.page_number}
          </KText>
          <KText
            preset="notePreview"
            color={colors.inkMuted}
            style={{ fontSize: 7, position: 'absolute', bottom: 4 }}
          >
            {templateLabels[page.template] ?? 'Vierge'}
          </KText>
        </View>
      )}
    </Pressable>
  );
}

function TemplatePreview({ template }: { template: string }) {
  const lineColor = '#E0D8CE';

  if (template === 'blank') return null;

  const elements: React.ReactNode[] = [];

  if (template === 'lined' || template === 'grid') {
    for (let y = 12; y < 72; y += 10) {
      elements.push(
        <View key={`h-${y}`} style={{ position: 'absolute', top: y, left: 4, right: 4, height: 0.5, backgroundColor: lineColor }} />
      );
    }
  }

  if (template === 'grid') {
    for (let x = 4; x < 56; x += 10) {
      elements.push(
        <View key={`v-${x}`} style={{ position: 'absolute', top: 12, left: x, width: 0.5, bottom: 8, backgroundColor: lineColor }} />
      );
    }
  }

  if (template === 'dotted') {
    for (let y = 12; y < 72; y += 10) {
      for (let x = 8; x < 56; x += 10) {
        elements.push(
          <View key={`d-${x}-${y}`} style={{ position: 'absolute', top: y, left: x, width: 1, height: 1, borderRadius: 0.5, backgroundColor: lineColor }} />
        );
      }
    }
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {elements}
    </View>
  );
}
