import { View, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { useNotebooksStore } from '../../../stores/notebooksStore';
import { useNotesStore } from '../../../stores/notesStore';
import { useSubjectsStore } from '../../../stores/subjectsStore';
import { useAuthStore } from '../../../stores/authStore';
import { NotebookCard } from '../../../components/notebooks/NotebookCard';
import { NoteCard } from '../../../components/notes/NoteCard';
import { KText } from '../../../components/ui/Text';
import { colors } from '../../../theme/colors';

type Tab = 'cahiers' | 'notes';

export default function NotebooksScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('cahiers');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { notebooks, pages, fetchNotebooks, fetchPages, addNotebook } = useNotebooksStore();
  const { notes, fetchNotes, addNote } = useNotesStore();
  const { subjects, getSubject } = useSubjectsStore();

  useEffect(() => {
    if (session?.user) {
      fetchNotebooks(session.user.id);
      fetchNotes(session.user.id);
    }
  }, [session]);

  // Collect all unique tags from notes
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags ?? [])));

  const filteredNotes = notes
    .filter((n) => !subjectFilter || n.subject_id === subjectFilter)
    .filter((n) => !tagFilter || (n.tags ?? []).includes(tagFilter))
    .filter((n) => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || (n.content_preview ?? '').toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddNotebook = async () => {
    if (!session?.user) return;
    try {
      const notebook = await addNotebook({
        user_id: session.user.id,
        subject_id: null,
        title: 'Nouveau cahier',
        cover_color: colors.blue,
      });
      if (notebook) {
        router.push(`/notebooks/${notebook.id}` as never);
      } else {
        Alert.alert('Erreur', 'Impossible de créer le cahier');
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  const handleAddNote = async () => {
    if (!session?.user) return;
    try {
      const note = await addNote({
        user_id: session.user.id,
        subject_id: null,
        title: '',
        content: null,
        content_preview: null,
      });
      if (note) {
        router.push(`/notebooks/note/${note.id}` as never);
      } else {
        Alert.alert('Erreur', 'Impossible de créer la note');
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <View className="flex-1 bg-parchment">
      <ScrollView className="flex-1 p-xxl" showsVerticalScrollIndicator={false}>
        <KText preset="heroName" color={colors.ink} style={{ marginBottom: 20 }}>
          Cahiers
        </KText>

        {/* Tab toggle */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.surfaceAlt,
            borderRadius: 20,
            padding: 3,
            marginBottom: 20,
            alignSelf: 'flex-start',
          }}
        >
          {(['cahiers', 'notes'] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 18,
                backgroundColor: activeTab === tab ? colors.bg : 'transparent',
              }}
            >
              <KText
                preset="badgePill"
                color={activeTab === tab ? colors.ink : colors.inkMuted}
              >
                {tab === 'cahiers' ? 'Cahiers' : 'Notes'}
              </KText>
            </Pressable>
          ))}
        </View>

        {activeTab === 'cahiers' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {notebooks.map((nb) => (
              <View key={nb.id} style={{ width: '48%' }}>
                <NotebookCard
                  notebook={nb}
                  pageCount={(pages[nb.id] ?? []).length}
                  subjectName={nb.subject_id ? getSubject(nb.subject_id)?.name : undefined}
                  onPress={() => router.push(`/notebooks/${nb.id}` as never)}
                />
              </View>
            ))}
          </View>
        )}

        {activeTab === 'notes' && (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#E0D8CE',
                borderRadius: 14,
                marginBottom: 16,
                backgroundColor: '#FDF9F3',
              }}
            >
              <Search size={18} color="#5F5E5E" style={{ marginRight: 12 }} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Chercher dans vos notes..."
                placeholderTextColor="rgba(95,94,94,0.5)"
                style={{
                  flex: 1,
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 14,
                  color: '#111111',
                }}
              />
            </View>

            {/* Subject filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              <Pressable
                onPress={() => setSubjectFilter(null)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: !subjectFilter ? colors.blue : colors.border,
                  backgroundColor: !subjectFilter ? colors.blue : 'transparent',
                  marginRight: 8,
                }}
              >
                <KText
                  preset="badgePill"
                  color={!subjectFilter ? '#FFFFFF' : colors.inkSoft}
                >
                  Toutes
                </KText>
              </Pressable>
              {subjects.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => setSubjectFilter(s.id)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: subjectFilter === s.id ? colors.blue : colors.border,
                    backgroundColor:
                      subjectFilter === s.id ? colors.blue : 'transparent',
                    marginRight: 8,
                  }}
                >
                  <KText
                    preset="badgePill"
                    color={subjectFilter === s.id ? '#FFFFFF' : colors.inkSoft}
                  >
                    {s.name}
                  </KText>
                </Pressable>
              ))}
            </ScrollView>

            {/* Tag filter chips */}
            {allTags.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
              >
                <Pressable
                  onPress={() => setTagFilter(null)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: !tagFilter ? colors.ink : colors.border,
                    backgroundColor: !tagFilter ? colors.dark : 'transparent',
                    marginRight: 6,
                  }}
                >
                  <KText
                    preset="badgePill"
                    color={!tagFilter ? colors.bg : colors.inkSoft}
                  >
                    Tous les tags
                  </KText>
                </Pressable>
                {allTags.map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => setTagFilter(tag)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: tagFilter === tag ? colors.ink : colors.border,
                      backgroundColor: tagFilter === tag ? colors.dark : 'transparent',
                      marginRight: 6,
                    }}
                  >
                    <KText
                      preset="badgePill"
                      color={tagFilter === tag ? colors.bg : colors.inkSoft}
                    >
                      {tag}
                    </KText>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                subjectName={
                  note.subject_id ? getSubject(note.subject_id)?.name : undefined
                }
                onPress={() => router.push(`/notebooks/note/${note.id}` as never)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={activeTab === 'cahiers' ? handleAddNotebook : handleAddNote}
        style={{
          position: 'absolute',
          bottom: 28,
          right: 28,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: colors.dark,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Plus size={22} strokeWidth={1.6} color={colors.bg} />
      </Pressable>
    </View>
  );
}
