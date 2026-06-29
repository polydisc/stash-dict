import { parseIfo } from '../ifo';

const enc = (s: string): Uint8Array =>
  Uint8Array.from(Array.from(s).map((c) => c.charCodeAt(0)));

const VALID = [
  "StarDict's dict ifo file",
  'version=2.4.2',
  'bookname=Example Dictionary',
  'wordcount=3',
  'synwordcount=2',
  'idxfilesize=42',
  'sametypesequence=m',
].join('\n');

describe('parseIfo', () => {
  it('parses required and optional fields', () => {
    const ifo = parseIfo(enc(VALID));
    expect(ifo.bookname).toBe('Example Dictionary');
    expect(ifo.wordcount).toBe(3);
    expect(ifo.synwordcount).toBe(2);
    expect(ifo.sametypesequence).toBe('m');
    expect(ifo.idxoffsetbits).toBe(32);
    expect(ifo.version).toBe('2.4.2');
  });

  it('defaults idxoffsetbits to 32 and synwordcount to 0 when absent', () => {
    const ifo = parseIfo(
      enc(
        ["StarDict's dict ifo file", 'bookname=D', 'wordcount=1'].join('\n'),
      ),
    );
    expect(ifo.idxoffsetbits).toBe(32);
    expect(ifo.synwordcount).toBe(0);
    expect(ifo.sametypesequence).toBeUndefined();
  });

  it('honors idxoffsetbits=64', () => {
    const ifo = parseIfo(
      enc(
        [
          "StarDict's dict ifo file",
          'bookname=D',
          'wordcount=1',
          'idxoffsetbits=64',
        ].join('\n'),
      ),
    );
    expect(ifo.idxoffsetbits).toBe(64);
  });

  it('throws when the magic header is missing', () => {
    expect(() => parseIfo(enc('version=3.0.0\nbookname=D\nwordcount=1'))).toThrow(
      /StarDict/,
    );
  });

  it('throws when bookname is missing', () => {
    expect(() =>
      parseIfo(enc(["StarDict's dict ifo file", 'wordcount=1'].join('\n'))),
    ).toThrow(/bookname/);
  });

  it('throws when wordcount is missing or invalid', () => {
    expect(() =>
      parseIfo(enc(["StarDict's dict ifo file", 'bookname=D'].join('\n'))),
    ).toThrow(/wordcount/);
    expect(() =>
      parseIfo(
        enc(["StarDict's dict ifo file", 'bookname=D', 'wordcount=x'].join('\n')),
      ),
    ).toThrow(/wordcount/);
  });

  it('rejects an empty/whitespace wordcount instead of treating it as 0', () => {
    expect(() =>
      parseIfo(
        enc(["StarDict's dict ifo file", 'bookname=D', 'wordcount='].join('\n')),
      ),
    ).toThrow(/wordcount/);
    expect(() =>
      parseIfo(
        enc(["StarDict's dict ifo file", 'bookname=D', 'wordcount=   '].join('\n')),
      ),
    ).toThrow(/wordcount/);
  });
});
