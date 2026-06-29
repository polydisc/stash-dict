import { iterateSyn } from '../syn';

function synRecord(word: string, targetIndex: number): number[] {
  const bytes: number[] = [];
  for (const ch of word) bytes.push(ch.charCodeAt(0));
  bytes.push(0);
  bytes.push(
    (targetIndex >>> 24) & 0xff,
    (targetIndex >>> 16) & 0xff,
    (targetIndex >>> 8) & 0xff,
    targetIndex & 0xff,
  );
  return bytes;
}

describe('iterateSyn', () => {
  it('reads synonym -> target index records', () => {
    const bytes = Uint8Array.from([
      ...synRecord('color', 2),
      ...synRecord('colour', 2),
    ]);
    expect([...iterateSyn(bytes)]).toEqual([
      { synonym: 'color', targetSeq: 2 },
      { synonym: 'colour', targetSeq: 2 },
    ]);
  });

  it('yields nothing for empty input', () => {
    expect([...iterateSyn(new Uint8Array())]).toEqual([]);
  });
});
