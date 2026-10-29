'use strict';
// Piece 4: world map, contained in its map container ONLY, plus safe save wiring.
// Clean format rules (non-negotiable):
// - Sea lives ONLY inside a map container, never as a full-screen canvas behind a panel.
// - html/body background is dark #2a3648.
// - No position:fixed, no 100dvh/100vh on full-screen layers in this code.
// - No window.innerHeight / visualViewport sizing. Canvases size ONLY to
//   their own container via ResizeObserver (a window-resize redraw below
//   only re-runs the container draw; it never reads window size for layout).
//
// SAVE SAFETY (Piece 4, read this before touching save code):
// - OLD save, READ ONLY, never written, never deleted:
//   * IndexedDB database 'ticker-tycoon', object store 'saves', key 'main',
//     opened read-only. onupgradeneeded deliberately does NOT create a
//     store, so an absent store is a miss, not a reason to write.
//   * localStorage key 'tickerTycoon.world.v2' (defined in old sim.js),
//     read only via getItem. This file NEVER calls removeItem on it,
//     and NEVER calls any IndexedDB delete on 'main'.
//   * An old save only counts if v === 2, not over, and mode === 'inc',
//     exactly as old loadSave() in ui.js checked. Non-inc saves are ignored.
// - CLEAN save, the ONLY key this file ever writes or deletes:
//   * localStorage key 'worlClean.v1', shape {v:1, companyName, cash, createdAt}.
//   * Written only by the create START button. Deleted only by Reset > Delete.
//   * Reset Delete removes 'worlClean.v1' ONLY and returns to the play screen.
//   * If no clean save exists, Reset shows a note that the old save is untouched.
// - If both an old and a clean save exist, the OLD save is shown (it is the
//   real game). The clean save is still deletable via Reset, and deleting it
//   leaves the old save shown, unchanged.
(function () {
  var CLEAN_KEY = 'worlClean.v1';
  var OLD_LS_KEY = 'tickerTycoon.world.v2';
  var OLD_IDB_NAME = 'ticker-tycoon';
  var OLD_IDB_STORE = 'saves';
  var OLD_IDB_KEY = 'main';

  var W = null;
  try { W = buildWorld(); } catch (e) { W = null; }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtMoney(n) {
    var v = Math.round(Number(n) || 0);
    return '$' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // ---------- map drawing (Piece 2/3, unchanged) ----------
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

  // ---------- save wiring (Piece 4) ----------
  function readCleanSave() {
    try {
      var raw = localStorage.getItem(CLEAN_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (s && s.v === 1 && s.companyName) return { companyName: String(s.companyName), cash: Number(s.cash) || 0, source: 'clean' };
    } catch (e) {}
    return null;
  }
  function oldSaveFromObject(s) {
    if (!s || s.v !== 2 || s.over || s.mode !== 'inc') return null;
    var name = s.companyName || 'My Company';
    return { companyName: String(name), cash: Number(s.cash) || 0, source: 'old' };
  }
  function readOldFromLocalStorage() {
    try {
      var raw = localStorage.getItem(OLD_LS_KEY);
      if (!raw) return null;
      return oldSaveFromObject(JSON.parse(raw));
    } catch (e) { return null; }
  }
  function readOldFromIndexedDB() {
    return new Promise(function (res) {
      if (!window.indexedDB) return res(null);
      var req;
      try { req = indexedDB.open(OLD_IDB_NAME, 1); } catch (e) { return res(null); }
      // Deliberately NO store creation here: read-only miss if absent.
      req.onsuccess = function () {
        var db = req.result;
        try {
          var tx = db.transaction(OLD_IDB_STORE, 'readonly');
          var get = tx.objectStore(OLD_IDB_STORE).get(OLD_IDB_KEY);
          get.onsuccess = function () { res(oldSaveFromObject(get.result)); };
          get.onerror = function () { res(null); };
        } catch (e) { res(null); }
      };
      req.onerror = function () { res(null); };
    });
  }
  async function readOldSave() {
    var fromIdb = await readOldFromIndexedDB();
    if (fromIdb) return fromIdb;
    return readOldFromLocalStorage();
  }

  var playscreen = document.getElementById('playscreen');
  var game = document.getElementById('game');
  var playBtn = document.getElementById('playBtn');
  var backBtn = document.getElementById('backBtn');
  var note = document.getElementById('hud-note');
  var playCont = document.getElementById('playCont');
  var hudCompany = document.getElementById('hud-company');
  var hudCash = document.getElementById('hud-cash');
  var createBox = document.getElementById('createBox');
  var createName = document.getElementById('createName');
  var createStart = document.getElementById('createStart');
  var resetBtn = document.getElementById('resetBtn');
  var resetBox = document.getElementById('resetBox');
  var resetText = document.getElementById('resetText');
  var resetDelete = document.getElementById('resetDelete');
  var resetKeep = document.getElementById('resetKeep');
  var sheet = document.getElementById('sheet');
  var sheetTitle = document.getElementById('sheet-title');
  var sheetBody = document.getElementById('sheet-body');
  var sheetClose = document.getElementById('sheetClose');

  var active = null; // {companyName, cash, source} or null
  var oldSave = null;
  var cleanSave = null;

  function applyCompany() {
    cleanSave = readCleanSave();
    active = oldSave || cleanSave;
    if (active) {
      if (playCont) playCont.textContent = 'Continuing ' + active.companyName;
      if (hudCompany) hudCompany.textContent = active.companyName;
      if (hudCash) hudCash.textContent = 'Cash: ' + fmtMoney(active.cash);
      if (createBox) createBox.classList.remove('open');
    } else {
      if (playCont) playCont.textContent = 'No company yet — create one below';
      if (hudCompany) hudCompany.textContent = 'My Company';
      if (hudCash) hudCash.textContent = 'Cash: —';
      if (createBox) createBox.classList.add('open');
    }
  }
  // Initial render from the synchronous clean save, then upgrade to the
  // old save once the async read-only IndexedDB/localStorage check lands.
  applyCompany();
  readOldSave().then(function (s) {
    oldSave = s;
    applyCompany();
  });

  function closeSheet() {
    if (sheet) sheet.classList.remove('open');
    if (note) note.textContent = 'World map — Piece 4';
    requestAnimationFrame(function () { gameMap.draw(); });
  }
  function openSheet(name) {
    if (!sheet || !sheetTitle || !sheetBody) return;
    sheetTitle.textContent = name;
    sheetBody.textContent = name + ' — placeholder content for Piece 4. Full ' + name.toLowerCase() + ' features come in a later piece.';
    sheet.classList.add('open');
    if (note) note.textContent = name;
    requestAnimationFrame(function () { gameMap.draw(); });
  }
  function showGame() {
    if (!playscreen || !game) return;
    if (!active) {
      // No company at all: stay on the play screen and show the create flow.
      if (createBox) createBox.classList.add('open');
      if (playCont) playCont.textContent = 'No company yet — create one below';
      if (createName) createName.focus();
      return;
    }
    if (resetBox) resetBox.classList.remove('open');
    playscreen.classList.add('hidden');
    game.classList.add('open');
    requestAnimationFrame(function () { gameMap.draw(); });
    if (note) note.textContent = 'World map — Piece 4';
  }
  function showPlay() {
    if (!playscreen || !game) return;
    closeSheet();
    game.classList.remove('open');
    playscreen.classList.remove('hidden');
    requestAnimationFrame(function () { playMap.draw(); });
  }
  if (playBtn) playBtn.addEventListener('click', showGame);
  if (backBtn) backBtn.addEventListener('click', showPlay);
  if (sheetClose) sheetClose.addEventListener('click', closeSheet);

  var nav = document.getElementById('nav');
  if (nav) {
    nav.addEventListener('click', function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest('button') : null;
      if (!btn) return;
      openSheet(btn.getAttribute('data-nav') || 'Home');
    });
  }

  if (createStart) createStart.addEventListener('click', function () {
    var name = (createName && createName.value.trim()) || 'My Company';
    // ONLY the new clean key is written here. Never the old save keys.
    try {
      localStorage.setItem(CLEAN_KEY, JSON.stringify({ v: 1, companyName: name, cash: 200000, createdAt: Date.now() }));
    } catch (e) {}
    applyCompany();
  });
  if (resetBtn) resetBtn.addEventListener('click', function () {
    cleanSave = readCleanSave();
    if (resetBox) resetBox.classList.add('open');
    if (resetText) {
      resetText.textContent = cleanSave
        ? 'Delete your clean save (' + cleanSave.companyName + ')? Your old game save will NOT be touched.'
        : 'No clean save to delete. Your old game save is untouched.';
    }
    if (resetDelete) resetDelete.style.display = cleanSave ? '' : 'none';
    if (resetKeep) resetKeep.textContent = cleanSave ? 'Keep playing' : 'Close';
  });
  if (resetKeep) resetKeep.addEventListener('click', function () {
    if (resetBox) resetBox.classList.remove('open');
  });
  if (resetDelete) resetDelete.addEventListener('click', function () {
    // ONLY the clean key is deleted here. The old save is never touched:
    // no IndexedDB delete, no removeItem of the old localStorage key.
    try { localStorage.removeItem(CLEAN_KEY); } catch (e) {}
    if (resetBox) resetBox.classList.remove('open');
    // Old save (if any) is still shown; otherwise the create flow returns.
    applyCompany();
  });
})();
