/**
 * Hermes-safe UTF-8 decoder. Avoids the global TextDecoder, which is not
 * guaranteed to exist on Hermes. Handles 1–4 byte sequences and emits
 * surrogate pairs for astral code points.
 */
export function decodeUtf8(
  bytes: Uint8Array,
  start = 0,
  end = bytes.length,
): string {
  let out = '';
  let i = start;
  while (i < end) {
    const b0 = bytes[i++];
    if (b0 < 0x80) {
      out += String.fromCharCode(b0);
    } else if (b0 < 0xe0) {
      if (i >= end) { out += '�'; break; }
      const b1 = bytes[i++] & 0x3f;
      out += String.fromCharCode(((b0 & 0x1f) << 6) | b1);
    } else if (b0 < 0xf0) {
      if (i >= end) { out += '�'; break; }
      const b1 = bytes[i++] & 0x3f;
      if (i >= end) { out += '�'; break; }
      const b2 = bytes[i++] & 0x3f;
      out += String.fromCharCode(((b0 & 0x0f) << 12) | (b1 << 6) | b2);
    } else {
      if (i >= end) { out += '�'; break; }
      const b1 = bytes[i++] & 0x3f;
      if (i >= end) { out += '�'; break; }
      const b2 = bytes[i++] & 0x3f;
      if (i >= end) { out += '�'; break; }
      const b3 = bytes[i++] & 0x3f;
      let cp = ((b0 & 0x07) << 18) | (b1 << 12) | (b2 << 6) | b3;
      cp -= 0x10000;
      out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
    }
  }
  return out;
}

/** Sequential big-endian reader over a byte buffer. */
export class ByteReader {
  private pos: number;

  constructor(
    private readonly data: Uint8Array,
    start = 0,
  ) {
    this.pos = start;
  }

  get position(): number {
    return this.pos;
  }

  get eof(): boolean {
    return this.pos >= this.data.length;
  }

  remaining(): number {
    return this.data.length - this.pos;
  }

  uint8(): number {
    return this.data[this.pos++];
  }

  uint32(): number {
    const d = this.data;
    const p = this.pos;
    // Multiply the top byte (not <<24) to stay unsigned.
    const v = d[p] * 0x1000000 + (d[p + 1] << 16) + (d[p + 2] << 8) + d[p + 3];
    this.pos += 4;
    return v;
  }

  uint64(): number {
    const hi = this.uint32();
    const lo = this.uint32();
    // hi * 2^32 + lo must stay <= Number.MAX_SAFE_INTEGER (2^53 - 1).
    if (hi > 0x1fffff) {
      throw new RangeError('64-bit offset exceeds Number.MAX_SAFE_INTEGER');
    }
    return hi * 0x100000000 + lo;
  }

  cstring(): string {
    let end = this.pos;
    while (end < this.data.length && this.data[end] !== 0) end++;
    const s = decodeUtf8(this.data, this.pos, end);
    this.pos = end < this.data.length ? end + 1 : end; // skip the NUL
    return s;
  }

  restAsString(): string {
    const s = decodeUtf8(this.data, this.pos, this.data.length);
    this.pos = this.data.length;
    return s;
  }

  take(n: number): Uint8Array {
    const slice = this.data.subarray(this.pos, this.pos + n);
    this.pos += n;
    return slice;
  }
}
