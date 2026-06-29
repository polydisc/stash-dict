import type { Database } from '../Database';

export type ThemePref = 'system' | 'light' | 'dark';
export interface AppSettings {
  theme: ThemePref;
  fontScale: number;
}

export const MIN_FONT_SCALE = 0.8;
export const MAX_FONT_SCALE = 1.6;
export const DEFAULT_SETTINGS: AppSettings = { theme: 'system', fontScale: 1 };

const THEMES: ThemePref[] = ['system', 'light', 'dark'];

const clampScale = (n: number): number =>
  Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, n));

function getValue(db: Database, key: string): string | undefined {
  const { rows } = db.execute('SELECT value FROM settings WHERE key = ?', [key]);
  return rows.length ? (rows[0].value as string) : undefined;
}

function setValue(db: Database, key: string, value: string): void {
  db.execute(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}

export function getSettings(db: Database): AppSettings {
  const themeRaw = getValue(db, 'theme');
  const theme = THEMES.includes(themeRaw as ThemePref)
    ? (themeRaw as ThemePref)
    : DEFAULT_SETTINGS.theme;

  const scaleRaw = Number(getValue(db, 'fontScale'));
  const fontScale = Number.isFinite(scaleRaw) && scaleRaw > 0
    ? clampScale(scaleRaw)
    : DEFAULT_SETTINGS.fontScale;

  return { theme, fontScale };
}

export function setTheme(db: Database, theme: ThemePref): void {
  setValue(db, 'theme', theme);
}

export function setFontScale(db: Database, scale: number): void {
  setValue(db, 'fontScale', String(scale));
}
