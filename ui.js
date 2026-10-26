// Ticker Tycoon UI — rewritten for the v2 engine (S.v === 2).
// Plain JS, no framework. Original art and names only.
// Wiring note: this file uses ONLY engine functions that exist in
// data.js / sim.js / world-events.js / mapview.js / cityview.js.
'use strict';

let W = null, S = null;
const UI = { panel: null, stack: [], modal: null, placing: false, hire: null, q: '', cat: 'All', starOnly: false,
  range: '1Y', tradeRange: '1Y', web: { view: 'home', q: '', a3: null }, pick: null,
  mode: 'normal', color: LOGO_COLORS[0], acc: 0, lastPanel: 0, lastDraw: 0, lastSave: 0, expandedCompany: null, companyInit: false };
const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const upCls = x => x >= 0 ? 'up' : 'down';
// Time does NOT move on its own, and there is no age limit. The game
// year only moves on the fixed Age bar at the bottom: + ages up one year
// (free, runs stepYear()), − ages down one year (ad-gated, restores the
// year snapshot taken before the last Age up, session only, up to 10
// years back). Swiping the Age bar right / left does the same. Vehicles
// animate on the map's own requestAnimationFrame loop, independent of
// game time, so they keep moving while the player waits between Age
// presses. A player can live 100 years, or 1000.
const DAY_MS_BY_SPEED = [0, 0, 0, 0];
const IC = {
  more: '<svg viewBox="0 0 28 28"><circle cx="6" cy="14" r="2.6" fill="currentColor"/><circle cx="14" cy="14" r="2.6" fill="currentColor"/><circle cx="22" cy="14" r="2.6" fill="currentColor"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chev: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pause: '<svg viewBox="0 0 20 20"><rect x="5" y="4" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="11.5" y="4" width="3.5" height="12" rx="1" fill="currentColor"/></svg>',
  play1: '<svg viewBox="0 0 20 20"><path d="M6 4l10 6-10 6z" fill="currentColor"/></svg>',
  play2: '<svg viewBox="0 0 20 20"><path d="M2 4l8 6-8 6zM10 4l8 6-8 6z" fill="currentColor"/></svg>',
  play3: '<svg viewBox="0 0 20 20"><path d="M1 4l6 6-6 6zM7 4l6 6-6 6zM13 4l6 6-6 6z" fill="currentColor"/></svg>',
};
// Option A icons (Nicholas's pick): thin 1.6px blue outline on white,
// no fill, original geometry. Used for UI chrome only — country flags,
// sector/store/decor item art and star ratings are content, not chrome,
// and are left alone (see report).
const ic24 = inner => '<svg viewBox="0 0 24 24" fill="none" stroke="#1d6fe0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
const ICONS = {
  search: ic24('<circle cx="12" cy="12" r="7"/><line x1="17" y1="17" x2="21" y2="21"/>'),
  news: ic24('<rect x="3" y="5" width="18" height="14" rx="2"/><line x1="7" y1="9" x2="13" y2="9"/><line x1="7" y1="13" x2="17" y2="13"/><line x1="7" y1="16" x2="14" y2="16"/><rect x="15" y="8" width="4" height="4"/>'),
  mail: ic24('<rect x="3" y="6" width="18" height="12" rx="2"/><polyline points="3,7 12,14 21,7"/>'),
  website: ic24('<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><line x1="3" y1="12" x2="21" y2="12"/>'),
  crypto: ic24('<circle cx="12" cy="12" r="9"/><path d="M9 8 h4 a2.5 2.5 0 0 1 0 5 h-4 M9 13 h5 a2.5 2.5 0 0 1 0 5 h-5 M9 6 v12 M13 6 v12"/>'),
  bank: ic24('<path d="M3 10 L12 4 L21 10"/><line x1="5" y1="12" x2="5" y2="18"/><line x1="9" y1="12" x2="9" y2="18"/><line x1="15" y1="12" x2="15" y2="18"/><line x1="19" y1="12" x2="19" y2="18"/><line x1="3" y1="20" x2="21" y2="20"/>'),
  sports: ic24('<path d="M8 4 h8 v4 a4 4 0 0 1 -8 0 z"/><path d="M8 6 H5 a2 2 0 0 0 2 4 M16 6 h3 a2 2 0 0 1 -2 4"/><path d="M12 12 v4 M8 20 h8 M10 16 h4"/>'),
  settings: ic24('<circle cx="12" cy="12" r="3.5"/><path d="M12 3 v3 M12 18 v3 M3 12 h3 M18 12 h3 M5.5 5.5 l2 2 M16.5 16.5 l2 2 M18.5 5.5 l-2 2 M7.5 16.5 l-2 2"/>'),
  war: ic24('<path d="M12 3 L20 6 v6 c0 5 -3.5 8 -8 9 c-4.5 -1 -8 -4 -8 -9 V6 z"/><path d="M9 12 l2 2 4 -5"/>'),
  leave: ic24('<path d="M4 4 h10 v16 H4"/><path d="M14 12 h7 M18 9 l3 3 -3 3"/>'),
  leader: ic24('<path d="M4 17 h16 M4 8 l2 -3 3 3 3 -4 3 4 3 -3 2 3 v9 H4 z"/>'),
  markets: ic24('<polyline points="4,18 9,12 13,15 20,6"/><line x1="20" y1="6" x2="20" y2="10"/><line x1="20" y1="6" x2="16" y2="6"/>'),
  airport: ic24('<path d="M21 5 L3 12 l6 2 2 6 3 -6 7 -9 z"/>'),
  city: ic24('<path d="M12 3 l2.5 5.5 6 .7 -4.5 4 1.2 6 L12 16 l-5.2 3.2 1.2 -6 -4.5 -4 6 -.7 z"/>'),
  portfolio: ic24('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7 V5 a2 2 0 0 1 2 -2 h2 a2 2 0 0 1 2 2 v2 M3 13 h18"/>'),
  nation: ic24('<path d="M5 21 V4"/><path d="M5 4 h13 l-2.5 4 L18 12 H5"/>'),
  military: ic24('<path d="M12 3 l8 3 v6 c0 5 -3.5 8 -8 9 c-4.5 -1 -8 -4 -8 -9 V6 z"/><path d="M12 8 v5 M9 11 h6"/>'),
  company: ic24('<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7 h2 M14 7 h2 M8 11 h2 M14 11 h2 M8 15 h2 M14 15 h2 M10 21 v-3 h4 v3"/>'),
  house: ic24('<path d="M3 11 l9 -7 9 7"/><path d="M5 10 v10 h14 V10"/><path d="M10 20 v-6 h4 v6"/>'),
  hq: ic24('<path d="M3 21 V9 l6 5 V9 l6 5 V9 l6 -3 v15 z"/><line x1="3" y1="21" x2="21" y2="21"/>'),
  mars: ic24('<circle cx="12" cy="12" r="7"/><ellipse cx="12" cy="12" rx="10" ry="3.5"/>'),
  goals: ic24('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>'),
  minigames: ic24('<rect x="3" y="7" width="18" height="11" rx="5"/><path d="M7 11 v4 M5 13 h4"/><circle cx="17" cy="13" r="1.2"/>'),
  help: ic24('<circle cx="12" cy="12" r="9"/><path d="M9.5 9 a2.5 2.5 0 0 1 5 .5 c0 1.5 -2.5 2 -2.5 3.5"/><path d="M12 17 h.01"/>'),
  bell: ic24('<path d="M18 10 a6 6 0 0 0 -12 0 c0 3 -1 4 -1 4 h14 s-1 -1 -1 -4"/><path d="M6 17 h12 M10 20 a2 2 0 0 0 4 0"/>'),
  create: ic24('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8 v8 M8 12 h8"/>'),
  customize: ic24('<path d="M4 20 l1 -4 L16 5 l3 3 L8 19 z"/><path d="M14 7 l3 3"/>'),
  card: ic24('<rect x="3" y="6" width="18" height="12" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="15" x2="11" y2="15"/>'),
  merge: ic24('<rect x="3" y="3" width="9" height="9" rx="1.5"/><rect x="12" y="12" width="9" height="9" rx="1.5"/><path d="M12 7 l5 5"/>'),
  menu: ic24('<path d="M4 7 h16 M4 12 h16 M4 17 h16"/>'),
  profile: ic24('<circle cx="12" cy="8" r="4"/><path d="M4 20 c1 -4 4 -6 8 -6 s7 2 8 6"/>'),
  burst: ic24('<path d="M12 3 v4 M12 17 v4 M3 12 h4 M17 12 h4 M5.5 5.5 l3 3 M15.5 15.5 l3 3 M18.5 5.5 l-3 3 M8.5 15.5 l-3 3"/>'),
  port: ic24('<circle cx="12" cy="5" r="2.5"/><path d="M12 8 v13 M4 13 h16 M5 13 c0 4 3 7 7 7 s7 -3 7 -7"/>'),
  factory: ic24('<path d="M3 21 V10 l6 4 V10 l6 4 V7 l6 -2 v14 z"/>'),
  defense: ic24('<path d="M12 3 l8 3 v6 c0 5 -3.5 8 -8 9 c-4.5 -1 -8 -4 -8 -9 V6 z"/>'),
  sam: ic24('<path d="M12 3 c3 3 4 6 4 9 l-4 4 -4 -4 c0 -3 1 -6 4 -9 z"/><circle cx="12" cy="11" r="2"/><path d="M8 16 l-3 5 M16 16 l3 5"/>'),
  silo: ic24('<path d="M9 21 V8 l3 -5 3 5 v13"/><path d="M9 12 h6 M9 17 h6"/>'),
  warship: ic24('<path d="M3 14 l18 -2 -2 5 H5 z"/><path d="M12 12 V6 M8 8 h8"/>'),
  troops: ic24('<circle cx="12" cy="8" r="4"/><path d="M4 20 c1 -4 4 -6 8 -6 s7 2 8 6"/>'),
  slug: ic24('<ellipse cx="12" cy="11" rx="3" ry="5"/><path d="M12 16 v5"/>'),
  artillery: ic24('<circle cx="7" cy="17" r="3"/><path d="M9 15 L20 6 M17 5 l4 1 -1 4"/>'),
  strike: ic24('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>'),
  railgun: ic24('<path d="M13 3 L5 14 h6 l-1 7 8 -11 h-6 z"/>'),
  atom: ic24('<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="9" ry="4"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)"/>'),
  mirv: ic24('<circle cx="6" cy="17" r="1.5"/><circle cx="12" cy="10" r="1.5"/><circle cx="18" cy="17" r="1.5"/><path d="M12 4 v3"/>'),
  hbomb: ic24('<circle cx="11" cy="14" r="7"/><path d="M16 9 l3 -3 M19 6 c1 -1 2 -1 3 0"/>'),
  mega: ic24('<path d="M3 20 l6 -12 3 5 3 -5 6 12 z"/><path d="M12 8 c-1 -2 1 -3 0 -5"/>'),
  car: ic24('<path d="M4 17 h16 M5 17 a2 2 0 0 1 -2 -2 v-3 l2 -4 h10 l2 4 v3 a2 2 0 0 1 -2 2"/><circle cx="8" cy="17" r="1.8"/><circle cx="16" cy="17" r="1.8"/>'),
  tag: ic24('<path d="M4 4 h7 l9 9 -7 7 -9 -9 z"/><circle cx="9" cy="9" r="1.5"/>'),
  scatter: ic24('<path d="M12 3 v4 M12 17 v4 M3 12 h4 M17 12 h4 M5.5 5.5 l3 3 M15.5 15.5 l3 3 M18.5 5.5 l-3 3 M8.5 15.5 l-3 3"/>'),
};
const LOGO_SVG = '<svg viewBox="0 0 40 40"><path d="M9 25c6-1 15-6 22-14M9 31c8-1 16-5 22-11" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/></svg>';

// ---------- saves: IndexedDB first, localStorage fallback ----------
const IDB_NAME = 'ticker-tycoon', IDB_STORE = 'saves';
let IDB_PROMISE = null;
function idb() {
  if (IDB_PROMISE) return IDB_PROMISE;
  IDB_PROMISE = new Promise(res => {
    if (!window.indexedDB) return res(null);
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => { try { req.result.createObjectStore(IDB_STORE); } catch (e) {} };
    req.onsuccess = () => res(req.result);
    req.onerror = () => { IDB_PROMISE = null; res(null); };
  });
  return IDB_PROMISE;
}
async function idbGet(key) {
  const db = await idb(); if (!db) return null;
  return new Promise(res => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const r = tx.objectStore(IDB_STORE).get(key);
      r.onsuccess = () => res(r.result || null); r.onerror = () => res(null);
    } catch (e) { res(null); }
  });
}
async function idbPut(key, val) {
  const db = await idb(); if (!db) return false;
  return new Promise(res => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const r = tx.objectStore(IDB_STORE).put(val, key);
      r.onsuccess = () => res(true); r.onerror = () => res(false);
    } catch (e) { res(false); }
  });
}
async function idbDel(key) {
  const db = await idb(); if (!db) return;
  try { db.transaction(IDB_STORE, 'readwrite').objectStore(IDB_STORE).delete(key); } catch (e) {}
}
function migrateSave(s) {
  if (!s || !s.co) return s;
  // Old saves were built on the old ~7.68B world population. Rescale
  // their country populations to the new 8.3B world, preserving any
  // growth since the game started.
  if (s.countries && typeof W !== 'undefined' && W.byA3) {
    Object.keys(s.countries).forEach(a3 => {
      const cs = s.countries[a3], k = W.byA3[a3];
      if (cs && k && cs.pop0 && cs.pop0 !== k.pop0) {
        cs.pop = Math.round(cs.pop * (k.pop0 / cs.pop0));
        cs.pop0 = k.pop0;
      }
    });
  }
  if (!Array.isArray(s.stores)) s.stores = [];
  if (!Array.isArray(s.loans)) s.loans = [];
  if (!s.sports) s.sports = null;
  if (s.co) Object.values(s.co).forEach(c => { if (!Array.isArray(c.board)) c.board = []; if (!isFinite(c.weekProfitStreak)) c.weekProfitStreak = 0; if (!Array.isArray(c.weekNets)) c.weekNets = []; });
  if (!s.maxDays) s.maxDays = NORMAL_DAYS;
  if (!Array.isArray(s.placed)) s.placed = [];
  if (!s.mars) s.mars = { unlocked: {}, mines: {}, sites: {}, unlockOrder: [], pool: null };
  if (s.yearsBought == null) s.yearsBought = 0;
  if (s.homeTaxPrev == null && s.countries && s.countries[s.home]) { const cs = s.countries[s.home]; s.homeTaxPrev = { tax: cs.tax, incTax: cs.incTax || 0.20, vat: cs.vat || 0.05 }; }
  if (s.extra == null) s.extra = {};
  if (s.facilities == null) s.facilities = {};
  if (s.lastWarDay == null) s.lastWarDay = null;
  if (!Array.isArray(s.papers)) s.papers = [];
  if (s.leader == null) s.leader = false;
  if (!s.worl) s.worl = null;
  if (!s.domination) s.domination = null;
  if (s.pendingSituation === undefined) s.pendingSituation = null;
  if (s.pendingVictory === undefined) s.pendingVictory = null;
  if (s.countryName === undefined) s.countryName = null;
  if (s.co && typeof ensureSite === 'function') Object.values(s.co).forEach(c => { try { ensureSite(c); } catch (e) {} });
  for (const a3 in s.countries) { const cs = s.countries[a3]; if (cs.incTax == null) cs.incTax = 0.20; if (cs.vat == null) cs.vat = 0.05; if (cs.taxRev == null) cs.taxRev = 0; if (cs.treasury == null) cs.treasury = cs.gdp * 1e6 * 0.05; if (cs.debt == null) cs.debt = cs.gdp * 1e6 * 0.54; }
  if (s.idx && !isFinite(s.idx.v)) { const fin = (s.idx.h && s.idx.h.w || []).filter(v => isFinite(v)); s.idx.v = fin.length ? fin[fin.length - 1] : 1000; if (s.idx.h) for (const k in s.idx.h) s.idx.h[k] = (s.idx.h[k] || []).filter(v => isFinite(v)); }
  for (const a3 in s.co) {
    const c = s.co[a3];
    if (!isFinite(c.price) || c.price <= 0) c.price = (isFinite(c.p0) && c.p0 > 0) ? c.p0 : 100;
    if (c.h) for (const k in c.h) { const fin = (c.h[k] || []).filter(v => isFinite(v) && v > 0); if (fin.length) c.h[k] = fin; }
    if (!c.yearStats) c.yearStats = { satW: 0, satN: 0, rev: 0, profit: 0, weeks: 0 };
    if (c.lastYearProfit === undefined) c.lastYearProfit = null;
    if (!c.ratingReasons) c.ratingReasons = [];
    c.locs.forEach(l => { if (l.city == null) l.city = c.city; });
    if (!c.h) c.h = { d: [], w: [], m: [], v: [] };
    if (!Array.isArray(c.h.v)) c.h.v = [];
    while (c.h.v.length < (c.h.d || []).length) c.h.v.push(Math.round((c.shares || 0) * 0.003));
    if (c.h.v.length > (c.h.d || []).length) c.h.v = c.h.v.slice(-((c.h.d || []).length || 1));
  }
  return s;
}
async function loadSave() {
  const fromIdb = await idbGet('main');
  if (fromIdb && fromIdb.v === 2 && !fromIdb.over) return migrateSave(fromIdb);
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.v === 2 && !s.over) { const m = migrateSave(s); idbPut('main', m); return m; }
      if (s && s.over) UI.lastOver = s.over;
    }
  } catch (e) {}
  return null;
}
let saveInFlight = false, savePending = false;
async function save() {
  if (!S || UI.pick) return;
  // Never drop a save: if one is already writing, mark a follow-up pass so the
  // latest state is written after it, instead of silently losing the trade.
  if (saveInFlight) { savePending = true; return; }
  saveInFlight = true;
  do {
    savePending = false;
    try {
      S.lastSeen = Date.now();
      const ok = await idbPut('main', S);
      if (!ok) {
        const copy = JSON.parse(JSON.stringify(S));
        for (const k in copy.co) { copy.co[k].h.d = copy.co[k].h.d.slice(-120); copy.co[k].h.v = (copy.co[k].h.v || []).slice(-120); copy.co[k].h.w = copy.co[k].h.w.slice(-104); }
        copy.news = (copy.news || []).slice(0, 60);
        localStorage.setItem(SAVE_KEY, JSON.stringify(copy));
      }
    } catch (e) {}
  } while (savePending);
  saveInFlight = false;
}

// ---------- small helpers ----------
function toast(t, kind) {
  const d = document.createElement('div'); d.className = 'toast ' + (kind || '');
  d.textContent = t; $('toasts').appendChild(d); setTimeout(() => d.remove(), 3000);
}
function act(fn, ok) {
  const e = fn(); if (e) toast(e, 'bad'); else { if (ok) toast(ok, 'good'); }
  save(); refreshAll(); return !e;
}
function lineChart(vals, o) {
  o = o || {}; const Wd = 400, H = o.h || 150;
  vals = (vals || []).filter(v => isFinite(v));
  if (vals.length < 2) vals = [vals[0] || 0, vals[0] || 0];
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
  const pts = vals.map((v, i) => [4 + i / (vals.length - 1) * (Wd - 10), 8 + (1 - (v - lo) / (hi - lo)) * (H - 16)]);
  const col = o.color || (vals[vals.length - 1] >= vals[0] ? '#12a150' : '#e5484d');
  const d = 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L');
  return `<svg class="chart" viewBox="0 0 ${Wd} ${H}" preserveAspectRatio="none"><path d="${d}L${pts[pts.length - 1][0].toFixed(1)},${H}L${pts[0][0].toFixed(1)},${H}Z" fill="${col}" opacity="0.10"/><path d="${d}" fill="none" stroke="${col}" stroke-width="2.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;
}
function sma(vals, n) {
  const out = [];
  for (let i = 0; i < vals.length; i++) {
    const s = vals.slice(Math.max(0, i - n + 1), i + 1);
    out.push(s.reduce((a, b) => a + b, 0) / s.length);
  }
  return out;
}
function candleChart(closes, vols) {
  const Wd = 400, H = 180;
  const groups = [];
  for (let i = 0; i < closes.length; i += 5) {
    const g = closes.slice(i, i + 5); if (g.length) groups.push(g);
  }
  if (groups.length < 2) return lineChart(closes, { h: H });
  const candles = groups.map(g => ({ o: g[0], c: g[g.length - 1], h: Math.max(...g), l: Math.min(...g) }));
  let lo = Math.min(...candles.map(c => c.l)), hi = Math.max(...candles.map(c => c.h));
  if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
  const y = v => 8 + (1 - (v - lo) / (hi - lo)) * (H - 16);
  const bw = Math.max(2, Math.min(10, (Wd - 8) / candles.length * 0.55));
  const step = (Wd - 8) / candles.length;
  const s20 = sma(closes, 20);
  const smaPts = candles.map((c, i) => {
    const idx = Math.min(closes.length - 1, (i + 1) * 5 - 1);
    return [8 + i * step + step / 2, y(s20[idx])];
  });
  const smaD = 'M' + smaPts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L');
  const bars = candles.map((c, i) => {
    const x = 8 + i * step + step / 2, col = c.c >= c.o ? '#12a150' : '#e5484d';
    return `<line x1="${x.toFixed(1)}" y1="${y(c.h).toFixed(1)}" x2="${x.toFixed(1)}" y2="${y(c.l).toFixed(1)}" stroke="${col}" stroke-width="1.6"/><rect x="${(x - bw / 2).toFixed(1)}" y="${y(Math.max(c.o, c.c)).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, Math.abs(y(c.o) - y(c.c))).toFixed(1)}" fill="${col}"/>`;
  }).join('');
  const volBars = (vols && vols.length) ? (() => {
    const gv = [];
    for (let i = 0; i < closes.length; i += 5) { const g = vols.slice(i, i + 5); gv.push(g.length ? g.reduce((a, b) => a + b, 0) : 0); }
    const mx = Math.max(1, ...gv);
    return `<svg class="chart" viewBox="0 0 ${Wd} 40" preserveAspectRatio="none">${gv.map((v, i) => `<rect x="${(8 + i * step + step / 2 - bw / 2).toFixed(1)}" y="${(38 - v / mx * 34).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, v / mx * 34).toFixed(1)}" fill="#7c4dff" opacity="0.55"/>`).join('')}</svg>`;
  })() : '';
  return `<svg class="chart" viewBox="0 0 ${Wd} ${H}" preserveAspectRatio="none"><path d="${smaD}" fill="none" stroke="#7c4dff" stroke-width="1.8" vector-effect="non-scaling-stroke" stroke-dasharray="4 3"/>${bars}</svg>${volBars}`;
}
const rangeSeg = (list, cur, act) => `<div class="seg">${list.map(r => `<button class="${cur === r ? 'on' : ''}" data-a="${act}" data-x="${r}">${r}</button>`).join('')}</div>`;
const chgVs = (c) => {
  const h = c.h && c.h.d; if (h && h.length >= 2) return h[h.length - 1] / h[h.length - 2] - 1;
  return c.price / (c.p0 || c.price) - 1;
};

// ---------- modals / panels ----------
function openModal(html, kind) {
  UI.modal = kind || 'sheet';
  $('modal').innerHTML = `<div class="scrim ${UI.modal}" data-a="scrim"><div class="mbox ${UI.modal}" data-stop>${UI.modal === 'sheet' ? `<button class="xbtn mclose" data-a="closeModal" aria-label="Close">${IC.close}</button>` : ''}${html}</div></div>`;
}
function closeModal() { UI.modal = null; $('modal').innerHTML = ''; }
function openPanel(name, args) {
  closeModal(); if (CityView.isOpen()) leaveCity();
  UI.panel = name; UI.stack = args ? [args] : []; renderPanel(); renderHUD();
}
function pushPanel(args) { UI.stack.push(args); renderPanel(); }
function closePanel() { if (UI.panel === 'warbattle' && UI.warBattle && !UI.warBattle.resolved && UI.pendingWarPlan) { const plan = UI.pendingWarPlan; UI.warBattle.resolved = true; startOngoingWar(plan); save(); toast('Battle closed — the war continues as an ongoing war.', 'bad'); } UI.panel = null; UI.stack = []; UI.marketsScroll = null; $('panel').classList.remove('open'); renderHUD(); }
function panelShell(title, sub, body) {
  const back = UI.stack.length ? `<button class="pback" data-a="panelBack">${IC.back}</button>` : '';
  return `<div class="panel-head"><div class="panel-title">${back}<div><h3>${title}</h3>${sub ? `<div class="muted small">${sub}</div>` : ''}</div></div><button class="xbtn" data-a="closePanel" aria-label="Close panel">${IC.close}</button></div><div class="panel-body">${body}</div>`;
}
// Re-render the open panel UNLESS the player is typing in it. An
// unguarded re-render replaces the focused input mid-edit: the typed
// value is lost and, if the player then clicks a button, the click can
// land on a replaced node and never fire. The frame loop already guards
// this way; async callbacks (price refresh, settle) must too — that
// unguarded path is what made a later Crypto stake edit not stick live.
function renderPanelUnlessTyping() {
  if (typeof document !== 'undefined' && document.querySelector && document.querySelector('#panel input:focus')) return;
  renderPanel();
}
function renderPanel() {
  if (!UI.panel || !S) { $('panel').innerHTML = ''; $('panel').classList.remove('open'); UI.lastPanelHTML = null; UI.lastPanelKey = null; return; }
  // Throttle stamp for the frame loop: loop() re-renders the open panel
  // at most every 1500ms. This stamp used to never be updated, so the
  // loop re-rendered every ~250ms — wiping typed inputs (Crypto stake
  // snapping back to its default) and replacing buttons mid-click, so
  // clicks on a just-replaced button never fired (Crypto bets that
  // silently never registered). Updating it here restores the throttle.
  UI.lastPanel = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const cur = UI.stack.length ? UI.stack[UI.stack.length - 1] : null;
  if (UI.panel === 'stock' && !cur) { UI.panel = 'markets'; UI.stack = []; }
  if (UI.panel === 'extraStock' && !cur) { UI.panel = 'markets'; UI.stack = []; }
  // EXTRA-STOCK BACK FIX: same guard as flagship stocks. A Markets row
  // click REPLACES the panel (markets -> extraStock) and puts the extra
  // id itself in the stack — it does NOT push Markets as a history
  // entry. So the back arrow (shown because stack.length is 1) popped
  // the id, leaving panel='extraStock' with an empty stack, and
  // tradeViewExtra(null) rendered the "Business not found." panel.
  // Closing that panel restored the map, which is why it looked
  // cosmetic — but the intermediate must never appear. With this
  // guard, an empty extraStock stack converts back to Markets, just
  // like an empty stock stack already did.
  // SCROLL FIX (2026-10-26): the frame loop re-rendered the open panel
  // every 1.5s by replacing #panel's whole innerHTML. Two real symptoms:
  // (a) scroll snapped back to top — the new .panel-body starts at 0;
  // (b) a finger drag got STUCK — replacing the scrolled node mid-gesture
  // cancels the browser's touch scroll, so the content never moves.
  // Same bug class as the Crypto stake wipe and the Leave city click bug.
  // Fix, in two layers: (1) if the panel, stack and generated HTML are
  // all unchanged, do not touch the DOM at all — steady panels (Markets,
  // Airport, Web, Messages, settings) now survive frame ticks untouched;
  // (2) when the HTML did change (live prices, battle ticks, crypto
  // refresh), restore the previous scroll position, clamped, so the
  // position survives the rewrite. A genuinely different panel (or a
  // deeper stack, e.g. Markets -> a stock) still starts at the top.
  const bodyEl = (typeof document !== 'undefined' && document.querySelector) ? document.querySelector('#panel .panel-body') : null;
  const prevTop = bodyEl ? bodyEl.scrollTop : 0;
  const prevKey = UI.lastPanelKey;
  const key = UI.panel + '|' + UI.stack.length + '|' + (cur ? (cur.a3 || '') : '');
  let html = '';
  try {
    if (UI.panel === 'stock' && cur) html = tradeView(cur.a3);
    else if (PANELS[UI.panel]) html = PANELS[UI.panel]();
    else html = '<div class="card in"><p class="muted">That screen is not ready yet.</p></div>';
  } catch (e) {
    // Never fail silently: a broken panel used to close the menu and show
    // nothing. Now the panel opens and says exactly what broke.
    html = '<div class="card in"><h3>That screen hit a problem</h3><p class="muted small">Please reload the game and try again. If it keeps happening, this is the error:</p><p class="muted small">' + esc(String(e && e.message || e)) + '</p><button class="btn3d orange wide" data-a="closePanel">CLOSE</button></div>';
  }
  if (html === UI.lastPanelHTML && key === prevKey && document.querySelector('#panel.open')) return;
  UI.lastPanelHTML = html; UI.lastPanelKey = key;
  $('panel').innerHTML = html; $('panel').classList.add('open');
  if (key === prevKey) {
    const nb = document.querySelector('#panel .panel-body');
    if (nb && prevTop > 0) nb.scrollTop = Math.max(0, Math.min(prevTop, nb.scrollHeight - nb.clientHeight));
  }
  // EXTRA-STOCK BACK SCROLL: the Markets scroll position was captured
  // when the row was clicked (see the stock action). A back navigation
  // lands on a different panel key, so the prevTop restore above does
  // not apply — restore the captured Markets position instead, then
  // consume it so a later Markets open starts fresh.
  if (UI.panel === 'markets' && UI.marketsScroll != null) {
    const nb = document.querySelector('#panel .panel-body');
    if (nb) nb.scrollTop = Math.max(0, Math.min(UI.marketsScroll, nb.scrollHeight - nb.clientHeight));
    UI.marketsScroll = null;
  }
}

// ---------- HUD: slim top strip + always-visible goals, no bottom nav ----------
function renderHUD() {
  if (!S || UI.pick) return;
  // New HUD, from the reference design (layout only, original art):
  // no Go home button, no bottom bar at all.
  // Top-left: a white pill with blue text — the profile icon, the country
  // name and your money. Top-right: a white pill with blue text, the game date — tap it and
  // it asks if you are done this week, with a calendar underneath.
  // Bottom-left: map layers — toggle what shows on the map.
  // Bottom-middle: your current city — tap it for the airport
  // departures board and fly somewhere. Bottom-right: a hamburger
  // that opens every menu item, on the right, scrollable.
  const hk = W.byA3[S.home];
  const curCity = airportFromCity();
  $('hud').innerHTML = `
  <div class="hud-pill hud-tl">
    <button class="hud-profile" data-a="panel" data-x="profile" aria-label="User profile">${ICONS.profile}</button>
    <button class="hud-tl-text" data-a="panel" data-x="country" aria-label="Your country"><b>${esc(cname(S.home))}</b><small>${fmtMoney(S.cash)}</small></button>
  </div>
  <button class="hud-pill hud-tr" data-a="dateModal" aria-label="Date">${fmtDate(S.day)}</button>
  <button class="hud-btn hud-bl" data-a="layers" aria-label="Map layers"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg></button>
  <button class="hud-city" data-a="departures" aria-label="Airport departures"><span>${curCity ? W.byA3[curCity.a3].flag : hk.flag}</span><span>${curCity ? esc(curCity.name) : esc(cname(S.home))}</span></button>
  <button class="hud-btn hud-br" data-a="drawer" aria-label="Menu">${ICONS.menu}</button>
  ${UI.placing ? `<div class="place-banner card"><b>Where do you want it?</b><span>Tap anywhere on the map to place your business${!S.placed || !S.placed.length ? ' · first one free' : ' · $5,000,000'}</span><button class="btn" data-a="cancelPlace">Cancel</button></div>` : ''}`;
  if (UI.panel) $('panel').classList.add('open');
}
function renderCityHUD() {
  // Idempotent rewrite — this is the Leave city fix. The frame loop calls
  // this every ~250ms, and it used to rewrite #chud innerHTML every time,
  // replacing the Leave city button node 4x a second. If a rewrite landed
  // between a click's mousedown and mouseup, the mousedown target was
  // detached before mouseup, so the browser fired no click at all — the
  // button silently did nothing, exactly as the live test saw. Now the
  // DOM is only touched when the bar's content actually changed, so the
  // button node survives across frames and clicks always land. Callers
  // that clear #chud directly (leaveCity, the new-game reset) must also
  // clear UI.lastCityHUD, or the next render would wrongly skip the
  // rewrite and leave the bar empty.
  let html = '';
  if (CityView.isOpen()) {
    const c = CityView.city;
    if (typeof MARS_CITY_ID !== 'undefined' && c.id === MARS_CITY_ID) {
      const sites = (typeof marsSitesFor === 'function') ? marsSitesFor(S.home) : [];
      const owned = sites.filter(s => s.owned).length;
      html = `<div class="citybar card"><div><b>🚀 Mars</b><span class="muted"> · Dirt and mines · ${owned} of ${sites.length} mine sites owned</span></div>
    <div class="city-actions"><button data-a="leaveCity">✕ Leave Mars</button></div></div>`;
    } else {
      const k = W.byA3[c.a3], co = S.co[c.a3];
      // A company's locations are all in its own capital city (co.city), by construction
      // in addLocation(), so the count here is exact, not a filter that happens to work.
      const myLocs = controlled(c.a3) ? co.locs.filter(l => (l.city || co.city) === c.id).length : 0;
      html = `<div class="citybar card"><div><b>${esc(c.name)}</b><span class="muted"> · ${esc(k.name)} · ${SECTORS[co.sector].icon} ${esc(co.name)} · ${myLocs} of your locations here</span></div>
    <div class="city-actions"><button data-a="cityFilter">Filter: ${CityView.filter}</button><button data-a="leaveCity">✕ Leave city</button></div></div>`;
    }
  }
  if (html !== UI.lastCityHUD) { UI.lastCityHUD = html; $('chud').innerHTML = html; }
}

// ---------- vehicles: tap card + Watch view ----------
// Original art only: the plane view takes its layout from the screenshot
// Nicholas sent (route on top, big side view, progress bar below), but
// the aircraft, ships and names are drawn fresh here — no real airline,
// brand or copied game asset is used. The company name on a vehicle is
// always the in-game company's own name.
function vNum(key, mod) { let h = 0; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0; return Math.abs(h) % mod; }
function vTripId(vd) {
  if (vd.category === 'yacht') return 'YACHT-001';
  if (vd.category === 'fighter') return `${vd.a3}-FTR-${1 + vNum(vd.key, 9)}`;
  if (vd.category === 'carrier') return `${vd.a3}-CVN-${1 + vNum(vd.key, 9)}`;
  if (vd.category === 'warship') return `${vd.a3}-DDG-${1 + vNum(vd.key, 9)}`;
  return `${vd.sym || vd.a3}-${100 + vNum(vd.key, 900)}`;
}
function vStatus(vd) {
  if (vd.war) return 'In combat';
  if (vd.category === 'plane') return vd.to ? 'Cruising' : 'Setting course';
  if (vd.category === 'cargo' || vd.category === 'yacht') return vd.to ? 'Sailing' : 'Setting course';
  return 'Patrolling';
}
function vLoad(vd) {
  if (vd.category === 'plane') { const cap = [0, 72, 100, 180, 250, 350, 550][vd.level] || 72; return `${Math.round(cap * (0.7 + vNum(vd.key, 30) / 100))}/${cap} passengers`; }
  if (vd.category === 'cargo') {
    if (vd.fleetKind === 'tanker') { const cap = [0, 30000, 80000, 150000, 300000, 500000, 800000][vd.level] || 30000; return `${Math.round(cap * (0.7 + vNum(vd.key, 30) / 100)).toLocaleString()}/${cap.toLocaleString()} barrels`; }
    const cap = [0, 500, 5000, 10000, 14000, 20000, 24000][vd.level] || 500; return `${Math.round(cap * (0.7 + vNum(vd.key, 30) / 100)).toLocaleString()}/${cap.toLocaleString()} containers`;
  }
  if (vd.category === 'yacht') return `${6 + vNum(vd.key, 7)}/12 guests`;
  if (vd.category === 'fighter') return '1 pilot';
  if (vd.category === 'carrier') return '24 aircraft · 2,500 crew';
  const crew = [0, 40, 120, 250, 400, 600][vd.level] || 120; return `${crew} crew`;
}
function vIcon(vd) { return vd.category === 'plane' || vd.category === 'fighter' ? ICONS.airport : vd.category === 'yacht' ? '⛵' : '🚢'; }
function vWatchLabel(vd) { return vd.category === 'plane' || vd.category === 'fighter' ? 'WATCH FLIGHT' : vd.category === 'cargo' || vd.category === 'yacht' ? 'WATCH VOYAGE' : 'WATCH'; }
function fmtSecs(s) { if (s == null) return ''; if (s < 60) return `${Math.ceil(s)}s remaining`; return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s remaining`; }
function vLocText(vd) {
  const ct = MapView.nearCity(vd.x, vd.y); if (!ct) return '';
  const cn = W.byA3[ct.a3] ? W.byA3[ct.a3].name : ct.a3;
  if (vd.category === 'plane' || vd.category === 'fighter') return `Over ${ct.name}, ${cn}`;
  return `At sea near ${ct.name}, ${cn}`;
}
function openVehicleCard(key) {
  const vd = MapView.vehicle(key); if (!vd) return;
  const fromC = vd.from ? vd.from.code : '—', toC = vd.to ? vd.to.code : 'Patrol';
  const pct = vd.progress != null ? Math.round(vd.progress * 100) : null;
  openModal(`<div class="vcard">
    <div class="row between"><div><b>${vTripId(vd)}</b> <span class="muted">${esc(vd.model)}</span></div><button class="xbtn" data-a="closeModal" aria-label="Close">${IC.close}</button></div>
    <div class="vroute">${fromC} <span class="varr">→</span> ${toC} <span class="muted small">${vTripId(vd)}</span></div>
    <div class="vstatus"><b>${vStatus(vd)}</b>${vd.secsLeft != null ? ` · ${fmtSecs(vd.secsLeft)}` : ''} <span class="muted">👤 ${vLoad(vd)}</span></div>
    ${pct != null ? `<div class="vprog"><div class="vprog-fill" style="width:${pct}%"></div><span class="vprog-icon" style="left:${pct}%">${vIcon(vd)}</span></div>` : `<p class="muted small">Patrolling around ${esc(vd.from ? vd.from.name : '')}.</p>`}
    <p class="muted small">${esc(vd.owner)} · ${vd.from ? esc(vd.from.name) : ''}${vd.to ? ` → ${esc(vd.to.name)}` : ''}</p>
    <div class="row wrap"><button class="btn3d blue wide" data-a="watchVehicle" data-x="${vd.key}">👁 ${vWatchLabel(vd)}</button>
    <button class="btn" data-a="routeVehicle" data-x="${vd.key}">VIEW ROUTE</button>
    <button class="btn" data-a="infoVehicle" data-x="${vd.key}" aria-label="Vehicle information">i</button></div>
  </div>`, 'sheet');
}
function openRouteSheet(key) {
  const vd = MapView.vehicle(key); if (!vd) return;
  openModal(`<div class="vcard"><div class="row between"><h3>Route · ${vTripId(vd)}</h3><button class="xbtn" data-a="closeModal" aria-label="Close">${IC.close}</button></div>
    <div class="kv"><span>From</span><b>${vd.from ? `${esc(vd.from.name)} (${vd.from.code})` : '—'}</b></div>
    <div class="kv"><span>To</span><b>${vd.to ? `${esc(vd.to.name)} (${vd.to.code})` : 'Patrol — no destination'}</b></div>
    <div class="kv"><span>Vehicle</span><b>${esc(vd.model)}</b></div>
    <div class="kv"><span>Owner</span><b>${esc(vd.owner)}</b></div>
    <div class="kv"><span>Status</span><b>${vStatus(vd)}${vd.secsLeft != null ? ` · ${fmtSecs(vd.secsLeft)}` : ''}</b></div>
    ${vd.progress != null ? `<div class="kv"><span>Progress</span><b>${Math.round(vd.progress * 100)}% of this leg</b></div>` : ''}
    <div class="row wrap"><button class="btn3d blue wide" data-a="followVehicle" data-x="${vd.key}">FOLLOW ON MAP</button>
    <button class="btn" data-a="vehicleCard" data-x="${vd.key}">BACK TO VEHICLE</button></div>
  </div>`, 'sheet');
}
function openVehicleInfo(key) {
  const vd = MapView.vehicle(key); if (!vd) return;
  const companyBtn = (vd.category === 'plane' || vd.category === 'cargo') ? `<button class="btn3d blue wide" data-a="vehicleCompany" data-x="${vd.a3}">OPEN COMPANY</button>` : '';
  openModal(`<div class="vcard"><div class="row between"><h3>${vTripId(vd)} · ${esc(vd.model)}</h3><button class="xbtn" data-a="closeModal" aria-label="Close">${IC.close}</button></div>
    <div class="kv"><span>Owner</span><b>${esc(vd.owner)}</b></div>
    <div class="kv"><span>Load</span><b>${vLoad(vd)}</b></div>
    <div class="kv"><span>Status</span><b>${vStatus(vd)}</b></div>
    ${vd.category === 'yacht' ? '<p class="muted small">Your personal yacht. It sails for fun and earns nothing — it is just yours to watch.</p>' : ''}
    ${vd.category === 'carrier' || vd.category === 'warship' || vd.category === 'fighter' ? `<p class="muted small">${esc(vd.owner)} military. Upgrade it from the Military screen for your home nation.</p>` : ''}
    <div class="row wrap">${companyBtn}<button class="btn" data-a="vehicleCard" data-x="${vd.key}">BACK TO VEHICLE</button></div>
  </div>`, 'sheet');
}
function watchSVG(vd) {
  const col = (S.co[vd.a3] && S.co[vd.a3].color) || '#2f7cf6', name = esc(vd.owner.length > 18 ? vd.owner.slice(0, 18) : vd.owner);
  if (vd.category === 'plane') {
    const prop = vd.level === 1;
    return `<svg viewBox="0 0 400 170" class="wsvg"><ellipse cx="200" cy="118" rx="150" ry="8" fill="rgba(0,0,0,0.12)"/>
    <path d="M70 118 L110 62 L150 62 L140 118 Z" fill="${col}"/><rect x="60" y="72" width="280" height="34" rx="17" fill="#fff"/><rect x="60" y="98" width="280" height="8" fill="${col}"/>
    <rect x="300" y="78" width="42" height="22" rx="4" fill="#1a2747"/><rect x="150" y="60" width="70" height="14" rx="7" fill="#fff"/>
    ${[100, 125, 150, 175, 200, 225, 250].map(x => `<circle cx="${x}" cy="88" r="4" fill="#9fb0c8"/>`).join('')}
    ${prop ? `<ellipse cx="330" cy="88" rx="4" ry="26" fill="rgba(120,140,170,0.6)"/>` : `<rect x="310" y="102" width="34" height="10" rx="5" fill="#c9d2df"/>`}
    <text x="185" y="92" font-size="11" font-weight="800" fill="${col}" text-anchor="middle">${name}</text></svg>`;
  }
  if (vd.category === 'fighter') {
    return `<svg viewBox="0 0 400 170" class="wsvg"><path d="M40 95 L300 78 L360 88 L300 102 L40 108 Z" fill="#3b4250"/><path d="M150 88 L210 40 L235 40 L210 88 Z" fill="#3b4250"/><path d="M150 100 L210 150 L235 150 L210 100 Z" fill="#2c3340"/><ellipse cx="315" cy="88" rx="14" ry="7" fill="#9ad1ff"/></svg>`;
  }
  if (vd.category === 'yacht') {
    return `<svg viewBox="0 0 400 170" class="wsvg"><path d="M190 20 L190 95 M190 30 L265 95 L190 95 Z" fill="#fff" stroke="#6b7685" stroke-width="2"/><rect x="150" y="80" width="90" height="24" rx="6" fill="#fff"/><path d="M90 104 L310 104 L280 138 L120 138 Z" fill="#fff"/><rect x="90" y="104" width="220" height="8" fill="${col}"/><rect x="170" y="86" width="50" height="12" rx="3" fill="#9fb0c8"/></svg>`;
  }
  if (vd.category === 'carrier') {
    return `<svg viewBox="0 0 400 170" class="wsvg"><rect x="60" y="88" width="290" height="14" rx="4" fill="#5b6573"/><path d="M80 102 L320 102 L300 132 L100 132 Z" fill="#3b4250"/><rect x="250" y="60" width="36" height="30" rx="4" fill="#d6dbe2"/><rect x="255" y="52" width="26" height="10" rx="3" fill="#9aa4b2"/>${[100, 150, 200].map(x => `<path d="M${x} 82 L${x + 22} 82 L${x + 11} 74 Z" fill="#8e99a8"/>`).join('')}</svg>`;
  }
  if (vd.category === 'warship') {
    return `<svg viewBox="0 0 400 170" class="wsvg"><path d="M70 100 L330 100 L300 132 L100 132 Z" fill="#6b7685"/><rect x="150" y="72" width="80" height="28" rx="4" fill="#9aa4b2"/><rect x="180" y="58" width="20" height="16" rx="3" fill="#cfd5dd"/><rect x="190" y="40" width="4" height="20" fill="#4f5866"/><circle cx="285" cy="86" r="10" fill="#4f5866"/><rect x="95" y="88" width="40" height="8" rx="4" fill="#4f5866"/></svg>`;
  }
  if (vd.fleetKind === 'tanker') {
    return `<svg viewBox="0 0 400 170" class="wsvg"><path d="M60 100 L340 100 L315 134 L85 134 Z" fill="#9b2c2c"/><rect x="270" y="70" width="40" height="30" rx="4" fill="#f2f4f7"/>${[110, 160, 210].map(x => `<circle cx="${x}" cy="112" r="11" fill="#e6eaef"/>`).join('')}</svg>`;
  }
  return `<svg viewBox="0 0 400 170" class="wsvg"><path d="M60 100 L340 100 L315 134 L85 134 Z" fill="#2d3748"/><rect x="70" y="70" width="36" height="30" rx="4" fill="#f2f4f7"/>${['#e5484d', '#2f7cf6', '#f5b301', '#12a150', '#ff6b2c'].map((c, i) => `<rect x="${115 + i * 38}" y="72" width="32" height="28" rx="2" fill="${c}"/>`).join('')}</svg>`;
}
let watchTimer = null, watchKey = null, watchSig = '';
function watchHTML(vd) {
  const sky = vd.category === 'plane' || vd.category === 'fighter';
  const fromC = vd.from ? vd.from.code : '—', toC = vd.to ? vd.to.code : 'Patrol';
  return `<div class="watch-top"><button class="wback" data-a="closeWatch" aria-label="Back to map">${IC.back}</button>
    <div class="wroute"><b id="watch-route">${vd.from ? esc(vd.from.name) : ''} → ${vd.to ? esc(vd.to.name) : 'Patrol'}</b><small>${vTripId(vd)} · ${esc(vd.model)}</small></div>
    <div class="wpills"><span class="wpill" id="watch-status">${vStatus(vd).toUpperCase()}</span><span class="wpill">👤 ${vLoad(vd)}</span></div></div>
  <div class="watch-scene ${sky ? 'sky' : 'sea'}">${sky ? '<div class="wsun"></div><div class="wcloud c1"></div><div class="wcloud c2"></div><div class="wcloud c3"></div>' : '<div class="wwave w1"></div><div class="wwave w2"></div>'}
    ${watchSVG(vd)}<div class="wloc" id="watch-loc">📍 ${esc(vLocText(vd))}</div></div>
  <div class="watch-bottom"><div class="wprog-row"><b>${fromC}</b><div class="wprog"><div class="wprog-fill" id="watch-prog-fill" style="width:${vd.progress != null ? Math.round(vd.progress * 100) : 100}%"></div><span class="wprog-icon" id="watch-prog-icon" style="left:${vd.progress != null ? Math.round(vd.progress * 100) : 100}%">${vIcon(vd)}</span></div><b>${toC}</b></div>
    <div class="wtime" id="watch-time">${vStatus(vd)}${vd.secsLeft != null ? ` · ${fmtSecs(vd.secsLeft)}` : ''}</div>
    <button class="btn wide" data-a="closeWatch">RETURN TO MAP</button></div>`;
}
function openWatch(key) {
  const vd = MapView.vehicle(key); if (!vd) return;
  closeModal(); closePanel(); watchKey = key; watchSig = `${vd.category}|${vd.model}|${vd.owner}`;
  $('watch').innerHTML = watchHTML(vd); $('watch').classList.add('open');
  if (watchTimer) clearInterval(watchTimer); watchTimer = setInterval(tickWatch, 500);
}
function closeWatch() { watchKey = null; if (watchTimer) clearInterval(watchTimer); watchTimer = null; $('watch').innerHTML = ''; $('watch').classList.remove('open'); }
function tickWatch() {
  if (!watchKey) return; const vd = MapView.vehicle(watchKey); if (!vd) { closeWatch(); return; }
  const sig = `${vd.category}|${vd.model}|${vd.owner}`;
  if (sig !== watchSig) { watchSig = sig; $('watch').innerHTML = watchHTML(vd); return; }
  const set = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
  set('watch-route', `${vd.from ? vd.from.name : ''} → ${vd.to ? vd.to.name : 'Patrol'}`);
  set('watch-status', vStatus(vd).toUpperCase());
  set('watch-loc', `📍 ${vLocText(vd)}`);
  set('watch-time', `${vStatus(vd)}${vd.secsLeft != null ? ` · ${fmtSecs(vd.secsLeft)}` : ''}`);
  const pct = vd.progress != null ? Math.round(vd.progress * 100) : 100;
  const fill = document.getElementById('watch-prog-fill'); if (fill) fill.style.width = pct + '%';
  const ic = document.getElementById('watch-prog-icon'); if (ic) ic.style.left = pct + '%';
}

