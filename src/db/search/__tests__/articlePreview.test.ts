import { articlePreview } from '../articlePreview';

describe('articlePreview', () => {
  it('returns empty string for empty/nullish input', () => {
    expect(articlePreview('', 'm')).toBe('');
    expect(articlePreview(null, 'h')).toBe('');
    expect(articlePreview(undefined, 'm')).toBe('');
  });

  it('collapses whitespace in plain articles', () => {
    expect(articlePreview('the   vocabulary\n of a language', 'm')).toBe(
      'the vocabulary of a language',
    );
  });

  it('strips HTML tags and decodes common entities for h articles', () => {
    expect(
      articlePreview('<b>the</b> words &amp; phrases<br>of a language', 'h'),
    ).toBe('the words & phrases of a language');
  });

  it('truncates to 80 chars with an ellipsis', () => {
    const long = 'a'.repeat(200);
    const out = articlePreview(long, 'm');
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBe(81); // 80 chars + ellipsis
  });

  it('does not add an ellipsis when within the limit', () => {
    expect(articlePreview('short text', 'm')).toBe('short text');
  });
});
