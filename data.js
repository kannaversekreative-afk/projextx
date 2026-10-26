// Static game data. Countries and capitals are real (see world-data.js);
// companies, people and events are fictional.
'use strict';

const START_YEAR = 2026;
const NORMAL_YEARS = 100;

// Five sectors, 39 companies each (195 countries). Every company leases
// locations in its capital; airlines, shipping and energy also run a fleet
// that shows on the world map as one vehicle that grows with each upgrade.
const SECTORS = {
  Airline: { icon: '✈️', color: '#2f7cf6', pe: 14, growth: 0.04, vol: 0.022, beta: 1.3, div: 0.01,
    tag: 'Fly further for less.', products: ['Economy', 'Premium economy', 'Business class', 'Lounge pass'],
    loc: { name: 'Ticket office', mode: 'traffic', capture: 0.016, ticket: 210, cogs: 0.55, throughput: 90, wage: 760, staff: 3, buildout: 140000 },
    fleet: { kind: 'plane', levels: [
      { name: 'No aircraft' }, { name: 'Turboprop', cost: 6e6, gross: 115e3, opex: 80e3 }, { name: 'Regional jet', cost: 22e6, gross: 400e3, opex: 270e3 },
      { name: 'Narrow-body jet', cost: 80e6, gross: 1.3e6, opex: 0.9e6 }, { name: 'Long-range jet', cost: 210e6, gross: 3.1e6, opex: 2.15e6 },
      { name: 'Wide-body jet', cost: 560e6, gross: 7.8e6, opex: 5.4e6 }, { name: 'Superjumbo', cost: 1.4e9, gross: 18e6, opex: 12.4e6 }] } },
  Shipping: { icon: '\u{1F6A2}', color: '#0ea5b7', pe: 10, growth: 0.03, vol: 0.022, beta: 1.15, div: 0.035,
    tag: 'Moving the world, one box at a time.', products: ['Container freight', 'Port logistics', 'Cold chain', 'Express sea'],
    loc: { name: 'Warehouse', mode: 'size', perStaff: 1350, wage: 880, staffPerSize: 8, buildout: 220000 },
    fleet: { kind: 'container', levels: [
      { name: 'No ships' }, { name: 'Feeder ship', cost: 8e6, gross: 140e3, opex: 95e3 }, { name: 'Panamax', cost: 30e6, gross: 480e3, opex: 320e3 },
      { name: 'Post-Panamax', cost: 95e6, gross: 1.45e6, opex: 1.0e6 }, { name: 'Neo-Panamax', cost: 240e6, gross: 3.5e6, opex: 2.4e6 },
      { name: 'Mega container ship', cost: 620e6, gross: 8.6e6, opex: 5.9e6 }, { name: 'Ultra-large fleet', cost: 1.5e9, gross: 19.5e6, opex: 13.4e6 }] } },
  Energy: { icon: '⛽', color: '#e0812b', pe: 11, growth: 0.025, vol: 0.02, beta: 0.9, div: 0.045,
    tag: 'Powering homes, cars and cities.', products: ['Fuel', 'Electricity', 'Home heating', 'EV charging'],
    loc: { name: 'Fuel station', mode: 'traffic', capture: 0.035, ticket: 48, cogs: 0.74, throughput: 260, wage: 600, staff: 3, buildout: 180000 },
    fleet: { kind: 'tanker', levels: [
      { name: 'No tankers' }, { name: 'Coastal tanker', cost: 9e6, gross: 150e3, opex: 100e3 }, { name: 'Aframax', cost: 32e6, gross: 500e3, opex: 335e3 },
      { name: 'Suezmax', cost: 100e6, gross: 1.5e6, opex: 1.03e6 }, { name: 'Supertanker', cost: 250e6, gross: 3.6e6, opex: 2.45e6 },
      { name: 'Tanker fleet', cost: 640e6, gross: 8.9e6, opex: 6.1e6 }, { name: 'Global energy fleet', cost: 1.55e9, gross: 20e6, opex: 13.7e6 }] } },
  Tech: { icon: '\u{1F4BB}', color: '#7c4dff', pe: 28, growth: 0.09, vol: 0.024, beta: 1.3, div: 0,
    tag: 'Software that just works.', products: ['Cloud', 'Mobile apps', 'Cybersecurity', 'AI assistant'],
    loc: { name: 'Office', mode: 'size', perStaff: 2900, wage: 1500, staffPerSize: 10, buildout: 260000 }, fleet: null },
  Retail: { icon: '\u{1F6CD}️', color: '#e5484d', pe: 20, growth: 0.04, vol: 0.013, beta: 0.75, div: 0.02,
    tag: 'Everything you love, close to home.', products: ['Groceries', 'Fashion', 'Home goods', 'Coffee bar'],
    loc: { name: 'Store', mode: 'traffic', capture: 0.12, ticket: 9, cogs: 0.32, throughput: 330, wage: 640, staff: 3, buildout: 95000 }, fleet: null },
};
const SECTOR_LIST = Object.keys(SECTORS);
const BRAND_A = ['Vel', 'Aur', 'Nex', 'Cor', 'Zen', 'Lum', 'Ori', 'Tal', 'Vor', 'Kai', 'Sol', 'Bri', 'Cal', 'Dar', 'Elo', 'Fae', 'Hal', 'Ix', 'Jun', 'Kor', 'Mav', 'Nor', 'Pax', 'Qin', 'Rhe', 'Syn', 'Tor', 'Uma', 'Vex', 'Wyn', 'Yar', 'Zor', 'Ast', 'Bel', 'Cyr', 'Dex', 'Gal', 'Hel', 'Ken', 'Lys', 'Mer', 'Oda', 'Pyr', 'Sev', 'Tav', 'Ul', 'Xan', 'Ara'];
const BRAND_B = ['ora', 'ion', 'ex', 'ara', 'ium', 'is', 'on', 'ova', 'yx', 'en', 'ar', 'ia', 'ix', 'eon', 'ana', 'ent', 'ux', 'el', 'ida', 'ost', 'era', 'una'];
const SUFFIX = {
  Airline: [' Air', ' Airways', ' Skyways', ' Airlines', ' Wings'], Shipping: [' Maritime', ' Shipping', ' Ocean Lines', ' Freight', ' Lines'],
  Energy: [' Energy', ' Petroleum', ' Power', ' Fuels', ' Oil & Gas'], Tech: ['soft', ' Systems', ' Labs', 'net', ' Digital', ' AI'],
  Retail: [' Market', ' Stores', ' Retail', ' Mart', ' & Co.'],
};

