import { parseBwordHref } from '../bword';

describe('parseBwordHref', () => {
  it('extracts the word from bword://word', () => {
    expect(parseBwordHref('bword://apple')).toBe('apple');
  });
  it('accepts the bword:word form', () => {
    expect(parseBwordHref('bword:apple')).toBe('apple');
  });
  it('URL-decodes the target', () => {
    expect(parseBwordHref('bword://caf%C3%A9')).toBe('café');
    expect(parseBwordHref('bword://a%20b')).toBe('a b');
  });
  it('strips a normalizer-added trailing slash', () => {
    // react-native-render-html normalizes bword://apple -> bword://apple/
    expect(parseBwordHref('bword://apple/')).toBe('apple');
    expect(parseBwordHref('bword://caf%C3%A9/')).toBe('café');
    expect(parseBwordHref('bword:///')).toBeNull();
  });
  it('returns null for external or unrelated URLs', () => {
    expect(parseBwordHref('https://example.com')).toBeNull();
    expect(parseBwordHref('mailto:x@y.z')).toBeNull();
    expect(parseBwordHref('')).toBeNull();
  });
});
