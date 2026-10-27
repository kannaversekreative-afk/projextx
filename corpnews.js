'use strict';
// Quarterly earnings engine + corporate wire.
//
// The model, plain: stocks barely move week to week (small market
// noise). Almost everything comes from quarterly reports — every
// business reports earnings once a quarter, and the stock jumps on
// the surprise versus what analysts expected. Corporate actions
// (exec changes, dividends, share issues, acquisitions) are the rest
// of the news, with small honest price effects. Nothing here pretends
// the price follows a real economy: it follows reports and actions.
//
// A quarter is 13 weeks = 91 days. Quarter boundaries are the days
// where (day + 1) % 91 === 0 (days 90, 181, 272, ...), which all fall
// on business-week days, so companyWeek is the right hook.
const STOCK_EXCHANGE = 'Worl Exchange';

function isQuarterEnd(day) { return ((day + 1) % 91) === 0; }
function quarterLabel(day) {
  const q = (Math.floor((day || 0) / 91) % 4) + 1;
  const y = (typeof gameYear === 'function') ? gameYear() : 2026;
  return 'Q' + q + ' ' + y;
}

function sectorDivRate(sector) {
  try {
    const s = (typeof LEADER_SECTOR_BY_NAME !== 'undefined' && LEADER_SECTOR_BY_NAME[sector]) || {};
    return isFinite(s.div) ? s.div : 0.03;
  } catch (e) { return 0.03; }
}
function sectorGrowthRate(sector) {
  try {
    const s = (typeof LEADER_SECTOR_BY_NAME !== 'undefined' && LEADER_SECTOR_BY_NAME[sector]) || {};
    return isFinite(s.growth) ? s.growth : 0.03;
  } catch (e) { return 0.03; }
}

// Annual dividend per share. Stored on the company so raises and cuts
// persist; seeded from the sector yield at the first use.
function ensureDiv(c) {
  if (!isFinite(c.div) || c.div <= 0) c.div = Math.max(0.01, (c.p0 || c.price || 100) * sectorDivRate(c.sector));
  return c.div;
}
function divYield(c) { return ensureDiv(c) / Math.max(0.5, c.price); }

// 52-week high/low from weekly closes (daily closes as fallback).
function week52(c) {
  const w = (c.h && c.h.w) || [];
  const d = (c.h && c.h.d) || [];
  const closes = w.length ? w.slice(-52) : d.slice(-52);
  if (!closes.length) return { hi: c.price, lo: c.price };
  return { hi: Math.max.apply(null, closes.concat([c.price])), lo: Math.min.apply(null, closes.concat([c.price])) };
}

// --- corporate wire -------------------------------------------------
// S.corpNews is the full wire (capped). S.news only gets an item when
// the player holds the stock, the company is top-20 by market cap,
// or the action is major — otherwise report weeks would flood the
// 150-item news feed with 196 companies' announcements.
function corpTop20() {
  if (S._corpTopDay === S.day && S._corpTop) return S._corpTop;
  const ranked = Object.values(S.co || {}).filter(c => c.listed).map(c => ({ a3: c.a3, v: (c.price || 0) * (c.shares || 0) })).sort((a, b) => b.v - a.v).slice(0, 20).map(x => x.a3);
  S._corpTop = ranked; S._corpTopDay = S.day;
  return ranked;
}
function corpWire(c, text, short, major) {
  if (!Array.isArray(S.corpNews)) S.corpNews = [];
  S.corpNews.unshift({ d: S.day, a3: c.a3, sym: c.sym, name: c.name, text });
  if (S.corpNews.length > 120) S.corpNews.length = 120;
  c.lastEvent = { day: S.day, short: short || text };
  const held = holdQty(c.a3);
  if (major || held > 0 || corpTop20().indexOf(c.a3) >= 0) {
    if (typeof news === 'function') news('Business', text, c.a3);
  }
}

