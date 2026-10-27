// Store businesses — coffee, bakery and burger shops built on a leased
// city lot. Manager, service, products, marketing and finance, all from
// one weekly simulation: customers pay the store, the store pays rent,
// wages, ingredients and campaigns, and the net lands in your cash.
// No sinks, no free money: every dollar has a payer and a recipient.
'use strict';

// Every business a player can start from a BUILD STORE picker.
// Business types are NEVER locked behind a level: a coffee shop can
// out-earn an advanced business early, and profit decides, not a
// gate. `buildout` is the fit-out cost on top of the lot deposit,
// `desc` is the plain-language pitch shown in the picker. Advanced
// sectors (semiconductors, robotics) needing research, time and
// money is a LATER system, not a level lock. A store on its own
// earns modest weekly money — growth comes from developing it
// (levels, products, managers), never from just opening the doors.
const STORE_TYPES = {
  coffee: { name: 'Coffee shop', icon: '☕', buildout: 25000, desc: 'Cheap to open, steady foot traffic, small tickets.', products: [
    { name: 'Hot Beverage', price: 4.5, cost: 1.1, capture: 0.32 },
    { name: 'Cold Beverage', price: 5.5, cost: 1.4, capture: 0.42 },
    { name: 'Foods', price: 6.0, cost: 2.2, capture: 0.14 } ] },
  bakery: { name: 'Bakery', icon: '🥐', buildout: 28000, desc: 'Morning regulars, cakes carry the margin.', products: [
    { name: 'Bread', price: 5.0, cost: 1.5, capture: 0.35 },
    { name: 'Pastries', price: 4.0, cost: 1.2, capture: 0.40 },
    { name: 'Cakes', price: 28.0, cost: 9.0, capture: 0.08 } ] },
  burger: { name: 'Burger joint', icon: '🍔', buildout: 30000, desc: 'High volume, thin margin, needs traffic.', products: [
    { name: 'Burgers', price: 9.5, cost: 3.2, capture: 0.38 },
    { name: 'Fries', price: 4.0, cost: 1.0, capture: 0.30 },
    { name: 'Drinks', price: 3.5, cost: 0.8, capture: 0.30 } ] },
  pizza: { name: 'Pizza place', icon: '🍕', buildout: 35000, desc: 'Families and evenings. Delivery-sized tickets.', products: [
    { name: 'Pizzas', price: 14.0, cost: 4.5, capture: 0.40 },
    { name: 'Sides', price: 6.0, cost: 1.8, capture: 0.30 },
    { name: 'Drinks', price: 3.5, cost: 0.8, capture: 0.28 } ] },
  restaurant: { name: 'Restaurant', icon: '🍽️', buildout: 60000, desc: 'Bigger tickets, bigger wage bill. Needs a good manager.', products: [
    { name: 'Mains', price: 22.0, cost: 7.0, capture: 0.38 },
    { name: 'Starters', price: 9.0, cost: 2.8, capture: 0.30 },
    { name: 'Desserts', price: 8.0, cost: 2.2, capture: 0.22 } ] },
  grocery: { name: 'Grocery store', icon: '🛒', buildout: 90000, desc: 'Everyone shops. Low margin, very high volume in big cities.', products: [
    { name: 'Fresh food', price: 12.0, cost: 8.5, capture: 0.40 },
    { name: 'Pantry', price: 8.0, cost: 5.2, capture: 0.35 },
    { name: 'Household', price: 15.0, cost: 9.5, capture: 0.20 } ] },
  clothing: { name: 'Clothing store', icon: '👕', buildout: 55000, desc: 'Fashion margin, seasonal swings.', products: [
    { name: 'Tops', price: 32.0, cost: 12.0, capture: 0.38 },
    { name: 'Bottoms', price: 45.0, cost: 17.0, capture: 0.32 },
    { name: 'Accessories', price: 18.0, cost: 6.0, capture: 0.25 } ] },
  pharmacy: { name: 'Pharmacy', icon: '💊', buildout: 75000, desc: 'Repeat customers, steady demand in any city.', products: [
    { name: 'Medicine', price: 18.0, cost: 9.0, capture: 0.42 },
    { name: 'Wellness', price: 24.0, cost: 11.0, capture: 0.30 },
    { name: 'Essentials', price: 9.0, cost: 4.0, capture: 0.25 } ] },
  electronics: { name: 'Electronics store', icon: '📱', buildout: 110000, desc: 'Big tickets, but customers compare prices hard.', products: [
    { name: 'Phones', price: 699.0, cost: 520.0, capture: 0.10 },
    { name: 'Accessories', price: 29.0, cost: 10.0, capture: 0.45 },
    { name: 'Audio', price: 89.0, cost: 48.0, capture: 0.25 } ] },
  gym: { name: 'Gym', icon: '🏋️', buildout: 130000, desc: 'Membership money, week after week, if service holds up.', products: [
    { name: 'Membership', price: 39.0, cost: 8.0, capture: 0.45 },
    { name: 'Classes', price: 15.0, cost: 4.0, capture: 0.30 },
    { name: 'Gear', price: 25.0, cost: 11.0, capture: 0.20 } ] },
  salon: { name: 'Salon', icon: '💇', buildout: 45000, desc: 'Loyal clients, skill-driven reviews.', products: [
    { name: 'Cuts', price: 35.0, cost: 8.0, capture: 0.42 },
    { name: 'Colour', price: 65.0, cost: 18.0, capture: 0.30 },
    { name: 'Products', price: 22.0, cost: 9.0, capture: 0.22 } ] },
  bookstore: { name: 'Bookstore', icon: '📚', buildout: 40000, desc: 'Quiet, loyal, and review-sensitive.', products: [
    { name: 'Books', price: 19.0, cost: 10.0, capture: 0.45 },
    { name: 'Stationery', price: 12.0, cost: 5.0, capture: 0.30 },
    { name: 'Cafe corner', price: 6.0, cost: 1.8, capture: 0.22 } ] },
};
const STORE_CAMPAIGNS = [
  { id: 'wifi', name: 'Free WIFI', boost: 0.15, cost: 200, unlock: 1 },
  { id: 'power', name: 'Desk Power Strip', boost: 0.10, cost: 150, unlock: 1 },
  { id: 'ads', name: 'Local Ads', boost: 0.25, cost: 1200, unlock: 10 },
  { id: 'loyalty', name: 'Loyalty Card', boost: 0.12, cost: 400, unlock: 20 },
];
// Logo / icon picker for a business: emoji only, original set, no
// brand marks. Picked in the store panel, shown on the city pin,
// the store list and the panel header.
const STORE_ICONS = ('☕ 🥐 🍔 🍕 🍽️ 🛒 👕 💊 📱 🏋️ 💇 📚 🍩 🧁 🥤 🍦 🍜 🍣 🥩 🥗 🍞 🧀 🥛 🍷 🍺 🌮 🌯 🥪 🍰 🎂 🍪 🛍️ 👗 👠 🧢 👓 ⌚ 💍 👜 🎒 🧴 💄 ✂️ 💈 🧖 🏥 🩺 🦷 👁️ 🐾 🐶 🐱 🌸 💐 🌿 🪴 🛠️ 🔧 🔨 🪛 🎨 🖌️ 🎸 🎹 🎧 📷 🎥 🎮 🧸 ⚽ 🏀 🎳 🎯 🎪 🎬 📖 📰 ✏️ 🖊️ 📎 🗝️ 🔑 💡 🔋 🧲 🧭 🪙 💰 💳 🏦 📦 🚗 🚲 🛵 🏍️ ✈️ 🚀 🛟 ⚓ 🏕️ 🏖️ 🏨 🏠 🏡 🏢 🏬 🏭 ⛽ 🚿 🧺 🧹 🧻 🧼 🪥 🛁 🚽 🪑 🛋️ 🛏️ 🖥️ ⌨️ 🖱️ 🖨️ 📺 📻 🎙️ 📞 ☎️ 📠 🔌 💻 🖲️ 🕹️ 🎲 🧩 ♟️ 🃏 🎰 🎁 🎈 🎉 ✨ ⭐ 🌟 💎 🔮 🧿 🍀 🌈 🔥 💧 ❄️ 🌊 ☀️ 🌙 ⭐').split(' ');
// ---------- Progress: the 1-100 goals / rewards map ----------
// XP comes from doing, never from just owning: building a store,
// developing a product, upgrading a store, and profitable weeks.
// Levels gate what you can start and who you can hire — high-level
// employees are locked until your progress earns them.
function progressXPNeeded(level) { return 100 + (level - 1) * 50; }
function ensureProgress() {
  if (!S) return { xp: 0, level: 1 };
  if (!S.progress || typeof S.progress.xp !== 'number') S.progress = { xp: 0, level: 1 };
  return S.progress;
}
function progressLevel() { return ensureProgress().level; }
function gainXP(n, reason) {
  const p = ensureProgress(); if (!n) return;
  p.xp += n;
  let leveled = false;
  while (p.level < 100 && p.xp >= progressXPNeeded(p.level)) { p.xp -= progressXPNeeded(p.level); p.level++; leveled = true; }
  if (leveled && typeof news === 'function') news('Progress', `You reached Progress Lv ${p.level}. ${progressUnlockText(p.level) || 'Keep going.'}`, S.home);
  return leveled;
}
function progressUnlockText(level) {
  // Business types are deliberately NOT in here: no type is ever
  // locked behind a level. Progress unlocks campaigns, store
  // upgrades and manager levels only.
  const campUnlock = STORE_CAMPAIGNS.filter(c => c.unlock === level).map(c => `${c.name} campaign unlocked`);
  const mgr = { 5: 'Manager Lv 2 unlocked', 15: 'Manager Lv 3 unlocked', 30: 'Manager Lv 4 unlocked', 50: 'Manager Lv 5 unlocked' }[level];
  const up = { 15: 'Store upgrade Lv 2 unlocked', 25: 'Store upgrade Lv 3 unlocked', 45: 'Store upgrade Lv 4 unlocked', 70: 'Store upgrade Lv 5 unlocked' }[level];
  const parts = [...campUnlock];
  if (mgr) parts.push(mgr);
  if (up) parts.push(up);
  return parts.join(' · ');
}
function nextUnlockAfter(level) {
  for (let l = level + 1; l <= 100; l++) { const t = progressUnlockText(l); if (t) return { level: l, text: t }; }
  return null;
}
function maxManagerLevel() { const l = progressLevel(); return l >= 50 ? 5 : l >= 30 ? 4 : l >= 15 ? 3 : l >= 5 ? 2 : 1; }
function storeUpgradeUnlock(level) { return level <= 1 ? 1 : level === 2 ? 15 : level === 3 ? 25 : level === 4 ? 45 : 70; }
function storeUpgradeCost(st) { return 25000 * (st.level || 1); }
function productDevCost(p) { return 5000 * (p.lvl || 1); }
const STORE_STREETS = ['Harrison St', 'Mission St', 'Market St', '4th St', '5th Ave', 'Main St', 'King St', 'Bay St'];
const MGR_FIRST = ['Amber', 'Priya', 'Marcus', 'Sofia', 'Ken', 'Lena', 'Diego', 'Maya', 'Tom', 'Aisha', 'Felix', 'Nina'];
const MGR_LAST = ['Sato', 'Patel', 'Garcia', 'Kim', 'Weber', 'Costa', 'Ali', 'Novak', 'Smith', 'Tanaka', 'Rossi', 'Larsen'];

