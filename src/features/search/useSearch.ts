import { useCallback, useEffect, useRef, useState } from 'react';
import type { SearchHit } from '../../db/search/searchHeadwords';

export interface SearchService {
  search(query: string, dictIds?: number[]): SearchHit[];
}

export function useSearch(
  service: SearchService,
  opts: { debounceMs?: number; dictIds?: number[] } = {},
): { query: string; setQuery(q: string): void; results: SearchHit[] } {
  const debounceMs = opts.debounceMs ?? 150;
  const dictIds = opts.dictIds;
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchHit[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryRef = useRef('');

  const run = useCallback(
    (q: string) => {
      if (q.trim() === '') {
        setResults([]);
        return;
      }
      setResults(service.search(q, dictIds));
    },
    [service, dictIds],
  );

  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q);
      queryRef.current = q;
      if (timer.current) clearTimeout(timer.current);
      if (q.trim() === '') {
        setResults([]);
        return;
      }
      timer.current = setTimeout(() => run(q), debounceMs);
    },
    [run, debounceMs],
  );

  // Re-run the current query when the dictionary filter changes.
  useEffect(() => {
    if (queryRef.current.trim() === '') return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => run(queryRef.current), debounceMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictIds]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return { query, setQuery, results };
}
