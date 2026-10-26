// Casino — BOTH ways, in-game cash only. No real money, no real-money
// purchases, no new currency: every bet, build cost, income and payout
// moves the same S.cash every other system uses, and cash never goes
// below zero because a bet is capped at the cash on hand.
//   1. Own a casino: build one in your home capital, in a capital of a
//      country you occupy, or in a capital where you control the
//      flagship company. One casino per city. It pays strong but
//      volatile weekly income, draws tourists (each extra casino in
//      the same country boosts every casino there by 5%), and costs
//      stability: -3 on build, then -0.05/week per casino in that
//      country. Sell for 80% of build cost.
//   2. Play in a casino: slots, blackjack and roulette in the Casino
//      panel, playable whether or not you own a casino. Correct rules,
//      a real house edge, and bets capped at your cash.
// State lives on S (saved by the existing save path). Weekly income
// runs from casinoWeek(), hooked into businessWeek() like marsWeek.
'use strict';

// ---------- owned casinos ----------
function ensureCasinos() {
  if (!S) return null;
  if (!Array.isArray(S.casinos)) S.casinos = [];
  if (!S.casinoPlay || typeof S.casinoPlay !== 'object') S.casinoPlay = { bet: 10000, lastSlots: null, lastRoulette: null, bj: null, won: 0, lost: 0 };
  if (!isFinite(S.casinoPlay.bet) || S.casinoPlay.bet <= 0) S.casinoPlay.bet = 10000;
  return S.casinos;
}
function casinoBuildCities() {
  // Home capital, capitals of countries you occupy, capitals where you
  // control the flagship company. One casino per city, so built cities
  // are excluded.
  ensureCasinos();
  const built = new Set(S.casinos.map(c => c.cityId));
  const out = [];
  const consider = a3 => {
    const k = W.byA3[a3]; if (!k || k.capital == null) return;
    const city = W.cities[k.capital]; if (!city || built.has(city.id)) return;
    out.push(city);
  };
  consider(S.home);
  for (const a3 in S.countries) {
    const cs = S.countries[a3];
    if (cs && cs.occ === S.home) consider(a3);
    if (typeof controlled === 'function' && controlled(a3)) consider(a3);
  }
  return out;
}
function casinoPrice(city) {
  const k = W.byA3[city.a3]; if (!k) return 10000000;
  return Math.max(10000000, Math.round(k.gdp0 * 1e6 * 0.001 / 1000) * 1000);
}
function casinoBuild(cityId) {
  ensureCasinos();
  const city = W.cities[cityId]; if (!city) return 'City not found.';
  if (!casinoBuildCities().some(c => c.id === cityId)) return 'You can only build a casino in your home capital, or in a capital you control or occupy.';
  if (S.casinos.some(c => c.cityId === cityId)) return 'That city already has a casino.';
  const price = casinoPrice(city);
  if (S.cash < price) return `Needs ${fmtMoney(price, true)}.`;
  S.cash -= price;
  const cs = country(city.a3);
  if (cs) cs.stab = clamp(cs.stab - 3, 0, 100);
  S.casinos.push({ id: uid(), cityId, a3: city.a3, name: city.name + ' Casino', price, weeksOpen: 0, totalIncome: 0, lastWeek: 0 });
  news('Business', `You opened ${city.name} Casino. Strong income, but the neighbours are not thrilled.`, city.a3);
  return null;
}
function casinoSell(id) {
  ensureCasinos();
  const c = S.casinos.find(x => x.id === id); if (!c) return 'Casino not found.';
  const back = Math.round(c.price * 0.8);
  S.cash += back;
  S.casinos = S.casinos.filter(x => x.id !== id);
  return null;
}
function casinosInCountry(a3) { ensureCasinos(); return S.casinos.filter(c => c.a3 === a3); }
function casinoWeek() {
  ensureCasinos();
  for (const c of S.casinos) {
    // Strong, volatile house income: ~0.2% of build cost per week on
    // average, swinging 0.14%–0.32%. A cluster draws tourists: +5%
    // income per extra casino in the same country.
    const cluster = 1 + 0.05 * Math.max(0, casinosInCountry(c.a3).length - 1);
    const income = Math.round(c.price * 0.002 * (0.7 + rand() * 0.6) * cluster);
    c.lastWeek = income; c.totalIncome += income; c.weeksOpen++;
    S.cash += income;
    const cs = country(c.a3);
    if (cs) cs.stab = clamp(cs.stab - 0.05, 0, 100);
  }
}

