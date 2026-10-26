'use strict';
// Quarterly earnings + calendar — the date pill's calendar.
// Every 13 weeks (one quarter) every business reports earnings.
// A report is not just a number: it moves the stock price, so a beat
// lifts the shares you own and a miss drops them, and it lands in the
// news and in the calendar. The calendar in the date modal shows the
// next earnings dates, the next year end, and the last reports.
function ensureEarnings() {
  if (!S.earn) S.earn = { next: 91, history: [] };
  if (S.earn.next == null) S.earn.next = S.day + 91;
  if (!S.earn.history) S.earn.history = [];
  return S.earn;
}
function earningsQuarter() {
  const e = ensureEarnings();
  const reports = [];
  for (const a3 in S.co) {
    const c = S.co[a3];
    const actual = Math.round((c.avg || 0) * 13);
    const expected = Math.round((c.lastQuarterProfit != null ? c.lastQuarterProfit : actual) * 1.0);
    const surprise = clamp((actual - expected) / Math.max(1000, Math.abs(expected)) + gauss() * 0.08, -0.5, 0.5);
    if (c.listed) {
      const move = 1 + surprise * 0.4;
      c.price = Math.max(0.01, c.price * move);
    }
    reports.push({ day: S.day, a3, name: c.name, sym: c.sym, profit: actual, surprise: Math.round(surprise * 100) / 100, move: c.listed ? Math.round(surprise * 40) : 0 });
    c.lastQuarterProfit = actual;
  }
  reports.sort((a, b) => b.surprise - a.surprise);
  e.history = reports.concat(e.history).slice(0, 120);
  e.next = S.day + 91;
  const top = reports[0], bottom = reports[reports.length - 1];
  if (top) news('Earnings', `Quarterly earnings are in. ${top.name} beat expectations by ${Math.round(top.surprise * 100)}%${top.move ? `, shares ${top.move >= 0 ? 'up' : 'down'} ${Math.abs(top.move)}%` : ''}. ${bottom && bottom !== top ? `${bottom.name} missed by ${Math.round(-bottom.surprise * 100)}%.` : ''} See the date calendar for every business.`, S.home);
  return reports;
}
function calendarEvents() {
  const e = ensureEarnings();
  const out = [];
  out.push({ day: e.next, title: 'Quarterly earnings — all businesses', desc: 'Every business reports. Beats lift shares, misses drop them.' });
  out.push({ day: e.next + 91, title: 'Quarterly earnings — all businesses', desc: 'Next quarter after that.' });
  // Next year end: first day of next calendar year.
  const y = yearOf(S.day) + 1;
  const yearDay = Math.round((Date.UTC(y, 0, 1) - START_MS) / DAY_MS);
  out.push({ day: yearDay, title: `Year ${y} — ratings and year in review`, desc: 'Business star ratings are set for the year, and tax reactions are reported.' });
  out.sort((a, b) => a.day - b.day);
  return out;
}
function nextEarningsInDays() {
  const e = ensureEarnings();
  return Math.max(0, e.next - S.day);
}
