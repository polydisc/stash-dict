import type { Database } from '../Database';
import { loadStarDictZip } from './loadStarDictZip';
import {
  importDictionary,
  type ImportOptions,
  type ImportResult,
} from './importDictionary';

/**
 * Unpacks a StarDict `.zip` and imports it. Unzip/validation errors and import
 * errors propagate; `importDictionary`'s transaction guarantees no partial rows.
 */
export function importDictionaryFromZip(
  db: Database,
  zipBytes: Uint8Array,
  opts?: ImportOptions,
): ImportResult {
  const files = loadStarDictZip(zipBytes);
  return importDictionary(db, files, opts);
}
