// ---------- Milestones: progression tree ----------
// Like the Development tree in city builders: nodes in chains, each node
// unlocks something. 10 categories x 5 chains x 10 rungs = 500 nodes.
// Only 10 nodes are visible at a time (one chain per page).
// FOR NOW everything is unlocked: msLocked() always returns false, so no
// node is ever gated. When gating lands, flip that one function and the
// UI (locks, previous-node rules) follows. No save data is needed yet.
const MS_PAGE_SIZE = 10;
const MS_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
// Ladder: name, icon, unit, money (format thresholds as money), gate
// (what the chain will unlock later), steps (10 escalating thresholds).
const MS_CATS = [
  { name: 'Business', icon: '💼', ladders: [
    { name: 'Founder', icon: '🏢', unit: 'companies founded', gate: 'Company slots', steps: [1, 2, 3, 5, 8, 12, 20, 35, 50, 100] },
    { name: 'Tycoon', icon: '📈', unit: 'company value', money: true, gate: 'IPO access', steps: [1e6, 1e7, 5e7, 1e8, 5e8, 1e9, 5e9, 1e10, 5e10, 1e11] },
    { name: 'Public', icon: '🔔', unit: 'IPOs completed', gate: 'Stock market tiers', steps: [1, 2, 3, 5, 8, 12, 20, 30, 50, 100] },
    { name: 'Boardroom', icon: '👔', unit: 'board members hired', gate: 'Executive hires', steps: [1, 3, 5, 10, 15, 25, 40, 60, 100, 200] },
    { name: 'Empire', icon: '🌐', unit: 'industries entered', gate: 'New sectors', steps: [1, 2, 3, 4, 5, 6, 8, 10, 12, 15] },
  ] },
  { name: 'Stores', icon: '🏪', ladders: [
    { name: 'Shopkeeper', icon: '🏪', unit: 'stores owned', gate: 'Store upgrades', steps: [1, 5, 10, 25, 50, 100, 200, 350, 500, 1000] },
    { name: 'Crew', icon: '👷', unit: 'employees hired', gate: 'Manager levels', steps: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000] },
    { name: 'Takings', icon: '🛒', unit: 'weekly store sales', money: true, gate: 'Premium locations', steps: [1e3, 1e4, 1e5, 5e5, 1e6, 5e6, 1e7, 5e7, 1e8, 1e9] },
    { name: 'Landlord', icon: '🔑', unit: 'leased stores', gate: 'Lease terms', steps: [1, 5, 10, 20, 40, 75, 125, 200, 350, 500] },
    { name: 'Star', icon: '🌟', unit: 'star staff hired', gate: 'Star perks', steps: [1, 2, 5, 10, 20, 35, 50, 75, 100, 200] },
  ] },
  { name: 'Money', icon: '💰', ladders: [
    { name: 'Cash', icon: '💵', unit: 'personal cash', money: true, gate: 'Bank tiers', steps: [1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13] },
    { name: 'Borrower', icon: '🏦', unit: 'loans taken', gate: 'Loan sizes', steps: [1, 2, 5, 10, 20, 35, 50, 75, 100, 200] },
    { name: 'Investor', icon: '📊', unit: 'stocks held', gate: 'ETF access', steps: [1, 5, 10, 25, 50, 100, 200, 350, 500, 1000] },
    { name: 'Dividends', icon: '💸', unit: 'dividends received', money: true, gate: 'Dividend boosts', steps: [1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12] },
    { name: 'Crypto', icon: '₿', unit: 'crypto bets won', gate: 'Crypto stakes', steps: [1, 5, 10, 25, 50, 100, 200, 350, 500, 1000] },
  ] },
  { name: 'Sports', icon: '🏆', ladders: [
    { name: 'Champion', icon: '🏆', unit: 'championships won', gate: 'League tiers', steps: [1, 2, 3, 5, 8, 12, 20, 30, 50, 100] },
    { name: 'Dynasty', icon: '📅', unit: 'seasons completed', gate: 'Franchise modes', steps: [1, 2, 3, 5, 8, 12, 20, 30, 50, 100] },
    { name: 'Scout', icon: '🔍', unit: 'players drafted', gate: 'Draft rounds', steps: [1, 5, 10, 25, 50, 100, 200, 350, 500, 1000] },
    { name: 'Trader', icon: '🔄', unit: 'trades completed', gate: 'Trade options', steps: [1, 5, 10, 25, 50, 100, 200, 350, 500, 1000] },
    { name: 'Fan', icon: '🎟️', unit: 'games played', gate: 'Stadium upgrades', steps: [1, 10, 25, 50, 100, 200, 350, 500, 1000, 2500] },
  ] },
  { name: 'Politics', icon: '🏛️', ladders: [
    { name: 'Office', icon: '🗳️', unit: 'elections won', gate: 'Higher offices', steps: [1, 2, 3, 5, 8, 12, 20, 30, 50, 100] },
    { name: 'Lawmaker', icon: '📜', unit: 'laws passed', gate: 'Law types', steps: [1, 5, 10, 25, 50, 100, 200, 350, 500, 1000] },
    { name: 'Diplomat', icon: '🤝', unit: 'treaties signed', gate: 'Alliances', steps: [1, 2, 5, 10, 20, 35, 50, 75, 100, 200] },
    { name: 'Campaigner', icon: '📣', unit: 'votes received', gate: 'Campaign tools', steps: [1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12] },
    { name: 'Capital', icon: '🏛️', unit: 'capital districts built', gate: 'District projects', steps: [1, 2, 3, 5, 8, 12, 20, 30, 50, 100] },
  ] },
  { name: 'Military', icon: '🎖️', ladders: [
    { name: 'General', icon: '⭐', unit: 'wars won', gate: 'War options', steps: [1, 2, 3, 5, 8, 12, 20, 30, 50, 100] },
    { name: 'Conqueror', icon: '🗺️', unit: 'territory taken', gate: 'Occupation policies', steps: [1, 5, 10, 25, 50, 100, 200, 350, 500, 1000] },
    { name: 'Arsenal', icon: '🛡️', unit: 'bases built', gate: 'Base upgrades', steps: [1, 2, 5, 10, 20, 35, 50, 75, 100, 200] },
    { name: 'Veteran', icon: '⚔️', unit: 'battles fought', gate: 'Battle tactics', steps: [1, 10, 25, 50, 100, 200, 350, 500, 1000, 2500] },
    { name: 'Peacemaker', icon: '🕊️', unit: 'peace treaties', gate: 'Diplomacy options', steps: [1, 2, 3, 5, 8, 12, 20, 30, 50, 100] },
  ] },
  { name: 'Mars', icon: '🚀', ladders: [
    { name: 'Pioneer', icon: '🚀', unit: 'rockets launched', gate: 'Rocket types', steps: [1, 2, 3, 5, 8, 12, 20, 30, 50, 100] },
    { name: 'Miner', icon: '⛏️', unit: 'mine sites owned', gate: 'Mining gear', steps: [1, 2, 3, 5, 8, 14, 20, 30, 50, 100] },
    { name: 'Yield', icon: '🌌', unit: 'Mars yield earned', money: true, gate: 'Yield shares', steps: [1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12] },
    { name: 'Expedition', icon: '🛰️', unit: 'expeditions sent', gate: 'Mission types', steps: [1, 2, 5, 10, 20, 35, 50, 75, 100, 200] },
    { name: 'Terraformer', icon: '🌱', unit: 'Mars projects', gate: 'Terraforming', steps: [1, 2, 3, 5, 8, 12, 20, 30, 50, 100] },
  ] },
  { name: 'People', icon: '👥', ladders: [
    { name: 'Citizens', icon: '👥', unit: 'population governed', gate: 'City services', steps: [1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 5e9, 1e10, 5e10] },
    { name: 'Mentor', icon: '🧑‍🏫', unit: 'advisors hired', gate: 'Advisor slots', steps: [1, 2, 3, 5, 8, 12, 20, 30, 50, 100] },
    { name: 'Manager', icon: '💼', unit: 'managers hired', gate: 'Management tiers', steps: [1, 5, 10, 25, 50, 100, 200, 350, 500, 1000] },
    { name: 'Following', icon: '⭐', unit: 'followers gained', gate: 'Media options', steps: [1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12] },
    { name: 'Network', icon: '📇', unit: 'contacts made', gate: 'Contact perks', steps: [1, 5, 10, 25, 50, 100, 200, 350, 500, 1000] },
  ] },
  { name: 'World', icon: '🌍', ladders: [
    { name: 'Traveller', icon: '✈️', unit: 'cities visited', gate: 'Fast travel', steps: [1, 5, 10, 25, 50, 75, 100, 150, 200, 205] },
    { name: 'Trader', icon: '🌐', unit: 'trade deals signed', gate: 'Trade routes', steps: [1, 5, 10, 25, 50, 100, 200, 350, 500, 1000] },
    { name: 'Explorer', icon: '🧭', unit: 'countries visited', gate: 'Embassies', steps: [1, 2, 3, 5, 8, 12, 17, 20, 30, 50] },
    { name: 'Ally', icon: '🤝', unit: 'alliances formed', gate: 'Alliance perks', steps: [1, 2, 3, 5, 8, 12, 20, 30, 50, 100] },
    { name: 'Cartographer', icon: '🗺️', unit: 'regions mapped', gate: 'Map layers', steps: [1, 5, 10, 25, 50, 100, 150, 200, 250, 500] },
  ] },
  { name: 'Legacy', icon: '👑', ladders: [
    { name: 'Weeks', icon: '📅', unit: 'weeks played', gate: 'Era bonuses', steps: [1, 4, 12, 26, 52, 104, 208, 365, 520, 1000] },
    { name: 'Papers', icon: '📰', unit: 'newspapers read', gate: 'Press options', steps: [1, 5, 10, 25, 50, 100, 200, 350, 500, 1000] },
    { name: 'Goals', icon: '✅', unit: 'daily goals completed', gate: 'Goal rewards', steps: [1, 5, 10, 25, 50, 100, 200, 350, 500, 1000] },
    { name: 'Comeback', icon: '🔄', unit: 'recoveries from bankruptcy', gate: 'Bailout options', steps: [1, 2, 3, 5, 8, 12, 20, 30, 50, 100] },
    { name: 'Legend', icon: '👑', unit: 'milestones earned', gate: 'Legend rewards', steps: [10, 25, 50, 100, 150, 200, 250, 300, 400, 500] },
  ] },
];
// Flat node list for one category: 5 chains x 10 rungs = 50 nodes.
// id: "catIdx-ladderIdx-rungIdx". prev: previous rung in the same chain.
const msNodes = (ci) => {
  const out = [];
  MS_CATS[ci].ladders.forEach((lad, li) => {
    lad.steps.forEach((v, ri) => {
      out.push({ id: ci + '-' + li + '-' + ri, cat: ci, lad: li, rung: ri, ladder: lad.name, icon: lad.icon, unit: lad.unit, money: !!lad.money, gate: lad.gate, target: v, title: lad.name + ' ' + MS_ROMAN[ri], prev: ri ? ci + '-' + li + '-' + (ri - 1) : null });
    });
  });
  return out;
};
const MS_TOTAL = MS_CATS.reduce((n, c) => n + c.ladders.reduce((m, l) => m + l.steps.length, 0), 0); // 500
const msNodeById = (id) => {
  if (!id) return null;
  const p = id.split('-').map(Number);
  const nodes = msNodes(p[0]);
  return nodes.find(n => n.id === id) || null;
};
// Everything is unlocked for now. Flip this when milestone gating lands.
const msLocked = (node) => false;
const msFmt = (node) => node.money ? fmtMoney(node.target) : node.target.toLocaleString();
