import { prefixRange, insertEntrySql, insertEntryParams } from '../queries';

describe('prefixRange', () => {
  it('folds the query and returns half-open bounds', () => {
    const { lo, hi } = prefixRange('Ca');
    expect(lo).toBe('ca');
    expect(hi).toBe('cb'); // last char incremented for the exclusive upper bound
  });

  it('strips accents in the bound', () => {
    expect(prefixRange('Café').lo).toBe('cafe');
  });

  it('returns empty bounds for an empty query', () => {
    expect(prefixRange('')).toEqual({ lo: '', hi: '' });
  });

  it('produces an exclusive upper bound for a key ending at U+FFFF', () => {
    const { lo, hi } = prefixRange('a￿');
    expect(lo).toBe('a￿');
    expect(hi > lo).toBe(true);
  });

  it('handles an astral (surrogate-pair) final code point', () => {
    const { lo, hi } = prefixRange('\u{20000}'); // CJK Ext B, two UTF-16 units
    expect(hi > lo).toBe(true);
  });
});

describe('insertEntry', () => {
  it('is a parameterized statement with six placeholders', () => {
    expect(insertEntrySql()).toContain('INSERT INTO entries');
    expect(insertEntrySql().match(/\?/g)).toHaveLength(6);
  });

  it('computes folded_headword and orders params to match the SQL', () => {
    const params = insertEntryParams({
      dictId: 7,
      headword: 'Café',
      article: 'a coffee house',
      articleType: 'h',
      seq: 3,
    });
    // order: dictId, headword, folded_headword, article, article_type, seq
    expect(params).toEqual([7, 'Café', 'cafe', 'a coffee house', 'h', 3]);
  });
});
