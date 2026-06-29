import { renderHook, act } from '@testing-library/react-native';
import { useAppSettings } from '../useAppSettings';
import type { AppSettings, ThemePref } from '../../../db/settings/repository';

function fakeService(initial: AppSettings) {
  let state = { ...initial };
  return {
    get: () => state,
    setTheme: (t: ThemePref) => {
      state = { ...state, theme: t };
    },
    setFontScale: (s: number) => {
      state = { ...state, fontScale: s };
    },
  };
}

describe('useAppSettings', () => {
  it('loads initial settings', () => {
    const { result } = renderHook(() => useAppSettings(fakeService({ theme: 'dark', fontScale: 1.15 })));
    expect(result.current.settings).toEqual({ theme: 'dark', fontScale: 1.15 });
  });

  it('updates and persists the theme', () => {
    const service = fakeService({ theme: 'system', fontScale: 1 });
    const { result } = renderHook(() => useAppSettings(service));
    act(() => result.current.setTheme('light'));
    expect(result.current.settings.theme).toBe('light');
    expect(service.get().theme).toBe('light');
  });

  it('updates and persists the font scale', () => {
    const service = fakeService({ theme: 'system', fontScale: 1 });
    const { result } = renderHook(() => useAppSettings(service));
    act(() => result.current.setFontScale(1.3));
    expect(result.current.settings.fontScale).toBe(1.3);
    expect(service.get().fontScale).toBe(1.3);
  });
});
