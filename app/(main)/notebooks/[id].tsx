import { View, useWindowDimensions, Pressable, ScrollView, Alert } from 'react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Download, Plus, ChevronLeft, Undo2, Redo2, ImagePlus, Mic } from 'lucide-react-native';
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
  const { getNotebook, pages, fetchPages, addPage, updatePage, deletePage } = useNotebooksStore();
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

  // Load page data after canvas mounts (triggered by key change on SkiaCanvas)
  useEffect(() => {
    if (currentPage?.drawing_data && canvasRef.current) {
      const data = (currentPage.drawing_data as { base64?: string }).base64;
      if (data) {
        setTimeout(() => {
          canvasRef.current?.loadDrawingData(data);
        }, 300); // Wait for PencilKit to initialize
      }
    }
  }, [currentPage?.id]);

  // Save current page data and capture thumbnail
  const saveCurrentPage = useCallback(async () => {
    if (!currentPage || !canvasRef.current) return;
    const drawingData = await canvasRef.current.saveDrawingData();
    if (drawingData) {
      const thumbnail = await canvasRef.current.captureAsBase64();
      updatePage(currentPage.id, {
        drawing_data: { base64: drawingData, thumbnail: thumbnail ?? undefined } as unknown as Record<string, unknown>,
      });
    }
  }, [currentPage, updatePage]);

  // Switch pages: save current, then navigate
  const switchToPage = useCallback(async (newIndex: number) => {
    if (newIndex === currentPageIndex) return;
    await saveCurrentPage();
    setCurrentPageIndex(newIndex);
  }, [currentPageIndex, saveCurrentPage]);

  // Auto-save: when PencilKit fires onDrawEnd, debounce save to Supabase
  const handleDrawingChange = (data: string) => {
    if (!currentPage) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      // Also capture thumbnail on auto-save
      const thumbnail = await canvasRef.current?.captureAsBase64();
      updatePage(currentPage.id, {
        drawing_data: { base64: data, thumbnail: thumbnail ?? undefined } as unknown as Record<string, unknown>,
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
      'Choisissez un modele',
      [
        { text: 'Vierge', onPress: () => createPageWithTemplate('blank') },
        { text: 'Ligne', onPress: () => createPageWithTemplate('lined') },
        { text: 'Grille', onPress: () => createPageWithTemplate('grid') },
        { text: 'Points', onPress: () => createPageWithTemplate('dotted') },
        { text: 'Annuler', style: 'cancel' },
      ],
    );
  };

  const handleDeletePage = (pageId: string, notebookId: string) => {
    if (notebookPages.length <= 1) {
      Alert.alert('Impossible', 'Le cahier doit contenir au moins une page.');
      return;
    }
    Alert.alert('Supprimer la page', 'Cette action est irreversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deletePage(pageId, notebookId);
          if (currentPageIndex >= notebookPages.length - 1) {
            setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
          }
        },
      },
    ]);
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
    const imageData = await canvasRef.current?.captureAsBase64();
    const pagesData = [{ imageBase64: imageData ?? '' }];
    await exportNotebookToPdf(pagesData, notebook?.title ?? 'Cahier');
  };

  // Sidebar with page thumbnails + delete
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
              onPress={() => switchToPage(index)}
              onDelete={() => handleDeletePage(page.id, id!)}
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
  const canvasHeight = windowHeight - 80;

  return (
    <View className="flex-1 bg-parchment">
      {/* GoodNotes-style top toolbar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.bg,
        }}
      >
        {/* Left: back + title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <IconButton icon={ChevronLeft} onPress={() => router.back()} />
          <KText preset="sectionTitle" color={colors.ink} numberOfLines={1} style={{ flexShrink: 1 }}>
            {notebook?.title ?? 'Cahier'}
          </KText>
        </View>

        {/* Center: page counter */}
        <KText preset="notePreview" color={colors.inkMuted} style={{ marginHorizontal: 12 }}>
          Page {currentPageIndex + 1}/{notebookPages.length || 1}
        </KText>

        {/* Right: action icons */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <IconButton
            icon={Undo2}
            onPress={() => canvasRef.current?.undo()}
            active={canUndo}
          />
          <IconButton
            icon={Redo2}
            onPress={() => canvasRef.current?.redo()}
            active={canRedo}
          />
          <IconButton icon={ImagePlus} onPress={handlePickImage} />
          <IconButton icon={Mic} onPress={() => setShowVoiceRecorder(true)} />
          <IconButton icon={Download} onPress={handleExport} />
        </View>
      </View>

      {/* Canvas — zoom is handled natively by PencilKit (fingers=zoom, pencil=draw) */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {notebookPages.length > 0 && currentPage ? (
            <SkiaCanvas
              key={currentPage.id}
              ref={canvasRef}
              template={currentPage.template}
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
    </View>
  );
}
