'use strict';
// Advertising engine: four paid routes, all bought by real in-game
// companies — yours and the CPU's.
//
// Routes: newspaper (2 pages in The Ticker Times, rotating weekly),
// web (side banners on company websites, switching every 5 seconds),
// Tawk (sponsored posts in the feed), radio (DJ ad reads on Robot
// Radio). A company buys a route for N weeks at a flat weekly rate.
// While its ads run, the company earns a small revenue lift (2% per
// active route, max 8%) — ads work, they don't print money.
// CPU companies buy on their own (10% per week); the player buys in
// the Advertising app. CPU spend is abstracted (they carry no cash
// balance); player spend comes out of the business wallet up front.
const AD_ROUTES = {
  paper: { name: 'Newspaper', cost: 25000, blurb: '2 ad pages in The Ticker Times, rotating weekly to whoever pays' },
  web: { name: 'Web', cost: 10000, blurb: 'Side banners on company websites, switching every 5 seconds' },
  tawk: { name: 'Tawk', cost: 15000, blurb: 'Sponsored posts in the Tawk feed while people scroll' },
  radio: { name: 'Radio', cost: 20000, blurb: 'DJ ad reads during Robot Radio shows' },
};

function adBuyers() { if (!Array.isArray(S.adBuyers)) S.adBuyers = []; return S.adBuyers; }
function activeAds(route) { return adBuyers().filter(a => a.route === route && a.weeksLeft > 0); }
function adBoostFor(ref) {
  const routes = new Set();
  adBuyers().forEach(a => { if (a.ref === ref && a.weeksLeft > 0) routes.add(a.route); });
  return Math.min(0.08, routes.size * 0.02);
}

// Weekly tick for one flagship, called from companyWeek (never on
// quiet/seeding calls). Returns this company's revenue lift.
function adWeek(c, quiet) {
  if (quiet) return adBoostFor(c.a3);
  if (c.lastAdWeek === S.day) return adBoostFor(c.a3);
  c.lastAdWeek = S.day;
  if (Array.isArray(S.adBuyers)) S.adBuyers = S.adBuyers.filter(a => a.weeksLeft > 0);
  adBuyers().forEach(a => { if (a.ref === c.a3 && a.weeksLeft > 0) a.weeksLeft--; });
  if (c.ai && typeof controlled === 'function' && !controlled(c.a3) && Math.random() < 0.10) {
    const routes = Object.keys(AD_ROUTES);
    const route = routes[Math.floor(Math.random() * routes.length)];
    adBuyers().push({ kind: 'co', ref: c.a3, name: c.name, sym: c.sym, route, weeksLeft: 1 + Math.floor(Math.random() * 4), weeklyCost: AD_ROUTES[route].cost, paid: false });
  }
  return adBoostFor(c.a3);
}

function buyAd(a3, route, weeks) {
  const r = AD_ROUTES[route];
  if (!r) return 'Unknown ad route.';
  const c = S.co[a3];
  if (!c) return 'Company not found.';
  if (typeof controlled === 'function' && !controlled(a3)) return 'You can only advertise companies you control.';
  const cost = r.cost * weeks;
  if (S.cash < cost) return `Needs ${fmtMoney(cost, true)} — you have ${fmtMoney(S.cash, true)}.`;
  S.cash -= cost;
  adBuyers().push({ kind: 'co', ref: a3, name: c.name, sym: c.sym, route, weeksLeft: weeks, weeklyCost: r.cost, paid: true });
  return null;
}

// One ad line per company, stable per company + route (seeded, so the
// same ad shows consistently while it runs).
function adLineFor(a, route) {
  const c = S.co[a.ref] || { name: a.name, sector: '' };
  const rnd = (typeof corpRand === 'function' && typeof corpHash === 'function') ? corpRand(corpHash('ad' + (a.ref || a.name) + route)) : Math.random;
  const lines = [
    `${c.name} — ${c.sector || 'business'}. Now open near you.`,
    `Why wait? ${c.name} delivers.`,
    `${c.name} is hiring. Join the team.`,
    `New from ${c.name}: better than ever.`,
    `${c.name}: the name to trust.`,
    `This week only: ${c.name} wants your business.`,
  ];
  return lines[Math.floor(rnd() * lines.length)];
}
function adCardHTML(a, route) {
  const c = S.co[a.ref];
  const icon = (c && SECTORS[c.sector]) ? SECTORS[c.sector].icon : '🏢';
  return `<div class="ad-card"><span class="ad-tag">AD</span><div class="ad-ic">${icon}</div><b>${esc(a.name)}${a.sym ? ` (${esc(a.sym)})` : ''}</b><p>${esc(adLineFor(a, route))}</p><span class="muted small">${AD_ROUTES[route].name} · ${a.weeksLeft} week${a.weeksLeft === 1 ? '' : 's'} left</span></div>`;
}

