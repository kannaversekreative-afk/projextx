// Ticker Tycoon UI — rewritten for the v2 engine (S.v === 2).
// Plain JS, no framework. Original art and names only.
// Wiring note: this file uses ONLY engine functions that exist in
// data.js / sim.js / world-events.js / mapview.js / cityview.js.
'use strict';

let W = null, S = null;
const UI = { panel: null, stack: [], modal: null, q: '', cat: 'All', starOnly: false,
  range: '1Y', tradeRange: '1Y', web: { view: 'search', q: '', a3: null }, pick: null,
  mode: 'normal', color: LOGO_COLORS[0], acc: 0, lastPanel: 0, lastDraw: 0, lastSave: 0 };
const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const upCls = x => x >= 0 ? 'up' : 'down';
// Time does NOT move on its own, and there is no age limit. The game
// year only moves when the player presses the small Age button, which
// runs stepYear(). Vehicles animate on the map's own requestAnimationFrame
// loop, independent of game time, so they keep moving while the player
// waits between Age presses. A player can live 100 years, or 1000.
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
  if (!s.maxDays) s.maxDays = NORMAL_DAYS;
  if (s.yearsBought == null) s.yearsBought = 0;
  if (s.homeTaxPrev == null && s.countries && s.countries[s.home]) { const cs = s.countries[s.home]; s.homeTaxPrev = { tax: cs.tax, incTax: cs.incTax || 0.20, vat: cs.vat || 0.05 }; }
  for (const a3 in s.countries) { const cs = s.countries[a3]; if (cs.incTax == null) cs.incTax = 0.20; if (cs.vat == null) cs.vat = 0.05; if (cs.taxRev == null) cs.taxRev = 0; }
  for (const a3 in s.co) {
    const c = s.co[a3];
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
function closePanel() { UI.panel = null; UI.stack = []; $('panel').classList.remove('open'); renderHUD(); }
function panelShell(title, sub, body) {
  const back = UI.stack.length ? `<button class="pback" data-a="panelBack">${IC.back}</button>` : '';
  return `<div class="panel-head"><div class="panel-title">${back}<div><h3>${title}</h3>${sub ? `<div class="muted small">${sub}</div>` : ''}</div></div><button class="xbtn" data-a="closePanel" aria-label="Close panel">${IC.close}</button></div><div class="panel-body">${body}</div>`;
}
function renderPanel() {
  if (!UI.panel || !S) { $('panel').innerHTML = ''; $('panel').classList.remove('open'); return; }
  const cur = UI.stack.length ? UI.stack[UI.stack.length - 1] : null;
  if (UI.panel === 'stock' && !cur) { UI.panel = 'markets'; UI.stack = []; }
  let html = '';
  if (UI.panel === 'stock' && cur) html = tradeView(cur.a3);
  else if (PANELS[UI.panel]) html = PANELS[UI.panel]();
  else html = '<div class="card in"><p class="muted">That screen is not ready yet.</p></div>';
  $('panel').innerHTML = html; $('panel').classList.add('open');
}

// ---------- HUD: slim top strip + always-visible goals, no bottom nav ----------
function renderHUD() {
  if (!S || UI.pick) return;
  const nw = netWorth(), lv = level();
  const co = homeCo();
  // HUD: company card top-left, a small Age button top-right, zoom +
  // locate on the right, and a bottom bar. The map fills the whole screen
  // behind all of it. No top-left pill, no Claim button, no Shop button
  // up here: daily money is added to cash automatically, and Shop lives
  // only in the More (…) menu. Messages and Settings are also only in
  // More now — the top-right envelope and gear were duplicates of those,
  // so they were removed and Age took their spot.
  $('hud').innerHTML = `<div class="company-card card">
    <div class="cc-top"><b>${esc(co.name)}</b><span class="muted small">Lv ${lv} · ${careerName()}</span></div>
    <div class="cc-money"><span>Net worth <b>${fmtMoney(nw, true)}</b></span><span>Cash <b>${fmtMoney(S.cash, true)}</b></span></div>
    <div class="cc-goals"><span>👥 <b>${fmtPop(nationPop())}</b> <em class="${upCls(popGrowth())}">${fmtPct(popGrowth())}</em></span><span>📈 vs Market <b class="${upCls(beatMarket())}">${fmtPct(beatMarket())}</b></span><span>🗓️ ${fmtDate(S.day)}</span></div>
  </div>
  <div class="rail-top">
    <button class="btn small" data-a="ageUp">Age +1</button>
  </div>
  <div class="rail-bottom">
    <button class="rail-btn" data-a="zoom" data-x="1.4" aria-label="Zoom in">＋</button>
    <button class="rail-btn" data-a="zoom" data-x="0.7" aria-label="Zoom out">－</button>
    <button class="rail-btn" data-a="locate" aria-label="Go home">⌖</button>
  </div>
  <div class="bottombar card">
    <button class="bb-btn" data-a="panel" data-x="markets"><span>📈</span>Markets</button>
    <button class="bb-btn" data-a="panel" data-x="portfolio"><span>💼</span>Portfolio</button>
    <button class="bb-btn" data-a="panel" data-x="company"><span>🏢</span>My Company</button>
    <button class="bb-btn" data-a="more"><span>•••</span>More</button>
  </div>`;
  if (UI.panel) $('panel').classList.add('open');
}
function renderCityHUD() {
  if (!CityView.isOpen()) { $('chud').innerHTML = ''; return; }
  const c = CityView.city, k = W.byA3[c.a3], co = S.co[c.a3];
  // A company's locations are all in its own capital city (co.city), by construction
  // in addLocation(), so the count here is exact, not a filter that happens to work.
  const myLocs = (controlled(c.a3) && co.city === c.id) ? co.locs.length : 0;
  $('chud').innerHTML = `<div class="citybar card"><div><b>${esc(c.name)}</b><span class="muted"> · ${esc(k.name)} · ${SECTORS[co.sector].icon} ${esc(co.name)} · ${myLocs} of your locations here</span></div>
    <div class="city-actions"><button data-a="cityFilter">Filter: ${CityView.filter}</button><button data-a="leaveCity">✕ Leave city</button></div></div>`;
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
function vIcon(vd) { return vd.category === 'plane' || vd.category === 'fighter' ? '✈️' : vd.category === 'yacht' ? '⛵' : '🚢'; }
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

// ---------- newspaper: flip through the world news ----------
let paperPage = 0;
function paperPages() { return Math.max(1, 1 + Math.ceil((S.news.length || 0) / 6)); }
function paperArticle(n) {
  return `<article class="part"><div class="pkicker">${esc(n.cat.toUpperCase())} · ${fmtDate(n.d)}</div><h3>${esc(n.text)}</h3>${n.a3 ? `<div class="psmall">${esc(cname(n.a3))}</div>` : ''}</article>`;
}
function paperHTML() {
  const total = paperPages(), page = Math.min(paperPage, total - 1); paperPage = page;
  let body = '';
  if (page === 0) {
    const top = S.news[0], second = S.news.slice(1, 3);
    body = `<div class="pfront">
      ${top ? `<div class="pheadline"><div class="pkicker">TOP STORY · ${fmtDate(top.d)}</div><h2>${esc(top.text)}</h2></div>` : '<p>No news yet.</p>'}
      <div class="pbox"><b>MARKETS</b><span>World Index ${S.idx.v.toFixed(0)}</span><span>Net worth ${fmtMoney(netWorth(), true)}</span><span>Cash ${fmtMoney(S.cash, true)}</span><span>Your nation ${fmtPop(nationPop())} people (${fmtPct(popGrowth())})</span></div>
      ${S.wars.length ? `<div class="pbox"><b>WARS NOW</b>${S.wars.map(w => `<span>${esc(cname(w.a))} vs ${esc(cname(w.b))} — front ${Math.round(w.front)}%</span>`).join('')}</div>` : ''}
      <div class="pcols">${second.map(paperArticle).join('')}</div>
    </div>`;
  } else {
    const list = S.news.slice((page - 1) * 6, page * 6);
    body = `<div class="pcols">${list.map(paperArticle).join('') || '<p>No more stories in this edition.</p>'}</div>`;
  }
  return `<div class="paper-top"><button class="wback paper-close" data-a="closePaper" aria-label="Close newspaper">${IC.close}</button>
    <div class="masthead"><h1>The Ticker Times</h1><div class="medition">WORLD EDITION · ${fmtDate(S.day)} · Day ${S.day}</div></div><div class="paper-spacer"></div></div>
  <div class="paper-body">${body}</div>
  <div class="paper-flip"><button class="btn" data-a="paperPrev" ${page === 0 ? 'disabled' : ''}>← PREVIOUS</button><span class="ppage">Page ${page + 1} of ${total}</span><button class="btn" data-a="paperNext" ${page >= total - 1 ? 'disabled' : ''}>NEXT →</button></div>
  <button class="btn wide paper-return" data-a="closePaper">RETURN TO MAP</button>`;
}
function openPaper() { closeModal(); closePanel(); if (watchKey) closeWatch(); paperPage = 0; $('paper').innerHTML = paperHTML(); $('paper').classList.add('open'); }
function closePaper() { $('paper').innerHTML = ''; $('paper').classList.remove('open'); }
function flipPaper(d) { paperPage = Math.max(0, Math.min(paperPages() - 1, paperPage + d)); $('paper').innerHTML = paperHTML(); }

// ---------- boot / onboarding ----------
async function boot() {
  W = buildWorld();
  MapView.init();
  MapView.on('city', onCityTap); MapView.on('country', onCountryTap); MapView.on('vehicle', openVehicleCard);
  MapView.on('empty', () => { if (!UI.pick) closePopup(); });
  MapView.on('frame', loop);
  CityView.init($('cityview'), onPin);
  document.addEventListener('click', onClick);
  // Swipe a newspaper page left or right to flip it, like turning a page.
  let paperX = null;
  $('paper').addEventListener('pointerdown', e => { paperX = e.clientX; });
  $('paper').addEventListener('pointerup', e => { if (paperX == null) return; const dx = e.clientX - paperX; paperX = null; if (Math.abs(dx) > 70 && $('paper').classList.contains('open')) flipPaper(dx < 0 ? 1 : -1); });
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  const saved = await loadSave();
  if (saved) { S = saved; enterGame(true); }
  else showTitle();
}
function showTitle() {
  $('hud').innerHTML = ''; MapView.setPick(false);
  openModal(`<div class="title-card">
    <div class="brand"><span class="logo big" style="background:#2f7cf6">${LOGO_SVG}</span><div><h1>Ticker Tycoon</h1><p>Build an empire across the real world. Grow your nation, grow your money, and beat the market.</p></div></div>
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
  const q = UI.q.trim().toLowerCase();
  const list = q ? W.countries.filter(c => c.playable && c.name.toLowerCase().includes(q)).slice(0, 6) : [];
  $('hud').innerHTML = `<div class="pick-top card"><b>Pick your country</b><span class="muted">Tap a country on the map, or search.</span>
    <input id="csearch" class="search" placeholder="Search countries" value="${esc(UI.q)}" autocomplete="off">
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
  UI.pick = null; MapView.setPick(false); closeModal();
  S.speed = 1; // Vehicle speed on the map, not game time. Game time does not advance on its own; it only moves on Age.
  const da = autoCreditDaily(), ca = autoCreditShopCash();
  if (da + ca > 0) setTimeout(() => toast(`+${fmtMoney(da + ca, true)} added to your cash`, 'good'), 600);
  renderHUD(); MapView.home();
  if (returning) welcomeBack(); else S.tutorial = 0;
  renderTutorial();
}
const TUT = [
  { t: () => S.mode === 'infinite' ? 'Welcome! There is no goal in Infinite mode. Play as long as you like and press Age whenever you want.' : `Welcome! No time limit. Grow ${esc(cname(S.home))}'s population, grow your money, and beat the stock market. Press Age to move a year forward.`, btn: 'Next' },
  { t: () => `Every dot is a real city. Tap ${esc(W.cities[W.byA3[S.home].capital].name)} to open it.`, done: () => UI.popup && UI.popup.type === 'city' },
  { t: () => 'Tap ENTER CITY to see the streets.', done: () => CityView.isOpen() },
  { t: () => 'Red FOR LEASE signs are empty storefronts. Lease one for your company and open your first location.', done: () => locCount() >= 1 },
  { t: () => 'Nice! Now open Markets and buy your first stock. Every stock is a company based in a real country.', done: () => S.stats.trades > 0 },
  { t: () => 'Time only moves when you press Age, one year at a time. Vehicles keep moving while you wait. No age limit — you can live 100 years, or 1000.', btn: 'Got it' },
];
function renderTutorial() {
  if (!S || S.tutorial == null || S.tutorial < 0 || S.tutorial >= TUT.length) { $('tut').innerHTML = ''; return; }
  const s = TUT[S.tutorial];
  $('tut').innerHTML = `<div class="tut card"><p>${s.t}</p><div class="row end"><button data-a="tutSkip">Skip</button>${s.btn ? `<button class="btn" data-a="tutNext">${s.btn}</button>` : '<span class="muted small">Do this to continue</span>'}</div></div>`;
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
  const city = W.byA3[a3].capital;
  if (city != null) onCityTap(city);
}
function closePopup() { UI.popup = null; MapView.select(null); $('popup').innerHTML = ''; }
function renderPopup() {
  if (!UI.popup) { $('popup').innerHTML = ''; return; }
  const p = UI.popup;
  if (p.type === 'city') {
    const c = W.cities[p.id], k = W.byA3[c.a3], co = S.co[c.a3], st = countryStatus(c.a3);
    const myLocs = controlled(c.a3) ? co.locs.filter(l => (l.city || co.city) === c.id).length : 0;
    const myProps = S.props.filter(x => x.city === c.id).length;
    $('popup').innerHTML = `<div class="popup card">
      <div class="row between"><div><b>${esc(c.name)}</b><div class="muted small">${k.flag} ${esc(k.name)} · ${esc(st.t)}</div></div><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
      <div class="stats3 box"><div><span>Population</span><b>${fmtPop(c.pop)}</b></div><div><span>Your locations</span><b>${myLocs}</b></div><div><span>Your buildings</span><b>${myProps}</b></div></div>
      <div class="kv"><span>${SECTORS[co.sector].icon} ${esc(co.name)}</span><b>${co.listed ? fmtMoney(co.price) + ' · ' + co.sym : 'Private'}</b></div>
      ${businessesInCity(c.id).map(({ c: bc, l }) => `<div class="kv"><span>🏢 ${esc(bc.name)} · ${SECTORS[bc.sector].loc.name} here · ★ ${l.sat.toFixed(1)}</span><b class="${upCls(l.profit)}">${fmtMoney(l.profit, true)}/week</b></div>`).join('')}
      <div class="row"><button class="btn3d orange flex" data-a="enterCity" data-x="${c.id}">ENTER CITY</button><button class="btn flex" data-a="stock" data-x="${c.a3}">VIEW STOCK</button></div>
    </div>`;
  } else if (p.type === 'pin') {
    const lot = p.lot, city = CityView.city, co = S.co[city.a3];
    if (p.pin.type === 'loc') {
      const l = p.pin.loc;
      $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>${SECTORS[co.sector].loc.name}</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
        <div class="stats3 box"><div><span>Profit / week</span><b class="${upCls(l.profit)}">${fmtMoney(l.profit, true)}</b></div><div><span>Customers</span><b>${l.cust}</b></div><div><span>Satisfaction</span><b>${l.sat.toFixed(1)}★</b></div></div>
        <p class="muted small">Staff ${l.staff} · Rent ${fmtMoney(l.rent)}/week · Traffic ${l.traffic}</p>
        <button class="btn" data-a="closeLoc" data-x="${co.a3}|${l.id}">CLOSE LOCATION</button></div>`;
    } else if (p.pin.type === 'lease') {
      $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>For lease</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
        <p class="muted small">Traffic ${lot.traffic} · Rent ${fmtMoney(lotRent(co, lot))}/week · Fit-out ${fmtMoney(buildCost(co, 1))}</p>
        <p class="muted small">Only companies you control can lease here. ${controlled(city.a3) ? '' : 'Buy a majority of ' + esc(co.name) + ' stock first, or use your home company in its own capital.'}</p>
        <div class="row"><button class="btn3d orange flex" data-a="lease" data-x="${lot.t}|1">LEASE · BASIC</button><button class="btn flex" data-a="lease" data-x="${lot.t}|2">LEASE · PREMIUM</button></div></div>`;
    } else if (p.pin.type === 'sale') {
      $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>Building for sale</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
        <div class="stats3 box"><div><span>Price</span><b>${fmtMoney(lot.price, true)}</b></div><div><span>Units</span><b>${lot.units}</b></div><div><span>Rent / unit</span><b>${fmtMoney(lot.mrent)}</b></div></div>
        <button class="btn3d orange wide" data-a="buyBld" data-x="${lot.t}">BUY BUILDING</button></div>`;
    } else if (p.pin.type === 'prop') {
      const pr = S.props.find(x => x.city === city.id && x.t === lot.t);
      $('popup').innerHTML = `<div class="popup card"><div class="row between"><b>Your building</b><button class="xbtn" data-a="closePopup">${IC.close}</button></div>
        <div class="stats3 box"><div><span>Value</span><b>${fmtMoney(pr.value, true)}</b></div><div><span>Income / week</span><b>${fmtMoney(pr.income, true)}</b></div><div><span>Condition</span><b>${Math.round(pr.cond * 100)}%</b></div></div>
        <p class="muted small">${pr.units} units · Occupancy ${Math.round(pr.occ * 100)}% · Rent level ${pr.rentLv.toFixed(1)}x</p>
        <div class="row"><button class="btn flex" data-a="renovate" data-x="${pr.id}">RENOVATE ${fmtMoney(renoCost(pr), true)}</button><button class="btn flex" data-a="sellBld" data-x="${pr.id}">SELL</button></div></div>`;
    }
  }
}
function onPin(pin) {
  UI.popup = { type: 'pin', pin, lot: pin.lot }; renderPopup();
}
function enterCity(id) {
  closePopup(); CityView.open(id); document.body.classList.add('in-city'); renderCityHUD(); tutCheck();
}
function leaveCity() {
  CityView.close(); document.body.classList.remove('in-city'); $('chud').innerHTML = ''; renderHUD();
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
      UI.lastDraw = now; renderHUD(); if (UI.popup) renderPopup(); if (CityView.isOpen()) renderCityHUD();
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
  else if (UI.cat !== 'All' && UI.cat !== 'Indices') list = list.filter(c => c.sector === UI.cat);
  if (UI.starOnly) list = list.filter(c => S.watch.includes(c.a3));
  if (q) list = list.filter(c => c.name.toLowerCase().includes(q) || c.sym.toLowerCase().includes(q) || cname(c.a3).toLowerCase().includes(q));
  list.sort((a, b) => companyValue(b) - companyValue(a));
  return list;
}
PANELS.markets = () => {
  const cats = ['All', 'Watchlist', 'Owned', ...SECTOR_LIST, 'IPOs', 'Indices', 'Oil'];
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
      const held = S.holdings[c.a3], ch = chgVs(c), starred = S.watch.includes(c.a3);
      return `<button class="srow" data-a="stock" data-x="${c.a3}"><span class="avatar" style="background:${c.color}">${esc(c.name[0])}</span><span class="sname"><b>${c.sym}</b><small>${esc(c.name)} · ${esc(cname(c.a3))}</small></span><span class="sprice"><b>${c.listed ? fmtMoney(c.price) : 'Private'}</b><small class="${upCls(ch)}">${fmtPct(ch)}</small></span><span class="star-btn ${starred ? 'on' : ''}" data-a="star" data-x="${c.a3}">${starred ? '★' : '☆'}</span></button>`;
    }).join('') || '<div class="card in empty">Nothing here yet. Try another category, or star a stock to build your Watchlist.</div>'}</div>
    ${UI.cat === 'IPOs' ? '<p class="muted small">IPOs here means private companies you control that can go public. Your home company needs to be worth $25M to list.</p>' : ''}`);
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
      const c = S.co[a3];
      return `<button class="srow" data-a="stock" data-x="${a3}"><span class="avatar" style="background:${c.color}">${esc(c.name[0])}</span><span class="sname"><b>${c.sym}</b><small>${esc(c.name)}</small></span><span class="sprice"><b>${h.qty.toLocaleString()} shares</b><small>${fmtMoney(h.qty * c.price, true)}</small></span></button>`;
    }).join('') || '<p class="muted small">No open positions. Buy a stock in Markets.</p>'}</div>
    <h4>This week</h4><div class="kv"><span>Profit</span><b class="${upCls(S.week.profit)}">${fmtMoney(S.week.profit, true)}</b></div><div class="kv"><span>Companies</span><b>${fmtMoney(S.week.companies || 0, true)}</b></div><div class="kv"><span>Rent</span><b>${fmtMoney(S.week.rent || 0, true)}</b></div>
    <h4>Buildings</h4><div class="list">${S.props.map(p => {
      const city = W.cities[p.city];
      return `<button class="srow" data-a="propSheet" data-x="${p.id}"><span class="avatar">🏠</span><span class="sname"><b>${esc(city.name)}</b><small>${p.units} units · ${Math.round(p.occ * 100)}% occupied</small></span><span class="sprice"><b>${fmtMoney(p.value, true)}</b><small>${fmtMoney(p.income, true)}/week</small></span></button>`;
    }).join('') || '<p class="muted small">No buildings yet. Buy one from a city FOR SALE pin.</p>'}</div>`);
};
PANELS.company = () => {
  const mineList = mine();
  if (!mineList.length) return panelShell('My Company', '', '<div class="card in"><p class="muted">You control no companies yet. Your home company is yours once you open a location, or buy 50% of a listed company in Markets to take control.</p></div>');
  const body = mineList.map(c => {
    const F = SECTORS[c.sector].fleet, wk = c.week || { profit: 0, locs: 0, fleet: 0, online: 0, ads: 0, tax: 0 };
    return `<div class="card in"><h4>${SECTORS[c.sector].icon} ${esc(c.name)} <small class="muted">${c.sym} · ${esc(cname(c.a3))} · ★ ${c.rating.toFixed(1)}</small></h4>
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
      <div class="row"><button class="btn" data-a="borrow">BORROW</button><button class="btn" data-a="repay">REPAY ALL</button>${!c.listed ? `<button class="btn" data-a="ipo" data-x="${c.a3}">IPO (needs $25M value)</button>` : '<span class="muted small">Listed</span>'}</div>
    </div>`;
  }).join('');
  return panelShell('My Company', `${mineList.length} companies under your control`, body);
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
    <button class="btn wide" data-a="stock" data-x="${c.a3}">VIEW ${c.sym} STOCK</button>${admin}</div>`;
}
PANELS.web = () => {
  const w = UI.web;
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
PANELS.nation = () => {
  const cs = country(S.home), k = W.byA3[S.home];
  const nbs = k.nb.filter(n => W.byA3[n] && W.byA3[n].playable).map(n => {
    const rel = getRel(S.home, n), err = canAttack(n);
    return `<div class="kv"><span>${W.byA3[n].flag} ${esc(cname(n))} · Relations ${rel}</span><span><button class="btn small" data-a="diplomacy" data-x="${n}">${fmtMoney(diplomacyCost(n), true)}</button> ${err ? `<span class="muted small">${esc(err)}</span>` : `<button class="btn small" data-a="war" data-x="${n}">DECLARE WAR (${Math.round(warOdds(S.home, n) * 100)}%)</button>`}</span></div>`;
  }).join('') || '<p class="muted small">No land neighbours. You need Destroyers or Stealth fighters to strike overseas.</p>';
  const occ = Object.keys(S.countries).filter(a => S.countries[a].occ === S.home);
  return panelShell('Nation', `${k.flag} ${esc(k.name)} · ${esc(countryStatus(S.home).t)}`,
    `<div class="stats3 box"><div><span>Population</span><b>${fmtPop(nationPop())}</b></div><div><span>Growth</span><b class="${upCls(popGrowth())}">${fmtPct(popGrowth())}</b></div><div><span>Military rank</span><b>#${milRank(S.home)} of 195</b></div></div>
    <div class="kv"><span>GDP</span><b>${fmtMoney(cs.gdp * 1e6, true)}</b></div><div class="kv"><span>Stability</span><b>${Math.round(cs.stab)} / 100</b></div><div class="kv"><span>Corporate-tax revenue</span><b>${fmtMoney(cs.taxRev || 0, true)} total</b></div><div class="kv"><span>Occupied land</span><b>${occ.length ? occ.map(a => cname(a)).join(', ') : 'None'}</b></div>
    <h4>Tax rates — that's the game</h4><p class="muted small">Change these for your home nation. They take effect now, and how businesses, households and the government reacted is reported at year end. High tax raises revenue but cuts profits and spending; low tax does the reverse.</p>
    <div class="kv"><span>Corporate tax</span><span><input type="range" min="5" max="50" step="1" value="${Math.round(cs.tax * 100)}" data-in="taxCorp" data-x=""> ${Math.round(cs.tax * 100)}%</span></div>
    <div class="kv"><span>Income tax</span><span><input type="range" min="0" max="40" step="1" value="${Math.round((cs.incTax || 0.20) * 100)}" data-in="taxInc" data-x=""> ${Math.round((cs.incTax || 0.20) * 100)}%</span></div>
    <div class="kv"><span>VAT (sales tax)</span><span><input type="range" min="0" max="20" step="1" value="${Math.round((cs.vat || 0.05) * 100)}" data-in="taxVat" data-x=""> ${Math.round((cs.vat || 0.05) * 100)}%</span></div>
    ${S.yearReport ? `<h4>Last year in review (${S.yearReport.year})</h4>${S.yearReport.entries.map(e => `<div class="kv"><span>${esc(e.name)} · ${e.old.toFixed(1)}★ → ${e.new.toFixed(1)}★</span><b>${esc(e.reasons.join(' '))}</b></div>`).join('')}<p class="muted small">${esc(S.yearReport.taxLines.join(' '))}</p>` : ''}
    ${S.wars.length ? `<h4>Wars</h4>${S.wars.map(w => `<div class="kv"><span>${esc(cname(w.a))} vs ${esc(cname(w.b))} · Front ${Math.round(w.front)}%</span><button class="btn" data-a="peace">SUE FOR PEACE · ${fmtMoney(peaceCost(), true)}</button></div>`).join('')}` : ''}
    <h4>Projects</h4>${PROJECTS.map(d => {
      const run = cs.proj.find(p => p.id === d.id && p.until > S.day);
      return `<div class="kv"><span>${d.icon} ${d.name} · ${d.desc}</span>${run ? '<span class="tagp green">ACTIVE</span>' : `<button class="btn" data-a="project" data-x="${d.id}">${fmtMoney(projectCost(d), true)}</button>`}</div>`;
    }).join('')}
    <h4>Neighbours</h4>${nbs}
    <button class="btn wide" data-a="panel" data-x="military">OPEN MILITARY</button>`);
};
PANELS.military = () => {
  const cs = country(S.home);
  return panelShell('Military', `Power ${Math.round(milPower(S.home)).toLocaleString()} · Rank #${milRank(S.home)}`,
    Object.entries(MILITARY).map(([b, d]) => {
      const lv = cs.milLv[b], cost = milCost(b);
      return `<div class="card in"><h4>${d.icon} ${d.name}</h4><p class="muted small">Now: ${d.levels[lv]}</p>${cost != null ? `<button class="btn" data-a="milUp" data-x="${b}">Upgrade to ${d.levels[lv + 1]} · ${fmtMoney(cost, true)}</button>` : '<span class="tagp green">TOP LEVEL</span>'}</div>`;
    }).join('') +
    `<h4>Wars</h4>${S.wars.map(w => `<div class="kv"><span>${esc(cname(w.a))} vs ${esc(cname(w.b))}</span><b>Front ${Math.round(w.front)}%</b></div>`).join('') || '<p class="muted small">No wars right now.</p>'}`);
};
PANELS.estate = () => {
  return panelShell('My Estate', `${S.props.length} buildings · Value ${fmtMoney(propValue(), true)}`,
    `<div class="list">${S.props.map(p => {
      const city = W.cities[p.city];
      return `<button class="srow" data-a="propSheet" data-x="${p.id}"><span class="avatar">🏠</span><span class="sname"><b>${esc(city.name)}, ${esc(cname(city.a3))}</b><small>${p.units} units · ${Math.round(p.occ * 100)}% occupied · Condition ${Math.round(p.cond * 100)}%</small></span><span class="sprice"><b>${fmtMoney(p.value, true)}</b><small>${fmtMoney(p.income, true)}/week</small></span></button>`;
    }).join('') || '<p class="muted small">No buildings yet. Buy one from a city FOR SALE pin.</p>'}</div>`);
};
PANELS.goals = () => {
  const stage = CAREER[S.career];
  return panelShell('Daily goals', `Career: ${careerName()} · Streak ${S.daily.streak} days`,
    `<div class="stats3 box"><div><span>Level</span><b>Lv ${level()}</b></div><div><span>XP</span><b>${S.xp}</b></div><div><span>Companies controlled</span><b>${mine().length}</b></div></div>
    ${stage ? `<h4>${stage.name}</h4>${stage.goals.map((g, i) => `<div class="goal ${S.goalsDone.includes(S.career + ':' + i) ? 'done' : ''}"><span>${S.goalsDone.includes(S.career + ':' + i) ? '✓' : '○'}</span>${g.t}</div>`).join('')}` : '<p class="muted small">Legend status reached 👑</p>'}
    <h4>Daily reward</h4><div class="kv"><span>Today</span><b>${fmtMoney(dailyRewardInfo().amount, true)}</b></div><p class="muted small">Added to your cash automatically each day, no claiming needed.</p>`);
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
  const q = UI.q.trim().toLowerCase();
  const cos = Object.values(S.co).filter(c => !q || c.name.toLowerCase().includes(q) || c.sym.toLowerCase().includes(q)).slice(0, 20);
  const cts = W.countries.filter(c => c.playable && (!q || c.name.toLowerCase().includes(q))).slice(0, 20);
  return panelShell('Search', 'Companies and countries',
    `<input id="msearch" class="search" placeholder="Search anything" value="${esc(UI.q)}" autocomplete="off">
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
    <div class="kv"><span>Save</span><b>IndexedDB, full history, no size cap</b></div>
    <button class="btn" data-a="exportSave">COPY SAVE TO CLIPBOARD</button>
    <button class="btn" data-a="restart">RESTART GAME</button>`);
};
PANELS.help = () => {
  return panelShell('Help', '',
    `<div class="card in"><h4>How to play</h4><p>Pick a country, name your company, lease a location in one of its cities, buy stocks, and grow. Time only moves when you press Age, one year at a time, vehicles keep moving while you wait, no age limit, and Vs Market is an equal-weighted algo that buys the same amount of every stock. Wars and disasters push prices down. Good events push them up. Your goals are always at the top: population, net worth, and beating the market.</p>
    <p class="muted small">Take control of a company by buying 50% of its stock, or all of it with a takeover offer. Invade a neighbour to take its company and its people. Save is automatic.</p></div>`);
};
function moreSheet() {
  const items = [
    ['inbox', '✉️', 'Messages'], ['news', '📰', 'News'], ['markets', '📈', 'Markets'],
    ['portfolio', '💼', 'Portfolio'], ['web', '🌐', 'Web'], ['nation', '🏳️', 'Nation'],
    ['military', '🪖', 'Military'], ['company', '🏢', 'My Company'], ['estate', '🏠', 'My Estate'],
    ['goals', '🎯', 'Daily goals'], ['shop', '🛍️', 'Shop'], ['search', '🔍', 'Search'],
    ['leaderboard', '🏆', 'Leaderboard'], ['settings', '⚙️', 'Settings'], ['help', '❓', 'Help'],
  ];
  openModal(`<h2>More</h2><div class="more-grid">${items.map(([x, ic, t]) => `<button class="more-item" data-a="${x === 'news' ? 'paper' : 'panel'}" data-x="${x}"><span class="mi">${ic}</span><span>${t}</span></button>`).join('')}</div>`, 'sheet');
}

// ---------- actions ----------
const A = {
  newGame: async () => {
    await idbDel('main'); try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    S = null; closePanel(); closePopup(); if (CityView.isOpen()) leaveCity();
    document.body.classList.remove('in-city'); $('chud').innerHTML = ''; $('tut').innerHTML = ''; chooseMode();
  },
  pickMode: x => { UI.mode = x; UI.q = ''; startPick(); },
  pickCountry: x => { UI.pick.a3 = x; MapView.setPick(true, x); MapView.flyToCountry(x); renderPick(); },
  confirmCountry: () => nameCompany(),
  swatch: (x, el) => { UI.color = x; document.querySelectorAll('.sw').forEach(s => s.classList.toggle('on', s === el)); },
  beginGame: () => {
    const name = ($('cname').value || '').trim() || 'Tycoon Co.';
    S = newGame({ mode: UI.mode, home: UI.pick.a3, name, color: UI.color }); save(); enterGame(false);
  },
  tutNext: () => { S.tutorial++; renderTutorial(); save(); },
  tutSkip: () => { S.tutorial = -1; renderTutorial(); save(); },
  panel: x => { if (UI.panel === x && !UI.stack.length) return closePanel(); openPanel(x); },
  closePanel: () => closePanel(),
  panelBack: () => { UI.stack.pop(); renderPanel(); },
  closePopup: () => closePopup(),
  vehicleCard: x => openVehicleCard(x),
  watchVehicle: x => openWatch(x),
  routeVehicle: x => openRouteSheet(x),
  infoVehicle: x => openVehicleInfo(x),
  followVehicle: x => { const vd = MapView.vehicle(x); closeModal(); if (vd) { MapView.flyToXY(vd.x, vd.y, 3); toast(`Following ${vTripId(vd)}`); } },
  vehicleCompany: x => openPanel('stock', { a3: x }),
  closeWatch: () => closeWatch(),
  paper: () => openPaper(),
  closePaper: () => closePaper(),
  paperPrev: () => flipPaper(-1),
  paperNext: () => flipPaper(1),
  scrim: (x, el, e) => { if (e.target === el && UI.modal === 'sheet') closeModal(); },
  closeModal: () => { closeModal(); if (S && S.over) gameOver(); },
  speed: x => { S.speed = +x; renderHUD(); },
  skipMenu: () => skipMenu(),
  skip: x => doSkip(+x),
  zoom: x => MapView.zoom(+x),
  locate: () => MapView.home(),
  more: () => moreSheet(),
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
    UI.panel = 'stock'; UI.stack = [{ a3: x }]; renderPanel(); renderHUD();
  },
  flyCity: x => { closePanel(); MapView.flyToCity(+x); onCityTap(+x); },
  flyCountry: x => { closePanel(); MapView.flyToCountry(x); },
  qty: x => { const q = $('qty'); if (q) q.value = Math.max(1, (+q.value || 0) + +x); },
  qtyMax: x => {
    const c = S.co[x], q = $('qty'); if (!c || !q) return;
    q.value = Math.max(1, Math.floor(S.cash / c.price));
  },
  doTrade: x => {
    const [a3, side] = x.split('|'); const n = +($('qty') ? $('qty').value : 0);
    const err = trade(a3, side, n);
    if (err) return toast(err, 'bad');
    closeModal(); toast(`${side[0].toUpperCase() + side.slice(1)} ${n.toLocaleString()} ${S.co[a3].sym}`, 'good'); tutCheck(); save(); refreshAll();
  },
  research: x => act(() => research(x), 'Research done'),
  takeover: x => {
    const [a3, p] = x.split('|');
    act(() => takeover(a3, +p), 'Takeover complete! You now own it outright.');
  },
  webCo: x => { UI.web = { view: 'site', q: '', a3: x }; openPanel('web'); },
  webSite: x => { UI.web = { view: 'site', q: UI.web.q, a3: x }; renderPanel(); },
  webView: x => {
    if (x === 'mine') UI.web = { view: 'site', q: '', a3: S.home };
    else UI.web = { view: x, q: UI.web.q, a3: null };
    renderPanel();
  },
  webBack: () => { UI.web = { view: 'search', q: UI.web.q, a3: null }; renderPanel(); },
  webHome: () => { UI.web = { view: 'search', q: '', a3: null }; renderPanel(); },
  webTier: x => act(() => buyWebTier(x), 'Website upgraded'),
  webAd: x => { const [a3, id] = x.split('|'); act(() => toggleAd(a3, id)); },
  webAddon: x => { const [a3, id] = x.split('|'); act(() => buyAddon(a3, id), 'Add-on bought'); },
  acceptOffer: x => act(() => acceptOffer(x), 'Offer accepted'),
  project: x => act(() => fundProject(x), 'Project funded'),
  diplomacy: x => act(() => diplomacy(x), 'Relations improved'),
  war: x => act(() => declareWar(x), 'War declared'),
  peace: () => act(() => suePeace(), 'Peace signed'),
  milUp: x => act(() => upgradeMilitary(x), 'Military upgraded'),
  fleetUp: x => act(() => upgradeFleet(x), 'Fleet upgraded'),
  fleetSell: x => act(() => sellFleet(x), 'Fleet level sold'),
  borrow: () => act(() => borrow(Math.min(maxLoan(), Math.max(50000, maxLoan() / 4))), 'Loan taken'),
  repay: () => act(() => repay(Math.min(S.loan, Math.max(0, S.cash))), 'Loan repaid'),
  ipo: x => act(() => goPublic(x, 0.4), 'IPO complete! 40% sold to the public.'),
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
  ageUp: () => { stepYear(); save(); renderHUD(); if (S.over) { gameOver(); return; } if (UI.panel) renderPanel(); if (CityView.isOpen()) renderCityHUD(); },
  claimDaily: () => {
    const r = dailyRewardInfo(); const e = claimDaily();
    if (e) return toast(e, 'bad');
    toast(`+${fmtMoney(r.amount, true)} daily reward`, 'good'); save(); refreshAll();
  },
  toggleMotion: () => { S.settings.motion = !S.settings.motion; renderPanel(); },
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
  if (t.id === 'csearch') { UI.q = t.value; const pos = t.selectionStart; renderPick(); const n = $('csearch'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } return; }
  if (t.id === 'msearch') {
    UI.q = t.value;
    if (UI.panel === 'markets') { const l = $('mlist'); if (l) l.innerHTML = marketsListHTML(); }
    else if (UI.panel === 'search') { const pos = t.selectionStart; renderPanel(); const n = $('msearch'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
    return;
  }
  if (t.id === 'wsearch') { UI.web.q = t.value; const pos = t.selectionStart; renderPanel(); const n = $('wsearch'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } return; }
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
    const ch = chgVs(c), starred = S.watch.includes(c.a3);
    return `<button class="srow" data-a="stock" data-x="${c.a3}"><span class="avatar" style="background:${c.color}">${esc(c.name[0])}</span><span class="sname"><b>${c.sym}</b><small>${esc(c.name)} · ${esc(cname(c.a3))}</small></span><span class="sprice"><b>${c.listed ? fmtMoney(c.price) : 'Private'}</b><small class="${upCls(ch)}">${fmtPct(ch)}</small></span><span class="star-btn ${starred ? 'on' : ''}" data-a="star" data-x="${c.a3}">${starred ? '★' : '☆'}</span></button>`;
  }).join('') || '<div class="card in empty">Nothing here yet.</div>';
}
function onChange(e) {
  // <select> elements are not used; range inputs are handled in onInput.
}
boot();
