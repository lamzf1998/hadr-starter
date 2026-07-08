// Thin fetch wrapper with a hard timeout. The caller (feed adapter) turns a
// thrown error into a degraded-but-visible health state; this just fails fast.

import { REQUEST_TIMEOUT_MS } from './config.js';

const UA = 'hadr-monitor/0.1 (slice-1; +https://earthquake.usgs.gov)';

export async function fetchJson(url, { timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`response was not JSON (first 80: ${text.slice(0, 80).replace(/\s+/g, ' ')})`);
    }
  } finally {
    clearTimeout(timer);
  }
}