// ---------- playing: shared bet ----------
function casinoBet() {
  ensureCasinos();
  return Math.max(0, Math.floor(S.casinoPlay.bet || 0));
}
function casinoSetBet(amount) {
  ensureCasinos();
  if (amount === 'max') { S.casinoPlay.bet = Math.max(0, Math.floor(S.cash)); return null; }
  const n = Math.floor(+amount || 0);
  if (n <= 0) return 'Pick a bet size.';
  if (n > S.cash) return `You only have ${fmtMoney(S.cash, true)}.`;
  S.casinoPlay.bet = n; return null;
}
function casinoTakeBet() {
  // Returns the bet, or an error string. Deducts only after all checks,
  // so cash can never go below zero through a game.
  ensureCasinos();
  const bet = casinoBet();
  if (S.cash <= 0) return 'You are out of cash — earn some first, then come back.';
  if (bet <= 0) return 'Pick a bet size first.';
  if (bet > S.cash) return `You only have ${fmtMoney(S.cash, true)} — lower your bet.`;
  S.cash -= bet;
  return bet;
}
function casinoCredit(amount) { S.cash += Math.round(amount); }

// ---------- slots ----------
// Weighted reels (21 stops): 7 x1, diamond x2, star x3, bell x4, lemon
// x5, cherry x6. Paytable: 3x7 = 100x, 3x diamond = 50x, 3x star = 25x,
// 3x bell = 15x, 3x lemon = 10x, 3x cherry = 5x, exactly one pair =
// stake back. Expected return ~96% (verified by simulation in the
// harness), so the house edge is ~4%.
const SLOT_SYMS = [
  { s: '7️⃣', w: 1, pay: 100 }, { s: '💎', w: 2, pay: 50 }, { s: '⭐', w: 3, pay: 25 },
  { s: '🔔', w: 4, pay: 15 }, { s: '🍋', w: 5, pay: 10 }, { s: '🍒', w: 6, pay: 5 },
];
const SLOT_BAG = [];
SLOT_SYMS.forEach(sym => { for (let i = 0; i < sym.w; i++) SLOT_BAG.push(sym); });
function casinoSlots() {
  const bet = casinoTakeBet();
  if (typeof bet === 'string') return bet;
  const reels = [0, 1, 2].map(() => SLOT_BAG[Math.floor(rand() * SLOT_BAG.length)]);
  let mult = 0, label;
  if (reels[0].s === reels[1].s && reels[1].s === reels[2].s) { mult = reels[0].pay; label = `Three ${reels[0].s} — ${mult}x!`; }
  else if (reels[0].s === reels[1].s || reels[1].s === reels[2].s || reels[0].s === reels[2].s) { mult = 1; label = 'A pair — stake back.'; }
  else { label = 'No win.'; }
  const win = Math.round(bet * mult);
  if (win > 0) casinoCredit(win);
  if (win > bet) S.casinoPlay.won += win - bet; else if (win < bet) S.casinoPlay.lost += bet - win;
  S.casinoPlay.lastSlots = { reels: reels.map(r => r.s), bet, win, label };
  return null;
}

