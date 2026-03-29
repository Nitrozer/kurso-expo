import { View, TextInput, Text } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Pressable, ScrollView } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Share2 } from 'lucide-react-native';
import { useNotesStore } from '../../stores/notesStore';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { KText } from '../ui/Text';

const QUICK_TAGS = ['#examen', '#TP', '#important', '#révision', '#cours'];

type Props = {
  noteId: string;
};

export function NoteEditor({ noteId }: Props) {
  const { getNote, updateNote } = useNotesStore();
  const { subjects } = useSubjectsStore();
  const { events } = useScheduleStore();
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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    note?.event_id ?? null
  );
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
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
      event_id: selectedEventId,
      tags,
    });
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 1500);
  }, [noteId, title, content, selectedSubjectId, selectedEventId, tags, updateNote]);

  // Auto-save with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(save, 1500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, content, selectedSubjectId, selectedEventId, tags, save]);

  // Sync from store when note changes externally
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setSelectedSubjectId(note.subject_id);
      setSelectedEventId(note.event_id ?? null);
      setTags(note.tags ?? []);
      const text =
        typeof note.content === 'object' && note.content !== null
          ? (note.content as { text?: string }).text ?? ''
          : '';
      setContent(text);
    }
  }, [noteId]); // only on noteId change, not on every store update

  const addTag = (tag: string) => {
    const normalized = tag.startsWith('#') ? tag : `#${tag}`;
    if (normalized.length > 1 && !tags.includes(normalized)) {
      setTags((prev) => [...prev, normalized]);
    }
    setNewTag('');
    setShowTagInput(false);
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const availableQuickTags = QUICK_TAGS.filter((t) => !tags.includes(t));

  const handleShare = async () => {
    const tagsLine = tags.length > 0 ? `Tags: ${tags.join(', ')}\n\n` : '';
    const shareText = `# ${title || 'Sans titre'}\n\n${content}\n\n${tagsLine}\u2014 Partage depuis Kurso`;
    try {
      const fileUri = `${FileSystem.cacheDirectory}note_${noteId}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, shareText, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: 'text/plain', dialogTitle: 'Partager la note' });
    } catch {
      // User cancelled or sharing not available
    }
  };

  return (
    <ScrollView className="flex-1 bg-parchment" showsVerticalScrollIndicator={false}>
      {/* Share button */}
      <View style={{ paddingHorizontal: 32, paddingTop: 12, alignItems: 'flex-end' }}>
        <Pressable
          onPress={handleShare}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderWidth: 1,
            borderColor: colors.borderSoft,
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}
        >
          <Share2 size={13} strokeWidth={1.6} color={colors.inkSoft} />
          <KText style={{ fontFamily: fonts.sans.medium, fontSize: 9, color: colors.inkSoft, letterSpacing: 0.3 }}>
            Partager
          </KText>
        </Pressable>
      </View>
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

      {/* Tags section */}
      <View style={{ paddingHorizontal: 32, paddingTop: 8, paddingBottom: 4 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          {tags.map((tag) => (
            <View
              key={tag}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surfaceAlt,
                borderRadius: 20,
                paddingHorizontal: 8,
                paddingVertical: 3,
                gap: 4,
              }}
            >
              <KText
                style={{
                  fontFamily: fonts.sans.medium,
                  fontSize: 8,
                  color: colors.inkSoft,
                  letterSpacing: 0.4,
                }}
              >
                {tag}
              </KText>
              <Pressable onPress={() => removeTag(tag)} hitSlop={8}>
                <KText
                  style={{
                    fontFamily: fonts.sans.medium,
                    fontSize: 10,
                    color: colors.inkMuted,
                    lineHeight: 12,
                  }}
                >
                  ×
                </KText>
              </Pressable>
            </View>
          ))}

          {/* Add tag button */}
          {!showTagInput && (
            <Pressable
              onPress={() => setShowTagInput(true)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <KText
                style={{
                  fontFamily: fonts.sans.medium,
                  fontSize: 12,
                  color: colors.inkMuted,
                  lineHeight: 14,
                }}
              >
                +
              </KText>
            </Pressable>
          )}
        </View>

        {/* Tag input */}
        {showTagInput && (
          <View style={{ marginTop: 8 }}>
            <TextInput
              value={newTag}
              onChangeText={setNewTag}
              placeholder="#nouveau tag"
              placeholderTextColor={colors.inkGhost}
              autoFocus
              onSubmitEditing={() => {
                if (newTag.trim()) addTag(newTag.trim());
              }}
              onBlur={() => {
                if (newTag.trim()) addTag(newTag.trim());
                else setShowTagInput(false);
              }}
              style={{
                fontFamily: fonts.sans.medium,
                fontSize: 11,
                color: colors.ink,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
                marginBottom: 6,
              }}
            />
            {/* Quick tag suggestions */}
            {availableQuickTags.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {availableQuickTags.map((qt) => (
                  <Pressable
                    key={qt}
                    onPress={() => addTag(qt)}
                    style={{
                      backgroundColor: colors.surfaceAlt,
                      borderRadius: 20,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      marginRight: 6,
                    }}
                  >
                    <KText
                      style={{
                        fontFamily: fonts.sans.medium,
                        fontSize: 8,
                        color: colors.inkSoft,
                        letterSpacing: 0.4,
                      }}
                    >
                      {qt}
                    </KText>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {/* Associate course section */}
      <View style={{ paddingHorizontal: 32, paddingTop: 8, paddingBottom: 4 }}>
        {selectedEventId ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.blueBg,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.blueBorder,
                paddingHorizontal: 10,
                paddingVertical: 4,
                gap: 6,
              }}
            >
              <KText
                style={{
                  fontFamily: fonts.sans.medium,
                  fontSize: 9,
                  color: colors.blue,
                  letterSpacing: 0.3,
                }}
              >
                {events.find((e) => e.id === selectedEventId)?.title ?? 'Cours'}
              </KText>
              <Pressable onPress={() => setSelectedEventId(null)} hitSlop={8}>
                <KText
                  style={{
                    fontFamily: fonts.sans.medium,
                    fontSize: 11,
                    color: colors.blueSoft,
                    lineHeight: 13,
                  }}
                >
                  ×
                </KText>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setShowEventPicker(!showEventPicker)}
            style={{
              alignSelf: 'flex-start',
              borderWidth: 1,
              borderColor: colors.borderSoft,
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <KText
              style={{
                fontFamily: fonts.sans.medium,
                fontSize: 9,
                color: colors.inkSoft,
                letterSpacing: 0.3,
              }}
            >
              Associer un cours
            </KText>
          </Pressable>
        )}

        {showEventPicker && !selectedEventId && (
          <View style={{ marginTop: 8, gap: 4 }}>
            {events
              .filter((e) => {
                const eventDate = new Date(e.start_time);
                const now = new Date();
                const twoDaysAgo = new Date(now);
                twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
                return eventDate >= twoDaysAgo;
              })
              .slice(0, 10)
              .map((e) => (
                <Pressable
                  key={e.id}
                  onPress={() => {
                    setSelectedEventId(e.id);
                    setShowEventPicker(false);
                  }}
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  }}
                >
                  <KText
                    style={{
                      fontFamily: fonts.sans.medium,
                      fontSize: 10,
                      color: colors.ink,
                    }}
                  >
                    {e.title}
                  </KText>
                  <KText
                    style={{
                      fontFamily: fonts.sans.regular,
                      fontSize: 8,
                      color: colors.inkSoft,
                      marginTop: 1,
                    }}
                  >
                    {new Date(e.start_time).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </KText>
                </Pressable>
              ))}
            {events.filter((e) => {
              const eventDate = new Date(e.start_time);
              const now = new Date();
              const twoDaysAgo = new Date(now);
              twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
              return eventDate >= twoDaysAgo;
            }).length === 0 && (
              <KText
                style={{
                  fontFamily: fonts.sans.regular,
                  fontSize: 9,
                  color: colors.inkMuted,
                  paddingVertical: 4,
                }}
              >
                Aucun cours récent
              </KText>
            )}
          </View>
        )}
      </View>

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
