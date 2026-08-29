// Couleurs du papier des cahiers.
//
// Volontairement INDEPENDANTES du theme : l'encre PencilKit est choisie par
// l'utilisateur dans le tool picker natif et vaut noir par defaut. Assombrir le
// papier rendrait invisibles toutes les pages deja ecrites. Les cahiers restent
// donc du papier clair en mode sombre, comme GoodNotes ou Notability.
export const paper = {
  bg:         '#F5F0EB',
  line:       '#C8D0E8',
  lineSubtle: '#E0D8CE',
  margin:     '#E0A0A0',
  dot:        '#C0C0C0',
  hole:       '#FFFFFF',
  holeBorder: '#D0D0D0',
} as const;
