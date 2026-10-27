// ---------- Worl Bank ----------
// The banking app, laid out like a modern bank app (original names
// and art only): three accounts — Personal, Business, Country —
// four quick actions, and your loans. Everything shown is real
// in-game state: Personal is your own money, Business is company
// money, Country is your office budget. There is no interest
// mechanic in the game, so no APY is shown anywhere.
// Account, routing and card numbers are randomized once per save and
// kept in S.bankAcct — display only, they move no money.
function bankDigits(n) {
  let s = String(1 + Math.floor(Math.random() * 9));
  while (s.length < n) s += Math.floor(Math.random() * 10);
  return s;
}
function bankAcct() {
  // Three accounts, one per wallet: Personal (your own money),
  // Business (company money), Country (office budget). Numbers are
  // randomized once per save and kept — display only, they move no
  // money. Old saves had one flat account: those numbers stay with
  // Personal, and Business/Country get fresh ones.
  if (!S.bankAcct || !S.bankAcct.personal) {
    const old = S.bankAcct || {};
    S.bankAcct = {
      personal: { account: old.account || bankDigits(12), routing: old.routing || bankDigits(9), card: old.card || bankDigits(16), exp: old.exp || (String(1 + Math.floor(Math.random() * 12)).padStart(2, '0') + '/' + String(28 + Math.floor(Math.random() * 5))) },
      business: { account: bankDigits(12), routing: bankDigits(9) },
      country: { account: bankDigits(12), routing: bankDigits(9) },
    };
  }
  return S.bankAcct;
}
// The country account: your office budget. A president's budget is
// the national treasury; a mayor's is the city budget; a governor's
// the region budget. In a leader game the treasury IS the business
// wallet, so the country account mirrors it (same pot, said plainly).
function countryBalance() {
  const P = ensurePerson();
  if (P.office && P.office.title && typeof officeTreasury === 'function') return officeTreasury(P.office);
  if (S.leader) { const cs = (typeof country === 'function') ? country(S.home) : null; return cs ? (cs.treasury || 0) : 0; }
  return 0;
}
function countryNote() {
  const P = ensurePerson();
  if (P.office && P.office.title) return P.office.title + ' budget · pays for policies, never for stocks or purchases';
  if (S.leader) return 'National treasury · in leader games this is the same pot as Business';
  return 'Hold an office to get a country budget';
}
function bankAccounts() {
  const P = ensurePerson();
  return [
    { id: 'personal', name: 'Personal', bal: P.cash, note: 'Your own money · spend as Private' },
    { id: 'business', name: 'Business', bal: S.cash, note: 'Company money · spend as Company' },
    { id: 'country', name: 'Country', bal: countryBalance(), note: countryNote() },
  ];
}
function bankLoanTotals() {
  ensureStores();
  const loans = S.loans || [];
  const remaining = loans.reduce((t, l) => t + l.weekly * l.weeksLeft, 0) + (S.loan || 0);
  const weekly = loans.reduce((t, l) => t + l.weekly, 0);
  return { loans, remaining, weekly, count: loans.length + (S.loan > 0 ? 1 : 0) };
}
function bankPanelHTML() {
  ensureStores();
  const P = ensurePerson();
  const acct = bankAcct();
  const view = UI.bankView || 'home';
  const lt = bankLoanTotals();
  const head = `<div class="wbank-head"><b>🌍 Worl Bank</b><span><button class="wbank-bell" data-a="panel" data-x="web" aria-label="Mail">🔔</button><button class="wbank-borrow" data-a="bankView" data-x="citybanks">Borrow</button></span></div>`;
  let body = '';
  if (view === 'loan') {
    body = `<button class="wbank-back" data-a="bankView" data-x="home">← Bank</button>
    <h3 class="wbank-h">New loans</h3><p class="wbank-note">Loans now come only from city banks — Bank of every city, at that city's rate, on approval. The old flat 6.50% loan is closed for new borrowing; loans you already have still repay here.</p>
    <button class="btn3d orange wide" data-a="bankView" data-x="citybanks">OPEN CITY BANKS</button>
    <h3 class="wbank-h">Your loans</h3>
    ${S.loan > 0 ? `<div class="wbank-loanrow"><span>Main loan</span><b>${fmtMoney(S.loan, true)} owed</b><button class="wbank-smallbtn" data-a="repay">Repay in full</button></div>` : ''}
    ${lt.loans.map(l => `<div class="wbank-loanrow"><span>${fmtMoney(l.amount, true)} · ${(l.rate * 100).toFixed(2)}% · ${l.months} months</span><b>${fmtMoney(l.weekly)}/week · ${l.weeksLeft} weeks left</b></div>`).join('') || (S.loan > 0 ? '' : '<p class="wbank-note">No loans outstanding.</p>')}`;
  } else if (view === 'account') {
    const sel = UI.bankAcctSel || 'business';
    const a = bankAccounts().find(x => x.id === sel) || bankAccounts()[1];
    const num = acct[a.id] || {};
    body = `<button class="wbank-back" data-a="bankView" data-x="home">← Bank</button>
    <h3 class="wbank-h">${a.name} account</h3>
    <div class="wbank-avail"><span>Balance</span><b>${fmtMoney(a.bal)}</b><small>${esc(a.note)}</small></div>
    <div class="wbank-numbox"><span>Account number</span><b>${num.account}</b></div>
    <div class="wbank-numbox"><span>Routing number</span><b>${num.routing}</b></div>
    ${a.id === 'personal' ? '<button class="btn" data-a="bankView" data-x="card">View card</button>' : ''}
    <p class="wbank-note">Your in-game Worl Bank account. These numbers are display only.</p>`;
  } else if (view === 'card') {
    const grouped = acct.personal.card.replace(/(\d{4})(?=\d)/g, '$1 ');
    body = `<button class="wbank-back" data-a="bankView" data-x="home">← Bank</button>
    <h3 class="wbank-h">Cards</h3>
    <div class="wbank-cardart"><b>🌍 Worl Bank</b><span class="wbank-chip"></span><div class="wbank-cardnum">${grouped}</div><div class="wbank-cardrow"><span>${esc((S.you && S.you.name) || 'Founder')}</span><span>EXP ${acct.personal.exp}</span></div></div>
    <p class="wbank-note">Your in-game bank card. Display only — spending goes through your Company or Private wallet.</p>`;
  } else if (view === 'add') {
    body = `<button class="wbank-back" data-a="bankView" data-x="home">← Bank</button>
    <h3 class="wbank-h">Add money</h3><p class="wbank-note">Move money between your personal wallet and your business.</p>
    <div class="wbank-kv"><span>Personal money</span><b>${fmtMoney(P.cash, true)}</b></div>
    <div class="wbank-kv"><span>Business money</span><b>${fmtMoney(S.cash, true)}</b></div>
    <div class="row wrap"><button class="btn small" data-a="personInvest" data-x="10000">Invest $10K</button><button class="btn small" data-a="personInvest" data-x="100000">Invest $100K</button><button class="btn small" data-a="personInvest" data-x="all">Invest all</button><button class="btn small" data-a="personPay" data-x="10000">Pay self $10K</button><button class="btn small" data-a="personPay" data-x="100000">Pay self $100K</button><button class="btn small" data-a="personPay" data-x="all">Pay self all</button></div>
    <p class="wbank-note">Invest moves your money into your business. Pay yourself moves business money to you.</p>`;
  } else if (view === 'jobs') {
    const job = P.job || { track: 'civilian', rank: 0, weeks: 0 };
    const cur = jobLadder(job.track)[job.rank] || jobLadder(job.track)[0];
    const next = jobLadder(job.track)[job.rank + 1];
    const ag = agencyOf(S.home);
    const tracks = [
      ['civilian', '💼 Factory career', jobLadder('civilian')[0].title, jobLadder('civilian')[0].salary, 'Climb from factory floor to executive.'],
      ['dom', '🕵️ ' + ag[0], jobLadder('agency-dom')[0].title, jobLadder('agency-dom')[0].salary, 'Needs 10 fame. Cuts your risk of getting caught.'],
      ['for', '🌍 ' + ag[1], jobLadder('agency-for')[0].title, jobLadder('agency-for')[0].salary, 'Needs 10 fame. Cuts your risk of getting caught.'],
      ['military', '🎖️ Military', jobLadder('military')[0].title, jobLadder('military')[0].salary, 'Opens the General advisor at higher ranks.'],
    ];
    body = `<button class="wbank-back" data-a="bankView" data-x="home">← Bank</button>
    <h3 class="wbank-h">Find a job</h3>
    <div class="wbank-kv"><span>Current job</span><b>${esc(cur.title)} · ${fmtMoney(cur.salary, true)}/week · ${job.weeks} weeks</b></div>
    ${next ? `<button class="btn" data-a="personPromo">Ask for promotion to ${esc(next.title)} (needs ${next.fame} fame, ${next.weeks} weeks)</button>` : '<p class="wbank-note">Top of this career.</p>'}
    <p class="wbank-label">CAREER PATHS</p>
    ${tracks.map(([t, name, title, sal, note]) => `<div class="wbank-jobrow"><span><b>${esc(name)}</b><small>${esc(title)} · ${fmtMoney(sal, true)}/week · ${esc(note)}</small></span><button class="wbank-smallbtn" data-a="bankJob" data-x="${t}">${job.track === (t === 'dom' ? 'agency-dom' : t === 'for' ? 'agency-for' : t) ? 'Current' : 'Take job'}</button></div>`).join('')}
    <p class="wbank-note">Jobs pay you every week into your personal money.</p>`;
  } else if (view === 'citybanks') {
    const cities = (W.cities || []).filter(c => c.a3 === S.home);
    body = `<button class="wbank-back" data-a="bankView" data-x="home">← Bank</button>
    <h3 class="wbank-h">City banks — ${esc(cname(S.home))}</h3><p class="wbank-note">Worl Bank is the banking app in your phone. Every city also has its own bank business — Bank of Moscow, Bank of New York, and so on. They lend on approval, and they make or lose money on their loans, just like any business.</p>
    ${cities.map(c => { const b = cityBank(c.id); return `<div class="wbank-loanrow"><span><b>${esc(b.name)}</b><small>${(b.rate * 100).toFixed(2)}% · Capital ${fmtMoney(b.capital, true)} · Profit ${fmtMoney(b.profit, true)} · ${b.loans} player loan${b.loans === 1 ? '' : 's'}</small></span><button class="wbank-smallbtn" data-a="bankCity" data-x="${c.id}">Borrow</button></div>`; }).join('') || '<p class="wbank-note">No cities yet.</p>'}`;
  } else if (view === 'cityloan') {
    const b = cityBank(UI.bankCity);
    if (!b) body = `<button class="wbank-back" data-a="bankView" data-x="citybanks">← City banks</button><p class="wbank-note">No bank in that city.</p>`;
    else {
      const my = (S.loans || []).filter(l => l.bank === b.cityId);
      body = `<button class="wbank-back" data-a="bankView" data-x="citybanks">← City banks</button>
      <h3 class="wbank-h">${esc(b.name)}</h3><p class="wbank-note">Interest ${(b.rate * 100).toFixed(2)}% a year · Capital ${fmtMoney(b.capital, true)} · Profit so far ${fmtMoney(b.profit, true)} · Approved up to ${fmtMoney(cityBankMaxLoan(b), true)} (and no more than your overall position allows).</p>
      <label class="wbank-label">LOAN AMOUNT</label><input id="loanAmt" class="wbank-input" type="number" value="1000000">
      <label class="wbank-label">MATURITY (months)</label><input id="loanMonths" class="wbank-input" type="number" value="36">
      <button class="btn3d orange wide" data-a="takeCityLoan">TAKE LOAN FROM ${esc(b.name).toUpperCase()}</button>
      <h3 class="wbank-h">Your loans here</h3>
      ${my.map(l => `<div class="wbank-loanrow"><span>${fmtMoney(l.amount, true)} · ${(l.rate * 100).toFixed(2)}% · ${l.months} months</span><b>${fmtMoney(l.weekly)}/week · ${l.weeksLeft} weeks left</b></div>`).join('') || '<p class="wbank-note">No loans from this bank yet.</p>'}`;
    }
  } else {
    const accts = bankAccounts();
    body = `<div class="wbank-cards">${accts.map(a => `<button class="wbank-tile" data-a="bankAcct" data-x="${a.id}"><b>${a.name}</b><span>${fmtMoney(a.bal, true)}</span><small>${esc(a.note)}</small></button>`).join('')}</div>
    <div class="wbank-actions">
      <button data-a="bankView" data-x="add"><span class="wbank-act">＋</span><small>Add money</small></button>
      <button data-a="bankView" data-x="jobs"><span class="wbank-act">💼</span><small>Find job</small></button>
      <button data-a="bankView" data-x="card"><span class="wbank-act">💳</span><small>Cards</small></button>
      <button data-a="bankView" data-x="account"><span class="wbank-act">🏦</span><small>Account</small></button>
    </div>
    <div class="wbank-cards">
      <button class="wbank-tile" data-a="bankView" data-x="loan"><b>Loans</b><span>${lt.count === 0 ? 'No loans' : `${lt.count} loan${lt.count === 1 ? '' : 's'} · ${fmtMoney(lt.remaining, true)} left`}</span><small>${lt.weekly > 0 ? fmtMoney(lt.weekly) + '/week' : 'View loans →'}</small></button>
      <button class="wbank-tile" data-a="bankView" data-x="citybanks"><b>City banks</b><span>Bank of every city</span><small>Loans on approval, profit and loss →</small></button>
    </div>
    ${lt.count > 0 ? `<div class="wbank-next"><b>Up next: loan payment ${fmtMoney(lt.weekly)}/week</b><span>${lt.loans.reduce((t, l) => t + l.weeksLeft, 0)} payments left across your loans</span></div>` : `<div class="wbank-next"><b>Up next: take your first loan</b><span>Borrow to build, repay weekly from your cash</span></div>`}`;
  }
  return panelShell('Bank', 'Worl Bank — your money, loans, and career.',
    `<div class="wbank">${head}${body}</div>`);
}

