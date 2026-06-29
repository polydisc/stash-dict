import type { Database } from '../Database';
import { insertEntrySql, insertEntryParams } from '../queries';
import { foldHeadword } from '../../folding/foldHeadword';
import { StarDictParser } from '../../parser';
import type { DictionaryFiles } from '../../parser';

export interface ImportProgress {
  phase: 'entries' | 'synonyms';
  done: number;
  total: number;
}

export interface AbortSignalLike {
  aborted: boolean;
}

export interface ImportOptions {
  onProgress?: (p: ImportProgress) => void;
  signal?: AbortSignalLike;
  chunkSize?: number;
}

export interface ImportResult {
  dictId: number;
  entryCount: number;
  synonymCount: number;
}

const SYNONYM_SQL = `INSERT INTO synonyms (dictId, synonym_headword, folded_headword, target_seq)
                     VALUES (?, ?, ?, ?)`;

/**
 * Imports a single StarDict dictionary into the database.
 *
 * **Transaction contract:** this function opens its own `BEGIN` transaction
 * via `db.transaction(...)`. It MUST NOT be called while another transaction
 * is already open on the same `Database` connection (SQLite does not support
 * nested transactions). Only one import should run at a time per connection —
 * phase 3b must serialize concurrent import calls (e.g., via a queue).
 */
export function importDictionary(
  db: Database,
  files: DictionaryFiles,
  opts: ImportOptions = {},
): ImportResult {
  const { onProgress, signal, chunkSize = 1000 } = opts;
  const parsed = new StarDictParser().parse(files);

  let dictId = 0;
  let entryCount = 0;
  let synonymCount = 0;

  const checkCancel = (): void => {
    if (signal?.aborted) {
      throw new Error('Import cancelled');
    }
  };

  db.transaction(() => {
    const nextOrder = db.execute(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM dictionaries',
    ).rows[0].next as number;

    db.execute(
      'INSERT INTO dictionaries (name, word_count, enabled, sort_order) VALUES (?, 0, 1, ?)',
      [parsed.metadata.name, nextOrder],
    );
    dictId = db.execute('SELECT last_insert_rowid() AS id').rows[0].id as number;

    const entryTotal = parsed.metadata.wordCount;
    const sql = insertEntrySql();
    for (const entry of parsed.entries()) {
      db.execute(
        sql,
        insertEntryParams({
          dictId,
          headword: entry.headword,
          article: entry.article,
          articleType: entry.articleType,
          seq: entry.seq,
        }),
      );
      entryCount++;
      if (entryCount % chunkSize === 0) {
        onProgress?.({ phase: 'entries', done: entryCount, total: entryTotal });
        checkCancel();
      }
    }
    onProgress?.({ phase: 'entries', done: entryCount, total: Math.max(entryTotal, entryCount) });
    checkCancel();

    const synTotal = parsed.metadata.synWordCount;
    for (const syn of parsed.synonyms()) {
      db.execute(SYNONYM_SQL, [
        dictId,
        syn.synonym,
        foldHeadword(syn.synonym),
        syn.targetSeq,
      ]);
      synonymCount++;
      if (synonymCount % chunkSize === 0) {
        onProgress?.({ phase: 'synonyms', done: synonymCount, total: synTotal });
        checkCancel();
      }
    }
    checkCancel();

    db.execute('UPDATE dictionaries SET word_count = ? WHERE dictId = ?', [
      entryCount,
      dictId,
    ]);
  });

  return { dictId, entryCount, synonymCount };
}
