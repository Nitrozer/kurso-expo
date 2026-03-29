import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Image } from 'react-native';
import { PencilKitView, PencilKitViewRef } from 'expo-pencilkit-ui';
import { colors } from '../../theme/colors';

export type SkiaCanvasRef = {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  captureAsBase64: () => Promise<string | null>;
  saveDrawingData: () => Promise<string | null>;
  loadDrawingData: (data: string) => Promise<void>;
};

type Props = {
  template: 'blank' | 'lined' | 'grid' | 'dotted';
  onDrawingChange: (data: string) => void;
  onCanUndoChange: (val: boolean) => void;
  onCanRedoChange: (val: boolean) => void;
  width: number;
  height: number;
  backgroundImage?: string;
};

export const SkiaCanvas = forwardRef<SkiaCanvasRef, Props>(function SkiaCanvas(
  { template, onDrawingChange, onCanUndoChange, onCanRedoChange, width, height, backgroundImage },
  ref
) {
  const pencilKitRef = useRef<PencilKitViewRef>(null);

  useImperativeHandle(ref, () => ({
    undo: () => pencilKitRef.current?.undo(),
    redo: () => pencilKitRef.current?.redo(),
    clear: () => pencilKitRef.current?.clearDrawing(),
    captureAsBase64: async () => {
      const data = await pencilKitRef.current?.captureDrawing();
      return data ?? null;
    },
    saveDrawingData: async () => {
      const data = await pencilKitRef.current?.getCanvasDataAsBase64();
      return data ?? null;
    },
    loadDrawingData: async (data: string) => {
      await pencilKitRef.current?.setCanvasDataFromBase64(data);
    },
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pencilKitRef.current) {
        pencilKitRef.current.setupToolPicker();
        pencilKitRef.current.setCanvasBackgroundColor('transparent');
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ width, height, position: 'relative' }}>
      {/* Template background layer */}
      <TemplateBackground template={template} width={width} height={height} />

      {/* Background image layer (photos) */}
      {backgroundImage && (
        <Image
          source={{ uri: backgroundImage }}
          style={{ position: 'absolute', top: 0, left: 0, width, height, opacity: 0.3 }}
          resizeMode="cover"
        />
      )}

      {/* PencilKit canvas layer (transparent bg so template shows through) */}
      <PencilKitView
        ref={pencilKitRef}
        style={{ position: 'absolute', top: 0, left: 0, width, height, backgroundColor: 'transparent' }}
        onDrawEnd={(event) => {
          onDrawingChange(event.nativeEvent.data);
        }}
        onCanUndoChanged={(event) => {
          onCanUndoChange(event.nativeEvent.canUndo);
        }}
        onCanRedoChanged={(event) => {
          onCanRedoChange(event.nativeEvent.canRedo);
        }}
      />
    </View>
  );
});

// Template background component - renders lines/grid/dots
function TemplateBackground({ template, width, height }: { template: string; width: number; height: number }) {
  if (template === 'blank') {
    return <View style={{ width, height, backgroundColor: colors.bg }} />;
  }

  const lineColor = '#E0D8CE';
  const spacing = 28;
  const elements: React.ReactNode[] = [];

  if (template === 'lined' || template === 'grid') {
    // Horizontal lines
    for (let y = spacing; y < height; y += spacing) {
      elements.push(
        <View key={`h-${y}`} style={{ position: 'absolute', top: y, left: 20, right: 20, height: 0.5, backgroundColor: lineColor }} />
      );
    }
  }

  if (template === 'grid') {
    // Vertical lines
    for (let x = 20; x < width; x += spacing) {
      elements.push(
        <View key={`v-${x}`} style={{ position: 'absolute', top: spacing, left: x, width: 0.5, bottom: 0, backgroundColor: lineColor }} />
      );
    }
  }

  if (template === 'dotted') {
    for (let y = spacing; y < height; y += spacing) {
      for (let x = 20; x < width; x += spacing) {
        elements.push(
          <View key={`d-${x}-${y}`} style={{ position: 'absolute', top: y - 1, left: x - 1, width: 2, height: 2, borderRadius: 1, backgroundColor: lineColor }} />
        );
      }
    }
  }

  return (
    <View style={{ width, height, backgroundColor: colors.bg, position: 'absolute', top: 0, left: 0 }}>
      {elements}
    </View>
  );
}
