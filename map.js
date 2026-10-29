'use strict';
// Piece 2: world map, contained in #map-area ONLY.
// No window.innerHeight, no visualViewport, no fixed sizing.
// The canvas sizes to its container, via ResizeObserver.
(function () {
  var area = document.getElementById('map-area');
  var canvas = document.getElementById('worldmap');
  if (!area || !canvas) return;
  var ctx = canvas.getContext('2d');
  var W = null;
  try { W = buildWorld(); } catch (e) { W = null; }
  function draw() {
    var cw = area.clientWidth || 0, ch = area.clientHeight || 0;
    if (!cw || !ch || !W) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
    }
    var scale = Math.max(cw / MAP_W, ch / MAP_H);
    var ox = (cw - MAP_W * scale) / 2, oy = (ch - MAP_H * scale) / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#bcd7ee';
    ctx.fillRect(0, 0, cw, ch);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(100,116,139,0.55)';
    ctx.lineWidth = 1 / scale;
    W.countries.forEach(function (k) {
      if (!k.path) return;
      ctx.fill(k.path);
      ctx.stroke(k.path);
    });
  }
  if ('ResizeObserver' in window) {
    new ResizeObserver(draw).observe(area);
  }
  window.addEventListener('resize', draw);
  draw();
  var play = document.getElementById('playBtn');
  if (play) {
    play.addEventListener('click', function () {
      var cont = document.getElementById('playCont');
      if (cont) cont.textContent = 'Piece 2 — map loaded, PLAY wired';
    });
  }
})();
