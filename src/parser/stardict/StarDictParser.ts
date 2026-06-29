import type {
  DictionaryFiles,
  DictionaryParser,
  ParsedDictionary,
} from '../types';
import { parseIfo } from './ifo';
import { iterateIdx } from './idx';
import { extractArticle } from './article';
import { iterateSyn } from './syn';

export class StarDictParser implements DictionaryParser {
  parse(files: DictionaryFiles): ParsedDictionary {
    const ifo = parseIfo(files.ifo);
    return {
      metadata: {
        name: ifo.bookname,
        wordCount: ifo.wordcount,
        synWordCount: ifo.synwordcount,
      },
      *entries() {
        for (const rec of iterateIdx(files.idx, ifo.idxoffsetbits)) {
          const article = extractArticle(
            files.dict,
            rec.offset,
            rec.size,
            ifo.sametypesequence,
          );
          yield {
            headword: rec.word,
            seq: rec.seq,
            articleType: article.type,
            article: article.text,
          };
        }
      },
      *synonyms() {
        if (!files.syn) return;
        for (const s of iterateSyn(files.syn)) {
          yield { synonym: s.synonym, targetSeq: s.targetSeq };
        }
      },
    };
  }
}
