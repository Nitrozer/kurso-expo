export type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

// Web : react-native-web expose `class Alert { static alert() {} }`, une
// fonction vide. Sans ce remplacement, aucun message d'erreur ni aucune
// confirmation n'apparait dans le navigateur, et les actions destructives ne
// se declenchent jamais puisque leur callback vit dans un bouton jamais rendu.
export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  const text = message ? `${title}\n\n${message}` : title;
  const actions = (buttons ?? []).filter((b) => b.style !== 'cancel');
  const cancel = (buttons ?? []).find((b) => b.style === 'cancel');

  // Simple message
  if (actions.length === 0) {
    window.alert(text);
    cancel?.onPress?.();
    return;
  }

  // Une seule action : message puis execution
  if (actions.length === 1 && !cancel) {
    window.alert(text);
    actions[0].onPress?.();
    return;
  }

  // Une action + annulation : confirmation
  if (actions.length === 1) {
    if (window.confirm(text)) actions[0].onPress?.();
    else cancel?.onPress?.();
    return;
  }

  // Plusieurs actions : menu numerote. Rudimentaire, mais ces appels sont des
  // menus contextuels secondaires (renommer / supprimer / changer de couleur).
  const menu = actions.map((b, i) => `${i + 1}. ${b.text ?? ''}`).join('\n');
  const answer = window.prompt(`${text}\n\n${menu}\n\nEntrez un numero :`);
  if (answer === null) {
    cancel?.onPress?.();
    return;
  }
  const choice = actions[Number(answer) - 1];
  if (choice) choice.onPress?.();
}

// window.prompt est disponible partout dans un navigateur.
export const promptSupported = true;

export function showPrompt(
  title: string,
  message: string,
  onSubmit: (value: string) => void,
  defaultValue?: string,
) {
  const answer = window.prompt(message ? `${title}\n\n${message}` : title, defaultValue ?? '');
  if (answer !== null) onSubmit(answer);
}
