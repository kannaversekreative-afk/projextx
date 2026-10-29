'use strict';
// Piece 3: world map, contained in its map container ONLY.
// No window.innerHeight, no visualViewport, no fixed sizing, no 100dvh/100vh.
// Each canvas sizes ONLY to its own container, via ResizeObserver.
// PLAY hides the play screen and shows the game screen; Back reverses it.
// SAVE NOTE (Piece 4): this file deliberately does NOT read, write, or
// delete any localStorage/IndexedDB save, so an old-format save is untouched.
// PLAY here shows placeholder company/cash only; save wiring is Piece 4.
// No economy numbers are final in Piece 3.
(function () {
  var W = null;
  try { W = buildWorld(); } catch (e) { W = null; }

  function makeMap(areaId, canvasId) {
    var area = document.getElementById(areaId);
    var canvas = document.getElementById(canvasId);
    if (!area || !canvas) return { draw: function () {} };
    var ctx = canvas.getContext('2d');
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
    if ('ResizeObserver' in window) new ResizeObserver(draw).observe(area);
    window.addEventListener('resize', draw);
    draw();
    return { draw: draw };
  }

  var playMap = makeMap('map-area', 'worldmap');
  var gameMap = makeMap('game-map', 'gamemap');

  var playscreen = document.getElementById('playscreen');
  var game = document.getElementById('game');
  var playBtn = document.getElementById('playBtn');
  var backBtn = document.getElementById('backBtn');
  var note = document.getElementById('hud-note');

  function showGame() {
    if (!playscreen || !game) return;
    playscreen.classList.add('hidden');
    game.classList.add('open');
    // Game container was 0-sized while hidden; redraw once it has size.
    // ResizeObserver also fires on this size change, this is a belt-and-braces redraw.
    requestAnimationFrame(function () { gameMap.draw(); });
    if (note) note.textContent = 'World map — Piece 3';
  }
  function showPlay() {
    if (!playscreen || !game) return;
    game.classList.remove('open');
    playscreen.classList.remove('hidden');
    requestAnimationFrame(function () { playMap.draw(); });
  }
  if (playBtn) playBtn.addEventListener('click', showGame);
  if (backBtn) backBtn.addEventListener('click', showPlay);

  var nav = document.getElementById('nav');
  if (nav) {
    nav.addEventListener('click', function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest('button') : null;
      if (!btn || !note) return;
      note.textContent = btn.getAttribute('data-nav') + ' — coming in a later piece';
    });
  }
})();
