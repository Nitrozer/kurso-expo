/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
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