// ---------- blackjack ----------
// One shuffled 52-card deck per hand. Dealer stands on all 17s and hits
// soft 17. Blackjack pays 3:2. Bust loses, push returns the stake.
const BJ_SUITS = ['♠', '♥', '♦', '♣'];
const BJ_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
function bjDeck() {
  const d = [];
  BJ_SUITS.forEach(s => BJ_RANKS.forEach(r => d.push(r + s)));
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
  return d;
}
function bjValue(cards) {
  let total = 0, aces = 0;
  cards.forEach(c => {
    const r = c.slice(0, -1);
    if (r === 'A') { aces++; total += 11; }
    else if (r === 'J' || r === 'Q' || r === 'K') total += 10;
    else total += +r;
  });
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  const soft = aces > 0 && total <= 21;
  return { total, soft };
}
function bjLabel(cards) { return cards.join(' '); }
function casinoBJDeal() {
  ensureCasinos();
  const bet = casinoTakeBet();
  if (typeof bet === 'string') return bet;
  const deck = bjDeck();
  const player = [deck.pop(), deck.pop()], dealer = [deck.pop(), deck.pop()];
  const hand = { bet, deck, player, dealer, done: false, result: '' };
  S.casinoPlay.bj = hand;
  const pv = bjValue(player), dv = bjValue(dealer);
  if (pv.total === 21 && dv.total === 21) { casinoCredit(bet); hand.done = true; hand.result = 'Both blackjack — push, stake back.'; }
  else if (pv.total === 21) { const win = Math.round(bet * 2.5); casinoCredit(win); S.casinoPlay.won += win - bet; hand.done = true; hand.result = `Blackjack! Pays 3:2 — you win ${fmtMoney(win - bet, true)}.`; }
  else if (dv.total === 21) { S.casinoPlay.lost += bet; hand.done = true; hand.result = 'Dealer blackjack. You lose.'; }
  return null;
}
function casinoBJHit() {
  ensureCasinos();
  const h = S.casinoPlay.bj;
  if (!h || h.done) return 'Deal a new hand first.';
  h.player.push(h.deck.pop());
  const v = bjValue(h.player);
  if (v.total > 21) { S.casinoPlay.lost += h.bet; h.done = true; h.result = `Bust at ${v.total}. You lose.`; }
  else if (v.total === 21) return casinoBJStand();
  return null;
}
function casinoBJStand() {
  ensureCasinos();
  const h = S.casinoPlay.bj;
  if (!h || h.done) return 'Deal a new hand first.';
  let dv = bjValue(h.dealer);
  while (dv.total < 17 || (dv.total === 17 && dv.soft)) { h.dealer.push(h.deck.pop()); dv = bjValue(h.dealer); }
  const pv = bjValue(h.player);
  h.done = true;
  if (dv.total > 21) { const win = h.bet * 2; casinoCredit(win); S.casinoPlay.won += h.bet; h.result = `Dealer busts at ${dv.total}. You win ${fmtMoney(h.bet, true)}.`; }
  else if (pv.total > dv.total) { const win = h.bet * 2; casinoCredit(win); S.casinoPlay.won += h.bet; h.result = `You win ${pv.total} vs ${dv.total} — +${fmtMoney(h.bet, true)}.`; }
  else if (pv.total < dv.total) { S.casinoPlay.lost += h.bet; h.result = `Dealer wins ${dv.total} vs ${pv.total}. You lose.`; }
  else { casinoCredit(h.bet); h.result = `Push at ${pv.total} — stake back.`; }
  return null;
}

