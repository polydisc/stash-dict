import { useCallback, useState } from 'react';
import type { DictionaryRow } from '../../db/dictionaries/repository';
import type { ImportOptions, ImportProgress } from '../../db/import/importDictionary';

export interface DictionaryService {
  list(): DictionaryRow[];
  setEnabled(id: number, enabled: boolean): void;
  reorder(ids: number[]): void;
  remove(id: number): void;
  rename(id: number, name: string): void;
  importZip(bytes: Uint8Array, opts?: ImportOptions): void;
}

export interface DictionaryManager {
  dictionaries: DictionaryRow[];
  importing: boolean;
  progress: ImportProgress | null;
  error: string | null;
  toggle(id: number, enabled: boolean): void;
  reorder(ids: number[]): void;
  remove(id: number): void;
  rename(id: number, name: string): void;
  importZip(bytes: Uint8Array): Promise<void>;
}

export function useDictionaryManager(service: DictionaryService): DictionaryManager {
  const [dictionaries, setDictionaries] = useState<DictionaryRow[]>(() => service.list());
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => setDictionaries(service.list()), [service]);

  const toggle = useCallback(
    (id: number, enabled: boolean) => {
      service.setEnabled(id, enabled);
      refresh();
    },
    [service, refresh],
  );

  const reorder = useCallback(
    (ids: number[]) => {
      service.reorder(ids);
      refresh();
    },
    [service, refresh],
  );

  const remove = useCallback(
    (id: number) => {
      service.remove(id);
      refresh();
    },
    [service, refresh],
  );

  const rename = useCallback(
    (id: number, name: string) => {
      service.rename(id, name);
      refresh();
    },
    [service, refresh],
  );

  const importZip = useCallback(
    async (bytes: Uint8Array) => {
      setImporting(true);
      setError(null);
      setProgress(null);
      // Yield one tick so the progress modal actually paints before the
      // synchronous import blocks the JS thread. Without this, `importing`
      // flips true→false within a single tick and the modal never appears.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      try {
        service.importZip(bytes, { onProgress: setProgress });
        refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Import failed');
      } finally {
        setImporting(false);
      }
    },
    [service, refresh],
  );

  return { dictionaries, importing, progress, error, toggle, reorder, remove, rename, importZip };
}
