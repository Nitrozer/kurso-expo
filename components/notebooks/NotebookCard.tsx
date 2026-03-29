import { View, Alert, Platform } from 'react-native';
import { Card } from '../ui/Card';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
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

type Props = {
  notebook: Notebook;
  pageCount: number;
  subjectName?: string;
  onPress: () => void;
  onRename?: (id: string, newTitle: string) => void;
  onChangeColor?: (id: string, newColor: string) => void;
  onDelete?: (id: string) => void;
};

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

  return (
    <Card onPress={onPress} onLongPress={handleLongPress} className="mb-md flex-1">
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: notebook.cover_color,
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
        }}
      />
      {subjectName && (
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 8,
          }}
        >
          <KText preset="badgePill" color={colors.inkSoft}>
            {subjectName}
          </KText>
        </View>
      )}
      <KText
        preset="sectionTitle"
        color={colors.ink}
        style={{ marginBottom: 4 }}
      >
        {notebook.title}
      </KText>
      <KText preset="notePreview" color={colors.inkMuted}>
        {pageCount} {pageCount === 1 ? 'page' : 'pages'}
      </KText>
    </Card>
  );
}
