// ---------- bankruptcy: 5 years, no recession ----------
// There is no recession system — only bankruptcy, for business,
// personal, and country alike, exactly as Nicholas defined it:
// - Bankruptcy = 5 years of negative bank balance.
// - 1 profitable year breaks the streak (resets it to 0).
// - Warning timing was left open, so this batch decides it: the
//   warning lands at 4 negative years, giving one year to fix it.
// - A bankrupt country becomes unclaimed territory. Its relations
//   with its neighbours drop to -100, so CPU countries — which
//   declare wars when relations fall below -55 — move to annex it
//   quickly, through the existing war system. No war rules change.
// - Rebirth: you can rebirth as another country in the SAME game,
//   or start a new game. Rebirth keeps NOTHING: new person, new
//   money, no holdings, no stores, no loans, no office, no degrees.
//   The world itself (day, countries, companies, wars) keeps going.
// Balances, by kind (companies have no cash wallet in this game, so
// a company's "bank balance" is its annual profit):
// - Personal: person cash < 0 at year end.
// - Business: business cash (S.cash) < 0 at year end.
// - Country: country treasury < 0 at year end (CPU countries; in
//   leader games the home treasury IS business cash, so the home
//   country check is skipped there — business covers it).
// - Company: annual profit < 0 (lastYearProfit, set in yearEnd).
function bankruptcyState() {
  if (!S.bankruptcy) S.bankruptcy = { personal: { years: 0, warned: false }, business: { years: 0, warned: false }, countries: {}, companies: {} };
  return S.bankruptcy;
}
function bankruptcyYear(year) {
  const st = bankruptcyState();
  const P = ensurePerson();
  // Personal
  if (P.cash < 0) st.personal.years++; else { st.personal.years = 0; st.personal.warned = false; }
  if (st.personal.years === 4 && !st.personal.warned) { st.personal.warned = true; if (typeof news === 'function') news('Business', 'Bankruptcy warning: your personal bank balance has been negative for 4 years. One profitable year breaks the streak — one more negative year and you are bankrupt.', S.home); }
  // Business
  if (S.cash < 0) st.business.years++; else { st.business.years = 0; st.business.warned = false; }
  if (st.business.years === 4 && !st.business.warned) { st.business.warned = true; if (typeof news === 'function') news('Business', 'Bankruptcy warning: your business bank balance has been negative for 4 years. One profitable year breaks the streak — one more negative year and you are bankrupt.', S.home); }
  // Countries (CPU, plus home in non-leader games)
  for (const a3 in (S.countries || {})) {
    if (S.leader && a3 === S.home) continue;
    const cs = S.countries[a3];
    if (!cs || cs.occ || cs.unclaimed) continue;
    if (!st.countries[a3]) st.countries[a3] = { years: 0, warned: false };
    const rec = st.countries[a3];
    if ((cs.treasury || 0) < 0) rec.years++; else { rec.years = 0; rec.warned = false; }
    if (rec.years === 4 && !rec.warned) { rec.warned = true; if (a3 === S.home && typeof news === 'function') news('World', `Bankruptcy warning: ${cname(a3)} has been negative for 4 years.`, a3); }
    if (rec.years >= 5) {
      cs.unclaimed = true; cs.treasury = 0; if (cs.debt != null) cs.debt = 0;
      if (cs.rel) for (const y in cs.rel) cs.rel[y] = -100;
      if (typeof news === 'function') news('World', `${cname(a3)} is bankrupt after 5 negative years and is now unclaimed territory. Its neighbours will move to annex it.`, a3);
    }
  }
  // Companies
  const all = [];
  for (const a3 in (S.co || {})) all.push(S.co[a3]);
  for (const id in (S.extra || {})) all.push(S.extra[id]);
  all.forEach(c => {
    const key = c.id || c.a3;
    if (!st.companies[key]) st.companies[key] = { years: 0, warned: false };
    const rec = st.companies[key];
    const profit = c.lastYearProfit;
    if (profit != null && profit < 0) rec.years++; else if (profit != null) { rec.years = 0; rec.warned = false; }
    if (rec.years === 4 && !rec.warned) { rec.warned = true; if ((typeof controlled === 'function' && controlled(c.a3)) || c.a3 === S.home) { if (typeof news === 'function') news('Business', `Bankruptcy warning: ${c.name} has lost money for 4 years.`, c.a3); } }
    if (rec.years >= 5 && !c.bankrupt) {
      c.bankrupt = true; c.listed = false; c.price = Math.max(0.5, (c.price || 0) * 0.5);
      if (typeof news === 'function') news('Business', `${c.name} is bankrupt after 5 losing years — delisted, value halved. One profitable year lets it emerge.`, c.a3);
    } else if (rec.years === 0 && c.bankrupt) {
      c.bankrupt = false; c.listed = true;
      if (typeof news === 'function') news('Business', `${c.name} emerged from bankruptcy after a profitable year and is listed again.`, c.a3);
    }
  });
  // Player bankruptcy at 5 years ends the run — with rebirth on offer.
  // Worl Inc. is exempt: its cash is per-second business cash, and
  // the legacy rule silently destroyed Inc. saves (loadSave drops
  // over saves, so the next launch showed no "Continuing" and no
  // game-over screen). Inc. never ends on this rule.
  if (S.mode !== 'inc' && (st.personal.years >= 5 || st.business.years >= 5)) {
    if (typeof finishGame === 'function') finishGame(true);
  }
}
function rebirthAs(a3) {
  if (!a3 || !W.byA3[a3]) return 'That country does not exist.';
  if (a3 === S.home) return 'Rebirth as another country — not the one you just left.';
  const cs = S.countries[a3];
  if (cs && cs.unclaimed) return `${cname(a3)} is unclaimed territory — pick a country that still stands.`;
  const day = S.day;
  const isLeader = !!S.leader;
  const newTreasury = cs ? (cs.treasury || 0) : 0;
  S.home = a3;
  S.person = defaultPerson();
  ensurePerson().cash = (typeof EMPLOYEE_START_CASH !== 'undefined') ? EMPLOYEE_START_CASH : 5000;
  S.cash = isLeader ? newTreasury : 0;
  S.holdings = {}; S.holdingsX = {}; S.holdingsP = {}; S.holdingsXP = {};
  S.etfHoldings = {};
  S.props = []; S.stores = []; S.loans = []; S.loan = 0;
  S.dominated = []; S.over = null; S.broke = 0;
  const st = bankruptcyState();
  st.personal.years = 0; st.personal.warned = false; st.business.years = 0; st.business.warned = false;
  if (typeof netWorth === 'function') S.stats.startNet = netWorth();
  if (typeof news === 'function') news('Person', `You were reborn in ${cname(a3)}. You keep nothing — new person, new money, same world, day ${day}.`, a3);
  return null;
}
