import { unzipSync } from 'fflate';
import { inflateDict } from '../../parser';
import type { DictionaryFiles } from '../../parser';

/** Strips any directory prefix from a zip entry path. */
function baseName(path: string): string {
  const slash = path.lastIndexOf('/');
  return slash === -1 ? path : path.slice(slash + 1);
}

/**
 * macOS Finder's "Compress" adds AppleDouble metadata entries
 * (`__MACOSX/._name.ifo`, `._name`). These must be ignored so a normal
 * single-dictionary archive is not misread as containing several `.ifo`s.
 */
function isMetadataEntry(path: string): boolean {
  return path.split('/').includes('__MACOSX') || baseName(path).startsWith('._');
}

/**
 * Unpacks a StarDict `.zip` and binds the file set sharing the `.ifo`'s base
 * name. `.dict.dz` is inflated to raw `.dict` bytes. Throws if the required
 * `.ifo`/`.idx`/`.dict` are not all present.
 */
export function loadStarDictZip(zipBytes: Uint8Array): DictionaryFiles {
  const unzipped = unzipSync(zipBytes);
  const entries = Object.entries(unzipped).filter(([p]) => !isMetadataEntry(p));

  const ifoEntries = entries.filter(([p]) => baseName(p).endsWith('.ifo'));
  if (ifoEntries.length === 0) {
    throw new Error('No .ifo file found in the archive');
  }
  if (ifoEntries.length > 1) {
    throw new Error(
      'Archive contains multiple dictionaries (.ifo files); import one at a time',
    );
  }
  const ifoEntry = ifoEntries[0];
  const base = baseName(ifoEntry[0]).replace(/\.ifo$/, '');
  const sibling = (suffix: string): Uint8Array | undefined => {
    const hit = entries.find(([p]) => baseName(p) === base + suffix);
    return hit ? hit[1] : undefined;
  };

  const idx = sibling('.idx');
  if (!idx) {
    throw new Error(`Missing .idx for "${base}"`);
  }

  let dict = sibling('.dict');
  const dictDz = sibling('.dict.dz');
  if (!dict && dictDz) {
    dict = inflateDict(dictDz);
  }
  if (!dict) {
    throw new Error(`Missing .dict (or .dict.dz) for "${base}"`);
  }

  return { ifo: ifoEntry[1], idx, dict, syn: sibling('.syn') };
}
