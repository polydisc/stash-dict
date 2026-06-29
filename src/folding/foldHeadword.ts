import { nfd } from 'unorm';

/**
 * Normalizes a headword into the search key used for prefix matching.
 *
 * Pipeline: NFD decompose → strip combining marks → lowercase → trim.
 *
 * Hermes-safe design notes:
 * - `String.prototype.normalize` is absent in Hermes; `unorm` provides the
 *   equivalent NFD decomposition in pure JS.
 * - Combining marks are stripped with an explicit codepoint-range regex
 *   (/[̀-ͯ]/g, U+0300–U+036F) rather than `\p{Diacritic}` property escapes,
 *   which Hermes also lacks.
 * - This approach folds accents uniformly across Latin, Greek, and Cyrillic
 *   scripts (e.g. "Café" → "cafe", "Ελλάδα" → "ελλαδα", "Ёлка" → "елка").
 * - NFD does NOT expand ligatures (Æ stays Æ → æ after lowercase), which is
 *   acceptable for MVP prefix search.
 */
export function foldHeadword(input: string): string {
  // U+0300–U+036F: Combining Diacritical Marks block (covers Latin, Greek, Cyrillic tonos, etc.)
  return nfd(input).replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