// --- board-set dividend ----------------------------------------------
// The board meeting sets a quarterly dividend as a percentage of the
// company's value. It is paid to shareholders in proportion to their
// stake; your share lands in your personal bank. Paying out more than
// a year's profit eats the company's book value; paying it down to
// nothing bankrupts the company. This replaces the automatic dividend
// below for companies that have one (see the _boardDivPaid flag).
function payBoardDividend(c) {
  if (!c.divPct || c.bankrupt) return;
  const st = (typeof stake === 'function') ? stake(c.a3) : 0;
  if (st <= 0) return;
  const payout = Math.round(companyValue(c) * c.divPct / 100);
  if (payout <= 0) return;
  const userAmt = Math.round(payout * st);
  if (userAmt > 0) {
    ensurePerson().cash += userAmt;
    if (typeof bankFeedPush === 'function') bankFeedPush({ d: S.day, text: '+ dividend · ' + c.name, amt: userAmt });
  }
  const annual = Math.max(0, (c.avg || 0) * 52);
  if (payout > annual) {
    c.bookDamage = (c.bookDamage || 0) + (payout - annual);
    if (bookValue(c) - c.bookDamage <= 0) {
      c.bankrupt = true; c.avg = 0; c.book = 0;
      if (typeof news === 'function') news('Business', c.name + ' paid out more than it could afford and went bankrupt.', c.a3);
    }
  }
  c._boardDivPaid = S.day;
}

// --- quarterly reports (flagships) ----------------------------------
function quarterlyReport(c) {
  if (!c.listed) { c.qProfit = 0; return null; }
  // Once per quarter: a second call on the same day (companyWeek can
  // run twice on boundary days from different paths) must not report
  // a second, near-zero quarter and crash the stock on a false miss.
  if (c.lastReport && c.lastReport.day === S.day) return c.lastReport;
  const earnings = Math.round(c.qProfit || 0);
  const first = (c.qExpect == null);
  const expect = first ? earnings : c.qExpect;
  const surprise = first ? 0 : (earnings - expect) / Math.max(1, Math.abs(expect));
  let move = Math.max(-0.18, Math.min(0.22, surprise * 0.6));
  if (earnings < 0) move = Math.min(move, -0.05);
  if (!first) c.price = Math.max(0.5, c.price * Math.exp(move));
  const q = quarterLabel(S.day);
  c.lastReport = { q, earnings, expect, surprise, move: first ? 0 : move, day: S.day };
  c.qExpect = Math.round(earnings * (1 + sectorGrowthRate(c.sector) * 0.25));
  c.qProfit = 0;
  // Quarterly dividend, paid to holders — unless the board already set
  // this quarter's dividend at a board meeting (that payment replaces
  // this automatic one, so nobody gets paid twice).
  if (c._boardDivPaid !== S.day) {
    ensureDiv(c);
    const heldC = ((S.holdings || {})[c.a3] || {}).qty || 0, heldP = ((S.holdingsP || {})[c.a3] || {}).qty || 0;
    const payC = Math.round(heldC * c.div / 4), payP = Math.round(heldP * c.div / 4);
    if (payC > 0) S.cash += payC;
    if (payP > 0) ensurePerson().cash += payP;
    if (payP > 0 && typeof bankFeedPush === 'function') bankFeedPush({ d: S.day, text: '+ dividend · ' + c.name, amt: payP });
    if (payC + payP > 0) c.lastDividendPay = payC + payP;
  }
  const big = Math.abs(move) >= 0.12;
  if ((heldC + heldP > 0 || big) && typeof news === 'function') {
    const verdict = first ? 'in its first reported quarter' : (surprise >= 0 ? `, beating estimates by ${(surprise * 100).toFixed(0)}%` : `, missing estimates by ${(-surprise * 100).toFixed(0)}%`);
    news('Business', `${c.name} reports ${q} earnings ${fmtMoney(earnings, true)}${verdict}. ${c.sym} ${move >= 0 ? '+' : ''}${(move * 100).toFixed(1)}%.`, c.a3);
  }
  return c.lastReport;
}

