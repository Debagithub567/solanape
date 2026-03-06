export const Colors = {
  // Backgrounds
  bg: '#0A0A12',
  bgCard: '#12121E',
  bgElevated: '#1A1A2E',
  bgInput: '#16162A',

  // Brand
  green: '#14F195',
  greenDim: 'rgba(20, 241, 149, 0.12)',
  greenBorder: 'rgba(20, 241, 149, 0.25)',
  purple: '#9945FF',
  purpleDim: 'rgba(153, 69, 255, 0.12)',
  purpleBorder: 'rgba(153, 69, 255, 0.25)',
  blue: '#00C2FF',

  // SKR token color
  skrGold: '#FFB800',
  skrGoldDim: 'rgba(255, 184, 0, 0.12)',
  skrGoldBorder: 'rgba(255, 184, 0, 0.25)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.55)',
  textMuted: 'rgba(255,255,255,0.3)',

  // Status
  success: '#14F195',
  error: '#FF4D6D',
  warning: '#FFB800',
  pending: '#FFD700',

  // Borders
  border: 'rgba(255,255,255,0.07)',
  borderActive: 'rgba(20, 241, 149, 0.35)',

  // Gradients (as arrays for LinearGradient)
  gradientGreen: ['#14F195', '#00C2FF'] as string[],
  gradientPurple: ['#9945FF', '#14F195'] as string[],
  gradientSKR: ['#FFB800', '#FF6B35'] as string[],
  gradientCard: ['#1A1A2E', '#12121E'] as string[],
  gradientHero: ['#0F1A2E', '#1A0F2E'] as string[],
};

export const Fonts = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    hero: 38,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  screen: 20,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};