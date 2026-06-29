# UI styling and theming with react-native-unistyles

## Status

accepted

## Context and decision

Phase 3b introduces the first real UI. The app needs theming (light / dark /
follow-system per the spec), a body font-size setting that scales article text,
and a small set of utilitarian screens (dictionary management, then search,
detail, history/favorites, settings). It is **iPhone-only** with no web target.

We use **`react-native-unistyles` (v3)** for styling and theming, with plain
React Native components — not a full component kit.

Considered and rejected (see the brainstorming decision):

- **Tamagui** (issue #6) — strong theming and a component kit, but its biggest
  value (universal RN + Web, large design systems) does not apply to an
  iPhone-only, small-UI app; it adds a heavier compiler/setup and carries
  bleeding-edge-SDK (Expo 56 / RN 0.85) compatibility risk. Overkill here.
- **NativeWind / plain StyleSheet + ThemeContext** — viable; unistyles was
  chosen for first-class theme tokens + dark mode + runtime-cheap variants with
  minimal lock-in.

## Why

- Theme tokens make light/dark/system and font-size scaling (both MVP
  requirements) clean and centralized.
- No component-kit lock-in: we keep using plain RN components, so swapping later
  is cheap.
- Lighter setup and lower SDK-churn risk than Tamagui for this surface.

## Consequences

- unistyles v3 is native (Nitro module + babel plugin) — it requires the Expo
  **Dev Client** (already our setup) and cannot run in Expo Go; in Jest it is
  mocked, so component tests stub the styling layer.
- Theme definitions live in one place (`src/theme/`); components consume tokens
  rather than hard-coding colors/sizes, so dark mode and font scaling are global.
- Visual/device verification of unistyles-styled screens is deferred to a real
  dev client (this CI/dev environment has no simulator).
