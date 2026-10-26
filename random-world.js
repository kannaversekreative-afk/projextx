'use strict';
// True Random World — a fully generated world, not a shuffled Earth.
// Generates, from one seed: a random landmass (blob continents on a
// 5-degree grid), random countries grown contiguously over that land,
// their neighbours from shared borders, capitals + cities, random
// populations and GDPs, and a matching 1-degree water mask — in the
// exact shape buildWorld() already understands (see world.js), so the
// map, sea routing, facilities, airport, wars and businesses all run
// on the generated world unchanged. Re-running with the same seed
// produces the same world, which is how a saved Random World reloads.
// Honest limits: countries are blocky 5-degree shapes (their outlines
// are traced cell edges, not smooth coastlines); generated countries
// have no real flags, so they show the white flag; there are ~30
// generated countries, not 196, because a generated world does not
// need Earth's country count to play the same game.

var RW_COLS = 72, RW_ROWS = 28, RW_STEP = 5, RW_LAT_TOP = 80;
var RW_ROOTS = ['Aldor', 'Bren', 'Cal', 'Dor', 'Elen', 'Fal', 'Gor', 'Hal', 'Ivor', 'Jal', 'Kor', 'Lun', 'Mor', 'Nor', 'Orel', 'Pel', 'Quen', 'Rav', 'Sel', 'Tor', 'Ulm', 'Vel', 'Wen', 'Xan', 'Yor', 'Zel', 'Andor', 'Bel', 'Carn', 'Dren', 'Est', 'Fen', 'Gald', 'Hest', 'Ith', 'Kael', 'Lor', 'Mith', 'Nal', 'Ost', 'Pell', 'Rhon', 'Sar', 'Thal', 'Val', 'Wyst', 'Zor'];
var RW_TAILS = ['ia', 'or', 'an', 'esh', 'ara', 'is', 'on', 'eth', 'uria', 'ak'];

function rwGauss(rng) { return (rng() + rng() + rng() + rng() - 2) / 2; } // approx normal, mean 0
function rwCellLon(c) { return -180 + c * RW_STEP; }
function rwCellLat(r) { return RW_LAT_TOP - r * RW_STEP; }
function rwCellCentre(c, r) { return { lon: rwCellLon(c) + RW_STEP / 2, lat: rwCellLat(r) - RW_STEP / 2 }; }

// Trace the outline of one region (set of "c,r" keys) as closed rings
// of corner points. Each boundary edge is oriented consistently, so
// chaining edges by start point always closes a loop.
function rwTraceRings(cells) {
  const set = new Set(cells);
  const edges = new Map(); // "x,y" -> [{x2,y2}]
  const add = (x1, y1, x2, y2) => {
    const k = x1 + ',' + y1;
    if (!edges.has(k)) edges.set(k, []);
    edges.get(k).push({ x: x2, y: y2 });
  };
  cells.forEach(key => {
    const [c, r] = key.split(',').map(Number);
    const lon = rwCellLon(c), lat = rwCellLat(r);
    if (!set.has(c + ',' + (r - 1))) add(lon, lat, lon + RW_STEP, lat); // north
    if (!set.has(c + ',' + (r + 1))) add(lon + RW_STEP, lat - RW_STEP, lon, lat - RW_STEP); // south
    if (!set.has((c - 1) + ',' + r)) add(lon, lat - RW_STEP, lon, lat); // west
    if (!set.has((c + 1) + ',' + r)) add(lon + RW_STEP, lat, lon + RW_STEP, lat - RW_STEP); // east
  });
  const used = new Set();
  const rings = [];
  edges.forEach((list, startKey) => {
    list.forEach((e, ei) => {
      const id = startKey + '>' + ei;
      if (used.has(id)) return;
      const ring = [];
      let cur = startKey, curEdge = e, curId = id, guard = 0;
      while (curEdge && guard++ < 10000) {
        used.add(curId);
        const [x, y] = cur.split(',').map(Number);
        ring.push([x, y]);
        const nextKey = curEdge.x + ',' + curEdge.y;
        if (nextKey === startKey) break;
        const nextList = edges.get(nextKey) || [];
        let found = null, foundId = null;
        nextList.forEach((ne, ni) => { const nid = nextKey + '>' + ni; if (!found && !used.has(nid)) { found = ne; foundId = nid; } });
        if (!found) break;
        cur = nextKey; curEdge = found; curId = foundId;
      }
      if (ring.length >= 4) rings.push(ring);
    });
  });
  return rings;
}

