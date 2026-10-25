// Isometric capital city. Drawn once to an offscreen canvas in three passes
// (ground, shadows, objects back-to-front); pins are HTML so they stay crisp.
'use strict';

const CityView = (() => {
  const TW = 72, TH = 36;
  let el, canvas, ctx, layer, img, layout, city, view = { x: 0, y: 0, s: 1 }, ox = 0, oy = 0, W2 = 0, H2 = 0;
  let onPin = null, filter = 'all', roofs = {};

  const rgb = hex => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const shade = (hex, f) => { const [r, g, b] = rgb(hex); return `rgb(${Math.min(255, r * f) | 0},${Math.min(255, g * f) | 0},${Math.min(255, b * f) | 0})`; };
  const P = (x, y) => [ox + (x - y) * TW / 2, oy + (x + y) * TH / 2];
  const poly = (c, pts, fill) => { c.fillStyle = fill; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill(); };
  const up = (p, h) => [p[0], p[1] - h];
  const lerp = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];

  // ---------- ground ----------
  function diamond(c, x, y, fill, k) { k = k || 0; poly(c, [P(x + k, y + k), P(x + 1 - k, y + k), P(x + 1 - k, y + 1 - k), P(x + k, y + 1 - k)], fill); }
  function road(c, t, T) {
    diamond(c, t.x, t.y, '#8b9198');
    const N = layout.N, isR = (x, y) => { const q = T[y * N + x]; return q && q.kind === 'road'; };
    const h = isR(t.x - 1, t.y) || isR(t.x + 1, t.y), v = isR(t.x, t.y - 1) || isR(t.x, t.y + 1);
    if (h && v) { // intersection: crosswalk stripes
      c.fillStyle = 'rgba(255,255,255,0.78)';
      for (let i = 0; i < 5; i++) { const f = 0.15 + i * 0.16; [[[f, 0.04], [f + 0.08, 0.04], [f + 0.08, 0.18], [f, 0.18]], [[f, 0.82], [f + 0.08, 0.82], [f + 0.08, 0.96], [f, 0.96]], [[0.04, f], [0.18, f], [0.18, f + 0.08], [0.04, f + 0.08]], [[0.82, f], [0.96, f], [0.96, f + 0.08], [0.82, f + 0.08]]].forEach(q => poly(c, q.map(([a, b]) => P(t.x + a, t.y + b)), c.fillStyle)); }
      return;
    }
    c.strokeStyle = '#f2d36b'; c.lineWidth = 1.4; c.setLineDash([7, 6]);
    const a = h ? P(t.x, t.y + 0.5) : P(t.x + 0.5, t.y), b = h ? P(t.x + 1, t.y + 0.5) : P(t.x + 0.5, t.y + 1);
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); c.setLineDash([]);
    c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 1;
    [0.12, 0.88].forEach(o => { const p = h ? [P(t.x, t.y + o), P(t.x + 1, t.y + o)] : [P(t.x + o, t.y), P(t.x + o, t.y + 1)]; c.beginPath(); c.moveTo(p[0][0], p[0][1]); c.lineTo(p[1][0], p[1][1]); c.stroke(); });
  }
  function lotGround(c, t) {
    diamond(c, t.x, t.y, '#d9ddd4');
    const green = t.arch === 'house' || t.arch === 'rowhouse' || t.kind === 'park';
    diamond(c, t.x, t.y, t.kind === 'park' ? '#97cf62' : green ? '#b9df84' : t.zone === 'downtown' ? '#c9cec6' : '#cdd5c3', 0.07);
    if (t.arch === 'warehouse' || (t.arch === 'shop' && t.seed > 0.6)) { // parking
      diamond(c, t.x, t.y, '#a4aab0', 0.1);
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.8;
      for (let i = 1; i < 5; i++) { const a = P(t.x + 0.1 + i * 0.16, t.y + 0.62), b = P(t.x + 0.1 + i * 0.16, t.y + 0.9); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    }
  }
  function plazaGround(c, t) {
    diamond(c, t.x, t.y, '#ebe5d6');
    diamond(c, t.x, t.y, (t.x + t.y) % 2 ? '#a8d877' : '#e4dccb', 0.18);
  }
  function water(c, t) {
    diamond(c, t.x, t.y, '#24a0cc');
    if (t.seed > 0.6) { c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1; const a = P(t.x + 0.25, t.y + 0.5), b = P(t.x + 0.6, t.y + 0.5); c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + b[0]) / 2, a[1] - 3, b[0], b[1]); c.stroke(); }
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
    if (t.floors > 14 && t.seed > 0.55) { c.fillStyle = '#3c4552'; c.beginPath(); c.ellipse(cx, cy, 10, 5, 0, 0, 7); c.fill(); c.fillStyle = '#e8eaee'; c.font = 'bold 7px sans-serif'; c.textAlign = 'center'; c.fillText('H', cx, cy + 2.5); return; }
    for (let i = 0; i < 2 + Math.floor(r() * 2); i++) { const dx = (r() - 0.5) * 16, dy = (r() - 0.5) * 7; c.fillStyle = '#b9bfc6'; c.fillRect(cx + dx - 3, cy + dy - 4, 6, 4); c.fillStyle = '#d7dbe0'; c.fillRect(cx + dx - 3, cy + dy - 5.5, 6, 1.6); }
    if (t.arch === 'apartment' && t.seed > 0.7) { c.fillStyle = '#7b5a43'; c.fillRect(cx + 6, cy - 12, 6, 9); c.fillStyle = '#5d4332'; c.beginPath(); c.moveTo(cx + 5, cy - 12); c.lineTo(cx + 9, cy - 16); c.lineTo(cx + 13, cy - 12); c.fill(); }
  }
  function building(c, t) {
    const r = mulberry(Math.floor(t.seed * 1e9)), x = t.x, y = t.y;
    const k = t.arch === 'warehouse' ? 0.08 : t.arch === 'glass' ? 0.13 : 0.15;
    const x0 = x + k, y0 = y + k, x1 = x + 1 - k, y1 = y + 1 - k;
    if (t.arch === 'house') return house(c, t, r);
    if (t.arch === 'rowhouse') return rowhouse(c, t, r);
    if (t.arch === 'warehouse') return warehouse(c, t, x0, y0, x1, y1);
    const floorH = t.arch === 'shop' ? 11 : 8.2;
    const h = Math.min(300, 6 + t.floors * floorH);
    let g;
    if (t.arch === 'glass' && t.floors > 16 && r() < 0.5) { // setback tower
      const h1 = h * 0.55; g = box(c, x0, y0, x1, y1, h1, t.color); glassFaces(c, g, t.color, h1);
      const m = 0.12; g = box(c, x0 + m, y0 + m, x1 - m, y1 - m, h - h1, t.color, h1); glassFaces(c, g, t.color, h - h1, h1);
    } else {
      g = box(c, x0, y0, x1, y1, h, t.color);
      if (t.arch === 'glass') glassFaces(c, g, t.color, h);
      else if (t.arch === 'office') { const rows = Math.max(1, Math.round(h / floorH)); [[g.D, g.C], [g.C, g.B]].forEach(([a, b]) => { for (let i = 0; i < rows; i++) { const yb = -(i * floorH + 2.5), yt = yb - 4.2; poly(c, [[a[0], a[1] + yb], [b[0], b[1] + yb], [b[0], b[1] + yt], [a[0], a[1] + yt]], 'rgba(42,74,110,0.62)'); } }); }
      else if (t.arch === 'apartment') { const rows = Math.max(1, Math.round(h / floorH)); faceGrid(c, g.D, g.C, h, rows, 4, (ri, ki) => r() < 0.12 ? 'rgba(255,232,170,0.85)' : 'rgba(55,70,85,0.62)'); faceGrid(c, g.C, g.B, h, rows, 4, 'rgba(45,58,72,0.62)');
        c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1; for (let i = 1; i < rows; i += 2) { const a = lerp(g.D, g.C, 0.1), b = lerp(g.D, g.C, 0.9); c.beginPath(); c.moveTo(a[0], a[1] - i * floorH - 1.5); c.lineTo(b[0], b[1] - i * floorH - 1.5); c.stroke(); } }
      else if (t.arch === 'shop') shopFront(c, g, t, h);
    }
    if (t.arch !== 'shop') { // ground-floor lobby glass
      poly(c, [lerp(g.D, g.C, 0.3), lerp(g.D, g.C, 0.7), up(lerp(g.D, g.C, 0.7), 6), up(lerp(g.D, g.C, 0.3), 6)].map(p => [p[0], p[1] - (g.base || 0)]), 'rgba(30,50,70,0.75)');
    }
    roofDetails(c, g, t, r);
    const top = P(x + 0.5, y + 0.5); return [top[0], top[1] - h];
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
      poly(c, [lerp(a, b, 0.15), lerp(a, b, 0.32), up(lerp(a, b, 0.62), h * 0.95), up(lerp(a, b, 0.45), h * 0.95)], 'rgba(255,255,255,0.12)');
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
  function warehouse(c, t, x0, y0, x1, y1) {
    const h = 18, g = box(c, x0, y0, x1, y1, h, t.color);
    for (let i = 0; i < 4; i++) { // sawtooth roof
      const f0 = i / 4, f1 = (i + 1) / 4, a = up(lerp(g.A, g.B, f0), h), b = up(lerp(g.A, g.B, f1), h), cc = up(lerp(g.D, g.C, f1), h), d = up(lerp(g.D, g.C, f0), h);
      poly(c, [a, d, up(d, 7), up(a, 7)], '#cfd6dc');
      poly(c, [up(a, 7), up(d, 7), cc, b], shade(t.color, 1.12));
    }
    [0.2, 0.5, 0.8].forEach(f => { const p = lerp(g.D, g.C, f); poly(c, [[p[0] - 5, p[1]], [p[0] + 5, p[1] + 2.5], [p[0] + 5, p[1] - 8], [p[0] - 5, p[1] - 10.5]], '#7d858d'); });
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
  }
  function capitol(c) {
    const L = layout.landmark, x0 = L.x + 0.35, y0 = L.y + 0.75, x1 = L.x + 2.65, y1 = L.y + 2.25;
    shadowOf(c, x0, y0, x1, y1, 40);
    const g = box(c, x0, y0, x1, y1, 26, '#f1ece2');
    [[g.D, g.C], [g.C, g.B]].forEach(([a, b]) => { for (let i = 0; i < 14; i++) { const p = lerp(a, b, (i + 0.5) / 14); c.fillStyle = 'rgba(160,150,135,0.55)'; c.fillRect(p[0] - 0.8, p[1] - 22, 1.6, 18); } });
    const pc = lerp(g.D, g.C, 0.5); poly(c, [[pc[0] - 22, pc[1] - 26 + 11], [pc[0] + 22, pc[1] - 26 + 11 + 0], [pc[0], pc[1] - 26 - 4]], '#e6dfd0');
    const [cx, cy] = P((x0 + x1) / 2, (y0 + y1) / 2);
    const top = cy - 26;
    c.fillStyle = '#e9e3d6'; c.fillRect(cx - 18, top - 16, 36, 16); // drum
    c.fillStyle = 'rgba(150,140,125,0.6)'; for (let i = 0; i < 8; i++) c.fillRect(cx - 16 + i * 4.4, top - 14, 1.4, 12);
    const grd = c.createRadialGradient(cx - 6, top - 28, 2, cx, top - 16, 22); grd.addColorStop(0, '#f6f1e4'); grd.addColorStop(1, '#b9b0a0');
    c.fillStyle = grd; c.beginPath(); c.ellipse(cx, top - 16, 18, 20, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#e3dccd'; c.fillRect(cx - 3, top - 44, 6, 8); c.beginPath(); c.arc(cx, top - 45, 3.5, Math.PI, 0); c.fill();
    c.strokeStyle = '#555'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx, top - 48); c.lineTo(cx, top - 70); c.stroke();
    c.font = '15px sans-serif'; c.textAlign = 'left'; c.fillText(W.byA3[city.a3].flag, cx + 1, top - 58);
    for (let i = 0; i < 6; i++) { const r = mulberry(i + 7); tree(c, L.x + 0.15 + r() * 2.7, L.y + 0.1 + r() * 0.5, 0.8); }
    const fx = P(L.x + 1.5, L.y + 2.7); c.fillStyle = '#9ec9e6'; c.beginPath(); c.ellipse(fx[0], fx[1], 12, 6, 0, 0, 7); c.fill(); c.fillStyle = '#d9d2c2'; c.fillRect(fx[0] - 1.5, fx[1] - 8, 3, 8);
    return [cx, top - 48];
  }

  function render() {
    const N = layout.N, T = layout.tiles, maxH = 320;
    W2 = N * TW + 140; H2 = N * TH + maxH + 120; ox = W2 / 2; oy = maxH + 40;
    const dpr = Math.min(1.6, window.devicePixelRatio || 1);
    img = document.createElement('canvas'); img.width = W2 * dpr; img.height = H2 * dpr;
    const c = img.getContext('2d'); c.scale(dpr, dpr);
    c.fillStyle = city.port ? '#1f97c2' : '#b7d98a'; c.fillRect(0, 0, W2, H2);
    // pass 1: ground
    T.forEach(t => {
      if (t.kind === 'water') water(c, t); else if (t.kind === 'beach') beach(c, t); else if (t.kind === 'road') road(c, t, T);
      else if (t.kind === 'plaza') plazaGround(c, t); else lotGround(c, t);
    });
    // pass 2: shadows
    T.forEach(t => { if (t.kind === 'lot' && t.arch !== 'house') { const h = Math.min(300, 6 + t.floors * (t.arch === 'shop' ? 11 : 8.2)); shadowOf(c, t.x + 0.15, t.y + 0.15, t.x + 0.85, t.y + 0.85, t.arch === 'warehouse' ? 25 : h); } });
    // pass 3: objects back to front
    const objs = [];
    T.forEach(t => {
      const d = t.x + t.y;
      if (t.kind === 'lot') objs.push([d + 0.9, t.x, () => { roofs[t.y * N + t.x] = building(c, t); }]);
      else if (t.kind === 'park') objs.push([d + 0.9, t.x, () => park(c, t, mulberry(t.x * 97 + t.y * 13))]);
      else if (t.kind === 'road' && t.seed > 0.82) {
        const isR = (x, y) => { const q = T[y * N + x]; return q && q.kind === 'road'; };
        const horiz = isR(t.x - 1, t.y) || isR(t.x + 1, t.y), vert = isR(t.x, t.y - 1) || isR(t.x, t.y + 1);
        if (horiz !== vert) { const col = ['#e5484d', '#f4f4f4', '#2f7cf6', '#222831', '#f5b301', '#9aa3ad'][Math.floor(t.seed * 60) % 6]; const lane = t.seed > 0.91 ? 0.3 : 0.7; objs.push([d + 0.5, t.x, () => car(c, horiz ? t.x + 0.5 : t.x + lane, horiz ? t.y + lane : t.y + 0.5, horiz, col)]); }
      }
    });
    const L = layout.landmark; objs.push([L.x + L.y + 4.6, L.x + 2, () => { roofs.capitol = capitol(c); }]);
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
          roofs.stadium = [cx, cy - TH * 1.1];
          roofs.stadiumTeam = team;
        }
      }
    } catch (e) {}
  }

  function pins() {
    layer.innerHTML = '';
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
    if (roofs.capitol && filter === 'all') { const r = roofs.capitol; const p = document.createElement('div'); p.className = 'pin pin-landmark'; p.style.left = r[0] + 'px'; p.style.top = r[1] + 'px'; p.innerHTML = `<span class="lm">${W.byA3[city.a3].flag} Capitol</span>`; layer.appendChild(p); }
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
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = city.port ? '#1f97c2' : '#b7d98a'; ctx.fillRect(0, 0, vw, vh);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, view.x, view.y, W2 * view.s, H2 * view.s);
    layer.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.s})`;
    layer.style.setProperty('--inv', Math.min(1, 0.85 / view.s));
  }
  const pts = new Map(); let pinch = null;
  function bind() {
    el.addEventListener('pointerdown', e => { if (e.target.closest('.pin, button')) return; el.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: view.s }; } });
    el.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return; const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; zoomAt(pinch.s * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); return; }
      view.x += e.clientX - prev[0]; view.y += e.clientY - prev[1]; apply();
    });
    const end = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    el.addEventListener('wheel', e => { e.preventDefault(); zoomAt(view.s * Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY); }, { passive: false });
    window.addEventListener('resize', () => { if (city) apply(); });
  }
  function zoomAt(s, sx, sy) { const mx = (sx - view.x) / view.s, my = (sy - view.y) / view.s; view.s = s; apply(); view.x = sx - mx * view.s; view.y = sy - my * view.s; apply(); }

  return {
    init(root, pinHandler) { el = root; canvas = el.querySelector('canvas'); ctx = canvas.getContext('2d'); layer = el.querySelector('.pins'); onPin = pinHandler; bind(); },
    open(id) {
      city = W.cities[id]; layout = cityLayout(city); roofs = {}; render();
      el.classList.add('open');
      const vw = el.clientWidth, vh = el.clientHeight;
      view.s = Math.max(Math.min(vw / W2, vh / H2), vw < 700 ? 0.62 : Math.min(1, vw / (W2 * 0.62)));
      const [cx, cy] = P(layout.landmark.x + 1.5, layout.landmark.y + 1.5);
      view.x = vw / 2 - cx * view.s; view.y = vh / 2 - (cy - 60) * view.s;
      pins(); apply();
    },
    close() { el.classList.remove('open'); city = null; img = null; },
    refresh() { if (city) pins(); },
    setFilter(f) { filter = f; pins(); },
    get filter() { return filter; },
    get city() { return city; },
    isOpen() { return !!city; },
  };
})();
