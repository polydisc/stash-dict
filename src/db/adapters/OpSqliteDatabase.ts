import { open, type DB } from '@op-engineering/op-sqlite';
import type { Database, QueryResult } from '../Database';

/**
 * Runtime adapter backed by op-sqlite (JSI). Device-only; see ADR 0002.
 *
 * NOTE: op-sqlite's DB.execute() is async (Promise<QueryResult>). We use
 * DB.executeSync() here to satisfy the synchronous Database interface contract.
 * Both methods return the same QueryResult shape with a .rows array.
 */
export class OpSqliteDatabase implements Database {
  private readonly db: DB;

  constructor(name: string) {
    this.db = open({ name });
  }

  execute(sql: string, params: unknown[] = []): QueryResult {
    const result = this.db.executeSync(sql, params as never[]);
    return { rows: (result.rows ?? []) as Record<string, unknown>[] };
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
