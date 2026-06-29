import { decodeUtf8, ByteReader } from '../binary';

describe('decodeUtf8', () => {
  it('decodes ASCII', () => {
    expect(decodeUtf8(Uint8Array.from([0x41, 0x42, 0x43]))).toBe('ABC');
  });
  it('decodes 2-byte sequences (é)', () => {
    expect(decodeUtf8(Uint8Array.from([0xc3, 0xa9]))).toBe('é');
  });
  it('decodes 3-byte sequences (日)', () => {
    expect(decodeUtf8(Uint8Array.from([0xe6, 0x97, 0xa5]))).toBe('日');
  });
  it('decodes 4-byte sequences as surrogate pairs (😀)', () => {
    expect(decodeUtf8(Uint8Array.from([0xf0, 0x9f, 0x98, 0x80]))).toBe('😀');
  });
  it('honors start/end bounds', () => {
    const bytes = Uint8Array.from([0x41, 0x42, 0x43, 0x44]);
    expect(decodeUtf8(bytes, 1, 3)).toBe('BC');
  });
  it('emits replacement char for truncated multibyte at end boundary, does not read past end', () => {
    // 0x41='A', 0xE6 is the lead byte of a 3-byte sequence (e.g. 日=0xE6 0x97 0xA5),
    // but end=2 means only bytes[0..1] are in range. The continuation bytes are absent.
    // The decoder must not read beyond index 2 and must emit U+FFFD for the incomplete sequence.
    const result = decodeUtf8(Uint8Array.from([0x41, 0xe6, 0x97]), 0, 2);
    expect(result).toBe('A�');
  });
});

describe('ByteReader', () => {
  it('reads big-endian uint32 unsigned', () => {
    const r = new ByteReader(Uint8Array.from([0xff, 0xff, 0xff, 0xff]));
    expect(r.uint32()).toBe(4294967295);
    expect(r.position).toBe(4);
    expect(r.eof).toBe(true);
  });
  it('reads big-endian uint64 within safe range', () => {
    // 0x00000001_00000002 = 4294967298
    const r = new ByteReader(
      Uint8Array.from([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02]),
    );
    expect(r.uint64()).toBe(4294967298);
  });
  it('throws if a uint64 exceeds the safe integer range', () => {
    const r = new ByteReader(
      Uint8Array.from([0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    );
    expect(() => r.uint64()).toThrow(RangeError);
  });
  it('reads a NUL-terminated string and skips the terminator', () => {
    const r = new ByteReader(Uint8Array.from([0x68, 0x69, 0x00, 0x41]));
    expect(r.cstring()).toBe('hi');
    expect(r.position).toBe(3); // past the NUL
    expect(r.uint8()).toBe(0x41);
  });
  it('restAsString decodes from the cursor to the end', () => {
    const r = new ByteReader(Uint8Array.from([0x41, 0x42, 0x43]));
    r.uint8();
    expect(r.restAsString()).toBe('BC');
    expect(r.eof).toBe(true);
  });
  it('take returns n bytes and advances', () => {
    const r = new ByteReader(Uint8Array.from([1, 2, 3, 4]));
    expect(Array.from(r.take(2))).toEqual([1, 2]);
    expect(r.position).toBe(2);
  });
});
