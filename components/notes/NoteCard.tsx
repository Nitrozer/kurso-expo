import { View } from 'react-native';
import { Card } from '../ui/Card';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import type { Note } from '../../types';

type Props = {
  note: Note;
  subjectName?: string;
  onPress: () => void;
};

export function NoteCard({ note, subjectName, onPress }: Props) {
  return (
    <Card onPress={onPress} className="mb-md">
      {subjectName && (
        <KText preset="noteCategory" color={colors.blue} style={{ marginBottom: 6 }}>
          {subjectName}
        </KText>
      )}
      <KText preset="noteTitle" color={colors.ink} style={{ marginBottom: 4 }}>
        {note.title || 'Sans titre'}
      </KText>
      {note.content_preview ? (
        <KText
          preset="notePreview"
          color={colors.inkMuted}
          numberOfLines={2}
        >
          {note.content_preview}
        </KText>
      ) : null}
    </Card>
  );
}
