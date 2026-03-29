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

      {/* PencilKit canvas layer (transparent bg so template shows through)
         NOTE: PencilKit shape recognition (holding pen to auto-correct shapes) is controlled
         by drawingPolicy on the native side. expo-pencilkit-ui sets .anyInput but does not
         expose a JS prop to toggle pencilOnly mode or shape recognition. This is a limitation
         of the current expo-pencilkit-ui binding. */}
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

// Realistic paper template backgrounds (French Seyes / GoodNotes style)
const PAPER_BG = '#F5F0EB';
const LINE_COLOR = '#C8D0E8';
const MARGIN_COLOR = '#E0A0A0';
const DOT_COLOR = '#C0C0C0';
const HOLE_BORDER = '#D0D0D0';
const SPACING = 24;
const MARGIN_X = 60;

function TemplateBackground({ template, width, height }: { template: string; width: number; height: number }) {
  if (template === 'blank') {
    return <View style={{ width, height, backgroundColor: PAPER_BG, position: 'absolute', top: 0, left: 0 }} />;
  }

  const elements: React.ReactNode[] = [];

  // Horizontal lines for lined and grid
  if (template === 'lined' || template === 'grid') {
    for (let y = SPACING; y < height; y += SPACING) {
      elements.push(
        <View
          key={`h-${y}`}
          style={{
            position: 'absolute',
            top: y,
            left: 0,
            right: 0,
            height: 0.5,
            backgroundColor: LINE_COLOR,
          }}
        />
      );
    }
  }

  // Vertical lines for grid (Seyes style)
  if (template === 'grid') {
    for (let x = MARGIN_X + SPACING; x < width; x += SPACING) {
      elements.push(
        <View
          key={`v-${x}`}
          style={{
            position: 'absolute',
            top: 0,
            left: x,
            width: 0.5,
            bottom: 0,
            backgroundColor: LINE_COLOR,
          }}
        />
      );
    }
  }

  // Dotted template
  if (template === 'dotted') {
    for (let y = SPACING; y < height; y += SPACING) {
      for (let x = MARGIN_X + SPACING; x < width; x += SPACING) {
        elements.push(
          <View
            key={`d-${x}-${y}`}
            style={{
              position: 'absolute',
              top: y - 1,
              left: x - 1,
              width: 2,
              height: 2,
              borderRadius: 1,
              backgroundColor: DOT_COLOR,
            }}
          />
        );
      }
    }
  }

  // Red vertical margin line (all templates except blank)
  elements.push(
    <View
      key="margin"
      style={{
        position: 'absolute',
        top: 0,
        left: MARGIN_X,
        width: 1,
        bottom: 0,
        backgroundColor: MARGIN_COLOR,
      }}
    />
  );

  // Hole punches — 3 white circles at 25%, 50%, 75% height
  const holeDiameter = 12;
  const holeCenterX = MARGIN_X / 2;
  [0.25, 0.5, 0.75].forEach((pct, i) => {
    elements.push(
      <View
        key={`hole-${i}`}
        style={{
          position: 'absolute',
          top: height * pct - holeDiameter / 2,
          left: holeCenterX - holeDiameter / 2,
          width: holeDiameter,
          height: holeDiameter,
          borderRadius: holeDiameter / 2,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: HOLE_BORDER,
        }}
      />
    );
  });

  return (
    <View style={{ width, height, backgroundColor: PAPER_BG, position: 'absolute', top: 0, left: 0 }}>
      {elements}
    </View>
  );
}
