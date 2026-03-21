import { View, useWindowDimensions, Pressable, ScrollView } from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Download, Plus, ChevronLeft } from 'lucide-react-native';
import { useNotebooksStore } from '../../../stores/notebooksStore';
import { useAuthStore } from '../../../stores/authStore';
import { useSidebar } from '../../../components/layout/SidebarContext';
import { SkiaCanvas, DrawingPath } from '../../../components/notebooks/SkiaCanvas';
import { DrawingToolbar } from '../../../components/notebooks/DrawingToolbar';
import { PageThumbnail } from '../../../components/notebooks/PageThumbnail';
import { VoiceRecorder } from '../../../components/notebooks/VoiceRecorder';
import { IconButton } from '../../../components/ui/IconButton';
import { KText } from '../../../components/ui/Text';
import { colors } from '../../../theme/colors';
import { exportNotebookToPdf } from '../../../lib/pdf-export';
import type { NotebookPage } from '../../../types';

type TemplateType = 'blank' | 'lined' | 'grid' | 'dotted';

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
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [drawColor, setDrawColor] = useState('#111111');
  const [template, setTemplate] = useState<TemplateType>('blank');
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [redoStack, setRedoStack] = useState<DrawingPath[]>([]);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPage: NotebookPage | undefined = notebookPages[currentPageIndex];

  useEffect(() => {
    if (id) fetchPages(id);
  }, [id]);

  // Load paths from current page
  useEffect(() => {
    if (currentPage?.drawing_data) {
      const data = currentPage.drawing_data as { paths?: DrawingPath[] };
      setPaths(data.paths ?? []);
    } else {
      setPaths([]);
    }
    setRedoStack([]);
    if (currentPage?.template) {
      setTemplate(currentPage.template);
    }
  }, [currentPage?.id]);

  // Auto-save debounced
  const saveCurrentPage = useCallback(() => {
    if (!currentPage) return;
    updatePage(currentPage.id, {
      drawing_data: { paths } as unknown as Record<string, unknown>,
      template,
    });
  }, [currentPage?.id, paths, template, updatePage]);

  useEffect(() => {
    if (!currentPage) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(saveCurrentPage, 2000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [paths, template, saveCurrentPage]);

  const handleUndo = () => {
    if (paths.length === 0) return;
    const last = paths[paths.length - 1];
    setPaths(paths.slice(0, -1));
    setRedoStack([...redoStack, last]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setPaths([...paths, last]);
  };

  const handlePathsChange = (newPaths: DrawingPath[]) => {
    setPaths(newPaths);
    setRedoStack([]);
  };

  const handleAddPage = async () => {
    if (!session?.user || !id) return;
    await addPage({
      notebook_id: id,
      user_id: session.user.id,
      page_number: notebookPages.length + 1,
      drawing_data: null,
      text_content: null,
      template: 'blank',
      thumbnail_url: null,
    });
    setCurrentPageIndex(notebookPages.length);
  };

  const handleExport = async () => {
    // Simplified: export as empty pages with title
    // Full implementation would capture canvas snapshots as base64
    const pagesData = notebookPages.map(() => ({
      imageBase64: '',
    }));
    await exportNotebookToPdf(pagesData, notebook?.title ?? 'Cahier');
  };

  // Setup sidebar with page thumbnails
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
  }, [notebookPages, currentPageIndex]);

  const canvasWidth = Math.min(windowWidth - 40, 800);
  const canvasHeight = windowHeight - 200;

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

      {/* Canvas */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {notebookPages.length > 0 ? (
          <SkiaCanvas
            paths={paths}
            onPathsChange={handlePathsChange}
            template={template}
            currentColor={drawColor}
            currentStrokeWidth={strokeWidth}
            width={canvasWidth}
            height={canvasHeight}
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

      {/* Toolbar */}
      <DrawingToolbar
        strokeWidth={strokeWidth}
        color={drawColor}
        template={template}
        onStrokeChange={setStrokeWidth}
        onColorChange={setDrawColor}
        onTemplateChange={setTemplate}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onMicPress={() => setShowVoiceRecorder(true)}
        canUndo={paths.length > 0}
        canRedo={redoStack.length > 0}
      />
    </View>
  );
}
