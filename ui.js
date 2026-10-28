// Ticker Tycoon UI — rewritten for the v2 engine (S.v === 2).
// Plain JS, no framework. Original art and names only.
// Wiring note: this file uses ONLY engine functions that exist in
// data.js / sim.js / world-events.js / mapview.js / cityview.js.
'use strict';

let W = null, S = null;
const UI = { panel: null, stack: [], modal: null, phoneApp: null, phoneStack: [], inPhone: false, placing: false, hire: null, q: '', cat: 'All', starOnly: false,
  range: '1Y', tradeRange: '1Y', web: { view: 'home', q: '', a3: null }, pick: null,
  mode: 'normal', color: LOGO_COLORS[0], acc: 0, lastPanel: 0, lastDraw: 0, lastSave: 0, expandedCompany: null, companyInit: false };
const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const upCls = x => x >= 0 ? 'up' : 'down';
// Time does NOT move on its own, and there is no age limit. Time only
// moves one week at a time: tap the date at the top right and press
// YES. There is no year advance — weeks are the only step. Vehicles
// animate on the map's own requestAnimationFrame loop, independent of
// game time, so they keep moving while the player waits between weeks.
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
  if (!s.milReal && typeof applyRealMilLevels === 'function') { try { applyRealMilLevels(s); } catch (e) {} }
  if (!s.person && typeof defaultPerson === 'function') s.person = defaultPerson();
  if (!Array.isArray(s.stores)) s.stores = [];
  if (!Array.isArray(s.loans)) s.loans = [];
  if (!s.sports) s.sports = null;
  if (s.co) Object.values(s.co).forEach(c => { if (!Array.isArray(c.board)) c.board = []; if (!isFinite(c.weekProfitStreak)) c.weekProfitStreak = 0; if (!Array.isArray(c.weekNets)) c.weekNets = []; if (typeof cpuOfficeAndBoard === 'function') { const h = s.holdings && s.holdings[c.a3]; const owned = h && h.qty > 0 && h.qty >= (c.shares || 0) / 2; if (!owned) { try { cpuOfficeAndBoard(c); } catch (e) {} } } });
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
  UI.routing = null;
  UI.modal = kind || 'sheet';
  $('modal').innerHTML = `<div class="scrim ${UI.modal}" data-a="scrim"><div class="mbox ${UI.modal}" data-stop>${UI.modal === 'sheet' ? `<button class="xbtn mclose" data-a="closeModal" aria-label="Close">${IC.close}</button>` : ''}${html}</div></div>`;
}
function closeModal() { if (UI.modal === 'phone') { UI.phoneApp = null; UI.phoneStack = []; UI.panel = null; UI.stack = []; } UI.modal = null; $('modal').innerHTML = ''; }
// ---------- the phone: every app opens INSIDE it, never as a page ----------
// Phone grid taps call openPanel while the phone modal is open, so this
// is the one interception point: instead of closing the phone and
// opening a full #panel page, the app renders into the phone's own
// screen (#phoneCard). UI.phoneApp is the app on the phone screen;
// UI.phoneStack is the chain of apps opened from inside apps, so a
// back step returns to the previous app, not the map. Detail screens
// opened from anywhere else (HUD pill, map, city) still use the
// #panel page; phone apps always open inside the phone box.
function openPanel(name, args) {
  UI.routing = null;
  if (UI.modal === 'phone') {
    if (UI.phoneApp) UI.phoneStack.push({ panel: UI.phoneApp, stack: UI.stack.slice() });
    UI.phoneApp = name; UI.panel = name; UI.stack = args ? [args] : [];
    const mbox = document.querySelector('#modal .mbox.phone');
    if (mbox) mbox.innerHTML = phoneHTML();
    renderPhoneApp(); renderHUD(); return;
  }
  // Every app opens inside the phone box, even when tapped from the
  // map HUD, a city, or another panel: open the phone first, then put
  // the app on its screen. Detail screens (a stock, a company, an
  // office) are not apps and keep opening as panels.
  if (MENU_ITEMS.some(m => m[0] === name) || name === 'profile') {
    if (CityView.isOpen()) leaveCity();
    openMenuPopup();
    UI.phoneApp = name; UI.panel = name; UI.stack = args ? [args] : [];
    const mbox2 = document.querySelector('#modal .mbox.phone');
    if (mbox2) mbox2.innerHTML = phoneHTML();
    renderPhoneApp(); renderHUD(); return;
  }
  closeModal(); if (CityView.isOpen()) leaveCity();
  UI.panel = name; UI.stack = args ? [args] : []; renderPanel(); renderHUD();
}
function pushPanel(args) { UI.stack.push(args); renderPanel(); }
function phoneToGrid() {
  UI.phoneApp = null; UI.panel = null; UI.stack = []; UI.phoneStack = []; UI.mgGame = null;
  const mbox = document.querySelector('#modal .mbox.phone');
  if (mbox) mbox.innerHTML = phoneHTML();
  renderHUD();
}
function closePanel() {
  if (UI.panel === 'warbattle' && UI.warBattle && !UI.warBattle.resolved && UI.pendingWarPlan) { const plan = UI.pendingWarPlan; UI.warBattle.resolved = true; startOngoingWar(plan); save(); toast('Battle closed — the war continues as an ongoing war.', 'bad'); }
  if (UI.modal === 'phone' && UI.phoneApp) {
    if (UI.phoneStack.length) {
      const prev = UI.phoneStack.pop();
      UI.phoneApp = prev.panel; UI.panel = prev.panel; UI.stack = prev.stack;
      const mbox = document.querySelector('#modal .mbox.phone');
      if (mbox) mbox.innerHTML = phoneHTML();
      renderPhoneApp();
    } else phoneToGrid();
    renderHUD(); return;
  }
  UI.panel = null; UI.stack = []; UI.marketsScroll = null; $('panel').classList.remove('open'); renderHUD();
}
function panelShell(title, sub, body) {
  // Inside the phone there is no white header and no X: the phone's
  // own app bar (← Apps + app name) is the header, and tapping
  // outside the phone (or ← Apps) is how you leave.
  if (UI.inPhone) return `<div class="panel-body">${body}</div>`;
  const back = UI.stack.length ? `<button class="pback" data-a="panelBack">${IC.back}</button>` : '';
  return `<div class="panel-head"><div class="panel-title">${back}<div><h3>${title}</h3>${sub ? `<div class="muted small">${sub}</div>` : ''}</div></div><button class="xbtn" data-a="closePanel" aria-label="Close panel">${IC.close}</button></div><div class="panel-body">${body}</div>`;
}
// Render the app currently on the phone screen. Same HTML-equality
// skip as renderPanel: if nothing changed, the DOM (and the scroll
// position inside the phone) is left untouched by the heartbeat.
function renderPhoneApp() {
  const card = document.querySelector('#phoneCard');
  if (!card || !UI.phoneApp || !S) return;
  UI.lastPanel = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const cur = UI.stack.length ? UI.stack[UI.stack.length - 1] : null;
  if (UI.phoneApp === 'stock' && !cur) { UI.phoneApp = 'markets'; UI.panel = 'markets'; UI.stack = []; }
  if (UI.phoneApp === 'extraStock' && !cur) { UI.phoneApp = 'markets'; UI.panel = 'markets'; UI.stack = []; }
  const prevTop = card.scrollTop;
  const prevKey = UI.lastPanelKey;
  const key = UI.phoneApp + '|' + UI.stack.length + '|' + (cur ? (cur.a3 || cur) : '');
  UI.inPhone = true;
  let html = '';
  try {
    if (UI.phoneApp === 'stock' && cur) html = tradeView(cur.a3);
    else if (UI.phoneApp === 'extraStock' && cur) html = tradeViewExtra(cur);
    else if (PANELS[UI.phoneApp]) html = PANELS[UI.phoneApp]();
    else html = '<div class="card in"><p class="muted">That screen is not ready yet.</p></div>';
  } catch (e) {
    html = '<div class="card in"><h3>That screen hit a problem</h3><p class="muted small">' + esc(String(e && e.message || e)) + '</p><button class="btn3d orange wide" data-a="closePanel">CLOSE</button></div>';
  }
  UI.inPhone = false;
  if (html === UI.lastPanelHTML && key === prevKey) return;
  // Lock inner rows in place: horizontal scrollers (Tawk who row, etc.)
  // reset to 0 when the card is rewritten, which looked like the app moving.
  const rowScrolls = [];
  ['.tawk-who', '.wtrade-idx', '.cc-line', '.staff-row'].forEach(sel => {
    const el = card.querySelector(sel);
    if (el && el.scrollLeft) rowScrolls.push([sel, el.scrollLeft]);
  });
  UI.lastPanelHTML = html; UI.lastPanelKey = key;
  card.innerHTML = html;
  rowScrolls.forEach(([sel, left]) => { const el = card.querySelector(sel); if (el) el.scrollLeft = left; });
  if (key === prevKey && prevTop > 0) card.scrollTop = Math.max(0, Math.min(prevTop, card.scrollHeight - card.clientHeight));
  if (UI.phoneApp === 'markets' && UI.marketsScroll != null) {
    card.scrollTop = Math.max(0, Math.min(UI.marketsScroll, card.scrollHeight - card.clientHeight));
    UI.marketsScroll = null;
  }
}
// Re-render the open panel UNLESS the player is typing in it. An
// unguarded re-render replaces the focused input mid-edit: the typed
// value is lost and, if the player then clicks a button, the click can
// land on a replaced node and never fire. The frame loop already guards
// this way; async callbacks (price refresh, settle) must too — that
// unguarded path is what made a later Crypto stake edit not stick live.
function renderPanelUnlessTyping() {
  if (typeof document !== 'undefined' && document.querySelector && (document.querySelector('#panel input:focus') || document.querySelector('#phoneCard input:focus') || document.querySelector('#phoneCard textarea:focus'))) return;
  renderPanel();
}
function renderPanel() {
  // An app open on the phone screen re-renders there, never into #panel.
  if (UI.modal === 'phone' && UI.phoneApp) { renderPhoneApp(); return; }
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
  const youName = (S.you && S.you.name) || 'Founder';
  const youTitle = (typeof personTitle === 'function') ? personTitle() : 'Citizen';
  // View back buttons: country view gets ← World plus the country
  // panel button (panels no longer open from world taps, so this is
  // how you still reach them); region view gets ← Country.
  const viewBtns = (() => {
    if (typeof MapView === 'undefined' || !MapView.viewInfo) return '';
    const vi = MapView.viewInfo();
    if (vi.kind === 'country') {
      const name = (W.byA3[vi.a3] && W.byA3[vi.a3].name) || vi.a3;
      return `<div style="position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:10;display:flex;gap:8px"><button class="btn" data-a="exitToWorld" aria-label="Back to world">← World</button><button class="btn" data-a="countryPanel" data-x="${vi.a3}" aria-label="Open country panel">${esc(name)}</button></div>`;
    }
    if (vi.kind === 'region') {
      const name = (W.byA3[vi.a3] && W.byA3[vi.a3].name) || vi.a3;
      return `<button class="btn" style="position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:10" data-a="exitToCountry" aria-label="Back to country">← ${esc(name)}</button>`;
    }
    if (vi.kind === 'cluster') {
      const name = (W.byA3[vi.a3] && W.byA3[vi.a3].name) || vi.a3;
      return `<button class="btn" style="position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:10" data-a="exitToCountry" aria-label="Back to country">← ${esc(name)}</button>`;
    }
    if (vi.kind === 'regionMap') {
      const name = (W.byA3[vi.a3] && W.byA3[vi.a3].name) || vi.a3;
      return `<button class="btn" style="position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:10" data-a="exitToCountry" aria-label="Back to country">← ${esc(name)}</button>`;
    }
    return '';
  })();
  $('hud').innerHTML = `
  <button class="hud-pill hud-tl" data-a="panel" data-x="profile" aria-label="User profile">
    <span class="hud-avatar">${(S.you && S.you.look && typeof portraitSVG === 'function') ? portraitSVG(S.you.look, 34) : esc(youName.charAt(0).toUpperCase())}</span>
    <span class="hud-tl-text"><b>${esc(youName)}</b><small>${esc(youTitle)}</small></span>
  </button>
  <button class="hud-pill hud-money" data-a="panel" data-x="bank" aria-label="Business money"><span>💰 ${fmtMoney(S.cash)}</span></button>
  <button class="hud-pill hud-tr" data-a="dateModal" aria-label="Date">${fmtDate(S.day)}</button>
  <button class="hud-city" data-a="departures" aria-label="Airport departures"><span>${curCity ? W.byA3[curCity.a3].flag : hk.flag}</span><span>${curCity ? esc(curCity.name) : esc(cname(S.home))}</span></button>
  <button class="hud-btn hud-bl" data-a="layers" aria-label="Map layers"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg></button>
  <button class="hud-btn hud-br" data-a="drawer" aria-label="Phone">📱</button>
  ${viewBtns}
  ${UI.placing ? `<div class="place-banner card"><b>Where do you want it?</b><span>Tap anywhere on the map to place your business${!S.placed || !S.placed.length ? ' · first one free' : ' · $5,000,000'}</span><button class="btn" data-a="cancelPlace">Cancel</button></div>` : ''}`;
  if (UI.panel && !(UI.modal === 'phone' && UI.phoneApp)) $('panel').classList.add('open');
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
      html = `<div class="citytoptext"><span>\u{1F680} Mars \u00b7 Dirt and mines \u00b7 ${owned} of ${sites.length} mine sites owned</span></div><div class="cityexit"><button data-a="leaveCity">\u2715 Leave Mars</button></div>`;
    } else {
      // Live city stats: the country's population and GDP move every day
      // (countryDay), and the city takes its fixed population share of
      // both, so these are current values, not the build-time allocations.
      // Plain text, no card behind it — no white box in city view.
      const cs = (typeof country === 'function') ? country(c.a3) : S.countries[c.a3];
      const share = (typeof c.popShare === 'number') ? c.popShare : 0;
      const livePop = (cs && share) ? Math.round(cs.pop * share) : (c.popAlloc || c.pop);
      const liveGdp = (cs && share) ? cs.gdp * 1e6 * share : (c.gdpAlloc || 0);
      const growth = cs ? cs.growth : 0;
      // Bottom row, exactly the row from the world map: filters on the
      // left (same layers icon), the current city in the middle (tap it
      // for the airport, to fly somewhere else or go back to the map),
      // phone on the right. Same buttons and same placement as the map,
      // so the row looks identical inside every city.
      const layersIcon = `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>`;
      html = `<div class="citytopbar"><span>\u{1F465} ${fmtPop(livePop)} \u00b7 \u{1F4B0} ${fmtMoney(liveGdp, true)} \u00b7 \u{1F4C8} ${fmtPct(growth)}/yr</span></div>`
        + `<button class="hud-btn hud-bl" data-a="cityFilter" aria-label="Filters">${layersIcon}</button>`
        + `<button class="hud-city" data-a="departures" aria-label="Change city or leave"><span>${W.byA3[c.a3].flag}</span><span>${esc(c.name)}</span></button>`
        + `<button class="hud-btn hud-br" data-a="drawer" aria-label="Phone">\u{1F4F1}</button>`;
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
    ${vd.category === 'warship' || vd.category === 'fighter' ? `<p class="muted small">${esc(vd.owner)} military. Upgrade it from the Military screen for your home nation.</p>` : ''}
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

// ---------- newspaper: 1920s style, 4 pages, weekly edition ----------
// One edition is made every week, at the end of the week (see stepDay:
// pushPaperEdition runs with businessWeek). It is world news, not
// news about you: world politics and countries, business and markets,
// sports from every league, and the numbers behind it all.
// Only the last four editions are kept. When a new edition arrives,
// older ones rotate out on their own. Age Up still opens the latest
// edition, but it no longer creates the only editions.
let paperPage = 0, paperEdIdx = 0;
const PAPER_PAGES = ['FRONT PAGE', 'BUSINESS', 'SPORT', 'THE NUMBERS', 'YOUR YEAR', 'ADVERTISEMENTS', 'ADVERTISEMENTS'];
function ensurePapers() {
  if (!Array.isArray(S.papers)) S.papers = [];
  if (!S.papers.length) S.papers.push(makePaperEdition(yearOf(S.day)));
  return S.papers;
}
function pushPaperEdition() {
  ensurePapers();
  const ed = makePaperEdition(yearOf(S.day));
  if (S.papers[0] && S.papers[0].year === ed.year && S.papers[0].week === ed.week) S.papers[0] = ed; else S.papers.unshift(ed);
  S.papers = S.papers.slice(0, 4);
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
    year, week: Math.floor(S.day / 7), day: S.day, date: fmtDate(S.day),
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
// Live weekly markets section for the BUSINESS page. Unlike the
// edition's baked stories (yearly), this is computed at render time,
// so it always covers THIS week: the stocks the player holds, what
// each did, and why — plus the recent corporate wire.
function paperStocksSection() {
  const row = (name, sym, qty, ch, why) => `<div class="prow"><span>${esc(name)} (${esc(sym)})${qty ? ` · ${qty.toLocaleString()} shares` : ''}</span><b class="${ch >= 0 ? 'good' : 'bad'}">${ch >= 0 ? '+' : ''}${(ch * 100).toFixed(1)}% ${esc(why)}</b></div>`;
  const rows = [];
  for (const a3 of [...new Set([...Object.keys(S.holdings || {}), ...Object.keys(S.holdingsP || {})])]) {
    const h = holdPosCombined(a3), c = S.co[a3];
    if (!h || h.qty <= 0 || !c || !c.listed) continue;
    const ch = (typeof stockWeekChg === 'function') ? stockWeekChg(c, false) : 0;
    const why = (typeof stockWhy === 'function') ? stockWhy(c) : '';
    rows.push(row(c.name, c.sym, h.qty, ch, why));
  }
  for (const id of [...new Set([...Object.keys(S.holdingsX || {}), ...Object.keys(S.holdingsXP || {})])]) {
    const h = holdPosCombinedX(id), b = S.extra && S.extra[id];
    if (!h || h.qty <= 0 || !b) continue;
    const ch = (typeof stockWeekChg === 'function') ? stockWeekChg(b, true) : 0;
    const why = (typeof stockWhy === 'function') ? stockWhy(b) : '';
    rows.push(row(b.name, b.sym, h.qty, ch, why));
  }
  const corp = (S.corpNews || []).filter(n => S.day - n.d <= 30).slice(0, 8);
  return `<h3 class="psec">YOUR STOCKS THIS WEEK</h3>${rows.length ? `<div class="ptable">${rows.slice(0, 8).join('')}</div>` : '<p class="psmall">You hold no stocks yet. Buy shares in Markets, then this section tracks them every week — what moved, and why.</p>'}
  <h3 class="psec">COMPANY NEWS</h3>${corp.length ? `<div class="ptable">${corp.map(n => `<div class="prow"><span>${esc(n.text)}</span><b>${fmtDate(n.d)}</b></div>`).join('')}</div>` : '<p class="psmall">No company announcements in the last 30 days.</p>'}`;
}

function paperHTML() {
  const ed = paperEdition(), page = Math.min(paperPage, PAPER_PAGES.length - 1); paperPage = page;
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
    <div class="nindex"><b>IN TODAY'S PAPER</b><span>Business — Page 2</span><span>Sport — Page 3</span><span>The Numbers — Page 4</span><span>Your Year — Page 5</span><span>Advertisements — Pages 6–7</span>${S.papers.length > 1 ? (paperEdIdx === 0 ? '<span><button data-a="paperEdPrev">Last edition →</button></span>' : '<span><button data-a="paperEdNext">← This edition</button></span>') : ''}</div>`;
  } else if (page === 1) {
    body = `<div class="nsection"><span>BUSINESS</span><span>Page 2 · ${ed.date.toUpperCase()}</span></div>
    <div class="pfront">
      <div class="pheadline"><div class="pkicker">BUSINESS · MARKETS</div><h2>Markets ${ed.business.idxChg >= 0 ? 'rise' : 'fall'} ${fmtPct(ed.business.idxChg)}</h2></div>
      <div class="pcols">${ed.business.stories.map(paperArticle).join('')}</div>
      <div class="ptip"><b>★ THE TIP SHEET — A HINT, NOT A PROMISE</b><p>${ed.business.tip ? `Keep an eye on <b>${esc(ed.business.tip.name)} (${esc(ed.business.tip.sym)})</b> — up ${fmtPct(ed.business.tip.chg)} this year, rated ${ed.business.tip.rating.toFixed(1)} stars in ${esc(ed.business.tip.sector)}. The paper likes the look of it. Do your own homework before you buy.` : 'No tip this year.'}</p></div>
      ${paperStocksSection()}
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
  } else if (page === 5 || page === 6) {
    const all = (typeof newspaperAds === 'function') ? newspaperAds() : [];
    const slice = all.slice((page - 5) * 4, (page - 5) * 4 + 4);
    const cards = slice.map(a => { const c = S.co[a.ref]; const icon = (c && SECTORS[c.sector]) ? SECTORS[c.sector].icon : '🏢';
      return `<div class="pad-card"><span class="ad-tag">AD</span><div class="pad-ic">${icon}</div><b>${esc(a.name)}${a.sym ? ` (${esc(a.sym)})` : ''}</b><p>${esc(adLineFor(a, 'paper'))}</p></div>`; }).join('');
    const fillers = Array.from({ length: Math.max(0, 4 - slice.length) }, () => `<div class="pad-card pad-house"><span class="ad-tag">AD</span><b>YOUR AD HERE</b><p>Advertise your company in this paper.</p><button class="btn small" data-a="paperAdBuy">Buy a newspaper ad</button></div>`).join('');
    body = `<div class="nsection"><span>ADVERTISEMENTS</span><span>Page ${page + 1} · ${ed.date.toUpperCase()}</span></div>
    <div class="pfront">
      <div class="pheadline"><div class="pkicker">ADVERTISEMENTS</div><h2>Paid for by the world's businesses</h2><p class="pdrop">These pages rotate every week to the businesses paying for them.</p></div>
      <div class="pad-grid">${cards}${fillers}</div>
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
  return `<div class="paper-closebar"><button class="paper-closebtn" data-a="closePaper" aria-label="Close newspaper">✕ CLOSE</button></div>
  <div class="psheet">${body}<div class="nfoliofoot"><span>The Ticker Times</span><span>Page ${page + 1} of ${PAPER_PAGES.length} · ${PAPER_PAGES[page]}</span><span>${ed.date.toUpperCase()}</span></div></div>
  <div class="paper-flip"><button class="btn" data-a="paperPrev" ${page === 0 ? 'disabled' : ''}>← PREVIOUS</button><span class="ppage">Page ${page + 1} of ${PAPER_PAGES.length} · ${PAPER_PAGES[page]}</span><button class="btn" data-a="paperNext" ${page >= PAPER_PAGES.length - 1 ? 'disabled' : ''}>NEXT →</button></div>`;
}

function openPaper(edIdx) { closeModal(); closePanel(); if (watchKey) closeWatch(); paperEdIdx = edIdx == null ? 0 : edIdx; paperPage = 0; try { $('paper').innerHTML = paperHTML(); $('paper').classList.add('open'); } catch (e) { toast('Newspaper failed to open: ' + String(e && e.message ? e.message : e).slice(0, 120), 'bad'); } }
function closePaper() { $('paper').innerHTML = ''; $('paper').classList.remove('open'); }
function flipPaper(d) { paperPage = Math.max(0, Math.min(PAPER_PAGES.length - 1, paperPage + d)); $('paper').innerHTML = paperHTML(); }
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
  MapView.on('city', onCityTap); MapView.on('country', onCountryTap); MapView.on('vehicle', openVehicleCard); MapView.on('dot', onDotTap); MapView.on('routeDot', onRouteDotTap); MapView.on('routeCancel', onRouteCancel);
  MapView.on('region', openRegionGoPopup);
  MapView.on('place', placeBusiness); MapView.on('placed', openPlacedCard);
  MapView.on('empty', () => { if (!UI.pick) closePopup(); });
  MapView.on('frame', loop);
  CityView.init($('cityview'), onPin);
  document.addEventListener('click', onClick);
  // Swipe a newspaper page left or right to flip it, like turning a page.
  let paperX = null;
  $('paper').addEventListener('pointerdown', e => { paperX = e.clientX; });
  $('paper').addEventListener('pointerup', e => { if (paperX == null) return; const dx = e.clientX - paperX; paperX = null; if (Math.abs(dx) > 70 && $('paper').classList.contains('open')) flipPaper(dx < 0 ? 1 : -1); });
  // Swipe the phone home grid left or right to change pages, like a
  // real home screen. Listened on #modal because the grid itself is
  // re-rendered on every page change. Only the grid swipes — apps
  // scroll vertically, and a mostly-vertical drag still scrolls.
  let phoneSwipeX = null, phoneSwipeY = null;
  $('modal').addEventListener('pointerdown', e => { if (UI.modal === 'phone' && !UI.phoneApp && e.target.closest('.phone-grid')) { phoneSwipeX = e.clientX; phoneSwipeY = e.clientY; } });
  $('modal').addEventListener('pointerup', e => {
    if (phoneSwipeX == null) return;
    const dx = e.clientX - phoneSwipeX, dy = e.clientY - phoneSwipeY; phoneSwipeX = null; phoneSwipeY = null;
    if (Math.abs(dx) <= 60 || Math.abs(dx) <= Math.abs(dy)) return;
    const pages = phonePages().length;
    const next = Math.min(pages - 1, Math.max(0, (UI.phonePage || 0) + (dx < 0 ? 1 : -1)));
    if (next !== (UI.phonePage || 0)) { UI.phonePage = next; UI.dlConfirm = null; openMenuPopup(); }
  });
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
    <button class="btn" data-a="introMode" data-x="minigames" style="margin-top:4px">🎮 App Store — no country needed</button>
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
    if (!Array.isArray(UI.inheritLooks) || !UI.inheritLooks.length) { UI.inheritLooks = Array.from({length: 8}, () => randLook()); UI.inheritLookIdx = 0; }
    step.innerHTML = `<div class="inherit-line">You have inherited</div>
      <select id="inheritCountry" aria-label="Choose a country to inherit">${list.map(k => `<option value="${k.a3}" ${k.a3 === 'USA' ? 'selected' : ''}>${k.flag} ${k.a3} · ${esc(k.name)} — ${inheritDifficulty(k)}</option>`).join('')}</select>
      <div id="inheritInfo" style="color:#bbb;font-size:14px;font-weight:800">Capital: Washington, D.C. · 328M people · GDP $21.4T</div>
      <label style="color:#bbb;font-size:14px;font-weight:800;text-align:left;width:min(480px,90vw)">Country name — keep its real name, or give it your own</label>
      <input id="inheritName" class="text-in" style="width:min(480px,90vw)" maxlength="40" value="United States" autocomplete="off" aria-label="Country name">
      <div style="color:#bbb;font-size:14px;font-weight:800;text-align:left;width:min(480px,90vw)">Your person — tap to pick</div><div class="look-row" id="inheritLooksRow">${lookPickerHTML(UI.inheritLooks, UI.inheritLookIdx || 0, 'inheritLook', 'inheritLookShuffle')}</div>
      <p>You are now the leader of this country, as it is today. Tax its businesses, pay your people, trade, and grow — or invade a neighbour for the challenge.</p>
      <button class="btn3d orange wide" data-a="inheritContinue">CONTINUE</button>`;
    const sel = document.getElementById('inheritCountry'), inp = document.getElementById('inheritName'), infoEl = document.getElementById('inheritInfo');
    const updateInheritInfo = () => { const kk = W.byA3[sel.value]; if (!kk) return; if (inp) inp.value = kk.name; if (infoEl) { const cap = W.cities[kk.capital]; infoEl.textContent = `Capital: ${cap ? cap.name : '—'} · ${fmtPop(kk.pop0)} people · GDP ${fmtMoney(kk.gdp0 * 1e6, true)} · ${inheritDifficulty(kk)}`; } };
    if (sel) sel.addEventListener('change', updateInheritInfo);
    updateInheritInfo();
  } else if (UI.introMode === 'minigames') {
    step.innerHTML = `<div class="inherit-line">App Store</div>
      <p style="color:#bbb;font-size:14px;font-weight:800">The battle grid, on its own. No country, no war, no consequences — just you against the enemy, round after round.</p>
      <label style="color:#bbb;font-size:14px;font-weight:800;text-align:left;width:min(480px,90vw)">Board — size and shape</label>
      <select id="miniBoard" aria-label="Choose a battle board">${BATTLE_SIZE_OPTIONS.map(o => `<option value="${o.id}" ${o.id === '6x6' ? 'selected' : ''}>${o.label}${o.shape !== 'grid' ? ' · ' + o.shape : ''}</option>`).join('')}</select>
      <p style="color:#bbb;font-size:14px;font-weight:800">Each side starts with 50 units in a corner. Every tile you own makes 1 unit per second. Wipe out the enemy's tiles to win.</p>
      <button class="btn3d orange wide" data-a="minigamesPlay">▶ PLAY BATTLE GRID</button>`;
  } else if (UI.introMode === 'random') {
    const list = W.playable.slice().sort((a, b) => a.name.localeCompare(b.name));
    if (!Array.isArray(UI.inheritLooks) || !UI.inheritLooks.length) { UI.inheritLooks = Array.from({length: 8}, () => randLook()); UI.inheritLookIdx = 0; }
    step.innerHTML = `<div class="inherit-line">You have inherited — Random World</div>
      <select id="inheritCountry" aria-label="Choose a country to inherit">${list.map(k => `<option value="${k.a3}" ${k.a3 === 'USA' ? 'selected' : ''}>${k.flag} ${k.a3} · ${esc(k.name)} — ${inheritDifficulty(k)}</option>`).join('')}</select>
      <div id="inheritInfo" style="color:#bbb;font-size:14px;font-weight:800">Capital: Washington, D.C. · 328M people · GDP $21.4T</div>
      <label style="color:#bbb;font-size:14px;font-weight:800;text-align:left;width:min(480px,90vw)">Country name — keep its real name, or give it your own</label>
      <input id="inheritName" class="text-in" style="width:min(480px,90vw)" maxlength="40" value="United States" autocomplete="off" aria-label="Country name">
      <div style="color:#bbb;font-size:14px;font-weight:800;text-align:left;width:min(480px,90vw)">Your person — tap to pick</div><div class="look-row" id="inheritLooksRow">${lookPickerHTML(UI.inheritLooks, UI.inheritLookIdx || 0, 'inheritLook', 'inheritLookShuffle')}</div>
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
  closeModal(); UI.pick = { a3: null };

  MapView.setPick(true); MapView.world(); renderPick();
}
function renderPick() {

  const a3 = UI.pick.a3, k = a3 && W.byA3[a3];
  const q = (UI.pq || '').trim().toLowerCase();
  const list = q ? W.countries.filter(c => c.playable && c.capital != null && c.name.toLowerCase().includes(q)).slice(0, 6) : [];
  $('hud').innerHTML = `<div class="pick-top card"><b>Pick your country</b><span class="muted">Tap a country on the map, or search.</span>
    <input id="csearch" class="search" placeholder="Search countries" value="${esc(UI.pq || '')}" autocomplete="off">
    <div class="sugg">${list.map(c => `<button class="chip" data-a="pickCountry" data-x="${c.a3}">${c.flag} ${esc(c.name)}</button>`).join('')}</div></div>
  ${k ? `<div class="pick-card card">
    <div class="row start"><div class="flag-big">${k.flag}</div><div><h2>${esc(k.name)}</h2><div class="muted">${esc(k.sub)} · ${fmtPop(k.pop0)} people</div></div></div>
    <div class="stats3 box"><div><span>Population</span><b>${fmtPop(k.pop0)}</b></div><div><span>GDP per person</span><b>${fmtMoney(k.gdp0 * 1e6 / k.pop0, true)}</b></div><div><span>Neighbours</span><b>${k.nb.filter(n => W.byA3[n] && W.byA3[n].playable && W.byA3[n].capital != null).length}</b></div></div>
    <p class="muted small">${k.wealth > 1.2 ? 'Rich market: high prices and high rents.' : k.wealth > 0.6 ? 'Middle-income market: balanced costs.' : 'Developing market: cheap to start, fast population growth.'} ${k.nb.length === 0 ? 'An island: safe from land invasion.' : ''}</p>
    <button class="btn3d orange wide" data-a="confirmCountry">START IN ${esc(k.name.toUpperCase())}</button></div>` : ''}`;
}
function nameCompany() {
  const k = W.byA3[UI.pick.a3];
  UI.color = LOGO_COLORS[0];
  UI.pickLooks = Array.from({length: 8}, () => randLook()); UI.pickLookIdx = 0;
  openModal(`<h2>Name your company</h2><p class="muted">Based in ${k.flag} ${esc(k.name)}.</p>
    <input id="cname" class="text-in" maxlength="24" value="${esc(k.name.split(' ')[0])} Holdings" autocomplete="off">
    <div class="label">Colour</div><div class="swatches">${LOGO_COLORS.map((c, i) => `<button class="sw ${i === 0 ? 'on' : ''}" style="background:${c}" data-a="swatch" data-x="${c}" aria-label="colour ${i + 1}"></button>`).join('')}</div>
    <div class="label">Your person</div><div class="look-row" id="pickLooksRow">${lookPickerHTML(UI.pickLooks, 0, 'pickLook', 'pickLookShuffle')}</div>
    <button class="btn3d orange wide" data-a="beginGame">START</button>`, 'center');
}
function enterGame(returning) {
  UI.pick = null; UI.q = ''; MapView.setPick(false); closeModal(); hideInherit();
  S.speed = 1; // Vehicle speed on the map, not game time. Game time does not advance on its own; it only moves on Age.
  if (typeof ensurePerson === 'function') { try { ensurePerson(); } catch (e) {} }
  // Daily free cash grants are legacy tycoon only. Flow (employee)
  // games earn from jobs and business — no free $250k shop grant.
  const da = (S.leader || S.flow) ? 0 : autoCreditDaily(), ca = (S.leader || S.flow) ? 0 : autoCreditShopCash();
  if (da + ca > 0) setTimeout(() => toast(`+${fmtMoney(da + ca, true)} added to your cash`, 'good'), 600);
  if (typeof applyCapitalName === 'function') { try { applyCapitalName(); } catch (e) {} }
  renderHUD();
  MapView.home();
  if (returning) welcomeBack(); else S.tutorial = 0;
  renderTutorial();
}
const TUT = [
  { t: () => S.mode === 'infinite' ? 'Welcome! There is no goal in Infinite mode. Play as long as you like and press Age whenever you want.' : `Welcome! No time limit. Grow ${esc(cname(S.home))}'s population, grow your money, and beat the stock market. Press Age to move a year forward.`, btn: 'Next' },
  { t: () => `Every dot is a real city. Tap ${esc(W.cities[W.byA3[S.home].capital].name)} to open it.`, done: () => UI.popup && UI.popup.type === 'city' },
  { t: () => 'Nice! Now open Markets and buy your first stock. Every stock is a company based in a real country.', done: () => S.stats.trades > 0 },
  { t: () => 'Time only moves when you press Age, one year at a time. Vehicles keep moving while you wait. No age limit — you can live 100 years, or 1000.', btn: 'Got it' },
];
// Flow games (new standard games) start with personal money only, so
// the tutorial opens with investing, then follows the same steps. The
// final step is reworded: the game runs week by week, not year by year.
const TUT_FLOW = [
  { t: () => `Welcome! You're 18 in ${esc((typeof homeStartCityId === 'function' ? W.cities[homeStartCityId()] : W.cities[W.byA3[S.home].capital]).name)} with $5,000. Get a job first — open your profile (the person icon, top left) and tap APPLY at a business in your city.`, done: () => { try { return ensurePerson().job && ensurePerson().job.track === 'company'; } catch (e) { return false; } } },
  { t: () => 'Nice! Now open Markets and buy your first stock. Every stock is a company based in a real country.', done: () => S.stats.trades > 0 },
  { t: () => 'Your business runs week by week. When you are done, press DONE THIS WEEK to advance and collect profits. No age limit — you can play 100 years, or 1000.', btn: 'Got it' },
];
function renderTutorial() {
  const T = S && S.flow ? TUT_FLOW : TUT;
  if (!S || S.tutorial == null || S.tutorial < 0 || S.tutorial >= T.length) { $('tut').innerHTML = ''; return; }
  const s = T[S.tutorial];
  const tutText = typeof s.t === 'function' ? s.t() : s.t;
  $('tut').innerHTML = `<div class="tut card"><p>${tutText}</p><div class="row end"><button data-a="tutSkip">Skip</button>${s.btn ? `<button class="btn" data-a="tutNext">${s.btn}</button>` : '<span class="muted small">Do this to continue</span>'}</div></div>`;
}
function tutCheck() {
  const T = S && S.flow ? TUT_FLOW : TUT;
  if (S && S.tutorial >= 0 && S.tutorial < T.length && T[S.tutorial].done && T[S.tutorial].done()) { S.tutorial++; renderTutorial(); save(); }
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
  // Flow games: only the home country is open until you own an office
  // and a full board. The map still shows the world; foreign cities
  // just refuse to open, with the requirement stated.
  if (S.flow && typeof flowCanExpand === 'function' && !flowCanExpand() && W.cities[id] && W.cities[id].a3 !== S.home) { toast('Only your home country is open. Buy an office and hire a full board to look outward.', 'bad'); return; }
  MapView.select(id); UI.popup = { type: 'city', id }; renderPopup(); tutCheck();
}
function onCountryTap(a3) {
  if (UI.pick) { UI.pick.a3 = a3; MapView.setPick(true, a3); MapView.flyToCountry(a3); renderPick(); return; }
  if (!S) return;
  // World taps are Go-only: tapping a country opens just the button
  // that takes you into it. Its business panel still opens from
  // inside the country view, so no access is lost.
  openCountryGoPopup(a3);
}
function onDotTap(dot) {
  if (!S || !dot) return;
  UI.dotBuy = dot;
  const owned = S.airports && S.airports[dot.key];
  const fmt = n => '$' + Math.round(n).toLocaleString();
  let html = `<h2>${esc(dot.name)}</h2>`;
  if (owned) {
    html += `<p>You own a ${owned.type === 'hub' ? 'Hub' : 'Airport'} here.</p>`;
    html += `<button class="btn3d orange wide" data-a="routeStart" data-x="${dot.key}">DRAW ROUTE</button>`;
    (S.routes || []).filter(r => r.from === dot.key || r.to === dot.key).forEach(r => {
      const otherKey = r.from === dot.key ? r.to : r.from;
      const other = S.airports && S.airports[otherKey];
      if (!other) return;
      const kind = (owned.type === 'hub' && other.type === 'hub') ? 'People + Cargo' : 'Passengers';
      html += `<p>→ ${esc(other.name)} (${kind}) <button class="btn3d" data-a="routeRemove" data-x="${r.from}|${r.to}">Remove</button></p>`;
    });
  } else {
    html += `<p>Airport brings in people only. Hub brings in people and cargo.</p><p>Cash: ${fmt(S.cash)}</p>`;
    html += `<button class="btn3d orange wide" data-a="airportBuy" data-x="${dot.key}|airport"${S.cash < 220000 ? ' disabled' : ''}>BUY AIRPORT ${fmt(220000)}</button>`;
    html += `<button class="btn3d orange wide" data-a="airportBuy" data-x="${dot.key}|hub"${S.cash < 1250000 ? ' disabled' : ''}>BUY HUB ${fmt(1250000)}</button>`;
  }
  openModal(html, 'sheet');
}
function onRouteDotTap(dot) {
  const src = UI.routing;
  if (!src || !S.airports || !S.airports[src]) { UI.routing = null; return toast('Route cancelled.', 'bad'); }
  if (dot.key === src) return toast('Pick a different site for the destination.', 'bad');
  const a = S.airports[src], b = S.airports[dot.key];
  if (!b) return toast('Buy an airport or hub there first.', 'bad');
  if (a.type === 'airport' && b.type === 'airport') return toast("Airports don't connect directly. Draw to a hub instead.", 'bad');
  if (!S.routes) S.routes = [];
  if (S.routes.some(r => (r.from === src && r.to === dot.key) || (r.from === dot.key && r.to === src))) return toast('That route already exists.', 'bad');
  S.routes.push({ from: src, to: dot.key });
  UI.routing = null;
  save(); renderHUD();
  toast('Route added.', 'good');
}
function onRouteCancel() {
  UI.routing = null;
  toast('Route cancelled.');
}
function openCountryPanel(a3) {
  if (!S) return;
  UI.popup = { type: 'country', a3 }; renderPopup(); tutCheck();
}
function openCountryGoPopup(a3) {
  if (!S) return;
  const k = W.byA3[a3]; if (!k) return;
  openModal(`<h2>${esc(k.name)}</h2><button class="btn3d orange wide" data-a="goCountry" data-x="${a3}">GO TO ${esc(k.name.toUpperCase())}</button>`, 'sheet');
}
function openRegionGoPopup(a3, region) {
  if (!S) return;
  openModal(`<h2>${esc(region)}</h2><button class="btn3d orange wide" data-a="goRegion" data-x="${a3}|${region}">GO TO ${esc(region.toUpperCase())}</button>`, 'sheet');
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
      <div class="row"><button class="btn flex" data-a="countryMarkets" data-x="${p.a3}">BUSINESSES IN MARKETS</button></div>
      <div class="stats3 box"><div><span>Population</span><b>${fmtPop(k.pop0)}</b></div><div><span>GDP</span><b>${fmtMoney(cs.gdp * 1000000, true)}</b></div><div><span>Businesses</span><b>${biz.length}</b></div></div>
      <h5>Businesses</h5>
      ${biz.map(bc => `<div class="kv"><span>${(SECTORS[bc.sector] && SECTORS[bc.sector].icon) || ICONS.company} ${esc(bc.name)} · ${esc(bc.sector)} · ★ ${bc.rating.toFixed(1)}${bc.locs ? ' · ' + bc.locs.length + ' locations' : ' · ' + (bc.employees || 0).toLocaleString() + ' employees'}${bc.locs && bc.office ? ` · Office Lv ${bc.office.level || 1} · Board ${(typeof ensureBoard === 'function' ? ensureBoard(bc).length : 0)}/5 · Staff ${bc.locs.reduce((a, l) => a + (l.staff || 0), 0)}` : ''}</span><b>${fmtMoney(bc.locs ? companyValue(bc) : bc.value, true)}</b></div>`).join('')}
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
        ${walletPickerHTML()}<button class="btn3d orange wide" data-a="buyBld" data-x="${lot.t}">OFFER PURCHASE</button></div>`;
    } else if (p.pin.type === 'building') {
      // Any building in the city, tapped directly: buy it like a
      // property. Same rent math as a FOR SALE building.
      const lot = p.pin.lot, wkRent = Math.round(lot.units * lot.mrent * 0.622 / 4.33), roi = lot.price ? wkRent * 52 / lot.price : 0;
      $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>${buildingIcon(lot.arch)} ${esc(buildingName(lot.arch))}</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
        <p class="muted small">${esc(city.name)} · ${lot.floors} floors · ${lot.units} units · Condition ${Math.round(lot.cond * 100)}%</p>
        <div class="stats3 box"><div><span>Price</span><b>${fmtMoney(lot.price, true)}</b></div><div><span>Weekly rent income</span><b>${fmtMoney(wkRent)}</b></div><div><span>ROI</span><b>${(roi * 100).toFixed(2)}%</b></div></div>
        <div class="kv"><span>Annual rent / unit</span><b>${fmtMoney(lot.mrent * 12)}</b></div><div class="kv"><span>Foot traffic</span><b>${lot.traffic.toLocaleString()}/week</b></div>
        ${walletPickerHTML()}<button class="btn3d orange wide" data-a="buyAnyBld" data-x="${lot.t}">BUY BUILDING · ${fmtMoney(lot.price, true)}</button></div>`;
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
  if (pin.type === 'gov') {
    const g = pin.gov;
    const linkBtn = g.link === 'departures' ? `<button class="btn" data-a="departures">OPEN AIRPORT</button>` : g.link ? `<button class="btn" data-a="panel" data-x="${g.link}">OPEN</button>` : '';
    $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>${g.icon} ${esc(g.name)}</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
      <p class="muted small">${esc(g.desc)}</p>
      <p class="muted small"><b>Effect:</b> ${esc(g.effect)}</p>
      ${linkBtn}</div>`;
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
  if (typeof isCityUnlocked === 'function' && !isCityUnlocked(id)) {
    const c = W.cities[id];
    const cost = (typeof CITY_UNLOCK_COST !== 'undefined') ? CITY_UNLOCK_COST : 25000;
    openModal(`<h2>${c ? esc(c.name) : 'City'} is locked</h2><p class="muted">You start with one city unlocked. Unlock this one for ${fmtMoney(cost, true)} — personal first, then business cash (you have ${fmtMoney((typeof ensurePerson === 'function' ? ensurePerson().cash : 0), true)} personal, ${fmtMoney(S.cash, true)} business).</p><button class="btn3d orange wide" data-a="unlockCity" data-x="${id}">UNLOCK FOR ${fmtMoney(cost, true)}</button><button class="btn wide" data-a="closeModal">NOT NOW</button>`, 'sheet');
    return;
  }
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
    ${o.bankrupt ? `<p class="muted">Bankruptcy is 5 negative years — and rebirth keeps nothing, but the world keeps going.</p><button class="btn3d orange wide" data-a="rebirthPanel">REBIRTH IN ANOTHER COUNTRY</button>` : ''}
    <button class="btn3d orange wide" data-a="newGame">PLAY AGAIN</button>`, 'center');
}
let lastT = 0;
function loop(now) {
  if (!S || UI.pick || S.over) { lastT = now; return; }
  // Daily money is automatic, even if the game stays open past midnight.
  // Leaders get none here either, matching enterGame (their treasury
  // is not a daily-grant wallet — without this guard the first frame
  // paid a leader 2% of net worth, ~$21B on a $1T treasury).
  // Flow games get none either: employee games earn from jobs, not grants.
  const _da = (S.leader || S.flow) ? 0 : autoCreditDaily(), _ca = (S.leader || S.flow) ? 0 : autoCreditShopCash();
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
      if (UI.panel && now - UI.lastPanel > 1500 && !document.querySelector('#panel input:focus') && !document.querySelector('#phoneCard input:focus') && !document.querySelector('#phoneCard textarea:focus')) renderPanel();
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
  else if (UI.cat === 'Owned') list = list.filter(c => holdQty(c.a3) !== 0);
  else if (UI.cat === 'IPOs') list = list.filter(c => !c.listed);
  else if (UI.cat === 'Oil') list = list.filter(c => c.sector === 'Energy' || (typeof parentSectorOf === 'function' && parentSectorOf(c.sector) === 'Energy'));
  else if (UI.cat !== 'All' && UI.cat !== 'Indices' && UI.cat !== 'Extras') list = list.filter(c => c.sector === UI.cat || (typeof parentSectorOf === 'function' && parentSectorOf(c.sector) === UI.cat));
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
  else if (UI.cat !== 'All' && UI.cat !== 'Indices' && UI.cat !== 'Extras') extras = extras.filter(b => b.sector === UI.cat || (typeof parentSectorOf === 'function' && parentSectorOf(b.sector) === UI.cat));
  if (UI.starOnly) extras = [];
  if (q) extras = extras.filter(b => b.name.toLowerCase().includes(q) || b.sym.toLowerCase().includes(q) || cname(b.a3).toLowerCase().includes(q));
  list = list.concat(extras);
  const cap = c => c.isExtra ? c.price * c.shares : companyValue(c);
  list.sort((a, b) => cap(b) - cap(a));
  return list;
}
PANELS.markets = () => {
  const cats = ['All', 'Watchlist', 'Owned', 'Extras', ...(typeof PARENT_LIST !== 'undefined' ? PARENT_LIST : SECTOR_LIST), 'IPOs', 'Indices', 'Oil'];
  if (UI.cat === 'Indices') {
    const idxRows = (typeof PARENT_LIST !== 'undefined' ? PARENT_LIST : SECTOR_LIST).map(sec => {
      const cs = Object.values(S.co).filter(c => c.listed && (c.sector === sec || (typeof parentSectorOf === 'function' && parentSectorOf(c.sector) === sec)));
      const cap = cs.reduce((a, c) => a + companyValue(c), 0);
      const ch = cs.length ? cs.reduce((a, c) => a + chgVs(c), 0) / cs.length : 0;
      const icon = (typeof PARENT_SECTORS !== 'undefined' && PARENT_SECTORS[sec]) ? PARENT_SECTORS[sec].icon : (SECTORS[sec] ? SECTORS[sec].icon : '🏢');
      return `<div class="kv"><span>${icon} ${sec} Index</span><b>${fmtMoney(cap, true)} · <em class="${upCls(ch)}">${fmtPct(ch)}</em></b></div>`;
    }).join('');
    return panelShell('Markets', 'World Index ' + S.idx.v.toFixed(0) + ' · Vs Market is an equal-weighted algo: the same $ in every stock, so it is the average stock return, not the biggest companies', `<div class="row wrap">${cats.map(c => `<button class="chip ${UI.cat === c ? 'on' : ''}" data-a="cat" data-x="${c}">${c}</button>`).join('')}</div>
      <div class="card in">${idxRows}<div class="kv"><span>🌍 World Index</span><b>${S.idx.v.toFixed(0)} · <em class="${upCls(marketReturn())}">${fmtPct(marketReturn())}</em></b></div><div class="kv"><span>🛢️ Oil index</span><b>${S.oil.toFixed(2)}x</b></div></div>`);
  }
  const rows = marketRows();
  return panelShell('Markets', `${rows.length} companies · World Index ${S.idx.v.toFixed(0)}${marketOpen() ? '' : ' · Markets closed (weekend)'}`,
    `<input id="msearch" class="search" placeholder="Search stocks, companies, countries" value="${esc(UI.q)}" autocomplete="off">
    <button class="btn small" data-a="panel" data-x="etf">ETFs — baskets of core businesses</button>
    <button class="btn small" data-a="panel" data-x="economy">Economy — farms → factories → shops</button>
    <button class="btn small" data-a="panel" data-x="bankruptcy">Bankruptcy — 5-year rule</button>
    <div class="row wrap">${cats.map(c => `<button class="chip ${UI.cat === c ? 'on' : ''}" data-a="cat" data-x="${c}">${c}</button>`).join('')}</div>
    <button class="btn small" data-a="starFilter">${UI.starOnly ? '★ Showing starred only' : '☆ Star filter'}</button>
    <div class="list" id="mlist">${rows.slice(0, 120).map(c => {
      const held = c.isExtra ? (S.holdingsX || {})[c.id] : S.holdings[c.a3], ch = chgVs(c), starred = S.watch.includes(c.a3), key = c.stockKey || c.a3;
      return `<button class="srow" data-a="stock" data-x="${key}"><span class="avatar" style="background:${c.color}">${typeof stockLogoSVG === "function" ? stockLogoSVG(c) : esc(c.name[0])}</span><span class="sname"><b>${c.sym}</b><small>${esc(c.name)} · ${esc(cname(c.a3))}</small></span><span class="sprice"><b>${c.listed ? fmtMoney(c.price) : 'Private'}</b><small class="${upCls(ch)}">${fmtPct(ch)}</small></span>${c.isExtra ? '<span class="tagp">EXTRA</span>' : `<span class="star-btn ${starred ? 'on' : ''}" data-a="star" data-x="${c.a3}">${starred ? '★' : '☆'}</span>`}</button>`;
    }).join('') || '<div class="card in empty">Nothing here yet. Try another category, or star a stock to build your Watchlist.</div>'}</div>
    ${UI.cat === 'IPOs' ? '<p class="muted small">IPOs here means private companies you control that can go public. A company needs a full board room and 2 profitable weeks in a row to list.</p>' : ''}`);
};
// Company/Private wallet toggle, in the style of a purchase offer
// sheet: a segmented control plus the selected wallet's available
// cash. Switching updates every visible picker in place (walletSel)
// so typed quantities and drafts are never lost to a re-render.
function walletPickerHTML() {
  const w = (typeof curWallet === 'function') ? curWallet() : 'company';
  const cash = (typeof walletCash === 'function') ? walletCash(w) : S.cash;
  return `<div class="wallet-pick"><div class="wallet-seg"><button class="wallet-opt ${w === 'company' ? 'on' : ''}" data-a="walletSel" data-x="company">COMPANY</button><button class="wallet-opt ${w === 'private' ? 'on' : ''}" data-a="walletSel" data-x="private">PRIVATE</button></div><div class="wallet-cash">Available Cash: ${fmtMoney(cash)}</div></div>`;
}
// Company/Private wallet toggle, in the style of a purchase offer
// sheet: a segmented control plus the selected wallet's available
// cash. Switching updates every visible picker in place (walletSel)
// so typed quantities and drafts are never lost to a re-render.
function tradeView(a3) {
  const c = S.co[a3]; if (!c) return panelShell('Stock', '', '<p class="muted">Company not found.</p>');
  const held = (typeof holdPosCombined === 'function') ? holdPosCombined(a3) : (S.holdings[a3] || { qty: 0, cost: 0 });
  const ch = chgVs(c), val = held.qty > 0 ? held.qty * c.price : held.qty < 0 ? -held.qty * c.price : 0;
  const pnl = held.qty !== 0 ? (c.price - held.cost) * held.qty : 0;
  // Range series. Daily closes cap at 400, so 1Y (260 closes) is the
  // longest honest daily range; 5Y and All fall back to weekly, then
  // monthly, the way the portfolio chart does. 1D has no intraday
  // series — prices move once a day on weekdays — so it shows today's
  // move as numbers instead of a faked chart.
  const R = UI.tradeRange;
  let closes, vols, unit;
  if (R === '1W') { closes = c.h.d.slice(-5); vols = (c.h.v || []).slice(-5); unit = 'day'; }
  else if (R === '1M') { closes = c.h.d.slice(-22); vols = (c.h.v || []).slice(-22); unit = 'day'; }
  else if (R === '3M') { closes = c.h.d.slice(-63); vols = (c.h.v || []).slice(-63); unit = 'day'; }
  else if (R === '5Y') { closes = (c.h.w || []).slice(-260); vols = []; unit = 'week'; }
  else if (R === 'All') {
    if (c.h.m && c.h.m.length > 1) { closes = c.h.m.slice(); unit = 'month'; }
    else if (c.h.w && c.h.w.length) { closes = c.h.w.slice(); unit = 'week'; }
    else { closes = c.h.d.slice(); unit = 'day'; }
    vols = [];
  }
  else { closes = c.h.d.slice(-260); vols = (c.h.v || []).slice(-260); unit = 'day'; }
  // SMA20 is always 20 daily closes, whatever the chart range shows —
  // a weekly chart must not relabel a 20-week average as SMA20.
  const sma20 = sma(c.h.d, 20), sma20v = sma20.length ? sma20[sma20.length - 1] : c.price;
  const volToday = (c.h.v || []).length ? c.h.v[c.h.v.length - 1] : 0;
  const prevClose = c.h.d.length >= 2 ? c.h.d[c.h.d.length - 2] : c.p0;
  const dayChg = c.price - (prevClose || c.price);
  const res = (c.res && c.res.day > S.day - 90 && c.res.expect != null) ? c.res : null;
  const exchange = (typeof STOCK_EXCHANGE !== 'undefined') ? STOCK_EXCHANGE : 'Worl Exchange';
  const div = (typeof ensureDiv === 'function') ? ensureDiv(c) : 0;
  const yld = (typeof divYield === 'function') ? divYield(c) : 0;
  const w52 = (typeof week52 === 'function') ? week52(c) : { hi: c.price, lo: c.price };
  const chartHtml = !c.listed ? '<p class="muted small">This company is private, so there is no market chart. List it with an IPO, or buy it outright with a takeover offer after it lists.</p>'
    : R === '1D' ? `<div class="stats3 box"><div><span>Open (prev close)</span><b>${fmtMoney(prevClose)}</b></div><div><span>Price now</span><b>${fmtMoney(c.price)}</b></div><div><span>Change today</span><b class="${upCls(ch)}">${dayChg >= 0 ? '+' : ''}${fmtMoney(dayChg)} · ${fmtPct(ch)}</b></div></div><p class="muted small">Prices move once a day on weekdays, so there is no intraday chart — 1D shows today's move as numbers.</p>`
    : candleChart(closes, vols);
  const caption = R === '1D' ? '' : unit === 'day' ? '<p class="muted small">Candles group 5 daily closes. Purple dashed line is SMA20 (20 daily closes). Purple bars below are shares traded per day in the in-game market, including your trades. This is simulated in-game volume, not real-world volume.</p>'
    : `<p class="muted small">Candles group 5 ${unit}ly closes. Purple dashed line is SMA20 (20 daily closes). No volume bars on ${unit}ly ranges — volume is daily only.</p>`;
  return panelShell(`${c.sym} · ${c.name}`, `${SECTORS[c.sector].icon} ${c.sector} · ${cname(a3)} · ${countryStatus(a3).t} · ${exchange}`,
    `<div class="trade-head"><div><div class="big">${c.listed ? fmtMoney(c.price) : 'Private'}</div><div class="${upCls(ch)}">${fmtPct(ch)} today · SMA20 ${fmtMoney(sma20v)}</div></div>
      <button class="btn small" data-a="tradeFocus">TRADE</button>
      <button class="star-btn ${S.watch.includes(a3) ? 'on' : ''}" data-a="star" data-x="${a3}">${S.watch.includes(a3) ? '★ Starred' : '☆ Star'}</button></div>
    ${chartHtml}
    ${caption}
    ${c.listed && volToday ? `<div class="kv"><span>Shares traded today</span><b>${volToday.toLocaleString()}</b></div>` : ''}
    ${rangeSeg(['1D', '1W', '1M', '3M', '1Y', '5Y', 'All'], UI.tradeRange, 'tradeRange')}
    <div class="stats3 box"><div><span>Position</span><b>${held.qty ? held.qty.toLocaleString() + ' shares' : 'None open'}</b></div><div><span>Valuation</span><b>${fmtMoney(companyValue(c), true)}</b></div><div><span>Your stake</span><b>${(stake(a3) * 100).toFixed(1)}%</b></div></div>
    <div class="stats3 box"><div><span>Dividend</span><b>${fmtMoney(div)} (${(yld * 100).toFixed(2)}%)</b></div><div><span>52-week high</span><b>${fmtMoney(w52.hi)}</b></div><div><span>52-week low</span><b>${fmtMoney(w52.lo)}</b></div></div>
    <div class="stats3 box"><div><span>P/E ratio</span><b>${(c.pe || 0).toFixed(1)}</b></div><div><span>Shares</span><b>${(c.shares || 0).toLocaleString()}</b></div><div><span>Exchange</span><b>${exchange}</b></div></div>
    ${(typeof topShareholders === 'function') ? `<div class="card in"><h4>Top shareholders</h4>${topShareholders(c, held.qty, c.shares).map(h => `<div class="kv"><span>${esc(h.name)}</span><b>${h.pct.toFixed(1)}%</b></div>`).join('')}</div>` : ''}
    ${c.lastReport ? `<div class="card in"><h4>Last quarterly report · ${esc(c.lastReport.q)}</h4><p class="muted small">Earnings ${fmtMoney(c.lastReport.earnings, true)} vs expected ${fmtMoney(c.lastReport.expect, true)} — ${c.lastReport.surprise >= 0 ? 'beat' : 'missed'} by ${Math.abs(c.lastReport.surprise * 100).toFixed(0)}%. Stock ${c.lastReport.move >= 0 ? '+' : ''}${(c.lastReport.move * 100).toFixed(1)}% on the report.</p></div>` : ''}
    ${S.lastTrade && S.lastTrade.a3 === a3 ? `<div class="kv"><span>Last trade</span><b class="${upCls(S.lastTrade.pnl)}">${S.lastTrade.side.toUpperCase()} ${S.lastTrade.qty.toLocaleString()} ${S.lastTrade.sym} · Realised P&amp;L ${fmtMoney(S.lastTrade.pnl, true)}</b></div><p class="muted small">That realised P&amp;L is just this trade. Net worth also moves with cash, loans, other holdings and weekly costs, so it will not match this number exactly.</p>` : ''}
    ${held.qty !== 0 ? `<div class="kv"><span>Average cost</span><b>${fmtMoney(held.cost)}</b></div><div class="kv"><span>Position value</span><b>${fmtMoney(val, true)}</b></div><div class="kv"><span>Unrealised P&amp;L</span><b class="${upCls(pnl)}">${fmtMoney(pnl, true)}</b></div>` : ''}
    ${res ? `<div class="card in"><b>Research</b><p class="muted small">Analysts expect next-quarter earnings of ${fmtMoney(res.expect, true)} — that is the number the next report will be judged against.${res.lastQ ? ` Last report (${esc(res.lastQ)}): ${res.lastSurprise >= 0 ? 'beat' : 'missed'} by ${Math.abs(res.lastSurprise * 100).toFixed(0)}%, stock ${res.lastMove >= 0 ? '+' : ''}${(res.lastMove * 100).toFixed(1)}%.` : ''}</p></div>` : ''}
    ${c.listed ? `<div class="trade-box" id="tradeBox">${walletPickerHTML()}
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
  const held = (typeof holdPosCombinedX === 'function') ? holdPosCombinedX(id) : ((S.holdingsX || {})[id] || { qty: 0, cost: 0 });
  const ch = chgVs(b), val = held.qty * b.price;
  const pnl = held.qty !== 0 ? (b.price - held.cost) * held.qty : 0;
  const closes = (b.h.d || []).slice(-130);
  return panelShell(`${b.sym} · ${b.name}`, `${esc(b.sector)} · ${cname(b.a3)} · Extra business stock — buy and sell only, no shorts or takeovers`,
    `<div class="trade-head"><div><div class="big">${fmtMoney(b.price)}</div><div class="${upCls(ch)}">${fmtPct(ch)} this week · Economic value ${fmtMoney(b.value, true)}</div></div></div>
    ${closes.length ? lineChart(closes, { h: 160 }) : '<p class="muted small">No weekly closes yet. This stock reprices each week in the leader economy.</p>'}
    <div class="stats3 box"><div><span>Position</span><b>${held.qty ? held.qty.toLocaleString() + ' shares' : 'None open'}</b></div><div><span>Market cap</span><b>${fmtMoney(b.price * b.shares, true)}</b></div><div><span>Shares</span><b>${b.shares.toLocaleString()}</b></div></div>
    <div class="stats3 box"><div><span>Dividend</span><b>${fmtMoney(Math.max(0.01, b.price * ((typeof sectorDivRate === 'function') ? sectorDivRate(b.sector) : 0.03)))} (${(((typeof sectorDivRate === 'function') ? sectorDivRate(b.sector) : 0.03) * 100).toFixed(2)}%)</b></div><div><span>52-week high</span><b>${fmtMoney(((typeof week52 === 'function') ? week52(b) : { hi: b.price, lo: b.price }).hi)}</b></div><div><span>52-week low</span><b>${fmtMoney(((typeof week52 === 'function') ? week52(b) : { hi: b.price, lo: b.price }).lo)}</b></div></div>
    ${(typeof topShareholders === 'function') ? `<div class="card in"><h4>Top shareholders</h4>${topShareholders(b, held.qty, b.shares).map(h => `<div class="kv"><span>${esc(h.name)}</span><b>${h.pct.toFixed(1)}%</b></div>`).join('')}</div>` : ''}
    ${b.lastReport ? `<div class="card in"><h4>Last quarterly report · ${esc(b.lastReport.q)}</h4><p class="muted small">Earnings ${fmtMoney(b.lastReport.earnings, true)} vs expected ${fmtMoney(b.lastReport.expect, true)} — ${b.lastReport.surprise >= 0 ? 'beat' : 'missed'} by ${Math.abs(b.lastReport.surprise * 100).toFixed(0)}%. Stock ${b.lastReport.move >= 0 ? '+' : ''}${(b.lastReport.move * 100).toFixed(1)}% on the report.</p></div>` : ''}
    ${held.qty !== 0 ? `<div class="kv"><span>Average cost</span><b>${fmtMoney(held.cost)}</b></div><div class="kv"><span>Position value</span><b>${fmtMoney(val, true)}</b></div><div class="kv"><span>Unrealised P&amp;L</span><b class="${upCls(pnl)}">${fmtMoney(pnl, true)}</b></div>` : ''}
    <div class="kv"><span>This week's profit</span><b>${fmtMoney((b.week && b.week.profit) || 0, true)}</b></div><div class="kv"><span>Rating</span><b>${(b.rating || 0).toFixed(1)} / 5</b></div>
    ${walletPickerHTML()}
    <div class="row"><button class="btn small" data-a="qty" data-x="-100">−100</button><button class="btn small" data-a="qty" data-x="-10">−10</button><input id="qty" class="qty" type="number" value="100" min="1"><button class="btn small" data-a="qty" data-x="10">+10</button><button class="btn small" data-a="qty" data-x="100">+100</button><button class="btn small" data-a="qtyMax" data-x="${id}">MAX</button></div>
    <div class="row"><button class="btn3d sell flex" data-a="doTradeExtra" data-x="${id}|sell">SELL</button><button class="btn3d buy flex" data-a="doTradeExtra" data-x="${id}|buy">BUY</button></div>
    <p class="muted small">Extra stocks move slightly each week; quarterly reports do most of the moving, same as flagships. They only trade while markets are open.</p>`);
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
  const held = [...new Set([...Object.keys(S.holdings || {}), ...Object.keys(S.holdingsP || {})])].map(a3 => [a3, holdPosCombined(a3)]).filter(([, h]) => h.qty !== 0);
  return panelShell('Portfolio', `Net worth ${fmtMoney(nw, true)} · Cash ${fmtMoney(S.cash, true)} · Loan ${fmtMoney(S.loan, true)}`,
    `${rangeSeg(['1M', '1Y', 'All'], UI.range, 'range')}${lineChart(series, { h: 160 })}
    <div class="stats3 box"><div><span>You</span><b class="${upCls(myReturn())}">${fmtPct(myReturn())}</b></div><div><span>Market</span><b class="${upCls(marketReturn())}">${fmtPct(marketReturn())}</b></div><div><span>Beat market</span><b class="${upCls(beatMarket())}">${fmtPct(beatMarket())}</b></div></div>
    <h4>Day calendar</h4><div class="cal">${cal.join('') || '<p class="muted small">Play a few days to fill the calendar.</p>'}</div>
    <h4>Holdings</h4><div class="list">${held.map(([a3, h]) => {
      const c = S.co[a3]; if (!c) return '';
      return `<button class="srow" data-a="stock" data-x="${a3}"><span class="avatar" style="background:${c.color}">${esc(c.name[0])}</span><span class="sname"><b>${c.sym}</b><small>${esc(c.name)}</small></span><span class="sprice"><b>${h.qty.toLocaleString()} shares</b><small>${fmtMoney(h.qty * c.price, true)}</small></span></button>`;
    }).join('') || '<p class="muted small">No open positions. Buy a stock in Markets.</p>'}</div>
    <h4>Extra stock holdings</h4><div class="list">${[...new Set([...Object.keys(S.holdingsX || {}), ...Object.keys(S.holdingsXP || {})])].map(id => [id, holdPosCombinedX(id)]).filter(([, h]) => h.qty !== 0).map(([id, h]) => {
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
  const hk = W.byA3[S.home];
  const capCity = hk && W.cities[hk.capital];
  const placed = Array.isArray(S.placed) ? S.placed : [];
  const totalValue = mineList.reduce((s, c) => s + companyValue(c), 0);
  const totalProfit = mineList.reduce((s, c) => s + ((c.week || {}).profit || 0), 0);
  const totalLocs = mineList.reduce((s, c) => s + (c.locs ? c.locs.length : 0), 0);
  const placedRows = placed.map(b => `<div class="kv"><span>${b.icon || ICONS.company} ${esc(b.name)} · ${esc(cname(b.a3))}</span><b>${fmtMoney(b.value, true)} · ${fmtMoney(b.income, true)}/week</b></div>`).join('') || '<p class="muted small">No placed businesses yet. Build one from a FOR LEASE lot in a city — press BUILD STORE there.</p>';
  const hqHead = `<div class="card in"><p><b>🏛️ Your HQ is in ${capCity ? esc(capCity.name) : 'your capital'}.</b></p><p class="muted small">HQ is not a separate place — it is your capital city, where the government sits. Open the capital to run it, or manage your companies from here.</p><button class="btn3d orange wide" data-a="panel" data-x="capital">🏛️ OPEN CAPITAL</button></div>
    <div class="stats3 box"><div><span>Companies controlled</span><b>${mineList.length}</b></div><div><span>Total value</span><b>${fmtMoney(totalValue, true)}</b></div><div><span>Week profit</span><b class="${upCls(totalProfit)}">${fmtMoney(totalProfit, true)}</b></div></div>
    <div class="kv"><span>Locations</span><b>${totalLocs}</b></div><div class="kv"><span>Placed businesses</span><b>${placed.length}</b></div><div class="kv"><span>Buildings owned</span><b>${S.props.length}</b></div>
    <div class="row wrap"><button class="btn" data-a="panel" data-x="capital">OPEN CAPITAL</button><button class="btn" data-a="panel" data-x="nation">NATION / TAX</button><button class="btn" data-a="panel" data-x="bank">BANK</button><button class="btn" data-a="panel" data-x="estate">BUILDINGS</button><button class="btn" data-a="panel" data-x="markets">MARKETS</button><button class="btn" data-a="panel" data-x="stores">MY STORES</button></div>
    <h4>Placed businesses</h4><div class="list">${placedRows}</div>`;
  if (!mineList.length) return panelShell('My Companies', '', hqHead + '<div class="card in"><p class="muted">You control no companies yet. Your home company is yours once you open a location, or buy 50% of a listed company in Markets to take control.</p></div>');
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
      <div class="row"><button class="btn" data-a="borrow">BORROW</button><button class="btn" data-a="repay">REPAY ALL</button><button class="btn" data-a="boardMeeting" data-x="${c.a3}">BOARD MEETING</button>${!c.listed ? `<button class="btn" data-a="ipo" data-x="${c.a3}">IPO (needs full board + 2 profitable weeks)</button>` : '<span class="muted small">Listed</span>'}</div>
      <h5>Website, stock &amp; tax</h5>
      <div class="kv"><span>Website</span><b>${WEB_TIERS[c.web.tier].name} · ${oe.visitors.toLocaleString()} visitors/week · ${fmtMoney(oe.profit, true)}/week</b></div>
      <div class="kv"><span>Tax in ${esc(cname(c.a3))}</span><b>${Math.round(country(c.a3).tax * 100)}% corporate — change it in Nation</b></div>
      <div class="row"><button class="btn" data-a="stock" data-x="${c.a3}">VIEW STOCK</button><button class="btn" data-a="webCo" data-x="${c.a3}">OPEN WEBSITE</button><button class="btn" data-a="siteMaker" data-x="${c.a3}">CUSTOMIZE SITE</button><button class="btn" data-a="panel" data-x="nation">NATION / TAX</button></div>
    </div>`;
  }).join('');
  return panelShell('My Companies', `${mineList.length} companies under your control · Tap a company to open it, tap again to close it`, hqHead + body);
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
PANELS.tawk = () => tawkPanelHTML();
PANELS.radio = () => radioPanelHTML();
PANELS.karma = () => karmaPanelHTML();
PANELS.newsapp = () => newsPanelHTML();
PANELS.ads = () => adsPanelHTML();
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
  if (typeof webAdStart === 'function') setTimeout(webAdStart, 0);
  return panelShell('Web', 'Fake browser — your company website lives here, not News',
    `<div class="webwrap"><div id="webrailL" class="webrail"></div><div class="webbody"><div class="browser"><div class="urlbar"><button data-a="webBack">←</button><button data-a="webHome">⌂</button><span class="url">${esc(url)}</span></div>
    <div class="row wrap"><button class="chip" data-a="webView" data-x="search">Search</button><button class="chip" data-a="webView" data-x="news">World Times</button><button class="chip" data-a="webView" data-x="mail">Mail (${S.mail.filter(m => !m.read).length})</button><button class="chip" data-a="webView" data-x="mine">My site</button></div>
    ${w.view === 'search' ? `<input id="wsearch" class="search" placeholder="Search companies, countries, products" value="${esc(w.q)}" autocomplete="off">` : ''}
    ${body}</div></div><div id="webrailR" class="webrail"></div></div>`);
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
  if (!S.stores || !S.stores.length) return { title: 'Build your first business', body: 'You have no store yet.', btn: 'MY STORES', a: 'panel', x: 'stores' };
  return { title: 'You are in good shape', body: 'No urgent move. Grow by building another store, developing its products, or buying a stock in Markets.', btn: 'MY STORES', a: 'panel', x: 'stores' };
}
// You — the person, not the country. Three wallets (personal, business,
// office), four meters (visibility, fame, popularity, public opinion),
// your career and your assets. Country logic is untouched: the country
// panel still opens from the country name/cash part of the same HUD pill.
function youLookOpts() { if (!Array.isArray(UI.youLookOpts) || !UI.youLookOpts.length) UI.youLookOpts = Array.from({length: 8}, () => randLook()); const cur = (typeof S !== 'undefined' && S && S.you && S.you.look) ? JSON.stringify(S.you.look) : null; if (cur && !UI.youLookOpts.some(lk => JSON.stringify(lk) === cur)) { UI.youLookOpts.unshift(S.you.look); UI.youLookOpts.length = 8; } return UI.youLookOpts; }
function lookPickerHTML(looks, selIdx, action, shuffleAction) {
  return `${(looks || []).map((lk, i) => `<button class="pick-look ${i === selIdx ? 'on' : ''}" data-a="${action}" data-x="${i}">${portraitSVG(lk, 56)}</button>`).join('')}<button class="btn" data-a="${shuffleAction}" title="New faces">↻</button>`;
}
PANELS.profile = () => {
  const P = ensurePerson();
  const you = (S.you || { name: 'Founder' });
  const mineCount = (typeof mine === 'function') ? mine().length : 0;
  const job = P.job || { track: 'civilian', rank: 0, weeks: 0 };
  const ladder = jobLadder(job.track, typeof companyForJob === 'function' ? companyForJob(job) : null);
  const cur = ladder[job.rank] || ladder[0];
  const next = ladder[job.rank + 1];
  const bar = (label, v) => `<div class="kv"><span>${label}</span><b>${Math.round(v)}/100</b></div><div style="background:#dbeafe;height:10px;border-radius:5px;margin:2px 0 8px"><div style="width:${Math.round(v)}%;background:#2563eb;height:10px;border-radius:5px"></div></div>`;
  const office = P.office;
  return panelShell('You', `${esc(you.name)} · Age ${personAge()} · ${office ? esc(office.title) : esc(cur.title)}`,
    `<div class="card in"><h4>✏️ Name</h4><div class="row"><input id="profileName" class="search" type="text" value="${esc(you.name)}" maxlength="24"><button class="btn" data-a="profileRename">Save name</button></div><p class="muted small">This is the name on the top pill, with your title behind it. Your title changes on its own as you win offices, run companies, and climb careers.</p></div>
    <div class="card in"><h4>🧑 Your person</h4><p class="muted small">This is the face in the top-left pill. Tap a person to pick them.</p><div class="look-row">${lookPickerHTML(youLookOpts(), youLookOpts().findIndex(lk => JSON.stringify(lk) === JSON.stringify(you.look || {})), 'youLook', 'youLookShuffle')}</div></div>
    <div class="card in"><h4>📊 Meters</h4>${bar('👁 Visibility', P.vis)}${bar('⭐ Fame', P.fame)}${bar('❤️ Popularity', P.pop)}${bar('🗳️ Public opinion', P.opin)}<p class="muted small">Elections are won on fame, popularity, and public opinion — three separate scores. Visibility helps fame grow.</p></div>
    <div class="card in"><h4>💰 Your money</h4>
    <div class="kv"><span>Personal money</span><b>${fmtMoney(P.cash, true)}</b></div>
    ${office ? `<div class="kv"><span>${esc(office.title)} term</span><b>${Math.max(0, Math.ceil((office.termEnd - S.day) / 365))}y left</b></div>` : ''}
    <div class="row wrap"><button class="btn small" data-a="personInvest" data-x="10000">Invest $10K</button><button class="btn small" data-a="personInvest" data-x="100000">Invest $100K</button><button class="btn small" data-a="personInvest" data-x="all">Invest all</button><button class="btn small" data-a="personPay" data-x="10000">Pay self $10K</button><button class="btn small" data-a="personPay" data-x="100000">Pay self $100K</button><button class="btn small" data-a="personPay" data-x="all">Pay self all</button></div>
    <p class="muted small">Invest moves your money into your business. Pay yourself moves business money to you.</p></div>
    <div class="card in"><h4>💼 Career</h4>
    <div class="kv"><span>Job</span><b>${esc(cur.title)} · ${fmtMoney(cur.salary, true)}/week · ${job.weeks} weeks</b></div>
    ${job.track === 'company' && typeof companyForJob === 'function' && companyForJob(job) ? `<div class="kv"><span>Company</span><b>${esc(companyForJob(job).name)} · Value ${fmtMoney(companyValueForJob(job), true)}${job.valueAtPromo ? ` · At last promotion ${fmtMoney(job.valueAtPromo, true)}` : ''}</b></div><p class="muted small">Analyst and above: promotion needs the company to double since your last promotion — and it jumps you, not just one step. Lose more than half the company's value and you are fired.</p>${job.rank >= 3 ? `<button class="btn" data-a="panel" data-x="analyst">MAKE DECISIONS AS ANALYST (${job.decisions || 0} made)</button>` : ''}` : ''}
    ${next ? `<button class="btn" data-a="personPromo">Ask for promotion to ${esc(next.title)} (needs ${job.track === 'company' && job.rank >= 3 ? 'company to double, ' : `${next.fame} fame, `}${next.weeks} weeks)</button>` : '<p class="muted small">Top of this career.</p>'}
    ${job.track !== 'company' ? `<button class="btn" data-a="personApplyCompany" data-x="${S.home}">Apply for a job at ${esc(cname(S.home))}'s main company</button><p class="muted small">Company jobs are not automatic: a company losing money is not hiring. Entry is coffee / fast food level, then manager, then analyst in the office, then on to CEO.</p>` : ''}
    <div class="row wrap"><button class="btn small" data-a="personJoinAgency" data-x="dom">Join ${esc(agencyOf(S.home)[0])}</button><button class="btn small" data-a="personJoinAgency" data-x="for">Join ${esc(agencyOf(S.home)[1])}</button><button class="btn small" data-a="personEnlist">Enlist in the military</button></div>
    ${office ? `<div class="kv"><span>Office</span><b>${esc(office.title)} · ${fmtMoney(office.salary, true)}/week</b></div><button class="btn" data-a="policy">Announce policy (office budget)</button>` : ''}
    <p class="muted small">Jobs pay you every week. Agencies cut your risk of getting caught. The military opens the General advisor.</p></div>
    <div class="card in"><h4>🎓 College</h4>
    ${P.college ? `<div class="kv"><span>Studying</span><b>${esc(P.college.name)} · ${P.college.weeksLeft} weeks left</b></div>` : `<p class="muted small">College is across from the capital. Associate unlocks manager work and a mayor run, Bachelor unlocks analyst work, governor and congress runs, Master unlocks director work and a president run.</p><div class="row wrap">${COLLEGE_DEGREES.map(d => `<button class="btn small" data-a="personEnrollCollege" data-x="${d.id}">${esc(d.name)} · ${fmtMoney(d.cost, true)} · ${d.weeks} weeks${d.req ? ` · Needs ${esc(COLLEGE_DEGREES.find(x => x.id === d.req).name)}` : ''}${(P.degrees || []).includes(d.id) ? ' ✓' : ''}</button>`).join('')}</div>`}
    ${(P.degrees || []).length ? `<div class="kv"><span>Degrees</span><b>${P.degrees.map(id => esc((COLLEGE_DEGREES.find(x => x.id === id) || {}).name || id)).join(', ')}</b></div>` : ''}</div>
    <div class="card in"><h4>🏠 Your assets</h4>
    <div class="kv"><span>Buildings</span><b>${(S.props || []).length} · ${fmtMoney(propValue(), true)}</b></div>
    <div class="kv"><span>Rating</span><b>${(S.rating || 0).toFixed(1)} / 5</b></div>
    <p class="muted small">Companies, stocks and business money live in Trade, My Companies and Offices — not here.</p>
    <div class="row wrap"><button class="btn" data-a="panel" data-x="cabinet">ADVISORS (${P.cabinet.length}/10)</button><button class="btn" data-a="panel" data-x="elections">ELECTIONS</button></div></div>`);
};
PANELS.analyst = () => {
  const P = ensurePerson();
  const job = P.job || {};
  const c = typeof companyForJob === 'function' ? companyForJob(job) : null;
  if (!c || job.track !== 'company' || job.rank < 3) return panelShell('Analyst decisions', '', '<p class="muted">Analyst decisions start at Analyst. Get a company job and work up to Analyst first.</p><button class="btn wide" data-a="closePanel">RETURN TO MAP</button>');
  const set = c.set || { price: 1, quality: 3, wage: 1 };
  const btn = (kind, v, label) => `<button class="btn small ${set[kind] === v ? 'on' : ''}" data-a="analystSet" data-x="${kind}|${v}">${label}</button>`;
  return panelShell(`Analyst — ${c.name}`, `Analyst pay, no stock · ${job.decisions || 0} decisions made · Company value ${fmtMoney(companyValueForJob(job), true)} · Last week profit ${fmtMoney((c.week || {}).profit || 0, true)}`,
    `<p class="muted small">These are CEO calls, made at analyst pay. They feed the real weekly simulation: price trades customers for margin, quality trades cost for satisfaction, wage trades cost for staff happiness. Good calls grow the company toward your next promotion. Bad calls shrink it — and that is what gets you fired.</p>
    <div class="card in"><h4>💲 Price</h4><div class="row wrap">${btn('price', 0.8, 'Cut to 80% — more customers, less per sale')}${btn('price', 1, 'Normal 100%')}${btn('price', 1.25, 'Raise to 125% — more per sale, fewer customers')}</div><p class="muted small">Now: ${Math.round(set.price * 100)}%</p></div>
    <div class="card in"><h4>⭐ Quality</h4><div class="row wrap">${btn('quality', 2, 'Lower to 2★ — cheaper, worse satisfaction')}${btn('quality', 3, 'Normal 3★')}${btn('quality', 4, 'Raise to 4★ — better, costs more')}</div><p class="muted small">Now: ${set.quality}★</p></div>
    <div class="card in"><h4>👷 Wage</h4><div class="row wrap">${btn('wage', 0.8, 'Cut to 80% — cheaper, staff unhappy')}${btn('wage', 1, 'Normal 100%')}${btn('wage', 1.25, 'Raise to 125% — happier staff, higher wages')}</div><p class="muted small">Now: ${Math.round(set.wage * 100)}%</p></div>
    <button class="btn wide" data-a="closePanel">RETURN TO MAP</button>`);
};
PANELS.etf = () => {
  if (!S.etfs) S.etfs = [];
  const rows = S.etfs.map(e => {
    const p = etfPrice(e), h = (S.etfHoldings || {})[e.id];
    const mgr = e.manager === 'player' ? 'You' : (S.co[e.manager] ? S.co[e.manager].name : e.manager);
    return `<div class="card in"><div class="kv"><span><b>${esc(e.sym)}</b> · ${esc(e.name)}</span><b>${fmtMoney(p)}</b></div>
    <div class="kv"><span>Manager</span><b>${esc(mgr)} · ${(ETF_FEE * 100).toFixed(2)}%/yr fee</b></div>
    <div class="kv"><span>Basket</span><b>${e.basket.length} core businesses · Since $100: ${p >= 100 ? '+' : ''}${((p / 100 - 1) * 100).toFixed(1)}%</b></div>
    ${h ? `<div class="kv"><span>Your holding</span><b>${h.qty} shares · Cost ${fmtMoney(h.cost, true)} · P&amp;L ${fmtMoney((p - h.cost) * h.qty, true)}</b></div>` : ''}
    <div class="row wrap"><button class="btn small" data-a="etfBuy" data-x="${e.id}|10">Buy 10</button><button class="btn small" data-a="etfBuy" data-x="${e.id}|100">Buy 100</button><button class="btn small" data-a="etfSell" data-x="${e.id}|10">Sell 10</button><button class="btn small" data-a="etfSell" data-x="${e.id}|100">Sell 100</button></div></div>`;
  }).join('');
  return panelShell('ETFs', 'Baskets of core businesses, managed by finance companies — or by you. IPO means listed, not free cash: the manager earns the fee.',
    `<div class="card in"><h4>CREATE AN ETF — IPO IT</h4><p class="muted small">Pick a basket. You become the manager and earn the 0.50%/yr fee as a price drag — no cash windfall, because you do not own the basket. Finance companies do the same, and CPU finance companies launch their own over time.</p>
    <div class="row wrap">${ETF_GROUPS.map(g => `<button class="btn small" data-a="etfCreate" data-x="${g.id}">${esc(g.name)} ETF</button>`).join('')}</div></div>
    ${rows || '<p class="muted small">No ETFs yet. Create one above, or wait for a finance company to launch one.</p>'}
    <button class="btn wide" data-a="closePanel">RETURN TO MAP</button>`);
};
PANELS.economy = () => {
  const s = (typeof supplyFor === 'function') ? supplyFor(S.home) : { farmCost: 1, shopDemand: 1, farmOut: 0, factoryOut: 0, shopOut: 0 };
  const owner = (typeof realEstateOwner === 'function') ? realEstateOwner(S.home) : null;
  const rent = (S.lastRent || {})[S.home] || 0;
  const all = Object.keys(S.supply || {}).map(a3 => ({ a3, ...S.supply[a3] })).filter(x => x.farmCost > 1.2 || x.shopDemand < 0.85);
  return panelShell(`Economy — ${cname(S.home)}`, 'Farms → factories → shops, plus who owns the ground.',
    `<div class="card in"><h4>🌾 FARMS → 🏭 FACTORIES → 🏪 SHOPS</h4>
    <div class="kv"><span>Farm output this week</span><b>${fmtMoney(s.farmOut, true)}</b></div>
    <div class="kv"><span>Factory output this week</span><b>${fmtMoney(s.factoryOut, true)}</b></div>
    <div class="kv"><span>Shop sales this week</span><b>${fmtMoney(s.shopOut, true)}</b></div>
    <div class="kv"><span>Factory costs next week</span><b>${(s.farmCost * 100).toFixed(0)}% ${s.farmCost > 1 ? '— farm shortage' : s.farmCost < 1 ? '— farm surplus' : ''}</b></div>
    <div class="kv"><span>Shop demand next week</span><b>${(s.shopDemand * 100).toFixed(0)}% ${s.shopDemand < 1 ? '— factory shortage' : s.shopDemand > 1 ? '— factory surplus' : ''}</b></div>
    <p class="muted small">Sectors still run on their own — this chain only moves factory costs (0.9x–1.5x) and shop demand (0.7x–1.1x), one week behind the results that set it. The economy keeps going on CPU alone, and better if you keep going.</p></div>
    <div class="card in"><h4>🏘️ REAL ESTATE</h4>
    <div class="kv"><span>Owner in ${esc(cname(S.home))}</span><b>${owner ? esc(owner.name) : 'None yet'}</b></div>
    <div class="kv"><span>Rent collected last week</span><b>${fmtMoney(rent, true)}</b></div>
    <div class="kv"><span>Of that, stadium rent</span><b>${fmtMoney((S.lastStadiumRent || {})[S.home] || 0, true)}</b></div>
    <p class="muted small">All farmland, apartments, stores for lease, already-leased stores and stadium rent is owned by real estate companies. Rent that used to vanish now lands on that company's weekly profit.</p></div>
    ${all.length ? `<div class="card in"><h4>⚠️ SHORTAGES ELSEWHERE</h4>${all.slice(0, 10).map(x => `<div class="kv"><span>${esc(cname(x.a3))}</span><b>Factory costs ${(x.farmCost * 100).toFixed(0)}% · Shop demand ${(x.shopDemand * 100).toFixed(0)}%</b></div>`).join('')}</div>` : ''}
    <button class="btn wide" data-a="closePanel">RETURN TO MAP</button>`);
};
PANELS.office = () => {
  const P = ensurePerson();
  const o = P.office;
  if (!o) return panelShell('Office decisions', '', '<p class="muted">You hold no office. Win an election first, then your decisions live here.</p><button class="btn wide" data-a="closePanel">RETURN TO MAP</button>');
  const list = officeDecisionsFor(o);
  if (!list.length) return panelShell(o.title, '', '<p class="muted">This office uses the generic policy announcement for now. Mayor, governor and congress decisions are the ones built out.</p><button class="btn wide" data-a="closePanel">RETURN TO MAP</button>');
  const role = o.scope === 'city' ? 'Mayor — community decisions, not laws. Every yes has a good side and a bad side.' : o.scope === 'region' ? 'Governor — laws you sign for your state.' : o.scope === 'legislature' ? 'Congress — bills you develop.' : 'Head of state — sign federal laws, veto bills, grant pardons.';
  const law = S.officeLaw && !S.officeLaw.decided && S.officeLaw.year === yearOf(S.day) ? S.officeLaw : null;
  return panelShell(o.title, `${role} · Budget ${fmtMoney(officeTreasury(o), true)}`,
    `${law ? `<div class="card in"><h4>📜 LAW FOR YOUR SIGNATURE — ${esc(law.name)}</h4><p class="muted small">Once a year, a law lands here. Sign it and it takes effect (using that decision's once-a-year slot). Veto it and it does not take effect — popularity +1, public opinion −1, no cost.</p><div class="row"><button class="btn" data-a="officeLawSign">SIGN IT</button><button class="btn" data-a="officeLawVeto">VETO IT</button></div></div>` : ''}
    ${list.map(d => {
      const last = (o.decisions || {})[d.id];
      const taken = last && S.day - last < 365;
      const cost = d.costPct ? Math.max(50000, Math.round(officeTreasury(o) * d.costPct)) : 0;
      return `<div class="card in"><h4>${esc(d.name)}</h4><p class="muted small">✅ ${esc(d.good)}</p><p class="muted small">⚠️ ${esc(d.bad)}${cost ? ` · Costs ${fmtMoney(cost, true)}` : ''}</p>${taken ? `<p class="muted small">Made this year — you can make it again in ${365 - (S.day - last)} days.</p>` : `<button class="btn" data-a="officeDecision" data-x="${d.id}">YES — DO IT</button>`}</div>`;
    }).join('')}
    <p class="muted small">No is just skipping it — no reward, no penalty. A decision can be taken once a year.</p>
    <button class="btn wide" data-a="closePanel">RETURN TO MAP</button>`);
};
PANELS.bankruptcy = () => {
  const st = bankruptcyState();
  const P = ensurePerson();
  const unclaimed = Object.keys(S.countries || {}).filter(a3 => S.countries[a3].unclaimed);
  const options = W.playable.filter(k => k.a3 !== S.home && !(S.countries[k.a3] && S.countries[k.a3].unclaimed));
  return panelShell('Bankruptcy', '5 negative years = bankrupt. 1 profitable year breaks the streak. Warning at 4 years.',
    `<div class="card in"><h4>YOUR STREAKS</h4>
    <div class="kv"><span>Personal bank balance</span><b>${fmtMoney(P.cash, true)} · ${st.personal.years} negative year${st.personal.years === 1 ? '' : 's'}${st.personal.warned ? ' · ⚠️ WARNING' : ''}</b></div>
    <div class="kv"><span>Business bank balance</span><b>${fmtMoney(S.cash, true)} · ${st.business.years} negative year${st.business.years === 1 ? '' : 's'}${st.business.warned ? ' · ⚠️ WARNING' : ''}</b></div>
    <p class="muted small">No recession — only bankruptcy. A bankrupt company is delisted and halved, and emerges after one profitable year. A bankrupt country becomes unclaimed territory, and its neighbours move to annex it.</p></div>
    <div class="card in"><h4>UNCLAIMED TERRITORY</h4>${unclaimed.length ? unclaimed.map(a3 => `<div class="kv"><span>${esc(cname(a3))}</span><b>Unclaimed — neighbours will annex it</b></div>`).join('') : '<p class="muted small">No unclaimed countries yet.</p>'}</div>
    <div class="card in"><h4>REBIRTH — SAME GAME, NEW COUNTRY, KEEPS NOTHING</h4><p class="muted small">Pick a country that still stands. You start again as a new person there, with $5,000, no holdings, no stores, no loans, no office, no degrees. The world, the day, and every other country keep going.</p>
    <select id="rebirthCountry" class="search">${options.map(k => `<option value="${k.a3}">${esc(k.name)}</option>`).join('')}</select>
    <button class="btn wide" data-a="doRebirth">REBIRTH HERE</button></div>
    <button class="btn wide" data-a="closePanel">RETURN TO MAP</button>`);
};
// World leaders, with the exact names Tawk uses (seeded per country),
// cached — the names are deterministic per a3, so the cache is valid
// across games.
let _worldLeaders = null;
function worldLeaders() {
  if (_worldLeaders) return _worldLeaders;
  try { _worldLeaders = tawkAccounts().filter(a => a.type === 'leader').map(a => ({ id: a.id, name: a.name, title: a.title, a3: a.a3 })); }
  catch (e) { _worldLeaders = []; }
  return _worldLeaders;
}
PANELS.cabinet = () => {
  // Advisors, laid out like the reference contacts screen: centered
  // title, My Card, your advisors separated on top, then every world
  // leader A-Z with a letter rail, and a bottom search pill + add
  // button. The panel key stays 'cabinet' (saves store advisors under
  // S.person.cabinet) — this is Advisors, not a new Contacts app.
  const P = ensurePerson();
  const q = (UI.advQuery || '').toLowerCase().trim();
  const cmp = (a, b) => { const x = a.name.toLowerCase(), y = b.name.toLowerCase(); return x < y ? -1 : x > y ? 1 : 0; };
  const advisors = P.cabinet.slice().sort(cmp);
  const shownAd = q ? advisors.filter(ad => ad.name.toLowerCase().includes(q) || CAB_TYPES[ad.type].name.toLowerCase().includes(q)) : advisors;
  const leaders = worldLeaders().slice().sort(cmp);
  const shownLd = q ? leaders.filter(l => l.name.toLowerCase().includes(q) || cname(l.a3).toLowerCase().includes(q)) : leaders;
  const gLd = {};
  shownLd.forEach(l => { const L = /^[A-Z]$/i.test(l.name[0] || '') ? l.name[0].toUpperCase() : '#'; (gLd[L] = gLd[L] || []).push(l); });
  const rail = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');
  const adRow = ad => {
    const open = UI.advOpen === ad.id;
    const detail = open ? `<div class="adv-detail"><span>${esc(CAB_TYPES[ad.type].name)} · Rating ${ad.rating}${ad.star ? ' ⭐ developable' : ''}</span><span><button class="btn small" data-a="cabTip" data-x="${ad.id}">BUY TIP · ${fmtMoney(tipStake(), true)}</button> <button class="btn small" data-a="cabFire" data-x="${ad.id}">FIRE</button></span></div>` : '';
    return `<div class="adv-row"><button class="adv-person" data-a="advOpen" data-x="${ad.id}"><span class="adv-av">${esc((ad.name[0] || '?').toUpperCase())}</span><span class="adv-nm"><b>${esc(ad.name)}</b><small>${esc(CAB_TYPES[ad.type].name)} · Rating ${ad.rating}${ad.star ? ' ⭐' : ''}</small></span></button>${detail}</div>`;
  };
  const ldRow = l => {
    const open = UI.advOpen === l.id;
    const k = W.byA3[l.a3] || {};
    const flag = (typeof flagEmoji === 'function' && k.a2) ? flagEmoji(k.a2) : '';
    const detail = open ? `<div class="adv-detail"><span>${flag} ${esc(l.title)} of ${esc(cname(l.a3))}</span></div>` : '';
    return `<div class="adv-row"><button class="adv-person" data-a="advOpen" data-x="${l.id}"><span class="adv-av">${esc((l.name[0] || '?').toUpperCase())}</span><span class="adv-nm"><b>${esc(l.name)}</b></span></button>${detail}</div>`;
  };
  const ldSections = rail.filter(L => gLd[L]).map(L => `<div class="adv-sec" id="adv-sec-${L}"><div class="adv-letter">${L}</div>${gLd[L].map(ldRow).join('')}</div>`).join('');
  let hire = '';
  if (UI.cabHire) {
    const type = UI.cabHire.type;
    hire = `<div class="card in"><h4>Pick a ${esc(CAB_TYPES[type].name)}</h4><p class="muted small">Cost ${fmtMoney(CAB_TYPES[type].cost, true)} of your personal money. ⭐ means developable: their rating grows over time.</p>${cabCandidates(type).map(c => `<div class="kv"><span>${esc(c.name)} · Rating ${c.rating}${c.star ? ' ⭐' : ''}</span><b><button class="btn small" data-a="cabHire" data-x="${type}|${c.id}">HIRE</button></b></div>`).join('')}<button class="btn" data-a="cabCancel">CANCEL</button></div>`;
  }
  const types = Object.keys(CAB_TYPES).map(t => {
    if (!cabUnlocked(t)) return `<div class="kv"><span>${esc(CAB_TYPES[t].name)}</span><b>🔒 ${cabUnlockWhy(t)}</b></div>`;
    return `<div class="kv"><span>${esc(CAB_TYPES[t].name)} · ${fmtMoney(CAB_TYPES[t].cost, true)}</span><b><button class="btn small" data-a="cabType" data-x="${t}">ADD</button></b></div>`;
  }).join('');
  const add = UI.advAdd ? `<div class="card in"><h4>Add an advisor</h4>${types}</div>` : '';
  const myCard = q ? '' : `<button class="adv-person adv-mycard" data-a="panel" data-x="profile"><span class="adv-av">👤</span><span class="adv-nm"><b>My Card</b><small>${esc(S.you.name)} · ${esc(personTitle())}</small></span></button>`;
  const adSec = shownAd.length ? `<div class="adv-sec"><div class="adv-letter">Advisors</div>${shownAd.map(adRow).join('')}</div>` : '';
  const empty = (!shownAd.length && !shownLd.length) ? '<p class="muted small">No contacts match.</p>' : '';
  return panelShell('Advisors', `Your advisors — ${P.cabinet.length}/10 seats.`,
    `<div class="adv"><div class="adv-title">Advisors</div>${myCard}${hire}${add}${adSec}<div class="adv-wrap"><div class="adv-list">${ldSections || empty}</div><div class="adv-index">${rail.map(L => `<button data-a="advJump" data-x="${L}">${L}</button>`).join('')}</div></div><div class="adv-bottombar"><div class="adv-searchpill"><span class="adv-ic">🔍</span><input id="advSearch" placeholder="Search" value="${esc(UI.advQuery || '')}" autocomplete="off"><button class="adv-ic" data-a="advMic" title="Search">🎙️</button></div><button class="adv-addbtn" data-a="advAdd">＋</button></div></div>`);
};

PANELS.elections = () => {
  const P = ensurePerson();
  const home = W.byA3[S.home];
  const cap = W.cities.find(c => c.id === home.capital);
  const office = P.office;
  // Home races: nation, region, legislature, capital mayor — each on
  // its own seeded calendar, so their dates differ.
  const scopes = ['nation', 'region', 'legislature', 'city'];
  const homeCards = scopes.map(sc => {
    const jur = sc === 'city' ? S.home + ':' + home.capital : S.home;
    const label = electionScopeTitle(S.home, sc, sc === 'city' ? (cap && cap.name) : null);
    return { sc, jur, label, race: electionRace(jur, sc, S.day) };
  });
  const openNow = homeCards.filter(x => x.race.status === 'open');
  const ballot = openNow.length
    ? openNow.map(x => electRaceCardHTML(x.jur, S.home, x.sc, x.label)).join('')
    : `<p class="muted small">No election open right now. Next: ${homeCards.map(x => `${x.label} ${fmtDate(x.race.next)}`).join(' · ')}.</p>`;
  const homeSection = homeCards.map(x => electRaceCardHTML(x.jur, S.home, x.sc, x.label)).join('');
  // City elections in the home country: every city votes for its mayor
  // on its own seeded date. Rows expand in place — no back buttons.
  const cities = W.cities.filter(c => c.a3 === S.home).sort((a, b) => ((b.id === home.capital ? 1 : 0) - (a.id === home.capital ? 1 : 0)) || b.pop - a.pop);
  const cityRows = cities.map(c => {
    const jur = S.home + ':' + c.id, race = electionRace(jur, 'city', S.day);
    const status = race.status === 'open' ? `🗳️ Voting open — closes ${fmtDate(race.day)}` : `Next ${fmtDate(race.next)}`;
    return `<div class="elect-city"><button class="elect-citybtn" data-a="electCity" data-x="${c.id}"><span>${c.id === home.capital ? '⭐ ' : ''}${esc(c.name)}</span><span style="color:#8b949e">${status} ›</span></button>${UI.electCity === c.id ? electRaceCardHTML(jur, S.home, 'city', `Mayor of ${c.name}`) : ''}</div>`;
  }).join('') || '<p class="muted small">No cities found in your country.</p>';
  // Every country's national race, open ones first. Tap a country and
  // its card opens right there — the same layout as the state card.
  const world = W.playable.slice().sort((a, b) => {
    const ra = electionRace(a.a3, 'nation', S.day), rb = electionRace(b.a3, 'nation', S.day);
    if ((ra.status === 'open') !== (rb.status === 'open')) return ra.status === 'open' ? -1 : 1;
    return ra.next - rb.next;
  });
  const worldRows = world.map(k => {
    const race = electionRace(k.a3, 'nation', S.day);
    const status = race.status === 'open' ? '🗳️ Voting open' : `Next ${fmtDate(race.next)}`;
    return `<div class="elect-city"><button class="elect-citybtn" data-a="electOpen" data-x="${k.a3}"><span>${k.flag} ${esc(k.name)}</span><span style="color:#8b949e">${status} ›</span></button>${UI.electOpen === k.a3 ? electRaceCardHTML(k.a3, k.a3, 'nation', electionScopeTitle(k.a3, 'nation')) : ''}</div>`;
  }).join('');
  const rows = officeList().map(o => {
    const holding = office && office.id === o.id;
    const missing = [];
    if (P.fame < o.req.fame) missing.push(`${o.req.fame} fame`);
    if (P.pop < o.req.pop) missing.push(`${o.req.pop} popularity`);
    if (P.opin < o.req.opin) missing.push(`${o.req.opin} public opinion`);
    const degReq = (typeof officeDegreeReq === 'function') ? officeDegreeReq(o.id) : null;
    if (degReq && !(P.degrees || []).includes(degReq)) missing.push(`a ${(typeof COLLEGE_DEGREES !== 'undefined' ? COLLEGE_DEGREES.find(x => x.id === degReq) : null || {}).name || degReq} (college)`);
    let status = '', btn = '';
    if (holding) status = `Holding — ${Math.max(0, Math.ceil((office.termEnd - S.day) / 365))}y left`;
    else if (P.flaggedUntil > S.day) status = `Flagged — ${Math.ceil((P.flaggedUntil - S.day) / 365)}y until you can run`;
    else if (P.runCooldownUntil > S.day) status = `Cooldown — ${Math.ceil((P.runCooldownUntil - S.day) / 365)}y`;
    else if (missing.length) status = `Needs ${missing.join(', ')}`;
    else { status = 'You can run'; btn = `<button class="btn" data-a="runOffice" data-x="${o.id}">RUN</button>`; }
    return `<div class="kv"><span>${esc(o.title)} · ${fmtMoney(o.salary, true)}/week</span><b>${status} ${btn}</b></div>`;
  }).join('');
  return panelShell('Elections', `Fame ${Math.round(P.fame)} · Popularity ${Math.round(P.pop)} · Public opinion ${Math.round(P.opin)} — the vote is 25% fame, 40% popularity, 35% opinion, plus a little chaos. Campaign first, then run.`,
    `<div class="elect"><h4>🗳️ Your ballot — open now</h4>${ballot}
    <h4>🏛️ ${esc(cname(S.home))} races</h4>${homeSection}
    <h4>🏙️ City elections — ${esc(cname(S.home))}</h4>${cityRows}
    <h4>🌍 Every country — national races</h4><p class="muted small">Tap a country to see its race card. Voting is open for 28 days before each election day, and every country votes on its own dates.</p>${worldRows}</div>
    <div class="card in"><h4>📣 Campaign</h4><div class="row wrap"><button class="btn small" data-a="campaign" data-x="rally">Rally · $25K</button><button class="btn small" data-a="campaign" data-x="ads">Campaign ads · $100K</button><button class="btn small" data-a="campaign" data-x="donate">Donate · $50K</button></div><p class="muted small">Rallies raise visibility, fame, and opinion. Ads raise opinion and popularity. Donations raise popularity. A strategist makes campaigning 25% stronger.</p></div>
    <div class="card in"><h4>🗳️ Offices</h4>${rows}${office ? `<button class="btn" data-a="panel" data-x="office">OFFICE DECISIONS — ${esc(office.title)}</button>` : ''}</div>`);
};
const countryBody = () => {
  const cs = country(S.home), k = W.byA3[S.home], cap = W.cities[k.capital];
  const gdpSorted = W.playable.slice().sort((a, b) => b.gdp0 - a.gdp0);
  const gdpRank = gdpSorted.findIndex(c => c.a3 === S.home) + 1;
  const adv = countryAdvisor();
  const top3 = gdpSorted.slice(0, 3);
  const hist = S.news.filter(n => n.a3 === S.home).slice(0, 6);
  return panelShell('Your country', `${k.flag} ${esc(cname(S.home))} · ${esc(countryStatus(S.home).t)}`,
    `<div class="country-hero"><div class="row start"><div class="flag-big">${k.flag}</div><div><h2>${esc(cname(S.home))}</h2><div class="muted-light">Capital ${cap ? esc(cap.name) : ''} · Population ${fmtPop(nationPop())}</div></div></div>
    <div class="stats4"><div><span>Population</span><b>${fmtPop(nationPop())}</b></div><div><span>Stability</span><b>${Math.round(cs.stab)}/100</b></div><div><span>Military rank</span><b>#${milRank(S.home)}</b></div><div><span>GDP rank</span><b>#${gdpRank}</b></div></div></div>
    ${S.flow ? `<div class="card in"><h4>🌍 Domination</h4><p class="muted small">${(S.dominated || []).length} countries dominated. ${flowDominated(S.home) ? 'You dominate your home country ✓.' : 'To dominate a country: control its flagship (50%+) and buy an office there.'} ${flowCanExpand() ? 'The world is open — you can expand.' : 'Buy an office and hire a full board to open the world.'}</p></div>` : ''}
    <div class="row wrap" style="margin-top:12px"><span class="chip">Corporate tax ${Math.round(cs.tax * 100)}%</span><span class="chip">Stability ${Math.round(cs.stab)}/100</span><span class="chip">Population ${fmtPop(nationPop())}</span><span class="chip">Level ${level()}</span></div>
    <div class="row" style="margin-top:12px"><button class="btn flex" data-a="panel" data-x="nation">NATION / TAX</button><button class="btn flex" data-a="panel" data-x="leader">LEADER</button><button class="btn flex" data-a="panel" data-x="military">MILITARY</button></div>
    <div class="card in"><h4>🧭 Advisor — best next decision</h4><p><b>${adv.title}</b></p><p class="muted small">${adv.body}</p><button class="btn3d orange wide" data-a="${adv.a}" data-x="${adv.x}">${adv.btn}</button></div>
    <h4>Country rankings</h4><div class="card in"><p class="muted small">By GDP, against every country in the world.</p>
    ${top3.map((c, i) => `<div class="kv"><span>#${i + 1} ${c.flag} ${esc(c.name)}</span><b>${fmtMoney(c.gdp0 * 1e6, true)}</b></div>`).join('')}
    ${gdpRank > 3 ? `<div class="kv"><span>#${gdpRank} ${k.flag} ${esc(cname(S.home))} (you)</span><b>${fmtMoney(cs.gdp * 1e6, true)}</b></div>` : ''}
    <div class="kv"><span>Military rank</span><b>#${milRank(S.home)} of ${W.playable.length}</b></div>
    <button class="btn wide" data-a="panel" data-x="leaderboard">SEE ALL RANKINGS</button></div>
    <p class="muted small">Business ratings live in My Companies — this panel is the country only: nation, taxes, military, rankings and history.</p>
    <h4>History</h4><div class="card in">${hist.map(n => `<div class="kv"><span><b>${esc(n.cat)}</b> · ${esc(n.text)}</span><small>${fmtDate(n.d)}</small></div>`).join('') || '<p class="muted small">No history yet — play a week and it lands here.</p>'}</div>`);
};
const nationBody = () => {
  const cs = country(S.home), k = W.byA3[S.home];
  const nbs = k.nb.filter(n => W.byA3[n] && W.byA3[n].playable && W.byA3[n].capital != null).map(n => {
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
    `<div class="stats3 box"><div><span>Treasury</span><b>${fmtMoney(cs.treasury || 0, true)}</b></div><div><span>Business money</span><b>${fmtMoney(S.cash, true)}</b></div><div><span>Debt</span><b>${fmtMoney(cs.debt || 0, true)}</b></div><div><span>Debt / GDP</span><b>${Math.round((cs.debt || 0) / Math.max(1, cs.gdp * 1e6) * 100)}%</b></div></div>
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
  return panelShell(`Invade ${cname(plan.target)}`, `${W.byA3[plan.target].flag} ${esc(cname(plan.target))} · Relations ${getRel(S.home, plan.target)} · Treasury ${fmtMoney((typeof govCash === 'function' ? govCash() : S.cash), true)}`,
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
// War progress display — display only, no war rules live here.
// The control bar reads like the territorial-control maps: red = ground
// the attacker has taken, light blue = ground the defender still holds,
// and the white line is the front itself. The timeline is the weekly
// front history, so a war that runs a week or 100 years shows its arc.
function warProgressHTML(w) {
  const front = Math.round(Math.max(0, Math.min(100, w.front || 50)));
  const atk = esc(cname(w.a)), def = esc(cname(w.b));
  const status = front > 60 ? `${atk} advancing` : front < 40 ? `${def} pushing back` : 'Stalemate — front barely moving';
  const hist = (w.hist || []).filter(p => p && isFinite(p.front));
  let pts = '';
  if (hist.length >= 2) {
    const d0 = hist[0].day, d1 = hist[hist.length - 1].day, span = Math.max(1, d1 - d0);
    pts = hist.map(p => `${((p.day - d0) / span * 300).toFixed(1)},${(80 - Math.max(0, Math.min(100, p.front)) / 100 * 80).toFixed(1)}`).join(' ');
  } else {
    pts = `0,${80 - front / 100 * 80} 300,${80 - front / 100 * 80}`;
  }
  return `<div class="card in"><h4>CONTROL OF TERRITORY</h4><p class="muted small">${status} · Front ${front}%</p>
    <div style="display:flex;height:28px;border-radius:8px;overflow:hidden;position:relative">
      <div style="width:${front}%;background:#e5484d"></div>
      <div style="width:${100 - front}%;background:#7ec3f2"></div>
      <div style="position:absolute;left:${front}%;top:0;bottom:0;border-left:3px dashed #fff"></div>
    </div>
    <div class="row between" style="margin-top:6px"><span class="muted small">■ ${atk} controls ${front}%</span><span class="muted small">■ ${def} holds ${100 - front}%</span></div>
    <h4 style="margin-top:14px">FRONT OVER TIME</h4>
    <svg viewBox="0 0 300 90" style="width:100%;background:#fff;border-radius:8px"><polyline points="${pts}" fill="none" stroke="#e5484d" stroke-width="2"/><line x1="0" y1="80" x2="300" y2="80" stroke="#cbd5e1" stroke-width="1"/><text x="2" y="12" font-size="9" fill="#64748b">100% attacker</text><text x="2" y="88" font-size="9" fill="#64748b">0% defender</text></svg>
    <p class="muted small">${hist.length} weekly samples · Started ${fmtDate(w.start)} · ${Math.floor((S.day - w.start) / 365)} years, ${(S.day - w.start) % 365} days in</p></div>`;
}
function warMiniBarHTML(w) {
  const front = Math.round(Math.max(0, Math.min(100, w.front || 50)));
  return `<div class="kv"><span>${esc(cname(w.a))} vs ${esc(cname(w.b))}</span><b>Front ${front}%</b></div><div style="display:flex;height:14px;border-radius:7px;overflow:hidden;margin:2px 0 10px"><div style="width:${front}%;background:#e5484d"></div><div style="width:${100 - front}%;background:#7ec3f2"></div></div>`;
}
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
    ${warProgressHTML(w)}
    <div class="kv"><span>${esc(cname(w.a))} — troops</span><b>${Math.round(w.troopsA)}%</b></div><div class="kv"><span>${esc(cname(w.a))} — weapons</span><b>${Math.round(w.weaponsA)}%</b></div><div class="kv"><span>${esc(cname(w.a))} — money spent</span><b>${fmtMoney(w.spentA, true)}</b></div>
    <div class="kv"><span>${esc(cname(w.b))} — troops</span><b>${Math.round(w.troopsB)}%</b></div><div class="kv"><span>${esc(cname(w.b))} — weapons</span><b>${Math.round(w.weaponsB)}%</b></div><div class="kv"><span>${esc(cname(w.b))} — money spent</span><b>${fmtMoney(w.spentB, true)}</b></div>
    <h4>ALL WARS — PROGRESS BY COUNTRY</h4>${(S.wars || []).map(x => warMiniBarHTML(x)).join('') || '<p class="muted small">No other wars.</p>'}
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
  return `<h2>${ICONS.minigames} App Store — battle grid</h2><p class="muted small">Standalone · No country, no consequences · ${b.w} × ${b.h}${b.shape !== 'grid' ? ' · ' + b.shape : ''} board</p>` + battleHTML(b, { tile: 'miniTile', tool: 'miniTool', leave: 'miniLeave', wait: 'miniWait', again: 'miniAgain' });
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
  if (!b) return panelShell('App Store', 'Battle grid, no country needed — no consequences, play again as much as you like.',
    `<div class="row wrap">${BATTLE_SIZE_OPTIONS.map(o => `<button class="btn" data-a="miniPanelStart" data-x="${o.id}">${o.shape === 'ring' ? '⭕' : '▦'} ${o.label}${o.shape !== 'grid' ? ' · ' + o.shape : ''}</button>`).join('')}</div>
    <p class="muted small">Pick a board: smaller than 6×6, 6×6, bigger, wide, tall, or a ring. Each side starts with 50 units in a corner, and every tile you own makes 1 unit per second.</p>`);
  battleTickRender(b);
  return panelShell('App Store — battle grid', 'Standalone · No country, no consequences', battleHTML(b, { tile: 'miniPanelTile', tool: 'miniPanelTool', leave: 'miniPanelLeave', again: 'miniPanelAgain' }));
};
const militaryBody = () => {
  const cs = country(S.home);
  return panelShell('Military', `Power ${Math.round(milPower(S.home)).toLocaleString()} · Rank #${milRank(S.home)}`,
    Object.entries(MILITARY).map(([b, d]) => {
      const lv = cs.milLv[b], cost = milCost(b);
      return `<div class="card in"><h4>${d.icon} ${d.name}</h4><p class="muted small">Now: ${d.levels[lv]}</p>${cost != null ? `<button class="btn" data-a="milUp" data-x="${b}">Upgrade to ${d.levels[lv + 1]} · ${fmtMoney(cost, true)}</button>` : '<span class="tagp green">TOP LEVEL</span>'}</div>`;
    }).join('') +
    `<div class="card in"><h4>🛡️ Military bases</h4><p class="muted small">You start with one base. Each extra base adds +5% to your war power. You have ${facilityCount(S.home)} base${facilityCount(S.home) === 1 ? '' : 's'}.</p><button class="btn" data-a="buyBase">BUY MILITARY BASE · ${fmtMoney(baseCost(), true)}</button></div>
    <h4>Wars elsewhere</h4>${S.wars.map(w => `<div class="kv"><span>${esc(cname(w.a))} vs ${esc(cname(w.b))}</span><b>Ongoing · Front ${Math.round(w.front)}% · Troops ${Math.round(w.troopsA ?? 100)}/${Math.round(w.troopsB ?? 100)}% · Weapons ${Math.round(w.weaponsA ?? 100)}/${Math.round(w.weaponsB ?? 100)}%</b></div>`).join('') || '<p class="muted small">No wars right now.</p>'}${(S.wars || []).some(w => w.a === S.home || w.b === S.home) ? '<button class="btn wide" data-a="panel" data-x="war">OPEN ONGOING WAR</button>' : ''}`);
};
// Nation, Your Country and Military are one app now: Nation.
PANELS.nation = () => nationBody() + countryBody() + militaryBody();
PANELS.country = countryBody;
PANELS.military = militaryBody;
PANELS.estate = () => {
  return panelShell('My Estate', `${S.props.length} buildings · Value ${fmtMoney(propValue(), true)}`,
    `<div class="list">${S.props.map(p => {
      const city = W.cities[p.city];
      return `<button class="srow" data-a="propSheet" data-x="${p.id}"><span class="avatar">🏠</span><span class="sname"><b>${esc(city.name)}, ${esc(cname(city.a3))}</b><small>${p.units} units · ${Math.round(p.occ * 100)}% occupied · Condition ${Math.round(p.cond * 100)}%</small></span><span class="sprice"><b>${fmtMoney(p.value, true)}</b><small>${fmtMoney(p.income, true)}/week</small></span></button>`;
    }).join('') || '<p class="muted small">No buildings yet. Buy one from a city FOR SALE pin.</p>'}</div>`);
};
PANELS.hq = PANELS.company; // HQ and My Companies are one app now.

const goalsBody = () => {
  const stage = CAREER[S.career];
  return panelShell('Daily goals', `Career: ${careerName()} · Streak ${S.daily.streak} days`,
    `<div class="stats3 box"><div><span>Level</span><b>Lv ${level()}</b></div><div><span>XP</span><b>${S.xp}</b></div><div><span>Companies controlled</span><b>${mine().length}</b></div></div>
    ${stage ? `<h4>${stage.name}</h4>${stage.goals.map((g, i) => `<div class="goal ${S.goalsDone.includes(S.career + ':' + i) ? 'done' : ''}"><span>${S.goalsDone.includes(S.career + ':' + i) ? '✓' : '○'}</span>${g.t}</div>`).join('')}` : '<p class="muted small">Legend status reached 👑</p>'}
    <h4>Daily reward</h4><div class="kv"><span>Today</span><b>${fmtMoney(dailyRewardInfo().amount, true)}</b></div><p class="muted small">Added to your cash automatically each day, no claiming needed.</p>`);
};
const progressBody = () => {
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
// ---------- Milestones: progression tree, 10 nodes at a time ----------
const milestonesBody = () => {
  const ci = UI.msCat || 0, cat = MS_CATS[ci];
  const nodes = msNodes(ci);
  const pages = Math.ceil(nodes.length / MS_PAGE_SIZE);
  const pg = Math.min(UI.msPage || 0, pages - 1);
  const page = nodes.slice(pg * MS_PAGE_SIZE, pg * MS_PAGE_SIZE + MS_PAGE_SIZE);
  const sel = msNodeById(UI.msNode) || page[0];
  const prev = sel.prev ? msNodeById(sel.prev) : null;
  const chain = page.map((n, i) => `<div style="display:flex;align-items:center;gap:8px"><button class="btn" style="width:30px;height:30px;border-radius:50%;padding:0;background:#2f9e44;color:#fff;font-size:15px;line-height:30px;text-align:center;flex-shrink:0;${n.id === sel.id ? 'box-shadow:0 0 0 3px #2f7cf6;' : ''}" data-a="msNode" data-x="${n.id}">${n.icon}</button><span><b>${n.title}</b> <span class="muted small">— Reach ${msFmt(n)} ${n.unit}</span></span></div>${i < page.length - 1 ? '<div style="width:3px;height:12px;background:#2f9e44;border-radius:2px;margin-left:13px"></div>' : ''}`).join('');
  return panelShell('Milestones', `${MS_TOTAL} milestones · ${cat.name} · showing ${pg * MS_PAGE_SIZE + 1}–${pg * MS_PAGE_SIZE + page.length} of ${nodes.length}`,
    `<p class="muted small">Progression tree — this is how new stuff unlocks. Everything is unlocked for now; gating comes later.</p>
    <div class="row wrap">${MS_CATS.map((c, i) => `<button class="btn ${i === ci ? 'on' : ''}" data-a="msCat" data-x="${i}">${c.icon} ${c.name}</button>`).join('')}</div>
    <div class="row between"><button class="btn" data-a="msPage" data-x="-1">←</button><b>${page[0].ladder} chain</b><button class="btn" data-a="msPage" data-x="1">→</button></div>
    <div style="display:flex;flex-direction:column;margin:8px 0">${chain}</div>
    <div class="card in"><h4>${sel.icon} ${sel.title}</h4><p>Reach ${msFmt(sel)} ${sel.unit}.</p><p><b>Unlocks:</b> ${esc(sel.gate)}</p><p class="muted small">Requires: ${prev ? esc(prev.title) : 'Nothing — first in its chain.'} · Status: Unlocked ✓</p></div>`);
};
// Daily goals and Progress are one app now: Progress.
PANELS.progress = () => goalsBody() + progressBody() + milestonesBody();
PANELS.goals = goalsBody;
// ---------- Calendar: month grid with the game's real events ----------
const CAL_WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CAL_MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const calDayNum = (y, m, d) => Math.round((Date.UTC(y, m, d) - START_MS) / DAY_MS);
PANELS.calendar = () => {
  const now = dateOf(S.day);
  if (!UI.calYM) UI.calYM = { y: now.getUTCFullYear(), m: now.getUTCMonth() };
  const { y, m } = UI.calYM;
  const sel = (UI.calSel != null) ? UI.calSel : S.day;
  const startWd = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const evs = calendarEvents();
  const byDay = {};
  evs.forEach(e => { const d = dateOf(e.day); if (d.getUTCFullYear() === y && d.getUTCMonth() === m) (byDay[d.getUTCDate()] = byDay[d.getUTCDate()] || []).push(e); });
  let cells = '';
  for (let i = 0; i < startWd; i++) cells += `<span class="wcal-cell blank"></span>`;
  for (let d = 1; d <= dim; d++) {
    const num = calDayNum(y, m, d);
    const chips = (byDay[d] || []).map(e => `<span class="wcal-chip">${esc(e.title)}</span>`).join('');
    cells += `<button class="wcal-cell${num === S.day ? ' today' : ''}${num === sel ? ' sel' : ''}" data-a="calDay" data-x="${num}"><b>${d}</b>${chips}</button>`;
  }
  const selEvs = evs.filter(e => e.day === sel);
  return panelShell('Calendar', '',
    `<div class="wcal"><div class="wcal-head"><button class="btn" data-a="calPrev">‹</button><b>${CAL_MON[m]} ${y}</b><button class="btn" data-a="calNext">›</button><button class="btn" data-a="calToday">Today</button></div>
    <div class="wcal-grid wcal-wd">${CAL_WD.map(w => `<span>${w[0]}</span>`).join('')}</div>
    <div class="wcal-grid">${cells}</div>
    <div class="wcal-sel"><h4>${fmtDate(sel)}</h4>${selEvs.length ? selEvs.map(e => `<div class="card in"><b>${esc(e.title)}</b><p class="muted small">${esc(e.desc || '')}</p></div>`).join('') : '<p class="muted small">Nothing on this day.</p>'}</div></div>`);
};
// ---------- Board meeting ----------
// Once a quarter, the CEO calls the board: set the quarterly dividend
// (a percentage of company value), the CEO base salary, or both —
// leaving one blank keeps it as is. The board votes on their ratings,
// majority wins, and every member says why. Anything voted down keeps
// its current value.
function boardVoteFor(c, m, kind, val) {
  const annual = Math.max(0, (c.avg || 0) * 52);
  const loy = m.loy || 0, exp = m.exp || 0;
  if (kind === 'div') {
    const payout = val * companyValue(c) / 100;
    const affordable = payout <= annual || val <= 25;
    if (affordable && loy >= 40) return { yes: true, reason: 'The payout is affordable — backing your plan.' };
    if (affordable) return { yes: true, reason: 'The numbers work.' };
    if (exp >= 60) return { yes: false, reason: 'This payout is bigger than what we earn.' };
    if (loy >= 75) return { yes: true, reason: 'Backing you, even though it stretches us.' };
    return { yes: false, reason: 'Too big a payout for our earnings.' };
  }
  const affordable = val <= 250000 || val <= Math.max(annual * 0.25, 0);
  if (affordable && loy >= 40) return { yes: true, reason: 'Fair pay for the job — backing your plan.' };
  if (affordable) return { yes: true, reason: 'Reasonable salary.' };
  if (exp >= 60) return { yes: false, reason: 'That salary is too high for our profit.' };
  if (loy >= 75) return { yes: true, reason: 'Backing you, even though it stretches us.' };
  return { yes: false, reason: 'Not convinced this helps the company.' };
}
PANELS.boardMeeting = () => {
  const cur = UI.stack.length ? UI.stack[UI.stack.length - 1] : {};
  const c = S.co[cur.a3] || S.co[S.home];
  const back = `<button class="btn wide" data-a="boardBack" data-x="${c ? c.a3 : ''}">← Back</button>`;
  if (!c) return panelShell('Board meeting', '', back + '<p class="muted small">No company here.</p>');
  if (c.bankrupt) return panelShell('Board meeting', '', `<div class="card in"><b>${esc(c.name)}</b><p class="muted small">This company is bankrupt — it earns nothing until it is rebuilt.</p></div>${back}`);
  const board = (typeof ensureBoard === 'function') ? ensureBoard(c) : [];
  if (!board.length) return panelShell('Board meeting', '', `<div class="card in"><b>${esc(c.name)}</b><p class="muted small">No board yet — hire executives in Offices first, then call a meeting.</p></div>${back}`);
  const q = quarterLabel(S.day);
  if (c.lastBoardQ === q) {
    const r = UI.boardResult && UI.boardResult.a3 === c.a3 ? UI.boardResult : null;
    return panelShell('Board meeting', '', `<div class="card in"><b>${esc(c.name)}</b><p>Already held a board meeting this quarter. The next one opens next quarter.</p>${r ? `<p class="muted small">Last meeting: dividend ${r.divSet != null ? (r.divOk ? 'set to ' + r.divSet + '%' : 'voted down, kept at ' + (c.divPct || 0) + '%') : 'untouched'} · salary ${r.salSet != null ? (r.salOk ? 'set to ' + fmtMoney(r.salSet, true) : 'voted down, kept at ' + fmtMoney(c.ceoSalary || 0, true)) : 'untouched'}</p>` : ''}</div>${r ? `<h4>Votes</h4>${r.votes.map(v => `<div class="card in"><b>${esc(v.name)} · ${esc(v.role)}</b>${v.div != null ? `<p class="muted small">Dividend: ${v.div ? 'Yes' : 'No'} — ${esc(v.divReason)}</p>` : ''}${v.sal != null ? `<p class="muted small">Salary: ${v.sal ? 'Yes' : 'No'} — ${esc(v.salReason)}</p>` : ''}</div>`).join('')}` : ''}${back}`);
  }
  return panelShell('Board meeting', '', `<div class="card in"><b>${esc(c.name)}</b><div class="muted small">Value ${fmtMoney(companyValue(c), true)} · Current dividend ${c.divPct || 0}% of value per quarter · Current CEO salary ${fmtMoney(c.ceoSalary || 0, true)}/yr</div></div>
  <p class="muted small">Set a dividend, a salary, or both. Leave one blank to keep it as is. The board votes and majority wins.</p>
  <label class="muted small">QUARTERLY DIVIDEND (% of company value)</label><input id="boardDiv" class="qty" type="number" min="0" max="100" placeholder="${c.divPct || 0}">
  <label class="muted small">CEO BASE SALARY ($/yr)</label><input id="boardSal" class="qty" type="number" min="0" placeholder="${c.ceoSalary || 0}" style="width:160px">
  <button class="btn3d orange wide" data-a="boardVote" data-x="${c.a3}">TAKE VOTES</button>${back}`);
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
  const cts = W.countries.filter(c => c.playable && c.capital != null && (!q || c.name.toLowerCase().includes(q))).slice(0, 20);
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
    <div class="kv"><span>App Store</span><button class="btn" data-a="toggleMinigames">${minigamesEnabled() ? 'ON' : 'OFF'}</button></div>
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
  if (lgId === 'foot') return `YDS ${s.YDS || 0} TD ${s.TD || 0}`;
  return `PTS ${s.PTS || 0} REB ${s.REB || 0} AST ${s.AST || 0}`;
}
// --- Worl Sports: scores-app layout (layout reference only, original
// leagues/teams only). Scores come from the game's real teams via the
// same seeded weekly slate Tawk uses, so the scoreboard is stable all
// week and changes next week. Views: scores (Yesterday / Today /
// Upcoming) / leagues (follow + search) / league (games + standings).
// Team detail (franchise, players, finance, draft) is unchanged and
// opens when you tap a team anywhere here.
function sportFavs() { if (!S.sportFavs) S.sportFavs = {}; return S.sportFavs; }
function sportLgFavs() { if (!S.sportLgFavs) S.sportLgFavs = {}; return S.sportLgFavs; }
function sportDayTabs() {
  const day = UI.sportDay || 0;
  return `<div class="wsport-tabs">${[['Yesterday', -1], ['Today', 0], ['Upcoming', 1]].map(([label, v]) => `<button class="wsport-tab ${day === v ? 'on' : ''}" data-a="sportDay" data-x="${v}">${label}</button>`).join('')}</div>`;
}
function sportGameCard(g, dayOff) {
  const status = dayOff < 0 ? 'Final' : dayOff > 0 ? 'Upcoming · ' + fmtDate(S.day + dayOff * 7) : g.period;
  const side = (t, s, first) => `<button class="wsport-side" data-a="sportTeam" data-x="${t.id}">${sportBadge(t, 32)}<span class="wsport-tname">${esc(t.name)}</span>${dayOff > 0 ? '' : `<b class="wsport-score">${s}</b>`}</button>`;
  return `<div class="wsport-card">${side(g.away, g.as, true)}<span class="wsport-status">${esc(status)}</span>${side(g.home, g.hs, false)}</div>`;
}
function sportStandingsHTML(lg) {
  const favs = sportFavs();
  const sorted = [...lg.teams].sort((a, b) => b.wins - a.wins);
  const pct = t => (t.wins + t.losses) ? (t.wins / (t.wins + t.losses)).toFixed(3).replace(/^0/, '') : '.000';
  return `<div class="wsport-stand"><div class="wsport-stand-head"><span>#</span><span>Team</span><span>W</span><span>L</span><span>PCT</span><span></span></div>${sorted.map((t, i) => `<div class="wsport-stand-row"><span>${i + 1}</span><button class="wsport-stand-team" data-a="sportTeam" data-x="${t.id}">${sportBadge(t, 24)}${esc(t.name)}</button><span>${t.wins}</span><span>${t.losses}</span><span>${pct(t)}</span><button class="wsport-star" data-a="sportFav" data-x="${t.id}">${favs[t.id] ? '★' : '☆'}</button></div>`).join('')}</div>`;
}
function sportScoresHTML() {
  ensureSports();
  const view = UI.sportView || 'scores', day = UI.sportDay || 0;
  const leagues = (S.sports.leagues || []).slice().sort((a, b) => ((sportLgFavs()[b.id] ? 1 : 0) - (sportLgFavs()[a.id] ? 1 : 0)));
  if (view === 'league') {
    const lg = sportLeague(UI.sportLg || 'base') || leagues[0];
    if (!lg) return panelShell('Sports', '', '<p class="muted">No leagues yet.</p>');
    const games = (typeof tawkSportGames === 'function') ? tawkSportGames(lg.id, day) : [];
    return panelShell('Worl Sports', '',
      `<div class="wsport"><div class="wsport-leaguehead"><button class="wsport-back" data-a="sportView" data-x="scores">← Scores</button><span class="wsport-pill">${lg.icon} ${esc(lg.name)}</span><span></span></div>
      ${sportDayTabs()}
      <h4 class="wsport-h">${day < 0 ? 'Last week' : day > 0 ? 'Next week' : 'This week'} · ${lg.name}</h4>
      ${games.map(g => sportGameCard(g, day)).join('') || '<p class="muted small">No games this week.</p>'}
      <h4 class="wsport-h">Standings · Season ${lg.seasonYear || yearOf(S.day)}</h4>
      ${lg.champion ? `<p class="muted small">🏆 Champion: ${esc(sportTeam(lg.champion).name)}</p>` : '<p class="muted small">No champion yet — age a year to play a season.</p>'}
      ${sportStandingsHTML(lg)}
      <p class="muted small">Tap a team for Franchise, Uniform, Players, Trade, Finance and Draft.</p></div>`);
  }
  if (view === 'leagues') {
    const q = (UI.sportQuery || '').toLowerCase();
    const lgFavs = sportLgFavs(), favs = sportFavs();
    const lgRows = leagues.filter(l => !q || l.name.toLowerCase().includes(q)).map(l => `<div class="wsport-lgrow"><button class="wsport-star" data-a="sportLgFav" data-x="${l.id}">${lgFavs[l.id] ? '★' : '☆'}</button><button class="wsport-lgbtn" data-a="sportLeagueView" data-x="${l.id}"><span>${l.icon}</span><span><b>${esc(l.name)}</b><small>${l.short}</small></span><span>›</span></button></div>`).join('');
    let teamRows = '';
    if (q) {
      const teams = leagues.flatMap(l => l.teams.filter(t => t.name.toLowerCase().includes(q)).map(t => ({ t, l })));
      teamRows = `<h4 class="wsport-h">Teams</h4>${teams.map(({ t, l }) => `<div class="wsport-lgrow"><button class="wsport-star" data-a="sportFav" data-x="${t.id}">${favs[t.id] ? '★' : '☆'}</button><button class="wsport-lgbtn" data-a="sportTeam" data-x="${t.id}">${sportBadge(t, 24)}<span><b>${esc(t.name)}</b><small>${esc(l.name)} · ${t.wins}W - ${t.losses}L</small></span><span>›</span></button></div>`).join('') || '<p class="muted small">No teams match.</p>'}`;
    }
    return panelShell('Worl Sports', '',
      `<div class="wsport"><div class="wsport-leaguehead"><button class="wsport-back" data-a="sportView" data-x="scores">← Scores</button><span class="wsport-pill">My Leagues</span><span></span></div>
      <div class="row"><input id="sportSearch" class="search" placeholder="Teams, Leagues, and…" value="${esc(UI.sportQuery || '')}"><button class="btn" data-a="sportSearch">Search</button></div>
      <h4 class="wsport-h">Leagues</h4>${lgRows || '<p class="muted small">No leagues match.</p>'}${teamRows}
      <p class="muted small">Star a league to pin it first on Scores. Star a team to pin its games under My Teams.</p></div>`);
  }
  // Scores view (default).
  const favIds = Object.keys(sportFavs()).filter(id => sportTeam(id));
  let myTeams = '';
  if (favIds.length) {
    const cards = leagues.flatMap(l => (typeof tawkSportGames === 'function' ? tawkSportGames(l.id, day) : []).filter(g => favIds.includes(g.home.id) || favIds.includes(g.away.id)).map(g => sportGameCard(g, day))).join('');
    myTeams = `<h4 class="wsport-h">★ My Teams</h4>${cards || '<p class="muted small">Your teams play next week.</p>'}`;
  } else {
    myTeams = `<h4 class="wsport-h">★ My Teams</h4><p class="muted small">Star a team in a league's standings to pin its games here.</p>`;
  }
  const sections = leagues.map(l => {
    const games = (typeof tawkSportGames === 'function') ? tawkSportGames(l.id, day) : [];
    return `<button class="wsport-lghead" data-a="sportLeagueView" data-x="${l.id}"><span>${l.icon} ${esc(l.name)}</span><span>${sportLgFavs()[l.id] ? '★ ' : ''}›</span></button>${games.map(g => sportGameCard(g, day)).join('')}`;
  }).join('');
  return panelShell('Worl Sports', '',
    `<div class="wsport"><div class="wsport-top"><b>🏆 Worl Sports</b><button class="wsport-home" data-a="sportView" data-x="leagues">My Leagues</button></div>
    ${sportDayTabs()}${myTeams}${sections}</div>`);
}
// ---------- Mini Games: Hashmark football (pro + college) inside the phone ----------
// The App Store below is the phone's game store: every game listed
// like a real store, with Download putting it on the Home Screen's
// Games page. Deleting a game (long-press its tile, or its store
// page) removes it, and it can be downloaded again any time. The
// battle board stays reachable from the store so nothing that was
// here is lost. Every game is free, so there is no In-App
// Purchases line anywhere in this store.
// ---------- App Store: games you download onto the phone ----------
const STORE_GAMES = [
  { id: 'baseball', name: 'Baseball', sub: 'Pennant GM', icon: '⚾', color: '#12a150', genre: 'Sports', rating: '4.9', ratings: '92K', chart: 1, desc: 'Franchise, MyGM, MyPlayer and My Team. Same 30 teams as Worl Sports.', tag: 'Build a pennant winner.' },
  { id: 'pro', name: 'Pro Football', sub: 'Hashmark GM', icon: '🏈', color: '#7c4dff', genre: 'Sports', rating: '4.8', ratings: '84K', chart: 2, desc: 'Franchise, MyGM and My Team. Real nicknames only: Ravens, Cowboys, Packers.', tag: 'Own a pro franchise.' },
  { id: 'hockey', name: 'Hockey', sub: 'Blueline GM', icon: '🏒', color: '#0ea5b7', genre: 'Sports', rating: '4.8', ratings: '47K', chart: 3, desc: 'Franchise, MyGM, MyPlayer and My Team. Same 30 teams as Worl Sports.', tag: 'Run a hockey franchise.' },
  { id: 'college', name: 'College Football', sub: 'Hashmark College', icon: '🎓', color: '#e0812b', genre: 'Sports', rating: '4.7', ratings: '61K', chart: 4, desc: 'States only: Ohio, Alabama, Texas. Recruiting, transfer portal, NIL.', tag: 'Recruit. Win. Repeat.' },
  { id: 'battle', name: 'Battle Board', sub: 'War mini-game', icon: '⚔️', color: '#e5484d', genre: 'Strategy', rating: '4.6', ratings: '23K', chart: 5, desc: 'The 6×6 war mini-game.', tag: 'Outthink the board.', builtin: true },
  { id: 'tennis', name: 'Tennis', sub: 'Match', icon: '🎾', color: '#65a30d', genre: 'Sports', rating: '4.7', ratings: '38K', chart: 6, desc: 'A fast tennis match against the CPU — 15, 30, 40, deuce, first to 4 games.', tag: 'Serve. Rally. Win.' },
  { id: 'brainrot', name: 'Brain Rot', sub: 'Meme Feed', icon: '🧠', color: '#ff3d8b', genre: 'Social', rating: '4.5', ratings: '1K', chart: 7, desc: 'A snap-scrolling meme feed with animated stories, live streams, series, DMs, and coins. All fake, all on your device.', tag: 'Scroll. Laugh. Rot.' },
];
const storeGame = id => STORE_GAMES.find(g => g.id === id);
const downloadedGames = () => { if (typeof S === 'undefined' || !S) return []; if (!Array.isArray(S.downloaded)) S.downloaded = []; return S.downloaded.map(storeGame).filter(Boolean); };
const isDownloaded = id => (typeof S !== 'undefined' && S && S.downloaded || []).includes(id);
function storeTabsHTML(tab) {
  const tabs = [['today', '📰', 'Today'], ['games', '🚀', 'Games'], ['apps', '🗂️', 'Apps'], ['arcade', '🕹️', 'Arcade'], ['search', '🔍', 'Search']];
  return `<div class="as-tabs">${tabs.map(([k, ic, t]) => `<button class="as-tab ${tab === k ? 'on' : ''}" data-a="storeTab" data-x="${k}"><span>${ic}</span><span>${t}</span></button>`).join('')}</div>`;
}
function storeDlBtn(g) {
  if (g.builtin || isDownloaded(g.id)) return `<button class="store-dl" data-a="mgplayPhone" data-x="${g.id}">Open</button>`;
  return `<button class="store-dl" data-a="storeDl" data-x="${g.id}">Download</button>`;
}
function storeRowHTML(g) {
  return `<div class="store-row" data-a="storeGame" data-x="${g.id}"><span class="store-row-ic" style="background:${g.color}">${g.icon}</span><span class="store-row-mid"><b>${esc(g.name)}</b><span>${esc(g.sub)} · ${esc(g.genre)}</span></span>${storeDlBtn(g)}</div>`;
}
function storeDetailHTML(g) {
  const dl = isDownloaded(g.id) || g.builtin;
  const del = UI.storeDelConfirm === g.id
    ? `<div class="store-del-confirm"><b>Delete ${esc(g.name)} from your phone?</b><p>You can download it again from the App Store any time.</p><div class="row gap"><button class="btn3d wide" data-a="storeDel" data-x="${g.id}">DELETE</button><button class="btn wide" data-a="storeDelCancel">KEEP IT</button></div></div>`
    : (dl && !g.builtin ? `<button class="store-del" data-a="storeDelAsk" data-x="${g.id}">Delete from Phone</button>` : '');
  return `<div class="store">
    <button class="store-back" data-a="storeBack" aria-label="Back">←</button>
    <div class="store-detail">
      <span class="store-detail-ic" style="background:${g.color}">${g.icon}</span>
      <h2>${esc(g.name)}</h2>
      <div class="store-detail-sub">${esc(g.sub)}</div>
      ${dl ? `<button class="store-get" data-a="mgplayPhone" data-x="${g.id}">Open</button>` : `<button class="store-get" data-a="storeDl" data-x="${g.id}">Download</button>`}
      <div class="store-stats">
        <div><span>${g.ratings} RATINGS</span><b>★ ${g.rating}</b></div>
        <div><span>AGE</span><b>4+</b></div>
        <div><span>CHART</span><b>#${g.chart} · ${esc(g.genre)}</b></div>
      </div>
      <div class="store-banner" style="background:linear-gradient(135deg, ${g.color}, #111827)"><span class="store-banner-ic">${g.icon}</span><span>${esc(g.tag)}</span></div>
      <p class="store-desc">${esc(g.desc)}</p>
      ${del}
    </div>
    ${storeTabsHTML(UI.storeTab || 'games')}
  </div>`;
}
function storeHTML() {
  const tab = UI.storeTab || 'games';
  const g = UI.storeGame ? storeGame(UI.storeGame) : null;
  if (g) return panelShell('App Store', '', storeDetailHTML(g));
  const q = (UI.storeQuery || '').toLowerCase();
  const filt = UI.storeFilter || 'all';
  let list = STORE_GAMES;
  if (tab === 'search' && q) list = list.filter(x => (x.name + ' ' + x.sub + ' ' + x.genre).toLowerCase().includes(q));
  if (tab === 'games' && filt !== 'all') list = list.filter(x => x.genre.toLowerCase() === filt);
  const rows = list.map(storeRowHTML).join('') || '<p class="store-note">No games match that.</p>';
  let body = '';
  if (tab === 'today') {
    const feat = storeGame('hockey') || STORE_GAMES[0];
    body = `<h1 class="store-title">Today</h1>
      <div class="store-hero"><span class="store-hero-kicker">NOW AVAILABLE</span><b>Try the newest GM</b>
        <div class="store-hero-card"><span class="store-row-ic" style="background:${feat.color}">${feat.icon}</span><span class="store-row-mid"><b>${esc(feat.name)}</b><span>${esc(feat.sub)}</span></span>${storeDlBtn(feat)}</div>
      </div>
      <h3 class="store-section">Great Games</h3>${STORE_GAMES.map(storeRowHTML).join('')}`;
  } else if (tab === 'games') {
    body = `<h1 class="store-title">Games</h1>
      <div class="store-pills">${[['all', 'All'], ['sports', 'Sports'], ['strategy', 'Strategy']].map(([k, t]) => `<button class="store-pill ${filt === k ? 'on' : ''}" data-a="storeFilter" data-x="${k}">${t}</button>`).join('')}</div>
      ${rows}`;
  } else if (tab === 'search') {
    body = `<h1 class="store-title">Search</h1>
      <div class="store-search"><input id="storeQ" class="store-input" value="${esc(UI.storeQuery || '')}" placeholder="Games"><button class="store-search-btn" data-a="storeSearch">Search</button></div>
      ${rows}`;
  } else if (tab === 'apps') {
    body = `<h1 class="store-title">Apps</h1><p class="store-note">This store carries games only.</p>`;
  } else {
    body = `<h1 class="store-title">Arcade</h1><p class="store-note">No Arcade titles in this store.</p>`;
  }
  return panelShell('App Store', '', `<div class="store">${body}${storeTabsHTML(tab)}</div>`);
}
const OLD_MINIGAMES_PANEL = PANELS.minigames;
PANELS.minigames = () => {
  if (UI.mgGame === 'pro' || UI.mgGame === 'college' || UI.mgGame === 'baseball' || UI.mgGame === 'hockey' || UI.mgGame === 'tennis' || UI.mgGame === 'brainrot') {
    const src = { pro: 'minigames/pro.html?v=20261026dv', college: 'minigames/college.html?v=20261026dv', baseball: 'minigames/baseball.html?v=20261026dx', hockey: 'minigames/hockey.html?v=20261026ed', tennis: 'minigames/tennis.html?v=20261026fi', brainrot: 'minigames/brainrot/index.html?v=20261026fm' }[UI.mgGame];
    const title = { pro: 'Pro Football', college: 'College Football', baseball: 'Baseball', hockey: 'Hockey', tennis: 'Tennis', brainrot: 'Brain Rot' }[UI.mgGame];
    if (UI.inPhone) return panelShell('App Store', '', `<div class="mg-wrap"><iframe class="mg-frame" src="${src}" title="${title}"></iframe></div>`);
    return panelShell('App Store', '', `<div class="mg-wrap"><div class="row between"><button class="btn" data-a="mgmenu">← App Store</button><span class="muted small">${title} · saves in this browser</span></div><iframe class="mg-frame" src="${src}" title="${title}"></iframe></div>`);
  }
  if (UI.mgGame === 'battle') return OLD_MINIGAMES_PANEL();
  return storeHTML();
};
// Team shield badge: same logo as the Mini Games baseball teams (abbr on a
// shield in the team's colours). Falls back to the old letter/color for
// pre-shared saves, and follows the owner's logo/color pickers (t.logo/t.color).
function sportBadge(team, s) {
  s = s || 32; const ab = esc(team.logo || team.abbr || '?');
  const c1 = team.color || team.c1 || '#334155', c2 = team.c2 || '#ffffff';
  return `<svg width="${s}" height="${Math.round(s * 1.12)}" viewBox="0 0 40 45" style="flex:none" aria-hidden="true"><path d="M20 1.5 37.5 7v15.5c0 10.5-7.6 17.6-17.5 21-9.9-3.4-17.5-10.5-17.5-21V7z" fill="${c1}" stroke="${c2}" stroke-width="2.2"/><text x="20" y="27" text-anchor="middle" font-weight="700" font-size="${ab.length > 3 ? 10.5 : 12.5}" fill="${c2}">${ab}</text></svg>`;
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
      body += `<div class="card in"><div class="row between"><div><b>${esc(t.name)}</b><div class="muted small">${lg.name} · ${place <= 5 ? 'East' : 'West'} Division · Season ${lg.seasonYear}</div></div>${sportBadge(t, 44)}</div>
      <div class="stats3 box"><div><span>Record</span><b>${t.wins}W - ${t.losses}L</b></div><div><span>Place</span><b>${place} / ${lg.teams.length}</b></div><div><span>Value</span><b>${fmtMoney(t.value, true)}</b></div></div>
      <p class="muted small">${esc(t.name)} is a professional ${lg.short.toLowerCase()} team in ${esc(t.cityName)}. Stadium: ${esc(t.stadium.name)}, ${t.stadium.capacity.toLocaleString()} seats, level ${t.stadium.level}. Owner: ${mine ? 'You' : 'Independent club'}.</p>
      <h4>History</h4>${t.history.map(h => `<div class="kv"><span>${h.year} ${h.champion ? '🏆 Champion' : 'Regular season'}</span><b>${h.place}${h.place === 1 ? 'st' : h.place === 2 ? 'nd' : h.place === 3 ? 'rd' : 'th'} · ${h.wins}-${h.losses}</b></div>`).join('') || '<p class="muted small">No seasons played yet. Age a year to play a season.</p>'}
      ${!mine ? walletPickerHTML() : ''}${mine ? `<button class="btn" data-a="stadiumUp" data-x="${t.id}">UPGRADE STADIUM ${fmtMoney(40000000 * t.stadium.level, true)}</button>` : `<button class="btn3d orange wide" data-a="buyTeam" data-x="${t.id}">OFFER PURCHASE · ${fmtMoney(t.value, true)}</button>`}</div>`;
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
  return sportScoresHTML();
};
PANELS.stores = () => {
  ensureStores();
  const storeId = UI.stack[0];
  if (storeId) {
    const st = storeById(storeId); if (!st) return panelShell('Stores', '', '<p class="muted">Store not found.</p>');
    const tab = UI.storeTab || 'service', def = STORE_TYPES[st.type] || STORE_TYPES.coffee, share = storeMarketShare(st);
    const tabs = ['service', 'product', 'marketing', 'finance'];
    let body = '';
    if (tab === 'service') {
      const m = st.manager, bar = v => `<div class="skillbar"><div style="width:${v}%"></div></div>`;
      const seg = v => `<div class="segbar"><div style="width:${v}%"></div></div>`;
      const showStaff = UI.storeStaffShow === st.id, ms = syncStaffMembers(st), sk = staffSkill(st), mo = staffMorale(st);
      const staffSec = !showStaff ? '' : `<div class="card in staff-sec"><h4>FLOOR STAFF</h4>${ms.length ? `<div class="staff-row">${ms.map(mem => `<div class="staff-box">${portraitSVG(mem.look, 84)}${mem.star ? '<span class="staff-star">⭐</span>' : ''}<small>${esc(mem.name)}</small><small>★ ${mem.rating}</small></div>`).join('')}${st.delegation.staffing ? '' : `<button class="staff-plus" data-a="storeHire" data-x="${st.id}" title="Hire staff">+</button>`}</div>` : (st.delegation.staffing ? '<p class="muted small">No staff yet — your manager hires automatically.</p>' : `<button class="staff-plus" data-a="storeHire" data-x="${st.id}" title="Hire staff">+</button>`)}${st.delegation.staffing && ms.length ? '<p class="muted small">Staffing delegated — your manager hires automatically.</p>' : ''}<p class="muted small">Staff Skill ${sk}</p>${seg(sk)}<p class="muted small">Staff Morale ${mo}</p>${seg(mo)}</div>`;
      body += `<div class="card in"><div class="mgr-row"><div class="mgr-portrait">${portraitSVG(m.look, 116)}${m.star ? '<span class="staff-star">⭐</span>' : ''}</div><div class="mgr-info"><h4>Manager · ${esc(m.name)} · Lv ${m.level || 1}</h4><p class="muted small">Manager since ${m.since} · Staff ${st.staff} / ${typeof storeStaffCap === 'function' ? storeStaffCap(st) : 50} · Store Lv ${st.level || 1}</p><p class="muted small">Salary ${fmtMoney(m.salary)}/yr</p><p class="muted small">Employee levels are earned, not bought: manager Lv 2 unlocks at Progress Lv 5, Lv 3 at 15, Lv 4 at 30, Lv 5 at 50. Firing hires a replacement at your highest unlocked level.</p><p class="muted small">People ${m.people}</p>${bar(m.people)}<p class="muted small">Product ${m.product}</p>${bar(m.product)}<p class="muted small">Marketing ${m.marketing}</p>${bar(m.marketing)}<p class="muted small">Ethics ${m.ethics}</p>${bar(m.ethics)}</div></div><h4>MANAGER DELEGATION</h4>${Object.entries({ staffing: 'Delegate staffing and salary', products: 'Delegate products and pricing', marketing: 'Delegate store marketing', troubles: 'Delegate store troubles' }).map(([k, label]) => `<div class="kv"><span>${label}</span><button class="btn" data-a="storeDel" data-x="${st.id}|${k}">${st.delegation[k] ? 'ON' : 'OFF'}</button></div>`).join('')}<button class="btn" data-a="fireMgr" data-x="${st.id}">FIRE MANAGER</button></div><div class="staff-toggle-row"><button class="btn staff-btn ${showStaff ? 'on' : ''}" data-a="storeStaffShow" data-x="${st.id}">👥 Staff</button><button class="btn" data-a="storeTab" data-x="product">📦 Products</button></div>${staffSec}<div class="card in"><h4>CUSTOMER REVIEWS ${st.reviews.overall} ★ · ${st.reviews.count} reviews</h4><div class="kv"><span>Price</span><b>${st.reviews.price.toFixed(1)}</b></div><div class="kv"><span>Product</span><b>${st.reviews.product.toFixed(1)}</b></div><div class="kv"><span>Service</span><b>${st.reviews.service.toFixed(1)}</b></div><div class="kv"><span>Atmosphere</span><b>${st.reviews.atmosphere.toFixed(1)}</b></div></div>`;
    } else if (tab === 'product') {
      const nextUp = (st.level || 1) + 1, upNeed = storeUpgradeUnlock(nextUp);
      body += `<div class="card in">${st.products.map((p, i) => { const d = p.prevSold ? (p.sold - p.prevSold) / Math.max(1, p.prevSold) : 0; return `<div class="kv"><span><b>${esc(p.name)}</b> · Lv ${p.lvl || 1} · ${p.sold.toLocaleString()} sold ${d >= 0 ? '+' : ''}${(d * 100).toFixed(0)}%</span><b>${fmtMoney(p.price)}</b></div><div class="row"><button class="btn" data-a="storePrice" data-x="${st.id}|${i}|-0.5">− $0.50</button><button class="btn" data-a="storePrice" data-x="${st.id}|${i}|0.5">+ $0.50</button>${(p.lvl || 1) >= 5 ? '<span class="muted small">Fully developed</span>' : `<button class="btn" data-a="storeDev" data-x="${st.id}|${i}">DEVELOP · ${fmtMoney(productDevCost(p), true)}</button>`}</div>`; }).join('')}
      <h4>DEVELOP THIS STORE · Lv ${st.level || 1} / 5</h4><p class="muted small">Each store level adds 10% to customer demand. Developing products and upgrading the store is how a shop grows — opening one alone never makes trillions.</p>
      ${(st.level || 1) >= 5 ? '<p class="muted small">Fully upgraded.</p>' : (progressLevel() < upNeed ? `<p class="muted small">🔒 Store Lv ${nextUp} unlocks at Progress Lv ${upNeed}.</p>` : `<button class="btn3d orange wide" data-a="storeUp" data-x="${st.id}">UPGRADE TO LV ${nextUp} · ${fmtMoney(storeUpgradeCost(st), true)}</button>`)}
      <h4>LOGO</h4><p class="muted small">Pick an icon for this business. It shows on the city map, in the store list and here.</p>
      <div class="row"><span>${(typeof storeIconHTML === 'function' ? storeIconHTML(st.icon || def.icon, 28) : (st.icon || def.icon))}</span><button class="btn" data-a="storeIconOpen" data-x="${st.id}">CHANGE LOGO</button></div>
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
    body += `<div class="store-tabs">${tabs.map(x => `<button class="store-tab ${tab === x ? 'on' : ''}" data-a="storeTab" data-x="${x}">${x[0].toUpperCase() + x.slice(1)}</button>`).join('')}</div>`;
    return panelShell(`${(typeof storeIconHTML === 'function' ? storeIconHTML(st.icon || def.icon, 28) : (st.icon || def.icon))} ${esc(st.name)} · Lv ${st.level || 1}`, `${esc(st.address)} · Rent ${fmtMoney(st.rent)}/week · Foot traffic ${st.footTraffic.toLocaleString()}/week`, `<div class="storeview">${body}</div>`);
  }
  return panelShell('Stores', 'Stores you built from a FOR LEASE lot. Tap one to manage it.',
    `<div class="list">${S.stores.map(st => `<button class="srow" data-a="storeOpen" data-x="${st.id}"><span class="avatar">${(typeof storeIconHTML === 'function' ? storeIconHTML(st.icon || (STORE_TYPES[st.type] || STORE_TYPES.coffee).icon, 26) : (st.icon || (STORE_TYPES[st.type] || STORE_TYPES.coffee).icon))}</span><span class="sname"><b>${esc(st.name)}</b><small>${esc(st.address)} · ${st.reviews.overall}★ · ${st.staff} staff</small></span><span class="sprice"><b>${fmtMoney((st.weeks[0] || { income: 0 }).income, true)}/week</b><small>${fmtMoney((st.weeks[0] || { rev: 0 }).rev, true)} rev</small></span></button>`).join('') || '<p class="muted small">No stores yet. Open a city, tap a FOR LEASE pin, and press BUILD STORE.</p>'}</div>
    <p class="muted small">Stores earn every in-game week: customers pay, the store pays rent, wages, ingredients and campaigns, and the net lands in your cash.</p>`);
};


PANELS.capital = () => {
  const govRows = govBuildingsFor(S.home).map(g => `<div class="kv"><span>${g.icon} ${esc(g.name)}<br><small class="muted">${esc(g.desc)}<br>${esc(g.effect)}</small></span>${g.link === 'departures' ? '<button class="btn" data-a="departures">OPEN AIRPORT</button>' : g.link ? `<button class="btn" data-a="panel" data-x="${g.link}">OPEN</button>` : ''}</div>`).join('');
  if (!S.leader) return panelShell('Capital', 'Government-only city', `<p class="muted small">Capitals hold the government, not businesses. No new stores or building purchases here — but everything already built keeps working. These are the buildings in your capital. Tap them in the city view, or open their panels from here.</p><div class="list">${govRows}</div>`);
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
    <h4>Government buildings</h4><p class="muted small">The capital is government-only: these buildings are its content. Tap them in the city view too.</p><div class="list">${govRows}</div>
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
    return `<div class="card in"><div class="row between"><div><b>${esc(c.name)}</b><div class="muted small">${c.kind} · ${esc(k.name)} · ${km}</div></div><button class="btn3d orange" data-a="airportFly" data-x="${c.id}">Go →</button></div></div>`;
  }).join('');
  return panelShell('Airport', `${esc(k.name)} — departures from ${esc(from.name)}.`,
    `<button class="btn" data-a="airportBack2">← COUNTRIES</button><div class="list">${rows}</div>`);
};
PANELS.mars = () => marsPanelHTML();
PANELS.casino = () => casinoPanelHTML();
PANELS.crypto = () => {
  // Resume movements interrupted by a reload (settle ones whose 30
  // seconds already passed, restart the timer for the rest).
  if (typeof cryptoResumeMoves === 'function') cryptoResumeMoves();
  return cryptoPanelHTML();
};
PANELS.offices = () => {
  const boardRow = (e, kind, id) => {
    const b = (typeof ensureBoard === 'function') ? ensureBoard(e) : [];
    const ceoRow = `<div class="kv"><span>CEO · You</span><b>Owner — this seat is yours, not hired</b></div>`;
    const rows = BOARD_ROLES.map(r => {
      const info = (typeof EXEC_ROLE_INFO !== 'undefined' && EXEC_ROLE_INFO[r.role]) || {};
      const infoLine = `<p class="muted small">${info.domain || ''} · ${info.hires || ''}</p>`;
      const m = b.find(x => x.role === r.role);
      if (m) {
        const grant = m.grant ? ` · Grant: ${m.grant.shares.toLocaleString()} ${m.grant.type === 'option' ? 'stock options' : 'RSUs'}${m.grant.strike != null ? ` @ ${fmtMoney(m.grant.strike)}` : ''} (4yr vest, 1yr cliff)` : '';
        const star = m.star ? ' ⭐ developable' : '';
        let advisor = '';
        if (r.role === 'CFO' && kind === 'co') {
          const fc = (typeof cfoForecast === 'function') ? cfoForecast(e) : null;
          const ipoOk = (typeof boardFull === 'function' && boardFull(e) && (e.weekProfitStreak || 0) >= 2);
          advisor = `<p class="muted small">CFO advice — IPO: ${e.listed ? 'already public' : (ipoOk ? 'ready' : 'needs a full board and 2 profitable weeks')} · Business loans: ${(S.loans || []).length} · Forecast next quarter: ${fc == null ? 'not enough data yet' : fmtMoney(fc, true)}</p>`;
        }
        return `<div class="kv"><span>${r.role} · ${esc(m.name)} · Lv ${m.level || 1} · L${m.lead} E${m.exp} Y${m.loy}${star}</span><b>${fmtMoney(m.salary)}/yr <button class="btn small" data-a="fireBoard" data-x="${kind}|${id}|${r.role}">FIRE</button></b></div>${infoLine}<p class="muted small">${grant}</p>${advisor}`;
      }
      return `<div class="kv"><span>${r.role} · empty</span><b><button class="btn" data-a="findCand" data-x="${kind}|${id}|${r.role}">FIND CANDIDATES</button></b></div>${infoLine}`;
    }).join('');
    return ceoRow + rows;
  };
  // Managers hired by your executives, on company cards only. The
  // CFO hires nobody, so there is no CFO row here.
  const mgrSection = (c) => {
    const mgrs = (typeof ensureExecManagers === 'function') ? ensureExecManagers(c) : {};
    const row = (kind, label, execRole, mgr) => {
      if (mgr) {
        let extra = '';
        if (kind === 'marketing') extra = ` · Staff ${mgr.employees || 0} <button class="btn small" data-a="hireMktEmp" data-x="${c.a3}">HIRE STAFF</button>`;
        if (kind === 'tech') extra = ` · Tech ${mgr.tech || 0}/99${(mgr.milestones || []).length ? ` · ${(mgr.milestones || []).join(', ')}` : ''}`;
        return `<div class="kv"><span>${label} · ${esc(mgr.name)} · Lv ${mgr.level} · Skill ${mgr.skill}${mgr.star ? ' ⭐ developable' : ''}${extra}</span><b>${fmtMoney(mgr.salary)}/yr <button class="btn small" data-a="fireExecMgr" data-x="${c.a3}|${kind}">FIRE</button></b></div>`;
      }
      return `<div class="kv"><span>${label} · empty</span><b><button class="btn" data-a="hireExecMgr" data-x="${c.a3}|${kind}">HIRE (${execRole} hires)</button></b></div>`;
    };
    let candList = '';
    if (UI.mgrHire && UI.mgrHire.id === c.a3) {
      const kind = UI.mgrHire.kind;
      const cands = (typeof execManagerCandidates === 'function') ? execManagerCandidates(c, kind) : [];
      candList = `<div class="card in"><h4>Hire ${kind} manager — ${esc(c.name)}</h4><p class="muted small">Pick one. A manager's level never exceeds their executive's level. ⭐ means developable: they improve over time, up to a personal cap below 99.</p>${cands.map(x => `<div class="kv"><span>${esc(x.name)} · Lv ${x.level} · Skill ${x.skill}${x.star ? ' ⭐ developable' : ''}</span><b>${fmtMoney(x.salary)}/yr <button class="btn small" data-a="hireExecMgrDo" data-x="${c.a3}|${kind}|${x.id}">HIRE</button></b></div>`).join('')}<button class="btn" data-a="mgrHireCancel">CANCEL</button></div>`;
    }
    return `<div class="card in"><h4>Managers — hired by your executives</h4><p class="muted small">The CFO hires nobody: IPO, loans and forecasts are advice. Every other executive hires a manager in their own domain.</p>${row('product', 'Product manager', 'CPO', mgrs.product)}${row('marketing', 'Marketing manager', 'CMO', mgrs.marketing)}${row('tech', 'Technology manager', 'CTO', mgrs.tech)}${candList}</div>`;
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
      ${cands.map(c => `<div class="card in"><b>${esc(c.name)} · Lv ${c.level}${c.star ? ' ⭐ developable' : ''}</b><div class="muted small">${esc(c.title)}</div>
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
    return `<div class="card in"><h4>Offer to ${esc(c.name)} — ${h.role}</h4><p class="muted small">Lv ${c.level}${c.star ? ' ⭐ developable' : ''} · L${c.lead} E${c.exp} Y${c.loy} · Their ask: ${fmtMoney(c.ask)}/yr. They accept at their ask, or at 85% of ask with a grant covering the gap. Below that, they decline and move on.</p>
      <div class="kv"><span>Offer salary</span><span><button class="btn small" data-a="hireStep" data-x="-10000">−</button> <b>${fmtMoney(h.salary)}/yr</b> <button class="btn small" data-a="hireStep" data-x="10000">+</button></span></div>
      ${isTeam ? '<p class="muted small">Teams pay salary only — no stock grants.</p>' : `<div class="kv"><span>Grant</span><span><button class="btn small ${h.grant === 'none' ? 'on' : ''}" data-a="hireGrant" data-x="none">None</button> <button class="btn small ${h.grant === 'option' ? 'on' : ''}" data-a="hireGrant" data-x="option">Stock option</button> <button class="btn small ${h.grant === 'rsu' ? 'on' : ''}" data-a="hireGrant" data-x="rsu">RSU</button></span></div>
      ${h.grant !== 'none' ? `<div class="kv"><span>Grant shares</span><span><button class="btn small" data-a="hireShares" data-x="-100">−</button> <b>${h.shares.toLocaleString()}</b> <button class="btn small" data-a="hireShares" data-x="100">+</button></span></div><div class="kv"><span>Grant value now</span><b>${fmtMoney(gv, true)}</b></div><p class="muted small">Grants vest over 4 years with a 1-year cliff.</p>` : ''}`}
      <button class="btn3d orange wide" data-a="offerBoard">OFFER ${fmtMoney(h.salary)}/YR${h.grant !== 'none' && !isTeam ? ` + ${h.shares.toLocaleString()} ${h.grant === 'option' ? 'OPTIONS' : 'RSUs'}` : ''}</button>
      <button class="btn" data-a="hireCancel">CANCEL</button></div>`;
  };
  const companies = Object.values(S.co).filter(c => controlled(c.a3));
  const teams = (typeof ownedSportTeams === 'function') ? ownedSportTeams() : [];
  const compCards = companies.map(c => `<div class="card in"><b>${esc(c.name)}</b><div class="muted small">${esc(cname(c.a3))} · Valuation ${fmtMoney(companyFairTotal(c), true)} · Rating ${c.rating.toFixed(1)} / 5</div><div class="muted small">Valuation = profit ${fmtMoney(Math.max(0, c.avg * 52), true)}/yr × P/E ${c.pe.toFixed(1)} + book ${fmtMoney((c.book != null ? c.book : (typeof bookValue === 'function' ? bookValue(c) : 0)), true)} × 0.6. Share price × shares is market cap, not valuation.</div>${S.flow ? (c.office ? `<div class="kv"><span>Office</span><b>Opened</b></div>` : `<div class="row"><button class="btn" data-a="buyOffice" data-x="${c.a3}">BUY OFFICE (${fmtMoney(50000, true)})</button><span class="muted small">Needed before hiring a board here.</span></div>`) : ''}
    <div class="kv"><span>Board room</span><b>${(typeof boardFull === 'function' && boardFull(c)) ? 'Full' : 'Not full'}</b></div><div class="kv"><span>Board boost</span><b>+${((typeof boardBoost === 'function' ? boardBoost(c) : 0) * 100).toFixed(1)}% of weekly revenue</b></div><div class="kv"><span>Profitable weeks in a row</span><b>${c.weekProfitStreak || 0} / 2</b></div>
    ${boardRow(c, 'co', c.a3)}
    ${mgrSection(c)}
    ${c.bankrupt ? '<p class="muted small">Bankrupt — this company earns nothing until it is rebuilt.</p>' : ''}
    <button class="btn wide" data-a="boardMeeting" data-x="${c.a3}">BOARD MEETING</button>
    ${c.bankrupt ? '' : c.listed ? '<p class="muted small">Already public.</p>' : `<p class="muted small">IPO at a valuation you set, selling 5–100%, minus a 7% fee. Needs a full board and 2 profitable weeks.</p><div class="row"><label class="muted small">SELL %</label><input id="ipoPct-${c.a3}" class="qty" type="number" value="100" min="5" max="100"><label class="muted small">VALUATION</label><input id="ipoVal-${c.a3}" class="qty" type="number" value="${Math.round(companyFairTotal(c))}" style="width:140px"></div><button class="btn3d orange wide" data-a="ipo" data-x="${c.a3}">IPO THIS COMPANY</button>`}
    <button class="btn" data-a="officeAd" data-x="${c.a3}">📣 ADVERTISING FOR THIS COMPANY</button></div>`).join('') || '<p class="muted small">No companies you control yet.</p>';
  const teamCards = teams.map(t => `<div class="card in"><b>${esc(t.name)}</b><div class="muted small">${esc(t.cityName)} · Value ${fmtMoney(t.value, true)} · Rating ${(t.rating5 || 3).toFixed(1)} / 5</div>
    <div class="kv"><span>Board room</span><b>${(typeof boardFull === 'function' && boardFull(t)) ? 'Full' : 'Not full'}</b></div><div class="kv"><span>Profitable weeks in a row</span><b>${t.weekStreak || 0} / 2</b></div>
    ${boardRow(t, 'team', t.id)}
    ${t.ipo ? '<p class="muted small">Already public.</p>' : '<p class="muted small">IPO in the team Finance tab, up to 100% at today\'s valuation minus a 7% fee.</p>'}</div>`).join('') || '<p class="muted small">No teams you own yet. Buy one in Sports.</p>';
  return panelShell('Offices', 'You are the CEO. Hire 5 executives — COO, CFO, CPO, CMO, CTO — and each hires a manager in their own domain. The CFO hires nobody: IPO, loans and forecasts are advice. Higher level members boost revenue more — and cost more.',
    `${hireSection()}<h4>Your companies</h4>${compCards}<h4>Your teams</h4>${teamCards}`);
};
PANELS.bank = () => bankPanelHTML();
// --- Trade app (was Markets): brokerage layout, original data only.
// Bottom tabs: Home (account value + index chart), Portfolio
// (positions + cash), Trade (search + recently viewed + watchlist +
// order toolbox), Watchlist (table), Markets (index strip + chart +
// events + the full stock list). Equity (trade box + secondary
// offering) and M&A keep their old content, reached from the Trade
// tab's toolbox. The + button at the top right opens the IPO
// launcher: pick a company you control, choose how much to sell,
// price follows today's valuation, 7% fee, launch on goPublic.
function tradeNav(tab) {
  const items = [['home', '🏠', 'Home'], ['portfolio', '📊', 'Portfolio'], ['trade', '🔍', 'Trade'], ['watchlist', '⭐', 'Watchlist'], ['markets', '🌍', 'Markets']];
  return `<div class="wtrade-nav">${items.map(([k, ic, label]) => k === 'trade'
    ? `<button class="trade-cta ${tab === k ? 'on' : ''}" data-a="tradeTab" data-x="${k}"><span class="ic">${ic}</span>${label}</button>`
    : `<button class="${tab === k ? 'on' : ''}" data-a="tradeTab" data-x="${k}"><span style="font-size:20px">${ic}</span>${label}</button>`).join('')}</div>`;
}
function tradeDailyPnl() {
  let pnl = 0;
  const keys = [...new Set([...Object.keys(S.holdings || {}), ...Object.keys(S.holdingsP || {})])];
  for (const a3 of keys) {
    const h = holdPosCombined(a3), c = S.co[a3];
    if (!c || !c.listed || !h.qty) continue;
    const d = c.h.d || [], prev = d.length > 1 ? d[d.length - 2] : c.price;
    pnl += h.qty * (c.price - prev);
  }
  return pnl;
}
function tradePositions() {
  const out = [];
  const keys = [...new Set([...Object.keys(S.holdings || {}), ...Object.keys(S.holdingsP || {})])];
  for (const a3 of keys) {
    const h = holdPosCombined(a3), c = S.co[a3];
    if (!c || !h.qty) continue;
    const pnl = c.listed ? (c.price - h.cost) * h.qty : 0;
    out.push({ key: a3, sym: c.sym, name: c.name, price: c.listed ? c.price : null, qty: h.qty, pnl, pct: h.cost ? pnl / Math.max(1, Math.abs(h.cost * h.qty)) : 0, color: c.color });
  }
  const keysX = [...new Set([...Object.keys(S.holdingsX || {}), ...Object.keys(S.holdingsXP || {})])];
  for (const id of keysX) {
    const h = holdPosCombinedX(id), b = S.extra && S.extra[id];
    if (!b || !h.qty) continue;
    const pnl = h.cost != null ? (b.price - h.cost) * h.qty : 0;
    out.push({ key: id, sym: b.sym, name: b.name, price: b.price, qty: h.qty, pnl, pct: h.cost ? pnl / Math.max(1, Math.abs(h.cost * h.qty)) : 0, color: b.color, isExtra: true });
  }
  return out;
}

function tradeIdxSeries(range) {
  const d = (S.idx.h && S.idx.h.d) || [], w = (S.idx.h && S.idx.h.w) || [];
  if (range === '1M') return d.slice(-22);
  if (range === '1Y') return d.slice(-260);
  if (range === '2Y') return w.length > 1 ? w.slice(-104) : d;
  return d.slice(-5);
}
function tradeNextQuarterDay() { let d = S.day; while (((d + 1) % 91) !== 0) d++; return d; }
function tradeIdxChart() {
  const range = UI.tradeRange || '1M';
  const series = tradeIdxSeries(range);
  const ranges = [['Today', 'today'], ['1M', '1M'], ['1Y', '1Y'], ['2Y', '2Y']].map(([l, v]) => `<button class="wtrade-range ${range === v ? 'on' : ''}" data-a="tradeRange" data-x="${v}">${l}</button>`).join('');
  const chart = series.length > 1 ? lineChart(series, { h: 110 }) : '<p style="color:#8b949e">Not enough index history yet — it builds as days pass.</p>';
  return `${chart}<div class="wtrade-ranges">${ranges}</div>`;
}
function tradeIpoHTML() {
  const mineList = mine();
  const sel = (UI.tradeIpoCo && S.co[UI.tradeIpoCo]) ? S.co[UI.tradeIpoCo] : null;
  const rows = mineList.filter(c => !c.listed).map(c => {
    const full = (typeof boardFull === 'function') ? boardFull(c) : true;
    const streak = c.weekProfitStreak || 0, ok = full && streak >= 2;
    return `<div class="wtrade-card"><div class="row between"><div><b>${esc(c.name)}</b><div style="color:#8b949e;font-size:13px">${c.sym} · Value ${fmtMoney(companyFairTotal(c), true)} · Rating ${(c.rating || 0).toFixed(1)} / 5</div></div><button class="wtrade-btn ghost" style="flex:none" data-a="tradeIpoSel" data-x="${c.a3}">${sel && sel.a3 === c.a3 ? 'Selected' : 'Select'}</button></div>
    <p style="color:#8b949e;font-size:13px">${ok ? 'Ready to list.' : 'Not ready: ' + (!full ? 'board not full (hire in Offices). ' : '') + (streak < 2 ? `needs 2 profitable weeks (now ${streak}).` : '')}</p></div>`;
  }).join('') || '<p style="color:#8b949e">No private companies you control yet. Buy 50% of a stock to control it, then list it here.</p>';
  let form = '';
  if (sel) {
    const v = UI.tradeIpoVal != null ? UI.tradeIpoVal : companyFairTotal(sel), price = v / sel.shares;
    const pct = UI.tradeIpoPct != null ? UI.tradeIpoPct : 100;
    const sold = Math.floor(sel.shares * pct / 100), gross = Math.round(sold * price), fee = Math.round(gross * 0.07), proceeds = gross - fee;
    form = `<div class="wtrade-card"><h4 style="margin:0 0 8px">Launch ${esc(sel.name)}</h4>
    <div class="kv"><span>Price per share</span><b>${fmtMoney(price)}</b></div>
    <div class="kv"><span>Shares in company</span><b>${sel.shares.toLocaleString()}</b></div>
    <div class="kv"><span>Valuation</span><b>${fmtMoney(v, true)}</b></div>
    <label style="color:#8b949e;font-size:12px">SELL % (5–100)</label>
    <div class="row"><input id="tradeIpoPct" class="qty" type="number" value="${pct}" min="5" max="100"><button class="wtrade-btn ghost" data-a="tradeIpoPctSet">Update</button></div>
    <label style="color:#8b949e;font-size:12px">VALUATION (you set this)</label>
    <div class="row"><input id="tradeIpoVal" class="qty" type="number" value="${Math.round(v)}" style="width:170px"></div>
    <div class="kv"><span>Shares sold</span><b>${sold.toLocaleString()}</b></div>
    <div class="kv"><span>Gross</span><b>${fmtMoney(gross, true)}</b></div>
    <div class="kv"><span>Fee (7%)</span><b>${fmtMoney(fee, true)}</b></div>
    <div class="kv"><span>You receive</span><b>${fmtMoney(proceeds, true)}</b></div>
    <button class="wtrade-btn buy" style="width:100%;margin-top:10px" data-a="tradeIpoLaunch" data-x="${sel.a3}">LAUNCH IPO</button>
    <p style="color:#8b949e;font-size:13px">Valuation is yours to set — price follows it. Needs a full board and 2 profitable weeks.</p></div>`;
  }
  return `<h4 class="wtrade-h">LAUNCH AN IPO</h4><p style="color:#8b949e">Pick a company you control, choose how much to sell, and launch it on the Worl Exchange.</p>${rows}${form}`;
}
PANELS.markets = () => {
  const tab = UI.tradeTab || 'home';
  const wrap = body => panelShell('Trade', '', `<div class="wtrade"><div class="wtrade-top"><div><b>Trade</b><small>Worl Exchange · World Index ${S.idx.v.toFixed(0)}${marketOpen() ? '' : ' · Markets closed (weekend)'}</small></div><button class="wtrade-plus" data-a="tradeTab" data-x="ipo" aria-label="Launch an IPO">+</button></div>${body}${tradeNav(tab)}</div>`);
  if (tab === 'ipo') return wrap(tradeIpoHTML());
  if (tab === 'equity') {
    const mineList = mine();
    const first = mineList[0] || Object.values(S.co).find(c => c.listed);
    return wrap(`<div class="wtrade-card"><h4 style="margin:0 0 8px">TRADE STOCKS</h4>${walletPickerHTML()}
    ${first ? `<div class="kv"><span><b>${esc(first.name)}</b> · ${first.sym}</span><b>${fmtMoney(first.price)}</b></div>
    <div class="row"><button class="wtrade-btn ghost" data-a="qty" data-x="-100">−100</button><button class="wtrade-btn ghost" data-a="qty" data-x="-10">−10</button><input id="qty" class="qty" type="number" value="100" min="1"><button class="wtrade-btn ghost" data-a="qty" data-x="10">+10</button><button class="wtrade-btn ghost" data-a="qty" data-x="100">+100</button><button class="wtrade-btn ghost" data-a="qtyMax" data-x="${first.a3}">MAX</button></div>
    <div class="row" style="margin-top:10px"><button class="wtrade-btn buy" data-a="doTrade" data-x="${first.a3}|buy">BUY</button><button class="wtrade-btn sell" data-a="doTrade" data-x="${first.a3}|sell">SELL</button></div>
    <p style="color:#8b949e">Pick another stock from the Markets tab first, then come back here to trade it.</p>` : '<p style="color:#8b949e">No listed companies yet.</p>'}</div>
    <div class="wtrade-card"><h4 style="margin:0 0 8px">SECONDARY OFFERING</h4><p style="color:#8b949e">Issue new shares for a company you control. Underwriting fee 3.85%.</p>
    ${mineList.map(c => `<div class="kv"><span>${esc(c.name)} · ${c.sym} · ${fmtMoney(c.price)}/share</span><b>${c.shares.toLocaleString()} shares</b></div>`).join('') || '<p style="color:#8b949e">You control no companies yet. Buy 50% of a stock to control it.</p>'}
    ${mineList.length ? `<label style="color:#8b949e;font-size:12px">NEW SHARES (first controlled company)</label><input id="issueQty" class="qty" type="number" value="19000"><button class="wtrade-btn buy" style="width:100%;margin-top:8px" data-a="issueShares" data-x="${mineList[0].a3}">ISSUE NEW SHARES</button>` : ''}</div>`);
  }
  if (tab === 'ma') {
    const rows = marketRows().filter(c => c.listed && !c.isExtra).slice(0, 30);
    return wrap(`<h4 class="wtrade-h">MERGERS &amp; ACQUISITIONS</h4><p style="color:#8b949e">Offer to buy a whole company.</p>${walletPickerHTML()}${rows.map(c => { const cap = companyValue(c), hi = Math.max(...(c.h.d || [c.price])), lo = Math.min(...(c.h.d || [c.price])); return `<div class="wtrade-card"><div class="row between"><div><b>${esc(c.name)}</b><div style="color:#8b949e;font-size:13px">${c.sym} · Valuation ${fmtMoney(cap, true)} · Dividend ${fmtMoney(c.price * (SECTORS[c.sector].div || 0), true)} · P/E ${c.pe.toFixed(1)}</div></div><b>${fmtMoney(c.price)}</b></div><div class="kv"><span>52-week high</span><b>${fmtMoney(hi)}</b></div><div class="kv"><span>52-week low</span><b>${fmtMoney(lo)}</b></div><button class="wtrade-btn buy" style="width:100%;margin-top:8px" data-a="takeover" data-x="${c.a3}|0.4">OFFER M&amp;A · +40% · ${fmtMoney(takeoverCost(c, 0.4), true)}</button></div>`; }).join('')}`);
  }
  if (tab === 'portfolio') {
    const pos = tradePositions(), dpnl = tradeDailyPnl(), nlv = S.cash + ensurePerson().cash + holdingsValue();
    return wrap(`<div class="wtrade-value">${fmtMoney(nlv)}</div><div class="wtrade-daily" style="color:#8b949e">Net Liquidation Value</div>
    <div class="wtrade-daily ${upCls(dpnl)}">Daily P&amp;L ${dpnl >= 0 ? '+' : ''}${fmtMoney(dpnl, true)}</div>
    <h4 class="wtrade-h">POSITIONS</h4>
    <table class="wtrade-table"><tr><th>Instrument</th><th>Last Price</th><th>P&amp;L</th><th>P&amp;L %</th><th>Position</th></tr>
    ${pos.map(p => `<tr><td><button class="wtrade-stockbtn" data-a="stock" data-x="${p.key}"><b>${p.sym}</b><br><span style="color:#8b949e;font-size:12px">${esc(p.name)}</span></button></td><td>${p.price != null ? fmtMoney(p.price) : 'Private'}</td><td class="${upCls(p.pnl)}">${fmtMoney(p.pnl, true)}</td><td class="${upCls(p.pnl)}">${fmtPct(p.pct)}</td><td>${p.qty.toLocaleString()}</td></tr>`).join('') || '<tr><td colspan="5" style="color:#8b949e">No positions yet.</td></tr>'}</table>
    <h4 class="wtrade-h">CASH BALANCES</h4>
    <div class="wtrade-card"><div class="kv"><span>Business cash</span><b>${fmtMoney(S.cash, true)}</b></div><div class="kv"><span>Personal cash</span><b>${fmtMoney(ensurePerson().cash, true)}</b></div></div>`);
  }
  if (tab === 'trade') {
    const resolve = k => {
      if (S.co[k]) return S.co[k];
      if (S.extra && S.extra[k]) return S.extra[k];
      return null;
    };
    const chg = c => { try { const v = chgVs(c); return isFinite(v) ? v : 0; } catch (e) { return 0; } };
    const tile = (c, key) => { const ch = chg(c); return `<button class="wtrade-tile" style="flex-basis:130px" data-a="stock" data-x="${key}"><b>${c.sym}</b><span>${esc(c.name)}</span><span>${c.listed === false ? 'Private' : fmtMoney(c.price)}</span><span class="wtrade-pill ${ch >= 0 ? 'up' : 'dn'}">${fmtPct(ch)}</span></button>`; };
    const recent = (S.tradeRecent || []).map(k => ({ c: resolve(k), k })).filter(x => x.c);
    const watched = Object.values(S.co).filter(c => (S.watch || []).includes(c.a3));
    return wrap(`<input id="msearch" class="wtrade-search" placeholder="Search Stocks, ETFs &amp; More" value="${esc(UI.q)}" autocomplete="off">
    <p style="color:#8b949e;font-size:13px">Search filters the Markets list — open Markets to see results.</p>
    <div class="wtrade-row"><div style="flex:1"><b style="font-size:20px;color:#58a6ff">0</b> <span style="color:#8b949e">Orders</span></div><div style="flex:1"><b style="font-size:20px;color:#58a6ff">${S.stats.trades || 0}</b> <span style="color:#8b949e">Trades</span></div></div>
    <h4 class="wtrade-h">RECENTLY VIEWED</h4>
    <div class="wtrade-row" style="flex-wrap:wrap">${recent.map(x => tile(x.c, x.k)).join('') || '<p style="color:#8b949e">Nothing viewed yet — open a stock from Markets.</p>'}</div>
    <h4 class="wtrade-h">WATCHLIST</h4>
    <div class="wtrade-row" style="flex-wrap:wrap">${watched.map(c => tile(c, c.a3)).join('') || '<p style="color:#8b949e">Star a stock in Markets to watch it.</p>'}</div>
    <h4 class="wtrade-h">TOOLBOX</h4>
    <div class="wtrade-row"><button class="wtrade-btn buy" data-a="tradeTab" data-x="equity">Buy Order</button><button class="wtrade-btn sell" data-a="tradeTab" data-x="equity">Sell Order</button></div>
    <div class="wtrade-row" style="margin-top:10px"><button class="wtrade-btn ghost" data-a="tradeTab" data-x="markets">Market Screener</button><button class="wtrade-btn ghost" data-a="tradeTab" data-x="ma">M&amp;A</button></div>`);
  }
  if (tab === 'watchlist') {
    const watched = Object.values(S.co).filter(c => (S.watch || []).includes(c.a3)).sort((a, b) => companyValue(b) - companyValue(a));
    const vol = c => { const v = (c.h.v && c.h.v.length) ? c.h.v[c.h.v.length - 1] : (c.tradedToday || 0); return v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(2) + 'K' : String(v); };
    return wrap(`<h4 class="wtrade-h">WATCHLISTS</h4><button class="wtrade-btn ghost" data-a="tradeTab" data-x="markets">+ Add Instrument</button>
    <table class="wtrade-table" style="margin-top:12px"><tr><th>Instrument</th><th>Last Price</th><th>Change</th><th>Change %</th><th>Volume</th></tr>
    ${watched.map(c => { const d = c.h.d || [], prev = d.length > 1 ? d[d.length - 2] : c.price, ch = c.price - prev, pct = prev ? ch / prev : 0; return `<tr><td><button class="wtrade-stockbtn" data-a="stock" data-x="${c.a3}"><b>${c.sym}</b><br><span style="color:#8b949e;font-size:12px">${esc(c.name)}</span></button></td><td>${fmtMoney(c.price)}</td><td class="${upCls(ch)}">${ch >= 0 ? '+' : ''}${fmtMoney(ch, true)}</td><td class="${upCls(ch)}">${fmtPct(pct)}</td><td>${vol(c)}</td></tr>`; }).join('') || '<tr><td colspan="5" style="color:#8b949e">Nothing watched yet — star a stock in Markets.</td></tr>'}</table>
    <p style="color:#8b949e">${watched.length} Instrument${watched.length === 1 ? '' : 's'}</p>`);
  }
  if (tab === 'markets') {
    const cats = ['All', 'Watchlist', 'Owned', 'Extras', ...(typeof PARENT_LIST !== 'undefined' ? PARENT_LIST : SECTOR_LIST.slice(0, 12))];
    const secAvg = (typeof PARENT_LIST !== 'undefined' ? PARENT_LIST : SECTOR_LIST).map(sec => { const cs = Object.values(S.co).filter(c => c.listed && (c.sector === sec || (typeof parentSectorOf === 'function' && parentSectorOf(c.sector) === sec))); return { sec, ch: cs.length ? cs.reduce((a, c) => a + chgVs(c), 0) / cs.length : 0, n: cs.length }; }).filter(x => x.n).sort((a, b) => b.ch - a.ch)[0];
    const listedCount = Object.values(S.co).filter(c => c.listed).length;
    return wrap(`<div class="wtrade-idx"><div class="wtrade-idxcard"><b>World Index</b><span class="pct ${upCls(marketReturn())}">${fmtPct(marketReturn())}</span><span style="color:#8b949e">${S.idx.v.toFixed(0)}</span></div><div class="wtrade-idxcard" style="border-color:#f97316"><b>Oil Index</b><span class="pct">${(S.oil || 0).toFixed(2)}x</span><span style="color:#8b949e">Energy</span></div>${secAvg ? `<div class="wtrade-idxcard" style="border-color:#a855f7"><b>${esc(secAvg.sec)} Index</b><span class="pct ${upCls(secAvg.ch)}">${fmtPct(secAvg.ch)}</span><span style="color:#8b949e">Top sector today</span></div>` : ''}</div>
    ${tradeIdxChart()}
    <h4 class="wtrade-h">UPCOMING EVENTS · WORL EXCHANGE</h4><p style="color:#8b949e">Quarterly reports land ${fmtDate(tradeNextQuarterDay())} — ${listedCount} listed companies report earnings that week.</p>
    <input id="msearch" class="wtrade-search" placeholder="Search Stocks, ETFs &amp; More" value="${esc(UI.q)}" autocomplete="off">
    <div class="row wrap" style="margin-top:10px">${cats.map(c => `<button class="chip ${UI.cat === c ? 'on' : ''}" data-a="cat" data-x="${c}">${c}</button>`).join('')}</div>
    <div class="list" id="mlist">${marketsListHTML()}</div>`);
  }
  // Home (default tab).
  const value = S.cash + ensurePerson().cash + holdingsValue(), dpnl = tradeDailyPnl();
  const rows = marketRows().filter(c => c.listed);
  const topMover = rows.slice().sort((a, b) => chgVs(b) - chgVs(a))[0];
  return wrap(`<div class="wtrade-value">${fmtMoney(value)}</div>
  <div class="wtrade-daily ${upCls(dpnl)}">Daily P&amp;L ${dpnl >= 0 ? '+' : ''}${fmtMoney(dpnl, true)} (${fmtPct(value ? dpnl / value : 0)})</div>
  ${tradeIdxChart()}
  <div class="wtrade-row"><button class="wtrade-btn buy" data-a="tradeTab" data-x="equity">Buy Order</button><button class="wtrade-btn sell" data-a="tradeTab" data-x="equity">Sell Order</button></div>
  <div class="wtrade-row" style="margin-top:10px"><button class="wtrade-btn ghost" data-a="panel" data-x="bank">Deposit</button><button class="wtrade-btn ghost" data-a="panel" data-x="bank">Transfer Funds</button><button class="wtrade-btn ghost" data-a="tradeTab" data-x="portfolio">Statements</button></div>
  <div class="wtrade-card"><b>For You</b><p style="color:#8b949e">Quarterly reports land every 91 days — next ones ${fmtDate(tradeNextQuarterDay())}.${topMover ? ` Top mover today: ${esc(topMover.name)} (${topMover.sym}) ${fmtPct(chgVs(topMover))}.` : ''}</p></div>`);
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
    `<div class="card in"><h4>How to play</h4><p>Pick a country, name your company, lease a location in one of its cities, buy stocks, and grow. Time only moves one week at a time (tap the date at the top right, press YES), vehicles keep moving while you wait, no age limit, and Vs Market is an equal-weighted algo that buys the same amount of every stock. Wars and disasters push prices down. Good events push them up. Your goals are always at the top: population, net worth, and beating the market.</p>
    <p class="muted small">Take control of a company by buying 50% of its stock, or all of it with a takeover offer. Invade a neighbour to take its company and its people. Save is automatic.</p></div>`);
};
// Every menu item, shared by the hamburger popup and the old More
// sheet. The popup is the new home for all of these now that the
// bottom bar is gone.
const MENU_ITEMS = [
  ['leader', ICONS.leader, 'Leader'], ['newsapp', ICONS.news, 'News'], ['airport', ICONS.airport, 'Airport'],
  ['nation', ICONS.nation, 'Nation'], ['country', '🗺️', 'Your Country'],
  ['military', ICONS.military, 'Military'], ['company', ICONS.company, 'My Companies'],
  ['mars', ICONS.mars, 'Mars'],
  ['goals', ICONS.goals, 'Daily goals'],
  ['progress', '🏆', 'Progress'],
  ['tawk', '💬', 'Tawk'], ['calendar', '📅', 'Calendar'],
  ['cabinet', '👥', 'Advisors'], ['elections', '🗳️', 'Elections'], ['karma', '✨', 'Karma'],
  ['leaderboard', ICONS.leader, 'Leaderboard'], ['sports', ICONS.sports, 'Sports'], ['crypto', ICONS.crypto, 'Crypto'], ['bank', ICONS.bank, 'Bank'],
  ['markets', ICONS.markets, 'Trade'],
  ['radio', '📻', 'Robot Radio'],
  ['minigames', '🎮', 'App Store'],
  ['settings', ICONS.settings, 'Settings'], ['help', ICONS.help, 'Help'],
];
function moreSheet() {
  openModal(`<h2>More</h2><div class="more-grid">${MENU_ITEMS.map(([x, ic, t]) => `<button class="more-item" data-a="${x === 'news' ? 'paper' : 'panel'}" data-x="${x}"><span class="mi">${ic}</span><span>${t}</span></button>`).join('')}</div>`, 'sheet');
}
// The phone replaces the More menu: a phone frame with every menu
// item as an app icon on a home screen. Tapping an app opens the
// same panel (or paper) the old menu opened.
// Phone home screens, grouped by what they are for: Financial
// (personal money), Business (company money), Country (office and
// nation), Apps (everything else), Settings. Each money page opens
// with its own $ tile, which jumps straight to that account in Bank.
// Two home pages: real stuff (the game) and the rest (chat, calendar,
// settings). The money tiles ride on the real-stuff page.
const PHONE_PAGES = [
  { name: 'Real stuff', wallets: ['private'], apps: ['company', 'leader', 'progress', 'nation', 'elections', 'cabinet', 'leaderboard', 'mars', 'karma', 'crypto', 'newsapp', 'sports', 'radio', 'airport', 'minigames'] },
  { name: 'More', wallets: [], apps: ['tawk', 'calendar', 'settings', 'help'] },
];
// Home pages, plus a Games page that appears only once a game has
// been downloaded from the App Store. Downloaded games live there,
// never mixed into the real-stuff page.
function phonePages() {
  const pages = [...PHONE_PAGES];
  const dl = downloadedGames();
  if (dl.length) pages.push({ name: 'Games', wallets: [], apps: [], dl: dl.map(g => g.id) });
  return pages;
}
function phoneHTML() {
  // The phone frame: home grid, or one app on its screen. No X button
  // anywhere - tapping outside the phone goes back (to the grid from
  // an app, to the map from the grid), and Apps goes to the grid.
  // Top row, like a real phone: just the notch, centred. No date up
  // here — the date lives on the Calendar tile instead.
  const toprow = `<div class="phone-toprow"><span></span><div class="phone-notch"></div><span></span></div>`;
  // Home-screen layout: 4-across icon tiles, pages with dots, and a
  // bottom bar (dock) pinned at the bottom of the grid AND of every
  // app. The dock's first, bottom-left slot is Home — tapping it
  // returns to the grid, so apps need no back button in their chrome.
  // Apps sit on two pages (real stuff, and the rest); the dock holds
  // only Home, Bank and Trade.
  const TILE_COLORS = ['#2f7cf6', '#e5484d', '#12a150', '#7c4dff', '#e0812b', '#0ea5b7', '#d63384', '#1f5fd0', '#8a5a2b', '#334155', '#b45309', '#0f766e'];
  const tileBg = x => { let h = 0; for (let i = 0; i < x.length; i++) h = (h * 31 + x.charCodeAt(i)) >>> 0; return TILE_COLORS[h % TILE_COLORS.length]; };
  const appBtn = ([x, ic, t]) => {
    // Calendar tile: live date on the tile itself, like a real phone —
    // weekday in red on top, day number big below. No need to open it.
    if (x === 'calendar') {
      const d = dateOf(S.day), wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];
      return `<button class="phone-app" data-a="panel" data-x="calendar"><span class="phone-app-ic phone-app-cal" style="background:#fff"><b class="cal-wd">${wd}</b><b class="cal-day">${d.getUTCDate()}</b></span><span class="phone-app-label">Calendar</span></button>`;
    }
    return `<button class="phone-app" data-a="panel" data-x="${x}"><span class="phone-app-ic" style="background:${tileBg(x)}">${ic}</span><span class="phone-app-label">${t}</span></button>`;
  };
  const dockKeys = ['bank', 'markets'];
  const dock = MENU_ITEMS.filter(m => dockKeys.includes(m[0])).sort((a, b) => dockKeys.indexOf(a[0]) - dockKeys.indexOf(b[0]));
  const dockHTML = () => `<div class="phone-dock"><button class="phone-app" data-a="phoneHome"><span class="phone-app-ic" style="background:#334155">🏠</span><span class="phone-app-label">Home</span></button>${dock.map(appBtn).join('')}</div>`;
  if (!UI.phoneApp) {
    const pages = phonePages();
    const page = Math.min(UI.phonePage || 0, pages.length - 1);
    const pdef = pages[page];
    const apps = (pdef.apps || []).map(k => MENU_ITEMS.find(m => m[0] === k)).filter(Boolean);
    const walletLabel = w => w === 'private' ? 'Personal $' : w === 'company' ? 'Business $' : 'Country $';
    const dollars = (pdef.wallets || []).map(w => `<button class="phone-app" data-a="bankWallet" data-x="${w}"><span class="phone-app-ic" style="background:#12a150">$</span><span class="phone-app-label">${walletLabel(w)}</span></button>`).join('');
    const dlTiles = (pdef.dl || []).map(id => { const g = storeGame(id); if (!g) return ''; return `<button class="phone-app" data-a="mgplayPhone" data-x="${g.id}" data-dl="1"><span class="phone-app-ic" style="background:${g.color}">${g.icon}</span><span class="phone-app-label">${esc(g.name)}</span></button>`; }).join('');
    const dlConfirm = UI.dlConfirm ? (() => { const g = storeGame(UI.dlConfirm); if (!g) return ''; return `<div class="dl-confirm"><b>Delete ${esc(g.name)}?</b><p>It will leave your Home Screen. You can download it again from the App Store any time.</p><div class="row gap"><button class="btn3d wide" data-a="dlDelete" data-x="${g.id}">DELETE</button><button class="btn wide" data-a="dlCancel">CANCEL</button></div></div>`; })() : '';
    const dots = `<div class="phone-dots">${pages.map((p, i) => `<button class="phone-dot ${i === page ? 'on' : ''}" data-a="phonePage" data-x="${i}" aria-label="${p.name}"></button>`).join('')}</div>`;
    return `${toprow}<div class="phone-grid">${dlConfirm}${dollars}${apps.map(appBtn).join('')}${dlTiles}</div>${dots}${dockHTML()}`;
  }
  return `${toprow}<div id="phoneCard" class="phone-card app-${UI.phoneApp}" data-stop></div>${dockHTML()}`;
}
function openMenuPopup() {
  // The phone: every menu item is an app on a home screen. Tapping
  // an app opens it INSIDE this phone, on the screen above.
  UI.phoneApp = null; UI.phoneStack = []; UI.panel = null; UI.stack = [];
  $('panel').innerHTML = ''; $('panel').classList.remove('open');
  openModal(phoneHTML(), 'phone');
}
PANELS.drawer = () => { closePanel(); openMenuPopup(); };
// ---------- date modal: Done this week? + calendar ----------
function openDateModal() {
  const e = ensureEarnings();
  const evs = calendarEvents();
  const recent = e.history.slice(0, 8);
  openModal(`<h2>DONE THIS WEEK?</h2><p>Are you done with your business this week?</p>
  <div class="row gap"><button class="btn3d wide" data-a="dateYes">YES</button><button class="btn wide" data-a="dateNo">NO</button></div>
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
function departuresBoardHTML(inPhone) {
  const from = airportFromCity();
  const groups = ['Americas', 'Europe', 'Asia', 'Africa', 'Oceania'];
  const sel = UI.depCont || depContGroup(W.byA3[from.a3].cont);
  UI.depCont = sel;
  // Every city in the selected region, nearest first — capitals and major
  // cities alike, so the board is how the player actually travels.
  const dests = W.cities.filter(c => c.id !== from.id).map(c => {
    const k = W.byA3[c.a3];
    return { ct: c, k, km: airportDistanceKm(from, c), grp: k ? depContGroup(k.cont) : 'Oceania' };
  }).filter(d => d.grp === sel).sort((a, b) => a.km - b.km);
  const head = `<div class="dep-head"><span class="dep-plane">✈️</span><h2>${esc(from.name)} Airport</h2>${inPhone ? '' : `<button class="xbtn" data-a="closeModal" aria-label="Close">${IC.close}</button>`}</div>`;
  const leaveBtn = (!inPhone && typeof CityView !== 'undefined' && CityView.isOpen && CityView.isOpen()) ? `<button class="btn wide" data-a="depLeave">\u2190 Back to world map</button>` : '';
  const body = `<p class="dep-welcome">Welcome to ${esc(from.name)} Airport. Tap the destination below to catch a flight.</p>${leaveBtn}
  <div class="dep-title">✈ DEPARTURES</div>
  <canvas id="depmap" class="dep-map"></canvas>
  <div class="dep-maphint">Tap a continent on the map to see its cities.</div>
  <div class="row gap dep-tabs">${groups.map(g => `<button class="dep-tab${g === sel ? ' on' : ''}" data-a="depCont" data-x="${g}">${g}</button>`).join('')}<button class="dep-tab" data-a="depWorld">World</button><button class="dep-tab" data-a="depEstate">Estate</button><button class="dep-tab" data-a="marsTravel">Mars</button></div>
  <div class="dep-board"><div class="dep-row dep-headrow"><span>Destination</span><span>Distance (km)</span></div>
  ${dests.map(d => `<button class="dep-row" data-a="depFly" data-x="${d.ct.id}"><span class="dep-dot">${esc(d.ct.name)}<small> · ${esc(d.k.name)}</small></span><span class="dep-filler"></span><span class="dep-dot dep-km">${d.km.toLocaleString('en-US')}</span></button>`).join('')}
  </div>`;
  return head + body;
}
function openDeparturesModal() {
  // Inside the phone the board is a screen on the phone itself, with
  // no X button — Home in the dock is the way out. Anywhere else it
  // keeps its full-screen board modal.
  if (UI.modal === 'phone' && document.querySelector('#phoneCard')) {
    UI.phoneApp = 'departures'; UI.panel = 'departures';
    const mbox = document.querySelector('#modal .mbox.phone');
    if (mbox) mbox.innerHTML = phoneHTML();
    renderPhoneApp();
    drawDepMap(UI.depCont, airportFromCity());
    return;
  }
  openModal(departuresBoardHTML(false), 'dep');
  drawDepMap(UI.depCont, airportFromCity());
}
PANELS.departures = () => departuresBoardHTML(true);
// Land cells belonging to one continent group, cached per group. A cell
// counts when it falls inside a group country's bounding box AND inside
// its shape path — the same point-in-path test the map itself uses.
const DEP_BRIGHT = {};
function depBrightCells(group) {
  if (DEP_BRIGHT[group]) return DEP_BRIGHT[group];
  const set = new Set();
  const tctx = document.createElement('canvas').getContext('2d');
  const list = Object.values(W.byA3).filter(k => k && k.path && depContGroup(k.cont) === group);
  const gw = W.ww, gh = W.wh;
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const c = y * gw + x; if (W.water[c]) continue;
    const mx = cellXY(W, c)[0], my = cellXY(W, c)[1];
    for (const k of list) {
      const b = k.box; if (!b || mx < b[0] || mx > b[2] || my < b[1] || my > b[3]) continue;
      try { if (tctx.isPointInPath(k.path, mx, my)) { set.add(c); break; } } catch (e) {}
    }
  }
  DEP_BRIGHT[group] = set; return set;
}
// Dotted world map for the departures board: the selected continent's
// land dots shine bright white like the reference, every other continent
// stays dim, gold dot for the airport the player is flying out of, and
// the continent name drawn over its own landmass. Tapping a continent
// switches the departures list to that continent's cities.
function drawDepMap(sel, from) {
  const cv = document.getElementById('depmap');
  if (!cv || typeof W === 'undefined' || !W.water) return;
  const w = cv.clientWidth || 600, h = Math.round(w * 0.5);
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  const gw = W.ww, gh = W.wh, dx = w / gw, dy = h / gh;
  const bright = depBrightCells(sel);
  ctx.clearRect(0, 0, w, h);
  let sx = 0, sy = 0, n = 0;
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const c = y * gw + x; if (W.water[c]) continue;
    if (bright.has(c)) { ctx.fillStyle = 'rgba(255,255,255,0.95)'; sx += x; sy += y; n++; }
    else ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.arc(x * dx + dx / 2, y * dy + dy / 2, Math.max(1, dx * 0.32), 0, 7); ctx.fill();
  }
  if (n) {
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.font = `700 ${Math.round(Math.max(16, w * 0.055))}px sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 6;
    ctx.fillText(sel, (sx / n) * dx + dx / 2, (sy / n) * dy + dy / 2);
    ctx.shadowBlur = 0;
  }
  ctx.fillStyle = '#ffd166';
  ctx.beginPath(); ctx.arc((from.lon + 180) / 360 * w, (90 - from.lat) / 180 * h, Math.max(3, dx * 0.9), 0, 7); ctx.fill();
  cv.onclick = ev => {
    const r = cv.getBoundingClientRect();
    const lon = ((ev.clientX - r.left) / r.width) * 360 - 180;
    const lat = 90 - ((ev.clientY - r.top) / r.height) * 180;
    let best = null, bestD = 1e9;
    W.cities.forEach(c => {
      const dLon = (c.lon - lon) * Math.cos(lat * Math.PI / 180), dLat = c.lat - lat;
      const d = dLon * dLon + dLat * dLat;
      if (d < bestD) { bestD = d; best = c; }
    });
    if (!best) return;
    const k = W.byA3[best.a3]; if (!k) return;
    const grp = depContGroup(k.cont);
    if (grp !== UI.depCont) { UI.depCont = grp; openDeparturesModal(); }
  };
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
    const look = (UI.pickLooks || [])[UI.pickLookIdx || 0] || null;

    S = newGame({ mode: UI.mode, home: UI.pick.a3, name, color: UI.color, look }); save(); enterGame(false);
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
    S = newGame({ mode: 'random', home: a3, leader: true, name: 'Leader', countryName, look: (UI.inheritLooks || [])[UI.inheritLookIdx || 0] || null }); S.randomSeed = (UI.randomSeed != null ? UI.randomSeed : (W.randomSeed != null ? W.randomSeed : null)); if (typeof applyRandomStart === 'function') applyRandomStart(); save(); enterGame(false);
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
    S = newGame({ mode: 'infinite', home: a3, leader: true, name: 'Leader', countryName, look: (UI.inheritLooks || [])[UI.inheritLookIdx || 0] || null }); save(); enterGame(false);
  },

  goCountry: x => { closeModal(); MapView.showCountry(x); renderHUD(); },
  goRegion: x => { const p = (x || '').split('|'); closeModal(); if (MapView.isWorldRegion && MapView.isWorldRegion(p[0], p[1])) MapView.showRegionMap(p[0], p[1]); else if (MapView.isClusterState && MapView.isClusterState(p[1])) MapView.showCluster(p[0], p[1]); else MapView.showRegion(p[0], p[1]); renderHUD(); },
  exitToWorld: () => { MapView.exitToWorld(); renderHUD(); },
  exitToCountry: () => { MapView.exitToCountry(); renderHUD(); },
  countryPanel: x => { openCountryPanel(x); },
  tutNext: () => { S.tutorial++; renderTutorial(); save(); },
  tutSkip: () => { S.tutorial = -1; renderTutorial(); save(); },
  panel: x => { if (UI.panel === x && !UI.stack.length) return closePanel(); if (x === 'markets') UI.q = ''; if (x === 'web') UI.web = { view: 'home', q: '', a3: null }; openPanel(x); },
  closePanel: () => closePanel(),
  panelBack: () => {
    if (UI.stack.length) { UI.stack.pop(); renderPanel(); return; }
    if (UI.modal === 'phone' && UI.phoneApp) {
      if (UI.phoneStack.length) {
        const prev = UI.phoneStack.pop();
        UI.phoneApp = prev.panel; UI.panel = prev.panel; UI.stack = prev.stack;
        const mbox = document.querySelector('#modal .mbox.phone');
        if (mbox) mbox.innerHTML = phoneHTML();
      } else phoneToGrid();
    }
    renderPanel();
  },
  phoneBack: () => { phoneToGrid(); },
  phonePage: x => { UI.phonePage = parseInt(x, 10) || 0; UI.dlConfirm = null; openMenuPopup(); },
  officeAd: x => { UI.adCompany = x; openPanel('ads'); },
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
  paperAdBuy: () => { closePaper(); openPanel('offices'); },
  adCompany: x => { UI.adCompany = x; renderPanel(); },
  adRoute: x => { UI.adRoute = x; renderPanel(); },
  adWeeks: x => { UI.adWeeks = parseInt(x, 10) || 4; renderPanel(); },
  adBuy: () => { const mineList = (typeof mine === 'function') ? mine() : []; const a3 = (UI.adCompany && S.co[UI.adCompany]) ? UI.adCompany : (mineList.length ? mineList[0].a3 : null); if (!a3) { toast('Control a company first.', 'bad'); return; } const err = buyAd(a3, UI.adRoute || 'paper', UI.adWeeks || 4); if (err) toast(err, 'bad'); else { toast('Ad bought — it runs from this week.', 'good'); renderPanel(); } },
  tawkPost: () => { const inp = document.getElementById('tawkText'); const text = (inp ? inp.value : (UI.tawkDraft || '')).trim().slice(0, 280); if (!text) return; const t = tawkState(); t.posts.unshift({ id: 'u' + Date.now(), text, likes: 0 }); UI.tawkDraft = ''; if (S.person) S.person.vis = clamp((S.person.vis || 5) + 1, 0, 100); toast('Posted on Tawk.', 'good'); renderPanel(); },
  tawkLike: x => { const t = tawkState(); t.liked[x] = !t.liked[x]; save(); const b = document.querySelector(`[data-a="tawkLike"][data-x="${x}"]`); if (b) b.innerHTML = `${t.liked[x] ? '❤️' : '🤍'} ${tawkCompact(parseInt(b.dataset.likes || '0', 10) + (t.liked[x] ? 1 : 0))}`; },
  tawkRepost: x => { const t = tawkState(); t.reposted[x] = !t.reposted[x]; save(); const b = document.querySelector(`[data-a="tawkRepost"][data-x="${x}"]`); if (b) b.innerHTML = `🔁 ${tawkCompact(parseInt(b.dataset.reposts || '0', 10) + (t.reposted[x] ? 1 : 0))}${t.reposted[x] ? ' ✓' : ''}`; },
  tawkBookmark: x => { const t = tawkState(); t.bookmarked[x] = !t.bookmarked[x]; if (t.bookmarked[x]) { const all = tawkFeed('foryou').concat(tawkDailyPosts()); const p = all.find(p => p.id === x) || (t.posts || []).find(p => p.id === x); if (p) t.saved[x] = p; } else delete t.saved[x]; save(); const b = document.querySelector(`[data-a="tawkBookmark"][data-x="${x}"]`); if (b) b.innerHTML = t.bookmarked[x] ? '🔖 ✓' : '🔖'; },
  tawkFollow: x => { const t = tawkState(); t.followed[x] = !t.followed[x]; save(); document.querySelectorAll(`[data-a="tawkFollow"][data-x="${x}"]`).forEach(b => { b.innerHTML = t.followed[x] ? 'Following ✓' : 'Follow'; }); },
  tawkReply: x => { const feed = tawkFeed(UI.tawkTab || 'foryou'); const post = feed.find(p => p.id === x); UI.tawkDraft = (post ? post.acct.handle + ' ' : '') + (UI.tawkDraft || ''); UI.tawkView = 'feed'; renderPanel(); setTimeout(() => { const el = document.getElementById('tawkText'); if (el) el.focus(); }, 0); },
  tawkTab: x => { const ci = document.getElementById('tawkText'); if (ci) UI.tawkDraft = ci.value; UI.tawkTab = x; UI.tawkView = 'feed'; renderPanel(); },
  tawkView: x => { const ci = document.getElementById('tawkText'); if (ci) UI.tawkDraft = ci.value; const cc = document.getElementById('tawkChatText'); if (cc) UI.tawkChatDraft = cc.value; UI.tawkView = x; renderPanel(); },
  tawkSearch: () => { const inp = document.getElementById('tawkSearch'); UI.tawkQuery = inp ? inp.value.trim() : (UI.tawkQuery || ''); UI.tawkExploreTab = 'explore'; UI.tawkView = 'explore'; renderPanel(); },
  tawkDrawer: () => { UI.tawkDrawer = true; renderPanel(); },
  tawkDrawerClose: () => { UI.tawkDrawer = false; renderPanel(); },
  tawkDrawerNav: x => { UI.tawkDrawer = false; UI.tawkView = x; renderPanel(); },
  tawkExploreTab: x => { UI.tawkExploreTab = x; renderPanel(); },
  tawkTopic: x => { const tp = tawkTopics()[parseInt(x, 10)]; if (!tp) return; UI.tawkQuery = tp.label; UI.tawkExploreTab = 'explore'; UI.tawkView = 'explore'; renderPanel(); },
  tawkSportLeague: x => { UI.tawkSport = x; renderPanel(); },
  tawkJoinChat: x => { let g = null; ['base', 'foot', 'basket'].forEach(l => tawkSportGames(l).forEach(gg => { if (gg.id === x) g = gg; })); if (!g) return; const c = tawkEnsureChat(g); c.seen = c.msgs.length; UI.tawkGame = x; UI.tawkView = 'gamechat'; save(); renderPanel(); },
  tawkChatOpen: x => { const t = tawkState(); const c = t.chats[x]; if (!c) return; c.seen = c.msgs.length; UI.tawkGame = x; UI.tawkView = 'gamechat'; save(); renderPanel(); },
  tawkChatBack: () => { const ci = document.getElementById('tawkChatText'); if (ci) UI.tawkChatDraft = ci.value; UI.tawkView = 'chat'; renderPanel(); },
  tawkChatPost: () => { const inp = document.getElementById('tawkChatText'); const text = (inp ? inp.value : (UI.tawkChatDraft || '')).trim().slice(0, 280); if (!text) return; const t = tawkState(); const c = t.chats[UI.tawkGame]; if (!c) return; const youName = (S.you && S.you.name) || 'Founder'; c.msgs.push({ acct: { name: youName, handle: tawkHandle(youName), icon: '👤' }, text, time: 'now' }); c.seen = c.msgs.length; UI.tawkChatDraft = ''; if (S.person) S.person.vis = clamp((S.person.vis || 5) + 1, 0, 100); save(); renderPanel(); },
  tawkMuteAdd: () => { const inp = document.getElementById('tawkMuteWord'); const w = (inp ? inp.value : '').trim().toLowerCase(); if (!w) return; const t = tawkState(); if (!t.muted.includes(w)) t.muted.push(w); save(); renderPanel(); },
  tawkMuteRemove: x => { const t = tawkState(); t.muted.splice(parseInt(x, 10), 1); save(); renderPanel(); },
  tawkFocus: () => { UI.tawkView = 'feed'; renderPanel(); setTimeout(() => { const el = document.getElementById('tawkText'); if (el) el.focus(); }, 0); },
  radioStation: x => { UI.radioStation = x; UI.radioT = 0; UI.radioSlept = false; renderPanel(); },
  radioNext: () => { UI.radioTrack = (UI.radioTrack || 0) + 1; UI.radioT = 0; UI.radioSlept = false; renderPanel(); },
  radioAdNext: () => { UI.radioAdIdx = (UI.radioAdIdx || 0) + 1; renderPanel(); },
  radioView: x => { UI.radioView = x; renderPanel(); },
  radioFav: x => { const inp = document.getElementById('radioSearch'); if (inp) UI.radioQuery = inp.value; const r = radioState(); if (r.favs[x]) delete r.favs[x]; else r.favs[x] = true; save(); renderPanel(); },
  radioSearch: () => { const inp = document.getElementById('radioSearch'); UI.radioQuery = inp ? inp.value.trim() : ''; UI.radioView = 'home'; renderPanel(); },
  radioSleep: x => { const m = parseInt(x, 10) || 0; UI.radioSleepMin = m; UI.radioSleepUntil = m > 0 ? Date.now() + m * 60000 : null; UI.radioSlept = false; renderPanel(); },
  karmaYear: x => { UI.karmaYear = UI.karmaYear === x ? null : x; renderPanel(); },
  karmaYears: () => { UI.karmaShowYears = !UI.karmaShowYears; renderPanel(); },
  bankView: x => { UI.bankView = x; renderPanel(); },
  bankWallet: x => { UI.bankAcctSel = x === 'private' ? 'personal' : x === 'company' ? 'business' : x; UI.bankView = 'account'; openPanel('bank'); },
  bankAcct: x => { UI.bankAcctSel = x; UI.bankView = 'account'; renderPanel(); },
  bankCity: x => { UI.bankCity = +x; UI.bankView = 'cityloan'; renderPanel(); },
  etfCreate: x => act(() => createETF(x, 'player'), 'ETF created and listed!'),
  etfBuy: x => { const [id, q] = x.split('|'); act(() => buyETF(id, +q), 'ETF bought'); },
  etfSell: x => { const [id, q] = x.split('|'); act(() => sellETF(id, +q), 'ETF sold'); },
  officeDecision: x => act(() => takeOfficeDecision(x), 'Decision made'),
  officeLawSign: () => act(() => takeOfficeLawSign(), 'Law signed'),
  officeLawVeto: () => act(() => takeOfficeLawVeto(), 'Law vetoed'),
  rebirthPanel: () => { closeModal(); openPanel('bankruptcy'); },
  doRebirth: () => { const sel = $('rebirthCountry'); const a3 = sel ? sel.value : null; const err = rebirthAs(a3); if (err) toast(err, 'bad'); else { closePanel(); refreshAll(); save(); toast('Reborn — you keep nothing.', 'good'); } },
  takeCityLoan: () => { const amt = Math.floor(+($('loanAmt') ? $('loanAmt').value : 0)), mo = Math.floor(+($('loanMonths') ? $('loanMonths').value : 36)); act(() => takeCityLoan(UI.bankCity, amt, mo), 'Loan taken'); },
  walletSel: x => { UI.wallet = x; document.querySelectorAll('.wallet-pick').forEach(el => { el.querySelectorAll('.wallet-opt').forEach(b => b.classList.toggle('on', b.dataset.x === x)); const cc = el.querySelector('.wallet-cash'); if (cc) cc.textContent = 'Available Cash: ' + fmtMoney(walletCash(x)); }); save(); },
  bankJob: x => { act(() => switchJob(x), 'New job'); },
  newsView: x => { UI.newsView = x; UI.newsSection = null; renderPanel(); },
  newsSection: x => { UI.newsSection = x; renderPanel(); },
  newsSearch: () => { const inp = document.getElementById('newsSearch'); UI.newsQuery = inp ? inp.value.trim() : ''; UI.newsView = 'search'; renderPanel(); },
  newsPaper: () => { openPaper(); },
  paperEdPrev: () => flipEdition(1),
  paperEdNext: () => flipEdition(-1),
  scrim: (x, el, e) => {
    if (e.target !== el) return;
    // Clicking outside the phone: from an app, back to the phone grid;
    // from the grid, back to the map. No X button needed for either.
    if (UI.modal === 'phone') { if (UI.phoneApp) phoneToGrid(); else closeModal(); return; }
    if (UI.modal === 'sheet' || UI.modal === 'menu') closeModal();
  },
  closeModal: () => { closeModal(); if (S && S.over) gameOver(); },
  speed: x => { S.speed = +x; renderHUD(); },
  skipMenu: () => skipMenu(),
  skip: x => doSkip(+x),
  zoom: x => MapView.zoom(+x),
  locate: () => { const cap = (W && W.byA3[S.home] && W.cities[W.byA3[S.home].capital]) ? W.cities[W.byA3[S.home].capital].name : S.home; MapView.home(); toast(`Going home to ${cap}`); },
  more: () => { if (UI.modal === 'menu') closeModal(); else openMenuPopup(); },
  drawer: () => { if (UI.modal === 'phone') closeModal(); else openMenuPopup(); },
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
  layers: () => openLayersModal(),
  layerToggle: x => { if (!S.mapLayers) S.mapLayers = { vehicles: true, labels: true, cities: true }; S.mapLayers[x] = S.mapLayers[x] === false; save(); openLayersModal(); },
  departures: () => openDeparturesModal(),
  depCont: x => { UI.depCont = x; openDeparturesModal(); },
  depFly: x => { const dc = W.cities[+x]; if (S.flow && typeof flowCanExpand === 'function' && !flowCanExpand() && dc && dc.a3 !== S.home) return toast('Only your home country is open. Buy an office and hire a full board to travel.', 'bad'); closeModal(); try { airportFly(+x); } catch (e) { toast('Could not fly there.', 'bad'); } save(); renderHUD(); },
  marsExpand: () => { const err = marsExpand(S.home); if (err) return toast(err, 'bad'); save(); renderPanel(); toast('Mine expanded.', 'good'); },
  marsTravel: () => { closePanel(); closeModal(); CityView.openMars(); document.body.classList.add('in-city'); renderCityHUD(); toast('Welcome to Mars.', 'good'); },
  marsBuyMine: x => { const err = marsBuySite(S.home, +x); if (err) return toast(err, 'bad'); closePopup(); CityView.refresh(); renderCityHUD(); toast('Mine bought. Income arrives every week.', 'good'); save(); refreshAll(); },
  marsSellMine: x => { const err = marsSellSite(S.home, +x); if (err) return toast(err, 'bad'); closePopup(); CityView.refresh(); renderCityHUD(); toast('Mine sold.', 'good'); save(); refreshAll(); },
  airportBuy: x => {
    const [key, type] = (x || '').split('|');
    const dot = UI.dotBuy && UI.dotBuy.key === key ? UI.dotBuy : null;
    if (!dot) return toast('Pick a dot first.', 'bad');
    if (!S.airports) S.airports = {};
    if (S.airports[key]) return toast('You already own a building here.', 'bad');
    const price = type === 'hub' ? 1250000 : 220000;
    if (S.cash < price) return toast('Not enough cash.', 'bad');
    S.cash -= price;
    S.airports[key] = { type, name: dot.name, a3: dot.a3, x: dot.x, y: dot.y };
    UI.dotBuy = null;
    save(); closeModal(); renderHUD();
    toast(type === 'hub' ? 'Hub bought.' : 'Airport bought.', 'good');
  },
  routeStart: key => {
    closeModal();
    UI.routing = key;
    toast('Tap a destination dot to draw the route.', 'good');
  },
  routeRemove: x => {
    const [from, to] = (x || '').split('|');
    S.routes = (S.routes || []).filter(r => !(r.from === from && r.to === to));
    save(); closeModal(); renderHUD();
    toast('Route removed.', 'good');
  },
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
  cryptoCoin: x => { UI.cryptoCoin = x; renderPanel(); },
  cryptoPlace: x => {
    // Prefer controlled UI state over the live DOM input: if a
    // re-render replaced the input mid-click, the DOM value may be
    // stale or missing, but the state the player actually typed survives.
    // A validation failure keeps the attempted value in state (and
    // shows a toast) instead of silently doing nothing.
    const domS = $('cryptoStake') ? $('cryptoStake').value : '';
    const s = (UI.cryptoStakeVal != null && UI.cryptoStakeVal !== '') ? +UI.cryptoStakeVal : +domS;
    const coin = UI.cryptoCoin || 'pump';
    const err = cryptoPlaceBet(coin, x, s);
    if (err) { if (domS !== '') UI.cryptoStakeVal = domS; return toast(err, 'bad'); }
    UI.cryptoStakeVal = String(s); save(); renderPanel(); renderHUD(); toast('Bet placed — coin moves for 30 seconds.', 'good');
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
    // Recently viewed, for the Trade tab: newest first, cap 6.
    if (!S.tradeRecent) S.tradeRecent = [];
    S.tradeRecent = [x].concat(S.tradeRecent.filter(k => k !== x)).slice(0, 6);
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
  flyCity: x => { closePanel(); MapView.flyToCity(+x); },
  flyCountry: x => { closePanel(); MapView.flyToCountry(x); },
  qty: x => { const q = $('qty'); if (q) q.value = Math.max(1, (+q.value || 0) + +x); },
  qtyMax: x => {
    const q = $('qty'); if (!q) return;
    const c = S.co[x]; if (c) { q.value = Math.max(1, Math.floor(walletCash(curWallet()) / c.price)); return; }
    const b = S.extra && S.extra[x]; if (b) q.value = Math.max(1, Math.floor(walletCash(curWallet()) / b.price));
  },
  doTrade: x => {
    const [a3, side] = x.split('|'); const n = +($('qty') ? $('qty').value : 0);
    const err = trade(a3, side, n, curWallet());
    if (err) return toast(err, 'bad');
    closeModal(); const lt = S.lastTrade && S.lastTrade.a3 === a3 ? ` · Realised ${fmtMoney(S.lastTrade.pnl, true)}` : ''; toast(`${side[0].toUpperCase() + side.slice(1)} ${n.toLocaleString()} ${S.co[a3].sym}${lt}`, 'good'); tutCheck(); save(); refreshAll();
  },
  doTradeExtra: x => {
    const [id, side] = x.split('|'); const n = +($('qty') ? $('qty').value : 0);
    const err = tradeExtra(id, side, n, curWallet());
    if (err) return toast(err, 'bad');
    const b = S.extra[id]; toast(`${side[0].toUpperCase() + side.slice(1)} ${n.toLocaleString()} ${b.sym}`, 'good'); save(); refreshAll();
  },
  research: x => act(() => research(x, curWallet()), 'Research done'),
  takeover: x => {
    const [a3, p] = x.split('|');
    act(() => takeover(a3, +p, curWallet()), 'Takeover complete! You now own it outright.');
  },
  tradeTab: x => { UI.tradeTab = x; renderPanel(); },
  tradeRange: x => { UI.tradeRange = x; renderPanel(); },
  tradeIpoSel: x => { UI.tradeIpoCo = x; UI.tradeTab = 'ipo'; renderPanel(); },
  tradeIpoPctSet: () => { const el = document.getElementById('tradeIpoPct'); if (el) UI.tradeIpoPct = Math.min(100, Math.max(5, parseFloat(el.value) || 100)); const ve = document.getElementById('tradeIpoVal'); if (ve && parseFloat(ve.value) > 0) UI.tradeIpoVal = parseFloat(ve.value); renderPanel(); },
  tradeIpoLaunch: x => { const pe = document.getElementById('tradeIpoPct'), ve = document.getElementById('tradeIpoVal'); const pct = pe ? clamp(parseFloat(pe.value) || 100, 5, 100) / 100 : (UI.tradeIpoPct != null ? UI.tradeIpoPct : 100) / 100; const val = ve ? parseFloat(ve.value) : (UI.tradeIpoVal != null ? UI.tradeIpoVal : null); act(() => goPublic(x, pct, val), 'IPO complete!'); },
  issueShares: x => {
    const c = S.co[x]; if (!c) return toast('Company not found', 'bad');
    const qty = Math.floor(+($('issueQty') ? $('issueQty').value : 0)); if (!qty || qty <= 0) return toast('Enter a share count', 'bad');
    const price = c.price, proceeds = qty * price, fee = Math.round(proceeds * 0.0385), raised = proceeds - fee;
    c.shares += qty; c.price = Math.max(0.01, c.price * 0.97); S.cash += raised;
    news('Market', `${c.name} issued ${qty.toLocaleString()} new shares at ${fmtMoney(price)}. Raised ${fmtMoney(raised, true)} after ${fmtMoney(fee, true)} fees.`, x);
    toast(`Issued ${qty.toLocaleString()} shares, raised ${fmtMoney(raised, true)}`, 'good'); save(); renderPanel();
  },
  sportLeague: x => { ensureSports(); S.sports.tab = x; UI.stack = []; renderPanel(); },
  sportTeam: x => { UI.stack = [x]; renderPanel(); },
  sportDay: x => { UI.sportDay = parseInt(x, 10) || 0; UI.sportView = UI.sportView || 'scores'; renderPanel(); },
  sportView: x => { UI.sportView = x; renderPanel(); },
  sportLeagueView: x => { UI.sportView = 'league'; UI.sportLg = x; renderPanel(); },
  sportFav: x => { const f = sportFavs(); if (f[x]) delete f[x]; else f[x] = true; save(); renderPanel(); },
  sportLgFav: x => { const f = sportLgFavs(); if (f[x]) delete f[x]; else f[x] = true; save(); renderPanel(); },
  sportSearch: () => { const el = document.getElementById('sportSearch'); UI.sportQuery = el ? el.value.trim() : ''; renderPanel(); },
  sportTab: x => { UI.sportTab = x; renderPanel(); },
  sportFin: x => { UI.sportFin = x; renderPanel(); },
  buyTeam: x => act(() => buySportTeam(x, curWallet()), 'Team bought!'),
  stadiumUp: x => act(() => upgradeStadium(x), 'Stadium upgraded'),
  sportRename: x => { const inp = document.getElementById('sportName'); act(() => renameSportTeam(x, inp ? inp.value : ''), 'Team renamed'); },
  sportLogo: x => { const [id, logo] = x.split('|'); act(() => setSportLogo(id, logo, null), 'Logo changed'); },
  sportColor: x => { const [id, col] = x.split('|'); act(() => setSportLogo(id, null, col), 'Colour changed'); },
  signFA: x => { const [tid, pid] = x.split('|'); act(() => signFreeAgent(tid, pid), 'Player signed!'); },
  draftPick: x => { const [tid, pid] = x.split('|'); act(() => draftSportPlayer(tid, pid), 'Draft pick signed!'); },
  tradeOut: x => { UI.tradeOut = x; renderPanel(); },
  tradeIn: x => { const [tid, pid] = x.split('|'); UI.tradeTarget = tid; UI.tradeIn = pid; renderPanel(); },
  doSportTrade: x => { const cash = Math.floor(+($('tradeCash') ? $('tradeCash').value : 0)); act(() => tradeSportPlayer(x, UI.tradeOut, UI.tradeTarget, UI.tradeIn, cash), 'Trade done!'); UI.tradeOut = null; UI.tradeIn = null; },
  hireBoard: x => { const [kind, id, role] = x.split('|'); if (kind === 'co' && S.flow && typeof flowHasOffice === 'function' && !flowHasOffice(id)) return toast('Buy an office for this company first.', 'bad'); const e = kind === 'team' ? sportTeam(id) : S.co[id]; boardCandidates(e, role); UI.hire = { kind, id, role, candId: null, salary: 0, grant: 'none', shares: 0 }; renderPanel(); },
  findCand: x => { const [kind, id, role] = x.split('|'); if (kind === 'co' && S.flow && typeof flowHasOffice === 'function' && !flowHasOffice(id)) return toast('Buy an office for this company first.', 'bad'); const e = kind === 'team' ? sportTeam(id) : S.co[id]; boardCandidates(e, role); UI.hire = { kind, id, role, candId: null, salary: 0, grant: 'none', shares: 0 }; renderPanel(); },
  findCandMore: x => { const [kind, id, role] = x.split('|'); const e = kind === 'team' ? sportTeam(id) : S.co[id]; if (e.candPool) delete e.candPool[role]; boardCandidates(e, role); UI.hire = { kind, id, role, candId: null, salary: 0, grant: 'none', shares: 0 }; renderPanel(); },
  hireSelect: x => { const [kind, id, role, candId] = x.split('|'); const e = kind === 'team' ? sportTeam(id) : S.co[id]; const c = boardCandidates(e, role).find(y => y.id === candId); if (!c) return toast('Candidate not found.', 'bad'); UI.hire = { kind, id, role, candId, salary: c.ask, grant: 'none', shares: 0 }; renderPanel(); },
  hireStep: x => { if (!UI.hire) return; UI.hire.salary = Math.max(1000, UI.hire.salary + (+x)); renderPanel(); },
  hireGrant: x => { if (!UI.hire) return; UI.hire.grant = x; if (x === 'none') UI.hire.shares = 0; else if (!UI.hire.shares) UI.hire.shares = 1000; renderPanel(); },
  hireShares: x => { if (!UI.hire) return; UI.hire.shares = Math.max(0, UI.hire.shares + (+x)); renderPanel(); },
  hireCancel: () => { UI.hire = null; renderPanel(); },
  offerBoard: () => {
    const h = UI.hire; if (!h) return;
    if (h.kind === 'co' && S.flow && typeof flowHasOffice === 'function' && !flowHasOffice(h.id)) return toast('Buy an office for this company first.', 'bad');
    const e = h.kind === 'team' ? sportTeam(h.id) : S.co[h.id];
    const c = boardCandidates(e, h.role).find(y => y.id === h.candId);
    const err = offerBoard(e, h.role, c, h.salary, h.kind === 'team' ? 'none' : h.grant, h.kind === 'team' ? 0 : h.shares);
    UI.hire = null;
    if (err) toast(err, 'bad'); else toast(`${c.name} accepted as ${h.role}!`, 'good');
    save(); renderPanel();
  },
  fireBoard: x => { const [kind, id, role] = x.split('|'); const e = kind === 'team' ? sportTeam(id) : S.co[id]; act(() => fireBoard(e, role), `${role} seat cleared.`); },
  buyOffice: x => { act(() => buyOffice(x), 'Office opened'); },
  hireExecMgr: x => { const [id, kind] = x.split('|'); const e = S.co[id]; if (!e) return; if (typeof execManagerCandidates === 'function') execManagerCandidates(e, kind); UI.mgrHire = { id, kind }; renderPanel(); },
  hireExecMgrDo: x => { const [id, kind, candId] = x.split('|'); const e = S.co[id]; if (!e) return; const err = (typeof hireExecManager === 'function') ? hireExecManager(e, kind, candId) : 'unavailable'; UI.mgrHire = null; if (err) toast(err, 'bad'); else toast('Manager hired', 'good'); renderPanel(); },
  fireExecMgr: x => act(() => { const [id, kind] = x.split('|'); const e = S.co[id]; return (typeof fireExecManager === 'function') ? fireExecManager(e, kind) : 'unavailable'; }, 'Manager fired'),
  hireMktEmp: x => act(() => { const e = S.co[x]; return (typeof hireMarketingEmployee === 'function') ? hireMarketingEmployee(e) : 'unavailable'; }, 'Marketing staff hired'),
  mgrHireCancel: () => { UI.mgrHire = null; renderPanel(); },
  ageWeek: () => { try { stepWeek(); save(); renderHUD(); if (UI.panel) renderPanel(); if (S.lastPaperError) { const m = S.lastPaperError; S.lastPaperError = null; toast('Week advanced, but the newspaper failed: ' + String(m).slice(0, 120), 'bad'); } else openPaper(); } catch (e) { const stk = (e && e.stack ? String(e.stack).split('\n').slice(1, 3).join(' ').trim() : ''); toast('Could not advance a week: ' + String(e && e.message ? e.message : e).slice(0, 120) + (stk ? ' | ' + stk.slice(0, 160) : ''), 'bad'); } },
  sportIpo: x => { const el = document.getElementById('ipoPctTeam'); const pct = el ? clamp(parseFloat(el.value) || 100, 1, 100) / 100 : 1; act(() => sportIpo(x, pct), 'Team is now public!'); },
  ipoBuy: x => { const qty = Math.floor(+($('ipoQty') ? $('ipoQty').value : 0)); act(() => sportTradeShares(x, 'buy', qty), 'Shares bought'); },
  ipoSell: x => { const qty = Math.floor(+($('ipoQty') ? $('ipoQty').value : 0)); act(() => sportTradeShares(x, 'sell', qty), 'Shares sold'); },
  storeOpen: x => { pushPanel(x); },
  storeTab: x => { UI.storeTab = x; renderPanel(); },
  storePrice: x => { const [id, idx, d] = x.split('|'); act(() => setStorePrice(id, +idx, (storeById(id).products[+idx].price + +d)), 'Price changed'); },
  storeDel: x => { const [id, k] = x.split('|'); act(() => toggleStoreDelegation(id, k), 'Delegation changed'); },
  storeStaffShow: x => { UI.storeStaffShow = (UI.storeStaffShow === x ? null : x); renderPanel(); },
  storeHire: x => act(() => hireStoreStaff(x), 'Staff hired'),
  mgrSalary: x => { const [id, d] = x.split('|'); act(() => adjustManagerSalary(id, +d), 'Manager salary changed'); },
  fireMgr: x => act(() => fireStoreManager(x), 'New manager hired'),
  progressSel: x => { UI.progressSel = +x; renderPanel(); },
  msCat: x => { UI.msCat = +x; UI.msPage = 0; UI.msNode = null; renderPhoneApp(); renderPanel(); },
  msPage: x => { const ci = UI.msCat || 0; const pages = Math.ceil(msNodes(ci).length / MS_PAGE_SIZE); UI.msPage = Math.max(0, Math.min(pages - 1, (UI.msPage || 0) + (+x))); UI.msNode = null; renderPhoneApp(); renderPanel(); },
  msNode: x => { UI.msNode = x; renderPhoneApp(); renderPanel(); },
  calShift: dm => { const now = dateOf(S.day), cur = UI.calYM || { y: now.getUTCFullYear(), m: now.getUTCMonth() }; const d = new Date(Date.UTC(cur.y, cur.m + dm, 1)); UI.calYM = { y: d.getUTCFullYear(), m: d.getUTCMonth() }; renderPhoneApp(); },
  calPrev: () => A.calShift(-1),
  calNext: () => A.calShift(1),
  calToday: () => { const now = dateOf(S.day); UI.calYM = { y: now.getUTCFullYear(), m: now.getUTCMonth() }; UI.calSel = S.day; renderPhoneApp(); },
  calDay: x => { UI.calSel = +x; renderPhoneApp(); },
  storeDev: x => { const [id, idx] = x.split('|'); act(() => developProduct(id, +idx), 'Product developed'); },
  storeUp: x => act(() => upgradeStore(x), 'Store upgraded'),
  storeIconOpen: x => { openModal(`<h2>Pick a logo</h2><p class="muted">Tap a logo for this business.</p><div class="row wrap">${STORE_LOGOS.map(lg => `<button class="btn" style="padding:6px" data-a="storeIconDo" data-x="${x}|logo:${lg}"><img src="${(typeof STORE_LOGO_DATA !== 'undefined' && STORE_LOGO_DATA[lg]) || ('store-logos/' + lg + '.png')}" alt="${lg}" style="width:44px;height:44px;object-fit:contain;background:#fff;border-radius:6px"><br><small>${(STORE_TYPES[lg] || {}).name || lg}</small></button>`).join('')}</div><p class="muted small">More icons</p><div class="row wrap">${STORE_ICONS.map(ic => `<button class="btn" style="font-size:22px;padding:8px 10px" data-a="storeIconDo" data-x="${x}|${ic}">${ic}</button>`).join('')}</div>`, 'sheet'); },
  storeIconDo: x => { const [id, ic] = x.split('|'); act(() => setStoreIcon(id, ic), 'Logo changed'); closeModal(); },
  storeCamp: x => { const [id, cid] = x.split('|'); act(() => startStoreCampaign(id, cid), 'Campaign started'); },
  storeRename: x => { const inp = document.getElementById('storeName'); act(() => renameStore(x, inp ? inp.value : ''), 'Store renamed'); },
  closeStore: x => { act(() => closeStore(x), 'Store closed'); closePanel(); openPanel('stores'); },
  takeLoan: () => { const amt = Math.floor(+($('loanAmt') ? $('loanAmt').value : 0)), mo = Math.floor(+($('loanMonths') ? $('loanMonths').value : 36)); act(() => takeLoan(amt, mo), 'Loan taken'); },
  buildStoreOpen: x => { const [cityId, lotT] = x.split('|'); if (typeof isGovCity === 'function' && isGovCity(W.cities[+cityId])) return toast('Capitals are government-only — build in another city.', 'bad'); UI.buildLot = { cityId: +cityId, lotT: +lotT };
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
    openModal(`<h2>Build a store</h2>${walletPickerHTML()}<p class="muted">${esc(city.name || '')} · Population ${(city.pop || 0).toLocaleString()} · Foot traffic ${(lot.traffic || 0).toLocaleString()}/week · Rent ${fmtMoney(rent)}/week · Deposit ${fmtMoney(deposit, true)} upfront. Bigger cities mean more customers — pick the business that fits this spot, then develop it: a store alone never makes trillions.</p>
    ${sectors.length ? `<p class="muted small"><b>Sectors available in ${esc(country.name)}:</b> ${sectors.map(esc).join(' · ')}. Every country gets its own set. Advanced sectors like semiconductors and robotics will need research, time and money later — for now no business type is locked, and profit decides: a coffee shop can out-earn a fancy business early.</p>` : ''}
    <p class="muted small">Your Progress: Lv ${lv} · Manager level available: Lv ${maxManagerLevel()}</p><div class="list">${cards}</div>`, 'sheet'); },
  buildStoreDo: x => { const lot = UI.buildLot; if (!lot) return toast('Pick a FOR LEASE pin first', 'bad'); const err = buildStore(lot.cityId, lot.lotT, x, curWallet()); if (err) return toast(err, 'bad'); closeModal(); closePopup(); CityView.refresh(); renderCityHUD(); toast('Store opened! Results arrive every week.', 'good'); save(); refreshAll(); },
  openStadium: x => { closePopup(); if (CityView.isOpen()) leaveCity(); ensureSports(); S.sports.tab = sportTeam(x).league; openPanel('sports'); UI.stack = [x]; renderPanel(); },
  webCo: x => { UI.web = { view: 'site', q: '', a3: x }; openPanel('web'); },
  siteMaker: x => { UI.siteA3 = x; openPanel('site'); },
  siteDim: x => { const [a3, dim, val] = x.split('|'); act(() => setSitePending(a3, dim, val), 'Change queued for next week'); renderPanel(); },
  capUp: x => act(() => upgradeCapital(x), 'District upgraded'),
  capTheme: x => { ensureCapital().theme = x; renderPanel(); },
  capRename: () => { const v = document.getElementById('capName'); if (v && v.value.trim()) { ensureCapital().name = v.value.trim(); applyCapitalName(); toast('Capital renamed', 'good'); renderPanel(); } },
  profileRename: () => { const inp = document.getElementById('profileName'); const v = inp ? inp.value.trim() : ''; if (!v) return toast('Enter a name first.', 'bad'); if (!S.you) S.you = { name: 'Founder' }; S.you.name = v.slice(0, 24); toast('Name saved', 'good'); renderHUD(); renderPanel(); },
  youLook: x => { const lk = youLookOpts()[+x]; if (!lk) return; if (!S.you) S.you = { name: 'Founder' }; S.you.look = lk; save(); renderHUD(); renderPanel(); },
  youLookShuffle: () => { UI.youLookOpts = Array.from({length: 8}, () => randLook()); renderPanel(); },
  pickLook: (x, el) => { UI.pickLookIdx = +x; document.querySelectorAll('#pickLooksRow .pick-look').forEach(b => b.classList.toggle('on', b === el)); },
  pickLookShuffle: () => { UI.pickLooks = Array.from({length: 8}, () => randLook()); UI.pickLookIdx = 0; const row = document.getElementById('pickLooksRow'); if (row) row.innerHTML = lookPickerHTML(UI.pickLooks, 0, 'pickLook', 'pickLookShuffle'); },
  inheritLook: (x, el) => { UI.inheritLookIdx = +x; document.querySelectorAll('#inheritLooksRow .pick-look').forEach(b => b.classList.toggle('on', b === el)); },
  inheritLookShuffle: () => { UI.inheritLooks = Array.from({length: 8}, () => randLook()); UI.inheritLookIdx = 0; const row = document.getElementById('inheritLooksRow'); if (row) row.innerHTML = lookPickerHTML(UI.inheritLooks, 0, 'inheritLook', 'inheritLookShuffle'); },
  tradeFocus: () => { const el = document.getElementById('tradeBox'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  capMotto: () => { const v = document.getElementById('capMotto'); if (v) { ensureCapital().motto = v.value.trim(); toast('Motto saved', 'good'); renderPanel(); } },
  airportCont: x => { UI.airport = { cont: x, a3: null }; renderPanel(); },
  airportCountry: x => { UI.airport = { cont: UI.airport.cont, a3: x }; renderPanel(); },
  airportBack: () => { UI.airport = { cont: null, a3: null }; renderPanel(); },
  airportBack2: () => { UI.airport = { cont: UI.airport.cont, a3: null }; renderPanel(); },
  airportFly: x => { const dc = W.cities[+x]; if (S.flow && typeof flowCanExpand === 'function' && !flowCanExpand() && dc && dc.a3 !== S.home) return toast('Only your home country is open. Buy an office and hire a full board to travel.', 'bad'); act(() => airportFly(+x), null); },
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
  warPlan: x => { if (S.flow && typeof flowCanExpand === 'function' && !flowCanExpand()) return toast('Buy an office and hire a full board to expand.', 'bad'); const ap0 = approachList(x).find(a => a.ok); UI.warPlan = { target: x, army: 100, navy: 100, air: 100, approach: ap0 ? ap0.id : 'land', approachBonus: ap0 ? ap0.bonus : 0, research: false }; closePopup(); if (CityView.isOpen()) leaveCity(); openPanel('warplan'); },
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
  personInvest: x => { act(() => transferToBusiness(x === 'all' ? 'all' : +x), 'Invested in your business'); tutCheck(); },
  personPay: x => act(() => transferToPersonal(x === 'all' ? 'all' : +x), 'Paid yourself'),
  personPromo: () => act(() => promoteJob(), 'Promoted!'),
  personApplyCompany: x => act(() => applyCompanyJob(x), 'Hired!'),
  analystSet: x => { const [kind, v] = x.split('|'); act(() => setAnalystSetting(kind, +v), 'Decision made'); },
  personEnrollCollege: x => act(() => enrollCollege(x), 'Enrolled!'),
  personJoinAgency: x => act(() => joinAgency(x), 'Joined the agency'),
  personEnlist: () => act(() => enlistMilitary(), 'Enlisted'),
  cabType: x => { UI.cabHire = { type: x }; if (typeof cabCandidates === 'function') cabCandidates(x); renderPanel(); },
  cabHire: x => { const [type, id] = x.split('|'); act(() => hireCabinet(type, id), 'Advisor hired'); UI.cabHire = null; renderPanel(); },
  cabCancel: () => { UI.cabHire = null; renderPanel(); },
  cabFire: x => act(() => fireCabinet(x), 'Advisor fired'),
  advSearch: () => { const el = document.querySelector('#advSearch'); UI.advQuery = el ? el.value.trim() : ''; renderPanel(); },
  advClear: () => { UI.advQuery = ''; renderPanel(); },
  advAdd: () => { UI.advAdd = !UI.advAdd; renderPanel(); },
  advOpen: x => { UI.advOpen = UI.advOpen === x ? null : x; renderPanel(); },
  advJump: x => { const rail = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split(''); let i = rail.indexOf(x); if (i < 0) i = 0; let el = null; while (i < rail.length && !el) { el = document.getElementById('adv-sec-' + rail[i]); i++; } if (!el) el = document.getElementById('adv-sec-' + rail[0]); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start' }); },
  advMic: () => { const el = document.querySelector('#advSearch'); if (el) el.focus(); },
  cabTip: x => act(() => buyCabTip(x), 'Tip bought — it pays off next week'),
  runOffice: x => act(() => runOffice(x), 'Election won!'),
  electVote: x => {
    // x = jurKey|scope|electDay|candIdx (jurKey may contain ':').
    const parts = x.split('|'), candIdx = parseInt(parts.pop(), 10), electDay = parseInt(parts.pop(), 10), scope = parts.pop(), jurKey = parts.join('|');
    const key = electionVoteKey(jurKey, scope, electDay);
    const votes = electionVotes();
    if (votes[key] != null) { toast('You already voted in this race.', 'bad'); return; }
    votes[key] = candIdx;
    const P = ensurePerson(); P.opin = Math.min(100, (P.opin || 0) + 1);
    save(); renderPanel(); toast('Vote counted.', 'good');
  },
  electOpen: x => { UI.electOpen = UI.electOpen === x ? null : x; renderPanel(); },
  electCity: x => { UI.electCity = UI.electCity === x ? null : x; renderPanel(); },
  phoneHome: () => { phoneToGrid(); },
  campaign: x => act(() => campaignAction(x), 'Campaign move done'),
  policy: () => act(() => announcePolicy(), 'Policy announced'),
  fleetUp: x => act(() => upgradeFleet(x), 'Fleet upgraded'),
  fleetSell: x => act(() => sellFleet(x), 'Fleet level sold'),
  borrow: () => act(() => borrow(Math.min(maxLoan(), Math.max(50000, maxLoan() / 4))), 'Loan taken'),
  repay: () => act(() => repay(Math.min(S.loan, Math.max(0, S.cash))), 'Loan repaid'),
  ipo: x => { const el = document.getElementById('ipoPct-' + x) || document.getElementById('ipoPct'); const ve = document.getElementById('ipoVal-' + x); const pct = el ? clamp(parseFloat(el.value) || 100, 5, 100) / 100 : 1; const val = ve ? parseFloat(ve.value) : null; act(() => goPublic(x, pct, val), 'IPO complete!'); },
  boardMeeting: x => {
    const c = S.co[x];
    if (!c) return;
    if (!controlled(x)) { toast('Only companies you control hold board meetings.', 'bad'); return; }
    UI.boardReturn = (UI.modal === 'phone' && UI.phoneApp) ? UI.phoneApp : (UI.panel || 'offices');
    UI.panel = 'boardMeeting'; UI.stack = [{ a3: x }];
    if (UI.modal === 'phone' && document.querySelector('#phoneCard')) {
      UI.phoneApp = 'boardMeeting';
      const mbox = document.querySelector('#modal .mbox.phone'); if (mbox) mbox.innerHTML = phoneHTML();
      renderPhoneApp();
    } else { renderPanel(); }
  },
  boardBack: x => {
    const back = UI.boardReturn || 'offices';
    UI.panel = back; UI.stack = [];
    if (UI.modal === 'phone' && document.querySelector('#phoneCard')) {
      UI.phoneApp = back;
      const mbox = document.querySelector('#modal .mbox.phone'); if (mbox) mbox.innerHTML = phoneHTML();
      renderPhoneApp();
    } else { renderPanel(); }
  },
  boardVote: x => {
    const c = S.co[x]; if (!c) return;
    if (c.lastBoardQ === quarterLabel(S.day)) { toast('Already held a meeting this quarter.', 'bad'); return; }
    const board = (typeof ensureBoard === 'function') ? ensureBoard(c) : [];
    if (!board.length) { toast('Hire a board first.', 'bad'); return; }
    const divEl = document.getElementById('boardDiv'), salEl = document.getElementById('boardSal');
    const divSet = divEl && divEl.value !== '' ? clamp(Math.round(parseFloat(divEl.value) || 0), 0, 100) : null;
    const salSet = salEl && salEl.value !== '' ? Math.max(0, Math.round(parseFloat(salEl.value) || 0)) : null;
    if (divSet == null && salSet == null) { toast('Set a dividend, a salary, or both.', 'bad'); return; }
    const votes = board.map(m => {
      const v = { name: m.name, role: m.role };
      if (divSet != null) { const r = boardVoteFor(c, m, 'div', divSet); v.div = r.yes; v.divReason = r.reason; }
      if (salSet != null) { const r = boardVoteFor(c, m, 'sal', salSet); v.sal = r.yes; v.salReason = r.reason; }
      return v;
    });
    const majority = arr => arr.filter(Boolean).length > arr.length / 2;
    const divOk = divSet != null ? majority(votes.map(v => v.div)) : null;
    const salOk = salSet != null ? majority(votes.map(v => v.sal)) : null;
    if (divOk) c.divPct = divSet;
    if (salOk) c.ceoSalary = salSet;
    c.lastBoardQ = quarterLabel(S.day);
    UI.boardResult = { a3: x, divSet, salSet, divOk, salOk, votes };
    if (UI.modal === 'phone' && document.querySelector('#phoneCard')) renderPhoneApp(); else renderPanel();
    toast(divOk === false && salOk === false ? 'Board voted both down.' : divOk === false ? 'Dividend voted down — salary approved.' : salOk === false ? 'Salary voted down — dividend approved.' : 'Board approved.', divOk === false && salOk === false ? 'bad' : 'good');
  },
  closeLoc: x => {
    const [a3, id] = x.split('|');
    act(() => { closeLoc(S.co[a3], id); return null; }, 'Location closed');
    closePopup(); CityView.refresh();
  },
  enterCity: x => { closeModal(); enterCity(+x); },
  unlockCity: x => { const err = unlockCity(+x); if (err) { toast(err, 'bad'); return; } closeModal(); save(); renderHUD(); toast('City unlocked.', 'good'); },
  leaveCity: () => leaveCity(),
  depLeave: () => { closeModal(); leaveCity(); },
  depWorld: () => { closeModal(); if (CityView.isOpen()) leaveCity(); if (typeof MapView !== 'undefined' && MapView.flyToCountry) MapView.flyToCountry(S.home); },
  depEstate: () => { toast('Your city is not set yet — send it when you are ready.'); },
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
    const err = buyBuilding(CityView.city.id, +x, curWallet());
    if (err) return toast(err, 'bad');
    closeModal(); closePopup(); CityView.refresh(); renderCityHUD(); toast('Building bought. Rent arrives every week.', 'good'); save(); refreshAll();
  },
  buyAnyBld: x => {
    const err = buyAnyBuilding(CityView.city.id, +x, curWallet());
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
A.mgplay = (g) => { UI.mgGame = g; renderPhoneApp(); renderPanel(); };
A.mgmenu = () => { UI.mgGame = null; renderPhoneApp(); renderPanel(); };
// App Store actions: open a downloaded game from its tile or the
// store, download it onto the Home Screen, delete it again.
A.mgplayPhone = (g) => {
  const sup = UI.dlSuppress === g; UI.dlSuppress = null;
  if (sup) return;
  UI.phoneApp = 'minigames'; UI.panel = 'minigames'; UI.mgGame = g; renderPhoneApp();
};
A.storeTab = (t) => { UI.storeTab = t; UI.storeGame = null; UI.storeDelConfirm = null; renderPhoneApp(); };
A.storeFilter = (k) => { UI.storeFilter = k; renderPhoneApp(); };
A.storeGame = (id) => { UI.storeGame = id; renderPhoneApp(); };
A.storeBack = () => { UI.storeGame = null; UI.storeDelConfirm = null; renderPhoneApp(); };
A.storeDl = (id) => {
  if (!Array.isArray(S.downloaded)) S.downloaded = [];
  if (!S.downloaded.includes(id)) S.downloaded.push(id);
  save();
  const g = storeGame(id);
  toast(g ? g.name + ' added to your Home Screen · Games page' : 'Added to your Home Screen');
  renderPhoneApp();
};
A.storeDelAsk = (id) => { UI.storeDelConfirm = id; renderPhoneApp(); };
A.storeDelCancel = () => { UI.storeDelConfirm = null; renderPhoneApp(); };
A.storeDel = (id) => {
  S.downloaded = (S.downloaded || []).filter(x => x !== id);
  save(); UI.storeDelConfirm = null; UI.dlSuppress = null;
  toast('Deleted from your Home Screen'); renderPhoneApp();
};
A.storeSearch = () => { const el = document.getElementById('storeQ'); UI.storeQuery = el ? el.value : ''; renderPhoneApp(); };
A.dlCancel = () => { UI.dlConfirm = null; UI.dlSuppress = null; openMenuPopup(); };
A.dlDelete = (id) => {
  S.downloaded = (S.downloaded || []).filter(x => x !== id);
  save(); UI.dlConfirm = null; UI.dlSuppress = null;
  toast('Deleted from your Home Screen'); openMenuPopup();
};
// Long-press a downloaded game tile to delete it, iOS-style. The
// timer clears on any real movement, so scrolling the grid never
// deletes anything. The press also arms a one-tap suppress flag so
// the tap that ends the long-press does not also open the game.
let dlPressTimer = null, dlPressX = 0, dlPressY = 0, dlPressId = null;
function setupDlLongPress() {
  if (setupDlLongPress.done) return; setupDlLongPress.done = true;
  document.addEventListener('pointerdown', e => {
    const t = e.target.closest && e.target.closest('.phone-app[data-dl]');
    if (!t || UI.modal !== 'phone' || UI.phoneApp) return;
    dlPressId = t.getAttribute('data-x'); dlPressX = e.clientX; dlPressY = e.clientY;
    dlPressTimer = setTimeout(() => {
      dlPressTimer = null; UI.dlSuppress = dlPressId;
      if (dlPressId) { UI.dlConfirm = dlPressId; openMenuPopup(); }
    }, 600);
  }, true);
  const clearDlPress = e => {
    if (dlPressTimer && e && e.type === 'pointermove' && Math.hypot(e.clientX - dlPressX, e.clientY - dlPressY) <= 12) return;
    if (dlPressTimer) { clearTimeout(dlPressTimer); dlPressTimer = null; }
  };
  document.addEventListener('pointermove', clearDlPress, true);
  document.addEventListener('pointerup', clearDlPress, true);
  document.addEventListener('pointercancel', clearDlPress, true);
  document.addEventListener('contextmenu', e => {
    if (e.target.closest && e.target.closest('.phone-app[data-dl]')) e.preventDefault();
  });
}
setupDlLongPress();
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
  if (t.id === 'advSearch') { UI.advQuery = t.value; const pos = t.selectionStart; renderPanel(); const n = $('advSearch'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } return; }
  if (t.id === 'wsearch') { UI.web.q = t.value; const pos = t.selectionStart; renderPanel(); const n = $('wsearch'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } return; }
  // Crypto inputs are CONTROLLED state: the value is stored here on
  // every keystroke and the panel renders FROM it, so a price refresh
  // or frame-loop re-render can never wipe a typed stake/target.
  // Deliberately no renderPanel() here — re-rendering on input would
  // fight the keystroke that just happened.
  if (t.id === 'cryptoStake') { UI.cryptoStakeVal = t.value; return; }
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
  if (!t) return;
}
boot();
