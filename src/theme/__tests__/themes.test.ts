import { lightTheme, darkTheme } from '../themes';

describe('themes', () => {
  it('expose the same color token shape for light and dark', () => {
    expect(Object.keys(lightTheme.colors).sort()).toEqual(
      Object.keys(darkTheme.colors).sort(),
    );
    expect(lightTheme.colors.background).not.toBe(darkTheme.colors.background);
  });

  it('define the editorial color tokens in both themes', () => {
    for (const theme of [lightTheme, darkTheme]) {
      for (const key of [
        'background', 'surface', 'surfaceAlt', 'hairline', 'border',
        'text', 'textMuted', 'accent', 'onAccent', 'primary', 'onPrimary',
        'danger', 'headword',
      ] as const) {
        expect(typeof theme.colors[key]).toBe('string');
        expect(theme.colors[key].length).toBeGreaterThan(0);
      }
    }
  });

  it('expose serif font tokens', () => {
    expect(lightTheme.fonts.serifDisplay).toBeTruthy();
    expect(lightTheme.fonts.serifText).toBeTruthy();
    expect(Object.keys(lightTheme.fonts).sort()).toEqual(
      Object.keys(darkTheme.fonts).sort(),
    );
  });

  it('expose radii tokens', () => {
    expect(lightTheme.radii.sm).toBeLessThan(lightTheme.radii.lg);
    expect(lightTheme.radii.pill).toBeGreaterThan(100);
  });

  it('scale spacing by a base unit', () => {
    expect(lightTheme.spacing(2)).toBe(16);
  });

  it('provide ascending font sizes including display', () => {
    const { sm, md, lg, xl, display } = lightTheme.fontSizes;
    expect(sm < md && md < lg && lg < xl && xl < display).toBe(true);
  });
});
