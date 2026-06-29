import { OpSqliteDatabase } from './adapters/OpSqliteDatabase';
import { initDatabase } from './init';
import type { Database } from './Database';

const APP_DB_NAME = 'dictionary.sqlite';

let instance: Database | null = null;

/**
 * Returns the app database, opening and initializing it once. Subsequent calls
 * return the same connection so every screen/tab shares one handle (no
 * duplicate op-sqlite connections to the same file, no per-screen leak).
 */
export function openAppDatabase(): Database {
  if (instance) return instance;
  const db = new OpSqliteDatabase(APP_DB_NAME);
  try {
    initDatabase(db);
  } catch (err) {
    db.close();
    throw err;
  }
  instance = db;
  return instance;
}
