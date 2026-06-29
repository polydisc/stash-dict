<p align="center">
  <img src="assets/icon.svg" width="88" alt="StashDict icon" />
</p>

<h1 align="center">StashDict</h1>

<p align="center">
  An offline iPhone dictionary. Import your own StarDict dictionaries and search
  them on your device.
</p>

<p align="center">
  <img src="docs/screenshots/home.png" width="180" alt="Search" />
  <img src="docs/screenshots/entry-detail.png" width="180" alt="Entry detail" />
  <img src="docs/screenshots/dark-theme.png" width="180" alt="Dark theme" />
</p>
<p align="center">
  <img src="docs/screenshots/dictionary-management.png" width="180" alt="Dictionary management" />
  <img src="docs/screenshots/favorites.png" width="180" alt="Favorites" />
  <img src="docs/screenshots/settings.png" width="180" alt="Settings" />
</p>

## Technology

- App: React Native + Expo (TypeScript)
- Storage: SQLite

## What it does

- Import StarDict dictionaries and keep them on-device.
- Incremental prefix search across enabled dictionaries, synonyms included.
- Manage multiple dictionaries: enable, disable, reorder.
- Search history and favorites.
- Dark mode and live display settings.

## Design

Layered, each layer pure and tested behind an interface.

- `src/parser/` — format-agnostic StarDict parser.
- `src/folding/` — the search key: NFD, strip combining marks, lowercase, trim.
- `src/db/` — `Database` interface, two adapters (better-sqlite3 for tests,
  op-sqlite at runtime), import engine, search, repositories.
- `src/features/` — UI slices over injectable services.

Logic is unit-tested against real SQLite. Native pieces are verified on a Dev
Client. See [SPEC.md](SPEC.md), [UI_SPEC.md](UI_SPEC.md), [CONTEXT.md](CONTEXT.md),
and `docs/adr/` for the rest.

## Build

```bash
npm test                    # Jest suite
npx tsc --noEmit            # type-check
npx expo run:ios --device   # build onto a connected iPhone
```

## Status

MVP complete. iPhone only.