// ---------- city banks ----------
// Every CITY gets its own bank business, not every country. Worl Bank
// stays the banking app in your phone; these are the businesses in
// the cities — Bank of Moscow, Bank of New York, and so on. They lend
// to you and to other countries on approval, and they are profit-and-
// loss businesses: interest collected is profit, defaults are losses.
function cityBankName(city) { return 'Bank of ' + city.name; }
function cityBankRate(city) { return 0.05 + (city.id % 9) * 0.005; }
function cityBankCapital(city) { return Math.round((city.gdpAlloc || 0) * 0.02); }
function cityBank(cityId) {
  if (!S.cityBanks) S.cityBanks = {};
  const city = (typeof W !== 'undefined' && W.cities) ? W.cities[cityId] : null;
  if (!city) return null;
  if (!S.cityBanks[cityId]) S.cityBanks[cityId] = { cityId, name: cityBankName(city), rate: cityBankRate(city), capital: cityBankCapital(city), profit: 0, loaned: 0, loans: 0, cpuLoans: [] };
  return S.cityBanks[cityId];
}
function cityBankMaxLoan(bank) { return Math.max(100000, Math.floor(bank.capital * 0.5)); }
function takeCityLoan(cityId, amount, months) {
  ensureStores();
  const bank = cityBank(cityId);
  if (!bank) return 'No bank in that city.';
  amount = Math.floor(amount); months = clamp(Math.floor(months), 6, 60);
  if (!amount || amount < 1000) return 'Enter a loan amount of at least $1,000.';
  const limit = Math.min(Math.max(100000, S.cash * 5 + 500000), cityBankMaxLoan(bank));
  if (amount > limit) return `${bank.name} approved you for up to ${fmtMoney(limit, true)} — not ${fmtMoney(amount, true)}.`;
  const rate = bank.rate, weeks = Math.max(4, Math.round(months * 4.33)), weekly = loanWeeklyPayment(amount, rate, months);
  S.cash += amount;
  S.loans.push({ id: uid(), amount, rate, months, weeksLeft: weeks, weeksTotal: weeks, weekly, paid: 0, bank: cityId });
  bank.loaned += amount; bank.loans++;
  news('Bank', `Loan from ${bank.name}: ${fmtMoney(amount, true)} at ${(rate * 100).toFixed(2)}% for ${months} months, ${fmtMoney(weekly)}/week.`, S.home);
  return null;
}
// Weekly city-bank bookkeeping, run from loansWeek: interest profit
// on your loans, CPU country borrowing, and CPU loan repayments/defaults.
function cityBanksWeek() {
  if (!S.cityBanks) S.cityBanks = {};
  // Your loans: interest portion of this week's payment is bank profit.
  (S.loans || []).forEach(ln => {
    if (ln.bank == null) return;
    const b = cityBank(ln.bank);
    if (b && ln.weeksTotal) b.profit += ln.weekly - ln.amount / ln.weeksTotal;
  });
  // One new CPU country loan a week, from a random city's bank, on
  // approval: only if that country can carry it and the bank can fund it.
  try {
    const cities = W.cities || [];
    if (cities.length) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const b = cityBank(city.id);
      const cs = typeof country === 'function' ? country(city.a3) : null;
      if (b && cs && (cs.treasury || 0) > 0) {
        const amount = Math.min(Math.round(b.capital * 0.05), 10000000, Math.round((cs.treasury || 0) * 0.5));
        if (amount >= 100000) {
          const weeks = 52, weekly = Math.round(amount * 1.065 / weeks);
          cs.treasury += amount; b.loaned += amount;
          b.cpuLoans.push({ a3: city.a3, amount, weeksLeft: weeks, weeksTotal: weeks, weekly });
        }
      }
    }
  } catch (e) {}
  // Repay CPU loans, or write them off if the country cannot pay.
  for (const id in S.cityBanks) {
    const b = S.cityBanks[id];
    if (!Array.isArray(b.cpuLoans)) b.cpuLoans = [];
    const kept = [];
    b.cpuLoans.forEach(l => {
      const cs = typeof country === 'function' ? country(l.a3) : null;
      if (cs && (cs.treasury || 0) >= l.weekly) {
        cs.treasury -= l.weekly; b.profit += l.weekly - l.amount / l.weeksTotal; l.weeksLeft--;
        if (l.weeksLeft > 0) kept.push(l);
      } else {
        b.profit -= l.amount * (l.weeksLeft / l.weeksTotal);
      }
    });
    b.cpuLoans = kept;
  }
}
