import { View, Pressable } from 'react-native';
import { useState } from 'react';
import { KText } from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

type ButtonType = 'digit' | 'operator' | 'function' | 'equals' | 'scientific' | 'clear';

type ButtonDef = {
  label: string;
  altLabel?: string;
  type: ButtonType;
  action: string;
  altAction?: string;
};

const GRID: ButtonDef[][] = [
  // Row 1: 2nd, (, ), %, AC
  [
    { label: '2nd', type: 'function', action: '2nd' },
    { label: '(', type: 'scientific', action: '(' },
    { label: ')', type: 'scientific', action: ')' },
    { label: '%', type: 'scientific', action: '%' },
    { label: 'AC', type: 'clear', action: 'AC' },
  ],
  // Row 2: sin, cos, tan, ÷, ⌫
  [
    { label: 'sin', altLabel: 'sin⁻¹', type: 'scientific', action: 'sin(', altAction: 'asin(' },
    { label: 'cos', altLabel: 'cos⁻¹', type: 'scientific', action: 'cos(', altAction: 'acos(' },
    { label: 'tan', altLabel: 'tan⁻¹', type: 'scientific', action: 'tan(', altAction: 'atan(' },
    { label: '÷', type: 'operator', action: '÷' },
    { label: '⌫', type: 'function', action: 'backspace' },
  ],
  // Row 3: xʸ, 7, 8, 9, ×
  [
    { label: 'xʸ', type: 'scientific', action: '^(' },
    { label: '7', type: 'digit', action: '7' },
    { label: '8', type: 'digit', action: '8' },
    { label: '9', type: 'digit', action: '9' },
    { label: '×', type: 'operator', action: '×' },
  ],
  // Row 4: √, 4, 5, 6, −
  [
    { label: '√', altLabel: '∛', type: 'scientific', action: '√(', altAction: '∛(' },
    { label: '4', type: 'digit', action: '4' },
    { label: '5', type: 'digit', action: '5' },
    { label: '6', type: 'digit', action: '6' },
    { label: '−', type: 'operator', action: '−' },
  ],
  // Row 5: x², 1, 2, 3, +
  [
    { label: 'x²', altLabel: 'x³', type: 'scientific', action: '^(2)', altAction: '^(3)' },
    { label: '1', type: 'digit', action: '1' },
    { label: '2', type: 'digit', action: '2' },
    { label: '3', type: 'digit', action: '3' },
    { label: '+', type: 'operator', action: '+' },
  ],
  // Row 6: π, e, 0, ,, =
  [
    { label: 'π', type: 'scientific', action: 'π' },
    { label: 'e', type: 'scientific', action: 'e' },
    { label: '0', type: 'digit', action: '0' },
    { label: ',', type: 'digit', action: ',' },
    { label: '=', type: 'equals', action: '=' },
  ],
];

// Extra row for ln, log, EXP (scientific functions from spec not in the main grid)
const EXTRA_ROW: ButtonDef[] = [
  { label: 'ln', altLabel: 'eˣ', type: 'scientific', action: 'ln(', altAction: 'exp(' },
  { label: 'log', type: 'scientific', action: 'log(' },
  { label: 'EXP', type: 'scientific', action: 'EXP(' },
  { label: '', type: 'scientific', action: '' },
  { label: '', type: 'scientific', action: '' },
];