// ---------- roulette ----------
// European single-zero wheel (0–36). Even-money bets (red/black,
// even/odd, low/high) pay 1:1 and lose on zero — that zero is the
// ~2.7% house edge. A single number pays 35:1.
const ROULETTE_RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
function casinoRoulette(kind, num) {
  const bet = casinoTakeBet();
  if (typeof bet === 'string') return bet;
  const n = Math.floor(rand() * 37);
  const isRed = ROULETTE_RED.has(n), color = n === 0 ? 'green' : (isRed ? 'red' : 'black');
  let win = 0, label;
  if (kind === 'number') {
    const pick = Math.floor(+num);
    if (pick < 0 || pick > 36 || !isFinite(pick)) { S.cash += bet; return 'Pick a number from 0 to 36.'; }
    if (n === pick) { win = bet * 36; label = `Number ${n} hits — 35:1!`; }
    else label = `Ball lands ${n} ${color} — your ${pick} misses.`;
  } else {
    let hit = false;
    if (kind === 'red') hit = isRed;
    else if (kind === 'black') hit = n !== 0 && !isRed;
    else if (kind === 'even') hit = n !== 0 && n % 2 === 0;
    else if (kind === 'odd') hit = n % 2 === 1;
    else if (kind === 'low') hit = n >= 1 && n <= 18;
    else if (kind === 'high') hit = n >= 19 && n <= 36;
    else { S.cash += bet; return 'Unknown roulette bet.'; }
    if (hit) { win = bet * 2; label = `Ball lands ${n} ${color} — you win ${fmtMoney(bet, true)}.`; }
    else label = `Ball lands ${n} ${color} — you lose.`;
  }
  if (win > 0) casinoCredit(win);
  if (win > bet) S.casinoPlay.won += win - bet; else if (win < bet) S.casinoPlay.lost += bet - win;
  S.casinoPlay.lastRoulette = { n, color, bet, win, label };
  return null;
}

