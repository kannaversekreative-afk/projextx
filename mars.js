// Mars — a feature. Nothing here ends the game, and
// the locked panel never states the unlock condition. All state lives
// on S (saved by the existing IndexedDB/localStorage save path), all
// businesses come from the existing flagship / extra / placed model,
// and the cost cut reuses locEconomics in sim.js — no new currency,
// no parallel ownership system.
//
// Internal chain (never rendered anywhere): one country must hold
// businesses in every slot below. Slots use the game's real sector
// names; the last slot accepts either leader Energy name or the
// legacy 'Energy' sector, so the chain works in both game modes.
// 'Controls' here means: the business is based in that country
// (flagship company + extra businesses + placed businesses), exactly
// as businessesInCountry() already defines it, plus placed businesses.
'use strict';

const MARS_SLOTS = [
  ['Semiconductors'],
  ['Robotics & Automation'],
  ['Software & AI'],
  ['Aerospace'],
  ['Electricity Generation', 'Energy'],
];
const MARS_COST_CUT = 0.15;
const MARS_CITY_ID = -9999;
// Rocket launch cost — STUB, decided later. Set MARS_CONFIG.rocketCost
// to a dollar amount when the price is decided; until then it is null
// and travelling to Mars costs nothing, so the rocket unlock works
// without a final price. Nothing else reads a rocket price — mine
// prices are floored against this value (see marsMinePrice), so once
// it is set, mines stay more expensive than the rocket with no
// restructuring. In-game cash only, never a new currency.
const MARS_CONFIG = { rocketCost: null };
// Mars share — EQUAL split among mine-builders (corrected model,
// replaces the old unlock-order model). "Getting there" means
// arriving on Mars AND building a mine: a country that has unlocked
// /arrived but has NOT built a mine gets no share and does NOT
// dilute anyone else. The mining yield is split equally among all
// countries that have arrived and built at least one mine: 1 such
// country gets 100%, 2 get 50% each, 4 get 25% each — in general
// 100% / N, where N = number of active mine-building countries.
// The share scales that country's whole Mars mining yield, and is
// recomputed each week as countries build their first mine.
// (unlockOrder is still kept for save compatibility / pool sizing
// only; it no longer scales yield.)
// Mars resource pool — END STATE, decided here and kept simple:
// Mars holds roughly 100 years of the world's resources. The pool is
// sized once, at the first unlock, to 100 years of that country's
// weekly base mining yield (52 weeks x 100). Every country's mining
// draws the SAME shared pool down. When the pool hits zero, Mars
// mining ends for everyone: no more mining income, no more Earth
// cost cut, mine sites stop paying (they stay owned and the city
// stays visitable). Earth play continues normally.
function marsHasBuiltMine(a3) {
  // "Built a mine" = owns at least one buyable mine site on Mars.
  // The automatically-created base mine record (marsMineFor) does NOT
  // count: an arrived country with no bought site is not a miner.
  try { return marsSitesFor(a3).some(s => s.owned); } catch (e) { return false; }
}
function marsActiveMiners() {
  const m = ensureMars(); if (!m) return [];
  return Object.keys(m.unlocked || {}).filter(a => m.unlocked[a] && marsHasBuiltMine(a));
}
function marsShare(a3) {
  const m = ensureMars(); if (!m || !m.unlocked[a3]) return 0;
  const active = marsActiveMiners();
  if (!active.includes(a3)) return 0;
  return 1 / active.length;
}
function marsPoolRemaining() {
  const m = ensureMars(); if (!m || !m.pool) return 0;
  return Math.max(0, m.pool.remaining);
}
function marsMiningActive(a3) {
  if (!marsUnlocked(a3)) return false;
  const m = ensureMars();
  if (!m.pool) return true; // pool not sized yet (pre-first-unlock legacy) — mining runs until sized
  return m.pool.remaining > 0;
}
const MARS_RESOURCES = [
  { id: 'iron', name: 'Iron ore', price: 120 },
  { id: 'ice', name: 'Water ice', price: 90 },
  { id: 'rare', name: 'Rare earths', price: 850 },
  { id: 'nickel', name: 'Nickel', price: 320 },
];
// Mars city grid: 25x25 dirt tiles. Mine sites sit on a deterministic
// subset of the non-track tiles, so the same city renders every load.
function marsSiteTiles() {
  const out = [];
  for (let y = 1; y < 24 && out.length < 14; y++) for (let x = 1; x < 24 && out.length < 14; x++) {
    if (x % 4 === 0 || y % 4 === 0) continue;
    if ((x * 7 + y * 13) % 9 !== 0) continue;
    out.push(y * 25 + x);
  }
  return out;
}
function marsLayout() {
  const siteSet = new Set(marsSiteTiles());
  const tiles = [];
  for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) {
    const t = y * 25 + x;
    tiles.push({ x, y, kind: siteSet.has(t) ? 'mine' : 'dirt', seed: ((x * 31 + y * 17) % 100) / 100, t });
  }
  return { N: 25, tiles, landmark: { x: 12, y: 12 }, waterSide: -1 };
}

