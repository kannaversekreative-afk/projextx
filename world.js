// Runtime world: the 195 countries and their capitals from world-data.js,
// projected for the map, plus sea routing and city layouts.
'use strict';

function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// ---------- projection (Miller cylindrical, cropped to inhabited latitudes) ----------
const MAP_W = 2000, LAT_TOP = 83, LAT_BOT = -57;
const millerY = lat => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * Math.PI / 180));
const MY_TOP = millerY(LAT_TOP), MY_BOT = millerY(LAT_BOT);
const MAP_H = MAP_W * (MY_TOP - MY_BOT) / (2 * Math.PI);
const projX = lon => (lon + 180) / 360 * MAP_W;
const projY = lat => (MY_TOP - millerY(Math.max(LAT_BOT - 5, Math.min(LAT_TOP + 3, lat)))) / (MY_TOP - MY_BOT) * MAP_H;
const flagEmoji = a2 => a2 && a2.length === 2 ? String.fromCodePoint(...[...a2.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '\u{1F3F3}️';

function buildWorld() {
  const W = { countries: [], byA3: {}, cities: [], layouts: {}, lotCache: {} };
  const wd = WORLD_DATA.water, raw = atob(wd.b64), fine = new Uint8Array(wd.w * wd.h);
  for (let i = 0; i < fine.length; i++) fine[i] = (raw.charCodeAt(i >> 3) >> (i & 7)) & 1;
  WORLD_DATA.countries.forEach(d => {
    const path = new Path2D();
    let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9, coast = false;
    d.rings.forEach(r => {
      let lon = 0, lat = 0, first = true;
      for (let i = 0; i < r.length; i += 2) {
        lon += r[i] / 20; lat += r[i + 1] / 20;
        const x = projX(lon), y = projY(lat);
        first ? path.moveTo(x, y) : path.lineTo(x, y); first = false;
        minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y);
        if (!coast && i % 6 === 0) { const gx = Math.floor(lon + 180), gy = Math.floor(90 - lat); for (let dy = -1; dy <= 1 && !coast; dy++) for (let dx = -1; dx <= 1; dx++) { const X = (gx + dx + wd.w) % wd.w, Y = gy + dy; if (Y >= 0 && Y < wd.h && fine[Y * wd.w + X]) { coast = true; break; } } }
      }
      path.closePath();
    });
    if (!d.rings.length) { const x = projX(d.lx), y = projY(d.ly); minx = maxx = x; miny = maxy = y; coast = true; }
    const k = { a3: d.a3, a2: d.a2, name: d.name, sub: d.sub, cont: d.cont, pop0: d.pop, gdp0: Math.max(30, d.gdp), nb: d.nb, path, box: [minx, miny, maxx, maxy],
      lx: projX(d.lx), ly: projY(d.ly), flag: flagEmoji(d.a2), playable: d.un, coastal: coast, hasShape: d.rings.length > 0 };
    if (!W.byA3[k.a3] || (k.playable && !W.byA3[k.a3].playable)) W.byA3[k.a3] = k;
    W.countries.push(k);
  });
  WORLD_DATA.cities.forEach(d => {
    const k = W.byA3[d.c];
    const c = { id: W.cities.length, name: d.n, code: d.code, a3: d.c, lat: d.lat, lon: d.lon, x: projX(d.lon), y: projY(d.lat), pop: Math.max(5000, d.pop), port: !!d.port };
    c.size = Math.max(0.3, Math.min(1.3, (Math.log10(c.pop) - 4.3) / 2.7));
    W.cities.push(c); k.capital = c.id;
  });
  // Taiwan is a real economy and the world's semiconductor leader, even
  // though it is not a UN member, so the UN-based playable flag excludes
  // it and it has no capital city in the data. Give it Taipei as a
  // capital and make it playable, or "Taiwan semiconductors" is moot.
  const twn = W.byA3['TWN'];
  if (twn && twn.capital == null) {
    const c = { id: W.cities.length, name: 'Taipei', code: 'TPE', a3: 'TWN', lat: 25.032, lon: 121.565, x: projX(121.565), y: projY(25.032), pop: 2600000, port: 1 };
    c.size = Math.max(0.3, Math.min(1.3, (Math.log10(c.pop) - 4.3) / 2.7));
    W.cities.push(c); twn.capital = c.id;
  }
  if (twn) twn.playable = true;
  W.playable = W.countries.filter(k => k.playable && k.capital != null);
  W.playable.forEach(k => {
    const gdpPc = k.gdp0 * 1e6 / Math.max(1, k.pop0);
    k.wealth = Math.max(0.22, Math.min(2.3, Math.pow(gdpPc / 20000, 0.55)));
    W.cities[k.capital].wealth = k.wealth;
  });
  // Every city needs wealth for lot rents, not just the capital: businesses
  // now open in any city in their country, so a non-capital city with no
  // wealth would produce NaN rents.
  W.cities.forEach(c => { if (c.wealth == null && W.byA3[c.a3]) c.wealth = W.byA3[c.a3].wealth; });
  // Ship routing on a 2-degree grid (water if any 1-degree sub-cell is water).
  W.ww = wd.w / 2; W.wh = wd.h / 2; W.water = new Uint8Array(W.ww * W.wh);
  for (let y = 0; y < W.wh; y++) for (let x = 0; x < W.ww; x++) W.water[y * W.ww + x] = fine[(2 * y) * wd.w + 2 * x] | fine[(2 * y) * wd.w + 2 * x + 1] | fine[(2 * y + 1) * wd.w + 2 * x] | fine[(2 * y + 1) * wd.w + 2 * x + 1];
  // Flood-fill water components ("basins") once at build time, using the
  // same 8-neighbour, no-wrap adjacency seaPath() uses, so any two cells in
  // one basin are guaranteed reachable from each other by seaPath(). This
  // keeps boats out of enclosed seas (Caspian, Black Sea, Baltic, ...) from
  // rolling destinations in the open ocean that no sea path can reach: a
  // boat that rolls only inside its own basin always gets a real route.
  W.basin = new Int32Array(W.ww * W.wh).fill(-1);
  W.basinSize = [];
  {
    const G = W.ww, H = W.wh, stack = [];
    for (let c = 0; c < G * H; c++) {
      if (!W.water[c] || W.basin[c] >= 0) continue;
      const id = W.basinSize.length; let size = 0;
      W.basin[c] = id; stack.push(c);
      while (stack.length) {
        const cur = stack.pop(); size++;
        const x = cur % G, y = (cur / G) | 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = x + dx, ny = y + dy; if (nx < 0 || nx >= G || ny < 0 || ny >= H) continue;
          const nc = ny * G + nx; if (W.water[nc] && W.basin[nc] < 0) { W.basin[nc] = id; stack.push(nc); }
        }
      }
      W.basinSize.push(size);
    }
  }
  W.basinCount = W.basinSize.length;
  return W;
}

