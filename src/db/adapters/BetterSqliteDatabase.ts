import BetterSqlite3 from 'better-sqlite3';
import type { Database, QueryResult } from '../Database';

/**
 * Node/test adapter. NOT for runtime — better-sqlite3 is a devDependency and
 * must never be imported by app code (it would break the RN bundle).
 */
export class BetterSqliteDatabase implements Database {
  private readonly db: BetterSqlite3.Database;

  constructor(filename = ':memory:') {
    this.db = new BetterSqlite3(filename);
  }

  execute(sql: string, params: unknown[] = []): QueryResult {
    const stmt = this.db.prepare(sql);
    if (stmt.reader) {
      return { rows: stmt.all(...params) as Record<string, unknown>[] };
    }
    stmt.run(...params);
    return { rows: [] };
  }

  transaction(fn: () => void): void {
    this.execute('BEGIN');
    try {
      fn();
      this.execute('COMMIT');
    } catch (err) {
      this.execute('ROLLBACK');
      throw err;
    }
  }

  close(): void {
    this.db.close();
  }
}
