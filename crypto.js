// Crypto — FAKE coins only. No real BTC, no real price API, no real
// money anywhere: every stake, win and loss moves the same in-game
// S.cash every other system uses, and cash never goes below zero
// because a stake is capped at the cash on hand.
//   How it works: 5 fake coins ($PUMP, $MOON, $DUMP, $HODL, $FOMO).
// Each coin's price is set when the game is created (first crypto
// access fixes it into the save, and it never re-rolls) and then the
// coin DOES NOT MOVE — until the player bets on it. A bet guesses UP
// or DOWN; the coin then moves for 30 real seconds (one tick a second,
// 30 points on the chart) and the bet settles on the final price:
// guess right and win pays 2x the stake (stake back + equal winnings);
// an exact tie refunds the stake.
//   The 30-second move follows one regime, rolled per bet:
//     Sideways 40% — fluctuates in a range around the start price
//     Bull market 20% — generally increasing
//     Bear market 20% — generally decreasing
//     High volatility 15% — large movements in either direction
//     Crash or rally shock 5% — one big sudden jump, then small noise
//   Coins move independently: betting on $PUMP moves only $PUMP, and a
// coin with a bet already moving cannot take another bet until it
// settles. A movement is a real 30-second wall-clock window: the timer
// runs while the page is open, and a movement interrupted by a reload
// resumes or settles the next time the Crypto panel opens.
// State lives on S (saved by the existing save path).
'use strict';

// Fake coins: symbol, display name, starting price (set at creation).
const CRYPTO_COINS = [
  { id: 'pump', sym: '$PUMP', name: 'Pump', start: 1.00 },
  { id: 'moon', sym: '$MOON', name: 'Moon', start: 0.50 },
  { id: 'dump', sym: '$DUMP', name: 'Dump', start: 3.20 },
  { id: 'hodl', sym: '$HODL', name: 'Hodl', start: 10.00 },
  { id: 'fomo', sym: '$FOMO', name: 'Fomo', start: 0.08 },
];
const CRYPTO_MOVE_SECS = 30;
const CRYPTO_TICK_MS = 1000;
const CRYPTO_REGIMES = [
  { id: 'sideways', label: 'Sideways', w: 0.40 },
  { id: 'bull', label: 'Bull market', w: 0.20 },
  { id: 'bear', label: 'Bear market', w: 0.20 },
  { id: 'highvol', label: 'High volatility', w: 0.15 },
  { id: 'shock', label: 'Crash / rally shock', w: 0.05 },
];
let cryptoMoveTimer = null;

function ensureCrypto() {
  if (!S) return null;
  // Migration from the old real-BTC system: unsettled real-price bets
  // can never settle now, so their stakes are refunded, and the old
  // price/tick fields are dropped. Won/lost history is kept.
  if (!S.crypto || typeof S.crypto !== 'object' || !S.crypto.coins) {
    const old = (S.crypto && typeof S.crypto === 'object') ? S.crypto : null;
    let refund = 0;
    if (old && Array.isArray(old.bets)) old.bets.forEach(b => { if (!b.settled && isFinite(b.stake)) refund += b.stake; });
    if (refund > 0 && typeof S.cash === 'number') S.cash += refund;
    S.crypto = {
      coins: {}, bets: [],
      won: (old && isFinite(old.won)) ? old.won : 0,
      lost: (old && isFinite(old.lost)) ? old.lost : 0,
      lastStake: (old && isFinite(old.lastStake) && old.lastStake > 0) ? old.lastStake : 10000,
    };
    CRYPTO_COINS.forEach(c => { S.crypto.coins[c.id] = { price: c.start, hist: [c.start], moving: null }; });
  }
  if (!Array.isArray(S.crypto.bets)) S.crypto.bets = [];
  if (!isFinite(S.crypto.lastStake) || S.crypto.lastStake <= 0) S.crypto.lastStake = 10000;
  return S.crypto;
}

