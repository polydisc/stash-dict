import { SCHEMA_VERSION, CREATE_STATEMENTS, OPEN_PRAGMAS } from '../schema';

describe('schema', () => {
  it('declares schema version 2', () => {
    expect(SCHEMA_VERSION).toBe(2);
  });

  it('entries carries an article_type column', () => {
    const entries = CREATE_STATEMENTS.find((s) =>
      s.includes('CREATE TABLE IF NOT EXISTS entries'),
    );
    expect(entries).toContain('article_type');
  });

  it('creates every required table', () => {
    const ddl = CREATE_STATEMENTS.join('\n');
    for (const table of [
      'dictionaries',
      'entries',
      'synonyms',
      'history',
      'favorites',
      'settings',
    ]) {
      expect(ddl).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
  });

  it('indexes entries by folded_headword', () => {
    const ddl = CREATE_STATEMENTS.join('\n');
    expect(ddl).toMatch(/CREATE INDEX IF NOT EXISTS .*entries.*folded_headword/);
  });

  it('preserves the original synonym spelling and a resolvable target', () => {
    const synonyms = CREATE_STATEMENTS.find((s) =>
      s.includes('CREATE TABLE IF NOT EXISTS synonyms'),
    );
    expect(synonyms).toBeDefined();
    // Original spelling kept for display, folded key for search, and a target
    // that pins the exact entry (entries allow duplicate headwords).
    expect(synonyms).toContain('synonym_headword');
    expect(synonyms).toContain('folded_headword');
    expect(synonyms).toContain('target_seq');
  });

  it('can resolve a synonym target to its entry via (dictId, seq)', () => {
    const index = CREATE_STATEMENTS.find(
      (s) => s.includes('CREATE INDEX') && s.includes('entries(dictId, seq)'),
    );
    expect(index).toBeDefined();
  });

  it('enables foreign keys so ON DELETE CASCADE takes effect', () => {
    expect(OPEN_PRAGMAS).toContain('PRAGMA foreign_keys = ON');
  });
});
