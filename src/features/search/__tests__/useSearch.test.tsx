import { renderHook, act } from '@testing-library/react-native';
import { useSearch } from '../useSearch';
import type { SearchHit } from '../../../db/search/searchHeadwords';

const HITS: SearchHit[] = [{ folded: 'apple', headword: 'Apple', dictNames: [], preview: '' }];

function fakeService(calls: string[]) {
  return {
    search: (q: string, dictIds?: number[]): SearchHit[] => {
      calls.push(q);
      return q.startsWith('ap') ? HITS : [];
    },
  };
}

describe('useSearch', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('debounces queries and returns results', () => {
    const calls: string[] = [];
    const { result } = renderHook(() => useSearch(fakeService(calls), { debounceMs: 150 }));
    act(() => result.current.setQuery('a'));
    act(() => result.current.setQuery('ap'));
    expect(calls).toEqual([]); // not yet (debounced)
    act(() => jest.advanceTimersByTime(150));
    expect(calls).toEqual(['ap']); // only the latest
    expect(result.current.results).toEqual(HITS);
  });

  it('clears results immediately for an empty query', () => {
    const calls: string[] = [];
    const { result } = renderHook(() => useSearch(fakeService(calls), { debounceMs: 150 }));
    act(() => result.current.setQuery('ap'));
    act(() => jest.advanceTimersByTime(150));
    act(() => result.current.setQuery(''));
    expect(result.current.results).toEqual([]);
  });

  it('re-runs the current query when dictIds change', () => {
    jest.useFakeTimers();
    const search = jest.fn((q: string, dictIds?: number[]) =>
      q ? [{ folded: q, headword: q, dictNames: [], preview: String(dictIds ?? []) }] : [],
    );
    const { result, rerender } = renderHook<
      { query: string; setQuery(q: string): void; results: SearchHit[] },
      { dictIds: number[] }
    >(({ dictIds }) => useSearch({ search }, { dictIds }), {
      initialProps: { dictIds: [1] as number[] },
    });
    act(() => result.current.setQuery('ap'));
    act(() => jest.advanceTimersByTime(150));
    expect(search).toHaveBeenLastCalledWith('ap', [1]);
    rerender({ dictIds: [2] });
    act(() => jest.advanceTimersByTime(150));
    expect(search).toHaveBeenLastCalledWith('ap', [2]);
    jest.useRealTimers();
  });
});
