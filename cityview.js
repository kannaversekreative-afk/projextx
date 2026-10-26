// Isometric capital city. Drawn once to an offscreen canvas in three passes
// (ground, shadows, objects back-to-front); pins are HTML so they stay crisp.
'use strict';

const CityView = (() => {
  const TW = 72, TH = 36;
  let el, canvas, ctx, layer, img, layout, city, view = { x: 0, y: 0, s: 1 }, ox = 0, oy = 0, W2 = 0, H2 = 0;
  let marsMode = false;
  let onPin = null, filter = 'all', roofs = {}, landmarkName = 'Capitol', landmarkEmoji = '', vehicles = [], occluders = [], skyPlanes = [], animTimer = null, lastAnim = 0;

  const rgb = hex => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const shade = (hex, f) => { const [r, g, b] = rgb(hex); return `rgb(${Math.min(255, r * f) | 0},${Math.min(255, g * f) | 0},${Math.min(255, b * f) | 0})`; };
  const P = (x, y) => [ox + (x - y) * TW / 2, oy + (x + y) * TH / 2];
  const poly = (c, pts, fill) => { c.fillStyle = fill; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill(); };
  const up = (p, h) => [p[0], p[1] - h];
  const lerp = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];

  // ---------- ground ----------
  function diamond(c, x, y, fill, k) { k = k || 0; poly(c, [P(x + k, y + k), P(x + 1 - k, y + k), P(x + 1 - k, y + 1 - k), P(x + k, y + 1 - k)], fill); }
  function road(c, t, T) {
    diamond(c, t.x, t.y, '#5b6470');
    const N = layout.N, isR = (x, y) => { const q = T[y * N + x]; return q && q.kind === 'road'; };
    const h = isR(t.x - 1, t.y) || isR(t.x + 1, t.y), v = isR(t.x, t.y - 1) || isR(t.x, t.y + 1);
    if (h && v) { // intersection: crosswalk stripes + streetlights
      c.fillStyle = 'rgba(255,255,255,0.78)';
      for (let i = 0; i < 5; i++) { const f = 0.15 + i * 0.16; [[[f, 0.04], [f + 0.08, 0.04], [f + 0.08, 0.18], [f, 0.18]], [[f, 0.82], [f + 0.08, 0.82], [f + 0.08, 0.96], [f, 0.96]], [[0.04, f], [0.18, f], [0.18, f + 0.08], [0.04, f + 0.08]], [[0.82, f], [0.96, f], [0.96, f + 0.08], [0.82, f + 0.08]]].forEach(q => poly(c, q.map(([a, b]) => P(t.x + a, t.y + b)), c.fillStyle)); }
      c.fillStyle = '#ffe9a3'; const l1 = P(t.x + 0.08, t.y + 0.08), l2 = P(t.x + 0.92, t.y + 0.92); c.beginPath(); c.arc(l1[0], l1[1], 2.2, 0, 7); c.arc(l2[0], l2[1], 2.2, 0, 7); c.fill();
      // Traffic light pole at the corner.
      const [tx, ty] = P(t.x + 0.95, t.y + 0.05); c.fillStyle = '#333'; c.fillRect(tx - 1, ty - 12, 2, 12);
      ['#e5484d', '#ffd166', '#12a150'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(tx, ty - 16 - i * 3, 1.6, 0, 7); c.fill(); });
      return;
    }
    c.strokeStyle = '#f2d36b'; c.lineWidth = 1.4; c.setLineDash([7, 6]);
    const a = h ? P(t.x, t.y + 0.5) : P(t.x + 0.5, t.y), b = h ? P(t.x + 1, t.y + 0.5) : P(t.x + 0.5, t.y + 1);
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); c.setLineDash([]);
    c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 1;
    [0.12, 0.88].forEach(o => { const p = h ? [P(t.x, t.y + o), P(t.x + 1, t.y + o)] : [P(t.x + o, t.y), P(t.x + o, t.y + 1)]; c.beginPath(); c.moveTo(p[0][0], p[0][1]); c.lineTo(p[1][0], p[1][1]); c.stroke(); });
  }
  function lotGround(c, t) {
    diamond(c, t.x, t.y, '#cfc9b8'); // sidewalk border around every lot
    diamond(c, t.x, t.y, '#e8e2d0', 0.04);
    const green = t.arch === 'house' || t.arch === 'rowhouse' || t.kind === 'park';
    diamond(c, t.x, t.y, t.kind === 'park' ? '#6fbf5a' : green ? '#a5d97a' : t.zone === 'downtown' ? '#d2d6da' : '#bcd6a8', 0.07);
    if (t.arch === 'warehouse' || t.arch === 'factory' || (t.arch === 'shop' && t.seed > 0.6)) { // parking
      diamond(c, t.x, t.y, '#a4aab0', 0.1);
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.8;
      for (let i = 1; i < 5; i++) { const a = P(t.x + 0.1 + i * 0.16, t.y + 0.62), b = P(t.x + 0.1 + i * 0.16, t.y + 0.9); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    }
  }
  function plazaGround(c, t) {
    diamond(c, t.x, t.y, '#ebe5d6');
    diamond(c, t.x, t.y, (t.x + t.y) % 2 ? '#a8d877' : '#e4dccb', 0.18);
    // People dots on the plaza, plus a fountain and a food stall.
    const cols = ['#e5484d', '#2f7cf6', '#f5b301', '#12a150', '#7c4dff'];
    for (let i = 0; i < 7; i++) { const [px, py] = P(t.x + 0.15 + (i * 0.37) % 0.75, t.y + 0.2 + (i * 0.53) % 0.6); c.fillStyle = cols[(t.x + t.y + i) % cols.length]; c.beginPath(); c.arc(px, py, 2.2, 0, 7); c.fill(); c.fillStyle = '#333'; c.fillRect(px - 1, py - 4, 2, 2); }
    const [fx, fy] = P(t.x + 0.5, t.y + 0.5); c.fillStyle = '#9ec9e6'; c.beginPath(); c.ellipse(fx, fy, 10, 5, 0, 0, 7); c.fill(); c.fillStyle = '#e8f4fa'; c.beginPath(); c.ellipse(fx, fy - 2, 5, 2.5, 0, 0, 7); c.fill();
    if ((t.x + t.y) % 3 === 0) { const [vx, vy] = P(t.x + 0.82, t.y + 0.2); c.fillStyle = '#ff6b2c'; c.fillRect(vx - 7, vy - 6, 14, 7); c.fillStyle = '#fff'; c.fillRect(vx - 7, vy - 9, 14, 3); }
  }
  function water(c, t) {
    diamond(c, t.x, t.y, '#2aa8d8');
    diamond(c, t.x, t.y, '#3db5e0', 0.12);
    c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 1; const a = P(t.x + 0.25, t.y + 0.5), b = P(t.x + 0.6, t.y + 0.5); c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + b[0]) / 2, a[1] - 3, b[0], b[1]); c.stroke();
    if (t.seed > 0.85) { // a little boat on the water
      const [mx, my] = P(t.x + 0.5, t.y + 0.5); c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(mx, my, 9, 4, 0, 0, 7); c.fill(); c.fillStyle = '#e5484d'; c.fillRect(mx - 1, my - 9, 2, 9);
    }
  }
  function beach(c, t) { diamond(c, t.x, t.y, '#f0e1b2'); diamond(c, t.x, t.y, '#ecd9a0', 0.3); }

  // ---------- objects ----------
  // Axis-aligned box. Returns screen points for decorating its faces.
  function box(c, x0, y0, x1, y1, h, col, base) {
    base = base || 0;
    const A = up(P(x0, y0), base), B = up(P(x1, y0), base), C = up(P(x1, y1), base), D = up(P(x0, y1), base);
    poly(c, [D, C, up(C, h), up(D, h)], shade(col, 0.93));     // left face (lit)
    poly(c, [C, B, up(B, h), up(C, h)], shade(col, 0.74));     // right face (shade)
    poly(c, [up(A, h), up(B, h), up(C, h), up(D, h)], shade(col, 1.08)); // roof
    return { A, B, C, D, h };
  }
  function faceGrid(c, p0, p1, h, rows, cols, fill, opts) {
    opts = opts || {};
    const fh = h / rows;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      if (opts.skipGround && r === 0) continue;
      const f0 = (k + (opts.inset || 0.22)) / cols, f1 = (k + 1 - (opts.inset || 0.22)) / cols;
      const yb = -(r * fh + fh * (opts.bottom || 0.25)), yt = -(r * fh + fh * (opts.top || 0.78));
      const a = lerp(p0, p1, f0), b = lerp(p0, p1, f1);
      poly(c, [[a[0], a[1] + yb], [b[0], b[1] + yb], [b[0], b[1] + yt], [a[0], a[1] + yt]], typeof fill === 'function' ? fill(r, k) : fill);
    }
  }
  function shadowOf(c, x0, y0, x1, y1, h) {
    const s = Math.min(2.4, h / 60); const C = P(x1, y1), B = P(x1, y0), D = P(x0, y1);
    const off = (p) => [p[0] + s * TW * 0.35, p[1] + s * TH * 0.55];
    poly(c, [D, C, B, off(B), off(C), off(D)], 'rgba(40,50,40,0.16)');
  }
  function roofDetails(c, g, t, r) {
    const cx = (g.A[0] + g.C[0]) / 2, cy = (g.A[1] + g.C[1]) / 2 - g.h;
    // Parapet edge so rooftops read as finished, not flat colour.
    c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 1; c.beginPath(); c.moveTo(g.A[0], g.A[1] - g.h); c.lineTo(g.B[0], g.B[1] - g.h); c.lineTo(g.C[0], g.C[1] - g.h); c.lineTo(g.D[0], g.D[1] - g.h); c.closePath(); c.stroke();
    if (r() < 0.4) { // rooftop garden patch with a mini tree
      c.fillStyle = '#6fbf5a'; c.fillRect(cx - 10, cy - 3, 12, 6); c.fillStyle = '#3e8f3a'; c.beginPath(); c.arc(cx - 4, cy - 6, 4, 0, 7); c.fill();
    } else if (r() < 0.65) { // solar panels
      c.fillStyle = '#1d3a5f'; c.fillRect(cx + 2, cy - 4, 12, 7); c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(cx + 6, cy - 4); c.lineTo(cx + 6, cy + 3); c.moveTo(cx + 2, cy - 0.5); c.lineTo(cx + 14, cy - 0.5); c.stroke();
    } else if (t.arch === 'apartment' || t.arch === 'rowhouse') { // wooden water tank, New-York-rooftop style
      c.fillStyle = '#8a6a4a'; c.fillRect(cx + 6, cy - 11, 9, 9); c.fillStyle = '#6b4f3a'; c.beginPath(); c.moveTo(cx + 5, cy - 11); c.lineTo(cx + 10.5, cy - 15); c.lineTo(cx + 16, cy - 11); c.fill();
    }
    if (t.floors > 14 && t.seed > 0.55) { c.fillStyle = '#3c4552'; c.beginPath(); c.ellipse(cx, cy, 10, 5, 0, 0, 7); c.fill(); c.fillStyle = '#e8eaee'; c.font = 'bold 7px sans-serif'; c.textAlign = 'center'; c.fillText('H', cx, cy + 2.5); return; }
    for (let i = 0; i < 2 + Math.floor(r() * 2); i++) { const dx = (r() - 0.5) * 16, dy = (r() - 0.5) * 7; c.fillStyle = '#b9bfc6'; c.fillRect(cx + dx - 3, cy + dy - 4, 6, 4); c.fillStyle = '#d7dbe0'; c.fillRect(cx + dx - 3, cy + dy - 5.5, 6, 1.6); }
    if (t.arch === 'apartment' && t.seed > 0.7) { c.fillStyle = '#7b5a43'; c.fillRect(cx + 6, cy - 12, 6, 9); c.fillStyle = '#5d4332'; c.beginPath(); c.moveTo(cx + 5, cy - 12); c.lineTo(cx + 9, cy - 16); c.lineTo(cx + 13, cy - 12); c.fill(); }
  }
  // Roof signature for a capital's own style: a small dome, onion,
  // pagoda tier, mansard, pitched gable or spire on office blocks.
  function drawRoofCap(c, top, style) {
    const [x, y] = top, a = style.a || style.r, rc = style.r;
    if (style.cap === 'dome') { c.fillStyle = a; c.beginPath(); c.arc(x, y, 9, Math.PI, 0); c.fill(); c.fillStyle = '#ffd166'; c.beginPath(); c.arc(x, y - 10, 2, 0, 7); c.fill(); }
    else if (style.cap === 'onion') { c.fillStyle = a; c.beginPath(); c.arc(x, y, 8, Math.PI, 0); c.fill(); poly(c, [[x - 8, y], [x + 8, y], [x, y - 14]], a); c.fillStyle = '#ffd166'; c.beginPath(); c.arc(x, y - 15, 1.8, 0, 7); c.fill(); }
    else if (style.cap === 'pagoda') { poly(c, [[x - 13, y], [x + 13, y], [x + 8, y - 6], [x - 8, y - 6]], rc); poly(c, [[x - 9, y - 6], [x + 9, y - 6], [x + 5, y - 11], [x - 5, y - 11]], rc); }
    else if (style.cap === 'mansard') { poly(c, [[x - 12, y], [x + 12, y], [x + 7, y - 8], [x - 7, y - 8]], rc); }
    else if (style.cap === 'pitched') { poly(c, [[x - 12, y], [x + 12, y], [x, y - 10]], rc); }
    else if (style.cap === 'spire') { poly(c, [[x - 4, y], [x + 4, y], [x, y - 18]], a); }
  }
  function building(c, t) {
    // Every city draws in its country's style, not the generic
    // palette: wall colours and roof colour come from the design the
    // layout computed (the country's CAPITAL_STYLES entry), so all
    // Russian cities are red brick, all French cities cream, and so
    // on. Cities with no country style keep their own colours.
    let style = null;
    if (layout && layout.design) style = layout.design;
    else if (typeof isGovCity === 'function' && isGovCity(city) && typeof CAPITAL_STYLES !== 'undefined' && CAPITAL_STYLES[city.a3]) style = CAPITAL_STYLES[city.a3];
    if (style) {
      const rr = mulberry(Math.floor(t.seed * 1e9) + 77);
      t = Object.assign({}, t, { color: style.w[Math.floor(rr() * style.w.length)], roof: style.r });
    }
    const r = mulberry(Math.floor(t.seed * 1e9)), x = t.x, y = t.y;
    const k = t.arch === 'warehouse' ? 0.08 : t.arch === 'glass' || t.arch === 'skyscraper' ? 0.13 : 0.15;
    const x0 = x + k, y0 = y + k, x1 = x + 1 - k, y1 = y + 1 - k;
    if (t.arch === 'house') return house(c, t, r);
    if (t.arch === 'rowhouse') return rowhouse(c, t, r);
    if (t.arch === 'brownstone') return brownstone(c, t, r);
    if (t.arch === 'warehouse') return warehouse(c, t, x0, y0, x1, y1);
    if (t.arch === 'gas') return gasStation(c, t, r);
    if (t.arch === 'skyscraper') return skyscraper(c, t, r, x0, y0, x1, y1);
    const floorH = t.arch === 'shop' ? 11 : 8.2;
    const h = Math.min(300, 6 + t.floors * floorH);
    let g;
    if (t.arch === 'glass' && t.floors > 16 && r() < 0.5) { // setback tower
      const h1 = h * 0.55; g = box(c, x0, y0, x1, y1, h1, t.color); glassFaces(c, g, t.color, h1);
      const m = 0.12; g = box(c, x0 + m, y0 + m, x1 - m, y1 - m, h - h1, t.color, h1); glassFaces(c, g, t.color, h - h1, h1);
    } else {
      g = box(c, x0, y0, x1, y1, h, t.color);
      if (t.arch === 'glass') glassFaces(c, g, t.color, h);
      else if (t.arch === 'office' || t.arch === 'bank') { const rows = Math.max(1, Math.round(h / floorH)); [[g.D, g.C], [g.C, g.B]].forEach(([a, b]) => { for (let i = 0; i < rows; i++) { const yb = -(i * floorH + 2.5), yt = yb - 4.2; poly(c, [[a[0], a[1] + yb], [b[0], b[1] + yb], [b[0], b[1] + yt], [a[0], a[1] + yt]], 'rgba(42,74,110,0.62)'); } });
        const ea = lerp(g.D, g.C, 0.35), eb = lerp(g.D, g.C, 0.65); poly(c, [ea, eb, up(eb, 10), up(ea, 10)], 'rgba(20,30,40,0.35)'); const lit = lerp(g.D, g.C, 0.5); for (let i = 0; i < rows; i++) if (r() < 0.45) { c.fillStyle = 'rgba(255,232,170,0.9)'; c.fillRect(lit[0] - 6, lit[1] - (i * floorH + 6.5), 5, 3.5); } }
      else if (t.arch === 'apartment' || t.arch === 'hotel') { const rows = Math.max(1, Math.round(h / floorH)); faceGrid(c, g.D, g.C, h, rows, 4, (ri, ki) => r() < 0.25 ? 'rgba(255,232,170,0.9)' : 'rgba(55,70,85,0.62)'); faceGrid(c, g.C, g.B, h, rows, 4, 'rgba(45,58,72,0.62)');
        for (let i = 1; i < rows; i += 2) { const a = lerp(g.D, g.C, 0.25), b = lerp(g.D, g.C, 0.75); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(a[0], a[1] - i * floorH - 1); c.lineTo(b[0], b[1] - i * floorH - 1); c.stroke(); }
        c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1; for (let i = 1; i < rows; i += 2) { const a = lerp(g.D, g.C, 0.1), b = lerp(g.D, g.C, 0.9); c.beginPath(); c.moveTo(a[0], a[1] - i * floorH - 1.5); c.lineTo(b[0], b[1] - i * floorH - 1.5); c.stroke(); } }
      else if (t.arch === 'shop') shopFront(c, g, t, h);
    }
    if (t.arch !== 'shop' && t.arch !== 'factory') { // ground-floor lobby glass
      poly(c, [lerp(g.D, g.C, 0.3), lerp(g.D, g.C, 0.7), up(lerp(g.D, g.C, 0.7), 6), up(lerp(g.D, g.C, 0.3), 6)].map(p => [p[0], p[1] - (g.base || 0)]), 'rgba(30,50,70,0.75)');
    }
    if (t.arch === 'bank') { // ground-floor colonnade + entablature band
      c.fillStyle = '#f0ead8';
      for (let i = 0; i < 5; i++) { const p = lerp(g.D, g.C, 0.18 + i * 0.16); c.fillRect(p[0] - 2, p[1] - 16, 4, 16); }
      poly(c, [lerp(g.D, g.C, 0.12), lerp(g.D, g.C, 0.88), up(lerp(g.D, g.C, 0.88), 18), up(lerp(g.D, g.C, 0.12), 18)], 'rgba(240,234,216,0.35)');
    }
    if (t.arch === 'hotel') { // balcony rails on every floor
      const rows = Math.max(1, Math.round(h / floorH));
      c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1;
      for (let i = 1; i < rows; i++) {
        const a = lerp(g.D, g.C, 0.12), b = lerp(g.D, g.C, 0.88);
        c.beginPath(); c.moveTo(a[0], a[1] - i * floorH - 1); c.lineTo(b[0], b[1] - i * floorH - 1); c.stroke();
      }
    }
    if (t.arch === 'factory') { // chimney + smoke at the back corner
      const cx = (g.A[0] + g.C[0]) / 2, cy = (g.A[1] + g.C[1]) / 2 - h;
      c.fillStyle = '#8a6a5a'; c.fillRect(cx + 8, cy - 28, 7, 28);
      c.fillStyle = '#6b4f3a'; c.fillRect(cx + 8, cy - 28, 7, 3);
      c.fillStyle = 'rgba(180,180,180,0.35)'; c.beginPath(); c.arc(cx + 11, cy - 33, 6, 0, 7); c.fill();
      c.fillStyle = 'rgba(200,200,200,0.25)'; c.beginPath(); c.arc(cx + 14, cy - 40, 4, 0, 7); c.fill();
    }
    roofDetails(c, g, t, r);
    if ((t.arch === 'office' || t.arch === 'apartment' || t.arch === 'glass') && r() < 0.6) tree(c, x + 0.9, y + 0.9, 0.6);
    const top = P(x + 0.5, y + 0.5); const out = [top[0], top[1] - h];
    if (style && style.cap && style.cap !== 'flat') drawRoofCap(c, out, style);
    return out;
  }
  function glassFaces(c, g, col, h) {
    [[g.D, g.C, 0.95], [g.C, g.B, 0.78]].forEach(([a, b, f]) => {
      const grd = c.createLinearGradient(0, a[1] - h, 0, a[1]);
      grd.addColorStop(0, shade(col, f * 1.25)); grd.addColorStop(1, shade(col, f * 0.82));
      poly(c, [a, b, up(b, h), up(a, h)], grd);
      c.strokeStyle = 'rgba(255,255,255,0.28)'; c.lineWidth = 0.7;
      for (let i = 1; i < 6; i++) { const p = lerp(a, b, i / 6); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0], p[1] - h); c.stroke(); }
      c.strokeStyle = 'rgba(20,40,60,0.18)';
      for (let yy = 7; yy < h; yy += 7) { c.beginPath(); c.moveTo(a[0], a[1] - yy); c.lineTo(b[0], b[1] - yy); c.stroke(); }
      poly(c, [lerp(a, b, 0.15), lerp(a, b, 0.32), up(lerp(a, b, 0.62), h * 0.95), up(lerp(a, b, 0.45), h * 0.95)], 'rgba(255,255,255,0.18)');
    });
  }
  function shopFront(c, g, t, h) {
    const aw = ['#e5484d', '#2f7cf6', '#12a150', '#f5b301', '#7c4dff', '#ff6b2c'][Math.floor(t.seed * 6)];
    [[g.D, g.C], [g.C, g.B]].forEach(([a, b], i) => {
      poly(c, [lerp(a, b, 0.08), lerp(a, b, 0.92), up(lerp(a, b, 0.92), 7), up(lerp(a, b, 0.08), 7)], i ? 'rgba(30,55,80,0.8)' : 'rgba(40,70,100,0.75)');
      for (let s = 0; s < 6; s++) poly(c, [up(lerp(a, b, s / 6), 9), up(lerp(a, b, (s + 1) / 6), 9), up(lerp(a, b, (s + 1) / 6), 12), up(lerp(a, b, s / 6), 12)], s % 2 ? '#ffffff' : aw);
      if (h > 16) faceGrid(c, a, b, h, Math.round(h / 11), 3, 'rgba(55,70,85,0.5)', { skipGround: true });
    });
    poly(c, [up(lerp(g.D, g.C, 0.2), h - 2), up(lerp(g.D, g.C, 0.8), h - 2), up(lerp(g.D, g.C, 0.8), h + 3), up(lerp(g.D, g.C, 0.2), h + 3)], aw);
    // Shop sign board on the roof, in the awning colour.
    const sm = lerp(g.D, g.C, 0.5); c.fillStyle = '#ffffff'; c.fillRect(sm[0] - 15, sm[1] - h - 14, 30, 12); c.fillStyle = aw; c.fillRect(sm[0] - 15, sm[1] - h - 14, 30, 3);
  }
  function house(c, t, r) {
    const x = t.x, y = t.y, x0 = x + 0.22, y0 = y + 0.18, x1 = x + 0.8, y1 = y + 0.72, h = 13;
    const g = box(c, x0, y0, x1, y1, h, t.color);
    const ridgeH = 12, mA = up(lerp(P(x0, y0), P(x0, y1), 0.5), h + ridgeH), mB = up(lerp(P(x1, y0), P(x1, y1), 0.5), h + ridgeH);
    poly(c, [up(g.D, h), up(g.C, h), mB, mA], shade(t.roof, 1.0));
    poly(c, [up(g.C, h), up(g.B, h), mB], shade(t.roof, 0.75));
    c.fillStyle = shade(t.roof, 0.6); const ch = lerp(mA, mB, 0.7); c.fillRect(ch[0] - 2, ch[1] - 2, 4, 7);
    const dm = lerp(g.D, g.C, 0.5); c.fillStyle = '#6b4f3a'; c.fillRect(dm[0] - 2, dm[1] - 8, 4, 8);
    faceGrid(c, g.D, g.C, h, 1, 3, 'rgba(70,95,120,0.6)', { bottom: 0.35, top: 0.75 });
    if (r() < 0.7) tree(c, x + 0.86, y + 0.86, 0.75);
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1; const f0 = P(x + 0.06, y + 0.94), f1 = P(x + 0.94, y + 0.94); c.beginPath(); c.moveTo(f0[0], f0[1]); c.lineTo(f1[0], f1[1]); c.stroke();
    // Flower dots in the front garden.
    for (let i = 0; i < 4; i++) { const [fx, fy] = P(x + 0.1 + r() * 0.8, y + 0.75 + r() * 0.2); c.fillStyle = ['#ff8fa3', '#ffd166', '#ffffff', '#c084fc'][i % 4]; c.beginPath(); c.arc(fx, fy, 1.8, 0, 7); c.fill(); }
    const top = P(x + 0.5, y + 0.45); return [top[0], top[1] - h - ridgeH];
  }
  function rowhouse(c, t, r) {
    const x = t.x, y = t.y, n = 2; let topY = 0;
    for (let i = 0; i < n; i++) {
      const x0 = x + 0.12 + i * 0.4, x1 = x0 + 0.36, y0 = y + 0.16, y1 = y + 0.8, h = 8.5 * t.floors + 4;
      const col = i ? ['#f2c6b6', '#c8dbe8', '#f6e2a9', '#d5e8cf', '#e8cfe0', '#f1d9c4', '#c9d3ee', '#fbe7d0'][Math.floor(t.seed * 97) % 8] : t.color;
      const g = box(c, x0, y0, x1, y1, h, col);
      faceGrid(c, g.D, g.C, h, t.floors, 2, 'rgba(60,80,100,0.6)');
      const bw = [lerp(g.D, g.C, 0.2), lerp(g.D, g.C, 0.8)]; // bay window
      poly(c, [[bw[0][0], bw[0][1] - 5], [bw[1][0], bw[1][1] - 5], [bw[1][0], bw[1][1] - h + 6], [bw[0][0], bw[0][1] - h + 6]], 'rgba(255,255,255,0.22)');
      poly(c, [up(g.D, h), up(g.C, h), up(g.C, h + 3), up(g.D, h + 3)], shade(col, 0.6));
      topY = Math.max(topY, h + 3);
    }
    const top = P(x + 0.5, y + 0.5); return [top[0], top[1] - topY];
  }
  function brownstone(c, t, r) {
    // Brick rowhouse with a stoop: New York / Boston streets.
    const x = t.x, y = t.y, x0 = x + 0.14, y0 = y + 0.16, x1 = x + 0.86, y1 = y + 0.82, h = 8.5 * t.floors + 4;
    const g = box(c, x0, y0, x1, y1, h, t.color);
    faceGrid(c, g.D, g.C, h, t.floors, 3, 'rgba(60,80,100,0.6)');
    poly(c, [up(g.D, h), up(g.C, h), up(g.C, h + 3), up(g.D, h + 3)], shade(t.color, 0.6));
    const dm = lerp(g.D, g.C, 0.5);
    c.fillStyle = '#6b4f3a'; c.fillRect(dm[0] - 2, dm[1] - 8, 4, 8);
    c.fillStyle = shade(t.color, 0.7);
    for (let i = 0; i < 3; i++) c.fillRect(dm[0] - 6 + i * 1.5, dm[1] - 2 - i * 2, 12 - i * 3, 2);
    const top = P(x + 0.5, y + 0.5); return [top[0], top[1] - h - 3];
  }
  function skyscraper(c, t, r, x0, y0, x1, y1) {
    // Tall tower with setbacks, an antenna and a lit billboard — only
    // in big cities, so a skyline reads as a skyline.
    const h = Math.min(300, 6 + t.floors * 8.2);
    const h1 = h * 0.6, h2 = h * 0.85;
    let g = box(c, x0, y0, x1, y1, h1, t.color); glassFaces(c, g, t.color, h1);
    const m1 = 0.12; g = box(c, x0 + m1, y0 + m1, x1 - m1, y1 - m1, h2 - h1, t.color, h1); glassFaces(c, g, t.color, h2 - h1, h1);
    const m2 = 0.24; g = box(c, x0 + m2, y0 + m2, x1 - m2, y1 - m2, h - h2, t.color, h2); glassFaces(c, g, t.color, h - h2, h2);
    // Crown: spire, stepped crown, or glass crown — so towers differ.
    const [ax, ay] = P((x0 + x1) / 2, (y0 + y1) / 2);
    if (r() < 0.4) { c.strokeStyle = '#555'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ax, ay - h); c.lineTo(ax, ay - h - 22); c.stroke(); c.fillStyle = '#ff4d4d'; c.beginPath(); c.arc(ax, ay - h - 24, 2.5, 0, 7); c.fill(); }
    else if (r() < 0.7) { const m3 = 0.32; box(c, x0 + m3, y0 + m3, x1 - m3, y1 - m3, 10, '#dfe6ec', h); }
    else { c.fillStyle = 'rgba(180,220,245,0.9)'; c.beginPath(); c.moveTo(ax - 10, ay - h); c.lineTo(ax, ay - h - 14); c.lineTo(ax + 10, ay - h); c.fill(); }
    // Billboard on the front face, upper third.
    const bm = lerp(g.D, g.C, 0.5); const bb = ['#ff6b2c', '#e5484d', '#2f7cf6', '#f5b301'][Math.floor(r() * 4)];
    c.fillStyle = bb; c.fillRect(bm[0] - 13, bm[1] - h * 0.72, 26, 14); c.fillStyle = '#ffffff'; c.fillRect(bm[0] - 13, bm[1] - h * 0.72, 26, 2.5);
    // A tree on the sidewalk corner, so towers don't sit on bare concrete.
    if (r() < 0.7) tree(c, t.x + 0.9, t.y + 0.9, 0.6);
    const top = P(t.x + 0.5, t.y + 0.5); return [top[0], top[1] - h - 24];
  }
  function gasStation(c, t, r) {
    // Canopy on pillars, pumps underneath, a small shop behind, and a
    // tall price sign by the road.
    const x = t.x, y = t.y;
    const g = box(c, x + 0.15, y + 0.35, x + 0.85, y + 0.65, 9, '#f2f2f2');
    c.fillStyle = ['#e5484d', '#2f7cf6', '#12a150', '#f5b301'][Math.floor(r() * 4)];
    c.fillRect(g.A[0], g.A[1] - 9, g.C[0] - g.A[0], 3);
    // Canopy: a flat roof on four thin pillars over the pumps.
    const cy = P(x + 0.5, y + 0.35)[1] - 22;
    const can = [P(x + 0.2, y + 0.15), P(x + 0.8, y + 0.15), P(x + 0.8, y + 0.55), P(x + 0.2, y + 0.55)];
    poly(c, can, '#ffffff'); c.strokeStyle = '#d0d0d0'; c.lineWidth = 1; c.beginPath(); c.moveTo(can[0][0], can[0][1]); c.lineTo(can[1][0], can[1][1]); c.lineTo(can[2][0], can[2][1]); c.lineTo(can[3][0], can[3][1]); c.closePath(); c.stroke();
    for (let i = 0; i < 2; i++) {
      const px = P(x + 0.35 + i * 0.3, y + 0.35);
      c.fillStyle = '#e5484d'; c.fillRect(px[0] - 3, px[1] - 10, 6, 10); c.fillStyle = '#ffffff'; c.fillRect(px[0] - 3, px[1] - 8, 6, 2);
    }
    // A car waiting at a pump.
    car(c, x + 0.5, y + 0.35, true, '#2f7cf6');
    // Price sign by the road.
    const [sx, sy] = P(x + 0.9, y + 0.1);
    c.fillStyle = '#333'; c.fillRect(sx - 1, sy - 18, 2, 18);
    c.fillStyle = '#1f5fd0'; c.fillRect(sx - 8, sy - 30, 16, 12); c.fillStyle = '#ffffff'; c.font = 'bold 7px sans-serif'; c.textAlign = 'center'; c.fillText('⛽', sx, sy - 21);
    const top = P(x + 0.5, y + 0.5); return [top[0], top[1] - 30];
  }
  function warehouse(c, t, x0, y0, x1, y1) {
    const h = 18, g = box(c, x0, y0, x1, y1, h, t.color);
    for (let i = 0; i < 4; i++) { // sawtooth roof
      const f0 = i / 4, f1 = (i + 1) / 4, a = up(lerp(g.A, g.B, f0), h), b = up(lerp(g.A, g.B, f1), h), cc = up(lerp(g.D, g.C, f1), h), d = up(lerp(g.D, g.C, f0), h);
      poly(c, [a, d, up(d, 7), up(a, 7)], '#cfd6dc');
      poly(c, [up(a, 7), up(d, 7), cc, b], shade(t.color, 1.12));
    }
    [0.2, 0.5, 0.8].forEach(f => { const p = lerp(g.D, g.C, f); poly(c, [[p[0] - 5, p[1]], [p[0] + 5, p[1] + 2.5], [p[0] + 5, p[1] - 8], [p[0] - 5, p[1] - 10.5]], '#7d858d'); });
    // A delivery truck at the loading dock.
    const [tx, ty] = P(t.x + 0.5, t.y + 0.95); c.fillStyle = '#f4f4f4'; c.fillRect(tx - 12, ty - 10, 18, 8); c.fillStyle = t.color; c.fillRect(tx + 6, ty - 8, 8, 6);
    // Shipping containers stacked beside the warehouse.
    const cols = ['#e5484d', '#2f7cf6', '#12a150', '#f5b301'];
    for (let i = 0; i < 3; i++) { const cx = t.x + 0.12 + i * 0.28, cy = t.y + 0.85; box(c, cx, cy, cx + 0.22, cy + 0.12, 6, cols[i % 4]); }
    const top = P(t.x + 0.5, t.y + 0.5); return [top[0], top[1] - h - 7];
  }
  function tree(c, x, y, s) {
    const [mx, my] = P(x, y);
    c.fillStyle = 'rgba(30,60,20,0.18)'; c.beginPath(); c.ellipse(mx + 3, my + 1, 7 * s, 3.5 * s, 0, 0, 7); c.fill();
    c.fillStyle = '#7a5a3c'; c.fillRect(mx - 1, my - 7 * s, 2, 7 * s);
    c.fillStyle = '#3e8f3a'; c.beginPath(); c.arc(mx, my - 11 * s, 7 * s, 0, 7); c.fill();
    c.fillStyle = '#56ad4b'; c.beginPath(); c.arc(mx - 2 * s, my - 13 * s, 4.5 * s, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.arc(mx - 3 * s, my - 14.5 * s, 2 * s, 0, 7); c.fill();
  }
  function car(c, x, y, horiz, col) {
    const L = 0.3, Wd = 0.16, x0 = horiz ? x - L / 2 : x - Wd / 2, x1 = horiz ? x + L / 2 : x + Wd / 2, y0 = horiz ? y - Wd / 2 : y - L / 2, y1 = horiz ? y + Wd / 2 : y + L / 2;
    box(c, x0, y0, x1, y1, 4, col);
    const m = 0.25; box(c, x0 + (horiz ? L * m : 0.02), y0 + (horiz ? 0.02 : L * m), x1 - (horiz ? L * m : 0.02), y1 - (horiz ? 0.02 : L * m), 3, '#9fc3dd', 4);
  }
  function park(c, t, r) {
    if (t.seed > 0.75) { const [mx, my] = P(t.x + 0.5, t.y + 0.5); c.fillStyle = '#4fb6d8'; c.beginPath(); c.ellipse(mx, my, TW * 0.25, TH * 0.22, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1; c.stroke(); }
    c.strokeStyle = '#efe6cf'; c.lineWidth = 3; const a = P(t.x, t.y + 0.5), b = P(t.x + 1, t.y + 0.5); c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 6, b[0], b[1]); c.stroke();
    for (let i = 0; i < 3; i++) tree(c, t.x + 0.15 + r() * 0.7, t.y + 0.15 + r() * 0.7, 0.85 + r() * 0.45);
    for (let i = 0; i < 5; i++) { const [fx, fy] = P(t.x + 0.1 + r() * 0.8, t.y + 0.1 + r() * 0.8); c.fillStyle = ['#ff8fa3', '#ffd166', '#ffffff'][i % 3]; c.beginPath(); c.arc(fx, fy, 1.8, 0, 7); c.fill(); }
    const [bx, by] = P(t.x + 0.5, t.y + 0.2); c.fillStyle = '#7a5a3c'; c.fillRect(bx - 7, by - 2, 14, 3); c.fillRect(bx - 7, by + 8, 14, 3);
    // Flower beds and a tiny playground slide.
    for (let i = 0; i < 2; i++) { const [gx, gy] = P(t.x + 0.2 + i * 0.55, t.y + 0.65); c.fillStyle = '#ff8fa3'; c.beginPath(); c.ellipse(gx, gy, 8, 4, 0, 0, 7); c.fill(); c.fillStyle = '#ffd166'; c.beginPath(); c.arc(gx, gy, 2, 0, 7); c.fill(); }
    const [sx, sy] = P(t.x + 0.8, t.y + 0.8); c.strokeStyle = '#e5484d'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + 8, sy + 6); c.stroke();
  }

  // ---------- landmarks: original, per-city, not traced copies ----------
  // Each returns its top screen point (for the landmark pin) and sets
  // landmarkName. Silhouettes are drawn fresh in this file's own style.
  function latticeTower(c, col, h, deckCol) {
    const L = layout.landmark, [cx, base] = P(L.x + 1.5, L.y + 2.6);
    const w0 = 34, w1 = 8;
    c.strokeStyle = col; c.lineWidth = 3;
    const leg = sgn => { c.beginPath(); c.moveTo(cx + sgn * w0, base); c.lineTo(cx + sgn * w1 * 0.5, base - h); c.stroke(); };
    leg(-1); leg(1);
    c.lineWidth = 1.2;
    for (let i = 1; i <= 6; i++) { const f = i / 7, y = base - h * f, w = w0 * (1 - f) + w1 * f; c.beginPath(); c.moveTo(cx - w, y); c.lineTo(cx + w, y + 8); c.moveTo(cx + w, y); c.lineTo(cx - w, y + 8); c.stroke(); }
    [0.45, 0.8].forEach(f => { const w = w0 * (1 - f) + w1 * f; c.fillStyle = deckCol; c.fillRect(cx - w - 6, base - h * f - 4, (w + 6) * 2, 6); });
    c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, base - h); c.lineTo(cx, base - h - 22); c.stroke();
    c.fillStyle = '#ffd166'; c.beginPath(); c.arc(cx, base - h - 24, 3, 0, 7); c.fill();
    return [cx, base - h - 26];
  }
  function clockTower(c, s) {
    const L = layout.landmark, g = box(c, L.x + 1.0, L.y + 1.0, L.x + 2.0, L.y + 2.0, 120, (s && s.c && s.c[0]) || '#c9a86a');
    const fm = lerp(g.D, g.C, 0.5); c.fillStyle = '#fdf6e3'; c.beginPath(); c.arc(fm[0], fm[1] - 100, 13, 0, 7); c.fill(); c.strokeStyle = '#333'; c.lineWidth = 1.5; c.beginPath(); c.arc(fm[0], fm[1] - 100, 13, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(fm[0], fm[1] - 100); c.lineTo(fm[0], fm[1] - 108); c.moveTo(fm[0], fm[1] - 100); c.lineTo(fm[0] + 7, fm[1] - 97); c.stroke();
    poly(c, [up(lerp(g.D, g.C, 0.2), 120), up(lerp(g.D, g.C, 0.8), 120), [fm[0], fm[1] - 150]], '#3a5a40');
    return [fm[0], fm[1] - 150];
  }
  function torchStatue(c) {
    const L = layout.landmark, g = box(c, L.x + 0.9, L.y + 0.9, L.x + 2.1, L.y + 2.1, 22, '#d8d2c2');
    const [cx, base] = P(L.x + 1.5, L.y + 1.5); const top = base - 22;
    c.fillStyle = '#6fae9a'; c.beginPath(); c.moveTo(cx - 10, top); c.lineTo(cx - 3, top - 52); c.lineTo(cx + 9, top); c.closePath(); c.fill();
    c.beginPath(); c.arc(cx - 1, top - 58, 6, 0, 7); c.fill();
    c.strokeStyle = '#6fae9a'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx + 4, top - 44); c.lineTo(cx + 16, top - 66); c.stroke();
    c.fillStyle = '#ffb020'; c.beginPath(); c.ellipse(cx + 16, top - 70, 4, 7, 0, 0, 7); c.fill();
    return [cx + 16, top - 78];
  }
  function gate(c, col) {
    const L = layout.landmark, g = box(c, L.x + 0.6, L.y + 1.0, L.x + 2.4, L.y + 2.0, 14, col);
    const a = lerp(g.D, g.C, 0.5);
    for (let i = 0; i < 5; i++) { const p = lerp(g.D, g.C, 0.12 + i * 0.19); c.fillStyle = '#efe9dc'; c.fillRect(p[0] - 2.5, p[1] - 52, 5, 38); }
    poly(c, [up(lerp(g.D, g.C, 0.05), 56), up(lerp(g.D, g.C, 0.95), 56), up(lerp(g.D, g.C, 0.95), 66), up(lerp(g.D, g.C, 0.05), 66)], col);
    const [cx, cy] = P(L.x + 1.5, L.y + 1.5); c.fillStyle = '#8a7a5a'; c.beginPath(); c.arc(cx, cy - 74, 4, 0, 7); c.fill();
    return [cx, cy - 80];
  }
  function arena(c) {
    const L = layout.landmark, [cx, cy] = P(L.x + 1.5, L.y + 1.5);
    c.fillStyle = '#c9b49a'; c.beginPath(); c.ellipse(cx, cy, 46, 24, 0, 0, 7); c.fill();
    c.fillStyle = '#e8dcc4'; c.beginPath(); c.ellipse(cx, cy - 18, 46, 24, 0, 0, 7); c.fill();
    c.fillStyle = '#8a7a5a'; c.beginPath(); c.ellipse(cx, cy - 18, 30, 15, 0, 0, 7); c.fill();
    c.fillStyle = '#6fbf5a'; c.beginPath(); c.ellipse(cx, cy - 18, 20, 10, 0, 0, 7); c.fill();
    return [cx, cy - 42];
  }
  function pyramid(c, s) {
    const L = layout.landmark, [cx, cy] = P(L.x + 1.5, L.y + 2.2);
    poly(c, [[cx - 44, cy], [cx + 44, cy], [cx, cy - 62]], (s && s.c && s.c[0]) || '#d9b878');
    poly(c, [[cx, cy - 62], [cx + 44, cy], [cx + 20, cy - 10]], '#c2a05e');
    return [cx, cy - 62];
  }
  function pagoda(c, s) {
    const L = layout.landmark, [cx, base] = P(L.x + 1.5, L.y + 2.2); let y = base, w = 30;
    const roof = (s && s.c && s.c[0]) || '#a63a2e', wall = (s && s.c && s.c[1]) || '#f2e2c4';
    for (let i = 0; i < 4; i++) { c.fillStyle = roof; c.fillRect(cx - w - 6, y - 8, (w + 6) * 2, 8); c.fillStyle = wall; c.fillRect(cx - w, y - 22, w * 2, 14); w -= 6; y -= 24; }
    poly(c, [[cx - 10, y], [cx + 10, y], [cx, y - 14]], '#3a5a40');
    return [cx, y - 14];
  }
  function obelisk(c, s) {
    const L = layout.landmark, [cx, base] = P(L.x + 1.5, L.y + 2.2);
    poly(c, [[cx - 9, base], [cx + 9, base], [cx + 4, base - 110], [cx - 4, base - 110]], (s && s.c && s.c[0]) || '#e8e2d2');
    poly(c, [[cx - 4, base - 110], [cx + 4, base - 110], [cx, base - 124]], '#c9a86a');
    return [cx, base - 124];
  }
  function lighthouse(c) {
    const L = layout.landmark, [cx, base] = P(L.x + 1.5, L.y + 2.2);
    for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#e5484d' : '#ffffff'; c.fillRect(cx - 10 + i * 0.4, base - (i + 1) * 16, 20 - i * 0.8, 16); }
    c.fillStyle = '#ffd166'; c.fillRect(cx - 7, base - 96, 14, 12); c.fillStyle = '#333'; c.beginPath(); c.moveTo(cx - 9, base - 96); c.lineTo(cx, base - 106); c.lineTo(cx + 9, base - 96); c.fill();
    c.fillStyle = 'rgba(255,233,163,0.25)'; poly(c, [[cx + 7, base - 90], [cx + 44, base - 78], [cx + 44, base - 62], [cx + 7, base - 78]], c.fillStyle);
    return [cx, base - 106];
  }
  function cathedral(c, s) {
    const L = layout.landmark, g = box(c, L.x + 0.8, L.y + 0.8, L.x + 2.2, L.y + 2.2, 30, (s && s.c && s.c[0]) || '#d8d2c2');
    const fm = lerp(g.D, g.C, 0.5); c.fillStyle = '#fdf6e3'; c.beginPath(); c.arc(fm[0], fm[1] - 18, 7, 0, 7); c.fill();
    [[-1, 0.25], [1, 0.75]].forEach(([sgn, f]) => { const p = lerp(g.D, g.C, f); poly(c, [[p[0] - 6, p[1] - 30], [p[0] + 6, p[1] - 30], [p[0], p[1] - 78]], '#8a7a5a'); });
    return [fm[0], fm[1] - 78];
  }
  function onionDomes(c, s) {
    const L = layout.landmark, g = box(c, L.x + 0.7, L.y + 0.9, L.x + 2.3, L.y + 2.1, 26, '#efe9dc');
    const cols = (s && s.c && s.c.length) ? s.c : ['#e5484d', '#2f7cf6', '#12a150'];
    [0.2, 0.5, 0.8].forEach((f, i) => { const p = lerp(g.D, g.C, f); c.fillStyle = cols[i]; c.beginPath(); c.arc(p[0], p[1] - 32, 8, 0, 7); c.fill(); poly(c, [[p[0] - 8, p[1] - 32], [p[0] + 8, p[1] - 32], [p[0], p[1] - 46]], cols[i]); });
    return [lerp(g.D, g.C, 0.5)[0], g.D[1] - 46];
  }
  // New landmark types, one drawing each, coloured per capital.
  function temple(c, s) {
    const L = layout.landmark, wall = (s && s.c && s.c[0]) || '#e8e2d2', roof = (s && s.c && s.c[1]) || '#c9a86a';
    const g = box(c, L.x + 0.5, L.y + 0.8, L.x + 2.5, L.y + 2.2, 10, wall);
    for (let i = 0; i < 5; i++) { const p = lerp(g.D, g.C, 0.12 + i * 0.19); c.fillStyle = '#f6f1e4'; c.fillRect(p[0] - 2.5, p[1] - 46, 5, 36); }
    poly(c, [up(lerp(g.D, g.C, 0.05), 46), up(lerp(g.D, g.C, 0.95), 46), up(lerp(g.D, g.C, 0.5), 62)], roof);
    const [cx, cy] = P(L.x + 1.5, L.y + 1.5); return [cx, cy - 62];
  }
  function palace(c, s) {
    const L = layout.landmark, wall = (s && s.c && s.c[0]) || '#e8e2d2', trim = (s && s.c && s.c[1]) || '#8a7a5a';
    const g = box(c, L.x + 0.4, L.y + 0.7, L.x + 2.6, L.y + 2.3, 30, wall);
    box(c, L.x + 1.1, L.y + 0.9, L.x + 1.9, L.y + 2.1, 40, wall);
    for (let j = 0; j < 5; j++) { const p = lerp(g.D, g.C, 0.15 + j * 0.175); c.fillStyle = trim; c.fillRect(p[0] - 3, p[1] - 12, 6, 10); }
    poly(c, [up(lerp(g.D, g.C, 0.05), 40), up(lerp(g.D, g.C, 0.95), 40), up(lerp(g.D, g.C, 0.5), 52)], trim);
    const [cx, cy] = P(L.x + 1.5, L.y + 1.5);
    c.strokeStyle = '#555'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx, cy - 52); c.lineTo(cx, cy - 68); c.stroke();
    c.font = '15px sans-serif'; c.textAlign = 'left'; c.fillText(W.byA3[city.a3].flag, cx + 1, cy - 58);
    return [cx, cy - 68];
  }
  function mosque(c, s) {
    const L = layout.landmark, wall = (s && s.c && s.c[0]) || '#e8e2d2', dome = (s && s.c && s.c[1]) || '#c9a86a';
    box(c, L.x + 0.6, L.y + 0.8, L.x + 2.4, L.y + 2.2, 22, wall);
    const [cx, cy] = P(L.x + 1.5, L.y + 1.5);
    c.fillStyle = dome; c.beginPath(); c.arc(cx, cy - 22, 16, Math.PI, 0); c.fill();
    c.fillStyle = '#ffd166'; c.beginPath(); c.arc(cx, cy - 40, 2.5, 0, 7); c.fill();
    [-1, 1].forEach(sgn => { const mx = cx + sgn * 30; c.fillStyle = wall; c.fillRect(mx - 2, cy - 66, 4, 66); poly(c, [[mx - 4, cy - 66], [mx + 4, cy - 66], [mx, cy - 76]], dome); });
    return [cx, cy - 76];
  }
  function castle(c, s) {
    const L = layout.landmark, wall = (s && s.c && s.c[0]) || '#c9b49a', roof = (s && s.c && s.c[1]) || '#7a5a3c';
    const g = box(c, L.x + 0.7, L.y + 0.9, L.x + 2.3, L.y + 2.1, 30, wall);
    [-1, 1].forEach(sgn => {
      const tx = L.x + 1.5 + sgn * 0.8, ty = L.y + 1.5, tc = P(tx, ty);
      box(c, tx - 0.3, ty - 0.3, tx + 0.3, ty + 0.3, 48, wall);
      poly(c, [[tc[0] - 12, tc[1] - 48], [tc[0] + 12, tc[1] - 48], [tc[0], tc[1] - 62]], roof);
    });
    for (let i = 0; i < 5; i++) { const p = lerp(g.D, g.C, 0.12 + i * 0.19); c.fillStyle = wall; c.fillRect(p[0] - 3, p[1] - 36, 6, 6); }
    const [cx, cy] = P(L.x + 1.5, L.y + 1.5); return [cx, cy - 62];
  }
  function sphereTower(c, s) {
    const L = layout.landmark, tower = (s && s.c && s.c[0]) || '#c9d6e2', sphere = (s && s.c && s.c[1]) || '#e8eaee';
    box(c, L.x + 1.2, L.y + 1.2, L.x + 1.8, L.y + 1.8, 110, tower);
    const [cx, cy] = P(L.x + 1.5, L.y + 1.5);
    c.fillStyle = sphere; c.beginPath(); c.arc(cx, cy - 128, 18, 0, 7); c.fill();
    c.strokeStyle = tower; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy - 110); c.lineTo(cx, cy - 148); c.stroke();
    return [cx, cy - 148];
  }
  function tower(c, s) {
    const L = layout.landmark, glass = (s && s.c && s.c[0]) || '#5f6e7e';
    const g = box(c, L.x + 0.9, L.y + 0.9, L.x + 2.1, L.y + 2.1, 150, glass);
    faceGrid(c, g.D, g.C, 150, 10, 4, 'rgba(255,255,255,0.18)');
    const [cx, cy] = P(L.x + 1.5, L.y + 1.5);
    c.strokeStyle = glass; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy - 150); c.lineTo(cx, cy - 175); c.stroke();
    c.fillStyle = '#ffd166'; c.beginPath(); c.arc(cx, cy - 177, 2.5, 0, 7); c.fill();
    return [cx, cy - 180];
  }
  // The Kremlin as it really stands: a long red-brick crenellated wall,
  // the gold domes of its cathedrals behind it, and its towers with
  // green spires — the middle one the Spasskaya clock tower.
  function kremlin(c, s) {
    const L = layout.landmark, wall = (s && s.c && s.c[0]) || '#a63a2e', roof = (s && s.c && s.c[1]) || '#3a5a40';
    const g = box(c, L.x + 0.3, L.y + 0.9, L.x + 2.7, L.y + 2.1, 14, wall);
    [0.3, 0.5, 0.7].forEach(f => { const p = lerp(g.D, g.C, f); c.fillStyle = '#ffd166'; c.beginPath(); c.arc(p[0], p[1] - 26, 7, Math.PI, 0); c.fill(); });
    for (let i = 0; i < 9; i++) { const p = lerp(g.D, g.C, 0.08 + i * 0.105); c.fillStyle = wall; c.fillRect(p[0] - 3, p[1] - 20, 6, 6); }
    [[0.18, 40, false], [0.5, 58, true], [0.82, 40, false]].forEach(([f, h, clock]) => {
      const p = lerp(g.D, g.C, f);
      c.fillStyle = wall; c.fillRect(p[0] - 7, p[1] - h, 14, h);
      poly(c, [[p[0] - 9, p[1] - h], [p[0] + 9, p[1] - h], [p[0], p[1] - h - 16]], roof);
      if (clock) {
        c.fillStyle = '#fdf6e3'; c.beginPath(); c.arc(p[0], p[1] - h + 12, 6, 0, 7); c.fill();
        c.strokeStyle = '#333'; c.lineWidth = 1; c.beginPath(); c.arc(p[0], p[1] - h + 12, 6, 0, 7); c.stroke();
        c.fillStyle = '#e5484d'; c.beginPath(); c.arc(p[0], p[1] - h - 18, 2.5, 0, 7); c.fill();
      }
    });
    const mid = lerp(g.D, g.C, 0.5); return [mid[0], mid[1] - 76];
  }
  const LANDMARK_DRAW = {
    dome: capitol, clock: clockTower, arena: arena, pagoda: pagoda, onion: onionDomes,
    pyramid: pyramid, obelisk: obelisk, lighthouse: lighthouse, cathedral: cathedral,
    temple: temple, palace: palace, mosque: mosque, castle: castle, sphere: sphereTower,
    tower: tower, kremlin: kremlin,
    lattice: (c, s) => latticeTower(c, (s && s.c && s.c[0]) || '#7a5a3c', (s && s.h) || 180, (s && s.c && s.c[1]) || '#5f6e7e'),
    gate: (c, s) => gate(c, (s && s.c && s.c[0]) || '#c9b49a'),
  };
  function landmark(c) {
    const n = city.name;
    // Capitals use their real landmark from landmarks.js, drawn in
    // their own colours — never the generic hash pick.
    if (typeof isGovCity === 'function' && isGovCity(city) && typeof CAPITAL_LANDMARKS !== 'undefined' && CAPITAL_LANDMARKS[city.a3]) {
      const e = CAPITAL_LANDMARKS[city.a3];
      landmarkName = e.n; landmarkEmoji = e.e || '';
      return (LANDMARK_DRAW[e.t] || obelisk)(c, e);
    }
    landmarkEmoji = '';
    if (n === 'Paris') { landmarkName = 'Iron Tower'; return latticeTower(c, '#7a5a3c', 190, '#5f6e7e'); }
    if (n === 'Tokyo') { landmarkName = 'Red Tower'; return latticeTower(c, '#d23c2e', 170, '#f2f2f2'); }
    if (n === 'London') { landmarkName = 'Clock Tower'; return clockTower(c); }
    if (n === 'New York') { landmarkName = 'Torch Statue'; return torchStatue(c); }
    if (n === 'Washington, D.C.') { landmarkName = 'Capitol'; return capitol(c); }
    if (n === 'Rome') { landmarkName = 'Grand Arena'; return arena(c); }
    if (n === 'Beijing') { landmarkName = 'Pagoda Tower'; return pagoda(c); }
    if (n === 'Moscow') { landmarkName = 'Moscow Kremlin'; return kremlin(c); }
    if (n === 'Cairo') { landmarkName = 'Great Pyramid'; return pyramid(c); }
    if (n === 'Berlin') { landmarkName = 'Victory Gate'; return gate(c, '#c9b49a'); }
    if (n === 'Athens') { landmarkName = 'Temple'; return gate(c, '#e8e2d2'); }
    if (n === 'Seoul') { landmarkName = 'Pagoda Tower'; return pagoda(c); }
    const picks = [['Obelisk', obelisk], ['Lighthouse', lighthouse], ['Cathedral', cathedral], ['Grand Arena', arena], ['Pagoda Tower', pagoda]];
    const [nm, fn] = picks[hashStr('lm:' + n) % picks.length]; landmarkName = nm; return fn(c);
  }

  function capitol(c, s) {
    const L = layout.landmark, x0 = L.x + 0.35, y0 = L.y + 0.75, x1 = L.x + 2.65, y1 = L.y + 2.25;
    const wall = (s && s.c && s.c[0]) || '#f1ece2', domeHi = (s && s.c && s.c[1]) || '#f6f1e4', domeLo = (s && s.c && s.c[2]) || '#b9b0a0';
    shadowOf(c, x0, y0, x1, y1, 40);
    const g = box(c, x0, y0, x1, y1, 26, wall);
    [[g.D, g.C], [g.C, g.B]].forEach(([a, b]) => { for (let i = 0; i < 14; i++) { const p = lerp(a, b, (i + 0.5) / 14); c.fillStyle = 'rgba(160,150,135,0.55)'; c.fillRect(p[0] - 0.8, p[1] - 22, 1.6, 18); } });
    const pc = lerp(g.D, g.C, 0.5); poly(c, [[pc[0] - 22, pc[1] - 26 + 11], [pc[0] + 22, pc[1] - 26 + 11 + 0], [pc[0], pc[1] - 26 - 4]], '#e6dfd0');
    const [cx, cy] = P((x0 + x1) / 2, (y0 + y1) / 2);
    const top = cy - 26;
    c.fillStyle = '#e9e3d6'; c.fillRect(cx - 18, top - 16, 36, 16); // drum
    c.fillStyle = 'rgba(150,140,125,0.6)'; for (let i = 0; i < 8; i++) c.fillRect(cx - 16 + i * 4.4, top - 14, 1.4, 12);
    const grd = c.createRadialGradient(cx - 6, top - 28, 2, cx, top - 16, 22); grd.addColorStop(0, domeHi); grd.addColorStop(1, domeLo);
    c.fillStyle = grd; c.beginPath(); c.ellipse(cx, top - 16, 18, 20, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#e3dccd'; c.fillRect(cx - 3, top - 44, 6, 8); c.beginPath(); c.arc(cx, top - 45, 3.5, Math.PI, 0); c.fill();
    c.strokeStyle = '#555'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx, top - 48); c.lineTo(cx, top - 70); c.stroke();
    c.font = '15px sans-serif'; c.textAlign = 'left'; c.fillText(W.byA3[city.a3].flag, cx + 1, top - 58);
    for (let i = 0; i < 6; i++) { const r = mulberry(i + 7); tree(c, L.x + 0.15 + r() * 2.7, L.y + 0.1 + r() * 0.5, 0.8); }
    const fx = P(L.x + 1.5, L.y + 2.7); c.fillStyle = '#9ec9e6'; c.beginPath(); c.ellipse(fx[0], fx[1], 12, 6, 0, 0, 7); c.fill(); c.fillStyle = '#d9d2c2'; c.fillRect(fx[0] - 1.5, fx[1] - 8, 3, 8);
    return [cx, top - 48];
  }


  function bridge(c) {
    const N = layout.N, ws = layout.waterSide; if (ws < 0) return;
    const mid = (N - 1) / 2, horiz = ws === 1 || ws === 3;
    const a = horiz ? P(ws === 1 ? N - 5 : 0, mid) : P(mid, ws === 0 ? 0 : N - 5);
    const b = horiz ? P(ws === 1 ? N - 1 : 4, mid) : P(mid, ws === 0 ? 4 : N - 1);
    c.strokeStyle = '#7a828e'; c.lineWidth = 15; c.lineCap = 'round'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
    c.strokeStyle = '#f2d36b'; c.lineWidth = 1.6; c.setLineDash([8, 7]); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); c.setLineDash([]);
    c.strokeStyle = '#e5484d'; c.lineWidth = 2;
    [0.33, 0.66].forEach(f => { const mx = a[0] + (b[0] - a[0]) * f, my = a[1] + (b[1] - a[1]) * f; c.beginPath(); c.moveTo(mx, my - 6); c.lineTo(mx, my - 34); c.stroke(); c.beginPath(); c.moveTo(mx - 7, my - 34); c.lineTo(mx + 7, my - 34); c.stroke(); });
  }

  // Mars city: dirt and mines only — no streets, buildings, parks or
  // landmarks. Same isometric grid as an Earth city, so taps and pins
  // work the same way; only the ground and the mine sites differ.
  function renderMars(c) {
    const N = layout.N, T = layout.tiles;
    const sky = c.createLinearGradient(0, 0, 0, H2);
    sky.addColorStop(0, '#120a12'); sky.addColorStop(0.5, '#2a1210'); sky.addColorStop(1, '#4a2418');
    c.fillStyle = sky; c.fillRect(0, 0, W2, H2);
    c.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 40; i++) { const sx = (i * 173) % W2, sy = (i * 89) % Math.max(80, oy - 60); c.fillRect(sx, sy, 2, 2); }
    const dirt = ['#b5533c', '#a84a34', '#c05e42', '#9e4630'];
    T.forEach(t => {
      const fill = dirt[Math.floor(t.seed * dirt.length) % dirt.length];
      diamond(c, t.x, t.y, fill);
      diamond(c, t.x, t.y, shade(fill, 0.92), 0.06);
      if (t.kind === 'dirt' && t.seed > 0.72) { // crater
        const [cx, cy] = P(t.x + 0.5, t.y + 0.5);
        c.fillStyle = 'rgba(60,20,12,0.45)'; c.beginPath(); c.ellipse(cx, cy, 12, 6, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,220,190,0.25)'; c.beginPath(); c.ellipse(cx - 3, cy - 2, 6, 2.5, 0, 0, 7); c.fill();
      }
      if (t.kind === 'dirt' && t.seed < 0.25) { // scattered rocks
        const [rx, ry] = P(t.x + 0.3 + t.seed, t.y + 0.6);
        c.fillStyle = '#7a3a28'; c.beginPath(); c.arc(rx, ry, 3, 0, 7); c.fill();
      }
      if (t.kind === 'mine') {
        const [cx, cy] = P(t.x + 0.5, t.y + 0.5);
        // Open pit, spoil heap, shaft headframe and conveyor.
        c.fillStyle = '#2b120c'; c.beginPath(); c.ellipse(cx, cy + 2, 20, 10, 0, 0, 7); c.fill();
        c.fillStyle = '#5e2c1c'; c.beginPath(); c.ellipse(cx, cy, 14, 7, 0, 0, 7); c.fill();
        c.fillStyle = '#8a4a30'; c.beginPath(); c.ellipse(cx + 18, cy + 8, 12, 6, 0, 0, 7); c.fill();
        c.strokeStyle = '#d8c9b0'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(cx - 8, cy - 4); c.lineTo(cx - 4, cy - 30); c.moveTo(cx + 8, cy - 4); c.lineTo(cx + 4, cy - 30); c.moveTo(cx - 8, cy - 28); c.lineTo(cx + 8, cy - 28); c.stroke();
        c.strokeStyle = '#3a3f45'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(cx + 18, cy + 6); c.lineTo(cx + 34, cy + 16); c.stroke();
        roofs[t.y * N + t.x] = [cx, cy - 32];
      }
    });
  }

  function render() {
    const N = layout.N, T = layout.tiles, maxH = 320; occluders = [];
    W2 = N * TW + 140; H2 = N * TH + maxH + 120; ox = W2 / 2; oy = maxH + 40;
    const dpr = Math.min(1.6, window.devicePixelRatio || 1);
    img = document.createElement('canvas'); img.width = W2 * dpr; img.height = H2 * dpr;
    const c = img.getContext('2d'); c.scale(dpr, dpr);
    if (marsMode) { renderMars(c); return; }
    // Sky above the city, sea around it: the gradient runs sky blue to
    // sea blue, so the ground outside the city diamond reads as water
    // on every side, not a green void. Tiles cover the diamond itself.
    const sky = c.createLinearGradient(0, 0, 0, H2);
    sky.addColorStop(0, '#7ec3f2'); sky.addColorStop(0.45, '#a8d8e8'); sky.addColorStop(1, '#2e8fc7');
    c.fillStyle = sky; c.fillRect(0, 0, W2, H2);
    const cr = mulberry(hashStr('clouds:' + city.code + city.name));
    for (let i = 0; i < 6; i++) {
      const cx = cr() * W2, cy = 30 + cr() * Math.max(60, oy - 100);
      c.fillStyle = 'rgba(255,255,255,0.85)';
      c.beginPath(); c.ellipse(cx, cy, 46, 14, 0, 0, 7); c.ellipse(cx - 28, cy + 5, 30, 10, 0, 0, 7); c.ellipse(cx + 30, cy + 5, 32, 11, 0, 0, 7); c.fill();
    }
    // Sea shimmer in the margins: tiles drawn later cover the diamond,
    // so these wavy lines only show as water around the city.
    const wr = mulberry(hashStr('waves:' + city.code + city.name));
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1.5;
    const waveLine = (wy) => { c.beginPath(); for (let wx = 0; wx <= W2; wx += 60) { const wv = Math.sin(wx / 55 + wy / 40) * 3; if (wx === 0) c.moveTo(wx, wy + wv); else c.lineTo(wx, wy + wv); } c.stroke(); };
    for (let i = 0; i < 4; i++) waveLine(H2 - 14 - i * 18 - wr() * 6);
    waveLine(880 + wr() * 40); waveLine(1030 + wr() * 40);
    // pass 1: ground
    T.forEach(t => {
      if (t.kind === 'water') water(c, t); else if (t.kind === 'beach') beach(c, t); else if (t.kind === 'road') road(c, t, T);
      else if (t.kind === 'plaza') plazaGround(c, t); else lotGround(c, t);
    });
    bridge(c);
    // Shoreline foam where the city meets the surrounding sea.
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 2;
    const vL = P(0, N), vB = P(N, N), vR = P(N, 0);
    c.beginPath(); c.moveTo(vL[0], vL[1]); c.lineTo(vB[0], vB[1]); c.lineTo(vR[0], vR[1]); c.stroke();
    // pass 2: shadows
    T.forEach(t => { if (t.kind === 'lot' && t.arch !== 'house') { const h = Math.min(300, 6 + t.floors * (t.arch === 'shop' ? 11 : 8.2)); shadowOf(c, t.x + 0.15, t.y + 0.15, t.x + 0.85, t.y + 0.85, t.arch === 'warehouse' ? 25 : h); } });
    // pass 3: objects back to front
    const objs = [];
    T.forEach(t => {
      const d = t.x + t.y;
      if (t.kind === 'lot') {
        objs.push([d + 0.9, t.x, () => { roofs[t.y * N + t.x] = building(c, t); }]);
        // Occluder for moving cars: the building's screen silhouette, so
        // a car driving behind it hides instead of driving over its roof.
        const kk = (t.arch === 'warehouse' || t.arch === 'factory') ? 0.08 : (t.arch === 'glass' || t.arch === 'skyscraper') ? 0.13 : 0.15;
        const hh = t.arch === 'house' ? 10 + t.floors * 8.5 : Math.min(300, 6 + t.floors * (t.arch === 'shop' ? 11 : 8.2));
        const A2 = P(t.x + kk, t.y + kk), B2 = P(t.x + 1 - kk, t.y + kk), C2 = P(t.x + 1 - kk, t.y + 1 - kk), D2 = P(t.x + kk, t.y + 1 - kk);
        occluders.push([D2, C2, B2, up(B2, hh), up(A2, hh), up(D2, hh)]);
      }
      else if (t.kind === 'park') objs.push([d + 0.9, t.x, () => park(c, t, mulberry(t.x * 97 + t.y * 13))]);
      else if (t.kind === 'road' && t.seed > 0.82) {
        const isR = (x, y) => { const q = T[y * N + x]; return q && q.kind === 'road'; };
        const horiz = isR(t.x - 1, t.y) || isR(t.x + 1, t.y), vert = isR(t.x, t.y - 1) || isR(t.x, t.y + 1);
        if (horiz !== vert) { const col = ['#e5484d', '#f4f4f4', '#2f7cf6', '#222831', '#f5b301', '#9aa3ad'][Math.floor(t.seed * 60) % 6]; const lane = t.seed > 0.91 ? 0.3 : 0.7; objs.push([d + 0.5, t.x, () => car(c, horiz ? t.x + 0.5 : t.x + lane, horiz ? t.y + lane : t.y + 0.5, horiz, col)]); }
      }
    });
    const L = layout.landmark; objs.push([L.x + L.y + 4.6, L.x + 2, () => { roofs.capitol = landmark(c); }]);
    objs.sort((a, b) => a[0] - b[0] || a[1] - b[1]).forEach(o => o[2]());
    // Stadium on the city map, at the southern edge like a waterfront
    // ballpark: an oval bowl with a green field, stands and floodlights.
    // Tapping it opens the team that plays there.
    try {
      const team = (typeof teamForCity === 'function') ? teamForCity(city.id) : null;
      if (team) {
        const parks = T.filter(t => t.kind === 'park');
        const tile = parks.length ? parks.reduce((a, b) => (b.x + b.y > a.x + a.y ? b : a)) : T.find(t => t.kind === 'lot');
        if (tile) {
          const [cx, cy] = P(tile.x + 0.5, tile.y + 0.5);
          const col = team.color || '#2f7cf6';
          c.fillStyle = 'rgba(40,50,40,0.18)'; c.beginPath(); c.ellipse(cx + 4, cy + 6, TW * 1.05, TH * 1.05, 0, 0, 7); c.fill();
          c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, TW * 1.0, TH * 1.0, 0, 0, 7); c.fill();
          c.fillStyle = '#e8eaee'; c.beginPath(); c.ellipse(cx, cy, TW * 0.82, TH * 0.82, 0, 0, 7); c.fill();
          c.fillStyle = '#3e9b4f'; c.beginPath(); c.ellipse(cx, cy, TW * 0.62, TH * 0.62, 0, 0, 7); c.fill();
          c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(cx, cy, TW * 0.30, TH * 0.30, 0, 0, 7); c.stroke();
          c.beginPath(); c.moveTo(cx - TW * 0.62, cy); c.lineTo(cx + TW * 0.62, cy); c.stroke();
          c.fillStyle = '#ffffff'; c.font = 'bold 11px sans-serif'; c.textAlign = 'center'; c.fillText(team.mascot || 'TEAM', cx, cy - TH * 0.85);
          // Floodlights at the four corners of the bowl.
          [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
            const fx = cx + sx * TW * 0.95, fy = cy + sy * TH * 0.95;
            c.strokeStyle = '#5b6470'; c.lineWidth = 2; c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx, fy - 18); c.stroke();
            c.fillStyle = '#ffe9a3'; c.beginPath(); c.arc(fx, fy - 20, 5, 0, 7); c.fill();
          });
          roofs.stadium = [cx, cy - TH * 1.1];
          roofs.stadiumTeam = team;
        }
      }
    } catch (e) {}
  }


  function buildVehicles() {
    vehicles = [];
    const N = layout.N, T = layout.tiles, r = mulberry(hashStr('traffic:' + city.code + city.name));
    const segs = [];
    for (let y = 0; y < N; y++) { let st = -1; for (let x = 0; x <= N; x++) { const isR = x < N && T[y * N + x].kind === 'road'; if (isR && st < 0) st = x; if (!isR && st >= 0) { if (x - st >= 5) segs.push({ horiz: true, fixed: y, a: st + 0.5, b: x - 0.5 }); st = -1; } } }
    for (let x = 0; x < N; x++) { let st = -1; for (let y = 0; y <= N; y++) { const isR = y < N && T[y * N + x].kind === 'road'; if (isR && st < 0) st = y; if (!isR && st >= 0) { if (y - st >= 5) segs.push({ horiz: false, fixed: x, a: st + 0.5, b: y - 0.5 }); st = -1; } } }
    const cols = ['#e5484d', '#f4f4f4', '#2f7cf6', '#222831', '#f5b301', '#12a150', '#9aa3ad'];
    segs.sort(() => r() - 0.5);
    segs.slice(0, 18).forEach(sg => vehicles.push({ ...sg, pos: sg.a + r() * (sg.b - sg.a), dir: r() < 0.5 ? 1 : -1, speed: 0.9 + r() * 1.4, col: cols[Math.floor(r() * cols.length)], bus: r() < 0.25 }));
  }
  // Ambient planes over the city: they fly high, so drawing them on top
  // is correct (unlike cars, nothing occludes the sky).
  function buildSkyPlanes() {
    skyPlanes = [];
    const r = mulberry(hashStr('skyplanes:' + city.code + city.name));
    for (let i = 0; i < 2; i++) skyPlanes.push({ lane: 3 + i * 11 + Math.floor(r() * 4), pos: r() * layout.N, dir: i % 2 ? -1 : 1, speed: 1.1 + r() * 0.9, alt: 150 + i * 70, col: ['#e5484d', '#2f7cf6'][i] });
  }
  function drawSkyPlanes(c2) {
    if (marsMode || !skyPlanes.length) return;
    const sc = view.s;
    skyPlanes.forEach(p => {
      const [px, py] = P(p.pos, p.lane);
      const sx = view.x + px * sc, sy = view.y + py * sc - p.alt * sc;
      if (sx < -80 || sy < -80 || sx > el.clientWidth + 80 || sy > el.clientHeight + 80) return;
      const ang = p.dir > 0 ? Math.atan2(TH / 2, TW / 2) : Math.atan2(TH / 2, TW / 2) + Math.PI;
      const dx = Math.cos(ang), dy = Math.sin(ang);
      const grad = c2.createLinearGradient(sx - dx * 70 * sc, sy - dy * 70 * sc, sx, sy);
      grad.addColorStop(0, 'rgba(255,255,255,0)'); grad.addColorStop(1, 'rgba(255,255,255,0.55)');
      c2.strokeStyle = grad; c2.lineWidth = Math.max(1, 1.5 * sc);
      c2.beginPath(); c2.moveTo(sx - dx * 70 * sc, sy - dy * 70 * sc); c2.lineTo(sx - dx * 8 * sc, sy - dy * 8 * sc); c2.stroke();
      c2.save(); c2.translate(sx, sy); c2.rotate(ang); c2.scale(sc, sc);
      c2.fillStyle = '#ffffff';
      c2.beginPath(); c2.ellipse(0, 0, 15, 2.6, 0, 0, 7); c2.fill();
      c2.fillRect(-3, -11, 5, 22);
      c2.fillStyle = p.col; c2.beginPath(); c2.moveTo(-15, 0); c2.lineTo(-19, -4); c2.lineTo(-19, 4); c2.closePath(); c2.fill();
      c2.restore();
    });
  }
  function pointInPoly(pt, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  function drawVehicles(c2) {
    if (!vehicles.length) return;
    const sc = view.s;
    vehicles.forEach(v => {
      const lane = v.dir > 0 ? 0.32 : 0.68;
      const [px, py] = v.horiz ? P(v.pos, v.fixed + lane) : P(v.fixed + lane, v.pos);
      const sx = view.x + px * sc, sy = view.y + py * sc;
      if (sx < -40 || sy < -40 || sx > el.clientWidth + 40 || sy > el.clientHeight + 40) return;
      // Behind a building? Hide: the static city image already drew the
      // facade, and this car must not paint over it like it is flying.
      const gx = (sx - view.x) / sc, gy = (sy - view.y) / sc;
      if (occluders.some(poly => pointInPoly([gx, gy], poly))) return;
      const tv = v.horiz ? [TW / 2 * sc, TH / 2 * sc] : [-TW / 2 * sc, TH / 2 * sc];
      const cv = v.horiz ? [-TW / 2 * sc, TH / 2 * sc] : [TW / 2 * sc, TH / 2 * sc];
      const L = v.bus ? 0.42 : 0.24, Wd = 0.14;
      const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [sx + a * L * tv[0] + b * Wd * cv[0], sy + a * L * tv[1] + b * Wd * cv[1] - 3 * sc]);
      c2.fillStyle = v.col; c2.beginPath(); corners.forEach((pt, i) => i ? c2.lineTo(pt[0], pt[1]) : c2.moveTo(pt[0], pt[1])); c2.closePath(); c2.fill();
      const cab = [[-0.4, -0.6], [0.4, -0.6], [0.4, 0.6], [-0.4, 0.6]].map(([a, b]) => [sx + a * L * tv[0] + b * Wd * cv[0], sy + a * L * tv[1] + b * Wd * cv[1] - 6 * sc]);
      c2.fillStyle = v.bus ? v.col : '#9fc3dd'; c2.beginPath(); cab.forEach((pt, i) => i ? c2.lineTo(pt[0], pt[1]) : c2.moveTo(pt[0], pt[1])); c2.closePath(); c2.fill();
    });
  }
  function startAnim() { if (animTimer) return; lastAnim = performance.now(); animTimer = setInterval(() => { const now = performance.now(), dt = Math.min(0.1, (now - lastAnim) / 1000); lastAnim = now; vehicles.forEach(v => { v.pos += v.dir * v.speed * dt; if (v.pos > v.b) { v.pos = v.b; v.dir = -1; } if (v.pos < v.a) { v.pos = v.a; v.dir = 1; } }); if (layout) skyPlanes.forEach(p => { p.pos += p.dir * p.speed * dt; if (p.pos > layout.N + 8) p.pos = -8; if (p.pos < -8) p.pos = layout.N + 8; }); if (city) apply(); }, 50); }
  function stopAnim() { if (animTimer) { clearInterval(animTimer); animTimer = null; } }

  function pins() {
    layer.innerHTML = '';
    if (marsMode) {
      const sites = (typeof marsSitesFor === 'function') ? marsSitesFor(S.home) : [];
      const add = (t, cls, html, fn, title) => { const r = roofs[t]; if (!r) return; const p = document.createElement('button'); p.className = 'pin ' + cls; p.style.left = r[0] + 'px'; p.style.top = r[1] + 'px'; p.innerHTML = html; if (title) p.title = title; p.addEventListener('click', e => { e.stopPropagation(); fn(); }); layer.appendChild(p); };
      sites.forEach(s => {
        if (s.owned) add(s.t, 'pin-prop', '<span class="logo own">⛏️</span>', () => onPin({ type: 'marsMine', site: s, lot: { t: s.t } }), s.resource + ' mine');
        else add(s.t, 'pin-sale', '<span class="bld">⛏️</span><span class="tag">FOR SALE</span>', () => onPin({ type: 'marsMine', site: s, lot: { t: s.t } }), s.resource + ' mine site');
      });
      return;
    }
    const lots = cityLots(city.id), N = layout.N, owner = S.co[city.a3], mineCo = controlled(city.a3);
    const locAt = {}; owner.locs.forEach(l => { if ((l.city || owner.city) === city.id) locAt[l.t] = l; });
    const show = k => filter === 'all' || filter === k || (filter === 'mine' && k === 'prop');
    const add = (t, cls, html, fn, title) => { const r = roofs[t]; if (!r) return; const p = document.createElement('button'); p.className = 'pin ' + cls; p.style.left = r[0] + 'px'; p.style.top = r[1] + 'px'; p.innerHTML = html; if (title) p.title = title; p.addEventListener('click', e => { e.stopPropagation(); fn(); }); layer.appendChild(p); };
    lots.forEach(l => {
      const loc = locAt[l.t];
      if (loc && show('company')) add(l.t, 'pin-loc' + (mineCo ? ' mine' : '') + (loc.profit < 0 && mineCo ? ' losing' : ''), `<span class="logo" style="background:${owner.color}">${SECTORS[owner.sector].icon}</span>`, () => onPin({ type: 'loc', loc, lot: l }), owner.name);
      else if (l.kind === 'prop' && show('prop')) add(l.t, 'pin-prop', '<span class="logo own">\u{1F3E0}</span>', () => onPin({ type: 'prop', lot: l }));
      else if (l.kind === 'lease' && show('lease')) add(l.t, 'pin-lease', '<span class="sign">FOR<br>LEASE</span>', () => onPin({ type: 'lease', lot: l }));
      else if (l.kind === 'sale' && show('sale')) add(l.t, 'pin-sale', '<span class="bld">\u{1F3E2}</span><span class="tag">FOR SALE</span>', () => onPin({ type: 'sale', lot: l }));
    });
    // Stores built on a leased lot get their logo as a pin, so tapping
    // a built business opens its management panel (manager, products,
    // marketing, finance) instead of vanishing with the FOR LEASE sign.
    if (typeof storesInCity === 'function') storesInCity(city.id).forEach(st => add(st.lotT, 'pin-store', `<span class="logo own">${st.icon || '🏪'}</span>`, () => onPin({ type: 'store', store: st }), st.name));
    // Government buildings, capitals only: police, fire, the agencies,
    // the leader's house, the base and the port. They sit on the free
    // lot tiles nearest the capitol, so they never cover a store, a
    // company location or a building you already own.
    if (typeof govBuildingsFor === 'function' && typeof isGovCity === 'function' && isGovCity(city) && filter === 'all') {
      const govs = govBuildingsFor(city.a3);
      const used = new Set();
      lots.forEach(l => { if (l.kind === 'prop' || l.kind === 'taken') used.add(l.t); });
      Object.keys(locAt).forEach(t => used.add(+t));
      if (typeof storesInCity === 'function') storesInCity(city.id).forEach(st => used.add(st.lotT));
      S.props.filter(p => p.city === city.id).forEach(pr => used.add(pr.t));
      const L2 = layout.landmark;
      const cands = layout.tiles.filter(t => t.kind === 'lot' && !used.has(t.y * N + t.x)).sort((a, b) => (Math.abs(a.x - L2.x) + Math.abs(a.y - L2.y)) - (Math.abs(b.x - L2.x) + Math.abs(b.y - L2.y)));
      govs.forEach((g, i) => { const t = cands[i]; if (!t) return; add(t.y * N + t.x, 'pin-gov', `<span class="logo own">${g.icon}</span>`, () => onPin({ type: 'gov', gov: g, city }), g.name); });
    }
    // Buildings bought by tapping them (not FOR SALE lots) still get
    // an owned pin, so you can open, renovate or sell them again.
    if (show('prop')) S.props.filter(p => p.city === city.id && !lots.some(l => l.t === p.t)).forEach(pr => add(pr.t, 'pin-prop', '<span class="logo own">\u{1F3E0}</span>', () => onPin({ type: 'prop', lot: { t: pr.t } })));
    // Landmark pin (e.g. the Capitol in Washington, D.C.): this used to
    // be a plain div with no click handler, so the capital inside a
    // city view could not be pressed at all. It is a button like every
    // other pin now, and tapping it opens the capital (see onPin).
    if (roofs.capitol && filter === 'all') { const r = roofs.capitol; const p = document.createElement('button'); p.className = 'pin pin-landmark'; p.style.left = r[0] + 'px'; p.style.top = r[1] + 'px'; p.title = landmarkName; p.innerHTML = `<span class="lm">${W.byA3[city.a3].flag} ${landmarkEmoji ? landmarkEmoji + ' ' : ''}${landmarkName}</span>`; p.addEventListener('click', e => { e.stopPropagation(); onPin({ type: 'landmark', city }); }); layer.appendChild(p); }
    if (roofs.stadium && roofs.stadiumTeam) { const r = roofs.stadium, tm = roofs.stadiumTeam; const p = document.createElement('button'); p.className = 'pin pin-stadium'; p.style.left = r[0] + 'px'; p.style.top = r[1] + 'px'; p.innerHTML = '<span class="logo">🏟️</span>'; p.title = tm.name; p.addEventListener('click', e => { e.stopPropagation(); onPin({ type: 'stadium', team: tm }); }); layer.appendChild(p); }
  }

  function apply() {
    const vw = el.clientWidth, vh = el.clientHeight;
    const minS = Math.min(vw / W2, vh / H2);
    view.s = Math.max(minS, Math.min(2.4, view.s));
    view.x = Math.min(0, Math.max(vw - W2 * view.s, view.x)); view.y = Math.min(0, Math.max(vh - H2 * view.s, view.y));
    if (W2 * view.s < vw) view.x = (vw - W2 * view.s) / 2; if (H2 * view.s < vh) view.y = (vh - H2 * view.s) / 2;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== vw * dpr || canvas.height !== vh * dpr) { canvas.width = vw * dpr; canvas.height = vh * dpr; canvas.style.width = vw + 'px'; canvas.style.height = vh + 'px'; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#cfe8f5'; ctx.fillRect(0, 0, vw, vh);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, view.x, view.y, W2 * view.s, H2 * view.s);
    drawVehicles(ctx);
    drawSkyPlanes(ctx);
    layer.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.s})`;
    layer.style.setProperty('--inv', Math.min(1, 0.85 / view.s));
  }
  const pts = new Map(); let pinch = null, downPos = null;
  function bind() {
    el.addEventListener('pointerdown', e => { if (e.target.closest('.pin, button')) return; el.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 1) downPos = [e.clientX, e.clientY]; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: view.s }; } });
    el.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return; const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; zoomAt(pinch.s * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); return; }
      view.x += e.clientX - prev[0]; view.y += e.clientY - prev[1]; apply();
    });
    const end = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; };
    el.addEventListener('pointerup', e => {
      const wasTap = downPos && Math.hypot(e.clientX - downPos[0], e.clientY - downPos[1]) < 8 && !e.target.closest('.pin, button');
      end(e); downPos = null;
      if (wasTap && city) tapTile(e);
    });
    el.addEventListener('pointercancel', end);
    el.addEventListener('wheel', e => { e.preventDefault(); zoomAt(view.s * Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY); }, { passive: false });
    window.addEventListener('resize', () => { if (city) apply(); });
  }
  function zoomAt(s, sx, sy) { const mx = (sx - view.x) / view.s, my = (sy - view.y) / view.s; view.s = s; apply(); view.x = sx - mx * view.s; view.y = sy - my * view.s; apply(); }
  // Tapping a building itself — not just its pin — opens its card, so
  // every building in the city is buyable. Screen point -> canvas
  // point -> isometric tile, using the inverse of P().
  function tapTile(e) {
    try {
      const rect = el.getBoundingClientRect();
      const sx = (e.clientX - rect.left - view.x) / view.s, sy = (e.clientY - rect.top - view.y) / view.s;
      const dx = sx - ox, dy = sy - oy;
      const tx = Math.floor(dx / TW + dy / TH), ty = Math.floor(dy / TH - dx / TW);
      if (tx < 0 || ty < 0 || tx >= layout.N || ty >= layout.N) return;
      const tIdx = ty * layout.N + tx, tile = layout.tiles[tIdx];
      if (marsMode) {
        const site = (typeof marsSitesFor === 'function') ? marsSitesFor(S.home).find(s => s.t === tIdx) : null;
        if (site) onPin({ type: 'marsMine', site, lot: { t: tIdx } });
        return;
      }
      if (!tile || tile.kind !== 'lot') return;
      const owner = S.co[city.a3];
      const loc = owner.locs.find(l => (l.city || owner.city) === city.id && l.t === tIdx);
      if (loc) { onPin({ type: 'loc', loc, lot: { t: tIdx } }); return; }
      const prop = S.props.find(p => p.city === city.id && p.t === tIdx);
      if (prop) { onPin({ type: 'prop', lot: { t: tIdx } }); return; }
      const builtStore = (typeof storesInCity === 'function') ? storesInCity(city.id).find(s => s.lotT === tIdx) : null;
      if (builtStore) { onPin({ type: 'store', store: builtStore }); return; }
      const lot = cityLots(city.id).find(l => l.t === tIdx);
      if (lot && lot.kind === 'lease') { onPin({ type: 'lease', lot }); return; }
      if (lot && lot.kind === 'sale') { onPin({ type: 'sale', lot }); return; }
      if (lot && lot.kind === 'prop') { onPin({ type: 'prop', lot }); return; }
      // Government-only capitals: tapping a plain building buys nothing.
      // Owned buildings, company locations and built stores above still open.
      if (typeof isGovCity === 'function' && isGovCity(city)) return;
      const b = buildingLotForTile(city.id, tIdx);
      if (b) onPin({ type: 'building', lot: b });
    } catch (err) {}
  }

  return {
    init(root, pinHandler) { el = root; canvas = el.querySelector('canvas'); ctx = canvas.getContext('2d'); layer = el.querySelector('.pins'); onPin = pinHandler; bind(); },
    open(id) {
      marsMode = false;
      city = W.cities[id]; layout = cityLayout(city); roofs = {}; render(); buildVehicles(); buildSkyPlanes(); startAnim();
      el.classList.add('open');
      const vw = el.clientWidth, vh = el.clientHeight;
      view.s = Math.max(Math.min(vw / W2, vh / H2), vw < 700 ? 0.62 : Math.min(1, vw / (W2 * 0.62)));
      const [cx, cy] = P(layout.landmark.x + 1.5, layout.landmark.y + 1.5);
      view.x = vw / 2 - cx * view.s; view.y = vh / 2 - (cy - 60) * view.s;
      pins(); apply();
    },
    openMars() {
      marsMode = true;
      city = { id: MARS_CITY_ID, name: 'Mars', a3: S.home, code: 'MARS', size: 0.5, port: false, wealth: 1, pop: 0 };
      layout = (typeof marsLayout === 'function') ? marsLayout() : cityLayout(city); roofs = {}; vehicles = []; skyPlanes = []; render();
      el.classList.add('open');
      const vw = el.clientWidth, vh = el.clientHeight;
      view.s = Math.max(Math.min(vw / W2, vh / H2), vw < 700 ? 0.62 : Math.min(1, vw / (W2 * 0.62)));
      const [cx, cy] = P(layout.landmark.x + 1.5, layout.landmark.y + 1.5);
      view.x = vw / 2 - cx * view.s; view.y = vh / 2 - (cy - 60) * view.s;
      pins(); apply();
    },
    close() { stopAnim(); marsMode = false; el.classList.remove('open'); city = null; img = null; },
    refresh() { if (city) pins(); },
    setFilter(f) { filter = f; pins(); },
    get filter() { return filter; },
    get city() { return city; },
    isOpen() { return !!city; },
    isMars() { return marsMode; },
  };
})();
