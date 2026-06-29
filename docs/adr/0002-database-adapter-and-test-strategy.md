# Database access via a sync adapter interface (op-sqlite runtime, better-sqlite3 in tests)

## Status

accepted

## Context and decision

The runtime SQLite driver is **op-sqlite** (fast, JSI-based), but it requires a
native build and a device/simulator — it cannot run under Jest/Node. Phase 1's
schema and query builders were only string-tested; we want the schema, the
queries, and the import engine covered against a **real** SQLite database in CI.

We introduce a minimal **synchronous `Database` interface** with two adapters:

- **Runtime:** `OpSqliteDatabase` (op-sqlite) — ships in the app, device-verified.
- **Tests:** `BetterSqliteDatabase` (better-sqlite3, a `devDependency`) — runs the
  real DDL, queries, and import logic against an in-memory SQLite in Node.

All schema/query/import code depends only on the `Database` interface, so the
same SQL is exercised in tests and at runtime. The test adapter is never reached
from the app's import graph (the app wires op-sqlite), so it is not bundled.

```ts
interface Database {
  execute(sql: string, params?: unknown[]): { rows: Record<string, unknown>[] };
  transaction(fn: () => void): void; // BEGIN / COMMIT, ROLLBACK on throw
  close(): void;
}
```

## Why

- Real SQL/schema/import coverage in CI without a device — catches DDL typos,
  constraint behavior, and import-rollback bugs that string tests cannot.
- The runtime adapter stays thin; op-sqlite specifics live in one file.
- A sync interface keeps both adapters simple (better-sqlite3 is sync; op-sqlite
  offers sync execution) and makes the import engine straightforward to test.

## Considered and rejected

- **Fake in-memory DB for tests** — fast but leaves the actual SQL unverified;
  the schema/queries are the risky part, so a real engine is worth it.
- **sql.js (WASM)** — pure JS, no native build, but async init and a different
  API; better-sqlite3 is synchronous, ergonomic, and builds cleanly in our env.
- **Device-only integration tests** — no CI regression net.

## Consequences

- SQL must stay within the dialect both engines support (standard SQLite — no
  op-sqlite-only extensions in shared code).
- `better-sqlite3` is a `devDependency` requiring a native build (needs
  python3 + make in CI — both present locally).
- The op-sqlite adapter is verified on device, not in unit tests; keep it thin.
