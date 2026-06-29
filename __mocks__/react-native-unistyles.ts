import { lightTheme } from '../src/theme/themes';

export const StyleSheet = {
  configure: () => undefined,
  create: (factory: unknown) =>
    typeof factory === 'function'
      ? (factory as (t: unknown) => unknown)(lightTheme)
      : factory,
};

export const useUnistyles = () => ({ theme: lightTheme });

export const UnistylesRuntime = {
  setAdaptiveThemes: () => undefined,
  setTheme: () => undefined,
};
