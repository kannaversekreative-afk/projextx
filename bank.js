// ---------- Worl Bank ----------
// The banking app, laid out like a modern bank app (original names
// and art only): big Available balance, four quick actions, and two
// cards — Loans and Savings. Everything shown is real in-game state:
// Available is business cash, Loans are your actual loans, Savings is
// your personal money kept aside from the business (there is no
// separate savings account in the game yet, so no interest is shown).
// Account, routing and card numbers are randomized once per save and
// kept in S.bankAcct — display only, they move no money.
function bankDigits(n) {
  let s = String(1 + Math.floor(Math.random() * 9));
  while (s.length < n) s += Math.floor(Math.random() * 10);
  return s;
}
function bankAcct() {
  if (!S.bankAcct) {
    S.bankAcct = {
      account: bankDigits(12),
      routing: bankDigits(9),
      card: bankDigits(16),
      exp: String(1 + Math.floor(Math.random() * 12)).padStart(2, '0') + '/' + String(28 + Math.floor(Math.random() * 5)),
    };
  }
  return S.bankAcct;
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
    body = `<button class="wbank-back" data-a="bankView" data-x="home">← Bank</button>
    <h3 class="wbank-h">Account</h3>
    <div class="wbank-numbox"><span>Account number</span><b>${acct.account}</b></div>
    <div class="wbank-numbox"><span>Routing number</span><b>${acct.routing}</b></div>
    <p class="wbank-note">Your in-game Worl Bank account. These numbers are display only.</p>`;
  } else if (view === 'card') {
    const grouped = acct.card.replace(/(\d{4})(?=\d)/g, '$1 ');
    body = `<button class="wbank-back" data-a="bankView" data-x="home">← Bank</button>
    <h3 class="wbank-h">Cards</h3>
    <div class="wbank-cardart"><b>🌍 Worl Bank</b><span class="wbank-chip"></span><div class="wbank-cardnum">${grouped}</div><div class="wbank-cardrow"><span>${esc((S.you && S.you.name) || 'Founder')}</span><span>EXP ${acct.exp}</span></div></div>
    <p class="wbank-note">Your in-game bank card. Display only — spending still goes through your business cash.</p>`;
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
    body = `<div class="wbank-avail"><span>Available</span><b>${fmtMoney(S.cash)}</b><small>Main loan ${fmtMoney(S.loan || 0, true)} · Bank will lend ${fmtMoney(maxLoan(), true)}</small></div>
    <div class="wbank-actions">
      <button data-a="bankView" data-x="add"><span class="wbank-act">＋</span><small>Add money</small></button>
      <button data-a="bankView" data-x="jobs"><span class="wbank-act">💼</span><small>Find job</small></button>
      <button data-a="bankView" data-x="card"><span class="wbank-act">💳</span><small>Cards</small></button>
      <button data-a="bankView" data-x="account"><span class="wbank-act">🏦</span><small>Account</small></button>
    </div>
    <div class="wbank-cards">
      <button class="wbank-tile" data-a="bankView" data-x="loan"><b>Loans</b><span>${lt.count === 0 ? 'No loans' : `${lt.count} loan${lt.count === 1 ? '' : 's'} · ${fmtMoney(lt.remaining, true)} left`}</span><small>${lt.weekly > 0 ? fmtMoney(lt.weekly) + '/week' : 'View loans →'}</small></button>
      <button class="wbank-tile" data-a="bankView" data-x="add"><b>Savings</b><span>${fmtMoney(P.cash, true)}</span><small>Personal money set aside</small></button>
    </div>
    ${lt.count > 0 ? `<div class="wbank-next"><b>Up next: loan payment ${fmtMoney(lt.weekly)}/week</b><span>${lt.loans.reduce((t, l) => t + l.weeksLeft, 0)} payments left across your loans</span></div>` : `<div class="wbank-next"><b>Up next: take your first loan</b><span>Borrow to build, repay weekly from your cash</span></div>`}`;
  }
  return panelShell('Bank', 'Worl Bank — your money, loans, and career.',
    `<div class="wbank">${head}${body}</div>`);
}
