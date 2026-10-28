// ---------- Isometric city district builder ----------
// Havana-style pastel isometric district, 20x16 tiles (5x the first
// 8x8 try). Tap a tool, then tap a tile to place it. Placements live in
// S.cityBuild[cityId].tiles and persist with the normal save, so they
// survive reloads. Old 8x8 placements keep working: their tile keys
// still exist inside the bigger grid.
const CB_COLS = 20, CB_ROWS = 16, CB_TW = 40, CB_TH = 20, CB_BH = 16;
const CB_TOOLS = [
  { id: 'house', icon: '🏠', name: 'House' },
  { id: 'shop', icon: '🏪', name: 'Shop' },
  { id: 'mall', icon: '🛍️', name: 'Mall' },
  { id: 'gas', icon: '⛽', name: 'Gas' },
  { id: 'bank', icon: '🏦', name: 'Bank' },
  { id: 'road', icon: '🛣️', name: 'Road' },
  { id: 'tree', icon: '🌳', name: 'Tree' },
  { id: 'beach', icon: '🏖️', name: 'Beach' },
  { id: 'port', icon: '⚓', name: 'Port' },
  { id: 'milport', icon: '🚢', name: 'Mil port' },
  { id: 'milbase', icon: '🎖️', name: 'Mil base' },
  { id: 'clear', icon: '🧹', name: 'Clear' },
];
const CB_PASTELS = ['#f6c9d8', '#bfe8d0', '#fde9a8', '#bcd9f7', '#f7e3c3', '#d8c9f0'];
const cbState = (cityId) => {
  S.cityBuild = S.cityBuild || {};
  return S.cityBuild[cityId] || (S.cityBuild[cityId] = { tiles: {} });
};
const cbShade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => Math.round(v * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};
const cbPastelFor = (key) => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return CB_PASTELS[Math.abs(h) % CB_PASTELS.length];
};
// Top vertex of a tile's diamond. y is shifted down by CB_BH so the
// tallest boxes on the top row never clip.
const cbTop = (gx, gy) => ({ x: CB_COLS * CB_TW / 2 + (gx - gy) * CB_TW / 2, y: CB_BH + (gx + gy) * CB_TH / 2 });
// One iso box: top diamond + two shaded sides, height h.
const cbBox = (cx, cy, col, h) => {
  const T = CB_TH / 2, W = CB_TW / 2;
  return `<polygon points="${cx},${cy - h - T} ${cx + W},${cy - h} ${cx},${cy - h + T} ${cx - W},${cy - h}" fill="${col}"/>`
    + `<polygon points="${cx - W},${cy - h} ${cx},${cy - h + T} ${cx},${cy + T} ${cx - W},${cy}" fill="${cbShade(col, 0.72)}"/>`
    + `<polygon points="${cx},${cy - h + T} ${cx + W},${cy - h} ${cx + W},${cy} ${cx},${cy + T}" fill="${cbShade(col, 0.85)}"/>`;
};
const cbTileSVG = (gx, gy, what, key) => {
  const t = cbTop(gx, gy), cx = t.x, cy = t.y + CB_TH / 2;
  const dia = `${t.x},${t.y} ${t.x + CB_TW / 2},${t.y + CB_TH / 2} ${t.x},${t.y + CB_TH} ${t.x - CB_TW / 2},${t.y + CB_TH / 2}`;
  const grass = (gx + gy) % 2 ? '#86d166' : '#7cc95e';
  let inner = `<polygon points="${dia}" fill="${grass}"/>`;
  if (what === 'road') {
    inner = `<polygon points="${dia}" fill="#6b7280"/><line x1="${t.x - 12}" y1="${cy}" x2="${t.x + 12}" y2="${cy}" stroke="#e5e5e5" stroke-width="1.5"/>`;
  } else if (what === 'house') {
    inner = `<polygon points="${dia}" fill="${grass}"/>` + cbBox(cx, cy, cbPastelFor(key), CB_BH);
  } else if (what === 'shop') {
    inner = `<polygon points="${dia}" fill="${grass}"/>` + cbBox(cx, cy, '#e8734a', CB_BH)
      + `<circle cx="${cx}" cy="${cy - CB_BH}" r="2.5" fill="#fff"/>`;
  } else if (what === 'mall') {
    inner = `<polygon points="${dia}" fill="${grass}"/>` + cbBox(cx, cy, '#7aa5ff', CB_BH * 2)
      + `<circle cx="${cx}" cy="${cy - CB_BH * 2}" r="3" fill="#fff"/>`;
  } else if (what === 'gas') {
    inner = `<polygon points="${dia}" fill="#6b7280"/>`
      + `<polygon points="${cx},${cy - 12} ${cx + 12},${cy - 6} ${cx},${cy} ${cx - 12},${cy - 6}" fill="#f8f9fa" stroke="#e03131" stroke-width="1.5"/>`
      + `<rect x="${cx - 7}" y="${cy - 1}" width="5" height="6" fill="#212529"/><rect x="${cx + 2}" y="${cy - 1}" width="5" height="6" fill="#212529"/>`;
  } else if (what === 'bank') {
    inner = `<polygon points="${dia}" fill="${grass}"/>` + cbBox(cx, cy, '#2f7d4f', CB_BH)
      + `<text x="${cx}" y="${cy - CB_BH + 4}" text-anchor="middle" font-size="10" font-weight="bold" fill="#ffd43b">$</text>`;
  } else if (what === 'tree') {
    inner = `<polygon points="${dia}" fill="${grass}"/>`
      + `<rect x="${cx - 1.5}" y="${cy - 6}" width="3" height="6" fill="#8b5a2b"/>`
      + `<circle cx="${cx}" cy="${cy - 10}" r="7" fill="#2f9e44"/><circle cx="${cx - 5}" cy="${cy - 5}" r="5" fill="#37b24d"/><circle cx="${cx + 5}" cy="${cy - 5}" r="5" fill="#37b24d"/>`;
  } else if (what === 'beach') {
    inner = `<polygon points="${dia}" fill="#f2ddae"/>`
      + `<line x1="${cx}" y1="${cy - 2}" x2="${cx}" y2="${cy - 10}" stroke="#8b5a2b" stroke-width="1.5"/>`
      + `<polygon points="${cx - 8},${cy - 10} ${cx + 8},${cy - 10} ${cx},${cy - 16}" fill="#ff6b9d"/>`
      + `<circle cx="${cx - 9}" cy="${cy + 5}" r="2.5" fill="#3b82f6"/><circle cx="${cx + 8}" cy="${cy + 6}" r="2.5" fill="#3b82f6"/>`;
  } else if (what === 'port' || what === 'milport') {
    const dock = what === 'port' ? '#8b5a2b' : '#495057';
    inner = `<polygon points="${dia}" fill="#3b82f6"/>`
      + `<polygon points="${cx - 14},${cy} ${cx},${cy - 7} ${cx + 14},${cy} ${cx},${cy + 7}" fill="${dock}"/>`;
    if (what === 'port') {
      inner += `<rect x="${cx - 9}" y="${cy - 5}" width="7" height="5" fill="#e8590c"/><rect x="${cx + 2}" y="${cy - 5}" width="7" height="5" fill="#1971c2"/>`;
    } else {
      inner += `<polygon points="${cx - 12},${cy + 3} ${cx + 12},${cy + 3} ${cx + 6},${cy + 8} ${cx - 6},${cy + 8}" fill="#343a40"/><rect x="${cx - 2}" y="${cy - 2}" width="4" height="4" fill="#868e96"/>`;
    }
  } else if (what === 'milbase') {
    inner = `<polygon points="${dia}" fill="#6b7c3f" stroke="#2f3a1d" stroke-width="1.5" stroke-dasharray="3 3"/>`
      + cbBox(cx, cy, '#495057', 8)
      + `<line x1="${cx + 8}" y1="${cy - 4}" x2="${cx + 8}" y2="${cy - 14}" stroke="#212529" stroke-width="1.5"/>`
      + `<polygon points="${cx + 8},${cy - 14} ${cx + 16},${cy - 11} ${cx + 8},${cy - 8}" fill="#e03131"/>`;
  }
  // The whole tile (grass included) is tappable, so replacing a building
  // is one tap, not a tap on the exact box.
  return `<g data-a="cbPlace" data-x="${key}">${inner}</g>`;
};
const cbSheetInner = (cityId) => {
  const c = W.cities[cityId];
  const st = cbState(cityId);
  const tool = UI.cbTool || 'house';
  let svg = '';
  // Painter's order: far tiles first (small gx+gy), so nearer tiles and
  // their boxes paint over the ones behind them.
  for (let s = 0; s <= (CB_COLS - 1) + (CB_ROWS - 1); s++) {
    for (let gx = 0; gx < CB_COLS; gx++) {
      const gy = s - gx;
      if (gy < 0 || gy >= CB_ROWS) continue;
      const key = cityId + '|' + gx + ',' + gy;
      svg += cbTileSVG(gx, gy, st.tiles[gx + ',' + gy], key);
    }
  }
  const counts = {};
  Object.values(st.tiles).forEach(t => { counts[t] = (counts[t] || 0) + 1; });
  const countText = CB_TOOLS.filter(t => t.id !== 'clear').map(t => `${t.icon} ${counts[t.id] || 0}`).join(' · ');
  return `<h2>🏙️ Build district — ${c ? esc(c.name) : 'City'}</h2><p class="muted small">Havana style · ${CB_COLS}×${CB_ROWS} district — scroll to see it all. Tap a tool, then tap a tile. Placements save automatically.</p>`
    + `<div class="row wrap">${CB_TOOLS.map(t => `<button class="btn ${tool === t.id ? 'on' : ''}" data-a="cbTool" data-x="${t.id}">${t.icon} ${t.name}</button>`).join('')}</div>`
    + `<div style="overflow:auto;max-height:55vh;margin:8px 0"><svg viewBox="0 0 ${CB_COLS * CB_TW} ${CB_BH + CB_ROWS * CB_TH}" width="${CB_COLS * CB_TW}" style="display:block">${svg}</svg></div>`
    + `<p class="muted small">${countText || 'Nothing placed yet — tap a tile to start.'}</p>`;
};