// Military branches you can fund for your home country. Power multiplies
// the country's base strength in wars; air and navy show on the map.
// Levels run 0-100. Names step up every 10 levels; costs keep the six
// hand-set rungs, then grow 8% a level, so the climb from a real
// starting level (every country starts under 20) to 100 is long and
// expensive — no country starts able to rule the world.
function milTierNames(branch) {
  return { air: ['Trainer jets', 'Fighter squadron', 'Multirole fighters', 'Stealth fighters', 'Air dominance wing', 'Air supremacy wing', 'Aerospace command', 'Global air command', 'Orbital air force', 'World-class air force'],
    navy: ['Patrol boats', 'Frigates', 'Destroyers', 'Submarine fleet', 'Carrier group', 'Carrier strike group', 'Fleet command', 'Blue-water navy', 'Ocean dominance fleet', 'World-class navy'],
    army: ['Militia', 'Infantry', 'Armored brigades', 'Mechanized corps', 'Rapid reaction force', 'Elite corps', 'Special operations command', 'Continental army', 'Superpower force', 'World-class military'] }[branch];
}
function milLevels(branch) {
  const tiers = milTierNames(branch), out = ['None'];
  for (let lv = 1; lv <= 100; lv++) out.push(tiers[Math.floor((lv - 1) / 10)] + ' · Lv ' + lv);
  return out;
}
function milCosts(base) {
  const out = [0];
  for (let lv = 1; lv <= 5; lv++) out.push(base[lv]);
  for (let lv = 6; lv <= 100; lv++) out.push(Math.round(out[lv - 1] * 1.08 / 1e6) * 1e6);
  return out;
}
const MILITARY = {
  air: { name: 'Air force', icon: '✈️', levels: milLevels('air'), cost: milCosts([0, 40e6, 160e6, 600e6, 2.2e9, 7e9]), power: 0.3 },
  navy: { name: 'Navy', icon: '⚓', levels: milLevels('navy'), cost: milCosts([0, 50e6, 200e6, 750e6, 2.5e9, 8e9]), power: 0.25 },
  army: { name: 'Army', icon: '\u{1F6E1}️', levels: milLevels('army'), cost: milCosts([0, 30e6, 120e6, 450e6, 1.6e9, 5e9]), power: 0.35 },
};

