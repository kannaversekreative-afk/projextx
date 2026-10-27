// ---------- farms > factories > shops + real estate ----------
// The chain, added ON TOP of the existing economy — sectors still run
// and are profitable by themselves, this layer only moves costs and
// demand a little, in the direction the chain actually flows.
// - Farms produce raw goods: coffee beans, corn, beef, chicken, etc.
//   There is no separate coffee farm — farms are farms, they produce
//   raw goods, full stop.
// - Factories buy raw goods from farms. If farm output is short
//   against factory demand in a country, factory costs rise.
// - Shops buy finished goods from factories. If factory output is
//   short against shop demand, shop demand falls.
// - Effects are clamped (factory costs 0.9x–1.5x, shop demand
//   0.7x–1.1x) and lag one week: this week's company results set
//   next week's factors, so there is no circular same-week math.
// - Real estate: every lot's rent goes to a real estate company in
//   that country. If a country has no real estate company, one is
//   created (Real Estate – Commercial, as an extra business). Rent
//   that used to vanish now lands on that company's weekly profit
//   and average, which is what moves its value.
const FARM_SECTORS = ['Crop Farming', 'Livestock Farming', 'Fishing & Aquaculture', 'Forestry & Timber'];
const FACTORY_PROCESSING = ['Food Processing', 'Beverages & Tobacco', 'Dairy Products', 'Meat Processing', 'Bakery & Confectionery', 'Animal Feed'];
function chainRole(sector) {
  if (FARM_SECTORS.includes(sector)) return 'farm';
  if (FACTORY_PROCESSING.includes(sector)) return 'factory';
  const g = (typeof sectorGroupOf === 'function') ? sectorGroupOf(sector) : null;
  if (g === 'mfg' || g === 'tech') return 'factory';
  if (g === 'service') return 'shop';
  return 'other';
}
function supplyFor(a3) {
  if (!S.supply) S.supply = {};
  if (!S.supply[a3]) S.supply[a3] = { farmCost: 1, shopDemand: 1, farmOut: 0, factoryOut: 0, shopOut: 0 };
  return S.supply[a3];
}
function supplyChainWeek() {
  if (!S.supply) S.supply = {};
  for (const a3 in (S.co || {})) {
    const companies = (typeof businessesInCountry === 'function') ? businessesInCountry(a3) : [S.co[a3]];
    let farmOut = 0, factoryDemand = 0, factoryOut = 0, shopDemand = 0;
    companies.forEach(c => {
      const role = chainRole(c.sector);
      const rev = Math.max(0, (c.week || {}).rev || 0);
      if (role === 'farm') farmOut += rev;
      else if (role === 'factory') { factoryOut += rev; factoryDemand += rev * 0.6; }
      else if (role === 'shop') shopDemand += rev;
    });
    const s = supplyFor(a3);
    s.farmOut = Math.round(farmOut); s.factoryOut = Math.round(factoryOut); s.shopOut = Math.round(shopDemand);
    // Farm shortage -> factory costs up; farm surplus -> costs down a little.
    const farmRatio = factoryDemand > 0 ? farmOut / factoryDemand : 1;
    s.farmCost = Math.max(0.9, Math.min(1.5, farmRatio > 0 ? 1 / Math.max(0.5, farmRatio) : 1.5));
    if (farmRatio > 1) s.farmCost = Math.max(0.9, 1 - Math.min(0.1, (farmRatio - 1) * 0.1));
    // Factory shortage -> shop demand down; surplus -> demand up a little.
    const factoryRatio = shopDemand > 0 ? factoryOut / shopDemand : 1;
    s.shopDemand = Math.max(0.7, Math.min(1.1, factoryRatio));
  }
}
function realEstateOwner(a3) {
  if (!S.landOwners) S.landOwners = {};
  const cached = S.landOwners[a3];
  if (cached) {
    const c = cached === a3 ? S.co[a3] : (S.extra || {})[cached];
    if (c && c.sector && c.sector.startsWith('Real Estate')) return c;
  }
  const companies = (typeof businessesInCountry === 'function') ? businessesInCountry(a3) : [S.co[a3]];
  const existing = companies.filter(c => c.sector && c.sector.startsWith('Real Estate')).sort((x, y) => companyValue(y) - companyValue(x))[0];
  if (existing) { S.landOwners[a3] = existing.a3 === a3 && S.co[a3] === existing ? a3 : existing.id; return existing; }
  try {
    const k = W.byA3[a3];
    if (!k || typeof makeExtraBusiness !== 'function') return null;
    const usedNames = new Set([...Object.values(S.co || {}).map(c => c.name), ...Object.values(S.extra || {}).map(c => c.name)]);
    const usedSyms = new Set([...Object.values(S.co || {}).map(c => c.sym), ...Object.values(S.extra || {}).map(c => c.sym)]);
    const ex = makeExtraBusiness(k, 'Real Estate – Commercial', usedNames, usedSyms, 're' + ((S.extraSeq = (S.extraSeq || 1000) + 1)));
    if (!S.extra) S.extra = {};
    S.extra[ex.id] = ex;
    S.landOwners[a3] = ex.id;
    return ex;
  } catch (e) { return null; }
}
function realEstateWeek() {
  if (!S.lastRent) S.lastRent = {};
  const pool = {};
  // Company locations pay rent to the real estate owner in that city.
  for (const a3 in (S.co || {})) {
    const c = S.co[a3];
    (c.locs || []).forEach(l => {
      const cityA3 = (l.city != null && W.cities[l.city]) ? W.cities[l.city].a3 : a3;
      pool[cityA3] = (pool[cityA3] || 0) + (l.rent || 0);
    });
  }
  // Player stores pay rent too.
  (S.stores || []).forEach(st => {
    const cityA3 = (st.cityId != null && W.cities[st.cityId]) ? W.cities[st.cityId].a3 : S.home;
    pool[cityA3] = (pool[cityA3] || 0) + (st.rent || 0);
  });
  for (const a3 in pool) {
    const owner = realEstateOwner(a3);
    if (!owner) continue;
    const rent = Math.round(pool[a3]);
    if (owner.week) owner.week.profit = Math.round((owner.week.profit || 0) + rent);
    owner.avg = Math.round((owner.avg || 0) + rent * 0.2);
    owner.rentIncome = rent;
    S.lastRent[a3] = rent;
  }
}
