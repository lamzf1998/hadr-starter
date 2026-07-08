// Slice 1 knobs. USGS-only. Values here are provisional starting points; ratify
// in implementation-notes.md / CLAUDE.md Deviations as the project matures.

export const TIMEZONE = 'Asia/Singapore'; // report boundary is 08:30 here (UTC+8)
export const REQUEST_TIMEOUT_MS = 15000;

// USGS "all earthquakes, past day" — a rolling ~24h window, regenerated ~every
// minute. Slice 1 uses the feed's own window; a precise SGT overnight boundary
// arrives with the scheduler in Slice 3.
export const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

// Provisional USGS-only significance — what breaks silence. TBD: superseded by
// the GDACS exposure model in Slice 2 (magnitude is hazard size, not impact).
export const SIGNIFICANCE = {
  minMagnitude: 6.0, // M6.0+ regardless of modelled impact
  minSig: 600,       // USGS composite significance (0–1000+)
  minPagerLevel: 'Yellow', // real PAGER impact alert at Yellow or above
};