// ---------- newspaper: 1920s style, 4 pages, Age Up edition ----------
// One edition is made every time you age up. It is world news, not
// news about you: world politics and countries, business and markets,
// sports from every league, and the numbers behind it all.
// Only two editions are kept: this one and the last one. When a new
// edition arrives, older ones rotate out on their own.
let paperPage = 0, paperEdIdx = 0;
const PAPER_PAGES = ['FRONT PAGE', 'BUSINESS', 'SPORT', 'THE NUMBERS', 'YOUR YEAR'];
function ensurePapers() {
  if (!Array.isArray(S.papers)) S.papers = [];
  if (!S.papers.length) S.papers.push(makePaperEdition(yearOf(S.day)));
  return S.papers;
}
function pushPaperEdition() {
  ensurePapers();
  const ed = makePaperEdition(yearOf(S.day));
  if (S.papers[0] && S.papers[0].year === ed.year) S.papers[0] = ed; else S.papers.unshift(ed);
  S.papers = S.papers.slice(0, 2);
  paperEdIdx = 0; paperPage = 0;
}
function paperChg(h) {
  if (!h || !h.w) return 0;
  const vals = h.w.filter(v => isFinite(v) && v > 0);
  if (vals.length < 2) return 0;
  const base = vals[Math.max(0, vals.length - 53)];
  return base ? vals[vals.length - 1] / base - 1 : 0;
}
function playerSnapshot() {
  try {
    const yr = S.yearReport || {}, st = S.stats || {};
    const nw = netWorth();
    let yearAgo = null;
    if (S.nh && S.nh.w && S.nh.w.length) {
      const past = S.nh.w.filter(w => w[0] <= S.day - 365);
      yearAgo = past.length ? past[past.length - 1][1] : S.nh.w[0][1];
    }
    const cs = country(S.home) || {};
    const controlled = (typeof mine === 'function' ? mine() : []).map(c => {
      const e = (yr.entries || []).find(x => x.a3 === c.a3);
      return { name: c.name, sym: c.sym, rating: c.rating, old: e ? e.old : null, nw: e ? e.new : null, reasons: e ? e.reasons : [], locs: (c.locs || []).length, fleet: c.fleet || 0 };
    });
    const holdings = Object.entries(S.holdings || {}).filter(([, h]) => h.qty > 0 && S.co[h.a3 || '']).map(([a3, h]) => ({ name: S.co[a3] ? S.co[a3].name : a3, sym: S.co[a3] ? S.co[a3].sym : a3, qty: h.qty })).slice(0, 8);
    const projects = (cs.proj || []).filter(p => p.until > S.day).map(p => { const d = (typeof PROJECTS !== 'undefined' ? PROJECTS : []).find(x => x.id === p.id); return d ? d.name : p.id; });
    const mil = cs.milLv ? Object.entries(cs.milLv).map(([b, lv]) => ({ b: (typeof MILITARY !== 'undefined' && MILITARY[b]) ? MILITARY[b].name : b, lv })) : [];
    const warsHome = (S.wars || []).filter(w => w.a === S.home || w.b === S.home).map(w => `${cname(w.a === S.home ? w.b : w.a)} (ongoing, front ${Math.round(w.front)}%)`);
    return {
      netWorth: nw, yearAgo, cash: S.cash, loan: S.loan || 0, holdingsValue: holdingsValue(), propValue: propValue(),
      xp: S.xp || 0, level: (typeof level === 'function' ? level() : 1), career: (typeof careerName === 'function' ? careerName() : ''), goalsDone: (S.goalsDone || []).length,
      trades: st.trades || 0, takeovers: st.takeovers || 0, ipos: st.ipos || 0, warsStarted: st.wars || 0, bestWeek: st.bestWeek || 0,
      controlled, holdings, holdingsCount: Object.keys(S.holdings || {}).filter(a3 => S.holdings[a3].qty > 0).length,
      props: (S.props || []).length, projects, mil, warsHome,
      yearEntries: yr.entries || [], taxLines: yr.taxLines || [], taxRev: yr.taxRev || 0,
      leader: S.leader ? { treasury: cs.treasury || 0, debt: cs.debt || 0, lastWeek: cs.lastWeek || null } : null,
    };
  } catch (e) { return null; }
}
function makePaperEdition(year) {
  const playable = W.playable.filter(k => S.countries[k.a3]);
  let worldGdp = 0, worldPop = 0, stabSum = 0, booms = 0, unrest = 0;
  playable.forEach(k => { const cs = S.countries[k.a3]; worldGdp += cs.gdp * 1e6; worldPop += cs.pop; stabSum += cs.stab; if (cs.boom > S.day) booms++; if (cs.unrest > S.day) unrest++; });
  const growth = playable.map(k => ({ a3: k.a3, name: cname(k.a3), g: S.countries[k.a3].growth, gdp: S.countries[k.a3].gdp, pop: S.countries[k.a3].pop, stab: S.countries[k.a3].stab })).sort((a, b) => b.g - a.g);
  const notHome = x => x.a3 !== S.home;
  const fastest = growth.find(notHome) || growth[0];
  const slowest = [...growth].reverse().find(notHome) || growth[growth.length - 1];
  const boomC = playable.find(k => S.countries[k.a3].boom > S.day && k.a3 !== S.home);
  const unrestC = playable.find(k => S.countries[k.a3].unrest > S.day && k.a3 !== S.home);
  // Front page: prefer a war that is not yours, then world news from the year.
  const warsElse = S.wars.filter(w => w.a !== S.home && w.b !== S.home);
  const war = warsElse[0] || S.wars[0];
  let headline = '', headBody = '';
  let frontKind = 'growth', frontCaption = 'The world, this year.', frontDeck = '';
  if (war) {
    frontKind = 'war'; frontCaption = `The front in the war between ${cname(war.a)} and ${cname(war.b)}, as the fighting moves on.`; frontDeck = `The front has moved to ${Math.round(war.front)}% as trade routes through both nations strain.`;
    headline = `${cname(war.a)} AT WAR WITH ${cname(war.b)}`;
    headBody = `The front has moved to ${Math.round(war.front)}%. Capitals are watching, neighbours are nervous, and trade routes through both nations are under strain. The world waits to see whether talks, or tanks, win the year.`;
  } else if (unrestC) {
    frontKind = 'unrest'; frontCaption = `Crowds in the streets of ${cname(unrestC.a3)}, where protests have paralysed the capital.`; frontDeck = `Mass protests paralyse the capital. The government calls for calm, the crowds call for change.`;
    headline = `UNREST IN ${cname(unrestC.a3).toUpperCase()}`;
    headBody = `Mass protests have paralysed the streets. The government calls for calm, the crowds call for change, and the rest of the world is watching what happens next.`;
  } else {
    frontKind = 'growth'; frontCaption = `A skyline on the rise in ${fastest ? fastest.name : 'the world'}, the fastest riser this year.`; frontDeck = `${fastest ? fastest.name : 'The world'} grew ${fmtPct(fastest ? fastest.g : 0)} this year, ahead of every rival.`;
    headline = `${(fastest ? fastest.name : 'THE WORLD').toUpperCase()} LEADS THE WORLD`;
    headBody = `No war dominates the front page this year. Instead, the story is growth: new factories, new trade, and a country that outpaced every rival.`;
  }
  const frontStories = [];
  if (fastest) frontStories.push({ kicker: 'COUNTRIES', head: `${fastest.name} is the fastest riser`, body: `Growth of ${fmtPct(fastest.g)} this year, on a ${fmtMoney(fastest.gdp * 1e6, true)} economy and ${fmtPop(fastest.pop)} people. Traders and neighbours alike are asking how long the run can last.` });
  if (boomC) frontStories.push({ kicker: 'COUNTRIES', head: `Boom time in ${cname(boomC.a3)}`, body: `Factories are hiring, ports are busy, and money is moving. A boom year like this lifts the whole region with it.` });
  if (slowest) frontStories.push({ kicker: 'POLITICS', head: `${slowest.name} falls behind`, body: `Growth of just ${fmtPct(slowest.g)} this year. The government is under pressure to act, and investors are looking elsewhere for now.` });
  S.news.filter(n => n.d >= S.day - 365 && n.a3 && n.a3 !== S.home && (n.cat === 'World' || n.cat === 'War')).slice(0, 2).forEach(n => frontStories.push({ kicker: n.cat.toUpperCase(), head: n.text, body: `Reported from ${cname(n.a3)}. The full story is still unfolding.` }));
  // Business: gainers, losers, sector, tip.
  const cos = Object.values(S.co).map(c => ({ name: c.name, sym: c.sym, sector: c.sector, price: c.price, rating: c.rating, chg: paperChg(c.h) })).sort((a, b) => b.chg - a.chg);
  const gainers = cos.slice(0, 5), losers = [...cos].reverse().slice(0, 5);
  const secAvg = {};
  cos.forEach(c => { if (!secAvg[c.sector]) secAvg[c.sector] = { s: 0, n: 0 }; secAvg[c.sector].s += c.chg; secAvg[c.sector].n++; });
  const topSec = Object.entries(secAvg).map(([s, v]) => ({ s, a: v.s / v.n })).sort((a, b) => b.a - a.a)[0];
  const idxChg = paperChg(S.idx.h);
  const tip = gainers[0] || cos[0];
  const bizStories = [
    { kicker: 'MARKETS', head: `World markets ${idxChg >= 0 ? 'climb' : 'fall'} ${fmtPct(idxChg)}`, body: `The World Index closed the year at ${S.idx.v.toFixed(0)}. ${idxChg >= 0 ? 'A steady year for traders, with more winners than losers.' : 'A hard year for traders, with sellers in charge for long stretches.'}` },
    topSec ? { kicker: 'BUSINESS', head: `${topSec.s} leads the sectors`, body: `The average ${topSec.s} stock moved ${fmtPct(topSec.a)} this year, ahead of every other line of business in the world.` } : null,
    { kicker: 'ENERGY', head: `Oil at ${S.oil.toFixed(2)}x`, body: `Energy prices set the mood for shipping, airlines and factories alike. Every boardroom in the world is watching the next move in oil.` },
  ].filter(Boolean);
  // Sport: one simulated championship per league, seeded by year + league.
  const FIRST = ['Jack', 'Sam', 'Leo', 'Max', 'Eli', 'Noah', 'Owen', 'Cole', 'Rex', 'Art', 'Mae', 'June', 'Ada', 'Ivy', 'Rosa', 'Nina'];
  const LAST = ['Harper', 'Cole', 'Reed', 'Marsh', 'Stone', 'Blake', 'Frost', 'Lane', 'Quinn', 'Vance', 'Wells', 'Drake'];
  const TEAMS = ['Harbor Hawks', 'Ironwood Bears', 'River Kings', 'Desert Foxes', 'Northern Stars', 'Coastal Sharks', 'Prairie Wolves', 'Mountain Lions', 'City Falcons', 'Bay Pirates', 'Valley Eagles', 'Storm Riders'];
  const LEAGUES = [
    { l: 'NFL', hi: 38, lo: 10 }, { l: 'NBA', hi: 122, lo: 88 }, { l: 'NHL', hi: 6, lo: 1 },
    { l: 'WNBA', hi: 96, lo: 68 }, { l: 'MLB', hi: 11, lo: 2 }, { l: 'KBO', hi: 12, lo: 2 },
    { l: 'NPB', hi: 9, lo: 1 }, { l: 'CPBL', hi: 13, lo: 3 },
  ];
  const sports = LEAGUES.map((lg, i) => {
    const r = mulberry(hashStr('sport' + year + lg.l));
    const a = TEAMS[Math.floor(r() * TEAMS.length)]; let b = TEAMS[Math.floor(r() * TEAMS.length)];
    if (b === a) b = TEAMS[(TEAMS.indexOf(a) + 5) % TEAMS.length];
    const sa = lg.lo + Math.floor(r() * (lg.hi - lg.lo)), sb = Math.max(0, sa - 1 - Math.floor(r() * 8));
    return { l: lg.l, champ: a, runner: b, score: `${sa}–${sb}`, mvp: `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}` };
  });
  return {
    year, day: S.day, date: fmtDate(S.day),
    front: { headline, body: headBody, deck: frontDeck, stories: frontStories.slice(0, 4), kind: frontKind, caption: frontCaption },
    business: { idx: S.idx.v, idxChg, oil: S.oil, gainers, losers, tip, stories: bizStories },
    sports: { leagues: sports, story: `Champions are crowned in every league this year, from the gridiron to the diamond to the ice. The ${sports[0].champ} took the ${sports[0].l} crown, and the ${sports[1].champ} did the same in the ${sports[1].l}. New stars, old rivalries, and one more season for the history books.` },
    numbers: { worldGdp, worldPop, avgStab: playable.length ? stabSum / playable.length : 0, wars: S.wars.length, booms, unrest, topGrowth: growth.slice(0, 5), slowest: growth.slice(-3).reverse(), idx: S.idx.v, idxChg },
    player: playerSnapshot(),
  };
}
function paperEdition() { ensurePapers(); paperEdIdx = Math.max(0, Math.min(S.papers.length - 1, paperEdIdx)); return S.papers[paperEdIdx]; }
function paperArticle(n) {
  return `<article class="part"><div class="pkicker">${esc(n.kicker)}</div><h3>${esc(n.head)}</h3><p class="pbody">${esc(n.body)}</p></article>`;
}
function paperCutSVG(kind) {
  // Original illustration, drawn in code, in black ink on cream — no photo,
  // logo or artwork copied from any real paper. One scene per story kind.
  const sky = '<rect width="600" height="360" fill="#e8ddc0"/><circle cx="500" cy="70" r="42" fill="#d8c9a0"/>';
  const dots = '<pattern id="halftone" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="#1a1a1a" opacity="0.25"/></pattern><rect width="600" height="360" fill="url(#halftone)"/>';
  if (kind === 'war') return `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="War illustration">${sky}<g fill="#1a1a1a"><rect x="40" y="180" width="70" height="180"/><rect x="130" y="140" width="80" height="220"/><rect x="230" y="200" width="60" height="160"/><rect x="310" y="150" width="90" height="210"/><rect x="420" y="190" width="70" height="170"/><rect x="510" y="220" width="60" height="140"/></g><g fill="#555"><circle cx="150" cy="120" r="34"/><circle cx="180" cy="100" r="26"/><circle cx="340" cy="130" r="30"/><circle cx="370" cy="110" r="22"/></g><g fill="#1a1a1a"><rect x="90" y="300" width="90" height="14" transform="rotate(-8 90 300)"/><rect x="400" y="310" width="80" height="12" transform="rotate(6 400 310)"/></g>${dots}</svg>`;
  if (kind === 'unrest') return `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Crowd illustration">${sky}<g fill="#1a1a1a"><rect x="30" y="170" width="90" height="190"/><rect x="140" y="140" width="100" height="220"/><rect x="400" y="160" width="90" height="200"/><rect x="510" y="200" width="60" height="160"/></g><g fill="#1a1a1a">${[60,120,180,240,300,360,420,480,540].map(x => `<circle cx="${x}" cy="300" r="16"/><rect x="${x-14}" y="316" width="28" height="44"/>`).join('')}</g><g stroke="#1a1a1a" stroke-width="4"><line x1="180" y1="260" x2="180" y2="210"/><line x1="360" y1="260" x2="360" y2="210"/></g><rect x="150" y="190" width="80" height="26" fill="#f8f1dc" stroke="#1a1a1a" stroke-width="2"/><rect x="330" y="190" width="80" height="26" fill="#f8f1dc" stroke="#1a1a1a" stroke-width="2"/>${dots}</svg>`;
  if (kind === 'boom') return `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Factory illustration">${sky}<g fill="#1a1a1a"><rect x="40" y="220" width="220" height="140"/><rect x="60" y="170" width="26" height="60"/><rect x="110" y="150" width="26" height="80"/><rect x="160" y="180" width="26" height="50"/><rect x="280" y="240" width="160" height="120"/><rect x="460" y="200" width="100" height="160"/></g><g fill="#555"><circle cx="75" cy="140" r="26"/><circle cx="100" cy="120" r="20"/><circle cx="125" cy="150" r="24"/><circle cx="175" cy="160" r="20"/></g><g stroke="#1a1a1a" stroke-width="5" fill="none"><path d="M280 300 L340 240 L400 240 L460 180"/><circle cx="460" cy="180" r="8" fill="#1a1a1a"/></g>${dots}</svg>`;
  return `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="City skyline illustration">${sky}<g fill="#1a1a1a"><rect x="40" y="200" width="70" height="160"/><rect x="130" y="150" width="80" height="210"/><rect x="230" y="220" width="60" height="140"/><rect x="310" y="120" width="90" height="240"/><rect x="420" y="180" width="70" height="180"/><rect x="510" y="230" width="60" height="130"/></g><g stroke="#1a1a1a" stroke-width="5" fill="none"><path d="M60 330 L180 260 L300 280 L430 180 L540 140"/><path d="M540 140 L520 140 M540 140 L540 160" stroke-width="4"/></g>${dots}</svg>`;
}
function paperTicker(ed) {
  const items = [`WORLD INDEX ${ed.business.idx.toFixed(0)} (${fmtPct(ed.business.idxChg)})`, `OIL ${ed.business.oil.toFixed(2)}x`, `WORLD GDP ${fmtMoney(ed.numbers.worldGdp, true)}`, `WORLD POPULATION ${fmtPop(ed.numbers.worldPop)}`, ...ed.business.gainers.slice(0, 3).map(g => `${g.sym} ${fmtPct(g.chg)}`)];
  const line = items.join(' &nbsp;•&nbsp; ') + ' &nbsp;•&nbsp; ';
  return `<div class="pticker"><div class="pticker-inner"><span>${line}</span><span>${line}</span></div></div>`;
}
function paperHTML() {
  const ed = paperEdition(), total = 5, page = Math.min(paperPage, 4); paperPage = page;
  let body = '';
  if (page === 0) {
    body = `<div class="nfolio"><span>Vol. ${Math.max(1, ed.year - 2025)} · No. ${((ed.day % 365) + 1)}</span><span>WORLD EDITION</span><span>${ed.date.toUpperCase()}</span></div>
    <div class="nname">
      <div class="near">PRICE<br>TWO CENTS</div>
      <div class="ntitle"><h1>The Ticker Times</h1><div class="nmotto">All the World's News — Business, Politics, Sport</div></div>
      <div class="near">EST.<br>1926</div>
    </div>
    <div class="nmarket">MARKETS: World Index ${ed.business.idx.toFixed(0)} (${fmtPct(ed.business.idxChg)}) · Oil ${ed.business.oil.toFixed(2)}x · World GDP ${fmtMoney(ed.numbers.worldGdp, true)} · ${fmtPop(ed.numbers.worldPop)} people</div>
    <div class="nbanner"><div class="pkicker">THE LEAD STORY · WORLD</div><h2>${esc(ed.front.headline)}</h2><p class="ndeck">${esc(ed.front.deck || ed.front.body)}</p></div>
    <div class="nbyline"><span>By The Ticker Times Staff</span><span>WORLD — ${ed.date.toUpperCase()}</span></div>
    <figure class="ncut">${paperCutSVG(ed.front.kind || 'growth')}<figcaption><b>${esc(ed.front.caption)}</b> <span class="ncredit">Ticker Times illustration.</span></figcaption></figure>
    <div class="nlead"><p class="pdrop">${esc(ed.front.body)}</p><p class="pbody">The story above is the one every capital is talking about this year. What happens next will be written in trade, in politics, and in the markets — and it will be in this paper first.</p></div>
    <div class="ncols">${ed.front.stories.map(paperArticle).join('') || '<p>No world stories this year.</p>'}</div>
    <div class="nindex"><b>IN TODAY'S PAPER</b><span>Business — Page 2</span><span>Sport — Page 3</span><span>The Numbers — Page 4</span><span>Your Year — Page 5</span><span>Last edition — use LAST EDITION below</span></div>`;
  } else if (page === 1) {
    body = `<div class="nsection"><span>BUSINESS</span><span>Page 2 · ${ed.date.toUpperCase()}</span></div>
    <div class="pfront">
      <div class="pheadline"><div class="pkicker">BUSINESS · MARKETS</div><h2>Markets ${ed.business.idxChg >= 0 ? 'rise' : 'fall'} ${fmtPct(ed.business.idxChg)}</h2></div>
      <div class="pcols">${ed.business.stories.map(paperArticle).join('')}</div>
      <div class="ptip"><b>★ THE TIP SHEET — A HINT, NOT A PROMISE</b><p>${ed.business.tip ? `Keep an eye on <b>${esc(ed.business.tip.name)} (${esc(ed.business.tip.sym)})</b> — up ${fmtPct(ed.business.tip.chg)} this year, rated ${ed.business.tip.rating.toFixed(1)} stars in ${esc(ed.business.tip.sector)}. The paper likes the look of it. Do your own homework before you buy.` : 'No tip this year.'}</p></div>
      <h3 class="psec">TOP RISERS</h3><div class="ptable">${ed.business.gainers.map(g => `<div class="prow"><span>${esc(g.name)} (${esc(g.sym)})</span><b class="good">${fmtPct(g.chg)}</b></div>`).join('')}</div>
      <h3 class="psec">TOP FALLERS</h3><div class="ptable">${ed.business.losers.map(g => `<div class="prow"><span>${esc(g.name)} (${esc(g.sym)})</span><b class="bad">${fmtPct(g.chg)}</b></div>`).join('')}</div>
    </div>`;
  } else if (page === 2) {
    body = `<div class="nsection"><span>SPORT</span><span>Page 3 · ${ed.date.toUpperCase()}</span></div>
    <div class="pfront">
      <div class="pheadline"><div class="pkicker">SPORT · EVERY LEAGUE</div><h2>Champions crowned around the world</h2><p class="pdrop">${esc(ed.sports.story)}</p></div>
      <div class="psportgrid">${ed.sports.leagues.map(s => `<div class="pscore"><b>${esc(s.l)}</b><div class="pscore-team">${esc(s.champ)}</div><div class="pscore-line">beat ${esc(s.runner)} · ${esc(s.score)}</div><div class="psmall">MVP: ${esc(s.mvp)}</div></div>`).join('')}</div>
      <p class="psmall">NFL · NBA · NHL · WNBA · MLB · KBO · NPB · CPBL — simulated seasons in this world, not real-world results.</p>
    </div>`;
  } else if (page === 3) {
    body = `<div class="nsection"><span>THE NUMBERS</span><span>Page 4 · ${ed.date.toUpperCase()}</span></div>
    <div class="pfront">
      <div class="pheadline"><div class="pkicker">THE NUMBERS</div><h2>The world, by the numbers</h2></div>
      <div class="pbox"><b>THE BIG PICTURE</b><span>World GDP ${fmtMoney(ed.numbers.worldGdp, true)}</span><span>World population ${fmtPop(ed.numbers.worldPop)}</span><span>Average stability ${Math.round(ed.numbers.avgStab)}/100</span><span>World Index ${ed.numbers.idx.toFixed(0)} (${fmtPct(ed.numbers.idxChg)})</span><span>Wars ${ed.numbers.wars} · Booms ${ed.numbers.booms} · Unrest ${ed.numbers.unrest}</span></div>
      <h3 class="psec">FASTEST GROWING COUNTRIES</h3><div class="ptable">${ed.numbers.topGrowth.map(g => `<div class="prow"><span>${esc(g.name)}</span><b>${fmtPct(g.g)} · ${fmtMoney(g.gdp * 1e6, true)}</b></div>`).join('')}</div>
      <h3 class="psec">SLOWEST RISERS</h3><div class="ptable">${ed.numbers.slowest.map(g => `<div class="prow"><span>${esc(g.name)}</span><b>${fmtPct(g.g)}</b></div>`).join('')}</div>
      <p class="psmall">News archive: only this edition and last year's edition are kept. Older editions rotate out on their own.</p>
    </div>`;
  } else {
    const pl = ed.player;
    body = `<div class="nsection"><span>YOUR YEAR</span><span>Page 5 · ${ed.date.toUpperCase()}</span></div>` + (pl ? `<div class="pfront">
      <div class="pheadline"><div class="pkicker">YOUR YEAR · THE INDIVIDUAL LEDGER</div><h2>Your year, in numbers</h2><p class="pdrop">Not the world. You. What you built, what you bought, what you ran, and what it was worth at the end of the year.</p></div>
      <div class="pbox"><b>THE BOTTOM LINE</b><span>Net worth ${fmtMoney(pl.netWorth, true)}${pl.yearAgo != null ? ` · ${(pl.netWorth - pl.yearAgo) >= 0 ? '+' : ''}${fmtMoney(pl.netWorth - pl.yearAgo, true)} this year (${fmtPct(pl.yearAgo ? (pl.netWorth - pl.yearAgo) / pl.yearAgo : 0)})` : ''}</span><span>Cash ${fmtMoney(pl.cash, true)} · Loans ${fmtMoney(pl.loan, true)}</span><span>Stocks held ${fmtMoney(pl.holdingsValue, true)} · Buildings ${fmtMoney(pl.propValue, true)}</span></div>
      <h3 class="psec">COMPANIES YOU RUN</h3>${pl.controlled.length ? `<div class="ptable">${pl.controlled.map(c => `<div class="prow"><span>${esc(c.name)} (${esc(c.sym)}) · ${c.locs} locations${c.fleet ? ` · fleet ${c.fleet}` : ''}</span><b>${c.old != null ? `${c.old.toFixed(1)} → ${c.nw.toFixed(1)} stars` : `${c.rating.toFixed(1)} stars`}</b></div>`).join('')}</div>${pl.controlled.filter(c => c.reasons.length).map(c => `<p class="psmall">${esc(c.name)}: ${esc(c.reasons[0])}</p>`).join('')}` : '<p class="psmall">You do not control a company yet. Buy a majority stake or take one over, then age up.</p>'}
      <h3 class="psec">OUTCOMES THIS YEAR</h3>${pl.yearEntries.length ? `<div class="ptable">${pl.yearEntries.map(e => `<div class="prow"><span>${esc(e.name)}</span><b>${e.old.toFixed(1)} → ${e.new.toFixed(1)} stars</b></div>`).join('')}</div>` : '<p class="psmall">No year-end ratings yet for companies you run.</p>'}${pl.taxLines.length ? `<p class="psmall">${esc(pl.taxLines.join(' '))}</p>` : ''}
      ${pl.leader ? `<h3 class="psec">YOUR NATION</h3><div class="pbox"><b>TREASURY & DEBT</b><span>Treasury ${fmtMoney(pl.leader.treasury, true)} · Debt ${fmtMoney(pl.leader.debt, true)}</span>${pl.leader.lastWeek ? `<span>Last week: revenue ${fmtMoney(pl.leader.lastWeek.revenue, true)} · spending ${fmtMoney(pl.leader.lastWeek.spending, true)} · net ${fmtMoney(pl.leader.lastWeek.net, true)}</span>` : ''}</div>` : ''}
      <h3 class="psec">YOUR NUMBERS</h3><div class="ptable">
        <div class="prow"><span>Level · XP</span><b>Lv ${pl.level} · ${pl.xp} XP</b></div>
        <div class="prow"><span>Career</span><b>${esc(pl.career)} · ${pl.goalsDone} goals done</b></div>
        <div class="prow"><span>Trades · Takeovers · IPOs</span><b>${pl.trades} · ${pl.takeovers} · ${pl.ipos}</b></div>
        <div class="prow"><span>Wars started · Best week profit</span><b>${pl.warsStarted} · ${fmtMoney(pl.bestWeek, true)}</b></div>
        <div class="prow"><span>Stock positions · Buildings</span><b>${pl.holdingsCount} · ${pl.props}</b></div>
        ${pl.projects.length ? `<div class="prow"><span>Projects running</span><b>${esc(pl.projects.join(', '))}</b></div>` : ''}
        ${pl.mil.length ? `<div class="prow"><span>Military</span><b>${pl.mil.map(m => `${m.b} Lv ${m.lv}`).join(' · ')}</b></div>` : ''}
        ${pl.warsHome.length ? `<div class="prow"><span>Wars you are in</span><b>${esc(pl.warsHome.join(', '))}</b></div>` : ''}
      </div>
    </div>` : `<div class="pfront"><div class="pheadline"><div class="pkicker">YOUR YEAR</div><h2>Your ledger starts next year</h2><p class="pdrop">This edition was made before the player page existed. Age up once more and this page will fill with your actions, your outcomes, and your numbers.</p></div></div>`);
  }
  const edLabel = paperEdIdx === 0 ? `THIS YEAR · ${ed.year}` : `LAST YEAR · ${ed.year}`;
  return `<div class="paper-closebar"><button class="paper-closebtn" data-a="closePaper" aria-label="Close newspaper">✕ CLOSE</button></div>
  <div class="psheet">${body}<div class="nfoliofoot"><span>The Ticker Times</span><span>Page ${page + 1} of 5 · ${PAPER_PAGES[page]}</span><span>${ed.date.toUpperCase()}</span></div></div>
  <div class="pedition"><button class="btn" data-a="paperEdPrev" ${paperEdIdx >= S.papers.length - 1 ? 'disabled' : ''}>← LAST EDITION</button><span class="ppage">${edLabel}</span><button class="btn" data-a="paperEdNext" ${paperEdIdx === 0 ? 'disabled' : ''}>THIS EDITION →</button></div>
  <div class="paper-flip"><button class="btn" data-a="paperPrev" ${page === 0 ? 'disabled' : ''}>← PREVIOUS</button><span class="ppage">Page ${page + 1} of 5 · ${PAPER_PAGES[page]}</span><button class="btn" data-a="paperNext" ${page >= 4 ? 'disabled' : ''}>NEXT →</button></div>
  <button class="btn wide paper-return" data-a="closePaper">✕ CLOSE — RETURN TO MAP</button>`;
}

