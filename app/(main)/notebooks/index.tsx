import { View, ScrollView, Pressable, Alert, TextInput, Modal, useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Plus, Search, X, LayoutGrid, List } from 'lucide-react-native';
import { useNotebooksStore } from '../../../stores/notebooksStore';
import { useNotesStore } from '../../../stores/notesStore';
import { useSubjectsStore } from '../../../stores/subjectsStore';
import { useAuthStore } from '../../../stores/authStore';
import { NotebookCard } from '../../../components/notebooks/NotebookCard';
import { NoteCard } from '../../../components/notes/NoteCard';
import { KText } from '../../../components/ui/Text';
import { colors } from '../../../theme/colors';
import { fonts } from '../../../theme/typography';

type Tab = 'cahiers' | 'notes';

const COVER_COLORS = [
  '#3D5AFE', '#FF6B6B', '#4CAF50', '#FF9800',
  '#9C27B0', '#00BCD4', '#795548', '#607D8B', '#111111',
];

export default function NotebooksScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('cahiers');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [newNotebookColor, setNewNotebookColor] = useState(COVER_COLORS[0]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { notebooks, pages, fetchNotebooks, fetchPages, addNotebook, updateNotebook, deleteNotebook } = useNotebooksStore();
  const { notes, fetchNotes, addNote } = useNotesStore();
  const { subjects, getSubject } = useSubjectsStore();
  const { width: windowWidth } = useWindowDimensions();

  // 3 columns on wide screens (iPad), 2 on phone
  const numColumns = windowWidth > 700 ? 3 : 2;
  const cardGap = 16;
  const horizontalPadding = 24;
  const cardWidth = (windowWidth - horizontalPadding * 2 - cardGap * (numColumns - 1)) / numColumns;

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

  const handleOpenCreateDialog = () => {
    setNewNotebookTitle('');
    setNewNotebookColor(COVER_COLORS[0]);
    setShowCreateDialog(true);
  };

  const handleCreateNotebook = async () => {
    if (!session?.user) return;
    const title = newNotebookTitle.trim() || 'Nouveau cahier';
    try {
      const notebook = await addNotebook({
        user_id: session.user.id,
        subject_id: null,
        title,
        cover_color: newNotebookColor,
      });
      setShowCreateDialog(false);
      if (notebook) {
        router.push(`/notebooks/${notebook.id}` as never);
      } else {
        Alert.alert('Erreur', 'Impossible de creer le cahier');
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
        Alert.alert('Erreur', 'Impossible de creer la note');
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <View className="flex-1 bg-parchment">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingTop: 24, paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <KText style={{ fontFamily: fonts.serif.bold, fontSize: 28, letterSpacing: -1, color: colors.ink }}>
            Documents
          </KText>

          {/* Grid/List toggle (visual only — grid is always active) */}
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <Pressable
              onPress={() => setViewMode('grid')}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: viewMode === 'grid' ? colors.surfaceAlt : 'transparent',
              }}
            >
              <LayoutGrid size={18} strokeWidth={1.6} color={viewMode === 'grid' ? colors.ink : colors.inkMuted} />
            </Pressable>
            <Pressable
              onPress={() => setViewMode('list')}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: viewMode === 'list' ? colors.surfaceAlt : 'transparent',
              }}
            >
              <List size={18} strokeWidth={1.6} color={viewMode === 'list' ? colors.ink : colors.inkMuted} />
            </Pressable>
          </View>
        </View>

        {/* Tab toggle */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.surfaceAlt,
            borderRadius: 20,
            padding: 3,
            marginBottom: 8,
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

        {/* Filter chip: "Tout" */}
        {activeTab === 'cahiers' && (
          <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 12 }}>
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: colors.ink,
              }}
            >
              <KText
                preset="badgePill"
                color={colors.darkText}
              >
                Tout
              </KText>
            </View>
          </View>
        )}

        {activeTab === 'cahiers' && (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: cardGap,
            }}
          >
            {notebooks.map((nb) => (
              <View key={nb.id} style={{ width: cardWidth }}>
                <NotebookCard
                  notebook={nb}
                  pageCount={(pages[nb.id] ?? []).length}
                  subjectName={nb.subject_id ? getSubject(nb.subject_id)?.name : undefined}
                  onPress={() => router.push(`/notebooks/${nb.id}` as never)}
                  onRename={(id, newTitle) => updateNotebook(id, { title: newTitle })}
                  onChangeColor={(id, newColor) => updateNotebook(id, { cover_color: newColor })}
                  onDelete={(id) => deleteNotebook(id)}
                />
              </View>
            ))}

            {/* "Nouveau" dashed card — same size as notebook cards */}
            <View style={{ width: cardWidth }}>
              <Pressable onPress={handleOpenCreateDialog}>
                <View
                  style={{
                    aspectRatio: 3 / 4,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: colors.border,
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                  }}
                >
                  <Plus size={28} strokeWidth={1.4} color={colors.inkMuted} />
                  <KText
                    style={{
                      fontFamily: fonts.sans.medium,
                      fontSize: 12,
                      color: colors.inkMuted,
                      marginTop: 8,
                    }}
                  >
                    Nouveau
                  </KText>
                </View>
              </Pressable>
            </View>
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
                marginTop: 12,
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

      {/* Create Notebook Dialog */}
      <Modal
        visible={showCreateDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateDialog(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: '#F7F3ED',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 360,
              borderWidth: 1,
              borderColor: '#E8E2DA',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <KText style={{ fontFamily: fonts.serif.bold, fontSize: 18, letterSpacing: -0.3, color: colors.ink }}>
                Nouveau cahier
              </KText>
              <Pressable onPress={() => setShowCreateDialog(false)}>
                <X size={20} strokeWidth={1.6} color={colors.inkMuted} />
              </Pressable>
            </View>

            <TextInput
              value={newNotebookTitle}
              onChangeText={setNewNotebookTitle}
              placeholder="Nom du cahier..."
              placeholderTextColor={colors.inkMuted}
              autoFocus
              style={{
                borderWidth: 1,
                borderColor: '#E0D8CE',
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontFamily: fonts.sans.regular,
                fontSize: 14,
                color: colors.ink,
                marginBottom: 20,
              }}
            />

            <KText style={{ fontFamily: fonts.sans.medium, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.inkSoft, marginBottom: 12 }}>
              Couleur de couverture
            </KText>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              {COVER_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setNewNotebookColor(c)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: c,
                    borderWidth: newNotebookColor === c ? 3 : 0,
                    borderColor: '#F7F3ED',
                    shadowColor: newNotebookColor === c ? c : 'transparent',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: newNotebookColor === c ? 0.5 : 0,
                    shadowRadius: 6,
                  }}
                >
                  {newNotebookColor === c && (
                    <View
                      style={{
                        flex: 1,
                        borderRadius: 18,
                        borderWidth: 2,
                        borderColor: 'rgba(255,255,255,0.6)',
                      }}
                    />
                  )}
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleCreateNotebook}
              style={{
                backgroundColor: colors.dark,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <KText style={{ fontFamily: fonts.sans.medium, fontSize: 13, color: colors.darkText }}>
                Creer
              </KText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
