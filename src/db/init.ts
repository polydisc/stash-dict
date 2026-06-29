import type { Database } from './Database';
import { OPEN_PRAGMAS, CREATE_STATEMENTS, SCHEMA_VERSION } from './schema';

function getUserVersion(db: Database): number {
  return db.execute('PRAGMA user_version').rows[0].user_version as number;
}

function entriesHasArticleType(db: Database): boolean {
  return db
    .execute('PRAGMA table_info(entries)')
    .rows.some((r) => r.name === 'article_type');
}

/**
 * Opens/prepares a database: connection pragmas, table creation, then
 * version migrations. Idempotent. See schema.ts and ADR 0001/0002.
 */
export function initDatabase(db: Database): void {
  for (const pragma of OPEN_PRAGMAS) {
    db.execute(pragma);
  }
  for (const ddl of CREATE_STATEMENTS) {
    db.execute(ddl);
  }
  // Migrate any pre-existing v1 entries table that predates article_type.
  if (!entriesHasArticleType(db)) {
    db.execute(
      "ALTER TABLE entries ADD COLUMN article_type TEXT NOT NULL DEFAULT 'm'",
    );
  }
  if (getUserVersion(db) !== SCHEMA_VERSION) {
    // PRAGMA user_version does not accept bound parameters.
    db.execute(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }
}
