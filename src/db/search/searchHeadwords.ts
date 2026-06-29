import type { Database } from '../Database';
import type { ArticleType } from '../../parser';
import { foldHeadword } from '../../folding/foldHeadword';
import { prefixRange } from '../queries';
import { articlePreview } from './articlePreview';

export interface SearchHit {
  folded: string;
  headword: string;
  dictNames: string[];
  preview: string;
}

// Optional dictId filter: an inline `AND dictId IN (...)` is appended to BOTH the
// entries and synonyms branches when a non-empty list is given. Empty/undefined =
// all enabled. The preview is deterministic (single MIN aggregate in the main
// SELECT; dictCount-style aggregate moved out). dictNames is a second bounded
// query over the page's folded keys, ordered by dictionary sort_order.
function dictFilterClause(column: string, dictIds: number[]): string {
  if (dictIds.length === 0) return '';
  return ` AND ${column} IN (${dictIds.map(() => '?').join(',')})`;
}

export function searchHeadwords(
  db: Database,
  query: string,
  opts: { limit?: number; offset?: number; dictIds?: number[] } = {},
): SearchHit[] {
  const { lo, hi } = prefixRange(query);
  if (lo === '') return [];
  const exact = foldHeadword(query);
  const limit = opts.limit ?? 200;
  const offset = opts.offset ?? 0;
  const dictIds = opts.dictIds ?? [];

  const eFilter = dictFilterClause('e.dictId', dictIds);
  const sFilter = dictFilterClause('s.dictId', dictIds);

  const searchSql = `
    WITH matches AS (
      SELECT e.folded_headword AS folded, e.headword AS headword,
             substr(e.article, 1, 300) AS article, e.article_type AS articleType
        FROM entries e JOIN dictionaries d ON e.dictId = d.dictId
       WHERE d.enabled = 1 AND e.folded_headword >= ? AND e.folded_headword < ?${eFilter}
      UNION ALL
      SELECT s.folded_headword AS folded, s.synonym_headword AS headword,
             substr(e.article, 1, 300) AS article, e.article_type AS articleType
        FROM synonyms s JOIN dictionaries d ON s.dictId = d.dictId
        JOIN entries e ON e.dictId = s.dictId AND e.seq = s.target_seq
       WHERE d.enabled = 1 AND s.folded_headword >= ? AND s.folded_headword < ?${sFilter}
    )
    SELECT m.folded,
           MIN(m.headword) AS headword,
           m.article AS previewRaw,
           m.articleType AS previewType
      FROM matches m
     GROUP BY m.folded
     ORDER BY (m.folded = ?) DESC, m.folded ASC
     LIMIT ? OFFSET ?`;

  const params: unknown[] = [lo, hi, ...dictIds, lo, hi, ...dictIds, exact, limit, offset];
  const { rows } = db.execute(searchSql, params);
  const hits: SearchHit[] = rows.map((r) => ({
    folded: r.folded as string,
    headword: r.headword as string,
    dictNames: [],
    preview: articlePreview(
      r.previewRaw as string | null,
      (r.previewType as ArticleType) ?? 'm',
    ),
  }));
  if (hits.length === 0) return hits;

  const foldedKeys = hits.map((h) => h.folded);
  const inFolded = foldedKeys.map(() => '?').join(',');
  const namesSql = `
    SELECT folded, name FROM (
      SELECT e.folded_headword AS folded, d.name AS name, d.sort_order AS so, d.dictId AS dictId
        FROM entries e JOIN dictionaries d ON e.dictId = d.dictId
       WHERE d.enabled = 1 AND e.folded_headword IN (${inFolded})${eFilter}
      UNION
      SELECT s.folded_headword AS folded, d.name AS name, d.sort_order AS so, d.dictId AS dictId
        FROM synonyms s JOIN dictionaries d ON s.dictId = d.dictId
        JOIN entries e ON e.dictId = s.dictId AND e.seq = s.target_seq
       WHERE d.enabled = 1 AND s.folded_headword IN (${inFolded})${sFilter}
    )
    GROUP BY folded, dictId
    ORDER BY so, dictId`;
  const nameParams: unknown[] = [...foldedKeys, ...dictIds, ...foldedKeys, ...dictIds];
  const { rows: nameRows } = db.execute(namesSql, nameParams);

  const byFolded = new Map<string, string[]>();
  for (const r of nameRows) {
    const f = r.folded as string;
    const list = byFolded.get(f) ?? [];
    list.push(r.name as string);
    byFolded.set(f, list);
  }
  for (const h of hits) h.dictNames = byFolded.get(h.folded) ?? [];
  return hits;
}
