import { BetterSqliteDatabase } from '../../adapters/BetterSqliteDatabase';
import { initDatabase } from '../../init';
import { searchHeadwords } from '../searchHeadwords';

function addDict(db: BetterSqliteDatabase, name: string, enabled = 1, order = 0): number {
  db.execute(
    'INSERT INTO dictionaries (name, word_count, enabled, sort_order) VALUES (?,?,?,?)',
    [name, 0, enabled, order],
  );
  return db.execute('SELECT last_insert_rowid() AS id').rows[0].id as number;
}
function addEntry(db: BetterSqliteDatabase, dictId: number, headword: string, folded: string, seq: number) {
  db.execute(
    'INSERT INTO entries (dictId, headword, folded_headword, article, article_type, seq) VALUES (?,?,?,?,?,?)',
    [dictId, headword, folded, 'body', 'm', seq],
  );
}
function addSyn(db: BetterSqliteDatabase, dictId: number, syn: string, folded: string, targetSeq: number) {
  db.execute(
    'INSERT INTO synonyms (dictId, synonym_headword, folded_headword, target_seq) VALUES (?,?,?,?)',
    [dictId, syn, folded, targetSeq],
  );
}
function fresh(): BetterSqliteDatabase {
  const db = new BetterSqliteDatabase();
  initDatabase(db);
  return db;
}

describe('searchHeadwords', () => {
  it('returns prefix matches ordered exact-first then ascending', () => {
    const db = fresh();
    const d = addDict(db, 'D');
    addEntry(db, d, 'Apple', 'apple', 0);
    addEntry(db, d, 'Apricot', 'apricot', 1);
    addEntry(db, d, 'Banana', 'banana', 2);
    const hits = searchHeadwords(db, 'ap');
    expect(hits.map((h) => h.folded)).toEqual(['apple', 'apricot']);
    db.close();
  });

  it('puts an exact folded match first', () => {
    const db = fresh();
    const d = addDict(db, 'D');
    addEntry(db, d, 'Apple', 'apple', 0);
    addEntry(db, d, 'Applesauce', 'applesauce', 1);
    const hits = searchHeadwords(db, 'apple');
    expect(hits[0].folded).toBe('apple');
    db.close();
  });

  it('collapses the same headword across dictionaries to one hit', () => {
    const db = fresh();
    const a = addDict(db, 'A', 1, 0);
    const b = addDict(db, 'B', 1, 1);
    addEntry(db, a, 'apple', 'apple', 0);
    addEntry(db, b, 'apple', 'apple', 0);
    const hits = searchHeadwords(db, 'apple');
    expect(hits).toHaveLength(1);
    expect(hits[0].folded).toBe('apple');
    db.close();
  });

  it('includes synonym matches', () => {
    const db = fresh();
    const d = addDict(db, 'D');
    addEntry(db, d, 'color', 'color', 0);
    addSyn(db, d, 'colour', 'colour', 0);
    expect(searchHeadwords(db, 'colou').map((h) => h.headword)).toContain('colour');
    db.close();
  });

  it('excludes disabled dictionaries', () => {
    const db = fresh();
    const off = addDict(db, 'Off', 0, 0);
    addEntry(db, off, 'apple', 'apple', 0);
    expect(searchHeadwords(db, 'app')).toEqual([]);
    db.close();
  });

  it('returns nothing for an empty query', () => {
    const db = fresh();
    addEntry(db, addDict(db, 'D'), 'apple', 'apple', 0);
    expect(searchHeadwords(db, '')).toEqual([]);
    db.close();
  });

  it('applies limit and offset', () => {
    const db = fresh();
    const d = addDict(db, 'D');
    ['aa', 'ab', 'ac', 'ad'].forEach((w, i) => addEntry(db, d, w, w, i));
    expect(searchHeadwords(db, 'a', { limit: 2 }).map((h) => h.folded)).toEqual(['aa', 'ab']);
    expect(searchHeadwords(db, 'a', { limit: 2, offset: 2 }).map((h) => h.folded)).toEqual(['ac', 'ad']);
    db.close();
  });

  it('reports dictNames and a definition preview', () => {
    const db = fresh();
    const a = addDict(db, 'A', 1, 0);
    const b = addDict(db, 'B', 1, 1);
    addEntry(db, a, 'apple', 'apple', 0);
    addEntry(db, b, 'apple', 'apple', 0);
    const hits = searchHeadwords(db, 'apple');
    expect(hits[0].dictNames).toHaveLength(2);
    expect(hits[0].preview).toBe('body');
    db.close();
  });

  it('does not count or break preview on an unresolved synonym', () => {
    const db = fresh();
    const a = addDict(db, 'A', 1, 0);
    const b = addDict(db, 'B', 1, 1);
    addEntry(db, a, 'apple', 'apple', 0); // article 'body', type 'm'
    addSyn(db, b, 'apple', 'apple', 99);  // target_seq 99 has no matching entry
    const hits = searchHeadwords(db, 'apple');
    expect(hits).toHaveLength(1);
    expect(hits[0].dictNames).toHaveLength(1); // unresolved syn in B not counted
    expect(hits[0].preview).toBe('body');       // preview from the real entry, not empty
    db.close();
  });

  it('returns the source dictionary names per headword', () => {
    const db = fresh();
    const a = addDict(db, 'Alpha', 1, 0);
    const b = addDict(db, 'Beta', 1, 1);
    addEntry(db, a, 'apple', 'apple', 0);
    addEntry(db, b, 'apple', 'apple', 0);
    const hit = searchHeadwords(db, 'apple')[0];
    expect(hit.dictNames).toEqual(['Alpha', 'Beta']);
    db.close();
  });

  it('restricts results to the given dictIds filter', () => {
    const db = fresh();
    const a = addDict(db, 'Alpha', 1, 0);
    const b = addDict(db, 'Beta', 1, 1);
    addEntry(db, a, 'apple', 'apple', 0);
    addEntry(db, b, 'apple', 'apple', 0);
    const hit = searchHeadwords(db, 'apple', { dictIds: [a] })[0];
    expect(hit.dictNames).toEqual(['Alpha']);
    db.close();
  });

  it('an empty dictIds filter means all enabled', () => {
    const db = fresh();
    const a = addDict(db, 'Alpha', 1, 0);
    addEntry(db, a, 'apple', 'apple', 0);
    expect(searchHeadwords(db, 'apple', { dictIds: [] })).toHaveLength(1);
    db.close();
  });
});
