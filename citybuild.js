// ---------- Isometric city district builder (first try) ----------
// Havana-inspired pastel isometric district: an 8x8 diamond grid rendered
// as inline SVG. Tap a tool, then tap a tile to place it. Placements live
// in S.cityBuild[cityId].tiles and persist with the normal save, so they
// survive reloads. The district is styled after Havana; it opens in
// whichever city the player is standing in.
const CB_N = 8, CB_TW = 40, CB_TH = 20, CB_BH = 16;
const CB_TOOLS = [
  { id: 'house', icon: '🏠', name: 'House' },
  { id: 'shop', icon: '🏪', name: 'Shop' },
  { id: 'road', icon: '🛣️', name: 'Road' },
  { id: 'tree', icon: '🌳', name: 'Tree' },
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
const cbTop = (gx, gy) => ({ x: CB_N * CB_TW / 2 + (gx - gy) * CB_TW / 2, y: CB_BH + (gx + gy) * CB_TH / 2 });
const cbTileSVG = (gx, gy, what, key) => {
  const t = cbTop(gx, gy), cx = t.x, cy = t.y + CB_TH / 2;
  const dia = `${t.x},${t.y} ${t.x + CB_TW / 2},${t.y + CB_TH / 2} ${t.x},${t.y + CB_TH} ${t.x - CB_TW / 2},${t.y + CB_TH / 2}`;
  const grass = (gx + gy) % 2 ? '#86d166' : '#7cc95e';
  let inner = `<polygon points="${dia}" fill="${grass}"/>`;
  if (what === 'road') {
    inner = `<polygon points="${dia}" fill="#6b7280"/><line x1="${t.x - 12}" y1="${cy}" x2="${t.x + 12}" y2="${cy}" stroke="#e5e5e5" stroke-width="1.5"/>`;
  } else if (what === 'house' || what === 'shop') {
    const col = what === 'shop' ? '#e8734a' : cbPastelFor(key);
    inner = `<polygon points="${dia}" fill="${grass}"/>`
      + `<polygon points="${cx},${cy - CB_BH - CB_TH / 2} ${cx + CB_TW / 2},${cy - CB_BH} ${cx},${cy - CB_BH + CB_TH / 2} ${cx - CB_TW / 2},${cy - CB_BH}" fill="${col}"/>`
      + `<polygon points="${cx - CB_TW / 2},${cy - CB_BH} ${cx},${cy - CB_BH + CB_TH / 2} ${cx},${cy + CB_TH / 2} ${cx - CB_TW / 2},${cy}" fill="${cbShade(col, 0.72)}"/>`
      + `<polygon points="${cx},${cy - CB_BH + CB_TH / 2} ${cx + CB_TW / 2},${cy - CB_BH} ${cx + CB_TW / 2},${cy} ${cx},${cy + CB_TH / 2}" fill="${cbShade(col, 0.85)}"/>`
      + (what === 'shop' ? `<circle cx="${cx}" cy="${cy - CB_BH}" r="2.5" fill="#fff"/>` : '');
  } else if (what === 'tree') {
    inner = `<polygon points="${dia}" fill="${grass}"/>`
      + `<rect x="${cx - 1.5}" y="${cy - 6}" width="3" height="6" fill="#8b5a2b"/>`
      + `<circle cx="${cx}" cy="${cy - 10}" r="7" fill="#2f9e44"/><circle cx="${cx - 5}" cy="${cy - 5}" r="5" fill="#37b24d"/><circle cx="${cx + 5}" cy="${cy - 5}" r="5" fill="#37b24d"/>`;
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
  for (let s = 0; s <= (CB_N - 1) * 2; s++) {
    for (let gx = 0; gx < CB_N; gx++) {
      const gy = s - gx;
      if (gy < 0 || gy >= CB_N) continue;
      const key = cityId + '|' + gx + ',' + gy;
      svg += cbTileSVG(gx, gy, st.tiles[gx + ',' + gy], key);
    }
  }
  const counts = {};
  Object.values(st.tiles).forEach(t => { counts[t] = (counts[t] || 0) + 1; });
  const countText = CB_TOOLS.filter(t => t.id !== 'clear').map(t => `${t.icon} ${counts[t.id] || 0}`).join(' · ');
  return `<h2>🏙️ Build district — ${c ? esc(c.name) : 'City'}</h2><p class="muted small">Havana style · tap a tool, then tap a tile. Placements save automatically.</p>`
    + `<div class="row wrap">${CB_TOOLS.map(t => `<button class="btn ${tool === t.id ? 'on' : ''}" data-a="cbTool" data-x="${t.id}">${t.icon} ${t.name}</button>`).join('')}</div>`
    + `<div style="overflow-x:auto;margin:8px 0"><svg viewBox="0 0 ${CB_N * CB_TW} ${CB_BH + CB_N * CB_TH}" width="${CB_N * CB_TW}" style="display:block;margin:0 auto">${svg}</svg></div>`
    + `<p class="muted small">${countText || 'Nothing placed yet — tap a tile to start.'}</p>`;
};
