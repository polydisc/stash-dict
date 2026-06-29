import { BetterSqliteDatabase } from '../../adapters/BetterSqliteDatabase';
import { initDatabase } from '../../init';
import {
  recordOpened,
  listHistory,
  isFavorite,
  toggleFavorite,
  listFavorites,
  clearHistory,
  removeFavorite,
} from '../repository';

function fresh(): BetterSqliteDatabase {
  const db = new BetterSqliteDatabase();
  initDatabase(db);
  return db;
}

describe('history', () => {
  it('records opened headwords newest-first, collapsing repeats', () => {
    const db = fresh();
    recordOpened(db, 'Apple', 1000);
    recordOpened(db, 'Banana', 2000);
    recordOpened(db, 'apple', 3000); // same folded key, newer
    const hist = listHistory(db);
    expect(hist.map((h) => h.headword)).toEqual(['apple', 'Banana']);
    expect(hist[0].openedAt).toBe(3000);
    db.close();
  });

  it('limits history', () => {
    const db = fresh();
    recordOpened(db, 'a', 1);
    recordOpened(db, 'b', 2);
    expect(listHistory(db, 1).map((h) => h.headword)).toEqual(['b']);
    db.close();
  });
});

describe('favorites', () => {
  it('toggles a favorite on and off by folded headword', () => {
    const db = fresh();
    expect(isFavorite(db, 'Apple')).toBe(false);
    expect(toggleFavorite(db, 'Apple', 1000)).toBe(true);
    expect(isFavorite(db, 'apple')).toBe(true); // same folded key
    expect(toggleFavorite(db, 'apple', 2000)).toBe(false);
    expect(isFavorite(db, 'Apple')).toBe(false);
    db.close();
  });

  it('lists favorites newest-first', () => {
    const db = fresh();
    toggleFavorite(db, 'a', 1000);
    toggleFavorite(db, 'b', 2000);
    expect(listFavorites(db).map((f) => f.headword)).toEqual(['b', 'a']);
    db.close();
  });

  it('limits favorites via the limit param', () => {
    const db = fresh();
    toggleFavorite(db, 'a', 1000);
    toggleFavorite(db, 'b', 2000);
    toggleFavorite(db, 'c', 3000);
    expect(listFavorites(db, 2).map((f) => f.headword)).toEqual(['c', 'b']);
    db.close();
  });
});

describe('clearHistory / removeFavorite', () => {
  it('clears all history', () => {
    const db = fresh();
    recordOpened(db, 'a', 1);
    recordOpened(db, 'b', 2);
    clearHistory(db);
    expect(listHistory(db)).toEqual([]);
    db.close();
  });

  it('removes a favorite by folded headword (idempotent)', () => {
    const db = fresh();
    toggleFavorite(db, 'Apple', 1);
    removeFavorite(db, 'apple');
    expect(isFavorite(db, 'Apple')).toBe(false);
    expect(() => removeFavorite(db, 'apple')).not.toThrow();
    db.close();
  });
});
