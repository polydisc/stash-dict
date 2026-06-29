import type { Database } from '../Database';
import { foldHeadword } from '../../folding/foldHeadword';

export function recordOpened(db: Database, headword: string, at: number): void {
  const folded = foldHeadword(headword);
  if (folded === '') return;
  db.execute(
    `INSERT INTO history (folded_headword, headword, opened_at)
     VALUES (?, ?, ?)
     ON CONFLICT(folded_headword)
     DO UPDATE SET headword = excluded.headword, opened_at = excluded.opened_at`,
    [folded, headword, at],
  );
}

export function listHistory(
  db: Database,
  limit = 200,
): { headword: string; openedAt: number }[] {
  const { rows } = db.execute(
    'SELECT headword, opened_at FROM history ORDER BY opened_at DESC LIMIT ?',
    [limit],
  );
  return rows.map((r) => ({
    headword: r.headword as string,
    openedAt: r.opened_at as number,
  }));
}

export function isFavorite(db: Database, headword: string): boolean {
  const folded = foldHeadword(headword);
  const { rows } = db.execute(
    'SELECT 1 AS hit FROM favorites WHERE folded_headword = ?',
    [folded],
  );
  return rows.length > 0;
}

export function toggleFavorite(db: Database, headword: string, at: number): boolean {
  const folded = foldHeadword(headword);
  if (isFavorite(db, headword)) {
    db.execute('DELETE FROM favorites WHERE folded_headword = ?', [folded]);
    return false;
  }
  db.execute(
    'INSERT INTO favorites (folded_headword, headword, created_at) VALUES (?, ?, ?)',
    [folded, headword, at],
  );
  return true;
}

export function listFavorites(
  db: Database,
  limit = 500,
): { headword: string; createdAt: number }[] {
  const { rows } = db.execute(
    'SELECT headword, created_at FROM favorites ORDER BY created_at DESC LIMIT ?',
    [limit],
  );
  return rows.map((r) => ({
    headword: r.headword as string,
    createdAt: r.created_at as number,
  }));
}

export function clearHistory(db: Database): void {
  db.execute('DELETE FROM history');
}

export function removeFavorite(db: Database, headword: string): void {
  db.execute('DELETE FROM favorites WHERE folded_headword = ?', [foldHeadword(headword)]);
}
