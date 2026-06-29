import { BetterSqliteDatabase } from '../BetterSqliteDatabase';

describe('BetterSqliteDatabase', () => {
  it('executes DDL and returns selected rows', () => {
    const db = new BetterSqliteDatabase();
    db.execute('CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT)');
    db.execute('INSERT INTO t (name) VALUES (?)', ['alice']);
    const { rows } = db.execute('SELECT id, name FROM t');
    expect(rows).toEqual([{ id: 1, name: 'alice' }]);
    db.close();
  });

  it('commits a successful transaction', () => {
    const db = new BetterSqliteDatabase();
    db.execute('CREATE TABLE t (x INTEGER)');
    db.transaction(() => {
      db.execute('INSERT INTO t (x) VALUES (?)', [1]);
      db.execute('INSERT INTO t (x) VALUES (?)', [2]);
    });
    expect(db.execute('SELECT COUNT(*) AS n FROM t').rows[0].n).toBe(2);
    db.close();
  });

  it('rolls back a transaction that throws', () => {
    const db = new BetterSqliteDatabase();
    db.execute('CREATE TABLE t (x INTEGER)');
    expect(() =>
      db.transaction(() => {
        db.execute('INSERT INTO t (x) VALUES (?)', [1]);
        throw new Error('boom');
      }),
    ).toThrow('boom');
    expect(db.execute('SELECT COUNT(*) AS n FROM t').rows[0].n).toBe(0);
    db.close();
  });
});
