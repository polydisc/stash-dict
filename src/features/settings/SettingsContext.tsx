import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useAppSettings, type SettingsService } from './useAppSettings';
import { applyTheme } from './applyTheme';
import { DEFAULT_SETTINGS, type AppSettings, type ThemePref } from '../../db/settings/repository';

export interface SettingsContextValue {
  settings: AppSettings;
  setTheme(theme: ThemePref): void;
  setFontScale(scale: number): void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Holds the app's settings and applies the theme to the unistyles runtime
 * whenever it changes, so theme AND font scale propagate live to every screen
 * (no per-screen re-read). Wrap the app once with the real service.
 */
export function SettingsProvider({
  service,
  children,
}: {
  service: SettingsService;
  children: ReactNode;
}) {
  const value = useAppSettings(service);
  useEffect(() => {
    applyTheme(value.settings.theme);
  }, [value.settings.theme]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/**
 * Reads the live settings. Outside a provider (e.g. an isolated component test)
 * it returns defaults with no-op setters, so consumers stay renderable.
 */
export function useSettings(): SettingsContextValue {
  return (
    useContext(SettingsContext) ?? {
      settings: DEFAULT_SETTINGS,
      setTheme: () => undefined,
      setFontScale: () => undefined,
    }
  );
}