function cryptoCoinDef(id) { return CRYPTO_COINS.find(c => c.id === id) || CRYPTO_COINS[0]; }
function cryptoCoinState(id) { const cr = ensureCrypto(); if (!cr.coins[id]) { const d = cryptoCoinDef(id); cr.coins[id] = { price: d.start, hist: [d.start], moving: null }; } return cr.coins[id]; }

// Roll one regime per bet, on the game's weights.
function cryptoPickRegime() {
  const r = Math.random();
  let acc = 0;
  for (const g of CRYPTO_REGIMES) { acc += g.w; if (r < acc) return g.id; }
  return 'sideways';
}

// Build the 30-step path (prices after each 1-second tick) for a bet.
// Steps are fractions of the current price; the price floor keeps a
// crashed coin alive at a tiny positive price instead of zero/negative.
function cryptoGenPath(regime, start) {
  const path = [];
  let p = start;
  const push = (step) => { p = Math.max(0.0001, p * (1 + step)); path.push(p); };
  if (regime === 'bull') { for (let i = 0; i < CRYPTO_MOVE_SECS; i++) push(0.004 + (Math.random() * 2 - 1) * 0.005); }
  else if (regime === 'bear') { for (let i = 0; i < CRYPTO_MOVE_SECS; i++) push(-0.004 + (Math.random() * 2 - 1) * 0.005); }
  else if (regime === 'highvol') { for (let i = 0; i < CRYPTO_MOVE_SECS; i++) push((Math.random() * 2 - 1) * 0.02); }
  else if (regime === 'shock') {
    const dir = Math.random() < 0.5 ? -1 : 1;
    const at = 5 + Math.floor(Math.random() * 20);
    for (let i = 0; i < CRYPTO_MOVE_SECS; i++) push(i === at ? dir * (0.20 + Math.random() * 0.20) : (Math.random() * 2 - 1) * 0.003);
  }
  else { // sideways: small noise, pulled back toward the start price
    for (let i = 0; i < CRYPTO_MOVE_SECS; i++) push((Math.random() * 2 - 1) * 0.003 - (p - start) / start * 0.05);
  }
  return path;
}

// Place an up/down bet on a coin. Returns an error string, or null.
// Cash is deducted at placement; a coin already moving cannot take a
// second bet until its movement settles.
function cryptoPlaceBet(coinId, dir, stake) {
  const cr = ensureCrypto(); if (!cr) return 'No game loaded.';
  const def = cryptoCoinDef(coinId);
  if (dir !== 'up' && dir !== 'down') return 'Pick up or down.';
  stake = Math.floor(+stake);
  if (!isFinite(stake) || stake <= 0) return 'Enter a stake above $0.';
  if (stake > S.cash) return `Needs ${fmtMoney(stake, true)} — you have ${fmtMoney(S.cash, true)}.`;
  const st = cryptoCoinState(def.id);
  if (st.moving) return `${def.sym} is already moving — wait for it to settle.`;
  S.cash -= stake;
  if (S.cash < 0) S.cash = 0;
  cr.lastStake = stake;
  const now = Date.now();
  const regime = cryptoPickRegime();
  const bet = { id: uid(), coinId: def.id, dir, stake, startPrice: st.price, regime, placedAt: now, endsAt: now + CRYPTO_MOVE_SECS * 1000, settled: false, result: null, settlePrice: null, settledAt: null };
  cr.bets.unshift(bet);
  st.moving = { betId: bet.id, path: cryptoGenPath(regime, st.price), step: 0, endsAt: bet.endsAt };
  cryptoStartMoveTimer();
  return null;
}