// Real starting military levels, from the 2025 Global Firepower
// ranking (145 countries, 60+ factors: manpower, equipment, finance,
// logistics, geography). Rank bands map to levels; every country
// starts under 20 — even the United States, at 19 — so reaching 100,
// and ruling the world, takes a long climb. Countries outside the
// ranked list get a level from their real economy and population,
// capped at 10.
const MIL_REAL = { USA: 19, RUS: 18, CHN: 18, IND: 17, KOR: 16, GBR: 16, FRA: 16, JPN: 16, TUR: 15, ITA: 15, BRA: 15, PAK: 15, IDN: 15, DEU: 15, ISR: 14, IRN: 14, ESP: 14, AUS: 14, EGY: 14, UKR: 14, POL: 13, TWN: 13, VNM: 13, SAU: 13, THA: 13, DZA: 13, SWE: 13, CAN: 13, SGP: 13, GRC: 13, NGA: 12, MEX: 12, ARG: 12, PRK: 12, BGD: 12, NLD: 12, MMR: 12, NOR: 12, PRT: 12 };
function realMilLevel(k) {
  if (!k) return 1;
  if (MIL_REAL[k.a3] != null) return MIL_REAL[k.a3];
  const gdp = Math.max(1, k.gdp0 || k.gdp || 0);
  let lv = 1 + Math.floor(2 * Math.log10(gdp / 1000));
  const pop = k.pop0 || k.pop || 0;
  if (pop >= 50000000) lv += 1;
  if (pop >= 150000000) lv += 1;
  return Math.max(1, Math.min(10, lv));
}

// Websites (the Web tab). Tier sets online sales; ads are weekly spend;
// add-ons are one-time buys.
const WEB_TIERS = [
  { name: 'No website', cost: 0, online: 0, boost: 0, desc: 'Customers can’t find you online.' },
  { name: 'Basic website', cost: 15000, online: 0.12, boost: 0.03, desc: 'Opening hours, locations and a contact page.' },
  { name: 'Online store', cost: 150000, online: 0.55, boost: 0.05, desc: 'Sell online around the clock.' },
  { name: 'Mobile app', cost: 900000, online: 1.3, boost: 0.1, desc: 'Ordering, loyalty points and push offers.' },
  { name: 'Global platform', cost: 6e6, online: 2.8, boost: 0.14, desc: 'Every language, every currency, worldwide shipping.' },
];
const WEB_ADS = [
  { id: 'search', name: 'Search ads', cost: 2500, effect: 0.06, desc: 'Show up first on Seek.' },
  { id: 'social', name: 'Social media ads', cost: 8000, effect: 0.09, desc: 'Reach people while they scroll.' },
  { id: 'influencer', name: 'Influencer deals', cost: 30000, effect: 0.12, desc: 'Creators review your products.' },
  { id: 'tv', name: 'TV commercials', cost: 120000, effect: 0.18, desc: 'Prime-time spots across the country.' },
];
const WEB_ADDONS = [
  { id: 'seo', name: 'Search optimisation', cost: 40000, desc: '+8% online sales and visitors.' },
  { id: 'reviews', name: 'Customer reviews', cost: 60000, desc: '+0.3 rating at every location.' },
  { id: 'security', name: 'Cybersecurity', cost: 250000, desc: 'Stops hackers taking your site down.' },
  { id: 'loyalty', name: 'Loyalty program', cost: 400000, desc: '+8% repeat customers everywhere.' },
];

// How world events hit each sector (immediate price shock).
const EVENT_SECTORS = {
  war:       { all: -0.08, Energy: 0.06, Airline: -0.06, Shipping: -0.04 },
  invasion:  { all: -0.22, Retail: -0.05 },
  liberation: { all: 0.15 },
  peace:     { all: 0.06, Airline: 0.05 },
  unrest:    { all: -0.07 },
  coup:      { all: -0.14 },
  tradeDeal: { all: 0.03, Shipping: 0.05 },
  techBoom:  { Tech: 0.12, all: 0.02 },
  discovery: { Energy: 0.16, all: 0.02 },
  tourism:   { Airline: 0.12, Retail: 0.05 },
  disaster:  { all: -0.05, Retail: -0.03 },
  sanctions: { all: -0.06, Shipping: -0.06 },
  electionGood: { all: 0.04 }, electionBad: { all: -0.05 },
};
const DISASTERS = ['Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Volcanic eruption'];

