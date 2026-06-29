import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BetterSqliteDatabase } from '../../db/adapters/BetterSqliteDatabase';
import { initDatabase } from '../../db/init';
import { listDictionaries } from '../../db/dictionaries/repository';
import { seedDevDictionaryIfEmpty } from '../seedDevDictionary';

function freshDb(): BetterSqliteDatabase {
  const db = new BetterSqliteDatabase();
  initDatabase(db);
  return db;
}

const realLoader = async (): Promise<Uint8Array> =>
  new Uint8Array(readFileSync(join(__dirname, '..', '..', '..', 'assets', 'dev-seed.zip')));

describe('seedDevDictionaryIfEmpty', () => {
  it('imports the sample when no dictionaries exist', async () => {
    const db = freshDb();
    const seeded = await seedDevDictionaryIfEmpty(db, realLoader);
    expect(seeded).toBe(true);
    expect(listDictionaries(db)).toHaveLength(1);
    db.close();
  });

  it('does nothing (and does not load bytes) when a dictionary already exists', async () => {
    const db = freshDb();
    db.execute(
      "INSERT INTO dictionaries (name, word_count, enabled, sort_order) VALUES ('Existing', 0, 1, 0)",
    );
    let loaded = false;
    const seeded = await seedDevDictionaryIfEmpty(db, async () => {
      loaded = true;
      return new Uint8Array();
    });
    expect(seeded).toBe(false);
    expect(loaded).toBe(false);
    expect(listDictionaries(db)).toHaveLength(1);
    db.close();
  });
});
