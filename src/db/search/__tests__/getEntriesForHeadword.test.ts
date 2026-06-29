import { BetterSqliteDatabase } from '../../adapters/BetterSqliteDatabase';
import { initDatabase } from '../../init';
import { getEntriesForHeadword } from '../getEntriesForHeadword';

function addDict(db: BetterSqliteDatabase, name: string, order: number, enabled = 1): number {
  db.execute('INSERT INTO dictionaries (name, word_count, enabled, sort_order) VALUES (?,0,?,?)', [name, enabled, order]);
  return db.execute('SELECT last_insert_rowid() AS id').rows[0].id as number;
}
function addEntry(db: BetterSqliteDatabase, dictId: number, headword: string, folded: string, article: string, type: string, seq: number) {
  db.execute('INSERT INTO entries (dictId, headword, folded_headword, article, article_type, seq) VALUES (?,?,?,?,?,?)', [dictId, headword, folded, article, type, seq]);
}
function fresh(): BetterSqliteDatabase {
  const db = new BetterSqliteDatabase();
  initDatabase(db);
  return db;
}

describe('getEntriesForHeadword', () => {
  it('groups direct matches by dictionary in sort_order', () => {
    const db = fresh();
    const a = addDict(db, 'A-dict', 0);
    const b = addDict(db, 'B-dict', 1);
    addEntry(db, b, 'apple', 'apple', 'B body', 'm', 0);
    addEntry(db, a, 'apple', 'apple', 'A body', 'h', 0);
    const sections = getEntriesForHeadword(db, 'apple');
    expect(sections.map((s) => s.dictName)).toEqual(['A-dict', 'B-dict']);
    expect(sections[0].entries[0]).toEqual({ headword: 'apple', article: 'A body', articleType: 'h' });
    db.close();
  });

  it('includes multiple entries within one dictionary ordered by seq', () => {
    const db = fresh();
    const a = addDict(db, 'A', 0);
    addEntry(db, a, 'apple', 'apple', 'second', 'm', 1);
    addEntry(db, a, 'apple', 'apple', 'first', 'm', 0);
    const sections = getEntriesForHeadword(db, 'apple');
    expect(sections[0].entries.map((e) => e.article)).toEqual(['first', 'second']);
    db.close();
  });

  it('resolves a synonym to its target entry', () => {
    const db = fresh();
    const a = addDict(db, 'A', 0);
    addEntry(db, a, 'color', 'color', 'the color body', 'm', 3);
    db.execute('INSERT INTO synonyms (dictId, synonym_headword, folded_headword, target_seq) VALUES (?,?,?,?)', [a, 'colour', 'colour', 3]);
    const sections = getEntriesForHeadword(db, 'colour');
    expect(sections).toHaveLength(1);
    expect(sections[0].entries[0].article).toBe('the color body');
    db.close();
  });

  it('excludes disabled dictionaries', () => {
    const db = fresh();
    const off = addDict(db, 'Off', 0, 0);
    addEntry(db, off, 'apple', 'apple', 'x', 'm', 0);
    expect(getEntriesForHeadword(db, 'apple')).toEqual([]);
    db.close();
  });

  it('restricts sections to the given dictIds', () => {
    const db = fresh();
    const a = addDict(db, 'A', 0);
    const b = addDict(db, 'B', 1);
    addEntry(db, a, 'apple', 'apple', 'from A', 'm', 0);
    addEntry(db, b, 'apple', 'apple', 'from B', 'm', 0);
    const sections = getEntriesForHeadword(db, 'apple', [a]);
    expect(sections.map((s) => s.dictId)).toEqual([a]);
    db.close();
  });
});
