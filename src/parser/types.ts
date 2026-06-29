/** Raw bytes for one dictionary. `dict` is already decompressed (.dict.dz inflated). */
export interface DictionaryFiles {
  ifo: Uint8Array;
  idx: Uint8Array;
  dict: Uint8Array;
  syn?: Uint8Array;
}

export interface DictionaryMetadata {
  name: string;
  wordCount: number;
  synWordCount: number;
}

export type ArticleType = 'm' | 'h';

export interface ParsedEntry {
  headword: string;
  seq: number;
  articleType: ArticleType;
  article: string;
}

export interface ParsedSynonym {
  synonym: string;
  targetSeq: number;
}

export interface ParsedDictionary {
  metadata: DictionaryMetadata;
  entries(): Generator<ParsedEntry>;
  synonyms(): Generator<ParsedSynonym>;
}

/**
 * Format-agnostic parser. StarDict is the only implementation in the MVP;
 * PDIC can implement the same interface later without changing phases 3–5.
 */
export interface DictionaryParser {
  parse(files: DictionaryFiles): ParsedDictionary;
}
