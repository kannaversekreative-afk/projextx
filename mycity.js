'use strict';
// Your city — a personal city in your original (home) country, marked
// on the map with a circle and a star in it. It is yours, not the
// capital, and it is end-game: everything here costs a lot, on purpose.
// Buy houses, cars, a bank and a trading firm, and customise the city
// itself (name, motto, theme — those are free, the buildings are not).
//
// Pricing, by design: prices scale with how good the home country is.
// A rich, high-GDP country charges far more than a poor one, and the
// top tiers in the best countries run into the trillions. That is the
// point — this is what you spend a late-game fortune on.
var MYCITY_THEMES = [
  { id: 'classic', name: 'Classic', color: '#2f7cf6', bg: '#eaf2ff' },
  { id: 'modern', name: 'Modern', color: '#111827', bg: '#eef2f7' },
  { id: 'green', name: 'Green', color: '#12a150', bg: '#e6f4ea' },
  { id: 'future', name: 'Futuristic', color: '#7c4dff', bg: '#efeaff' },
  { id: 'historic', name: 'Historic', color: '#b45309', bg: '#fdf0e0' },
];
// Base prices in dollars, before the country multiplier. The multiplier
// is the country's wealth (0.22–2.3 from world.js), squared, so the best
// countries are several times pricier than the poorest — and the top
// house in a top country lands in the trillions.
var MYCITY_HOUSES = [
  { id: 'flat', name: 'City flat', icon: '🏠', base: 250000 },
  { id: 'house', name: 'Family house', icon: '🏡', base: 2500000 },
  { id: 'villa', name: 'Villa', icon: '🏘️', base: 25000000 },
  { id: 'mansion', name: 'Mansion', icon: '🏰', base: 400000000 },
  { id: 'estate', name: 'Grand estate', icon: '🏯', base: 8000000000 },
  { id: 'palace', name: 'Palace', icon: '👑', base: 500000000000 },
];
var MYCITY_CARS = [
  { id: 'sedan', name: 'Sedan', icon: '🚗', base: 40000 },
  { id: 'suv', name: 'SUV', icon: '🚙', base: 90000 },
  { id: 'sports', name: 'Sports car', icon: '🏎️', base: 350000 },
  { id: 'super', name: 'Supercar', icon: '🚘', base: 3000000 },
  { id: 'hyper', name: 'Hypercar collection', icon: '✨', base: 150000000 },
];
var MYCITY_LAND = [
  { id: 'plot', name: 'City plot', icon: '🟫', base: 500000 },
  { id: 'farm', name: 'Farmland', icon: '🌾', base: 50000000 },
  { id: 'ranch', name: 'Ranch estate', icon: '🐄', base: 2000000000 },
  { id: 'island', name: 'Private island land', icon: '🏝️', base: 400000000000 },
  { id: 'empire', name: 'Farmland empire', icon: '🌾👑', base: 300000000000 },
];
function myCityWealth() {
  const k = W.byA3[S.home];
  return k && k.wealth ? k.wealth : 1;
}
function myCityMult() { const w = myCityWealth(); return w * w; }
function myCityPrice(base) { return Math.round(base * myCityMult() / 1000) * 1000; }
function ensureMyCity() {
  if (!S.myCity) S.myCity = { name: '', motto: '', theme: 'classic', houses: [], cars: [], land: [], bank: 0, firm: 0 };
  const m = S.myCity;
  if (!m.houses) m.houses = []; if (!m.cars) m.cars = []; if (!m.land) m.land = [];
  if (m.bank == null) m.bank = 0; if (m.firm == null) m.firm = 0;
  if (!m.name) m.name = 'Your City';
  return m;
}
function myCityExists() { return !!(S && S.myCity); }
// Map position of the star city: just beside the home capital, in map
// units, so it sits inside the home country on every zoom.
function myCityPos() {
  if (!S || !W || !W.byA3[S.home]) return null;
  const cap = W.cities[W.byA3[S.home].capital]; if (!cap) return null;
  return { x: cap.x + 22, y: cap.y - 18, lat: cap.lat, lon: cap.lon };
}
function myCityValue() {
  const m = ensureMyCity(); let v = 0;
  m.houses.forEach(id => { const h = MYCITY_HOUSES.find(x => x.id === id); if (h) v += myCityPrice(h.base); });
  m.cars.forEach(id => { const c = MYCITY_CARS.find(x => x.id === id); if (c) v += myCityPrice(c.base); });
  m.land.forEach(id => { const l = MYCITY_LAND.find(x => x.id === id); if (l) v += myCityPrice(l.base); });
  if (m.bank) v += myCityPrice(500000000) * m.bank;
  if (m.firm) v += myCityPrice(1000000000) * m.firm;
  return v;
}
function myCityBuy(kind, id) {
  const m = ensureMyCity();
  if (kind === 'bank' || kind === 'firm') {
    const base = kind === 'bank' ? 500000000 : 1000000000;
    const level = m[kind] + 1, cost = myCityPrice(base) * level;
    if (S.cash < cost) return `Costs ${fmtMoney(cost, true)}.`;
    S.cash -= cost; m[kind] = level;
    return null;
  }
  const list = kind === 'house' ? MYCITY_HOUSES : kind === 'car' ? MYCITY_CARS : MYCITY_LAND;
  const item = list.find(x => x.id === id); if (!item) return 'Not for sale.';
  const owned = kind === 'house' ? m.houses : kind === 'car' ? m.cars : m.land;
  if (owned.includes(id)) return 'You already own that.';
  const cost = myCityPrice(item.base);
  if (S.cash < cost) return `Costs ${fmtMoney(cost, true)}.`;
  S.cash -= cost; owned.push(id);
  return null;
}
// Weekly income from your city: bank pays interest on its level,
// trading firm pays a cut of your trading. Small vs the price —
// this city is for owning, not for farming cash.
function myCityWeek() {
  if (!S || !S.myCity) return;
  const m = S.myCity;
  if (m.bank) S.cash += myCityPrice(500000000) * m.bank * 0.001;
  if (m.firm) S.cash += myCityPrice(1000000000) * m.firm * 0.0015;
}
