import { extractArticle } from '../article';

const ascii = (s: string): number[] => Array.from(s).map((c) => c.charCodeAt(0));

describe('extractArticle', () => {
  it('returns the whole block as plain text for sametypesequence "m"', () => {
    const dict = Uint8Array.from(ascii('hello world'));
    expect(extractArticle(dict, 0, dict.length, 'm')).toEqual({
      type: 'm',
      text: 'hello world',
    });
  });

  it('respects offset and size within a larger .dict', () => {
    const dict = Uint8Array.from(ascii('AAAcatBBB'));
    expect(extractArticle(dict, 3, 3, 'm')).toEqual({ type: 'm', text: 'cat' });
  });

  it('returns HTML for sametypesequence "h"', () => {
    const dict = Uint8Array.from(ascii('<b>hi</b>'));
    expect(extractArticle(dict, 0, dict.length, 'h')).toEqual({
      type: 'h',
      text: '<b>hi</b>',
    });
  });

  it('parses multi-field sametypesequence "mh" (NUL-terminated m, then trailing h)', () => {
    const block = Uint8Array.from([...ascii('plain'), 0, ...ascii('<i>rich</i>')]);
    const out = extractArticle(block, 0, block.length, 'mh');
    expect(out.type).toBe('h');
    // plain m escaped + h appended
    expect(out.text).toContain('plain');
    expect(out.text).toContain('<i>rich</i>');
  });

  it('parses typed fields when sametypesequence is absent', () => {
    // 'm' + "abc" + NUL
    const block = Uint8Array.from([...ascii('m'), ...ascii('abc'), 0]);
    expect(extractArticle(block, 0, block.length, undefined)).toEqual({
      type: 'm',
      text: 'abc',
    });
  });

  it('skips unsupported uppercase size-prefixed fields and keeps going', () => {
    // 'W' (binary) size=2 + 2 bytes, then 'm' + "ok" + NUL
    const block = Uint8Array.from([
      ...ascii('W'),
      0, 0, 0, 2,
      0xaa, 0xbb,
      ...ascii('m'),
      ...ascii('ok'),
      0,
    ]);
    expect(extractArticle(block, 0, block.length, undefined)).toEqual({
      type: 'm',
      text: 'ok',
    });
  });

  it('returns empty plain text when no renderable field exists', () => {
    // single 'x' (xdxf) field, sametypesequence "x"
    const block = Uint8Array.from(ascii('<xdxf/>'));
    expect(extractArticle(block, 0, block.length, 'x')).toEqual({
      type: 'm',
      text: '',
    });
  });

  it('skips non-terminal uppercase size-prefixed field in sametypesequence "Wm"', () => {
    // W is non-last => 4-byte big-endian size prefix + that many bytes (skipped)
    // m is last => runs to end of block, no NUL terminator
    // Block: [0,0,0,3, 0xaa,0xbb,0xcc, 'o','k']
    const block = Uint8Array.from([0, 0, 0, 3, 0xaa, 0xbb, 0xcc, ...ascii('ok')]);
    expect(extractArticle(block, 0, block.length, 'Wm')).toEqual({
      type: 'm',
      text: 'ok',
    });
  });

  it('does not throw when uppercase field declared size overflows remaining bytes (no sametypesequence)', () => {
    // 'W' type byte, size=99 declared but only 2 bytes follow — fail-soft, no throw
    const block = Uint8Array.from([...ascii('W'), 0, 0, 0, 99, 0x01, 0x02]);
    expect(() => extractArticle(block, 0, block.length, undefined)).not.toThrow();
    expect(extractArticle(block, 0, block.length, undefined)).toEqual({
      type: 'm',
      text: '',
    });
  });

  it('does not throw when sametypesequence block is truncated before uppercase size prefix', () => {
    // sametypesequence 'Wm': non-last W needs 4 bytes for size prefix, but block only has 2
    const block = Uint8Array.from([0x01, 0x02]);
    expect(() => extractArticle(block, 0, block.length, 'Wm')).not.toThrow();
    expect(extractArticle(block, 0, block.length, 'Wm')).toEqual({
      type: 'm',
      text: '',
    });
  });
});
