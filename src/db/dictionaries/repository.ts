import type { Database } from '../Database';

export interface DictionaryRow {
  dictId: number;
  name: string;
  wordCount: number;
  enabled: boolean;
  sortOrder: number;
}

export function listDictionaries(db: Database): DictionaryRow[] {
  const { rows } = db.execute(
    `SELECT dictId, name, word_count, enabled, sort_order
       FROM dictionaries
       ORDER BY sort_order, dictId`,
  );
  return rows.map((r) => ({
    dictId: r.dictId as number,
    name: r.name as string,
    wordCount: r.word_count as number,
    enabled: (r.enabled as number) === 1,
    sortOrder: r.sort_order as number,
  }));
}

export function setDictionaryEnabled(
  db: Database,
  dictId: number,
  enabled: boolean,
): void {
  db.execute('UPDATE dictionaries SET enabled = ? WHERE dictId = ?', [
    enabled ? 1 : 0,
    dictId,
  ]);
}

export function reorderDictionaries(db: Database, orderedIds: number[]): void {
  db.transaction(() => {
    orderedIds.forEach((dictId, index) => {
      db.execute('UPDATE dictionaries SET sort_order = ? WHERE dictId = ?', [
        index,
        dictId,
      ]);
    });
  });
}

export function deleteDictionary(db: Database, dictId: number): void {
  db.execute('DELETE FROM dictionaries WHERE dictId = ?', [dictId]);
}

export function renameDictionary(
  db: Database,
  dictId: number,
  name: string,
): void {
  db.execute('UPDATE dictionaries SET name = ? WHERE dictId = ?', [
    name,
    dictId,
  ]);
}
