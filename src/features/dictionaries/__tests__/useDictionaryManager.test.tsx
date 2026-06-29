import { renderHook, act } from '@testing-library/react-native';
import { useDictionaryManager } from '../useDictionaryManager';
import type { DictionaryRow } from '../../../db/dictionaries/repository';

function fakeService(initial: DictionaryRow[]) {
  let rows = [...initial];
  return {
    list: () => rows,
    setEnabled: (id: number, enabled: boolean) => {
      rows = rows.map((d) => (d.dictId === id ? { ...d, enabled } : d));
    },
    reorder: (ids: number[]) => {
      rows = ids.map((id, i) => ({
        ...(rows.find((d) => d.dictId === id) as DictionaryRow),
        sortOrder: i,
      }));
    },
    remove: (id: number) => {
      rows = rows.filter((d) => d.dictId !== id);
    },
    rename: (id: number, name: string) => {
      rows = rows.map((d) => (d.dictId === id ? { ...d, name } : d));
    },
    importZip: () => {
      rows = [
        ...rows,
        { dictId: 99, name: 'New', wordCount: 1, enabled: true, sortOrder: rows.length },
      ];
    },
  };
}

const ROWS: DictionaryRow[] = [
  { dictId: 1, name: 'A', wordCount: 3, enabled: true, sortOrder: 0 },
];

describe('useDictionaryManager', () => {
  it('loads dictionaries from the service', () => {
    const { result } = renderHook(() => useDictionaryManager(fakeService(ROWS)));
    expect(result.current.dictionaries.map((d) => d.name)).toEqual(['A']);
  });

  it('toggles enabled and refreshes', () => {
    const { result } = renderHook(() => useDictionaryManager(fakeService(ROWS)));
    act(() => result.current.toggle(1, false));
    expect(result.current.dictionaries[0].enabled).toBe(false);
  });

  it('removes a dictionary', () => {
    const { result } = renderHook(() => useDictionaryManager(fakeService(ROWS)));
    act(() => result.current.remove(1));
    expect(result.current.dictionaries).toEqual([]);
  });

  it('imports a zip and refreshes the list', async () => {
    const { result } = renderHook(() => useDictionaryManager(fakeService(ROWS)));
    await act(async () => {
      await result.current.importZip(new Uint8Array());
    });
    expect(result.current.dictionaries.map((d) => d.name)).toEqual(['A', 'New']);
  });

  it('marks importing before the synchronous import runs (so the modal can paint)', async () => {
    const { result } = renderHook(() => useDictionaryManager(fakeService(ROWS)));
    let pending!: Promise<void>;
    act(() => {
      // The yield (setTimeout 0) inside importZip is still pending here, so
      // `importing` must already be true for the progress modal to be visible.
      pending = result.current.importZip(new Uint8Array());
    });
    expect(result.current.importing).toBe(true);
    await act(async () => {
      await pending;
    });
    expect(result.current.importing).toBe(false);
    expect(result.current.dictionaries.map((d) => d.name)).toEqual(['A', 'New']);
  });

  it('renames a dictionary and refreshes', () => {
    const { result } = renderHook(() => useDictionaryManager(fakeService(ROWS)));
    act(() => result.current.rename(1, 'Renamed'));
    expect(result.current.dictionaries[0].name).toBe('Renamed');
  });
});
