import { colors } from './colors';
import { darkColors } from './darkColors';
import { useThemeStore } from '../stores/themeStore';

export function useColors() {
  const mode = useThemeStore((s) => s.mode);
  return mode === 'dark' ? darkColors : colors;
}