export default function CalculatorScreen() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [isSecond, setIsSecond] = useState(false);

  const evaluateExpression = (expr: string): string => {
    try {
      if (!expr.trim()) return '0';

      let parsed = expr;

      // Replace display symbols with JS math
      parsed = parsed.replace(/×/g, '*');
      parsed = parsed.replace(/÷/g, '/');
      parsed = parsed.replace(/−/g, '-');
      parsed = parsed.replace(/,/g, '.');
      parsed = parsed.replace(/π/g, `(${Math.PI})`);

      // Replace standalone 'e' but not inside function names
      parsed = parsed.replace(/(?<![a-z])e(?![a-z(])/g, `(${Math.E})`);

      // Trig functions (degrees to radians)
      parsed = parsed.replace(/sin\(([^)]+)\)/g, (_, inner) => `Math.sin((${inner})*Math.PI/180)`);
      parsed = parsed.replace(/cos\(([^)]+)\)/g, (_, inner) => `Math.cos((${inner})*Math.PI/180)`);
      parsed = parsed.replace(/tan\(([^)]+)\)/g, (_, inner) => `Math.tan((${inner})*Math.PI/180)`);

      // Inverse trig (result in degrees)
      parsed = parsed.replace(/asin\(([^)]+)\)/g, (_, inner) => `(Math.asin(${inner})*180/Math.PI)`);
      parsed = parsed.replace(/acos\(([^)]+)\)/g, (_, inner) => `(Math.acos(${inner})*180/Math.PI)`);
      parsed = parsed.replace(/atan\(([^)]+)\)/g, (_, inner) => `(Math.atan(${inner})*180/Math.PI)`);

      // Math functions
      parsed = parsed.replace(/ln\(/g, 'Math.log(');
      parsed = parsed.replace(/log\(/g, 'Math.log10(');
      parsed = parsed.replace(/exp\(/g, 'Math.exp(');
      parsed = parsed.replace(/√\(/g, 'Math.sqrt(');
      parsed = parsed.replace(/∛\(/g, 'Math.cbrt(');

      // Power
      parsed = parsed.replace(/\^/g, '**');

      // EXP notation: EXP(n) → *Math.pow(10,n)
      parsed = parsed.replace(/EXP\(([^)]+)\)/g, '*Math.pow(10,$1)');

      // Percent
      parsed = parsed.replace(/%/g, '/100');

      // eslint-disable-next-line no-eval
      const evalResult = Function(`"use strict"; return (${parsed})`)();

      if (typeof evalResult !== 'number' || !isFinite(evalResult)) {
        return 'Erreur';
      }

      const formatted = Number.isInteger(evalResult)
        ? evalResult.toString()
        : parseFloat(evalResult.toPrecision(10)).toString();

      return formatted.replace('.', ',');
    } catch {
      return 'Erreur';
    }
  };

  const handlePress = (btn: ButtonDef) => {
    if (btn.label === '') return;

    if (btn.action === '2nd') {
      setIsSecond((prev) => !prev);
      return;
    }

    if (btn.action === 'AC') {
      setExpression('');
      setResult('0');
      return;
    }

    if (btn.action === 'backspace') {
      const multiCharTokens = ['sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'ln(', 'log(', 'exp(', '√(', '∛(', 'EXP('];
      let newExpr = expression;
      let removed = false;
      for (const token of multiCharTokens) {
        if (newExpr.endsWith(token)) {
          newExpr = newExpr.slice(0, -token.length);
          removed = true;
          break;
        }
      }
      if (!removed) {
        newExpr = newExpr.slice(0, -1);
      }
      setExpression(newExpr);
      return;
    }

    if (btn.action === '=') {
      const res = evaluateExpression(expression);
      setResult(res);
      if (res !== 'Erreur') {
        setExpression(res);
      }
      return;
    }

    const action = isSecond && btn.altAction ? btn.altAction : btn.action;
    setExpression((prev) => prev + action);

    if (isSecond && btn.altAction) {
      setIsSecond(false);
    }
  };

  const getDisplayLabel = (btn: ButtonDef): string => {
    if (isSecond && btn.altLabel) return btn.altLabel;
    return btn.label;
  };

  const getButtonStyle = (btn: ButtonDef) => {
    const base = {
      flex: 1,
      height: 48,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginRight: 6,
      marginBottom: 6,
      borderRadius: 12,
    };

    if (btn.label === '') return { ...base, opacity: 0 };

    switch (btn.type) {
      case 'clear':
        return { ...base, backgroundColor: colors.surfaceAlt };
      case 'equals':
        return { ...base, backgroundColor: colors.dark };
      case 'digit':
        return { ...base, borderWidth: 1, borderColor: '#E0D8CE' };
      case 'operator':
        return { ...base, borderWidth: 1, borderColor: '#E0D8CE' };
      case 'scientific':
        return { ...base };
      case 'function':
        if (btn.action === '2nd') {
          return { ...base, backgroundColor: isSecond ? colors.dark : colors.surfaceAlt };
        }
        return { ...base, backgroundColor: colors.surfaceAlt };
      default:
        return base;
    }
  };

  const getTextStyle = (btn: ButtonDef) => {
    switch (btn.type) {
      case 'operator':
        return { fontFamily: fonts.sans.medium, fontSize: 18, color: colors.blue };
      case 'equals':
        return { fontFamily: fonts.serif.bold, fontSize: 20, color: colors.darkText };
      case 'digit':
        return { fontFamily: fonts.serif.bold, fontSize: 18, color: colors.ink };
      case 'scientific':
        return { fontFamily: fonts.sans.medium, fontSize: 11, color: colors.inkSoft };
      case 'clear':
        return { fontFamily: fonts.sans.medium, fontSize: 14, color: colors.ink };
      case 'function':
        if (btn.action === '2nd') {
          return {
            fontFamily: fonts.sans.medium,
            fontSize: 11,
            color: isSecond ? colors.darkText : colors.ink,
          };
        }
        return { fontFamily: fonts.sans.medium, fontSize: 14, color: colors.ink };
      default:
        return { fontFamily: fonts.sans.medium, fontSize: 14, color: colors.ink };
    }
  };

  const allRows = [GRID[0], EXTRA_ROW, ...GRID.slice(1)];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16, justifyContent: 'flex-end' }}>
      {/* Display */}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          padding: 16,
          marginBottom: 16,
          alignItems: 'flex-end',
          minHeight: 90,
          justifyContent: 'flex-end',
        }}
      >
        <KText
          style={{
            fontFamily: fonts.sans.light,
            fontSize: 14,
            color: colors.inkMuted,
            marginBottom: 4,
          }}
          numberOfLines={2}
        >
          {expression || ' '}
        </KText>
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
          {result}
        </KText>
      </View>

      {/* Button grid */}
      {allRows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row' }}>
          {row.map((btn, colIndex) => (
            <Pressable
              key={`${rowIndex}-${colIndex}`}
              onPress={() => handlePress(btn)}
              style={getButtonStyle(btn)}
              disabled={btn.label === ''}
            >
              <KText style={getTextStyle(btn)}>{getDisplayLabel(btn)}</KText>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
