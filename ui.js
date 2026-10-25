// HUD, panels, popups, onboarding and the real-time game loop.
'use strict';

let W = null, S = null;
const UI = { panel: null, stack: [], popup: null, modal: null, range: '1Y', q: '', sector: 'All', bizTab: 'all', needs: false, mktTab: 'overview', lastPanel: 0, acc: 0, pick: null };
const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAY_MS_BY_SPEED = [Infinity, 1400, 650, 200];

// ---------- icons (inline SVG, original) ----------
const IC = {
  markets: '<svg viewBox="0 0 28 28"><path d="M4 22V12M10 22V6M16 22v-8M22 22V9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  business: '<svg viewBox="0 0 28 28"><path d="M5 11h18l-2-5H7zM6 11v11h16V11M11 22v-6h6v6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>',
  nation: '<svg viewBox="0 0 28 28"><path d="M7 24V4M7 5h14l-3 4.5 3 4.5H7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  more: '<svg viewBox="0 0 28 28"><circle cx="6" cy="14" r="2.6" fill="currentColor"/><circle cx="14" cy="14" r="2.6" fill="currentColor"/><circle cx="22" cy="14" r="2.6" fill="currentColor"/></svg>',
  bell: '<svg viewBox="0 0 28 28"><path d="M14 4a7 7 0 0 0-7 7v5l-2 4h18l-2-4v-5a7 7 0 0 0-7-7zM11 22a3 3 0 0 0 6 0" fill="currentColor"/></svg>',
  gear: '<svg viewBox="0 0 28 28"><path d="M14 9.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm9.6 6.1 2.1 1.6-2 3.5-2.5-1a8 8 0 0 1-2.4 1.4l-.4 2.6h-4l-.4-2.6a8 8 0 0 1-2.4-1.4l-2.5 1-2-3.5 2.1-1.6a8 8 0 0 1 0-3.2L2.3 10.8l2-3.5 2.5 1a8 8 0 0 1 2.4-1.4L9.6 4.3h4l.4 2.6a8 8 0 0 1 2.4 1.4l2.5-1 2 3.5-2.1 1.6a8 8 0 0 1 0 3.2z" fill="currentColor"/></svg>',
  bag: '<svg viewBox="0 0 28 28"><path d="M6 9h16l-1.2 14H7.2zM10 9V7a4 4 0 0 1 8 0v2" fill="none" stroke="#f5b301" stroke-width="2.6" stroke-linejoin="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>',
  minus: '<svg viewBox="0 0 24 24"><path d="M5 12h14" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>',
  locate: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chev: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  layers: '<svg viewBox="0 0 28 28"><path d="M14 4 3 9.5 14 15l11-5.5zM3 14l11 5.5L25 14M3 18.5 14 24l11-5.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>',
  menu: '<svg viewBox="0 0 28 28"><path d="M5 8h18M5 14h18M5 20h18" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>',
  pause: '<svg viewBox="0 0 20 20"><rect x="5" y="4" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="11.5" y="4" width="3.5" height="12" rx="1" fill="currentColor"/></svg>',
  play1: '<svg viewBox="0 0 20 20"><path d="M6 4l10 6-10 6z" fill="currentColor"/></svg>',
  play2: '<svg viewBox="0 0 20 20"><path d="M2 4l8 6-8 6zM10 4l8 6-8 6z" fill="currentColor"/></svg>',
  play3: '<svg viewBox="0 0 20 20"><path d="M1 4l6 6-6 6zM7 4l6 6-6 6zM13 4l6 6-6 6z" fill="currentColor"/></svg>',
  trophy: '<svg viewBox="0 0 28 28"><path d="M8 4h12v6a6 6 0 0 1-12 0zM8 6H4v2a4 4 0 0 0 4 4M20 6h4v2a4 4 0 0 1-4 4M14 16v4M9 24h10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  news: '<svg viewBox="0 0 28 28"><rect x="5" y="5" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M9 10h10M9 14h10M9 18h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
};
const LOGO_SVG = '<svg viewBox="0 0 40 40"><path d="M9 25c6-1 15-6 22-14M9 31c8-1 16-5 22-11" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/></svg>';
const logoHTML = size => `<span class="logo" style="background:${S.company.color};width:${size}px;height:${size}px">${LOGO_SVG}</span>`;

// ---------- sound ----------
let AC = null;
function beep(f, d, type) {
  if (!S || !S.settings || S.settings.vol * S.settings.ui <= 0) return;
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.value = 0.06 * S.settings.vol * S.settings.ui; g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + d); o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime + d); } catch (e) { /* audio unavailable */ }
}
const sfx = { tap: () => beep(660, 0.06), cash: () => { beep(880, 0.08); setTimeout(() => beep(1320, 0.12), 70); }, bad: () => beep(220, 0.2, 'triangle') };

// ---------- charts ----------
function chart(vals, o) {
  o = o || {}; const Wd = 400, H = o.h || 160, ax = o.axis ? 58 : 4;
  vals = vals.filter(v => isFinite(v)); if (vals.length < 2) vals = [vals[0] || 0, vals[0] || 0];
  let lo = Math.min(...vals), hi = Math.max(...vals); if (hi - lo < 1e-9) { lo -= 1; hi += 1; } const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
  const pts = vals.map((v, i) => [ax + i / (vals.length - 1) * (Wd - ax - 6), 8 + (1 - (v - lo) / (hi - lo)) * (H - 16)]);
  const col = o.color || (vals[vals.length - 1] >= vals[0] ? 'var(--green)' : 'var(--orange)');
  let lab = ''; if (o.axis) for (let k = 0; k < 4; k++) { const v = hi - (hi - lo) * k / 3, y = 8 + k / 3 * (H - 16); lab += `<text x="0" y="${y + 4}" class="axis">${o.money === false ? v.toFixed(0) : fmtMoney(v, true)}</text>`; }
  const d = 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L');
  const area = d + `L${pts[pts.length - 1][0].toFixed(1)},${H}L${pts[0][0].toFixed(1)},${H}Z`;
  return `<svg class="chart" viewBox="0 0 ${Wd} ${H}" preserveAspectRatio="none">${lab}<path d="${area}" fill="${col}" opacity="0.08"/><path d="${d}" fill="none" stroke="${col}" stroke-width="2.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;
}
function seriesFor(h, range) {
  if (range === '1M') return h.d.slice(-22); if (range === '6M') return h.d.slice(-130);
  // Early in the game there are few weekly points; fall back to daily closes.
  if (range === '1Y') return h.w.length >= 26 ? h.w.slice(-52) : h.d.slice(-130);
  if (range === '5Y') return h.w.length >= 26 ? h.w.slice(-260) : h.d.slice(-130);
  return h.m.length > 12 ? h.m : h.w.length >= 26 ? h.w : h.d;
}
const rangeSeg = (list, cur, act) => `<div class="seg">${list.map(r => `<button class="${cur === r ? 'on' : ''}" data-a="${act}" data-x="${r}">${r}</button>`).join('')}</div>`;
const chg = (a, b) => b ? a / b - 1 : 0;
const upCls = x => x >= 0 ? 'up' : 'down';
const stars = x => `<span class="star">★</span> ${(x || 0).toFixed(1)}`;

// ---------- boot ----------
function boot() {
  W = buildWorld();
  MapView.init();
  MapView.on('city', onCityTap); MapView.on('country', onCountryTap); MapView.on('empty', () => { if (!UI.pick) closePopup(); });
  MapView.on('frame', loop);
  CityView.init($('cityview'), onPin);
  const saved = storeGet(SAVE_KEY);
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  addEventListener('pagehide', save); document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  if (saved && saved.v === 1 && !saved.over && saved.countries) { S = saved; enterGame(true); }
  else showTitle(saved);
}
function save() { if (S && !UI.pick) { S.lastSeen = Date.now(); if (!storeSet(SAVE_KEY, S)) trimSave(); } }
function trimSave() { for (const k in S.co) { const h = S.co[k].h; h.w = h.w.slice(-104); } S.news.length = Math.min(S.news.length, 60); storeSet(SAVE_KEY, S); }

// ---------- onboarding ----------
function showTitle(saved) {
  $('hud').innerHTML = ''; MapView.setPick(false);
  openModal(`<div class="title-card">
    <div class="brand"><span class="logo big" style="background:#2f7cf6">${LOGO_SVG}</span><div><h1>Ticker Tycoon</h1><p>Build an empire across the real world. Grow your nation, grow your money, and beat the market.</p></div></div>
    ${saved && saved.over ? `<div class="note">Your last run ended with a score of <b>${saved.over.score}</b>.</div>` : ''}
    <button class="btn3d orange wide" data-a="newGame">NEW GAME</button>
  </div>`, 'center');
}
function chooseMode() {
  openModal(`<h2>Choose a game mode</h2><p class="muted">You can't change this later.</p>
    <div class="modes">
      <button class="mode" data-a="pickMode" data-x="normal"><div class="mode-ic">⏳</div><b>Normal</b><span>About 100 years, from ${START_YEAR} to ${START_YEAR + NORMAL_YEARS}. Time never skips. At the end you get a final score for population, money and how far you beat the market.</span></button>
      <button class="mode" data-a="pickMode" data-x="infinite"><div class="mode-ic">♾️</div><b>Infinite</b><span>No goal and no end. Skip ahead a day, a week, a month or a year whenever you want.</span></button>
    </div>`, 'center');
}
function startPick() { closeModal(); UI.pick = { a3: null }; MapView.setPick(true); MapView.world(); renderPick(); }
function renderPick() {
  const a3 = UI.pick.a3, k = a3 && W.byA3[a3];
  const q = UI.q.trim().toLowerCase();
  const list = q ? W.countries.filter(c => c.playable && c.name.toLowerCase().includes(q)).slice(0, 6) : [];
  $('hud').innerHTML = `<div class="pick-top card"><b>Pick your country</b><span class="muted">Tap a country on the map, or search.</span>
      <input id="csearch" class="search" placeholder="Search countries" value="${esc(UI.q)}" autocomplete="off">
      <div class="sugg">${list.map(c => `<button class="chip" data-a="pickCountry" data-x="${c.a3}">${c.flag} ${esc(c.name)}</button>`).join('')}</div></div>
    ${k ? `<div class="pick-card card">
      <div class="row start"><div class="flag-big">${k.flag}</div><div><h2>${esc(k.name)}</h2><div class="muted">${esc(k.sub)} · ${k.cities.length} cities</div></div></div>
      <div class="stats3 box"><div><span>Population</span><b>${fmtPop(k.pop0)}</b></div><div><span>GDP per person</span><b>${fmtMoney(k.gdp0 * 1e6 / k.pop0, true)}</b></div><div><span>Neighbours</span><b>${k.nb.filter(n => W.byA3[n] && W.byA3[n].playable).length}</b></div></div>
      <p class="muted small">${k.wealth > 1.2 ? 'Rich market: high prices and high rents.' : k.wealth > 0.6 ? 'Middle-income market: balanced costs.' : 'Developing market: cheap to start, fast population growth.'} ${k.nb.length > 4 ? 'Many neighbours means more trade and more risk of conflict.' : k.nb.length === 0 ? 'An island: safe from land invasion.' : ''}</p>
      <button class="btn3d orange wide" data-a="confirmCountry">START IN ${esc(k.name.toUpperCase())}</button></div>` : ''}`;
}
function nameCompany() {
  const k = W.byA3[UI.pick.a3];
  UI.color = LOGO_COLORS[0];
  openModal(`<h2>Name your company</h2><p class="muted">Based in ${k.flag} ${esc(k.name)}.</p>
    <input id="cname" class="text-in" maxlength="24" value="${esc(k.name.split(' ')[0])} Holdings" autocomplete="off">
    <div class="label">Colour</div><div class="swatches">${LOGO_COLORS.map((c, i) => `<button class="sw ${i === 0 ? 'on' : ''}" style="background:${c}" data-a="swatch" data-x="${c}" aria-label="colour ${i + 1}"></button>`).join('')}</div>
    <button class="btn3d orange wide" data-a="beginGame">START</button>`, 'center');
}
function enterGame(returning) {
  UI.pick = null; MapView.setPick(false); closeModal();
  renderHUD(); MapView.home();
  if (returning) welcomeBack();
  else { S.tutorial = 0; }
  renderTutorial();
}

// ---------- tutorial ----------
const TUT = [
  { t: () => S.mode === 'infinite' ? 'Welcome! There is no goal in Infinite mode. Play as long as you like and skip ahead whenever you want.' : `Welcome! You have 100 years. Grow ${esc(cname(S.home))}'s population, grow your money, and beat the stock market.`, btn: 'Next' },
  { t: () => `Every dot is a real city. Tap ${esc(W.cities[W.byA3[S.home].capital].name)} to open it.`, done: () => UI.popup && UI.popup.type === 'city' },
  { t: () => 'Tap ENTER CITY to see the streets.', done: () => CityView.isOpen() },
  { t: () => 'Red FOR LEASE signs are empty storefronts. Pick one with lots of foot traffic and open your first store.', done: () => S.stores.length > 0 },
  { t: () => 'Nice! Now open Markets and buy your first stock. Every stock is a company based in a real country.', done: () => S.stats.trades > 0 },
  { t: () => S.mode === 'infinite' ? 'Time runs on its own. Use the speed buttons up top, or Skip to jump ahead. Wars, booms and disasters move stock prices, so watch the news.' : 'Time runs on its own. Speed it up or pause up top. Wars, booms and disasters move stock prices, so watch the news.', btn: 'Got it' },
];
function renderTutorial() {
  const el = $('tut');
  if (!S || S.tutorial == null || S.tutorial < 0 || S.tutorial >= TUT.length) { el.innerHTML = ''; return; }
  const s = TUT[S.tutorial];
  el.innerHTML = `<div class="tut card"><div class="row"><span class="tut-step">Getting started · ${S.tutorial + 1} / ${TUT.length}</span><button class="link" data-a="tutSkip">Skip</button></div>
    <div class="row start tut-body"><div class="avatar">\u{1F9D1}‍\u{1F4BC}</div><p>${s.t()}</p></div>
    <div class="tut-foot"><div class="tut-bar"><i style="width:${(S.tutorial + 1) / TUT.length * 100}%"></i></div>${s.btn ? `<button class="btn3d orange" data-a="tutNext">${s.btn.toUpperCase()}</button>` : ''}</div></div>`;
}
function tutCheck() { if (S && S.tutorial >= 0 && S.tutorial < TUT.length && TUT[S.tutorial].done && TUT[S.tutorial].done()) { S.tutorial++; renderTutorial(); sfx.cash(); } }