function ensureStores() {
  if (!S) return null;
  if (!Array.isArray(S.stores)) S.stores = [];
  if (!Array.isArray(S.loans)) S.loans = [];
  ensureProgress();
  S.stores.forEach(st => {
    if (!st.weeks) st.weeks = [];
    if (!st.campaigns) st.campaigns = [];
    if (!st.delegation) st.delegation = { staffing: true, products: false, marketing: false, troubles: true };
    if (!st.reviews) st.reviews = { overall: 4.0, price: 4.0, product: 4.0, service: 4.0, atmosphere: 4.0, count: 0 };
    if (!st.level) st.level = 1;
    if (!st.icon) st.icon = (STORE_TYPES[st.type] || STORE_TYPES.coffee).icon;
    if (!st.manager) st.manager = makeManager(1);
    if (!st.manager.level) st.manager.level = 1;
    if (st.manager.star == null) { st.manager.star = rand() < 0.35; st.manager.starCap = 85 + Math.floor(rand() * 14); }
    if (!st.manager.look) st.manager.look = randLook();
    syncStaffMembers(st);
    if (!isFinite(st.loseStreak)) st.loseStreak = 0;
    if (!isFinite(st.winStreak)) st.winStreak = 0;
    // A store without products (bad save, bad test data) used to throw
    // here and wipe every pin in the city view. Heal it from its type.
    if (!Array.isArray(st.products)) st.products = (STORE_TYPES[st.type] || STORE_TYPES.coffee).products.map(p => Object.assign({}, p, { sold: 0, prevSold: 0, lvl: 1 }));
    st.products.forEach(p => { if (!isFinite(p.sold)) p.sold = 0; if (!isFinite(p.prevSold)) p.prevSold = 0; if (!p.lvl) p.lvl = 1; });
  });
  return S.stores;
}
// Employee levels: a manager's level sets the skill band and the
// salary band. High levels are earned through Progress, never bought
// outright — makeManager is always called at an unlocked level.
function makeManager(level) {
  const lv = clamp(level || 1, 1, 5), r = (a, b) => Math.round(a + rand() * (b - a));
  const base = 40 + lv * 6;
  // ~35% of managers show a star: they can be developed over time,
  // up to a personal cap below 99 — never a guarantee.
  return { name: pick(MGR_FIRST) + ' ' + pick(MGR_LAST), level: lv,
    people: r(base, Math.min(98, base + 35)), product: r(base, Math.min(98, base + 35)),
    marketing: r(base, Math.min(98, base + 35)), ethics: r(50, 98),
    salary: 45000 + lv * 15000 + Math.floor(rand() * 8) * 5000, since: yearOf(S.day),
    star: rand() < 0.35, starCap: 85 + Math.floor(rand() * 14) };
}
// Floor staff individuals: shoulder-and-face portraits only — no bodies,
// no standing figures, everyone in a suit. Portraits are inline SVG busts
// with rounded bottoms; each sits in its own box in a scrollable row.
function randLook() {
  const skins = ['#f2c9a0', '#e8b88a', '#d9a077', '#b07a4e', '#8a5a33', '#5d3d22'];
  const suits = ['#1f2d50', '#3a3a3a', '#5a1f2b', '#2e5a3a', '#111827', '#155e63'];
  const ties = ['#c0392b', '#2f7cf6', '#e8c547', '#111111', '#7d3cff', '#0e7a5a'];
  const hairCs = ['#111111', '#3a2a1a', '#6b4a2a', '#222222', '#666666', '#c9a86a'];
  const sex = rand() < 0.5 ? 'f' : 'm';
  const hairs = sex === 'f' ? ['long', 'bun', 'curly', 'short'] : ['short', 'curly', 'bald', 'long'];
  return { skin: pick(skins), hair: pick(hairs), hairC: pick(hairCs), suit: pick(suits), tie: pick(ties), sex };
}
function makeStaffMember() {
  return { name: pick(MGR_FIRST) + ' ' + pick(MGR_LAST), rating: 20 + Math.floor(rand() * 79), morale: 70, star: rand() < 0.35, starCap: 85 + Math.floor(rand() * 14), look: randLook() };
}
function syncStaffMembers(st) {
  if (!Array.isArray(st.members)) st.members = [];
  st.staff = clamp(Math.floor(st.staff || 0), 0, 40);
  while (st.members.length < st.staff) st.members.push(makeStaffMember());
  if (st.members.length > st.staff) st.members.length = st.staff;
  return st.members;
}
function hireStoreStaff(storeId) {
  const st = storeById(storeId); if (!st) return 'Store not found.';
  if (st.delegation.staffing) return 'Staffing is delegated to the manager. Turn delegation off to hire yourself.';
  syncStaffMembers(st);
  st.members.push(makeStaffMember()); st.staff = st.members.length;
  return null;
}
function staffSkill(st) { const ms = syncStaffMembers(st); return ms.length ? Math.round(ms.reduce((a, m) => a + (m.rating || 0), 0) / ms.length) : 0; }
function staffMorale(st) { const ms = syncStaffMembers(st); return ms.length ? Math.round(ms.reduce((a, m) => a + (m.morale || 0), 0) / ms.length) : 0; }
function portraitSVG(look, w) {
  const L = look || randLook(), s = L.skin, h = L.hairC, su = L.suit, t = L.tie;
  let back = '', front = '';
  if (L.hair === 'long') back = `<path d="M27,30 Q26,74 34,78 L38,78 L38,26 Q38,18 50,18 Q62,18 62,26 L62,78 L66,78 Q74,74 73,30 Q70,14 50,14 Q30,14 27,30 Z" fill="${h}"/>`;
  if (L.hair === 'short') front = `<path d="M29,36 Q27,8 50,8 Q73,8 71,36 Q67,20 50,20 Q33,20 29,36 Z" fill="${h}"/>`;
  else if (L.hair === 'curly') front = `<g fill="${h}"><circle cx="33" cy="18" r="9"/><circle cx="45" cy="11" r="10"/><circle cx="57" cy="11" r="10"/><circle cx="68" cy="19" r="8"/><circle cx="29" cy="28" r="7"/><circle cx="71" cy="28" r="7"/></g>`;
  else if (L.hair === 'bun') front = `<path d="M29,36 Q27,8 50,8 Q73,8 71,36 Q67,20 50,20 Q33,20 29,36 Z" fill="${h}"/><circle cx="50" cy="7" r="8" fill="${h}"/>`;
  else if (L.hair === 'long') front = `<path d="M29,36 Q27,10 50,10 Q73,10 71,36 Q67,20 50,20 Q33,20 29,36 Z" fill="${h}"/>`;
  return `<svg width="${w || 84}" viewBox="0 0 100 116" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="58" rx="46" ry="52" fill="#1a2440"/>${back}<rect x="43" y="48" width="14" height="16" fill="${s}"/><rect x="8" y="62" width="84" height="54" rx="16" fill="${su}"/><path d="M38,62 L50,84 L62,62 L56,62 L50,72 L44,62 Z" fill="#f5f5f5"/><path d="M47,66 L53,66 L55,78 L50,96 L45,78 Z" fill="${t}"/><rect x="46" y="62" width="8" height="7" fill="${t}"/><ellipse cx="29" cy="36" rx="4" ry="6" fill="${s}"/><ellipse cx="71" cy="36" rx="4" ry="6" fill="${s}"/><ellipse cx="50" cy="34" rx="20" ry="24" fill="${s}"/>${front}</svg>`;
}

