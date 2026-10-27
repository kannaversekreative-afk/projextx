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
  const head = `<div class="wbank-head"><b>🌍 Worl Bank</b><span><button class="wbank-bell" data-a="panel" data-x="web" aria-label="Mail">🔔</button><button class="wbank-borrow" data-a="bankView" data-x="loan">Borrow</button></span></div>`;
  let body = '';
  if (view === 'loan') {
    body = `<button class="wbank-back" data-a="bankView" data-x="home">← Bank</button>
    <h3 class="wbank-h">New business loan</h3><p class="wbank-note">Interest 6.50% a year. Weekly payment is fixed for the whole term.</p>
    <label class="wbank-label">LOAN AMOUNT</label><input id="loanAmt" class="wbank-input" type="number" value="1000000">
    <label class="wbank-label">MATURITY (months)</label><input id="loanMonths" class="wbank-input" type="number" value="36">
    <button class="btn3d orange wide" data-a="takeLoan">TAKE LOAN</button>
    <h3 class="wbank-h">Your loans</h3>
    ${S.loan > 0 ? `<div class="wbank-loanrow"><span>Main loan</span><b>${fmtMoney(S.loan, true)} owed</b><button class="wbank-smallbtn" data-a="repay">Repay in full</button></div>` : ''}
    ${lt.loans.map(l => `<div class="wbank-loanrow"><span>${fmtMoney(l.amount, true)} · ${(l.rate * 100).toFixed(2)}% · ${l.months} months</span><b>${fmtMoney(l.weekly)}/week · ${l.weeksLeft} weeks left</b></div>`).join('') || (S.loan > 0 ? '' : '<p class="wbank-note">No loans outstanding.</p>')}
    <p class="wbank-note">Bank will lend up to ${fmtMoney(maxLoan(), true)} on your main loan.</p>`;
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
    </div>
    ${lt.count > 0 ? `<div class="wbank-next"><b>Up next: loan payment ${fmtMoney(lt.weekly)}/week</b><span>${lt.loans.reduce((t, l) => t + l.weeksLeft, 0)} payments left across your loans</span></div>` : `<div class="wbank-next"><b>Up next: take your first loan</b><span>Borrow to build, repay weekly from your cash</span></div>`}`;
  }
  return panelShell('Bank', 'Worl Bank — your money, loans, and career.',
    `<div class="wbank">${head}${body}</div>`);
}
