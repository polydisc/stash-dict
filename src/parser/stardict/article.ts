import { ByteReader } from '../binary';
import type { ArticleType } from '../types';

export interface Article {
  type: ArticleType;
  text: string;
}

interface Segment {
  type: ArticleType;
  text: string;
}

function isUpper(typeChar: string): boolean {
  return typeChar >= 'A' && typeChar <= 'Z';
}

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Reads one NUL-terminated lowercase-type field as text. */
function readCStringField(reader: ByteReader): string {
  return reader.cstring();
}

/** Collects renderable (m/h) segments from a data block. */
function collectSegments(block: Uint8Array, sametypesequence?: string): Segment[] {
  const reader = new ByteReader(block);
  const segments: Segment[] = [];

  const pushIfRenderable = (typeChar: string, text: string): void => {
    if (typeChar === 'm' || typeChar === 'h') {
      segments.push({ type: typeChar, text });
    }
  };

  if (sametypesequence && sametypesequence.length > 0) {
    for (let i = 0; i < sametypesequence.length; i++) {
      const typeChar = sametypesequence[i];
      const isLast = i === sametypesequence.length - 1;
      if (isLast) {
        if (isUpper(typeChar)) {
          // Final uppercase field: remaining bytes are binary; skip.
          reader.take(reader.remaining());
        } else {
          pushIfRenderable(typeChar, reader.restAsString());
        }
      } else if (isUpper(typeChar)) {
        if (reader.remaining() < 4) break;
        const len = reader.uint32();
        reader.take(len); // skip binary
      } else {
        // StarDict spec guarantees text-type fields (m/h/g…) contain no internal NUL,
        // so cstring() termination is correct here.
        pushIfRenderable(typeChar, readCStringField(reader));
      }
    }
  } else {
    while (!reader.eof) {
      const typeChar = String.fromCharCode(reader.uint8());
      if (isUpper(typeChar)) {
        if (reader.remaining() < 4) break;
        const len = reader.uint32();
        reader.take(len); // skip binary
      } else {
        pushIfRenderable(typeChar, readCStringField(reader));
      }
    }
  }
  return segments;
}

export function extractArticle(
  dict: Uint8Array,
  offset: number,
  size: number,
  sametypesequence?: string,
): Article {
  const start = Math.max(0, Math.min(offset, dict.length));
  const end = Math.max(start, Math.min(offset + size, dict.length));
  const block = dict.subarray(start, end);

  const segments = collectSegments(block, sametypesequence);
  if (segments.length === 0) {
    return { type: 'm', text: '' };
  }

  const hasHtml = segments.some((s) => s.type === 'h');
  if (!hasHtml) {
    return { type: 'm', text: segments.map((s) => s.text).join('\n') };
  }

  // Mixed/HTML: escape plain segments, keep html segments verbatim.
  const text = segments
    .map((s) => (s.type === 'h' ? s.text : htmlEscape(s.text)))
    .join('');
  return { type: 'h', text };
}