function generateRandomWorldData(seed) {
  const rng = mulberry(seed >>> 0);
  const COLS = RW_COLS, ROWS = RW_ROWS;
  const key = (c, r) => c + ',' + r;
  const inGrid = (c, r) => c >= 1 && c < COLS - 1 && r >= 0 && r < ROWS;
  // --- landmass: blob scores, top ~30% of cells become land ---
  const nBlobs = 11 + Math.floor(rng() * 4);
  const blobs = [];
  for (let i = 0; i < nBlobs; i++) blobs.push({ c: 4 + Math.floor(rng() * (COLS - 8)), r: 2 + Math.floor(rng() * (ROWS - 4)), s: 3.5 + rng() * 4 });
  const scores = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (!inGrid(c, r)) continue;
    let s = 0;
    blobs.forEach(b => { const dx = c - b.c, dy = (r - b.r) * 1.2; s += Math.exp(-(dx * dx + dy * dy) / (2 * b.s * b.s)); });
    scores.push({ c, r, s: s + rng() * 0.25 });
  }
  scores.sort((a, b) => b.s - a.s);
  const land = new Set(scores.slice(0, Math.floor(scores.length * 0.30)).map(x => key(x.c, x.r)));
  // Drop tiny islands (< 5 cells) into the sea.
  const seen = new Set();
  land.forEach(k => {
    if (seen.has(k)) return;
    const comp = [], stack = [k]; seen.add(k);
    while (stack.length) {
      const cur = stack.pop(); comp.push(cur);
      const [c, r] = cur.split(',').map(Number);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => { const nk = key(c + dc, r + dr); if (land.has(nk) && !seen.has(nk)) { seen.add(nk); stack.push(nk); } });
    }
    if (comp.length < 5) comp.forEach(x => land.delete(x));
  });
  // Continents = connected land components (for the cont field).
  const contOf = new Map(); let contN = 0;
  const seen2 = new Set();
  land.forEach(k => {
    if (seen2.has(k)) return;
    const comp = [], stack = [k]; seen2.add(k);
    while (stack.length) {
      const cur = stack.pop(); comp.push(cur);
      const [c, r] = cur.split(',').map(Number);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => { const nk = key(c + dc, r + dr); if (land.has(nk) && !seen2.has(nk)) { seen2.add(nk); stack.push(nk); } });
    }
    const name = RW_ROOTS[Math.floor(rng() * RW_ROOTS.length)] + RW_TAILS[Math.floor(rng() * RW_TAILS.length)];
    comp.forEach(x => contOf.set(x, name));
    contN++;
  });
  // --- countries: seeds spaced apart, then frontier growth ---
  const landArr = [...land];
  const shuffled = landArr.slice().sort(() => rng() - 0.5);
  const seeds = [];
  shuffled.forEach(k => {
    if (seeds.length >= 32) return;
    const [c, r] = k.split(',').map(Number);
    const ok = seeds.every(s => { const dx = Math.abs(c - s.c), dy = Math.abs(r - s.r); return Math.max(dx, dy) >= 5; });
    if (ok) seeds.push({ c, r, key: k });
  });
  const owner = new Map();
  seeds.forEach((s, i) => owner.set(s.key, i));
  let frontier = [...owner.keys()];
  while (frontier.length) {
    const next = [];
    frontier.forEach(k => {
      const [c, r] = k.split(',').map(Number);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => {
        const nk = key(c + dc, r + dr);
        if (land.has(nk) && !owner.has(nk)) { owner.set(nk, owner.get(k)); next.push(nk); }
      });
    });
    frontier = next;
  }
  // Any land left unassigned (shouldn't happen on one grid) joins a neighbour.
  land.forEach(k => {
    if (owner.has(k)) return;
    const [c, r] = k.split(',').map(Number);
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nk = key(c + dc, r + dr); if (owner.has(nk)) { owner.set(k, owner.get(nk)); break; } }
  });
  // Merge countries smaller than 4 cells into their biggest neighbour.
  let countryCells = seeds.map(() => []);
  owner.forEach((ci, k) => { if (countryCells[ci]) countryCells[ci].push(k); });
  let changed = true;
  while (changed) {
    changed = false;
    countryCells.forEach((cells, ci) => {
      if (!cells || cells.length >= 4) return;
      const nbCount = new Map();
      cells.forEach(k => {
        const [c, r] = k.split(',').map(Number);
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => { const nk = key(c + dc, r + dr); if (owner.has(nk) && owner.get(nk) !== ci) nbCount.set(owner.get(nk), (nbCount.get(owner.get(nk)) || 0) + 1); });
      });
      if (!nbCount.size) return;
      const best = [...nbCount.entries()].sort((a, b) => b[1] - a[1])[0][0];
      cells.forEach(k => owner.set(k, best));
      countryCells[ci] = []; changed = true;
    });
    countryCells = [];
    owner.forEach((ci, k) => { if (!countryCells[ci]) countryCells[ci] = []; countryCells[ci].push(k); });
  }
  const countriesIdx = countryCells.map((cells, i) => ({ i, cells })).filter(x => x.cells && x.cells.length);
  // --- neighbours ---
  const nbSets = countriesIdx.map(() => new Set());
  owner.forEach((ci, k) => {
    const [c, r] = k.split(',').map(Number);
    [[1, 0], [-1, 0]].forEach(([dc, dr]) => { const nk = key(c + dc, r + dr); if (owner.has(nk) && owner.get(nk) !== ci) { nbSets[ci].add(owner.get(nk)); nbSets[owner.get(nk)].add(ci); } });
  });
  // --- country + city records ---
  const usedRoots = new Set();
  const pickRoot = () => { let root = RW_ROOTS[Math.floor(rng() * RW_ROOTS.length)]; let tries = 0; while (usedRoots.has(root) && tries++ < 20) root = RW_ROOTS[Math.floor(rng() * RW_ROOTS.length)]; usedRoots.add(root); return root; };
  const patterns = ['Republic of %s', 'United %s', '%s Federation', 'Kingdom of %s', '%s', 'Free State of %s'];
  const countries = [], cities = [];
  countriesIdx.forEach((entry, pos) => {
    const ci = entry.i, cells = entry.cells;
    const a3 = 'R' + String(pos + 1).padStart(2, '0');
    const root = pickRoot();
    const name = patterns[Math.floor(rng() * patterns.length)].replace('%s', root);
    let sx = 0, sy = 0;
    cells.forEach(k => { const [c, r] = k.split(',').map(Number); const cen = rwCellCentre(c, r); sx += cen.lon; sy += cen.lat; });
    const lx = sx / cells.length, ly = sy / cells.length;
    const pop = Math.max(200000, Math.round(Math.exp(Math.log(3000000) + rwGauss(rng) * 1.2)));
    const gdpPc = Math.max(2000, Math.round(Math.exp(Math.log(12000) + rwGauss(rng) * 0.9)));
    const gdp = Math.max(30, Math.round(pop * gdpPc / 1e6));
    const cont = contOf.get(cells[0]) || 'Mainland';
    const rings = rwTraceRings(cells).map(ring => {
      const out = [];
      ring.forEach((pt, i) => {
        if (i === 0) out.push(Math.round(pt[0] * 20), Math.round(pt[1] * 20));
        else { const prev = ring[i - 1]; out.push(Math.round((pt[0] - prev[0]) * 20), Math.round((pt[1] - prev[1]) * 20)); }
      });
      return out;
    });
    countries.push({ a3, a2: '', name, sub: cont, cont, pop, gdp, nb: [...nbSets[ci]].map(n => 'R' + String(countriesIdx.findIndex(e => e.i === n) + 1).padStart(2, '0')), rings, lx, ly, un: true });
    // Extra cities first, capital LAST: buildWorld sets a country's
    // capital to the last city listed for it.
    const seedCell = seeds[ci];
    const others = cells.filter(k => k !== seedCell.key).sort(() => rng() - 0.5).slice(0, 2);
    others.forEach((k, j) => {
      const [c, r] = k.split(',').map(Number); const cen = rwCellCentre(c, r);
      const coastal = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dc, dr]) => !land.has(key(c + dc, r + dr)));
      cities.push({ n: root + ' City ' + (j + 1), code: 'CT' + (j + 1), c: a3, lat: cen.lat, lon: cen.lon, pop: Math.max(50000, Math.round(pop * (0.02 + rng() * 0.06))), port: coastal ? 1 : 0 });
    });
    const capCen = rwCellCentre(seedCell.c, seedCell.r);
    const capCoastal = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dc, dr]) => !land.has(key(seedCell.c + dc, seedCell.r + dr)));
    cities.push({ n: root + ' Capital', code: 'CAP', c: a3, lat: capCen.lat, lon: capCen.lon, pop: Math.max(100000, Math.round(pop * 0.25)), port: capCoastal ? 1 : 0 });
  });
  // --- 1-degree water mask (water = not land), base64 bit-packed ---
  const W1 = 360, H1 = 180, bytes = new Uint8Array(Math.ceil(W1 * H1 / 8));
  for (let Y = 0; Y < H1; Y++) for (let X = 0; X < W1; X++) {
    const lon = -180 + X, lat = 90 - Y;
    const c = Math.floor((lon + 180) / RW_STEP), r = Math.floor((RW_LAT_TOP - lat) / RW_STEP);
    const isLand = land.has(key(c, r));
    if (!isLand) { const i = Y * W1 + X; bytes[i >> 3] |= (1 << (i & 7)); }
  }
  let bin = '';
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode.apply(null, bytes.slice(i, i + CHUNK));
  const b64 = (typeof btoa === 'function') ? btoa(bin) : Buffer.from(bytes).toString('base64');
  return { seed, water: { w: W1, h: H1, b64 }, countries, cities, meta: { landCells: land.size, continents: contN, countryCount: countries.length } };
}

function buildRandomWorld(seed) {
  const data = generateRandomWorldData(seed);
  const W2 = buildWorld(data);
  W2.randomSeed = seed; W2.isRandom = true; W2.randomMeta = data.meta;
  return W2;
}

// The real Earth world, remembered on first switch so Random World can
// be left cleanly and a later World game is real Earth again.
var W_REAL = null;
function switchWorldToRandom(seed) {
  if (!W_REAL && typeof W !== 'undefined' && W) W_REAL = W;
  W = buildRandomWorld(seed);
  if (typeof clearFacilityCaches === 'function') clearFacilityCaches();
  return W;
}
function switchWorldToReal() {
  if (W_REAL) { W = W_REAL; if (typeof clearFacilityCaches === 'function') clearFacilityCaches(); }
  return W;
}