// Nearest navigable water cell to a lon/lat (searches outward).
function nearestWater(W, lon, lat) {
  const G = W.ww, x0 = Math.floor((lon + 180) / 2), y0 = Math.floor((90 - lat) / 2);
  for (let r = 0; r < 25; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const X = (x0 + dx + G) % G, Y = y0 + dy; if (Y < 0 || Y >= W.wh) continue;
    if (W.water[Y * G + X]) return Y * G + X;
  }
  return null;
}
const cellXY = (W, c) => [projX((c % W.ww) * 2 - 180 + 1), projY(90 - ((c / W.ww) | 0) * 2 - 1)];
// ---------- facilities: ports, military ports, military bases ----------
// Every coastal country starts with one civilian port, one military port
// and one military base. Landlocked countries start with a military base
// only — there is no sea to port from. Military ships may use a civilian
// port too, but civilian boats never use a military port: cargo routes are
// built only from civilian port cells (see mapview buildUnits), while navy
// patrols start from the military port.
// Positions are deterministic from the capital, so old saves get the same
// starting facilities without a save migration. Purchased bases live in
// S.facilities[a3].bases (map-space xy pairs) and are added on top.
// Does a water cell touch this country's own land? A water cell counts
// only if one of its neighbouring cells is inside the country's shape.
// Without this, a port is just "nearest water anywhere" — which is how
// ports ended up scattered in other countries' waters (e.g. in Texas for
// countries that have nothing to do with Texas).
let FAC_CTX = null;
function touchesCountry(a3, cell) {
  const k = W.byA3[a3]; if (!k || !k.path) return true;
  if (typeof document === 'undefined') return true;
  if (!FAC_CTX) { try { FAC_CTX = document.createElement('canvas').getContext('2d'); } catch (e) { return true; } }
  if (!FAC_CTX || typeof FAC_CTX.isPointInPath !== 'function') return true;
  const G = W.ww, x = cell % G, y = (cell / G) | 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    const nx = x + dx, ny = y + dy; if (nx < 0 || nx >= G || ny < 0 || ny >= W.wh) continue;
    if (W.water[ny * G + nx]) continue;
    const [mx, my] = cellXY(W, ny * G + nx);
    try { if (FAC_CTX.isPointInPath(k.path, mx, my)) return true; } catch (e) { return true; }
  }
  return false;
}
function ownCoastWater(a3, lon, lat, maxR) {
  const G = W.ww, x0 = Math.floor((lon + 180) / 2), y0 = Math.floor((90 - lat) / 2);
  for (let r = 0; r <= maxR; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const X = (x0 + dx + G) % G, Y = y0 + dy; if (Y < 0 || Y >= W.wh) continue;
    const c = Y * G + X; if (W.water[c] && touchesCountry(a3, c)) return c;
  }
  return null;
}
// A port is not in the water. It sits on the edge of the land, connected
// to land. So the icon goes on the land cell that touches the water —
// the country's own land cell if one is found, any neighbouring land
// cell otherwise, the capital itself for a tiny island with no land
// cell in the grid. Never the water cell centre out at sea.
function coastPoint(a3, cell, cap) {
  const G = W.ww, x = cell % G, y = (cell / G) | 0;
  let anyLand = null;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    const nx = x + dx, ny = y + dy; if (nx < 0 || nx >= G || ny < 0 || ny >= W.wh) continue;
    const nc = ny * G + nx; if (W.water[nc]) continue;
    const lxy = cellXY(W, nc);
    if (!anyLand) anyLand = lxy;
    const k = W.byA3[a3];
    if (k && k.path && FAC_CTX && typeof FAC_CTX.isPointInPath === 'function') {
      try { if (FAC_CTX.isPointInPath(k.path, lxy[0], lxy[1])) return lxy; } catch (e) {}
    }
  }
  if (anyLand) return anyLand;
  return cap ? [cap.x, cap.y] : cellXY(W, cell);
}
let FAC_CACHE = {};
function facilitiesFor(a3) {
  if (typeof W === 'undefined' || !W || !W.byA3[a3]) return null;
  const k = W.byA3[a3], cap = W.cities[k.capital]; if (!cap) return null;
  if (FAC_CACHE[a3]) {
    const c = FAC_CACHE[a3];
    const bases = [c.base];
    if (typeof S !== 'undefined' && S && S.facilities && S.facilities[a3] && Array.isArray(S.facilities[a3].bases)) {
      S.facilities[a3].bases.forEach(b => { if (b && isFinite(b.x) && isFinite(b.y)) bases.push(b); });
    }
    return { a3, cap, portCell: c.portCell, milPortCell: c.milPortCell, portXY: c.portXY, milPortXY: c.milPortXY, bases };
  }
  // Port: nearest water that touches this country's own coast, not just
  // nearest water anywhere. Fall back to nearest water only if no own
  // coast water is found (tiny countries with no shape).
  const portCell = k.coastal ? (ownCoastWater(a3, cap.lon, cap.lat, 40) ?? nearestWater(W, cap.lon, cap.lat)) : null;
  let milPortCell = null;
  if (portCell != null) {
    // Military port: the closest different water cell in the same basin
    // that also touches this country's own coast, and close to the
    // civilian port — not up to 40 degrees away in another country's waters.
    const basin = W.basin[portCell], px = portCell % W.ww, py = (portCell / W.ww) | 0;
    outer: for (let r = 1; r <= 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const nx = px + dx, ny = py + dy; if (nx < 0 || nx >= W.ww || ny < 0 || ny >= W.wh) continue;
      const c = ny * W.ww + nx; if (c !== portCell && W.water[c] && W.basin[c] === basin && touchesCountry(a3, c)) { milPortCell = c; break outer; }
    }
    if (milPortCell == null) milPortCell = portCell;
  }
  // Military base: inland from the capital, away from the nearest water.
  let bx = cap.x + 30, by = cap.y - 18;
  if (portCell != null) { const [wx, wy] = cellXY(W, portCell); const dx = cap.x - wx, dy = cap.y - wy, d = Math.hypot(dx, dy) || 1; bx = cap.x + dx / d * 32; by = cap.y + dy / d * 32; }
  const bases = [{ x: bx, y: by }];
  if (typeof S !== 'undefined' && S && S.facilities && S.facilities[a3] && Array.isArray(S.facilities[a3].bases)) {
    S.facilities[a3].bases.forEach(b => { if (b && isFinite(b.x) && isFinite(b.y)) bases.push(b); });
  }
  const portXY = portCell != null ? coastPoint(a3, portCell, cap) : null;
  let milPortXY = milPortCell != null ? coastPoint(a3, milPortCell, cap) : null;
  if (milPortXY && portXY && milPortXY[0] === portXY[0] && milPortXY[1] === portXY[1]) milPortXY = [portXY[0] + 18, portXY[1] - 10];
  FAC_CACHE[a3] = { portCell, milPortCell, portXY, milPortXY, base: bases[0] };
  return { a3, cap, portCell, milPortCell, portXY, milPortXY, bases };
}
function facilityCount(a3) { const f = facilitiesFor(a3); return f ? f.bases.length : 1; }
function purchasedBaseCount(a3) { const f = facilitiesFor(a3); return f ? Math.max(0, f.bases.length - 1) : 0; }

