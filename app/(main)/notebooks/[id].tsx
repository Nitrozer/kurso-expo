import { View, useWindowDimensions, Pressable, ScrollView, Alert } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Download, Plus, ChevronLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNotebooksStore } from '../../../stores/notebooksStore';
import { useAuthStore } from '../../../stores/authStore';
import { useSidebar } from '../../../components/layout/SidebarContext';
import { SkiaCanvas, SkiaCanvasRef } from '../../../components/notebooks/SkiaCanvas';
import { VoiceRecorder } from '../../../components/notebooks/VoiceRecorder';
import { PageThumbnail } from '../../../components/notebooks/PageThumbnail';
import { IconButton } from '../../../components/ui/IconButton';
import { KText } from '../../../components/ui/Text';
import { colors } from '../../../theme/colors';
import { exportNotebookToPdf } from '../../../lib/pdf-export';

export default function NotebookEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { getNotebook, pages, fetchPages, addPage, updatePage } = useNotebooksStore();
  const setSidebar = useSidebar((s) => s.setSidebar);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const notebook = getNotebook(id!);
  const notebookPages = pages[id!] ?? [];

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined);

  const canvasRef = useRef<SkiaCanvasRef>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPage = notebookPages[currentPageIndex];

  useEffect(() => {
    if (id) fetchPages(id);
  }, [id]);

  // Get current drawing data as base64 string from the page
  const currentDrawingData = currentPage?.drawing_data
    ? (currentPage.drawing_data as { base64?: string }).base64 ?? null
    : null;

  // Auto-save: when PencilKit fires onDrawEnd, debounce save to Supabase
  const handleDrawingChange = (data: string) => {
    if (!currentPage) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updatePage(currentPage.id, {
        drawing_data: { base64: data } as unknown as Record<string, unknown>,
      });
    }, 2000);
  };

  const createPageWithTemplate = async (template: 'blank' | 'lined' | 'grid' | 'dotted') => {
    if (!session?.user || !id) return;
    await addPage({
      notebook_id: id,
      user_id: session.user.id,
      page_number: notebookPages.length + 1,
      drawing_data: null,
      text_content: null,
      template,
      thumbnail_url: null,
    });
    setCurrentPageIndex(notebookPages.length);
  };

  const handleAddPage = () => {
    Alert.alert(
      'Nouvelle page',
      'Choisissez un modèle',
      [
        { text: 'Vierge', onPress: () => createPageWithTemplate('blank') },
        { text: 'Ligné', onPress: () => createPageWithTemplate('lined') },
        { text: 'Grille', onPress: () => createPageWithTemplate('grid') },
        { text: 'Points', onPress: () => createPageWithTemplate('dotted') },
        { text: 'Annuler', style: 'cancel' },
      ],
    );
  };

  const handlePickImage = async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) return;

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      setBackgroundImage(pickerResult.assets[0].uri);
    }
  };

  const handleExport = async () => {
    // Capture current canvas as image for PDF
    const imageData = await canvasRef.current?.captureAsBase64();
    const pagesData = [{ imageBase64: imageData ?? '' }];
    await exportNotebookToPdf(pagesData, notebook?.title ?? 'Cahier');
  };

  // Sidebar with page thumbnails
  useEffect(() => {
    setSidebar(
      <View style={{ padding: 12 }}>
        <KText preset="sectionLabel" color={colors.inkMuted} style={{ marginBottom: 12 }}>
          Pages
        </KText>
        <ScrollView showsVerticalScrollIndicator={false}>
          {notebookPages.map((page, index) => (
            <PageThumbnail
              key={page.id}
              page={page}
              isActive={index === currentPageIndex}
              onPress={() => setCurrentPageIndex(index)}
            />
          ))}
          <Pressable
            onPress={handleAddPage}
            style={{
              width: 60,
              height: 40,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.border,
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={18} strokeWidth={1.6} color={colors.inkMuted} />
          </Pressable>
        </ScrollView>
      </View>
    );
    return () => setSidebar(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookPages.length, currentPageIndex]);

  const canvasWidth = Math.min(windowWidth - 40, 800);
  const canvasHeight = windowHeight - 140;

  return (
    <View className="flex-1 bg-parchment">
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconButton icon={ChevronLeft} onPress={() => router.back()} />
          <KText preset="sectionTitle" color={colors.ink}>
            {notebook?.title ?? 'Cahier'}
          </KText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <KText preset="notePreview" color={colors.inkMuted}>
            Page {currentPageIndex + 1}/{notebookPages.length || 1}
          </KText>
          <IconButton icon={Download} onPress={handleExport} />
        </View>
      </View>

      {/* Canvas — PencilKit natif */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {notebookPages.length > 0 ? (
          <SkiaCanvas
            ref={canvasRef}
            drawingData={currentDrawingData}
            onDrawingChange={handleDrawingChange}
            onCanUndoChange={setCanUndo}
            onCanRedoChange={setCanRedo}
            width={canvasWidth}
            height={canvasHeight}
            backgroundImage={backgroundImage}
          />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <KText preset="courseDetail" color={colors.inkMuted} style={{ marginBottom: 12 }}>
              Aucune page. Ajoutez-en une pour commencer.
            </KText>
            <Pressable
              onPress={handleAddPage}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: colors.dark,
              }}
            >
              <KText preset="badgePill" color={colors.bg}>
                Ajouter une page
              </KText>
            </Pressable>
          </View>
        )}
      </View>

      {/* Voice recorder overlay */}
      {showVoiceRecorder && currentPage && (
        <VoiceRecorder
          pageId={currentPage.id}
          onClose={() => setShowVoiceRecorder(false)}
        />
      )}

      {/* Minimal toolbar — PencilKit fournit son propre tool picker natif */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.bg,
        }}
      >
        <Pressable
          onPress={() => canvasRef.current?.undo()}
          disabled={!canUndo}
          style={{ opacity: canUndo ? 1 : 0.3, padding: 8 }}
        >
          <KText preset="courseDetail" color={colors.ink}>Annuler</KText>
        </Pressable>
        <Pressable
          onPress={() => canvasRef.current?.redo()}
          disabled={!canRedo}
          style={{ opacity: canRedo ? 1 : 0.3, padding: 8 }}
        >
          <KText preset="courseDetail" color={colors.ink}>Refaire</KText>
        </Pressable>
        <Pressable
          onPress={() => setShowVoiceRecorder(true)}
          style={{ padding: 8 }}
        >
          <KText preset="courseDetail" color={colors.blue}>Micro</KText>
        </Pressable>
        <Pressable
          onPress={handlePickImage}
          style={{ padding: 8 }}
        >
          <KText preset="courseDetail" color={colors.blue}>Photo</KText>
        </Pressable>
      </View>
    </View>
  );
}
