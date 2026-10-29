// Worl Inc. sectors + business types.
// Nicholas's 9 sectors, with his screenshot buildings as the first
// buildable set. Starter numbers only — he tunes costs and income.
// Income is per second at level 1; each upgrade level multiplies it by
// the level (level 2 earns 2x, level 3 earns 3x, up to level 5).
// Two screenshot buildings do not fit his 9 sectors (City Hall,
// Sports Stadium) — they live under "Special" until he places them.
const INC_SECTORS = [
  { id: 'residential', name: 'Residential', blurb: 'Homes people live in.', types: [
    { id: 'residential', name: 'Residential Complex', cost: 40000, income: 12, products: [{ name: 'Rent', price: 1000 }, { name: 'Parking', price: 100 }] } ] },
  { id: 'commercial', name: 'Commercial', blurb: 'Shops and food people buy from.', types: [
    { id: 'store', name: 'Store', cost: 5000, income: 2, products: [{ name: 'Groceries', price: 5 }, { name: 'Clothing', price: 20 }, { name: 'Electronics', price: 100 }] },
    { id: 'coffee', name: 'Coffee Shop', cost: 5000, income: 2, blends: true, products: [{ name: 'Espresso', price: 4 }, { name: 'Latte', price: 6 }, { name: 'Cappuccino', price: 6 }, { name: 'Cold Brew', price: 5 }] },
    { id: 'office', name: 'Office', cost: 25000, income: 8, products: [{ name: 'Desks', price: 50 }, { name: 'Meeting Rooms', price: 100 }] },
    { id: 'mall', name: 'Mall', cost: 80000, income: 30, products: [{ name: 'Shops', price: 40 }, { name: 'Food Court', price: 15 }, { name: 'Cinema', price: 12 }] },
    { id: 'commercialbldg', name: 'Commercial Building', cost: 60000, income: 22, products: [{ name: 'Offices', price: 60 }, { name: 'Retail', price: 30 }] },
    { id: 'auction', name: 'Auction House', cost: 20000, income: 7, products: [{ name: 'Antiques', price: 200 }, { name: 'Art', price: 500 }] } ] },
  { id: 'industrial', name: 'Industrial', blurb: 'Factories and warehouses.', types: [
    { id: 'factory', name: 'Factory', cost: 100000, income: 40, products: [{ name: 'Widgets', price: 10 }, { name: 'Gadgets', price: 50 }] },
    { id: 'industrial', name: 'Industrial Complex', cost: 120000, income: 45, products: [{ name: 'Parts', price: 30 }, { name: 'Machinery', price: 500 }] } ] },
  { id: 'transportation', name: 'Transportation', blurb: 'Moving people and goods.', types: [
    { id: 'airline', name: 'Airline', cost: 220000, income: 0, fare: true },
    { id: 'auto', name: 'Auto Dealership', cost: 30000, income: 11, products: [{ name: 'Cars', price: 20000 }, { name: 'Repairs', price: 200 }] } ] },
  { id: 'farming', name: 'Farming', blurb: 'Food from the land.', types: [
    { id: 'farm', name: 'Farm', cost: 15000, income: 5, products: [{ name: 'Wheat', price: 5 }, { name: 'Vegetables', price: 8 }] },
    { id: 'ranch', name: 'Ranch', cost: 40000, income: 12, products: [{ name: 'Beef', price: 20 }, { name: 'Milk', price: 4 }] } ] },
  { id: 'mining', name: 'Mining', blurb: 'Ore and stone from the ground.', types: [
    { id: 'mine', name: 'Mine', cost: 80000, income: 30, products: [{ name: 'Iron', price: 50 }, { name: 'Coal', price: 30 }] },
    { id: 'quarry', name: 'Quarry', cost: 35000, income: 12, products: [{ name: 'Stone', price: 20 }, { name: 'Gravel', price: 10 }] } ] },
  { id: 'technology', name: 'Technology', blurb: 'Software and electronics.', types: [
    { id: 'software', name: 'Software Studio', cost: 40000, income: 15, products: [{ name: 'Apps', price: 5 }, { name: 'Software', price: 100 }] },
    { id: 'electronics', name: 'Electronics Shop', cost: 20000, income: 7, products: [{ name: 'Phones', price: 500 }, { name: 'Laptops', price: 1000 }] } ] },
  { id: 'energy', name: 'Energy', blurb: 'Power for everything.', types: [
    { id: 'solar', name: 'Solar Farm', cost: 120000, income: 45, products: [{ name: 'Electricity', price: 10 }, { name: 'Panels', price: 300 }] },
    { id: 'powerplant', name: 'Power Plant', cost: 200000, income: 70, products: [{ name: 'Electricity', price: 10 }, { name: 'Steam', price: 20 }] } ] },
  { id: 'finance', name: 'Finance', blurb: 'Money working for money.', types: [
    { id: 'bank', name: 'Bank', cost: 50000, income: 20, products: [{ name: 'Loans', price: 100 }, { name: 'Savings', price: 10 }] } ] },
];
const INC_SPECIAL = [
  { id: 'cityhall', name: 'City Hall', cost: 150000, income: 50, products: [{ name: 'Permits', price: 100 }, { name: 'Services', price: 50 }] },
  { id: 'stadium', name: 'Sports Stadium', cost: 200000, income: 70, products: [{ name: 'Tickets', price: 30 }, { name: 'Food', price: 10 }] },
];
// Board roles: CEO is you (free, always). Each hired role costs salary
// per second and boosts income 10%. A full board (all 5) unlocks IPO.
const INC_BOARD_ROLES = [
  { id: 'coo', name: 'COO', salary: 2 },
  { id: 'cfo', name: 'CFO', salary: 2 },
  { id: 'cpo', name: 'CPO', salary: 2 },
  { id: 'cmo', name: 'CMO', salary: 2 },
  { id: 'cto', name: 'CTO', salary: 2 },
];
// Coffee managers (Worl names only): each adds 15% income when hired.
const INC_COFFEE_MANAGERS = [
  { id: 'maya', name: 'Maya Chen', skill: 'Barista', salary: 8 },
  { id: 'leo', name: 'Leo Park', skill: 'Service', salary: 6 },
  { id: 'nina', name: 'Nina Ross', skill: 'Marketing', salary: 7 },
];
function incSectorById(id) {
  if (id === 'special') return { id: 'special', name: 'Special', blurb: 'Buildings that do not fit a sector yet.', types: INC_SPECIAL };
  return INC_SECTORS.find(s => s.id === id) || null;
}
function incTypeById(sec, tid) { return (sec && sec.types.find(t => t.id === tid)) || null; }
function incBizBoardCount(biz) { return (biz && biz.board) ? Object.values(biz.board).filter(Boolean).length : 0; }
function incBizSalaries(biz) {
  let s = 0;
  if (biz && biz.board) for (const r of INC_BOARD_ROLES) if (biz.board[r.id]) s += r.salary;
  if (biz && biz.manager) s += 5;
  if (biz && biz.coffeeManagers) for (const m of INC_COFFEE_MANAGERS) if (biz.coffeeManagers[m.id]) s += m.salary;
  return s;
}
// Net income per second: base x level, price-adjusted (products),
// plus blends, boosted by board (+10% each), manager (+20%), coffee
// managers (+15% each), president (+25%), minus salaries. Airlines
// earn fares, not flat income, so their net here is just negative
// salaries (fares pay separately, boosted by board).
function incBizNetPerSec(biz) {
  if (!biz) return 0;
  let mult = 1 + 0.1 * incBizBoardCount(biz);
  if (biz.manager) mult *= 1.2;
  if (biz.coffeeManagers) for (const m of INC_COFFEE_MANAGERS) if (biz.coffeeManagers[m.id]) mult *= 1.15;
  try { if (typeof S !== 'undefined' && S && S.president) mult *= 1.25; } catch (e) {}
  // Product pricing: average of current price / base price across the
  // type's products. Raising all prices 10% raises base income 10%.
  let priceMult = 1;
  try {
    const sec = (typeof incSectorById === 'function' ? incSectorById(biz.sector) : null);
    const t = (typeof incTypeById === 'function' ? incTypeById(sec, biz.type) : null);
    if (t && t.products && t.products.length) {
      let sum = 0;
      for (const p of t.products) { const cur = (biz.prices && biz.prices[p.name] != null) ? biz.prices[p.name] : p.price; sum += cur / p.price; }
      priceMult = sum / t.products.length;
    }
  } catch (e) {}
  const base = (biz.income || 0) * (biz.level || 1) * priceMult;
  const blend = (biz.blends || []).reduce((s, b) => s + (b.income || 0), 0) * (biz.level || 1);
  return (base + blend) * mult - incBizSalaries(biz);
}
function incBizFareMult(biz) { return 1 + 0.1 * incBizBoardCount(biz); }
// Full US: every contiguous state (US_CAPITALS) is in S.incStates.
function incFullUS() {
  try {
    if (typeof S === 'undefined' || !S || !S.incStates) return false;
    if (typeof US_CAPITALS === 'undefined') return S.incStates.length >= 48;
    return US_CAPITALS.every(u => S.incStates.includes(u.s));
  } catch (e) { return false; }
}
// IPO cash: profitable businesses pay 10x annual profit minus 7% fee;
// airlines pay 5x total spent minus 7% (fares do not annualize cleanly).
// Annual profit uses game time: 52 weeks x 600 seconds per week.
function incIPOValue(biz) {
  if (!biz) return 0;
  if (biz.type === 'airline') return Math.round((biz.spent || biz.cost || 0) * 5 * 0.93);
  const annual = incBizNetPerSec(biz) * 31200;
  if (annual <= 0) return 0;
  return Math.round(annual * 10 * 0.93);
}