function ensureMars() {
  if (!S) return null;
  if (!S.mars || typeof S.mars !== 'object') S.mars = { unlocked: {}, mines: {}, sites: {}, unlockOrder: [], pool: null };
  if (!S.mars.unlocked) S.mars.unlocked = {};
  if (!S.mars.mines) S.mars.mines = {};
  if (!S.mars.sites) S.mars.sites = {};
  if (!Array.isArray(S.mars.unlockOrder)) S.mars.unlockOrder = [];
  return S.mars;
}
// Mine purchase price. Mines are EXPENSIVE — more expensive than the
// rocket, by construction: the price is the GDP-based price, floored
// at twice the rocket cost whenever the rocket cost has been set.
// While the rocket cost is still the null stub, the GDP price applies
// and the floor takes over automatically once it is set.
function marsMinePrice(a3, t) {
  const gdpDollars = (W.byA3[a3] ? W.byA3[a3].gdp0 * 1e6 : 1e9);
  const factor = 0.7 + 0.06 * ((t * 37) % 10);
  const gdpPrice = Math.max(500000, Math.round(gdpDollars * 0.008 / 3 * factor / 1000) * 1000);
  const floor = (MARS_CONFIG.rocketCost != null) ? MARS_CONFIG.rocketCost * 2 : 0;
  return Math.max(gdpPrice, floor);
}
function marsSitesFor(a3) {
  const m = ensureMars(); if (!m) return [];
  if (!Array.isArray(m.sites[a3])) {
    m.sites[a3] = marsSiteTiles().map((t, i) => {
      const price = marsMinePrice(a3, t);
      return { t, resource: MARS_RESOURCES[i % MARS_RESOURCES.length].name, price, income: Math.round(price * 0.001), owned: false };
    });
  }
  return m.sites[a3];
}
function marsSiteIncome(a3) {
  return marsSitesFor(a3).filter(s => s.owned).reduce((a, s) => a + s.income, 0);
}
function marsBuySite(a3, t) {
  if (!marsUnlocked(a3)) return 'Mars is locked.';
  if (a3 !== S.home) return 'That mine belongs to another country.';
  if (!marsMiningActive(a3)) return 'Mars resources are exhausted.';
  const site = marsSitesFor(a3).find(s => s.t === t);
  if (!site) return 'Mine site not found.';
  if (site.owned) return 'You already own this mine.';
  if (S.cash < site.price) return 'Not enough cash to buy this mine.';
  S.cash -= site.price; site.owned = true;
  return null;
}
function marsSellSite(a3, t) {
  const site = marsSitesFor(a3).find(s => s.t === t);
  if (!site || !site.owned) return 'You do not own this mine.';
  S.cash += Math.round(site.price * 0.8); site.owned = false;
  return null;
}
function marsMineFor(a3) {
  const m = ensureMars();
  if (!m.mines[a3]) m.mines[a3] = { level: 1, total: 0, lastWeek: 0, resources: { iron: 0, ice: 0, rare: 0, nickel: 0 } };
  if (!m.mines[a3].resources) m.mines[a3].resources = { iron: 0, ice: 0, rare: 0, nickel: 0 };
  return m.mines[a3];
}
function marsBusinesses(a3) {
  const out = [];
  if (typeof businessesInCountry === 'function') businessesInCountry(a3).forEach(b => out.push(b));
  if (Array.isArray(S.placed)) S.placed.forEach(b => { if (b.a3 === a3) out.push(b); });
  return out;
}
function marsSectors(a3) {
  const set = new Set();
  marsBusinesses(a3).forEach(b => { if (b.sector) set.add(b.sector); });
  return set;
}
function marsChainComplete(a3) {
  const have = marsSectors(a3);
  return MARS_SLOTS.every(slot => slot.some(s => have.has(s)));
}
function marsUnlocked(a3) {
  const m = ensureMars(); if (!m) return false;
  return m.unlocked[a3] === true;
}
// Cost multiplier for a country's flagship locations (applied inside
// locEconomics in sim.js). 0.85 while Mars mining is active, 1
// otherwise — so when the shared pool is exhausted, the cost cut ends
// with the mining, while the city stays visitable.
function marsCostMult(a3) { return marsMiningActive(a3) ? (1 - MARS_COST_CUT) : 1; }
function marsBusinessValue(a3) {
  let v = 0;
  marsBusinesses(a3).forEach(b => {
    if (b === S.co[a3]) v += (typeof companyValue === 'function' ? companyValue(b) : (b.value || 0));
    else v += (b.value || 0);
  });
  return v;
}
// One country, over time, can found a new extra business from its
// sector pool (plus any chain sector it still lacks, so industrial
// development can eventually reach the full chain). This reuses the
// existing makeExtraBusiness + leaderWeek extra simulation — extras
// already earn, pay tax and grow the country. Capped at 6 businesses
// per country, low weekly chance, leader games only.
function marsGrowth() {
  if (!S || !S.leader || typeof makeExtraBusiness !== 'function' || typeof sectorPoolForCountry !== 'function') return;
  for (const a3 in S.countries) {
    const k = W.byA3[a3]; if (!k) continue;
    const biz = marsBusinesses(a3);
    if (biz.length >= 6) continue;
    if (rand() > 0.004) continue;
    const have = marsSectors(a3);
    const pool = sectorPoolForCountry(k).filter(s => !have.has(s));
    const missing = MARS_SLOTS.map(slot => slot[0]).filter(s => !have.has(s) && !pool.includes(s));
    const candidates = pool.concat(missing);
    if (!candidates.length) continue;
    const sector = pick(candidates);
    const usedNames = new Set(), usedSyms = new Set();
    Object.values(S.co).forEach(c => { usedNames.add(c.name); usedSyms.add(c.sym); });
    if (S.extra) Object.values(S.extra).forEach(b => { usedNames.add(b.name); usedSyms.add(b.sym); });
    const idx = Math.max(0, ...Object.values(S.extra || {}).filter(b => b.a3 === a3).map(b => +(b.id.split('-').pop() || 0))) + 1;
    const ex = makeExtraBusiness(k, sector, usedNames, usedSyms, idx);
    S.extra[ex.id] = ex;
    if (a3 === S.home) news('Business', `${ex.name} opened in ${cname(a3)}.`, a3);
  }
}
function marsCheckUnlocks() {
  const m = ensureMars(); if (!m) return [];
  const newly = [];
  for (const a3 in S.countries) {
    if (m.unlocked[a3]) continue;
    if (!marsChainComplete(a3)) continue;
    m.unlocked[a3] = true;
    if (!m.unlockOrder.includes(a3)) m.unlockOrder.push(a3);
    marsMineFor(a3);
    // Size the shared pool once, at the first unlock: 100 years of
    // that country's weekly base yield (see the pool comment above).
    if (!m.pool) {
      const firstBase = Math.max(250000, marsBusinessValue(a3) * 0.002);
      m.pool = { total: Math.round(firstBase * 52 * 100), remaining: Math.round(firstBase * 52 * 100) };
    }
    newly.push(a3);
    // Plain announcement only. No condition, no explanation.
    news('Milestone', `${cname(a3)} has reached Mars.`, a3);
    if (a3 === S.home) mail('Mars', 'You have reached Mars', 'A rocket is ready. Open Mars from More to travel there and run the mine.');
  }
  return newly;
}
// Weekly Mars work: growth, unlock checks, then mining income for
// every ACTIVE miner only (arrived + built a mine). Mining income
// scales with the value of that country's businesses and with mine
// level, then by the equal active-miner split (100% / N). Arrived
// countries with no built mine earn nothing and do not dilute the
// split. All miners draw the same shared pool; if a week's total
// yield exceeds what is left, every miner is paid pro-rata and the
// pool hits zero — mining ends. It lands in the home player's cash,
// or in a CPU country's treasury. Nothing here ends the game —
// Earth play continues after Mars opens.
function marsWeek() {
  if (!S) return;
  ensureMars();
  // One-time migration for saves unlocked before unlock order existed
  // (this feature has not shipped, so this is only a safety net):
  // unlocked countries join the order once, in key order, and never
  // again — transient unlocked flags elsewhere must not append.
  if (!S.mars.orderMigrated) {
    S.mars.orderMigrated = true;
    Object.keys(S.mars.unlocked).forEach(a => { if (S.mars.unlocked[a] && !S.mars.unlockOrder.includes(a)) S.mars.unlockOrder.push(a); });
  }
  marsGrowth();
  marsCheckUnlocks();
  const m = S.mars;
  if (!m.pool && m.unlockOrder.length) {
    const first = m.unlockOrder[0];
    const firstBase = Math.max(250000, marsBusinessValue(first) * 0.002);
    m.pool = { total: Math.round(firstBase * 52 * 100), remaining: Math.round(firstBase * 52 * 100) };
  }
  if (!m.pool) return; // nobody has unlocked yet — nothing to mine
  if (m.pool.remaining <= 0) {
    for (const a3 in m.unlocked) if (m.unlocked[a3]) marsMineFor(a3).lastWeek = 0;
    return;
  }
  // First pass: compute every ACTIVE miner's full yield (base mine
  // + owned sites, scaled by the equal active-miner split), without
  // crediting yet. Arrived-but-no-mine countries earn nothing here.
  const yields = [];
  for (const a3 in m.unlocked) {
    if (!m.unlocked[a3]) continue;
    if (!marsHasBuiltMine(a3)) { marsMineFor(a3).lastWeek = 0; continue; }
    const mine = marsMineFor(a3);
    const mult = 1 + 0.5 * (mine.level - 1);
    const base = Math.max(250000, marsBusinessValue(a3) * 0.002) * mult;
    let income = 0;
    const amounts = {};
    MARS_RESOURCES.forEach((r, i) => {
      const share = [0.45, 0.25, 0.1, 0.2][i];
      const amount = Math.round(base * share / r.price);
      amounts[r.id] = amount;
      income += amount * r.price;
    });
    const total = (Math.round(income) + marsSiteIncome(a3)) * marsShare(a3);
    yields.push({ a3, mine, amounts, total });
  }
  const totalYield = yields.reduce((a, y) => a + y.total, 0);
  const factor = totalYield > 0 ? Math.min(1, m.pool.remaining / totalYield) : 0;
  yields.forEach(y => {
    const paid = Math.round(y.total * factor);
    MARS_RESOURCES.forEach(r => { y.mine.resources[r.id] += Math.round(y.amounts[r.id] * marsShare(y.a3) * factor); });
    y.mine.lastWeek = paid;
    y.mine.total += paid;
    y.mine.siteIncome = marsSiteIncome(y.a3);
    if (y.a3 === S.home) S.cash += paid;
    else if (S.countries[y.a3]) S.countries[y.a3].treasury = (S.countries[y.a3].treasury || 0) + paid;
  });
  m.pool.remaining = Math.max(0, m.pool.remaining - yields.reduce((a, y) => a + y.mine.lastWeek, 0));
}
function marsExpandCost(a3) {
  const mine = marsMineFor(a3);
  return Math.round(10000000 * mine.level * mine.level / 1000) * 1000;
}
function marsExpand(a3) {
  if (!marsUnlocked(a3)) return 'Mars is locked.';
  if (a3 !== S.home) return 'That mine belongs to another country.';
  const cost = marsExpandCost(a3);
  if (S.cash < cost) return 'Not enough cash to expand the mine.';
  S.cash -= cost;
  marsMineFor(a3).level += 1;
  return null;
}
// Mars panel HTML. Locked state shows ONLY that it is locked — no
// condition, no hint, no explanation, anywhere in this string.
function marsPanelHTML() {
  if (typeof marsCheckUnlocks === 'function') marsCheckUnlocks();
  const home = S.home;
  if (!marsUnlocked(home)) {
    const others = Object.keys((S.mars && S.mars.unlocked) || {}).filter(a => a !== home);
    return panelShell('Mars', '🔒 Locked',
      `<div class="card in"><h3>🔒 Mars is locked.</h3></div>`
      + (others.length ? `<div class="card in"><h4>On Mars now</h4>${others.map(a => `<div class="kv"><span>${esc(cname(a))}</span><b>🚀</b></div>`).join('')}</div>` : ''));
  }
  const mine = marsMineFor(home);
  const cost = marsExpandCost(home);
  const resRows = MARS_RESOURCES.map(r => `<div class="kv"><span>${r.name}</span><b>${(mine.resources[r.id] || 0).toLocaleString('en-US')} t</b></div>`).join('');
  const ownedSites = marsSitesFor(home).filter(s => s.owned).length;
  const sharePct = Math.round(marsShare(home) * 100);
  const pool = S.mars.pool;
  const poolPct = pool && pool.total ? Math.round(pool.remaining / pool.total * 100) : 100;
  const exhausted = pool && pool.remaining <= 0;
  return panelShell('Mars', '🚀 Rocket ready · Earth play continues',
    `<div class="card in"><h3>🚀 Mars</h3>`
    + (exhausted ? `<p><b>Mars resources are exhausted — mining has ended.</b></p><p class="muted small">The city stays visitable and your mine sites stay owned, but they no longer pay.</p>` : `<p class="muted small">Your rocket travels to Mars. The mine sends natural resources back to Earth, and while mining is active your companies' costs on Earth are ${Math.round(MARS_COST_CUT * 100)}% lower.</p>`)
    + `<button class="btn3d orange wide" data-a="marsTravel">🚀 TRAVEL TO MARS</button>`
    + `<div class="kv"><span>Mars share</span><b>${sharePct}%</b></div>`
    + `<div class="kv"><span>Resource pool left</span><b>${poolPct}%</b></div>`
    + `<div class="kv"><span>Mine level</span><b>${mine.level}</b></div>`
    + `<div class="kv"><span>Mined last week</span><b>${fmtMoney(mine.lastWeek, true)}</b></div>`
    + `<div class="kv"><span>Total mined</span><b>${fmtMoney(mine.total, true)}</b></div>`
    + `<div class="kv"><span>Mine sites owned</span><b>${ownedSites} of ${marsSitesFor(home).length}</b></div>`
    + `<h4>Resources mined</h4>${resRows}`
    + (exhausted ? '' : `<button class="btn3d orange wide" data-a="marsExpand">EXPAND MINE · ${fmtMoney(cost, true)}</button>`) + `</div>`
    + `<p class="muted small">Mining income is paid weekly to your cash. On Mars, buy mine sites like buildings in a city — each owned site pays weekly income too. Expanding the mine raises weekly output.</p>`);
}
