/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  // Requis sur web. Avec la valeur par defaut 'media', le runtime NativeWind
  // (react-native-css-interop) initialise son color scheme via un
  // MutationObserver qui appelle colorScheme.set() sans condition, alors que
  // ce setter leve justement une exception quand darkMode vaut 'media'.
  // L'app plante au chargement. Le theme lui-meme ne depend pas de ce reglage :
  // il passe par useColors(), et il ne reste aucune variante dark: dans le code.
  darkMode: 'class',
  theme: {
    extend: {
      // Pas de tokens de couleur ici : la couleur vient exclusivement de
      // useColors() (theme/colors.ts + darkColors.ts), sinon le mode sombre
      // ne peut pas suivre. NativeWind ne garde que ce qui est independant
      // du theme : espacements, rayons, typographie.
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '28px',
        xxxl: '32px',
      },
      borderRadius: {
        sm: '6px',
        md: '9px',
        lg: '12px',
        xl: '14px',
        '2xl': '16px',
        pill: '20px',
        full: '9999px',
      },
      fontFamily: {
        'serif-black': ['Fraunces_900Black'],
        'serif-bold': ['Fraunces_700Bold'],
        'serif-light-italic': ['Fraunces_300Light_Italic'],
        'sans-light': ['DMSans_300Light'],
        'sans-regular': ['DMSans_400Regular'],
        'sans-medium': ['DMSans_500Medium'],
      },
    },
  },
  plugins: [],
};
