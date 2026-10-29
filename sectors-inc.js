// Worl Inc. sectors + business types.
// Nicholas's 9 sectors, with his screenshot buildings as the first
// buildable set. Starter numbers only — he tunes costs and income.
// Income is per second at level 1; each upgrade level multiplies it by
// the level (level 2 earns 2x, level 3 earns 3x, up to level 5).
// Two screenshot buildings do not fit his 9 sectors (City Hall,
// Sports Stadium) — they live under "Special" until he places them.
const INC_SECTORS = [
  { id: 'residential', name: 'Residential', blurb: 'Homes people live in.', types: [
    { id: 'residential', name: 'Residential Complex', cost: 40000, income: 24, products: [{ name: 'Rent', price: 1000, cost: 300 }, { name: 'Parking', price: 100, cost: 30 }], managers: [{ id: 'omarchen', name: 'Omar Chen', skill: 'Leasing', salary: 0.5 }, { id: 'omarpark', name: 'Omar Park', skill: 'Maintenance', salary: 0.6 }, { id: 'omarross', name: 'Omar Ross', skill: 'Tenant Relations', salary: 0.7 }], ops: [{ name: 'Open House', kind: 'timed', mult: 1.5, secs: 60, cost: 360 }, { name: 'New Wing', kind: 'perm', value: 6, cost: 6000 }]  , marketing: [{ name: 'Open House Weekend', cost: 50 }, { name: 'Neighborhood Flyers', cost: 30 }, { name: 'Online Listings Boost', cost: 40 }, { name: 'Referral Bonus', cost: 60 }] } ] },
  { id: 'commercial', name: 'Commercial', blurb: 'Shops and food people buy from.', types: [
    { id: 'store', name: 'Store', cost: 5000, income: 4, products: [{ name: 'Groceries', price: 5, cost: 1.5 }, { name: 'Clothing', price: 20, cost: 6 }, { name: 'Electronics', price: 100, cost: 30 }], managers: [{ id: 'omarpatel', name: 'Omar Patel', skill: 'Sales', salary: 0.1 }, { id: 'omarkim', name: 'Omar Kim', skill: 'Merchandising', salary: 0.1 }, { id: 'omardiaz', name: 'Omar Diaz', skill: 'Customer Service', salary: 0.1 }], ops: [{ name: 'Weekend Sale', kind: 'timed', mult: 1.5, secs: 60, cost: 60 }, { name: 'New Display', kind: 'perm', value: 1, cost: 1000 }] , marketing: [{ name: 'Window Display', cost: 20 }, { name: 'Local Flyers', cost: 15 }, { name: 'Loyalty Cards', cost: 25 }, { name: 'Grand Opening Ads', cost: 40 }] },
    { id: 'coffee', name: 'Coffee Shop', cost: 5000, income: 4, blends: true, products: [{ name: 'Espresso', price: 4, cost: 1.2 }, { name: 'Latte', price: 6, cost: 1.8 }, { name: 'Cappuccino', price: 6, cost: 1.8 }, { name: 'Cold Brew', price: 5, cost: 1.5 }], ops: [{ name: 'Tasting Event', kind: 'timed', mult: 1.5, secs: 60, cost: 60 }, { name: 'New Espresso Machine', kind: 'perm', value: 1, cost: 1000 }] , marketing: [{ name: 'Bean of the Month', cost: 20 }, { name: 'Morning Commuter Ads', cost: 30 }, { name: 'Loyalty Stamps', cost: 15 }, { name: 'Neighborhood Tastings', cost: 35 }] },
    { id: 'office', name: 'Office', cost: 25000, income: 16, products: [{ name: 'Desks', price: 50, cost: 15 }, { name: 'Meeting Rooms', price: 100, cost: 30 }], managers: [{ id: 'omarnovak', name: 'Omar Novak', skill: 'Administration', salary: 0.3 }, { id: 'omarhassan', name: 'Omar Hassan', skill: 'Facilities', salary: 0.4 }, { id: 'omarliu', name: 'Omar Liu', skill: 'HR', salary: 0.5 }], ops: [{ name: 'Client Blitz', kind: 'timed', mult: 1.5, secs: 60, cost: 240 }, { name: 'Extra Floor', kind: 'perm', value: 4, cost: 4000 }] , marketing: [{ name: 'Broker Networking', cost: 60 }, { name: 'Virtual Tour Ads', cost: 40 }, { name: 'Move-in Special', cost: 50 }, { name: 'Business Expo Booth', cost: 80 }] },
    { id: 'mall', name: 'Mall', cost: 80000, income: 60, products: [{ name: 'Shops', price: 40, cost: 12 }, { name: 'Food Court', price: 15, cost: 4.5 }, { name: 'Cinema', price: 12, cost: 3.6 }], managers: [{ id: 'omarcarter', name: 'Omar Carter', skill: 'Retail', salary: 1.2 }, { id: 'omarreed', name: 'Omar Reed', skill: 'Events', salary: 1.5 }, { id: 'omarsingh', name: 'Omar Singh', skill: 'Leasing', salary: 1.8 }], ops: [{ name: 'Holiday Event', kind: 'timed', mult: 1.5, secs: 60, cost: 900 }, { name: 'Anchor Tenant', kind: 'perm', value: 15, cost: 15000 }] , marketing: [{ name: 'Holiday Decor', cost: 200 }, { name: 'Mall App Ads', cost: 150 }, { name: 'Weekend Events', cost: 250 }, { name: 'Tourist Guide Ads', cost: 180 }] },
    { id: 'commercialbldg', name: 'Commercial Building', cost: 60000, income: 44, products: [{ name: 'Offices', price: 60, cost: 18 }, { name: 'Retail', price: 30, cost: 9 }], managers: [{ id: 'priyachen', name: 'Priya Chen', skill: 'Property', salary: 0.9 }, { id: 'priyapark', name: 'Priya Park', skill: 'Leasing', salary: 1.1 }, { id: 'priyaross', name: 'Priya Ross', skill: 'Facilities', salary: 1.3 }], ops: [{ name: 'Leasing Drive', kind: 'timed', mult: 1.5, secs: 60, cost: 660 }, { name: 'Renovation', kind: 'perm', value: 11, cost: 11000 }] , marketing: [{ name: 'Leasing Ads', cost: 120 }, { name: 'Broker Open House', cost: 100 }, { name: 'Tenant Perks', cost: 90 }, { name: 'Skyline Signage', cost: 150 }] },
    { id: 'auction', name: 'Auction House', cost: 20000, income: 14, products: [{ name: 'Antiques', price: 200, cost: 60 }, { name: 'Art', price: 500, cost: 150 }], managers: [{ id: 'priyapatel', name: 'Priya Patel', skill: 'Appraisal', salary: 0.3 }, { id: 'priyakim', name: 'Priya Kim', skill: 'Sales', salary: 0.4 }, { id: 'priyadiaz', name: 'Priya Diaz', skill: 'Logistics', salary: 0.4 }], ops: [{ name: 'Gala Auction', kind: 'timed', mult: 1.5, secs: 60, cost: 210 }, { name: 'Vault Expansion', kind: 'perm', value: 3.6, cost: 3600 }]  , marketing: [{ name: 'Collector Mailings', cost: 60 }, { name: 'Preview Nights', cost: 80 }, { name: 'Online Catalog Ads', cost: 50 }, { name: 'Estate Partner Ads', cost: 70 }] } ] },
  { id: 'industrial', name: 'Industrial', blurb: 'Factories and warehouses.', types: [
    { id: 'factory', name: 'Factory', cost: 100000, income: 80, products: [{ name: 'Widgets', price: 10, cost: 3 }, { name: 'Gadgets', price: 50, cost: 15 }], managers: [{ id: 'priyanovak', name: 'Priya Novak', skill: 'Production', salary: 1.6 }, { id: 'priyahassan', name: 'Priya Hassan', skill: 'Quality', salary: 2.0 }, { id: 'priyaliu', name: 'Priya Liu', skill: 'Logistics', salary: 2.4 }], ops: [{ name: 'Overtime Shift', kind: 'timed', mult: 1.5, secs: 60, cost: 1200 }, { name: 'New Line', kind: 'perm', value: 20, cost: 20000 }] , marketing: [{ name: 'Trade Show Booth', cost: 250 }, { name: 'Buyer Outreach', cost: 200 }, { name: 'Product Samples', cost: 150 }, { name: 'Industry Ads', cost: 180 }] },
    { id: 'industrial', name: 'Industrial Complex', cost: 120000, income: 90, products: [{ name: 'Parts', price: 30, cost: 9 }, { name: 'Machinery', price: 500, cost: 150 }], managers: [{ id: 'priyacarter', name: 'Priya Carter', skill: 'Operations', salary: 1.8 }, { id: 'priyareed', name: 'Priya Reed', skill: 'Safety', salary: 2.2 }, { id: 'priyasingh', name: 'Priya Singh', skill: 'Supply Chain', salary: 2.7 }], ops: [{ name: 'Bulk Order', kind: 'timed', mult: 1.5, secs: 60, cost: 1350 }, { name: 'Warehouse', kind: 'perm', value: 22.4, cost: 22400 }]  , marketing: [{ name: 'Logistics Expo', cost: 300 }, { name: 'Supplier Ads', cost: 220 }, { name: 'Site Tours', cost: 180 }, { name: 'Bulk Buyer Deals', cost: 260 }] } ] },
  { id: 'transportation', name: 'Transportation', blurb: 'Moving people and goods.', types: [
    { id: 'airline', name: 'Airline', cost: 220000, income: 0, fare: true, managers: [{ id: 'samchen', name: 'Sam Chen', skill: 'Operations', salary: 1 }, { id: 'sampark', name: 'Sam Park', skill: 'Safety', salary: 1 }, { id: 'samross', name: 'Sam Ross', skill: 'Customer Service', salary: 1 }], ops: [{ name: 'Fare Sale', kind: 'timed', mult: 1.5, secs: 60, cost: 2000 }, { name: 'Cargo Contract', kind: 'perm', value: 10, cost: 10000 }] , marketing: [{ name: 'Route Ads', cost: 400 }, { name: 'Travel Agent Deals', cost: 300 }, { name: 'Loyalty Program', cost: 350 }, { name: 'Vacation Packages', cost: 450 }] },
    { id: 'auto', name: 'Auto Dealership', cost: 30000, income: 22, products: [{ name: 'Cars', price: 20000, cost: 6000 }, { name: 'Repairs', price: 200, cost: 60 }], managers: [{ id: 'sampatel', name: 'Sam Patel', skill: 'Sales', salary: 0.4 }, { id: 'samkim', name: 'Sam Kim', skill: 'Service', salary: 0.6 }, { id: 'samdiaz', name: 'Sam Diaz', skill: 'Finance', salary: 0.7 }], ops: [{ name: 'Clearance Sale', kind: 'timed', mult: 1.5, secs: 60, cost: 330 }, { name: 'Service Center', kind: 'perm', value: 5.6, cost: 5600 }]  , marketing: [{ name: 'TV Spots', cost: 100 }, { name: 'Test Drive Weekends', cost: 80 }, { name: 'Service Coupons', cost: 60 }, { name: 'Online Car Ads', cost: 90 }] } ] },
  { id: 'farming', name: 'Farming', blurb: 'Food from the land.', types: [
    { id: 'farm', name: 'Farm', cost: 15000, income: 10, products: [{ name: 'Wheat', price: 5, cost: 1.5 }, { name: 'Vegetables', price: 8, cost: 2.4 }], managers: [{ id: 'samnovak', name: 'Sam Novak', skill: 'Crops', salary: 0.2 }, { id: 'samhassan', name: 'Sam Hassan', skill: 'Irrigation', salary: 0.2 }, { id: 'samliu', name: 'Sam Liu', skill: 'Harvest', salary: 0.3 }], ops: [{ name: 'Harvest Festival', kind: 'timed', mult: 1.5, secs: 60, cost: 150 }, { name: 'Irrigation', kind: 'perm', value: 2.4, cost: 2400 }] , marketing: [{ name: 'Farmers Market Stall', cost: 40 }, { name: 'CSA Boxes', cost: 50 }, { name: 'Local Store Deals', cost: 35 }, { name: 'Harvest Ads', cost: 45 }] },
    { id: 'ranch', name: 'Ranch', cost: 40000, income: 24, products: [{ name: 'Beef', price: 20, cost: 6 }, { name: 'Milk', price: 4, cost: 1.2 }], managers: [{ id: 'samcarter', name: 'Sam Carter', skill: 'Livestock', salary: 0.5 }, { id: 'samreed', name: 'Sam Reed', skill: 'Pasture', salary: 0.6 }, { id: 'samsingh', name: 'Sam Singh', skill: 'Veterinary', salary: 0.7 }], ops: [{ name: 'Rodeo', kind: 'timed', mult: 1.5, secs: 60, cost: 360 }, { name: 'New Pasture', kind: 'perm', value: 6, cost: 6000 }]  , marketing: [{ name: 'Butcher Partnerships', cost: 90 }, { name: 'Farm Tours', cost: 60 }, { name: 'Meat Box Subscriptions', cost: 80 }, { name: 'County Fair Booth', cost: 70 }] } ] },
  { id: 'mining', name: 'Mining', blurb: 'Ore and stone from the ground.', types: [
    { id: 'mine', name: 'Mine', cost: 80000, income: 60, products: [{ name: 'Iron', price: 50, cost: 15 }, { name: 'Coal', price: 30, cost: 9 }], managers: [{ id: 'elenachen', name: 'Elena Chen', skill: 'Geology', salary: 1.2 }, { id: 'elenapark', name: 'Elena Park', skill: 'Safety', salary: 1.5 }, { id: 'elenaross', name: 'Elena Ross', skill: 'Extraction', salary: 1.8 }], ops: [{ name: 'Rich Vein', kind: 'timed', mult: 1.5, secs: 60, cost: 900 }, { name: 'Deep Shaft', kind: 'perm', value: 15, cost: 15000 }] , marketing: [{ name: 'Buyer Contract Ads', cost: 200 }, { name: 'Industry Journal Ads', cost: 150 }, { name: 'Site Visits', cost: 180 }, { name: 'Commodity Expo', cost: 220 }] },
    { id: 'quarry', name: 'Quarry', cost: 35000, income: 24, products: [{ name: 'Stone', price: 20, cost: 6 }, { name: 'Gravel', price: 10, cost: 3 }], managers: [{ id: 'elenapatel', name: 'Elena Patel', skill: 'Extraction', salary: 0.5 }, { id: 'elenakim', name: 'Elena Kim', skill: 'Transport', salary: 0.6 }, { id: 'elenadiaz', name: 'Elena Diaz', skill: 'Sales', salary: 0.7 }], ops: [{ name: 'Big Order', kind: 'timed', mult: 1.5, secs: 60, cost: 360 }, { name: 'New Pit', kind: 'perm', value: 6, cost: 6000 }]  , marketing: [{ name: 'Builder Outreach', cost: 90 }, { name: 'Material Samples', cost: 70 }, { name: 'Contractor Deals', cost: 80 }, { name: 'Local Ads', cost: 60 }] } ] },
  { id: 'technology', name: 'Technology', blurb: 'Software and electronics.', types: [
    { id: 'software', name: 'Software Studio', cost: 40000, income: 30, products: [{ name: 'Apps', price: 5, cost: 1.5 }, { name: 'Software', price: 100, cost: 30 }], managers: [{ id: 'elenanovak', name: 'Elena Novak', skill: 'Engineering', salary: 0.6 }, { id: 'elenahassan', name: 'Elena Hassan', skill: 'Product', salary: 0.8 }, { id: 'elenaliu', name: 'Elena Liu', skill: 'QA', salary: 0.9 }], ops: [{ name: 'Launch Week', kind: 'timed', mult: 1.5, secs: 60, cost: 450 }, { name: 'New Product', kind: 'perm', value: 7.6, cost: 7600 }] , marketing: [{ name: 'App Store Features', cost: 120 }, { name: 'Dev Blog Ads', cost: 80 }, { name: 'Launch Events', cost: 150 }, { name: 'Influencer Demos', cost: 100 }] },
    { id: 'electronics', name: 'Electronics Shop', cost: 20000, income: 14, products: [{ name: 'Phones', price: 500, cost: 150 }, { name: 'Laptops', price: 1000, cost: 300 }], managers: [{ id: 'elenacarter', name: 'Elena Carter', skill: 'Sales', salary: 0.3 }, { id: 'elenareed', name: 'Elena Reed', skill: 'Repair', salary: 0.4 }, { id: 'elenasingh', name: 'Elena Singh', skill: 'Inventory', salary: 0.4 }], ops: [{ name: 'Gadget Expo', kind: 'timed', mult: 1.5, secs: 60, cost: 210 }, { name: 'Repair Lab', kind: 'perm', value: 3.6, cost: 3600 }]  , marketing: [{ name: 'Gadget Reviews', cost: 60 }, { name: 'Trade-in Ads', cost: 50 }, { name: 'Store Demos', cost: 40 }, { name: 'Holiday Sales Ads', cost: 70 }] } ] },
  { id: 'energy', name: 'Energy', blurb: 'Power for everything.', types: [
    { id: 'solar', name: 'Solar Farm', cost: 120000, income: 90, products: [{ name: 'Electricity', price: 10, cost: 3 }, { name: 'Panels', price: 300, cost: 90 }], managers: [{ id: 'marcuschen', name: 'Marcus Chen', skill: 'Engineering', salary: 1.8 }, { id: 'marcuspark', name: 'Marcus Park', skill: 'Maintenance', salary: 2.2 }, { id: 'marcusross', name: 'Marcus Ross', skill: 'Grid', salary: 2.7 }], ops: [{ name: 'Sunny Week', kind: 'timed', mult: 1.5, secs: 60, cost: 1350 }, { name: 'New Array', kind: 'perm', value: 22.4, cost: 22400 }] , marketing: [{ name: 'Green Energy Ads', cost: 250 }, { name: 'Homeowner Seminars', cost: 200 }, { name: 'Utility Partnerships', cost: 300 }, { name: 'Roof Surveys', cost: 180 }] },
    { id: 'powerplant', name: 'Power Plant', cost: 200000, income: 140, products: [{ name: 'Electricity', price: 10, cost: 3 }, { name: 'Steam', price: 20, cost: 6 }], managers: [{ id: 'marcuspatel', name: 'Marcus Patel', skill: 'Engineering', salary: 2.8 }, { id: 'marcuskim', name: 'Marcus Kim', skill: 'Safety', salary: 3.5 }, { id: 'marcusdiaz', name: 'Marcus Diaz', skill: 'Operations', salary: 4.2 }], ops: [{ name: 'Peak Demand', kind: 'timed', mult: 1.5, secs: 60, cost: 2100 }, { name: 'New Turbine', kind: 'perm', value: 35, cost: 35000 }]  , marketing: [{ name: 'Grid Contracts', cost: 400 }, { name: 'Industrial Outreach', cost: 350 }, { name: 'Energy Expo', cost: 300 }, { name: 'Municipal Bids', cost: 450 }] } ] },
  { id: 'finance', name: 'Finance', blurb: 'Money working for money.', types: [
    { id: 'bank', name: 'Bank', cost: 50000, income: 40, products: [{ name: 'Loans', price: 100, cost: 30 }, { name: 'Savings', price: 10, cost: 3 }], managers: [{ id: 'marcusnovak', name: 'Marcus Novak', skill: 'Lending', salary: 0.8 }, { id: 'marcushassan', name: 'Marcus Hassan', skill: 'Risk', salary: 1.0 }, { id: 'marcusliu', name: 'Marcus Liu', skill: 'Compliance', salary: 1.2 }], ops: [{ name: 'Loan Drive', kind: 'timed', mult: 1.5, secs: 60, cost: 600 }, { name: 'New Branch', kind: 'perm', value: 10, cost: 10000 }]  , marketing: [{ name: 'Savings Ads', cost: 150 }, { name: 'Loan Seminars', cost: 120 }, { name: 'Business Banking Ads', cost: 180 }, { name: 'Community Events', cost: 100 }] } ] },
];
const INC_SPECIAL = [
  { id: 'cityhall', name: 'City Hall', cost: 150000, income: 100, products: [{ name: 'Permits', price: 100, cost: 30 }, { name: 'Services', price: 50, cost: 15 }], managers: [{ id: 'marcuscarter', name: 'Marcus Carter', skill: 'Administration', salary: 2.0 }, { id: 'marcusreed', name: 'Marcus Reed', skill: 'Public Works', salary: 2.5 }, { id: 'marcussingh', name: 'Marcus Singh', skill: 'Finance', salary: 3.0 }], ops: [{ name: 'Civic Fair', kind: 'timed', mult: 1.5, secs: 60, cost: 1500 }, { name: 'New Department', kind: 'perm', value: 25, cost: 25000 }] , marketing: [{ name: 'Public Notices', cost: 200 }, { name: 'Civic Newsletters', cost: 150 }, { name: 'Town Hall Events', cost: 180 }, { name: 'Service Fairs', cost: 160 }] },
  { id: 'stadium', name: 'Sports Stadium', cost: 200000, income: 140, products: [{ name: 'Tickets', price: 30, cost: 9 }, { name: 'Food', price: 10, cost: 3 }], managers: [{ id: 'zoechen', name: 'Zoe Chen', skill: 'Events', salary: 2.8 }, { id: 'zoepark', name: 'Zoe Park', skill: 'Operations', salary: 3.5 }, { id: 'zoeross', name: 'Zoe Ross', skill: 'Marketing', salary: 4.2 }], ops: [{ name: 'Championship Game', kind: 'timed', mult: 1.5, secs: 60, cost: 2100 }, { name: 'New Stand', kind: 'perm', value: 35, cost: 35000 }] , marketing: [{ name: 'Game Day Ads', cost: 400 }, { name: 'Season Ticket Drives', cost: 350 }, { name: 'Concert Bookings', cost: 450 }, { name: 'Team Merch Ads', cost: 300 }] },
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
// On-menu products: everything is on the menu unless the player turned
// it off (biz.offMenu[name] = true). Off-menu products sell nothing.
function incBizOnMenu(biz, t) {
  const prods = (t && t.products) ? t.products : [];
  if (!biz || !biz.offMenu) return prods;
  return prods.filter(p => !biz.offMenu[p.name]);
}
function incBizPriceMult(biz, t) {
  const on = incBizOnMenu(biz, t);
  if (!on.length) return 0;
  let sum = 0;
  for (const p of on) { const cur = (biz.prices && biz.prices[p.name] != null) ? biz.prices[p.name] : p.price; sum += cur / p.price; }
  return sum / on.length;
}
function incBizMktCount(biz) {
  if (!biz || !biz.marketing) return 0;
  return Object.values(biz.marketing).filter(Boolean).length;
}
function incBizMktCostPerSec(biz, t) {
  if (!biz || !biz.marketing || !t || !t.marketing) return 0;
  let c = 0;
  t.marketing.forEach((card, i) => { if (biz.marketing[i]) c += card.cost; });
  return c / 600;
}
// People at this business's dot: the airport/hub site on the same dot,
// or people routed straight into the shop from a hub or airport
// (biz.pop). More people = more customers = more sales, up to 5x at
// 4,000 people. A port hauls trade not people, so it gives no boost.
function incBizPeopleMult(biz) {
  try {
    if (!biz || typeof S === 'undefined' || !S) return 1;
    // A shop sharing a dot with a site uses whichever population is
    // larger (site pop or people routed straight to the shop), never
    // a negative population: a negative pop used to flip the whole
    // multiplier below zero and turn the shop's revenue negative.
    let pop = 0;
    if (biz.dotKey && S.airports) {
      const site = S.airports[biz.dotKey];
      if (site && site.pop != null) pop = site.pop;
    }
    if (biz.pop != null) pop = Math.max(pop, biz.pop);
    return 1 + Math.min(Math.max(pop, 0), 4000) / 1000;
  } catch (e) { return 1; }
}
// Per-second money breakdown for one business. Revenue is gross sales
// (base x level x prices + blends + bonuses, boosted by board, managers,
// president, timed boosts, marketing, people, remodels). Costs are the
// income-statement lines: goods sold, rent, salaries, depreciation,
// marketing fees, admin. Net = revenue - costs = what cash actually
// grows by, so the Finance tab and the cash balance always agree.
// Airlines earn fares, not flat sales, so they pay no rent or goods
// costs here — only salaries and marketing fees.
function incBizRates(biz) {
  const zero = { rev: 0, cogs: 0, rent: 0, sal: 0, dep: 0, mkt: 0, adm: 0, net: 0, mult: 1, priceMult: 1 };
  if (!biz) return zero;
  let mult = 1 + 0.1 * incBizBoardCount(biz);
  if (biz.manager) mult *= 1.2;
  if (biz.coffeeManagers) for (const m of INC_COFFEE_MANAGERS) if (biz.coffeeManagers[m.id]) mult *= 1.15;
  if (biz.typeManagers) for (const m of incBizTypeManagers(biz)) if (biz.typeManagers[m.id]) mult *= 1.15;
  mult *= incBizBoostMult(biz);
  mult *= (1 + 0.05 * incBizMktCount(biz));
  mult *= (1 + 0.05 * (biz.remodels || 0));
  mult *= incBizPeopleMult(biz);
  try { if (typeof S !== 'undefined' && S && S.president) mult *= 1.25; } catch (e) {}
  const sec = (typeof incSectorById === 'function' ? incSectorById(biz.sector) : null);
  const t = (typeof incTypeById === 'function' ? incTypeById(sec, biz.type) : null);
  const sal = incBizSalaries(biz);
  if (biz.fare) {
    return { rev: 0, cogs: 0, rent: 0, sal, dep: 0, mkt: incBizMktCostPerSec(biz, t), adm: 0, net: -sal - incBizMktCostPerSec(biz, t), mult, priceMult: 1 };
  }
  const priceMult = incBizPriceMult(biz, t);
  const base = (biz.income || 0) * (biz.level || 1) * priceMult;
  const blend = (biz.blends || []).reduce((s, b) => s + (b.income || 0), 0) * (biz.level || 1);
  const bonus = (biz.bonusIncome || 0) * (biz.level || 1);
  const rev = (base + blend + bonus) * mult;
  const on = incBizOnMenu(biz, t);
  let cogsRatio = 0;
  if (on.length) { let sum = 0; for (const p of on) sum += (p.cost || 0) / p.price; cogsRatio = sum / on.length; }
  const cogs = rev * cogsRatio;
  const rent = (biz.cost || 0) * 0.00002;
  const dep = ((biz.spent || biz.cost || 0) * 0.005) / 600;
  const mkt = incBizMktCostPerSec(biz, t);
  const adm = rev * 0.08;
  return { rev, cogs, rent, sal, dep, mkt, adm, net: rev - cogs - rent - sal - dep - mkt - adm, mult, priceMult };
}
function incBizNetPerSec(biz) { return incBizRates(biz).net; }
// One game week (600 seconds) of money for the Finance tab, with the
// per-product revenue split (equal revenue share across on-menu
// products) and the game date, so bars and statement lines have labels.
function incBizWeekly(biz) {
  const r = incBizRates(biz);
  const sec = (typeof incSectorById === 'function' ? incSectorById(biz.sector) : null);
  const t = (typeof incTypeById === 'function' ? incTypeById(sec, biz.type) : null);
  const on = incBizOnMenu(biz, t);
  const prodRev = {}, prodUnits = {};
  if (on.length && r.rev > 0) {
    const share = (r.rev * 600) / on.length;
    for (const p of on) {
      const cur = (biz.prices && biz.prices[p.name] != null) ? biz.prices[p.name] : p.price;
      prodRev[p.name] = Math.round(share);
      prodUnits[p.name] = Math.round(share / cur);
    }
  }
  return { rev: Math.round(r.rev * 600), cogs: Math.round(r.cogs * 600), rent: Math.round(r.rent * 600), sal: Math.round(r.sal * 600), dep: Math.round(r.dep * 600), mkt: Math.round(r.mkt * 600), adm: Math.round(r.adm * 600), net: Math.round(r.net * 600), prodRev, prodUnits };
}
// Customer reviews: Price falls as you raise prices, Product follows
// margins, Service follows hired managers (1.0 with none — you run it
// yourself), Atmosphere follows level and remodels. Overall is the
// average of the four, like the reference sheet's 2.9.
function incBizRatings(biz) {
  const sec = (typeof incSectorById === 'function' ? incSectorById(biz.sector) : null);
  const t = (typeof incTypeById === 'function' ? incTypeById(sec, biz.type) : null);
  const r = incBizRates(biz);
  const on = incBizOnMenu(biz, t);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const price = r.priceMult > 0 ? clamp(5 - (r.priceMult - 1) * 4, 1, 5) : 3;
  let product = 3;
  if (on.length) { let sum = 0; for (const p of on) { const margin = (p.price - (p.cost || 0)) / p.price; sum += clamp(1 + margin * 4, 1, 5); } product = sum / on.length; }
  let mgrs = biz.manager ? 1 : 0;
  if (biz.coffeeManagers) mgrs += Object.values(biz.coffeeManagers).filter(Boolean).length;
  if (biz.typeManagers) mgrs += Object.values(biz.typeManagers).filter(Boolean).length;
  const service = clamp(1 + mgrs * 0.5 + incBizBoardCount(biz) * 0.2, 1, 5);
  const atmosphere = clamp(2 + (biz.level || 1) * 0.5 + (biz.remodels || 0) * 0.5, 1, 5);
  const overall = (price + product + service + atmosphere) / 4;
  return { price, product, service, atmosphere, overall, reviews: biz.reviews || 0 };
}
function incBizFareMult(biz) {
  // Fares get the same boosts as shop sales, so a General Manager,
  // type managers and the President are not pure salary drains on
  // an Airline: GM +20%, each type manager +15%, President +25%.
  let m = (1 + 0.1 * incBizBoardCount(biz)) * incBizBoostMult(biz) * (1 + 0.05 * incBizMktCount(biz));
  if (biz && biz.manager) m *= 1.2;
  if (biz && biz.typeManagers && typeof incBizTypeManagers === 'function') for (const tm of incBizTypeManagers(biz)) if (biz.typeManagers[tm.id]) m *= 1.15;
  try { if (typeof S !== 'undefined' && S && S.president) m *= 1.25; } catch (e) {}
  return m;
}
// Full US: all 50 states (US_CAPITALS, Alaska and Hawaii included)
// are in S.incStates.
function incFullUS() {
  try {
    if (typeof S === 'undefined' || !S || !S.incStates) return false;
    if (typeof US_CAPITALS === 'undefined') return S.incStates.length >= 50;
    return US_CAPITALS.every(u => S.incStates.includes(u.s));
  } catch (e) { return false; }
}
// IPO cash: profitable businesses pay 10x annual profit minus 7% fee;
// airlines pay 5x total spent minus 7% (fares do not annualize cleanly).
// Annual profit uses game time: 52 weeks x 600 seconds per week.
function incIPOValue(biz) {
  if (!biz) return 0;
  if (biz.type === 'airline') {
    // Airlines IPO on actual fare performance, not spend alone:
    // no fares or under 7 game days of operation = no IPO value,
    // so build-hire-IPO instantly for 5x spend no longer works.
    // Fare rate is annualised like other businesses (52 weeks x
    // 600 sec/year), capped at the old 5x spend ceiling.
    const built = (biz.builtDay != null) ? biz.builtDay : ((typeof S !== 'undefined' && S) ? S.day : 0);
    const days = Math.max(0, ((typeof S !== 'undefined' && S) ? S.day : 0) - built);
    if (!biz.fareEarned || days < 7) return 0;
    const farePerSec = biz.fareEarned / Math.max(1, days * 600 / 7);
    const annualFare = farePerSec * 31200;
    return Math.round(Math.min((biz.spent || biz.cost || 0) * 5 * 0.93, annualFare * 10 * 0.93));
  }
  const annual = incBizNetPerSec(biz) * 31200;
  if (annual <= 0) return 0;
  return Math.round(annual * 10 * 0.93);
}
