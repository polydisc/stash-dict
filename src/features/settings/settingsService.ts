import type { Database } from '../../db/Database';
import { getSettings, setTheme, setFontScale } from '../../db/settings/repository';
import type { SettingsService } from './useAppSettings';

export function createSettingsService(db: Database): SettingsService {
  return {
    get: () => getSettings(db),
    setTheme: (theme) => setTheme(db, theme),
    setFontScale: (scale) => setFontScale(db, scale),
  };
}
