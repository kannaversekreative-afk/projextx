'use strict';
// Offices and board rooms.
// A board is 5 seats: CEO, CFO, COO, CMO, CTO. Hire all 5 and the board
// room is full.
// Hiring is NOT just a bill. For an empty seat you find candidates,
// each with their own Leadership / Expertise / Loyalty, current salary
// and ask. You offer a salary, or salary plus a stock grant (stock
// option or RSU), and they accept or deny. Higher-level members do
// more and make you more, and they want more money and more stock.
// Offer state lives in UI.hire (not in the DOM), so a panel rerender
// from a stepper click never loses the offer in progress.
// CPU countries are NOT touched here: they just sit there for now.
// Core game first, CPU competition later.
var BOARD_ROLES = [
  { role: 'CEO', salary: 240000 }, { role: 'CFO', salary: 200000 },
  { role: 'COO', salary: 180000 }, { role: 'CMO', salary: 170000 },
  { role: 'CTO', salary: 190000 },
];
var BOARD_FIRST = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Jamie', 'Robin', 'Drew', 'Avery', 'Quinn', 'Noah', 'Eden', 'Finn', 'Wren'];
var BOARD_LAST = ['Cole', 'Reed', 'Hayes', 'Frost', 'Lane', 'Quinn', 'Blake', 'Ward', 'Fox', 'Gray', 'Stone', 'Marsh', 'Vale', 'Pike'];
var BOARD_TITLES = {
  CEO: ['Chief Executive', 'Managing Director', 'Company President'],
  CFO: ['Finance Director', 'Head of Finance', 'VP Finance'],
  COO: ['Operations Director', 'Head of Operations', 'VP Operations'],
  CMO: ['Marketing Director', 'Head of Marketing', 'VP Marketing'],
  CTO: ['Technology Director', 'Head of Engineering', 'VP Engineering'],
};
function boardName() { return BOARD_FIRST[Math.floor(Math.random() * BOARD_FIRST.length)] + ' ' + BOARD_LAST[Math.floor(Math.random() * BOARD_LAST.length)]; }
function ensureBoard(e) {
  if (!e) return [];
  if (!Array.isArray(e.board)) e.board = [];
  // Old saves hired members with no skills: give them a middle level
  // so the benefit math works and nothing breaks.
  e.board.forEach(m => {
    if (m.lead == null) m.lead = 60; if (m.exp == null) m.exp = 60; if (m.loy == null) m.loy = 60;
    if (m.level == null) m.level = boardLevel(m);
  });
  return e.board;
}
function boardLevel(m) {
  const avg = ((m.lead || 0) + (m.exp || 0) + (m.loy || 0)) / 3;
  return avg >= 85 ? 5 : avg >= 70 ? 4 : avg >= 55 ? 3 : avg >= 40 ? 2 : 1;
}
function boardFull(e) { const b = ensureBoard(e); return BOARD_ROLES.every(r => b.some(x => x.role === r.role)); }
function boardWeeklyCost(e) { return ensureBoard(e).reduce((a, x) => a + (x.salary || 0) / 52, 0); }
// Benefit rate: each member adds skillAvg/100 * 2% of the base
// (company weekly revenue, or team weekly net). Higher level = higher
// skills = higher rate, and higher salary, so the trade is real.
function boardBoost(e) {
  return ensureBoard(e).reduce((a, m) => a + (((m.lead || 0) + (m.exp || 0) + (m.loy || 0)) / 3 / 100) * 0.02, 0);
}
function boardCandidates(e, role) {
  if (!e) return [];
  if (!e.candPool) e.candPool = {};
  if (!Array.isArray(e.candPool[role])) {
    const used = new Set(ensureBoard(e).map(m => m.name));
    const list = [];
    for (let i = 0; i < 3; i++) {
      let name; do { name = boardName(); } while (used.has(name));
      used.add(name);
      const lead = 25 + Math.floor(Math.random() * 71);
      const exp = 25 + Math.floor(Math.random() * 71);
      const loy = 25 + Math.floor(Math.random() * 71);
      const m = { lead, exp, loy }; m.level = boardLevel(m);
      const cur = Math.round((120000 + m.level * 60000 + Math.random() * 60000) / 1000) * 1000;
      const ask = Math.round(cur * (1 + 0.05 * m.level) / 1000) * 1000;
      list.push({ id: 'cand' + Date.now() + i + Math.floor(Math.random() * 1000), name, role,
        title: BOARD_TITLES[role][Math.floor(Math.random() * BOARD_TITLES[role].length)],
        lead, exp, loy, level: m.level, curSalary: cur, ask });
    }
    e.candPool[role] = list;
  }
  return e.candPool[role];
}
function boardGrantValue(e, grantType, shares) {
  if (!grantType || grantType === 'none' || !shares) return 0;
  // Listed: current share price. Unlisted: fair value per share.
  // Teams have no stock, so their grants are worth nothing here and
  // the UI hides grant controls for teams.
  try {
    if (e.listed && e.price) return shares * e.price;
    if (typeof companyFairTotal === 'function') return shares * (companyFairTotal(e) / Math.max(1, e.shares || 1000000));
  } catch (err) {}
  return 0;
}
// Offer a candidate a job. Returns null on accept, an error string on
// deny (candidate walks away) or on a bad offer.
function offerBoard(e, role, cand, salary, grantType, shares) {
  if (!e || !cand) return 'Candidate not found.';
  const b = ensureBoard(e);
  if (b.some(x => x.role === role)) return `The ${role} seat is already filled.`;
  if (!salary || salary < 1000) return 'Offer a salary first.';
  const grantVal = boardGrantValue(e, grantType, shares || 0);
  const meetsAsk = salary >= cand.ask;
  const grantCovers = salary >= cand.ask * 0.85 && grantVal >= (cand.ask - salary) * 52;
  if (!meetsAsk && !grantCovers) {
    // They decline and move on: lowballing loses the candidate.
    if (e.candPool && e.candPool[role]) e.candPool[role] = e.candPool[role].filter(c => c.id !== cand.id);
    return `${cand.name} declined. Your offer was below their ask of ${fmtMoney(cand.ask)}/yr.`;
  }
  const grant = (!grantType || grantType === 'none' || !shares) ? null
    : { type: grantType, shares, strike: (e.listed && e.price) ? e.price : null, start: (typeof S !== 'undefined' && S) ? S.day : 0, vestYears: 4, cliffYears: 1 };
  b.push({ role, name: cand.name, salary, lead: cand.lead, exp: cand.exp, loy: cand.loy, level: cand.level, grant });
  if (e.candPool && e.candPool[role]) e.candPool[role] = e.candPool[role].filter(c => c.id !== cand.id);
  return null;
}
function hireBoard(e, role) {
  // Kept for old callers: now it means "find candidates", not an
  // instant hire. The UI no longer calls this to fill a seat.
  if (!e) return 'Business or team not found.';
  boardCandidates(e, role);
  return null;
}
function fireBoard(e, role) {
  if (!e) return 'Business or team not found.';
  const b = ensureBoard(e); const i = b.findIndex(x => x.role === role);
  if (i < 0) return 'That seat is empty.';
  b.splice(i, 1); return null;
}
