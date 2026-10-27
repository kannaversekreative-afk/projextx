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
    v: 2, seed: Math.floor(rand() * 1e9), mode: opt.mode, randomWorld: opt.mode === 'worl' || opt.mode === 'random', flow: !opt.leader && opt.mode !== 'worl' && opt.mode !== 'random', home: opt.home, day: 0, speed: 1, leader: !!opt.leader, extra: {}, countryName: opt.countryName || null,
    you: { name: opt.name || 'Founder', color: opt.color || LOGO_COLORS[0], look: opt.look || (typeof randLook === 'function' ? randLook() : null) },
    cash: 750000, loan: 0, xp: 0, rating: 0,
    countries: {}, co: {}, idx: { v: 1000, h: { d: [], w: [], m: [], v: [] } }, idx0: 1000,
    holdings: {}, holdingsP: {}, holdingsXP: {}, props: [], lotState: {}, placed: [],
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
    // extras are economic businesses (see leader.js). Must-haves come
    // first (guaranteed), the rest come from the OPEN pool — any
    // era-alive sector, any country. Count stays small at start (2–3);
    // countries gain more sectors later via diversification.
    W.playable.forEach(k => {
      const pool = (typeof openSectorPool === 'function') ? openSectorPool(2026) : SECTOR_LIST.slice();
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
    const deckSrc = SECTOR_LIST.filter(sec => { const s = (typeof LEADER_SECTOR_BY_NAME !== 'undefined' && LEADER_SECTOR_BY_NAME[sec]) || null; return !s || ((!s.from || s.from <= 2026) && (!s.to || s.to >= 2026)); });
    const deck = []; deckSrc.forEach(sec => { for (let i = 0; i < Math.ceil(W.playable.length / deckSrc.length); i++) deck.push(sec); });
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
  // Every CPU flagship gets its office and board at the lowest
  // level. The tycoon home flagship is yours, not CPU, so it is
  // skipped — you buy its office and hire its board yourself.
  if (typeof cpuOfficeAndBoard === 'function') for (const a3 in s.co) {
    if (!opt.leader && a3 === opt.home) continue;
    try { cpuOfficeAndBoard(s.co[a3]); } catch (e) {}
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
  if (s.flow) s.cash = 0; // Flow games start with personal money only; invest it to fund the business.
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
  // City unlock (flow games only): one starting city, the rest $25,000 each.
  if (s.flow && typeof startingCityFor === 'function') {
    const start = startingCityFor(opt.home);
    if (start != null) s.unlockedCities = [start];
  }
  // Employee life path (flow games only): start with $5,000 personal
  // money, not $250,000. Old saves and leader games are untouched —
  // their person record already exists with its own cash.
  if (s.flow && typeof defaultPerson === 'function') {
    s.person = defaultPerson();
    s.person.cash = (typeof EMPLOYEE_START_CASH !== 'undefined') ? EMPLOYEE_START_CASH : 5000;
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
  let brand, name, sym, hqCity = null;
  // Shuffled world only: names/tickers from the separate random pool, so
  // a random run never reuses the real World's naming pool. Real World
  // and tycoon games keep the base generator below, unchanged.
  if (typeof genRandomCompany === 'function' && isRandomWorld()) { const g = genRandomCompany(sector, usedNames, usedSyms); if (g) { brand = g.brand; name = g.name; sym = g.sym; } }
  if (!name) { do { brand = pick(BRAND_A) + pick(BRAND_B); } while (usedNames.has(brand)); usedNames.add(brand); name = brand + pick(SUFFIX[sector]); sym = tickerFor(brand, usedSyms); }
  // Parody table: a flagship in a covered sector takes its parody name,
  // ticker and real HQ city (exact game city, else the country's largest).
  if (!isRandomWorld() && typeof parodyFor === 'function') {
    const p = parodyFor(k.a3, sector, usedNames, usedSyms);
    if (p) { name = p.name; sym = p.sym; usedNames.add(name); usedSyms.add(sym); hqCity = hqCityId(k.a3, p.hq); }
  }
  const g = Math.log10(Math.max(30, k.gdp0));
  const c = { a3: k.a3, sector, name, sym, city: hqCity || k.capital, color: LOGO_COLORS[Math.floor(rand() * LOGO_COLORS.length)],
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
function stake(a3) { const q = holdQty(a3); return q > 0 ? q / S.co[a3].shares : 0; }
const controlled = a3 => stake(a3) >= 0.5;

// ---------- game flow (new standard games only) ----------
// S.flow marks games on the locked flow: home country only until you
// own an office + a full board, then the world opens and expansion
// (invasion) is enabled. Old saves have no flag and stay open-world.
const OFFICE_COST = 50000;
function flowOffice(a3) { const c = S.co && S.co[a3]; return c ? c.office || null : null; }
function flowHasOffice(a3) { return !!flowOffice(a3); }
function flowBoardFull() { const c = S.co && S.co[S.home]; return !!c && typeof boardFull === 'function' && boardFull(c); }
function flowCanExpand() { return !!S.flow && flowHasOffice(S.home) && flowBoardFull(); }
function flowDominated(a3) { return !!S.flow && controlled(a3) && flowHasOffice(a3); }
function buyOffice(a3) {
  if (!S.flow) return 'Offices are part of the new-game flow.';
  const c = S.co && S.co[a3]; if (!c) return 'No company there.';
  if (c.office) return 'You already own an office there.';
  if (!controlled(a3)) return 'Control the flagship company first (50%+ stake).';
  if (S.cash < OFFICE_COST) return 'Not enough business cash.';
  S.cash -= OFFICE_COST; c.office = { day: S.day, cost: OFFICE_COST };
  news('Business', `Office opened in ${cname(a3)}.`, a3);
  if (flowDominated(a3) && !(S.dominated || []).includes(a3)) { (S.dominated = S.dominated || []).push(a3); news('Milestone', `You dominate ${cname(a3)}.`, a3); }
  return null;
}
function flowDominanceCheck() {
  if (!S.flow) return;
  S.dominated = S.dominated || [];
  // Prune first: dominated is current ownership, not a milestone list.
  // A country lost to war/liberation must stop counting until it is
  // controlled + officed again, or the counter (and a 196/196 claim)
  // overstates what you actually own.
  S.dominated = S.dominated.filter(a3 => flowDominated(a3));
  (W.playable || []).forEach(k => {
    if (!S.dominated.includes(k.a3) && flowDominated(k.a3)) { S.dominated.push(k.a3); news('Milestone', `You dominate ${cname(k.a3)}.`, k.a3); }
  });
}
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
    const size = t.arch === 'warehouse' || t.arch === 'factory' || t.floors > 12 ? 3 : t.floors > 4 ? 2 : 1;
    if (t.arch !== 'house' && t.arch !== 'rowhouse' && t.arch !== 'brownstone' && roll < 0.11) {
      lots.push({ t: idx, kind: 'lease', traffic, size, arch: t.arch, rent: Math.round(traffic * 0.09 * Math.pow(w, 0.9) * (0.85 + r() * 0.3) / 10) * 10, srent: Math.round(size * 1500 * Math.pow(w, 0.9) * (0.85 + r() * 0.3) / 10) * 10 });
    } else if (roll > 0.93 && t.arch !== 'warehouse' && t.arch !== 'factory') {
      const units = t.arch === 'house' ? 1 : t.arch === 'rowhouse' || t.arch === 'brownstone' ? 2 + Math.floor(r() * 2) : Math.max(4, Math.round(t.floors * (1.5 + r() * 2)));
      const mrent = Math.round(70 + 380 * Math.pow(w, 1.05)), cap = 0.05 + (1 - Math.min(1, w)) * 0.04;
      lots.push({ t: idx, kind: 'sale', traffic, size, arch: t.arch, units, mrent, cond: +(0.5 + r() * 0.45).toFixed(2), price: Math.round(units * mrent * 52 / cap * (0.85 + r() * 0.3) / 1000) * 1000 });
    }
  });
  W.lotCache[key] = lots;
  return lots;
}
function setLot(cityId, t, state) { const m = S.lotState[cityId] || (S.lotState[cityId] = {}); if (state == null) delete m[t]; else m[t] = state; }
function lotKind(cityId, lot) { const st = S.lotState[cityId] && S.lotState[cityId][lot.t]; return st || lot.kind; }
function cityLots(cityId) {
  const lots = baseLots(cityId).map(l => Object.assign({}, l, { kind: lotKind(cityId, l) }));
  // Government-only capitals: no new FOR LEASE or FOR SALE lots. Lots
  // already taken or bought ('taken', 'prop') stay, so everything
  // built there before keeps working.
  const city = W.cities[cityId];
  if (typeof isGovCity === 'function' && isGovCity(city)) return lots.filter(l => l.kind !== 'lease' && l.kind !== 'sale');
  return lots;
}
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
  // Supply chain, one week lagged (see economy.js): farm shortage
  // raises factory costs, factory shortage cuts shop demand. Sectors
  // still run on their own — this only moves the dial a little.
  const _sup = (typeof S !== 'undefined' && S && S.supply && S.supply[c.a3]) ? S.supply[c.a3] : null;
  const _role = (typeof chainRole === 'function') ? chainRole(c.sector) : 'other';
  const _farmCost = _role === 'factory' && _sup ? (_sup.farmCost || 1) : 1;
  const _shopDemand = _role === 'shop' && _sup ? (_sup.shopDemand || 1) : 1;
  if (L.mode === 'traffic') {
    const priceF = Math.pow(1 / s.price, 1.7), comp = 1 / (1 + 0.12 * Math.max(0, nLocs - 1));
    const demand = loc.traffic * L.capture * 1.4 * priceF * qualityF * interiorF * adsF(c) * webF(c) * brandF * comp * m * rush * taxDemand * _shopDemand;
    const cap = loc.staff * L.throughput * wageSpeed;
    const served = Math.min(demand, cap), over = demand / Math.max(1, cap);
    const sat = clamp(3 + (qualityF - 1) * 4 + (interiorF - 1) * 3 - Math.min(1.5, Math.max(0, over - 1) * 2.5) + (s.wage - 1) * 2.5 - (s.price - 1) * 2 + extraSat, 1, 5);
    const rev = served * L.ticket * Math.pow(w, 0.6) * s.price * Math.pow(econ(c), 0.7);
    const cogs = rev * L.cogs * (0.8 + 0.1 * s.quality) * _farmCost;
    const wages = loc.staff * L.wage * Math.pow(w, 0.7) * s.wage;
    return { demand, cap, served, sat, rev, cost: (cogs + wages + loc.rent) * cm, profit: rev - (cogs + wages + loc.rent) * cm };
  }
  // Offices and warehouses: revenue per employee, with a market that saturates.
  const totalStaff = c._staff != null ? c._staff : c.locs.reduce((a, l) => a + l.staff, 0);
  const sat0 = 1 / (1 + totalStaff / (8 * Math.sqrt(k.gdp0 / 1000) + 5));
  const fleetBoost = c.sector === 'Shipping' ? 1 + c.fleet * 0.08 : 1;
  const dF = m * webF(c) * Math.sqrt(adsF(c)) * brandF * (0.8 + 0.1 * s.quality) * Math.pow(1 / s.price, 0.6) * s.price * sat0 * fleetBoost * interiorF * rush * Math.pow(econ(c), 0.7) * taxDemand * _shopDemand;
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
  // Bankrupt companies earn nothing until they are rebuilt.
  if (c.bankrupt) { c.week = { rev: 0, profit: 0, tax: 0, locs: 0, fleet: 0, online: 0, onlineRev: 0, visitors: 0, ads: 0, cust: 0 }; return c.week; }
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
  // Paid advertising (ads.js): active routes lift revenue a little.
  // Quiet/seeding calls never tick durations or trigger CPU buys.
  const adBoost = (typeof adWeek === 'function') ? adWeek(c, quiet) : 0;
  if (adBoost) { rev *= (1 + adBoost); profit *= (1 + adBoost); }
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
  // Quarterly earnings: accumulate the quarter's profit; on a quarter
  // boundary the report lands (price jumps on the surprise) and the
  // market's companies make their quarterly moves (see corpnews.js).
  c.qProfit = (c.qProfit || 0) + profit;
  if (typeof isQuarterEnd === 'function' && isQuarterEnd(S.day)) {
    if (typeof payBoardDividend === 'function') payBoardDividend(c);
    if (typeof quarterlyReport === 'function') quarterlyReport(c);
    if (typeof corpQuarterEvents === 'function') corpQuarterEvents(c);
  }
  c._staff = null; c.book = Math.max(0, bookValue(c) - (c.bookDamage || 0));
  return c.week;
}
// CPU expansion, like a player would: first cover every city in the
// country (biggest uncovered city first, best lease lot there, same
// rent/staff economics as a player's location via addLocation), then
// keep densifying the big cities (aiOpenLocation). Coverage opens
// bypass the 14-location cap; densifying does not. Capitals are never
// covered — they have no lease lots (government-only), so they are
// skipped automatically, as are cities with no leasable lot.
function aiCoverOrOpen(c) {
  const covered = new Set(c.locs.map(l => l.city || c.city));
  const cities = W.cities.filter(x => x.a3 === c.a3).sort((a, b) => b.pop - a.pop);
  for (const city of cities) {
    if (covered.has(city.id)) continue;
    const lots = cityLots(city.id).filter(l => l.kind === 'lease');
    if (!lots.length) continue;
    const score = locMode(c) === 'size' ? l => l.size * 10000 - l.srent : l => l.traffic / (l.rent + 300);
    lots.sort((a, b) => score(b) - score(a));
    const lot = lots[Math.floor(rand() * Math.min(3, lots.length))];
    addLocation(c, lot, 1, city.id);
    return true;
  }
  if (c.locs.length < 14) return aiOpenLocation(c);
  return false;
}
// CPU expansion abroad: a profitable flagship with nothing left to
// cover at home opens branches in other countries — the multinational
// step. Gated hard so the map does not flood: yearly profit above
// $500K, at most 3 foreign branches per flagship, one branch per
// attempt, best lease lot by the same score as home coverage. Foreign
// branches take lots abroad (real competition for space with the
// player and other CPUs) and earn revenue there through the normal
// location economics; like home coverage, a lone branch in a city is
// never trimmed, so foreign branches stick once opened. Targets are
// trade partners first (leader games), else the biggest economies.
function aiExpandAbroad(c) {
  if (!c.ai || controlled(c.a3)) return false;
  if (c.avg * 52 < 500000) return false;
  if (c.locs.filter(l => l.abroad).length >= 3) return false;
  const partners = [];
  if (S.tradeLinks) for (const key in S.tradeLinks) { const L = S.tradeLinks[key]; if (L.a === c.a3) partners.push(L.b); else if (L.b === c.a3) partners.push(L.a); }
  let targets = partners.filter(a3 => a3 !== c.a3 && W.byA3[a3]);
  // GDP field differs by object: S.countries uses gdp (dollars), W.byA3
  // uses gdp0 ($ million). Either works for ranking; gdp0 is the one
  // that always exists (tradeLinks only exist after the first week).
  const gdpOf = a3 => (S.countries && S.countries[a3] && S.countries[a3].gdp) || (W.byA3[a3] && (W.byA3[a3].gdp0 || W.byA3[a3].gdp)) || 0;
  if (!targets.length) targets = Object.values(W.byA3).sort((a, b) => gdpOf(b.a3) - gdpOf(a.a3)).slice(0, 20).map(k => k.a3).filter(a3 => a3 !== c.a3);
  targets.sort((a, b) => gdpOf(b) - gdpOf(a));
  for (const a3 of targets) {
    const cities = topCities(a3, 1);
    if (!cities.length) continue;
    const city = cities[0];
    if (c.locs.some(l => (l.city || c.city) === city.id)) continue;
    const lots = cityLots(city.id).filter(l => l.kind === 'lease');
    if (!lots.length) continue;
    const score = locMode(c) === 'size' ? l => l.size * 10000 - l.srent : l => l.traffic / (l.rent + 300);
    lots.sort((a, b) => score(b) - score(a));
    const lot = lots[Math.floor(rand() * Math.min(3, lots.length))];
    const hadForeign = c.locs.some(l => l.abroad);
    const loc = addLocation(c, lot, 1, city.id);
    if (loc) loc.abroad = true;
    if (!hadForeign && typeof news === 'function') news('Business', `${c.name} opens its first foreign branch in ${city.name}.`, c.a3);
    return true;
  }
  return false;
}
// AI management: grow when profitable, trim when losing.
function aiWeek(c) {
  if (!c.ai || controlled(c.a3) || rand() > 1 / 10) return;
  const F = SECTORS[c.sector].fleet, yearly = c.avg * 52;
  if (c.avg > 0) {
    const r = rand();
    if (F && c.fleet < 6 && r < 0.3 && yearly * 2.5 > F.levels[c.fleet + 1].cost && fleetDemand(c) > 0.75) c.fleet++;
    else if (r < 0.7) { if (!aiCoverOrOpen(c)) aiExpandAbroad(c); }
    else if (c.web.tier < 4 && yearly > WEB_TIERS[c.web.tier + 1].cost * 3) c.web.tier++;
  } else if (c.avg < 0 && c.locs.length > 1) {
    // Trim never closes a company's only location in a city — coverage,
    // once gained, sticks. Only densified (duplicate-city) locations
    // are closable.
    const byCity = {}; c.locs.forEach(l => { const k = l.city || c.city; byCity[k] = (byCity[k] || 0) + 1; });
    const closable = c.locs.filter(l => byCity[l.city || c.city] > 1);
    const worst = closable.slice().sort((a, b) => a.avg - b.avg)[0]; if (worst && worst.avg < 0) closeLoc(c, worst.id);
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
function holdingsValue() { let v = 0; for (const a3 in S.holdings) { const h = S.holdings[a3], c = S.co[a3]; if (!c) continue; v += c.listed ? h.qty * c.price : (h.qty / c.shares) * companyFairTotal(c); } for (const a3 in (S.holdingsP || {})) { const h = S.holdingsP[a3], c = S.co[a3]; if (!c) continue; v += c.listed ? h.qty * c.price : (h.qty / c.shares) * companyFairTotal(c); } for (const id in (S.holdingsX || {})) { const b = S.extra && S.extra[id]; if (b && b.price) v += S.holdingsX[id].qty * b.price; } for (const id in (S.holdingsXP || {})) { const b = S.extra && S.extra[id]; if (b && b.price) v += S.holdingsXP[id].qty * b.price; } return v; }
function shortValue() { let v = 0; const add = (map) => { for (const a3 in (map || {})) { const h = map[a3]; if (h.qty < 0 && S.co[a3]) v -= h.qty * S.co[a3].price; } }; add(S.holdings); add(S.holdingsP); return v; }
function propValue() { return S.props.reduce((a, p) => a + p.value, 0); }
function netWorth() { return S.cash + ((typeof ensurePerson === 'function') ? ensurePerson().cash : 0) + holdingsValue() + propValue() - S.loan; }
function nationPop() { let p = country(S.home).pop; for (const a3 in S.countries) if (S.countries[a3].occ === S.home) p += S.countries[a3].pop; return p; }
function popGrowth() { return nationPop() / country(S.home).pop0 - 1; }
function marketReturn() { return S.idx.v / S.idx0 - 1; }
function myReturn() { return netWorth() / Math.max(1, S.stats.startNet) - 1; }
function beatMarket() { return (1 + myReturn()) / (1 + marketReturn()) - 1; }
function weekProfit() { return S.week ? S.week.profit : 0; }
function level() { return 1 + Math.floor(Math.sqrt(S.xp / 120)); }
function levelProgress() { const L = level(); const a = (L - 1) ** 2 * 120, b = L ** 2 * 120; return (S.xp - a) / (b - a); }

// ---------- wallets: Company vs Private ----------
// Every spend asks which wallet pays: Company (business cash, S.cash)
// or Private (personal cash, S.person.cash). The country office
// budget is never a spend wallet: it pays for policies only, and
// country money never buys stocks. UI.wallet holds the current pick;
// panels render a Company/Private toggle (walletPickerHTML in ui.js)
// and every spend action reads curWallet() at click time.
function curWallet() { return (typeof UI !== 'undefined' && UI.wallet === 'private') ? 'private' : 'company'; }
function walletCash(w) { const P = (typeof ensurePerson === 'function') ? ensurePerson() : null; return w === 'private' ? (P ? P.cash : 0) : S.cash; }
// CEO salary, set at a board meeting: paid weekly into personal money.
// Only companies you control, and never bankrupt ones.
function weeklyCeoSalary() {
  let t = 0;
  for (const a3 in S.co) {
    const c = S.co[a3];
    if (c && !c.bankrupt && c.ceoSalary && typeof controlled === 'function' && controlled(a3)) t += c.ceoSalary / 52;
  }
  return t;
}
function walletPay(w, amt) { if (walletCash(w) < amt) return false; if (w === 'private') ensurePerson().cash -= amt; else S.cash -= amt; return true; }
function walletAdd(w, amt) { if (w === 'private') ensurePerson().cash += amt; else S.cash += amt; }
// Holdings are split by wallet: S.holdings/S.holdingsX are Company
// positions, S.holdingsP/S.holdingsXP are Private ones. Control,
// stake and value always use the combined position: both wallets
// are yours.
function holdMap(w) { if (w === 'private') { if (!S.holdingsP) S.holdingsP = {}; return S.holdingsP; } return S.holdings; }
function holdMapX(w) { if (w === 'private') { if (!S.holdingsXP) S.holdingsXP = {}; return S.holdingsXP; } if (!S.holdingsX) S.holdingsX = {}; return S.holdingsX; }
function holdQty(a3) { return (((S.holdings || {})[a3] || {}).qty || 0) + (((S.holdingsP || {})[a3] || {}).qty || 0); }
function holdQtyX(id) { return (((S.holdingsX || {})[id] || {}).qty || 0) + (((S.holdingsXP || {})[id] || {}).qty || 0); }
function holdPosCombined(a3) { const a = (S.holdings || {})[a3] || { qty: 0, cost: 0 }, b = (S.holdingsP || {})[a3] || { qty: 0, cost: 0 }; if (a.qty && b.qty && Math.sign(a.qty) !== Math.sign(b.qty)) return Math.abs(a.qty) >= Math.abs(b.qty) ? a : b; const q = a.qty + b.qty; return { qty: q, cost: q ? (a.cost * a.qty + b.cost * b.qty) / q : 0 }; }
function holdPosCombinedX(id) { const a = (S.holdingsX || {})[id] || { qty: 0, cost: 0 }, b = (S.holdingsXP || {})[id] || { qty: 0, cost: 0 }; if (a.qty && b.qty && Math.sign(a.qty) !== Math.sign(b.qty)) return Math.abs(a.qty) >= Math.abs(b.qty) ? a : b; const q = a.qty + b.qty; return { qty: q, cost: q ? (a.cost * a.qty + b.cost * b.qty) / q : 0 }; }

// ---------- market ----------
function liq(c) { return c.price * c.shares * 0.003; }
function impactFor(c, dollars) { return 0.1 * Math.sqrt(Math.abs(dollars) / liq(c)); }
function marketOpen() { return !isWeekend(S.day); }
function trade(a3, side, qty, w) {
  qty = Math.floor(qty); if (!(qty > 0)) return 'Enter how many shares.';
  const c = S.co[a3]; if (!c.listed) return 'This company is private. It isn’t traded on the market.';
  if (!marketOpen()) return 'Markets are closed on weekends.';
  w = w || curWallet();
  const sign = side === 'buy' || side === 'cover' ? 1 : -1;
  const imp = impactFor(c, qty * c.price), px = c.price * (1 + sign * imp / 2) * (1 + sign * 0.002);
  const map = holdMap(w);
  const pos = map[a3] || { qty: 0, cost: 0 };
  if (side === 'sell' && pos.qty > 0) S.lastTrade = { a3, side, qty, price: 0, pnl: 0 };
  if (side === 'cover' && pos.qty < 0) S.lastTrade = { a3, side, qty, price: 0, pnl: 0 };
  if (S.lastTrade && S.lastTrade.a3 === a3 && (side === 'sell' || side === 'cover')) {
    const unit = side === 'sell' ? (px - pos.cost) : (pos.cost - px);
    S.lastTrade.price = px; S.lastTrade.pnl = Math.round(unit * qty); S.lastTrade.sym = c.sym;
  }
  if (side === 'buy') { if (pos.qty < 0) return 'Cover your short first.'; if (holdQty(a3) + qty > c.shares) return 'You can’t buy more shares than exist.'; if (qty * px > walletCash(w)) return 'Not enough cash in this wallet.'; pos.cost = (pos.cost * pos.qty + qty * px) / (pos.qty + qty); pos.qty += qty; walletPay(w, qty * px); }
  else if (side === 'sell') { if (pos.qty < qty) return 'You don’t own that many shares in this wallet.'; pos.qty -= qty; walletAdd(w, qty * px); }
  else if (side === 'short') { if (pos.qty > 0) return 'Sell your shares first.'; if (qty * px > Math.max(0, netWorth()) * 0.5 - shortValue()) return 'You can short up to half your net worth.'; const n = -pos.qty; pos.cost = (pos.cost * n + qty * px) / (n + qty); pos.qty -= qty; walletAdd(w, qty * px); }
  else if (side === 'cover') { if (-pos.qty < qty) return 'You aren’t short that many shares.'; if (qty * px > walletCash(w)) return 'Not enough cash in this wallet.'; pos.qty += qty; walletPay(w, qty * px); }
  const wasControlled = controlled(a3);
  if (pos.qty === 0) delete map[a3]; else map[a3] = pos;
  c.price *= Math.exp(sign * imp); c.tmp -= sign * imp * 0.6;
  S.stats.trades++;
  c.tradedToday = (c.tradedToday || 0) + qty;
  if (!wasControlled && controlled(a3)) { gainControl(c, 'You now own a majority of'); }
  if (holdQty(a3) >= c.shares) takePrivate(c, 'You bought every share of');
  if (wasControlled && !controlled(a3)) { c.ai = true; news('Business', `You sold control of ${c.name}.`, a3); }
  return null;
}

function gainControl(c, how) { c.ai = false; S.xp += 300; news('Business', `${how} ${c.name}. You run it now.`, c.a3); }
function takePrivate(c, how) { c.listed = false; c.ai = false; S.stats.takeovers++; S.xp += 600; news('Business', `${how} ${c.name}. It is now fully yours and leaves the stock market.`, c.a3); }

function researchCost() { return Math.round(Math.max(1500, netWorth() * 0.0004) / 100) * 100; }
function research(a3, w) {
  w = w || curWallet();
  const cost = researchCost(); if (walletCash(w) < cost) return 'Not enough cash for research.';
  walletPay(w, cost);
  const c = S.co[a3];
  // Research reveals what the market expects: next quarter's
  // earnings estimate, plus what the last report actually did.
  // That expectation is what the next report will be judged against.
  const expect = (c.qExpect != null) ? c.qExpect : Math.round((c.avg || 0) * 13);
  c.res = { day: S.day, expect, lastSurprise: c.lastReport ? c.lastReport.surprise : null, lastMove: c.lastReport ? c.lastReport.move : null, lastQ: c.lastReport ? c.lastReport.q : null };
  return null;
}

const intelOn = () => S.boosts.intel > S.day;
const PATTERN_HINTS = { pump: 'Social media pump. These usually end in a dump.', squeeze: 'Short squeeze underway. Fast up, then fades.' };
// Buy every remaining share at a premium. The board may say no.
function takeoverCost(c, premium) { return (c.shares - Math.max(0, holdQty(c.a3))) * c.price * (1 + premium); }
function takeoverOdds(c, premium) {
  let p = 0.12 + premium * 1.25 + stake(c.a3) * 0.4;
  const rel = getRel(S.home, c.a3); if (rel > 50) p += 0.1; if (rel < -20) p -= 0.25;
  if (companyValue(c) > 5e10) p -= 0.15;
  return clamp(p, 0.03, 0.95);
}
function takeover(a3, premium, w) {
  const c = S.co[a3];
  if (!c.listed) return 'This company isn’t for sale on the market.';
  if (c.offerBlock > S.day) return `The board won't hear another offer until ${fmtDate(c.offerBlock)}.`;
  w = w || curWallet();
  const cost = takeoverCost(c, premium); if (walletCash(w) < cost) return `You need ${fmtMoney(cost, true)} in this wallet.`;
  if (rand() > takeoverOdds(c, premium)) { c.offerBlock = S.day + 60; c.price *= 1.06; news('Business', `${c.name}'s board rejected your takeover offer. Its stock jumped 6%.`, a3); return 'The board rejected your offer.'; }
  walletPay(w, cost);
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
    // Earnings-driven market: the daily move is small noise only
    // (about 0.2%/day, so roughly 0.5% a week). Quarterly reports do
    // the real moving. There is no fair-value gravity, no pump /
    // squeeze patterns, and no random shock jumps any more — those
    // stories now come from reports and corporate actions instead.
    // Rate moves are scaled down to match: small market-wide wiggles.
    let r = (c.beta * mkt + (sec[c.sector] || 0) + c.mood * 0.003 + gauss() * c.vol * R.vol * (cs.war || cs.occ ? 1.5 : 1)) * 0.1;
    if (!isFinite(r)) r = 0;
    r += cs.drift * 0.1 + c.tmp * 0.5 + rate * 0.3; c.tmp *= 0.5;
    if (c.shock) { r += c.shock; c.shock = 0; }
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
function goPublic(a3, pct, valuation) {
  const e = requireControl(a3); if (e) return e;
  const c = S.co[a3]; if (c.listed) return 'Already listed.';
  if (c.bankrupt) return 'Bankrupt companies cannot IPO.';
  if ((typeof boardFull === 'function') && !boardFull(c)) return 'IPO needs a full board room: hire all 5 board seats in Offices first.';
  if ((c.weekProfitStreak || 0) < 2) return `IPO needs 2 profitable weeks in a row. Current weekly streak: ${c.weekProfitStreak || 0}.`;
  pct = clamp(pct != null ? pct : 1, 0.05, 1);
  const v = (valuation != null && isFinite(valuation) && valuation > 0) ? Math.round(valuation) : companyFairTotal(c);
  const sold = Math.floor(c.shares * pct);
  const gross = Math.round(sold * (v / c.shares)), fee = Math.round(gross * 0.07), proceeds = gross - fee;
  let left = sold, payC = 0, payP = 0;
  const hc = (S.holdings || {})[a3], hp = (S.holdingsP || {})[a3];
  const takeC = hc ? Math.min(hc.qty, left) : 0; if (hc) { hc.qty -= takeC; left -= takeC; payC += takeC; if (hc.qty === 0) delete S.holdings[a3]; }
  const takeP = hp ? Math.min(hp.qty, left) : 0; if (hp) { hp.qty -= takeP; left -= takeP; payP += takeP; if (hp.qty === 0) delete S.holdingsP[a3]; }
  if (left > 0) { if (!S.holdings[a3]) S.holdings[a3] = { qty: 0, cost: c.price }; S.holdings[a3].qty -= left; payC += left; }
  // An IPO sells the company's shares: shares held in a wallet pay that
  // wallet, and newly issued shares pay the company pot. Your personal
  // share lands in your bank with a feed line.
  const proceedsC = Math.round(proceeds * (payC / Math.max(1, sold)));
  const proceedsP = Math.round(proceeds * (payP / Math.max(1, sold)));
  S.cash += proceedsC; ensurePerson().cash += proceedsP;
  if (proceedsP > 0 && typeof bankFeedPush === 'function') bankFeedPush({ d: S.day, text: '+ IPO sale · ' + c.name, amt: proceedsP });
  c.listed = true; c.price = v / c.shares;
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
  const qc = ((S.holdings || {})[c.a3] || {}).qty || 0, qp = ((S.holdingsP || {})[c.a3] || {}).qty || 0, qt = qc + qp;
  if (qt > 0) { S.cash += Math.round(amount * qc / qt); const pAmt = Math.round(amount * qp / qt); ensurePerson().cash += pAmt; if (pAmt > 0 && typeof bankFeedPush === 'function') bankFeedPush({ d: S.day, text: '+ sale · ' + c.name, amt: pAmt }); }
  delete S.holdings[c.a3]; if (S.holdingsP) delete S.holdingsP[c.a3]; c.listed = true; c.ai = true; m.offer.done = 'accepted';
  news('Business', `You sold ${c.name} for ${fmtMoney(amount, true)}.`, c.a3);
  return null;
}

// ---------- buildings ----------
function buyBuilding(cityId, t, w) {
  if (typeof isCityUnlocked === 'function' && !isCityUnlocked(cityId)) return 'That city is locked — unlock it for $25,000 first.';
  const lot = cityLots(cityId).find(l => l.t === t); if (!lot || lot.kind !== 'sale') return 'Not for sale anymore.';
  w = w || curWallet();
  if (walletCash(w) < lot.price) return 'Not enough cash in this wallet.';
  walletPay(w, lot.price); setLot(cityId, t, 'prop');
  S.props.push({ id: uid(), city: cityId, t, units: lot.units, mrent: lot.mrent, rentLv: 1, cond: lot.cond, value: lot.price, paid: lot.price, occ: 0.7, income: 0, traffic: lot.traffic, size: lot.size, wallet: w });
  S.xp += 80; news('Property', `You bought a ${lot.units}-unit building in ${W.cities[cityId].name}.`, W.cities[cityId].a3);
  return null;
}

function buyAnyBuilding(cityId, tIdx, w) {
  if (typeof isGovCity === 'function' && isGovCity(W.cities[cityId])) return 'Capitals are government-only — no buildings for sale here.';
  const existing = cityLots(cityId).find(l => l.t === tIdx);
  if (existing && existing.kind === 'sale') return buyBuilding(cityId, tIdx, w);
  if (existing && existing.kind === 'prop') return 'You already own this building.';
  if (existing && existing.kind === 'lease') return 'This lot is for lease — use BUILD STORE or LEASE instead.';
  const owner = S.co[W.cities[cityId].a3];
  if (owner && owner.locs.some(l => (l.city || owner.city) === cityId && l.t === tIdx)) return 'This is a company location, not for sale.';
  if (S.props.some(p => p.city === cityId && p.t === tIdx)) return 'You already own this building.';
  const lot = buildingLotForTile(cityId, tIdx); if (!lot) return 'Nothing to buy here.';
  w = w || curWallet();
  if (walletCash(w) < lot.price) return 'Not enough cash in this wallet.';
  walletPay(w, lot.price); setLot(cityId, tIdx, 'prop');
  S.props.push({ id: uid(), city: cityId, t: tIdx, units: lot.units, mrent: lot.mrent, rentLv: 1, cond: lot.cond, value: lot.price, paid: lot.price, occ: 0.7, income: 0, traffic: lot.traffic, size: lot.size, wallet: w });
  S.xp += 80; news('Property', `You bought a ${buildingName(lot.arch).toLowerCase()} in ${W.cities[cityId].name}.`, W.cities[cityId].a3);
  return null;
}

function sellBuilding(id) {
  const p = S.props.find(x => x.id === id); if (!p) return;
  if (p.loc) return 'Close the location in this building first.';
  walletAdd(p.wallet || 'company', p.value * 0.95); S.props = S.props.filter(x => x !== p); setLot(p.city, p.t, null);
  return null;
}

const renoCost = p => Math.round(p.value * (1 - p.cond) * 0.25 / 1000) * 1000 + 5000;
function renovate(id) { const p = S.props.find(x => x.id === id); if (!p) return 'Building not found.'; const c = renoCost(p); const w = p.wallet || 'company'; if (walletCash(w) < c) return 'Not enough cash in this wallet.'; walletPay(w, c); p.value += c * 0.8; p.cond = 1; return null; }

function propsWeek() {
  let total = 0;
  S.props.forEach(p => {
    const city = W.cities[p.city], m = bizMult(city.a3, p.city);
    const occT = clamp(0.96 - (p.rentLv - 1) * 1.6 + (p.cond - 0.7) * 0.5, 0.05, 1) * (m < 0.5 ? 0.6 : 1);
    p.occ += (occT - p.occ) * 0.3;
    p.income = (p.loc ? Math.max(0, p.units - 1) : p.units) * p.mrent * p.rentLv * p.occ - p.value * 0.0004;
    p.cond = Math.max(0.2, p.cond - 0.0015);
    if (p.wallet === 'private') ensurePerson().cash += p.income; else total += p.income;
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
