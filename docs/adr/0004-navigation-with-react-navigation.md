# Navigation with React Navigation (tabs + native stack)

## Status

accepted

## Context and decision

Phase 4b adds the second and third screens (search, entry detail) alongside the
existing dictionary-management screen, so the app needs navigation. We use
**React Navigation** — a bottom **tab navigator** (Search, Dictionaries; History
/ Favorites / Settings tabs arrive in phase 5) with a **native-stack** inside the
Search tab for Search → Entry Detail.

Considered and rejected:

- **expo-router** (file-based) — the modern Expo default, but it requires
  restructuring the app around an `app/` routing convention and its conventions;
  React Navigation drops into our existing `App.tsx` with explicit, well-typed
  navigators and no restructuring.
- **No navigation / conditional rendering** — does not scale past two screens and
  loses the stack/back behavior the detail view needs (including `bword://`
  re-lookups pushing new detail screens).

## Why

- Explicit, strongly-typed navigators; minimal disruption to the current
  `App.tsx`-rooted structure.
- Native-stack gives correct iOS push/back semantics for Search → Detail and for
  chained `bword://` headword lookups.
- Tabs are the natural home for the MVP's top-level areas (search, dictionaries,
  and later history/favorites/settings).

## Consequences

- Adds native dependencies: `@react-navigation/native`,
  `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`,
  `react-native-screens`, `react-native-safe-area-context`. These are native, so
  navigation is verified on a Dev Client, not in Jest; screens are unit-tested by
  injecting fakes for navigation and data services.
- Navigators/param lists live alongside `App.tsx` (a small `src/navigation/`),
  and screens receive their data via injected services (keeps them testable).
