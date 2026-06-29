import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';

/**
 * Device-only: reads the bundled `assets/dev-seed.zip` into bytes for the dev
 * seeder. Not imported by tests (which pass their own loader). Requires `zip`
 * in Metro's `assetExts` (see metro.config.js).
 */
export async function loadBundledSeedBytes(): Promise<Uint8Array> {
  const asset = Asset.fromModule(require('../../assets/dev-seed.zip'));
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  const buffer = await new File(uri).arrayBuffer();
  return new Uint8Array(buffer);
}
