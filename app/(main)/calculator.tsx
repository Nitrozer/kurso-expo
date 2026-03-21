import { View, Pressable, ScrollView } from 'react-native';
import { useState } from 'react';
import { KText } from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

type ButtonDef = {
  label: string;
  type: 'digit' | 'operator' | 'function' | 'equals';
  span?: number;
};

const BUTTONS: ButtonDef[][] = [
  [
    { label: 'AC', type: 'function' },
    { label: '±', type: 'function' },
    { label: '%', type: 'function' },
    { label: '÷', type: 'operator' },
  ],
  [
    { label: '7', type: 'digit' },
    { label: '8', type: 'digit' },
    { label: '9', type: 'digit' },
    { label: '×', type: 'operator' },
  ],
  [
    { label: '4', type: 'digit' },
    { label: '5', type: 'digit' },
    { label: '6', type: 'digit' },
    { label: '−', type: 'operator' },
  ],
  [
    { label: '1', type: 'digit' },
    { label: '2', type: 'digit' },
    { label: '3', type: 'digit' },
    { label: '+', type: 'operator' },
  ],
  [
    { label: '0', type: 'digit', span: 2 },
    { label: ',', type: 'digit' },
    { label: '=', type: 'equals' },
  ],
];

export default function CalculatorScreen() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetOnNext, setResetOnNext] = useState(false);

  const calculate = (a: number, op: string, b: number): number => {
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handlePress = (btn: ButtonDef) => {
    if (btn.type === 'digit') {
      if (btn.label === ',') {
        if (display.includes(',')) return;
        setDisplay(display + ',');
        setResetOnNext(false);
        return;
      }
      if (resetOnNext || display === '0') {
        setDisplay(btn.label);
        setResetOnNext(false);
      } else {
        setDisplay(display + btn.label);
      }
      return;
    }

    if (btn.type === 'function') {
      if (btn.label === 'AC') {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setResetOnNext(false);
      } else if (btn.label === '±') {
        const val = parseFloat(display.replace(',', '.'));
        setDisplay(String(-val).replace('.', ','));
      } else if (btn.label === '%') {
        const val = parseFloat(display.replace(',', '.'));
        setDisplay(String(val / 100).replace('.', ','));
      }
      return;
    }

    const currentValue = parseFloat(display.replace(',', '.'));

    if (btn.type === 'operator') {
      if (previousValue !== null && operation && !resetOnNext) {
        const result = calculate(previousValue, operation, currentValue);
        setDisplay(String(result).replace('.', ','));
        setPreviousValue(result);
      } else {
        setPreviousValue(currentValue);
      }
      setOperation(btn.label);
      setResetOnNext(true);
      return;
    }

    if (btn.type === 'equals') {
      if (previousValue !== null && operation) {
        const result = calculate(previousValue, operation, currentValue);
        setDisplay(String(result).replace('.', ','));
        setPreviousValue(null);
        setOperation(null);
        setResetOnNext(true);
      }
    }
  };

  const getButtonStyle = (btn: ButtonDef) => {
    const base = {
      borderWidth: 1,
      borderColor: colors.borderSoft,
      borderRadius: 12,
      height: 60,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      flex: btn.span === 2 ? 2 : 1,
      marginRight: 8,
      marginBottom: 8,
    };

    if (btn.type === 'function') {
      return { ...base, backgroundColor: colors.surfaceAlt };
    }
    if (btn.type === 'equals') {
      return { ...base, backgroundColor: colors.dark };
    }
    return { ...base, backgroundColor: 'transparent' };
  };

  const getTextStyle = (btn: ButtonDef) => {
    if (btn.type === 'operator') {
      return { fontFamily: fonts.sans.medium, fontSize: 20, color: colors.blue };
    }
    if (btn.type === 'equals') {
      return { fontFamily: fonts.serif.bold, fontSize: 20, color: colors.darkText };
    }
    if (btn.type === 'function') {
      return { fontFamily: fonts.sans.medium, fontSize: 16, color: colors.ink };
    }
    return { fontFamily: fonts.serif.bold, fontSize: 20, color: colors.ink };
  };

  return (
    <View className="flex-1 bg-parchment p-xxl justify-end">
      {/* Display */}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          padding: 16,
          marginBottom: 20,
          alignItems: 'flex-end',
          minHeight: 80,
          justifyContent: 'flex-end',
        }}
      >
        <KText
          style={{
            fontFamily: fonts.serif.black,
            fontSize: 38,
            color: colors.ink,
            letterSpacing: -1.5,
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {display}
        </KText>
      </View>

      {/* Buttons */}
      {BUTTONS.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row">
          {row.map((btn) => (
            <Pressable
              key={btn.label}
              onPress={() => handlePress(btn)}
              style={getButtonStyle(btn)}
            >
              <KText style={getTextStyle(btn)}>{btn.label}</KText>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
