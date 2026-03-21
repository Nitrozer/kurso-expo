export const fonts = {
  serif: {
    black:       'Fraunces_900Black',
    bold:        'Fraunces_700Bold',
    lightItalic: 'Fraunces_300Light_Italic',
  },
  sans: {
    light:   'DMSans_300Light',
    regular: 'DMSans_400Regular',
    medium:  'DMSans_500Medium',
  },
} as const;

export const textPresets = {
  heroName:      { fontFamily: fonts.serif.black, fontSize: 48, lineHeight: 52, letterSpacing: -2.4 },
  eyebrow:       { fontFamily: fonts.sans.medium, fontSize: 9, letterSpacing: 1.6, textTransform: 'uppercase' as const },
  statBig:       { fontFamily: fonts.serif.black, fontSize: 38, lineHeight: 38, letterSpacing: -1.9 },
  statLabel:     { fontFamily: fonts.sans.light, fontSize: 9.5, letterSpacing: 0.4 },
  courseTitle:    { fontFamily: fonts.serif.bold, fontSize: 15, letterSpacing: -0.3 },
  courseDetail:   { fontFamily: fonts.sans.light, fontSize: 10.5 },
  timeHour:      { fontFamily: fonts.serif.bold, fontSize: 13, letterSpacing: -0.4 },
  timeMin:       { fontFamily: fonts.sans.light, fontSize: 9 },
  sectionTitle:  { fontFamily: fonts.serif.bold, fontSize: 14, letterSpacing: -0.14 },
  sectionAction: { fontFamily: fonts.sans.regular, fontSize: 10, letterSpacing: 0.2 },
  monthName:     { fontFamily: fonts.serif.bold, fontSize: 16, letterSpacing: -0.48 },
  calDay:        { fontFamily: fonts.sans.light, fontSize: 10 },
  calHeader:     { fontFamily: fonts.sans.medium, fontSize: 8, letterSpacing: 0.48, textTransform: 'uppercase' as const },
  taskText:      { fontFamily: fonts.sans.regular, fontSize: 11.5, lineHeight: 16 },
  taskDue:       { fontFamily: fonts.sans.light, fontSize: 9 },
  noteCategory:  { fontFamily: fonts.sans.medium, fontSize: 8, letterSpacing: 1.12, textTransform: 'uppercase' as const },
  noteTitle:     { fontFamily: fonts.serif.bold, fontSize: 12.5, letterSpacing: -0.25 },
  notePreview:   { fontFamily: fonts.sans.light, fontSize: 10, lineHeight: 15 },
  dateChip:      { fontFamily: fonts.sans.light, fontSize: 10, letterSpacing: 0.6 },
  badgePill:     { fontFamily: fonts.sans.medium, fontSize: 8, letterSpacing: 0.96, textTransform: 'uppercase' as const },
  sectionLabel:  { fontFamily: fonts.sans.medium, fontSize: 9, letterSpacing: 1.26, textTransform: 'uppercase' as const },
} as const;