function storeAddress(cityId, lotT) {
  const city = W.cities[cityId];
  return `${100 + (lotT % 900)} ${pick(STORE_STREETS)}, ${city ? city.name : ''}`;
}
function buildStore(cityId, lot, type, w) {
  ensureStores();
  if (typeof isCityUnlocked === 'function' && !isCityUnlocked(cityId)) return 'That city is locked — unlock it for $25,000 first.';
  if (typeof isGovCity === 'function' && isGovCity(W.cities[cityId])) return 'Capitals are government-only — build in another city.';
  const def = STORE_TYPES[type || 'coffee']; if (!def) return 'Unknown store type.';
  const lotObj = typeof lot === 'object' ? lot : (cityLots(cityId) || []).find(l => l.t === lot);
  if (!lotObj || lotObj.kind !== 'lease') return 'That lot is not for lease anymore.';
  if (S.stores.some(s => s.cityId === cityId && s.lotT === lotObj.t)) return 'That lot already has a store.';
  const rent = lotObj.rent || 2000, deposit = Math.round(rent * 10), buildCost = def.buildout || 25000;
  const total = deposit + buildCost;
  w = w || curWallet();
  if (walletCash(w) < total) return `Needs ${fmtMoney(total, true)} (deposit ${fmtMoney(deposit, true)} + fit-out ${fmtMoney(buildCost, true)}) in this wallet.`;
  walletPay(w, total);
  const st = { id: uid(), cityId, lotT: lotObj.t, type: type || 'coffee', level: 1, icon: def.icon, wallet: w,
    name: def.name + ' · ' + (W.cities[cityId] ? W.cities[cityId].name : ''),
    address: storeAddress(cityId, lotObj.t), rent, footTraffic: lotObj.traffic || 8000,
    manager: makeManager(1), staff: 4,
    products: def.products.map(p => ({ name: p.name, price: p.price, cost: p.cost, capture: p.capture, sold: 0, prevSold: 0, lvl: 1 })),
    campaigns: [], reviews: { overall: 4.0, price: 4.0, product: 4.0, service: 4.0, atmosphere: 4.0, count: 12 },
    delegation: { staffing: true, products: false, marketing: false, troubles: true },
    weeks: [], totalRev: 0, totalIncome: 0, weeksOpen: 0, loseStreak: 0, winStreak: 0 };
  S.stores.push(st);
  if (typeof setLot === 'function') setLot(cityId, lotObj.t, 'taken');
  gainXP(150, 'store');
  news('Business', `You opened ${st.name} at ${st.address}. Rent ${fmtMoney(rent)}/week.`, W.cities[cityId] ? W.cities[cityId].a3 : S.home);
  return null;
}

