import type { Database } from '../../db/Database';
import {
  listDictionaries,
  setDictionaryEnabled,
  reorderDictionaries,
  deleteDictionary,
  renameDictionary,
} from '../../db/dictionaries/repository';
import { importDictionaryFromZip } from '../../db/import/importFromZip';
import type { ImportOptions } from '../../db/import/importDictionary';
import type { DictionaryService } from './useDictionaryManager';

export function createDictionaryService(db: Database): DictionaryService {
  return {
    list: () => listDictionaries(db),
    setEnabled: (id, enabled) => setDictionaryEnabled(db, id, enabled),
    reorder: (ids) => reorderDictionaries(db, ids),
    remove: (id) => deleteDictionary(db, id),
    rename: (id, name) => renameDictionary(db, id, name),
    importZip: (bytes: Uint8Array, opts?: ImportOptions) =>
      void importDictionaryFromZip(db, bytes, opts),
  };
}
