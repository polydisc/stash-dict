import { ByteReader } from '../binary';

export interface IdxRecord {
  word: string;
  offset: number;
  size: number;
  seq: number;
}

export function* iterateIdx(
  bytes: Uint8Array,
  idxOffsetBits: 32 | 64,
): Generator<IdxRecord> {
  const reader = new ByteReader(bytes);
  const offsetBytes = idxOffsetBits === 64 ? 8 : 4;
  let seq = 0;
  while (!reader.eof) {
    const word = reader.cstring();
    // Need offset + size bytes after the word; stop on a truncated tail.
    if (reader.remaining() < offsetBytes + 4) break;
    const offset = idxOffsetBits === 64 ? reader.uint64() : reader.uint32();
    const size = reader.uint32();
    yield { word, offset, size, seq };
    seq++;
  }
}
