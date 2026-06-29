import { foldHeadword } from '../folding/foldHeadword';
import type { ArticleType } from '../parser';

export interface EntryInput {
  dictId: number;
  headword: string;
  article: string;
  articleType: ArticleType;
  seq: number;
}

/**
 * Half-open bounds for a prefix scan: rows where
 * `folded_headword >= lo AND folded_headword < hi`.
 * `hi` increments the last code unit of `lo` so the range is exclusive at the
 * top and needs no LIKE/escaping. Empty query -> empty bounds (caller skips).
 */
export function prefixRange(query: string): { lo: string; hi: string } {
  const lo = foldHeadword(query);
  if (lo === '') return { lo: '', hi: '' };
  // Increment the last full code point for an exclusive upper bound. Using
  // codePointAt/fromCodePoint (not charCodeAt) keeps astral chars intact and
  // avoids a U+FFFF -> U+0000 wrap that would make hi < lo.
  // If incrementing creates a surrogate pair (U+10000+) that sorts below the
  // U+FFFF boundary in JS UTF-16 comparison, fall back to bumping the preceding
  // code point instead — the resulting hi is still a valid exclusive upper bound.
  let head = lo;
  while (head.length > 0) {
    const lastCharCode = head.charCodeAt(head.length - 1);
    const isSurrPair = lastCharCode >= 0xdc00 && lastCharCode <= 0xdfff;
    const cpStart = head.length - (isSurrPair ? 2 : 1);
    const lastCp = head.codePointAt(cpStart) as number;
    const prefix = head.slice(0, cpStart);
    const hi = prefix + String.fromCodePoint(lastCp + 1);
    if (hi > lo) return { lo, hi };
    // hi sorted below lo in JS string order (e.g. U+FFFF -> U+10000 surrogate
    // pair); drop this code point and try incrementing the preceding one.
    head = prefix;
  }
  return { lo: '', hi: '' };
}

export function insertEntrySql(): string {
  return `INSERT INTO entries
          (dictId, headword, folded_headword, article, article_type, seq)
          VALUES (?, ?, ?, ?, ?, ?)`;
}

export function insertEntryParams(e: EntryInput): unknown[] {
  return [
    e.dictId,
    e.headword,
    foldHeadword(e.headword),
    e.article,
    e.articleType,
    e.seq,
  ];
}
