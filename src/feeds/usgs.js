// USGS earthquake feed adapter. Returns { events, health } and NEVER throws to
// the caller — a dead feed degrades to health.ok=false (see the failure matrix).
// Origin source for quakes; `ids` is the cross-feed join key kept for Slice 2.

import { fetchJson } from '../http.js';
import { USGS_URL } from '../config.js';
import { best, fromPager, fromMagnitude } from '../severity.js';

// ",ci41287863,us6000tafd," -> ["ci41287863","us6000tafd"]
function parseIds(ids) {
  return String(ids || '').split(',').map((s) => s.trim()).filter(Boolean);
}

function normalize(feature) {
  const p = feature.properties || {};
  const g = feature.geometry || {};
  const [lon, lat, depthKm] = g.coordinates || [];
  return {
    source: { feed: 'USGS', id: feature.id, url: p.url },
    ids: parseIds(p.ids), // join key for Slice 2 (GDACS references the us… id)
    // Non-earthquake types (quarry blast, explosion, ice quake…) are flagged,
    // not assumed away; the adapter filters them out below but keeps the count.
    hazard: p.type === 'earthquake' ? 'EQ' : 'OTHER',
    subtype: p.type,
    title: p.title || p.place,
    place: p.place || null,
    lat: lat ?? null,
    lon: lon ?? null,
    depthKm: depthKm ?? null,
    time: p.time ? new Date(p.time).toISOString() : null,
    updated: p.updated ? new Date(p.updated).toISOString() : null,
    magnitude: typeof p.mag === 'number' ? p.mag : null,
    sig: typeof p.sig === 'number' ? p.sig : null,
    tsunami: p.tsunami === 1 ? 1 : 0,
    status: p.status || null,
    severity: best([fromPager(p.alert), fromMagnitude(p.mag)]),
  };
}

export async function loadUsgs() {
  try {
    const json = await fetchJson(USGS_URL);
    const features = Array.isArray(json.features) ? json.features : [];
    const all = features.map(normalize);
    const events = all.filter((e) => e.hazard === 'EQ');
    return {
      events,
      health: { feed: 'USGS', ok: true, count: events.length, filteredNonQuake: all.length - events.length },
    };
  } catch (err) {
    // Degrade visibly — the renderer distinguishes this from "0 earthquakes".
    return { events: [], health: { feed: 'USGS', ok: false, error: err.message, count: 0 } };
  }
}
