// op-sqlite's native module can't load under Jest, so mock it and assert the
// adapter maps the Database interface onto op-sqlite's API shape.
// NOTE: op-sqlite's DB.execute() is async; we use executeSync() for the
// synchronous Database interface. The mock mirrors executeSync (sync return).
jest.mock('@op-engineering/op-sqlite', () => ({
  open: jest.fn(() => ({
    executeSync: jest.fn(() => ({ rows: [{ id: 1 }], rowsAffected: 0 })),
    close: jest.fn(),
  })),
}));

import { OpSqliteDatabase } from '../OpSqliteDatabase';
import type { Database } from '../../Database';

describe('OpSqliteDatabase', () => {
  it('implements the Database interface against op-sqlite', () => {
    const db: Database = new OpSqliteDatabase('test.sqlite');
    expect(db.execute('SELECT 1').rows).toEqual([{ id: 1 }]);
    expect(typeof db.transaction).toBe('function');
    expect(typeof db.close).toBe('function');
  });
});
