import { useMemo } from 'react';
import { Canvas, Path, Circle, Skia, SkPath } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';

export type DrawingPath = {
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
};

type TemplateType = 'blank' | 'lined' | 'grid' | 'dotted';

type Props = {
  paths: DrawingPath[];
  onPathsChange: (paths: DrawingPath[]) => void;
  template: TemplateType;
  currentColor: string;
  currentStrokeWidth: number;
  width: number;
  height: number;
};

function buildSkiaPath(points: { x: number; y: number }[]): SkPath {
  const path = Skia.Path.Make();
  if (points.length === 0) return path;
  path.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    path.lineTo(points[i].x, points[i].y);
  }
  return path;
}

export function SkiaCanvas({
  paths,
  onPathsChange,
  template,
  currentColor,
  currentStrokeWidth,
  width,
  height,
}: Props) {
  const currentPoints = useSharedValue<{ x: number; y: number }[]>([]);

  const addCompletedPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return;
    const newPath: DrawingPath = {
      points: [...points],
      color: currentColor,
      strokeWidth: currentStrokeWidth,
    };
    onPathsChange([...paths, newPath]);
  };

  const gesture = Gesture.Pan()
    .minDistance(0)
    .onStart((e) => {
      currentPoints.value = [{ x: e.x, y: e.y }];
    })
    .onChange((e) => {
      currentPoints.value = [...currentPoints.value, { x: e.x, y: e.y }];
    })
    .onEnd(() => {
      runOnJS(addCompletedPath)(currentPoints.value);
      currentPoints.value = [];
    });

  // Template background elements
  const templateColor = '#D8D0C8';
  const templateOpacity = 0.3;
  const spacing = 30;

  const templatePaths = useMemo(() => {
    const result: { path: SkPath; isLine: boolean }[] = [];

    if (template === 'lined' || template === 'grid') {
      // Horizontal lines
      for (let y = spacing; y < height; y += spacing) {
        const p = Skia.Path.Make();
        p.moveTo(0, y);
        p.lineTo(width, y);
        result.push({ path: p, isLine: true });
      }
    }

    if (template === 'grid') {
      // Vertical lines
      for (let x = spacing; x < width; x += spacing) {
        const p = Skia.Path.Make();
        p.moveTo(x, 0);
        p.lineTo(x, height);
        result.push({ path: p, isLine: true });
      }
    }

    return result;
  }, [template, width, height]);

  const dotPositions = useMemo(() => {
    if (template !== 'dotted') return [];
    const dots: { x: number; y: number }[] = [];
    for (let y = spacing; y < height; y += spacing) {
      for (let x = spacing; x < width; x += spacing) {
        dots.push({ x, y });
      }
    }
    return dots;
  }, [template, width, height]);

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ width, height, backgroundColor: '#F7F3ED' }}>
        {/* Template background */}
        {templatePaths.map((tp, i) => (
          <Path
            key={`tpl-${i}`}
            path={tp.path}
            color={templateColor}
            style="stroke"
            strokeWidth={0.5}
            opacity={templateOpacity}
          />
        ))}
        {dotPositions.map((dot, i) => (
          <Circle
            key={`dot-${i}`}
            cx={dot.x}
            cy={dot.y}
            r={1.5}
            color={templateColor}
            opacity={templateOpacity}
          />
        ))}

        {/* Drawn paths */}
        {paths.map((dp, i) => (
          <Path
            key={`path-${i}`}
            path={buildSkiaPath(dp.points)}
            color={dp.color}
            style="stroke"
            strokeWidth={dp.strokeWidth}
            strokeCap="round"
            strokeJoin="round"
          />
        ))}
      </Canvas>
    </GestureDetector>
  );
}
