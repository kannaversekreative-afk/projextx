// Store businesses — coffee, bakery and burger shops built on a leased
// city lot. Manager, service, products, marketing and finance, all from
// one weekly simulation: customers pay the store, the store pays rent,
// wages, ingredients and campaigns, and the net lands in your cash.
// No sinks, no free money: every dollar has a payer and a recipient.
'use strict';

const STORE_TYPES = {
  coffee: { name: 'Coffee shop', icon: '☕', products: [
    { name: 'Hot Beverage', price: 4.5, cost: 1.1, capture: 0.32 },
    { name: 'Cold Beverage', price: 5.5, cost: 1.4, capture: 0.42 },
    { name: 'Foods', price: 6.0, cost: 2.2, capture: 0.14 } ] },
  bakery: { name: 'Bakery', icon: '🥐', products: [
    { name: 'Bread', price: 5.0, cost: 1.5, capture: 0.35 },
    { name: 'Pastries', price: 4.0, cost: 1.2, capture: 0.40 },
    { name: 'Cakes', price: 28.0, cost: 9.0, capture: 0.08 } ] },
  burger: { name: 'Burger joint', icon: '🍔', products: [
    { name: 'Burgers', price: 9.5, cost: 3.2, capture: 0.38 },
    { name: 'Fries', price: 4.0, cost: 1.0, capture: 0.30 },
    { name: 'Drinks', price: 3.5, cost: 0.8, capture: 0.30 } ] },
};
const STORE_CAMPAIGNS = [
  { id: 'wifi', name: 'Free WIFI', boost: 0.15, cost: 200 },
  { id: 'power', name: 'Desk Power Strip', boost: 0.10, cost: 150 },
  { id: 'ads', name: 'Local Ads', boost: 0.25, cost: 1200 },
  { id: 'loyalty', name: 'Loyalty Card', boost: 0.12, cost: 400 },
];
const STORE_STREETS = ['Harrison St', 'Mission St', 'Market St', '4th St', '5th Ave', 'Main St', 'King St', 'Bay St'];
const MGR_FIRST = ['Amber', 'Priya', 'Marcus', 'Sofia', 'Ken', 'Lena', 'Diego', 'Maya', 'Tom', 'Aisha', 'Felix', 'Nina'];
const MGR_LAST = ['Sato', 'Patel', 'Garcia', 'Kim', 'Weber', 'Costa', 'Ali', 'Novak', 'Smith', 'Tanaka', 'Rossi', 'Larsen'];

