// Random company / stock names — for the shuffled world only (Worl Mode).
// Real World (mode 'infinite' leader game) keeps the base BRAND_A/B pool
// in data.js untouched. A shuffled world must NOT reuse that pool: every
// business and stock in it gets a name from this separate, much larger
// invented pool, so a random run never reads like the real world.
// Names are display-only: holdings, saves and news are keyed by country
// (a3) and business id, never by name, so renaming changes nothing else.
// Loaded after sim.js (for pick/rand) and used at runtime by sim.js,
// leader.js and ui.js — never at load time.
'use strict';

// Invented roots — deliberately not real brand words. Root + middle
// (+ occasional tail) gives tens of thousands of distinct brands, far
// more than the ~585 businesses a game holds, so uniqueness holds
// without repeats across a run.
const RN_ROOTS = ['Zaq','Thal','Quor','Vryn','Kest','Omb','Fyn','Drel','Sarn','Pex','Ulth','Grav','Nyx','Dra','Zel','Myr','Ryn','Bex','Jor','Kly','Vorn','Zith','Dax','Wex','Ysol','Trex','Vulk','Orn','Svel','Kyr','Jax','Zor','Ply','Quen','Vash','Torm','Zan','Vek','Torv','Hask','Brin','Suld','Karn','Vilt','Ostr','Yven','Pold','Rask','Vind','Tess','Korv','Zund','Bral','Nulk','Ferv','Glim','Hox','Jund','Krel','Lorv','Mesk','Nald','Ost','Prux','Quel','Rov','Skel','Tuv','Ulv','Wald','Xel','Yund','Zev','Bord','Crix','Dolv','Estr','Fald','Gorn','Hald','Isk','Jev','Kolt','Lund','Mord','Nisk','Olth','Peld','Quil','Rald','Sond','Tald','Usk','Vard','Wisk','Yald','Zold'];
const RN_MIDS = ['a','an','ar','el','en','er','ia','in','is','on','or','um','ax','ex','ox','yn','ae','eo','u','o'];
const RN_TAILS = ['dor','vex','nix','zor','lyn','thor','kell','mar','son','dine','vane','korn'];
// Famous tickers / brands a generated name must never collide with.
// Our roots are invented, so a hit is near-impossible — this is a guard.
const RN_BAD_TICKERS = new Set(['AAPL','MSFT','AMZN','GOOG','GOOGL','META','NVDA','TSLA','NFLX','AMD','INTC','ORCL','CRM','ADBE','UBER','LYFT','ABNB','SHOP','SPOT','DIS','NKE','SBUX','MCD','KO','PEP','JPM','BAC','WFC','V','MA','WMT','COST','HD','BA','GE','IBM','GM','VZ','XOM','CVX','PFE','JNJ','UNH','LLY','AVGO','ASML','TSM','BABA']);
const RN_BAD_BRANDS = new Set(['APPLE','TESLA','AMAZON','GOOGLE','MICROSOFT','NVIDIA','NETFLIX','DISNEY','NIKE','STARBUCKS','MCDONALD','COCACOLA','PEPSI','JPMORGAN','VISA','MASTERCARD','WALMART','COSTCO','BOEING','FORD','INTEL','ORACLE','SALESFORCE','ADOBE','UBER','AIRBNB','SHOPIFY','SPOTIFY']);
// The real World's base pool (data.js) — a random-world brand must never
// equal one of these, even by coincidence (e.g. root 'Zor' + mid 'ex'
// would otherwise collide with base 'Zor' + 'ex').
const RN_BASE_BRANDS = new Set();
if (typeof BRAND_A !== 'undefined' && typeof BRAND_B !== 'undefined') BRAND_A.forEach(a => BRAND_B.forEach(b => RN_BASE_BRANDS.add(a + b)));
// Sector-matched suffixes. Base 5 sectors keep their data.js SUFFIX;
// leader sectors are grouped by their leader group (g).
const RN_SUFFIX_GROUP = {
  food: [' Foods',' Farms',' Harvest',' Provisions',' Nutrition'],
  energy: [' Energy',' Power',' Fuels',' Renewables',' Grid'],
  mfg: [' Materials',' Manufacturing',' Industries',' Works',' Fabrication'],
  tech: [' Labs',' Systems',' Dynamics',' Robotics',' Digital',' Networks'],
  transport: [' Logistics',' Freight',' Lines',' Transport',' Shipping'],
  service: [' Services',' Group',' Care',' Retail',' Hospitality'],
  finance: [' Capital',' Investments',' Financial',' Partners',' Holdings'],
  def: [' Co.',' Group',' Industries',' Ltd.',' Corp.'],
};
function rnSuffix(sector) {
  if (typeof SUFFIX !== 'undefined' && SUFFIX[sector]) return pick(SUFFIX[sector]);
  let g = 'def';
  if (typeof LEADER_SECTOR_BY_NAME !== 'undefined' && LEADER_SECTOR_BY_NAME[sector]) g = LEADER_SECTOR_BY_NAME[sector].g || 'def';
  else if (sector === 'Airline' || sector === 'Shipping') g = 'transport';
  else if (sector === 'Energy') g = 'energy';
  else if (sector === 'Tech') g = 'tech';
  else if (sector === 'Retail') g = 'service';
  return pick(RN_SUFFIX_GROUP[g] || RN_SUFFIX_GROUP.def);
}
// True only for the shuffled world (Worl Mode). Real World leader games
// use mode 'infinite', tycoon games use 'normal'/'infinite' — never this.
function isRandomWorld() {
  try { return typeof S !== 'undefined' && S && (S.randomWorld === true || S.mode === 'worl'); } catch (e) { return false; }
}
function rnTicker(brand, used) {
  const L = brand.toUpperCase().replace(/[^A-Z]/g, '') || 'ZQX';
  const cands = [L.slice(0, 4), L.slice(0, 3), L[0] + L.slice(-3), L.slice(0, 2) + L.slice(-1)];
  for (const t of cands) {
    if (t.length >= 3 && !RN_BAD_TICKERS.has(t) && (!used || !used.has(t))) { if (used) used.add(t); return t; }
  }
  for (let i = 0; i < 50; i++) {
    const t = L.slice(0, 3) + String.fromCharCode(65 + Math.floor(rand() * 26));
    if (!RN_BAD_TICKERS.has(t) && (!used || !used.has(t))) { if (used) used.add(t); return t; }
  }
  return null;
}
// Returns { brand, name, sym } or null if the pool is exhausted (callers
// fall back to the base generator). Adds brand + full name to usedNames
// and the ticker to usedSyms, matching the base generator's convention.
function genRandomCompany(sector, usedNames, usedSyms) {
  for (let tries = 0; tries < 300; tries++) {
    let brand = pick(RN_ROOTS) + pick(RN_MIDS);
    if (rand() < 0.3) brand += pick(RN_TAILS);
    if (RN_BAD_BRANDS.has(brand.toUpperCase())) continue;
    if (RN_BASE_BRANDS.has(brand)) continue;
    const name = brand + rnSuffix(sector);
    if (usedNames && (usedNames.has(brand) || usedNames.has(name))) continue;
    const sym = rnTicker(brand, usedSyms);
    if (!sym) continue;
    if (usedNames) { usedNames.add(brand); usedNames.add(name); }
    return { brand, name, sym };
  }
  return null;
}
