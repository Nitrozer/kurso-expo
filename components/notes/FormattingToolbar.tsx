import { View, Pressable } from 'react-native';
import { Bold, Italic, List, FunctionSquare, Plus } from 'lucide-react-native';
import { colors } from '../../theme/colors';

type Props = {
  onBold?: () => void;
  onItalic?: () => void;
  onList?: () => void;
  onFormula?: () => void;
  onAdd?: () => void;
};

export function FormattingToolbar({ onBold, onItalic, onList, onFormula, onAdd }: Props) {
  const buttons = [
    { icon: Bold, onPress: onBold },
    { icon: Italic, onPress: onItalic },
    { icon: List, onPress: onList },
    { icon: FunctionSquare, onPress: onFormula },
  ];

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingBottom: 24,
        paddingTop: 8,
        backgroundColor: 'rgba(253,249,243,0.9)',
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          paddingHorizontal: 16,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#C5C5D9',
          borderRadius: 9999,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {buttons.map(({ icon: Icon, onPress }, i) => (
            <Pressable
              key={i}
              onPress={onPress}
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
              }}
            >
              <Icon size={20} strokeWidth={1.6} color="#444656" />
            </Pressable>
          ))}
        </View>

        <View style={{ width: 1, height: 24, backgroundColor: '#C5C5D9', marginHorizontal: 4 }} />

        <Pressable
          onPress={onAdd}
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            backgroundColor: colors.blue,
          }}
        >
          <Plus size={20} strokeWidth={1.8} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