// --- quarterly corporate actions (AI flagships only) ----------------
// The player makes these decisions for their own companies; the
// market's companies make them on their own, once a quarter.
function corpQuarterEvents(c) {
  if (!c.ai || !c.listed) return;
  if (typeof controlled === 'function' && controlled(c.a3)) return;
  if (c.lastCorpDay === S.day) return;
  c.lastCorpDay = S.day;
  const r = Math.random();
  // Executive turnover: one board seat changes hands.
  if (r < 0.25 && typeof ensureBoard === 'function' && typeof boardName === 'function') {
    try {
      const b = ensureBoard(c);
      if (b && b.length) {
        const i = Math.floor(Math.random() * b.length);
        const old = b[i];
        const v = 5 + Math.floor(Math.random() * 16);
        let nm; const used = new Set(b.map(m => m.name));
        do { nm = boardName(); } while (used.has(nm));
        const oldAvg = ((old.lead || 0) + (old.exp || 0) + (old.loy || 0)) / 3;
        b[i] = { role: old.role, name: nm, salary: old.salary, lead: v, exp: v, loy: v, level: 1, cpu: true };
        ensureBoard(c);
        const newAvg = (v * 3) / 3;
        c.price = Math.max(0.5, c.price * Math.exp((newAvg - oldAvg) / 100 * 0.05));
        corpWire(c, `${c.name} names ${nm} as ${old.role}, replacing ${old.name}.`, `a board change (new ${old.role} ${nm})`, false);
        return;
      }
    } catch (e) {}
  }
  // Dividend raised.
  if (r < 0.37) {
    ensureDiv(c);
    const old = c.div;
    c.div = Math.max(0.01, old * (1.10 + Math.random() * 0.15));
    c.price = Math.max(0.5, c.price * Math.exp(0.01 + Math.random() * 0.01));
    corpWire(c, `${c.name} raised its dividend to ${fmtMoney(c.div)} a share (was ${fmtMoney(old)}).`, 'a dividend raise', false);
    return;
  }
  // Dividend cut.
  if (r < 0.42) {
    ensureDiv(c);
    const old = c.div;
    c.div = Math.max(0.01, old * (0.80 + Math.random() * 0.10));
    c.price = Math.max(0.5, c.price * Math.exp(-(0.01 + Math.random() * 0.01)));
    corpWire(c, `${c.name} cut its dividend to ${fmtMoney(c.div)} a share (was ${fmtMoney(old)}).`, 'a dividend cut', false);
    return;
  }
  // Raise money through shares (dilution).
  if (r < 0.52) {
    const oldShares = c.shares || 1;
    c.shares = Math.round(oldShares * (1.05 + Math.random() * 0.10));
    c.price = Math.max(0.5, c.price * oldShares / c.shares);
    corpWire(c, `${c.name} raised money by issuing ${(c.shares - oldShares).toLocaleString()} new shares.`, 'a share issue', false);
    return;
  }
  // Buy a company: the smallest extra business in its own country.
  if (r < 0.60 && S.extra) {
    const targets = Object.entries(S.extra).filter((entry) => entry[1] && entry[1].a3 === c.a3).sort((a, b) => (a[1].value || 0) - (b[1].value || 0));
    if (targets.length) {
      const id = targets[0][0], b = targets[0][1];
      const val = b.value || 0;
      const heldXC = ((S.holdingsX || {})[id] || {}).qty || 0, heldXP = ((S.holdingsXP || {})[id] || {}).qty || 0;
      if (heldXC + heldXP > 0) { S.cash += Math.round(heldXC * b.price * 1.15); const pAmt = Math.round(heldXP * b.price * 1.15); ensurePerson().cash += pAmt; if (pAmt > 0 && typeof bankFeedPush === 'function') bankFeedPush({ d: S.day, text: '+ buyout · ' + b.name, amt: pAmt }); delete S.holdingsX[id]; if (S.holdingsXP) delete S.holdingsXP[id]; }
      delete S.extra[id];
      c.price = Math.max(0.5, c.price + (val * 0.5) / Math.max(1, c.shares || 1));
      corpWire(c, `${c.name} bought ${b.name} for ${fmtMoney(val, true)}.`, `buying ${b.name}`, true);
      return;
    }
  }
}

