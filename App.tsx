import './src/theme/unistyles';
import { useEffect, useMemo } from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SettingsProvider } from './src/features/settings/SettingsContext';
import { createSettingsService } from './src/features/settings/settingsService';
import { openAppDatabase } from './src/db/openAppDatabase';

export default function App() {
  const settingsService = useMemo(() => createSettingsService(openAppDatabase()), []);

  useEffect(() => {
    // Dev-only: seed a sample dictionary on a fresh install so search/detail can
    // be tried without a manual import. The seeder and the bundled asset are
    // require()d INSIDE this `__DEV__` block (not statically imported), so the
    // production minifier drops the whole branch — keeping the sample dictionary
    // and expo-asset out of the release bundle (spec: ship no bundled dictionary).
    if (__DEV__) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { openAppDatabase } = require('./src/db/openAppDatabase');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { seedDevDictionaryIfEmpty } = require('./src/dev/seedDevDictionary');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { loadBundledSeedBytes } = require('./src/dev/loadBundledSeed');
      Promise.resolve()
        .then(() => seedDevDictionaryIfEmpty(openAppDatabase(), loadBundledSeedBytes))
        .catch((e: unknown) => console.warn('[dev-seed] failed:', e));
    }
  }, []);
  return (
    <SettingsProvider service={settingsService}>
      <AppNavigator />
    </SettingsProvider>
  );
}
