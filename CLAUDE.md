# CLAUDE.md

## Language & tooling

Node.js (>= 18), plain JavaScript, ES modules (`"type": "module"`). **Zero runtime
dependencies** — use the built-in global `fetch` and the `node:` standard library.
Do not add npm packages without recording the reason in `implementation-notes.md`.

Entry point: `node src/main.js` (also `npm run report`).

## Test command

No unit-test framework yet. Verification is end-to-end: run `npm run report` and
confirm it writes a coherent `dashboard.html`. Add a `test` script here when a
framework is introduced.

## Conventions

- ES modules with explicit `.js` extensions in imports.
- One concern per file under `src/`; feed adapters live in `src/feeds/`.
- Every feed adapter returns `{ events, health }` and never throws to the caller —
  a dead feed degrades to a visible `health.ok = false`, never a crash and never
  silently rendered as "0 events".
- Comments terse; explain *why*, not *what*.

## Deviations policy

Anything that departs from `prd.html` or this file is recorded below, with the
reason. An undocumented deviation is a bug.

### Slice 1 deviations (USGS only)
- **Provisional significance threshold** (`config.SIGNIFICANCE`: PAGER≥Yellow, tsunami,
  M≥6.0, or sig≥600). USGS has no exposure model; this is a stand-in until the GDACS
  colour replaces it in Slice 2.
- **Magnitude-derived severity is labelled "impact unknown."** Magnitude is hazard
  size, not human impact; only PAGER contributes a real impact level. No colour is
  presented as an impact assessment.
- **No overnight window filter.** The `all_day` feed is already a rolling ~24h; a
  precise 08:30 SGT boundary + scheduler is Slice 3.
- **No persistence / last-good cache.** Idempotency, corrections, and cache-backed
  degradation are Slice 3. Slice 1 still distinguishes "no data" from "no events".
