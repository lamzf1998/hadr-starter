// Triage: which earthquakes break silence, sorted worst-first.
// Provisional USGS-only rule (see config.SIGNIFICANCE) — replaced by the GDACS
// exposure model in Slice 2.

import { SIGNIFICANCE } from './config.js';
import { RANK, rankOf } from './severity.js';

const PAGER_MIN = RANK[SIGNIFICANCE.minPagerLevel];

function isSignificant(e) {
  if (e.tsunami === 1) return true;
  if (e.magnitude != null && e.magnitude >= SIGNIFICANCE.minMagnitude) return true;
  if (e.sig != null && e.sig >= SIGNIFICANCE.minSig) return true;
  // A PAGER level counts, but a magnitude-derived level does NOT (that would be
  // treating hazard size as impact — the trap). Gate on the real-impact basis.
  if (e.severity.basis.startsWith('USGS PAGER') && rankOf(e.severity) >= PAGER_MIN) return true;
  return false;
}

export function assess(events) {
  const significant = events.filter(isSignificant).sort(
    (a, b) =>
      rankOf(b.severity) - rankOf(a.severity) ||
      (b.sig || 0) - (a.sig || 0) ||
      Date.parse(b.time || 0) - Date.parse(a.time || 0)
  );
  const minor = events.filter((e) => !isSignificant(e));
  return { significant, minor, quiet: significant.length === 0 };
}
