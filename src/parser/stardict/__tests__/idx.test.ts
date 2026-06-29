import { iterateIdx } from '../idx';

// Builds an .idx record: word + NUL + offset + size (big-endian).
function record(word: string, offset: number, size: number, bits: 32 | 64): number[] {
  const bytes: number[] = [];
  for (const ch of word) bytes.push(ch.charCodeAt(0));
  bytes.push(0);
  if (bits === 64) {
    bytes.push(0, 0, 0, 0); // high 32 bits = 0
  }
  bytes.push((offset >>> 24) & 0xff, (offset >>> 16) & 0xff, (offset >>> 8) & 0xff, offset & 0xff);
  bytes.push((size >>> 24) & 0xff, (size >>> 16) & 0xff, (size >>> 8) & 0xff, size & 0xff);
  return bytes;
}

describe('iterateIdx', () => {
  it('reads 32-bit records with sequential seq', () => {
    const bytes = Uint8Array.from([
      ...record('apple', 0, 10, 32),
      ...record('banana', 10, 20, 32),
    ]);
    const recs = [...iterateIdx(bytes, 32)];
    expect(recs).toEqual([
      { word: 'apple', offset: 0, size: 10, seq: 0 },
      { word: 'banana', offset: 10, size: 20, seq: 1 },
    ]);
  });

  it('reads 64-bit offsets', () => {
    const bytes = Uint8Array.from([...record('x', 5, 7, 64)]);
    const recs = [...iterateIdx(bytes, 64)];
    expect(recs).toEqual([{ word: 'x', offset: 5, size: 7, seq: 0 }]);
  });

  it('yields nothing for empty input', () => {
    expect([...iterateIdx(new Uint8Array(), 32)]).toEqual([]);
  });
});