// Newspaper: up to 8 ads (4 per page), rotated weekly through all
// paying buyers so no buyer hogs the pages.
function newspaperAds() {
  const buyers = activeAds('paper');
  if (!buyers.length) return [];
  const week = Math.floor(S.day / 7);
  const rot = week % buyers.length;
  return buyers.slice(rot).concat(buyers.slice(0, rot)).slice(0, 8);
}

// Web rail: one banner per side, switching every 5 seconds through
// paying web advertisers. The timer touches ONLY the two rail divs —
// never the panel body, never any input (timed re-render safety).
function webAdRender() {
  const l = document.getElementById('webrailL'), r = document.getElementById('webrailR');
  if (!l || !r) { if (UI.webAdTimer) { clearInterval(UI.webAdTimer); UI.webAdTimer = null; } return; }
  const buyers = activeAds('web');
  if (!buyers.length) {
    const house = `<div class="ad-card"><span class="ad-tag">AD</span><b>YOUR AD HERE</b><p>Advertise your company on the web.</p><button class="btn small" data-a="panel" data-x="ads">Buy a web ad</button></div>`;
    l.innerHTML = house; r.innerHTML = house;
    return;
  }
  const idx = (UI.webAdIdx || 0) % buyers.length;
  const html = adCardHTML(buyers[idx], 'web');
  l.innerHTML = html; r.innerHTML = html;
}
function webAdStart() {
  // The game re-renders the open panel every ~1.5s (heartbeat). If the
  // timer is already running, just fill the fresh rail divs — never
  // reset the index or restart the clock, or the 5s rotation would
  // never advance past the first ad.
  if (UI.webAdTimer) { webAdRender(); return; }
  UI.webAdIdx = 0;
  webAdRender();
  UI.webAdTimer = setInterval(() => { UI.webAdIdx = (UI.webAdIdx || 0) + 1; webAdRender(); }, 5000);
}

// --- Advertising panel (the buying app) ------------------------------
function adsPanelHTML() {
  // NOTE: the local must NOT be called `mine` — `const mine = mine()`
  // is a TDZ error (the local shadows the global function).
  const mineList = (typeof mine === 'function') ? mine() : [];
  const sel = (UI.adCompany && S.co[UI.adCompany]) ? UI.adCompany : (mineList.length ? mineList[0].a3 : null);
  const route = UI.adRoute || 'paper';
  const weeks = UI.adWeeks || 4;
  const rate = AD_ROUTES[route].cost;
  const cost = rate * weeks;
  const myAds = adBuyers().filter(a => a.paid && a.weeksLeft > 0);
  const byRoute = {};
  Object.keys(AD_ROUTES).forEach(r => { byRoute[r] = activeAds(r).length; });
  return panelShell('Advertising', 'Four routes. Real companies pay, real companies get seen.',
    `${!mineList.length ? '<p class="muted">You control no company yet. Buy a majority stake or found one, then come back and advertise it.</p>' : `
    <div class="card in"><h4>Your company</h4><div class="row wrap">${mineList.map(c => `<button class="chip ${c.a3 === sel ? 'on' : ''}" data-a="adCompany" data-x="${c.a3}">${esc(c.name)} (${esc(c.sym)})</button>`).join('')}</div></div>
    <div class="card in"><h4>Route</h4><div class="row wrap">${Object.entries(AD_ROUTES).map(([k, v]) => `<button class="chip ${k === route ? 'on' : ''}" data-a="adRoute" data-x="${k}">${v.name} · ${fmtMoney(v.cost, true)}/wk</button>`).join('')}</div><p class="muted small">${AD_ROUTES[route].blurb}</p></div>
    <div class="card in"><h4>Duration</h4><div class="row wrap">${[1, 4, 13].map(w => `<button class="chip ${w === weeks ? 'on' : ''}" data-a="adWeeks" data-x="${w}">${w} week${w === 1 ? '' : 's'}</button>`).join('')}</div>
    <div class="kv"><span>Total cost</span><b>${fmtMoney(cost, true)}</b></div><div class="kv"><span>Business cash</span><b>${fmtMoney(S.cash, true)}</b></div>
    <button class="btn3d orange wide" data-a="adBuy">BUY AD · ${fmtMoney(cost, true)}</button></div>`}
    <div class="card in"><h4>Who is advertising this week</h4>${Object.entries(AD_ROUTES).map(([k, v]) => `<div class="kv"><span>${v.name}</span><b>${byRoute[k]} buyer${byRoute[k] === 1 ? '' : 's'}</b></div>`).join('')}</div>
    ${myAds.length ? `<div class="card in"><h4>Your active ads</h4>${myAds.map(a => `<div class="kv"><span>${esc(a.name)} · ${AD_ROUTES[a.route].name}</span><b>${a.weeksLeft} week${a.weeksLeft === 1 ? '' : 's'} left</b></div>`).join('')}</div>` : ''}`);
}