function openPaper(edIdx) { closeModal(); closePanel(); if (watchKey) closeWatch(); paperEdIdx = edIdx == null ? 0 : edIdx; paperPage = 0; $('paper').innerHTML = paperHTML(); $('paper').classList.add('open'); }
function closePaper() { $('paper').innerHTML = ''; $('paper').classList.remove('open'); }
function flipPaper(d) { paperPage = Math.max(0, Math.min(4, paperPage + d)); $('paper').innerHTML = paperHTML(); }
function flipEdition(d) { paperEdIdx = Math.max(0, Math.min(S.papers.length - 1, paperEdIdx + d)); paperPage = 0; $('paper').innerHTML = paperHTML(); }

// ---------- boot / onboarding ----------
// Horizontal on phones: a portrait phone (narrower than it is tall,
// phone-sized) shows the whole game rotated 90 degrees, landscape,
// exactly like web. A phone already sideways, a tablet and a desktop
// are already horizontal, so they are left alone. After the class
// changes, the map has a new size, so fire a resize for it.
// Rotation fix: on a real phone the browser reports stale viewport sizes
// for a while after a rotation (dynamic toolbar / dvh lag), and a single
// 50ms re-measure was not enough — the rotated #game box could keep its
// old portrait size on a landscape screen, showing only a ~half-width
// strip. So #game is now sized in px from innerWidth/innerHeight (never
// dvh, which lags rotation), and re-measured on several ticks until the
// size settles, plus on visualViewport changes (toolbar show/hide).
let orientState = null;
function updateGameOrientation() {
  const w = window.innerWidth, h = window.innerHeight;
  const vv = window.visualViewport, vwv = vv ? Math.round(vv.width) : w, vvh = vv ? Math.round(vv.height) : h;
  const portraitPhone = w <= 760 && h > w;
  if (orientState && orientState.w === w && orientState.h === h && orientState.vw === vwv && orientState.vh === vvh && orientState.cls === portraitPhone) return;
  orientState = { w, h, vw: vwv, vh: vvh, cls: portraitPhone };
  document.body.classList.toggle('landscape-phone', portraitPhone);
  const game = $('game');
  if (game) {
    if (portraitPhone) { game.style.width = h + 'px'; game.style.height = w + 'px'; }
    else { game.style.width = ''; game.style.height = ''; }
  }
  let tries = 0;
  const tick = () => {
    window.dispatchEvent(new Event('resize'));
    if (tries++ < 6) setTimeout(tick, tries < 3 ? 80 : 200);
  };
  requestAnimationFrame(tick);
}
async function boot() {
  updateGameOrientation();
  window.addEventListener('resize', updateGameOrientation);
  window.addEventListener('orientationchange', updateGameOrientation);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', updateGameOrientation);
  W = buildWorld();
  MapView.init();
  MapView.on('city', onCityTap); MapView.on('country', onCountryTap); MapView.on('vehicle', openVehicleCard);
  MapView.on('place', placeBusiness); MapView.on('placed', openPlacedCard);
  MapView.on('empty', () => { if (!UI.pick) closePopup(); });
  MapView.on('frame', loop);
  CityView.init($('cityview'), onPin);
  document.addEventListener('click', onClick);
  // Swipe a newspaper page left or right to flip it, like turning a page.
  let paperX = null;
  $('paper').addEventListener('pointerdown', e => { paperX = e.clientX; });
  $('paper').addEventListener('pointerup', e => { if (paperX == null) return; const dx = e.clientX - paperX; paperX = null; if (Math.abs(dx) > 70 && $('paper').classList.contains('open')) flipPaper(dx < 0 ? 1 : -1); });
  // Swipe the fixed Age bar right to age up, left to age down (ad-gated).
  // This only fires on the Age bar itself, never on the map, so swiping
  // to pan the map still works. A tap on + / − is handled by the click
  // handler, not by this, because a tap moves less than 70 px.
  let ageX = null;
  $('hud').addEventListener('pointerdown', e => { if (e.target.closest('.agebar')) ageX = e.clientX; });
  $('hud').addEventListener('pointerup', e => { if (ageX == null) return; const dx = e.clientX - ageX; ageX = null; if (Math.abs(dx) > 70) { if (dx > 0) A.ageUp(); else A.ageDown(); } });
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  const saved = await loadSave();
  if (saved) {
    S = saved;
    // A saved Random World reloads its generated landmass from its
    // seed, so the map, countries and cities match the save exactly.
    // Old shuffled saves (no seed) keep real Earth, as before.
    if (S.mode === 'random' && S.randomSeed != null && typeof switchWorldToRandom === 'function') switchWorldToRandom(S.randomSeed);
    enterGame(true);
  }
  else showInherit();
}
function showInherit() {
  $('hud').innerHTML = ''; MapView.setPick(false); closeModal(); UI.introMode = null;
  $('inherit').innerHTML = `<h1>WORL</h1>
    <div class="intro-modes">
      <button class="intro-mode" data-a="introMode" data-x="offline"><b>Offline</b><span>Play on your own. World — the real world as it is today — or Random World, a fully generated world with random land, countries, economies and companies.</span></button>
      <button class="intro-mode" data-a="introMode" data-x="online"><b>Online</b><span>Same two worlds, but against real players. PvP comes later — it is not built yet.</span></button>
    </div>
    <button class="btn" data-a="introMode" data-x="minigames" style="margin-top:4px">🎮 Mini Games — no country needed</button>
    <div id="inheritStep" class="intro-step"></div>`;
  $('inherit').classList.add('open');
}
function renderInheritStep() {
  const step = document.getElementById('inheritStep'); if (!step) return;
  document.querySelectorAll('.intro-mode').forEach(b => b.classList.toggle('on', b.dataset.x === UI.introMode));
  if (UI.introMode === 'offline') {
    step.innerHTML = `<div class="inherit-line">Offline</div>
      <p style="color:#bbb;font-size:14px;font-weight:800">Play on your own, no other players.</p>
      <button class="btn3d orange wide" data-a="introMode" data-x="world">🌍 WORLD — the real world as it is today</button>
      <button class="btn3d wide" data-a="introMode" data-x="random">🎲 RANDOM WORLD — generated land, countries, economies, companies</button>`;
  } else if (UI.introMode === 'online') {
    step.innerHTML = `<div class="inherit-line">Online</div>
      <p style="color:#bbb;font-size:14px;font-weight:800">The same two worlds, against real players. PvP is coming later — it is not built yet, and nothing here pretends otherwise: there are no AI rivals dressed up as online players.</p>
      <div class="card" style="background:#1a1a1a;color:#fff;text-align:left"><p><b>🌍 World PvP</b></p><p class="muted small" style="color:#bbb">Coming later.</p></div>
      <div class="card" style="background:#1a1a1a;color:#fff;text-align:left"><p><b>🎲 Random World PvP</b></p><p class="muted small" style="color:#bbb">Coming later.</p></div>
      <button class="btn wide" data-a="introMode" data-x="offline">← PLAY OFFLINE INSTEAD</button>`;
  } else if (UI.introMode === 'world') {
    const list = W.playable.slice().sort((a, b) => a.name.localeCompare(b.name));
    step.innerHTML = `<div class="inherit-line">You have inherited</div>
      <select id="inheritCountry" aria-label="Choose a country to inherit">${list.map(k => `<option value="${k.a3}" ${k.a3 === 'USA' ? 'selected' : ''}>${k.flag} ${k.a3} · ${esc(k.name)} — ${inheritDifficulty(k)}</option>`).join('')}</select>
      <div id="inheritInfo" style="color:#bbb;font-size:14px;font-weight:800">Capital: Washington, D.C. · 328M people · GDP $21.4T</div>
      <label style="color:#bbb;font-size:14px;font-weight:800;text-align:left;width:min(480px,90vw)">Country name — keep its real name, or give it your own</label>
      <input id="inheritName" class="text-in" style="width:min(480px,90vw)" maxlength="40" value="United States" autocomplete="off" aria-label="Country name">
      <p>You are now the leader of this country, as it is today. Tax its businesses, pay your people, trade, and grow — or invade a neighbour for the challenge.</p>
      <button class="btn3d orange wide" data-a="inheritContinue">CONTINUE</button>`;
    const sel = document.getElementById('inheritCountry'), inp = document.getElementById('inheritName'), infoEl = document.getElementById('inheritInfo');
    const updateInheritInfo = () => { const kk = W.byA3[sel.value]; if (!kk) return; if (inp) inp.value = kk.name; if (infoEl) { const cap = W.cities[kk.capital]; infoEl.textContent = `Capital: ${cap ? cap.name : '—'} · ${fmtPop(kk.pop0)} people · GDP ${fmtMoney(kk.gdp0 * 1e6, true)} · ${inheritDifficulty(kk)}`; } };
    if (sel) sel.addEventListener('change', updateInheritInfo);
    updateInheritInfo();
  } else if (UI.introMode === 'minigames') {
    step.innerHTML = `<div class="inherit-line">Mini Games</div>
      <p style="color:#bbb;font-size:14px;font-weight:800">The battle grid, on its own. No country, no war, no consequences — just you against the enemy, round after round.</p>
      <label style="color:#bbb;font-size:14px;font-weight:800;text-align:left;width:min(480px,90vw)">Board — size and shape</label>
      <select id="miniBoard" aria-label="Choose a battle board">${BATTLE_SIZE_OPTIONS.map(o => `<option value="${o.id}" ${o.id === '6x6' ? 'selected' : ''}>${o.label}${o.shape !== 'grid' ? ' · ' + o.shape : ''}</option>`).join('')}</select>
      <p style="color:#bbb;font-size:14px;font-weight:800">Each side starts with 50 units in a corner. Every tile you own makes 1 unit per second. Wipe out the enemy's tiles to win.</p>
      <button class="btn3d orange wide" data-a="minigamesPlay">▶ PLAY BATTLE GRID</button>`;
  } else if (UI.introMode === 'random') {
    const list = W.playable.slice().sort((a, b) => a.name.localeCompare(b.name));
    step.innerHTML = `<div class="inherit-line">You have inherited — Random World</div>
      <select id="inheritCountry" aria-label="Choose a country to inherit">${list.map(k => `<option value="${k.a3}" ${k.a3 === 'USA' ? 'selected' : ''}>${k.flag} ${k.a3} · ${esc(k.name)} — ${inheritDifficulty(k)}</option>`).join('')}</select>
      <div id="inheritInfo" style="color:#bbb;font-size:14px;font-weight:800">Capital: Washington, D.C. · 328M people · GDP $21.4T</div>
      <label style="color:#bbb;font-size:14px;font-weight:800;text-align:left;width:min(480px,90vw)">Country name — keep its real name, or give it your own</label>
      <input id="inheritName" class="text-in" style="width:min(480px,90vw)" maxlength="40" value="United States" autocomplete="off" aria-label="Country name">
      <p>Random World: a fully generated world. The landmass, continents, countries, cities, populations, GDPs and every company and stock name are generated fresh each time you pick it — no real Earth at all. Your starting treasury, debt and stability are random on top of that. No rivals, no win goal, no situation cards: an endless sandbox, like World.</p>
      <div class="row"><button class="btn flex" data-a="introRandom">🎲 RANDOM COUNTRY</button><button class="btn3d orange flex" data-a="randomContinue">START RANDOM WORLD</button></div>`;
    const sel = document.getElementById('inheritCountry'), inp = document.getElementById('inheritName'), infoEl = document.getElementById('inheritInfo');
    const updateInheritInfo = () => { const kk = W.byA3[sel.value]; if (!kk) return; if (inp) inp.value = kk.name; if (infoEl) { const cap = W.cities[kk.capital]; infoEl.textContent = `Capital: ${cap ? cap.name : '—'} · ${fmtPop(kk.pop0)} people · GDP ${fmtMoney(kk.gdp0 * 1e6, true)} · ${inheritDifficulty(kk)}`; } };
    if (sel) sel.addEventListener('change', updateInheritInfo);
    updateInheritInfo();
  }
}
function hideInherit() { $('inherit').innerHTML = ''; $('inherit').classList.remove('open'); }
function showTitle() {
  $('hud').innerHTML = ''; MapView.setPick(false);
  openModal(`<div class="title-card">
    <div class="brand"><span class="logo big" style="background:#2f7cf6">${LOGO_SVG}</span><div><h1>Worl</h1><p>Build an empire across the real world. Grow your nation, grow your money, and beat the market.</p></div></div>
    ${UI.lastOver ? `<div class="note">Your last run ended with a score of <b>${UI.lastOver.score}</b>.</div>` : ''}
    <button class="btn3d orange wide" data-a="newGame">NEW GAME</button>
  </div>`, 'center');
}
function chooseMode() {
  openModal(`<h2>Choose a game mode</h2><p class="muted">You can't change this later.</p>
    <div class="modes">
      <button class="mode" data-a="pickMode" data-x="normal"><div class="mode-ic">⏳</div><b>Normal</b><span>No time limit. Press Age to move a year forward, vehicles keep moving while you wait. At the end you get a final score for population, money and how far you beat the market.</span></button>
      <button class="mode" data-a="pickMode" data-x="infinite"><div class="mode-ic">♾️</div><b>Infinite</b><span>No goal and no end. Press Age to move a year forward whenever you want.</span></button>
    </div>`, 'center');
}
function startPick() {
  closeModal(); UI.pick = { a3: null }; MapView.setPick(true); MapView.world(); renderPick();
}
function renderPick() {
  const a3 = UI.pick.a3, k = a3 && W.byA3[a3];
  const q = (UI.pq || '').trim().toLowerCase();
  const list = q ? W.countries.filter(c => c.playable && c.name.toLowerCase().includes(q)).slice(0, 6) : [];
  $('hud').innerHTML = `<div class="pick-top card"><b>Pick your country</b><span class="muted">Tap a country on the map, or search.</span>
    <input id="csearch" class="search" placeholder="Search countries" value="${esc(UI.pq || '')}" autocomplete="off">
    <div class="sugg">${list.map(c => `<button class="chip" data-a="pickCountry" data-x="${c.a3}">${c.flag} ${esc(c.name)}</button>`).join('')}</div></div>
  ${k ? `<div class="pick-card card">
    <div class="row start"><div class="flag-big">${k.flag}</div><div><h2>${esc(k.name)}</h2><div class="muted">${esc(k.sub)} · ${fmtPop(k.pop0)} people</div></div></div>
    <div class="stats3 box"><div><span>Population</span><b>${fmtPop(k.pop0)}</b></div><div><span>GDP per person</span><b>${fmtMoney(k.gdp0 * 1e6 / k.pop0, true)}</b></div><div><span>Neighbours</span><b>${k.nb.filter(n => W.byA3[n] && W.byA3[n].playable).length}</b></div></div>
    <p class="muted small">${k.wealth > 1.2 ? 'Rich market: high prices and high rents.' : k.wealth > 0.6 ? 'Middle-income market: balanced costs.' : 'Developing market: cheap to start, fast population growth.'} ${k.nb.length === 0 ? 'An island: safe from land invasion.' : ''}</p>
    <button class="btn3d orange wide" data-a="confirmCountry">START IN ${esc(k.name.toUpperCase())}</button></div>` : ''}`;
}
function nameCompany() {
  const k = W.byA3[UI.pick.a3];
  UI.color = LOGO_COLORS[0];
  openModal(`<h2>Name your company</h2><p class="muted">Based in ${k.flag} ${esc(k.name)}.</p>
    <input id="cname" class="text-in" maxlength="24" value="${esc(k.name.split(' ')[0])} Holdings" autocomplete="off">
    <div class="label">Colour</div><div class="swatches">${LOGO_COLORS.map((c, i) => `<button class="sw ${i === 0 ? 'on' : ''}" style="background:${c}" data-a="swatch" data-x="${c}" aria-label="colour ${i + 1}"></button>`).join('')}</div>
    <button class="btn3d orange wide" data-a="beginGame">START</button>`, 'center');
}
function enterGame(returning) {
  UI.pick = null; UI.q = ''; MapView.setPick(false); closeModal(); hideInherit();
  S.speed = 1; // Vehicle speed on the map, not game time. Game time does not advance on its own; it only moves on Age.
  const da = S.leader ? 0 : autoCreditDaily(), ca = S.leader ? 0 : autoCreditShopCash();
  if (da + ca > 0) setTimeout(() => toast(`+${fmtMoney(da + ca, true)} added to your cash`, 'good'), 600);
  if (typeof applyCapitalName === 'function') { try { applyCapitalName(); } catch (e) {} }
  renderHUD(); MapView.home();
  if (returning) welcomeBack(); else S.tutorial = 0;
  renderTutorial();
}
const TUT = [
  { t: () => S.mode === 'infinite' ? 'Welcome! There is no goal in Infinite mode. Play as long as you like and press Age whenever you want.' : `Welcome! No time limit. Grow ${esc(cname(S.home))}'s population, grow your money, and beat the stock market. Press Age to move a year forward.`, btn: 'Next' },
  { t: () => `Every dot is a real city. Tap ${esc(W.cities[W.byA3[S.home].capital].name)} to open it.`, done: () => UI.popup && UI.popup.type === 'city' },
  { t: () => 'Tap ENTER CAPITAL to see the streets.', done: () => CityView.isOpen() },
  { t: () => 'Red FOR LEASE signs are empty storefronts. Lease one for your company and open your first location.', done: () => locCount() >= 1 },
  { t: () => 'Nice! Now open Markets and buy your first stock. Every stock is a company based in a real country.', done: () => S.stats.trades > 0 },
  { t: () => 'Time only moves when you press Age, one year at a time. Vehicles keep moving while you wait. No age limit — you can live 100 years, or 1000.', btn: 'Got it' },
];
function renderTutorial() {
  if (!S || S.tutorial == null || S.tutorial < 0 || S.tutorial >= TUT.length) { $('tut').innerHTML = ''; return; }
  const s = TUT[S.tutorial];
  const tutText = typeof s.t === 'function' ? s.t() : s.t;
  $('tut').innerHTML = `<div class="tut card"><p>${tutText}</p><div class="row end"><button data-a="tutSkip">Skip</button>${s.btn ? `<button class="btn" data-a="tutNext">${s.btn}</button>` : '<span class="muted small">Do this to continue</span>'}</div></div>`;
}
function tutCheck() {
  if (S && S.tutorial >= 0 && S.tutorial < TUT.length && TUT[S.tutorial].done && TUT[S.tutorial].done()) { S.tutorial++; renderTutorial(); save(); }
}
function welcomeBack() {
  if (S.lastSeen && Date.now() - S.lastSeen > 864e5) {
    openModal(`<h2>Welcome back!</h2><p class="muted">Day ${S.day} · ${fmtDate(S.day)} · ${careerName()}</p>
      <div class="stats3 box"><div><span>Net worth</span><b>${fmtMoney(netWorth(), true)}</b></div><div><span>Population</span><b>${fmtPop(nationPop())}</b></div><div><span>vs Market</span><b class="${upCls(beatMarket())}">${fmtPct(beatMarket())}</b></div></div>
      <p class="muted small">Today's daily reward was added to your cash automatically, no claiming needed.</p>
      <button class="btn wide" data-a="closeModal">CONTINUE</button>`, 'sheet');
  }
}

// ---------- map / city popups ----------
function onCityTap(id) {
  if (UI.pick || !S) return;
  MapView.select(id); UI.popup = { type: 'city', id }; renderPopup(); tutCheck();
}
function onCountryTap(a3) {
  if (UI.pick) { UI.pick.a3 = a3; MapView.setPick(true, a3); MapView.flyToCountry(a3); renderPick(); return; }
  if (!S) return;
  // A country tap is a country, not a stock: a country can have more
  // than one business, so tapping it no longer opens one company's
  // stock. It opens the country itself, with its businesses listed.
  UI.popup = { type: 'country', a3 }; renderPopup(); tutCheck();
}
// Place-a-business: the player taps anywhere on the map and a real
// business circle appears there. Registered to the nearest country
// (for value and weekly income), but drawn exactly where tapped.
// First one is free, so it can be tested straight away.
function placeBusiness(mx, my) {
  if (!S || !UI.placing) return;
  try {
    let nearest = null, bd = 1e18;
    W.cities.forEach(ct => { const d = Math.hypot(ct.x - mx, ct.y - my); if (d < bd) { bd = d; nearest = ct; } });
    if (!nearest) { UI.placing = false; renderHUD(); return; }
    const k = W.byA3[nearest.a3];
    if (!Array.isArray(S.placed)) S.placed = [];
    const free = S.placed.length === 0, cost = free ? 0 : 5000000;
    if (S.cash < cost) { toast('Not enough cash for another business.', 'bad'); return; }
    const pool = (typeof sectorPoolForCountry === 'function') ? sectorPoolForCountry(k) : null;
    const sector = pool && pool.length ? pick(pool) : LEADER_SECTORS[Math.floor(rand() * LEADER_SECTORS.length)].n;
    const info = LEADER_SECTOR_BY_NAME[sector] || { icon: ICONS.company, c: '#374151' };
    let brand, name;
    const used = new Set(S.placed.map(b => b.name));
    // Shuffled world only: separate random pool (see random-names.js).
    if (typeof genRandomCompany === 'function' && isRandomWorld()) { const g = genRandomCompany(sector, used, new Set()); if (g) { brand = g.brand; name = g.name; } }
    if (!name) { do { brand = pick(BRAND_A) + pick(BRAND_B); } while (used.has(brand)); name = brand + pick(SUFFIX[sector] || [' Co.']); }
    const value = Math.max(1000000, Math.round(k.gdp0 * 1e6 * 0.008 / 3 * (0.7 + rand() * 0.6) / 1000) * 1000);
    S.cash -= cost;
    const b = { id: uid(), name, sector, icon: info.icon, color: info.c, a3: k.a3, x: mx, y: my, value, income: value * 0.001, rating: 3.4 + rand() * 0.5 };
    S.placed.push(b);
    UI.placing = false; renderHUD(); save();
    UI.popup = { type: 'placed', id: b.id }; renderPopup();
    toast(free ? `Business placed — first one free. ${fmtMoney(b.income)}/week.` : `Business placed in ${cname(k.a3)} — ${fmtMoney(b.income)}/week.`, 'good');
  } catch (e) { UI.placing = false; renderHUD(); toast('Could not place that business.', 'bad'); }
}
function openPlacedCard(id) {
  if (!S) return;
  UI.popup = { type: 'placed', id }; renderPopup();
}
function closePopup() { UI.popup = null; MapView.select(null); $('popup').innerHTML = ''; }
function renderPopupInner() {
  if (!UI.popup) { $('popup').innerHTML = ''; return; }
  const p = UI.popup;
  if (p.type === 'city') {
    const c = W.cities[p.id], k = W.byA3[c.a3], co = S.co[c.a3], st = countryStatus(c.a3);
    const myLocs = controlled(c.a3) ? co.locs.filter(l => (l.city || co.city) === c.id).length : 0;
    const myProps = S.props.filter(x => x.city === c.id).length;
    $('popup').innerHTML = `<div class="popup card">
      <div class="row between"><div><b>${esc(c.name)}</b><div class="muted small">${k.flag} ${esc(k.name)} · ${esc(st.t)} · ${c.isCapital ? 'Capital, military & port in one' : (c.isMajor ? 'Major city' : 'City')}</div></div><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
      <div class="row"><button class="btn3d orange flex" data-a="enterCity" data-x="${c.id}">${c.isCapital ? 'ENTER CAPITAL' : 'ENTER CITY'}</button><button class="btn flex" data-a="countryMarkets" data-x="${c.a3}">BUSINESSES IN MARKETS</button></div>
      <div class="stats3 box"><div><span>Population</span><b>${fmtPop(c.popAlloc || c.pop)}</b></div><div><span>GDP</span><b>${fmtMoney(c.gdpAlloc || 0, true)}</b></div><div><span>Your buildings</span><b>${myProps}</b></div></div>
      <h5>Businesses here</h5>
      ${businessesInCity(c.id).map(({ c: bc, l }) => `<div class="kv"><span>🏢 ${esc(bc.name)} · ${SECTORS[bc.sector].loc.name} here · ★ ${l.sat.toFixed(1)}</span><b class="${upCls(l.profit)}">${fmtMoney(l.profit, true)}/week</b></div>`).join('') || `<p class="muted small">No businesses here yet. ${esc(co.name)} is this country's main business — see it in Markets if you want its stock.</p>`}
      ${(() => { try { const tm = teamForCity(c.id); return tm ? `<div class="kv"><span>🏟️ ${esc(tm.stadium.name)} · ${esc(tm.name)}</span><button class="btn" data-a="openStadium" data-x="${tm.id}">OPEN TEAM</button></div>` : ''; } catch (e) { return ''; } })()}
      ${W.byA3[c.a3].capital === c.id && c.a3 !== S.home ? `<div class="row"><button class="btn3d orange wide" data-a="warPlan" data-x="${c.a3}">INVADE</button></div>` : ''}
    </div>`;
  } else if (p.type === 'country') {
    const k = W.byA3[p.a3], co = S.co[p.a3], st = countryStatus(p.a3), cs = country(p.a3), cap = W.cities[k.capital];
    const biz = (typeof businessesInCountry === 'function') ? businessesInCountry(p.a3) : [co];
    $('popup').innerHTML = `<div class="popup card">
      <div class="row between"><div><b>${k.flag} ${esc(cname(p.a3))}</b><div class="muted small">${esc(k.sub)} · ${esc(st.t)} · Stability ${Math.round(cs.stab)} / 100</div></div><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
      <div class="row">${cap ? `<button class="btn3d orange flex" data-a="enterCity" data-x="${cap.id}">ENTER CAPITAL</button>` : ''}<button class="btn flex" data-a="countryMarkets" data-x="${p.a3}">BUSINESSES IN MARKETS</button></div>
      <div class="stats3 box"><div><span>Population</span><b>${fmtPop(k.pop0)}</b></div><div><span>GDP</span><b>${fmtMoney(cs.gdp * 1000000, true)}</b></div><div><span>Businesses</span><b>${biz.length}</b></div></div>
      <h5>Businesses</h5>
      ${biz.map(bc => `<div class="kv"><span>${(SECTORS[bc.sector] && SECTORS[bc.sector].icon) || ICONS.company} ${esc(bc.name)} · ${esc(bc.sector)} · ★ ${bc.rating.toFixed(1)}${bc.locs ? ' · ' + bc.locs.length + ' locations' : ' · ' + (bc.employees || 0).toLocaleString() + ' employees'}</span><b>${fmtMoney(bc.locs ? companyValue(bc) : bc.value, true)}</b></div>`).join('')}
      <p class="muted small">A country can have more than one business, so this is the country, not one stock. Trade a business's stock in Markets.</p>
      ${p.a3 !== S.home ? `<div class="row"><button class="btn3d orange wide" data-a="warPlan" data-x="${p.a3}">INVADE</button></div>` : ''}
    </div>`;
  } else if (p.type === 'placed') {
    const b = (S.placed || []).find(x => x.id === p.id);
    if (!b) { $('popup').innerHTML = ''; return; }
    const k = W.byA3[b.a3];
    $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>${b.icon} ${esc(b.name)}</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
      <p class="muted small">${esc(b.sector)} · ${k ? k.flag + ' ' + esc(cname(b.a3)) : ''} · Your business, placed by you</p>
      <div class="stats3 box"><div><span>Value</span><b>${fmtMoney(b.value, true)}</b></div><div><span>Income / week</span><b>${fmtMoney(b.income)}</b></div><div><span>Rating</span><b>${b.rating.toFixed(1)}★</b></div></div>
      <p class="muted small">Pays its weekly income straight to your cash every week.</p></div>`;
  } else if (p.type === 'pin') {
    const lot = p.lot, city = CityView.city, co = S.co[city.a3];
    if (p.pin.type === 'marsMine') {
      const s = p.pin.site, roi = s.price ? s.income * 52 / s.price : 0;
      if (s.owned) {
        $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>⛏️ ${esc(s.resource)} mine</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
        <p class="muted small">Mars · Your mine site</p>
        <div class="stats3 box"><div><span>Value</span><b>${fmtMoney(s.price, true)}</b></div><div><span>Income / week</span><b>${fmtMoney(s.income)}</b></div><div><span>ROI</span><b>${(roi * 100).toFixed(2)}%</b></div></div>
        <button class="btn flex" data-a="marsSellMine" data-x="${s.t}">SELL · ${fmtMoney(Math.round(s.price * 0.8), true)}</button></div>`;
      } else {
        $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>⛏️ ${esc(s.resource)} mine site</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
        <p class="muted small">Mars · Dirt and mines · Buy it like a building in a city</p>
        <div class="stats3 box"><div><span>Price</span><b>${fmtMoney(s.price, true)}</b></div><div><span>Weekly income</span><b>${fmtMoney(s.income)}</b></div><div><span>ROI</span><b>${(roi * 100).toFixed(2)}%</b></div></div>
        <button class="btn3d orange wide" data-a="marsBuyMine" data-x="${s.t}">BUY MINE · ${fmtMoney(s.price, true)}</button></div>`;
      }
    } else if (p.pin.type === 'stadium') {
      const tm = p.pin.team;
      $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>🏟️ ${esc(tm.stadium.name)}</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
        <p class="muted small">${esc(tm.name)} · ${tm.wins}W - ${tm.losses}L · ${tm.stadium.capacity.toLocaleString()} seats · Value ${fmtMoney(tm.value, true)}</p>
        <button class="btn3d orange wide" data-a="openStadium" data-x="${tm.id}">OPEN TEAM</button></div>`;
    } else if (p.pin.type === 'loc') {
      const l = p.pin.loc;
      $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>${SECTORS[co.sector].loc.name}</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
        <div class="stats3 box"><div><span>Profit / week</span><b class="${upCls(l.profit)}">${fmtMoney(l.profit, true)}</b></div><div><span>Customers</span><b>${l.cust}</b></div><div><span>Satisfaction</span><b>${l.sat.toFixed(1)}★</b></div></div>
        <p class="muted small">Staff ${l.staff} · Rent ${fmtMoney(l.rent)}/week · Traffic ${l.traffic}</p>
        <button class="btn" data-a="closeLoc" data-x="${co.a3}|${l.id}">CLOSE LOCATION</button></div>`;
    } else if (p.pin.type === 'store') {
      const st = p.pin.store;
      closePopup(); closeModal();
      UI.panel = 'stores'; UI.stack = [st.id]; renderPanel(); renderHUD();
    } else if (p.pin.type === 'lease') {
      const rentW = lotRent(co, lot), deposit = Math.round(rentW * 10);
      $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>Property for lease</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
        <p class="muted small">${esc(city.name)} · Foot traffic ${lot.traffic.toLocaleString()} per week</p>
        <div class="stats3 box"><div><span>Weekly rent</span><b>${fmtMoney(rentW)}/week</b></div><div><span>Security deposit</span><b>${fmtMoney(deposit)} upfront</b></div><div><span>Foot traffic</span><b>${lot.traffic.toLocaleString()}/week</b></div></div>
        <button class="btn3d orange wide" data-a="buildStoreOpen" data-x="${city.id}|${lot.t}">BUILD STORE</button>
        <p class="muted small">A store pays the deposit and a fit-out on top of rent, then earns every week from customers. Or lease it for a company you control:</p>
        <div class="row"><button class="btn flex" data-a="lease" data-x="${lot.t}|1">LEASE · BASIC</button><button class="btn flex" data-a="lease" data-x="${lot.t}|2">LEASE · PREMIUM</button></div></div>`;
    } else if (p.pin.type === 'sale') {
      const wkRent = Math.round(lot.units * lot.mrent * 0.622 / 4.33), roi = lot.price ? wkRent * 52 / lot.price : 0;
      $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>Real estate for sale</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
        <p class="muted small">${esc(city.name)} · ${lot.units} units · Condition ${Math.round(lot.cond * 100)}%</p>
        <div class="stats3 box"><div><span>Estimated value</span><b>${fmtMoney(lot.price, true)}</b></div><div><span>Weekly rent income</span><b>${fmtMoney(wkRent)}</b></div><div><span>ROI</span><b>${(roi * 100).toFixed(2)}%</b></div></div>
        <div class="kv"><span>Annual rent / unit</span><b>${fmtMoney(lot.mrent * 12)}</b></div><div class="kv"><span>Occupancy</span><b>62.2%</b></div><div class="kv"><span>Asking price</span><b>${fmtMoney(Math.round(lot.price * 1.17), true)}</b></div>
        <button class="btn3d orange wide" data-a="buyBld" data-x="${lot.t}">OFFER PURCHASE</button></div>`;
    } else if (p.pin.type === 'building') {
      // Any building in the city, tapped directly: buy it like a
      // property. Same rent math as a FOR SALE building.
      const lot = p.pin.lot, wkRent = Math.round(lot.units * lot.mrent * 0.622 / 4.33), roi = lot.price ? wkRent * 52 / lot.price : 0;
      $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>${buildingIcon(lot.arch)} ${esc(buildingName(lot.arch))}</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
        <p class="muted small">${esc(city.name)} · ${lot.floors} floors · ${lot.units} units · Condition ${Math.round(lot.cond * 100)}%</p>
        <div class="stats3 box"><div><span>Price</span><b>${fmtMoney(lot.price, true)}</b></div><div><span>Weekly rent income</span><b>${fmtMoney(wkRent)}</b></div><div><span>ROI</span><b>${(roi * 100).toFixed(2)}%</b></div></div>
        <div class="kv"><span>Annual rent / unit</span><b>${fmtMoney(lot.mrent * 12)}</b></div><div class="kv"><span>Foot traffic</span><b>${lot.traffic.toLocaleString()}/week</b></div>
        <button class="btn3d orange wide" data-a="buyAnyBld" data-x="${lot.t}">BUY BUILDING · ${fmtMoney(lot.price, true)}</button></div>`;
    } else if (p.pin.type === 'prop') {
      const pr = S.props.find(x => x.city === city.id && x.t === lot.t);
      $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>Your building</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
        <div class="stats3 box"><div><span>Value</span><b>${fmtMoney(pr.value, true)}</b></div><div><span>Income / week</span><b>${fmtMoney(pr.income, true)}</b></div><div><span>Condition</span><b>${Math.round(pr.cond * 100)}%</b></div></div>
        <p class="muted small">${pr.units} units · Occupancy ${Math.round(pr.occ * 100)}% · Rent level ${pr.rentLv.toFixed(1)}x</p>
        <div class="row"><button class="btn flex" data-a="renovate" data-x="${pr.id}">RENOVATE ${fmtMoney(renoCost(pr), true)}</button><button class="btn flex" data-a="sellBld" data-x="${pr.id}">SELL</button></div></div>`;
    }
  }
}
// Scroll-preserving wrapper for city/country popups. The frame loop used
// to rewrite the popup every 250ms, which reset a scrolled popup to the
// top just like the panel bug — same fix: restore the scroll position
// after the rewrite, clamped to the new content height.
function renderPopup() {
  const el = (typeof document !== 'undefined' && document.querySelector) ? document.querySelector('#popup .popup') : null;
  const st = el ? el.scrollTop : 0;
  renderPopupInner();
  if (st > 0) {
    const nel = document.querySelector('#popup .popup');
    if (nel) nel.scrollTop = Math.max(0, Math.min(st, nel.scrollHeight - nel.clientHeight));
  }
}
function onPin(pin) {
  // Landmark tap (the Capitol in a capital city view): your own capital
  // opens the full capital design view — rename, motto, theme and
  // districts, everything — not a small card. Any other country's
  // landmark cannot be designed by you, so it says so plainly.
  if (pin.type === 'landmark') {
    const c = pin.city || CityView.city;
    if (c && c.a3 === S.home && c.id === W.byA3[S.home].capital) { leaveCity(); openPanel('capital'); return; }
    toast(c ? `This is ${landmarkNameFor(c)} in ${c.name} — only your own capital can be designed here.` : 'Only your own capital can be designed here.', 'bad');
    return;
  }
  UI.popup = { type: 'pin', pin, lot: pin.lot }; renderPopup();
}
// Landmark name for a city, without reaching into CityView internals.
function landmarkNameFor(c) {
  const n = c.name;
  if (n === 'Washington, D.C.') return 'Capitol';
  if (n === 'Paris') return 'Iron Tower';
  if (n === 'Tokyo') return 'Red Tower';
  if (n === 'London') return 'Clock Tower';
  if (n === 'New York') return 'Torch Statue';
  if (n === 'Rome') return 'Grand Arena';
  if (n === 'Beijing' || n === 'Seoul') return 'Pagoda Tower';
  if (n === 'Moscow') return 'Onion Domes';
  if (n === 'Cairo') return 'Great Pyramid';
  if (n === 'Berlin') return 'Victory Gate';
  if (n === 'Athens') return 'Temple';
  return 'Landmark';
}
function enterCity(id) {
  closePopup(); CityView.open(id); document.body.classList.add('in-city'); renderCityHUD(); tutCheck();
}
function leaveCity() {
  CityView.close(); document.body.classList.remove('in-city'); $('chud').innerHTML = ''; UI.lastCityHUD = ''; renderHUD();
}

