// Game state and simulation: companies, ownership, market, business and
// buildings. World events and the military live in world-events.js.
// Uses globals W (world) and S (save state).
'use strict';

const SAVE_KEY = 'tickerTycoon.world.v2';
const BOARD_KEY = 'tickerTycoon.world.board';
const START_MS = Date.UTC(START_YEAR, 0, 1);
const DAY_MS = 864e5;
const NORMAL_DAYS = Math.round(NORMAL_YEARS * 365.25);

const rand = Math.random;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(rand() * a.length)];
const gauss = () => { let u = 0, v = 0; while (!u) u = rand(); while (!v) v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const uid = () => Math.random().toString(36).slice(2, 9);
const dateOf = d => new Date(START_MS + d * DAY_MS);
const isWeekend = d => { const w = dateOf(d).getUTCDay(); return w === 0 || w === 6; };
function storeGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function storeSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
function todayStr() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
const fmtDate = d => dateOf(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const yearOf = d => dateOf(d).getUTCFullYear();

const REGIMES = {
  calm:     { name: 'Calm market', drift: 0.0004,  vol: 1.0,  len: [20, 60], next: { bull: 0.35, bear: 0.2, volatile: 0.2, bubble: 0.1, calm: 0.15 }, news: 'Markets settle into a quiet stretch.' },
  bull:     { name: 'Bull market', drift: 0.0011,  vol: 0.85, len: [20, 70], next: { calm: 0.4, volatile: 0.2, bubble: 0.2, bear: 0.2 }, news: 'A new bull market: stocks are climbing worldwide.' },
  bear:     { name: 'Bear market', drift: -0.0012, vol: 1.3,  len: [15, 45], next: { calm: 0.5, crash: 0.12, volatile: 0.38 }, news: 'Recession fears drag world markets into a bear market.' },
  volatile: { name: 'Volatile',    drift: 0,       vol: 1.7,  len: [8, 20],  next: { calm: 0.5, crash: 0.2, bull: 0.3 }, news: 'Wild swings rattle traders as volatility spikes.' },
  bubble:   { name: 'Bubble',      drift: 0.0028,  vol: 1.15, len: [15, 35], next: { crash: 0.6, bear: 0.4 }, news: 'Euphoria grips the markets. Everyone is a genius.' },
  crash:    { name: 'Crash',       drift: -0.014,  vol: 2.5,  len: [3, 7],   next: { bear: 0.5, volatile: 0.5 }, news: 'MARKET CRASH. Panic selling sweeps every exchange.' },
};
const pickW = t => { let r = rand(), k; for (k in t) { r -= t[k]; if (r <= 0) return k; } return k; };
const regimeOf = type => ({ type, left: REGIMES[type].len[0] + Math.floor(rand() * (REGIMES[type].len[1] - REGIMES[type].len[0])) });

// ---------- new game ----------
function newGame(opt) {
  const s = {
    v: 2, seed: Math.floor(rand() * 1e9), mode: opt.mode, randomWorld: opt.mode === 'worl' || opt.mode === 'random', home: opt.home, day: 0, speed: 1, leader: !!opt.leader, extra: {}, countryName: opt.countryName || null,
    you: { name: opt.name || 'Founder', color: opt.color || LOGO_COLORS[0] },
    cash: 750000, loan: 0, xp: 0, rating: 0,
    countries: {}, co: {}, idx: { v: 1000, h: { d: [], w: [], m: [], v: [] } }, idx0: 1000,
    holdings: {}, props: [], lotState: {}, placed: [],
    regime: regimeOf('calm'), nextRate: 30 + Math.floor(rand() * 40), oil: 1, trade: 1,
    wars: [], live: [], news: [], mail: [], papers: [], cityHit: {}, boosts: {}, pandemic: 0, facilities: {}, lastWarDay: null,
    maxDays: NORMAL_DAYS, yearsBought: 0, yearReport: null, homeTaxPrev: null,
    nh: { d: [], w: [], m: [] }, watch: [], stats: { trades: 0, bestWeek: 0, startNet: 0, takeovers: 0, ipos: 0, wars: 0 },
    career: 0, goalsDone: [], daily: { streak: 0, last: null }, shop: {}, tutorial: 0, notified: 0,
    settings: { vol: 0.5, ui: 0.8, motion: true, minigames: true, battleSize: '6x6' }, over: null, week: { profit: 0 },
  };
  S = s;
  W.lotCache = {};
  // Countries, with military levels from their real strength: the
  // 2025 Global Firepower ranking for the top 39, a GDP + population
  // formula for everyone else. Every country starts under 20.
  W.playable.forEach((k) => {
    const gdpPc = k.gdp0 * 1e6 / Math.max(1, k.pop0);
    const lv = (typeof realMilLevel === 'function') ? realMilLevel(k) : 1;
    const cs = { pop: k.pop0, pop0: k.pop0, gdp: k.gdp0, growth: clamp(0.045 - 0.012 * Math.log10(gdpPc / 1000), 0.008, 0.06),
      stab: clamp(48 + k.wealth * 14 + gauss() * 12, 12, 95), mil: Math.sqrt(k.gdp0) * (0.6 + rand() * 0.8), tax: +(0.15 + rand() * 0.2).toFixed(2),
      incTax: 0.20, vat: 0.05, taxRev: 0,
      milLv: { air: lv, navy: k.coastal ? lv : 0, army: lv }, rel: {}, war: null, occ: null, drift: 0, fx: [], proj: [], nextElect: Math.floor(rand() * 1600), boom: 0, unrest: 0, treasury: k.gdp0 * 1e6 * 0.05, debt: k.gdp0 * 1e6 * 0.54, lastWeek: null };
    k.nb.forEach(b => { if (W.byA3[b] && W.byA3[b].playable) cs.rel[b] = Math.round(clamp(30 + gauss() * 25, -40, 90)); });
    s.countries[k.a3] = cs;
  });
  for (const a in s.countries) for (const b in s.countries[a].rel) if (s.countries[b]) s.countries[b].rel[a] = s.countries[a].rel[b];
  const usedNames = new Set(), usedSyms = new Set();
  if (opt.leader) {
    // Leader game: 2–3 businesses per country. Flagship is a full company,
    // extras are economic businesses (see leader.js). Flagship sector and
    // extra sectors come from the realism pool, never a random global sector.
    // Count is random (2 vs 3), sectors are realism-picked.
    W.playable.forEach(k => {
      const pool = (typeof sectorPoolForCountry === 'function') ? sectorPoolForCountry(k) : SECTOR_LIST.slice();
      const must = (typeof mustHaveForCountry === 'function') ? mustHaveForCountry(k.a3) : [];
      // MUST-HAVE FIRST, guaranteed, not random: e.g. Russia ALWAYS gets
      // Oil Extraction + Natural Gas, Taiwan ALWAYS gets Semiconductors.
      // Total is 3 if there are 2 must-haves, otherwise 2 or 3 random.
      let total = must.length >= 2 ? 3 : (rand() < 0.5 ? 2 : 3);
      total = Math.max(total, must.length);
      const sectors = [...must];
      while (sectors.length < total) {
        const avail = pool.filter(x => !sectors.includes(x));
        if (!avail.length) break;
        sectors.push(pick(avail));
      }
      const flagSector = sectors[0];
      s.co[k.a3] = makeCompany(k, flagSector, usedNames, usedSyms);
      sectors.slice(1).forEach((sec, i) => {
        const ex = makeExtraBusiness(k, sec, usedNames, usedSyms, i + 1);
        s.extra[ex.id] = ex;
      });
    });
  } else {
    // Tycoon (legacy, old saves / old mode): one company per country.
    const deck = []; SECTOR_LIST.forEach(sec => { for (let i = 0; i < Math.ceil(W.playable.length / SECTOR_LIST.length); i++) deck.push(sec); });
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    W.playable.forEach((k, i) => {
      const sector = deck[i], c = makeCompany(k, sector, usedNames, usedSyms);
      s.co[k.a3] = c;
    });
  }
  // You start with a fresh startup in your home country (tycoon only).
  // Leader games do NOT own the flagship: you inherit the country, you
  // tax its businesses, you do not own 100% of one of them.
  const home = s.co[opt.home];
  if (!opt.leader) {
    if (opt.company) { home.name = opt.company; home.sym = tickerFor(opt.company, usedSyms); }
    home.color = s.you.color; home.locs.forEach(l => setLot(home.city, l.t, null)); home.locs = [];
    home.fleet = SECTORS[home.sector].fleet ? 1 : 0; home.web = { tier: 0, ads: {}, addons: {} }; home.ai = false;
    home.listed = false; home.avg = 0; home.rating = 3.5; home.hist = [];
  }
  // Seed market history for listed companies.
  for (const a3 in s.co) {
    const c = s.co[a3];
    for (let w = 0; w < 4; w++) companyWeek(c, true);
    c.avg = c.week.profit;
    const V = Math.max(4e6, companyFairTotal(c)), p0 = +(8 + rand() * 190).toFixed(2);
    c.shares = Math.max(1e5, Math.round(V / p0)); c.price = p0 * Math.exp(gauss() * 0.1); c.p0 = c.price;
    if (!c.listed) { c.price = V / c.shares; c.p0 = c.price; }
    const path = [c.price]; for (let i = 1; i < 260; i++) path.unshift(path[0] / Math.exp(gauss() * c.vol + 0.0003));
    path.forEach((p, i) => { const v = +p.toFixed(2); c.h.d.push(v); c.h.v.push(Math.round(c.shares * 0.003 * (0.5 + rand()))); if (i % 5 === 4) c.h.w.push(v); if (i % 21 === 20) c.h.m.push(v); });
    c.price = path[path.length - 1];
  }
  if (opt.leader) {
    // Current-day start: treasury is 5% of real GDP, debt is 54% of GDP.
    // Struggling countries start struggling — that is the challenge.
    const homeCs = s.countries[opt.home];
    s.cash = homeCs.treasury;
    s.holdings = {};
  } else {
    s.holdings[opt.home] = { qty: home.shares, cost: 0 };
  }
  if (typeof ensureSports === 'function') { try { ensureSports(); } catch (e) {} }
  if (typeof ensureStores === 'function') { try { ensureStores(); } catch (e) {} }
  s.idx.v = 1000; ['d', 'w', 'm'].forEach(k => s.idx.h[k].push(1000));
  s.stats.startNet = netWorth();
  s.nh.w.push([0, s.stats.startNet, 1000]); s.nh.m.push([0, s.stats.startNet, 1000]);
  s.homeTaxPrev = { tax: s.countries[opt.home].tax, incTax: s.countries[opt.home].incTax, vat: s.countries[opt.home].vat };
  if (opt.leader) {
    const biz = businessesInCountry(opt.home);
    news('World', `You have inherited ${cname(opt.home)}. Treasury ${fmtMoney(s.cash, true)}, debt ${fmtMoney(s.countries[opt.home].debt, true)}.`, opt.home);
    mail('Welcome', `You have inherited ${cname(opt.home)}`, `You are now the leader of ${cname(opt.home)}, as it is today. Treasury ${fmtMoney(s.cash, true)}, debt ${fmtMoney(s.countries[opt.home].debt, true)}, population ${fmtPop(s.countries[opt.home].pop)}. Businesses: ${biz.map(b => b.name + ' (' + b.sector + ')').join(', ')}. Tax them, pay your people, trade, and grow — or invade a neighbour for the challenge.`);
  } else {
    news('World', `Welcome to ${W.byA3[opt.home].name}. You found ${home.name} with $750,000.`, opt.home);
    mail('Welcome', 'Your new company', `Congratulations on founding ${home.name}. You own 100% of it. Open your first location in ${W.cities[home.city].name}, then build a website to reach customers online.`);
  }
  return s;
}
function tickerFor(name, used) {
  const L = name.toUpperCase().replace(/[^A-Z]/g, '') || 'MINE';
  for (const t of [L.slice(0, 4), L.slice(0, 3), L[0] + L.slice(-3), L.slice(0, 2) + L.slice(-1)]) if (t.length >= 3 && !used.has(t)) { used.add(t); return t; }
  for (;;) { const t = L.slice(0, 3) + String.fromCharCode(65 + Math.floor(rand() * 26)); if (!used.has(t)) { used.add(t); return t; } }
}
function makeCompany(k, sector, usedNames, usedSyms) {
  const info = SECTORS[sector];
  let brand, name, sym;
  // Shuffled world only: names/tickers from the separate random pool, so
  // a random run never reuses the real World's naming pool. Real World
  // and tycoon games keep the base generator below, unchanged.
  if (typeof genRandomCompany === 'function' && isRandomWorld()) { const g = genRandomCompany(sector, usedNames, usedSyms); if (g) { brand = g.brand; name = g.name; sym = g.sym; } }
  if (!name) { do { brand = pick(BRAND_A) + pick(BRAND_B); } while (usedNames.has(brand)); usedNames.add(brand); name = brand + pick(SUFFIX[sector]); sym = tickerFor(brand, usedSyms); }
  const g = Math.log10(Math.max(30, k.gdp0));
  const c = { a3: k.a3, sector, name, sym, city: k.capital, color: LOGO_COLORS[Math.floor(rand() * LOGO_COLORS.length)],
    price: 1, p0: 1, shares: 1, listed: true, ai: true, pe: info.pe * (0.85 + rand() * 0.3), vol: info.vol * (0.85 + rand() * 0.4) * (k.wealth < 0.6 ? 1.2 : 1),
    beta: info.beta * (0.8 + rand() * 0.4), mood: gauss() * 0.3, moodT: gauss() * 0.4, tmp: 0, shock: 0, pattern: null,
    set: { price: 1, quality: 3, wage: 1 }, locs: [], fleet: 0, web: { tier: clamp(Math.round(k.wealth * 1.4 + rand() * 1.2 - 0.4), 0, 4), ads: {}, addons: {} },
    rating: 3.4 + rand() * 0.5, avg: 0, hist: [], week: { profit: 0 }, h: { d: [], w: [], m: [], v: [] }, tradedToday: 0, dayVol: 0, founded: 0,
    yearStats: { satW: 0, satN: 0, rev: 0, profit: 0, weeks: 0 }, lastYearProfit: null, ratingReasons: [] };
  if (info.fleet) c.fleet = clamp(Math.round(g - 2.6 + rand() * 0.8), 1, 6);
  if (c.web.tier >= 2 && rand() < 0.5) c.web.ads.search = true;
  if (c.web.tier >= 3 && rand() < 0.4) c.web.ads.social = true;
  if (rand() < 0.5) c.web.addons.security = true;
  const n = clamp(Math.round((info.fleet ? 0.5 : 1.3) * (g - 2) + rand()), 1, info.fleet ? 4 : 9);
  for (let i = 0; i < n; i++) aiOpenLocation(c);
  return c;
}

// ---------- lookups ----------
const country = a3 => S.countries[a3];
function topCities(a3, n) { return W.cities.filter(c => c.a3 === a3).sort((a, b) => b.pop - a.pop).slice(0, n || 5); }
function businessesInCity(cityId) { const out = []; for (const a3 in S.co) { const c = S.co[a3]; c.locs.forEach(l => { if ((l.city || c.city) === cityId) out.push({ c, l }); }); } return out; }
const co = a3 => S.co[a3];
const cname = a3 => (S && S.countryName && a3 === S.home) ? S.countryName : W.byA3[a3].name;
const homeCo = () => S.co[S.home];
function stake(a3) { const h = S.holdings[a3]; return h && h.qty > 0 ? h.qty / S.co[a3].shares : 0; }
const controlled = a3 => stake(a3) >= 0.5;
function mine() { const out = []; for (const a3 in S.holdings) if (S.co[a3] && controlled(a3)) out.push(S.co[a3]); return out.sort((a, b) => (b.a3 === S.home) - (a.a3 === S.home) || companyValue(b) - companyValue(a)); }
function locCount() { return mine().reduce((a, c) => a + c.locs.length, 0); }
function news(cat, text, a3) {
  S.news.unshift({ d: S.day, cat, text, a3 }); if (S.news.length > 150) S.news.length = 150;
  if (cat === 'War' || cat === 'Milestone' || cat === 'Business' || cat === 'Nation' || (a3 && (a3 === S.home || controlled(a3)))) S.notified++;
}
function mail(from, subject, body, offer) { S.mail.unshift({ id: uid(), d: S.day, from, subject, body, offer: offer || null, read: false }); if (S.mail.length > 60) S.mail.length = 60; }
function live(title, days, cat, a3) { S.live.push({ id: uid(), title, until: S.day + days, cat, a3 }); }

// ---------- city lots (deterministic per game, only changes are saved) ----------
function baseLots(cityId) {
  const key = cityId + ':' + S.seed;
  if (!W.lotCache) W.lotCache = {};
  if (W.lotCache[key]) return W.lotCache[key];
  const city = W.cities[cityId], L = cityLayout(city), r = mulberry(hashStr('lots' + key)), w = city.wealth;
  const tFac = clamp(Math.log10(city.pop) / 6.4, 0.55, 1.2), lots = [];
  L.tiles.forEach(t => {
    if (t.kind !== 'lot') return;
    const roll = r(), idx = t.y * L.N + t.x, traffic = Math.round(t.traffic * tFac);
    const size = t.arch === 'warehouse' || t.floors > 12 ? 3 : t.floors > 4 ? 2 : 1;
    if (t.arch !== 'house' && t.arch !== 'rowhouse' && roll < 0.11) {
      lots.push({ t: idx, kind: 'lease', traffic, size, arch: t.arch, rent: Math.round(traffic * 0.09 * Math.pow(w, 0.9) * (0.85 + r() * 0.3) / 10) * 10, srent: Math.round(size * 1500 * Math.pow(w, 0.9) * (0.85 + r() * 0.3) / 10) * 10 });
    } else if (roll > 0.93 && t.arch !== 'warehouse') {
      const units = t.arch === 'house' ? 1 : t.arch === 'rowhouse' ? 2 + Math.floor(r() * 2) : Math.max(4, Math.round(t.floors * (1.5 + r() * 2)));
      const mrent = Math.round(70 + 380 * Math.pow(w, 1.05)), cap = 0.05 + (1 - Math.min(1, w)) * 0.04;
      lots.push({ t: idx, kind: 'sale', traffic, size, arch: t.arch, units, mrent, cond: +(0.5 + r() * 0.45).toFixed(2), price: Math.round(units * mrent * 52 / cap * (0.85 + r() * 0.3) / 1000) * 1000 });
    }
  });
  W.lotCache[key] = lots;
  return lots;
}
function setLot(cityId, t, state) { const m = S.lotState[cityId] || (S.lotState[cityId] = {}); if (state == null) delete m[t]; else m[t] = state; }
function lotKind(cityId, lot) { const st = S.lotState[cityId] && S.lotState[cityId][lot.t]; return st || lot.kind; }
function cityLots(cityId) { return baseLots(cityId).map(l => Object.assign({}, l, { kind: lotKind(cityId, l) })); }
const locMode = c => SECTORS[c.sector].loc.mode;
const lotRent = (c, lot) => locMode(c) === 'size' ? lot.srent : lot.rent;
function buildCost(c, interior) { const L = SECTORS[c.sector].loc; return Math.round(L.buildout * [1, 1.5, 2.4][interior] * Math.max(0.45, Math.pow(W.byA3[c.a3].wealth, 0.5)) / 1000) * 1000; }
function maxStaff(c, loc) { return locMode(c) === 'size' ? loc.size * SECTORS[c.sector].loc.staffPerSize : 4 + loc.size * 4; }

// ---------- economics ----------
function bizMult(a3, cityId) {
  const c = country(a3); let m = 1;
  if (c.war) m *= 0.6; if (c.occ) m *= 0.35; if (c.unrest > S.day) m *= 0.8; if (c.boom > S.day) m *= 1.12;
  if (S.pandemic > S.day) m *= 0.75;
  if (cityId != null && S.cityHit[cityId] > S.day) m *= 0.25;
  return m;
}
// Revenue grows with the country's economy since the game began.
function econ(c) { const cs = country(c.a3); return cs.gdp / W.byA3[c.a3].gdp0 * W.byA3[c.a3].pop0 / cs.pop; }
function adsF(c) { let e = 0; WEB_ADS.forEach(a => { if (c.web.ads[a.id]) e += a.effect; }); return 1 + e; }
function webF(c) { return (1 + WEB_TIERS[c.web.tier].boost + (c.web.addons.seo ? 0.04 : 0) + (c.web.addons.loyalty ? 0.08 : 0)) * (typeof siteRatingFactor === 'function' ? siteRatingFactor(c) : 1); }
// One location for one week. Shared by the simulation and the lease forecast.
function locEconomics(c, loc, nLocs) {
  const k = W.byA3[c.a3], w = k.wealth, L = SECTORS[c.sector].loc, s = c.set;
  // Mars: an unlocked country's companies pay 15% less in location costs.
  const cm = (typeof marsCostMult === 'function') ? marsCostMult(c.a3) : 1;
  const m = bizMult(c.a3, loc.city || c.city), brandF = 0.6 + (c.rating || 3.5) * 0.09, qualityF = 0.7 + 0.15 * s.quality, interiorF = [1, 1.15, 1.3][loc.interior];
  // Tax demand, normalised so the default rates (20% income, 5% VAT) change
  // nothing: raising them cuts household spending, cutting them lifts it.
  const _cs = country(c.a3), taxDemand = (1 - ((_cs.incTax || 0.20) - 0.20) * 0.5) * (1 - ((_cs.vat || 0.05) - 0.05) * 1.0);
  const wageSpeed = s.wage < 1 ? 0.85 : s.wage > 1 ? 1.15 : 1, rush = S.boosts.rush > S.day && controlled(c.a3) ? 2 : 1;
  const extraSat = (c.web.addons.reviews ? 0.3 : 0) + (loc.boost || 0);
  if (L.mode === 'traffic') {
    const priceF = Math.pow(1 / s.price, 1.7), comp = 1 / (1 + 0.12 * Math.max(0, nLocs - 1));
    const demand = loc.traffic * L.capture * 1.4 * priceF * qualityF * interiorF * adsF(c) * webF(c) * brandF * comp * m * rush * taxDemand;
    const cap = loc.staff * L.throughput * wageSpeed;
    const served = Math.min(demand, cap), over = demand / Math.max(1, cap);
    const sat = clamp(3 + (qualityF - 1) * 4 + (interiorF - 1) * 3 - Math.min(1.5, Math.max(0, over - 1) * 2.5) + (s.wage - 1) * 2.5 - (s.price - 1) * 2 + extraSat, 1, 5);
    const rev = served * L.ticket * Math.pow(w, 0.6) * s.price * Math.pow(econ(c), 0.7);
    const cogs = rev * L.cogs * (0.8 + 0.1 * s.quality);
    const wages = loc.staff * L.wage * Math.pow(w, 0.7) * s.wage;
    return { demand, cap, served, sat, rev, cost: (cogs + wages + loc.rent) * cm, profit: rev - (cogs + wages + loc.rent) * cm };
  }
  // Offices and warehouses: revenue per employee, with a market that saturates.
  const totalStaff = c._staff != null ? c._staff : c.locs.reduce((a, l) => a + l.staff, 0);
  const sat0 = 1 / (1 + totalStaff / (8 * Math.sqrt(k.gdp0 / 1000) + 5));
  const fleetBoost = c.sector === 'Shipping' ? 1 + c.fleet * 0.08 : 1;
  const dF = m * webF(c) * Math.sqrt(adsF(c)) * brandF * (0.8 + 0.1 * s.quality) * Math.pow(1 / s.price, 0.6) * s.price * sat0 * fleetBoost * interiorF * rush * Math.pow(econ(c), 0.7) * taxDemand;
  const rev = loc.staff * L.perStaff * Math.pow(w, 0.7) * dF;
  const wages = loc.staff * L.wage * Math.pow(w, 0.8) * s.wage;
  const sat = clamp(3 + (s.wage - 1) * 2.5 + (s.quality - 3) * 0.3 + (interiorF - 1) * 3 - (s.price - 1) * 1.5 + extraSat, 1, 5);
  return { demand: loc.staff, cap: maxStaff(c, loc), served: loc.staff, sat, rev, cost: (wages + loc.rent) * cm, profit: rev - (wages + loc.rent) * cm };
}
function fleetDemand(c) {
  const k = W.byA3[c.a3], cs = country(c.a3);
  let d = clamp(0.7 + 0.15 * Math.log10(k.gdp0 / 1000), 0.6, 1.35) * (1 + (adsF(c) - 1) * 0.4) * Math.sqrt(bizMult(c.a3));
  if (c.sector === 'Airline') d *= (S.pandemic > S.day ? 0.4 : 1) * (0.85 + (c.rating || 3.5) * 0.04);
  if (c.sector === 'Shipping') d *= S.trade * (cs.fx.some(f => f.sanction) ? 0.7 : 1);
  if (c.sector === 'Energy') d *= S.oil;
  return d;
}
function fleetEconomics(c) {
  const F = SECTORS[c.sector].fleet; if (!F || !c.fleet) return { rev: 0, cost: 0, profit: 0 };
  const lv = F.levels[c.fleet], rev = lv.gross * fleetDemand(c) * Math.pow(econ(c), 0.6);
  return { rev, cost: lv.opex, profit: rev - lv.opex };
}
function marketSize(c) { return Math.sqrt(W.byA3[c.a3].gdp0) * 40; }
function onlineEconomics(c) {
  const T = WEB_TIERS[c.web.tier]; if (!c.web.tier || c.web.down > S.day) return { rev: 0, cost: 0, profit: 0, visitors: 0 };
  const rev = marketSize(c) * Math.pow(econ(c), 0.8) * T.online * (c.web.addons.seo ? 1.08 : 1) * adsF(c) * (0.6 + (c.rating || 3.5) * 0.1) * bizMult(c.a3) * (SECTORS[c.sector].fleet ? 0.6 : 1) * (typeof siteRatingFactor === 'function' ? siteRatingFactor(c) : 1);
  return { rev, cost: rev * 0.68, profit: rev * 0.32, visitors: Math.round(rev / Math.max(5, SECTORS[c.sector].loc.ticket || 40) * 9) };
}
function adsCost(c) { const w = Math.max(0.25, Math.pow(W.byA3[c.a3].wealth, 0.7)); return WEB_ADS.reduce((a, ad) => a + (c.web.ads[ad.id] ? ad.cost * w : 0), 0); }
// One week for one company (AI or yours).
function companyWeek(c, quiet) {
  let rev = 0, profit = 0, satW = 0, satN = 0, cust = 0;
  c._staff = c.locs.reduce((a, l) => a + l.staff, 0);
  c.locs.forEach(l => {
    const e = locEconomics(c, l, c.locs.length);
    l.sat += (e.sat - l.sat) * 0.35; l.boost = (l.boost || 0) * 0.8;
    l.sat = Math.round(l.sat * 100) / 100; l.boost = Math.round(l.boost * 100) / 100;
    l.demand = Math.round(e.demand); l.cap = Math.round(e.cap); l.cust = Math.round(e.served); l.rev = Math.round(e.rev); l.profit = Math.round(e.profit); l.avg = Math.round(l.avg ? l.avg * 0.75 + e.profit * 0.25 : e.profit);
    rev += e.rev; profit += e.profit; cust += l.cust; satW += l.sat * Math.max(1, e.served); satN += Math.max(1, e.served);
  });
  const f = fleetEconomics(c), o = onlineEconomics(c), ads = adsCost(c), upkeep = WEB_TIERS[c.web.tier].cost * 0.002;
  rev += f.rev + o.rev; profit += f.profit + o.profit - ads - upkeep;
  const tax = Math.max(0, profit) * country(c.a3).tax;
  profit -= tax;
  const _cs2 = country(c.a3); _cs2.taxRev = (_cs2.taxRev || 0) + tax;
  // Rating changes only at year end (see yearEnd in world-events.js), from
  // a full year of these stats. It is deliberately NOT overwritten here,
  // or it would jitter every week and the year-end report would mean nothing.
  if (!c.yearStats) c.yearStats = { satW: 0, satN: 0, rev: 0, profit: 0, weeks: 0 };
  c.yearStats.satW += satW; c.yearStats.satN += satN; c.yearStats.rev += rev; c.yearStats.profit += profit; c.yearStats.weeks++;
  const R = Math.round;
  c.week = { rev: R(rev), profit: R(profit), tax: R(tax), locs: c.locs.reduce((a, l) => a + l.profit, 0), fleet: R(f.profit), online: R(o.profit), onlineRev: R(o.rev), visitors: o.visitors, ads: R(ads), cust };
  if (!quiet) { c.hist.push(Math.round(profit)); if (c.hist.length > 52) c.hist.shift(); }
  c.avg = Math.round(c.avg ? c.avg * 0.8 + profit * 0.2 : profit);
  c._staff = null; c.book = bookValue(c);
  return c.week;
}
// AI management: grow when profitable, trim when losing.
function aiWeek(c) {
  if (!c.ai || controlled(c.a3) || rand() > 1 / 10) return;
  const F = SECTORS[c.sector].fleet, yearly = c.avg * 52;
  if (c.avg > 0) {
    const r = rand();
    if (F && c.fleet < 6 && r < 0.3 && yearly * 2.5 > F.levels[c.fleet + 1].cost && fleetDemand(c) > 0.75) c.fleet++;
    else if (r < 0.7 && c.locs.length < 14) aiOpenLocation(c);
    else if (c.web.tier < 4 && yearly > WEB_TIERS[c.web.tier + 1].cost * 3) c.web.tier++;
  } else if (c.avg < 0 && c.locs.length > 1) {
    const worst = c.locs.slice().sort((a, b) => a.avg - b.avg)[0]; if (worst.avg < 0) closeLoc(c, worst.id);
  }
}
function aiOpenLocation(c) {
  // A country's businesses live in its cities, not only its capital: pick
  // one of its three biggest cities, then the best lot there.
  const cities = topCities(c.a3, 5), city = cities.length ? cities[Math.floor(rand() * Math.min(3, cities.length))] : null;
  const cityId = city ? city.id : c.city;
  const lots = cityLots(cityId).filter(l => l.kind === 'lease');
  if (!lots.length) return false;
  const score = locMode(c) === 'size' ? l => l.size * 10000 - l.srent : l => l.traffic / (l.rent + 300);
  lots.sort((a, b) => score(b) - score(a));
  const lot = lots[Math.floor(rand() * Math.min(3, lots.length))];
  addLocation(c, lot, 1, cityId);
  return true;
}
function addLocation(c, lot, interior, cityId) {
  const L = SECTORS[c.sector].loc, owned = lot.kind === 'prop', city = cityId != null ? cityId : c.city;
  const loc = { id: uid(), t: lot.t, city, traffic: lot.traffic, size: lot.size, interior, staff: 1, sat: 3.5, rent: owned ? 0 : lotRent(c, lot), opened: S.day, cust: 0, rev: 0, profit: 0, avg: 0, demand: 0, cap: 0 };
  if (L.mode === 'traffic') { const e = locEconomics(c, Object.assign({}, loc, { staff: 1 }), c.locs.length + 1); loc.staff = clamp(Math.ceil(e.demand / (e.cap || 1)), Math.max(1, L.staff - 1), maxStaff(c, loc)); }
  else loc.staff = Math.max(2, Math.round(maxStaff(c, loc) * 0.6));
  c.locs.push(loc);
  if (!owned) setLot(city, lot.t, 'loc'); else { const p = S.props.find(x => x.city === city && x.t === lot.t); if (p) p.loc = loc.id; }
  return loc;
}
function closeLoc(c, id) {
  const l = c.locs.find(x => x.id === id); if (!l) return;
  c.locs = c.locs.filter(x => x !== l);
  const city = l.city || c.city;
  const p = S.props.find(x => x.city === city && x.t === l.t);
  if (p) delete p.loc; else setLot(city, l.t, null);
}

// ---------- valuation ----------
function bookValue(c) {
  const F = SECTORS[c.sector].fleet;
  let b = 0; if (F) for (let i = 1; i <= c.fleet; i++) b += F.levels[i].cost * 0.6;
  c.locs.forEach(l => b += buildCost(c, l.interior) * 0.5);
  return b + WEB_TIERS[c.web.tier].cost * 0.3;
}
function companyFairTotal(c) { return Math.max(1e6, Math.max(0, c.avg * 52) * c.pe + (c.book != null ? c.book : bookValue(c)) * 0.6); }
function fairValue(c) { return companyFairTotal(c) / c.shares; }
function companyValue(c) { return c.listed ? c.price * c.shares : companyFairTotal(c); }

// ---------- money ----------
function holdingsValue() { let v = 0; for (const a3 in S.holdings) { const h = S.holdings[a3], c = S.co[a3]; if (!c) continue; v += c.listed ? h.qty * c.price : (h.qty / c.shares) * companyFairTotal(c); } for (const id in (S.holdingsX || {})) { const b = S.extra && S.extra[id]; if (b && b.price) v += S.holdingsX[id].qty * b.price; } return v; }
function shortValue() { let v = 0; for (const a3 in S.holdings) if (S.holdings[a3].qty < 0) v -= S.holdings[a3].qty * S.co[a3].price; return v; }
function propValue() { return S.props.reduce((a, p) => a + p.value, 0); }
function netWorth() { return S.cash + holdingsValue() + propValue() - S.loan; }
function nationPop() { let p = country(S.home).pop; for (const a3 in S.countries) if (S.countries[a3].occ === S.home) p += S.countries[a3].pop; return p; }
function popGrowth() { return nationPop() / country(S.home).pop0 - 1; }
function marketReturn() { return S.idx.v / S.idx0 - 1; }
function myReturn() { return netWorth() / Math.max(1, S.stats.startNet) - 1; }
function beatMarket() { return (1 + myReturn()) / (1 + marketReturn()) - 1; }
function weekProfit() { return S.week ? S.week.profit : 0; }
function level() { return 1 + Math.floor(Math.sqrt(S.xp / 120)); }
function levelProgress() { const L = level(); const a = (L - 1) ** 2 * 120, b = L ** 2 * 120; return (S.xp - a) / (b - a); }

// ---------- market ----------
function liq(c) { return c.price * c.shares * 0.003; }
function impactFor(c, dollars) { return 0.1 * Math.sqrt(Math.abs(dollars) / liq(c)); }
function marketOpen() { return !isWeekend(S.day); }
function trade(a3, side, qty) {
  qty = Math.floor(qty); if (!(qty > 0)) return 'Enter how many shares.';
  const c = S.co[a3]; if (!c.listed) return 'This company is private. It isn’t traded on the market.';
  if (!marketOpen()) return 'Markets are closed on weekends.';
  const sign = side === 'buy' || side === 'cover' ? 1 : -1;
  const imp = impactFor(c, qty * c.price), px = c.price * (1 + sign * imp / 2) * (1 + sign * 0.002);
  const pos = S.holdings[a3] || { qty: 0, cost: 0 };
  if (side === 'sell' && pos.qty > 0) S.lastTrade = { a3, side, qty, price: 0, pnl: 0 };
  if (side === 'cover' && pos.qty < 0) S.lastTrade = { a3, side, qty, price: 0, pnl: 0 };
  if (S.lastTrade && S.lastTrade.a3 === a3 && (side === 'sell' || side === 'cover')) {
    const unit = side === 'sell' ? (px - pos.cost) : (pos.cost - px);
    S.lastTrade.price = px; S.lastTrade.pnl = Math.round(unit * qty); S.lastTrade.sym = c.sym;
  }
  if (side === 'buy') { if (pos.qty < 0) return 'Cover your short first.'; if (pos.qty + qty > c.shares) return 'You can’t buy more shares than exist.'; if (qty * px > S.cash) return 'Not enough cash.'; pos.cost = (pos.cost * pos.qty + qty * px) / (pos.qty + qty); pos.qty += qty; S.cash -= qty * px; }
  else if (side === 'sell') { if (pos.qty < qty) return 'You don’t own that many shares.'; pos.qty -= qty; S.cash += qty * px; }
  else if (side === 'short') { if (pos.qty > 0) return 'Sell your shares first.'; if (qty * px > Math.max(0, netWorth()) * 0.5 - shortValue()) return 'You can short up to half your net worth.'; const n = -pos.qty; pos.cost = (pos.cost * n + qty * px) / (n + qty); pos.qty -= qty; S.cash += qty * px; }
  else if (side === 'cover') { if (-pos.qty < qty) return 'You aren’t short that many shares.'; if (qty * px > S.cash) return 'Not enough cash.'; pos.qty += qty; S.cash -= qty * px; }
  const wasControlled = controlled(a3);
  if (pos.qty === 0) delete S.holdings[a3]; else S.holdings[a3] = pos;
  c.price *= Math.exp(sign * imp); c.tmp -= sign * imp * 0.6;
  S.stats.trades++;
  c.tradedToday = (c.tradedToday || 0) + qty;
  if (!wasControlled && controlled(a3)) { gainControl(c, 'You now own a majority of'); }
  if (pos.qty >= c.shares) takePrivate(c, 'You bought every share of');
  if (wasControlled && !controlled(a3)) { c.ai = true; news('Business', `You sold control of ${c.name}.`, a3); }
  return null;
}
function gainControl(c, how) { c.ai = false; S.xp += 300; news('Business', `${how} ${c.name}. You run it now.`, c.a3); }
function takePrivate(c, how) { c.listed = false; c.ai = false; S.holdings[c.a3] = { qty: c.shares, cost: S.holdings[c.a3] ? S.holdings[c.a3].cost : c.price }; S.stats.takeovers++; S.xp += 600; news('Business', `${how} ${c.name}. It is now fully yours and leaves the stock market.`, c.a3); }
function researchCost() { return Math.round(Math.max(1500, netWorth() * 0.0004) / 100) * 100; }
function research(a3) {
  const cost = researchCost(); if (S.cash < cost) return 'Not enough cash for research.';
  S.cash -= cost;
  const c = S.co[a3], dir = c.mood >= 0 ? 1 : -1;
  c.res = { day: S.day, dir: rand() < 0.72 ? dir : -dir, strength: Math.abs(c.mood) > 0.45 ? 'strong' : Math.abs(c.mood) > 0.15 ? 'moderate' : 'weak', fair: fairValue(c) * Math.exp(gauss() * 0.12), pattern: c.pattern && rand() < 0.6 ? c.pattern.type : null };
  return null;
}
const intelOn = () => S.boosts.intel > S.day;
const PATTERN_HINTS = { pump: 'Social media pump. These usually end in a dump.', squeeze: 'Short squeeze underway. Fast up, then fades.' };
// Buy every remaining share at a premium. The board may say no.
function takeoverCost(c, premium) { return (c.shares - Math.max(0, (S.holdings[c.a3] || { qty: 0 }).qty)) * c.price * (1 + premium); }
function takeoverOdds(c, premium) {
  let p = 0.12 + premium * 1.25 + stake(c.a3) * 0.4;
  const rel = getRel(S.home, c.a3); if (rel > 50) p += 0.1; if (rel < -20) p -= 0.25;
  if (companyValue(c) > 5e10) p -= 0.15;
  return clamp(p, 0.03, 0.95);
}
function takeover(a3, premium) {
  const c = S.co[a3];
  if (!c.listed) return 'This company isn’t for sale on the market.';
  if (c.offerBlock > S.day) return `The board won't hear another offer until ${fmtDate(c.offerBlock)}.`;
  const cost = takeoverCost(c, premium); if (S.cash < cost) return `You need ${fmtMoney(cost, true)} in cash.`;
  if (rand() > takeoverOdds(c, premium)) { c.offerBlock = S.day + 60; c.price *= 1.06; news('Business', `${c.name}'s board rejected your takeover offer. Its stock jumped 6%.`, a3); return 'The board rejected your offer.'; }
  S.cash -= cost;
  takePrivate(c, 'Takeover complete: you bought');
  return null;
}
function marketDay() {
  const R = REGIMES[S.regime.type];
  const mkt = R.drift + gauss() * 0.008 * R.vol;
  const sec = {}; SECTOR_LIST.forEach(k => sec[k] = gauss() * 0.006 * R.vol);
  let rate = 0;
  if (S.day >= S.nextRate) { const d = pickW({ cut: 0.3, hold: 0.45, hike: 0.25 }); rate = d === 'cut' ? 0.012 : d === 'hike' ? -0.014 : 0; news('Market', d === 'cut' ? 'Global central banks cut interest rates. Stocks rally.' : d === 'hike' ? 'Central banks hike interest rates. Stocks slide.' : 'Central banks hold rates steady.'); S.nextRate = S.day + 40 + Math.floor(rand() * 25); }
  // Vs Market is an equal-weighted algo: it buys the same dollar amount of
  // every listed stock, so its return is the AVERAGE stock return, not the
  // biggest companies' return. The World Index below follows that algo.
  let eqSum = 0, eqN = 0;
  for (const a3 in S.co) {
    const c = S.co[a3], cs = country(a3);
    if (!c.listed) { c.dayVol = 0; c.tradedToday = 0; c.price = companyFairTotal(c) / c.shares; continue; }
    if (rand() < 1 / 25) c.moodT = clamp(gauss() * 0.5, -1, 1);
    c.mood = clamp(c.mood + 0.15 * (c.moodT - c.mood) + gauss() * 0.05, -1, 1);
    if (!isFinite(c.price) || c.price <= 0) c.price = (isFinite(c.p0) && c.p0 > 0) ? c.p0 : 100;
    let r = c.beta * mkt + (sec[c.sector] || 0) + c.mood * 0.003 + 0.012 * Math.log(Math.max(1, fairValue(c)) / c.price) + gauss() * c.vol * R.vol * (cs.war || cs.occ ? 1.5 : 1);
    if (!isFinite(r)) r = 0;
    r += cs.drift + c.tmp * 0.5 + rate; c.tmp *= 0.5;
    if (c.shock) { r += c.shock; c.shock = 0; }
    if (!c.pattern) { if (c.vol >= 0.024 && rand() < 0.002) c.pattern = { type: 'pump', seq: [0.07, 0.09, 0.1, 0.05, -0.18, -0.16, -0.09] }; else if (rand() < 0.0012) c.pattern = { type: 'squeeze', seq: [0.11, 0.13, 0.07, -0.06] }; }
    if (c.pattern) { r += c.pattern.seq.shift(); if (!c.pattern.seq.length) c.pattern = null; }
    if (rand() < 0.004) { const x = (rand() < 0.5 ? -1 : 1) * (0.03 + rand() * 0.08); r += x; if (S.holdings[a3] || rand() < 0.12) news('Market', `${c.name} ${x > 0 ? pick(['wins a huge contract', 'announces a buyback', 'gets an upgrade', 'unveils a new product']) : pick(['faces a lawsuit', 'loses its CEO', 'recalls products', 'gets downgraded'])}. ${c.sym} ${x > 0 ? '+' : ''}${(x * 100).toFixed(1)}%.`, a3); }
    eqSum += r; eqN++;
    c.dayVol = Math.round(c.shares * 0.003 * (0.5 + rand()) * R.vol * (cs.war || cs.occ ? 1.5 : 1)) + (c.tradedToday || 0); c.tradedToday = 0;
    c.price = Math.max(0.5, c.price * Math.exp(r));
  }
  if (--S.regime.left <= 0) { const nx = pickW(REGIMES[S.regime.type].next); S.regime = regimeOf(nx); news('Market', REGIMES[nx].news); }
  if (!isFinite(S.idx.v)) S.idx.v = 1000;
  if (eqN && isFinite(eqSum)) S.idx.v *= Math.exp(eqSum / eqN);
}
function pushHist(h, v, day, vol) {
  h.d.push(v); if (h.d.length > 400) h.d.shift();
  if (!h.v) h.v = [];
  h.v.push(vol || 0); if (h.v.length > 400) h.v.shift();
  if (day % 7 === 6) { h.w.push(v); if (h.w.length > 1040) h.w.shift(); }
  if (dateOf(day + 1).getUTCDate() === 1) h.m.push(v);
}

// ---------- running your companies ----------
function requireControl(a3) { return controlled(a3) ? null : 'You need to control this company first.'; }
function leaseLot(a3, t, interior, cityId) {
  const e = requireControl(a3); if (e) return e;
  const c = S.co[a3], city = cityId != null ? cityId : c.city, lot = cityLots(city).find(l => l.t === t);
  if (!lot || (lot.kind !== 'lease' && !(lot.kind === 'prop' && !S.props.find(p => p.city === city && p.t === t).loc))) return 'That spot isn’t available.';
  const cost = buildCost(c, interior); if (S.cash < cost) return `Fitting it out costs ${fmtMoney(cost)}.`;
  S.cash -= cost; addLocation(c, lot, interior, city); S.xp += 60;
  news('Business', `${c.name} opened a new ${SECTORS[c.sector].loc.name.toLowerCase()} in ${W.cities[city].name}.`, a3);
  return null;
}
function upgradeFleet(a3) {
  const e = requireControl(a3); if (e) return e;
  const c = S.co[a3], F = SECTORS[c.sector].fleet; if (!F) return 'This company has no fleet.';
  if (c.fleet >= F.levels.length - 1) return 'Your fleet is already the biggest there is.';
  const cost = F.levels[c.fleet + 1].cost; if (S.cash < cost) return `The upgrade costs ${fmtMoney(cost, true)}.`;
  S.cash -= cost; c.fleet++; S.xp += 200;
  news('Business', `${c.name} upgraded to ${F.levels[c.fleet].name.toLowerCase()}s.`, a3);
  return null;
}
function sellFleet(a3) {
  const e = requireControl(a3); if (e) return e;
  const c = S.co[a3], F = SECTORS[c.sector].fleet; if (!F || !c.fleet) return 'Nothing to sell.';
  S.cash += F.levels[c.fleet].cost * 0.6; c.fleet--; return null;
}
function buyWebTier(a3) {
  const e = requireControl(a3); if (e) return e;
  const c = S.co[a3]; if (c.web.tier >= 4) return 'Your website is already a global platform.';
  const cost = WEB_TIERS[c.web.tier + 1].cost; if (S.cash < cost) return `Costs ${fmtMoney(cost, true)}.`;
  S.cash -= cost; c.web.tier++; S.xp += 100; return null;
}
function toggleAd(a3, id) { const e = requireControl(a3); if (e) return e; const c = S.co[a3]; c.web.ads[id] = !c.web.ads[id]; return null; }
function buyAddon(a3, id) {
  const e = requireControl(a3); if (e) return e;
  const c = S.co[a3], d = WEB_ADDONS.find(x => x.id === id); if (c.web.addons[id]) return 'Already bought.';
  if (S.cash < d.cost) return `Costs ${fmtMoney(d.cost, true)}.`;
  S.cash -= d.cost; c.web.addons[id] = true; return null;
}
// Sell part of a private company to the public.
function goPublic(a3, pct) {
  const e = requireControl(a3); if (e) return e;
  const c = S.co[a3]; if (c.listed) return 'Already listed.';
  if ((typeof boardFull === 'function') && !boardFull(c)) return 'IPO needs a full board room: hire all 5 board seats in Offices first.';
  if ((c.weekProfitStreak || 0) < 2) return `IPO needs 2 profitable weeks in a row. Current weekly streak: ${c.weekProfitStreak || 0}.`;
  pct = clamp(pct != null ? pct : 1, 0.01, 1);
  const v = companyFairTotal(c);
  const sold = Math.floor(c.shares * pct);
  const gross = Math.round(sold * (v / c.shares)), fee = Math.round(gross * 0.07), proceeds = gross - fee;
  S.cash += proceeds; S.holdings[a3].qty -= sold; c.listed = true; c.price = v / c.shares;
  S.stats.ipos++; S.xp += 500;
  news('Business', `${c.name} rings the opening bell! The IPO sold ${Math.round(pct * 100)}% for ${fmtMoney(proceeds, true)} after a 7% fee.`, a3);
  return null;
}
function maxLoan() { return Math.max(0, (holdingsValue() * 0.3 + propValue() * 0.6) - S.loan); }
function borrow(n) { if (n > maxLoan()) return `The bank will lend you up to ${fmtMoney(maxLoan(), true)}.`; S.loan += n; S.cash += n; return null; }
function repay(n) { n = Math.min(n, S.loan); if (n > S.cash) return 'Not enough cash.'; S.loan -= n; S.cash -= n; return null; }
function acceptOffer(id) {
  const m = S.mail.find(x => x.id === id); if (!m || !m.offer || m.offer.done) return 'That offer has expired.';
  const c = S.co[m.offer.a3]; if (!controlled(c.a3)) return 'You no longer control that company.';
  const amount = stake(c.a3) * m.offer.price;
  S.cash += amount; delete S.holdings[c.a3]; c.listed = true; c.ai = true; m.offer.done = 'accepted';
  news('Business', `You sold ${c.name} for ${fmtMoney(amount, true)}.`, c.a3);
  return null;
}

// ---------- buildings ----------
function buyBuilding(cityId, t) {
  const lot = cityLots(cityId).find(l => l.t === t); if (!lot || lot.kind !== 'sale') return 'Not for sale anymore.';
  if (S.cash < lot.price) return 'Not enough cash.';
  S.cash -= lot.price; setLot(cityId, t, 'prop');
  S.props.push({ id: uid(), city: cityId, t, units: lot.units, mrent: lot.mrent, rentLv: 1, cond: lot.cond, value: lot.price, paid: lot.price, occ: 0.7, income: 0, traffic: lot.traffic, size: lot.size });
  S.xp += 80; news('Property', `You bought a ${lot.units}-unit building in ${W.cities[cityId].name}.`, W.cities[cityId].a3);
  return null;
}
function buildingName(arch) { return { house: 'House', rowhouse: 'Row house', apartment: 'Apartment building', office: 'Office building', glass: 'Office tower', skyscraper: 'Skyscraper', warehouse: 'Warehouse', gas: 'Gas station', shop: 'Shop' }[arch] || 'Building'; }
function buildingIcon(arch) { return { house: '🏠', rowhouse: '🏠', apartment: '🏢', office: '🏢', glass: '🏙️', skyscraper: '🏙️', warehouse: '🏭', gas: '⛽', shop: '🏪' }[arch] || '🏢'; }
// Every building in a city, not just the ones marked FOR SALE or FOR
// LEASE: price, units and rent from the tile itself, so tapping any
// building in the city can buy it.
function buildingLotForTile(cityId, tIdx) {
  const city = W.cities[cityId], L = cityLayout(city), t = L.tiles[tIdx];
  if (!t || t.kind !== 'lot') return null;
  const w = city.wealth;
  const units = t.arch === 'house' ? 1 : t.arch === 'rowhouse' ? 2 : t.arch === 'warehouse' ? 1 : t.arch === 'gas' ? 1 : Math.max(4, Math.round(t.floors * 1.8));
  const mrent = Math.round(70 + 380 * Math.pow(w, 1.05));
  const cap = 0.05 + (1 - Math.min(1, w)) * 0.04;
  const mult = t.arch === 'skyscraper' ? 2.5 : t.arch === 'warehouse' ? 1.4 : t.arch === 'gas' ? 1.2 : 1;
  const price = Math.round(units * mrent * 52 / cap * mult / 1000) * 1000;
  const size = t.arch === 'warehouse' || t.floors > 12 ? 3 : t.floors > 4 ? 2 : 1;
  return { t: tIdx, kind: 'building', traffic: t.traffic || 0, size, arch: t.arch, units, mrent, cond: 0.75, price, floors: t.floors, zone: t.zone };
}
function buyAnyBuilding(cityId, tIdx) {
  const existing = cityLots(cityId).find(l => l.t === tIdx);
  if (existing && existing.kind === 'sale') return buyBuilding(cityId, tIdx);
  if (existing && existing.kind === 'prop') return 'You already own this building.';
  if (existing && existing.kind === 'lease') return 'This lot is for lease — use BUILD STORE or LEASE instead.';
  const owner = S.co[W.cities[cityId].a3];
  if (owner && owner.locs.some(l => (l.city || owner.city) === cityId && l.t === tIdx)) return 'This is a company location, not for sale.';
  if (S.props.some(p => p.city === cityId && p.t === tIdx)) return 'You already own this building.';
  const lot = buildingLotForTile(cityId, tIdx); if (!lot) return 'Nothing to buy here.';
  if (S.cash < lot.price) return 'Not enough cash.';
  S.cash -= lot.price; setLot(cityId, tIdx, 'prop');
  S.props.push({ id: uid(), city: cityId, t: tIdx, units: lot.units, mrent: lot.mrent, rentLv: 1, cond: lot.cond, value: lot.price, paid: lot.price, occ: 0.7, income: 0, traffic: lot.traffic, size: lot.size });
  S.xp += 80; news('Property', `You bought a ${buildingName(lot.arch).toLowerCase()} in ${W.cities[cityId].name}.`, W.cities[cityId].a3);
  return null;
}
function sellBuilding(id) {
  const p = S.props.find(x => x.id === id); if (!p) return;
  if (p.loc) return 'Close the location in this building first.';
  S.cash += p.value * 0.95; S.props = S.props.filter(x => x !== p); setLot(p.city, p.t, null);
  return null;
}
const renoCost = p => Math.round(p.value * (1 - p.cond) * 0.25 / 1000) * 1000 + 5000;
function renovate(id) { const p = S.props.find(x => x.id === id); if (!p) return 'Building not found.'; const c = renoCost(p); if (S.cash < c) return 'Not enough cash.'; S.cash -= c; p.value += c * 0.8; p.cond = 1; return null; }
function propsWeek() {
  let total = 0;
  S.props.forEach(p => {
    const city = W.cities[p.city], m = bizMult(city.a3, p.city);
    const occT = clamp(0.96 - (p.rentLv - 1) * 1.6 + (p.cond - 0.7) * 0.5, 0.05, 1) * (m < 0.5 ? 0.6 : 1);
    p.occ += (occT - p.occ) * 0.3;
    p.income = (p.loc ? Math.max(0, p.units - 1) : p.units) * p.mrent * p.rentLv * p.occ - p.value * 0.0004;
    p.cond = Math.max(0.2, p.cond - 0.0015);
    total += p.income;
  });
  return total;
}
// Placed businesses: player-owned, pay their weekly income straight
// to cash, like a property. Value is set at placement.
function placedWeek() {
  if (!Array.isArray(S.placed)) return 0;
  let total = 0;
  S.placed.forEach(b => { b.income = b.value * 0.001; total += b.income; });
  return total;
}

// ---------- formatting ----------
function fmtMoney(n, compact) {
  const neg = n < 0; n = Math.abs(n); let s;
  if (compact && n >= 1e12) s = '$' + (n / 1e12).toFixed(2) + 'T';
  else if (compact && n >= 1e9) s = '$' + (n / 1e9).toFixed(2) + 'B';
  else if (compact && n >= 1e6) s = '$' + (n / 1e6).toFixed(2) + 'M';
  else if (compact && n >= 1e4) s = '$' + Math.round(n / 1e3) + 'K';
  else s = '$' + n.toLocaleString('en-US', { maximumFractionDigits: n < 100 ? 2 : 0, minimumFractionDigits: n < 100 ? 2 : 0 });
  return (neg ? '-' : '') + s;
}
const fmtPct = x => (x >= 0 ? '+' : '') + (x * 100).toFixed(x !== 0 && Math.abs(x) < 0.1 ? 2 : 1) + '%';
function fmtPop(n) { if (!isFinite(n)) return '—'; return n >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : Math.round(n) + ''; }
