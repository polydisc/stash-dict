# UI Spec — Editorial Redesign

**Date:** 2026-06-29
**Status:** Approved direction, pending implementation plan
**Scope:** Visual redesign of all 6 app screens (search, entry detail, dictionary
management, history, favorites, settings). No changes to the parser, DB schema,
import engine, search SQL semantics, or feature behavior beyond what is noted in
"Data-layer touches" below.

## Goal

Replace the current plain, iOS-system-color UI with a deliberate **editorial**
aesthetic — "the refinement of a fine printed dictionary." The MVP is feature
complete; this work is purely about look, feel, and a small number of search-UX
refinements that fall out of the new design. Stay on the existing styling
foundation (unistyles, ADR 0003) — do **not** adopt tamagui.

## Design decisions (locked during brainstorming)

| Aspect | Decision |
| --- | --- |
| Visual direction | **Classic serif / cream paper** (editorial). Warm cream background, gold-brown accent, generous whitespace. |
| Typeface | **iOS system serif (New York)**, with **Georgia as the verified fallback** (see Typography risk). No bundled custom fonts. |
| Light theme | Paper `#f6f1e7`, surface `#eee5d3`, hairline `#e4dac4`, text `#2b2722`, muted `#6c6c70`, accent (gold) `#9a7b3f`. |
| Dark theme | **Flat mocha** — background `#6e5a48`, text `#f3ece0`, accent (gold) `#f1d79a`, hairline `rgba(255,255,255,.18)`. Pure-black avoided deliberately (eye comfort; Material-style raised surface). |
| Styling foundation | **unistyles continues.** Add only: `@expo/vector-icons` (thin line icons, Feather set), `react-native-reanimated` (restrained motion), `expo-haptics` (light taps). No tamagui, no expo-blur. |
| Motion | Restrained: list-row press feedback, entry-detail fade-in. Nothing flashy. |
| Search layout | **Bottom search bar** (thumb reach); results list grows upward above it. |
| Search result row | **Rich row:** headword with matched-prefix in gold, one-line muted definition preview, and an "N辞書" count when the headword exists in more than one enabled dictionary. |
| Empty state (no query) | **Favorites (chips) + Recent searches (list).** |
| Multiple dictionaries | **Unified, deduplicated by headword.** One row per folded headword; the entry-detail screen stacks every enabled dictionary's article (already the data shape). |

## Architecture

Layered exactly as today. All visual logic lives in the theme + a new shared
component layer; feature screens consume tokens and primitives. No driver or DB
changes beyond the two small additive queries noted below.

### 1. Theme tokens — `src/theme/themes.ts`

Extend both `lightTheme` and `darkTheme` (keeping the existing `AppTheme` shape
contract) with:

- `colors`: add `surfaceAlt`, `hairline`, `accent`, `onAccent`, `headword`
  (keep existing `background`, `surface`, `text`, `textMuted`, `border`,
  `primary`, `onPrimary`, `danger`). Values per the table above.
- `fonts`: `serifDisplay`, `serifText` (resolved font-family strings; see risk).
- `radii`: `sm` 10, `md` 14, `lg` 18, `pill` 999.
- `fontSizes`: add `display` (34) above the existing `sm/md/lg/xl`.
- `spacing` unchanged (the `(n) => n*8` helper).

`src/theme/unistyles.ts` registers the extended themes unchanged in mechanism.

### 2. Shared primitives — new `src/theme/components/`

Small, single-purpose, theme-driven components so all six screens stay
consistent and each screen file shrinks to layout + data wiring:

- `Screen` — themed background + safe-area padding + status-bar style binding.
- `AppText` — `variant`: `display | headword | body | label | muted`. Centralizes
  serif vs sans, size, color, weight.
- `Card` — surface panel (radius, padding, hairline) used by empty-state and
  detail sections.
- `ListRow` — pressable row with press feedback + light haptic; used by search
  results, history, favorites, dictionary list.
- `SearchField` — the bottom search input (icon, clear button, themed).
- `IconButton` — `@expo/vector-icons` wrapper with hit-slop + a11y label.
- `SectionHeader` — small-caps gold label (e.g. "最近の検索", dictionary names).
- `Divider` — hairline rule.

Each is independently testable with the existing
`__mocks__/react-native-unistyles.ts` mock.

### 3. Screen application