const PROJECTS = [
  { id: 'housing',   name: 'Affordable housing', cost: 2e6,   years: 8,  pop: 0.004, gdp: 0,     stab: 2,  icon: '\u{1F3D8}️', desc: 'More families can afford to stay and grow.' },
  { id: 'hospitals', name: 'Hospitals',          cost: 5e6,   years: 10, pop: 0.003, gdp: 0.001, stab: 3,  icon: '\u{1F3E5}', desc: 'People live longer and healthier.' },
  { id: 'schools',   name: 'Schools',            cost: 4e6,   years: 12, pop: 0.001, gdp: 0.004, stab: 2,  icon: '\u{1F3EB}', desc: 'A smarter workforce grows the economy.' },
  { id: 'transit',   name: 'Transit network',    cost: 12e6,  years: 12, pop: 0.001, gdp: 0.005, stab: 1,  icon: '\u{1F687}', desc: 'More foot traffic at every location.' },
  { id: 'immigration', name: 'Immigration program', cost: 8e6, years: 6, pop: 0.008, gdp: 0.001, stab: -2, icon: '\u{1F6C2}', desc: 'Attract talent from abroad.' },
  { id: 'space',     name: 'Space program',      cost: 250e6, years: 20, pop: 0.001, gdp: 0.006, stab: 3,  icon: '\u{1F680}', desc: 'National pride and a tech boom.' },
];

const CAREER = [
  { name: 'Startup', goals: [
    { t: 'Open your first location', f: s => locCount(s) >= 1 },
    { t: 'Launch a website', f: s => mine().some(c => c.web.tier >= 1) },
    { t: 'Buy your first stock', f: s => s.stats.trades >= 1 },
    { t: 'Reach $1M net worth', f: s => s.netWorth >= 1e6 }] },
  { name: 'Local Brand', goals: [
    { t: 'Run 5 locations', f: s => locCount(s) >= 5 },
    { t: 'Earn a 4.0★ rating', f: s => s.rating >= 4 && locCount(s) >= 3 },
    { t: 'Own a building', f: s => s.props.length >= 1 },
    { t: 'Reach $5M net worth', f: s => s.netWorth >= 5e6 }] },
  { name: 'National Player', goals: [
    { t: 'Control a second company', f: s => mine().length >= 2 },
    { t: 'Run 12 locations', f: s => locCount(s) >= 12 },
    { t: 'Make $150K profit in one week', f: s => s.stats.bestWeek >= 150000 },
    { t: 'Beat the market', f: s => beatMarket() > 0 && s.day > 180 }] },
  { name: 'Global Company', goals: [
    { t: 'Control 4 companies', f: s => mine().length >= 4 },
    { t: 'Win a takeover or an IPO', f: s => s.stats.takeovers > 0 || s.stats.ipos > 0 },
    { t: 'Own 5 buildings', f: s => s.props.length >= 5 },
    { t: 'Reach $100M net worth', f: s => s.netWorth >= 1e8 }] },
  { name: 'Conglomerate', goals: [
    { t: 'Control 10 companies', f: s => mine().length >= 10 },
    { t: 'Build a global platform website', f: s => mine().some(c => c.web.tier >= 4) },
    { t: 'Make $2M profit in one week', f: s => s.stats.bestWeek >= 2e6 },
    { t: 'Reach $1B net worth', f: s => s.netWorth >= 1e9 }] },
  { name: 'World Power', goals: [
    { t: 'Grow your nation 25%', f: s => popGrowth() >= 0.25 },
    { t: 'Control 25 companies', f: s => mine().length >= 25 },
    { t: 'Beat the market by 2x', f: s => beatMarket() >= 1 },
    { t: 'Reach $10B net worth', f: s => s.netWorth >= 1e10 }] },
];

// Free power-ups. Each can be claimed once per real-world day.
const SHOP = [
  { id: 'cash',   name: 'Cash grant',       icon: '\u{1F4B5}', desc: '+$250K or 2% of net worth, whichever is more' },
  { id: 'rush',   name: 'Rush hour',        icon: '⚡',    desc: 'Double customers at every location for 7 days' },
  { id: 'rating', name: 'Influencer visit', icon: '⭐',    desc: '+1.5 satisfaction at every location, fading over weeks' },
  { id: 'intel',  name: 'Market intel',     icon: '\u{1F50D}', desc: 'Reveals fair value for every stock for 30 days' },
];

const PERSONAS = ['Business travellers', 'Leisure travellers', 'Students', 'Factory workers', 'Families', 'Tech workers', 'Retirees', 'Tourists'];
const LOGO_COLORS = ['#2f7cf6', '#12a150', '#ff6b2c', '#7c4dff', '#e5484d', '#0ea5b7', '#f5b301', '#111827'];