function cryptoSettleCoin(coinId) {
  const cr = ensureCrypto(); if (!cr) return;
  const st = cryptoCoinState(coinId);
  if (!st.moving) return;
  const bet = cr.bets.find(b => b.id === st.moving.betId);
  st.moving = null;
  if (!bet || bet.settled) return;
  bet.settled = true; bet.settlePrice = st.price; bet.settledAt = Date.now();
  if (st.price === bet.startPrice) { bet.result = 'push'; S.cash += bet.stake; }
  else if ((bet.dir === 'up' && st.price > bet.startPrice) || (bet.dir === 'down' && st.price < bet.startPrice)) { bet.result = 'win'; S.cash += bet.stake * 2; cr.won++; }
  else { bet.result = 'lose'; cr.lost++; }
}

// One movement tick (1 second): advance every moving coin one step,
// settle coins whose 30 seconds are up, stop the timer when nothing
// is moving. Safe to call directly in tests.
function cryptoMoveTick() {
  const cr = ensureCrypto(); if (!cr) return;
  const now = Date.now();
  let anyMoving = false;
  CRYPTO_COINS.forEach(c => {
    const st = cryptoCoinState(c.id);
    if (!st.moving) return;
    if (now >= st.moving.endsAt || st.moving.step >= st.moving.path.length) {
      while (st.moving && st.moving.step < st.moving.path.length) { st.price = st.moving.path[st.moving.step]; st.moving.step++; st.hist.push(st.price); if (st.hist.length > 300) st.hist.splice(0, st.hist.length - 300); }
      cryptoSettleCoin(c.id);
      return;
    }
    st.price = st.moving.path[st.moving.step]; st.moving.step++;
    st.hist.push(st.price); if (st.hist.length > 300) st.hist.splice(0, st.hist.length - 300);
    anyMoving = true;
  });
  if (!anyMoving) cryptoStopMoveTimer();
  else {
    try { save(); } catch (e) {}
    if (typeof UI !== 'undefined' && UI.panel === 'crypto' && typeof renderPanelUnlessTyping === 'function') renderPanelUnlessTyping();
  }
}

function cryptoStartMoveTimer() {
  if (cryptoMoveTimer || typeof setInterval === 'undefined') return;
  cryptoMoveTimer = setInterval(() => { cryptoMoveTick(); }, CRYPTO_TICK_MS);
}
function cryptoStopMoveTimer() {
  if (cryptoMoveTimer && typeof clearInterval !== 'undefined') clearInterval(cryptoMoveTimer);
  cryptoMoveTimer = null;
}

// Panel open: resume movements interrupted by a reload (settle ones
// whose 30 seconds already passed, restart the timer for the rest).
function cryptoResumeMoves() {
  const cr = ensureCrypto(); if (!cr) return;
  let anyMoving = false;
  CRYPTO_COINS.forEach(c => {
    const st = cryptoCoinState(c.id);
    if (!st.moving) return;
    if (Date.now() >= st.moving.endsAt) {
      while (st.moving.step < st.moving.path.length) { st.price = st.moving.path[st.moving.step]; st.moving.step++; st.hist.push(st.price); if (st.hist.length > 300) st.hist.splice(0, st.hist.length - 300); }
      cryptoSettleCoin(c.id);
    } else anyMoving = true;
  });
  if (anyMoving) cryptoStartMoveTimer();
}

function cryptoCountdownSec(moving) {
  const s = Math.max(0, Math.ceil((moving.endsAt - Date.now()) / 1000));
  return `${s}s`;
}