// ---------- skip / game over / loop ----------
function skipMenu() {
  openModal(`<h2>Time warp</h2><p class="muted">Infinite mode only. The world keeps moving while you skip.</p>
    <div class="row wrap"><button class="btn" data-a="skip" data-x="1">1 day</button><button class="btn" data-a="skip" data-x="7">1 week</button><button class="btn" data-a="skip" data-x="30">1 month</button><button class="btn" data-a="skip" data-x="365">1 year</button></div>`, 'sheet');
}
function doSkip(days) {
  const nw0 = netWorth(), pop0 = country(S.home).pop, top = S.news[0];
  for (let i = 0; i < days && !S.over; i++) stepDay();
  const fresh = []; for (const n of S.news) { if (n === top) break; fresh.push(n); }
  const d = netWorth() - nw0;
  MapView.redraw();
  openModal(`<h2>${days >= 365 ? 'A year later' : days >= 30 ? 'A month later' : days >= 7 ? 'A week later' : 'The next day'}</h2><p class="muted">${fmtDate(S.day)}</p>
    <div class="stats3 box"><div><span>Net worth</span><b class="${upCls(d)}">${d >= 0 ? '+' : ''}${fmtMoney(d, true)}</b></div><div><span>Population</span><b class="${upCls(country(S.home).pop - pop0)}">${fmtPct(country(S.home).pop / pop0 - 1)}</b></div><div><span>World Index</span><b>${S.idx.v.toFixed(0)}</b></div></div>
    <h4>What happened</h4><div class="list">${fresh.slice(0, 8).map(n => `<div class="kv"><span>${esc(n.text)}</span></div>`).join('') || '<p class="muted">A quiet stretch.</p>'}</div>
    <button class="btn3d orange wide" data-a="closeModal">CONTINUE</button>`, 'sheet');
  refreshAll(); save();
}
function gameOver() {
  const o = S.over;
  openModal(`<h2>${o.bankrupt ? 'Bankrupt' : 'Game over'}</h2><p class="muted">${o.bankrupt ? 'Your debts caught up with you.' : 'Your run ended.'}</p>
    <div class="big center">${o.score} points</div>
    <div class="stats3 box"><div><span>👥 Population</span><b class="${upCls(o.pop)}">${fmtPct(o.pop)}</b></div><div><span>💰 Net worth</span><b>${fmtMoney(o.nw, true)}</b></div><div><span>📈 vs Market</span><b class="${upCls(o.beat)}">${fmtPct(o.beat)}</b></div></div>
    <p class="muted">You finished as <b>${o.stage}</b>. The market returned ${fmtPct(o.mkt)}; you returned ${fmtPct(o.mine)}.</p>
    <button class="btn3d orange wide" data-a="newGame">PLAY AGAIN</button>`, 'center');
}
let lastT = 0;
function loop(now) {
  if (!S || UI.pick || S.over) { lastT = now; return; }
  // Daily money is automatic, even if the game stays open past midnight.
  const _da = autoCreditDaily(), _ca = autoCreditShopCash();
  if (_da + _ca > 0) { toast(`+${fmtMoney(_da + _ca, true)} added to your cash`, 'good'); save(); renderHUD(); }
  lastT = now;
  const focused = document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName);
  // Game time does NOT advance here. Only the Age button moves a year.
  // Vehicles keep moving because MapView's own frame loop runs step()
  // independently of this loop. This loop only refreshes the HUD and
  // saves, and handles real-world daily cash grants above.
  if (!document.hidden) {
    if (!focused && now - UI.lastDraw > 250) {
      UI.lastDraw = now; renderHUD(); if (CityView.isOpen()) renderCityHUD();
      // Popup re-render throttled to the panel cadence: it used to run
      // every 250ms, resetting a scrolled popup to the top just like
      // the panel bug. The wrapper above also preserves scroll position.
      if (UI.popup && now - (UI.lastPopup || 0) > 1500) { UI.lastPopup = now; renderPopup(); }
      if (UI.panel && now - UI.lastPanel > 1500 && !document.querySelector('#panel input:focus')) renderPanel();
    }
    if (S.over) { save(); gameOver(); }
  }
  if (now - UI.lastSave > 10000) { UI.lastSave = now; save(); }
}
function refreshAll() {
  if (!S) return;
  if (!UI.pick) renderHUD();
  if (UI.panel) renderPanel();
  if (UI.popup) renderPopup();
  if (CityView.isOpen()) renderCityHUD();
}

