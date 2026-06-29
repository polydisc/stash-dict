import { ByteReader } from '../binary';

export interface SynRecord {
  synonym: string;
  targetSeq: number;
}

export function* iterateSyn(bytes: Uint8Array): Generator<SynRecord> {
  const reader = new ByteReader(bytes);
  while (!reader.eof) {
    const synonym = reader.cstring();
    if (reader.remaining() < 4) break; // truncated tail
    const targetSeq = reader.uint32();
    yield { synonym, targetSeq };
  }
}