// ---------- panel ----------
function casinoPanelHTML() {
  ensureCasinos();
  const bet = casinoBet();
  const tab = UI.casinoTab || 'slots';
  const chip = v => `<button class="btn ${bet === v ? 'on' : ''}" data-a="casinoBet" data-x="${v}">${fmtMoney(v, true)}</button>`;
  const betRow = `<div class="row wrap"><span class="muted small">BET</span>${chip(1000)}${chip(10000)}${chip(100000)}${chip(1000000)}<button class="btn" data-a="casinoBet" data-x="max">MAX</button></div>
    <p class="muted small">Your cash: <b>${fmtMoney(S.cash, true)}</b> · Bet: <b>${fmtMoney(bet, true)}</b> · Session: won ${fmtMoney(S.casinoPlay.won, true)} / lost ${fmtMoney(S.casinoPlay.lost, true)}</p>`;
  const tabs = `<div class="row wrap"><button class="btn ${tab === 'slots' ? 'on' : ''}" data-a="casinoTab" data-x="slots">🎰 SLOTS</button><button class="btn ${tab === 'blackjack' ? 'on' : ''}" data-a="casinoTab" data-x="blackjack">🃏 BLACKJACK</button><button class="btn ${tab === 'roulette' ? 'on' : ''}" data-a="casinoTab" data-x="roulette">🎡 ROULETTE</button></div>`;
  let play = '';
  if (tab === 'slots') {
    const l = S.casinoPlay.lastSlots;
    play = `<h4>Slots</h4><p class="muted small">3 reels. Three 7s pay 100x, diamonds 50x, stars 25x, bells 15x, lemons 10x, cherries 5x, any pair returns your stake. House edge ~4%.</p>
      ${l ? `<div class="card in"><div style="font-size:32px;letter-spacing:6px">${l.reels.join(' ')}</div><p class="muted small">${esc(l.label)} · Bet ${fmtMoney(l.bet, true)} · Won ${fmtMoney(l.win, true)}</p></div>` : ''}
      <button class="btn3d orange wide" data-a="casinoSlots">SPIN · ${fmtMoney(bet, true)}</button>`;
  } else if (tab === 'blackjack') {
    const h = S.casinoPlay.bj;
    play = `<h4>Blackjack</h4><p class="muted small">Dealer stands on all 17s, hits soft 17. Blackjack pays 3:2. Beat the dealer without going over 21.</p>
      ${h ? `<div class="card in"><p><b>You:</b> ${esc(bjLabel(h.player))} = ${bjValue(h.player).total}</p><p><b>Dealer:</b> ${h.done ? esc(bjLabel(h.dealer)) + ' = ' + bjValue(h.dealer).total : esc(h.dealer[0]) + ' ?'}</p>${h.done ? `<p class="muted small">${esc(h.result)}</p>` : ''}</div>` : ''}
      ${!h || h.done
        ? `<button class="btn3d orange wide" data-a="casinoBJDeal">DEAL · ${fmtMoney(bet, true)}</button>`
        : `<div class="row wrap"><button class="btn3d orange flex" data-a="casinoBJHit">HIT</button><button class="btn3d flex" data-a="casinoBJStand">STAND</button></div>`}`;
  } else {
    const l = S.casinoPlay.lastRoulette;
    play = `<h4>Roulette</h4><p class="muted small">European wheel, single zero. Even-money bets pay 1:1 and lose on zero. A single number pays 35:1.</p>
      ${l ? `<div class="card in"><p><b>${l.n} ${esc(l.color)}</b></p><p class="muted small">${esc(l.label)} · Bet ${fmtMoney(l.bet, true)} · Won ${fmtMoney(l.win, true)}</p></div>` : ''}
      <div class="row wrap"><button class="btn" data-a="casinoRoulette" data-x="red">🔴 RED</button><button class="btn" data-a="casinoRoulette" data-x="black">⚫ BLACK</button><button class="btn" data-a="casinoRoulette" data-x="even">EVEN</button><button class="btn" data-a="casinoRoulette" data-x="odd">ODD</button><button class="btn" data-a="casinoRoulette" data-x="low">1–18</button><button class="btn" data-a="casinoRoulette" data-x="high">19–36</button></div>
      <div class="row wrap" style="margin-top:8px"><input id="rouletteNum" class="search" type="number" min="0" max="36" value="7" style="max-width:110px"><button class="btn3d orange" data-a="casinoRouletteNumber">BET NUMBER · ${fmtMoney(bet, true)}</button></div>`;
  }
  const cities = casinoBuildCities();
  const own = S.casinos.map(c => {
    const city = W.cities[c.cityId];
    return `<div class="card in"><b>🎰 ${esc(c.name)}</b><div class="muted small">${city ? esc(city.name) : ''} · ${esc(cname(c.a3))} · Built ${fmtMoney(c.price, true)} · ${c.weeksOpen} weeks open</div>
      <div class="kv"><span>Last week</span><b>${fmtMoney(c.lastWeek, true)}</b></div><div class="kv"><span>Total income</span><b>${fmtMoney(c.totalIncome, true)}</b></div>
      <div class="row wrap"><button class="btn" data-a="casinoTab" data-x="slots">PLAY HERE</button><button class="btn" data-a="casinoSell" data-x="${c.id}">SELL · ${fmtMoney(Math.round(c.price * 0.8), true)}</button></div></div>`;
  }).join('') || '<p class="muted small">You own no casinos yet.</p>';
  const build = cities.length
    ? `<div class="row wrap"><select id="casinoCity" class="search" style="flex:1">${cities.map(c => `<option value="${c.id}">${esc(c.name)} · ${esc(cname(c.a3))} · ${fmtMoney(casinoPrice(c), true)}</option>`).join('')}</select><button class="btn3d orange" data-a="casinoBuild">BUILD CASINO</button></div>`
    : '<p class="muted small">No city available: build in your home capital, or in a capital you control or occupy.</p>';
  return panelShell('Casino', 'In-game cash only. No real money. The house wins on average — play it that way.',
    `<div class="card in"><h4>Play</h4>${betRow}${tabs}${play}</div>
     <div class="card in"><h4>Your casinos</h4><p class="muted small">Strong weekly income, plus 5% per extra casino in the same country from tourists. Costs stability: −3 when built, then −0.05/week per casino in that country. Sell for 80%.</p>${own}${build}</div>`);
}
