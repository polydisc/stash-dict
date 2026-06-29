import { BetterSqliteDatabase } from '../../adapters/BetterSqliteDatabase';
import { initDatabase } from '../../init';
import {
  listDictionaries,
  setDictionaryEnabled,
  reorderDictionaries,
  deleteDictionary,
  renameDictionary,
} from '../repository';

function seed(db: BetterSqliteDatabase, name: string, order: number): number {
  db.execute(
    'INSERT INTO dictionaries (name, word_count, enabled, sort_order) VALUES (?, ?, 1, ?)',
    [name, 5, order],
  );
  return db.execute('SELECT last_insert_rowid() AS id').rows[0].id as number;
}

function freshDb(): BetterSqliteDatabase {
  const db = new BetterSqliteDatabase();
  initDatabase(db);
  return db;
}

describe('dictionary repository', () => {
  it('lists dictionaries ordered by sort_order with mapped fields', () => {
    const db = freshDb();
    seed(db, 'B', 1);
    seed(db, 'A', 0);
    const list = listDictionaries(db);
    expect(list.map((d) => d.name)).toEqual(['A', 'B']);
    expect(list[0]).toEqual({
      dictId: expect.any(Number),
      name: 'A',
      wordCount: 5,
      enabled: true,
      sortOrder: 0,
    });
    db.close();
  });

  it('toggles enabled as a boolean', () => {
    const db = freshDb();
    const id = seed(db, 'A', 0);
    setDictionaryEnabled(db, id, false);
    expect(listDictionaries(db)[0].enabled).toBe(false);
    setDictionaryEnabled(db, id, true);
    expect(listDictionaries(db)[0].enabled).toBe(true);
    db.close();
  });

  it('reorders by assigning sort_order in the given order', () => {
    const db = freshDb();
    const a = seed(db, 'A', 0);
    const b = seed(db, 'B', 1);
    const c = seed(db, 'C', 2);
    reorderDictionaries(db, [c, a, b]);
    expect(listDictionaries(db).map((d) => d.name)).toEqual(['C', 'A', 'B']);
    db.close();
  });

  it('deletes a dictionary and cascades its entries', () => {
    const db = freshDb();
    const id = seed(db, 'A', 0);
    db.execute(
      'INSERT INTO entries (dictId, headword, folded_headword, article, seq) VALUES (?,?,?,?,?)',
      [id, 'x', 'x', 'a', 0],
    );
    deleteDictionary(db, id);
    expect(listDictionaries(db)).toEqual([]);
    expect(db.execute('SELECT COUNT(*) AS n FROM entries').rows[0].n).toBe(0);
    db.close();
  });

  it('renames a dictionary', () => {
    const db = freshDb();
    const id = seed(db, 'Old Name', 0);
    renameDictionary(db, id, 'New Name');
    expect(listDictionaries(db)[0].name).toBe('New Name');
    db.close();
  });
});