// ---------- panels ----------
const PANELS = {};
function marketRows() {
  const q = UI.q.trim().toLowerCase();
  let list = Object.values(S.co);
  if (UI.cat === 'Watchlist') list = list.filter(c => S.watch.includes(c.a3));
  else if (UI.cat === 'Owned') list = list.filter(c => S.holdings[c.a3] && S.holdings[c.a3].qty !== 0);
  else if (UI.cat === 'IPOs') list = list.filter(c => !c.listed);
  else if (UI.cat === 'Oil') list = list.filter(c => c.sector === 'Energy');
  else if (UI.cat !== 'All' && UI.cat !== 'Indices' && UI.cat !== 'Extras') list = list.filter(c => c.sector === UI.cat);
  if (UI.starOnly) list = list.filter(c => S.watch.includes(c.a3));
  if (q) list = list.filter(c => c.name.toLowerCase().includes(q) || c.sym.toLowerCase().includes(q) || cname(c.a3).toLowerCase().includes(q));
  // Extra businesses as their own stocks. They carry stockKey/isExtra so
  // rows, the trade panel and holdings can tell them from flagships,
  // which are keyed by country a3. Stars stay flagship-only.
  let extras = [];
  if (S.extra) extras = Object.values(S.extra).map(b => { if (typeof ensureExtraStock === 'function') ensureExtraStock(b); return Object.assign({}, b, { stockKey: b.id, isExtra: true }); });
  if (UI.cat === 'Extras') list = [];
  else if (UI.cat === 'Watchlist' || UI.cat === 'IPOs') extras = [];
  else if (UI.cat === 'Owned') extras = extras.filter(b => (S.holdingsX || {})[b.id] && S.holdingsX[b.id].qty !== 0);
  else if (UI.cat !== 'All' && UI.cat !== 'Indices' && UI.cat !== 'Extras') extras = extras.filter(b => b.sector === UI.cat);
  if (UI.starOnly) extras = [];
  if (q) extras = extras.filter(b => b.name.toLowerCase().includes(q) || b.sym.toLowerCase().includes(q) || cname(b.a3).toLowerCase().includes(q));
  list = list.concat(extras);
  const cap = c => c.isExtra ? c.price * c.shares : companyValue(c);
  list.sort((a, b) => cap(b) - cap(a));
  return list;
}
PANELS.markets = () => {
  const cats = ['All', 'Watchlist', 'Owned', 'Extras', ...SECTOR_LIST, 'IPOs', 'Indices', 'Oil'];
  if (UI.cat === 'Indices') {
    const idxRows = SECTOR_LIST.map(sec => {
      const cs = Object.values(S.co).filter(c => c.sector === sec && c.listed);
      const cap = cs.reduce((a, c) => a + companyValue(c), 0);
      const ch = cs.length ? cs.reduce((a, c) => a + chgVs(c), 0) / cs.length : 0;
      return `<div class="kv"><span>${SECTORS[sec].icon} ${sec} Index</span><b>${fmtMoney(cap, true)} · <em class="${upCls(ch)}">${fmtPct(ch)}</em></b></div>`;
    }).join('');
    return panelShell('Markets', 'World Index ' + S.idx.v.toFixed(0) + ' · Vs Market is an equal-weighted algo: the same $ in every stock, so it is the average stock return, not the biggest companies', `<div class="row wrap">${cats.map(c => `<button class="chip ${UI.cat === c ? 'on' : ''}" data-a="cat" data-x="${c}">${c}</button>`).join('')}</div>
      <div class="card in">${idxRows}<div class="kv"><span>🌍 World Index</span><b>${S.idx.v.toFixed(0)} · <em class="${upCls(marketReturn())}">${fmtPct(marketReturn())}</em></b></div><div class="kv"><span>🛢️ Oil index</span><b>${S.oil.toFixed(2)}x</b></div></div>`);
  }
  const rows = marketRows();
  return panelShell('Markets', `${rows.length} companies · World Index ${S.idx.v.toFixed(0)}${marketOpen() ? '' : ' · Markets closed (weekend)'}`,
    `<input id="msearch" class="search" placeholder="Search stocks, companies, countries" value="${esc(UI.q)}" autocomplete="off">
    <div class="row wrap">${cats.map(c => `<button class="chip ${UI.cat === c ? 'on' : ''}" data-a="cat" data-x="${c}">${c}</button>`).join('')}</div>
    <button class="btn small" data-a="starFilter">${UI.starOnly ? '★ Showing starred only' : '☆ Star filter'}</button>
    <div class="list" id="mlist">${rows.slice(0, 120).map(c => {
      const held = c.isExtra ? (S.holdingsX || {})[c.id] : S.holdings[c.a3], ch = chgVs(c), starred = S.watch.includes(c.a3), key = c.stockKey || c.a3;
      return `<button class="srow" data-a="stock" data-x="${key}"><span class="avatar" style="background:${c.color}">${esc(c.name[0])}</span><span class="sname"><b>${c.sym}</b><small>${esc(c.name)} · ${esc(cname(c.a3))}</small></span><span class="sprice"><b>${c.listed ? fmtMoney(c.price) : 'Private'}</b><small class="${upCls(ch)}">${fmtPct(ch)}</small></span>${c.isExtra ? '<span class="tagp">EXTRA</span>' : `<span class="star-btn ${starred ? 'on' : ''}" data-a="star" data-x="${c.a3}">${starred ? '★' : '☆'}</span>`}</button>`;
    }).join('') || '<div class="card in empty">Nothing here yet. Try another category, or star a stock to build your Watchlist.</div>'}</div>
    ${UI.cat === 'IPOs' ? '<p class="muted small">IPOs here means private companies you control that can go public. A company needs a full board room and 2 profitable weeks in a row to list.</p>' : ''}`);
};
function tradeView(a3) {
  const c = S.co[a3]; if (!c) return panelShell('Stock', '', '<p class="muted">Company not found.</p>');
  const held = S.holdings[a3] || { qty: 0, cost: 0 };
  const ch = chgVs(c), val = held.qty > 0 ? held.qty * c.price : held.qty < 0 ? -held.qty * c.price : 0;
  const pnl = held.qty !== 0 ? (c.price - held.cost) * held.qty : 0;
  const closes = UI.tradeRange === '1M' ? c.h.d.slice(-22) : UI.tradeRange === 'All' ? c.h.d.slice() : c.h.d.slice(-130);
  const vols = UI.tradeRange === '1M' ? (c.h.v || []).slice(-22) : UI.tradeRange === 'All' ? (c.h.v || []).slice() : (c.h.v || []).slice(-130);
  const sma20 = sma(closes, 20), sma20v = sma20.length ? sma20[sma20.length - 1] : c.price;
  const res = c.res && c.res.day > S.day - 90 ? c.res : null;
  return panelShell(`${c.sym} · ${c.name}`, `${SECTORS[c.sector].icon} ${c.sector} · ${cname(a3)} · ${countryStatus(a3).t}`,
    `<div class="trade-head"><div><div class="big">${c.listed ? fmtMoney(c.price) : 'Private'}</div><div class="${upCls(ch)}">${fmtPct(ch)} today · SMA20 ${fmtMoney(sma20v)}</div></div>
      <button class="star-btn ${S.watch.includes(a3) ? 'on' : ''}" data-a="star" data-x="${a3}">${S.watch.includes(a3) ? '★ Starred' : '☆ Star'}</button></div>
    ${c.listed ? candleChart(closes, vols) : '<p class="muted small">This company is private, so there is no market chart. List it with an IPO, or buy it outright with a takeover offer after it lists.</p>'}
    <p class="muted small">Candles group 5 daily closes. Purple dashed line is SMA20. Purple bars below are shares traded per day in the in-game market, including your trades. This is simulated in-game volume, not real-world volume.</p>
    ${c.listed && vols.length ? `<div class="kv"><span>Shares traded today</span><b>${(vols[vols.length - 1] || 0).toLocaleString()}</b></div>` : ''}
    ${rangeSeg(['1M', '1Y', 'All'], UI.tradeRange, 'tradeRange')}
    <div class="stats3 box"><div><span>Position</span><b>${held.qty ? held.qty.toLocaleString() + ' shares' : 'None open'}</b></div><div><span>Market cap</span><b>${fmtMoney(companyValue(c), true)}</b></div><div><span>Your stake</span><b>${(stake(a3) * 100).toFixed(1)}%</b></div></div>
    ${S.lastTrade && S.lastTrade.a3 === a3 ? `<div class="kv"><span>Last trade</span><b class="${upCls(S.lastTrade.pnl)}">${S.lastTrade.side.toUpperCase()} ${S.lastTrade.qty.toLocaleString()} ${S.lastTrade.sym} · Realised P&amp;L ${fmtMoney(S.lastTrade.pnl, true)}</b></div><p class="muted small">That realised P&amp;L is just this trade. Net worth also moves with cash, loans, other holdings and weekly costs, so it will not match this number exactly.</p>` : ''}
    ${held.qty !== 0 ? `<div class="kv"><span>Average cost</span><b>${fmtMoney(held.cost)}</b></div><div class="kv"><span>Position value</span><b>${fmtMoney(val, true)}</b></div><div class="kv"><span>Unrealised P&amp;L</span><b class="${upCls(pnl)}">${fmtMoney(pnl, true)}</b></div>` : ''}
    ${res ? `<div class="card in"><b>Research</b><p class="muted small">Fair value about ${fmtMoney(res.fair, true)} · Signal ${res.strength} ${res.dir > 0 ? 'up' : 'down'}${res.pattern ? ' · Pattern: ' + res.pattern : ''}</p></div>` : ''}
    ${c.listed ? `<div class="trade-box">
      <div class="row"><button class="btn small" data-a="qty" data-x="-100">−100</button><button class="btn small" data-a="qty" data-x="-10">−10</button><input id="qty" class="qty" type="number" value="100" min="1"><button class="btn small" data-a="qty" data-x="10">+10</button><button class="btn small" data-a="qty" data-x="100">+100</button><button class="btn small" data-a="qtyMax" data-x="${a3}">MAX</button></div>
      <div class="row"><button class="btn3d sell flex" data-a="doTrade" data-x="${a3}|sell">SELL</button><button class="btn3d buy flex" data-a="doTrade" data-x="${a3}|buy">BUY</button></div>
      <div class="row"><button class="btn flex" data-a="doTrade" data-x="${a3}|short">SHORT</button><button class="btn flex" data-a="doTrade" data-x="${a3}|cover">COVER</button><button class="btn flex" data-a="research" data-x="${a3}">RESEARCH ${fmtMoney(researchCost(), true)}</button></div>
    </div>` : ''}
    <h4>Takeover offer</h4><p class="muted small">Buy every remaining share at a premium. The board can say no.</p>
    <div class="row wrap">${[0.2, 0.4, 0.6].map(p => `<button class="btn" data-a="takeover" data-x="${a3}|${p}">+${Math.round(p * 100)}% · ${fmtMoney(takeoverCost(c, p), true)} · ${Math.round(takeoverOdds(c, p) * 100)}% chance</button>`).join('')}</div>
    <button class="btn wide" data-a="webCo" data-x="${a3}">🌐 Visit company website</button>`);
}
// Extra-business stock trade panel. Extras trade long only (buy/sell),
// have no shorts, research or takeovers, and their chart is one weekly
// close per week (they reprice in leaderWeek, not daily).
function tradeViewExtra(id) {
  const b = S.extra && S.extra[id]; if (!b) return panelShell('Stock', '', '<p class="muted">Business not found.</p>');
  if (typeof ensureExtraStock === 'function') ensureExtraStock(b);
  const held = (S.holdingsX || {})[id] || { qty: 0, cost: 0 };
  const ch = chgVs(b), val = held.qty * b.price;
  const pnl = held.qty !== 0 ? (b.price - held.cost) * held.qty : 0;
  const closes = (b.h.d || []).slice(-130);
  return panelShell(`${b.sym} · ${b.name}`, `${esc(b.sector)} · ${cname(b.a3)} · Extra business stock — buy and sell only, no shorts or takeovers`,
    `<div class="trade-head"><div><div class="big">${fmtMoney(b.price)}</div><div class="${upCls(ch)}">${fmtPct(ch)} this week · Economic value ${fmtMoney(b.value, true)}</div></div></div>
    ${closes.length ? lineChart(closes, { h: 160 }) : '<p class="muted small">No weekly closes yet. This stock reprices each week in the leader economy.</p>'}
    <div class="stats3 box"><div><span>Position</span><b>${held.qty ? held.qty.toLocaleString() + ' shares' : 'None open'}</b></div><div><span>Market cap</span><b>${fmtMoney(b.price * b.shares, true)}</b></div><div><span>Shares</span><b>${b.shares.toLocaleString()}</b></div></div>
    ${held.qty !== 0 ? `<div class="kv"><span>Average cost</span><b>${fmtMoney(held.cost)}</b></div><div class="kv"><span>Position value</span><b>${fmtMoney(val, true)}</b></div><div class="kv"><span>Unrealised P&amp;L</span><b class="${upCls(pnl)}">${fmtMoney(pnl, true)}</b></div>` : ''}
    <div class="kv"><span>This week's profit</span><b>${fmtMoney((b.week && b.week.profit) || 0, true)}</b></div><div class="kv"><span>Rating</span><b>${(b.rating || 0).toFixed(1)} / 5</b></div>
    <div class="row"><button class="btn small" data-a="qty" data-x="-100">−100</button><button class="btn small" data-a="qty" data-x="-10">−10</button><input id="qty" class="qty" type="number" value="100" min="1"><button class="btn small" data-a="qty" data-x="10">+10</button><button class="btn small" data-a="qty" data-x="100">+100</button><button class="btn small" data-a="qtyMax" data-x="${id}">MAX</button></div>
    <div class="row"><button class="btn3d sell flex" data-a="doTradeExtra" data-x="${id}|sell">SELL</button><button class="btn3d buy flex" data-a="doTradeExtra" data-x="${id}|buy">BUY</button></div>
    <p class="muted small">Extra stocks move once a week with their business profit and sector volatility, and only trade while markets are open.</p>`);
}
PANELS.extraStock = () => tradeViewExtra(UI.stack && UI.stack[0] ? UI.stack[0].id : null);
PANELS.portfolio = () => {
  const nw = netWorth(), d = S.nh.d, w = S.nh.w, m = S.nh.m;
  let series = d.map(x => x[1]);
  if (UI.range === '1M') series = d.slice(-30).map(x => x[1]);
  else if (UI.range === '1Y') series = w.length >= 26 ? w.slice(-52).map(x => x[1]) : d.slice(-130).map(x => x[1]);
  else if (UI.range === 'All') series = m.length > 1 ? m.map(x => x[1]) : w.map(x => x[1]);
  // Day calendar: green/red by daily net-worth change, most recent 35 days.
  const cal = [];
  for (let i = Math.max(1, d.length - 35); i < d.length; i++) {
    const diff = d[i][1] - d[i - 1][1];
    cal.push(`<div class="cal-day ${diff >= 0 ? 'green' : 'red'}" title="Day ${d[i][0]}: ${diff >= 0 ? '+' : ''}${fmtMoney(diff, true)}">${d[i][0]}</div>`);
  }
  const held = Object.entries(S.holdings).filter(([, h]) => h.qty !== 0);
  return panelShell('Portfolio', `Net worth ${fmtMoney(nw, true)} · Cash ${fmtMoney(S.cash, true)} · Loan ${fmtMoney(S.loan, true)}`,
    `${rangeSeg(['1M', '1Y', 'All'], UI.range, 'range')}${lineChart(series, { h: 160 })}
    <div class="stats3 box"><div><span>You</span><b class="${upCls(myReturn())}">${fmtPct(myReturn())}</b></div><div><span>Market</span><b class="${upCls(marketReturn())}">${fmtPct(marketReturn())}</b></div><div><span>Beat market</span><b class="${upCls(beatMarket())}">${fmtPct(beatMarket())}</b></div></div>
    <h4>Day calendar</h4><div class="cal">${cal.join('') || '<p class="muted small">Play a few days to fill the calendar.</p>'}</div>
    <h4>Holdings</h4><div class="list">${held.map(([a3, h]) => {
      const c = S.co[a3]; if (!c) return '';
      return `<button class="srow" data-a="stock" data-x="${a3}"><span class="avatar" style="background:${c.color}">${esc(c.name[0])}</span><span class="sname"><b>${c.sym}</b><small>${esc(c.name)}</small></span><span class="sprice"><b>${h.qty.toLocaleString()} shares</b><small>${fmtMoney(h.qty * c.price, true)}</small></span></button>`;
    }).join('') || '<p class="muted small">No open positions. Buy a stock in Markets.</p>'}</div>
    <h4>Extra stock holdings</h4><div class="list">${Object.entries(S.holdingsX || {}).filter(([, h]) => h.qty !== 0).map(([id, h]) => {
      const b = S.extra && S.extra[id]; if (!b) return '';
      return `<button class="srow" data-a="stock" data-x="${id}"><span class="avatar" style="background:${b.color}">${esc(b.name[0])}</span><span class="sname"><b>${b.sym}</b><small>${esc(b.name)} · ${esc(cname(b.a3))}</small></span><span class="sprice"><b>${h.qty.toLocaleString()} shares</b><small>${fmtMoney(h.qty * b.price, true)}</small></span></button>`;
    }).join('') || '<p class="muted small">No extra stock positions. Extra businesses are listed in Markets under Extras.</p>'}</div>
    <h4>This week</h4><div class="kv"><span>Profit</span><b class="${upCls(S.week.profit)}">${fmtMoney(S.week.profit, true)}</b></div><div class="kv"><span>Companies</span><b>${fmtMoney(S.week.companies || 0, true)}</b></div><div class="kv"><span>Rent</span><b>${fmtMoney(S.week.rent || 0, true)}</b></div>
    <h4>Buildings</h4><div class="list">${S.props.map(p => {
      const city = W.cities[p.city];
      return `<button class="srow" data-a="propSheet" data-x="${p.id}"><span class="avatar">🏠</span><span class="sname"><b>${esc(city.name)}</b><small>${p.units} units · ${Math.round(p.occ * 100)}% occupied</small></span><span class="sprice"><b>${fmtMoney(p.value, true)}</b><small>${fmtMoney(p.income, true)}/week</small></span></button>`;
    }).join('') || '<p class="muted small">No buildings yet. Buy one from a city FOR SALE pin.</p>'}</div>`);
};
PANELS.company = () => {
  const mineList = mine();
  if (!mineList.length) return panelShell('My Companies', '', '<div class="card in"><p class="muted">You control no companies yet. Your home company is yours once you open a location, or buy 50% of a listed company in Markets to take control.</p></div>');
  if (!UI.companyInit) { UI.expandedCompany = mineList[0].a3; UI.companyInit = true; }
  if (UI.expandedCompany && !mineList.some(c => c.a3 === UI.expandedCompany)) UI.expandedCompany = mineList[0].a3;
  const body = mineList.map(c => {
    const F = SECTORS[c.sector].fleet, wk = c.week || { profit: 0, locs: 0, fleet: 0, online: 0, ads: 0, tax: 0 }, oe = onlineEconomics(c);
    const expanded = UI.expandedCompany === c.a3;
    const summary = `<button class="srow" data-a="companyExpand" data-x="${c.a3}"><span class="avatar" style="background:${c.color}">${esc(c.name[0])}</span><span class="sname"><b>${esc(c.name)}</b><small>${c.sym} · ${esc(cname(c.a3))} · ★ ${c.rating.toFixed(1)}</small></span><span class="sprice"><b>${fmtMoney(companyValue(c), true)}</b><small class="${upCls(wk.profit)}">${fmtMoney(wk.profit, true)}/week · ${c.locs.length} locs</small></span><span>${expanded ? '▾' : '▸'}</span></button>`;
    if (!expanded) return `<div class="card in">${summary}</div>`;
    return `<div class="card in">${summary}
      <div class="stats3 box"><div><span>Week profit</span><b class="${upCls(wk.profit)}">${fmtMoney(wk.profit, true)}</b></div><div><span>Locations</span><b>${c.locs.length}</b></div><div><span>Value</span><b>${fmtMoney(companyValue(c), true)}</b></div></div>
      <div class="kv"><span>Locations profit</span><b>${fmtMoney(wk.locs, true)}</b></div><div class="kv"><span>Fleet profit</span><b>${fmtMoney(wk.fleet, true)}</b></div><div class="kv"><span>Online profit</span><b>${fmtMoney(wk.online, true)}</b></div><div class="kv"><span>Ads cost</span><b>${fmtMoney(wk.ads, true)}</b></div><div class="kv"><span>Tax</span><b>${fmtMoney(wk.tax, true)}</b></div>
      <div class="kv"><span>Rating (updates yearly)</span><b>${c.rating.toFixed(1)}★</b></div>${c.ratingReasons && c.ratingReasons.length ? `<p class="muted small">Last year: ${esc(c.ratingReasons.join(' '))}</p>` : ''}
      <h5>Price, quality, wage</h5>
      <div class="kv"><span>Price multiplier</span><span><input type="range" min="0.5" max="2" step="0.1" value="${c.set.price}" data-in="price" data-x="${c.a3}"> ${Math.round(c.set.price * 100)}%</span></div>
      <div class="kv"><span>Quality (1–5)</span><span><input type="range" min="1" max="5" step="1" value="${c.set.quality}" data-in="quality" data-x="${c.a3}"> ${c.set.quality}★</span></div>
      <div class="kv"><span>Wage multiplier</span><span><input type="range" min="0.5" max="2" step="0.1" value="${c.set.wage}" data-in="wage" data-x="${c.a3}"> ${Math.round(c.set.wage * 100)}%</span></div>
      <h5>Locations</h5><div class="list">${c.locs.map(l => {
        const city = W.cities[l.city || c.city];
        return `<div class="kv"><span>${SECTORS[c.sector].loc.name} in ${esc(city.name)} · Staff ${l.staff} · ★ ${l.sat.toFixed(1)}</span><b class="${upCls(l.profit)}">${fmtMoney(l.profit, true)}/week <button class="btn small" data-a="closeLoc" data-x="${c.a3}|${l.id}">Close</button></b></div>`;
      }).join('') || '<p class="muted small">No locations. Open one from a city FOR LEASE pin.</p>'}</div>
      ${F ? `<h5>Fleet</h5><div class="kv"><span>${F.levels[c.fleet].name}</span><b>${c.fleet < F.levels.length - 1 ? `<button class="btn" data-a="fleetUp" data-x="${c.a3}">Upgrade · ${fmtMoney(F.levels[c.fleet + 1].cost, true)}</button>` : 'Biggest there is'}</b></div>${c.fleet ? `<button class="btn" data-a="fleetSell" data-x="${c.a3}">Sell fleet level · +${fmtMoney(F.levels[c.fleet].cost * 0.6, true)}</button>` : ''}` : ''}
      <h5>Loans &amp; listing</h5>
      <div class="kv"><span>Your loan</span><b>${fmtMoney(S.loan, true)} · Bank will lend ${fmtMoney(maxLoan(), true)}</b></div>
      <div class="row"><button class="btn" data-a="borrow">BORROW</button><button class="btn" data-a="repay">REPAY ALL</button>${!c.listed ? `<button class="btn" data-a="ipo" data-x="${c.a3}">IPO (needs full board + 2 profitable weeks)</button>` : '<span class="muted small">Listed</span>'}</div>
      <h5>Website, stock &amp; tax</h5>
      <div class="kv"><span>Website</span><b>${WEB_TIERS[c.web.tier].name} · ${oe.visitors.toLocaleString()} visitors/week · ${fmtMoney(oe.profit, true)}/week</b></div>
      <div class="kv"><span>Tax in ${esc(cname(c.a3))}</span><b>${Math.round(country(c.a3).tax * 100)}% corporate — change it in Nation</b></div>
      <div class="row"><button class="btn" data-a="stock" data-x="${c.a3}">VIEW STOCK</button><button class="btn" data-a="webCo" data-x="${c.a3}">OPEN WEBSITE</button><button class="btn" data-a="siteMaker" data-x="${c.a3}">CUSTOMIZE SITE</button><button class="btn" data-a="panel" data-x="nation">NATION / TAX</button></div>
    </div>`;
  }).join('');
  return panelShell('My Companies', `${mineList.length} companies under your control · Tap a company to open it, tap again to close it`, body);
};
function webSiteHTML(c) {
  const isMine = controlled(c.a3);
  const oe = onlineEconomics(c);
  let admin = '';
  if (isMine) {
    admin = `<div class="card in admin"><h4>Your site admin</h4>
      <div class="kv"><span>Tier</span><b>${WEB_TIERS[c.web.tier].name}</b></div>
      ${c.web.tier < 4 ? `<button class="btn" data-a="webTier" data-x="${c.a3}">Upgrade to ${WEB_TIERS[c.web.tier + 1].name} · ${fmtMoney(WEB_TIERS[c.web.tier + 1].cost, true)}</button>` : '<span class="muted small">Global platform reached.</span>'}
      <h5>Ads (weekly spend)</h5>${WEB_ADS.map(a => `<div class="kv"><span>${a.name} · ${fmtMoney(a.cost)}/week · +${Math.round(a.effect * 100)}%</span><button class="btn ${c.web.ads[a.id] ? 'on' : ''}" data-a="webAd" data-x="${c.a3}|${a.id}">${c.web.ads[a.id] ? 'ON' : 'OFF'}</button></div>`).join('')}
      <h5>Add-ons (one-time)</h5>${WEB_ADDONS.map(a => `<div class="kv"><span>${a.name} · ${a.desc}</span>${c.web.addons[a.id] ? '<span class="tagp green">OWNED</span>' : `<button class="btn" data-a="webAddon" data-x="${c.a3}|${a.id}">${fmtMoney(a.cost, true)}</button>`}</div>`).join('')}
      <div class="kv"><span>Online visitors / week</span><b>${oe.visitors.toLocaleString()}</b></div><div class="kv"><span>Online profit / week</span><b>${fmtMoney(oe.profit, true)}</b></div></div>`;
  }
  return `<div class="website card">
    <div class="web-hero" style="background:${c.color}"><b>${esc(c.name)}</b><span>${SECTORS[c.sector].tag}</span></div>
    <p>${SECTORS[c.sector].products.join(' · ')}</p>
    <div class="stats3 box"><div><span>Rating</span><b>${c.rating.toFixed(1)}★</b></div><div><span>Locations</span><b>${c.locs.length}</b></div><div><span>Website</span><b>${WEB_TIERS[c.web.tier].name}</b></div></div>
    <div class="kv"><span>Website rating</span><b>${(typeof siteRating === 'function' ? siteRating(c) : 0).toFixed(1)}★ · customers rate the site itself</b></div>${controlled(c.a3) ? `<button class="btn wide" data-a="siteMaker" data-x="${c.a3}">${ICONS.customize} CUSTOMIZE WEBSITE</button>` : ''}
    <button class="btn wide" data-a="stock" data-x="${c.a3}">VIEW ${c.sym} STOCK</button>${admin}</div>`;
}
// Web home: a light grid hub (white boxes, blue accents, dark text)
// that routes to Worl's own Web functions. Nothing from any other
// game's labels is used here — every box opens a real Worl screen.
function webHomeHTML() {
  const unread = (S.mail || []).filter(m => !m.read).length;
  const mineCount = (typeof mine === 'function') ? mine().length : 0;
  const box = (ic, t, d, a, x, badge) => `<button class="webbox" data-a="${a}"${x != null ? ` data-x="${x}"` : ''}><span class="webbox-ic">${ic}</span><span class="webbox-txt"><b>${t}</b><span>${d}</span></span>${badge != null ? `<span class="webbadge">${badge}</span>` : ''}</button>`;
  return `<div class="webhome"><button class="webleave" data-a="closePanel">← LEAVE WEB</button>
    <div class="webgrid">
      ${box(ICONS.search, 'Seek search', 'Every company has a site here', 'webView', 'search')}
      ${box(ICONS.news, 'World Times', 'News from around the world', 'webView', 'news')}
      ${box(ICONS.mail, 'Mail', 'Messages, offers and alerts', 'webView', 'mail', unread || null)}
      ${box(ICONS.house, 'My website', 'Your home company\u2019s site and admin', 'webView', 'mine', mineCount || null)}
      ${box(ICONS.customize, 'Customize website', 'Tune your site toward 5.0 stars', 'siteMaker', S.home)}
      ${box(ICONS.leave, 'Leave Web', 'Back to the world map', 'closePanel')}
    </div>
    <p class="webhome-note">Your web hub. Search, news, mail and your company sites — all in-game, no real browser.</p></div>`;
}
PANELS.web = () => {
  const w = UI.web;
  if (w.view === 'home' || !w.view) return panelShell('Web', 'Your web hub', webHomeHTML());
  let body = '', url = 'seek://search';
  if (w.view === 'site' && w.a3) {
    url = 'www.' + S.co[w.a3].name.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.com';
    body = webSiteHTML(S.co[w.a3]);
  } else if (w.view === 'news') {
    url = 'worldtimes://news';
    body = `<h4>World Times</h4><div class="list">${S.news.slice(0, 60).map(n => `<div class="kv"><span><b>${esc(n.cat)}</b> · ${esc(n.text)}</span><small>${fmtDate(n.d)}</small></div>`).join('') || '<p class="muted small">No news yet.</p>'}</div>`;
  } else if (w.view === 'mail') {
    url = 'mail://inbox';
    body = `<h4>Mail (${S.mail.filter(m => !m.read).length} unread)</h4><div class="list">${S.mail.map(m => `<div class="card in"><b>${esc(m.from)}</b> · <span class="muted small">${fmtDate(m.d)}</span><p>${esc(m.subject)} — ${esc(m.body)}</p>${m.offer && !m.offer.done ? `<button class="btn3d orange" data-a="acceptOffer" data-x="${m.id}">ACCEPT OFFER · ${fmtMoney(m.offer.price * stake(m.offer.a3), true)} for your stake</button>` : m.offer ? '<span class="tagp green">Offer accepted</span>' : ''}</div>`).join('') || '<p class="muted small">No mail.</p>'}</div>`;
  } else {
    const q = w.q.trim().toLowerCase();
    const results = Object.values(S.co).filter(c => !q || c.name.toLowerCase().includes(q) || c.sym.toLowerCase().includes(q) || cname(c.a3).toLowerCase().includes(q)).sort((a, b) => companyValue(b) - companyValue(a)).slice(0, 30);
    const sponsored = results.find(c => c.web.ads.search);
    body = `<h4>Seek search</h4><p class="muted small">Every company has a site here. This is a fake browser inside the game.</p>
      ${sponsored ? `<div class="card in sponsored"><span class="tagp">SPONSORED</span><button class="srow" data-a="webSite" data-x="${sponsored.a3}"><span class="avatar" style="background:${sponsored.color}">${esc(sponsored.name[0])}</span><span class="sname"><b>${esc(sponsored.name)}</b><small>${sponsored.sym} · ${esc(cname(sponsored.a3))}</small></span></button></div>` : ''}
      <div class="list">${results.map(c => `<button class="srow" data-a="webSite" data-x="${c.a3}"><span class="avatar" style="background:${c.color}">${esc(c.name[0])}</span><span class="sname"><b>${esc(c.name)}</b><small>${c.sym} · ${esc(cname(c.a3))} · ${SECTORS[c.sector].icon} ${c.sector}</small></span><span class="sprice"><b>${c.listed ? fmtMoney(c.price) : 'Private'}</b></span></button>`).join('') || '<p class="muted small">No matches. Try a company name or a country.</p>'}</div>`;
  }
  return panelShell('Web', 'Fake browser — your company website lives here, not News',
    `<div class="browser"><div class="urlbar"><button data-a="webBack">←</button><button data-a="webHome">⌂</button><span class="url">${esc(url)}</span></div>
    <div class="row wrap"><button class="chip" data-a="webView" data-x="search">Search</button><button class="chip" data-a="webView" data-x="news">World Times</button><button class="chip" data-a="webView" data-x="mail">Mail (${S.mail.filter(m => !m.read).length})</button><button class="chip" data-a="webView" data-x="mine">My site</button></div>
    ${w.view === 'search' ? `<input id="wsearch" class="search" placeholder="Search companies, countries, products" value="${esc(w.q)}" autocomplete="off">` : ''}
    ${body}</div>`);
};
// ---------- Your Country: the condensed top-left panel ----------
// Like the reference layout (original content only): a hero card with
// your money and rating, chips, an Advisor that names the single best
// next decision and does it with one tap, country rankings, ratings,
// history, and links out to the deeper panels. Nothing here is fake:
// every number comes from the live save, every Advisor button runs a
// real action.
function countryAdvisor() {
  const cs = country(S.home), lw = cs.lastWeek || {};
  const biz = (typeof businessesInCountry === 'function') ? businessesInCountry(S.home) : [S.co[S.home]];
  const losing = biz.find(b => b.week && b.week.profit < 0);
  if (cs.stab < 50) return { title: 'Stability is low', body: `Stability is ${Math.round(cs.stab)}/100. Start Affordable housing — it adds stability and grows population.`, btn: 'START PROJECT', a: 'project', x: 'housing' };
  if (lw.net < 0 && cs.tax < 0.5) return { title: 'Treasury lost money last week', body: `Last week net was ${fmtMoney(lw.net, true)}. Raise corporate tax 5 points to close the gap.`, btn: 'RAISE TAX 5 PTS', a: 'advisorTax', x: 'up' };
  if (losing && cs.tax > 0.05) return { title: `${losing.name} is losing money`, body: `It made ${fmtMoney(losing.week.profit, true)} last week. Lower corporate tax 5 points to help it.`, btn: 'LOWER TAX 5 PTS', a: 'advisorTax', x: 'down' };
  const mil = Object.entries(MILITARY).map(([b, d]) => [b, d, milCost(b)]).filter(([, , c]) => c != null).sort((a, b) => a[2] - b[2])[0];
  if (milRank(S.home) > 100 && mil && S.cash >= mil[2]) return { title: 'Military is weak', body: `You rank #${milRank(S.home)} in military power. Upgrade ${mil[1].name} to strengthen it.`, btn: 'UPGRADE MILITARY', a: 'milUp', x: mil[0] };
  if (!S.stores || !S.stores.length) return { title: 'Build your first business', body: 'You have no store yet. Open a city, tap a FOR LEASE lot, and press BUILD STORE to pick a business.', btn: 'MY STORES', a: 'panel', x: 'stores' };
  if (locCount() === 0) return { title: 'Open your first location', body: 'Lease a storefront in your capital city and your company starts earning there.', btn: 'ENTER CAPITAL', a: 'enterCity', x: String(W.byA3[S.home].capital) };
  return { title: 'You are in good shape', body: 'No urgent move. Grow by building another store, developing its products, or buying a stock in Markets.', btn: 'MY STORES', a: 'panel', x: 'stores' };
}
// User profile — entry only, as requested. No new profile features
// are inferred here; Nicholas said he will get to those himself later.
// Country logic is untouched: the country panel still opens from the
// country name/cash part of the same HUD pill.
PANELS.profile = () => {
  const you = (S.you || { name: 'Founder' });
  const mineCount = (typeof mine === 'function') ? mine().length : 0;
  return panelShell('User profile', 'Your profile',
    `<div class="card in"><h4>${esc(you.name)}</h4>
    <div class="kv"><span>Country</span><b>${esc(cname(S.home))}</b></div>
    <div class="kv"><span>Cash</span><b>${fmtMoney(S.cash, true)}</b></div>
    <div class="kv"><span>Net worth</span><b>${fmtMoney(netWorth(), true)}</b></div>
    <div class="kv"><span>Companies you control</span><b>${mineCount}</b></div>
    <div class="kv"><span>Rating</span><b>${(S.rating || 0).toFixed(1)} / 5</b></div>
    <p class="muted small">More profile features come later.</p></div>`);
};
PANELS.country = () => {
  const cs = country(S.home), k = W.byA3[S.home], cap = W.cities[k.capital];
  const biz = (typeof businessesInCountry === 'function') ? businessesInCountry(S.home) : [S.co[S.home]];
  const avgRating = biz.length ? biz.reduce((a, b) => a + (b.rating || 0), 0) / biz.length : 0;
  const gdpSorted = W.playable.slice().sort((a, b) => b.gdp0 - a.gdp0);
  const gdpRank = gdpSorted.findIndex(c => c.a3 === S.home) + 1;
  const adv = countryAdvisor();
  const top3 = gdpSorted.slice(0, 3);
  const hist = S.news.filter(n => n.a3 === S.home).slice(0, 6);
  return panelShell('Your country', `${k.flag} ${esc(cname(S.home))} · ${esc(countryStatus(S.home).t)}`,
    `<div class="country-hero"><div class="row start"><div class="flag-big">${k.flag}</div><div><h2>${esc(cname(S.home))}</h2><div class="muted-light">Based in ${cap ? esc(cap.name) : ''} · Balance ${fmtMoney(S.cash, true)}</div></div></div>
    <div class="stats4"><div><span>Businesses</span><b>${biz.length}</b></div><div><span>Placed</span><b>${(S.placed || []).length}</b></div><div><span>Rating</span><b>★ ${avgRating.toFixed(1)}</b></div><div><span>GDP rank</span><b>#${gdpRank}</b></div></div></div>
    <div class="row wrap" style="margin-top:12px"><span class="chip">Corporate tax ${Math.round(cs.tax * 100)}%</span><span class="chip">Stability ${Math.round(cs.stab)}/100</span><span class="chip">Population ${fmtPop(nationPop())}</span><span class="chip">Level ${level()}</span></div>
    <div class="row" style="margin-top:12px"><button class="btn flex" data-a="panel" data-x="nation">NATION / TAX</button><button class="btn flex" data-a="panel" data-x="leader">LEADER</button><button class="btn flex" data-a="panel" data-x="military">MILITARY</button></div>
    <div class="card in"><h4>🧭 Advisor — best next decision</h4><p><b>${adv.title}</b></p><p class="muted small">${adv.body}</p><button class="btn3d orange wide" data-a="${adv.a}" data-x="${adv.x}">${adv.btn}</button></div>
    <h4>Country rankings</h4><div class="card in"><p class="muted small">By GDP, against every country in the world.</p>
    ${top3.map((c, i) => `<div class="kv"><span>#${i + 1} ${c.flag} ${esc(c.name)}</span><b>${fmtMoney(c.gdp0 * 1e6, true)}</b></div>`).join('')}
    ${gdpRank > 3 ? `<div class="kv"><span>#${gdpRank} ${k.flag} ${esc(cname(S.home))} (you)</span><b>${fmtMoney(cs.gdp * 1e6, true)}</b></div>` : ''}
    <div class="kv"><span>Military rank</span><b>#${milRank(S.home)} of ${W.playable.length}</b></div>
    <button class="btn wide" data-a="panel" data-x="leaderboard">SEE ALL RANKINGS</button></div>
    <h4>Ratings</h4><div class="card in"><p class="muted small">You are at ★ ${avgRating.toFixed(1)} on average across your country's businesses.</p>
    ${biz.map(b => `<div class="kv"><span>${(SECTORS[b.sector] && SECTORS[b.sector].icon) || ICONS.company} ${esc(b.name)}</span><b>★ ${(b.rating || 0).toFixed(1)}</b></div>`).join('')}
    ${S.rating ? `<div class="kv"><span>Your personal rating</span><b>★ ${S.rating.toFixed(1)}</b></div>` : ''}</div>
    <h4>History</h4><div class="card in">${hist.map(n => `<div class="kv"><span><b>${esc(n.cat)}</b> · ${esc(n.text)}</span><small>${fmtDate(n.d)}</small></div>`).join('') || '<p class="muted small">No history yet — play a week and it lands here.</p>'}</div>`);
};
PANELS.nation = () => {
  const cs = country(S.home), k = W.byA3[S.home];
  const nbs = k.nb.filter(n => W.byA3[n] && W.byA3[n].playable).map(n => {
    const rel = getRel(S.home, n), err = canAttack(n);
    const wp = warPlanScore({ target: n, army: 100, navy: 100, air: 100, approachBonus: 0.15, research: false });
    return `<div class="kv"><span>${W.byA3[n].flag} ${esc(cname(n))} · Relations ${rel}</span><span><button class="btn small" data-a="diplomacy" data-x="${n}">${fmtMoney(diplomacyCost(n), true)}</button> ${err ? `<span class="muted small">${esc(err)}</span>` : `<button class="btn small" data-a="warPlan" data-x="${n}">PLAN ATTACK (${Math.round(wp.winP * 100)}%)</button>`}</span></div>`;
  }).join('') || '<p class="muted small">No land neighbours. You need Destroyers or Stealth fighters to strike overseas.</p>';
  const occ = Object.keys(S.countries).filter(a => S.countries[a].occ === S.home);
  return panelShell('Nation', `${k.flag} ${esc(k.name)} · ${esc(countryStatus(S.home).t)}`,
    `<div class="stats3 box"><div><span>Population</span><b>${fmtPop(nationPop())}</b></div><div><span>Growth</span><b class="${upCls(popGrowth())}">${fmtPct(popGrowth())}</b></div><div><span>Military rank</span><b>#${milRank(S.home)} of ${W.playable.length}</b></div></div>
    <div class="kv"><span>GDP</span><b>${fmtMoney(cs.gdp * 1e6, true)}</b></div><div class="kv"><span>Stability</span><b>${Math.round(cs.stab)} / 100</b></div><div class="kv"><span>Corporate-tax revenue</span><b>${fmtMoney(cs.taxRev || 0, true)} total</b></div><div class="kv"><span>Occupied land</span><b>${occ.length ? occ.map(a => cname(a)).join(', ') : 'None'}</b></div>
    <h4>Tax rates — that's the game</h4><p class="muted small">Change these for your home nation. They take effect now, and how businesses, households and the government reacted is reported at year end. High tax raises revenue but cuts profits and spending; low tax does the reverse.</p>
    <div class="kv"><span>Corporate tax</span><span><input type="range" min="5" max="50" step="1" value="${Math.round(cs.tax * 100)}" data-in="taxCorp" data-x=""> ${Math.round(cs.tax * 100)}%</span></div>
    <div class="kv"><span>Income tax</span><span><input type="range" min="0" max="40" step="1" value="${Math.round((cs.incTax || 0.20) * 100)}" data-in="taxInc" data-x=""> ${Math.round((cs.incTax || 0.20) * 100)}%</span></div>
    <div class="kv"><span>VAT (sales tax)</span><span><input type="range" min="0" max="20" step="1" value="${Math.round((cs.vat || 0.05) * 100)}" data-in="taxVat" data-x=""> ${Math.round((cs.vat || 0.05) * 100)}%</span></div>
    ${S.yearReport ? `<h4>Last year in review (${S.yearReport.year})</h4>${S.yearReport.entries.map(e => `<div class="kv"><span>${esc(e.name)} · ${e.old.toFixed(1)}★ → ${e.new.toFixed(1)}★</span><b>${esc(e.reasons.join(' '))}</b></div>`).join('')}<p class="muted small">${esc(S.yearReport.taxLines.join(' '))}</p>` : ''}
    ${S.wars.length ? `<h4>Wars elsewhere</h4>${S.wars.map(w => `<div class="kv"><span>${esc(cname(w.a))} vs ${esc(cname(w.b))}</span><b>Ongoing · Front ${Math.round(w.front)}%</b></div>`).join('')}<p class="muted small">Wars are ongoing until they resolve — they are not scored as a win or a loss while they run.</p>` : ''}
    <h4>Projects</h4>${PROJECTS.map(d => {
      const run = cs.proj.find(p => p.id === d.id && p.until > S.day);
      return `<div class="kv"><span>${d.icon} ${d.name} · ${d.desc}</span>${run ? '<span class="tagp green">ACTIVE</span>' : `<button class="btn" data-a="project" data-x="${d.id}">${fmtMoney(projectCost(d), true)}</button>`}</div>`;
    }).join('')}
    <h4>Trade partners</h4><p class="muted small">Who your country actually trades with, and how much per week. Trade tax is 4% of this volume. A war with a partner zeroes that link; occupation cuts it to 30%.</p>
    ${(() => { const tp = (cs.lastWeek && cs.lastWeek.tradePartners) || []; if (!tp.length) return '<p class="muted small">No trade links yet — they form after the first week of the leader economy.</p>'; const tot = (cs.lastWeek && cs.lastWeek.tradeVol) || 0; return `<div class="kv"><span>Total trade volume</span><b>${fmtMoney(tot, true)} / week · Tax ${fmtMoney((cs.lastWeek && cs.lastWeek.tradeTax) || 0, true)} / week</b></div>` + tp.map(t => `<div class="kv"><span>${W.byA3[t.p] ? W.byA3[t.p].flag : ''} ${esc(cname(t.p))}</span><b>${fmtMoney(t.vol, true)} / week</b></div>`).join(''); })()}
    <h4>Neighbours</h4>${nbs}
    <button class="btn wide" data-a="panel" data-x="military">OPEN MILITARY</button>`);
};
PANELS.leader = () => {
  const cs = country(S.home), k = W.byA3[S.home], lw = cs.lastWeek || {};
  const biz = (typeof businessesInCountry === 'function') ? businessesInCountry(S.home) : [S.co[S.home]];
  return panelShell('Leader', `${k.flag} ${esc(cname(S.home))} · You are the leader, as of today`,
    `<div class="stats3 box"><div><span>Treasury</span><b>${fmtMoney(S.cash, true)}</b></div><div><span>Debt</span><b>${fmtMoney(cs.debt || 0, true)}</b></div><div><span>Debt / GDP</span><b>${Math.round((cs.debt || 0) / Math.max(1, cs.gdp * 1e6) * 100)}%</b></div></div>
    <div class="kv"><span>Population</span><b>${fmtPop(nationPop())}</b></div><div class="kv"><span>GDP</span><b>${fmtMoney(cs.gdp * 1e6, true)}</b></div><div class="kv"><span>Stability</span><b>${Math.round(cs.stab)} / 100</b></div>
    <h4>Last week — economy, straight</h4><p class="muted small">Every payment has a payer and a recipient. Taxes go to the treasury, the treasury pays people, services, military upkeep and debt interest. No free money in leader mode.</p>
    <div class="kv"><span>Revenue</span><b>${fmtMoney(lw.revenue || 0, true)} / week</b></div>
    <div class="kv"><span>— Corporate tax</span><b>${fmtMoney(lw.corpTax || 0, true)}</b></div>
    <div class="kv"><span>— Income tax</span><b>${fmtMoney(lw.incomeTax || 0, true)}</b></div>
    <div class="kv"><span>— VAT</span><b>${fmtMoney(lw.vat || 0, true)}</b></div>
    <div class="kv"><span>— Trade tax</span><b>${fmtMoney(lw.tradeTax || 0, true)}</b></div>
    <div class="kv"><span>Spending</span><b>${fmtMoney(lw.spending || 0, true)} / week</b></div>
    <div class="kv"><span>— Pay people (wages)</span><b>${fmtMoney(lw.payPeople || 0, true)}</b></div>
    <div class="kv"><span>— Services</span><b>${fmtMoney(lw.services || 0, true)}</b></div>
    <div class="kv"><span>— Military upkeep</span><b>${fmtMoney(lw.milUpkeep || 0, true)}</b></div>
    <div class="kv"><span>— Debt interest</span><b>${fmtMoney(lw.interest || 0, true)}</b></div>
    <div class="kv"><span>Net / week</span><b class="${upCls(lw.net || 0)}">${fmtMoney(lw.net || 0, true)}</b></div>
    <p class="muted small">Trade tax above is the government part of bilateral trade — who trades with whom is listed in Nation / Tax under Trade partners. Extra businesses below are also separate stocks in Markets (Extras category), tradable buy and sell.</p>
    <h4>Your country's businesses (${biz.length})</h4>
    ${biz.map(bc => `<div class="kv"><span>${(SECTORS[bc.sector] && SECTORS[bc.sector].icon) || ICONS.company} ${esc(bc.name)} · ${esc(bc.sector)}</span><b>${fmtMoney(bc.locs ? companyValue(bc) : bc.value, true)}${bc.week && bc.week.profit ? ' · ' + fmtMoney(bc.week.profit, true) + '/week' : ''}</b></div>`).join('')}
    <div class="row"><button class="btn" data-a="panel" data-x="nation">NATION / TAX</button><button class="btn" data-a="panel" data-x="military">MILITARY</button><button class="btn" data-a="panel" data-x="markets">MARKETS</button></div>`);
};
PANELS.warplan = () => {
  const plan = UI.warPlan; if (!plan || !S.countries[plan.target]) return panelShell('War Plan', '', '<p class="muted">Pick a country to invade first.</p>');
  const err = canAttack(plan.target);
  const { att, def, winP } = warPlanScore(plan);
  const approaches = approachList(plan.target);
  const commitRow = (branch, label) => `<div class="kv"><span>${label} Lv ${country(S.home).milLv[branch]} · Commit ${plan[branch]}%</span><span><button class="btn small" data-a="warCommit" data-x="${branch}|-25">−25</button> <button class="btn small" data-a="warCommit" data-x="${branch}|25">+25</button></span></div>`;
  return panelShell(`Invade ${cname(plan.target)}`, `${W.byA3[plan.target].flag} ${esc(cname(plan.target))} · Relations ${getRel(S.home, plan.target)} · Treasury ${fmtMoney(S.cash, true)}`,
    `${err ? `<div class="card in"><p class="muted">${esc(err)}</p></div>` : ''}
    <h4>1 · Position — where do you attack from?</h4><p class="muted small">Put your troops where you think they will work, then submit. The game decides from power and endurance, not just army size.</p>
    ${approaches.map(a => a.ok ? `<button class="btn ${plan.approach === a.id ? 'btn3d orange' : ''} wide" data-a="warApproach" data-x="${plan.target}|${a.id}">${a.name} · +${Math.round(a.bonus * 100)}% power — ${a.why}</button>` : `<p class="muted small">${a.name} — not available: ${a.why}</p>`).join('')}
    <h4>2 · Commit your forces</h4><p class="muted small">Committing less keeps forces home but cuts your attack power in proportion.</p>
    ${commitRow('army', '🪖 Army')}${commitRow('navy', '⚓ Navy')}${commitRow('air', '✈️ Air force')}
    <h4>3 · Upgrade, research, sell</h4>
    <div class="row wrap">${Object.entries(MILITARY).map(([b, d]) => { const lv = country(S.home).milLv[b], cost = milCost(b); return cost != null ? `<button class="btn" data-a="milUp" data-x="${b}">Upgrade ${d.name} · ${fmtMoney(cost, true)}</button>` : ''; }).join('')}</div>
    <div class="kv"><span>War research · +15% attack power, this attack only</span>${plan.research ? '<span class="tagp green">RESEARCHED</span>' : `<button class="btn" data-a="warResearch">RESEARCH · ${fmtMoney(researchWarCost(), true)}</button>`}</div>
    <div class="kv"><span>Sell some stock for war funds (sells 25% of each holding)</span><button class="btn" data-a="warSell">SELL 25%</button></div>
    <div class="kv"><span>Military bases · +5% war power each, beyond your first</span><button class="btn" data-a="buyBase">BUY BASE · ${fmtMoney(baseCost(), true)}</button></div>
    <h4>4 · How long can each side last?</h4><p class="muted small">Power is army strength. Endurance is treasury, supplies (GDP per person), stability and debt. The side that runs out first loses, even if its army is bigger.</p>
    <div class="stats3 box"><div><span>You — power</span><b>${Math.round(att.effective).toLocaleString()}</b></div><div><span>Them — power</span><b>${Math.round(def.effective).toLocaleString()}</b></div><div><span>Your win chance</span><b>${Math.round(winP * 100)}%</b></div></div>
    <div class="kv"><span>You can last</span><b>~${Math.round(att.weeks)} weeks · Treasury ${fmtMoney(att.treasury, true)} · Stability ${Math.round(att.stab)}</b></div>
    <div class="kv"><span>They can last</span><b>~${Math.round(def.weeks)} weeks · Treasury ${fmtMoney(def.treasury, true)} · Stability ${Math.round(def.stab)}</b></div>
    <div class="kv"><span>You — people</span><b>${fmtPop(country(S.home).pop)}</b></div><div class="kv"><span>Them — people</span><b>${fmtPop(country(plan.target).pop)}</b></div>
    <button class="btn3d orange wide" data-a="warSubmit" ${err ? 'disabled' : ''}>SUBMIT ATTACK</button>
    <p class="muted small">Attacking may win or lose right there, or start an ongoing war that runs for years. While it runs, money, troops and weapons drain every day, and it can end in treaty, annexation, sanctions, nuclear escalation, or stalemate. The outcome is 70% your real stats and 30% chaos. You can declare war only once every 10 years.</p>`);
};
PANELS.war = () => {
  const w = (S.wars || []).find(x => x.a === S.home || x.b === S.home);
  if (!w) {
    const r = S.lastWarResult;
    return panelShell('War', '', r ? `<p>Your last war ended: <b>${esc(r.outcome || (r.attackerWins ? 'victory' : 'defeat'))}</b> against ${esc(cname(r.target))}.</p><button class="btn wide" data-a="panel" data-x="warresult">VIEW LAST WAR RESULT</button>` : '<p class="muted">No war right now. Pick a country to invade from its city or the Nation panel.</p>');
  }
  ensureWarState(w);
  const other = w.a === S.home ? w.b : w.a, len = S.day - w.start;
  const s = warStatsRoll(w.a, w.b, w.plan);
  return panelShell(`Ongoing war — ${cname(other)}`, `NOT a win or a loss yet · ${Math.floor(len / 365)} years, ${len % 365} days in · Front ${Math.round(w.front)}%`,
    `<p class="muted small">This war is unresolved. Money, troops and weapons drain every day. It can end in treaty, annexation, sanctions, nuclear escalation, or stalemate — 70% real stats, 30% chaos.</p>
    <div class="stats3 box"><div><span>Front</span><b>${Math.round(w.front)}%</b></div><div><span>Your stats chance</span><b>${Math.round(s.winP * 100)}%</b></div><div><span>Days at war</span><b>${len}</b></div></div>
    <div class="kv"><span>${esc(cname(w.a))} — troops</span><b>${Math.round(w.troopsA)}%</b></div><div class="kv"><span>${esc(cname(w.a))} — weapons</span><b>${Math.round(w.weaponsA)}%</b></div><div class="kv"><span>${esc(cname(w.a))} — money spent</span><b>${fmtMoney(w.spentA, true)}</b></div>
    <div class="kv"><span>${esc(cname(w.b))} — troops</span><b>${Math.round(w.troopsB)}%</b></div><div class="kv"><span>${esc(cname(w.b))} — weapons</span><b>${Math.round(w.weaponsB)}%</b></div><div class="kv"><span>${esc(cname(w.b))} — money spent</span><b>${fmtMoney(w.spentB, true)}</b></div>
    <button class="btn wide" data-a="closePanel">RETURN TO MAP</button>`);
};
PANELS.warresult = () => {
  const r = S.lastWarResult; if (!r) return panelShell('War result', '', '<p class="muted">No war result yet.</p>');
  const titles = { 'instant-win': `VICTORY — ${cname(r.target)} occupied`, 'instant-loss': `DEFEAT — ${cname(r.target)} held`, 'minigame-win': `BATTLE WON — ${cname(r.target)} occupied`, annexation: `ANNEXATION — ${cname(r.target)} taken`, 'treaty-att': `TREATY — peace with reparations from ${cname(r.target)}`, 'treaty-def': `TREATY — peace with reparations from you`, sanctions: `SANCTIONS — war ended by economic pressure`, nuke: `NUCLEAR ESCALATION — war ended in devastation`, stalemate: `STALEMATE — no winner` };
  const bodies = { 'instant-win': `<p><b>${cname(r.target)} is now occupied by you.</b> Its main company and its people count toward your nation.</p>`, 'instant-loss': `<p><b>Your invasion was driven back on the spot.</b> Your stability fell 15 points and the war cost was paid from your treasury.</p>`, 'minigame-win': `<p><b>You won the battle and ${cname(r.target)} is now occupied by you — with no troops lost in the main game.</b> The battle was the war.</p>`, annexation: `<p><b>${cname(r.target)} was annexed after a long war.</b> It is now under your control.</p>`, 'treaty-att': `<p><b>Peace, on your terms.</b> ${cname(r.target)} paid reparations and no territory changed hands.</p>`, 'treaty-def': `<p><b>Peace, on their terms.</b> You paid reparations and no territory changed hands.</p>`, sanctions: `<p><b>The war ended in sanctions, not conquest.</b> The aggressor is punished economically and both sides paid — no territory changed hands.</p>`, nuke: `<p><b>The war ended in nuclear escalation.</b> Both nations were devastated and the world turned against the side that escalated.</p>`, stalemate: `<p><b>Nobody won.</b> After years of war, neither side could finish it, and no territory changed hands.</p>` };
  const title = titles[r.outcome] || (r.attackerWins ? `VICTORY — ${cname(r.target)} occupied` : `DEFEAT — ${cname(r.target)} held`);
  return panelShell(title, `Your stats chance was ${Math.round(r.winP * 100)}% · War cost ${fmtMoney(r.cost, true)}${r.days ? ` · Lasted ${Math.round(r.days / 365 * 10) / 10} years` : ' · Decided on the spot'}`,
    `<div class="stats3 box"><div><span>You — power</span><b>${Math.round(r.att.effective).toLocaleString()}</b></div><div><span>Them — power</span><b>${Math.round(r.def.effective).toLocaleString()}</b></div><div><span>You could last</span><b>~${Math.round(r.att.weeks)} weeks</b></div></div>
    <div class="kv"><span>You</span><b>Army Lv ${r.att.milLv.army} · Navy Lv ${r.att.milLv.navy} · Air Lv ${r.att.milLv.air} · Stability ${Math.round(r.att.stab)} · Debt ${Math.round(r.att.debtRatio * 100)}% of GDP</b></div>
    <div class="kv"><span>Them</span><b>Army Lv ${r.def.milLv.army} · Navy Lv ${r.def.milLv.navy} · Air Lv ${r.def.milLv.air} · Stability ${Math.round(r.def.stab)} · Debt ${Math.round(r.def.debtRatio * 100)}% of GDP</b></div>
    ${bodies[r.outcome] || ''}
    <p class="muted small">Next war: ${S.mode === 'domination' ? 'next year — Domination cooldown is 1 year.' : yearOf(S.day + WAR_COOLDOWN_DAYS) + ' — one declaration every 10 years.'}</p>
    <button class="btn wide" data-a="closePanel">RETURN TO MAP</button>`);
};
// ---------- battle grid mini-game UI (shared engine, war + standalone) ----------
// One board renderer for both paths: tile buttons, two toolbar rows
// (structures + troops, then weapons), and the outcome banner. The
// war path ticks on every panel render (the game loop re-renders the
// panel every 1.5s); the standalone modal ticks on WAIT and on clicks.
function battleHTML(b, acts) {
  const c = battleCounts(b);
  const sel = b.tiles[b.selected];
  const funds = battleFunds(b);
  const tileBtn = (t, i) => `<button class="btile ${t.owner} ${i === b.selected ? 'sel' : ''}" data-a="${acts.tile}" data-x="${i}" aria-label="Tile ${t.x},${t.y}">${t.structure ? bIcon(BATTLE_ITEM_BY_ID[t.structure]) : ''}<b>${Math.floor(t.units)}</b></button>`;
  const bIcon = it => (typeof ICONS !== 'undefined' && ICONS[it.icon]) ? ICONS[it.icon] : '';
  const toolBtn = (it) => `<button class="btn small ${b.weapon === it.id ? 'on' : ''}" data-a="${acts.tool}" data-x="${it.id}">${bIcon(it)} ${it.name} · ${fmtMoney(it.cost, true)}</button>`;
  const structs = BATTLE_ITEMS.filter(i => i.kind === 'structure' || i.kind === 'buy');
  const weapons = BATTLE_ITEMS.filter(i => i.kind === 'weapon');
  const outcome = b.status === 'won' ? `<div class="card in"><h3>${ICONS.leader} You won the battle!</h3><p class="muted small">${acts.claim ? 'Claim it to win the war — with no troops lost.' : 'Play again for another round.'}</p><button class="btn3d orange wide" data-a="${acts.claim || acts.again}">${acts.claim ? 'CLAIM VICTORY' : 'PLAY AGAIN'}</button></div>`
    : b.status === 'lost' ? `<div class="card in"><h3>${ICONS.burst} You lost the battle.</h3><p class="muted small">${acts.claim ? 'The battle is lost, but the war is not over — it continues as an ongoing war.' : 'Play again for another round.'}</p><button class="btn3d orange wide" data-a="${acts.claim || acts.again}">${acts.claim ? 'CONTINUE TO ONGOING WAR' : 'PLAY AGAIN'}</button></div>` : '';
  return `<p class="muted small">You are blue, the enemy is red. Tap your tile, then a tile next to it to move all its units there — or into an enemy tile to attack. Every tile you own makes 1 unit per second. ${b.weapon ? `Weapon armed: ${BATTLE_ITEM_BY_ID[b.weapon].name} — tap an enemy tile to fire it.` : ''}</p>
    <div class="kv"><span>Your tiles / units</span><b>${c.playerTiles} · ${Math.floor(c.playerUnits)}</b></div>
    <div class="kv"><span>Enemy tiles / units</span><b>${c.enemyTiles} · ${Math.floor(c.enemyUnits)}</b></div>
    <div class="kv"><span>${b.mode === 'war' ? 'Your cash' : 'Battle fund'}</span><b>${fmtMoney(funds, true)}</b></div>
    <div class="kv"><span>Selected tile</span><b>${sel ? `(${sel.x}, ${sel.y}) · ${Math.floor(sel.units)} units${sel.structure ? ' · ' + BATTLE_ITEM_BY_ID[sel.structure].name : ''}` : '—'}</b></div>
    <div class="bgrid" style="grid-template-columns:repeat(${b.w},1fr)">${b.tiles.map(tileBtn).join('')}</div>
    <h4>Build</h4><div class="row wrap">${structs.map(toolBtn).join('')}</div>
    <h4>Weapons</h4><div class="row wrap">${weapons.map(toolBtn).join('')}</div>
    <p class="muted small">City raises capacity, Port and Factory raise generation, Defense doubles defenders, SAM halves weapon damage, Silo unlocks Atom / H-Bomb / MIRV / Mega, Airfield unlocks Strike, Warship adds +20 to attacks from its tile.</p>
    ${outcome}
    <div class="row wrap" style="margin-top:10px">${acts.wait ? `<button class="btn" data-a="${acts.wait}">⏱ WAIT 5 SECONDS</button>` : ''}<button class="btn" data-a="${acts.leave}">LEAVE BATTLE</button></div>`;
}
function battleTickRender(b) {
  // Advance the battle by real elapsed time (capped, so a backgrounded
  // tab cannot jump the board), then let the enemy act once.
  if (!b || b.status !== 'playing') return;
  const now = Date.now();
  const dt = b.lastTick ? Math.min(5, Math.max(0, (now - b.lastTick) / 1000)) : 0;
  b.lastTick = now;
  if (dt > 0) battleTick(b, dt);
  battleAITurn(b);
}
function miniModalHTML(b) {
  return `<h2>${ICONS.minigames} Mini Games — battle grid</h2><p class="muted small">Standalone · No country, no consequences · ${b.w} × ${b.h}${b.shape !== 'grid' ? ' · ' + b.shape : ''} board</p>` + battleHTML(b, { tile: 'miniTile', tool: 'miniTool', leave: 'miniLeave', wait: 'miniWait', again: 'miniAgain' });
}
PANELS.wartaunt = () => {
  const plan = UI.pendingWarPlan; if (!plan) return panelShell('War', '', '<p class="muted">Pick a country to invade first.</p>');
  return panelShell(`Invade ${cname(plan.target)}`, '', `<div class="card in"><h3>💬 ${esc(cname(plan.target))} says it's up for the challenge.</h3><p class="muted small">Fight it out on the battle grid and win the war with no troops lost — or let the war run as an ongoing war instead.</p>
    <button class="btn3d wide" style="background:#e5484d;box-shadow:0 4px 0 #a82a2e" data-a="warFight">🔴 FIGHT</button>
    <button class="btn wide" data-a="warBattleLeave" style="margin-top:10px">LET THE WAR RUN INSTEAD</button></div>`);
};
PANELS.warbattle = () => {
  const b = UI.warBattle; if (!b) return panelShell('Battle', '', '<p class="muted">No battle running.</p>');
  battleTickRender(b);
  return panelShell(`Battle — ${cname(b.target)}`, 'A generic battle board, not a real city · Win it and the war is yours', battleHTML(b, { tile: 'warBattleTile', tool: 'warBattleTool', leave: 'warBattleLeave', claim: 'warBattleClaim' }));
};
PANELS.minigames = () => {
  const b = UI.miniPanelBattle;
  if (!b) return panelShell('Mini Games', 'Battle grid, no country needed — no consequences, play again as much as you like.',
    `<div class="row wrap">${BATTLE_SIZE_OPTIONS.map(o => `<button class="btn" data-a="miniPanelStart" data-x="${o.id}">${o.shape === 'ring' ? '⭕' : '▦'} ${o.label}${o.shape !== 'grid' ? ' · ' + o.shape : ''}</button>`).join('')}</div>
    <p class="muted small">Pick a board: smaller than 6×6, 6×6, bigger, wide, tall, or a ring. Each side starts with 50 units in a corner, and every tile you own makes 1 unit per second.</p>`);
  battleTickRender(b);
  return panelShell('Mini Games — battle grid', 'Standalone · No country, no consequences', battleHTML(b, { tile: 'miniPanelTile', tool: 'miniPanelTool', leave: 'miniPanelLeave', again: 'miniPanelAgain' }));
};
PANELS.military = () => {
  const cs = country(S.home);
  return panelShell('Military', `Power ${Math.round(milPower(S.home)).toLocaleString()} · Rank #${milRank(S.home)}`,
    Object.entries(MILITARY).map(([b, d]) => {
      const lv = cs.milLv[b], cost = milCost(b);
      return `<div class="card in"><h4>${d.icon} ${d.name}</h4><p class="muted small">Now: ${d.levels[lv]}</p>${cost != null ? `<button class="btn" data-a="milUp" data-x="${b}">Upgrade to ${d.levels[lv + 1]} · ${fmtMoney(cost, true)}</button>` : '<span class="tagp green">TOP LEVEL</span>'}</div>`;
    }).join('') +
    `<div class="card in"><h4>🛡️ Military bases</h4><p class="muted small">You start with one base. Each extra base adds +5% to your war power. You have ${facilityCount(S.home)} base${facilityCount(S.home) === 1 ? '' : 's'}.</p><button class="btn" data-a="buyBase">BUY MILITARY BASE · ${fmtMoney(baseCost(), true)}</button></div>
    <h4>Wars elsewhere</h4>${S.wars.map(w => `<div class="kv"><span>${esc(cname(w.a))} vs ${esc(cname(w.b))}</span><b>Ongoing · Front ${Math.round(w.front)}% · Troops ${Math.round(w.troopsA ?? 100)}/${Math.round(w.troopsB ?? 100)}% · Weapons ${Math.round(w.weaponsA ?? 100)}/${Math.round(w.weaponsB ?? 100)}%</b></div>`).join('') || '<p class="muted small">No wars right now.</p>'}${(S.wars || []).some(w => w.a === S.home || w.b === S.home) ? '<button class="btn wide" data-a="panel" data-x="war">OPEN ONGOING WAR</button>' : ''}`);
};
PANELS.estate = () => {
  return panelShell('My Estate', `${S.props.length} buildings · Value ${fmtMoney(propValue(), true)}`,
    `<div class="list">${S.props.map(p => {
      const city = W.cities[p.city];
      return `<button class="srow" data-a="propSheet" data-x="${p.id}"><span class="avatar">🏠</span><span class="sname"><b>${esc(city.name)}, ${esc(cname(city.a3))}</b><small>${p.units} units · ${Math.round(p.occ * 100)}% occupied · Condition ${Math.round(p.cond * 100)}%</small></span><span class="sprice"><b>${fmtMoney(p.value, true)}</b><small>${fmtMoney(p.income, true)}/week</small></span></button>`;
    }).join('') || '<p class="muted small">No buildings yet. Buy one from a city FOR SALE pin.</p>'}</div>`);
};
PANELS.hq = () => {
  const hk = W.byA3[S.home];
  const capCity = hk && W.cities[hk.capital];
  const mineList = (typeof mine === 'function') ? mine() : [];
  const placed = Array.isArray(S.placed) ? S.placed : [];
  const totalValue = mineList.reduce((s, c) => s + companyValue(c), 0);
  const totalProfit = mineList.reduce((s, c) => s + ((c.week || {}).profit || 0), 0);
  const totalLocs = mineList.reduce((s, c) => s + (c.locs ? c.locs.length : 0), 0);
  const companyCards = mineList.map(c => {
    const wk = c.week || { profit: 0 };
    const board = (typeof boardFull === 'function' && boardFull(c)) ? 'Full' : 'Not full';
    return `<div class="card in"><b>${esc(c.name)}</b><div class="muted small">${c.sym} · ${esc(cname(c.a3))} · ★ ${c.rating.toFixed(1)} · Board ${board} · ${c.weekProfitStreak || 0} / 2 profitable weeks</div>
    <div class="kv"><span>Value</span><b>${fmtMoney(companyValue(c), true)}</b></div><div class="kv"><span>Week profit</span><b class="${upCls(wk.profit)}">${fmtMoney(wk.profit, true)}</b></div><div class="kv"><span>Locations</span><b>${c.locs.length}</b></div>
    <div class="row wrap"><button class="btn" data-a="stock" data-x="${c.a3}">VIEW STOCK</button><button class="btn" data-a="webCo" data-x="${c.a3}">OPEN WEBSITE</button><button class="btn" data-a="siteMaker" data-x="${c.a3}">CUSTOMIZE SITE</button><button class="btn" data-a="panel" data-x="offices">BOARD</button>${!c.listed ? `<button class="btn" data-a="ipo" data-x="${c.a3}">IPO</button>` : '<span class="muted small">Listed</span>'}</div></div>`;
  }).join('') || '<p class="muted small">You control no companies yet. Your home company is yours once you open a location, or buy 50% of a listed company in Markets to take control.</p>';
  const placedRows = placed.map(b => `<div class="kv"><span>${b.icon || ICONS.company} ${esc(b.name)} · ${esc(cname(b.a3))}</span><b>${fmtMoney(b.value, true)} · ${fmtMoney(b.income, true)}/week</b></div>`).join('') || '<p class="muted small">No placed businesses yet. Build one from a FOR LEASE lot in a city — press BUILD STORE there.</p>';
  return panelShell('HQ', `${hk ? hk.flag : ''} ${esc(cname(S.home))}${capCity ? ` · HQ in ${esc(capCity.name)}` : ''}`,
    `<div class="card in"><p><b>🏛️ Your HQ is in ${capCity ? esc(capCity.name) : 'your capital'}.</b></p><p class="muted small">HQ is not a separate place — it is your capital city, where the government sits. Open the capital to run it, or manage your companies from here.</p><button class="btn3d orange wide" data-a="panel" data-x="capital">🏛️ OPEN CAPITAL</button></div>
    <div class="stats3 box"><div><span>Companies controlled</span><b>${mineList.length}</b></div><div><span>Total value</span><b>${fmtMoney(totalValue, true)}</b></div><div><span>Week profit</span><b class="${upCls(totalProfit)}">${fmtMoney(totalProfit, true)}</b></div></div>
    <div class="kv"><span>Locations</span><b>${totalLocs}</b></div><div class="kv"><span>Placed businesses</span><b>${placed.length}</b></div><div class="kv"><span>Buildings owned</span><b>${S.props.length}</b></div>
    <div class="row wrap"><button class="btn" data-a="panel" data-x="company">MANAGE COMPANIES</button><button class="btn" data-a="panel" data-x="capital">OPEN CAPITAL</button><button class="btn" data-a="panel" data-x="nation">NATION / TAX</button><button class="btn" data-a="panel" data-x="bank">BANK</button><button class="btn" data-a="panel" data-x="estate">BUILDINGS</button><button class="btn" data-a="panel" data-x="markets">MARKETS</button><button class="btn" data-a="panel" data-x="stores">MY STORES</button></div>
    <h4>Your companies</h4>${companyCards}
    <h4>Placed businesses</h4><div class="list">${placedRows}</div>`);
};
PANELS.goals = () => {
  const stage = CAREER[S.career];
  return panelShell('Daily goals', `Career: ${careerName()} · Streak ${S.daily.streak} days`,
    `<div class="stats3 box"><div><span>Level</span><b>Lv ${level()}</b></div><div><span>XP</span><b>${S.xp}</b></div><div><span>Companies controlled</span><b>${mine().length}</b></div></div>
    ${stage ? `<h4>${stage.name}</h4>${stage.goals.map((g, i) => `<div class="goal ${S.goalsDone.includes(S.career + ':' + i) ? 'done' : ''}"><span>${S.goalsDone.includes(S.career + ':' + i) ? '✓' : '○'}</span>${g.t}</div>`).join('')}` : '<p class="muted small">Legend status reached 👑</p>'}
    <h4>Daily reward</h4><div class="kv"><span>Today</span><b>${fmtMoney(dailyRewardInfo().amount, true)}</b></div><p class="muted small">Added to your cash automatically each day, no claiming needed.</p>`);
};
PANELS.progress = () => {
  const p = ensureProgress(), sel = UI.progressSel || p.level;
  const need = p.level >= 100 ? 0 : progressXPNeeded(p.level);
  const pct = need ? Math.round(p.xp / need * 100) : 100;
  const next = nextUnlockAfter(p.level);
  const tiles = [];
  for (let l = 1; l <= 100; l++) {
    const state = l < p.level ? 'done' : l === p.level ? 'current' : 'locked';
    tiles.push(`<button class="btn ${state === 'current' ? 'on' : ''}" style="min-width:44px;padding:8px 0;text-align:center;opacity:${state === 'locked' ? 0.55 : 1}" data-a="progressSel" data-x="${l}">${l}${state === 'done' ? ' ✓' : state === 'current' ? ' ●' : ' 🔒'}</button>`);
  }
  const selText = progressUnlockText(sel);
  return panelShell('Progress', `Lv ${p.level} · ${p.xp} XP · ${need ? `${need - p.xp} XP to Lv ${p.level + 1}` : 'Max level'}`,
    `<div class="card in"><h4>Your level</h4><div style="background:#eef5ff;border-radius:6px;height:12px;overflow:hidden"><div style="width:${pct}%;height:100%;background:#2f7cf6"></div></div><p class="muted small">${pct}% to next level.</p>
    <p class="muted small">XP comes from doing: building a store (+150), developing a product (+40), upgrading a store (+60), and every profitable store week (+5). Levels unlock campaigns, store upgrades and manager levels — business types are never locked, profit decides. High-level employees stay locked until you earn them.</p>
    ${next ? `<p><b>Next unlock:</b> Lv ${next.level} — ${esc(next.text)}</p>` : '<p><b>Everything unlocked.</b></p>'}</div>
    <h4>Rewards map — tap a level</h4><div class="row wrap">${tiles.join('')}</div>
    <div class="card in"><h4>Level ${sel}</h4><p>${selText ? esc(selText) : (sel < p.level ? 'No unlock at this level — it was a step toward the next one.' : sel === p.level ? 'Your current level.' : `Locked. ${next ? `Next unlock is Lv ${next.level}.` : ''}`)}</p></div>
    <p class="muted small">First pass — unlocks will be adjusted as the game grows.</p>`);
};
PANELS.inbox = () => {
  S.mail.forEach(m => { m.read = true; });
  return panelShell('Messages', `${S.mail.length} messages · News below`,
    `<div class="list">${S.mail.map(m => `<div class="card in"><b>${esc(m.from)}</b> · <span class="muted small">${fmtDate(m.d)}</span><p>${esc(m.subject)} — ${esc(m.body)}</p>${m.offer && !m.offer.done ? `<button class="btn3d orange" data-a="acceptOffer" data-x="${m.id}">ACCEPT OFFER</button>` : ''}</div>`).join('') || '<p class="muted small">No mail.</p>'}</div>
    <h4>Latest news</h4><div class="list">${S.news.slice(0, 30).map(n => `<div class="kv"><span><b>${esc(n.cat)}</b> · ${esc(n.text)}</span><small>${fmtDate(n.d)}</small></div>`).join('')}</div>`);
};
PANELS.shop = () => {
  return panelShell('Shop', 'Every power-up is free, once per real day. The cash grant is added to your cash automatically each day.',
    SHOP.filter(s => s.id !== 'cash').map(s => `<div class="card in"><h4>${s.icon} ${s.name}</h4><p class="muted small">${s.desc}</p><button class="btn3d orange" data-a="shopBuy" data-x="${s.id}" ${shopReady(s.id) ? '' : 'disabled'}>${shopReady(s.id) ? 'GET FREE' : 'COME BACK TOMORROW'}</button></div>`).join(''));
};
PANELS.search = () => {
  const q = (UI.sq || '').trim().toLowerCase();
  const cos = Object.values(S.co).filter(c => !q || c.name.toLowerCase().includes(q) || c.sym.toLowerCase().includes(q)).slice(0, 20);
  const cts = W.countries.filter(c => c.playable && (!q || c.name.toLowerCase().includes(q))).slice(0, 20);
  return panelShell('Search', 'Companies and countries',
    `<input id="ssearch" class="search" placeholder="Search anything" value="${esc(UI.sq || '')}" autocomplete="off">
    <h4>Companies</h4><div class="list">${cos.map(c => `<button class="srow" data-a="stock" data-x="${c.a3}"><span class="avatar" style="background:${c.color}">${esc(c.name[0])}</span><span class="sname"><b>${c.sym}</b><small>${esc(c.name)}</small></span></button>`).join('') || '<p class="muted small">No matches.</p>'}</div>
    <h4>Countries</h4><div class="list">${cts.map(c => `<button class="srow" data-a="flyCountry" data-x="${c.a3}"><span class="avatar">${c.flag}</span><span class="sname"><b>${esc(c.name)}</b><small>${fmtPop(c.pop0)} people</small></span></button>`).join('') || '<p class="muted small">No matches.</p>'}</div>`);
};
PANELS.leaderboard = () => {
  const list = leaderboard();
  const board = (() => { try { return JSON.parse(localStorage.getItem(BOARD_KEY) || '[]'); } catch (e) { return []; } })();
  return panelShell('Leaderboard', 'Most valuable companies, with you ranked among them',
    `<div class="list">${list.slice(0, 30).map((c, i) => `<div class="kv ${c.you ? 'you' : ''}"><span>${i + 1}. ${esc(c.name)}</span><b>${fmtMoney(c.v, true)}</b></div>`).join('')}</div>
    ${board.length ? `<h4>Past runs</h4><div class="list">${board.map(b => `<div class="kv"><span>${esc(b.name)} · ${esc(cname(b.home))}</span><b>${b.score} pts · ${fmtMoney(b.nw, true)}</b></div>`).join('')}</div>` : ''}`);
};
PANELS.settings = () => {
  return panelShell('Settings', '',
    `<div class="kv"><span>Sound volume</span><span><input type="range" min="0" max="1" step="0.1" value="${S.settings.vol}" data-in="vol" data-x=""> ${Math.round(S.settings.vol * 100)}%</span></div>
    <div class="kv"><span>Map motion (vehicles)</span><button class="btn" data-a="toggleMotion">${S.settings.motion ? 'ON' : 'OFF'}</button></div>
    <div class="kv"><span>Mini-games</span><button class="btn" data-a="toggleMinigames">${minigamesEnabled() ? 'ON' : 'OFF'}</button></div>
    <div class="kv"><span>War battle board</span><span>${['4x4', '6x6', '8x8', '10x10'].map(s => `<button class="btn small ${(S.settings.battleSize || '6x6') === s ? 'on' : ''}" data-a="setBattleSize" data-x="${s}">${s}</button>`).join(' ')}</span></div>
    <div class="kv"><span>Save</span><b>IndexedDB, full history, no size cap</b></div>
    <button class="btn" data-a="exportSave">COPY SAVE TO CLIPBOARD</button>
    <button class="btn" data-a="restart">RESTART GAME</button>`);
};
// ---------- sports, stores, bank, and the new Markets format ----------
function sportStars(p) { return '★'.repeat(Math.floor(p.stars)) + (p.stars % 1 ? '½' : ''); }
function sportStatLine(lgId, p) {
  const s = p.stats || {};
  if (lgId === 'base') return p.pos.match(/SP|RP|CP/) ? `W ${s.W || 0} L ${s.L || 0} SV ${s.SV || 0} SO ${s.SO || 0} ERA ${s.ERA != null ? s.ERA : '-'}` : `.${String(Math.round((s.AVG || 0) * 1000))} HR ${s.HR || 0} RBI ${s.RBI || 0} SB ${s.SB || 0}`;
  return `PTS ${s.PTS || 0} REB ${s.REB || 0} AST ${s.AST || 0}`;
}
PANELS.sports = () => {
  ensureSports();
  const teamId = UI.stack[0];
  if (teamId) {
    const t = sportTeam(teamId); if (!t) return panelShell('Sports', '', '<p class="muted">Team not found.</p>');
    const lg = sportLeague(t.league), tab = UI.sportTab || 'franchise', mine = t.owner === 'you';
    const sorted = [...lg.teams].sort((a, b) => b.wins - a.wins);
    const place = sorted.findIndex(x => x.id === t.id) + 1;
    const tabs = ['franchise', 'uniform', 'players', 'trade', 'finance', 'draft'];
    const tabBtns = tabs.map(x => `<button class="chip ${tab === x ? 'on' : ''}" data-a="sportTab" data-x="${x}">${x[0].toUpperCase() + x.slice(1)}</button>`).join('');
    let body = `<div class="row wrap">${tabBtns}</div>`;
    if (tab === 'franchise') {
      const fin = t.finance || sportFinance(t);
      body += `<div class="card in"><div class="row between"><div><b>${esc(t.name)}</b><div class="muted small">${lg.name} · ${place <= 5 ? 'East' : 'West'} Division · Season ${lg.seasonYear}</div></div><span class="avatar" style="background:${t.color}">${esc(t.logo)}</span></div>
      <div class="stats3 box"><div><span>Record</span><b>${t.wins}W - ${t.losses}L</b></div><div><span>Place</span><b>${place} / ${lg.teams.length}</b></div><div><span>Value</span><b>${fmtMoney(t.value, true)}</b></div></div>
      <p class="muted small">${esc(t.name)} is a professional ${lg.short.toLowerCase()} team in ${esc(t.cityName)}. Stadium: ${esc(t.stadium.name)}, ${t.stadium.capacity.toLocaleString()} seats, level ${t.stadium.level}. Owner: ${mine ? 'You' : 'Independent club'}.</p>
      <h4>History</h4>${t.history.map(h => `<div class="kv"><span>${h.year} ${h.champion ? '🏆 Champion' : 'Regular season'}</span><b>${h.place}${h.place === 1 ? 'st' : h.place === 2 ? 'nd' : h.place === 3 ? 'rd' : 'th'} · ${h.wins}-${h.losses}</b></div>`).join('') || '<p class="muted small">No seasons played yet. Age a year to play a season.</p>'}
      ${mine ? `<button class="btn" data-a="stadiumUp" data-x="${t.id}">UPGRADE STADIUM ${fmtMoney(40000000 * t.stadium.level, true)}</button>` : `<button class="btn3d orange wide" data-a="buyTeam" data-x="${t.id}">OFFER PURCHASE · ${fmtMoney(t.value, true)}</button>`}</div>`;
    } else if (tab === 'uniform') {
      body += `<div class="card in"><p class="muted small">The franchise owner can change the team name and logo.</p>
      <label class="muted small">TEAM NAME</label><input id="sportName" class="search" value="${esc(t.name)}">
      <label class="muted small">TEAM LOGO</label><div class="row wrap">${SPORT_LOGOS.map(l => `<button class="chip ${t.logo === l ? 'on' : ''}" data-a="sportLogo" data-x="${t.id}|${l}">${l}</button>`).join('')}</div>
      <label class="muted small">COLOURS</label><div class="row wrap">${SPORT_COLORS.map(c => `<button class="chip ${t.color === c ? 'on' : ''}" style="background:${c};color:#fff" data-a="sportColor" data-x="${t.id}|${c}">■</button>`).join('')}</div>
      ${mine ? `<button class="btn3d orange wide" data-a="sportRename" data-x="${t.id}">SAVE NAME</button>` : '<p class="muted small">Buy this team to change its name and logo.</p>'}</div>`;
    } else if (tab === 'players') {
      const stars = [...t.players].sort((a, b) => b.rating - a.rating).slice(0, 3);
      const payroll = t.players.reduce((a, p) => a + p.salary, 0);
      body += `<div class="card in"><h4>STAR PLAYERS · ${fmtMoney(payroll, true)} payroll</h4>${stars.map(p => `<div class="kv"><span><b>${esc(p.name)}</b> · ${p.pos} · Age ${p.age} · ${sportStars(p)}</span><b>${fmtMoney(p.salary)} until ${yearOf(S.day) + p.yrs}</b></div><p class="muted small">${sportStatLine(t.league, p)}</p>`).join('')}
      <h4>OTHER PLAYERS</h4>${t.players.filter(p => !stars.includes(p)).map(p => `<div class="kv"><span>${esc(p.name)} · ${p.pos} · Age ${p.age} · ${sportStars(p)}</span><b>${fmtMoney(p.salary)}</b></div><p class="muted small">${sportStatLine(t.league, p)}</p>`).join('') || '<p class="muted small">No other players.</p>'}</div>`;
    } else if (tab === 'trade') {
      const fa = lg.freeAgents.slice(0, 30);
      body += `<div class="card in"><h4>Available players</h4><p class="muted small">${fa.length} players currently available.</p>
      ${fa.map(p => `<div class="kv"><span><b>${esc(p.name)}</b> · ${p.pos} · Age ${p.age} · ${sportStars(p)}</span><b>${fmtMoney(p.salary * p.yrs, true)} / ${p.yrs} years</b></div><div class="row"><button class="btn flex" data-a="signFA" data-x="${t.id}|${p.id}">SIGN · ${fmtMoney(Math.round(p.salary * p.yrs * 0.10), true)} bonus</button></div>`).join('') || '<p class="muted small">No free agents right now.</p>'}
      <h4>Trade with another club</h4><p class="muted small">Pick one of your players, then pick a player from another club. The other club accepts if the ratings are close, or if you add enough cash.</p>
      <label class="muted small">YOUR PLAYER</label><div class="row wrap">${t.players.map(p => `<button class="chip ${UI.tradeOut === p.id ? 'on' : ''}" data-a="tradeOut" data-x="${p.id}">${esc(p.name)} ${p.rating}</button>`).join('')}</div>
      <label class="muted small">THEIR PLAYER</label><div class="row wrap">${lg.teams.filter(x => x.id !== t.id).flatMap(x => x.players.slice(0, 4).map(p => `<button class="chip ${UI.tradeIn === p.id ? 'on' : ''}" data-a="tradeIn" data-x="${x.id}|${p.id}">${esc(x.name)}: ${esc(p.name)} ${p.rating}</button>`)).join('')}</div>
      <label class="muted small">CASH OFFER</label><input id="tradeCash" class="search" type="number" value="0">
      ${mine && UI.tradeOut && UI.tradeIn ? `<button class="btn3d orange wide" data-a="doSportTrade" data-x="${t.id}">MAKE TRADE</button>` : '<p class="muted small">Select both players to trade.</p>'}</div>`;
    } else if (tab === 'finance') {
      const fin = t.finance || sportFinance(t), finTab = UI.sportFin || 'income';
      body += `<div class="card in"><div class="seg"><button class="${finTab === 'income' ? 'on' : ''}" data-a="sportFin" data-x="income">INCOME</button><button class="${finTab === 'balance' ? 'on' : ''}" data-a="sportFin" data-x="balance">BALANCE SHEET</button></div>
      ${finTab === 'income' ? `<p class="muted small">Franchise financial reports are available to the public.</p>
      <div class="kv"><span>Tickets and Concessions</span><b>${fmtMoney(fin.tickets + fin.concessions, true)}</b></div><div class="kv"><span>Broadcasting</span><b>${fmtMoney(fin.broadcast, true)}</b></div><div class="kv"><span>Sponsors</span><b>${fmtMoney(fin.sponsors, true)}</b></div><div class="kv"><span>Total Revenues</span><b>${fmtMoney(fin.revenue, true)}</b></div>
      <div class="kv"><span>Player Payrolls</span><b>${fmtMoney(fin.payroll, true)}</b></div><div class="kv"><span>Administrative Cost</span><b>${fmtMoney(fin.admin, true)}</b></div><div class="kv"><span>Total Expenses</span><b>${fmtMoney(fin.payroll + fin.admin, true)}</b></div>
      <div class="kv"><span>Net Income</span><b class="${upCls(fin.net)}">${fmtMoney(fin.net, true)}</b></div>` : `<div class="kv"><span>Franchise value</span><b>${fmtMoney(t.value, true)}</b></div><div class="kv"><span>Stadium value</span><b>${fmtMoney(t.stadium.capacity * 8000, true)}</b></div><div class="kv"><span>Championships</span><b>${t.champions}</b></div><div class="kv"><span>Profit streak</span><b>${t.profitStreak || 0} seasons</b></div>`}
      <h4>Rating · out of 5</h4>${(() => { const r = teamRating(t, fin); return `<div class="kv"><span>Overall</span><b>${r.rating.toFixed(1)} / 5</b></div><div class="kv"><span>Performance · Player likeness · Fans</span><b>${r.perf.toFixed(1)} · ${r.like.toFixed(1)} · ${r.fans.toFixed(1)}</b></div><div class="kv"><span>Profits · Attendees</span><b>${r.prof.toFixed(1)} · ${r.att.toFixed(1)}</b></div><p class="muted small">Rating drives revenue: a higher rating brings bigger crowds and sponsors, and that lifts valuation. Valuation now: ${fmtMoney(t.value, true)}.</p>`; })()}
      <div class="kv"><span>Board room</span><b>${(typeof boardFull === 'function' && boardFull(t)) ? 'Full' : 'Not full — hire in Offices'}</b></div><div class="kv"><span>Profitable weeks in a row</span><b>${t.weekStreak || 0} / 2</b></div>
      <h4>IPO</h4><p class="muted small">No stock at first. IPO whenever you want after you buy it, at today's valuation. Sell up to 100%, minus a 7% fee. If you just bought it for $200M, a 100% sale gets you $200M minus the fee — grow the rating first if you want more.</p>
      ${t.ipo ? `<div class="kv"><span>Share price</span><b>${fmtMoney(t.ipo.price)}</b></div><div class="kv"><span>Your shares</span><b>${t.ipo.yourShares.toLocaleString()}</b></div><div class="kv"><span>Public shares</span><b>${t.ipo.publicShares.toLocaleString()}</b></div>
      <div class="row"><input id="ipoQty" class="qty" type="number" value="1000" min="1"><button class="btn flex" data-a="ipoBuy" data-x="${t.id}">BUY SHARES</button><button class="btn flex" data-a="ipoSell" data-x="${t.id}">SELL SHARES</button></div>` : (mine ? `<div class="row"><label class="muted small">SELL %</label><input id="ipoPctTeam" class="qty" type="number" value="100" min="1" max="100"></div>${sportIpoEligible(t) ? `<button class="btn3d orange wide" data-a="sportIpo" data-x="${t.id}">TAKE PUBLIC · IPO</button>` : `<p class="muted small">IPO needs a full board room and 2 profitable weeks in a row. Board: ${(typeof boardFull === 'function' && boardFull(t)) ? 'full' : 'not full'}. Weekly streak: ${t.weekStreak || 0} / 2.</p>`}` : `<p class="muted small">Buy this team to take it public.</p>`)}</div>`;
    } else if (tab === 'draft') {
      body += `<div class="card in"><h4>Draft class ${lg.draftYear || yearOf(S.day)}</h4><p class="muted small">Worst team picks first. Rookies sign for 4 years at a rookie salary.</p>
      ${lg.draftClass.map(p => `<div class="kv"><span><b>${esc(p.name)}</b> · ${p.pos} · Age ${p.age} · ${sportStars(p)} (${p.rating})</span><b>${mine ? '' : ''}${fmtMoney(sportSalary(p.rating))}/yr</b></div>${mine ? `<button class="btn" data-a="draftPick" data-x="${t.id}|${p.id}">DRAFT</button>` : ''}`).join('') || '<p class="muted small">No draft class yet. Age a year to run a season and generate the next class.</p>'}
      ${mine ? '' : '<p class="muted small">Buy a team to draft players.</p>'}</div>`;
    }
    return panelShell(`${t.name}`, `${lg.name} · ${esc(t.cityName)} · ${mine ? 'Your team' : 'Click a tab'}`, body);
  }
  const lgId = S.sports.tab || 'base', lg = sportLeague(lgId);
  const sorted = [...lg.teams].sort((a, b) => b.wins - a.wins);
  return panelShell('Sports', 'Leagues are businesses. Buy a team, run it, and IPO it only when you want to.',
    `<div class="row wrap">${SPORT_LEAGUES.map(l => `<button class="chip ${lgId === l.id ? 'on' : ''}" data-a="sportLeague" data-x="${l.id}">${l.icon} ${l.name}</button>`).join('')}</div>
    <p class="muted small">${lg.champion ? `Champion: ${esc(sportTeam(lg.champion).name)}` : 'No champion yet — age a year to play a season.'} · Season ${lg.seasonYear || yearOf(S.day)}</p>
    <div class="list">${sorted.map((t, i) => `<button class="srow" data-a="sportTeam" data-x="${t.id}"><span class="avatar" style="background:${t.color}">${esc(t.logo)}</span><span class="sname"><b>${esc(t.name)}</b><small>${i + 1}. · ${t.wins}W - ${t.losses}L · ${esc(t.stadium.name)}</small></span><span class="sprice"><b>${fmtMoney(t.value, true)}</b><small>${t.owner === 'you' ? 'Yours' : 'OFFER PURCHASE'}</small></span></button>`).join('')}</div>
    <p class="muted small">Tap a team for Franchise, Uniform, Players, Trade, Finance and Draft. Tap its stadium on the city map to open it there too.</p>`);
};
PANELS.stores = () => {
  ensureStores();
  const storeId = UI.stack[0];
  if (storeId) {
    const st = storeById(storeId); if (!st) return panelShell('Stores', '', '<p class="muted">Store not found.</p>');
    const tab = UI.storeTab || 'service', def = STORE_TYPES[st.type] || STORE_TYPES.coffee, share = storeMarketShare(st);
    const tabs = ['service', 'product', 'marketing', 'finance'];
    let body = `<div class="row wrap">${tabs.map(x => `<button class="chip ${tab === x ? 'on' : ''}" data-a="storeTab" data-x="${x}">${x[0].toUpperCase() + x.slice(1)}</button>`).join('')}</div>`;
    if (tab === 'service') {
      const m = st.manager, bar = v => `<div style="background:#eef5ff;border-radius:6px;height:10px;overflow:hidden"><div style="width:${v}%;height:100%;background:#2f7cf6"></div></div>`;
      body += `<div class="card in"><h4>Manager · ${esc(m.name)} · Lv ${m.level || 1}</h4><p class="muted small">Manager since ${m.since} · Staff ${st.staff} · Store Lv ${st.level || 1}</p><p class="muted small">Employee levels are earned, not bought: manager Lv 2 unlocks at Progress Lv 5, Lv 3 at 15, Lv 4 at 30, Lv 5 at 50. Firing hires a replacement at your highest unlocked level.</p>
      <p class="muted small">People ${m.people}</p>${bar(m.people)}<p class="muted small">Product ${m.product}</p>${bar(m.product)}<p class="muted small">Marketing ${m.marketing}</p>${bar(m.marketing)}<p class="muted small">Ethics ${m.ethics}</p>${bar(m.ethics)}
      <div class="row"><button class="btn" data-a="mgrSalary" data-x="${st.id}|-5000">− $5K</button><b>${fmtMoney(m.salary)}/yr</b><button class="btn" data-a="mgrSalary" data-x="${st.id}|5000">+ $5K</button></div>
      <h4>MANAGER DELEGATION</h4>${Object.entries({ staffing: 'Delegate staffing and salary', products: 'Delegate products and pricing', marketing: 'Delegate store marketing', troubles: 'Delegate store troubles' }).map(([k, label]) => `<div class="kv"><span>${label}</span><button class="btn" data-a="storeDel" data-x="${st.id}|${k}">${st.delegation[k] ? 'ON' : 'OFF'}</button></div>`).join('')}
      <button class="btn" data-a="fireMgr" data-x="${st.id}">FIRE MANAGER</button>
      <h4>CUSTOMER REVIEWS ${st.reviews.overall} ★ · ${st.reviews.count} reviews</h4>
      <div class="kv"><span>Price</span><b>${st.reviews.price.toFixed(1)}</b></div><div class="kv"><span>Product</span><b>${st.reviews.product.toFixed(1)}</b></div><div class="kv"><span>Service</span><b>${st.reviews.service.toFixed(1)}</b></div><div class="kv"><span>Atmosphere</span><b>${st.reviews.atmosphere.toFixed(1)}</b></div></div>`;
    } else if (tab === 'product') {
      const nextUp = (st.level || 1) + 1, upNeed = storeUpgradeUnlock(nextUp);
      body += `<div class="card in">${st.products.map((p, i) => { const d = p.prevSold ? (p.sold - p.prevSold) / Math.max(1, p.prevSold) : 0; return `<div class="kv"><span><b>${esc(p.name)}</b> · Lv ${p.lvl || 1} · ${p.sold.toLocaleString()} sold ${d >= 0 ? '+' : ''}${(d * 100).toFixed(0)}%</span><b>${fmtMoney(p.price)}</b></div><div class="row"><button class="btn" data-a="storePrice" data-x="${st.id}|${i}|-0.5">− $0.50</button><button class="btn" data-a="storePrice" data-x="${st.id}|${i}|0.5">+ $0.50</button>${(p.lvl || 1) >= 5 ? '<span class="muted small">Fully developed</span>' : `<button class="btn" data-a="storeDev" data-x="${st.id}|${i}">DEVELOP · ${fmtMoney(productDevCost(p), true)}</button>`}</div>`; }).join('')}
      <h4>DEVELOP THIS STORE · Lv ${st.level || 1} / 5</h4><p class="muted small">Each store level adds 10% to customer demand. Developing products and upgrading the store is how a shop grows — opening one alone never makes trillions.</p>
      ${(st.level || 1) >= 5 ? '<p class="muted small">Fully upgraded.</p>' : (progressLevel() < upNeed ? `<p class="muted small">🔒 Store Lv ${nextUp} unlocks at Progress Lv ${upNeed}.</p>` : `<button class="btn3d orange wide" data-a="storeUp" data-x="${st.id}">UPGRADE TO LV ${nextUp} · ${fmtMoney(storeUpgradeCost(st), true)}</button>`)}
      <h4>LOGO</h4><p class="muted small">Pick an icon for this business. It shows on the city map, in the store list and here.</p>
      <div class="row"><span style="font-size:28px">${st.icon || def.icon}</span><button class="btn" data-a="storeIconOpen" data-x="${st.id}">CHANGE LOGO</button></div>
      <h4>COMPANY BLEND</h4><p class="muted small">Your house blend is the ${esc(def.products[0].name)} line above — price it like any other product, or rename the store to name the blend.</p>
      <label class="muted small">STORE NAME</label><input id="storeName" class="search" value="${esc(st.name)}"><button class="btn" data-a="storeRename" data-x="${st.id}">SAVE NAME</button></div>`;
    } else if (tab === 'marketing') {
      body += `<div class="card in"><h4>MARKET SHARES IN AREA</h4>
      <div style="width:120px;height:120px;border-radius:50%;background:conic-gradient(#2f7cf6 0 ${Math.round(share.mine * 360)}deg, #c9dcf5 ${Math.round(share.mine * 360)}deg 360deg);margin:8px auto"></div>
      <div class="kv"><span>${esc(st.name)} · ${esc(st.address)}</span><b>${(share.mine * 100).toFixed(1)}%</b></div><div class="kv"><span>Other shops in ${esc(W.cities[st.cityId] ? W.cities[st.cityId].name : '')}</span><b>${(share.ai * 100).toFixed(1)}%</b></div>
      <h4>MARKETING CAMPAIGNS</h4>${STORE_CAMPAIGNS.map(c => { const on = st.campaigns.some(x => x.id === c.id); const locked = progressLevel() < (c.unlock || 1); return `<div class="kv"><span><b>${c.name}</b> · +${Math.round(c.boost * 100)}% foot traffic · ${fmtMoney(c.cost)}/week</span>${locked ? `<span>🔒 Lv ${c.unlock}</span>` : `<button class="btn" data-a="storeCamp" data-x="${st.id}|${c.id}">${on ? 'RUNNING' : 'START'}</button>`}</div>`; }).join('')}</div>`;
    } else if (tab === 'finance') {
      const wk = st.weeks[0] || { rev: 0, income: 0 };
      body += `<div class="card in"><div class="stats3 box"><div><span>Store Revenue</span><b>${fmtMoney(wk.rev, true)}</b></div><div><span>Store Income</span><b class="${upCls(wk.income)}">${fmtMoney(wk.income, true)}</b></div><div><span>Rent / week</span><b>${fmtMoney(st.rent)}</b></div></div>
      <h4>Last weeks</h4>${st.weeks.slice(0, 5).map((w, i) => `<div class="kv"><span>Week ${st.weeksOpen - i}</span><b>${fmtMoney(w.rev, true)} rev · ${fmtMoney(w.income, true)} income</b></div>`).join('') || '<p class="muted small">No weeks traded yet — weeks run every in-game week.</p>'}
      <h4>STORE INCOME STATEMENT</h4>${st.products.map(p => `<div class="kv"><span>${esc(p.name)} · ${p.sold.toLocaleString()} sold</span><b>${fmtMoney(p.sold * p.price, true)}</b></div>`).join('')}
      <div class="kv"><span>Total Revenues</span><b>${fmtMoney(wk.rev, true)}</b></div><div class="kv"><span>Rent + wages + ingredients (this week)</span><b>${fmtMoney(Math.max(0, wk.rev - wk.income), true)}</b></div><div class="kv"><span>Net income</span><b class="${upCls(wk.income)}">${fmtMoney(wk.income, true)}</b></div>
      <button class="btn" data-a="closeStore" data-x="${st.id}">CLOSE STORE</button></div>`;
    }
    return panelShell(`${st.icon || def.icon} ${esc(st.name)} · Lv ${st.level || 1}`, `${esc(st.address)} · Rent ${fmtMoney(st.rent)}/week · Foot traffic ${st.footTraffic.toLocaleString()}/week`, body);
  }
  return panelShell('Stores', 'Stores you built from a FOR LEASE lot. Tap one to manage it.',
    `<div class="list">${S.stores.map(st => `<button class="srow" data-a="storeOpen" data-x="${st.id}"><span class="avatar">${st.icon || (STORE_TYPES[st.type] || STORE_TYPES.coffee).icon}</span><span class="sname"><b>${esc(st.name)}</b><small>${esc(st.address)} · ${st.reviews.overall}★ · ${st.staff} staff</small></span><span class="sprice"><b>${fmtMoney((st.weeks[0] || { income: 0 }).income, true)}/week</b><small>${fmtMoney((st.weeks[0] || { rev: 0 }).rev, true)} rev</small></span></button>`).join('') || '<p class="muted small">No stores yet. Open a city, tap a FOR LEASE pin, and press BUILD STORE.</p>'}</div>
    <p class="muted small">Stores earn every in-game week: customers pay, the store pays rent, wages, ingredients and campaigns, and the net lands in your cash.</p>`);
};


