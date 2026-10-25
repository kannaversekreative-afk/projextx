'use strict';
// Offices and board rooms — the ONLY game is Ticker Tycoon, so this file
// serves its companies and its teams, nothing else.
// A board is 5 seats: CEO, CFO, COO, CMO, CTO. Hire all 5 and the board
// room is full. Hiring costs one annual salary up front; the same salary
// is then paid weekly (salary / 52) while the seat is filled.
var BOARD_ROLES = [
  { role: 'CEO', salary: 240000 }, { role: 'CFO', salary: 200000 },
  { role: 'COO', salary: 180000 }, { role: 'CMO', salary: 170000 },
  { role: 'CTO', salary: 190000 },
];
var BOARD_FIRST = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Jamie', 'Robin', 'Drew'];
var BOARD_LAST = ['Cole', 'Reed', 'Hayes', 'Frost', 'Lane', 'Quinn', 'Blake', 'Ward', 'Fox', 'Gray'];
function boardName() { return BOARD_FIRST[Math.floor(Math.random() * BOARD_FIRST.length)] + ' ' + BOARD_LAST[Math.floor(Math.random() * BOARD_LAST.length)]; }
function ensureBoard(e) { if (!e) return []; if (!Array.isArray(e.board)) e.board = []; return e.board; }
function boardFull(e) { const b = ensureBoard(e); return BOARD_ROLES.every(r => b.some(x => x.role === r.role)); }
function boardWeeklyCost(e) { return ensureBoard(e).reduce((a, x) => a + (x.salary || 0) / 52, 0); }
function hireBoard(e, role) {
  if (!e) return 'Business or team not found.';
  const def = BOARD_ROLES.find(r => r.role === role);
  if (!def) return 'Unknown board role.';
  const b = ensureBoard(e);
  if (b.some(x => x.role === role)) return `The ${role} seat is already filled.`;
  if (typeof S !== 'undefined' && S && S.cash < def.salary) return `Hiring a ${role} costs ${fmtMoney(def.salary, true)}.`;
  if (typeof S !== 'undefined' && S) S.cash -= def.salary;
  b.push({ role, name: boardName(), salary: def.salary });
  return null;
}
function fireBoard(e, role) {
  if (!e) return 'Business or team not found.';
  const b = ensureBoard(e); const i = b.findIndex(x => x.role === role);
  if (i < 0) return 'That seat is empty.';
  b.splice(i, 1); return null;
}
