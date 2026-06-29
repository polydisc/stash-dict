import type { Database } from '../../db/Database';
import { searchHeadwords } from '../../db/search/searchHeadwords';
import { getEntriesForHeadword, type DictionarySection } from '../../db/search/getEntriesForHeadword';
import { recordOpened, isFavorite, toggleFavorite } from '../../db/userdata/repository';
import type { SearchService } from './useSearch';

export type DetailLoader = (folded: string, dictIds?: number[]) => DictionarySection[];

export interface UserDataService {
  recordOpened(headword: string): void;
  isFavorite(headword: string): boolean;
  toggleFavorite(headword: string): boolean;
}

export function createSearchService(db: Database): SearchService {
  return { search: (query: string, dictIds?: number[]) => searchHeadwords(db, query, { dictIds }) };
}

export function createDetailLoader(db: Database): DetailLoader {
  return (folded: string, dictIds?: number[]) => getEntriesForHeadword(db, folded, dictIds);
}

export function createUserDataService(
  db: Database,
  now: () => number = Date.now,
): UserDataService {
  return {
    recordOpened: (headword: string) => recordOpened(db, headword, now()),
    isFavorite: (headword: string) => isFavorite(db, headword),
    toggleFavorite: (headword: string) => toggleFavorite(db, headword, now()),
  };
}
