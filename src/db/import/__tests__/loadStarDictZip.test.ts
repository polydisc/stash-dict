import { zipSync, gzipSync } from 'fflate';
import { loadStarDictZip } from '../loadStarDictZip';

const bytes = (s: string): Uint8Array =>
  Uint8Array.from(Array.from(s).map((c) => c.charCodeAt(0)));

const IFO = bytes(
  ["StarDict's dict ifo file", 'bookname=Z', 'wordcount=1', 'sametypesequence=m'].join('\n'),
);
const IDX = Uint8Array.from([...bytes('a'), 0, 0, 0, 0, 0, 0, 0, 0, 1]); // word 'a', offset 0, size 1
const DICT = bytes('x');

describe('loadStarDictZip', () => {
  it('binds .ifo/.idx/.dict by base name', () => {
    const zip = zipSync({ 'd.ifo': IFO, 'd.idx': IDX, 'd.dict': DICT });
    const files = loadStarDictZip(zip);
    expect(files.ifo).toEqual(IFO);
    expect(files.idx).toEqual(IDX);
    expect(files.dict).toEqual(DICT);
    expect(files.syn).toBeUndefined();
  });

  it('inflates a .dict.dz sibling', () => {
    const zip = zipSync({ 'd.ifo': IFO, 'd.idx': IDX, 'd.dict.dz': gzipSync(DICT) });
    const files = loadStarDictZip(zip);
    expect(files.dict).toEqual(DICT);
  });

  it('includes an optional .syn', () => {
    const syn = Uint8Array.from([...bytes('b'), 0, 0, 0, 0, 0]);
    const zip = zipSync({ 'd.ifo': IFO, 'd.idx': IDX, 'd.dict': DICT, 'd.syn': syn });
    expect(loadStarDictZip(zip).syn).toEqual(syn);
  });

  it('finds files inside a subdirectory', () => {
    const zip = zipSync({ 'sub/d.ifo': IFO, 'sub/d.idx': IDX, 'sub/d.dict': DICT });
    expect(loadStarDictZip(zip).ifo).toEqual(IFO);
  });

  it('throws when the .ifo is missing', () => {
    const zip = zipSync({ 'd.idx': IDX, 'd.dict': DICT });
    expect(() => loadStarDictZip(zip)).toThrow(/\.ifo/);
  });

  it('throws when the archive contains multiple .ifo files', () => {
    const zip = zipSync({
      'd.ifo': IFO,
      'd.idx': IDX,
      'd.dict': DICT,
      'e.ifo': IFO,
      'e.idx': IDX,
      'e.dict': DICT,
    });
    expect(() => loadStarDictZip(zip)).toThrow(/multiple dictionaries/);
  });

  it('throws when the .dict is missing', () => {
    const zip = zipSync({ 'd.ifo': IFO, 'd.idx': IDX });
    expect(() => loadStarDictZip(zip)).toThrow(/\.dict/);
  });

  it('ignores macOS AppleDouble metadata entries', () => {
    // A normal single-dictionary archive zipped by macOS Finder also carries
    // __MACOSX/._* metadata; these must not be counted as a second dictionary.
    const zip = zipSync({
      'd.ifo': IFO,
      'd.idx': IDX,
      'd.dict': DICT,
      '__MACOSX/._d.ifo': bytes('appledouble-junk'),
      '__MACOSX/._d.idx': bytes('appledouble-junk'),
      '._d.dict': bytes('appledouble-junk'),
    });
    const files = loadStarDictZip(zip);
    expect(files.ifo).toEqual(IFO);
    expect(files.dict).toEqual(DICT);
  });
});
