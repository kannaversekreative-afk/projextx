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
  const COL = { sea: '#eaf2ff', sea2: '#eaf2ff', land: '#ffffff', home: '#dbeafe', border: 'rgba(47,124,246,0.35)', grid: 'rgba(47,124,246,0.08)' };
  // View hierarchy (not game modes): world -> country -> region.
  // The world shows countries only: no region borders, no gold dots.
  // Tapping a country goes to that country alone, sectioned by its
  // real regions: the USA by its 50 states, every other country by
  // its own first-level regions (WORLD_REGIONS, converted from
  // Natural Earth admin-1). Tapping a region goes to that region
  // alone on its own map — the USA's regions open as 5-state cluster
  // maps, other countries' regions open alone. Dots (gold capitals,
  // city dots) show only on the world map — no dots on any other
  // map (2026-10-28).
  // Regions are NAMED shapes — never matched by bbox or signature,
  // so no wrong region can slip in (Connecticut's ring once did, as
  // "Long Island", because its box fits inside New York's).
  let viewKind = 'world'; // 'world' | 'country' | 'region' | 'cluster' | 'regionMap'
  let viewA3 = null;      // country in country/region views
  let viewRegion = null;  // state name in region views
  let viewRegionName = null; // world-region name in regionMap views
  const stateEntry = name => (typeof US_STATE_RINGS !== 'undefined' ? US_STATE_RINGS.find(s => s.name === name) : null);
  const regionRings = name => { const st = stateEntry(name); return st ? st.rings : []; };
  const regionBox = name => {
    const st = stateEntry(name); if (!st) return null;
    const [x0, y0, x1, y1] = st.box;
    if (x1 - x0 <= 300) return st.box;
    // Antimeridian wrap pieces (Alaska's far-west islands sit near
    // x=2000): frame the largest ring instead of the whole world.
    let big = st.rings[0];
    st.rings.forEach(r => { if (r.length > big.length) big = r; });
    let bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9;
    big.forEach(p => { bx0 = Math.min(bx0, p[0]); bx1 = Math.max(bx1, p[0]); by0 = Math.min(by0, p[1]); by1 = Math.max(by1, p[1]); });
    return [bx0, by0, bx1, by1];
  };
  // Cluster maps: each is a SEPARATE map with its own states only.
  // None is a view of the world map: each has its own shapes, its own
  // bounds, and its own screen. Nothing from the world leaks into it.
  const CLUSTER_MAPS = [
    ['New York', 'Vermont', 'New Hampshire', 'Maine', 'Massachusetts'],
    ['Pennsylvania', 'New Jersey', 'Connecticut', 'Rhode Island', 'Delaware'],
    ['Maryland', 'Virginia', 'West Virginia', 'Ohio', 'Kentucky'],
    ['North Carolina', 'Tennessee', 'South Carolina', 'Georgia', 'Florida'],
    ['Alabama', 'Mississippi', 'Louisiana', 'Arkansas', 'Missouri'],
    ['Michigan', 'Indiana', 'Illinois', 'Wisconsin', 'Minnesota'],
    ['Iowa', 'Kansas', 'Nebraska', 'South Dakota', 'North Dakota'],
    ['Oklahoma', 'Texas', 'New Mexico', 'Colorado', 'Wyoming'],
    ['Montana', 'Idaho', 'Utah', 'Arizona', 'Nevada'],
    ['California', 'Oregon', 'Washington', 'Alaska', 'Hawaii']
  ];
  let viewCluster = 0;
  const clusterStates = () => CLUSTER_MAPS[viewCluster] || CLUSTER_MAPS[0];
  const clusterRings = () => {
    const rings = [];
    clusterStates().forEach(name => regionRings(name).forEach(r => rings.push(r)));
    return rings;
  };
  // A state that wraps the map edge (Alaska) has a full box spanning
  // nearly the whole map; for framing, use its largest ring instead,
  // the same way a single-state view does. Narrow states are unaffected.
  const stateBox = name => {
    const st = stateEntry(name);
    if (!st) return null;
    const b = st.box;
    if (b[2] - b[0] <= 300) return b;
    let best = null, bestA = -1;
    st.rings.forEach(ring => {
      let rx0 = 1e9, ry0 = 1e9, rx1 = -1e9, ry1 = -1e9;
      ring.forEach(p => { rx0 = Math.min(rx0, p[0]); ry0 = Math.min(ry0, p[1]); rx1 = Math.max(rx1, p[0]); ry1 = Math.max(ry1, p[1]); });
      const a = (rx1 - rx0) * (ry1 - ry0);
      if (a > bestA) { bestA = a; best = [rx0, ry0, rx1, ry1]; }
    });
    return best || b;
  };
  const clusterBox = () => {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, found = false;
    clusterStates().forEach(name => { const b = stateBox(name); if (!b) return; found = true; x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]); x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]); });
    return found ? [x0, y0, x1, y1] : null;
  };
  const clusterForState = name => CLUSTER_MAPS.findIndex(list => list.includes(name));
  const isClusterState = name => clusterForState(name) >= 0;
  // World regions: every non-USA country's real first-level regions
  // (WORLD_REGIONS, converted from Natural Earth admin-1). The USA
  // is excluded — it keeps its 5-state cluster maps.
  const worldRegionsFor = a3 => (typeof WORLD_REGIONS !== 'undefined' ? WORLD_REGIONS.filter(r => r.a3 === a3) : []);
  const worldRegionEntry = (a3, name) => worldRegionsFor(a3).find(r => r.name === name) || null;
  const worldRegionBox = (a3, name) => {
    const e = worldRegionEntry(a3, name); if (!e) return null;
    const b = e.box;
    if (b[2] - b[0] <= 300) return b;
    // Antimeridian wrap (a region crossing 180°): frame its largest
    // ring instead of the whole world.
    let best = null, bestA = -1;
    e.rings.forEach(ring => {
      let rx0 = 1e9, ry0 = 1e9, rx1 = -1e9, ry1 = -1e9;
      ring.forEach(p => { rx0 = Math.min(rx0, p[0]); ry0 = Math.min(ry0, p[1]); rx1 = Math.max(rx1, p[0]); ry1 = Math.max(ry1, p[1]); });
      const a = (rx1 - rx0) * (ry1 - ry0);
      if (a > bestA) { bestA = a; best = [rx0, ry0, rx1, ry1]; }
    });
    return best || b;
  };
  const worldRegionPathsCache = {};
  const worldRegionPaths = (a3, name) => {
    const key = a3 + '|' + name;
    if (!worldRegionPathsCache[key]) {
      const e = worldRegionEntry(a3, name);
      worldRegionPathsCache[key] = e ? e.rings.map(ring => { const p = new Path2D(); ring.forEach((pt, i) => { if (i === 0) p.moveTo(pt[0], pt[1]); else p.lineTo(pt[0], pt[1]); }); p.closePath(); return p; }) : [];
    }
    return worldRegionPathsCache[key];
  };
  const worldRegionAt = (a3, mx, my) => {
    for (const r of worldRegionsFor(a3)) { if (worldRegionPaths(a3, r.name).some(p => hit.isPointInPath(p, mx, my))) return r.name; }
    return null;
  };
  const regionPathsCache = {};
  const regionPaths = name => {
    if (!regionPathsCache[name]) regionPathsCache[name] = regionRings(name).map(ring => { const p = new Path2D(); ring.forEach((pt, i) => { if (i === 0) p.moveTo(pt[0], pt[1]); else p.lineTo(pt[0], pt[1]); }); p.closePath(); return p; });
    return regionPathsCache[name];
  };
  const pointInRegion = (name, mx, my) => regionPaths(name).some(p => hit.isPointInPath(p, mx, my));
  const regionAt = (mx, my) => {
    if (viewA3 === 'USA') {
      if (typeof US_STATE_RINGS === 'undefined') return null;
      for (const st of US_STATE_RINGS) { if (pointInRegion(st.name, mx, my)) return st.name; }
      return null;
    }
    return worldRegionAt(viewA3, mx, my);
  };
  const frameBox = box => {
    const [x0, y0, x1, y1] = box;
    const w = Math.max(8, x1 - x0), h = Math.max(8, y1 - y0);
    anim = null; v.s = Math.min(vw / w, vh / h);
    v.x = vw / 2 - (x0 + x1) / 2 * v.s; v.y = vh / 2 - (y0 + y1) / 2 * v.s;
    clampView(); dirty = true;
  };
  const resetView = () => { viewKind = 'world'; viewA3 = null; viewRegion = null; viewRegionName = null; };
  const enterCountry = a3 => {
    viewKind = 'country'; viewA3 = a3; viewRegion = null; viewRegionName = null;
    if (a3 === 'USA' && typeof US_STATE_RINGS !== 'undefined') {
      // Frame the 48 contiguous states (Alaska/Hawaii draw when panned to).
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      US_STATE_RINGS.forEach(st => { if (st.name === 'Alaska' || st.name === 'Hawaii') return; const b = st.box; x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]); x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]); });
      frameBox([x0, y0, x1, y1]);
    } else if (typeof WORLD_REGIONS !== 'undefined' && WORLD_REGIONS.some(r => r.a3 === a3)) {
      // Sectioned country: frame its regions. A world-spanning set
      // (France's overseas regions, the Dutch Caribbean) would shrink
      // the mainland to a speck, so frame the largest single ring
      // (the mainland) instead; overseas stays reachable by panning.
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      let best = null, bestA = -1;
      WORLD_REGIONS.forEach(r => {
        if (r.a3 !== a3) return;
        const b = r.box; x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]); x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]);
        r.rings.forEach(g => {
          let gx0 = 1e9, gy0 = 1e9, gx1 = -1e9, gy1 = -1e9;
          g.forEach(p => { gx0 = Math.min(gx0, p[0]); gy0 = Math.min(gy0, p[1]); gx1 = Math.max(gx1, p[0]); gy1 = Math.max(gy1, p[1]); });
          const a = (gx1 - gx0) * (gy1 - gy0);
          if (a > bestA) { bestA = a; best = [gx0, gy0, gx1, gy1]; }
        });
      });
      if (Math.max(x1 - x0, y1 - y0) > 400 && best) frameBox(best);
      else frameBox([x0, y0, x1, y1]);
    } else {
      const k = W.byA3[a3];
      if (k && k.hasShape) frameBox(k.box); else fit();
    }
  };
  const S_ = () => (typeof S !== 'undefined' && S ? S : null);

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1); vw = wrap.clientWidth; vh = wrap.clientHeight;
    [base, top].forEach(c => { c.width = vw * dpr; c.height = vh * dpr; c.style.width = vw + 'px'; c.style.height = vh + 'px'; });
    if (v.s < Math.max(vw / MAP_W, vh / MAP_H)) fit();
    clampView(); dirty = true;
  }
  function fit() { v.s = Math.max(vw / MAP_W, vh / MAP_H); v.x = (vw - MAP_W * v.s) / 2; v.y = (vh - MAP_H * v.s) / 2; }
  function clampView() {
    // Cluster map is its own map: zoom stops at the 5 states filling
    // the screen, and panning keeps them on screen. The world is not
    // behind this map, so you can never zoom or pan out to it.
    if (viewKind === 'cluster') {
      const box = clusterBox();
      if (box) {
        const [x0, y0, x1, y1] = box;
        const w = Math.max(8, x1 - x0), h = Math.max(8, y1 - y0);
        v.s = Math.max(Math.min(vw / w, vh / h), Math.min(60, v.s));
        v.x = Math.min(vw / 2 - x0 * v.s, Math.max(vw / 2 - x1 * v.s, v.x));
        v.y = Math.min(vh / 2 - y0 * v.s, Math.max(vh / 2 - y1 * v.s, v.y));
        return;
      }
    }
    // RegionMap view is its own map: zoom stops at the region filling
    // the screen, and panning keeps the region on screen, so you can
    // never zoom or pan out into the world behind it.
    if (viewKind === 'regionMap') {
      const box = worldRegionBox(viewA3, viewRegionName);
      if (box) {
        const [x0, y0, x1, y1] = box;
        const w = Math.max(8, x1 - x0), h = Math.max(8, y1 - y0);
        v.s = Math.max(Math.min(vw / w, vh / h), Math.min(60, v.s));
        v.x = Math.min(vw / 2 - x0 * v.s, Math.max(vw / 2 - x1 * v.s, v.x));
        v.y = Math.min(vh / 2 - y0 * v.s, Math.max(vh / 2 - y1 * v.s, v.y));
        return;
      }
    }
    // Region view is its own map: zoom stops at the region filling the
    // screen, and panning keeps the region on screen, so you can never
    // zoom or pan out into the world behind it.
    if (viewKind === 'region') {
      const box = regionBox(viewRegion);
      if (box) {
        const [x0, y0, x1, y1] = box;
        const w = Math.max(8, x1 - x0), h = Math.max(8, y1 - y0);
        v.s = Math.max(Math.min(vw / w, vh / h), Math.min(60, v.s));
        v.x = Math.min(vw / 2 - x0 * v.s, Math.max(vw / 2 - x1 * v.s, v.x));
        v.y = Math.min(vh / 2 - y0 * v.s, Math.max(vh / 2 - y1 * v.s, v.y));
        return;
      }
    }
    v.s = Math.max(Math.max(vw / MAP_W, vh / MAP_H) * 0.98, Math.min(60, v.s));
    // Allow half a screen of sea beyond the map edge, so a western capital
    // like Washington can actually be centred: the old 0 cap forced
    // v.x to 0 and left the Atlantic in the centre at world zoom.
    v.x = Math.min(vw / 2, Math.max(vw - MAP_W * v.s - vw / 2, v.x)); v.y = Math.min(vh / 2, Math.max(vh - MAP_H * v.s - vh / 2, v.y));
  }
  const toScreen = (x, y) => [x * v.s + v.x, y * v.s + v.y];
  const toMap = (sx, sy) => [(sx - v.x) / v.s, (sy - v.y) / v.s];

  function drawBase() {
    const c = bctx, st = S_(); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = c.createLinearGradient(0, 0, 0, vh); g.addColorStop(0, COL.sea); g.addColorStop(1, COL.sea2);
    c.fillStyle = g; c.fillRect(0, 0, vw, vh);
    c.setTransform(dpr * v.s, 0, 0, dpr * v.s, dpr * v.x, dpr * v.y);
    // Cluster map: ONLY these 5 states, on their own map. Not the
    // world map with things hidden — this screen draws nothing else.
    if (viewKind === 'cluster') {
      c.fillStyle = COL.land; c.strokeStyle = COL.border; c.lineWidth = 0.8 / v.s; c.lineJoin = 'round';
      clusterRings().forEach(ring => { c.beginPath(); ring.forEach((p, i) => { if (i === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }); c.closePath(); c.fill(); c.stroke(); });
      return;
    }
    // RegionMap view: only that world region's shape, alone on the
    // sea. No dots — region capitals are not in the data yet.
    if (viewKind === 'regionMap') {
      c.fillStyle = COL.land; c.strokeStyle = COL.border; c.lineWidth = 0.8 / v.s; c.lineJoin = 'round';
      const e = worldRegionEntry(viewA3, viewRegionName);
      if (e) e.rings.forEach(ring => { c.beginPath(); ring.forEach((p, i) => { if (i === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }); c.closePath(); c.fill(); c.stroke(); });
      return;
    }
    // Region view: only that region's shape, alone on the sea.
    if (viewKind === 'region') {
      c.fillStyle = COL.land; c.strokeStyle = COL.border; c.lineWidth = 0.8 / v.s; c.lineJoin = 'round';
      regionRings(viewRegion).forEach(ring => { c.beginPath(); ring.forEach((p, i) => { if (i === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }); c.closePath(); c.fill(); c.stroke(); });
      return;
    }
    // Country view: the country alone, sectioned by its real regions.
    // The USA is its 50 state rings; other countries are their own
    // first-level regions (WORLD_REGIONS). Countries with no region
    // data (Palestine, South Sudan, Vatican) keep their single shape.
    if (viewKind === 'country') {
      c.fillStyle = COL.land; c.strokeStyle = COL.border; c.lineWidth = 0.8 / v.s; c.lineJoin = 'round';
      if (viewA3 === 'USA' && typeof US_STATE_RINGS !== 'undefined') {
        US_STATE_RINGS.forEach(st => st.rings.forEach(ring => { c.beginPath(); ring.forEach((p, i) => { if (i === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }); c.closePath(); c.fill(); c.stroke(); }));
      } else {
        const wregs = worldRegionsFor(viewA3);
        if (wregs.length) {
          wregs.forEach(rg => rg.rings.forEach(ring => { c.beginPath(); ring.forEach((p, i) => { if (i === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }); c.closePath(); c.fill(); c.stroke(); }));
        } else {
          const k = W.byA3[viewA3];
          if (k && k.hasShape) { c.fill(k.path); c.stroke(k.path); }
        }
      }
      return;
    }
    const [x0, y0] = toMap(0, 0), [x1, y1] = toMap(vw, vh);
    const vis = k => k.hasShape && !(k.box[2] < x0 || k.box[0] > x1 || k.box[3] < y0 || k.box[1] > y1);
    W.countries.forEach(k => {
      if (!vis(k)) return;
      let fill = k.playable ? COL.land : '#e6eefb';
      if (st && k.a3 === st.home && k.a3 !== 'USA') fill = COL.home;
      if (pickMode && k.playable) fill = k.a3 === hoverCountry ? '#2f7cf6' : '#eaf2ff';
      c.fillStyle = fill; c.fill(k.path);
      const cs = st && st.countries[k.a3];
      if (cs && !pickMode) {
        if (cs.occ === st.home && k.a3 !== 'USA') { c.fillStyle = 'rgba(47,124,246,0.35)'; c.fill(k.path); }
        else if (cs.war || cs.occ) { c.fillStyle = cs.occ ? 'rgba(229,72,77,0.28)' : 'rgba(229,72,77,0.18)'; c.fill(k.path); }
        else if (cs.boom > st.day) { c.fillStyle = 'rgba(18,161,80,0.14)'; c.fill(k.path); }
      }
    });
    c.strokeStyle = COL.border; c.lineWidth = 0.8 / v.s; c.lineJoin = 'round';
    W.countries.forEach(k => { if (vis(k)) c.stroke(k.path); });
    if (st && !pickMode) { c.strokeStyle = '#2f7cf6'; c.lineWidth = 1.4 / v.s; const h = W.byA3[st.home]; if (h.hasShape) c.stroke(h.path); }
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
    // Cargo boats use civilian ports only — never a military port.
    portCells = W.playable.filter(k => k.coastal).map(k => { const f = facilitiesFor(k.a3); return f ? f.portCell : null; }).filter(x => x != null);
    // Group ports by water basin so a boat only ever rolls destinations it
    // can actually sail to. Basin -1 is the fallback (no basin data): all ports.
    portByBasin = new Map();
    for (const cell of portCells) { const b = basinOf(cell); if (!portByBasin.has(b)) portByBasin.set(b, []); portByBasin.get(b).push(cell); }
    for (const a3 in st.co) {
      const c = st.co[a3], F = SECTORS[c.sector].fleet; if (!F) continue;
      const home = W.cities[c.city], r = mulberry(hashStr(a3 + st.seed));
      if (F.kind === 'plane') units.push({ type: 'plane', a3, from: home, to: dests[Math.floor(r() * dests.length)], t: r(), dir: 1, r, dests });
      else { const fac = facilitiesFor(a3); const start = (fac && fac.portCell != null) ? fac.portCell : nearestWater(W, home.lon, home.lat); units.push({ type: F.kind, a3, start, basin: basinOf(start), dest: null, pts: null, t: 0, dir: 1, r, shortRetries: 0 }); }
    }
    // One personal yacht for the player's home nation. It sails port to
    // port like a cargo boat but carries people, not freight, and has no
    // effect on the economy — it is just there to watch and follow.
    if (st.home) {
      const hc = W.cities[st.co[st.home].city], hfac = facilitiesFor(st.home), start = (hfac && hfac.portCell != null) ? hfac.portCell : nearestWater(W, hc.lon, hc.lat);
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
    // Tiny-basin chaining: if every route here is short, a boat that
    // just hops start -> to -> start reads as sitting and flashing
    // between two spots. So sail two legs as ONE voyage (start -> to
    // -> next port) whenever the second leg is already cached. The
    // boat then crosses its whole basin instead of shuttling between
    // two neighbouring ports, and on arrival it starts from the far
    // port as usual. Only chains cached legs — an uncached second leg
    // is picked up on a later voyage once pumpRoutes has computed it.
    if (len < 150) {
      const list = (portByBasin && portByBasin.get(u.basin)) || [];
      let best = null, bd = -1;
      const tx = to % W.ww, ty = (to / W.ww) | 0;
      for (const c of list) {
        if (c === to || c === u.start) continue;
        const leg = seaCache[to + '>' + c];
        if (!leg || leg.length < 2) continue;
        const d = Math.hypot(c % W.ww - tx, ((c / W.ww) | 0) - ty);
        if (d > bd) { bd = d; best = c; }
      }
      if (best != null) {
        u.pts = p.concat(seaCache[to + '>' + best].slice(1)); u.dest = best; u.waiting = false; u.shortRetries = 0;
        u.len = pathLen(u.pts); u.t = 0; u.dir = 1;
        return;
      }
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
  let lastPopSave = 0;
  let lastCashHud = 0;
  // Passenger fare: every person who arrives by air pays this
  // into business cash. Routes earn as people fly; a hub growing
  // on its own earns nothing until it is connected. Trade still
  // sells separately at $1 per unit into a hub.
  const AIR_FARE = 50;
  function step(dt) {
    const st = S_(); if (!st) return;
    // Airline citizens: hubs are originators by nature, no toggle.
    // A hub grows (level + 1)/sec constantly, up to capacity level x 20000. An airport grows
    // only when connected to a hub, receiving per hub route the
    // slower of the hub's send and its own receive, both equal to
    // level, so flow is min(hub level, airport level)/sec.
    // Capacity pauses growth, it never deletes people: a site
    // pushed above capacity by a manual move keeps its people
    // (and drags stability) until it is drained or upgraded.
    // Hub-hub routes move cargo only, no passengers, unless the
    // player moves them by hand (see S.moves below). New sites
    // start at 0, level 1.
    if (typeof S !== 'undefined' && S && S.airports) {
      for (const k in S.airports) {
        const a = S.airports[k];
        if (a.type !== 'port' && a.pop === undefined) a.pop = 0;
        if (a.level === undefined) a.level = 1;
        if (a.type === 'hub' && a.pop < a.level * 20000) a.pop = Math.min(a.pop + (a.level + 1) * dt, a.level * 20000);
        if (a.type === 'port') { if (a.trade === undefined) a.trade = 0; a.trade += (a.level + 1) * 100 * dt; }
      }
      if (Array.isArray(S.routes)) {
        for (const r of S.routes) {
          const A = S.airports[r.from], B = S.airports[r.to];
          if (!A || !B) continue;
          const aLv = A.level || 1, bLv = B.level || 1;
          if (A.type === 'hub' && B.type === 'airport') { if (B.pop === undefined) B.pop = 0; if (B.pop < bLv * 20000) { const add = Math.min(Math.min(aLv, bLv) * dt, bLv * 20000 - B.pop); B.pop += add; S.cash = (S.cash || 0) + add * AIR_FARE; } }
          if (B.type === 'hub' && A.type === 'airport') { if (A.pop === undefined) A.pop = 0; if (A.pop < aLv * 20000) { const add = Math.min(Math.min(bLv, aLv) * dt, aLv * 20000 - A.pop); A.pop += add; S.cash = (S.cash || 0) + add * AIR_FARE; } }
        }
      }
      // Percent flows: a route can carry a standing percent of
      // its source's inflow every second (set per route from the
      // source's sheet). The source keeps the rest, so total pop
      // is conserved (flows redirect, they do not duplicate).
      // Stale entries (route gone) are cleaned up here.
      if (S.flowPct) {
        for (const k in S.flowPct) {
          const pct = S.flowPct[k];
          if (!pct) { delete S.flowPct[k]; continue; }
          const sep = k.indexOf('|');
          if (sep < 0) { delete S.flowPct[k]; continue; }
          const from = k.slice(0, sep), to = k.slice(sep + 1);
          const A = S.airports[from], B = S.airports[to];
          if (!A || !B) { delete S.flowPct[k]; continue; }
          if (!(S.routes || []).some(r => (r.from === from && r.to === to) || (r.from === to && r.to === from))) { delete S.flowPct[k]; continue; }
          if ((B.pop || 0) >= (B.level || 1) * 20000) continue;
          let rate = 0;
          if (A.type === 'hub') rate = (A.level || 1) + 1;
          else {
            for (const r of (S.routes || [])) {
              const otherKey = r.from === from ? r.to : (r.to === from ? r.from : null);
              if (!otherKey) continue;
              const other = S.airports[otherKey];
              if (other && other.type === 'hub') rate += Math.min(other.level || 1, A.level || 1);
            }
          }
          const amt = rate * pct * dt;
          if (A.pop === undefined) A.pop = 0;
          if (B.pop === undefined) B.pop = 0;
          A.pop -= amt;
          B.pop += amt;
          S.cash = (S.cash || 0) + amt * AIR_FARE;
        }
      }
      if (Array.isArray(S.moves)) {
        for (let i = S.moves.length - 1; i >= 0; i--) {
          const mp = S.moves[i];
          if (mp.wait > 0) { mp.wait -= dt; continue; }
          mp.t += dt / mp.dur;
          if (mp.t >= 1) {
            const B = S.airports[mp.to];
            if (B) { if (B.pop === undefined) B.pop = 0; B.pop += mp.amount; S.cash = (S.cash || 0) + mp.amount * AIR_FARE; }
            S.moves.splice(i, 1);
            save();
          }
        }
      }
      // Trade moves: same shuttle pattern as people moves. Trade
      // arriving at a hub sells for $1 per unit; trade arriving
      // at a port stockpiles for onward hauling.
      if (Array.isArray(S.tradeMoves)) {
        for (let i = S.tradeMoves.length - 1; i >= 0; i--) {
          const tm = S.tradeMoves[i];
          if (tm.wait > 0) { tm.wait -= dt; continue; }
          tm.t += dt / tm.dur;
          if (tm.t >= 1) {
            const B = S.airports[tm.to];
            if (B) {
              if (B.type === 'hub') S.cash = (S.cash || 0) + tm.amount;
              else if (B.type === 'port') { if (B.trade === undefined) B.trade = 0; B.trade += tm.amount; }
            }
            S.tradeMoves.splice(i, 1);
            save();
          }
        }
      }
      // Overcrowding: a site at capacity (level x 20000) stops growing
      // (capped above) and drags its country's stability down in
      // countryDay. News fires once when a site first fills, not
      // every step, and resets when it drops below capacity.
      for (const k in S.airports) {
        const site = S.airports[k];
        if (!site || site.type === 'port') continue;
        if ((site.pop || 0) >= (site.level || 1) * 20000) {
          if (!site.crowdedNotified && typeof news === 'function') news('World', `Overcrowding at ${site.name}: the site is full, so it stopped growing and stability is dropping. Upgrade it or move people out.`, site.a3);
          site.crowdedNotified = true;
        } else site.crowdedNotified = false;
      }
      if (dt > 0) { const nowMs = Date.now(); if (!lastPopSave || nowMs - lastPopSave > 30000) { lastPopSave = nowMs; save(); } }
      // Keep the cash pill live: passive income (fares, trade)
      // lands in step, but renderHUD only runs on actions, so
      // refresh just the money figure once a second when it moved.
      if (typeof S !== 'undefined' && S) {
        const nowMs = Date.now();
        if (!lastCashHud || nowMs - lastCashHud >= 1000) {
          lastCashHud = nowMs;
          try {
            const pill = document.querySelector('.hud-money span');
            if (pill && typeof fmtMoney === 'function') { const txt = '💰 ' + fmtMoney(S.cash); if (pill.textContent !== txt) pill.textContent = txt; }
          } catch (e) {}
        }
      }
    }
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
    // Carriers removed for now: navy shows as warships until the real
    // carriers land (the old flat-deck-with-planes drawing is gone).
    hull(c, L, B, '#6b7685');
    c.fillStyle = '#9aa4b2'; c.fillRect(-L * 0.4, -B * 0.6, L * 0.6, B * 1.2);
    c.fillStyle = '#cfd5dd'; c.fillRect(-L * 0.25, -B * 0.4, L * 0.25, B * 0.8);
    c.fillStyle = '#4f5866'; c.beginPath(); c.arc(L * 0.5, 0, B * 0.45, 0, 7); c.fill();
  }

  // ---------- dots, labels, overlays ----------
  let labelRects = [];
  // Name pills on the map are the tappable buttons (flag circles are
  // gone): each drawn pill records which city it opens.
  let labelTargets = [];
  function pill(c, x, y, text, style, target) {
    c.font = style.font; const w = c.measureText(text).width + style.px * 2, h = style.h, rx = x - w / 2;
    for (const r of labelRects) if (rx < r[2] && rx + w > r[0] && y < r[3] && y + h > r[1]) return false;
    labelRects.push([rx - 3, y - 3, rx + w + 3, y + h + 3]);
    if (target != null) labelTargets.push([rx - 3, y - 3, rx + w + 3, y + h + 3, target]);
    c.fillStyle = style.bg; c.strokeStyle = style.border; c.lineWidth = 1.5;
    c.beginPath(); c.roundRect(rx, y, w, h, h / 2); c.fill(); if (style.border) c.stroke();
    c.fillStyle = style.fg; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillText(text, x, y + h / 2 + 0.5);
    return true;
  }
  const PILL = { font: '800 13px Nunito, system-ui, sans-serif', bg: 'rgba(255,255,255,0.95)', border: 'rgba(47,124,246,0.6)', fg: '#1f5fd0', px: 11, h: 26 };
  const PILL_SEL = { font: '800 15px Nunito, system-ui, sans-serif', bg: '#2f7cf6', border: 'rgba(255,255,255,0.35)', fg: '#ffffff', px: 14, h: 32 };
  const PILL_MINE = { font: '800 13px Nunito, system-ui, sans-serif', bg: '#2f7cf6', border: '#ffffff', fg: '#ffffff', px: 11, h: 26 };
  function drawSprite(sx, sy, ang, k, fn) { const c = tctx; c.save(); c.translate(sx, sy); c.rotate(ang); c.scale(k, k); fn(c); c.restore(); }
  // Navy patrols: warships used to orbit a point near the capital, and that
  // orbit crossed land half the time — that is the "boats are on land" bug.
  // A warship now sails a real sea path (water cells only, same basin) and
  // turns back at the end, so its centre never leaves the water.
  let navyCache = {};
  function navyPatrol(a3, cap, now) {
    if (!navyCache[a3]) {
      const fac = facilitiesFor(a3); const start = (fac && fac.milPortCell != null) ? fac.milPortCell : (fac && fac.portCell != null ? fac.portCell : nearestWater(W, cap.lon, cap.lat));
      if (start == null) { navyCache[a3] = null; return null; }
      const basin = basinOf(start);
      let dest = null;
      const list = (portByBasin && portByBasin.get(basin)) || [];
      if (list.length) { let best = null, bd = -1; for (const c of list) { const d = Math.hypot(c % W.ww - start % W.ww, ((c / W.ww) | 0) - ((start / W.ww) | 0)); if (d > 8 && d > bd) { bd = d; best = c; } } dest = best; }
      if (dest == null) { navyCache[a3] = null; return null; }
      const p = seaPath(W, start, dest);
      if (!p || p.length < 2) { navyCache[a3] = null; return null; }
      navyCache[a3] = { pts: p, len: pathLen(p) };
    }
    const e = navyCache[a3]; if (!e) return null;
    const cycle = Math.max(20, e.len / 5), tt = ((now / 1000) / cycle) % 2, f = tt < 1 ? tt : 2 - tt;
    const pos = along(e.pts, e.len, f);
    return [pos[0], pos[1], tt < 1 ? pos[2] : pos[2] + Math.PI];
  }
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
    if (v.s > 1.4) Object.keys(st.countries).filter(a => { const cs = st.countries[a]; return cs && cs.milLv; }).sort((a, b) => milPower(b) - milPower(a)).slice(0, 12).forEach(a => { if (a !== st.home) show.push(a); });
    show.forEach((a3, i) => {
      const cs = st.countries[a3], cap = W.cities[W.byA3[a3].capital];
      if (!cs || !cs.milLv || !cap) return;
      // Orbit radii were 9 (fighter) and 7 (warship) map units — smaller
      // than the sprites themselves, so military units spun in place over
      // their own capital. 26/28 map units is wider than any sprite, so
      // the orbit is actually visible as movement.
      // Peacetime fighters removed for now (they were generic orbiters);
      // fighters during a war stay, they are the war-progress visual.
      if (cs.milLv.navy > 0) {
        const pos = navyPatrol(a3, cap, now);
        if (pos) out.push([pos[0], pos[1], pos[2], c => warship(c, cs.milLv.navy), true, { kind: 'warship', a3, level: cs.milLv.navy, key: `mil:${a3}:navy` }]);
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
    // movement is visible relative to their own size. Planes used a
    // near-constant scale too, and at world zoom they dwarfed whole
    // countries — so planes now use the same zoom scale as ships.
    const kShip = Math.min(1.6, Math.max(0.35, 0.65 * Math.sqrt(v.s)));
    const onScreen = (sx, sy) => sx > -30 && sy > -30 && sx < vw + 30 && sy < vh + 30;
    const layerOn = key => !st || !st.mapLayers || st.mapLayers[key] !== false;
    // Bottleneck gap for a site: on hub-airport routes, flow is
    // min(hub level, airport level), so the lower end caps the
    // flow and loses opportunity (the higher end could move more).
    // Returns the worst gap (0 = not bottlenecked). Ports never
    // bottleneck (trade moves are manual, not level-capped).
    const bottleneckGap = (key) => {
      const site = S && S.airports && S.airports[key];
      if (!site || site.type === 'port') return 0;
      let gap = 0;
      (S.routes || []).forEach(r => {
        const otherKey = r.from === key ? r.to : (r.to === key ? r.from : null);
        if (!otherKey) return;
        const other = S.airports[otherKey];
        if (!other) return;
        if (!((site.type === 'hub' && other.type === 'airport') || (site.type === 'airport' && other.type === 'hub'))) return;
        const g = (other.level || 1) - (site.level || 1);
        if (g > gap) gap = g;
      });
      return gap;
    };
    // Dot fill: white unowned, teal port, dark blue airport/hub,
    // yellow for a 1-level bottleneck, red for a gap of 2 or more
    // (losing 2+/sec of flow until upgraded).
    const dotFill = (bought, key) => {
      if (!bought) return '#ffffff';
      const gap = bottleneckGap(key);
      if (gap >= 2) return '#e5484d';
      if (gap === 1) return '#f5b301';
      return bought.type === 'port' ? '#0e7490' : '#2563eb';
    };
    // Airline dots on every map, in the same place: major cities,
    // US state capitals, country capitals, and region dots, all in
    // world coordinates, so a site bought on one map shows at the
    // same spot on every other map that contains it. Only on-screen
    // dots draw (the canvas clips the rest).
    const drawDots = () => {
      if (layerOn('cities')) {
        W.cities.forEach(ct => {
          if (ct.isCapital || !ct.isMajor) return;
          const [sx, sy] = toScreen(ct.x, ct.y); if (sx < -10 || sy < -10 || sx > vw + 10 || sy > vh + 10) return;
          const rr = Math.max(4, Math.min(9, 3 + v.s * 1.5));
          const bought = S && S.airports && S.airports['c' + ct.id];
          c.fillStyle = dotFill(bought, 'c' + ct.id); c.strokeStyle = '#16233f'; c.lineWidth = 2;
          c.beginPath(); c.arc(sx, sy, rr, 0, 7); c.fill(); c.stroke();
        });
      }
      if (typeof US_CAPITALS !== 'undefined') {
        US_CAPITALS.forEach(st => {
          const [sx, sy] = toScreen(st.x, st.y); if (sx < -10 || sy < -10 || sx > vw + 10 || sy > vh + 10) return;
          const rr = Math.max(4, Math.min(9, 3 + v.s * 1.5));
          const bought = S && S.airports && S.airports['us:' + st.s];
          c.fillStyle = dotFill(bought, 'us:' + st.s); c.strokeStyle = '#16233f'; c.lineWidth = 2;
          c.beginPath(); c.arc(sx, sy, rr, 0, 7); c.fill(); c.stroke();
        });
      }
      if (layerOn('cities')) {
        W.cities.forEach(ct => {
          if (!ct.isCapital) return;
          const [sx, sy] = toScreen(ct.x, ct.y); if (sx < -10 || sy < -10 || sx > vw + 10 || sy > vh + 10) return;
          const rr = Math.max(4, Math.min(9, 3 + v.s * 1.5));
          const bought = S && S.airports && S.airports['c' + ct.id];
          c.fillStyle = dotFill(bought, 'c' + ct.id); c.strokeStyle = '#16233f'; c.lineWidth = 2;
          c.beginPath(); c.arc(sx, sy, rr, 0, 7); c.fill(); c.stroke();
        });
      }
      if (layerOn('cities')) {
        regionDots().forEach(d => {
          if (!regionDotVisible(d, v.s)) return;
          const [sx, sy] = toScreen(d.x, d.y); if (sx < -10 || sy < -10 || sx > vw + 10 || sy > vh + 10) return;
          const rr = Math.max(4, Math.min(9, 3 + v.s * 1.5));
          const bought = S && S.airports && S.airports[d.key];
          c.fillStyle = dotFill(bought, d.key); c.strokeStyle = '#16233f'; c.lineWidth = 2;
          c.beginPath(); c.arc(sx, sy, rr, 0, 7); c.fill(); c.stroke();
        });
      }
    };
    // Airline layer on every map: drawn routes + route planes,
    // source ring, drag preview, and move planes. Routes are
    // global state (S.routes), not per-map, so a route drawn on
    // one map shows on every other map. Same world coordinates,
    // so everything lands in the same place. A passenger plane
    // flies a route only when people flow on it (hub to airport);
    // hub-hub routes get no passenger plane (cargo only, people
    // move by hand). The plane starts at the hub, so the loaded
    // leg runs hub to airport and the return leg comes back.
    const drawAirline = (now) => {
      if (S && S.airports && Array.isArray(S.routes)) {
        const onScreen2 = (sx, sy) => sx > -40 && sy > -40 && sx < vw + 40 && sy < vh + 40;
        S.routes.forEach((r, idx) => {
          const A0 = S.airports[r.from], B0 = S.airports[r.to];
          if (!A0 || !B0) return;
          const A = (A0.type === 'hub' && B0.type !== 'hub') ? A0 : (B0.type === 'hub' && A0.type !== 'hub') ? B0 : A0;
          const B = A === A0 ? B0 : A0;
          const [ax, ay] = toScreen(A.x, A.y), [bx, by] = toScreen(B.x, B.y);
          if (!onScreen2(ax, ay) && !onScreen2(bx, by)) return;
          c.strokeStyle = '#16233f'; c.lineWidth = 3; c.lineCap = 'round';
          c.setLineDash([0.1, 10]);
          c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
          c.setLineDash([]);
          if (A0.type === B0.type) return;
          const t = (((now / 1000) * 0.12 + idx * 0.6) % 2), f = t < 1 ? t : 2 - t;
          const px = ax + (bx - ax) * f, py = ay + (by - ay) * f;
          const ang = Math.atan2(by - ay, bx - ax) + (t < 1 ? 0 : Math.PI);
          c.save(); c.translate(px, py); c.rotate(ang);
          c.fillStyle = '#16233f';
          c.beginPath(); c.moveTo(11, 0); c.lineTo(-7, 7); c.lineTo(-3, 0); c.lineTo(-7, -7); c.closePath(); c.fill();
          c.restore();
        });
      }
      const dsrc = drawSrc();
      if (dsrc && S && S.airports && S.airports[dsrc]) {
        const src = S.airports[dsrc];
        const [sx, sy] = toScreen(src.x, src.y);
        const rr = Math.max(4, Math.min(9, 3 + v.s * 1.5)) + 6 + Math.sin(now / 300) * 1.5;
        c.strokeStyle = '#2563eb'; c.lineWidth = 2;
        c.beginPath(); c.arc(sx, sy, rr, 0, 7); c.stroke();
      }
      if (dsrc && drawPos && S && S.airports && S.airports[dsrc]) {
        const src = S.airports[dsrc];
        const [sx, sy] = toScreen(src.x, src.y);
        // Auto-lock: the nearest dot within finger range locks on
        // while dragging, and the preview line snaps to it, so a
        // route connects even when the finger lands near the dot
        // instead of exactly on it.
        let ex = drawPos[0], ey = drawPos[1], locked = null;
        try { locked = viewKind === 'cluster' ? clusterDotAt(drawPos[0], drawPos[1], 34) : dotAt(drawPos[0], drawPos[1], 34); } catch (e) {}
        if (locked) { const lp = toScreen(locked.x, locked.y); ex = lp[0]; ey = lp[1]; }
        c.strokeStyle = '#16233f'; c.lineWidth = 3; c.lineCap = 'round';
        c.setLineDash([0.1, 10]);
        c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
        c.setLineDash([]);
        if (locked) { c.strokeStyle = '#f5b301'; c.lineWidth = 3; c.beginPath(); c.arc(ex, ey, 14, 0, 7); c.stroke(); }
      }
      if (S && S.airports && Array.isArray(S.moves)) {
        S.moves.forEach(mp => {
          const A = S.airports[mp.from], B = S.airports[mp.to];
          if (!A || !B) return;
          if (mp.wait > 0) return;
          const f = Math.min(1, Math.max(0, mp.t));
          const px = A.x + (B.x - A.x) * f, py = A.y + (B.y - A.y) * f;
          const [sx, sy] = toScreen(px, py); if (sx < -30 || sy < -30 || sx > vw + 30 || sy > vh + 30) return;
          const ang = Math.atan2(B.y - A.y, B.x - A.x);
          c.save(); c.translate(sx, sy); c.rotate(ang);
          c.fillStyle = '#16233f';
          c.beginPath(); c.moveTo(11, 0); c.lineTo(-7, 7); c.lineTo(-3, 0); c.lineTo(-7, -7); c.closePath(); c.fill();
          c.restore();
        });
      }
      // Trade moves in flight: teal ship hulls (not planes), so a
      // slow haul reads differently from a fast people flight.
      // Trips still waiting their turn are not drawn yet.
      if (S && S.airports && Array.isArray(S.tradeMoves)) {
        S.tradeMoves.forEach(tm => {
          const A = S.airports[tm.from], B = S.airports[tm.to];
          if (!A || !B) return;
          if (tm.wait > 0) return;
          const f = Math.min(1, Math.max(0, tm.t));
          const px = A.x + (B.x - A.x) * f, py = A.y + (B.y - A.y) * f;
          const [sx, sy] = toScreen(px, py); if (sx < -30 || sy < -30 || sx > vw + 30 || sy > vh + 30) return;
          const ang = Math.atan2(B.y - A.y, B.x - A.x);
          c.save(); c.translate(sx, sy); c.rotate(ang);
          c.fillStyle = '#0e7490';
          c.beginPath(); c.moveTo(12, 0); c.lineTo(4, 5); c.lineTo(-10, 5); c.lineTo(-12, 0); c.lineTo(-10, -5); c.lineTo(4, -5); c.closePath(); c.fill();
          c.restore();
        });
      }
    };
    // Cluster map: one dot per state in this cluster, at the state
    // capital (same dot as the world map, same buy sheet on tap).
    // No pills, no cities, no vehicles, no military — nothing else
    // from the world, except the airline layer (dots, routes, moves),
    // which is on every map.
    if (viewKind === 'cluster') {
      if (typeof US_CAPITALS !== 'undefined') clusterStates().forEach(name => {
        const cap = US_CAPITALS.find(u => u.s === name);
        if (!cap) return;
        const [sx, sy] = toScreen(cap.x, cap.y); if (sx < -10 || sy < -10 || sx > vw + 10 || sy > vh + 10) return;
        const rr = Math.max(4, Math.min(9, 3 + v.s * 1.5));
        const bought = S && S.airports && S.airports['us:' + cap.s];
        c.fillStyle = dotFill(bought, 'us:' + cap.s); c.strokeStyle = '#16233f'; c.lineWidth = 2;
        c.beginPath(); c.arc(sx, sy, rr, 0, 7); c.fill(); c.stroke();
      });
      drawAirline(now);
      return;
    }
    // RegionMap view: shapes plus the airline layer (dots, routes,
    // moves) — same places as every other map. No pills, no cities,
    // no vehicles, no military.
    if (viewKind === 'regionMap') { drawDots(); drawAirline(now); return; }
    if (st && st.settings.motion && layerOn('vehicles')) {
      units.forEach(u => {
        const co = st.co[u.a3]; if (!co) return;
        let x, y, a;
        if (u.type === 'yacht') { if (!u.pts) return; [x, y, a] = along(u.pts, u.len, u.t); const [sx, sy] = toScreen(x, y); if (!onScreen(sx, sy)) return; drawSprite(sx, sy, a, kShip, cc => yacht(cc)); return; }
        if (!co.fleet) return;
        if (u.type === 'plane') [x, y, a] = bez(u.from, u.to, u.t);
        else { if (!u.pts) return; [x, y, a] = along(u.pts, u.len, u.t); }
        const [sx, sy] = toScreen(x, y); if (!onScreen(sx, sy)) return;
        drawSprite(sx, sy, a, kShip, cc => u.type === 'plane' ? plane(cc, co.fleet, co.color) : u.type === 'container' ? containerShip(cc, co.fleet, co.color) : tanker(cc, co.fleet));
      });
      // A military failure must never blank the whole top layer: the
      // zoom-only branch (v.s > 1.4) runs sea-routing code no other
      // zoom touches, and one throw there used to clear every dot
      // and pill, because drawTop clears the canvas first. Jets may
      // drop out; the dots, pills and cities still draw, and the
      // error is logged instead of swallowing the map.
      try { military(now).forEach(([x, y, a, fn, isShip]) => { const [sx, sy] = toScreen(x, y); if (onScreen(sx, sy)) drawSprite(sx, sy, a, kShip, fn); }); } catch (e) { console.error('map military draw failed', e); }
    }
    if (!st) return;
    const pulse = 0.5 + 0.5 * Math.sin(now / 300);
    st.wars.forEach(w => [w.a, w.b].forEach(a3 => { const cap = W.cities[W.byA3[a3].capital]; const [sx, sy] = toScreen(cap.x, cap.y); c.strokeStyle = `rgba(229,72,77,${0.4 + pulse * 0.5})`; c.lineWidth = 3; c.beginPath(); c.arc(sx, sy, 14 + pulse * 8, 0, 7); c.stroke(); }));
    for (const id in st.cityHit) if (st.cityHit[id] > st.day) { const ct = W.cities[id]; const [sx, sy] = toScreen(ct.x, ct.y); c.strokeStyle = `rgba(255,140,40,${0.4 + pulse * 0.5})`; c.lineWidth = 2.5; c.beginPath(); c.arc(sx, sy, 11 + pulse * 6, 0, 7); c.stroke(); }
    // Facilities network: ports only — no base/shield icons, per the
    // user's instruction. Ports are joined by small white lines (with a
    // faint blue edge so the white shows on white land and blue sea).
    const r = Math.max(6, Math.min(14, 4 + v.s * 3));
    const mineSet = new Set(); for (const a3 in st.holdings) if (controlled(a3)) mineSet.add(W.byA3[a3].capital);
    W.cities.forEach(ct => {
      const [sx, sy] = toScreen(ct.x, ct.y); if (sx < -10 || sy < -10 || sx > vw + 10 || sy > vh + 10) return;
      const isMine = mineSet.has(ct.id), isSel = sel === ct.id, held = st.holdings[ct.a3] && !isMine;
      const rr = isSel ? r * 1.7 : isMine ? r * 1.35 : r;
      if (isSel) { c.fillStyle = 'rgba(47,124,246,0.25)'; c.beginPath(); c.arc(sx, sy, rr * 2.2, 0, 7); c.fill(); }
      // No flag circles on the map any more: the country name pill
      // below is the button. Nothing is drawn here at the capital
      // point except the selected-city halo above.
    });
    drawDots();
    drawAirline(now);
    // Placed businesses: a circle on the map, wherever the player
    // put it. Tapping it opens that business.
    if (S && Array.isArray(S.placed) && !pickMode) {
      S.placed.forEach(b => {
        const [sx, sy] = toScreen(b.x, b.y);
        if (sx < -20 || sy < -20 || sx > vw + 20 || sy > vh + 20) return;
        c.fillStyle = '#ffffff'; c.strokeStyle = '#2f7cf6'; c.lineWidth = 2.5;
        c.beginPath(); c.arc(sx, sy, 13, 0, 7); c.fill(); c.stroke();
        c.fillStyle = '#1f2937'; c.font = '16px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(b.icon || '🏢', sx, sy + 1);
      });
    }
    labelRects = []; labelTargets = [];
    // Pill names removed (2026-10-28): countries are identified by
    // shape, and tapping a country shape opens it. The intro picker
    // (drawPickLabels) still shows names, because you need them to pick.
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
  const pts = new Map(); let downAt = null, moved = 0, pinch = null, drawPos = null;
  const drawSrc = () => typeof UI !== 'undefined' ? (UI.routing || (UI.moving && UI.moving.from) || (UI.trading && UI.trading.from) || null) : null;
  const drawing = () => !!drawSrc();
  top.addEventListener('pointerdown', e => { top.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); downAt = [e.clientX, e.clientY]; moved = 0; anim = null; if (drawing()) { const rect = top.getBoundingClientRect(); drawPos = [e.clientX - rect.left, e.clientY - rect.top]; } if (pts.size === 2 && !drawing()) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: v.s }; } });
  top.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
    const rect = top.getBoundingClientRect();
    // Route drawing: panning and pinch are off, the finger draws
    // a preview line from the source dot instead.
    if (drawing()) { drawPos = [e.clientX - rect.left, e.clientY - rect.top]; moved += Math.abs(e.clientX - prev[0]) + Math.abs(e.clientY - prev[1]); return; }
    if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; zoomAt(pinch.s * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d / v.s, (a[0] + b[0]) / 2 - rect.left, (a[1] + b[1]) / 2 - rect.top); moved = 99; return; }
    const dx = e.clientX - prev[0], dy = e.clientY - prev[1]; moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 5) { v.x += dx; v.y += dy; clampView(); dirty = true; }
  });
  const up = e => { if (!pts.has(e.pointerId)) return; pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (pts.size === 0 && drawing()) { const rect = top.getBoundingClientRect(); const sx = e.clientX - rect.left, sy = e.clientY - rect.top; drawPos = null; if (moved > 6) { const best = viewKind === 'cluster' ? clusterDotAt(sx, sy, 34) : dotAt(sx, sy, 34); if (best) { if (UI.routing) handlers.routeDot && handlers.routeDot(best); else if (UI.moving) handlers.moveDot && handlers.moveDot(best); else if (UI.trading) handlers.tradeDot && handlers.tradeDot(best); } } else if (downAt) { tap(sx, sy); } return; } if (pts.size === 0 && moved <= 6 && downAt) { const rect = top.getBoundingClientRect(); tap(e.clientX - rect.left, e.clientY - rect.top); } };
  top.addEventListener('pointerup', up); top.addEventListener('pointercancel', e => { pts.delete(e.pointerId); pinch = null; drawPos = null; });
  top.addEventListener('wheel', e => { e.preventDefault(); const rect = top.getBoundingClientRect(); zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top); }, { passive: false });
  function zoomAt(f, sx, sy) { const [mx, my] = toMap(sx, sy); v.s *= f; clampView(); v.x = sx - mx * v.s; v.y = sy - my * v.s; clampView(); dirty = true; }
  // Buyable white dots on the world map: major cities, US state
  // capitals, and the USA/Canada capitals (which otherwise have no
  // dot). Keyed so a bought dot can be found again from the save.
  function dotSites() {
    const out = [], seen = new Set();
    const push = (key, name, a3, x, y) => { if (seen.has(key)) return; seen.add(key); out.push({ key, name, a3, x, y }); };
    (W.cities || []).forEach(ct => { if (ct.isMajor || ct.isCapital) push('c' + ct.id, ct.name, ct.a3, ct.x, ct.y); });
    if (typeof US_CAPITALS !== 'undefined') US_CAPITALS.forEach(st => push('us:' + st.s, st.c, 'USA', st.x, st.y));
    if (typeof v !== 'undefined') regionDots().forEach(d => { if (regionDotVisible(d, v.s)) push(d.key, d.name, d.a3, d.x, d.y); });
    return out;
  }
  // Region dots: one per first-level region (except the USA, whose
  // states already have capital dots). Position is the region's
  // box center (from WORLD_REGIONS). Regions too close to their
  // own capital are skipped (the capital dot already covers that
  // spot). Cached — regions never change.
  let regionDotsCache = null;
  function regionDots() {
    if (regionDotsCache) return regionDotsCache;
    const out = [];
    if (typeof WORLD_REGIONS !== 'undefined') WORLD_REGIONS.forEach(r => {
      if (r.a3 === 'USA' || !r.box) return;
      const x = (r.box[0] + r.box[2]) / 2, y = (r.box[1] + r.box[3]) / 2;
      const cap = W.byA3 && W.byA3[r.a3] && W.cities[W.byA3[r.a3].capital];
      if (cap && Math.hypot(x - cap.x, y - cap.y) < 40) return;
      out.push({ key: 'r:' + r.a3 + ':' + r.name, name: r.name, a3: r.a3, x, y, area: (r.box[2] - r.box[0]) * (r.box[3] - r.box[1]) });
    });
    regionDotsCache = out;
    return out;
  }
  // A region dot is only readable where its neighbors are far
  // enough apart: large regions at moderate zoom, smaller ones
  // only when zoomed deep. Tiny counties never get a dot (their
  // country's capital dot is the buy point there).
  function regionDotVisible(d, s) {
    if (s > 2.5) return d.area >= 100;
    if (s > 1.0) return d.area >= 400;
    return false;
  }
  function dotAt(sx, sy, radius) {
    let best = null, bd = radius || 16;
    dotSites().forEach(d => { const [x, y] = toScreen(d.x, d.y); const dist = Math.hypot(x - sx, y - sy); if (dist < bd) { bd = dist; best = d; } });
    return best;
  }
  function clusterDotAt(sx, sy, radius) {
    if (typeof US_CAPITALS === 'undefined') return null;
    let best = null, bd = radius || 16;
    clusterStates().forEach(name => {
      const cap = US_CAPITALS.find(u => u.s === name);
      if (!cap) return;
      const [x, y] = toScreen(cap.x, cap.y); const dist = Math.hypot(x - sx, y - sy);
      if (dist < bd) { bd = dist; best = { key: 'us:' + cap.s, name: cap.c, a3: 'USA', x: cap.x, y: cap.y }; }
    });
    return best;
  }
  function tap(sx, sy) {
    if (!pickMode) {
      // Placing a business: any map tap places it, wherever it lands.
      if (typeof UI !== 'undefined' && UI.placing) {
        const [mx, my] = toMap(sx, sy);
        handlers.place && handlers.place(mx, my); return;
      }
      // Tap order matters, and it used to be wrong: vehicles were
      // checked FIRST with a 34px radius, so a plane or ship flying
      // near France stole taps meant for France itself. Countries
      // come first now — name pills, then capital points, then
      // placed businesses — and vehicles only win
      // a tap that is not on any country button. A vehicle in open
      // sea or sky still opens its card exactly as before.
      // Placed businesses first: their circles are bigger than the
      // capital points, so a tap on one must not fall through to a city.
      if (S && Array.isArray(S.placed)) {
        let pb = null, bd = 26;
        S.placed.forEach(b => { const [x, y] = toScreen(b.x, b.y); const d = Math.hypot(x - sx, y - sy); if (d < bd) { bd = d; pb = b; } });
        if (pb) { handlers.placed && handlers.placed(pb.id); return; }
      }
      // Route mode: the player tapped Draw route, then taps a dot
      // to draw the route there. A tap near a dot auto-locks onto
      // it (34px, finger-sized); a tap that misses stays in route
      // mode instead of cancelling, and tapping the source dot
      // cancels. Works on every map.
      if (typeof UI !== 'undefined' && UI.routing) {
        const best = viewKind === 'cluster' ? clusterDotAt(sx, sy, 34) : dotAt(sx, sy, 34);
        if (best) handlers.routeDot && handlers.routeDot(best);
        return;
      }
      // Move mode: the player picked a percent, then taps a dot
      // on one of their routes to move people there. Same auto-lock
      // and stay-in-mode rules as route mode. Works on every map.
      if (typeof UI !== 'undefined' && UI.moving) {
        const best = viewKind === 'cluster' ? clusterDotAt(sx, sy, 34) : dotAt(sx, sy, 34);
        if (best) handlers.moveDot && handlers.moveDot(best);
        return;
      }
      // Trade mode: the player picked a trade percent at a port,
      // then taps a port or hub on one of their routes to haul
      // trade there. Same auto-lock and stay-in-mode rules.
      // Works on every map.
      if (typeof UI !== 'undefined' && UI.trading) {
        const best = viewKind === 'cluster' ? clusterDotAt(sx, sy, 34) : dotAt(sx, sy, 34);
        if (best) handlers.tradeDot && handlers.tradeDot(best);
        return;
      }
      // White dots are buyable on every map: tapping one opens the
      // airport/hub buy sheet for that city, instead of the country
      // underneath.
      {
        const best = dotAt(sx, sy);
        if (best) { handlers.dot && handlers.dot(best); return; }
      }
      // Cluster maps: one dot per state, same buy sheet as the
      // world map. Any other tap stays in the cluster map.
      if (viewKind === 'cluster') {
        const best = clusterDotAt(sx, sy);
        if (best) { handlers.dot && handlers.dot(best); }
        return;
      }
      // Cities are not enterable: taps that miss a dot fall through
      // to the country underneath, which opens the country panel.
      const vk = vehicleAt(sx, sy);
      if (vk != null) { handlers.vehicle && handlers.vehicle(vk); return; }
      // In a region or regionMap view, land taps stay in that map.
      if (viewKind === 'region' || viewKind === 'regionMap') return;
      // In a country view, a tap on a region opens that region's
      // Go popup; any other tap stays in the country view.
      if (viewKind === 'country') {
        const [mx0, my0] = toMap(sx, sy);
        const region = regionAt(mx0, my0);
        if (region) handlers.region && handlers.region(viewA3, region);
        return;
      }
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
  let last = performance.now(); let frameCount = 0;
  function frame(now) { frameCount++;
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (anim) anim(now);
    const st = S_();
    // Never let one bad step kill the whole frame loop: that froze the
    // map at world view after a game started, because step() threw.
    try { if (st && !pickMode) step(dt * (st.speed === 0 ? 0 : st.speed === 3 ? 2.5 : st.speed)); } catch (e) { console.error('map step failed', e); }
    try { if (dirty) { drawBase(); dirty = false; } } catch (e) { console.error('map draw failed', e); dirty = false; }
    try { drawTop(now); } catch (e) { console.error('map top draw failed', e); }
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
    frameCount() { return frameCount; },
    drawNow() { drawBase(); dirty = false; },
    flyToCity(id, s) { const c = W.cities[id]; flyTo(c.x, c.y, s || Math.max(v.s, 2.4)); },
    flyToCountry(a3) { const k = W.byA3[a3]; const w = Math.max(8, k.box[2] - k.box[0]), h = Math.max(8, k.box[3] - k.box[1]); const cap = (k.capital != null && W.cities[k.capital]) ? W.cities[k.capital] : null; const cx = cap ? cap.x : (k.box[0] + k.box[2]) / 2, cy = cap ? cap.y : (k.box[1] + k.box[3]) / 2; flyTo(cx, cy, Math.min(8, Math.max(2.5, Math.min(vw / (w * 1.2), vh / (h * 1.4))))); },
    zoom(f) { zoomAt(f, vw / 2, vh / 2); },
    home() { resetView(); const st = S_(); if (!st) { fit(); return; } const k = W.byA3[st.home]; if (!k) { fit(); return; } const cap = (k.capital != null && W.cities[k.capital]) ? W.cities[k.capital] : null; const cx = cap ? cap.x : (k.box[0] + k.box[2]) / 2, cy = cap ? cap.y : (k.box[1] + k.box[3]) / 2; anim = null; const w = Math.max(8, k.box[2] - k.box[0]), h = Math.max(8, k.box[3] - k.box[1]); const ts = Math.min(8, Math.max(2.5, Math.min(vw / (w * 1.2), vh / (h * 1.4)))); const apply = () => { v.s = ts; v.x = vw / 2 - cx * ts; v.y = vh / 2 - cy * ts; clampView(); dirty = true; }; apply(); const sx = v.x, sy = v.y, ss = v.s; setTimeout(() => { if (Math.abs(v.s - ss) > 0.01 || Math.abs(v.x - sx) > 1 || Math.abs(v.y - sy) > 1) { apply(); } }, 600); return { s: v.s, x: v.x, y: v.y, capX: cx, capY: cy, vw: vw, vh: vh }; },
    world() { resetView(); flyTo(MAP_W / 2, MAP_H / 2, 0); },
    showCountry(a3) { enterCountry(a3); },
    showRegion(a3, region) { viewKind = 'region'; viewA3 = a3; viewRegion = region; viewRegionName = null; const box = regionBox(region); if (box) frameBox(box); },
    showCluster(a3, state) { viewCluster = Math.max(0, clusterForState(state)); viewKind = 'cluster'; viewA3 = a3 || 'USA'; viewRegion = null; viewRegionName = null; const box = clusterBox(); if (box) frameBox(box); },
    isClusterState(name) { return isClusterState(name); },
    showRegionMap(a3, region) { viewKind = 'regionMap'; viewA3 = a3; viewRegion = null; viewRegionName = region; const box = worldRegionBox(a3, region); if (box) frameBox(box); },
    isWorldRegion(a3, name) { return !!worldRegionEntry(a3, name); },
    exitToWorld() { resetView(); fit(); dirty = true; },
    exitToCountry() { if ((viewKind === 'region' || viewKind === 'cluster' || viewKind === 'regionMap') && viewA3) enterCountry(viewA3); },
    viewInfo() { return { kind: viewKind, a3: viewA3, region: viewKind === 'regionMap' ? viewRegionName : viewRegion }; },

    vehicle(key) { const v = vehicleList(performance.now()).find(vd => vd.key === key); return v || null; },
    // Headless test hooks only: advance vehicles one step and read
    // their positions, so a harness can prove boats actually move.
    stepTest(dt) { step(dt); return vehicleList(performance.now()).map(vd => ({ key: vd.key, category: vd.category, x: vd.x, y: vd.y, progress: vd.progress })); },
    unitsTest() { if (builtFor === null || (typeof S !== 'undefined' && S && builtFor !== S.seed)) buildUnits(); return units.map(u => ({ key: u.a3 + ':' + u.type, hasPts: !!u.pts, waiting: !!u.waiting, len: u.len || 0, t: u.t, start: u.start, dest: u.dest, basin: u.basin, queueLen: routeQueue.length })); },
    vehiclesTest() { return vehicleList(performance.now()).map(vd => ({ key: vd.key, category: vd.category, x: vd.x, y: vd.y, progress: vd.progress })); },
    vehicleAt(sx, sy) { return vehicleAt(sx, sy); },
    flyToXY(x, y, s) { flyTo(x, y, s || Math.max(v.s, 2.4)); },
    nearCity(x, y) { return nearestCityXY(x, y); },
    sprite: { plane, containerShip, tanker, fighter, warship, yacht },
  };
})();
