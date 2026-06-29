const spacing = (n: number): number => n * 8;

const fontSizes = { sm: 13, md: 16, lg: 20, xl: 26, display: 34 } as const;

const fonts = {
  // iOS reliably renders Georgia by family name. "New York" (SF Serif) is not
  // addressable by a plain fontFamily string in RN; see downstream notes.
  serifDisplay: 'Georgia',
  serifText: 'Georgia',
} as const;

const radii = { sm: 10, md: 14, lg: 18, pill: 999 } as const;

export const lightTheme = {
  colors: {
    background: '#f6f1e7',
    surface: '#eee5d3',
    surfaceAlt: '#efe6d3',
    hairline: '#e4dac4',
    border: '#d1d1d6',
    text: '#2b2722',
    textMuted: '#6c6c70',
    accent: '#9a7b3f',
    onAccent: '#ffffff',
    primary: '#0a84ff',
    onPrimary: '#ffffff',
    danger: '#ff3b30',
    headword: '#2b2722',
  },
  fontSizes,
  fonts,
  radii,
  spacing,
} as const;

export const darkTheme = {
  colors: {
    background: '#6e5a48',
    surface: '#7a6552',
    surfaceAlt: '#634e3d',
    hairline: 'rgba(255,255,255,0.18)',
    border: 'rgba(255,255,255,0.24)',
    text: '#f3ece0',
    textMuted: '#cdbfaf',
    accent: '#f1d79a',
    onAccent: '#2b2722',
    primary: '#0a84ff',
    onPrimary: '#ffffff',
    danger: '#ff453a',
    headword: '#f3ece0',
  },
  fontSizes,
  fonts,
  radii,
  spacing,
} as const;

export type AppTheme = typeof lightTheme;