// ---------- HUD ----------
function nextMove() {
  const home = W.byA3[S.home], cap = W.cities[home.capital];
  if (!S.stores.length) return { ic: '\u{1F3EA}', t: 'Open your first store', s: `Lease a storefront in ${cap.name}.`, b: 'OPEN CITY', a: 'enterCity', x: cap.id };
  const bad = S.stores.find(s => s.profit < 0 && S.day - s.opened > 28);
  if (bad) return { ic: '⚠️', t: 'A store is losing money', s: `${W.cities[bad.city].name}: ${fmtMoney(bad.profit)}/week.`, b: 'FIX IT', a: 'storeSheet', x: bad.id };
  const busy = S.stores.find(s => s.demand > s.cap * 1.15);
  if (busy) return { ic: '\u{1F465}', t: 'Customers are waiting', s: `${W.cities[busy.city].name} needs more staff.`, b: 'ADD STAFF', a: 'storeSheet', x: busy.id };
  if (!S.stats.trades) return { ic: '\u{1F4C8}', t: 'Buy your first stock', s: 'Beat the market with your portfolio.', b: 'MARKETS', a: 'panel', x: 'markets' };
  const hc = country(S.home), tense = Object.entries(hc.rel).find(([, v]) => v < -35);
  if (hc.war) return { ic: '⚔️', t: `${cname(S.home)} is at war`, s: 'Fund national defense to turn the tide.', b: 'NATION', a: 'panel', x: 'nation' };
  if (tense) return { ic: '\u{1F54A}️', t: `Tension with ${cname(tense[0])}`, s: 'Pay for diplomacy before it turns into war.', b: 'NATION', a: 'panel', x: 'nation' };
  if (!S.ipo.public && bizValue() >= IPO_MIN) return { ic: '\u{1F514}', t: 'Take your company public', s: 'Your business is big enough for an IPO.', b: 'BUSINESS', a: 'panel', x: 'business' };
  if (S.props.length === 0 && S.cash > 600000) return { ic: '\u{1F3E2}', t: 'Buy your first building', s: 'Collect rent every week.', b: 'OPEN CITY', a: 'enterCity', x: cap.id };
  const lv = S.stores.length < 5 ? 5 : S.stores.length < 15 ? 15 : 60;
  return { ic: '\u{1F680}', t: `Grow to ${lv} stores`, s: `${S.stores.length} open. Find busy streets or a new country.`, b: 'BUSINESS', a: 'panel', x: 'business' };
}
function renderHUD() {
  if (!S) return;
  const nw = netWorth(), wk = weekProfit(), home = W.byA3[S.home], hc = country(S.home);
  const nm = nextMove(), unread = Math.min(99, S.notified || 0), mr = marketReturn(), yr = myReturn();
  $('hud').innerHTML = `
  <button class="co-card card" data-a="panel" data-x="company">
    ${logoHTML(46)}
    <div class="co-info"><b class="co-name">${esc(S.company.name)}</b><span class="muted">${careerName()} · Lv ${level()}</span>
      <div class="co-money"><span class="dollar">$</span><b>${fmtMoney(S.cash, Math.abs(S.cash) >= 1e6).replace('$', '')}</b>${wk ? `<span class="${wk >= 0 ? 'pos' : 'neg'}">${wk >= 0 ? '+' : ''}${fmtMoney(wk, true)}</span>` : ''}${S.rating ? `<span class="rating">${stars(S.rating)}</span>` : ''}</div></div>
    <div class="xpbar"><i style="width:${Math.round(levelProgress() * 100)}%"></i></div>
  </button>
  <button class="goals card" data-a="panel" data-x="goals">
    <div><span>${home.flag} Population</span><b>${fmtPop(hc.pop)}</b><em class="${upCls(popGrowth())}">${fmtPct(popGrowth())}</em></div>
    <div><span>Net worth</span><b>${fmtMoney(nw, true)}</b><em class="${upCls(yr)}">${fmtPct(yr)}</em></div>
    <div><span>vs Market</span><b class="${beatMarket() >= 0 ? 'pos' : 'neg'}">${beatMarket() >= 0 ? 'Beating' : 'Behind'}</b><em class="muted">Mkt ${fmtPct(mr)}</em></div>
  </button>
  <div class="move card"><div class="move-ic">${nm.ic}</div><div class="move-t"><b>${esc(nm.t)}</b><span>${esc(nm.s)}</span></div><button class="btn3d orange" data-a="${nm.a}" data-x="${nm.x}">${nm.b}</button></div>
  <div class="tr">
    <div class="time pill-dark"><div class="date"><b>${fmtDate(S.day)}</b>${S.mode === 'normal' ? `<span>Year ${Math.floor(S.day / 365.25) + 1} of ${NORMAL_YEARS}</span>` : '<span>Infinite</span>'}</div>
      <div class="speeds">${[0, 1, 2, 3].map(i => `<button class="${S.speed === i ? 'on' : ''}" data-a="speed" data-x="${i}" aria-label="${['Pause', 'Normal speed', 'Fast', 'Fastest'][i]}">${[IC.pause, IC.play1, IC.play2, IC.play3][i]}</button>`).join('')}
      ${S.mode === 'infinite' ? '<button class="skip" data-a="skipMenu">SKIP</button>' : ''}</div></div>
    <button class="shop pill-dark" data-a="panel" data-x="shop">${IC.bag}<span>SHOP</span></button>
    <button class="round" data-a="panel" data-x="news" aria-label="News">${IC.bell}${unread ? `<i class="badge">${unread}</i>` : ''}</button>
    <button class="round" data-a="panel" data-x="settings" aria-label="Settings">${IC.gear}</button>
  </div>
  <div class="zoom"><button class="round" data-a="zoom" data-x="1.6" aria-label="Zoom in">${IC.plus}</button><button class="round" data-a="zoom" data-x="0.625" aria-label="Zoom out">${IC.minus}</button><button class="round" data-a="locate" aria-label="Home">${IC.locate}</button></div>
  <nav class="nav card">${[['markets', 'Markets'], ['business', 'Business'], ['nation', 'Nation'], ['more', 'More']].map(([k, l]) => `<button class="${UI.panel === k ? 'on' : ''}" data-a="panel" data-x="${k}"><span class="nav-ic ${k === 'business' ? 'brand-ic' : ''}" ${k === 'business' ? `style="background:${S.company.color}"` : ''}>${IC[k]}</span>${l}</button>`).join('')}</nav>`;
}

// ---------- panels ----------
function panelShell(icon, title, sub, body, tint) {
  return `<div class="ph"><span class="ph-ic" style="background:${tint || '#fff4d6'}">${icon}</span><div class="ph-t"><h2>${title}</h2>${sub ? `<span class="muted">${sub}</span>` : ''}</div><button class="xbtn" data-a="closePanel" aria-label="Close">${IC.close}</button></div><div class="pb">${body}</div>`;
}
function subShell(title, sub, body) {
  return `<div class="ph"><button class="xbtn" data-a="panelBack" aria-label="Back">${IC.back}</button><div class="ph-t"><h2>${title}</h2>${sub ? `<span class="muted">${sub}</span>` : ''}</div><button class="xbtn" data-a="closePanel" aria-label="Close">${IC.close}</button></div><div class="pb">${body}</div>`;
}
function openPanel(name, args) { closePopup(); UI.panel = name; UI.stack = args ? [args] : []; if (name === 'news') S.notified = 0; renderPanel(); renderHUD(); }
function pushPanel(args) { UI.stack.push(args); renderPanel(); const pb = $('panel').querySelector('.pb'); if (pb) pb.scrollTop = 0; }
function closePanel() { UI.panel = null; UI.stack = []; $('panel').classList.remove('open'); renderHUD(); }
function renderPanel() {
  const el = $('panel'); if (!UI.panel) { el.classList.remove('open'); return; }
  const top = UI.stack[UI.stack.length - 1];
  const old = el.querySelector('.pb'), scroll = old ? old.scrollTop : 0, key = UI.panel + (top ? top.s + (top.sym || '') : '');
  el.innerHTML = top ? SUB[top.s](top) : PANELS[UI.panel]();
  el.classList.add('open');
  const pb = el.querySelector('.pb'); if (pb && UI.panelKey === key) pb.scrollTop = scroll;
  UI.panelKey = key; UI.lastPanel = performance.now();
}
const PANELS = {}, SUB = {};

