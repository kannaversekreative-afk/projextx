// ---------- ETFs ----------
// ETF rules, decided by the assistant (Nicholas left Q2 open, and
// said "up to you" on the other undecided values):
// - An ETF is a basket of CORE businesses (flagships, by country).
//   Sector ETFs hold the top 20 flagships in one sector group
//   (food, energy, mfg, tech, transport, service, finance), weighted
//   by GDP. The Broad ETF holds the top 20 flagships overall.
// - The manager is a finance-sector company — the same kind of company
//   that does IPOs — or you, as a player. User AND CPU can create one.
// - "IPO" for an ETF means LISTING it so it trades, not a cash raise:
//   the manager does not own the basket, so there is no $100M windfall.
//   The manager's profit is the fee: 0.50% a year, applied as a drag
//   on the ETF price. That is what makes creating one worthwhile, and
//   what stops it being free money.
// - ETF price starts at $100 and follows the basket: price = 100 *
//   (basket now / basket at creation) * (1 - fee) ^ years.
// - You buy and sell ETF shares with business cash, like stocks, in
//   S.etfHoldings (same {qty, cost} shape as stock holdings).
const ETF_FEE = 0.005;
const ETF_START_PRICE = 100;
const ETF_SHARES = 1000000;
const ETF_GROUPS = [
  { id: 'broad', name: 'Broad', sym: 'WBRO' },
  { id: 'food', name: 'Food', sym: 'WFOO' },
  { id: 'energy', name: 'Energy', sym: 'WENR' },
  { id: 'mfg', name: 'Manufacturing', sym: 'WMFG' },
  { id: 'tech', name: 'Technology', sym: 'WTEC' },
  { id: 'transport', name: 'Transport', sym: 'WTRN' },
  { id: 'service', name: 'Services', sym: 'WSRV' },
  { id: 'finance', name: 'Finance', sym: 'WFIN' }
];
function sectorGroupOf(sectorName) {
  // Group lives on LEADER_SECTORS, not on SECTORS: expandSectors()
  // copies leader sectors into SECTORS without the g field, so
  // SECTORS[sector].g is undefined for all 350 leader sectors.
  try {
    if (typeof LEADER_SECTOR_BY_NAME !== 'undefined' && LEADER_SECTOR_BY_NAME[sectorName]) return LEADER_SECTOR_BY_NAME[sectorName].g;
  } catch (e) {}
  try {
    if (typeof SECTORS !== 'undefined' && SECTORS[sectorName]) return SECTORS[sectorName].g;
  } catch (e) {}
  return null;
}
function etfBasketFor(group) {
  const flags = Object.values(S.co || {});
  let pool = [];
  if (group === 'broad') pool = flags.slice();
  else pool = flags.filter(c => sectorGroupOf(c.sector) === group);
  pool.sort((a, b) => (W.byA3[b.a3] ? W.byA3[b.a3].gdp0 : 0) - (W.byA3[a.a3] ? W.byA3[a.a3].gdp0 : 0));
  pool = pool.slice(0, 20);
  const tot = pool.reduce((s, c) => s + (W.byA3[c.a3] ? W.byA3[c.a3].gdp0 : 0), 0) || 1;
  return pool.map(c => ({ a3: c.a3, weight: (W.byA3[c.a3] ? W.byA3[c.a3].gdp0 : 0) / tot }));
}
function etfBasketValue(etf) {
  return (etf.basket || []).reduce((s, h) => { const c = S.co[h.a3]; return s + h.weight * (c ? (c.price || 0) : 0); }, 0);
}
function etfPrice(etf) {
  if (!etf || !etf.baseValue) return ETF_START_PRICE;
  const years = Math.max(0, (S.day - (etf.createdDay || S.day)) / 365);
  return ETF_START_PRICE * (etfBasketValue(etf) / etf.baseValue) * Math.pow(1 - ETF_FEE, years);
}
function createETF(group, manager) {
  if (!S.etfs) S.etfs = [];
  const g = ETF_GROUPS.find(x => x.id === group);
  if (!g) return 'That ETF group does not exist.';
  const basket = etfBasketFor(group);
  if (basket.length < 3) return 'Not enough core businesses in that group yet to make an ETF.';
  const baseValue = basket.reduce((s, h) => { const c = S.co[h.a3]; return s + h.weight * (c ? (c.price || 0) : 0); }, 0);
  if (!baseValue) return 'Basket has no price yet — try again after markets move.';
  const n = S.etfs.filter(e => e.group === group).length + 1;
  const etf = {
    id: uid(), group, name: n === 1 ? `${g.name} ETF` : `${g.name} ETF ${n}`,
    sym: n === 1 ? g.sym : g.sym + n,
    manager: manager || 'player', basket, baseValue, createdDay: S.day,
    shares: ETF_SHARES, listed: true
  };
  S.etfs.push(etf);
  const mgrName = manager && manager !== 'player' ? (S.co[manager] ? S.co[manager].name : manager) : 'you';
  if (typeof news === 'function') news('Business', `${etf.name} IPO'd — listed at $100, managed by ${mgrName} at a ${(ETF_FEE * 100).toFixed(2)}% yearly fee.`, S.home);
  return null;
}
function buyETF(id, qty) {
  const etf = (S.etfs || []).find(e => e.id === id);
  if (!etf) return 'That ETF does not exist.';
  qty = Math.floor(qty);
  if (!qty || qty < 1) return 'Buy at least 1 share.';
  const price = etfPrice(etf), total = price * qty;
  if (S.cash < total) return `Not enough business cash for ${qty} shares at ${fmtMoney(price, true)} each.`;
  if (!S.etfHoldings) S.etfHoldings = {};
  const h = S.etfHoldings[id] || { qty: 0, cost: price };
  h.cost = (h.cost * h.qty + price * qty) / (h.qty + qty); h.qty += qty;
  S.etfHoldings[id] = h; S.cash -= total;
  if (typeof S.stats === 'object') S.stats.trades = (S.stats.trades || 0) + 1;
  return null;
}
function sellETF(id, qty) {
  const etf = (S.etfs || []).find(e => e.id === id);
  if (!etf) return 'That ETF does not exist.';
  qty = Math.floor(qty);
  const h = (S.etfHoldings || {})[id];
  if (!h || h.qty < qty) return 'You do not hold that many shares.';
  const price = etfPrice(etf);
  S.cash += price * qty; h.qty -= qty;
  if (h.qty === 0) delete S.etfHoldings[id];
  return null;
}
function etfHoldingsValue() {
  let v = 0;
  for (const id in (S.etfHoldings || {})) {
    const etf = (S.etfs || []).find(e => e.id === id);
    if (etf) v += S.etfHoldings[id].qty * etfPrice(etf);
  }
  return v;
}
// CPU ETF creation, weekly: a finance-sector company that does not
// already manage an ETF may launch one for a group nobody covers yet.
// Slow on purpose — at most one new CPU ETF a week, so the list grows
// over years, not overnight.
function etfWeek() {
  if (!S.etfs) S.etfs = [];
  if (Math.random() > 0.25) return;
  const managers = Object.values(S.co || {}).filter(c => sectorGroupOf(c.sector) === 'finance' && !controlled(c.a3));
  if (!managers.length) return;
  const covered = new Set(S.etfs.map(e => e.group));
  const open = ETF_GROUPS.filter(g => !covered.has(g.id));
  if (!open.length) return;
  const mgr = managers[Math.floor(Math.random() * managers.length)];
  createETF(open[Math.floor(Math.random() * open.length)].id, mgr.a3);
}
