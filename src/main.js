// Orchestrator for one run (the "loop", driven manually for now):
// loadUsgs -> assess -> render dashboard.html -> console summary.
// The feed adapter never throws; a dead feed degrades to a visible health state.

import { loadUsgs } from './feeds/usgs.js';
import { assess } from './assess.js';
import { render } from './render.js';

const OUT = 'dashboard.html';

async function run() {
  const now = new Date().toISOString();
  const { events, health } = await loadUsgs();
  const { significant, minor, quiet } = assess(events);

  render(OUT, { significant, minor, quiet, health, now });

  const status = health.ok ? `${health.count} quake(s)` : `DOWN (${health.error})`;
  console.log(`[${now}] USGS ${status} -> significant=${significant.length} minor=${minor.length} -> ${OUT}`);
  if (quiet && health.ok) console.log('  quiet: nothing above threshold.');
  if (!health.ok) process.exitCode = 2; // degraded run — visible to whoever drives the loop
}

run().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