// --- quarterly reports (extra businesses) ---------------------------
function extraQuarterlyReport(b) {
  if (b.lastReport && b.lastReport.day === S.day) return b.lastReport;
  const earnings = Math.round(b.qProfit || 0);
  const first = (b.qExpect == null);
  const expect = first ? earnings : b.qExpect;
  const surprise = first ? 0 : (earnings - expect) / Math.max(1, Math.abs(expect));
  let move = Math.max(-0.18, Math.min(0.22, surprise * 0.6));
  if (earnings < 0) move = Math.min(move, -0.05);
  if (!first) b.price = Math.max(0.5, b.price * Math.exp(move));
  b.lastReport = { q: quarterLabel(S.day), earnings, expect, surprise, move: first ? 0 : move, day: S.day };
  b.qExpect = Math.round(earnings * (1 + sectorGrowthRate(b.sector) * 0.25));
  b.qProfit = 0;
  const heldC = ((S.holdingsX || {})[b.id] || {}).qty || 0, heldP = ((S.holdingsXP || {})[b.id] || {}).qty || 0;
  if (heldC + heldP > 0) {
    const div = Math.max(0.01, b.price * sectorDivRate(b.sector));
    const payC = Math.round(heldC * div / 4), payP = Math.round(heldP * div / 4);
    if (payC > 0) S.cash += payC;
    if (payP > 0) ensurePerson().cash += payP;
    if (payP > 0 && typeof bankFeedPush === 'function') bankFeedPush({ d: S.day, text: '+ dividend · ' + b.name, amt: payP });
  }
  return b.lastReport;
}

// --- newspaper helpers ----------------------------------------------
// Week change: flagships use daily closes (last close is yesterday,
// so 6 closes back is about a week); extras use weekly closes.
function stockWeekChg(c, weeklyCloses) {
  const d = (c.h && c.h.d) || [];
  if (d.length < 2) return 0;
  const prev = weeklyCloses ? d[d.length - 2] : (d.length >= 7 ? d[d.length - 6] : d[0]);
  if (!prev) return 0;
  return (c.price - prev) / prev;
}
function stockWhy(c) {
  if (c.lastReport && S.day - c.lastReport.day <= 21) {
    const r = c.lastReport;
    if (r.surprise > 0.03) return `after beating ${r.q} earnings by ${(r.surprise * 100).toFixed(0)}%`;
    if (r.surprise < -0.03) return `after missing ${r.q} earnings by ${(-r.surprise * 100).toFixed(0)}%`;
    return `after reporting ${r.q} earnings in line with estimates`;
  }
  if (c.lastEvent && S.day - c.lastEvent.day <= 30) return `after ${c.lastEvent.short}`;
  return 'on light market drift, with no company news this week';
}

// --- top shareholders (deterministic per ticker) --------------------
const HOLDER_FIRST = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Linda', 'Michael', 'Barbara', 'William', 'Elizabeth', 'David', 'Jennifer', 'Richard', 'Susan', 'Joseph', 'Jessica'];
const HOLDER_LAST = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
const HOLDER_FUNDS = ['Meridian Capital', 'Atlas Investments', 'Northfield Asset Management', 'Harbor Retirement Trust', 'Beacon Pension Fund', 'Summit Global Fund'];
function corpHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function corpRand(seed) {
  let a = seed >>> 0;
  return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function topShareholders(c, heldQty, totalShares) {
  const rnd = corpRand(corpHash('holders' + (c.sym || c.name || '')));
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const founder = pick(HOLDER_FIRST) + ' ' + pick(HOLDER_LAST);
  const out = [{ name: founder + ' (founder)', pct: 20 + rnd() * 14 }];
  const used = new Set();
  for (let i = 0; i < 3; i++) {
    let name; do { name = pick(HOLDER_FUNDS); } while (used.has(name));
    used.add(name);
    out.push({ name, pct: 5 + rnd() * 8 });
  }
  if (heldQty > 0 && totalShares > 0) out.push({ name: 'You', pct: heldQty / totalShares * 100 });
  const sum = out.reduce((a, x) => a + x.pct, 0);
  out.push({ name: 'Public float', pct: Math.max(0, 100 - sum) });
  return out.sort((a, b) => b.pct - a.pct);
}