Order of work (reflected in the implementation plan's phasing):

1. **Search** (`SearchScreen`) — bottom `SearchField`; results via `ListRow`
   (headword + gold prefix highlight + muted preview + "N辞書"); empty state with
   favorites chips + recent list.
2. **Entry detail** (`EntryDetailScreen` + `ArticleView`) — editorial header
   (display headword, gold star), per-dictionary `SectionHeader`, and updated
   `ArticleView` `baseStyle`/`tagsStyles` for serif body, link color, blockquote
   examples. Fade-in on mount.
3. **Dictionary management, History, Favorites, Settings** — re-skin with
   `Screen`/`AppText`/`ListRow`/`Card`/`SectionHeader`/`IconButton`. Behavior
   unchanged.

### 4. Data-layer touches (small, additive)

Driven by the rich search row. Both are additive and go through the `Database`
interface (standard SQLite):

- **`searchHeadwords` → `SearchHit`**: add `dictCount` via
  `COUNT(DISTINCT dictId)` (project `dictId` into the `matches` CTE). Renders the
  "N辞書" indicator; `1` hides it.
- **Definition preview**: a one-line, HTML-stripped, truncated snippet of the
  primary (`m`/`h`) article per headword. This is the only non-trivial cost —
  joining/snippet-extracting for up to ~200 rows. Treat preview as a **separable
  sub-feature**: implement behind a clear function boundary, measure on-device,
  and if it regresses incremental-search latency, fetch previews lazily for
  visible rows (or drop to headword-only rows). Headword + gold highlight +
  "N辞書" is the must-have; preview is the nice-to-have that must not slow typing.

No schema migration. No change to import, folding, or search ordering semantics.

## Behavioral invariants (unchanged)

- Search stays incremental prefix-match over **enabled** dictionaries, including
  `.syn` synonyms; ordering (exact-match first, then folded ascending) is
  preserved.
- Entry detail continues to scope to enabled dictionaries and stack one section
  per dictionary in existing order.
- History/favorites/settings logic and persistence are untouched.
- All-or-nothing import, adapter boundaries, and the "no test driver/mocks in the
  runtime import graph" invariant are untouched.

## Risks / open implementation details

- **Typography (highest risk).** iOS "New York" (SF Serif) is not reliably
  addressable by a plain `fontFamily` string in React Native; it is a system font
  selected via font descriptor. The plan must **verify on a Dev Client** whether
  a family string renders New York; if not, fall back to **Georgia** (reliably
  available, visually very close) without bundling fonts. `serifDisplay`/
  `serifText` tokens isolate this so the decision is one place.
- **Dark-mode contrast.** Mocha `#6e5a48` × cream `#f3ece0` must meet WCAG AA for
  body text; verify and deepen the background slightly if it fails. Accent gold on
  mocha is for labels/non-essential text, not body.
- **Preview performance** — see Data-layer touches.
- **Existing component tests** assert behavior/text/testIDs and render through the
  unistyles mock; re-skinning should keep them green. Update only assertions that
  pin specific style values.

## Testing strategy

- **Jest (Node):** unchanged logic suites stay green. New: `themes.test.ts`
  extended for the new tokens (both themes define every key); `searchHeadwords`
  test for `dictCount`; preview-snippet extraction unit-tested (HTML strip +
  truncation is pure). Primitive components get light render tests via the mock.
- **Type-check:** `npx tsc --noEmit` clean.
- **Device (Dev Client) verification items:** New York vs Georgia resolution;
  both light/dark themes across all 6 screens; dark-mode body contrast;
  bottom-bar keyboard avoidance + clear button; rich-row preview latency while
  typing; row press haptics; entry-detail fade-in; status-bar style per theme.

## Acceptance criteria

1. All 6 screens render the editorial light theme and flat-mocha dark theme,
   driven entirely by theme tokens (no hard-coded colors in screens).
2. Serif typography applied (New York or verified Georgia fallback) via
   `serifDisplay`/`serifText`; one documented fallback path.
3. Search: bottom search bar; results show headword with gold prefix highlight,
   "N辞書" when >1, and a definition preview that does not regress typing latency
   (or is degraded gracefully per the preview plan).
4. Search empty state shows favorites chips + recent searches.
5. Entry detail uses the editorial header + per-dictionary sections + serif
   article styling; opens with a restrained fade-in.
6. Only `@expo/vector-icons`, `react-native-reanimated`, `expo-haptics` added;
   unistyles retained; ADR 0003 still holds (note this redesign in passing).
7. `npm test` and `npx tsc --noEmit` pass.

## Out of scope

- tamagui / any styling-foundation migration; glassmorphism / `expo-blur`.
- "Word of the day" (considered for the empty state, deferred — not MVP).
- Grouped-by-dictionary or per-dictionary filtering of results (M1/M3); we chose
  the deduplicated unified list (M2).
- Any new feature behavior, schema change, Android/iPad layout work.

## Phasing (for the implementation plan)

1. **Foundation** — theme tokens + shared primitives (+ their tests).
2. **Reading screens** — Search (incl. `dictCount`, preview, empty state) +
   Entry detail / ArticleView.
3. **Remaining screens** — dictionary management, history, favorites, settings.

Each phase ends with `npm test` + `npx tsc --noEmit` green and its device-
verification items recorded.