function cryptoPanelHTML() {
  const cr = ensureCrypto();
  const selId = (typeof UI !== 'undefined' && UI.cryptoCoin) ? UI.cryptoCoin : 'pump';
  const def = cryptoCoinDef(selId);
  const st = cryptoCoinState(def.id);
  const hist = (st.hist || []).filter(v => isFinite(v));
  const chg = hist.length >= 2 ? (hist[hist.length - 1] / hist[0] - 1) : 0;
  const stakeVal = (typeof UI !== 'undefined' && UI.cryptoStakeVal != null && UI.cryptoStakeVal !== '') ? UI.cryptoStakeVal : cr.lastStake;
  const pending = cr.bets.filter(b => !b.settled);
  const done = cr.bets.filter(b => b.settled).slice(0, 10);
  const regimeLabel = id => (CRYPTO_REGIMES.find(g => g.id === id) || {}).label || id;
  const betRow = b => { const d = cryptoCoinDef(b.coinId); return `<div class="kv"><span>${d.sym} ${b.dir === 'up' ? '▲ UP' : '▼ DOWN'} from ${fmtMoney(b.startPrice)} · ${fmtMoney(b.stake, true)}${b.settled ? ` · settled ${fmtMoney(b.settlePrice)} · ${regimeLabel(b.regime)}` : ` · ${cryptoCountdownSec({ endsAt: b.endsAt })} left · ${regimeLabel(b.regime)}`}</span><b>${b.settled ? (b.result === 'win' ? 'WON +'+fmtMoney(b.stake, true) : b.result === 'push' ? 'PUSH refunded' : 'LOST') : 'MOVING'}</b></div>`; };
  return panelShell('Crypto', 'Fake coins only · in-game cash only · not real crypto',
    `<div class="card in"><h4>Fake coins</h4><p class="muted small">Prices are set when the game is created and do not move — until you bet. A bet moves its coin for 30 seconds, then settles on the final price. Nothing here is real crypto and no real money is involved.</p>
    <div class="row wrap">${CRYPTO_COINS.map(c => { const s2 = cryptoCoinState(c.id); const mv = s2.moving ? ' · MOVING' : ''; return `<button class="chip ${c.id === def.id ? 'on' : ''}" data-a="cryptoCoin" data-x="${c.id}">${c.sym}${mv}</button>`; }).join('')}</div></div>
    <div class="card in"><h4><span class="livedot"></span> ${def.sym} · ${def.name}</h4>
    <div class="trade-head"><div><div class="big">${fmtMoney(st.price)}</div><div class="${upCls(chg)}">${fmtPct(chg)} since creation${st.moving ? ` · MOVING ${cryptoCountdownSec(st.moving)} left · ${regimeLabel(cr.bets.find(b => b.id === st.moving.betId)?.regime)}` : ' · still — bet to move it'}</div></div></div>
    ${hist.length >= 2 ? lineChart(hist, { h: 160 }) : '<p class="muted small">No movement yet — place a bet and the chart draws the 30-second move live.</p>'}
    <p class="muted small">Chart shows every price this coin has had, starting at its creation price. A coin only moves during its 30-second bet window.</p></div>
    <div class="card in"><h4>Bet on ${def.sym}</h4><p class="muted small">Guess up or down. Win pays 2× your stake (stake back + equal winnings). An exact tie refunds your stake. Cash: ${fmtMoney(S.cash, true)}.</p>
    <div class="row"><span class="muted small" style="min-width:90px">Stake $</span><input id="cryptoStake" class="search" type="number" min="1" step="1" value="${stakeVal}"></div>
    <div class="row wrap"><button class="btn3d orange flex" data-a="cryptoPlace" data-x="up">BET UP ▲</button><button class="btn3d orange flex" data-a="cryptoPlace" data-x="down">BET DOWN ▼</button></div>
    ${st.moving ? `<p class="muted small">${def.sym} is moving — wait ${cryptoCountdownSec(st.moving)} for it to settle before betting on it again.</p>` : ''}</div>
    <div class="card in"><h4>Open bets (${pending.length})</h4>${pending.map(betRow).join('') || '<p class="muted small">No open bets.</p>'}</div>
    <div class="card in"><h4>Recent results · Won ${cr.won} · Lost ${cr.lost}</h4>${done.map(betRow).join('') || '<p class="muted small">Nothing settled yet.</p>'}</div>
    <p class="muted small">Regimes per bet: Sideways 40% (fluctuates in a range), Bull 20% (generally up), Bear 20% (generally down), High volatility 15% (large moves either way), Crash / rally shock 5% (one big jump).</p>`);
}
