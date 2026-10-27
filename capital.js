'use strict';
// Capital customization — thought through, not just sliders.
// Your capital is your seat of power. You start with it as it is today:
// its real name, a Classic theme, Government at level 1, everything else
// at level 0. You build it up over years, not in one sitting, because
// costs scale with your country's GDP, so a small country and the USA
// both feel the same pressure, just at different scales.
// 
// Districts (6), each level 0-5:
//  Government 🏛️ — stability. +0.3 stability/week per level.
//  Commerce 🏢 — trade and shops. Weekly cash = GDP x 0.00002 x level.
//  Culture 🎭 — museums, festivals. Population grows +0.02%/week per level.
//  Defence 🪖 — barracks, HQ. +5% war power per level (in milPower).
//  Green 🌳 — parks, clean air. +0.15 stability/week per level.
//  Transport 🚉 — stations, roads. Weekly cash = trade volume x 1% x level.
// Prestige = average district level, shown as stars. At 5 stars your
// capital is a world capital: a small weekly bonus on top of the rest.
// Renaming and theme/motto are free — they are yours, not a purchase.
// Theme changes the capital panel and skyline, not the map, so the map
// stays readable for everyone else.
var CAPITAL_DISTRICTS = [
  { id: 'gov', name: 'Government', icon: '🏛️', desc: 'Parliament, courts, civil service. Keeps the country steady.', bonus: 'Stability +0.3 / week per level' },
  { id: 'com', name: 'Commerce', icon: '🏢', desc: 'Markets, offices, trade halls. Pays cash every week.', bonus: 'Cash every week, scales with GDP' },
  { id: 'cul', name: 'Culture', icon: '🎭', desc: 'Museums, theatres, festivals. People want to live here.', bonus: 'Population +0.02% / week per level' },
  { id: 'def', name: 'Defence', icon: '🪖', desc: 'Barracks, HQ, training grounds. Your army hits harder.', bonus: 'War power +5% per level' },
  { id: 'green', name: 'Green', icon: '🌳', desc: 'Parks, clean air, rivers. Calmer, healthier city.', bonus: 'Stability +0.15 / week per level' },
  { id: 'trans', name: 'Transport', icon: '🚉', desc: 'Stations, roads, airports. Trade flows faster.', bonus: 'Trade cash every week per level' },
];
var CAPITAL_THEMES = [
  { id: 'classic', name: 'Classic', color: '#2f7cf6', bg: '#eaf2ff', desc: 'Marble, columns, blue and gold.' },
  { id: 'modern', name: 'Modern', color: '#111827', bg: '#eef2f7', desc: 'Glass towers, clean lines.' },
  { id: 'green', name: 'Green', color: '#12a150', bg: '#e6f4ea', desc: 'Parks everywhere, living roofs.' },
  { id: 'future', name: 'Futuristic', color: '#7c4dff', bg: '#efeaff', desc: 'Neon, sleek, a little sci-fi.' },
  { id: 'historic', name: 'Historic', color: '#b45309', bg: '#fdf0e0', desc: 'Brick, cobbles, old streets kept.' },
];
function ensureCapital() {
  if (!S.capital) {
    const cap = W.cities[W.byA3[S.home].capital];
    S.capital = { name: cap ? cap.name : cname(S.home), motto: '', theme: 'classic', districts: { gov: 1, com: 0, cul: 0, def: 0, green: 0, trans: 0 } };
  }
  if (!S.capital.districts) S.capital.districts = { gov: 1, com: 0, cul: 0, def: 0, green: 0, trans: 0 };
  return S.capital;
}
function capitalPrestige() {
  const cap = ensureCapital(); const vals = CAPITAL_DISTRICTS.map(d => cap.districts[d.id] || 0);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
function capitalCost(districtId) {
  const cap = ensureCapital(); const L = cap.districts[districtId] || 0;
  if (L >= 5) return null;
  const gdpDollars = Math.max(1e9, country(S.home).gdp * 1e6);
  return Math.round(gdpDollars * 0.0002 * Math.pow(L + 1, 2) / 1e5) * 1e5;
}
function upgradeCapital(districtId) {
  if (!S.leader) return 'Capital building is for leader games.';
  const cap = ensureCapital(); const L = cap.districts[districtId] || 0;
  if (L >= 5) return 'Already at level 5.';
  const cost = capitalCost(districtId);
  const cs = country(S.home);
  if ((cs.treasury || 0) < cost) return `Costs ${fmtMoney(cost, true)}.`;
  cs.treasury -= cost; cap.districts[districtId] = L + 1; S.xp += 100;
  return null;
}
function applyCapitalName() {
  if (!S || !S.capital || !S.capital.name) return;
  const k = W.byA3[S.home]; if (!k || k.capital == null) return;
  const cap = W.cities[k.capital]; if (cap) cap.name = S.capital.name;
}
function capitalWeek() {
  if (!S || !S.leader) return;
  const cap = ensureCapital(); const cs = country(S.home); const gdpDollars = cs.gdp * 1e6;
  const gov = cap.districts.gov || 0, green = cap.districts.green || 0, cul = cap.districts.cul || 0, com = cap.districts.com || 0, trans = cap.districts.trans || 0;
  cs.stab = clamp(cs.stab + gov * 0.3 + green * 0.15, 0, 100);
  if (cul) cs.pop *= 1 + cul * 0.0002;
  let cash = 0;
  if (com) cash += gdpDollars * 0.00002 * com;
  if (trans) cash += gdpDollars * 0.2 * 0.04 * 0.01 * trans / 1; // trade volume x 1% per level, weekly
  const prestige = capitalPrestige();
  if (prestige >= 4.5) cash += gdpDollars * 0.00001;
  if (cash) { cs.treasury += cash; }
}
function capitalSkyline() {
  const cap = ensureCapital();
  return CAPITAL_DISTRICTS.map(d => {
    const L = cap.districts[d.id] || 0;
    return L ? d.icon.repeat(Math.max(1, Math.ceil(L / 2))) : '·';
  }).join(' ');
}
