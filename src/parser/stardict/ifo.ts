import { decodeUtf8 } from '../binary';

export interface StarDictIfo {
  bookname: string;
  wordcount: number;
  synwordcount: number;
  idxoffsetbits: 32 | 64;
  sametypesequence?: string;
  version: string;
}

const IFO_MAGIC = "StarDict's dict ifo file";

export function parseIfo(bytes: Uint8Array): StarDictIfo {
  const lines = decodeUtf8(bytes).split(/\r?\n/);
  if (lines.length === 0 || lines[0].trim() !== IFO_MAGIC) {
    throw new Error('Not a StarDict .ifo file (missing magic header)');
  }

  const kv = new Map<string, string>();
  for (let i = 1; i < lines.length; i++) {
    const eq = lines[i].indexOf('=');
    if (eq <= 0) continue;
    kv.set(lines[i].slice(0, eq).trim(), lines[i].slice(eq + 1));
  }

  const bookname = kv.get('bookname');
  if (!bookname) {
    throw new Error('.ifo missing required field: bookname');
  }

  const wordcountStr = kv.get('wordcount');
  const wordcount = Number(wordcountStr);
  if (
    wordcountStr === undefined ||
    wordcountStr.trim() === '' || // `wordcount=` (empty/whitespace) is malformed, not 0
    !Number.isInteger(wordcount) ||
    wordcount < 0
  ) {
    throw new Error('.ifo missing or invalid required field: wordcount');
  }

  const synParsed = Number(kv.get('synwordcount'));
  const synwordcount = Number.isInteger(synParsed) && synParsed >= 0 ? synParsed : 0;

  const idxoffsetbits = kv.get('idxoffsetbits') === '64' ? 64 : 32;
  const sametypesequence = kv.get('sametypesequence') || undefined;

  return {
    bookname,
    wordcount,
    synwordcount,
    idxoffsetbits,
    sametypesequence,
    version: kv.get('version') ?? '',
  };
}
