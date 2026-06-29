import { BetterSqliteDatabase } from '../../adapters/BetterSqliteDatabase';
import { initDatabase } from '../../init';
import { importDictionary } from '../importDictionary';
import type { DictionaryFiles } from '../../../parser';

const ascii = (s: string): number[] => Array.from(s).map((c) => c.charCodeAt(0));

function idxRecord(word: string, offset: number, size: number): number[] {
  return [
    ...ascii(word), 0,
    (offset >>> 24) & 0xff, (offset >>> 16) & 0xff, (offset >>> 8) & 0xff, offset & 0xff,
    (size >>> 24) & 0xff, (size >>> 16) & 0xff, (size >>> 8) & 0xff, size & 0xff,
  ];
}
function synRecord(word: string, target: number): number[] {
  return [
    ...ascii(word), 0,
    (target >>> 24) & 0xff, (target >>> 16) & 0xff, (target >>> 8) & 0xff, target & 0xff,
  ];
}

// A 2-entry dictionary with one synonym. dict="applefruit": apple[0,5) fruit[5,5).
function miniFiles(): DictionaryFiles {
  const ifo = Uint8Array.from(
    ascii(
      ["StarDict's dict ifo file", 'bookname=Mini', 'wordcount=2', 'synwordcount=1', 'sametypesequence=m'].join('\n'),
    ),
  );
  return {
    ifo,
    idx: Uint8Array.from([...idxRecord('apple', 0, 5), ...idxRecord('fruit', 5, 5)]),
    dict: Uint8Array.from(ascii('applefruit')),
    syn: Uint8Array.from([...synRecord('pomme', 0)]),
  };
}

function freshDb(): BetterSqliteDatabase {
  const db = new BetterSqliteDatabase();
  initDatabase(db);
  return db;
}

describe('importDictionary', () => {
  it('stores the dictionary, entries, and synonyms', () => {
    const db = freshDb();
    const result = importDictionary(db, miniFiles());
    expect(result.entryCount).toBe(2);
    expect(result.synonymCount).toBe(1);

    const dict = db.execute('SELECT name, word_count, enabled, sort_order FROM dictionaries WHERE dictId = ?', [result.dictId]).rows[0];
    expect(dict).toEqual({ name: 'Mini', word_count: 2, enabled: 1, sort_order: 0 });

    const entries = db.execute('SELECT headword, folded_headword, article, article_type, seq FROM entries ORDER BY seq').rows;
    expect(entries).toEqual([
      { headword: 'apple', folded_headword: 'apple', article: 'apple', article_type: 'm', seq: 0 },
      { headword: 'fruit', folded_headword: 'fruit', article: 'fruit', article_type: 'm', seq: 1 },
    ]);

    const syn = db.execute('SELECT synonym_headword, folded_headword, target_seq FROM synonyms').rows[0];
    expect(syn).toEqual({ synonym_headword: 'pomme', folded_headword: 'pomme', target_seq: 0 });
    db.close();
  });

  it('assigns increasing sort_order across imports', () => {
    const db = freshDb();
    const a = importDictionary(db, miniFiles());
    const b = importDictionary(db, miniFiles());
    const orderA = db.execute('SELECT sort_order FROM dictionaries WHERE dictId = ?', [a.dictId]).rows[0].sort_order;
    const orderB = db.execute('SELECT sort_order FROM dictionaries WHERE dictId = ?', [b.dictId]).rows[0].sort_order;
    expect(orderA).toBe(0);
    expect(orderB).toBe(1);
    db.close();
  });

  it('reports progress for entries', () => {
    const db = freshDb();
    const phases: string[] = [];
    importDictionary(db, miniFiles(), {
      chunkSize: 1,
      onProgress: (p) => phases.push(`${p.phase}:${p.done}/${p.total}`),
    });
    expect(phases).toContain('entries:2/2');
    db.close();
  });

  it('rolls back completely when cancelled mid-import', () => {
    const db = freshDb();
    const signal = { aborted: false };
    expect(() =>
      importDictionary(db, miniFiles(), {
        chunkSize: 1,
        signal,
        onProgress: () => {
          signal.aborted = true; // cancel after the first chunk
        },
      }),
    ).toThrow(/cancel/i);
    expect(db.execute('SELECT COUNT(*) AS n FROM dictionaries').rows[0].n).toBe(0);
    expect(db.execute('SELECT COUNT(*) AS n FROM entries').rows[0].n).toBe(0);
    db.close();
  });

  it('rolls back when cancelled during the synonyms phase (post-synonyms check)', () => {
    // With chunkSize=1000 and 2 entries + 1 synonym, no in-loop checkCancel fires.
    // signal.aborted read count:
    //   read #1 — post-entries checkCancel  → false (passes)
    //   read #2 — post-synonyms checkCancel → true  (throws, triggering rollback)
    const db = freshDb();
    let reads = 0;
    const signal = { get aborted() { reads += 1; return reads > 1; } };
    expect(() => importDictionary(db, miniFiles(), { chunkSize: 1000, signal })).toThrow(/cancel/i);
    expect(db.execute('SELECT COUNT(*) AS n FROM dictionaries').rows[0].n).toBe(0);
    expect(db.execute('SELECT COUNT(*) AS n FROM synonyms').rows[0].n).toBe(0);
    db.close();
  });
});
