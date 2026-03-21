import { View, Pressable } from 'react-native';
import { Undo2, Redo2, Mic, X } from 'lucide-react-native';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';

type TemplateType = 'blank' | 'lined' | 'grid' | 'dotted';

type Props = {
  strokeWidth: number;
  color: string;
  template: TemplateType;
  onStrokeChange: (width: number) => void;
  onColorChange: (color: string) => void;
  onTemplateChange: (template: TemplateType) => void;
  onUndo: () => void;
  onRedo: () => void;
  onMicPress: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const STROKE_SIZES = [
  { value: 2, size: 6 },
  { value: 4, size: 10 },
  { value: 8, size: 16 },
];

const COLORS = [
  { value: '#111111', label: 'black' },
  { value: '#3D5AFE', label: 'blue' },
  { value: '#8B4B4B', label: 'red' },
  { value: 'eraser', label: 'eraser' },
];

const TEMPLATES: { value: TemplateType; label: string }[] = [
  { value: 'lined', label: '—' },
  { value: 'grid', label: '#' },
  { value: 'dotted', label: '·' },
  { value: 'blank', label: '○' },
];

export function DrawingToolbar({
  strokeWidth,
  color,
  template,
  onStrokeChange,
  onColorChange,
  onTemplateChange,
  onUndo,
  onRedo,
  onMicPress,
  canUndo,
  canRedo,
}: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#F7F3ED',
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {/* Stroke widths */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {STROKE_SIZES.map((s) => (
          <Pressable
            key={s.value}
            onPress={() => onStrokeChange(s.value)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: strokeWidth === s.value ? colors.ink : colors.border,
              backgroundColor: strokeWidth === s.value ? colors.dark : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: s.size,
                height: s.size,
                borderRadius: s.size / 2,
                backgroundColor: strokeWidth === s.value ? colors.bg : colors.ink,
              }}
            />
          </Pressable>
        ))}
      </View>

      {/* Colors */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {COLORS.map((c) => (
          <Pressable
            key={c.label}
            onPress={() => onColorChange(c.value === 'eraser' ? '#F7F3ED' : c.value)}
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              borderWidth: color === (c.value === 'eraser' ? '#F7F3ED' : c.value) ? 2 : 1,
              borderColor:
                color === (c.value === 'eraser' ? '#F7F3ED' : c.value)
                  ? colors.blue
                  : colors.border,
              backgroundColor: c.value === 'eraser' ? '#FFFFFF' : c.value,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {c.value === 'eraser' && (
              <X size={12} strokeWidth={2} color={colors.inkSoft} />
            )}
          </Pressable>
        ))}
      </View>

      {/* Undo / Redo */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Pressable
          onPress={onUndo}
          disabled={!canUndo}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.borderSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Undo2 size={16} strokeWidth={1.6} color={canUndo ? colors.ink : colors.inkGhost} />
        </Pressable>
        <Pressable
          onPress={onRedo}
          disabled={!canRedo}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.borderSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Redo2 size={16} strokeWidth={1.6} color={canRedo ? colors.ink : colors.inkGhost} />
        </Pressable>
      </View>

      {/* Templates */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {TEMPLATES.map((t) => (
          <Pressable
            key={t.value}
            onPress={() => onTemplateChange(t.value)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: template === t.value ? colors.ink : colors.borderSoft,
              backgroundColor: template === t.value ? colors.dark : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <KText
              style={{
                fontSize: 14,
                color: template === t.value ? colors.bg : colors.inkSoft,
              }}
            >
              {t.label}
            </KText>
          </Pressable>
        ))}
      </View>

      {/* Mic */}
      <Pressable
        onPress={onMicPress}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.borderSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Mic size={18} strokeWidth={1.6} color={colors.ink} />
      </Pressable>
    </View>
  );
}
