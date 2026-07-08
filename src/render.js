// Render the situation report to dashboard.html. Self-contained, theme-aware.
// Crucially, feed health is shown so "no data" never reads like "no events".

import { writeFileSync } from 'node:fs';
import { TIMEZONE } from './config.js';

const LEVEL_CLASS = { Red: 'r', Orange: 'o', Yellow: 'y', Green: 'g', Unknown: 'u' };

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function sgt(iso) {
  if (!iso) return 'unknown time';
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone: TIMEZONE, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) + ' SGT';
  } catch {
    return esc(iso);
  }
}

function card(e) {
  const cls = LEVEL_CLASS[e.severity.level] || 'u';
  const mag = e.magnitude != null ? ` · M${e.magnitude}` : '';
  const tsu = e.tsunami === 1 ? ' · <span class="tsu">tsunami flag</span>' : '';
  const sig = e.sig != null ? ` · sig ${e.sig}` : '';
  return `
    <div class="card ${cls}">
      <div class="chip ${cls}">${esc(e.severity.level)}</div>
      <div class="body">
        <div class="title">${esc(e.title || 'Untitled earthquake')}</div>
        <div class="meta">EQ${mag} · ${esc(e.place || 'location unknown')} · ${sgt(e.time)}${tsu}</div>
        <div class="meta muted">basis: ${esc(e.severity.basis)}${sig} · ${esc(e.status || 'status unknown')}</div>
      </div>
    </div>`;
}

export function render(outPath, { significant, minor, quiet, health, now }) {
  const banner = !health.ok
    ? `<div class="banner err">USGS UNAVAILABLE — ${esc(health.error)}. No data this run. This is <b>not</b> a quiet night; it is missing data.</div>`
    : '';

  let main;
  if (!health.ok) {
    main = `<div class="quiet">No report content — the feed could not be read. See feed status below.</div>`;
  } else if (quiet) {
    main = `<div class="quiet">Nothing significant overnight. ${health.count} earthquake(s) in the past 24h, all below the significance threshold (${minor.length} minor).</div>`;
  } else {
    main = `<div class="count">${significant.length} earthquake(s) need attention · ${minor.length} minor below threshold</div>\n${significant.map(card).join('\n')}`;
  }

  const statusLi = health.ok
    ? `<li class="ok">✓ USGS: ${health.count} earthquake(s)${health.filteredNonQuake ? ` (+${health.filteredNonQuake} non-earthquake record(s) filtered)` : ''}${health.count === 0 ? ' — none in the past 24h' : ''}</li>`
    : `<li class="err">✗ USGS: UNAVAILABLE — ${esc(health.error)}</li>`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>HADR Situation Report — ${sgt(now)}</title>
<style>
  :root{--bg:#fff;--fg:#1a1a1a;--muted:#666;--line:#e2e2e2;--card:#f7f7f5;
    --r:#b3261e;--o:#e65100;--y:#b58900;--g:#2e7d32;--u:#777;--warn:#7a4a00;--errbg:#fde7e7}
  @media(prefers-color-scheme:dark){:root{--bg:#16181c;--fg:#e6e6e6;--muted:#9aa0a6;--line:#2c2f36;--card:#1e2127;
    --r:#ff8a80;--o:#ffab6b;--y:#e6c34d;--g:#7bd88f;--u:#9aa0a6;--warn:#ffcf8f;--errbg:#3a1c1c}}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .wrap{max-width:820px;margin:0 auto;padding:2.5rem 1.5rem 5rem}
  h1{font-size:1.6rem;margin:0 0 .2rem}h2{font-size:1.15rem;margin:2rem 0 .6rem;border-bottom:1px solid var(--line);padding-bottom:.3rem}
  .sub{color:var(--muted);font-size:.9rem;margin-bottom:1.5rem}
  .banner{padding:.7rem 1rem;border-radius:8px;margin:1rem 0;font-weight:600;background:var(--errbg);color:var(--r)}
  .count,.quiet{font-weight:600;margin:1rem 0}.quiet{color:var(--muted)}
  .card{display:flex;gap:.8rem;border:1px solid var(--line);border-radius:10px;padding:.7rem .9rem;margin:.6rem 0;background:var(--card)}
  .card.r{border-left:5px solid var(--r)}.card.o{border-left:5px solid var(--o)}.card.y{border-left:5px solid var(--y)}.card.g{border-left:5px solid var(--g)}.card.u{border-left:5px solid var(--u)}
  .chip{align-self:flex-start;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:.15rem .5rem;border-radius:999px;color:#fff}
  .chip.r{background:var(--r)}.chip.o{background:var(--o)}.chip.y{background:var(--y)}.chip.g{background:var(--g)}.chip.u{background:var(--u)}
  .title{font-weight:600}.meta{font-size:.85rem}.muted{color:var(--muted)}.tsu{color:var(--r);font-weight:600}
  ul{padding-left:1.2rem}.ok{color:var(--g)}.err{color:var(--r)}
  footer{margin-top:3rem;padding-top:1rem;border-top:1px solid var(--line);color:var(--muted);font-size:.8rem}
</style></head><body><div class="wrap">
  <h1>HADR Overnight Situation Report</h1>
  <div class="sub">Generated ${sgt(now)} · window: USGS all_day (rolling ~24h) · source: USGS earthquakes</div>
  ${banner}
  ${main}
  <h2>Feed status</h2>
  <ul>${statusLi}</ul>
  <footer>HADR Monitor · slice 1 (USGS only) · severity basis shown per event — "impact unknown" means the level is from magnitude, not an impact model. GDACS exposure + cross-feed dedup arrive in slice 2.</footer>
</div></body></html>`;

  writeFileSync(outPath, html);
}
