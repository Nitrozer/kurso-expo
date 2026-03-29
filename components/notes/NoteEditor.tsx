import { View, TextInput, Text } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { useNotesStore } from '../../stores/notesStore';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { KText } from '../ui/Text';

type Props = {
  noteId: string;
};

export function NoteEditor({ noteId }: Props) {
  const { getNote, updateNote } = useNotesStore();
  const { subjects } = useSubjectsStore();
  const note = getNote(noteId);

  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(
    typeof note?.content === 'object' && note?.content !== null
      ? (note.content as { text?: string }).text ?? ''
      : ''
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    note?.subject_id ?? null
  );
  const [savedIndicator, setSavedIndicator] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(() => {
    if (!noteId) return;
    const contentPreview = content.slice(0, 120).replace(/\n/g, ' ');
    updateNote(noteId, {
      title: title || 'Sans titre',
      content: { text: content },
      content_preview: contentPreview || null,
      subject_id: selectedSubjectId,
    });
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 1500);
  }, [noteId, title, content, selectedSubjectId, updateNote]);

  // Auto-save with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(save, 1500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, content, selectedSubjectId, save]);

  // Sync from store when note changes externally
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setSelectedSubjectId(note.subject_id);
      const text =
        typeof note.content === 'object' && note.content !== null
          ? (note.content as { text?: string }).text ?? ''
          : '';
      setContent(text);
    }
  }, [noteId]); // only on noteId change, not on every store update

  return (
    <ScrollView className="flex-1 bg-parchment" showsVerticalScrollIndicator={false}>
      {/* Subject chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-xl pt-lg pb-sm"
      >
        <Pressable
          onPress={() => setSelectedSubjectId(null)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: !selectedSubjectId ? colors.ink : colors.border,
            backgroundColor: !selectedSubjectId ? colors.dark : 'transparent',
            marginRight: 8,
          }}
        >
          <KText
            preset="badgePill"
            color={!selectedSubjectId ? colors.bg : colors.inkSoft}
          >
            Aucune matière
          </KText>
        </Pressable>
        {subjects.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => setSelectedSubjectId(s.id)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: selectedSubjectId === s.id ? s.color : colors.border,
              backgroundColor:
                selectedSubjectId === s.id ? s.color : 'transparent',
              marginRight: 8,
            }}
          >
            <KText
              preset="badgePill"
              color={selectedSubjectId === s.id ? '#FFFFFF' : colors.inkSoft}
            >
              {s.name}
            </KText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Saved indicator */}
      {savedIndicator && (
        <View className="px-xl">
          <KText preset="notePreview" color={colors.inkMuted}>
            Enregistré
          </KText>
        </View>
      )}

      {/* Title */}
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Titre de la note..."
        placeholderTextColor={colors.inkGhost}
        style={{
          fontFamily: 'Fraunces_900Black',
          fontSize: 36,
          fontStyle: 'italic',
          color: colors.ink,
          paddingHorizontal: 32,
          paddingTop: 16,
          paddingBottom: 12,
          lineHeight: 42,
          letterSpacing: -0.5,
        }}
      />

      {/* Content */}
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Commencez à écrire..."
        placeholderTextColor={colors.inkGhost}
        multiline
        textAlignVertical="top"
        style={{
          fontFamily: fonts.sans.regular,
          fontSize: 16,
          lineHeight: 28,
          color: '#444656',
          paddingHorizontal: 32,
          paddingBottom: 120,
          minHeight: 400,
        }}
      />
    </ScrollView>
  );
}
