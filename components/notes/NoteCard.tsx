import { View, Pressable, Text } from 'react-native';
import { colors } from '../../theme/colors';
import type { Note } from '../../types';

type Props = {
  note: Note;
  subjectName?: string;
  onPress: () => void;
};

export function NoteCard({ note, subjectName, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 20,
        backgroundColor: '#FDF9F3',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        marginBottom: 16,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {subjectName && (
          <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 8, color: colors.blue, letterSpacing: 2, textTransform: 'uppercase' }}>
            {subjectName}
          </Text>
        )}
        <Text style={{ fontFamily: 'Fraunces_300Light_Italic', fontSize: 10, color: colors.blue }}>
          {note.updated_at ? getRelativeTime(new Date(note.updated_at)) : ''}
        </Text>
      </View>

      <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 12.5, color: colors.ink, lineHeight: 18 }}>
        {note.title || 'Sans titre'}
      </Text>

      {note.content_preview ? (
        <Text
          numberOfLines={2}
          style={{ fontFamily: 'DMSans_300Light', fontSize: 10, color: '#5F5E5E', lineHeight: 16 }}
        >
          {note.content_preview}
        </Text>
      ) : null}
    </Pressable>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
