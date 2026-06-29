import { BetterSqliteDatabase } from '../../../db/adapters/BetterSqliteDatabase';
import { initDatabase } from '../../../db/init';
import { createSettingsService } from '../settingsService';

function fresh(): BetterSqliteDatabase {
  const db = new BetterSqliteDatabase();
  initDatabase(db);
  return db;
}

describe('createSettingsService', () => {
  it('reads and writes settings through the database', () => {
    const db = fresh();
    const svc = createSettingsService(db);
    expect(svc.get().theme).toBe('system');
    svc.setTheme('dark');
    svc.setFontScale(1.15);
    const reread = createSettingsService(db).get();
    expect(reread).toEqual({ theme: 'dark', fontScale: 1.15 });
    db.close();
  });

  it('clamps the font scale to the allowed range on read', () => {
    const db = fresh();
    const svc = createSettingsService(db);
    svc.setFontScale(5);
    expect(svc.get().fontScale).toBe(1.6);
    svc.setFontScale(0.1);
    expect(svc.get().fontScale).toBe(0.8);
    db.close();
  });
});