// A* over the water grid between two cells; returns map-space points.
function seaPath(W, s, t) {
  if (s == null || t == null) return null;
  const G = W.ww, H = W.wh, tx = t % G, ty = (t / G) | 0;
  const g = new Float32Array(G * H).fill(Infinity), from = new Int32Array(G * H).fill(-1), heap = [];
  const h = c => Math.hypot(c % G - tx, ((c / G) | 0) - ty);
  const push = (f, c) => { heap.push([f, c]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  g[s] = 0; push(h(s), s);
  while (heap.length) {
    const [f, c] = pop(); if (c === t) break; if (f > g[c] + h(c) + 1e-6) continue;
    const x = c % G, y = (c / G) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; const ny = y + dy, nx = x + dx; if (ny < 0 || ny >= H || nx < 0 || nx >= G) continue;
      const nc = ny * G + nx; if (!W.water[nc]) continue;
      const ng = g[c] + (dx && dy ? 1.414 : 1);
      if (ng < g[nc]) { g[nc] = ng; from[nc] = c; push(ng + h(nc), nc); }
    }
  }
  if (from[t] < 0 && s !== t) return null;
  const cells = []; for (let c = t; c >= 0; c = from[c]) { cells.push(c); if (c === s) break; }
  return cells.reverse().map(c => cellXY(W, c));
}

// ---------- city layout ----------
// 24x24 tiles; every 4th row/column is a road, leaving 3x3 blocks of lots.
// The block nearest the centre is the capitol plaza.
const CITY_N = 25;
const ARCH = ['glass', 'office', 'apartment', 'rowhouse', 'house', 'shop', 'warehouse'];
function cityLayout(city) {
  if (W.layouts[city.id]) return W.layouts[city.id];
  const rng = mulberry(hashStr('city2:' + city.code + city.name));
  const N = CITY_N, tiles = [], c = (N - 1) / 2;
  const waterSide = city.port ? Math.floor(rng() * 4) : -1;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let kind = x % 4 === 0 || y % 4 === 0 ? 'road' : 'lot';
    if (waterSide >= 0) { const e = [y, N - 1 - x, N - 1 - y, x][waterSide]; if (e < 3) kind = 'water'; else if (e === 3) kind = 'beach'; }
    if (x === 0 || y === 0 || x === N - 1 || y === N - 1) { if (kind === 'road') kind = 'road'; }
    tiles.push({ x, y, kind, d: Math.hypot(x - c, y - c) / (c * 1.41), seed: rng() });
  }
  const T = (x, y) => tiles[y * N + x];
  const blocks = [];
  for (let by = 1; by < N - 1; by += 4) for (let bx = 1; bx < N - 1; bx += 4) {
    const cells = []; for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) { const t = T(bx + dx, by + dy); if (t && t.kind === 'lot') cells.push(t); }
    if (cells.length === 9) blocks.push({ bx, by, cells, d: Math.hypot(bx + 1 - c, by + 1 - c) / (c * 1.41) });
  }
  blocks.sort((a, b) => a.d - b.d);
  const capitol = blocks.shift();
  capitol.cells.forEach(t => { t.kind = 'plaza'; });
  const landmark = { x: capitol.bx, y: capitol.by };
  // Keep the blocks in front of the capitol low so the dome stays visible.
  const front = b => b.bx + b.by > capitol.bx + capitol.by && Math.abs(b.bx - capitol.bx) <= 4 && Math.abs(b.by - capitol.by) <= 4;
  blocks.forEach((b, i) => {
    const r = rng();
    let zone;
    if (front(b)) zone = r < 0.35 ? 'park' : 'commercial';
    else if (b.d < 0.3) zone = r < 0.1 ? 'park' : 'downtown';
    else if (b.d < 0.6) zone = r < 0.12 ? 'park' : r < 0.2 ? 'commercial' : 'midtown';
    else zone = r < 0.14 ? 'park' : r < 0.22 ? 'industrial' : r < 0.3 ? 'commercial' : 'suburb';
    b.zone = zone;
    b.cells.forEach(t => {
      t.zone = zone;
      if (zone === 'park') { t.kind = 'park'; return; }
      const q = rng();
      const down = Math.max(0, 1 - t.d * 1.4);
      if (zone === 'downtown') { t.arch = q < 0.5 ? 'glass' : q < 0.85 ? 'office' : 'apartment'; t.floors = Math.round(8 + city.size * 26 * (0.35 + rng() * 0.9) * (0.5 + down)); }
      else if (zone === 'midtown') { t.arch = q < 0.45 ? 'apartment' : q < 0.7 ? 'office' : q < 0.88 ? 'shop' : 'rowhouse'; t.floors = t.arch === 'shop' ? 1 + Math.round(rng()) : t.arch === 'rowhouse' ? 3 : Math.round(3 + rng() * 6 + city.size * 4); }
      else if (zone === 'commercial') { t.arch = q < 0.65 ? 'shop' : 'office'; t.floors = t.arch === 'shop' ? 1 + Math.round(rng()) : Math.round(3 + rng() * 4); }
      else if (zone === 'industrial') { t.arch = 'warehouse'; t.floors = 2; }
      else { t.arch = q < 0.55 ? 'house' : q < 0.85 ? 'rowhouse' : 'shop'; t.floors = t.arch === 'house' ? 1 : t.arch === 'shop' ? 1 : 2 + Math.round(rng()); }
      t.color = pickColor(t.arch, rng);
      t.roof = ['#c4674f', '#7d6352', '#5f6e7e', '#a35a3c', '#4f5b66', '#8b3f3a'][Math.floor(rng() * 6)];
      t.traffic = Math.round((2400 + 15500 * Math.pow(down, 1.2) * (0.45 + city.size * 0.75)) * (0.75 + rng() * 0.5) * (zone === 'commercial' ? 1.25 : zone === 'industrial' ? 0.6 : 1));
    });
  });
  // Main avenues through the centre carry more people.
  tiles.forEach(t => { if (t.traffic && (Math.abs(t.x - c) < 2.5 || Math.abs(t.y - c) < 2.5)) t.traffic = Math.round(t.traffic * 1.2); });
  const L = { N, tiles, landmark, waterSide };
  W.layouts[city.id] = L;
  return L;
}
function pickColor(arch, rng) {
  const P = {
    glass: ['#8fb3d1', '#6f97ba', '#a9c3d6', '#5b7f9e', '#7fa0b8', '#9ab8c9', '#4f6d88'],
    office: ['#d9d4c7', '#c9ced6', '#e6dccb', '#b9c2cc', '#d6c8b4', '#ece6da'],
    apartment: ['#c96f5a', '#d8b39a', '#e9d8c4', '#b9806a', '#d4c3b0', '#a8644f', '#e7ddd0'],
    rowhouse: ['#f2c6b6', '#c8dbe8', '#f6e2a9', '#d5e8cf', '#e8cfe0', '#f1d9c4', '#c9d3ee', '#fbe7d0'],
    house: ['#f4ead8', '#dfe8ee', '#f2dcd0', '#e4ecd6', '#efe2c8', '#d9dfe9'],
    shop: ['#f0e4d0', '#e3d2bd', '#d7e1e6', '#efd9c9', '#e8e2d2'],
    warehouse: ['#b8a58f', '#a99886', '#c7b9a6', '#9fa7ad'],
  };
  const a = P[arch]; return a[Math.floor(rng() * a.length)];
}