PANELS.capital = () => {
  if (!S.leader) return panelShell('Capital', 'Capital building is for leader games.', '<p class="muted small">Start a World, Worl Mode or Domination game to build your capital.</p>');
  const cap = ensureCapital(); const theme = CAPITAL_THEMES.find(x => x.id === cap.theme) || CAPITAL_THEMES[0];
  const prestige = capitalPrestige();
  const distRows = CAPITAL_DISTRICTS.map(d => {
    const L = cap.districts[d.id] || 0; const cost = capitalCost(d.id);
    return `<div class="kv"><span>${d.icon} ${d.name} · Lv ${L} / 5<br><small class="muted">${esc(d.desc)}<br>${esc(d.bonus)}</small></span>${L >= 5 ? '<span class="tagp green">MAX</span>' : `<button class="btn" data-a="capUp" data-x="${d.id}">${fmtMoney(cost, true)}</button>`}</div>`;
  }).join('');
  return panelShell('Capital', `${esc(cap.name)} · ${prestige.toFixed(1)}★ prestige`,
    `<div class="card" style="background:${theme.bg}"><div style="font-size:28px;letter-spacing:4px">${capitalSkyline()}</div><p><b>${esc(cap.name)}</b>${cap.motto ? ` — <i>${esc(cap.motto)}</i>` : ''}</p><p class="muted small">Theme: ${theme.name} · ${theme.desc}</p></div>
    <h4>Rename your capital</h4><p class="muted small">Free. This is your capital now, not just the one on the map.</p>
    <div class="row"><input id="capName" class="search" value="${esc(cap.name)}" placeholder="Capital name"><button class="btn" data-a="capRename">RENAME</button></div>
    <h4>Motto</h4><div class="row"><input id="capMotto" class="search" value="${esc(cap.motto || '')}" placeholder="e.g. The city that builds the future"><button class="btn" data-a="capMotto">SAVE</button></div>
    <h4>Theme</h4><div class="row wrap">${CAPITAL_THEMES.map(th => `<button class="btn ${th.id === cap.theme ? 'on' : ''}" data-a="capTheme" data-x="${th.id}">${th.name}</button>`).join('')}</div>
    <h4>Districts — build your capital, level by level</h4><p class="muted small">Costs scale with your GDP, so every country feels the same pressure. Government starts at level 1, the rest at 0. Prestige is the average district level.</p>
    <p class="muted small">The capital is for government only — parliament, courts, barracks, trade halls. Your HQ is this capital: HQ management opens from here.</p>
    <div class="list">${distRows}</div>
    <div class="kv"><span>Prestige</span><b>${prestige.toFixed(1)}★ / 5</b></div>
    <p class="muted small">Bonuses land every week: stability from Government and Green, cash from Commerce and Transport, population from Culture, war power from Defence. At 4.5★ prestige or more, a world-capital bonus pays weekly too.</p>`);
};
PANELS.site = () => {
  const c = S.co[UI.siteA3]; if (!c) return panelShell('Website maker', 'No company selected.', '');
  const site = ensureSite(c); const rating = siteRating(c);
  const previewColor = { Blue: '#2f7cf6', Green: '#12a150', Orange: '#e0812b', Purple: '#7c4dff', Dark: '#111827', Cream: '#d4a017' }[site.pending ? site.pending.colour : site.current.colour] || '#2f7cf6';
  const cur = site.pending || site.current;
  const dimRows = SITE_DIMS.map(d => `<h5>${d.name}</h5><div class="row wrap">${d.options.map(o => `<button class="btn ${cur[d.id] === o ? 'on' : ''}" data-a="siteDim" data-x="${c.a3}|${d.id}|${o}">${o}</button>`).join('')}</div>`).join('');
  const fb = site.feedback.map(f => `<div class="kv"><span>${f.good ? '👍' : '👎'} ${esc(f.text)}</span><small>${f.dim ? esc(f.dim) : ''}</small></div>`).join('') || '<p class="muted small">No feedback yet. Play a week and customers will speak.</p>';
  return panelShell('Website maker', `${esc(c.name)} · ${rating.toFixed(1)}★ website`,
    `<div class="website card"><div class="web-hero" style="background:${previewColor}"><b>${esc(c.name)}</b><span>${esc(cur.hero)} · ${esc(cur.layout)} · ${esc(cur.font)} font</span></div><p>Preview: ${esc(cur.section)} below the hero, checkout: ${esc(cur.checkout)}.</p><div class="kv"><span>Website rating</span><b>${rating.toFixed(1)}★</b></div></div>
    ${site.pending ? '<p class="muted small"><b>Changes pending.</b> They go live next week, then customers react. Changing again before then just replaces the pending change.</p>' : '<p class="muted small">Changes are free and go live next week. Customers then give feedback, and the rating moves. One hidden combination gives exactly 5.0 stars — feedback hints at what is wrong, never the answer.</p>'}
    ${dimRows}
    <h4>Customer feedback this week</h4><div class="list">${fb}</div>
    <p class="muted small">How it works: rating = 1 + 4 x (right choices / 6). At 5.0 stars online sales pay x1.3, at 1.0 star x0.82. Praise means stop touching that choice. A complaint means that choice is still wrong — try a different one next week.</p>`);
};
PANELS.airport = () => {
  const st = UI.airport || (UI.airport = { cont: null, a3: null });
  if (!st.cont) {
    const rows = airportContinents().map(c => `<button class="srow" data-a="airportCont" data-x="${c.name}"><span class="avatar">✈️</span><span class="sname"><b>${esc(c.name)}</b><small>${c.count} countries with airports</small></span><span class="sprice"><b>→</b></span></button>`).join('');
    return panelShell('Airport', 'Every country has an airport. Tap a continent, then a country, then a city to fly there.',
      `<p class="muted small">From: ${esc(airportFromCity().name)}. Distances are in km from where you are now.</p><div class="list">${rows}</div>`);
  }
  if (!st.a3) {
    const rows = airportCountries(st.cont).map(k => { const cap = W.cities[k.capital]; return `<button class="srow" data-a="airportCountry" data-x="${k.a3}"><span class="avatar">${k.flag || ICONS.nation}</span><span class="sname"><b>${esc(k.name)}</b><small>${cap ? esc(cap.name) : ''} · airport</small></span><span class="sprice"><b>→</b></span></button>`; }).join('');
    return panelShell('Airport', `${esc(st.cont)} — pick a country.`,
      `<button class="btn" data-a="airportBack">← CONTINENTS</button><div class="list">${rows}</div>`);
  }
  const k = W.byA3[st.a3], from = airportFromCity();
  const rows = airportCities(st.a3).map(c => {
    const city = W.cities[c.id];
    const km = `${airportDistanceKm(from, city).toLocaleString()} km`;
    return `<div class="card in"><div class="row between"><div><b>${esc(c.name)}</b><div class="muted small">${c.kind} · ${esc(k.name)} · ${km}</div></div><button class="btn3d orange" data-a="airportFly" data-x="${c.id}">FLY ✈️</button></div></div>`;
  }).join('');
  return panelShell('Airport', `${esc(k.name)} — departures from ${esc(from.name)}.`,
    `<button class="btn" data-a="airportBack2">← COUNTRIES</button><div class="list">${rows}</div>`);
};
PANELS.mars = () => marsPanelHTML();
PANELS.casino = () => casinoPanelHTML();
PANELS.crypto = () => {
  // Auto-refresh + auto-settle on open, at most once per 15s, so the
  // re-render these trigger does not loop back into another fetch.
  if (!UI.cryptoAutoAt || Date.now() - UI.cryptoAutoAt > 15000) {
    UI.cryptoAutoAt = Date.now();
    cryptoSettleDue().then(() => { if (UI.panel === 'crypto') renderPanelUnlessTyping(); }).catch(() => {});
    cryptoRefreshPrice().then(() => { if (UI.panel === 'crypto') renderPanelUnlessTyping(); }).catch(() => {});
  }
  return cryptoPanelHTML();
};
PANELS.offices = () => {
  const boardRow = (e, kind, id) => {
    const b = (typeof ensureBoard === 'function') ? ensureBoard(e) : [];
    return BOARD_ROLES.map(r => {
      const m = b.find(x => x.role === r.role);
      if (m) {
        const grant = m.grant ? ` · Grant: ${m.grant.shares.toLocaleString()} ${m.grant.type === 'option' ? 'stock options' : 'RSUs'}${m.grant.strike != null ? ` @ ${fmtMoney(m.grant.strike)}` : ''} (4yr vest, 1yr cliff)` : '';
        return `<div class="kv"><span>${r.role} · ${esc(m.name)} · Lv ${m.level || 1} · L${m.lead} E${m.exp} Y${m.loy}</span><b>${fmtMoney(m.salary)}/yr <button class="btn small" data-a="fireBoard" data-x="${kind}|${id}|${r.role}">FIRE</button></b></div><p class="muted small">${grant}</p>`;
      }
      return `<div class="kv"><span>${r.role} · empty</span><b><button class="btn" data-a="findCand" data-x="${kind}|${id}|${r.role}">FIND CANDIDATES</button></b></div>`;
    }).join('');
  };
  const hireSection = () => {
    const h = UI.hire; if (!h) return '';
    const e = h.kind === 'team' ? sportTeam(h.id) : S.co[h.id];
    if (!e) { UI.hire = null; return ''; }
    const cands = boardCandidates(e, h.role);
    if (!cands.length) return `<div class="card in"><h4>Hire ${h.role} — ${esc(e.name)}</h4><p class="muted small">No candidates left for this seat.</p><button class="btn" data-a="findCandMore" data-x="${h.kind}|${h.id}|${h.role}">FIND MORE CANDIDATES</button> <button class="btn" data-a="hireCancel">CANCEL</button></div>`;
    if (!h.candId) {
      const bar = v => `<div style="background:#e2e8f0;border-radius:6px;height:10px"><div style="width:${v}%;background:#22c55e;height:10px;border-radius:6px"></div></div>`;
      return `<div class="card in"><h4>Hire ${h.role} — ${esc(e.name)}</h4><p class="muted small">Find someone, offer a salary or salary + stock, and they accept or deny. Higher level does more and wants more.</p>
      ${cands.map(c => `<div class="card in"><b>${esc(c.name)} · Lv ${c.level}</b><div class="muted small">${esc(c.title)}</div>
        <div class="kv"><span>Leadership</span><b>${c.lead}</b></div>${bar(c.lead)}
        <div class="kv"><span>Expertise</span><b>${c.exp}</b></div>${bar(c.exp)}
        <div class="kv"><span>Loyalty</span><b>${c.loy}</b></div>${bar(c.loy)}
        <div class="kv"><span>Current salary</span><b>${fmtMoney(c.curSalary)}/yr</b></div>
        <div class="kv"><span>Their ask</span><b>${fmtMoney(c.ask)}/yr</b></div>
        <button class="btn3d orange wide" data-a="hireSelect" data-x="${h.kind}|${h.id}|${h.role}|${c.id}">OFFER TO ${esc(c.name).toUpperCase()}</button></div>`).join('')}
      <button class="btn" data-a="hireCancel">CANCEL</button></div>`;
    }
    const c = cands.find(x => x.id === h.candId);
    if (!c) { UI.hire.candId = null; return hireSection(); }
    const isTeam = h.kind === 'team';
    const gv = isTeam ? 0 : boardGrantValue(e, h.grant, h.shares);
    return `<div class="card in"><h4>Offer to ${esc(c.name)} — ${h.role}</h4><p class="muted small">Lv ${c.level} · L${c.lead} E${c.exp} Y${c.loy} · Their ask: ${fmtMoney(c.ask)}/yr. They accept at their ask, or at 85% of ask with a grant covering the gap. Below that, they decline and move on.</p>
      <div class="kv"><span>Offer salary</span><span><button class="btn small" data-a="hireStep" data-x="-10000">−</button> <b>${fmtMoney(h.salary)}/yr</b> <button class="btn small" data-a="hireStep" data-x="10000">+</button></span></div>
      ${isTeam ? '<p class="muted small">Teams pay salary only — no stock grants.</p>' : `<div class="kv"><span>Grant</span><span><button class="btn small ${h.grant === 'none' ? 'on' : ''}" data-a="hireGrant" data-x="none">None</button> <button class="btn small ${h.grant === 'option' ? 'on' : ''}" data-a="hireGrant" data-x="option">Stock option</button> <button class="btn small ${h.grant === 'rsu' ? 'on' : ''}" data-a="hireGrant" data-x="rsu">RSU</button></span></div>
      ${h.grant !== 'none' ? `<div class="kv"><span>Grant shares</span><span><button class="btn small" data-a="hireShares" data-x="-100">−</button> <b>${h.shares.toLocaleString()}</b> <button class="btn small" data-a="hireShares" data-x="100">+</button></span></div><div class="kv"><span>Grant value now</span><b>${fmtMoney(gv, true)}</b></div><p class="muted small">Grants vest over 4 years with a 1-year cliff.</p>` : ''}`}
      <button class="btn3d orange wide" data-a="offerBoard">OFFER ${fmtMoney(h.salary)}/YR${h.grant !== 'none' && !isTeam ? ` + ${h.shares.toLocaleString()} ${h.grant === 'option' ? 'OPTIONS' : 'RSUs'}` : ''}</button>
      <button class="btn" data-a="hireCancel">CANCEL</button></div>`;
  };
  const companies = Object.values(S.co).filter(c => controlled(c.a3));
  const teams = (typeof ownedSportTeams === 'function') ? ownedSportTeams() : [];
  const compCards = companies.map(c => `<div class="card in"><b>${esc(c.name)}</b><div class="muted small">${esc(cname(c.a3))} · Value ${fmtMoney(companyFairTotal(c), true)} · Rating ${c.rating.toFixed(1)} / 5</div>
    <div class="kv"><span>Board room</span><b>${(typeof boardFull === 'function' && boardFull(c)) ? 'Full' : 'Not full'}</b></div><div class="kv"><span>Board boost</span><b>+${((typeof boardBoost === 'function' ? boardBoost(c) : 0) * 100).toFixed(1)}% of weekly revenue</b></div><div class="kv"><span>Profitable weeks in a row</span><b>${c.weekProfitStreak || 0} / 2</b></div>
    ${boardRow(c, 'co', c.a3)}
    ${c.listed ? '<p class="muted small">Already public.</p>' : `<p class="muted small">IPO at today's valuation, up to 100%, minus a 7% fee. Needs a full board and 2 profitable weeks.</p><button class="btn3d orange wide" data-a="ipo" data-x="${c.a3}">IPO THIS COMPANY</button>`}</div>`).join('') || '<p class="muted small">No companies you control yet.</p>';
  const teamCards = teams.map(t => `<div class="card in"><b>${esc(t.name)}</b><div class="muted small">${esc(t.cityName)} · Value ${fmtMoney(t.value, true)} · Rating ${(t.rating5 || 3).toFixed(1)} / 5</div>
    <div class="kv"><span>Board room</span><b>${(typeof boardFull === 'function' && boardFull(t)) ? 'Full' : 'Not full'}</b></div><div class="kv"><span>Profitable weeks in a row</span><b>${t.weekStreak || 0} / 2</b></div>
    ${boardRow(t, 'team', t.id)}
    ${t.ipo ? '<p class="muted small">Already public.</p>' : '<p class="muted small">IPO in the team Finance tab, up to 100% at today\'s valuation minus a 7% fee.</p>'}</div>`).join('') || '<p class="muted small">No teams you own yet. Buy one in Sports.</p>';
  return panelShell('Offices', 'Hiring is not just a bill. Find a candidate, make an offer, and they accept or deny. Higher level members boost revenue more — and cost more.',
    `${hireSection()}<h4>Your companies</h4>${compCards}<h4>Your teams</h4>${teamCards}`);
};
PANELS.bank = () => {
  ensureStores();
  return panelShell('Bank', 'Business loans. Borrow to build, repay every week from your cash.',
    `<div class="card in"><h4>New business loan</h4><p class="muted small">Interest 6.50% a year. Weekly payment is fixed for the whole term.</p>
    <label class="muted small">LOAN AMOUNT</label><input id="loanAmt" class="search" type="number" value="1000000">
    <label class="muted small">MATURITY (months)</label><input id="loanMonths" class="search" type="number" value="36">
    <button class="btn3d orange wide" data-a="takeLoan">TAKE LOAN</button></div>
    <div class="card in"><h4>Your loans</h4>${S.loans.map(l => `<div class="kv"><span>${fmtMoney(l.amount, true)} · ${(l.rate * 100).toFixed(2)}% · ${l.months} months</span><b>${fmtMoney(l.weekly)}/week · ${l.weeksLeft} weeks left</b></div>`).join('') || '<p class="muted small">No loans outstanding.</p>'}
    <p class="muted small">Your main loan balance is in Portfolio. These business loans are separate, for stores, stadiums and buildings.</p></div>`);
};
// New Markets format: sector cards with sparkline, plus Market / Equity / M&A tabs.
PANELS.markets = () => {
  const mkt = UI.mktTab || 'market';
  const tabs = `<div class="row"><button class="btn flex ${mkt === 'market' ? 'on' : ''}" data-a="mktTab" data-x="market">${ICONS.bank} Market</button><button class="btn flex ${mkt === 'equity' ? 'on' : ''}" data-a="mktTab" data-x="equity">${ICONS.card} Equity</button><button class="btn flex ${mkt === 'ma' ? 'on' : ''}" data-a="mktTab" data-x="ma">${ICONS.merge} M&amp;A</button></div>`;
  if (mkt === 'equity') {
    // NOTE: the local must NOT be called `mine` — `const mine = mine()`
    // used to shadow the global mine() function and throw
    // "Cannot access 'mine' before initialization" (TDZ) on every open.
    const mineList = mine();
    const first = mineList[0] || Object.values(S.co).find(c => c.listed);
    return panelShell('Stock Market', 'Trade stocks, or issue new shares for a company you control.', tabs + `<div class="card in"><h4>TRADE STOCKS</h4><p class="muted small">Available cash: ${fmtMoney(S.cash, true)}</p>
    ${first ? `<div class="kv"><span><b>${esc(first.name)}</b> · ${first.sym}</span><b>${fmtMoney(first.price)}</b></div>
    <div class="row"><button class="btn small" data-a="qty" data-x="-100">−100</button><button class="btn small" data-a="qty" data-x="-10">−10</button><input id="qty" class="qty" type="number" value="100" min="1"><button class="btn small" data-a="qty" data-x="10">+10</button><button class="btn small" data-a="qty" data-x="100">+100</button><button class="btn small" data-a="qtyMax" data-x="${first.a3}">MAX</button></div>
    <div class="row"><button class="btn3d buy flex" data-a="doTrade" data-x="${first.a3}|buy">BUY</button><button class="btn3d sell flex" data-a="doTrade" data-x="${first.a3}|sell">SELL</button></div>
    <p class="muted small">Pick another stock from the Market tab first, then come back here to trade it.</p>` : '<p class="muted small">No listed companies yet.</p>'}</div>
    <div class="card in"><h4>SECONDARY OFFERING</h4><p class="muted small">Issue new shares for a company you control. Underwriting fee 3.85%.</p>
    ${mineList.map(c => `<div class="kv"><span>${esc(c.name)} · ${c.sym} · ${fmtMoney(c.price)}/share</span><b>${c.shares.toLocaleString()} shares</b></div>`).join('') || '<p class="muted small">You control no companies yet. Buy 50% of a stock to control it.</p>'}
    ${mineList.length ? `<label class="muted small">NEW SHARES (first controlled company)</label><input id="issueQty" class="qty" type="number" value="19000"><button class="btn3d orange wide" data-a="issueShares" data-x="${mineList[0].a3}">ISSUE NEW SHARES</button>` : ''}</div>`);
  }
  if (mkt === 'ma') {
    const rows = marketRows().filter(c => c.listed && !c.isExtra).slice(0, 30);
    return panelShell('Stock Market', 'Mergers and acquisitions. Offer to buy a whole company.', tabs + `<div class="list">${rows.map(c => { const cap = companyValue(c), hi = Math.max(...(c.h.d || [c.price])), lo = Math.min(...(c.h.d || [c.price])); return `<div class="card in"><div class="row between"><div><b>${esc(c.name)}</b><div class="muted small">${c.sym} · Market cap ${fmtMoney(cap, true)} · Dividend ${fmtMoney(c.price * (SECTORS[c.sector].div || 0), true)} · P/E ${c.pe.toFixed(1)}</div></div><b>${fmtMoney(c.price)}</b></div><div class="kv"><span>52-week high</span><b>${fmtMoney(hi)}</b></div><div class="kv"><span>52-week low</span><b>${fmtMoney(lo)}</b></div><button class="btn" data-a="takeover" data-x="${c.a3}|0.4">OFFER M&amp;A · +40% · ${fmtMoney(takeoverCost(c, 0.4), true)}</button></div>`; }).join('')}</div>`);
  }
  // LIVE Markets panel. NOTE: an earlier PANELS.markets definition above
  // is dead code — this later assignment overwrites it, so any fix to
  // Markets categories/rows must be made HERE, not there. That is
  // exactly how the Extras bug happened: the dead panel had Extras,
  // this live one stripped them.
  const cats = ['All', 'Watchlist', 'Owned', 'Extras', ...SECTOR_LIST.slice(0, 12)];
  const rows = marketRows();
  const shown = rows.slice(0, 120);
  return panelShell('Stock Market', `${rows.length} companies · World Index ${S.idx.v.toFixed(0)}${marketOpen() ? '' : ' · Markets closed (weekend)'}`, tabs +
    `<input id="msearch" class="search" placeholder="Search stocks, companies, countries" value="${esc(UI.q)}" autocomplete="off">
    <div class="row wrap">${cats.map(c => `<button class="chip ${UI.cat === c ? 'on' : ''}" data-a="cat" data-x="${c}">${c}</button>`).join('')}</div>
    <div class="list" id="mlist">${shown.map(c => { const ch = chgVs(c), closes = (c.h.d || []).slice(-30), cap = companyValue(c), hi = closes.length ? Math.max(...closes) : c.price, lo = closes.length ? Math.min(...closes) : c.price, key = c.stockKey || c.a3, sec = SECTORS[c.sector] || {}, pe = c.pe != null ? c.pe : sec.pe; return `<button class="srow" data-a="stock" data-x="${key}" style="flex-direction:column;align-items:stretch"><span class="row between" style="width:100%"><span class="avatar" style="background:${c.color}">${esc(c.name[0])}</span><span class="sname" style="flex:1"><b>${c.sym}</b><small>${esc(c.name)} · ${esc(cname(c.a3))}</small></span><span class="sprice"><b>${c.listed ? fmtMoney(c.price) : 'Private'}</b><small class="${upCls(ch)}">${fmtPct(ch)}</small></span>${c.isExtra ? '<span class="tagp">EXTRA</span>' : ''}</span>${lineChart(closes, { h: 50 })}<span class="row between muted small" style="width:100%"><span>Market cap ${fmtMoney(cap, true)}</span><span>Dividend ${((sec.div || 0) * 100).toFixed(1)}%</span><span>52w ${fmtMoney(lo)} - ${fmtMoney(hi)}</span><span>P/E ${pe != null ? pe.toFixed(1) : '—'}</span></span></button>`; }).join('') || (UI.cat === 'Extras' ? '<div class="card in empty">No extra businesses yet. Extra businesses list here as their own stocks once they exist.</div>' : '<div class="card in empty">Nothing here yet.</div>')}</div>`);
};
PANELS.mode = () => {
  if (S.mode === 'random') {
    return panelShell('Random World', 'Offline · Endless sandbox, generated.', '<p class="muted small">Random World is generated: random landmass, countries, cities, populations, GDPs and company/stock names, fresh each time you pick it. Your starting treasury, debt and stability are random on top of that. No rivals, no win goal, no situation cards. Online Random World PvP comes later.</p>');
  }
  if (S.mode === 'worl' && typeof worlRivals === 'function') {
    const w = ensureWorl(); const rows = worlRivals();
    return panelShell('Worl Mode', `Goal: ${w.goalText} · Twist: ${w.twist} · Shuffled continent: ${w.shuffleCont || '—'} · Years: ${w.years} · Wins: ${w.wins} · Rank: ${worlRank()} / 10`,
      `<div class="list">${rows.map((r, i) => `<div class="kv ${r.you ? 'you' : ''}"><span>${i + 1}. ${r.flag} ${esc(r.name)}${r.you ? ' (you)' : ''}</span><b>GDP ${fmtMoney(r.gdp * 1e6, true)}</b></div>`).join('')}</div><p class="muted small">Every Age Up draws a situation card after the newspaper. Answer it, or the year moves on without you.</p>`);
  }
  if (S.mode === 'domination' && typeof dominationStandings === 'function') {
    const d = ensureDomination(); const rows = dominationStandings();
    return panelShell('Domination', `You: ${d.points} points · ${dominationTerritories()} lands · Last Stand: ${d.lastStand} / 3 · Win at 1000 points, 10 lands, or last standing. War cooldown is 1 year. Your capital is protected.`,
      `<div class="list">${rows.map((r, i) => `<div class="kv ${r.you ? 'you' : ''}"><span>${i + 1}. ${r.flag} ${esc(r.name)}${r.you ? ' (you)' : ''}</span><b>${r.points} pts · ${r.territories} lands</b></div>`).join('')}</div><p class="muted small">Capture a rival's home country in a war to knock them out and earn +100 points.</p>`);
  }
  return panelShell('World', 'Offline leader mode. No rival leaderboard, no domination points. Grow your country, trade, and invade neighbours when you choose.', '<p class="muted small">Switch modes from the intro: restart the game to pick Worl Mode or Domination.</p>');
};
PANELS.help = () => {
  return panelShell('Help', '',
    `<div class="card in"><h4>How to play</h4><p>Pick a country, name your company, lease a location in one of its cities, buy stocks, and grow. Time only moves on the Age bar at the bottom, one year at a time (+ free, − needs an ad, swipe the bar right / left), vehicles keep moving while you wait, no age limit, and Vs Market is an equal-weighted algo that buys the same amount of every stock. Wars and disasters push prices down. Good events push them up. Your goals are always at the top: population, net worth, and beating the market.</p>
    <p class="muted small">Take control of a company by buying 50% of its stock, or all of it with a takeover offer. Invade a neighbour to take its company and its people. Save is automatic.</p></div>`);
};
// Every menu item, shared by the hamburger popup and the old More
// sheet. The popup is the new home for all of these now that the
// bottom bar is gone.
const MENU_ITEMS = [
  ['leader', ICONS.leader, 'Leader'], ['news', ICONS.news, 'News'], ['markets', ICONS.markets, 'Markets'],
  ['airport', ICONS.airport, 'Airport'],
  ['portfolio', ICONS.portfolio, 'Portfolio'], ['web', ICONS.website, 'Web'], ['nation', ICONS.nation, 'Nation'],
  ['military', ICONS.military, 'Military'], ['company', ICONS.company, 'My Companies'], ['estate', ICONS.house, 'My Estate'],
  ['hq', ICONS.hq, 'HQ'], ['mars', ICONS.mars, 'Mars'],
  ['goals', ICONS.goals, 'Daily goals'],
  ['progress', '🏆', 'Progress'],
  ['leaderboard', ICONS.leader, 'Leaderboard'], ['sports', ICONS.sports, 'Sports'], ['crypto', ICONS.crypto, 'Crypto'], ['bank', ICONS.bank, 'Bank'],
  ['settings', ICONS.settings, 'Settings'], ['help', ICONS.help, 'Help'],
];
function moreSheet() {
  openModal(`<h2>More</h2><div class="more-grid">${MENU_ITEMS.map(([x, ic, t]) => `<button class="more-item" data-a="${x === 'news' ? 'paper' : 'panel'}" data-x="${x}"><span class="mi">${ic}</span><span>${t}</span></button>`).join('')}</div>`, 'sheet');
}
// The menu is a centred popup, not a side bar. Sections and rows
// follow the screenshot layout: a header with ••• + More + X, then
// grouped white cards with an icon tile, a title, a subtitle and a
// chevron. Every menu item is still here, just grouped.
function openMenuPopup() {
  const TINTS = ['#ffe9e0', '#dbeafe', '#e0f0ff', '#e2f5e9', '#f3e8ff', '#ffe4ec'];
  const row = (x, ic, t, d, i) => `<button class="menu-row" data-a="${x === 'news' ? 'paper' : 'panel'}" data-x="${x}"><span class="menu-ic" style="background:${TINTS[i % TINTS.length]}">${ic}</span><span class="menu-txt"><b>${t}</b><span>${d}</span></span><span class="menu-chev">›</span></button>`;
  const group = (title, items) => `<div class="menu-sec">${title}</div><div class="menu-card">${items.map(([x, ic, t, d], i) => row(x, ic, t, d, i)).join('')}</div>`;
  const find = x => { const m = MENU_ITEMS.find(m => m[0] === x); return [m[0], m[1], m[2]]; };
  const g = (title, defs) => group(title, defs.map(([x, d]) => [...find(x), d]));
  const unread = (S.mail || []).filter(m => !m.read).length;
  openModal(`<div class="menu-pop-head"><span class="menu-dots">•••</span><h2>More</h2><button class="menu-bell" data-a="panel" data-x="inbox" aria-label="Messages">${unread ? `<span class="menu-bell-badge">${unread}</span>` : ''}${ICONS.bell}</button><button class="xbtn" data-a="closeModal" aria-label="Close menu">${IC.close}</button></div>
  <div class="menu-pop-body">
  ${g('Progress', [['leader', 'Your country and company'], ['goals', "Today's goals"], ['progress', 'Levels 1-100 and what each unlocks'], ['leaderboard', 'Global leaderboards']])}
  ${g('Your business', [['hq', 'HQ and business management'], ['markets', 'Stocks, equity and takeovers'], ['company', 'Companies you run'], ['portfolio', 'Stocks and assets you own'], ['estate', 'Buildings you own'], ['web', 'Your business websites']])}
  ${g('World', [['news', "What's happening in the world"], ['nation', 'Relations, taxes and trade'], ['military', 'Armies, navies and wars'], ['airport', 'Fly to any city'], ['mars', 'Mars']])}
  ${g('Play', [['sports', 'Teams and leagues'], ['crypto', 'Trade Bitcoin on the live price'], ['bank', 'Loans and banking'], ['settings', 'Game settings'], ['help', 'How to play']])}
  </div>`, 'menu');
}
PANELS.drawer = () => { closePanel(); openMenuPopup(); };
// ---------- date modal: Done this week? + calendar ----------
function openDateModal() {
  const e = ensureEarnings();
  const evs = calendarEvents();
  const recent = e.history.slice(0, 8);
  openModal(`<h2>DONE THIS WEEK?</h2><p>Are you done with your business this week?</p>
  <div class="row gap"><button class="btn3d wide" data-a="dateYes">YES</button><button class="btn wide" data-a="dateNo">NO</button></div>
  <button class="btn wide" data-a="ageYear" style="margin-top:10px">Advance one year instead</button>
  <h3 style="margin-top:18px">Calendar</h3>
  <div class="menu-list">${evs.map(v => `<div class="srow" style="cursor:default"><span class="avatar">🗓️</span><span class="sname"><b>${esc(v.title)}</b><span class="muted">${fmtDate(v.day)}${v.day - S.day > 0 ? ` · in ${v.day - S.day} days` : ''}</span></span></div>`).join('')}</div>
  ${recent.length ? `<h3 style="margin-top:18px">Last earnings reports</h3><div class="menu-list">${recent.map(r => `<div class="srow" style="cursor:default"><span class="avatar">📊</span><span class="sname"><b>${esc(r.name)}</b><span class="muted">${fmtDate(r.day)} · profit ${fmtMoney(r.profit, true)} · ${r.surprise >= 0 ? 'beat' : 'missed'} by ${Math.abs(Math.round(r.surprise * 100))}%${r.move ? ` · shares ${r.move >= 0 ? '+' : ''}${r.move}%` : ''}</span></span></div>`).join('')}</div>` : `<p class="muted small">No earnings reports yet — the first quarter lands 13 weeks in.</p>`}`, 'sheet');
}
// ---------- map layers sheet ----------
function openLayersModal() {
  if (!S.mapLayers) S.mapLayers = { vehicles: true, labels: true, cities: true };
  const L = S.mapLayers;
  const rows = [
    ['vehicles', ICONS.car, 'Vehicles', 'Cars, planes and boats moving on the map'],
    ['labels', ICONS.tag, 'City labels', 'Names on the map'],
    ['cities', ICONS.city, 'City dots', 'The dots for every major city on the map'],
  ];
  openModal(`<h2>Map layers</h2><p class="muted">Choose what shows on the map.</p><div class="menu-list">${rows.map(([k, ic, t, d]) => `<div class="srow" style="cursor:default"><span class="avatar">${ic}</span><span class="sname"><b>${t}</b><span class="muted">${d}</span></span><button class="btn" data-a="layerToggle" data-x="${k}">${L[k] !== false ? 'ON' : 'OFF'}</button></div>`).join('')}</div>`, 'sheet');
}
// ---------- airport departures board ----------
function depContGroup(cont) {
  if (cont === 'North America' || cont === 'South America') return 'Americas';
  if (cont === 'Europe') return 'Europe';
  if (cont === 'Asia') return 'Asia';
  if (cont === 'Africa') return 'Africa';
  return 'Oceania';
}
function openDeparturesModal() {
  const from = airportFromCity();
  const groups = ['Americas', 'Europe', 'Asia', 'Africa', 'Oceania'];
  const sel = UI.depCont || depContGroup(W.byA3[from.a3].cont);
  UI.depCont = sel;
  const dests = W.playable.filter(k => k.capital !== from.id).map(k => {
    const ct = W.cities[k.capital];
    return { ct, k, km: airportDistanceKm(from, ct), grp: depContGroup(k.cont) };
  }).filter(d => d.grp === sel).sort((a, b) => a.km - b.km).slice(0, 40);
  openModal(`<div class="dep-head"><h2>${esc(from.name)} Airport</h2><button class="xbtn" data-a="closeModal" aria-label="Close">${IC.close}</button></div>
  <p class="muted">Welcome to ${esc(from.name)} Airport. Tap a destination below to catch a flight.</p>
  <div class="row gap" style="flex-wrap:wrap">${groups.map(g => `<button class="btn${g === sel ? ' primary' : ''}" data-a="depCont" data-x="${g}">${g}</button>`).join('')}</div>
  <div class="dep-board"><div class="dep-row dep-headrow"><span>Destination</span><span>Distance (km)</span></div>
  ${dests.map(d => `<button class="dep-row" data-a="depFly" data-x="${d.ct.id}"><span>${esc(d.ct.name)} · ${esc(d.k.name)}</span><span>${d.km.toLocaleString('en-US')}</span></button>`).join('')}
  </div>`, 'dep');
}

// ---------- actions ----------
const A = {
  newGame: async () => {
    await idbDel('main'); try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    S = null; closePanel(); closePopup(); if (CityView.isOpen()) leaveCity();
    if (typeof switchWorldToReal === 'function') switchWorldToReal();
    document.body.classList.remove('in-city'); $('chud').innerHTML = ''; UI.lastCityHUD = ''; $('tut').innerHTML = ''; showInherit();
  },
  pickMode: x => { UI.mode = x; UI.pq = ''; UI.q = ''; startPick(); },
  pickCountry: x => { UI.pick.a3 = x; MapView.setPick(true, x); MapView.flyToCountry(x); renderPick(); },
  confirmCountry: () => nameCompany(),
  swatch: (x, el) => { UI.color = x; document.querySelectorAll('.sw').forEach(s => s.classList.toggle('on', s === el)); },
  beginGame: () => {
    const name = ($('cname').value || '').trim() || 'Tycoon Co.';
    S = newGame({ mode: UI.mode, home: UI.pick.a3, name, color: UI.color }); save(); enterGame(false);
  },
  introMode: x => {
    UI.introMode = x;
    // Entering Random World generates its landmass now, so the picker
    // lists generated countries; leaving it restores real Earth, so a
    // later World game can never inherit a generated map.
    if (x === 'random' && typeof switchWorldToRandom === 'function') { UI.randomSeed = Math.floor(Math.random() * 1e9); switchWorldToRandom(UI.randomSeed); }
    else if ((x === 'world' || x === 'offline') && typeof switchWorldToReal === 'function') switchWorldToReal();
    renderInheritStep();
  },
  introRandom: () => { const sel = document.getElementById('inheritCountry'); if (!sel) return; const list = W.playable; sel.value = list[Math.floor(Math.random() * list.length)].a3; sel.dispatchEvent(new Event('change')); },
  randomContinue: () => {
    const sel = document.getElementById('inheritCountry'); const a3 = sel ? sel.value : 'USA';
    const inp = document.getElementById('inheritName'); const countryName = inp ? (inp.value.trim() || W.byA3[a3].name) : W.byA3[a3].name;
    S = newGame({ mode: 'random', home: a3, leader: true, name: 'Leader', countryName }); S.randomSeed = (UI.randomSeed != null ? UI.randomSeed : (W.randomSeed != null ? W.randomSeed : null)); if (typeof applyRandomStart === 'function') applyRandomStart(); save(); enterGame(false);
  },
  worlContinue: () => {
    const sel = document.getElementById('inheritCountry'); const a3 = sel ? sel.value : 'USA';
    const inp = document.getElementById('inheritName'); const countryName = inp ? (inp.value.trim() || W.byA3[a3].name) : W.byA3[a3].name;
    S = newGame({ mode: 'worl', home: a3, leader: true, name: 'Leader', countryName }); if (typeof applyWorlStart === 'function') applyWorlStart(); save(); enterGame(false);
  },
  dominationContinue: () => {
    const sel = document.getElementById('inheritCountry'); const a3 = sel ? sel.value : 'USA';
    const inp = document.getElementById('inheritName'); const countryName = inp ? (inp.value.trim() || W.byA3[a3].name) : W.byA3[a3].name;
    S = newGame({ mode: 'domination', home: a3, leader: true, name: 'Leader', countryName }); if (typeof ensureDomination === 'function') ensureDomination(); save(); enterGame(false);
  },
  situationChoice: x => {
    const msg = (typeof applySituation === 'function') ? applySituation(+x) : 'No situation.';
    closeModal(); toast(msg, 'good'); save(); renderHUD(); if (UI.panel) renderPanel();
  },
  inheritContinue: () => {
    const sel = document.getElementById('inheritCountry'); const a3 = sel ? sel.value : 'USA';
    const inp = document.getElementById('inheritName'); const countryName = inp ? (inp.value.trim() || W.byA3[a3].name) : W.byA3[a3].name;
    S = newGame({ mode: 'infinite', home: a3, leader: true, name: 'Leader', countryName }); save(); enterGame(false);
  },
  tutNext: () => { S.tutorial++; renderTutorial(); save(); },
  tutSkip: () => { S.tutorial = -1; renderTutorial(); save(); },
  panel: x => { if (UI.panel === x && !UI.stack.length) return closePanel(); if (x === 'markets') UI.q = ''; if (x === 'web') UI.web = { view: 'home', q: '', a3: null }; openPanel(x); },
  closePanel: () => closePanel(),
  panelBack: () => { UI.stack.pop(); renderPanel(); },
  closePopup: () => closePopup(),
  vehicleCard: x => openVehicleCard(x),
  watchVehicle: x => openWatch(x),
  routeVehicle: x => openRouteSheet(x),
  infoVehicle: x => openVehicleInfo(x),
  followVehicle: x => { const vd = MapView.vehicle(x); closeModal(); if (vd) { MapView.flyToXY(vd.x, vd.y, 3); toast(`Following ${vTripId(vd)}`); } },
  vehicleCompany: x => { UI.web = { view: 'site', q: '', a3: x }; openPanel('web'); },
  closeWatch: () => closeWatch(),
  paper: () => openPaper(),
  closePaper: () => { closePaper(); if (S && S.pendingVictory) { const v = S.pendingVictory; S.pendingVictory = null; save(); openModal(`<h2>🏆 Victory!</h2><p>${esc(v)}</p><p class="muted small">Keep playing, or restart for a new run.</p><button class="btn3d orange wide" data-a="closeModal">KEEP PLAYING</button>`, 'center'); return; } if (S && S.pendingSituation && typeof WORL_SITUATIONS !== 'undefined') { const s = WORL_SITUATIONS.find(x => x.id === S.pendingSituation); if (s) openModal(`<h2>🎲 ${esc(s.title)}</h2><p>${esc(s.text)}</p>${s.choices.map((c, i) => `<button class="btn3d orange wide" data-a="situationChoice" data-x="${i}">${esc(c.label)} — ${esc(c.desc)}</button>`).join('')}`, 'center'); } },
  paperPrev: () => flipPaper(-1),
  paperNext: () => flipPaper(1),
  paperEdPrev: () => flipEdition(1),
  paperEdNext: () => flipEdition(-1),
  scrim: (x, el, e) => { if (e.target === el && (UI.modal === 'sheet' || UI.modal === 'menu')) closeModal(); },
  closeModal: () => { closeModal(); if (S && S.over) gameOver(); },
  speed: x => { S.speed = +x; renderHUD(); },
  skipMenu: () => skipMenu(),
  skip: x => doSkip(+x),
  zoom: x => MapView.zoom(+x),
  locate: () => { const cap = (W && W.byA3[S.home] && W.cities[W.byA3[S.home].capital]) ? W.cities[W.byA3[S.home].capital].name : S.home; MapView.home(); toast(`Going home to ${cap}`); },
  more: () => { if (UI.modal === 'menu') closeModal(); else openMenuPopup(); },
  drawer: () => { if (UI.modal === 'menu') closeModal(); else openMenuPopup(); },
  createBusiness: () => {
    closeModal(); closePanel();
    if (CityView.isOpen()) leaveCity();
    UI.placing = true; renderHUD();
    toast(!S.placed || !S.placed.length ? 'Where do you want it? Tap anywhere on the map — first business free.' : 'Where do you want it? Tap anywhere on the map.', 'good');
  },
  advisorTax: x => { const cs = country(S.home); cs.tax = x === 'up' ? Math.min(0.5, cs.tax + 0.05) : Math.max(0.05, cs.tax - 0.05); save(); renderPanel(); toast(`Corporate tax now ${Math.round(cs.tax * 100)}%.`, 'good'); },
  cancelPlace: () => { UI.placing = false; renderHUD(); toast('Placement cancelled.'); },
  dateModal: () => openDateModal(),
  dateYes: () => { closeModal(); A.ageWeek(); },
  dateNo: () => closeModal(),
  ageYear: () => { closeModal(); A.ageUp(); },
  layers: () => openLayersModal(),
  layerToggle: x => { if (!S.mapLayers) S.mapLayers = { vehicles: true, labels: true, cities: true }; S.mapLayers[x] = S.mapLayers[x] === false; save(); openLayersModal(); },
  departures: () => openDeparturesModal(),
  depCont: x => { UI.depCont = x; openDeparturesModal(); },
  depFly: x => { closeModal(); try { airportFly(+x); } catch (e) { toast('Could not fly there.', 'bad'); } save(); renderHUD(); },
  marsExpand: () => { const err = marsExpand(S.home); if (err) return toast(err, 'bad'); save(); renderPanel(); toast('Mine expanded.', 'good'); },
  marsTravel: () => { closePanel(); closeModal(); CityView.openMars(); document.body.classList.add('in-city'); renderCityHUD(); toast('Welcome to Mars.', 'good'); },
  marsBuyMine: x => { const err = marsBuySite(S.home, +x); if (err) return toast(err, 'bad'); closePopup(); CityView.refresh(); renderCityHUD(); toast('Mine bought. Income arrives every week.', 'good'); save(); refreshAll(); },
  marsSellMine: x => { const err = marsSellSite(S.home, +x); if (err) return toast(err, 'bad'); closePopup(); CityView.refresh(); renderCityHUD(); toast('Mine sold.', 'good'); save(); refreshAll(); },
  casinoTab: x => { UI.casinoTab = x; renderPanel(); },
  casinoBet: x => { const err = casinoSetBet(x); if (err) return toast(err, 'bad'); renderPanel(); },
  casinoSlots: () => { const err = casinoSlots(); if (err) return toast(err, 'bad'); save(); renderPanel(); renderHUD(); },
  casinoBJDeal: () => { const err = casinoBJDeal(); if (err) return toast(err, 'bad'); save(); renderPanel(); renderHUD(); },
  casinoBJHit: () => { const err = casinoBJHit(); if (err) return toast(err, 'bad'); save(); renderPanel(); renderHUD(); },
  casinoBJStand: () => { const err = casinoBJStand(); if (err) return toast(err, 'bad'); save(); renderPanel(); renderHUD(); },
  casinoRoulette: x => { const err = casinoRoulette(x); if (err) return toast(err, 'bad'); save(); renderPanel(); renderHUD(); },
  casinoRouletteNumber: () => { const n = $('rouletteNum') ? $('rouletteNum').value : ''; const err = casinoRoulette('number', n); if (err) return toast(err, 'bad'); save(); renderPanel(); renderHUD(); },
  casinoBuild: () => { const el = $('casinoCity'); if (!el) return toast('Pick a city first.', 'bad'); const err = casinoBuild(+el.value); if (err) return toast(err, 'bad'); save(); renderPanel(); renderHUD(); toast('Casino opened.', 'good'); },
  casinoSell: x => { const err = casinoSell(x); if (err) return toast(err, 'bad'); save(); renderPanel(); renderHUD(); toast('Casino sold.', 'good'); },
  cryptoRefresh: () => { UI.cryptoAutoAt = 0; renderPanel(); },
  cryptoSettle: () => { cryptoSettleDue().then(r => { if (r.unavailable) toast('Price unavailable — bets stay open.', 'bad'); else if (r.settled) toast(`Settled ${r.settled}: ${r.won || 0} won, ${r.lost || 0} lost.`, 'good'); save(); if (UI.panel === 'crypto') renderPanelUnlessTyping(); }).catch(() => {}); },
  cryptoTarget: x => { const cr = ensureCrypto(); if (cr.lastPrice) { UI.cryptoTargetVal = String(Math.round(cr.lastPrice * (1 + (+x) / 100))); UI.cryptoTargetEdited = true; renderPanel(); } else toast('Fetch a price first.', 'bad'); },
  cryptoPlace: x => {
    // Prefer controlled UI state over the live DOM inputs: if a
    // re-render replaced the inputs mid-click, the DOM values may be
    // stale or missing, but the state the player actually typed survives.
    // A validation failure keeps the attempted values in state (and
    // shows a toast) instead of silently doing nothing.
    const domT = $('cryptoTarget') ? $('cryptoTarget').value : '';
    const domW = $('cryptoWindow') ? $('cryptoWindow').value : '';
    const domS = $('cryptoStake') ? $('cryptoStake').value : '';
    const t = (UI.cryptoTargetEdited && UI.cryptoTargetVal != null && UI.cryptoTargetVal !== '') ? +UI.cryptoTargetVal : +domT;
    const w = UI.cryptoWindowVal != null ? +UI.cryptoWindowVal : +domW;
    const s = (UI.cryptoStakeVal != null && UI.cryptoStakeVal !== '') ? +UI.cryptoStakeVal : +domS;
    const err = cryptoPlaceBet(x, t, w, s);
    if (err) { if (domS !== '') UI.cryptoStakeVal = domS; if (domT !== '') { UI.cryptoTargetVal = domT; UI.cryptoTargetEdited = true; } if (domW !== '') UI.cryptoWindowVal = +domW; return toast(err, 'bad'); }
    UI.cryptoStakeVal = String(s); save(); renderPanel(); renderHUD(); toast('Bet placed.', 'good');
  },
  cat: x => { UI.cat = x; UI.q = ''; renderPanel(); },
  starFilter: () => { UI.starOnly = !UI.starOnly; renderPanel(); },
  star: (x, el, e) => {
    e.stopPropagation();
    if (S.watch.includes(x)) S.watch = S.watch.filter(a => a !== x); else S.watch.push(x);
    save(); renderPanel(); renderHUD();
  },
  range: x => { UI.range = x; renderPanel(); },
  tradeRange: x => { UI.tradeRange = x; renderPanel(); },
  stock: x => {
    closePopup(); if (CityView.isOpen()) leaveCity();
    // Capture the Markets scroll position before leaving it, so a back
    // navigation from the stock panel can restore it (see renderPanel).
    if (UI.panel === 'markets' && typeof document !== 'undefined' && document.querySelector) {
      const be = document.querySelector('#panel .panel-body');
      UI.marketsScroll = be ? be.scrollTop : 0;
    }
    if (S.extra && S.extra[x]) { UI.panel = 'extraStock'; UI.stack = [{ id: x }]; }
    else { UI.panel = 'stock'; UI.stack = [{ a3: x }]; }
    renderPanel(); renderHUD();
  },
  flyCity: x => { closePanel(); MapView.flyToCity(+x); onCityTap(+x); },
  flyCountry: x => { closePanel(); MapView.flyToCountry(x); },
  qty: x => { const q = $('qty'); if (q) q.value = Math.max(1, (+q.value || 0) + +x); },
  qtyMax: x => {
    const q = $('qty'); if (!q) return;
    const c = S.co[x]; if (c) { q.value = Math.max(1, Math.floor(S.cash / c.price)); return; }
    const b = S.extra && S.extra[x]; if (b) q.value = Math.max(1, Math.floor(S.cash / b.price));
  },
  doTrade: x => {
    const [a3, side] = x.split('|'); const n = +($('qty') ? $('qty').value : 0);
    const err = trade(a3, side, n);
    if (err) return toast(err, 'bad');
    closeModal(); const lt = S.lastTrade && S.lastTrade.a3 === a3 ? ` · Realised ${fmtMoney(S.lastTrade.pnl, true)}` : ''; toast(`${side[0].toUpperCase() + side.slice(1)} ${n.toLocaleString()} ${S.co[a3].sym}${lt}`, 'good'); tutCheck(); save(); refreshAll();
  },
  doTradeExtra: x => {
    const [id, side] = x.split('|'); const n = +($('qty') ? $('qty').value : 0);
    const err = tradeExtra(id, side, n);
    if (err) return toast(err, 'bad');
    const b = S.extra[id]; toast(`${side[0].toUpperCase() + side.slice(1)} ${n.toLocaleString()} ${b.sym}`, 'good'); save(); refreshAll();
  },
  research: x => act(() => research(x), 'Research done'),
  takeover: x => {
    const [a3, p] = x.split('|');
    act(() => takeover(a3, +p), 'Takeover complete! You now own it outright.');
  },
  mktTab: x => { UI.mktTab = x; renderPanel(); },
  issueShares: x => {
    const c = S.co[x]; if (!c) return toast('Company not found', 'bad');
    const qty = Math.floor(+($('issueQty') ? $('issueQty').value : 0)); if (!qty || qty <= 0) return toast('Enter a share count', 'bad');
    const price = c.price, proceeds = qty * price, fee = Math.round(proceeds * 0.0385), raised = proceeds - fee;
    c.shares += qty; c.price = Math.max(0.01, c.price * 0.97); S.cash += raised;
    news('Market', `${c.name} issued ${qty.toLocaleString()} new shares at ${fmtMoney(price)}. Raised ${fmtMoney(raised, true)} after ${fmtMoney(fee, true)} fees.`, x);
    toast(`Issued ${qty.toLocaleString()} shares, raised ${fmtMoney(raised, true)}`, 'good'); save(); renderPanel();
  },
  sportLeague: x => { ensureSports(); S.sports.tab = x; UI.stack = []; renderPanel(); },
  sportTeam: x => { pushPanel(x); },
  sportTab: x => { UI.sportTab = x; renderPanel(); },
  sportFin: x => { UI.sportFin = x; renderPanel(); },
  buyTeam: x => act(() => buySportTeam(x), 'Team bought!'),
  stadiumUp: x => act(() => upgradeStadium(x), 'Stadium upgraded'),
  sportRename: x => { const inp = document.getElementById('sportName'); act(() => renameSportTeam(x, inp ? inp.value : ''), 'Team renamed'); },
  sportLogo: x => { const [id, logo] = x.split('|'); act(() => setSportLogo(id, logo, null), 'Logo changed'); },
  sportColor: x => { const [id, col] = x.split('|'); act(() => setSportLogo(id, null, col), 'Colour changed'); },
  signFA: x => { const [tid, pid] = x.split('|'); act(() => signFreeAgent(tid, pid), 'Player signed!'); },
  draftPick: x => { const [tid, pid] = x.split('|'); act(() => draftSportPlayer(tid, pid), 'Draft pick signed!'); },
  tradeOut: x => { UI.tradeOut = x; renderPanel(); },
  tradeIn: x => { const [tid, pid] = x.split('|'); UI.tradeTarget = tid; UI.tradeIn = pid; renderPanel(); },
  doSportTrade: x => { const cash = Math.floor(+($('tradeCash') ? $('tradeCash').value : 0)); act(() => tradeSportPlayer(x, UI.tradeOut, UI.tradeTarget, UI.tradeIn, cash), 'Trade done!'); UI.tradeOut = null; UI.tradeIn = null; },
  hireBoard: x => { const [kind, id, role] = x.split('|'); const e = kind === 'team' ? sportTeam(id) : S.co[id]; boardCandidates(e, role); UI.hire = { kind, id, role, candId: null, salary: 0, grant: 'none', shares: 0 }; renderPanel(); },
  findCand: x => { const [kind, id, role] = x.split('|'); const e = kind === 'team' ? sportTeam(id) : S.co[id]; boardCandidates(e, role); UI.hire = { kind, id, role, candId: null, salary: 0, grant: 'none', shares: 0 }; renderPanel(); },
  findCandMore: x => { const [kind, id, role] = x.split('|'); const e = kind === 'team' ? sportTeam(id) : S.co[id]; if (e.candPool) delete e.candPool[role]; boardCandidates(e, role); UI.hire = { kind, id, role, candId: null, salary: 0, grant: 'none', shares: 0 }; renderPanel(); },
  hireSelect: x => { const [kind, id, role, candId] = x.split('|'); const e = kind === 'team' ? sportTeam(id) : S.co[id]; const c = boardCandidates(e, role).find(y => y.id === candId); if (!c) return toast('Candidate not found.', 'bad'); UI.hire = { kind, id, role, candId, salary: c.ask, grant: 'none', shares: 0 }; renderPanel(); },
  hireStep: x => { if (!UI.hire) return; UI.hire.salary = Math.max(1000, UI.hire.salary + (+x)); renderPanel(); },
  hireGrant: x => { if (!UI.hire) return; UI.hire.grant = x; if (x === 'none') UI.hire.shares = 0; else if (!UI.hire.shares) UI.hire.shares = 1000; renderPanel(); },
  hireShares: x => { if (!UI.hire) return; UI.hire.shares = Math.max(0, UI.hire.shares + (+x)); renderPanel(); },
  hireCancel: () => { UI.hire = null; renderPanel(); },
  offerBoard: () => {
    const h = UI.hire; if (!h) return;
    const e = h.kind === 'team' ? sportTeam(h.id) : S.co[h.id];
    const c = boardCandidates(e, h.role).find(y => y.id === h.candId);
    const err = offerBoard(e, h.role, c, h.salary, h.kind === 'team' ? 'none' : h.grant, h.kind === 'team' ? 0 : h.shares);
    UI.hire = null;
    if (err) toast(err, 'bad'); else toast(`${c.name} accepted as ${h.role}!`, 'good');
    save(); renderPanel();
  },
  fireBoard: x => { const [kind, id, role] = x.split('|'); const e = kind === 'team' ? sportTeam(id) : S.co[id]; act(() => fireBoard(e, role), `${role} seat cleared.`); },
  ageWeek: () => { try { stepWeek(); save(); renderHUD(); if (UI.panel) renderPanel(); toast('Advanced one week.', 'good'); } catch (e) { toast('Could not advance a week.', 'bad'); } },
  sportIpo: x => { const el = document.getElementById('ipoPctTeam'); const pct = el ? clamp(parseFloat(el.value) || 100, 1, 100) / 100 : 1; act(() => sportIpo(x, pct), 'Team is now public!'); },
  ipoBuy: x => { const qty = Math.floor(+($('ipoQty') ? $('ipoQty').value : 0)); act(() => sportTradeShares(x, 'buy', qty), 'Shares bought'); },
  ipoSell: x => { const qty = Math.floor(+($('ipoQty') ? $('ipoQty').value : 0)); act(() => sportTradeShares(x, 'sell', qty), 'Shares sold'); },
  storeOpen: x => { pushPanel(x); },
  storeTab: x => { UI.storeTab = x; renderPanel(); },
  storePrice: x => { const [id, idx, d] = x.split('|'); act(() => setStorePrice(id, +idx, (storeById(id).products[+idx].price + +d)), 'Price changed'); },
  storeDel: x => { const [id, k] = x.split('|'); act(() => toggleStoreDelegation(id, k), 'Delegation changed'); },
  mgrSalary: x => { const [id, d] = x.split('|'); act(() => adjustManagerSalary(id, +d), 'Manager salary changed'); },
  fireMgr: x => act(() => fireStoreManager(x), 'New manager hired'),
  progressSel: x => { UI.progressSel = +x; renderPanel(); },
  storeDev: x => { const [id, idx] = x.split('|'); act(() => developProduct(id, +idx), 'Product developed'); },
  storeUp: x => act(() => upgradeStore(x), 'Store upgraded'),
  storeIconOpen: x => { openModal(`<h2>Pick a logo</h2><p class="muted">Tap an icon for this business.</p><div class="row wrap">${STORE_ICONS.map(ic => `<button class="btn" style="font-size:22px;padding:8px 10px" data-a="storeIconDo" data-x="${x}|${ic}">${ic}</button>`).join('')}</div>`, 'sheet'); },
  storeIconDo: x => { const [id, ic] = x.split('|'); act(() => setStoreIcon(id, ic), 'Logo changed'); closeModal(); },
  storeCamp: x => { const [id, cid] = x.split('|'); act(() => startStoreCampaign(id, cid), 'Campaign started'); },
  storeRename: x => { const inp = document.getElementById('storeName'); act(() => renameStore(x, inp ? inp.value : ''), 'Store renamed'); },
  closeStore: x => { act(() => closeStore(x), 'Store closed'); closePanel(); openPanel('stores'); },
  takeLoan: () => { const amt = Math.floor(+($('loanAmt') ? $('loanAmt').value : 0)), mo = Math.floor(+($('loanMonths') ? $('loanMonths').value : 36)); act(() => takeLoan(amt, mo), 'Loan taken'); },
  buildStoreOpen: x => { const [cityId, lotT] = x.split('|'); UI.buildLot = { cityId: +cityId, lotT: +lotT };
    const lot = (cityLots(+cityId) || []).find(l => l.t === +lotT) || {};
    const city = W.cities[+cityId] || {};
    const country = city.a3 ? W.byA3[city.a3] : null;
    const sectors = country && typeof sectorPoolForCountry === 'function' ? sectorPoolForCountry(country) : [];
    const rent = lot.rent || 2000, deposit = Math.round(rent * 10), lv = progressLevel();
    const cards = Object.entries(STORE_TYPES).map(([k, d]) => {
      const avgTicket = d.products.reduce((a, p) => a + p.price, 0) / d.products.length;
      const avgMargin = d.products.reduce((a, p) => a + (p.price - p.cost) / p.price, 0) / d.products.length;
      const total = deposit + (d.buildout || 25000);
      return `<div class="card in"><div class="row between"><b>${d.icon} ${d.name}</b><button class="btn3d orange" data-a="buildStoreDo" data-x="${k}">BUILD · ${fmtMoney(total, true)}</button></div>
      <p class="muted small">${esc(d.desc)}</p>
      <div class="kv"><span>Products</span><b>${d.products.map(p => esc(p.name)).join(', ')}</b></div>
      <div class="kv"><span>Avg ticket</span><b>${fmtMoney(avgTicket)}</b></div><div class="kv"><span>Avg margin</span><b>${Math.round(avgMargin * 100)}%</b></div>
      <div class="kv"><span>Fit-out</span><b>${fmtMoney(d.buildout || 25000, true)}</b></div><div class="kv"><span>Deposit + fit-out</span><b>${fmtMoney(total, true)}</b></div></div>`;
    }).join('');
    openModal(`<h2>Build a store</h2><p class="muted">${esc(city.name || '')} · Population ${(city.pop || 0).toLocaleString()} · Foot traffic ${(lot.traffic || 0).toLocaleString()}/week · Rent ${fmtMoney(rent)}/week · Deposit ${fmtMoney(deposit, true)} upfront. Bigger cities mean more customers — pick the business that fits this spot, then develop it: a store alone never makes trillions.</p>
    ${sectors.length ? `<p class="muted small"><b>Sectors available in ${esc(country.name)}:</b> ${sectors.map(esc).join(' · ')}. Every country gets its own set. Advanced sectors like semiconductors and robotics will need research, time and money later — for now no business type is locked, and profit decides: a coffee shop can out-earn a fancy business early.</p>` : ''}
    <p class="muted small">Your Progress: Lv ${lv} · Manager level available: Lv ${maxManagerLevel()}</p><div class="list">${cards}</div>`, 'sheet'); },
  buildStoreDo: x => { const lot = UI.buildLot; if (!lot) return toast('Pick a FOR LEASE pin first', 'bad'); const err = buildStore(lot.cityId, lot.lotT, x); if (err) return toast(err, 'bad'); closeModal(); closePopup(); CityView.refresh(); renderCityHUD(); toast('Store opened! Results arrive every week.', 'good'); save(); refreshAll(); },
  openStadium: x => { closePopup(); if (CityView.isOpen()) leaveCity(); ensureSports(); S.sports.tab = sportTeam(x).league; openPanel('sports'); UI.stack = [x]; renderPanel(); },
  webCo: x => { UI.web = { view: 'site', q: '', a3: x }; openPanel('web'); },
  siteMaker: x => { UI.siteA3 = x; openPanel('site'); },
  siteDim: x => { const [a3, dim, val] = x.split('|'); act(() => setSitePending(a3, dim, val), 'Change queued for next week'); renderPanel(); },
  capUp: x => act(() => upgradeCapital(x), 'District upgraded'),
  capTheme: x => { ensureCapital().theme = x; renderPanel(); },
  capRename: () => { const v = document.getElementById('capName'); if (v && v.value.trim()) { ensureCapital().name = v.value.trim(); applyCapitalName(); toast('Capital renamed', 'good'); renderPanel(); } },
  capMotto: () => { const v = document.getElementById('capMotto'); if (v) { ensureCapital().motto = v.value.trim(); toast('Motto saved', 'good'); renderPanel(); } },
  airportCont: x => { UI.airport = { cont: x, a3: null }; renderPanel(); },
  airportCountry: x => { UI.airport = { cont: UI.airport.cont, a3: x }; renderPanel(); },
  airportBack: () => { UI.airport = { cont: null, a3: null }; renderPanel(); },
  airportBack2: () => { UI.airport = { cont: UI.airport.cont, a3: null }; renderPanel(); },
  airportFly: x => { act(() => airportFly(+x), null); },
  webSite: x => { UI.web = { view: 'site', q: UI.web.q, a3: x }; renderPanel(); },
  webView: x => {
    if (x === 'mine') UI.web = { view: 'site', q: '', a3: S.home };
    else UI.web = { view: x, q: UI.web.q, a3: null };
    renderPanel();
  },
  webBack: () => { UI.web = { view: 'search', q: UI.web.q, a3: null }; renderPanel(); },
  webHome: () => { UI.web = { view: 'home', q: '', a3: null }; renderPanel(); },
  webTier: x => act(() => buyWebTier(x), 'Website upgraded'),
  webAd: x => { const [a3, id] = x.split('|'); act(() => toggleAd(a3, id)); },
  webAddon: x => { const [a3, id] = x.split('|'); act(() => buyAddon(a3, id), 'Add-on bought'); },
  acceptOffer: x => act(() => acceptOffer(x), 'Offer accepted'),
  project: x => act(() => fundProject(x), 'Project funded'),
  diplomacy: x => act(() => diplomacy(x), 'Relations improved'),
  warPlan: x => { const ap0 = approachList(x).find(a => a.ok); UI.warPlan = { target: x, army: 100, navy: 100, air: 100, approach: ap0 ? ap0.id : 'land', approachBonus: ap0 ? ap0.bonus : 0, research: false }; closePopup(); if (CityView.isOpen()) leaveCity(); openPanel('warplan'); },
  warApproach: x => { const [target, id] = x.split('|'); const ap = approachList(target).find(a => a.id === id); if (!ap || !ap.ok) return toast(ap ? ap.why : 'Approach not available', 'bad'); UI.warPlan.approach = id; UI.warPlan.approachBonus = ap.bonus; renderPanel(); },
  warCommit: x => { const [branch, delta] = x.split('|'); UI.warPlan[branch] = clamp(UI.warPlan[branch] + (+delta), 0, 100); renderPanel(); },
  warResearch: () => { const e = researchWar(UI.warPlan); if (e) toast(e, 'bad'); else toast('War research done: +15% attack power for this attack', 'good'); save(); renderPanel(); },
  warSell: () => { const before = S.cash; const e = sellForWar(); if (e) toast(e, 'bad'); else toast(`Sold stock for ${fmtMoney(S.cash - before, true)} war funds`, 'good'); save(); renderPanel(); },
  warSubmit: () => { const r = beginWar(UI.warPlan); if (r.err) return toast(r.err, 'bad'); closePanel(); if (r.outcome === 'taunt') openPanel('wartaunt'); else if (r.outcome === 'ongoing') openPanel('war'); else openPanel('warresult'); save(); },
  warFight: () => { const plan = UI.pendingWarPlan; if (!plan) return toast('Pick a country to invade first.', 'bad'); UI.warBattle = makeBattle({ size: (S.settings && S.settings.battleSize) || '6x6', mode: 'war', target: plan.target, plan, enemyFunds: country(plan.target).treasury || BATTLE_STANDALONE_FUND }); UI.warBattle.lastTick = Date.now(); openPanel('warbattle'); },
  warBattleTile: (x) => { const b = UI.warBattle; if (!b) return; const idx = +x; const t = b.tiles[idx]; if (!t) return; let err = null; if (b.weapon) { if (t.owner === 'enemy') err = battleWeapon(b, b.weapon, idx); b.weapon = null; if (err) return toast(err, 'bad'); } else if (t.owner === 'player') { b.selected = idx; } else if (battleAdjacent(b, b.selected, idx)) { err = battleMove(b, b.selected, idx, b.tiles[b.selected].units); if (err) return toast(err, 'bad'); } renderPanel(); },
  warBattleTool: (x) => { const b = UI.warBattle; if (!b) return; const item = BATTLE_ITEM_BY_ID[x]; if (!item) return; if (item.kind === 'weapon') { b.weapon = item.id; return renderPanel(); } const err = battleBuy(b, item.id, b.selected); if (err) return toast(err, 'bad'); renderPanel(); },
  warBattleClaim: () => { const b = UI.warBattle, plan = UI.pendingWarPlan; if (!b || !plan) return; b.resolved = true; if (b.status === 'won') warBattleWin(plan); else startOngoingWar(plan); UI.warBattle = null; closePanel(); openPanel(b.status === 'won' ? 'warresult' : 'war'); save(); },
  warBattleLeave: () => { const plan = UI.pendingWarPlan; if (UI.warBattle) UI.warBattle.resolved = true; UI.warBattle = null; if (plan) { startOngoingWar(plan); closePanel(); openPanel('war'); save(); } else closePanel(); },
  buyBase: () => act(() => buyBase(), 'Military base built'),
  milUp: x => act(() => upgradeMilitary(x), 'Military upgraded'),
  fleetUp: x => act(() => upgradeFleet(x), 'Fleet upgraded'),
  fleetSell: x => act(() => sellFleet(x), 'Fleet level sold'),
  borrow: () => act(() => borrow(Math.min(maxLoan(), Math.max(50000, maxLoan() / 4))), 'Loan taken'),
  repay: () => act(() => repay(Math.min(S.loan, Math.max(0, S.cash))), 'Loan repaid'),
  ipo: x => { const el = document.getElementById('ipoPct'); const pct = el ? clamp(parseFloat(el.value) || 100, 1, 100) / 100 : 1; act(() => goPublic(x, pct), 'IPO complete!'); },
  closeLoc: x => {
    const [a3, id] = x.split('|');
    act(() => { closeLoc(S.co[a3], id); return null; }, 'Location closed');
    closePopup(); CityView.refresh();
  },
  enterCity: x => { closeModal(); enterCity(+x); },
  leaveCity: () => leaveCity(),
  cityFilter: () => {
    const f = ['all', 'lease', 'sale', 'mine'];
    CityView.setFilter(f[(f.indexOf(CityView.filter) + 1) % f.length]); renderCityHUD();
  },
  lease: x => {
    const [t, i] = x.split('|').map(Number);
    const city = CityView.city;
    const err = leaseLot(city.a3, t, i, city.id);
    if (err) return toast(err, 'bad');
    closeModal(); closePopup(); CityView.refresh(); renderCityHUD(); toast('Location opened! Results arrive every week.', 'good'); tutCheck(); save(); refreshAll();
  },
  buyBld: x => {
    const err = buyBuilding(CityView.city.id, +x);
    if (err) return toast(err, 'bad');
    closeModal(); closePopup(); CityView.refresh(); renderCityHUD(); toast('Building bought. Rent arrives every week.', 'good'); save(); refreshAll();
  },
  buyAnyBld: x => {
    const err = buyAnyBuilding(CityView.city.id, +x);
    if (err) return toast(err, 'bad');
    closeModal(); closePopup(); CityView.refresh(); renderCityHUD(); toast('Building bought. Rent arrives every week.', 'good'); save(); refreshAll();
  },
  sellBld: x => { act(() => sellBuilding(x), 'Building sold'); closePopup(); CityView.refresh(); },
  renovate: x => { const e = renovate(x); if (e) { toast(e, 'bad'); return; } toast('Renovated', 'good'); save(); refreshAll(); A.propSheet(x); },
  propSheet: x => {
    const p = S.props.find(y => y.id === x); if (!p) return;
    openModal(`<div class="card in"><h3>Your building</h3><p class="muted">${esc(W.cities[p.city].name)}, ${esc(cname(W.cities[p.city].a3))}</p>
      <div class="stats3 box"><div><span>Value</span><b>${fmtMoney(p.value, true)}</b></div><div><span>Income / week</span><b>${fmtMoney(p.income, true)}</b></div><div><span>Condition</span><b>${Math.round(p.cond * 100)}%</b></div></div>
      <p class="muted small">${p.units} units · Occupancy ${Math.round(p.occ * 100)}% · Rent level ${p.rentLv.toFixed(1)}x</p>
      <div class="row"><button class="btn flex" data-a="renovate" data-x="${p.id}">RENOVATE ${fmtMoney(renoCost(p), true)}</button><button class="btn flex" data-a="sellBld" data-x="${p.id}">SELL</button></div></div>`, 'sheet');
  },
  shopBuy: x => act(() => claimShop(x), 'Claimed!'),
  ageUp: () => {
    if (UI.aging) return; UI.aging = true;
    openModal(`<div class="card in"><h3>Aging a year…</h3><p class="muted small">Simulating a full year of the world. This takes a moment.</p></div>`, 'center');
    setTimeout(() => {
      try { ageUp(); pushPaperEdition(); save(); renderHUD(); if (S.over) { gameOver(); return; } if (UI.panel) renderPanel(); if (CityView.isOpen()) renderCityHUD(); openPaper(0); }
      catch (e) { toast('Age up failed. Try again.', 'bad'); }
      finally { UI.aging = false; }
    }, 50);
  },
  ageDown: () => {
    if (!canAgeDown()) return toast('No earlier year to go back to in this session. Age up first, then age down.', 'bad');
    if (window.AD_TIMER) clearInterval(window.AD_TIMER);
    openModal(`<div class="card in"><h3>Ad required to age down</h3><p class="muted small">Age up is free. Age down needs an ad. Watch this sponsor card, then you can go back one year.</p>
      <div class="card in sponsored"><span class="tagp">SPONSORED</span><h4>☕ Skyline Coffee</h4><p class="muted small">Fuel for late-night tycoons. A fictional in-game sponsor — no real ad network is connected yet.</p></div>
      <p class="muted small" id="adCount">Ad ends in 5s…</p>
      <button class="btn3d orange wide" id="adContinue" data-a="doAgeDown" disabled>Watching ad…</button></div>`, 'sheet');
    let left = 5;
    window.AD_TIMER = setInterval(() => {
      left -= 1;
      const el = document.getElementById('adCount'), btn = document.getElementById('adContinue');
      if (!el || !btn) { clearInterval(window.AD_TIMER); return; }
      if (left <= 0) { el.textContent = 'Ad finished.'; btn.disabled = false; btn.textContent = 'Continue — go back a year'; clearInterval(window.AD_TIMER); }
      else el.textContent = `Ad ends in ${left}s…`;
    }, 1000);
  },
  doAgeDown: () => {
    if (window.AD_TIMER) clearInterval(window.AD_TIMER);
    closeModal();
    const err = ageDown();
    if (err) return toast(err, 'bad');
    save(); renderHUD(); if (UI.panel) renderPanel(); if (CityView.isOpen()) renderCityHUD();
    toast(`Went back a year — now ${yearOf(S.day)}.`, 'good');
  },
  companyExpand: x => { UI.expandedCompany = (UI.expandedCompany === x ? null : x); renderPanel(); },
  countryMarkets: x => { closePopup(); UI.q = cname(x); UI.cat = 'All'; openPanel('markets'); },
  claimDaily: () => {
    const r = dailyRewardInfo(); const e = claimDaily();
    if (e) return toast(e, 'bad');
    toast(`+${fmtMoney(r.amount, true)} daily reward`, 'good'); save(); refreshAll();
  },
  toggleMotion: () => { S.settings.motion = !S.settings.motion; renderPanel(); },
  toggleMinigames: () => { S.settings.minigames = !minigamesEnabled(); renderPanel(); },
  setBattleSize: (x) => { S.settings.battleSize = x; renderPanel(); },
  miniPanelStart: (x) => { UI.miniPanelBattle = makeBattle({ size: x, mode: 'standalone' }); UI.miniPanelBattle.lastTick = Date.now(); openPanel('minigames'); },
  miniPanelTile: (x) => { const b = UI.miniPanelBattle; if (!b) return; const idx = +x; const t = b.tiles[idx]; if (!t) return; let err = null; if (b.weapon) { if (t.owner === 'enemy') err = battleWeapon(b, b.weapon, idx); b.weapon = null; if (err) return toast(err, 'bad'); } else if (t.owner === 'player') { b.selected = idx; } else if (battleAdjacent(b, b.selected, idx)) { err = battleMove(b, b.selected, idx, b.tiles[b.selected].units); if (err) return toast(err, 'bad'); } renderPanel(); },
  miniPanelTool: (x) => { const b = UI.miniPanelBattle; if (!b) return; const item = BATTLE_ITEM_BY_ID[x]; if (!item) return; if (item.kind === 'weapon') { b.weapon = item.id; return renderPanel(); } const err = battleBuy(b, item.id, b.selected); if (err) return toast(err, 'bad'); renderPanel(); },
  miniPanelLeave: () => { UI.miniPanelBattle = null; renderPanel(); },
  miniPanelAgain: () => { const old = UI.miniPanelBattle; UI.miniPanelBattle = makeBattle({ size: old ? old.sizeId : '6x6', mode: 'standalone' }); UI.miniPanelBattle.lastTick = Date.now(); renderPanel(); },
  minigamesPlay: () => { const sel = document.getElementById('miniBoard'); const id = sel ? sel.value : '6x6'; UI.miniBattle = makeBattle({ size: id, mode: 'standalone' }); openModal(miniModalHTML(UI.miniBattle)); },
  miniTile: (x) => { const b = UI.miniBattle; if (!b) return; const idx = +x; const t = b.tiles[idx]; if (!t) return; let err = null; if (b.weapon) { if (t.owner === 'enemy') err = battleWeapon(b, b.weapon, idx); b.weapon = null; if (err) return toast(err, 'bad'); } else if (t.owner === 'player') { b.selected = idx; } else if (battleAdjacent(b, b.selected, idx)) { err = battleMove(b, b.selected, idx, b.tiles[b.selected].units); if (err) return toast(err, 'bad'); } battleTick(b, 1); battleAITurn(b); openModal(miniModalHTML(b)); },
  miniTool: (x) => { const b = UI.miniBattle; if (!b) return; const item = BATTLE_ITEM_BY_ID[x]; if (!item) return; if (item.kind === 'weapon') { b.weapon = item.id; return openModal(miniModalHTML(b)); } const err = battleBuy(b, item.id, b.selected); if (err) return toast(err, 'bad'); openModal(miniModalHTML(b)); },
  miniWait: () => { const b = UI.miniBattle; if (!b) return; battleTick(b, 5); battleAITurn(b); openModal(miniModalHTML(b)); },
  miniAgain: () => { const old = UI.miniBattle; UI.miniBattle = makeBattle({ size: old ? old.sizeId : '6x6', mode: 'standalone' }); openModal(miniModalHTML(UI.miniBattle)); },
  miniLeave: () => { UI.miniBattle = null; closeModal(); },
  exportSave: () => {
    const t = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Save copied', 'good'), () => toast('Clipboard unavailable', 'bad'));
  },
  restart: () => openModal(`<h2>Restart?</h2><p class="muted">This ends your current game.</p><button class="btn3d orange wide" data-a="newGame">RESTART</button>`, 'sheet'),
};
function onClick(e) {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  const fn = A[el.dataset.a]; if (fn) fn(el.dataset.x, el, e);
}
function onInput(e) {
  const t = e.target;
  if (t.id === 'csearch') { UI.pq = t.value; const pos = t.selectionStart; renderPick(); const n = $('csearch'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } return; }
  if (t.id === 'ssearch') { UI.sq = t.value; renderPanel(); return; }
  if (t.id === 'msearch') {
    UI.q = t.value;
    if (UI.panel === 'markets') { const l = $('mlist'); if (l) l.innerHTML = marketsListHTML(); }
    else if (UI.panel === 'search') { const pos = t.selectionStart; renderPanel(); const n = $('msearch'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
    return;
  }
  if (t.id === 'wsearch') { UI.web.q = t.value; const pos = t.selectionStart; renderPanel(); const n = $('wsearch'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } return; }
  // Crypto inputs are CONTROLLED state: the value is stored here on
  // every keystroke and the panel renders FROM it, so a price refresh
  // or frame-loop re-render can never wipe a typed stake/target.
  // Deliberately no renderPanel() here — re-rendering on input would
  // fight the keystroke that just happened.
  if (t.id === 'cryptoStake') { UI.cryptoStakeVal = t.value; return; }
  if (t.id === 'cryptoTarget') { UI.cryptoTargetVal = t.value; UI.cryptoTargetEdited = true; return; }
  const k = t.dataset.in; if (!k) return;
  if (k === 'price' || k === 'quality' || k === 'wage') {
    const c = S.co[t.dataset.x]; if (c) c.set[k] = +t.value;
    save();
  }
  if (k === 'taxCorp' || k === 'taxInc' || k === 'taxVat') {
    const cs = country(S.home); if (cs) { if (k === 'taxCorp') cs.tax = +t.value / 100; if (k === 'taxInc') cs.incTax = +t.value / 100; if (k === 'taxVat') cs.vat = +t.value / 100; }
    save();
  }
  if (k === 'vol') { S.settings.vol = +t.value; }
}
function marketsListHTML() {
  const rows = marketRows();
  return rows.slice(0, 120).map(c => {
    const ch = chgVs(c), starred = S.watch.includes(c.a3), key = c.stockKey || c.a3;
    return `<button class="srow" data-a="stock" data-x="${key}"><span class="avatar" style="background:${c.color}">${esc(c.name[0])}</span><span class="sname"><b>${c.sym}</b><small>${esc(c.name)} · ${esc(cname(c.a3))}</small></span><span class="sprice"><b>${c.listed ? fmtMoney(c.price) : 'Private'}</b><small class="${upCls(ch)}">${fmtPct(ch)}</small></span>${c.isExtra ? '<span class="tagp">EXTRA</span>' : `<span class="star-btn ${starred ? 'on' : ''}" data-a="star" data-x="${c.a3}">${starred ? '★' : '☆'}</span>`}</button>`;
  }).join('') || '<div class="card in empty">Nothing here yet.</div>';
}
function onChange(e) {
  const t = e.target;
  // Crypto window select is controlled state too, so a re-render keeps
  // the window the player picked instead of snapping back to 1 minute.
  if (t && t.id === 'cryptoWindow') { UI.cryptoWindowVal = +t.value; return; }
}
boot();
