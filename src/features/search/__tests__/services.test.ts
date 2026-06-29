import { BetterSqliteDatabase } from '../../../db/adapters/BetterSqliteDatabase';
import { initDatabase } from '../../../db/init';
import { listHistory, listFavorites } from '../../../db/userdata/repository';
import { createSearchService, createDetailLoader, createUserDataService } from '../services';

function fresh(): BetterSqliteDatabase {
  const db = new BetterSqliteDatabase();
  initDatabase(db);
  db.execute('INSERT INTO dictionaries (name, word_count, enabled, sort_order) VALUES (?,0,1,0)', ['D']);
  const id = db.execute('SELECT last_insert_rowid() AS id').rows[0].id as number;
  db.execute('INSERT INTO entries (dictId, headword, folded_headword, article, article_type, seq) VALUES (?,?,?,?,?,?)', [id, 'Apple', 'apple', 'a fruit', 'm', 0]);
  return db;
}

describe('services', () => {
  it('createSearchService searches headwords', () => {
    const db = fresh();
    expect(createSearchService(db).search('app').map((h) => h.folded)).toEqual(['apple']);
    db.close();
  });

  it('createSearchService forwards dictIds filter', () => {
    const db = fresh();
    initDatabase(db);
    db.execute('INSERT INTO dictionaries (name, word_count, enabled, sort_order) VALUES (?,0,1,1)', ['E']);
    const id2 = db.execute('SELECT last_insert_rowid() AS id').rows[0].id as number;
    db.execute('INSERT INTO entries (dictId, headword, folded_headword, article, article_type, seq) VALUES (?,?,?,?,?,?)', [id2, 'Application', 'application', 'a program', 'm', 0]);
    const id1 = db.execute("SELECT dictId FROM dictionaries WHERE name='D'").rows[0].dictId as number;
    const results = createSearchService(db).search('app', [id1]);
    expect(results.map((h) => h.folded)).toEqual(['apple']);
    expect(results[0].dictNames).toContain('D');
    db.close();
  });

  it('createDetailLoader loads grouped sections', () => {
    const db = fresh();
    const sections = createDetailLoader(db)('apple');
    expect(sections[0].entries[0].article).toBe('a fruit');
    db.close();
  });

  it('createUserDataService records history with the injected clock', () => {
    const db = fresh();
    const svc = createUserDataService(db, () => 12345);
    svc.recordOpened('Apple');
    expect(listHistory(db)[0]).toEqual({ headword: 'Apple', openedAt: 12345 });
    db.close();
  });

  it('createUserDataService toggles favorites', () => {
    const db = fresh();
    const svc = createUserDataService(db, () => 999);
    expect(svc.toggleFavorite('Apple')).toBe(true);
    expect(svc.isFavorite('apple')).toBe(true);
    expect(listFavorites(db)[0].headword).toBe('Apple');
    db.close();
  });
});
