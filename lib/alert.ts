import { Alert, Platform } from 'react-native';

export type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

// Natif : Alert.alert tel quel. La variante web (alert.web.ts) existe parce que
// react-native-web fournit un Alert qui ne fait litteralement rien
// (`static alert() {}`), ce qui rend toutes les erreurs et confirmations
// invisibles dans le navigateur.
export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  Alert.alert(title, message, buttons);
}

// Alert.prompt n'existe que sur iOS cote natif.
export const promptSupported = Platform.OS === 'ios';

export function showPrompt(
  title: string,
  message: string,
  onSubmit: (value: string) => void,
  defaultValue?: string,
) {
  Alert.prompt(title, message, onSubmit, 'plain-text', defaultValue);
}
