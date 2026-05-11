// ─── SYNDIX Design Tokens ─────────────────────────────────────────────────────

export const T = {
  // Sidebar
  sidebarBg: '#FFFFFF',
  sidebarBorder: '#E8EDF5',

  // Main canvas background
  canvasBg: '#F0F4FB',

  // Brand colors
  navy: '#1C2B6B',
  navyDeep: '#111D4A',
  teal: '#2BBCD4',
  tealLight: '#E0F7FB',
  orange: '#F5A623',
  orangeDeep: '#E8891A',
  orangeLight: '#FFF4E0',
  amber: '#F07C29',

  // Neutrals
  white: '#FFFFFF',
  text: '#0F1A3E',
  textMd: '#4A5578',
  textSm: '#8892AA',
  border: '#E4E9F2',
  surface: '#F7F9FD',

  // Semantic colors
  green: '#00C48C',
  greenLight: '#E6FBF5',
  red: '#FF5A5A',
  redLight: '#FFF0F0',
  gold: '#F5A623',
} as const;

export type Theme = typeof T;