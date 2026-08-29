import { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import { PenLine } from 'lucide-react-native';
import { KText } from '../ui/Text';
import { useColors } from '../../theme/useColors';
import { paper } from '../../theme/paper';

// Variante web de SkiaCanvas. Metro resout .web.tsx en priorite, ce qui evite
// d'importer expo-pencilkit-ui : ce module declare platforms ["apple"] et n'a
// aucune implementation navigateur. PencilKit est une API Apple, il n'existe
// pas d'equivalent web — les cahiers restent donc une fonctionnalite iPad.
//
// L'interface est identique a la version native pour que l'ecran editeur
// n'ait pas a connaitre la plateforme.

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
  { width, height },
  ref
) {
  const colors = useColors();

  // Toutes les operations sont sans effet : il n'y a pas de canvas a piloter.
  // saveDrawingData renvoie null pour que l'editeur n'ecrase jamais en base
  // un dessin existant avec du vide depuis le web.
  useImperativeHandle(ref, () => ({
    undo: () => {},
    redo: () => {},
    clear: () => {},
    captureAsBase64: async () => null,
    saveDrawingData: async () => null,
    loadDrawingData: async () => {},
  }));

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: paper.bg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 12,
      }}
    >
      <PenLine size={28} strokeWidth={1.6} color={colors.inkMuted} />
      <KText preset="sectionTitle" color={colors.ink}>
        Les cahiers sont sur iPad
      </KText>
      <KText preset="notePreview" color={colors.inkBody} style={{ textAlign: 'center', maxWidth: 320 }}>
        L'ecriture manuscrite utilise PencilKit et l'Apple Pencil, qui n'existent
        pas dans un navigateur. Ouvrez ce cahier sur votre iPad pour ecrire.
      </KText>
    </View>
  );
});
