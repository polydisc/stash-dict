import { useCallback, useState } from 'react';
import type { AppSettings, ThemePref } from '../../db/settings/repository';

export interface SettingsService {
  get(): AppSettings;
  setTheme(theme: ThemePref): void;
  setFontScale(scale: number): void;
}

export function useAppSettings(service: SettingsService): {
  settings: AppSettings;
  setTheme(theme: ThemePref): void;
  setFontScale(scale: number): void;
} {
  const [settings, setSettings] = useState<AppSettings>(() => service.get());

  const setTheme = useCallback(
    (theme: ThemePref) => {
      service.setTheme(theme);
      setSettings((s) => ({ ...s, theme }));
    },
    [service],
  );

  const setFontScale = useCallback(
    (scale: number) => {
      service.setFontScale(scale);
      setSettings((s) => ({ ...s, fontScale: scale }));
    },
    [service],
  );

  return { settings, setTheme, setFontScale };
}
