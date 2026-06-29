import { StarDictParser } from '../StarDictParser';

const ascii = (s: string): number[] => Array.from(s).map((c) => c.charCodeAt(0));

function idxRecord(word: string, offset: number, size: number): number[] {
  return [
    ...ascii(word),
    0,
    (offset >>> 24) & 0xff, (offset >>> 16) & 0xff, (offset >>> 8) & 0xff, offset & 0xff,
    (size >>> 24) & 0xff, (size >>> 16) & 0xff, (size >>> 8) & 0xff, size & 0xff,
  ];
}

function synRecord(word: string, target: number): number[] {
  return [
    ...ascii(word),
    0,
    (target >>> 24) & 0xff, (target >>> 16) & 0xff, (target >>> 8) & 0xff, target & 0xff,
  ];
}

describe('StarDictParser (end to end)', () => {
  it('joins .ifo/.idx/.dict/.syn into entries and synonyms', () => {
    const ifo = Uint8Array.from(
      ascii(
        [
          "StarDict's dict ifo file",
          'bookname=Mini',
          'wordcount=2',
          'synwordcount=1',
          'sametypesequence=m',
        ].join('\n'),
      ),
    );
    // .dict: "applefruit" — apple [0,5), fruit [5,5)
    const dict = Uint8Array.from(ascii('applefruit'));
    const idx = Uint8Array.from([
      ...idxRecord('apple', 0, 5),
      ...idxRecord('fruit', 5, 5),
    ]);
    const syn = Uint8Array.from([...synRecord('pomme', 0)]);

    const parsed = new StarDictParser().parse({ ifo, idx, dict, syn });

    expect(parsed.metadata).toEqual({
      name: 'Mini',
      wordCount: 2,
      synWordCount: 1,
    });
    expect([...parsed.entries()]).toEqual([
      { headword: 'apple', seq: 0, articleType: 'm', article: 'apple' },
      { headword: 'fruit', seq: 1, articleType: 'm', article: 'fruit' },
    ]);
    expect([...parsed.synonyms()]).toEqual([
      { synonym: 'pomme', targetSeq: 0 },
    ]);
  });

  it('yields no synonyms when .syn is absent', () => {
    const ifo = Uint8Array.from(
      ascii(
        ["StarDict's dict ifo file", 'bookname=D', 'wordcount=1', 'sametypesequence=m'].join('\n'),
      ),
    );
    const dict = Uint8Array.from(ascii('x'));
    const idx = Uint8Array.from([...idxRecord('a', 0, 1)]);
    const parsed = new StarDictParser().parse({ ifo, idx, dict });
    expect([...parsed.synonyms()]).toEqual([]);
    expect([...parsed.entries()]).toHaveLength(1);
  });
});
