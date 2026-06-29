import type { Database } from '../Database';
import type { ArticleType } from '../../parser';

export interface ArticleEntry {
  headword: string;
  article: string;
  articleType: ArticleType;
}

export interface DictionarySection {
  dictId: number;
  dictName: string;
  entries: ArticleEntry[];
}

export function getEntriesForHeadword(
  db: Database,
  folded: string,
  dictIds: number[] = [],
): DictionarySection[] {
  const filter = dictIds.length
    ? ` AND d.dictId IN (${dictIds.map(() => '?').join(',')})`
    : '';
  const sql = `
  SELECT d.dictId AS dictId, d.name AS dictName, d.sort_order AS sortOrder,
         e.headword AS headword, e.article AS article,
         e.article_type AS articleType, e.seq AS seq
    FROM entries e JOIN dictionaries d ON e.dictId = d.dictId
   WHERE d.enabled = 1 AND e.folded_headword = ?${filter}
  UNION
  SELECT d.dictId, d.name, d.sort_order,
         e.headword, e.article, e.article_type, e.seq
    FROM synonyms s
    JOIN dictionaries d ON s.dictId = d.dictId
    JOIN entries e ON e.dictId = s.dictId AND e.seq = s.target_seq
   WHERE d.enabled = 1 AND s.folded_headword = ?${filter}
   ORDER BY sortOrder, dictId, seq`;
  const params: unknown[] = [folded, ...dictIds, folded, ...dictIds];
  const { rows } = db.execute(sql, params);
  const sections: DictionarySection[] = [];
  let current: DictionarySection | null = null;
  for (const r of rows) {
    const dictId = r.dictId as number;
    if (!current || current.dictId !== dictId) {
      current = { dictId, dictName: r.dictName as string, entries: [] };
      sections.push(current);
    }
    current.entries.push({
      headword: r.headword as string,
      article: r.article as string,
      articleType: r.articleType as ArticleType,
    });
  }
  return sections;
}
