# SPEC — StarDict Dictionary App (MVP)

A snapshot of the as-built MVP design. Source of truth for decisions:
`docs/adr/` (ADRs). Glossary: [CONTEXT.md](CONTEXT.md).

## What it is

An offline iPhone dictionary app (Expo Dev Client, React Native, TypeScript).
Users import their own **StarDict** dictionaries as `.zip` archives and search
them fully offline.

## Scope

**In (MVP):** iPhone only · StarDict only · user-imported dictionaries ·
incremental prefix-match search (including `.syn` synonyms) · cross-dictionary
entry detail with plain + HTML rendering and `bword://` cross-references ·
multiple-dictionary management (import / enable-disable / reorder* / delete) ·
search history & favorites · theme (system/light/dark) + body font size.

**Out:** PDIC, full-text search, wildcard/fuzzy search, audio/image resources,
Android, iPad-optimized layout. (* reorder logic exists; drag UI deferred.)

## Architecture

Layered; each layer is pure and tested behind an interface.

- **`src/parser/`** — format-agnostic StarDict parser behind a `DictionaryParser`
  interface (`types.ts`). Pure: takes `Uint8Array`, yields entries + synonyms.
  Hermes-safe (hand-written UTF-8 decode; `unorm` NFD; `pako` for `.dict.dz`).
  PDIC can implement the same interface later. (ADR 0001)
- **`src/folding/foldHeadword.ts`** — the search key: NFD + strip combining marks
  + lowercase + trim. Applied identically at import and search time. (ADR 0001)
- **`src/db/`** — a synchronous `Database` interface with two adapters
  (ADR 0002): `BetterSqliteDatabase` (tests) and `OpSqliteDatabase` (runtime).
  Articles are stored in SQLite (`.dict` not kept). `schema.ts`/`queries.ts`/
  `init.ts`; `import/`, `search/`, `dictionaries/`, `userdata/`, `settings/`.
  **All shared SQL is standard SQLite and goes through the interface — no driver
  import outside an adapter.**
- **`src/theme/`** + **`src/features/settings/SettingsContext.tsx`** — unistyles
  tokens (ADR 0003); a provider applies theme + supplies live font scale.
- **`src/features/`** — UI slices; container hooks take injected services (tested
  with fakes); screens wire the real services over a shared `openAppDatabase()`.
- **`src/navigation/`** — React Navigation tabs + native stack (ADR 0004).

## Data model (SQLite)

- `dictionaries(dictId, name, word_count, enabled, sort_order)`
- `entries(id, dictId→cascade, headword, folded_headword [indexed], article,
  article_type ['m'|'h'], seq)` — **one row per entry**, no merging.
- `synonyms(id, dictId→cascade, synonym_headword, folded_headword [indexed],
  target_seq)` — resolves to an entry via `(dictId, seq)`.
- `history(folded_headword PK, headword, opened_at)`
- `favorites(folded_headword PK, headword, created_at)`
- `settings(key PK, value)`
- `PRAGMA foreign_keys = ON` at open; `user_version` = schema version (2).

## Key behaviors

- **Import:** pick a `.zip` → `loadStarDictZip` (binds the `.ifo`/`.idx`/`.dict`
  or `.dict.dz`/`.syn` set by base name; ignores macOS AppleDouble; rejects
  multi-dictionary archives) → parse → **single transaction** insert of
  dictionary + entries + synonyms; cancel/error rolls the whole dictionary back.
  Article types `m`/`h` are stored; other field types are skipped (fail-soft).
- **Search:** debounced (~150 ms) prefix range scan on `folded_headword` across
  **enabled** dictionaries (entries + synonyms), collapsed to one hit per folded
  headword, exact-match first then ascending, limit/offset.
- **Detail:** every entry for a headword across enabled dictionaries — direct +
  synonym-resolved — grouped per dictionary in user `sort_order`. `m` → plain
  text, `h` → `react-native-render-html` (script/media/embed tags ignored).
  `bword://word` links open a new lookup; external URLs are ignored. Opening a
  detail records history; a star toggles a favorite.
- **History / Favorites:** headword-level; tapping re-looks-up with the currently
  enabled dictionaries; favorites survive a dictionary being disabled or deleted.
- **Settings:** theme (system/light/dark, default system) and body font size (a
  few steps) persist in SQLite and apply live to all screens via
  `SettingsProvider` (theme → unistyles runtime; font scale → article text).

## Testing

Pure logic is unit-tested against real SQLite (`better-sqlite3`) and React
Testing Library; native UI (op-sqlite, unistyles, render-html, navigation,
document-picker) is device-verified.
