import type { ArticleType } from '../../parser';

const MAX = 80;

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
};

export function articlePreview(
  raw: string | null | undefined,
  type: ArticleType,
): string {
  if (!raw) return '';
  let text = raw;
  if (type === 'h') {
    text = text.replace(/<[^>]*>/g, ' ');
    text = text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, (m) => ENTITIES[m]);
  }
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length > MAX) return `${text.slice(0, MAX)}…`;
  return text;
}