function ensureStores() {
  if (!S) return null;
  if (!Array.isArray(S.stores)) S.stores = [];
  if (!Array.isArray(S.loans)) S.loans = [];
  S.stores.forEach(st => {
    if (!st.weeks) st.weeks = [];
    if (!st.campaigns) st.campaigns = [];
    if (!st.delegation) st.delegation = { staffing: true, products: false, marketing: false, troubles: true };
    if (!st.reviews) st.reviews = { overall: 4.0, price: 4.0, product: 4.0, service: 4.0, atmosphere: 4.0, count: 0 };
    st.products.forEach(p => { if (!isFinite(p.sold)) p.sold = 0; if (!isFinite(p.prevSold)) p.prevSold = 0; });
  });
  return S.stores;
}
function makeManager() {
  const r = (a, b) => Math.round(a + rand() * (b - a));
  return { name: pick(MGR_FIRST) + ' ' + pick(MGR_LAST), people: r(45, 97), product: r(40, 95), marketing: r(45, 98), ethics: r(55, 98),
    salary: 60000 + Math.floor(rand() * 8) * 5000, since: yearOf(S.day) };
}
function storeAddress(cityId, lotT) {
  const city = W.cities[cityId];
  return `${100 + (lotT % 900)} ${pick(STORE_STREETS)}, ${city ? city.name : ''}`;
}
function buildStore(cityId, lot, type) {
  ensureStores();
  const def = STORE_TYPES[type || 'coffee']; if (!def) return 'Unknown store type.';
  const lotObj = typeof lot === 'object' ? lot : (cityLots(cityId) || []).find(l => l.t === lot);
  if (!lotObj || lotObj.kind !== 'lease') return 'That lot is not for lease anymore.';
  const rent = lotObj.rent || 2000, deposit = Math.round(rent * 10), buildCost = 25000 + rent * 4;
  const total = deposit + buildCost;
  if (S.cash < total) return `Needs ${fmtMoney(total, true)} (deposit ${fmtMoney(deposit, true)} + fit-out ${fmtMoney(buildCost, true)}).`;
  S.cash -= total;
  const st = { id: uid(), cityId, lotT: lotObj.t, type: type || 'coffee',
    name: def.name + ' · ' + (W.cities[cityId] ? W.cities[cityId].name : ''),
    address: storeAddress(cityId, lotObj.t), rent, footTraffic: lotObj.traffic || 8000,
    manager: makeManager(), staff: 4,
    products: def.products.map(p => ({ name: p.name, price: p.price, cost: p.cost, capture: p.capture, sold: 0, prevSold: 0 })),
    campaigns: [], reviews: { overall: 4.0, price: 4.0, product: 4.0, service: 4.0, atmosphere: 4.0, count: 12 },
    delegation: { staffing: true, products: false, marketing: false, troubles: true },
    weeks: [], totalRev: 0, totalIncome: 0, weeksOpen: 0 };
  S.stores.push(st);
  if (typeof setLot === 'function') setLot(cityId, lotObj.t, 'taken');
  news('Business', `You opened ${st.name} at ${st.address}. Rent ${fmtMoney(rent)}/week.`, W.cities[cityId] ? W.cities[cityId].a3 : S.home);
  return null;
}
function storeById(id) { ensureStores(); return S.stores.find(s => s.id === id); }
function storesInCity(cityId) { ensureStores(); return S.stores.filter(s => s.cityId === cityId); }
function storeMarketShare(st) {
  // Your stores in this city vs a fixed AI baseline for the same area.
  // Baseline is deterministic from city population, not invented sales.
  const city = W.cities[st.cityId], popM = city ? city.pop / 1e6 : 10;
  const aiBase = Math.max(2000, Math.round(popM * 800));
  const mine = storesInCity(st.cityId).reduce((a, s) => a + s.products.reduce((x, p) => x + (p.sold || 0), 0), 0);
  const total = Math.max(1, mine + aiBase);
  const minePct = mine / total;
  return { mine: minePct, ai: 1 - minePct, mineUnits: mine, aiUnits: aiBase };
}
function storesWeek() {
  ensureStores();
  for (const st of S.stores) {
    const m = st.manager, def = STORE_TYPES[st.type] || STORE_TYPES.coffee;
    let boost = 1;
    st.campaigns.forEach(c => { const d = STORE_CAMPAIGNS.find(x => x.id === c.id); if (d) boost += d.boost; });
    const mgrF = 0.75 + (m.product / 100) * 0.5, mktF = 0.8 + (m.marketing / 100) * 0.4;
    const demandBase = st.footTraffic * boost * mgrF * mktF * (0.85 + rand() * 0.3);
    if (st.delegation.staffing) st.staff = clamp(Math.round(demandBase / 900), 2, 14);
    let revenue = 0, cogs = 0;
    st.products.forEach((p, i) => {
      const base = def.products[i] || def.products[0];
      const optimal = base.price, priceF = Math.pow(optimal / Math.max(0.5, p.price), 0.8);
      if (st.delegation.products) p.price = +(p.price + (optimal - p.price) * 0.05).toFixed(2);
      const sold = Math.max(0, Math.round(demandBase * p.capture * priceF * (0.8 + rand() * 0.4)));
      p.prevSold = p.sold; p.sold = sold;
      revenue += sold * p.price; cogs += sold * p.cost;
    });
    const wages = st.staff * 620 + m.salary / 52;
    const campCost = st.campaigns.reduce((a, c) => { const d = STORE_CAMPAIGNS.find(x => x.id === c.id); return a + (d ? d.cost : 0); }, 0);
    const cost = cogs + wages + st.rent + campCost;
    const income = revenue - cost;
    st.campaigns = st.campaigns.map(c => ({ ...c, weeksLeft: c.weeksLeft - 1 })).filter(c => c.weeksLeft > 0);
    const avgPrice = st.products.reduce((a, p) => a + p.price, 0) / st.products.length;
    const optAvg = def.products.reduce((a, p) => a + p.price, 0) / def.products.length;
    st.reviews.price = clamp(5 - (avgPrice / optAvg - 1) * 2.5, 1, 5);
    st.reviews.product = clamp(3 + m.product / 25, 1, 5);
    st.reviews.service = clamp(3 + m.people / 25 - Math.max(0, (demandBase / 900 - st.staff)) * 0.2, 1, 5);
    st.reviews.atmosphere = clamp(3.5 + (st.campaigns.some(c => c.id === 'wifi') ? 0.5 : 0) + (st.campaigns.some(c => c.id === 'power') ? 0.3 : 0), 1, 5);
    st.reviews.overall = +((st.reviews.price + st.reviews.product + st.reviews.service + st.reviews.atmosphere) / 4).toFixed(1);
    st.reviews.count += Math.round(revenue / 400);
    const incomeR = Math.round(income);
    st.weeks.unshift({ rev: Math.round(revenue), income: incomeR });
    if (st.weeks.length > 8) st.weeks.length = 8;
    st.totalRev += revenue; st.totalIncome += incomeR; st.weeksOpen++;
    S.cash += incomeR;
  }
}
function setStorePrice(storeId, idx, price) {
  const st = storeById(storeId); if (!st) return 'Store not found.';
  if (st.delegation.products) return 'Products are delegated to the manager. Turn delegation off to set prices yourself.';
  const p = st.products[idx]; if (!p) return 'Product not found.';
  p.price = clamp(+price || 0, 0.5, 200); return null;
}
function setStoreStaff(storeId, n) {
  const st = storeById(storeId); if (!st) return 'Store not found.';
  if (st.delegation.staffing) return 'Staffing is delegated to the manager. Turn delegation off to set staff yourself.';
  st.staff = clamp(Math.floor(n), 1, 20); return null;
}
function toggleStoreDelegation(storeId, key) {
  const st = storeById(storeId); if (!st) return 'Store not found.';
  if (!(key in st.delegation)) return 'Unknown delegation.';
  st.delegation[key] = !st.delegation[key]; return null;
}
function fireStoreManager(storeId) {
  const st = storeById(storeId); if (!st) return 'Store not found.';
  st.manager = makeManager(); return null;
}
function adjustManagerSalary(storeId, delta) {
  const st = storeById(storeId); if (!st) return 'Store not found.';
  st.manager.salary = clamp(st.manager.salary + delta, 30000, 250000); return null;
}
function startStoreCampaign(storeId, campId) {
  const st = storeById(storeId); if (!st) return 'Store not found.';
  if (st.delegation.marketing) return 'Marketing is delegated to the manager. Turn delegation off to run campaigns yourself.';
  const d = STORE_CAMPAIGNS.find(x => x.id === campId); if (!d) return 'Campaign not found.';
  if (st.campaigns.some(c => c.id === campId)) return 'That campaign is already running.';
  st.campaigns.push({ id: campId, weeksLeft: 8 }); return null;
}
function renameStore(storeId, name) {
  const st = storeById(storeId); if (!st) return 'Store not found.';
  const n = (name || '').trim(); if (!n) return 'Enter a store name.';
  st.name = n; return null;
}
function closeStore(storeId) {
  ensureStores();
  const st = storeById(storeId); if (!st) return 'Store not found.';
  S.stores = S.stores.filter(s => s.id !== storeId);
  if (typeof setLot === 'function') setLot(st.cityId, st.lotT, null);
  return null;
}
// ---------- bank loans ----------
function loanWeeklyPayment(amount, rate, months) {
  const weeks = Math.max(4, Math.round(months * 4.33)), r = rate / 52;
  return Math.round(amount * r / (1 - Math.pow(1 + r, -weeks)));
}
function takeLoan(amount, months) {
  ensureStores();
  amount = Math.floor(amount); months = clamp(Math.floor(months), 6, 60);
  if (!amount || amount < 1000) return 'Enter a loan amount of at least $1,000.';
  if (amount > Math.max(100000, S.cash * 5 + 500000)) return 'That loan is too large for your current position.';
  const rate = 0.065, weekly = loanWeeklyPayment(amount, rate, months);
  S.cash += amount;
  S.loans.push({ id: uid(), amount, rate, months, weeksLeft: Math.max(4, Math.round(months * 4.33)), weekly, paid: 0 });
  news('Bank', `Loan taken: ${fmtMoney(amount, true)} at ${(rate * 100).toFixed(2)}% for ${months} months, ${fmtMoney(weekly)}/week.`, S.home);
  return null;
}
function loansWeek() {
  ensureStores();
  for (const ln of S.loans) {
    const pay = Math.min(ln.weekly, ln.amount - ln.paid + ln.amount * ln.rate / 52 * 0); // principal + interest handled in weekly figure
    S.cash -= ln.weekly; ln.paid += ln.weekly; ln.weeksLeft--;
  }
  const done = S.loans.filter(l => l.weeksLeft <= 0);
  S.loans = S.loans.filter(l => l.weeksLeft > 0);
  done.forEach(l => news('Bank', `Loan of ${fmtMoney(l.amount, true)} is fully repaid.`, S.home));
}
