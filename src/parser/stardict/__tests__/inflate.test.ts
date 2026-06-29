import { gzip } from 'pako';
import { inflateDict } from '../inflate';

describe('inflateDict', () => {
  it('inflates pako-gzipped bytes back to the original', () => {
    const original = Uint8Array.from(
      Array.from('article body text').map((c) => c.charCodeAt(0)),
    );
    const compressed = gzip(original);
    expect(Array.from(inflateDict(compressed))).toEqual(Array.from(original));
  });
});
