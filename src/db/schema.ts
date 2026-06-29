export const SCHEMA_VERSION = 2;

/**
 * Connection-level pragmas that MUST be executed once per database connection
 * at open time, before any other statement and outside a transaction.
 *
 * `foreign_keys = ON` is required for the `ON DELETE CASCADE` clauses below to
 * take effect — SQLite ignores foreign-key actions unless this is enabled on
 * the connection. Without it, deleting a dictionary would orphan its entries
 * and synonyms. Phase 3 (the op-sqlite open routine) runs these.
 */
export const OPEN_PRAGMAS: string[] = ['PRAGMA foreign_keys = ON'];

/**
 * DDL executed in order when the database is opened (after OPEN_PRAGMAS).
 * Phase 3 (Import) runs these against op-sqlite. `folded_headword` is the
 * indexed prefix-search key (BINARY collation — SQLite's default for TEXT).
 */
export const CREATE_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS dictionaries (
     dictId INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     word_count INTEGER NOT NULL DEFAULT 0,
     enabled INTEGER NOT NULL DEFAULT 1,
     sort_order INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE TABLE IF NOT EXISTS entries (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     dictId INTEGER NOT NULL REFERENCES dictionaries(dictId) ON DELETE CASCADE,
     headword TEXT NOT NULL,
     folded_headword TEXT NOT NULL,
     article TEXT NOT NULL,
     article_type TEXT NOT NULL DEFAULT 'm',
     seq INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS idx_entries_folded_headword
     ON entries(folded_headword)`,
  // Resolves a synonym's target_seq to its entry within the same dictionary.
  `CREATE INDEX IF NOT EXISTS idx_entries_dict_seq
     ON entries(dictId, seq)`,
  // A synonym is an alternate spelling (from a StarDict `.syn` file) that
  // resolves to an existing entry's article. `synonym_headword` keeps the
  // original spelling for display; `folded_headword` is its search key;
  // `target_seq` is the `.idx` position the `.syn` record points at, resolved
  // to the exact entry via (dictId, seq) — which matters because entries
  // intentionally allow duplicate headwords.
  `CREATE TABLE IF NOT EXISTS synonyms (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     dictId INTEGER NOT NULL REFERENCES dictionaries(dictId) ON DELETE CASCADE,
     synonym_headword TEXT NOT NULL,
     folded_headword TEXT NOT NULL,
     target_seq INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS idx_synonyms_folded_headword
     ON synonyms(folded_headword)`,
  `CREATE TABLE IF NOT EXISTS history (
     folded_headword TEXT PRIMARY KEY,
     headword TEXT NOT NULL,
     opened_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS favorites (
     folded_headword TEXT PRIMARY KEY,
     headword TEXT NOT NULL,
     created_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS settings (
     key TEXT PRIMARY KEY,
     value TEXT NOT NULL
   )`,
];
