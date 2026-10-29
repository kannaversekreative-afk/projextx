// Worl Inc. sectors + business types.
// Nicholas's 9 sectors, with his screenshot buildings as the first
// buildable set. Starter numbers only — he tunes costs and income.
// Income is per second at level 1; each upgrade level multiplies it by
// the level (level 2 earns 2x, level 3 earns 3x, up to level 5).
// Two screenshot buildings do not fit his 9 sectors (City Hall,
// Sports Stadium) — they live under "Special" until he places them.
const INC_SECTORS = [
  { id: 'residential', name: 'Residential', blurb: 'Homes people live in.', types: [
    { id: 'residential', name: 'Residential Complex', cost: 40000, income: 12, products: [{ name: 'Rent', price: 1000 }, { name: 'Parking', price: 100 }], managers: [{ id: 'omarchen', name: 'Omar Chen', skill: 'Leasing', salary: 0.5 }, { id: 'omarpark', name: 'Omar Park', skill: 'Maintenance', salary: 0.6 }, { id: 'omarross', name: 'Omar Ross', skill: 'Tenant Relations', salary: 0.7 }], ops: [{ name: 'Open House', kind: 'timed', mult: 1.5, secs: 60, cost: 180 }, { name: 'New Wing', kind: 'perm', value: 3.0, cost: 3000 }]  } ] },
  { id: 'commercial', name: 'Commercial', blurb: 'Shops and food people buy from.', types: [
    { id: 'store', name: 'Store', cost: 5000, income: 2, products: [{ name: 'Groceries', price: 5 }, { name: 'Clothing', price: 20 }, { name: 'Electronics', price: 100 }], managers: [{ id: 'omarpatel', name: 'Omar Patel', skill: 'Sales', salary: 0.1 }, { id: 'omarkim', name: 'Omar Kim', skill: 'Merchandising', salary: 0.1 }, { id: 'omardiaz', name: 'Omar Diaz', skill: 'Customer Service', salary: 0.1 }], ops: [{ name: 'Weekend Sale', kind: 'timed', mult: 1.5, secs: 60, cost: 30 }, { name: 'New Display', kind: 'perm', value: 0.5, cost: 500 }] },
    { id: 'coffee', name: 'Coffee Shop', cost: 5000, income: 2, blends: true, products: [{ name: 'Espresso', price: 4 }, { name: 'Latte', price: 6 }, { name: 'Cappuccino', price: 6 }, { name: 'Cold Brew', price: 5 }], ops: [{ name: 'Tasting Event', kind: 'timed', mult: 1.5, secs: 60, cost: 30 }, { name: 'New Espresso Machine', kind: 'perm', value: 0.5, cost: 500 }] },
    { id: 'office', name: 'Office', cost: 25000, income: 8, products: [{ name: 'Desks', price: 50 }, { name: 'Meeting Rooms', price: 100 }], managers: [{ id: 'omarnovak', name: 'Omar Novak', skill: 'Administration', salary: 0.3 }, { id: 'omarhassan', name: 'Omar Hassan', skill: 'Facilities', salary: 0.4 }, { id: 'omarliu', name: 'Omar Liu', skill: 'HR', salary: 0.5 }], ops: [{ name: 'Client Blitz', kind: 'timed', mult: 1.5, secs: 60, cost: 120 }, { name: 'Extra Floor', kind: 'perm', value: 2.0, cost: 2000 }] },
    { id: 'mall', name: 'Mall', cost: 80000, income: 30, products: [{ name: 'Shops', price: 40 }, { name: 'Food Court', price: 15 }, { name: 'Cinema', price: 12 }], managers: [{ id: 'omarcarter', name: 'Omar Carter', skill: 'Retail', salary: 1.2 }, { id: 'omarreed', name: 'Omar Reed', skill: 'Events', salary: 1.5 }, { id: 'omarsingh', name: 'Omar Singh', skill: 'Leasing', salary: 1.8 }], ops: [{ name: 'Holiday Event', kind: 'timed', mult: 1.5, secs: 60, cost: 450 }, { name: 'Anchor Tenant', kind: 'perm', value: 7.5, cost: 7500 }] },
    { id: 'commercialbldg', name: 'Commercial Building', cost: 60000, income: 22, products: [{ name: 'Offices', price: 60 }, { name: 'Retail', price: 30 }], managers: [{ id: 'priyachen', name: 'Priya Chen', skill: 'Property', salary: 0.9 }, { id: 'priyapark', name: 'Priya Park', skill: 'Leasing', salary: 1.1 }, { id: 'priyaross', name: 'Priya Ross', skill: 'Facilities', salary: 1.3 }], ops: [{ name: 'Leasing Drive', kind: 'timed', mult: 1.5, secs: 60, cost: 330 }, { name: 'Renovation', kind: 'perm', value: 5.5, cost: 5500 }] },
    { id: 'auction', name: 'Auction House', cost: 20000, income: 7, products: [{ name: 'Antiques', price: 200 }, { name: 'Art', price: 500 }], managers: [{ id: 'priyapatel', name: 'Priya Patel', skill: 'Appraisal', salary: 0.3 }, { id: 'priyakim', name: 'Priya Kim', skill: 'Sales', salary: 0.4 }, { id: 'priyadiaz', name: 'Priya Diaz', skill: 'Logistics', salary: 0.4 }], ops: [{ name: 'Gala Auction', kind: 'timed', mult: 1.5, secs: 60, cost: 105 }, { name: 'Vault Expansion', kind: 'perm', value: 1.8, cost: 1800 }]  } ] },
  { id: 'industrial', name: 'Industrial', blurb: 'Factories and warehouses.', types: [
    { id: 'factory', name: 'Factory', cost: 100000, income: 40, products: [{ name: 'Widgets', price: 10 }, { name: 'Gadgets', price: 50 }], managers: [{ id: 'priyanovak', name: 'Priya Novak', skill: 'Production', salary: 1.6 }, { id: 'priyahassan', name: 'Priya Hassan', skill: 'Quality', salary: 2.0 }, { id: 'priyaliu', name: 'Priya Liu', skill: 'Logistics', salary: 2.4 }], ops: [{ name: 'Overtime Shift', kind: 'timed', mult: 1.5, secs: 60, cost: 600 }, { name: 'New Line', kind: 'perm', value: 10.0, cost: 10000 }] },
    { id: 'industrial', name: 'Industrial Complex', cost: 120000, income: 45, products: [{ name: 'Parts', price: 30 }, { name: 'Machinery', price: 500 }], managers: [{ id: 'priyacarter', name: 'Priya Carter', skill: 'Operations', salary: 1.8 }, { id: 'priyareed', name: 'Priya Reed', skill: 'Safety', salary: 2.2 }, { id: 'priyasingh', name: 'Priya Singh', skill: 'Supply Chain', salary: 2.7 }], ops: [{ name: 'Bulk Order', kind: 'timed', mult: 1.5, secs: 60, cost: 675 }, { name: 'Warehouse', kind: 'perm', value: 11.2, cost: 11200 }]  } ] },
  { id: 'transportation', name: 'Transportation', blurb: 'Moving people and goods.', types: [
    { id: 'airline', name: 'Airline', cost: 220000, income: 0, fare: true, managers: [{ id: 'samchen', name: 'Sam Chen', skill: 'Operations', salary: 1 }, { id: 'sampark', name: 'Sam Park', skill: 'Safety', salary: 1 }, { id: 'samross', name: 'Sam Ross', skill: 'Customer Service', salary: 1 }], ops: [{ name: 'Fare Sale', kind: 'timed', mult: 1.5, secs: 60, cost: 1000 }, { name: 'Cargo Contract', kind: 'perm', value: 5, cost: 5000 }] },
    { id: 'auto', name: 'Auto Dealership', cost: 30000, income: 11, products: [{ name: 'Cars', price: 20000 }, { name: 'Repairs', price: 200 }], managers: [{ id: 'sampatel', name: 'Sam Patel', skill: 'Sales', salary: 0.4 }, { id: 'samkim', name: 'Sam Kim', skill: 'Service', salary: 0.6 }, { id: 'samdiaz', name: 'Sam Diaz', skill: 'Finance', salary: 0.7 }], ops: [{ name: 'Clearance Sale', kind: 'timed', mult: 1.5, secs: 60, cost: 165 }, { name: 'Service Center', kind: 'perm', value: 2.8, cost: 2800 }]  } ] },
  { id: 'farming', name: 'Farming', blurb: 'Food from the land.', types: [
    { id: 'farm', name: 'Farm', cost: 15000, income: 5, products: [{ name: 'Wheat', price: 5 }, { name: 'Vegetables', price: 8 }], managers: [{ id: 'samnovak', name: 'Sam Novak', skill: 'Crops', salary: 0.2 }, { id: 'samhassan', name: 'Sam Hassan', skill: 'Irrigation', salary: 0.2 }, { id: 'samliu', name: 'Sam Liu', skill: 'Harvest', salary: 0.3 }], ops: [{ name: 'Harvest Festival', kind: 'timed', mult: 1.5, secs: 60, cost: 75 }, { name: 'Irrigation', kind: 'perm', value: 1.2, cost: 1200 }] },
    { id: 'ranch', name: 'Ranch', cost: 40000, income: 12, products: [{ name: 'Beef', price: 20 }, { name: 'Milk', price: 4 }], managers: [{ id: 'samcarter', name: 'Sam Carter', skill: 'Livestock', salary: 0.5 }, { id: 'samreed', name: 'Sam Reed', skill: 'Pasture', salary: 0.6 }, { id: 'samsingh', name: 'Sam Singh', skill: 'Veterinary', salary: 0.7 }], ops: [{ name: 'Rodeo', kind: 'timed', mult: 1.5, secs: 60, cost: 180 }, { name: 'New Pasture', kind: 'perm', value: 3.0, cost: 3000 }]  } ] },
  { id: 'mining', name: 'Mining', blurb: 'Ore and stone from the ground.', types: [
    { id: 'mine', name: 'Mine', cost: 80000, income: 30, products: [{ name: 'Iron', price: 50 }, { name: 'Coal', price: 30 }], managers: [{ id: 'elenachen', name: 'Elena Chen', skill: 'Geology', salary: 1.2 }, { id: 'elenapark', name: 'Elena Park', skill: 'Safety', salary: 1.5 }, { id: 'elenaross', name: 'Elena Ross', skill: 'Extraction', salary: 1.8 }], ops: [{ name: 'Rich Vein', kind: 'timed', mult: 1.5, secs: 60, cost: 450 }, { name: 'Deep Shaft', kind: 'perm', value: 7.5, cost: 7500 }] },
    { id: 'quarry', name: 'Quarry', cost: 35000, income: 12, products: [{ name: 'Stone', price: 20 }, { name: 'Gravel', price: 10 }], managers: [{ id: 'elenapatel', name: 'Elena Patel', skill: 'Extraction', salary: 0.5 }, { id: 'elenakim', name: 'Elena Kim', skill: 'Transport', salary: 0.6 }, { id: 'elenadiaz', name: 'Elena Diaz', skill: 'Sales', salary: 0.7 }], ops: [{ name: 'Big Order', kind: 'timed', mult: 1.5, secs: 60, cost: 180 }, { name: 'New Pit', kind: 'perm', value: 3.0, cost: 3000 }]  } ] },
  { id: 'technology', name: 'Technology', blurb: 'Software and electronics.', types: [
    { id: 'software', name: 'Software Studio', cost: 40000, income: 15, products: [{ name: 'Apps', price: 5 }, { name: 'Software', price: 100 }], managers: [{ id: 'elenanovak', name: 'Elena Novak', skill: 'Engineering', salary: 0.6 }, { id: 'elenahassan', name: 'Elena Hassan', skill: 'Product', salary: 0.8 }, { id: 'elenaliu', name: 'Elena Liu', skill: 'QA', salary: 0.9 }], ops: [{ name: 'Launch Week', kind: 'timed', mult: 1.5, secs: 60, cost: 225 }, { name: 'New Product', kind: 'perm', value: 3.8, cost: 3800 }] },
    { id: 'electronics', name: 'Electronics Shop', cost: 20000, income: 7, products: [{ name: 'Phones', price: 500 }, { name: 'Laptops', price: 1000 }], managers: [{ id: 'elenacarter', name: 'Elena Carter', skill: 'Sales', salary: 0.3 }, { id: 'elenareed', name: 'Elena Reed', skill: 'Repair', salary: 0.4 }, { id: 'elenasingh', name: 'Elena Singh', skill: 'Inventory', salary: 0.4 }], ops: [{ name: 'Gadget Expo', kind: 'timed', mult: 1.5, secs: 60, cost: 105 }, { name: 'Repair Lab', kind: 'perm', value: 1.8, cost: 1800 }]  } ] },
  { id: 'energy', name: 'Energy', blurb: 'Power for everything.', types: [
    { id: 'solar', name: 'Solar Farm', cost: 120000, income: 45, products: [{ name: 'Electricity', price: 10 }, { name: 'Panels', price: 300 }], managers: [{ id: 'marcuschen', name: 'Marcus Chen', skill: 'Engineering', salary: 1.8 }, { id: 'marcuspark', name: 'Marcus Park', skill: 'Maintenance', salary: 2.2 }, { id: 'marcusross', name: 'Marcus Ross', skill: 'Grid', salary: 2.7 }], ops: [{ name: 'Sunny Week', kind: 'timed', mult: 1.5, secs: 60, cost: 675 }, { name: 'New Array', kind: 'perm', value: 11.2, cost: 11200 }] },
    { id: 'powerplant', name: 'Power Plant', cost: 200000, income: 70, products: [{ name: 'Electricity', price: 10 }, { name: 'Steam', price: 20 }], managers: [{ id: 'marcuspatel', name: 'Marcus Patel', skill: 'Engineering', salary: 2.8 }, { id: 'marcuskim', name: 'Marcus Kim', skill: 'Safety', salary: 3.5 }, { id: 'marcusdiaz', name: 'Marcus Diaz', skill: 'Operations', salary: 4.2 }], ops: [{ name: 'Peak Demand', kind: 'timed', mult: 1.5, secs: 60, cost: 1050 }, { name: 'New Turbine', kind: 'perm', value: 17.5, cost: 17500 }]  } ] },
  { id: 'finance', name: 'Finance', blurb: 'Money working for money.', types: [
    { id: 'bank', name: 'Bank', cost: 50000, income: 20, products: [{ name: 'Loans', price: 100 }, { name: 'Savings', price: 10 }], managers: [{ id: 'marcusnovak', name: 'Marcus Novak', skill: 'Lending', salary: 0.8 }, { id: 'marcushassan', name: 'Marcus Hassan', skill: 'Risk', salary: 1.0 }, { id: 'marcusliu', name: 'Marcus Liu', skill: 'Compliance', salary: 1.2 }], ops: [{ name: 'Loan Drive', kind: 'timed', mult: 1.5, secs: 60, cost: 300 }, { name: 'New Branch', kind: 'perm', value: 5.0, cost: 5000 }]  } ] },
];
const INC_SPECIAL = [
  { id: 'cityhall', name: 'City Hall', cost: 150000, income: 50, products: [{ name: 'Permits', price: 100 }, { name: 'Services', price: 50 }], managers: [{ id: 'marcuscarter', name: 'Marcus Carter', skill: 'Administration', salary: 2.0 }, { id: 'marcusreed', name: 'Marcus Reed', skill: 'Public Works', salary: 2.5 }, { id: 'marcussingh', name: 'Marcus Singh', skill: 'Finance', salary: 3.0 }], ops: [{ name: 'Civic Fair', kind: 'timed', mult: 1.5, secs: 60, cost: 750 }, { name: 'New Department', kind: 'perm', value: 12.5, cost: 12500 }] },
  { id: 'stadium', name: 'Sports Stadium', cost: 200000, income: 70, products: [{ name: 'Tickets', price: 30 }, { name: 'Food', price: 10 }], managers: [{ id: 'zoechen', name: 'Zoe Chen', skill: 'Events', salary: 2.8 }, { id: 'zoepark', name: 'Zoe Park', skill: 'Operations', salary: 3.5 }, { id: 'zoeross', name: 'Zoe Ross', skill: 'Marketing', salary: 4.2 }], ops: [{ name: 'Championship Game', kind: 'timed', mult: 1.5, secs: 60, cost: 1050 }, { name: 'New Stand', kind: 'perm', value: 17.5, cost: 17500 }] },
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
function incBizTypeManagers(biz) {
  try {
    const sec = (typeof incSectorById === 'function' ? incSectorById(biz.sector) : null);
    const t = (typeof incTypeById === 'function' ? incTypeById(sec, biz.type) : null);
    return (t && t.managers) ? t.managers : [];
  } catch (e) { return []; }
}
function incBizSalaries(biz) {
  let s = 0;
  if (biz && biz.board) for (const r of INC_BOARD_ROLES) if (biz.board[r.id]) s += r.salary;
  if (biz && biz.manager) s += 5;
  if (biz && biz.coffeeManagers) for (const m of INC_COFFEE_MANAGERS) if (biz.coffeeManagers[m.id]) s += m.salary;
  if (biz && biz.typeManagers) for (const m of incBizTypeManagers(biz)) if (biz.typeManagers[m.id]) s += m.salary;
  return s;
}
function incBizBoostMult(biz) {
  try { if (biz && biz.boost && biz.boost.until && Date.now() < biz.boost.until) return biz.boost.mult || 1; } catch (e) {}
  return 1;
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
  if (biz.typeManagers) for (const m of incBizTypeManagers(biz)) if (biz.typeManagers[m.id]) mult *= 1.15;
  mult *= incBizBoostMult(biz);
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
  const bonus = (biz.bonusIncome || 0) * (biz.level || 1);
  return (base + blend + bonus) * mult - incBizSalaries(biz);
}
function incBizFareMult(biz) { return (1 + 0.1 * incBizBoardCount(biz)) * incBizBoostMult(biz); }
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
