import { zipSync } from 'fflate';
import { BetterSqliteDatabase } from '../../adapters/BetterSqliteDatabase';
import { initDatabase } from '../../init';
import { importDictionaryFromZip } from '../importFromZip';
import { listDictionaries } from '../../dictionaries/repository';

const ascii = (s: string): number[] => Array.from(s).map((c) => c.charCodeAt(0));
function idxRecord(word: string, offset: number, size: number): number[] {
  return [
    ...ascii(word), 0,
    (offset >>> 24) & 0xff, (offset >>> 16) & 0xff, (offset >>> 8) & 0xff, offset & 0xff,
    (size >>> 24) & 0xff, (size >>> 16) & 0xff, (size >>> 8) & 0xff, size & 0xff,
  ];
}

function miniZip(): Uint8Array {
  const ifo = Uint8Array.from(
    ascii(["StarDict's dict ifo file", 'bookname=Z', 'wordcount=1', 'sametypesequence=m'].join('\n')),
  );
  return zipSync({
    'z.ifo': ifo,
    'z.idx': Uint8Array.from(idxRecord('apple', 0, 5)),
    'z.dict': Uint8Array.from(ascii('apple')),
  });
}

describe('importDictionaryFromZip', () => {
  it('imports a dictionary from zip bytes end to end', () => {
    const db = new BetterSqliteDatabase();
    initDatabase(db);
    const result = importDictionaryFromZip(db, miniZip());
    expect(result.entryCount).toBe(1);
    const dicts = listDictionaries(db);
    expect(dicts).toHaveLength(1);
    expect(dicts[0].name).toBe('Z');
    db.close();
  });

  it('imports nothing when the archive is invalid', () => {
    const db = new BetterSqliteDatabase();
    initDatabase(db);
    const badZip = zipSync({ 'z.idx': Uint8Array.from([0]) }); // no .ifo
    expect(() => importDictionaryFromZip(db, badZip)).toThrow(/\.ifo/);
    expect(listDictionaries(db)).toEqual([]);
    db.close();
  });
});
