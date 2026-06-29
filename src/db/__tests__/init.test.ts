import { BetterSqliteDatabase } from '../adapters/BetterSqliteDatabase';
import { initDatabase } from '../init';
import { SCHEMA_VERSION } from '../schema';

function userVersion(db: BetterSqliteDatabase): number {
  return db.execute('PRAGMA user_version').rows[0].user_version as number;
}

function columns(db: BetterSqliteDatabase, table: string): string[] {
  return db
    .execute(`PRAGMA table_info(${table})`)
    .rows.map((r) => r.name as string);
}

describe('initDatabase', () => {
  it('creates all tables and stamps the schema version on a fresh DB', () => {
    const db = new BetterSqliteDatabase();
    initDatabase(db);
    expect(userVersion(db)).toBe(SCHEMA_VERSION);
    expect(columns(db, 'entries')).toContain('article_type');
    expect(columns(db, 'dictionaries')).toContain('enabled');
    db.close();
  });

  it('is idempotent', () => {
    const db = new BetterSqliteDatabase();
    initDatabase(db);
    expect(() => initDatabase(db)).not.toThrow();
    expect(userVersion(db)).toBe(SCHEMA_VERSION);
    db.close();
  });

  it('enables foreign keys so ON DELETE CASCADE removes child rows', () => {
    const db = new BetterSqliteDatabase();
    initDatabase(db);
    db.execute("INSERT INTO dictionaries (name) VALUES ('D')");
    const dictId = db.execute('SELECT last_insert_rowid() AS id').rows[0]
      .id as number;
    db.execute(
      'INSERT INTO entries (dictId, headword, folded_headword, article, seq) VALUES (?,?,?,?,?)',
      [dictId, 'a', 'a', 'x', 0],
    );
    db.execute('DELETE FROM dictionaries WHERE dictId = ?', [dictId]);
    expect(db.execute('SELECT COUNT(*) AS n FROM entries').rows[0].n).toBe(0);
    db.close();
  });

  it('migrates a v1 entries table by adding article_type', () => {
    const db = new BetterSqliteDatabase();
    // Simulate a v1 database: entries without article_type, user_version=1.
    db.execute(
      `CREATE TABLE entries (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         dictId INTEGER NOT NULL,
         headword TEXT NOT NULL,
         folded_headword TEXT NOT NULL,
         article TEXT NOT NULL,
         seq INTEGER NOT NULL DEFAULT 0
       )`,
    );
    db.execute('PRAGMA user_version = 1');
    initDatabase(db);
    expect(columns(db, 'entries')).toContain('article_type');
    expect(userVersion(db)).toBe(SCHEMA_VERSION);
    db.close();
  });
});
