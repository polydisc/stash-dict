// Builds a tiny, self-authored StarDict dictionary and zips it to
// assets/dev-seed.zip for development seeding (see src/dev/seedDevDictionary.ts).
// All content is original, so there is no licensing concern. The sample
// deliberately exercises plain (m) and HTML (h) articles, a .syn synonym, and a
// bword:// cross-reference, so search/detail/links can be tried on a device
// without importing a real dictionary.
//
// Run: node scripts/build-dev-seed.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { zipSync } from 'fflate';

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, '..', 'assets', 'dev-seed.zip');

const utf8 = (s) => new Uint8Array(Buffer.from(s, 'utf8'));
const u32be = (n) => Uint8Array.from([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
const concat = (arrs) => {
  const total = arrs.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrs) {
    out.set(a, off);
    off += a.length;
  }
  return out;
};

// Each entry (no sametypesequence): [type byte][text bytes][NUL].
const entries = [
  { word: 'apple', type: 'm', text: 'a common round fruit, usually red or green.' },
  { word: 'book', type: 'm', text: 'a set of printed pages bound together.' },
  { word: 'color', type: 'm', text: 'the property of an object of producing different sensations on the eye; American spelling.' },
  { word: 'rich', type: 'h', text: '<b>rich</b>: having much wealth. See also <a href="bword://apple">apple</a>.' },
];
// Synonym: colour -> color (index 2 in the entry list above).
const synonyms = [{ word: 'colour', targetIndex: 2 }];

const dictParts = [];
const idxParts = [];
let offset = 0;
for (const e of entries) {
  const block = concat([utf8(e.type), utf8(e.text), Uint8Array.from([0])]);
  dictParts.push(block);
  idxParts.push(concat([utf8(e.word), Uint8Array.from([0]), u32be(offset), u32be(block.length)]));
  offset += block.length;
}
const dict = concat(dictParts);
const idx = concat(idxParts);
const syn = concat(synonyms.map((s) => concat([utf8(s.word), Uint8Array.from([0]), u32be(s.targetIndex)])));

const ifo = utf8(
  [
    "StarDict's dict ifo file",
    'version=2.4.2',
    'bookname=Dev Sample',
    `wordcount=${entries.length}`,
    `synwordcount=${synonyms.length}`,
    `idxfilesize=${idx.length}`,
  ].join('\n') + '\n',
);

const zip = zipSync({
  'dev-sample.ifo': ifo,
  'dev-sample.idx': idx,
  'dev-sample.dict': dict,
  'dev-sample.syn': syn,
});

writeFileSync(outPath, zip);
console.log(`wrote ${outPath} (${zip.length} bytes, ${entries.length} entries, ${synonyms.length} synonym)`);
