// World map: pan/zoom canvas with countries, one capital dot per country,
// and one vehicle per transport company (it grows as the company upgrades),
// plus military jets and warships.
'use strict';

const MapView = (() => {
  const wrap = document.getElementById('map');
  const base = document.createElement('canvas'), top = document.createElement('canvas');
  wrap.append(base, top);
  const bctx = base.getContext('2d'), tctx = top.getContext('2d');
  const hit = document.createElement('canvas').getContext('2d');
  let dpr = 1, vw = 0, vh = 0;
  const v = { s: 1, x: 0, y: 0 };
  let dirty = true, anim = null, sel = null, pickMode = false, hoverCountry = null;
  const handlers = {};
  const COL = { sea: '#14223f', sea2: '#0f1b34', land: '#384560', home: '#45567c', border: 'rgba(160,178,214,0.22)', grid: 'rgba(120,145,190,0.07)' };
  const S_ = () => (typeof S !== 'undefined' && S ? S : null);

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1); vw = wrap.clientWidth; vh = wrap.clientHeight;
    [base, top].forEach(c => { c.width = vw * dpr; c.height = vh * dpr; c.style.width = vw + 'px'; c.style.height = vh + 'px'; });
    if (v.s < Math.max(vw / MAP_W, vh / MAP_H)) fit();
    clampView(); dirty = true;
  }
  function fit() { v.s = Math.max(vw / MAP_W, vh / MAP_H); v.x = (vw - MAP_W * v.s) / 2; v.y = (vh - MAP_H * v.s) / 2; }
  function clampView() {
    v.s = Math.max(Math.max(vw / MAP_W, vh / MAP_H) * 0.98, Math.min(60, v.s));
    v.x = Math.min(0, Math.max(vw - MAP_W * v.s, v.x)); v.y = Math.min(0, Math.max(vh - MAP_H * v.s, v.y));
  }
  const toScreen = (x, y) => [x * v.s + v.x, y * v.s + v.y];
  const toMap = (sx, sy) => [(sx - v.x) / v.s, (sy - v.y) / v.s];

  function drawBase() {
    const c = bctx, st = S_(); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = c.createLinearGradient(0, 0, 0, vh); g.addColorStop(0, COL.sea); g.addColorStop(1, COL.sea2);
    c.fillStyle = g; c.fillRect(0, 0, vw, vh);
    c.setTransform(dpr * v.s, 0, 0, dpr * v.s, dpr * v.x, dpr * v.y);
    c.strokeStyle = COL.grid; c.lineWidth = 1 / v.s; c.beginPath();
    for (let lon = -180; lon <= 180; lon += 15) { c.moveTo(projX(lon), 0); c.lineTo(projX(lon), MAP_H); }
    for (let lat = -45; lat <= 75; lat += 15) { c.moveTo(0, projY(lat)); c.lineTo(MAP_W, projY(lat)); }
    c.stroke();
    const [x0, y0] = toMap(0, 0), [x1, y1] = toMap(vw, vh);
    const vis = k => k.hasShape && !(k.box[2] < x0 || k.box[0] > x1 || k.box[3] < y0 || k.box[1] > y1);
    W.countries.forEach(k => {
      if (!vis(k)) return;
      let fill = k.playable ? COL.land : '#2f3a52';
      if (st && k.a3 === st.home) fill = COL.home;
      if (pickMode && k.playable) fill = k.a3 === hoverCountry ? '#2f7cf6' : '#41506f';
      c.fillStyle = fill; c.fill(k.path);
      const cs = st && st.countries[k.a3];
      if (cs && !pickMode) {
        if (cs.occ === st.home) { c.fillStyle = 'rgba(69,86,124,0.9)'; c.fill(k.path); }
        else if (cs.war || cs.occ) { c.fillStyle = cs.occ ? 'rgba(229,72,77,0.28)' : 'rgba(229,72,77,0.18)'; c.fill(k.path); }
        else if (cs.boom > st.day) { c.fillStyle = 'rgba(18,161,80,0.14)'; c.fill(k.path); }
      }
    });
    c.strokeStyle = COL.border; c.lineWidth = 0.8 / v.s; c.lineJoin = 'round';
    W.countries.forEach(k => { if (vis(k)) c.stroke(k.path); });
    if (st && !pickMode) { c.strokeStyle = 'rgba(120,170,255,0.55)'; c.lineWidth = 1.4 / v.s; const h = W.byA3[st.home]; if (h.hasShape) c.stroke(h.path); }
    if (pickMode && hoverCountry && W.byA3[hoverCountry].hasShape) { c.strokeStyle = '#fff'; c.lineWidth = 2 / v.s; c.stroke(W.byA3[hoverCountry].path); }
  }

  // ---------- vehicles ----------
  let units = [], builtFor = null;
  const seaCache = {};
  let routeQueue = [];
  const destCapitals = () => W.playable.slice().sort((a, b) => b.gdp0 - a.gdp0).slice(0, 70).map(k => W.cities[k.capital]);
  let portCells = null, portByBasin = null;
  const basinOf = cell => (cell != null && W.basin) ? W.basin[cell] : -1;
  function buildUnits() {
    const st = S_(); if (!st) { units = []; return; }
    builtFor = st.seed; units = []; routeQueue = [];
    const dests = destCapitals();
    // All coastal capitals are voyage destinations, not just large economies:
    // enclosed basins have only a handful of ports, and cutting small ones
    // out left some basin boats with almost nowhere to sail to.
    portCells = W.playable.filter(k => k.coastal).map(k => { const c = W.cities[k.capital]; return nearestWater(W, c.lon, c.lat); }).filter(x => x != null);
    // Group ports by water basin so a boat only ever rolls destinations it
    // can actually sail to. Basin -1 is the fallback (no basin data): all ports.
    portByBasin = new Map();
    for (const cell of portCells) { const b = basinOf(cell); if (!portByBasin.has(b)) portByBasin.set(b, []); portByBasin.get(b).push(cell); }
    for (const a3 in st.co) {
      const c = st.co[a3], F = SECTORS[c.sector].fleet; if (!F) continue;
      const home = W.cities[c.city], r = mulberry(hashStr(a3 + st.seed));
      if (F.kind === 'plane') units.push({ type: 'plane', a3, from: home, to: dests[Math.floor(r() * dests.length)], t: r(), dir: 1, r, dests });
      else { const start = nearestWater(W, home.lon, home.lat); units.push({ type: F.kind, a3, start, basin: basinOf(start), dest: null, pts: null, t: 0, dir: 1, r, shortRetries: 0 }); }
    }
    // One personal yacht for the player's home nation. It sails port to
    // port like a cargo boat but carries people, not freight, and has no
    // effect on the economy — it is just there to watch and follow.
    if (st.home) {
      const hc = W.cities[st.co[st.home].city], start = nearestWater(W, hc.lon, hc.lat);
      units.push({ type: 'yacht', a3: st.home, personal: true, start, basin: basinOf(start), dest: null, pts: null, t: 0, dir: 1, r: mulberry(hashStr('yacht' + st.seed)), shortRetries: 0 });
    }
  }
  function pathLen(p) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
  // Pick a destination in the boat's own basin. Prefer a destination whose
  // already-cached route is a real voyage (>=150 map units); otherwise pick
  // an uncached destination so pumpRoutes can compute it. Never the start cell.
  function pickDest(u, exclude) {
    const list = (portByBasin && portByBasin.get(u.basin)) || portCells || [];
    if (!list.length) return null;
    const tries = [];
    for (let i = 0; i < 5 && tries.length < 5; i++) { const c = list[Math.floor(u.r() * list.length)]; if (c !== u.start && !(exclude || []).includes(c) && !tries.includes(c)) tries.push(c); }
    for (const c of tries) { const p = seaCache[u.start + '>' + c]; if (p && p.length >= 2 && pathLen(p) >= 150) return c; }
    // Otherwise prefer the farthest try: in a tiny basin every route is
    // short, so a random pick keeps hopping to a neighbouring port and the
    // boat never leaves a small patch of sea. Farthest-first makes it cross
    // its whole basin instead.
    const farthest = arr => { let best = null, bd = -1; const sx = u.start % W.ww, sy = (u.start / W.ww) | 0; for (const c of arr) { const d = Math.hypot(c % W.ww - sx, ((c / W.ww) | 0) - sy); if (d > bd) { bd = d; best = c; } } return best; };
    const uncached = tries.filter(c => !(u.start + '>' + c in seaCache));
    return farthest(uncached.length ? uncached : tries);
  }
  function nextSea(u, to) {
    if (u.start == null) return;
    // When called from pumpRoutes, `to` is the destination the queued path
    // was computed for, so the computed path is actually used (the a82bdac
    // fix). Destinations are always in the boat's own basin (pickDest).
    if (to == null) to = pickDest(u);
    if (to == null) return;
    const key = u.start + '>' + to;
    if (!(key in seaCache)) { routeQueue.push([u, key, to]); return; }
    const p = seaCache[key]; if (!p || p.length < 2) { u.pts = null; u.waiting = false; return; }
    const len = pathLen(p);
    // Prefer real voyages over tiny hops: if this route is under 150 map
    // units, try up to 3 other basin destinations before settling for it.
    // Enclosed basins (where every route is short) still get a route after
    // the retries, instead of sitting routeless forever.
    if (len < 150 && (u.shortRetries || 0) < 3) {
      // Try a different basin destination, keeping `waiting` set so step()
      // does not queue a second, competing route while this one is pending.
      u.shortRetries = (u.shortRetries || 0) + 1;
      const alt = pickDest(u, [to]);
      if (alt != null) { nextSea(u, alt); return; }
      // No alternative in this basin: settle for the short route below.
    }
    u.pts = p; u.dest = to; u.waiting = false; u.shortRetries = 0;
    u.len = len; u.t = 0; u.dir = 1;
  }
  function pumpRoutes() { // compute at most two sea paths per frame
    for (let i = 0; i < 2 && routeQueue.length; i++) { const [u, key, to] = routeQueue.shift(); if (!(key in seaCache)) seaCache[key] = seaPath(W, u.start, to); nextSea(u, to); }
  }
  function bez(a, b, t) {
    const d = Math.hypot(b.x - a.x, b.y - a.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2 - d * 0.22, u = 1 - t;
    return [u * u * a.x + 2 * u * t * cx + t * t * b.x, u * u * a.y + 2 * u * t * cy + t * t * b.y, Math.atan2(2 * u * (cy - a.y) + 2 * t * (b.y - cy), 2 * u * (cx - a.x) + 2 * t * (b.x - cx))];
  }
  function along(p, len, t) {
    let target = t * len;
    for (let i = 1; i < p.length; i++) { const seg = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (target <= seg || i === p.length - 1) { const f = seg ? Math.min(1, target / seg) : 0; return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * f, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * f, Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0])]; } target -= seg; }
    return [p[0][0], p[0][1], 0];
  }
  function step(dt) {
    const st = S_(); if (!st) return;
    if (builtFor !== st.seed) buildUnits();
    pumpRoutes();
    units.forEach(u => {
      if (u.type === 'plane') {
        const d = Math.max(30, Math.hypot(u.to.x - u.from.x, u.to.y - u.from.y));
        u.t += dt * 24 / d;
        // On arrival the plane is AT u.to, so the next leg must start there.
        // Previously the return leg kept the old u.from, so the next outbound
        // leg teleported from the home city back to the previous destination.
        if (u.t >= 1) { const arrived = u.to; u.from = arrived; u.to = u.dir > 0 ? W.cities[st.co[u.a3].city] : u.dests[Math.floor(u.r() * u.dests.length)]; u.dir = -u.dir; u.t = 0; }
      } else {
        if (!u.pts) { if (!u.waiting) { u.waiting = true; nextSea(u); } else if (routeQueue.every(q => q[0] !== u)) { u.waiting = false; } return; }
        // Voyage port-to-port: sail the route once, then start from the
        // destination cell and roll a NEW basin destination. The old code
        // ping-ponged the same path back and forth (and only half the time
        // even rolled a new route), which is exactly the "sitting there
        // flashing back and forth" the player sees.
        // Visual speed only — boats do not affect the economy. 3 map units/s
        // was 2.6 screen px/s at phone world zoom, slower than a ship's own
        // length in 10s; 5 keeps the same calm pace but makes movement, and
        // especially short enclosed-basin voyages, actually visible.
        u.t += dt * 5 / Math.max(20, u.len);
        if (u.t >= 1) {
          if (u.dest != null) { u.start = u.dest; u.basin = basinOf(u.start); }
          u.dest = null; u.pts = null; u.waiting = false; u.t = 0; u.dir = 1;
        }
      }
    });
  }

  // ---------- sprites (original vector art; size and shape change by level) ----------
  function shadow(c, len, wid) { c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.ellipse(2, 4, len, wid, 0, 0, 7); c.fill(); }
  function plane(c, lv, color) {
    const L = [0, 7, 8.5, 10, 11.5, 13.5, 15.5][lv], span = [0, 9, 8, 10, 11.5, 14, 17][lv], body = lv >= 5 ? 1.9 : 1.35;
    shadow(c, L * 0.8, body + 1);
    c.fillStyle = '#ffffff';
    // wings
    c.beginPath();
    if (lv === 1) { c.moveTo(1.5, -span); c.lineTo(3.2, -span); c.lineTo(3.2, span); c.lineTo(1.5, span); }
    else { const sw = lv >= 3 ? 4 : 2.5; c.moveTo(2, 0); c.lineTo(-sw, -span); c.lineTo(-sw - 1.8, -span); c.lineTo(-1, 0); c.lineTo(-sw - 1.8, span); c.lineTo(-sw, span); }
    c.closePath(); c.fill();
    // tail
    c.beginPath(); c.moveTo(-L + 2.5, 0); c.lineTo(-L - 0.2, -span * 0.38); c.lineTo(-L - 1.4, -span * 0.38); c.lineTo(-L + 0.6, 0); c.lineTo(-L - 1.4, span * 0.38); c.lineTo(-L - 0.2, span * 0.38); c.closePath(); c.fill();
    // fuselage
    c.beginPath(); c.ellipse(0, 0, L, body, 0, 0, 7); c.fill();
    if (lv === 6) { c.fillStyle = '#e8edf5'; c.beginPath(); c.ellipse(L * 0.45, 0, L * 0.35, body * 0.75, 0, 0, 7); c.fill(); }
    // engines
    c.fillStyle = '#c9d2df';
    if (lv === 1) { c.fillStyle = 'rgba(200,210,225,0.7)'; [-span * 0.55, span * 0.55].forEach(y => { c.beginPath(); c.ellipse(4, y, 0.6, 2.4, 0, 0, 7); c.fill(); }); }
    else if (lv === 2) { [-1.9, 1.9].forEach(y => { c.beginPath(); c.ellipse(-L * 0.62, y, 1.6, 0.8, 0, 0, 7); c.fill(); }); }
    else { const n = lv === 6 ? [0.35, 0.7] : [0.42]; n.forEach(f => [-1, 1].forEach(sg => { c.beginPath(); c.ellipse(-0.5 - f * 3, sg * span * f, 1.6, lv >= 5 ? 1 : 0.8, 0, 0, 7); c.fill(); })); }
    // tail colour
    c.fillStyle = color; c.beginPath(); c.moveTo(-L + 1.5, 0); c.lineTo(-L - 1, -span * 0.32); c.lineTo(-L - 1, span * 0.32); c.closePath(); c.fill();
    c.fillStyle = '#9fb0c8'; c.beginPath(); c.ellipse(L - 1.4, 0, 1.1, body * 0.6, 0, 0, 7); c.fill();
  }
  function containerShip(c, lv, color) {
    const L = 7 + lv * 2.6, B = 2 + lv * 0.45;
    wake(c, L, B); shadow(c, L, B);
    hull(c, L, B, '#2d3748');
    c.fillStyle = '#f2f4f7'; c.fillRect(-L + 1, -B * 0.75, 3, B * 1.5); // bridge at stern
    const cols = ['#e5484d', '#2f7cf6', '#f5b301', '#12a150', '#ff6b2c', '#7c4dff', color];
    const n = 2 + lv * 2, start = -L + 4.5, w = (L * 1.75 - 6) / n;
    for (let i = 0; i < n; i++) { c.fillStyle = cols[(i * 3 + lv) % cols.length]; c.fillRect(start + i * w, -B * 0.72, w - 0.4, B * 1.44); }
  }
  function tanker(c, lv) {
    const L = 7 + lv * 2.6, B = 2.1 + lv * 0.5;
    wake(c, L, B); shadow(c, L, B);
    hull(c, L, B, '#9b2c2c');
    c.fillStyle = '#c2c8d0'; c.fillRect(-L + 4, -B * 0.55, L * 1.65 - 5, B * 1.1);
    c.strokeStyle = '#6f7a86'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-L + 4, 0); c.lineTo(L - 2, 0); c.stroke();
    for (let i = 0; i < 2 + lv; i++) { c.fillStyle = '#e6eaef'; c.beginPath(); c.arc(-L + 6 + i * (L * 1.5 - 6) / (2 + lv), 0, B * 0.32, 0, 7); c.fill(); }
    c.fillStyle = '#f2f4f7'; c.fillRect(-L + 0.8, -B * 0.75, 3, B * 1.5);
  }
  function yacht(c) {
    const L = 8, B = 2.2;
    wake(c, L, B); shadow(c, L, B);
    hull(c, L, B, '#ffffff');
    c.fillStyle = '#2f7cf6'; c.fillRect(-L + 1, -B * 0.7, L * 1.7, B * 0.5); // stripe
    c.fillStyle = '#f2f4f7'; c.fillRect(-L * 0.3, -B * 1.6, L * 0.7, B * 1.2); // cabin
    c.fillStyle = '#9fb0c8'; c.fillRect(-L * 0.1, -B * 1.3, L * 0.3, B * 0.6); // window
    c.strokeStyle = '#6b7685'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-L * 0.5, -B * 1.6); c.lineTo(-L * 0.5, -B * 3.2); c.lineTo(L * 0.4, -B * 3.2); c.stroke(); // mast + boom
  }
  function hull(c, L, B, col) { c.fillStyle = col; c.beginPath(); c.moveTo(L + 2, 0); c.quadraticCurveTo(L, -B, L - 3, -B); c.lineTo(-L, -B); c.lineTo(-L, B); c.lineTo(L - 3, B); c.quadraticCurveTo(L, B, L + 2, 0); c.fill(); }
  function wake(c, L, B) { c.fillStyle = 'rgba(255,255,255,0.16)'; c.beginPath(); c.moveTo(-L, -B * 0.8); c.lineTo(-L - 12 - L * 0.4, -B * 2); c.lineTo(-L - 12 - L * 0.4, B * 2); c.lineTo(-L, B * 0.8); c.fill(); }
  function fighter(c, lv) {
    const L = 5 + lv;
    shadow(c, L * 0.7, 2.5);
    c.fillStyle = lv >= 4 ? '#3b4250' : '#8e99a8';
    c.beginPath(); c.moveTo(L, 0); c.lineTo(-L * 0.2, -L * 0.75); c.lineTo(-L * 0.55, -L * 0.75); c.lineTo(-L * 0.35, -1); c.lineTo(-L, -L * 0.4); c.lineTo(-L, L * 0.4); c.lineTo(-L * 0.35, 1); c.lineTo(-L * 0.55, L * 0.75); c.lineTo(-L * 0.2, L * 0.75); c.closePath(); c.fill();
    c.fillStyle = '#9ad1ff'; c.beginPath(); c.ellipse(L * 0.45, 0, 1.4, 0.7, 0, 0, 7); c.fill();
  }
  function warship(c, lv) {
    const L = 6 + lv * 2.2, B = 1.8 + lv * 0.35;
    wake(c, L, B); shadow(c, L, B);
    if (lv >= 5) { // carrier: flat deck with planes
      c.fillStyle = '#5b6573'; c.beginPath(); c.moveTo(L + 1, -B * 0.4); c.lineTo(L - 2, -B * 1.3); c.lineTo(-L, -B * 1.3); c.lineTo(-L, B * 1.3); c.lineTo(L - 2, B * 1.3); c.lineTo(L + 1, B * 0.4); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.setLineDash([2, 2]); c.lineWidth = 0.5; c.beginPath(); c.moveTo(-L + 1, 0); c.lineTo(L - 1, 0); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#d6dbe2'; c.fillRect(-2, B * 0.5, 3, B * 0.7);
      return;
    }
    hull(c, L, B, '#6b7685');
    c.fillStyle = '#9aa4b2'; c.fillRect(-L * 0.4, -B * 0.6, L * 0.6, B * 1.2);
    c.fillStyle = '#cfd5dd'; c.fillRect(-L * 0.25, -B * 0.4, L * 0.25, B * 0.8);
    c.fillStyle = '#4f5866'; c.beginPath(); c.arc(L * 0.5, 0, B * 0.45, 0, 7); c.fill();
  }

  // ---------- dots, labels, overlays ----------
  let labelRects = [];
  function pill(c, x, y, text, style) {
    c.font = style.font; const w = c.measureText(text).width + style.px * 2, h = style.h, rx = x - w / 2;
    for (const r of labelRects) if (rx < r[2] && rx + w > r[0] && y < r[3] && y + h > r[1]) return false;
    labelRects.push([rx - 3, y - 3, rx + w + 3, y + h + 3]);
    c.fillStyle = style.bg; c.strokeStyle = style.border; c.lineWidth = 1.5;
    c.beginPath(); c.roundRect(rx, y, w, h, h / 2); c.fill(); if (style.border) c.stroke();
    c.fillStyle = style.fg; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillText(text, x, y + h / 2 + 0.5);
    return true;
  }
  const PILL = { font: '800 13px Nunito, system-ui, sans-serif', bg: 'rgba(22,34,62,0.92)', border: 'rgba(120,140,180,0.45)', fg: '#ffffff', px: 11, h: 26 };
  const PILL_SEL = { font: '800 15px Nunito, system-ui, sans-serif', bg: '#2f7cf6', border: 'rgba(255,255,255,0.35)', fg: '#ffffff', px: 14, h: 32 };
  const PILL_MINE = { font: '800 13px Nunito, system-ui, sans-serif', bg: 'rgba(22,34,62,0.95)', border: '#2f7cf6', fg: '#cfe0ff', px: 11, h: 26 };
  function drawSprite(sx, sy, ang, k, fn) { const c = tctx; c.save(); c.translate(sx, sy); c.rotate(ang); c.scale(k, k); fn(c); c.restore(); }
  function military(now) {
    const st = S_(), out = [];
    const orbit = (cx, cy, r, sp, ph) => { const a = now / 1000 * sp + ph; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.6, a + Math.PI / 2]; };
    st.wars.forEach(w => {
      const A = W.cities[W.byA3[w.a].capital], B = W.cities[W.byA3[w.b].capital];
      const t = ((now / 1000 * 0.15) % 2), f = t < 1 ? t : 2 - t;
      const x = A.x + (B.x - A.x) * f, y = A.y + (B.y - A.y) * f, ang = Math.atan2(B.y - A.y, B.x - A.x) + (t < 1 ? 0 : Math.PI);
      out.push([x, y, ang, c => fighter(c, Math.max(2, country(w.a).milLv.air)), false, { kind: 'fighter', a3: w.a, other: w.b, war: true, idx: 0, key: `war:${w.a}-${w.b}-0` }]);
      const back = [(B.x * 0.7 + A.x * 0.3), (B.y * 0.7 + A.y * 0.3)];
      out.push([back[0] + Math.sin(now / 700) * 4, back[1] - 6, ang + Math.PI, c => fighter(c, Math.max(1, country(w.b).milLv.air)), false, { kind: 'fighter', a3: w.b, other: w.a, war: true, idx: 1, key: `war:${w.a}-${w.b}-1` }]);
    });
    const show = [st.home];
    if (v.s > 1.4) Object.keys(st.countries).sort((a, b) => milPower(b) - milPower(a)).slice(0, 12).forEach(a => { if (a !== st.home) show.push(a); });
    show.forEach((a3, i) => {
      const cs = st.countries[a3], cap = W.cities[W.byA3[a3].capital];
      // Orbit radii were 9 (fighter) and 7 (warship) map units — smaller
      // than the sprites themselves, so military units spun in place over
      // their own capital. 26/28 map units is wider than any sprite, so
      // the orbit is actually visible as movement.
      if (cs.milLv.air > 0) { const [x, y, ang] = orbit(cap.x, cap.y, 26, 0.6, i); out.push([x, y, ang, c => fighter(c, cs.milLv.air), false, { kind: 'fighter', a3, level: cs.milLv.air, key: `mil:${a3}:air` }]); }
      if (cs.milLv.navy > 0) {
        const cell = nearestWater(W, cap.lon, cap.lat); if (cell != null) { const [wx, wy] = cellXY(W, cell); const [x, y, ang] = orbit(wx, wy, 28, 0.12, i * 2); out.push([x, y, ang, c => warship(c, cs.milLv.navy), true, { kind: cs.milLv.navy >= 5 ? 'carrier' : 'warship', a3, level: cs.milLv.navy, key: `mil:${a3}:navy` }]); }
      }
    });
    return out;
  }
  // ---------- vehicle descriptors (for tap cards and Watch views) ----------
  function nearestCityXY(x, y) { let best = null, bd = 1e18; W.cities.forEach(ct => { const d = Math.hypot(ct.x - x, ct.y - y); if (d < bd) { bd = d; best = ct; } }); return best; }
  function cityForCell(cell) { if (cell == null) return null; const [wx, wy] = cellXY(W, cell); return nearestCityXY(wx, wy); }
  function vehicleList(now) {
    const st = S_(); if (!st) return [];
    const out = [];
    if (builtFor !== st.seed) buildUnits();
    units.forEach(u => {
      const co = st.co[u.a3]; if (!co) return;
      if (u.type === 'yacht') {
        const pos = u.pts ? along(u.pts, u.len, u.t) : cellXY(W, u.start);
        out.push({ key: 'yacht', category: 'yacht', model: 'Personal yacht', owner: 'You', a3: u.a3, from: cityForCell(u.start), to: u.dest != null ? cityForCell(u.dest) : null, progress: u.t, secsLeft: u.pts ? (1 - u.t) * u.len / 5 : null, x: pos[0], y: pos[1], ang: pos[2], level: 1 });
        return;
      }
      const F = SECTORS[co.sector].fleet; if (!F || !co.fleet) return;
      if (u.type === 'plane') {
        const d = Math.max(30, Math.hypot(u.to.x - u.from.x, u.to.y - u.from.y)), pos = bez(u.from, u.to, u.t);
        out.push({ key: `co:${u.a3}`, category: 'plane', model: F.levels[co.fleet].name, owner: co.name, sym: co.sym, a3: u.a3, from: u.from, to: u.to, progress: u.t, secsLeft: (1 - u.t) * d / 24, x: pos[0], y: pos[1], ang: pos[2], level: co.fleet, fleetKind: F.kind });
      } else {
        const pos = u.pts ? along(u.pts, u.len, u.t) : cellXY(W, u.start);
        out.push({ key: `co:${u.a3}`, category: 'cargo', model: F.levels[co.fleet].name, owner: co.name, sym: co.sym, a3: u.a3, from: cityForCell(u.start), to: u.dest != null ? cityForCell(u.dest) : null, progress: u.t, secsLeft: u.pts ? (1 - u.t) * u.len / 5 : null, x: pos[0], y: pos[1], ang: pos[2], level: co.fleet, fleetKind: F.kind });
      }
    });
    military(now).forEach(([x, y, a, fn, isShip, meta]) => {
      if (!meta) return;
      const cs = st.countries[meta.a3]; if (!cs) return;
      const level = meta.level || (meta.kind === 'fighter' ? Math.max(2, cs.milLv.air) : cs.milLv.navy);
      const cap = W.cities[W.byA3[meta.a3].capital];
      out.push({ key: meta.key, category: meta.kind, model: meta.kind === 'fighter' ? MILITARY.air.levels[level] : MILITARY.navy.levels[level], owner: W.byA3[meta.a3].name, a3: meta.a3, other: meta.other || null, war: !!meta.war, from: cap, to: null, progress: null, secsLeft: null, x, y, ang: a, level });
    });
    return out;
  }
  function vehicleAt(sx, sy) {
    let best = null, bd = 34;
    vehicleList(performance.now()).forEach(vd => { const [x, y] = toScreen(vd.x, vd.y); const d = Math.hypot(x - sx, y - sy); if (d < bd) { bd = d; best = vd.key; } });
    return best;
  }
  function drawTop(now) {
    const c = tctx; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, vw, vh);
    const st = S_();
    if (pickMode) { drawPickLabels(c); return; }
    const k = Math.min(1.9, Math.max(0.75, Math.sqrt(v.s / 0.55)));
    // Ship sprites used the same near-constant scale at every zoom, so at
    // world zoom a ~35px ship moved ~2.6px/sec — less than its own length
    // in 10 seconds, which reads as "sitting there". Ships now scale with
    // zoom (smaller when zoomed out, full size when zoomed in), so their
    // movement is visible relative to their own size. Planes keep the old
    // scale: they move fast enough that size was never the problem.
    const kShip = Math.min(1.6, Math.max(0.35, 0.65 * Math.sqrt(v.s)));
    const onScreen = (sx, sy) => sx > -30 && sy > -30 && sx < vw + 30 && sy < vh + 30;
    if (st && st.settings.motion) {
      units.forEach(u => {
        const co = st.co[u.a3]; if (!co) return;
        let x, y, a;
        if (u.type === 'yacht') { if (!u.pts) return; [x, y, a] = along(u.pts, u.len, u.t); const [sx, sy] = toScreen(x, y); if (!onScreen(sx, sy)) return; drawSprite(sx, sy, a, kShip, cc => yacht(cc)); return; }
        if (!co.fleet) return;
        if (u.type === 'plane') [x, y, a] = bez(u.from, u.to, u.t);
        else { if (!u.pts) return; [x, y, a] = along(u.pts, u.len, u.t); }
        const [sx, sy] = toScreen(x, y); if (!onScreen(sx, sy)) return;
        drawSprite(sx, sy, a, u.type === 'plane' ? k * 0.85 : kShip, cc => u.type === 'plane' ? plane(cc, co.fleet, co.color) : u.type === 'container' ? containerShip(cc, co.fleet, co.color) : tanker(cc, co.fleet));
      });
      military(now).forEach(([x, y, a, fn, isShip]) => { const [sx, sy] = toScreen(x, y); if (onScreen(sx, sy)) drawSprite(sx, sy, a, isShip ? kShip : k * 0.85, fn); });
    }
    if (!st) return;
    const pulse = 0.5 + 0.5 * Math.sin(now / 300);
    st.wars.forEach(w => [w.a, w.b].forEach(a3 => { const cap = W.cities[W.byA3[a3].capital]; const [sx, sy] = toScreen(cap.x, cap.y); c.strokeStyle = `rgba(229,72,77,${0.4 + pulse * 0.5})`; c.lineWidth = 3; c.beginPath(); c.arc(sx, sy, 14 + pulse * 8, 0, 7); c.stroke(); }));
    for (const id in st.cityHit) if (st.cityHit[id] > st.day) { const ct = W.cities[id]; const [sx, sy] = toScreen(ct.x, ct.y); c.strokeStyle = `rgba(255,140,40,${0.4 + pulse * 0.5})`; c.lineWidth = 2.5; c.beginPath(); c.arc(sx, sy, 11 + pulse * 6, 0, 7); c.stroke(); }
    const r = Math.max(3.4, Math.min(7.5, 2.6 + v.s * 2.2));
    const mineSet = new Set(); for (const a3 in st.holdings) if (controlled(a3)) mineSet.add(W.byA3[a3].capital);
    W.cities.forEach(ct => {
      const [sx, sy] = toScreen(ct.x, ct.y); if (sx < -10 || sy < -10 || sx > vw + 10 || sy > vh + 10) return;
      const isMine = mineSet.has(ct.id), isSel = sel === ct.id, held = st.holdings[ct.a3] && !isMine;
      const rr = isSel ? r * 1.7 : isMine ? r * 1.35 : r;
      if (isSel) { c.fillStyle = 'rgba(47,124,246,0.25)'; c.beginPath(); c.arc(sx, sy, rr * 2.2, 0, 7); c.fill(); }
      c.fillStyle = isMine || isSel ? '#2f7cf6' : '#ffffff'; c.strokeStyle = isMine || isSel ? '#ffffff' : held ? '#2f7cf6' : '#1a2747';
      c.lineWidth = isMine || isSel ? 2.4 : held ? 2.6 : 2; c.beginPath(); c.arc(sx, sy, rr, 0, 7); c.fill(); c.stroke();
    });
    labelRects = [];
    W.cities.forEach(ct => { const [sx, sy] = toScreen(ct.x, ct.y); labelRects.push([sx - r, sy - r, sx + r, sy + r]); });
    const order = W.cities.map(ct => [ct.id, (ct.id === sel ? 1e13 : 0) + (mineSet.has(ct.id) ? 1e12 : 0) + (st.holdings[ct.a3] ? 1e11 : 0) + W.byA3[ct.a3].gdp0]).sort((a, b) => b[1] - a[1]);
    const maxLabels = Math.round(14 + v.s * v.s * 40);
    let n = 0;
    for (const [id, p] of order) {
      if (n >= maxLabels && p < 1e11) break;
      const ct = W.cities[id], [sx, sy] = toScreen(ct.x, ct.y);
      if (sx < -60 || sy < -40 || sx > vw + 60 || sy > vh + 40) continue;
      const isSel = id === sel, text = isSel || v.s > 2.2 ? `${ct.code} · ${ct.name}` : ct.code;
      if (pill(c, sx, sy + r + 6, text, isSel ? PILL_SEL : mineSet.has(id) ? PILL_MINE : PILL)) n++;
    }
  }
  function drawPickLabels(c) {
    labelRects = [];
    const list = W.playable.slice().sort((a, b) => b.pop0 - a.pop0), max = Math.round(25 + v.s * v.s * 60);
    let n = 0;
    for (const k of list) {
      if (n > max) break;
      const [sx, sy] = toScreen(k.lx, k.ly); if (sx < -60 || sy < -30 || sx > vw + 60 || sy > vh + 30) continue;
      if (pill(c, sx, sy - 12, k.name, k.a3 === hoverCountry ? PILL_SEL : PILL)) n++;
    }
  }

  // ---------- input ----------
  const pts = new Map(); let downAt = null, moved = 0, pinch = null;
  top.addEventListener('pointerdown', e => { top.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); downAt = [e.clientX, e.clientY]; moved = 0; anim = null; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: v.s }; } });
  top.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
    const rect = top.getBoundingClientRect();
    if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; zoomAt(pinch.s * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d / v.s, (a[0] + b[0]) / 2 - rect.left, (a[1] + b[1]) / 2 - rect.top); moved = 99; return; }
    const dx = e.clientX - prev[0], dy = e.clientY - prev[1]; moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 5) { v.x += dx; v.y += dy; clampView(); dirty = true; }
  });
  const up = e => { if (!pts.has(e.pointerId)) return; pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (pts.size === 0 && moved <= 6 && downAt) { const rect = top.getBoundingClientRect(); tap(e.clientX - rect.left, e.clientY - rect.top); } };
  top.addEventListener('pointerup', up); top.addEventListener('pointercancel', e => { pts.delete(e.pointerId); pinch = null; });
  top.addEventListener('wheel', e => { e.preventDefault(); const rect = top.getBoundingClientRect(); zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top); }, { passive: false });
  function zoomAt(f, sx, sy) { const [mx, my] = toMap(sx, sy); v.s *= f; clampView(); v.x = sx - mx * v.s; v.y = sy - my * v.s; clampView(); dirty = true; }
  function tap(sx, sy) {
    if (!pickMode) {
      const vk = vehicleAt(sx, sy);
      if (vk != null) { handlers.vehicle && handlers.vehicle(vk); return; }
      let best = null, bd = 18;
      W.cities.forEach(ct => { const [x, y] = toScreen(ct.x, ct.y); const d = Math.hypot(x - sx, y - sy); if (d < bd) { bd = d; best = ct.id; } });
      if (best != null) { handlers.city && handlers.city(best); return; }
    }
    const [mx, my] = toMap(sx, sy);
    let k = W.playable.find(c => c.hasShape && mx >= c.box[0] && mx <= c.box[2] && my >= c.box[1] && my <= c.box[3] && hit.isPointInPath(c.path, mx, my));
    if (!k && pickMode) { let bd = 16; W.playable.forEach(c => { const ct = W.cities[c.capital]; const [x, y] = toScreen(ct.x, ct.y); const d = Math.hypot(x - sx, y - sy); if (d < bd) { bd = d; k = c; } }); }
    if (k) handlers.country && handlers.country(k.a3); else handlers.empty && handlers.empty();
  }
  function flyTo(x, y, s) {
    const from = { ...v }, ts = Math.max(Math.max(vw / MAP_W, vh / MAP_H), s || v.s), tx = vw / 2 - x * ts, ty = vh / 2 - y * ts, t0 = performance.now();
    anim = now => { const f = Math.min(1, (now - t0) / 650), e = 1 - Math.pow(1 - f, 3); v.s = from.s + (ts - from.s) * e; v.x = from.x + (tx - from.x) * e; v.y = from.y + (ty - from.y) * e; clampView(); dirty = true; if (f >= 1) anim = null; };
  }
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (anim) anim(now);
    const st = S_();
    if (st && !pickMode) step(dt * (st.speed === 0 ? 0 : st.speed === 3 ? 2.5 : st.speed));
    if (dirty) { drawBase(); dirty = false; }
    drawTop(now);
    handlers.frame && handlers.frame(now);
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize', resize);

  return {
    init() { resize(); fit(); requestAnimationFrame(frame); },
    on(name, fn) { handlers[name] = fn; },
    select(id) { sel = id; },
    setPick(on, a3) { pickMode = on; hoverCountry = a3 || null; dirty = true; },
    reset() { builtFor = null; dirty = true; },
    redraw() { dirty = true; },
    flyToCity(id, s) { const c = W.cities[id]; flyTo(c.x, c.y, s || Math.max(v.s, 2.4)); },
    flyToCountry(a3) { const k = W.byA3[a3]; const w = Math.max(8, k.box[2] - k.box[0]), h = Math.max(8, k.box[3] - k.box[1]); flyTo((k.box[0] + k.box[2]) / 2, (k.box[1] + k.box[3]) / 2, Math.min(8, Math.min(vw / (w * 2.2), vh / (h * 2.6)))); },
    zoom(f) { zoomAt(f, vw / 2, vh / 2); },
    home() { const st = S_(); if (st) this.flyToCountry(st.home); else fit(); },
    world() { flyTo(MAP_W / 2, MAP_H / 2, 0); },
    vehicle(key) { const v = vehicleList(performance.now()).find(vd => vd.key === key); return v || null; },
    vehicleAt(sx, sy) { return vehicleAt(sx, sy); },
    flyToXY(x, y, s) { flyTo(x, y, s || Math.max(v.s, 2.4)); },
    nearCity(x, y) { return nearestCityXY(x, y); },
    sprite: { plane, containerShip, tanker, fighter, warship, yacht },
  };
})();
