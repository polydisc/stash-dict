import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BetterSqliteDatabase } from '../../db/adapters/BetterSqliteDatabase';
import { initDatabase } from '../../db/init';
import { importDictionaryFromZip } from '../../db/import/importFromZip';
import { searchHeadwords } from '../../db/search/searchHeadwords';
import { getEntriesForHeadword } from '../../db/search/getEntriesForHeadword';

// Validates the committed dev-seed asset: it must be a real StarDict zip that
// our import pipeline accepts, and it must exercise plain (m) + HTML (h)
// articles, a synonym, and a bword:// cross-reference. Regenerate with
// `node scripts/build-dev-seed.mjs` if the entries change.
function seedBytes(): Uint8Array {
  const path = join(__dirname, '..', '..', '..', 'assets', 'dev-seed.zip');
  return new Uint8Array(readFileSync(path));
}

function freshDb(): BetterSqliteDatabase {
  const db = new BetterSqliteDatabase();
  initDatabase(db);
  return db;
}

describe('dev-seed asset', () => {
  it('imports as a valid StarDict dictionary', () => {
    const db = freshDb();
    const result = importDictionaryFromZip(db, seedBytes());
    expect(result.entryCount).toBe(4);
    expect(result.synonymCount).toBe(1);
    db.close();
  });

  it('contains a plain and an HTML article with a bword link', () => {
    const db = freshDb();
    importDictionaryFromZip(db, seedBytes());
    const apple = getEntriesForHeadword(db, 'apple')[0].entries[0];
    expect(apple.articleType).toBe('m');
    const rich = getEntriesForHeadword(db, 'rich')[0].entries[0];
    expect(rich.articleType).toBe('h');
    expect(rich.article).toContain('bword://apple');
    db.close();
  });

  it('resolves the colour -> color synonym via search and detail', () => {
    const db = freshDb();
    importDictionaryFromZip(db, seedBytes());
    expect(searchHeadwords(db, 'colou').map((h) => h.headword)).toContain('colour');
    expect(getEntriesForHeadword(db, 'colour')[0].entries[0].article).toContain('American spelling');
    db.close();
  });
});
