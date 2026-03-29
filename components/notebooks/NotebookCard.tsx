import { View, Alert, Platform, Pressable } from 'react-native';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import type { Notebook } from '../../types';

const COVER_COLORS = [
  { label: 'Bleu', value: '#3D5AFE' },
  { label: 'Rouge', value: '#FF6B6B' },
  { label: 'Vert', value: '#4CAF50' },
  { label: 'Orange', value: '#FF9800' },
  { label: 'Violet', value: '#9C27B0' },
  { label: 'Cyan', value: '#00BCD4' },
  { label: 'Marron', value: '#795548' },
  { label: 'Gris', value: '#607D8B' },
  { label: 'Noir', value: '#111111' },
];

// Mini template preview constants
const PREVIEW_LINE_COLOR = 'rgba(255,255,255,0.25)';
const PREVIEW_SPACING = 10;

type Props = {
  notebook: Notebook;
  pageCount: number;
  subjectName?: string;
  onPress: () => void;
  onRename?: (id: string, newTitle: string) => void;
  onChangeColor?: (id: string, newColor: string) => void;
  onDelete?: (id: string) => void;
};

function MiniTemplatePreview({ color }: { color: string }) {
  // Show faint lined pattern on the cover to hint at notebook content
  const lines: React.ReactNode[] = [];
  for (let y = PREVIEW_SPACING; y < 80; y += PREVIEW_SPACING) {
    lines.push(
      <View
        key={`l-${y}`}
        style={{
          position: 'absolute',
          top: y,
          left: 12,
          right: 12,
          height: 0.5,
          backgroundColor: PREVIEW_LINE_COLOR,
        }}
      />
    );
  }
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        height: 90,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.15)',
        overflow: 'hidden',
      }}
    >
      {lines}
    </View>
  );
}

export function NotebookCard({ notebook, pageCount, subjectName, onPress, onRename, onChangeColor, onDelete }: Props) {
  const handleRename = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Renommer le cahier',
        '',
        (newTitle) => {
          if (newTitle && newTitle.trim() && onRename) {
            onRename(notebook.id, newTitle.trim());
          }
        },
        'plain-text',
        notebook.title,
      );
    }
  };

  const handleChangeColor = () => {
    Alert.alert(
      'Changer la couleur',
      'Choisissez une couleur de couverture',
      [
        ...COVER_COLORS.map((c) => ({
          text: c.label,
          onPress: () => onChangeColor?.(notebook.id, c.value),
        })),
        { text: 'Annuler', style: 'cancel' as const },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le cahier',
      `Supprimer "${notebook.title}" et toutes ses pages ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDelete?.(notebook.id) },
      ],
    );
  };

  const handleLongPress = () => {
    Alert.alert(
      notebook.title,
      '',
      [
        { text: 'Renommer', onPress: handleRename },
        { text: 'Changer la couleur', onPress: handleChangeColor },
        { text: 'Supprimer', style: 'destructive', onPress: handleDelete },
        { text: 'Annuler', style: 'cancel' },
      ],
    );
  };

  const updatedDate = notebook.updated_at
    ? new Date(notebook.updated_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      })
    : '';

  return (
    <View style={{ flex: 1 }}>
      {/* Physical notebook cover */}
      <Pressable onPress={onPress} onLongPress={handleLongPress}>
        <View
          style={{
            aspectRatio: 3 / 4,
            backgroundColor: notebook.cover_color,
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          {/* Spine effect — left edge highlight */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 6,
              backgroundColor: 'rgba(0,0,0,0.15)',
            }}
          />

          {/* Mini template preview on cover */}
          <MiniTemplatePreview color={notebook.cover_color} />
        </View>
      </Pressable>

      {/* Title + metadata below the card */}
      <View style={{ marginTop: 10, paddingHorizontal: 2 }}>
        <KText
          style={{
            fontFamily: fonts.sans.medium,
            fontSize: 14,
            color: colors.ink,
            letterSpacing: -0.2,
          }}
          numberOfLines={1}
        >
          {notebook.title}
        </KText>
        {subjectName ? (
          <KText
            style={{
              fontFamily: fonts.sans.light,
              fontSize: 11,
              color: colors.inkMuted,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {subjectName}
          </KText>
        ) : null}
        <KText
          style={{
            fontFamily: fonts.sans.light,
            fontSize: 10,
            color: colors.inkMuted,
            marginTop: 2,
          }}
        >
          {updatedDate}
        </KText>
      </View>
    </View>
  );
}
