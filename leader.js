// Country Leader game — 78 sectors, 2–3 businesses per country, leader economy.
// Loaded after world-events.js, before mapview.js. All top-level functions
// are globals, so sim.js / world-events.js / ui.js can call them at runtime.
// Original companies, people and sector names are fictional.
'use strict';

// ---------- 78 sectors ----------
// Each entry: name, group, icon, colour, and market parameters. Full
// SECTORS entries (loc, fleet, tag, products) are generated below from
// the group template, so companyWeek / locEconomics / fleetEconomics keep
// working without hand-writing 78 full definitions.
const LEADER_SECTORS = [
  // A. Food & agriculture (10)
  { n: 'Crop Farming', g: 'food', icon: '🌾', c: '#7a9a2e', growth: 0.02, vol: 0.018, beta: 0.8, div: 0.03 },
  { n: 'Livestock Farming', g: 'food', icon: '🐄', c: '#8a6d3b', growth: 0.02, vol: 0.018, beta: 0.8, div: 0.03 },
  { n: 'Fishing & Aquaculture', g: 'food', icon: '🎣', c: '#2f7cf6', growth: 0.02, vol: 0.02, beta: 0.9, div: 0.03 },
  { n: 'Forestry & Timber', g: 'food', icon: '🌲', c: '#2e7d32', growth: 0.015, vol: 0.018, beta: 0.8, div: 0.03 },
  { n: 'Food Processing', g: 'food', icon: '🥫', c: '#e0812b', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Beverages & Tobacco', g: 'food', icon: '🥤', c: '#7c4dff', growth: 0.025, vol: 0.016, beta: 0.8, div: 0.04 },
  { n: 'Dairy Products', g: 'food', icon: '🥛', c: '#f5b301', growth: 0.025, vol: 0.016, beta: 0.8, div: 0.035 },
  { n: 'Meat Processing', g: 'food', icon: '🥩', c: '#e5484d', growth: 0.025, vol: 0.018, beta: 0.85, div: 0.03 },
  { n: 'Bakery & Confectionery', g: 'food', icon: '🍞', c: '#d4a017', growth: 0.03, vol: 0.016, beta: 0.8, div: 0.035 },
  { n: 'Animal Feed', g: 'food', icon: '🌽', c: '#a67c00', growth: 0.02, vol: 0.016, beta: 0.8, div: 0.03 },
  // B. Energy & resources (10)
  { n: 'Oil Extraction', g: 'energy', icon: '🛢️', c: '#111827', growth: 0.02, vol: 0.028, beta: 1.1, div: 0.05 },
  { n: 'Oil Refining & Fuels', g: 'energy', icon: '⛽', c: '#e0812b', growth: 0.025, vol: 0.022, beta: 0.9, div: 0.045 },
  { n: 'Natural Gas', g: 'energy', icon: '🔥', c: '#0ea5b7', growth: 0.025, vol: 0.024, beta: 1.0, div: 0.045 },
  { n: 'Coal & Peat', g: 'energy', icon: '⚫', c: '#374151', growth: 0.0, vol: 0.022, beta: 0.9, div: 0.04 },
  { n: 'Mining – Metals', g: 'energy', icon: '⛏️', c: '#6b7280', growth: 0.02, vol: 0.024, beta: 1.0, div: 0.035 },
  { n: 'Mining – Non-metals', g: 'energy', icon: '🪨', c: '#9ca3af', growth: 0.02, vol: 0.02, beta: 0.9, div: 0.035 },
  { n: 'Electricity Generation', g: 'energy', icon: '⚡', c: '#f5b301', growth: 0.03, vol: 0.016, beta: 0.7, div: 0.045 },
  { n: 'Electricity Distribution', g: 'energy', icon: '🔌', c: '#f59e0b', growth: 0.025, vol: 0.014, beta: 0.7, div: 0.04 },
  { n: 'Water Supply', g: 'energy', icon: '💧', c: '#2f7cf6', growth: 0.02, vol: 0.012, beta: 0.6, div: 0.04 },
  { n: 'Waste & Recycling', g: 'energy', icon: '♻️', c: '#12a150', growth: 0.03, vol: 0.016, beta: 0.8, div: 0.03 },
  // C. Materials & chemicals (10)
  { n: 'Chemicals – Basic', g: 'mfg', icon: '🧪', c: '#7c4dff', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.035 },
  { n: 'Fertilizers & Pesticides', g: 'mfg', icon: '🌱', c: '#12a150', growth: 0.025, vol: 0.02, beta: 0.9, div: 0.035 },
  { n: 'Pharmaceuticals', g: 'mfg', icon: '💊', c: '#e5484d', growth: 0.05, vol: 0.022, beta: 1.0, div: 0.02 },
  { n: 'Plastics & Rubber', g: 'mfg', icon: '🧴', c: '#0ea5b7', growth: 0.03, vol: 0.02, beta: 0.9, div: 0.035 },
  { n: 'Steel Production', g: 'mfg', icon: '🏭', c: '#374151', growth: 0.025, vol: 0.022, beta: 1.0, div: 0.035 },
  { n: 'Metal Fabrication', g: 'mfg', icon: '🔩', c: '#6b7280', growth: 0.03, vol: 0.02, beta: 0.9, div: 0.035 },
  { n: 'Glass & Ceramics', g: 'mfg', icon: '🏺', c: '#2f7cf6', growth: 0.025, vol: 0.018, beta: 0.85, div: 0.035 },
  { n: 'Paper & Packaging', g: 'mfg', icon: '📦', c: '#8a6d3b', growth: 0.02, vol: 0.016, beta: 0.8, div: 0.04 },
  { n: 'Textiles', g: 'mfg', icon: '🧵', c: '#e5484d', growth: 0.02, vol: 0.018, beta: 0.85, div: 0.035 },
  { n: 'Apparel & Footwear', g: 'mfg', icon: '👟', c: '#ff6b2c', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  // D. Machines & tech (14)
  { n: 'Machinery – Industrial', g: 'tech', icon: '⚙️', c: '#374151', growth: 0.035, vol: 0.02, beta: 1.0, div: 0.03 },
  { n: 'Machinery – Agricultural', g: 'tech', icon: '🚜', c: '#7a9a2e', growth: 0.03, vol: 0.02, beta: 0.9, div: 0.03 },
  { n: 'Electronics – Components', g: 'tech', icon: '🔌', c: '#2f7cf6', growth: 0.05, vol: 0.024, beta: 1.2, div: 0.015 },
  { n: 'Semiconductors', g: 'tech', icon: '💾', c: '#7c4dff', growth: 0.08, vol: 0.028, beta: 1.3, div: 0.01 },
  { n: 'Consumer Electronics', g: 'tech', icon: '📱', c: '#111827', growth: 0.05, vol: 0.024, beta: 1.2, div: 0.02 },
  { n: 'Vehicles – Cars & Trucks', g: 'tech', icon: '🚗', c: '#e5484d', growth: 0.03, vol: 0.022, beta: 1.1, div: 0.025 },
  { n: 'Vehicles – Parts', g: 'tech', icon: '🔧', c: '#6b7280', growth: 0.03, vol: 0.02, beta: 1.0, div: 0.03 },
  { n: 'Aerospace', g: 'tech', icon: '🚀', c: '#2f7cf6', growth: 0.04, vol: 0.024, beta: 1.1, div: 0.02 },
  { n: 'Defence Equipment', g: 'tech', icon: '🛡️', c: '#374151', growth: 0.03, vol: 0.02, beta: 0.9, div: 0.03 },
  { n: 'Robotics & Automation', g: 'tech', icon: '🤖', c: '#7c4dff', growth: 0.07, vol: 0.026, beta: 1.25, div: 0.01 },
  { n: 'Medical Devices', g: 'tech', icon: '🩺', c: '#12a150', growth: 0.05, vol: 0.02, beta: 1.0, div: 0.02 },
  { n: 'Furniture & Consumer Goods', g: 'tech', icon: '🛋️', c: '#8a6d3b', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.035 },
  { n: 'Batteries & Energy Storage', g: 'tech', icon: '🔋', c: '#12a150', growth: 0.07, vol: 0.026, beta: 1.2, div: 0.01 },
  { n: 'Renewable Energy Technology', g: 'tech', icon: '🌞', c: '#f5b301', growth: 0.06, vol: 0.024, beta: 1.15, div: 0.015 },
  // E. Construction & transport (10)
  { n: 'Construction – Residential', g: 'transport', icon: '🏠', c: '#e0812b', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Construction – Infrastructure', g: 'transport', icon: '🏗️', c: '#374151', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Shipping – Freight', g: 'transport', icon: '🚢', c: '#0ea5b7', growth: 0.03, vol: 0.022, beta: 1.15, div: 0.035 },
  { n: 'Shipping – Passenger', g: 'transport', icon: '🛳️', c: '#2f7cf6', growth: 0.025, vol: 0.02, beta: 1.0, div: 0.03 },
  { n: 'Airlines – Passenger', g: 'transport', icon: '✈️', c: '#2f7cf6', growth: 0.04, vol: 0.022, beta: 1.3, div: 0.01 },
  { n: 'Airlines – Cargo', g: 'transport', icon: '🛫', c: '#7c4dff', growth: 0.035, vol: 0.022, beta: 1.2, div: 0.02 },
  { n: 'Rail Transport', g: 'transport', icon: '🚆', c: '#111827', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Road Transport & Trucking', g: 'transport', icon: '🚛', c: '#e0812b', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.035 },
  { n: 'Logistics & Warehousing', g: 'transport', icon: '📦', c: '#8a6d3b', growth: 0.04, vol: 0.018, beta: 0.95, div: 0.03 },
  { n: 'Ports & Airports Services', g: 'transport', icon: '⚓', c: '#0ea5b7', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.035 },
  // F. Consumer services (12)
  { n: 'Retail – Grocery', g: 'service', icon: '🛒', c: '#12a150', growth: 0.03, vol: 0.013, beta: 0.75, div: 0.03 },
  { n: 'Retail – General', g: 'service', icon: '🛍️', c: '#e5484d', growth: 0.04, vol: 0.016, beta: 0.85, div: 0.025 },
  { n: 'Hotels', g: 'service', icon: '🏨', c: '#2f7cf6', growth: 0.035, vol: 0.02, beta: 1.0, div: 0.025 },
  { n: 'Restaurants & Bars', g: 'service', icon: '🍽️', c: '#ff6b2c', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Healthcare Services', g: 'service', icon: '🏥', c: '#12a150', growth: 0.04, vol: 0.016, beta: 0.8, div: 0.025 },
  { n: 'Education – Schools', g: 'service', icon: '🏫', c: '#f5b301', growth: 0.025, vol: 0.012, beta: 0.7, div: 0.03 },
  { n: 'Education – Higher', g: 'service', icon: '🎓', c: '#7c4dff', growth: 0.03, vol: 0.014, beta: 0.75, div: 0.025 },
  { n: 'Entertainment – Film & Music', g: 'service', icon: '🎬', c: '#e5484d', growth: 0.04, vol: 0.022, beta: 1.1, div: 0.02 },
  { n: 'Entertainment – Gaming & Sports', g: 'service', icon: '🎮', c: '#7c4dff', growth: 0.05, vol: 0.024, beta: 1.15, div: 0.015 },
  { n: 'Tourism Services', g: 'service', icon: '🏖️', c: '#2f7cf6', growth: 0.035, vol: 0.022, beta: 1.0, div: 0.025 },
  { n: 'Personal Services', g: 'service', icon: '💇', c: '#ff6b2c', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Real Estate – Residential', g: 'service', icon: '🏘️', c: '#8a6d3b', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.035 },
  // G. Business, tech & finance (12)
  { n: 'Software & AI', g: 'tech', icon: '💻', c: '#7c4dff', growth: 0.09, vol: 0.026, beta: 1.3, div: 0 },
  { n: 'Data Centers & Cloud', g: 'tech', icon: '🖥️', c: '#2f7cf6', growth: 0.08, vol: 0.024, beta: 1.25, div: 0.01 },
  { n: 'Telecom – Mobile', g: 'tech', icon: '📶', c: '#0ea5b7', growth: 0.04, vol: 0.02, beta: 1.0, div: 0.025 },
  { n: 'Telecom – Internet', g: 'tech', icon: '🌐', c: '#2f7cf6', growth: 0.05, vol: 0.02, beta: 1.05, div: 0.02 },
  { n: 'Finance – Banking', g: 'finance', icon: '🏦', c: '#12a150', growth: 0.04, vol: 0.02, beta: 1.0, div: 0.04 },
  { n: 'Finance – Investment', g: 'finance', icon: '📈', c: '#12a150', growth: 0.05, vol: 0.024, beta: 1.15, div: 0.03 },
  { n: 'Insurance', g: 'finance', icon: '🛡️', c: '#374151', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.04 },
  { n: 'Professional – Legal & Accounting', g: 'finance', icon: '⚖️', c: '#6b7280', growth: 0.03, vol: 0.014, beta: 0.8, div: 0.035 },
  { n: 'Professional – Consulting', g: 'finance', icon: '💼', c: '#6b7280', growth: 0.04, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Marketing & Advertising', g: 'finance', icon: '📣', c: '#ff6b2c', growth: 0.04, vol: 0.02, beta: 1.0, div: 0.025 },
  { n: 'Space & Satellites', g: 'tech', icon: '🛰️', c: '#111827', growth: 0.06, vol: 0.026, beta: 1.2, div: 0.01 },
  { n: 'Cybersecurity', g: 'tech', icon: '🔒', c: '#e5484d', growth: 0.08, vol: 0.024, beta: 1.2, div: 0.01 },
];
const LEADER_SECTOR_BY_NAME = {};
LEADER_SECTORS.forEach(s => { LEADER_SECTOR_BY_NAME[s.n] = s; });

// Expand SECTORS (old 5) with the 78, so companyWeek / locEconomics /
// fleetEconomics work for any leader sector. Loc/fleet templates are by
// group: transport sectors get a fleet, others get a location template.
(function expandSectors() {
  if (typeof SECTORS === 'undefined') return;
  const locFor = g => g === 'food' || g === 'service' ? { name: 'Shop', mode: 'traffic', capture: 0.08, ticket: 40, cogs: 0.5, throughput: 200, wage: 700, staff: 3, buildout: 120000 }
    : g === 'transport' ? { name: 'Depot', mode: 'size', perStaff: 1500, wage: 850, staffPerSize: 8, buildout: 200000 }
    : { name: 'Office', mode: 'size', perStaff: 2500, wage: 1300, staffPerSize: 10, buildout: 240000 };
  const fleetFor = n => n === 'Airlines – Passenger' || n === 'Airlines – Cargo' ? SECTORS.Airline.fleet
    : n === 'Shipping – Freight' || n === 'Shipping – Passenger' ? SECTORS.Shipping.fleet
    : n === 'Oil Extraction' || n === 'Oil Refining & Fuels' ? SECTORS.Energy.fleet : null;
  LEADER_SECTORS.forEach(s => {
    if (SECTORS[s.n]) return;
    SECTORS[s.n] = { icon: s.icon, color: s.c, pe: 16, growth: s.growth, vol: s.vol, beta: s.beta, div: s.div,
      tag: s.n + '.', products: [s.n], loc: locFor(s.g), fleet: fleetFor(s.n) };
    if (typeof SUFFIX !== 'undefined' && !SUFFIX[s.n]) SUFFIX[s.n] = [' Co.', ' Group', ' Industries', ' Ltd.', ' Corp.'];
  });
})();

// ---------- realism sector picking ----------
// Candidate pool per country: domestic sectors first, then specialisations.
// Randomness is only which 2–3 from the pool, never a random sector globally.
const LEADER_SPECIAL = {
  TWN: ['Semiconductors', 'Electronics – Components', 'Consumer Electronics'],
  KOR: ['Semiconductors', 'Vehicles – Cars & Trucks', 'Consumer Electronics'],
  JPN: ['Vehicles – Cars & Trucks', 'Machinery – Industrial', 'Robotics & Automation'],
  DEU: ['Vehicles – Cars & Trucks', 'Machinery – Industrial', 'Chemicals – Basic'],
  CHN: ['Textiles', 'Consumer Electronics', 'Semiconductors', 'Steel Production'],
  USA: ['Software & AI', 'Semiconductors', 'Finance – Banking', 'Aerospace'],
  GBR: ['Finance – Banking', 'Pharmaceuticals', 'Professional – Consulting'],
  CHE: ['Finance – Banking', 'Pharmaceuticals', 'Professional – Legal & Accounting'],
  SAU: ['Oil Extraction', 'Oil Refining & Fuels', 'Chemicals – Basic'],
  RUS: ['Oil Extraction', 'Natural Gas', 'Mining – Metals'],
  QAT: ['Natural Gas', 'Oil Extraction', 'Chemicals – Basic'],
  NGA: ['Oil Extraction', 'Crop Farming', 'Mining – Non-metals'],
  AUS: ['Mining – Metals', 'Crop Farming', 'Tourism Services'],
  CHL: ['Mining – Metals', 'Crop Farming', 'Fishing & Aquaculture'],
  BRA: ['Crop Farming', 'Livestock Farming', 'Mining – Metals'],
  ARG: ['Crop Farming', 'Livestock Farming', 'Food Processing'],
  UKR: ['Crop Farming', 'Steel Production', 'Food Processing'],
  IND: ['Textiles', 'Software & AI', 'Pharmaceuticals'],
  BGD: ['Textiles', 'Apparel & Footwear', 'Crop Farming'],
  VNM: ['Textiles', 'Consumer Electronics', 'Crop Farming'],
  MEX: ['Vehicles – Cars & Trucks', 'Consumer Electronics', 'Tourism Services'],
  CAN: ['Oil Extraction', 'Mining – Metals', 'Forestry & Timber'],
  NOR: ['Oil Extraction', 'Natural Gas', 'Fishing & Aquaculture'],
  SGP: ['Semiconductors', 'Finance – Banking', 'Shipping – Freight'],
  NLD: ['Semiconductors', 'Chemicals – Basic', 'Logistics & Warehousing'],
  ISR: ['Software & AI', 'Cybersecurity', 'Pharmaceuticals'],
  FRA: ['Aerospace', 'Tourism Services', 'Pharmaceuticals'],
  ITA: ['Vehicles – Cars & Trucks', 'Tourism Services', 'Apparel & Footwear'],
  ESP: ['Tourism Services', 'Crop Farming', 'Vehicles – Cars & Trucks'],
  IRQ: ['Oil Extraction', 'Natural Gas'],
  IRN: ['Oil Extraction', 'Natural Gas'],
  VEN: ['Oil Extraction'],
  ARE: ['Oil Extraction', 'Natural Gas'],
  KWT: ['Oil Extraction'],
  LBY: ['Oil Extraction'],
  DZA: ['Natural Gas', 'Oil Extraction'],
  AZE: ['Oil Extraction', 'Natural Gas'],
  KAZ: ['Oil Extraction', 'Mining – Metals'],
  ZAF: ['Mining – Metals', 'Crop Farming'],
  THA: ['Tourism Services', 'Food Processing'],
  MYS: ['Consumer Electronics', 'Semiconductors'],
  IDN: ['Mining – Metals', 'Crop Farming'],
  PHL: ['Consumer Electronics', 'Tourism Services'],
  POL: ['Vehicles – Cars & Trucks', 'Food Processing'],
  TUR: ['Textiles', 'Tourism Services'],
  EGY: ['Natural Gas', 'Tourism Services'],
  COL: ['Oil Extraction', 'Crop Farming'],
  PER: ['Mining – Metals', 'Crop Farming'],
  UZB: ['Natural Gas', 'Mining – Metals'],
  TKM: ['Natural Gas'],
  BHR: ['Oil Extraction', 'Finance – Banking'],
  OMN: ['Oil Extraction', 'Natural Gas'],
  BRN: ['Oil Extraction', 'Natural Gas'],
};
const LEADER_MUST = {
  RUS: ['Oil Extraction', 'Natural Gas'],
  SAU: ['Oil Extraction', 'Natural Gas'],
  QAT: ['Natural Gas', 'Oil Extraction'],
  NOR: ['Oil Extraction', 'Natural Gas'],
  IRQ: ['Oil Extraction'],
  IRN: ['Oil Extraction', 'Natural Gas'],
  VEN: ['Oil Extraction'],
  ARE: ['Oil Extraction', 'Natural Gas'],
  KWT: ['Oil Extraction'],
  LBY: ['Oil Extraction'],
  DZA: ['Natural Gas', 'Oil Extraction'],
  AZE: ['Oil Extraction', 'Natural Gas'],
  KAZ: ['Oil Extraction', 'Mining – Metals'],
  NGA: ['Oil Extraction'],
  CAN: ['Oil Extraction', 'Mining – Metals'],
  AUS: ['Mining – Metals'],
  CHL: ['Mining – Metals'],
  ZAF: ['Mining – Metals'],
  BRA: ['Crop Farming'],
  TWN: ['Semiconductors'],
  KOR: ['Semiconductors', 'Vehicles – Cars & Trucks'],
  JPN: ['Vehicles – Cars & Trucks', 'Machinery – Industrial'],
  DEU: ['Vehicles – Cars & Trucks', 'Machinery – Industrial'],
  CHN: ['Consumer Electronics', 'Textiles'],
  USA: ['Software & AI', 'Semiconductors'],
  GBR: ['Finance – Banking'],
  CHE: ['Finance – Banking', 'Pharmaceuticals'],
  SGP: ['Semiconductors', 'Finance – Banking'],
  NLD: ['Semiconductors'],
  ISR: ['Software & AI', 'Cybersecurity'],
  FRA: ['Aerospace'],
  ITA: ['Tourism Services'],
  ESP: ['Tourism Services'],
  IND: ['Software & AI'],
  BGD: ['Textiles'],
  VNM: ['Textiles', 'Consumer Electronics'],
  MEX: ['Vehicles – Cars & Trucks'],
  UKR: ['Crop Farming'],
  ARG: ['Crop Farming'],
  THA: ['Tourism Services'],
  MYS: ['Consumer Electronics'],
  IDN: ['Mining – Metals'],
};
function mustHaveForCountry(a3) { return (LEADER_MUST[a3] || []).filter(n => LEADER_SECTOR_BY_NAME[n]); }
function sectorPoolForCountry(k) {
  const pool = [];
  mustHaveForCountry(k.a3).forEach(n => pool.push(n));
  pool.push('Retail – Grocery', 'Construction – Residential', 'Food Processing');
  const gdpPc = k.gdp0 * 1e6 / Math.max(1, k.pop0);
  if (LEADER_SPECIAL[k.a3]) pool.push(...LEADER_SPECIAL[k.a3]);
  if (k.coastal) pool.push('Fishing & Aquaculture', 'Shipping – Freight', 'Ports & Airports Services');
  else pool.push('Rail Transport', 'Road Transport & Trucking');
  if (gdpPc > 30000) pool.push('Software & AI', 'Finance – Banking', 'Professional – Consulting');
  else if (gdpPc > 10000) pool.push('Machinery – Industrial', 'Consumer Electronics');
  else pool.push('Crop Farming', 'Textiles', 'Apparel & Footwear');
  if (k.wealth > 1.2) pool.push('Data Centers & Cloud', 'Pharmaceuticals');
  if (k.wealth < 0.6) pool.push('Livestock Farming', 'Mining – Non-metals');
  // Dedupe, keep order, only sectors that exist.
  const out = []; pool.forEach(n => { if (LEADER_SECTOR_BY_NAME[n] && !out.includes(n)) out.push(n); });
  return out;
}
function inheritDifficulty(k) {
  const gdpPc = k.gdp0 * 1e6 / Math.max(1, k.pop0);
  if (k.gdp0 > 1e6) return 'Powerful';
  if (gdpPc > 20000) return 'Stable';
  if (gdpPc > 5000) return 'Developing';
  return 'Struggling';
}

// ---------- extra businesses (economic units, not full shop companies) ----------
// Flagship companies (S.co) stay full companies. Extras are real economic
// businesses: they earn, pay tax, employ people, and affect the country.
// They are NOT separate stocks in Markets yet — that is the next step, and
// it is stated as a limit, not hidden. Their value/profit/tax are real and
// flow into the leader economy below.
function makeExtraBusiness(k, sector, usedNames, usedSyms, idx) {
  const info = LEADER_SECTOR_BY_NAME[sector] || { growth: 0.03, vol: 0.02, icon: '🏢', c: '#374151' };
  let brand; do { brand = pick(BRAND_A) + pick(BRAND_B); } while (usedNames.has(brand)); usedNames.add(brand);
  const name = brand + pick(SUFFIX[sector] || [' Co.']);
  const gdpDollars = k.gdp0 * 1e6;
  const value = Math.max(1e6, gdpDollars * 0.008 / 3 * (0.7 + rand() * 0.6));
  return { id: k.a3 + '-' + idx, a3: k.a3, sector, name, sym: tickerFor(brand, usedSyms),
    icon: info.icon, color: info.c, value, revenue: value * 0.12, profit: value * 0.012,
    employees: Math.max(10, Math.round(value / Math.max(5000, gdpDollars / Math.max(1, k.pop0)) / 8)),
    tax: 0, week: { profit: 0, tax: 0, rev: 0 }, rating: 3.4 + rand() * 0.5 };
}
function businessesInCountry(a3) {
  const out = [];
  if (S.co[a3]) out.push(S.co[a3]);
  if (S.extra) Object.values(S.extra).forEach(b => { if (b.a3 === a3) out.push(b); });
  return out;
}

// ---------- leader economy, straight accounting ----------
// Called weekly from businessWeek (see stepDay hook in ui.js / world-events).
// For every country:
//   revenue = corporate tax (flagship + extras) + income tax + VAT + trade tax
//   spending = pay people (wages) + services + military upkeep + debt interest
//   treasury += revenue - spending
//   if treasury < 0: debt += -treasury, treasury = 0, stability falls
// Home treasury is S.cash, so player spending (military, projects,
// diplomacy) already deducted from S.cash is counted once: we sync
// treasury from S.cash at the start of the home week, then add the net.
function leaderWeek() {
  if (!S || !S.leader) return;
  let homeRev = 0, homeSpend = 0, homeTrade = 0;
  for (const a3 in S.countries) {
    const cs = S.countries[a3], k = W.byA3[a3]; if (!k) continue;
    if (cs.treasury == null) cs.treasury = cs.gdp * 1e6 * 0.05;
    if (cs.debt == null) cs.debt = cs.gdp * 1e6 * 0.54;
    if (a3 === S.home) cs.treasury = S.cash;
    const gdpDollars = cs.gdp * 1e6;
    // Corporate tax: flagship week.tax + extras week.tax (computed below).
    let corpTax = 0;
    const flag = S.co[a3]; if (flag && flag.week) corpTax += flag.week.tax || 0;
    // Extras: simple weekly simulation, straight: profit -> tax -> treasury.
    if (S.extra) Object.values(S.extra).forEach(b => {
      if (b.a3 !== a3) return;
      const info = LEADER_SECTOR_BY_NAME[b.sector] || { growth: 0.03, vol: 0.02 };
      // Weekly profit = value * annual return / 52, with sector growth and noise.
      b.profit = b.value * (0.06 + info.growth) / 52 * (0.7 + rand() * 0.6);
      b.revenue = Math.max(0, b.profit / 0.15);
      b.tax = Math.max(0, b.profit) * cs.tax;
      b.week = { profit: Math.round(b.profit), tax: Math.round(b.tax), rev: Math.round(b.revenue) };
      b.value = Math.max(1e5, b.value + b.profit * 0.5);
      corpTax += b.tax;
    });
    const weeklyGdp = gdpDollars / 52;
    const incomeTax = weeklyGdp * 0.5 * (cs.incTax || 0.20);
    const vat = weeklyGdp * 0.6 * (cs.vat || 0.05);
    const tradeVol = weeklyGdp * 0.2;
    const tradeTax = tradeVol * 0.04;
    // Trade balance is NOT invented here: at this aggregated scale, export
    // and import values already flow through business revenues. The
    // government part of trade is the tax above. Bilateral trade
    // (who trades with whom) is the next step, not shipped yet.
    const revenue = corpTax + incomeTax + vat + tradeTax;
    const payPeople = weeklyGdp * 0.08;
    const services = weeklyGdp * 0.06;
    let milUpkeep = 0;
    if (typeof MILITARY !== 'undefined') for (const br in MILITARY) { const lv = (cs.milLv && cs.milLv[br]) || 0; if (lv > 0) milUpkeep += MILITARY[br].cost[lv] * 0.02 / 52; }
    const rate = 0.04 + (cs.debt / Math.max(1, gdpDollars)) * 0.02;
    const interest = cs.debt * rate / 52;
    const spending = payPeople + services + milUpkeep + interest;
    const net = revenue - spending;
    cs.treasury += net;
    cs.lastWeek = { revenue: Math.round(revenue), corpTax: Math.round(corpTax), incomeTax: Math.round(incomeTax), vat: Math.round(vat), tradeTax: Math.round(tradeTax), payPeople: Math.round(payPeople), services: Math.round(services), milUpkeep: Math.round(milUpkeep), interest: Math.round(interest), spending: Math.round(spending), net: Math.round(net), debt: Math.round(cs.debt), treasury: Math.round(cs.treasury) };
    if (cs.treasury < 0) { const shortfall = -cs.treasury; cs.debt += shortfall; cs.treasury = spending * 0.5; cs.debt += spending * 0.5; cs.stab = clamp(cs.stab - 0.1, 0, 100); }
    else if (cs.treasury > gdpDollars * 0.1) cs.stab = clamp(cs.stab + 0.05, 0, 100);
    if (a3 === S.home) { S.cash = cs.treasury; homeRev = revenue; homeSpend = spending; }
  }
  S.week = S.week || {};
  S.week.leader = { revenue: Math.round(homeRev), spending: Math.round(homeSpend) };
}
