import type {
  DictionaryParser,
  ParsedDictionary,
  ParsedEntry,
  ParsedSynonym,
} from '../types';

describe('parser types', () => {
  it('a minimal object conforms to DictionaryParser', () => {
    const entry: ParsedEntry = {
      headword: 'a',
      seq: 0,
      articleType: 'm',
      article: 'x',
    };
    const syn: ParsedSynonym = { synonym: 'b', targetSeq: 0 };
    const parser: DictionaryParser = {
      parse(): ParsedDictionary {
        return {
          metadata: { name: 'D', wordCount: 1, synWordCount: 1 },
          *entries() {
            yield entry;
          },
          *synonyms() {
            yield syn;
          },
        };
      },
    };
    const dict = parser.parse({
      ifo: new Uint8Array(),
      idx: new Uint8Array(),
      dict: new Uint8Array(),
    });
    expect([...dict.entries()][0].headword).toBe('a');
    expect([...dict.synonyms()][0].synonym).toBe('b');
    expect(dict.metadata.name).toBe('D');
  });
});
