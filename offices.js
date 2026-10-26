'use strict';
// Offices and board rooms.
// YOU are the CEO: that seat is never hired. The board is 5 hired
// executives: COO, CFO, CPO, CMO, CTO. Hire all 5 and the board
// room is full.
// Each executive hires a manager in their own domain. The CFO hires
// nobody: IPO, loans and forecasts are advice, not a department.
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
  { role: 'COO', salary: 180000 }, { role: 'CFO', salary: 200000 },
  { role: 'CPO', salary: 175000 }, { role: 'CMO', salary: 170000 },
  { role: 'CTO', salary: 190000 },
];
// What each executive does, and who they hire. Shown in the Offices
// panel under every seat.
var EXEC_ROLE_INFO = {
  COO: { domain: 'Operations — properties, rent, tenants, pricing', hires: 'Hires and fires store managers' },
  CFO: { domain: 'Finance — IPO, loans, forecasts. Your advisor and guide', hires: 'Hires nobody' },
  CPO: { domain: 'Product — product development', hires: 'Hires product managers' },
  CMO: { domain: 'Marketing — campaigns and brand awareness', hires: 'Hires a marketing manager, who hires marketing staff' },
  CTO: { domain: 'Technology — innovation and automation', hires: 'Hires a technology manager' },
};
var BOARD_FIRST = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Jamie', 'Robin', 'Drew', 'Avery', 'Quinn', 'Noah', 'Eden', 'Finn', 'Wren'];
var BOARD_LAST = ['Cole', 'Reed', 'Hayes', 'Frost', 'Lane', 'Quinn', 'Blake', 'Ward', 'Fox', 'Gray', 'Stone', 'Marsh', 'Vale', 'Pike'];
var BOARD_TITLES = {
  COO: ['Operations Director', 'Head of Operations', 'VP Operations'],
  CFO: ['Finance Director', 'Head of Finance', 'VP Finance'],
  CPO: ['Product Director', 'Head of Product', 'VP Product'],
  CMO: ['Marketing Director', 'Head of Marketing', 'VP Marketing'],
  CTO: ['Technology Director', 'Head of Engineering', 'VP Engineering'],
};
function boardName() { return BOARD_FIRST[Math.floor(Math.random() * BOARD_FIRST.length)] + ' ' + BOARD_LAST[Math.floor(Math.random() * BOARD_LAST.length)]; }
function ensureBoard(e) {
  if (!e) return [];
  if (!Array.isArray(e.board)) e.board = [];
  // You are the CEO now: a hired CEO from an old save is retired,
  // not carried as a sixth paid member.
  e.board = e.board.filter(m => m.role !== 'CEO');
  e.board.forEach(m => {
    // Old saves hired members with no skills: give them a middle
    // level so the benefit math works and nothing breaks.
    if (m.lead == null) m.lead = 60; if (m.exp == null) m.exp = 60; if (m.loy == null) m.loy = 60;
    // Level always comes from the average rating in 20-point bands:
    // 20 or less Lv 1, 21-40 Lv 2, 41-60 Lv 3, 61-80 Lv 4, 81+ Lv 5.
    m.level = boardLevel(m);
  });
  return e.board;
}
function boardLevel(m) {
  const avg = ((m.lead || 0) + (m.exp || 0) + (m.loy || 0)) / 3;
  return avg >= 81 ? 5 : avg >= 61 ? 4 : avg >= 41 ? 3 : avg >= 21 ? 2 : 1;
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
      // ~35% of candidates show a star: they can be developed over
      // time, up to a personal cap below 99 — never a guarantee.
      const star = Math.random() < 0.35, starCap = 85 + Math.floor(Math.random() * 14);
      list.push({ id: 'cand' + Date.now() + i + Math.floor(Math.random() * 1000), name, role,
        title: BOARD_TITLES[role][Math.floor(Math.random() * BOARD_TITLES[role].length)],
        lead, exp, loy, level: m.level, curSalary: cur, ask, star, starCap });
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
  b.push({ role, name: cand.name, salary, lead: cand.lead, exp: cand.exp, loy: cand.loy, level: cand.level, grant, star: !!cand.star, starCap: cand.starCap || 98 });
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

// ---------- Executive managers ----------
// Each executive hires a manager in their own domain: CPO hires a
// product manager, CMO a marketing manager, CTO a technology
// manager. The CFO hires nobody. A manager's level can never exceed
// the level of the executive who hired them, so a Lv 1 executive can
// only hire Lv 1 managers — and that manager can only hire Lv 1
// staff. Manager candidates are a choice of 3, hired at a set salary
// by level (managers are staff, not executives: no stock grants).
function ensureExecManagers(e) {
  if (!e) return { product: null, marketing: null, tech: null };
  if (!e.mgrs) e.mgrs = { product: null, marketing: null, tech: null };
  return e.mgrs;
}
function execForManager(kind) { return kind === 'product' ? 'CPO' : kind === 'marketing' ? 'CMO' : 'CTO'; }
function execManagerCandidates(e, kind) {
  if (!e) return [];
  if (!e.mgrCands) e.mgrCands = {};
  if (!Array.isArray(e.mgrCands[kind])) {
    const exec = ensureBoard(e).find(x => x.role === execForManager(kind));
    const cap = exec ? (exec.level || 1) : 1;
    const list = [];
    for (let i = 0; i < 3; i++) {
      const lv = 1 + Math.floor(Math.random() * cap);
      const skill = 25 + Math.floor(Math.random() * 71);
      list.push({ id: 'mgr' + Date.now() + i + Math.floor(Math.random() * 1000), name: boardName(),
        kind, level: lv, skill,
        salary: Math.round((60000 + lv * 20000 + Math.random() * 20000) / 1000) * 1000,
        star: Math.random() < 0.35, starCap: 85 + Math.floor(Math.random() * 14) });
    }
    e.mgrCands[kind] = list;
  }
  return e.mgrCands[kind];
}
function hireExecManager(e, kind, candId) {
  if (!e) return 'Business not found.';
  const mgrs = ensureExecManagers(e);
  if (mgrs[kind]) return 'That manager seat is already filled. Fire them first.';
  const exec = ensureBoard(e).find(x => x.role === execForManager(kind));
  if (!exec) return `Hire a ${execForManager(kind)} first — they hire this manager.`;
  const c = execManagerCandidates(e, kind).find(x => x.id === candId);
  if (!c) return 'Candidate not found.';
  const mgr = { name: c.name, level: c.level, skill: c.skill, salary: c.salary, star: !!c.star, starCap: c.starCap || 98 };
  if (kind === 'marketing') mgr.employees = 0;
  if (kind === 'tech') { mgr.tech = 0; mgr.milestones = []; }
  mgrs[kind] = mgr;
  if (e.mgrCands) delete e.mgrCands[kind];
  return null;
}
function fireExecManager(e, kind) {
  if (!e) return 'Business not found.';
  const mgrs = ensureExecManagers(e);
  if (!mgrs[kind]) return 'That seat is empty.';
  mgrs[kind] = null; return null;
}
function hireMarketingEmployee(e) {
  if (!e) return 'Business not found.';
  const mgrs = ensureExecManagers(e);
  const mm = mgrs.marketing;
  if (!mm) return 'Hire a marketing manager first.';
  if ((mm.employees || 0) >= 20) return 'Marketing team is full (20).';
  mm.employees = (mm.employees || 0) + 1; return null;
}
// Weekly revenue boost and cost from executive managers. Product and
// marketing managers lift revenue by skill, marketing staff add a
// little each, and the technology manager lifts it by the tech level
// they have built up. This is development-driven growth: the market
// rises because businesses innovate, not because a multiplier is
// forced up.
function execManagerBoost(e) {
  const mgrs = ensureExecManagers(e);
  let boost = 0, cost = 0;
  if (mgrs.product) { boost += (mgrs.product.skill / 100) * 0.01; cost += (mgrs.product.salary || 0) / 52; }
  if (mgrs.marketing) {
    boost += (mgrs.marketing.skill / 100) * 0.01 + Math.min(0.05, (mgrs.marketing.employees || 0) * 0.005);
    cost += (mgrs.marketing.salary || 0) / 52 + (mgrs.marketing.employees || 0) * 673;
  }
  if (mgrs.tech) { boost += ((mgrs.tech.tech || 0) / 100) * 0.02; cost += (mgrs.tech.salary || 0) / 52; }
  return { boost, cost };
}
var TECH_MILESTONES = [[25, 'App pay'], [50, 'Automated checkout'], [75, 'Robotics assist'], [99, 'Full automation']];
function execManagersWeek(e) {
  if (!e) return;
  // Star board members and managers improve over time, up to their
  // personal cap — never guaranteed to reach 99.
  ensureBoard(e).forEach(m => {
    if (!m.star) return;
    const cap = m.starCap || 98;
    let grew = false;
    ['lead', 'exp', 'loy'].forEach(k => { if (m[k] < cap && Math.random() < 0.5) { m[k]++; grew = true; } });
    if (grew) m.level = boardLevel(m);
  });
  const mgrs = ensureExecManagers(e);
  ['product', 'marketing', 'tech'].forEach(kind => {
    const mg = mgrs[kind]; if (!mg || !mg.star) return;
    const cap = mg.starCap || 98;
    if (mg.skill < cap && Math.random() < 0.5) mg.skill++;
  });
  const tm = mgrs.tech;
  if (tm) {
    const step = tm.star ? 2 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2);
    tm.tech = Math.min(99, (tm.tech || 0) + step);
    TECH_MILESTONES.forEach(([at, name]) => {
      if (tm.tech >= at && !(tm.milestones || []).includes(name)) {
        tm.milestones.push(name);
        if (typeof news === 'function') news('Technology', `${e.name} reached ${name} (tech ${tm.tech}).`, e.a3 || (typeof S !== 'undefined' && S ? S.home : null));
      }
    });
  }
}
// The CFO's forecast: average of the last 4 weekly nets, projected
// over a quarter. Null until the company has weekly history.
function cfoForecast(e) {
  if (!e || !Array.isArray(e.weekNets) || !e.weekNets.length) return null;
  const avg = e.weekNets.reduce((a, x) => a + x, 0) / e.weekNets.length;
  return Math.round(avg * 13);
}