PANELS.markets = () => {
  const mr = marketReturn(), yr = myReturn();
  const tabs = `<div class="tabs">${[['overview', 'Overview'], ['portfolio', 'Portfolio'], ['all', 'All stocks']].map(([k, l]) => `<button class="${UI.mktTab === k ? 'on' : ''}" data-a="mktTab" data-x="${k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (UI.mktTab === 'overview') {
    const h = seriesFor(S.idx.h, UI.range), ch = chg(h[h.length - 1], h[0]);
    const movers = W.companies.map(c => { const d = S.co[c.sym].h.d; return { c, ch: d.length > 1 ? chg(d[d.length - 1], d[d.length - 2]) : 0 }; }).sort((a, b) => b.ch - a.ch);
    const rt = S.regime.type;
    body = `<div class="card in"><div class="row"><div><span class="muted small">World Index</span><div class="big">${S.idx.v.toFixed(2)}</div><span class="${upCls(ch)}">${fmtPct(ch)} · ${UI.range}</span></div><span class="tagp ${rt === 'bull' || rt === 'bubble' ? 'green' : rt === 'calm' ? 'blue' : 'red'}">${REGIMES[rt].name}</span></div>
      ${chart(h, { axis: true, money: false })}${rangeSeg(['1M', '6M', '1Y', '5Y', 'ALL'], UI.range, 'range')}</div>
      <h3 class="sec">Benchmarks</h3>
      <div class="card in bench"><div><span class="muted">Your performance</span><b class="${upCls(yr)}">${fmtPct(yr)}</b><span class="${upCls(yr)}">${fmtMoney(netWorth() - S.stats.startNet, true)}</span></div>
        <div class="r"><span class="muted">Market performance</span><b class="${upCls(mr)}">${fmtPct(mr)}</b><span class="muted">since ${START_YEAR}</span></div></div>
      <p class="muted small">${beatMarket() >= 0 ? `You're beating the market by ${fmtPct(beatMarket())}.` : `You're ${fmtPct(-beatMarket()).replace('+', '')} behind the market.`} Your performance counts everything you own: stocks, stores and buildings.</p>
      <h3 class="sec">Today's movers</h3>
      <div class="card in list">${movers.slice(0, 4).concat(movers.slice(-4).reverse()).map(m => stockRow(m.c)).join('')}</div>`;
  } else if (UI.mktTab === 'portfolio') {
    const rows = Object.keys(S.holdings).map(sym => { const c = companyInfo(sym); return c ? stockRow(c, true) : ''; }).join('');
    body = `<div class="card in"><span class="muted small">Portfolio value</span><div class="big">${fmtMoney(holdingsValue())}</div></div>
      <div class="card in list">${rows || '<div class="empty">No stocks yet. Open <b>All stocks</b> to buy your first one.</div>'}</div>`;
  } else {
    body = `<input id="msearch" class="search" placeholder="Search stocks or countries" value="${esc(UI.q)}" autocomplete="off">
      <div class="chips">${['All'].concat(Object.keys(SECTOR_INFO)).map(s => `<button class="chip ${UI.sector === s ? 'on' : ''}" data-a="sector" data-x="${s}">${s}</button>`).join('')}</div>
      <div class="card in list" id="mlist">${stockList()}</div>`;
  }
  return panelShell(IC.markets, 'Markets', `${W.companies.length} companies in ${new Set(W.companies.map(c => c.a3)).size} countries · ${marketOpen() ? 'Open' : 'Closed for the weekend'}`, tabs + body, '#e6f0ff');
};
function stockList() {
  const q = UI.q.trim().toLowerCase();
  const list = W.companies.filter(c => (UI.sector === 'All' || c.sector === UI.sector) && (!q || c.sym.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || W.byA3[c.a3].name.toLowerCase().includes(q)));
  if (S.ipo.public && UI.sector === 'All' && !q) list.unshift(companyInfo(S.ipo.sym));
  return list.slice(0, 80).map(c => stockRow(c)).join('') || '<div class="empty">No matches.</div>';
}
function stockRow(c, showPos) {
  const o = S.co[c.sym], d = o.h.d, ch = d.length > 1 ? chg(d[d.length - 1], d[d.length - 2]) : 0, k = W.byA3[c.a3];
  const pos = S.holdings[c.sym], st = countryStatus(c.a3);
  return `<button class="srow" data-a="stock" data-x="${c.sym}"><span class="flag">${k.flag}</span><div class="sinfo"><b>${c.sym}</b><span>${esc(c.name)}${showPos && pos ? ` · ${pos.qty.toLocaleString()} sh` : ` · ${esc(k.name)}`}${st && st.cls === 'red' ? ' <em class="warn">⚔</em>' : ''}</span></div><span class="pbtn ${ch > 0 ? 'up' : ch < 0 ? 'down' : 'flat'}">${UI.showPct ? fmtPct(ch) : '$' + o.price.toFixed(2)}</span></button>`;
}
SUB.stock = ({ sym }) => {
  const c = companyInfo(sym), o = S.co[sym], k = W.byA3[c.a3], city = W.cities[c.city];
  const h = seriesFor(o.h, UI.range), ch = chg(o.price, h[0]);
  const pos = S.holdings[sym], st = countryStatus(c.a3), info = SECTOR_INFO[c.sector] || SECTOR_INFO.Consumer;
  const fresh = o.res && o.res.day > S.day - 7, fair = intelOn() ? fairValue(sym) : fresh ? o.res.fair : null;
  return subShell(c.sym, `${k.flag} ${esc(c.name)} · ${esc(city.name)}`, `
    <div class="card in"><div class="row"><div><div class="big">$${o.price.toFixed(2)}</div><span class="${upCls(ch)}">${fmtPct(ch)} · ${UI.range}</span></div>
      <span class="tagp ${st.cls}">${st.t}</span></div>${chart(h, { axis: true })}${rangeSeg(['1M', '6M', '1Y', '5Y', 'ALL'], UI.range, 'range')}</div>
    <div class="card in"><h4>${c.mine ? 'Your company’s stock' : 'Your position'}</h4>
      ${pos ? `<div class="kv"><span>Shares</span><b>${pos.qty.toLocaleString()}${pos.qty < 0 ? ' (short)' : ''}</b></div><div class="kv"><span>Value</span><b>${fmtMoney(Math.abs(pos.qty) * o.price)}</b></div><div class="kv"><span>Return</span><b class="${upCls((o.price - pos.cost) * pos.qty)}">${fmtMoney((o.price - pos.cost) * pos.qty)}</b></div>` : `<p class="muted small">You don't own any. Cash ${fmtMoney(S.cash)}.</p>`}
      <div class="grid2"><button class="btn3d green" data-a="tradeSheet" data-x="${sym}|buy">BUY</button><button class="btn3d orange" data-a="tradeSheet" data-x="${sym}|sell">SELL</button><button class="btn" data-a="tradeSheet" data-x="${sym}|short">Short</button><button class="btn" data-a="tradeSheet" data-x="${sym}|cover">Cover</button></div>
      ${marketOpen() ? '' : '<p class="muted small">Markets are closed on weekends.</p>'}</div>
    ${c.mine ? '' : `<div class="card in"><h4>Research</h4>
      ${fresh ? `<div class="kv"><span>Outlook</span><b class="${o.res.dir > 0 ? 'up' : 'down'}">${o.res.strength} ${o.res.dir > 0 ? 'bullish' : 'bearish'}</b></div>${o.res.pattern ? `<div class="kv"><span>Pattern</span><b class="warn">${PATTERN_HINTS[o.res.pattern]}</b></div>` : ''}` : ''}
      ${fair ? `<div class="kv"><span>Fair value${intelOn() ? ' (intel)' : ' estimate'}</span><b>$${fair.toFixed(2)} <span class="${fair > o.price ? 'up' : 'down'}">(${fair > o.price ? 'under' : 'over'}valued ${fmtPct(Math.abs(fair / o.price - 1)).replace('+', '')})</span></b></div>` : ''}
      <button class="btn wide" data-a="research" data-x="${sym}">Research for ${fmtMoney(researchCost())}</button>
      <p class="muted small">Prices drift toward fair value over weeks. Wars, sanctions and disasters in ${esc(k.name)} hit this stock hard.</p></div>`}
    <div class="card in"><h4>About</h4>
      <div class="kv"><span>Sector</span><b>${c.sector}</b></div><div class="kv"><span>Headquarters</span><b><button class="link" data-a="flyCity" data-x="${city.id}">${esc(city.name)}, ${esc(k.name)}</button></b></div>
      <div class="kv"><span>Market cap</span><b>${fmtMoney(o.price * o.shares, true)}</b></div><div class="kv"><span>P/E</span><b>${o.eps > 0 ? (o.price / o.eps).toFixed(1) : '—'}</b></div>
      <div class="kv"><span>Dividend</span><b>${(info.div * 100).toFixed(1)}%</b></div></div>`);
};
function tradeSheet(sym, side) {
  const o = S.co[sym], label = { buy: 'Buy', sell: 'Sell', short: 'Short', cover: 'Cover' }[side];
  const pos = S.holdings[sym], max = Math.max(0, side === 'buy' ? Math.floor(S.cash / (o.price * 1.01)) : side === 'sell' ? (pos ? pos.qty : 0) : side === 'cover' ? (pos ? -pos.qty : 0) : Math.floor((Math.max(0, netWorth()) * 0.5 - shortValue()) / o.price));
  UI.tradeSym = sym;
  openModal(`<h2>${label} ${sym}</h2><p class="muted">$${o.price.toFixed(2)} per share · up to ${max.toLocaleString()} shares</p>
    <div class="qty"><button class="btn" data-a="qty" data-x="-10">-10</button><input id="qty" type="number" inputmode="numeric" value="${Math.min(10, Math.max(1, max))}" min="1"><button class="btn" data-a="qty" data-x="10">+10</button></div>
    <div class="grid3"><button class="btn" data-a="qtySet" data-x="${Math.floor(max / 4)}">25%</button><button class="btn" data-a="qtySet" data-x="${Math.floor(max / 2)}">50%</button><button class="btn" data-a="qtySet" data-x="${max}">Max</button></div>
    <div class="kv"><span>Total</span><b id="est">—</b></div><div class="kv"><span>Your price impact</span><b id="imp">—</b></div>
    <button class="btn3d ${side === 'buy' || side === 'cover' ? 'green' : 'orange'} wide" data-a="doTrade" data-x="${sym}|${side}">${label.toUpperCase()}</button>`, 'sheet');
  updEst();
}
function updEst() {
  const q = $('qty'), e = $('est'), im = $('imp'); if (!q || !e) return;
  const sym = UI.tradeSym, d = (+q.value || 0) * S.co[sym].price, imp = impactFor(sym, d);
  e.textContent = fmtMoney(d * (1 + imp / 2)); im.textContent = (imp * 100).toFixed(2) + '%'; im.className = imp > 0.02 ? 'down' : '';
}

PANELS.business = () => {
  const countries = Object.keys(S.biz), tab = S.biz[UI.bizTab] ? UI.bizTab : 'all';
  const list = S.stores.filter(s => (tab === 'all' || s.a3 === tab) && (!UI.needs || s.profit < 0 || s.demand > s.cap * 1.1 || s.sat < 3));
  const wk = S.week || { profit: 0 };
  const body = `
    <div class="row gap"><button class="chip-big ${UI.needs ? 'on' : ''}" data-a="needs">${IC.markets} NEEDS ACTION</button><button class="btn3d orange" data-a="newStore">+ NEW STORE</button></div>
    ${countries.length ? `<div class="tabs">${['all'].concat(countries).map(a3 => `<button class="${tab === a3 ? 'on' : ''}" data-a="bizTab" data-x="${a3}">${a3 === 'all' ? 'All' : W.byA3[a3].flag + ' ' + esc(W.byA3[a3].name)}</button>`).join('')}</div>` : ''}
    ${tab !== 'all' ? bizSettings(tab) : countries.length ? `<p class="muted small">Pick a country tab to change prices, quality, wages and marketing.</p>` : ''}
    ${list.map(storeRow).join('') || `<div class="card in empty">${S.stores.length ? 'Nothing needs your attention.' : 'No stores yet. Tap a city dot on the map, then ENTER CITY and lease a storefront.'}</div>`}
    <h3 class="sec">Buildings you own</h3>
    ${S.props.map(p => `<button class="card in srow2" data-a="propSheet" data-x="${p.id}"><div><b>${esc(W.cities[p.city].name)} · ${p.units} units</b><span class="muted">${Math.round(p.occ * 100)}% occupied · worth ${fmtMoney(p.value, true)}</span></div><b class="${upCls(p.income)}">${fmtMoney(p.income, true)}/wk</b></button>`).join('') || '<div class="card in empty">No buildings yet. Look for blue FOR SALE pins in any city.</div>'}
    <h3 class="sec">Company upgrades</h3>
    <div class="card in list">${UPGRADES.map(u => `<div class="urow"><div><b>${u.name}</b><span class="muted">${u.desc}</span></div>${S.upgrades[u.id] ? '<span class="tagp green">OWNED</span>' : `<button class="btn" data-a="upgrade" data-x="${u.id}">${fmtMoney(u.cost, true)}</button>`}</div>`).join('')}</div>
    <h3 class="sec">Finance</h3>
    <div class="card in"><h4>Stock market listing</h4>
      ${S.ipo.public ? `<p class="muted small">${esc(S.company.name)} trades as <b>${S.ipo.sym}</b> at $${S.co[S.ipo.sym].price.toFixed(2)}. Outside investors own ${(S.ipo.outside * 100).toFixed(0)}% and get that share of your store profits.</p>${S.ipo.outside > 0.001 ? `<button class="btn wide" data-a="buyback">Buy back 5% (${fmtMoney(S.co[S.ipo.sym].price * 10e6 * Math.min(0.05, S.ipo.outside) * 1.05, true)})</button>` : ''}`
      : `<p class="muted small">Business value ${fmtMoney(bizValue(), true)}. At ${fmtMoney(IPO_MIN, true)} you can sell part of your company to the public for cash now. You give up that share of future store profits.</p><div class="grid3">${[0.1, 0.25, 0.4].map(p => `<button class="btn" data-a="ipo" data-x="${p}" ${bizValue() < IPO_MIN ? 'disabled' : ''}>Sell ${p * 100}%<br><small>${fmtMoney(bizValue() * p * 0.93, true)}</small></button>`).join('')}</div>`}</div>
    <div class="card in"><h4>Bank loan</h4><div class="kv"><span>Owed</span><b>${fmtMoney(S.loan)}</b></div><div class="kv"><span>Can borrow</span><b>${fmtMoney(maxLoan(), true)}</b></div><p class="muted small">8% a year, charged weekly. You can borrow up to half of what your stores and buildings are worth.</p>
      <div class="grid2"><button class="btn" data-a="borrow" ${maxLoan() < 10000 ? 'disabled' : ''}>Borrow ${fmtMoney(Math.min(maxLoan(), Math.max(50000, maxLoan() / 4)), true)}</button><button class="btn" data-a="repay" ${S.loan <= 0 ? 'disabled' : ''}>Repay ${fmtMoney(Math.min(S.loan, Math.max(0, S.cash)), true)}</button></div></div>`;
  return panelShell(IC.business, 'Business', `${S.stores.length} stores · ${countries.length} ${countries.length === 1 ? 'country' : 'countries'} · ${wk.profit >= 0 ? '+' : ''}${fmtMoney(wk.profit, true)} last week`, body, '#e6faf4');
};
function storeRow(st) {
  const city = W.cities[st.city], b = S.biz[st.a3], T = BIZ_TYPES[b.type];
  const grade = st.sat >= 4.2 ? ['GREAT', 'green'] : st.sat >= 3.4 ? ['GOOD', 'blue'] : ['POOR', 'red'];
  const fill = Math.min(1, st.demand / Math.max(1, st.cap));
  return `<button class="card in store" data-a="storeSheet" data-x="${st.id}" style="--edge:${st.profit >= 0 ? 'var(--green)' : 'var(--orange)'}">
    <div class="row"><b class="route">${city.code} <span>${T.icon}</span> ${esc(city.name)}</b><span class="tagp ${grade[1]}">★ ${grade[0]}</span></div>
    <span class="muted">${T.name} · ${['Basic', 'Modern', 'Luxury'][st.interior]} · ${st.staff} staff</span>
    <div class="row"><b>${Math.round(fill * 100)}% busy · <span class="${upCls(st.profit)}">${st.profit >= 0 ? '+' : ''}${fmtMoney(st.profit)}</span> / week</b><span class="bars">${[0, 1, 2, 3, 4, 5].map(i => `<i class="${i < Math.round(st.sat / 5 * 6) ? 'on' : ''}"></i>`).join('')}</span></div></button>`;
}
function bizSettings(a3) {
  const b = S.biz[a3], T = BIZ_TYPES[b.type], hist = b.hist.slice(-26);
  return `<div class="card in"><div class="row"><h4>${T.icon} ${T.name} in ${esc(W.byA3[a3].name)}</h4><b class="${upCls(b.last || 0)}">${fmtMoney(b.last || 0, true)}/wk</b></div>
    ${hist.length > 1 ? chart(hist, { h: 70 }) : ''}
    <div class="setting"><span>Prices</span><input type="range" min="0.7" max="1.5" step="0.05" value="${b.price}" data-in="price" data-x="${a3}"><b>${Math.round(b.price * 100)}%</b></div>
    <div class="setting"><span>Quality</span><input type="range" min="1" max="5" step="1" value="${b.quality}" data-in="quality" data-x="${a3}"><b>${'★'.repeat(b.quality)}</b></div>
    <div class="setting"><span>Wages</span><div class="seg small">${[[0.85, 'Low'], [1, 'Fair'], [1.25, 'High']].map(([v, l]) => `<button class="${b.wage === v ? 'on' : ''}" data-a="wage" data-x="${a3}|${v}">${l}</button>`).join('')}</div></div>
    <div class="setting"><span>Marketing</span><div class="seg small">${[0, 2000, 10000, 50000, 250000].map(v => `<button class="${b.mkt === v ? 'on' : ''}" data-a="mkt" data-x="${a3}|${v}">${v ? fmtMoney(v, true) : 'None'}</button>`).join('')}</div></div>
    <p class="muted small">Marketing is per week, shared by all stores in this country. Cheaper prices and better quality bring more customers; long waits and high prices hurt your rating. Corporate tax here: ${Math.round(country(a3).tax * 100)}%.</p></div>`;
}
function storeSheet(id) {
  const st = S.stores.find(s => s.id === id); if (!st) return;
  const city = W.cities[st.city], b = S.biz[st.a3], T = BIZ_TYPES[b.type];
  const up = st.interior < 2 ? buildCost(b.type, st.interior + 1, st.a3) - buildCost(b.type, st.interior, st.a3) : 0;
  openModal(`<div class="row"><h2>${T.icon} ${esc(city.name)}</h2><span class="tagp ${st.profit >= 0 ? 'green' : 'red'}">${st.profit >= 0 ? '+' : ''}${fmtMoney(st.profit)}/wk</span></div>
    <p class="muted">${T.name} · ${['Basic', 'Modern', 'Luxury'][st.interior]} interior · opened ${fmtDate(st.opened)}</p>
    <div class="stats3 box"><div><span>Foot traffic</span><b>${st.traffic.toLocaleString()}/wk</b></div><div><span>Customers</span><b>${st.cust.toLocaleString()}</b></div><div><span>Rating</span><b>${stars(st.sat)}</b></div></div>
    <div class="kv"><span>Revenue</span><b>${fmtMoney(st.rev)}</b></div><div class="kv"><span>Rent</span><b>${st.rent ? fmtMoney(st.rent) : 'You own the building'}</b></div>
    <div class="kv"><span>Demand vs capacity</span><b class="${st.demand > st.cap * 1.1 ? 'down' : ''}">${Math.round(st.demand)} / ${Math.round(st.cap)}</b></div>
    ${st.opened > S.day - 7 ? '<p class="muted small">First results arrive at the end of the week.</p>' : st.demand > st.cap * 1.1 ? '<p class="warnbox">Customers are leaving because of long waits. Add staff.</p>' : st.demand < st.cap * 0.5 && st.staff > 1 ? '<p class="warnbox">Staff are standing around. You can cut a shift.</p>' : ''}
    <div class="setting"><span>Staff</span><div class="qty"><button class="btn" data-a="staff" data-x="${id}|-1">−</button><b class="qv">${st.staff}</b><button class="btn" data-a="staff" data-x="${id}|1">+</button></div></div>
    <div class="grid2">${st.interior < 2 ? `<button class="btn" data-a="interior" data-x="${id}">Upgrade interior ${fmtMoney(up, true)}</button>` : '<span></span>'}<button class="btn danger" data-a="closeStore" data-x="${id}">Close store</button></div>`, 'sheet');
}

PANELS.nation = () => {
  const k = W.byA3[S.home], c = country(S.home), st = countryStatus(S.home);
  const proj = PROJECTS.map(d => { const run = c.proj.find(p => p.id === d.id && p.until > S.day); return `<div class="urow"><div><b>${d.icon} ${d.name}</b><span class="muted">${d.desc}${run ? ` Runs until ${yearOf(run.until)}.` : ` Lasts ${d.years} years.`}</span></div>${run ? '<span class="tagp green">ACTIVE</span>' : `<button class="btn" data-a="project" data-x="${d.id}">${fmtMoney(projectCost(d), true)}</button>`}</div>`; }).join('');
  const rel = Object.entries(c.rel).sort((a, b) => a[1] - b[1]).map(([a3, v]) => { const atWar = S.wars.some(w => (w.a === a3 && w.b === S.home) || (w.b === a3 && w.a === S.home)); const lab = atWar ? ['WAR', 'red'] : v < -35 ? ['HOSTILE', 'red'] : v < 5 ? ['TENSE', 'orange'] : v > 50 ? ['ALLY', 'green'] : ['NEUTRAL', 'blue']; return `<div class="urow"><div><b>${W.byA3[a3].flag} ${esc(W.byA3[a3].name)}</b><div class="meter"><i style="width:${(v + 100) / 2}%;background:${v < -35 ? 'var(--red)' : v < 5 ? 'var(--orange)' : 'var(--green)'}"></i></div></div><span class="tagp ${lab[1]}">${lab[0]}</span><button class="btn small" data-a="diplomacy" data-x="${a3}">${fmtMoney(diplomacyCost(a3), true)}</button></div>`; }).join('');
  const wars = S.wars.map(w => `<div class="urow"><div><b>⚔️ ${W.byA3[w.a].flag} ${esc(cname(w.a))} vs ${W.byA3[w.b].flag} ${esc(cname(w.b))}</b><span class="muted">Since ${fmtDate(w.start)} · ${esc(cname(w.a))} controls ${Math.round(w.front)}% of the front</span></div></div>`).join('');
  const ranking = Object.keys(S.countries).map(a3 => [a3, S.countries[a3].pop]).sort((a, b) => b[1] - a[1]);
  const myRank = ranking.findIndex(r => r[0] === S.home) + 1;
  const jobs = S.stores.filter(s => s.a3 === S.home).reduce((a, s) => a + s.staff, 0);
  return panelShell(IC.nation, `${k.flag} ${esc(k.name)}`, `Your home country · ${st.t}`, `
    <div class="card in bench"><div><span class="muted small">Population</span><b>${fmtPop(c.pop)}</b><span class="${upCls(popGrowth())}">${fmtPct(popGrowth())} since ${START_YEAR}</span></div>
      <div class="r"><span class="muted small">World rank</span><b>#${myRank}</b><span class="muted">of ${ranking.length}</span></div></div>
    <div class="stats3 box"><div><span>GDP</span><b>${fmtMoney(c.gdp * 1e6, true)}</b></div><div><span>Growth</span><b class="${upCls(c.growth)}">${fmtPct(c.growth)}/yr</b></div><div><span>Stability</span><b>${Math.round(c.stab)}/100</b></div></div>
    <p class="muted small">Population grows with prosperity, stability and the ${jobs} jobs your stores create here. War and occupation shrink it; refugees from nearby wars move to stable countries.</p>
    <h3 class="sec">Fund national projects</h3><div class="card in list">${proj}</div>
    <h3 class="sec">Neighbours</h3><div class="card in list">${rel || '<div class="empty">No land borders. Only the sea protects you.</div>'}</div>
    <p class="muted small">Pay for diplomacy to improve relations. Hostile neighbours can declare war.</p>
    <h3 class="sec">Wars around the world</h3><div class="card in list">${wars || '<div class="empty">The world is at peace. For now.</div>'}</div>
    <h3 class="sec">Most populous countries</h3><div class="card in list">${ranking.slice(0, 8).map(([a3, p], i) => `<div class="kv ${a3 === S.home ? 'me' : ''}"><span>#${i + 1} ${W.byA3[a3].flag} ${esc(cname(a3))}</span><b>${fmtPop(p)}</b></div>`).join('')}${myRank > 8 ? `<div class="kv me"><span>#${myRank} ${k.flag} ${esc(k.name)}</span><b>${fmtPop(c.pop)}</b></div>` : ''}</div>`, '#fde8e8');
};

PANELS.more = () => panelShell(IC.more, 'More', '', [
  ['company', IC.trophy, 'Your company', 'Career goals, rating and stats', '#fff4d6'],
  ['goals', IC.markets, 'Goals', S.mode === 'normal' ? 'Population, money and beating the market' : 'Your records (no goal in Infinite)', '#e6f0ff'],
  ['news', IC.news, 'World news', 'Wars, booms, disasters and your milestones', '#e6f0ff'],
  ['leaders', IC.trophy, 'Leaderboard', 'How you rank against rival empires', '#f1e8ff'],
  ['shop', IC.bag, 'Shop', 'Free power-ups, one of each per day', '#fff4d6'],
  ['settings', IC.gear, 'Settings', 'Sound, motion, save and restart', '#eef1f5'],
  ['help', IC.news, 'How to play', 'The rules in two minutes', '#e6faf4'],
].map(([k, ic, t, s, bg]) => `<button class="card in mrow" data-a="panel" data-x="${k}"><span class="ph-ic" style="background:${bg}">${ic}</span><div><b>${t}</b><span class="muted">${s}</span></div>${IC.chev}</button>`).join(''), '#eef1f5');

PANELS.company = () => {
  const stage = CAREER[S.career];
  const done = stage ? stage.goals.filter((g, i) => S.goalsDone.includes(S.career + ':' + i)).length : 4;
  const rb = rivalBoard(), me = rb.findIndex(r => r.you);
  return panelShell(IC.trophy, 'Your company', '', `
    <div class="hero" style="background:${S.company.color}"><div class="hero-in">${logoHTML(72)}<div><h2>${esc(S.company.name)}</h2><span class="tagp light">${careerName()}</span><div>Based in ${W.byA3[S.home].flag} ${esc(cname(S.home))}</div><div>Cash <b>${fmtMoney(S.cash)}</b></div></div></div>
      <div class="hero-stats"><div><b>${S.stores.length}</b><span>stores</span></div><div><b>${Object.keys(S.biz).length}</b><span>countries</span></div><div><b>${S.props.length}</b><span>buildings</span></div><div><b>★ ${(S.rating || 0).toFixed(1)}</b><span>rating</span></div></div></div>
    ${stage ? `<div class="card in"><span class="kicker orange">Career</span><h4>${done} of 4 goals for ${CAREER[S.career + 1] ? CAREER[S.career + 1].name : 'Legend'}</h4><span class="muted">Stage ${S.career + 1} of ${CAREER.length}</span><div class="meter"><i style="width:${done * 25}%;background:var(--orange)"></i></div>
      ${stage.goals.map((g, i) => `<div class="goal ${S.goalsDone.includes(S.career + ':' + i) ? 'done' : ''}"><span>${S.goalsDone.includes(S.career + ':' + i) ? '✓' : '○'}</span>${g.t}</div>`).join('')}</div>` : '<div class="card in"><h4>Legend status reached \u{1F451}</h4></div>'}
    <div class="card in"><div class="row start"><div class="star-ic">★</div><div><h4>Improve your rating</h4><span class="muted">You're at ★ ${(S.rating || 0).toFixed(1)}. Better quality, nicer interiors, fair wages and short waits raise it.</span></div></div></div>
    <button class="card in mrow" data-a="panel" data-x="leaders"><span class="ph-ic" style="background:#fff4d6">${IC.trophy}</span><div><span class="kicker gold">Global leaderboard</span><b>You're #${me + 1} of ${rb.length}</b><span class="muted">Ranked by net worth</span></div>${IC.chev}</button>
    <div class="card in"><h4>Company name & colour</h4><input id="rename" class="text-in" maxlength="24" value="${esc(S.company.name)}"><div class="swatches">${LOGO_COLORS.map((c, i) => `<button class="sw ${S.company.color === c ? 'on' : ''}" style="background:${c}" data-a="recolor" data-x="${c}" aria-label="colour ${i + 1}"></button>`).join('')}</div></div>`, '#fff4d6');
};
PANELS.goals = () => {
  const yr = myReturn(), mr = marketReturn(), pg = popGrowth();
  const nh = S.nh.m.length > 3 ? S.nh.m : S.nh.w;
  return panelShell(IC.markets, 'Goals', S.mode === 'normal' ? `Year ${Math.floor(S.day / 365.25) + 1} of ${NORMAL_YEARS}` : 'Infinite mode: no goal, just records', `
    ${S.mode === 'normal' ? `<div class="card in"><span class="muted small">Time used</span><div class="meter"><i style="width:${S.day / NORMAL_DAYS * 100}%;background:var(--blue)"></i></div><span class="muted small">${fmtDate(S.day)} → ${fmtDate(NORMAL_DAYS)}</span></div>` : '<div class="card in"><b>There is no goal in Infinite.</b><p class="muted small">These are here so you can still see how you are doing.</p></div>'}
    <div class="card in"><h4>\u{1F465} Grow your nation</h4><div class="big">${fmtPop(country(S.home).pop)}</div><span class="${upCls(pg)}">${fmtPct(pg)} since ${START_YEAR}</span><p class="muted small">Open stores at home, fund housing, hospitals and immigration, and keep the peace.</p></div>
    <div class="card in"><h4>\u{1F4B0} Grow your money</h4><div class="big">${fmtMoney(netWorth(), true)}</div>${chart(nh.map(x => x[1]), { h: 90 })}</div>
    <h3 class="sec">\u{1F4C8} Beat the market</h3>
    <div class="card in bench"><div><span class="muted">You</span><b class="${upCls(yr)}">${fmtPct(yr)}</b></div><div class="r"><span class="muted">Market</span><b class="${upCls(mr)}">${fmtPct(mr)}</b></div></div>
    <p class="muted small">${beatMarket() >= 0 ? `You're beating the market by ${fmtPct(beatMarket())}.` : `The market is ahead of you by ${fmtPct(-beatMarket()).replace('+', '')}.`}</p>`, '#e6f0ff');
};
PANELS.news = () => {
  const cats = { Market: ['#e6f0ff', '\u{1F4CA}', 'blue'], World: ['#eef1f5', '\u{1F30D}', 'slate'], War: ['#fde8e8', '⚔️', 'red'], Business: ['#e6faf4', '\u{1F3EA}', 'teal'], Milestone: ['#fff4d6', '⭐', 'gold'], Property: ['#f1e8ff', '\u{1F3E2}', 'purple'], Nation: ['#fde8e8', '\u{1F3DB}️', 'red'] };
  const ago = d => S.day - d <= 0 ? 'today' : S.day - d === 1 ? 'yesterday' : (S.day - d) + 'd ago';
  return panelShell(IC.news, 'World News', '', `
    <h3 class="sec">Active now</h3>${S.live.slice(-6).reverse().map(e => `<div class="card in live"><span class="livetag">⏱ LIVE</span><b>${esc(e.title)}</b><span class="muted">${e.until > S.day + 3000 ? 'ongoing' : (e.until - S.day) + ' days left'}</span></div>`).join('') || '<div class="card in empty">Nothing happening right now.</div>'}
    <h3 class="sec">Recent</h3>${S.news.slice(0, 40).map(n => { const c = cats[n.cat] || cats.World; return `<div class="card in newsrow"><span class="ph-ic" style="background:${c[0]}">${c[1]}</span><div><span class="kicker ${c[2]}">${n.cat} <em>${ago(n.d)}</em></span><b>${esc(n.text)}</b></div></div>`; }).join('')}`, '#e6f0ff');
};
PANELS.leaders = () => {
  const rb = rivalBoard(), best = storeGet(BOARD_KEY) || [];
  const cols = ['#2f7cf6', '#7c4dff', '#12a150', '#0ea5b7', '#f5b301', '#e5484d', '#111827', '#ff6b2c'];
  return panelShell(IC.trophy, 'Leaderboard', 'Rival empires, ranked by net worth', `
    <div class="card in list">${rb.map((r, i) => `<div class="lrow ${r.you ? 'me' : ''}"><b>#${i + 1}</b><span class="ldot" style="background:${r.you ? S.company.color : cols[i % 8]}"></span><span>${esc(r.name)}${r.you ? ' (you)' : ''}</span><b>${fmtMoney(r.nw, true)}</b></div>`).join('')}</div>
    <h3 class="sec">Your best finished runs</h3><div class="card in list">${best.map((b, i) => `<div class="kv"><span>#${i + 1} ${esc(b.name)} ${W.byA3[b.home] ? W.byA3[b.home].flag : ''}</span><b>${b.score} pts</b></div>`).join('') || '<div class="empty">Finish a Normal game to post a score.</div>'}</div>`, '#fff4d6');
};
PANELS.shop = () => panelShell(IC.bag, 'Shop', 'Every power-up is free. One of each per day.', `
  <div class="shopgrid">${SHOP.map(it => `<div class="card in shopitem"><div class="shop-ic">${it.icon}</div><b>${it.name}</b><span class="muted small">${it.desc}</span><button class="btn3d ${shopReady(it.id) ? 'orange' : 'grey'}" data-a="shop" data-x="${it.id}" ${shopReady(it.id) ? '' : 'disabled'}>${shopReady(it.id) ? 'FREE' : 'TOMORROW'}</button></div>`).join('')}</div>
  ${S.boosts.rush > S.day ? `<p><span class="tagp green">Rush hour: ${S.boosts.rush - S.day} more days</span></p>` : ''}${intelOn() ? `<p><span class="tagp blue">Market intel: ${S.boosts.intel - S.day} more days</span></p>` : ''}`, '#fff4d6');
PANELS.settings = () => panelShell(IC.gear, 'Settings', '', `
  <h3 class="sec">Audio</h3><div class="card in">
    <div class="setting"><span>Master volume</span><input type="range" min="0" max="1" step="0.01" value="${S.settings.vol}" data-in="vol"><b>${Math.round(S.settings.vol * 100)}%</b></div>
    <div class="setting"><span>UI sounds</span><input type="range" min="0" max="1" step="0.01" value="${S.settings.ui}" data-in="ui"><b>${Math.round(S.settings.ui * 100)}%</b></div></div>
  <h3 class="sec">Motion & visuals</h3><div class="card in">
    <div class="setting"><span>Planes and ships</span><button class="toggle ${S.settings.motion ? 'on' : ''}" data-a="toggleMotion" aria-label="Planes and ships"><i></i></button></div></div>
  <h3 class="sec">Game</h3><div class="card in"><div class="kv"><span>Mode</span><b>${S.mode === 'normal' ? 'Normal (100 years)' : 'Infinite'}</b></div>
    <div class="grid2"><button class="btn" data-a="exportSave">Copy save</button><button class="btn" data-a="importSave">Load save</button></div>
    <button class="btn danger wide" data-a="restart">Restart game</button></div>
  <p class="muted small">Map data: Natural Earth (public domain). Airport codes: OurAirports (public domain). Companies, people and events in the game are fictional.</p>`, '#eef1f5');
PANELS.help = () => panelShell(IC.news, 'How to play', '', `<div class="card in prose">
  <p><b>The map.</b> Every dot is a real city. Tap one to see its companies, then ENTER CITY to walk its streets.</p>
  <p><b>Stores.</b> Red FOR LEASE signs are storefronts. Busy streets cost more rent but bring more customers. You run one kind of business in each country. Set prices, quality, wages and marketing in Business.</p>
  <p><b>Buildings.</b> Blue FOR SALE pins are buildings you can buy and rent out. You can also open your own store in a building you own and pay no rent.</p>
  <p><b>Markets.</b> Every company trades on the world market. Prices follow earnings, the mood of the market, and what happens in their country.</p>
  <p><b>The world.</b> Neighbours can fall out and go to war. War crashes stock prices and store sales in both countries, and an invader can seize your stores. Peace deals, trade deals and booms send prices up.</p>
  <p><b>Your nation.</b> Fund projects at home and pay for diplomacy to grow your population and avoid war.</p>
  <p><b>Winning.</b> ${S.mode === 'normal' ? 'In Normal you have 100 years. Your score counts population growth, net worth and how far you beat the market.' : 'Infinite has no goal. Play however you like.'}</p></div>`, '#e6faf4');

// ---------- popups ----------
function onCityTap(id) { if (UI.pick || !S) return; MapView.select(id); sfx.tap(); UI.popup = { type: 'city', id }; renderPopup(); tutCheck(); }
function onCountryTap(a3) {
  if (UI.pick) { UI.pick.a3 = a3; MapView.setPick(true, a3); renderPick(); sfx.tap(); return; }
  if (!S) return; MapView.select(null); UI.popup = { type: 'country', a3 }; renderPopup();
}
function closePopup() { UI.popup = null; MapView.select(null); $('popup').innerHTML = ''; }
function renderPopup() {
  const p = UI.popup, el = $('popup'); if (!p) { el.innerHTML = ''; return; }
  if (p.type === 'city') {
    const c = W.cities[p.id], k = W.byA3[c.a3], st = countryStatus(c.a3), biz = S.biz[c.a3];
    const cos = W.companies.filter(x => x.city === c.id);
    const mine = S.stores.filter(s => s.city === c.id).length, props = S.props.filter(x => x.city === c.id).length;
    const lots = cityLots(c.id), avail = lots.filter(l => l.kind === 'lease').length, sale = lots.filter(l => l.kind === 'sale').length;
    const tags = [];
    if (c.a3 === S.home && c.capital) tags.push(['HOME CAPITAL', 'blue']);
    if (mine) tags.push([`${mine} STORE${mine > 1 ? 'S' : ''}`, 'green']); else tags.push([biz ? 'NEW MARKET' : 'NEW COUNTRY', 'grey']);
    if (st.cls !== 'green') tags.push([st.t.toUpperCase(), st.cls]);
    if (S.cityHit[c.id] > S.day) tags.push(['DISASTER RECOVERY', 'orange']);
    const comp = biz ? rivalCount(c.id, biz.type) : null;
    el.innerHTML = `<div class="pop card"><button class="xbtn" data-a="closePopup" aria-label="Close">${IC.close}</button>
      <div class="row start"><h2>${esc(c.name)}</h2><span class="codepill">${c.code}</span></div>
      <div class="muted">${k.flag} ${esc(k.name)} · ${PERSONAS[hashStr(c.name) % PERSONAS.length]}</div>
      <div class="tags">${tags.map(t => `<span class="tagp ${t[1]}">${t[0]}</span>`).join('')}</div>
      <div class="stats3 box"><div><span>Population</span><b>${fmtPop(c.pop * country(c.a3).pop / k.pop0)}</b></div><div><span>Spending power</span><b class="${k.wealth > 1.2 ? 'up' : k.wealth < 0.5 ? 'down' : 'blue'}">${k.wealth > 1.5 ? 'Very high' : k.wealth > 1 ? 'High' : k.wealth > 0.55 ? 'Medium' : 'Low'}</b></div><div><span>Competition</span><b class="${comp == null ? '' : comp > 4 ? 'down' : comp > 1 ? 'blue' : 'up'}">${comp == null ? '—' : comp > 4 ? 'High' : comp > 1 ? 'Medium' : 'Low'}</b></div></div>
      ${cos.length ? `<div class="list mini">${cos.map(x => stockRow(x)).join('')}</div>` : ''}
      <button class="btn3d blue wide" data-a="enterCity" data-x="${c.id}">ENTER CITY</button>
      <p class="muted small center">${avail} storefronts for lease · ${sale} buildings for sale${props ? ` · you own ${props}` : ''}</p></div>`;
  } else {
    const k = W.byA3[p.a3], c = country(p.a3); if (!c) { el.innerHTML = ''; return; }
    const st = countryStatus(p.a3);
    el.innerHTML = `<div class="pop card"><button class="xbtn" data-a="closePopup" aria-label="Close">${IC.close}</button>
      <div class="row start"><span class="flag-big">${k.flag}</span><div><h2>${esc(k.name)}</h2><span class="tagp ${st.cls}">${st.t}</span></div></div>
      <div class="stats3 box"><div><span>Population</span><b>${fmtPop(c.pop)}</b></div><div><span>GDP</span><b>${fmtMoney(c.gdp * 1e6, true)}</b></div><div><span>Growth</span><b class="${upCls(c.growth)}">${fmtPct(c.growth)}</b></div></div>
      <div class="kv"><span>Your business</span><b>${S.biz[p.a3] ? BIZ_TYPES[S.biz[p.a3].type].icon + ' ' + BIZ_TYPES[S.biz[p.a3].type].name : 'None yet'}</b></div>
      <div class="kv"><span>Listed companies</span><b>${W.companies.filter(x => x.a3 === p.a3).length}</b></div>
      <div class="kv"><span>Corporate tax</span><b>${Math.round(c.tax * 100)}%</b></div>
      <p class="muted small">Tap a city dot to see its streets.</p></div>`;
  }
}

// ---------- city view ----------
function enterCity(id) {
  closePopup(); closePanel(); MapView.select(null);
  document.body.classList.add('in-city');
  CityView.open(id); renderCityHUD(); tutCheck();
  if (!S.biz[W.cities[id].a3]) setTimeout(() => chooseBizType(W.cities[id].a3), 350);
}
function leaveCity() { CityView.close(); document.body.classList.remove('in-city'); $('chud').innerHTML = ''; renderHUD(); }
function renderCityHUD() {
  if (!CityView.isOpen()) return;
  const c = CityView.city, k = W.byA3[c.a3], biz = S.biz[c.a3];
  const filt = { all: 'All', lease: 'For lease', sale: 'For sale', mine: 'Yours' }[CityView.filter];
  $('chud').innerHTML = `<div class="ch-top"><button class="dark-round" data-a="leaveCity" aria-label="Back to map">${IC.back}</button>
      <div class="dark-box co">${logoHTML(42)}<div><span class="dim">${esc(S.company.name.toUpperCase())}</span><b>${fmtMoney(S.cash)}</b></div></div>
      <div class="dark-box date"><b>${fmtDate(S.day)}</b></div></div>
    <div class="ch-bottom"><button class="dark-box sq" data-a="cityFilter" aria-label="Filter pins">${IC.layers}<small>${filt}</small></button>
      <div class="dark-box name"><span class="flag">${k.flag}</span><b>${esc(c.name)}</b></div>
      <button class="dark-box sq" data-a="cityInfo" aria-label="City info">${IC.menu}</button></div>
    ${biz ? '' : `<div class="ch-note card">Choose a business for ${esc(k.name)} to start leasing storefronts. <button class="btn3d orange" data-a="chooseBiz" data-x="${c.a3}">CHOOSE</button></div>`}`;
}
function chooseBizType(a3) {
  if (S.biz[a3]) return;
  const k = W.byA3[a3], fee = Math.round(15000 * Math.max(0.4, k.wealth));
  openModal(`<h2>Choose your business for ${k.flag} ${esc(k.name)}</h2><p class="muted">You run one kind of business in each country. Registering costs ${fmtMoney(fee)}.</p>
    <div class="bizgrid">${Object.entries(BIZ_TYPES).map(([id, T]) => `<button class="bizopt" data-a="startBiz" data-x="${a3}|${id}"><span class="bz-ic" style="background:${T.color}">${T.icon}</span><b>${T.name}</b><span class="muted small">${fmtMoney(buildCost(id, 0, a3), true)} to build · ~$${Math.max(1, Math.round(T.ticket * Math.pow(k.wealth, 0.6)))} per sale</span></button>`).join('')}</div>`, 'sheet');
}
function onPin(lot) {
  const c = CityView.city, biz = S.biz[c.a3];
  sfx.tap();
  if (lot.kind === 'lease') {
    if (!biz) return chooseBizType(c.a3);
    const T = BIZ_TYPES[biz.type], own = S.stores.filter(s => s.city === c.id).length + 1, staff = Math.max(1, T.staff - (S.upgrades.kiosk ? 1 : 0));
    const est = i => storeEconomics(c.a3, c.id, lot.traffic, lot.rent, i, staff, own, 0);
    openModal(`<div class="row"><h2>Storefront for lease</h2><span class="tagp red">FOR LEASE</span></div><p class="muted">${esc(c.name)} · ${['', 'Small', 'Medium', 'Large'][lot.size]} unit</p>
      <div class="stats3 box"><div><span>Foot traffic</span><b class="${lot.traffic > 10000 ? 'up' : lot.traffic < 5000 ? 'down' : ''}">${lot.traffic.toLocaleString()}/wk</b></div><div><span>Rent</span><b>${fmtMoney(lot.rent)}/wk</b></div><div><span>Rivals in city</span><b>${rivalCount(c.id, biz.type)}</b></div></div>
      <h4>Pick an interior</h4>
      <div class="intgrid">${[0, 1, 2].map(i => { const e = est(i); return `<button class="intopt" data-a="lease" data-x="${lot.t}|${i}"><b>${['Basic', 'Modern', 'Luxury'][i]}</b><span>${fmtMoney(buildCost(biz.type, i, c.a3), true)}</span><span class="${upCls(e.profit)}">${e.profit >= 0 ? '+' : ''}${fmtMoney(e.profit, true)}/wk</span><small>${Math.round(e.served)} customers</small></button>`; }).join('')}</div>
      <p class="muted small">Forecast with ${staff} staff and your current prices. Aim for 8,000–10,000+ weekly foot traffic.</p>`, 'sheet');
  } else if (lot.kind === 'sale') {
    const y = (lot.units * lot.mrent * 52) / lot.price;
    openModal(`<div class="row"><h2>Building for sale</h2><span class="tagp blue">FOR SALE</span></div><p class="muted">${esc(c.name)} · ${lot.units} rental unit${lot.units > 1 ? 's' : ''}</p>
      <div class="stats3 box"><div><span>Price</span><b>${fmtMoney(lot.price, true)}</b></div><div><span>Market rent</span><b>${fmtMoney(lot.mrent)}/unit/wk</b></div><div><span>Yield</span><b class="up">${(y * 100).toFixed(1)}%/yr</b></div></div>
      <div class="kv"><span>Condition</span><b>${Math.round(lot.cond * 100)}%</b></div><div class="kv"><span>Foot traffic</span><b>${lot.traffic.toLocaleString()}/wk</b></div>
      <p class="muted small">Collect rent every week. Charge more for income, or less to fill every unit. You can also open your own store on the ground floor, rent-free.</p>
      <button class="btn3d blue wide" data-a="buyBld" data-x="${lot.t}" ${S.cash < lot.price ? 'disabled' : ''}>BUY FOR ${fmtMoney(lot.price, true)}</button>${S.cash < lot.price ? `<p class="muted small center">You need ${fmtMoney(lot.price - S.cash, true)} more.</p>` : ''}`, 'sheet');
  } else if (lot.store) storeSheet(lot.store);
  else if (lot.kind === 'prop') { const p = S.props.find(x => x.city === c.id && x.t === lot.t); if (p) propSheet(p.id); }
}
function propSheet(id) {
  const p = S.props.find(x => x.id === id); if (!p) return; const c = W.cities[p.city], biz = S.biz[c.a3];
  openModal(`<div class="row"><h2>\u{1F3E0} Your building</h2><b class="${upCls(p.income)}">${fmtMoney(p.income)}/wk</b></div><p class="muted">${esc(c.name)} · ${p.units} units · bought for ${fmtMoney(p.paid, true)}</p>
    <div class="stats3 box"><div><span>Value</span><b>${fmtMoney(p.value, true)}</b></div><div><span>Occupied</span><b>${Math.round(p.occ * 100)}%</b></div><div><span>Condition</span><b>${Math.round(p.cond * 100)}%</b></div></div>
    <div class="setting"><span>Rent</span><input type="range" min="0.7" max="1.6" step="0.05" value="${p.rentLv}" data-in="rentLv" data-x="${id}"><b>${fmtMoney(p.mrent * p.rentLv)}/unit</b></div>
    <p class="muted small">Market rent here is ${fmtMoney(p.mrent)} per unit per week. Charge more and units sit empty.</p>
    <div class="grid2"><button class="btn" data-a="renovate" data-x="${id}" ${p.cond > 0.95 ? 'disabled' : ''}>Renovate ${fmtMoney(renoCost(p), true)}</button><button class="btn danger" data-a="sellBld" data-x="${id}">Sell for ${fmtMoney(p.value * 0.95, true)}</button></div>
    ${biz && !p.store ? `<button class="btn3d orange wide" data-a="ownStore" data-x="${id}">OPEN YOUR ${BIZ_TYPES[biz.type].name.toUpperCase()} HERE, RENT-FREE</button>` : ''}`, 'sheet');
}

// ---------- modals ----------
function openModal(html, kind) { UI.modal = kind; $('modal').innerHTML = `<div class="scrim ${kind}" data-a="scrim"><div class="mbox ${kind}" data-stop>${kind === 'sheet' ? `<button class="xbtn mclose" data-a="closeModal" aria-label="Close">${IC.close}</button>` : ''}${html}</div></div>`; }
function closeModal() { UI.modal = null; $('modal').innerHTML = ''; }
function toast(t, kind) { const d = document.createElement('div'); d.className = 'toast ' + (kind || ''); d.textContent = t; $('toasts').appendChild(d); setTimeout(() => d.remove(), 2800); if (kind === 'bad') sfx.bad(); }
function welcomeBack() {
  const r = dailyRewardInfo(), nm = nextMove(), away = S.lastSeen ? Date.now() - S.lastSeen : 0, mins = Math.round(away / 60000);
  const awayTxt = mins >= 1440 ? Math.round(mins / 1440) + 'd' : mins >= 60 ? Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm' : mins + 'm';
  const day = ((r.streak - 1) % 7) + 1;
  openModal(`<div class="wb"><div class="wb-l">
      <div class="row start">${logoHTML(56)}<div><span class="kicker blue">WELCOME BACK</span><h2>${esc(S.company.name)}</h2>${mins > 0 ? `<span class="muted">You were away ${awayTxt}. Time paused while you were gone.</span>` : ''}</div></div>
      <div class="earned"><span>Your empire</span><b>${fmtMoney(netWorth(), true)}</b><span>${S.stores.length} stores · ${weekProfit() >= 0 ? '+' : ''}${fmtMoney(weekProfit(), true)} last week</span></div>
      <div class="daily"><div class="row"><span class="kicker blue">TODAY'S OPERATIONS REWARD</span><span class="muted">Day ${day} / 7</span></div>
        ${r.claimed ? '<b class="up claimed">Claimed ✓</b>' : `<button class="btn3d green" data-a="claimDaily">CLAIM ${fmtMoney(r.amount, true)}</button>`}
        <span class="muted">Tomorrow: +${fmtMoney(r.tomorrow, true)}</span><div class="dots">${[0, 1, 2, 3, 4, 5, 6].map(i => `<i class="${i < day - (r.claimed ? 0 : 1) ? 'on' : ''}"></i>`).join('')}</div></div></div>
    <div class="wb-r"><div class="card in"><span class="kicker muted">NEXT BEST MOVE</span><div class="row start"><span class="move-ic">${nm.ic}</span><div><b>${esc(nm.t)}</b><div class="muted">${esc(nm.s)}</div></div></div><button class="btn3d orange" data-a="${nm.a}" data-x="${nm.x}">${nm.b}</button></div>
      <div class="card in list"><button class="mrow" data-a="panel" data-x="news"><span class="ph-ic" style="background:#e6f0ff">${IC.news}</span><div><b>World news</b><span class="muted">${S.live.length} live events</span></div>${IC.chev}</button>
        <button class="mrow" data-a="panel" data-x="goals"><span class="ph-ic" style="background:#fff4d6">${IC.trophy}</span><div><b>Goals</b><span class="muted">${beatMarket() >= 0 ? 'Beating' : 'Behind'} the market</span></div>${IC.chev}</button></div></div></div>
    <button class="btn outline wide" data-a="closeModal">BACK TO MAP</button>`, 'center wide');
}
function skipMenu() {
  openModal(`<h2>Skip ahead</h2><p class="muted">The world keeps turning while you skip: wars, booms and your stores all play out.</p>
    <div class="grid2">${[['1', 'A day'], ['7', 'A week'], ['30', 'A month'], ['365', 'A year']].map(([d, l]) => `<button class="btn3d blue" data-a="skip" data-x="${d}">${l.toUpperCase()}</button>`).join('')}</div>`, 'sheet');
}
function doSkip(days) {
  const nw0 = netWorth(), pop0 = country(S.home).pop, top = S.news[0];
  for (let i = 0; i < days && !S.over; i++) stepDay();
  const fresh = []; for (const n of S.news) { if (n === top) break; fresh.push(n); }
  const d = netWorth() - nw0;
  MapView.redraw();
  openModal(`<h2>${days >= 365 ? 'A year later' : days >= 30 ? 'A month later' : days >= 7 ? 'A week later' : 'The next day'}</h2><p class="muted">${fmtDate(S.day)}</p>
    <div class="stats3 box"><div><span>Net worth</span><b class="${upCls(d)}">${d >= 0 ? '+' : ''}${fmtMoney(d, true)}</b></div><div><span>Population</span><b class="${upCls(country(S.home).pop - pop0)}">${fmtPct(country(S.home).pop / pop0 - 1)}</b></div><div><span>World Index</span><b>${S.idx.v.toFixed(0)}</b></div></div>
    <h4>What happened</h4><div class="list">${fresh.slice(0, 8).map(n => `<div class="kv"><span>${esc(n.text)}</span></div>`).join('') || '<p class="muted">A quiet stretch.</p>'}</div>
    <button class="btn3d orange wide" data-a="closeModal">CONTINUE</button>`, 'sheet');
  refreshAll(); save();
}
function gameOver() {
  const o = S.over;
  openModal(`<h2>${o.bankrupt ? 'Bankrupt' : `${START_YEAR + NORMAL_YEARS}: the final report`}</h2><p class="muted">${o.bankrupt ? 'Your debts caught up with you.' : '100 years have passed.'}</p>
    <div class="big center">${o.score} points</div>
    <div class="stats3 box"><div><span>\u{1F465} Population</span><b class="${upCls(o.pop)}">${fmtPct(o.pop)}</b></div><div><span>\u{1F4B0} Net worth</span><b>${fmtMoney(o.nw, true)}</b></div><div><span>\u{1F4C8} vs Market</span><b class="${upCls(o.beat)}">${fmtPct(o.beat)}</b></div></div>
    <p class="muted">You finished as <b>${o.stage}</b>. The market returned ${fmtPct(o.mkt)}; you returned ${fmtPct(o.mine)}.</p>
    <button class="btn3d orange wide" data-a="newGame">PLAY AGAIN</button>`, 'center');
}

// ---------- actions ----------
const A = {
  newGame: () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* storage unavailable */ } S = null; closePanel(); closePopup(); if (CityView.isOpen()) CityView.close(); document.body.classList.remove('in-city'); $('chud').innerHTML = ''; $('tut').innerHTML = ''; chooseMode(); },
  pickMode: x => { UI.mode = x; UI.q = ''; startPick(); },
  pickCountry: x => { UI.pick.a3 = x; MapView.setPick(true, x); MapView.flyToCountry(x); renderPick(); },
  confirmCountry: () => nameCompany(),
  swatch: (x, el) => { UI.color = x; document.querySelectorAll('.sw').forEach(s => s.classList.toggle('on', s === el)); },
  beginGame: () => { const name = ($('cname').value || '').trim() || 'Tycoon Co.'; S = newGame({ mode: UI.mode, home: UI.pick.a3, name, color: UI.color }); save(); enterGame(false); },
  tutNext: () => { S.tutorial++; renderTutorial(); },
  tutSkip: () => { S.tutorial = -1; renderTutorial(); },
  panel: x => { if (UI.panel === x && !UI.stack.length) return closePanel(); closeModal(); if (CityView.isOpen()) leaveCity(); openPanel(x); },
  closePanel: () => closePanel(),
  panelBack: () => { UI.stack.pop(); renderPanel(); },
  closePopup: () => closePopup(),
  scrim: (x, el, e) => { if (e.target === el && UI.modal === 'sheet') closeModal(); },
  closeModal: () => { closeModal(); if (S && S.over) gameOver(); },
  speed: x => { S.speed = +x; renderHUD(); },
  skipMenu: () => skipMenu(),
  skip: x => doSkip(+x),
  zoom: x => MapView.zoom(+x),
  locate: () => MapView.home(),
  mktTab: x => { UI.mktTab = x; UI.q = ''; renderPanel(); },
  range: x => { UI.range = x; renderPanel(); },
  sector: x => { UI.sector = x; renderPanel(); },
  stock: (x, el, e) => {
    if (e.target.classList.contains('pbtn') && UI.panel === 'markets' && !UI.stack.length) { UI.showPct = !UI.showPct; refreshAll(); return; }
    if (UI.panel !== 'markets') { closePopup(); if (CityView.isOpen()) leaveCity(); UI.panel = 'markets'; UI.stack = []; renderHUD(); }
    pushPanel({ s: 'stock', sym: x });
  },
  flyCity: x => { closePanel(); MapView.flyToCity(+x); onCityTap(+x); },
  tradeSheet: x => { const [sym, side] = x.split('|'); tradeSheet(sym, side); },
  qty: x => { const q = $('qty'); q.value = Math.max(1, (+q.value || 0) + +x); updEst(); },
  qtySet: x => { $('qty').value = Math.max(0, +x); updEst(); },
  doTrade: x => { const [sym, side] = x.split('|'); const n = +$('qty').value; const err = trade(sym, side, n); if (err) return toast(err, 'bad'); sfx.cash(); closeModal(); toast(`${side[0].toUpperCase() + side.slice(1)} ${n.toLocaleString()} ${sym}`, 'good'); tutCheck(); refreshAll(); },
  research: x => act(() => research(x)),
  needs: () => { UI.needs = !UI.needs; renderPanel(); },
  bizTab: x => { UI.bizTab = x; renderPanel(); },
  newStore: () => { closePanel(); MapView.flyToCountry(Object.keys(S.biz)[0] || S.home); toast('Tap a city dot, then ENTER CITY to find a storefront.'); },
  storeSheet: x => storeSheet(x),
  propSheet: x => propSheet(x),
  wage: x => { const [a3, v] = x.split('|'); S.biz[a3].wage = +v; renderPanel(); },
  mkt: x => { const [a3, v] = x.split('|'); S.biz[a3].mkt = +v; renderPanel(); },
  upgrade: x => act(() => { const u = UPGRADES.find(y => y.id === x); if (S.cash < u.cost) return 'Not enough cash.'; S.cash -= u.cost; S.upgrades[x] = true; if (x === 'kiosk') S.stores.forEach(s => s.staff = Math.max(1, s.staff - 1)); return null; }, 'Upgrade bought'),
  ipo: x => act(() => goPublic(+x)),
  buyback: () => act(() => buyback(Math.min(0.05, S.ipo.outside))),
  borrow: () => act(() => borrow(Math.min(maxLoan(), Math.max(50000, maxLoan() / 4)))),
  repay: () => act(() => repay(Math.min(S.loan, Math.max(0, S.cash)))),
  staff: x => { const [id, d] = x.split('|'); const st = S.stores.find(s => s.id === id); st.staff = clamp(st.staff + +d, 1, 4 + st.size * 4); storeSheet(id); refreshAll(); },
  interior: x => act(() => { const st = S.stores.find(s => s.id === x), b = S.biz[st.a3]; const c = buildCost(b.type, st.interior + 1, st.a3) - buildCost(b.type, st.interior, st.a3); if (S.cash < c) return 'Not enough cash.'; S.cash -= c; st.interior++; storeSheet(x); return null; }),
  closeStore: x => { const p = S.props.find(y => y.store === x); if (p) delete p.store; closeStore(x); closeModal(); CityView.refresh(); refreshAll(); toast('Store closed'); },
  project: x => act(() => fundProject(x), 'Project funded'),
  diplomacy: x => act(() => diplomacy(x), 'Relations improved'),
  enterCity: x => { closeModal(); enterCity(+x); },
  leaveCity: () => leaveCity(),
  cityFilter: () => { const f = ['all', 'lease', 'sale', 'mine']; CityView.setFilter(f[(f.indexOf(CityView.filter) + 1) % 4]); renderCityHUD(); },
  cityInfo: () => { const c = CityView.city, k = W.byA3[c.a3], biz = S.biz[c.a3]; openModal(`<h2>${k.flag} ${esc(c.name)}</h2><p class="muted">${esc(k.name)}</p><div class="stats3 box"><div><span>Population</span><b>${fmtPop(c.pop)}</b></div><div><span>Your stores</span><b>${S.stores.filter(s => s.city === c.id).length}</b></div><div><span>Your buildings</span><b>${S.props.filter(p => p.city === c.id).length}</b></div></div><h4>Rival chains here</h4>${Object.keys(BIZ_TYPES).map(t => `<div class="kv"><span>${BIZ_TYPES[t].icon} ${BIZ_TYPES[t].name}${biz && biz.type === t ? ' (yours)' : ''}</span><b>${rivalCount(c.id, t)}</b></div>`).join('')}`, 'sheet'); },
  chooseBiz: x => chooseBizType(x),
  startBiz: x => { const [a3, type] = x.split('|'); const err = startBusiness(a3, type); if (err) return toast(err, 'bad'); sfx.cash(); closeModal(); renderCityHUD(); CityView.refresh(); toast(`${BIZ_TYPES[type].name} registered. Now lease a storefront.`, 'good'); refreshAll(); },
  lease: x => { const [t, i] = x.split('|').map(Number); const err = leaseLot(CityView.city.id, t, i); if (err) return toast(err, 'bad'); sfx.cash(); closeModal(); CityView.refresh(); renderCityHUD(); toast('Store opened! Results arrive every week.', 'good'); tutCheck(); refreshAll(); },
  buyBld: x => { const err = buyBuilding(CityView.city.id, +x); if (err) return toast(err, 'bad'); sfx.cash(); closeModal(); CityView.refresh(); renderCityHUD(); toast('Building bought. Rent arrives every week.', 'good'); refreshAll(); },
  sellBld: x => { const err = sellBuilding(x); if (err) return toast(err, 'bad'); closeModal(); CityView.refresh(); refreshAll(); },
  renovate: x => act(() => { const e = renovate(x); if (!e) propSheet(x); return e; }),
  ownStore: x => { const p = S.props.find(y => y.id === x), biz = S.biz[W.cities[p.city].a3]; const err = leaseLot(p.city, p.t, 0); if (err) return toast(err, 'bad'); const lot = cityLots(p.city).find(l => l.t === p.t); p.store = lot.store; closeModal(); CityView.refresh(); refreshAll(); toast(`${BIZ_TYPES[biz.type].name} opened in your building`, 'good'); },
  shop: x => act(() => claimShop(x), 'Claimed!'),
  claimDaily: () => { const r = dailyRewardInfo(); const e = claimDaily(); if (e) return toast(e, 'bad'); sfx.cash(); toast(`+${fmtMoney(r.amount, true)} daily reward`, 'good'); welcomeBack(); refreshAll(); },
  toggleMotion: () => { S.settings.motion = !S.settings.motion; renderPanel(); },
  recolor: x => { S.company.color = x; refreshAll(); },
  exportSave: () => { const t = btoa(unescape(encodeURIComponent(JSON.stringify(S)))); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Save copied', 'good'), () => toast('Clipboard unavailable', 'bad')); },
  importSave: () => openModal(`<h2>Load save</h2><textarea id="imp" class="text-in" rows="5" placeholder="Paste save data"></textarea><button class="btn3d orange wide" data-a="doImport">LOAD</button>`, 'sheet'),
  doImport: () => { try { S = JSON.parse(decodeURIComponent(escape(atob($('imp').value.trim())))); save(); closeModal(); enterGame(true); } catch (e) { toast('That save data is invalid', 'bad'); } },
  restart: () => openModal(`<h2>Restart?</h2><p class="muted">This ends your current game.</p><button class="btn3d orange wide" data-a="newGame">RESTART</button>`, 'sheet'),
};
function act(fn, ok) { const e = fn(); if (e) toast(e, 'bad'); else { if (ok) toast(ok, 'good'); sfx.cash(); } refreshAll(); return !e; }
function onClick(e) {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  if (el.dataset.a !== 'scrim' && e.target.closest('[data-stop]') && !el.closest('[data-stop]')) return;
  const fn = A[el.dataset.a]; if (fn) fn(el.dataset.x, el, e);
}
function onInput(e) {
  const t = e.target;
  if (t.id === 'csearch') { UI.q = t.value; const pos = t.selectionStart; renderPick(); const n = $('csearch'); n.focus(); n.setSelectionRange(pos, pos); return; }
  if (t.id === 'msearch') { UI.q = t.value; $('mlist').innerHTML = stockList(); return; }
  if (t.id === 'qty') return updEst();
  if (t.id === 'rename') { S.company.name = t.value.slice(0, 24) || S.company.name; renderHUD(); return; }
  const k = t.dataset.in; if (!k) return;
  if (k === 'price' || k === 'quality') { S.biz[t.dataset.x][k] = +t.value; t.nextElementSibling.textContent = k === 'price' ? Math.round(t.value * 100) + '%' : '★'.repeat(+t.value); }
  if (k === 'vol' || k === 'ui') { S.settings[k] = +t.value; t.nextElementSibling.textContent = Math.round(t.value * 100) + '%'; }
  if (k === 'rentLv') { const p = S.props.find(x => x.id === t.dataset.x); p.rentLv = +t.value; t.nextElementSibling.textContent = fmtMoney(p.mrent * p.rentLv) + '/unit'; }
}
function refreshAll() { if (!S) return; if (!UI.pick) renderHUD(); if (UI.panel) renderPanel(); if (UI.popup) renderPopup(); if (CityView.isOpen()) renderCityHUD(); }

// ---------- game loop ----------
let lastT = 0, lastSave = 0, lastDraw = 0;
function loop(now) {
  if (!S || UI.pick || S.over) { lastT = now; return; }
  const dt = Math.min(1000, now - (lastT || now)); lastT = now;
  const focused = document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName) && document.activeElement.type !== 'range';
  if (S.speed > 0 && !document.hidden && !UI.modal) {
    UI.acc += dt;
    const per = DAY_MS_BY_SPEED[S.speed], wars = S.wars.length; let stepped = false;
    while (UI.acc >= per) { UI.acc -= per; stepDay(); stepped = true; if (S.over) break; }
    if (stepped) {
      if (S.wars.length !== wars || S.day % 7 === 0) MapView.redraw();
      if (!focused && now - lastDraw > 250) {
        lastDraw = now; renderHUD(); if (UI.popup) renderPopup(); if (CityView.isOpen()) renderCityHUD();
        if (UI.panel && now - UI.lastPanel > 1500 && !document.querySelector('#panel input:focus, #panel input:active')) renderPanel();
      }
      if (S.over) { save(); gameOver(); }
    }
  } else UI.acc = 0;
  if (now - lastSave > 10000) { lastSave = now; save(); }
}

boot();
