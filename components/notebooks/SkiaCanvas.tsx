import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { View } from 'react-native';
import { PencilKitView, PencilKitViewRef } from 'expo-pencilkit-ui';
import { colors } from '../../theme/colors';

export type SkiaCanvasRef = {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  captureAsBase64: () => Promise<string | null>;
};

type Props = {
  drawingData: string | null;
  onDrawingChange: (data: string) => void;
  onCanUndoChange: (val: boolean) => void;
  onCanRedoChange: (val: boolean) => void;
  width: number;
  height: number;
};

export const SkiaCanvas = forwardRef<SkiaCanvasRef, Props>(function SkiaCanvas(
  { drawingData, onDrawingChange, onCanUndoChange, onCanRedoChange, width, height },
  ref
) {
  const pencilKitRef = useRef<PencilKitViewRef>(null);
  const [isReady, setIsReady] = useState(false);
  const hasLoadedData = useRef(false);

  useImperativeHandle(ref, () => ({
    undo: () => pencilKitRef.current?.undo(),
    redo: () => pencilKitRef.current?.redo(),
    clear: () => pencilKitRef.current?.clearDrawing(),
    captureAsBase64: async () => {
      const data = await pencilKitRef.current?.captureDrawing();
      return data ?? null;
    },
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pencilKitRef.current) {
        pencilKitRef.current.setupToolPicker();
        pencilKitRef.current.setCanvasBackgroundColor(colors.bg);
        setIsReady(true);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Load existing drawing data once
  useEffect(() => {
    if (isReady && drawingData && pencilKitRef.current && !hasLoadedData.current) {
      pencilKitRef.current.setCanvasDataFromBase64(drawingData);
      hasLoadedData.current = true;
    }
  }, [isReady, drawingData]);

  return (
    <View style={{ width, height }}>
      <PencilKitView
        ref={pencilKitRef}
        style={{ flex: 1, backgroundColor: colors.bg }}
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
