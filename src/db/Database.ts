export interface QueryResult {
  rows: Record<string, unknown>[];
}

/**
 * Minimal synchronous SQLite access. Implemented by BetterSqliteDatabase
 * (tests) and OpSqliteDatabase (runtime). See ADR 0002.
 */
export interface Database {
  execute(sql: string, params?: unknown[]): QueryResult;
  transaction(fn: () => void): void;
  close(): void;
}
