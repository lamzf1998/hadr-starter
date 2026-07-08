// Canonical "how bad". Shared module — Slice 2 reuses it across GDACS/ReliefWeb.
//
// The trap this guards against: raw magnitude is hazard SIZE, not human IMPACT.
// PAGER (impact) is preferred but is almost always null in the all_day feed, so
// magnitude-derived levels carry an explicit "(impact unknown)" basis and must
// never be presented as an impact assessment.

export const RANK = { Unknown: 0, Green: 1, Yellow: 2, Orange: 3, Red: 4 };
export const rankOf = (s) => RANK[s?.level] ?? 0;

function cap(word) {
  const w = String(word).toLowerCase();
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function normLevel(raw) {
  const l = cap(raw);
  return RANK[l] != null ? l : 'Unknown';
}

export function fromPager(alert) {
  if (!alert) return null; // usually null in real time
  return { level: normLevel(alert), basis: 'USGS PAGER impact' };
}

export function fromMagnitude(mag) {
  if (mag == null) return null;
  const level = mag >= 7 ? 'Red' : mag >= 6 ? 'Orange' : mag >= 5 ? 'Yellow' : 'Green';
  return { level, basis: `magnitude M${mag} (impact unknown)` };
}

// Highest-ranked non-null severity wins; falls back to Unknown.
export function best(candidates) {
  const list = candidates.filter(Boolean).sort((a, b) => rankOf(b) - rankOf(a));
  return list[0] || { level: 'Unknown', basis: 'no severity signal' };
}
