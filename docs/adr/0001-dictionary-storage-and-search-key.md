# Dictionary storage and search-key strategy

## Status

accepted

## Context and decision

We store imported StarDict dictionaries in **SQLite, with each article body held
in the database**, not in the original `.dict` file. On import we parse
`.ifo`/`.idx`/`.syn`, decompress `.dict.dz` if needed, slice out each article,
and write one row per entry (headword + article). The `.dict` file is discarded
after import; the database is self-contained.

For incremental prefix search, each entry carries a **`folded_headword`** column
— the headword lowercased and with diacritics stripped (Unicode NFD, combining
marks removed). Search input is folded the same way, so lookup is a range query
(`folded_headword >= ? AND folded_headword < ?`) under the default `BINARY`
collation. The original `headword` is retained for display.

## Why

- **Articles in SQLite** avoids runtime file-handle/byte-offset complexity and
  corruption risk, keeps each dictionary's data in one consistent store, and
  leaves room to add full-text search later. The storage cost is comparable to
  keeping `.dict` on disk anyway.
- **A folded key** gives case- and accent-insensitive prefix matching (natural
  for a dictionary) with a fast `BINARY` range scan, avoiding locale-dependent
  collations. This matches StarDict's own case-insensitive ordering while also
  folding accents, which its `g_ascii_strcasecmp`-style ordering does not.

## Considered and rejected

- **Index-only in SQLite + byte-range reads from `.dict`** — leaner DB but two
  artifacts to keep consistent and more failure modes. Rejected.
- **Fold case only, preserve accents** — stricter matching; rejected as too
  strict for everyday dictionary lookup in the MVP.

## Consequences

Changing the folding rule later requires re-importing (re-indexing) every
dictionary, since `folded_headword` is materialized at import time.
