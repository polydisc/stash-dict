import { UnistylesRuntime } from 'react-native-unistyles';
import type { ThemePref } from '../../db/settings/repository';

/**
 * Device-only: drive the unistyles runtime from the saved theme preference.
 * `system` follows the OS; `light`/`dark` pin the theme.
 */
export function applyTheme(theme: ThemePref): void {
  if (theme === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
    return;
  }
  UnistylesRuntime.setAdaptiveThemes(false);
  UnistylesRuntime.setTheme(theme);
}
