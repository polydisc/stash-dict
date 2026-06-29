import type { Database } from '../db/Database';
import { listDictionaries } from '../db/dictionaries/repository';
import { importDictionaryFromZip } from '../db/import/importFromZip';

/**
 * Development helper: if no dictionaries are imported yet, import a bundled
 * sample so a fresh dev install has searchable content without a manual import.
 *
 * Pure and testable — the seed bytes are supplied by the caller (the real app
 * passes `loadBundledSeedBytes`, which reads the bundled asset on device). Only
 * call this under `__DEV__`; production never bundles a dictionary (spec).
 *
 * Returns true if it seeded, false if dictionaries already existed.
 */
export async function seedDevDictionaryIfEmpty(
  db: Database,
  loadSeedBytes: () => Promise<Uint8Array>,
): Promise<boolean> {
  if (listDictionaries(db).length > 0) return false;
  const bytes = await loadSeedBytes();
  importDictionaryFromZip(db, bytes);
  return true;
}
