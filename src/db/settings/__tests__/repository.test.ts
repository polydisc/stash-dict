import { BetterSqliteDatabase } from '../../adapters/BetterSqliteDatabase';
import { initDatabase } from '../../init';
import { getSettings, setTheme, setFontScale, DEFAULT_SETTINGS } from '../repository';

function fresh(): BetterSqliteDatabase {
  const db = new BetterSqliteDatabase();
  initDatabase(db);
  return db;
}

describe('settings repository', () => {
  it('returns defaults when nothing is stored', () => {
    const db = fresh();
    expect(getSettings(db)).toEqual(DEFAULT_SETTINGS);
    db.close();
  });

  it('persists and reads the theme', () => {
    const db = fresh();
    setTheme(db, 'dark');
    expect(getSettings(db).theme).toBe('dark');
    db.close();
  });

  it('persists and reads the font scale', () => {
    const db = fresh();
    setFontScale(db, 1.3);
    expect(getSettings(db).fontScale).toBe(1.3);
    db.close();
  });

  it('falls back to default theme on an unknown stored value', () => {
    const db = fresh();
    db.execute("INSERT INTO settings (key, value) VALUES ('theme', 'rainbow')");
    expect(getSettings(db).theme).toBe('system');
    db.close();
  });

  it('clamps an above-range font scale to the maximum', () => {
    const db = fresh();
    db.execute("INSERT INTO settings (key, value) VALUES ('fontScale', '9')");
    expect(getSettings(db).fontScale).toBe(1.6);
    db.close();
  });

  it('clamps a below-range font scale to the minimum', () => {
    const db = fresh();
    db.execute("INSERT INTO settings (key, value) VALUES ('fontScale', '0.1')");
    expect(getSettings(db).fontScale).toBe(0.8);
    db.close();
  });

  it('falls back to the default font scale on a non-numeric value', () => {
    const db = fresh();
    db.execute("INSERT INTO settings (key, value) VALUES ('fontScale', 'huge')");
    expect(getSettings(db).fontScale).toBe(1);
    db.close();
  });
});
