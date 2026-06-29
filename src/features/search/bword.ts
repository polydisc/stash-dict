/**
 * Returns the target headword of a StarDict `bword://word` (or `bword:word`)
 * cross-reference link, URL-decoded. Returns null for any other URL so external
 * links are ignored.
 *
 * A trailing slash is stripped: HTML renderers (react-native-render-html)
 * normalize `bword://apple` to `bword://apple/`, which would otherwise fold to
 * `apple/` and miss the stored `apple` entry.
 */
export function parseBwordHref(href: string): string | null {
  const match = /^bword:(?:\/\/)?(.+)$/i.exec(href);
  if (!match) return null;
  const raw = match[1].replace(/\/+$/, '');
  if (raw === '') return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