// Develop, don't just open: product levels raise what a product
// captures, store levels raise the whole shop. Both cost cash and
// pay Progress XP. Neither prints trillions — the math stays tied
// to foot traffic, prices and manager skill.
function developProduct(storeId, idx) {
  const st = storeById(storeId); if (!st) return 'Store not found.';
  const p = st.products[idx]; if (!p) return 'Product not found.';
  if ((p.lvl || 1) >= 5) return 'That product is fully developed (Lv 5).';
  const cost = productDevCost(p);
  const w = st.wallet || 'company'; if (walletCash(w) < cost) return `Developing costs ${fmtMoney(cost, true)} in this wallet.`;
  walletPay(w, cost); p.lvl = (p.lvl || 1) + 1; p.capture = +(p.capture * 1.08).toFixed(4);
  gainXP(40, 'product');
  return null;
}
function upgradeStore(storeId) {
  const st = storeById(storeId); if (!st) return 'Store not found.';
  if ((st.level || 1) >= 5) return 'That store is fully upgraded (Lv 5).';
  const next = (st.level || 1) + 1, need = storeUpgradeUnlock(next);
  if (progressLevel() < need) return `Store Lv ${next} unlocks at Progress Lv ${need}. You are Lv ${progressLevel()}.`;
  const cost = storeUpgradeCost(st);
  const w = st.wallet || 'company'; if (walletCash(w) < cost) return `Upgrading costs ${fmtMoney(cost, true)} in this wallet.`;
  walletPay(w, cost); st.level = next;
  gainXP(60, 'upgrade');
  return null;
}
function setStoreIcon(storeId, icon) {
  const st = storeById(storeId); if (!st) return 'Store not found.';
  if (!STORE_ICONS.includes(icon)) return 'Pick an icon from the picker.';
  st.icon = icon; return null;
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
    const storeF = 1 + ((st.level || 1) - 1) * 0.10;
    const demandBase = st.footTraffic * boost * mgrF * mktF * storeF * (0.85 + rand() * 0.3);
    if (st.delegation.staffing) st.staff = clamp(Math.round(demandBase / 900), 2, 14);
    syncStaffMembers(st);
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
    if (incomeR > 0) gainXP(5, 'profit');
    // Star managers grow a little each week, up to their cap.
    if (m.star) {
      const cap = m.starCap || 98;
      ['people', 'product', 'marketing', 'ethics'].forEach(k => { if (m[k] < cap && rand() < 0.5) m[k]++; });
    }
    // Floor staff: stars develop toward their cap; morale follows results.
    st.members.forEach(mem => {
      if (mem.star && mem.rating < (mem.starCap || 98) && rand() < 0.5) mem.rating++;
      mem.morale = clamp((mem.morale || 70) + (incomeR > 0 ? 1 : incomeR < 0 ? -2 : 0), 0, 100);
    });
    // The COO runs staffing when it is delegated. Firing is on STORE
    // profit (this week's income), never on what you spent elsewhere:
    // 2 losing months fires the manager, 2 profitable months promotes
    // them. A month here is 4 weeks.
    if (incomeR > 0) { st.winStreak = (st.winStreak || 0) + 1; st.loseStreak = 0; }
    else if (incomeR < 0) { st.loseStreak = (st.loseStreak || 0) + 1; st.winStreak = 0; }
    else { st.winStreak = 0; st.loseStreak = 0; }
    if (st.delegation.staffing) {
      const cityA3 = W.cities[st.cityId] ? W.cities[st.cityId].a3 : S.home;
      if ((st.loseStreak || 0) >= 8) {
        const old = m.name, lv = m.level || 1;
        st.manager = makeManager(lv);
        st.loseStreak = 0; st.winStreak = 0;
        if (typeof news === 'function') news('Business', `The COO fired ${old} at ${st.name} after 2 losing months and hired ${st.manager.name}.`, cityA3);
      } else if ((st.winStreak || 0) >= 8) {
        m.salary = Math.min(250000, Math.round(m.salary * 1.10));
        ['people', 'product', 'marketing', 'ethics'].forEach(k => { m[k] = Math.min(98, m[k] + 2); });
        st.winStreak = 0;
        if (typeof news === 'function') news('Business', `The COO promoted ${m.name} at ${st.name} after 2 profitable months (+10% salary).`, cityA3);
      }
    }
    st.weeks.unshift({ rev: Math.round(revenue), income: incomeR });
    if (st.weeks.length > 8) st.weeks.length = 8;
    st.totalRev += revenue; st.totalIncome += incomeR; st.weeksOpen++;
    if (st.wallet === 'private') ensurePerson().cash += incomeR; else S.cash += incomeR;
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
  st.manager = makeManager(maxManagerLevel()); return null;
}
function adjustManagerSalary(storeId, delta) {
  const st = storeById(storeId); if (!st) return 'Store not found.';
  st.manager.salary = clamp(st.manager.salary + delta, 30000, 250000); return null;
}
function startStoreCampaign(storeId, campId) {
  const st = storeById(storeId); if (!st) return 'Store not found.';
  if (st.delegation.marketing) return 'Marketing is delegated to the manager. Turn delegation off to run campaigns yourself.';
  const d = STORE_CAMPAIGNS.find(x => x.id === campId); if (!d) return 'Campaign not found.';
  if (progressLevel() < (d.unlock || 1)) return `${d.name} unlocks at Progress Lv ${d.unlock}. You are Lv ${progressLevel()}.`;
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
  if (typeof cityBanksWeek === 'function') { try { cityBanksWeek(); } catch (e) {} }
  for (const ln of S.loans) {
    const pay = Math.min(ln.weekly, ln.amount - ln.paid + ln.amount * ln.rate / 52 * 0); // principal + interest handled in weekly figure
    S.cash -= ln.weekly; ln.paid += ln.weekly; ln.weeksLeft--;
  }
  const done = S.loans.filter(l => l.weeksLeft <= 0);
  S.loans = S.loans.filter(l => l.weeksLeft > 0);
  done.forEach(l => news('Bank', `Loan of ${fmtMoney(l.amount, true)} is fully repaid.`, S.home));
}
