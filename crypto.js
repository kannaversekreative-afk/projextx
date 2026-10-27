// Crypto — its own panel, separate from Markets/Stocks. In-game cash ONLY:
// no real money, no real deposits, no new currency. Every stake, win and
// loss moves the same S.cash every other system uses, and cash never goes
// below zero because a stake is capped at the cash on hand.
//   How it works: pick Bitcoin (BTC), stake in-game cash, and bet whether
//   the price will be ABOVE or UNDER a target price X when a time window X
//   (1 / 5 / 15 / 60 real minutes) runs out. Win pays 2x the stake (stake
//   back + equal winnings); an exact tie refunds the stake.
//   Price source — REAL live BTC only, never the in-game economy: the
//   price comes from a free public API (Coinbase spot first, CoinGecko
//   fallback, no key on either). No GDP, growth, shock, country event,
//   sanction, war, or any other in-game modifier may move it, scale it,
//   or damp it — this file never reads S.countries, GDP, stability, wars
//   or any economic state, only S.cash and its own S.crypto record. The
//   free API lags real time by seconds to a minute; that lag is part of
//   the game, and a sharp player can have a small edge from it. If the
//   API is down, the panel shows the last-known price (labelled) or
//   "unavailable" — it never invents a price and never substitutes an
//   in-game-economy price. Bets whose settlement price cannot be fetched
//   simply stay open until a price comes back.
// State lives on S (saved by the existing save path). Bets settle on a
// real clock: they are checked whenever the Crypto panel opens, on the
// panel's Refresh / Settle buttons, and on every live tick while the
// panel is open (see the ticker below). A bet placed and left settles
// the next time the panel opens after its window ends.
//   Live chart: every successfully fetched price is appended to
// S.crypto.ticks (capped at 300 points) and drawn as a constantly
// moving line chart while the panel is open — one new real point every
// 10 seconds. The chart never interpolates, smooths, or invents points:
// every point on it is a price actually fetched from the public API.
'use strict';

// One new real price point every 10 seconds while the Crypto panel is
// open. 10s = 6 fetches/minute, inside both free sources' no-key limits.
// Mutable (not const) so tests can run the ticker fast.
let CRYPTO_TICK_MS = 10000;
let cryptoTimer = null;

// Free, no-key endpoints. Coinbase returns { data: { amount: "123..." } };
// CoinGecko returns { bitcoin: { usd: 123... } }.
const CRYPTO_SOURCES = [
  { name: 'Coinbase public spot price', url: 'https://api.coinbase.com/v2/prices/BTC-USD/spot', parse: j => (j && j.data && isFinite(+j.data.amount)) ? +j.data.amount : null },
  { name: 'CoinGecko public price', url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', parse: j => (j && j.bitcoin && isFinite(+j.bitcoin.usd)) ? +j.bitcoin.usd : null },
];
const CRYPTO_WINDOWS = [1, 5, 15, 60]; // real minutes
const CRYPTO_COIN = { id: 'bitcoin', sym: 'BTC', name: 'Bitcoin' };

function ensureCrypto() {
  if (!S) return null;
  if (!S.crypto || typeof S.crypto !== 'object') S.crypto = { lastPrice: null, lastAt: 0, lastSource: '', bets: [], won: 0, lost: 0, lastStake: 10000, ticks: [] };
  if (!Array.isArray(S.crypto.bets)) S.crypto.bets = [];
  if (!Array.isArray(S.crypto.ticks)) S.crypto.ticks = [];
  if (!isFinite(S.crypto.lastStake) || S.crypto.lastStake <= 0) S.crypto.lastStake = 10000;
  return S.crypto;
}

// Fetch the live BTC price. fetchFn is injectable for tests; in the game
// it defaults to the browser's fetch. Returns the price, or null when
// every source fails (last-known price is kept, nothing is invented).
async function cryptoRefreshPrice(fetchFn) {
  const f = fetchFn || (typeof fetch === 'function' ? fetch : null);
  if (!f) return null;
  const cr = ensureCrypto(); if (!cr) return null;
  for (const src of CRYPTO_SOURCES) {
    try {
      const r = await f(src.url);
      const j = await r.json();
      const p = src.parse(j);
      if (p && isFinite(p) && p > 0) {
        cr.lastPrice = p; cr.lastAt = Date.now(); cr.lastSource = src.name;
        // Live-chart point: every real fetched price, newest last,
        // capped so the save never grows on ticks.
        cr.ticks.push({ t: Date.now(), p });
        if (cr.ticks.length > 300) cr.ticks.splice(0, cr.ticks.length - 300);
        return p;
      }
    } catch (e) { /* try the next source */ }
  }
  return null;
}

// Place an above/under bet. Returns an error string, or null on success.
// Cash is deducted at placement, so cash can never go below zero here:
// the stake is rejected when it exceeds the cash on hand.
function cryptoPlaceBet(dir, target, windowMin, stake) {
  const cr = ensureCrypto(); if (!cr) return 'No game loaded.';
  if (dir !== 'above' && dir !== 'below') return 'Pick above or under.';
  target = +target; windowMin = +windowMin; stake = Math.floor(+stake);
  if (!isFinite(target) || target <= 0) return 'Enter a target price above $0.';
  if (!CRYPTO_WINDOWS.includes(windowMin)) return 'Pick a time window.';
  if (!isFinite(stake) || stake <= 0) return 'Enter a stake above $0.';
  if (stake > S.cash) return `Needs ${fmtMoney(stake, true)} — you have ${fmtMoney(S.cash, true)}.`;
  S.cash -= stake;
  if (S.cash < 0) S.cash = 0;
  cr.lastStake = stake;
  const now = Date.now();
  cr.bets.unshift({ id: uid(), dir, target, stake, placedAt: now, expiresAt: now + windowMin * 60000, windowMin, settled: false, result: null, settlePrice: null, settledAt: null });
  return null;
}

// Settle every due bet at one freshly fetched price. Returns a summary;
// when no price can be fetched, due bets stay open (unavailable: true).
// priceOverride lets the live ticker settle at the price it just
// fetched instead of fetching a second time for the same tick.
async function cryptoSettleDue(fetchFn, priceOverride) {
  const cr = ensureCrypto(); if (!cr) return { settled: 0, unavailable: true };
  const due = cr.bets.filter(b => !b.settled && b.expiresAt <= Date.now());
  if (!due.length) return { settled: 0, unavailable: false };
  const price = (priceOverride != null) ? priceOverride : await cryptoRefreshPrice(fetchFn);
  if (price == null) return { settled: 0, unavailable: true };
  let won = 0, lost = 0, pushed = 0;
  for (const b of due) {
    b.settled = true; b.settlePrice = price; b.settledAt = Date.now();
    if (price === b.target) { b.result = 'push'; S.cash += b.stake; pushed++; }
    else if ((b.dir === 'above' && price > b.target) || (b.dir === 'below' && price < b.target)) { b.result = 'win'; S.cash += b.stake * 2; cr.won++; won++; }
    else { b.result = 'lose'; cr.lost++; lost++; }
  }
  return { settled: due.length, won, lost, pushed, price, unavailable: false };
}

// One live tick: fetch the real price (appending a chart point),
// settle any bets whose window ended at that fresh price, save, and
// re-render if the panel is still open. A failed fetch changes nothing:
// no tick is added, no bet settles, the last-known price stands.
function cryptoTickNow(fetchFn) {
  return cryptoRefreshPrice(fetchFn).then(price => {
    if (price == null) return null;
    return cryptoSettleDue(fetchFn, price);
  }).then(() => {
    try { save(); } catch (e) {}
    if (typeof UI !== 'undefined' && UI.panel === 'crypto' && typeof renderPanelUnlessTyping === 'function') renderPanelUnlessTyping();
  }).catch(() => {});
}

// Ticker lifecycle: runs only while the Crypto panel is open, so the
// game never polls a price API in the background. Idempotent start.
function startCryptoTicker() {
  if (cryptoTimer || typeof setInterval === 'undefined') return;
  cryptoTimer = setInterval(() => { cryptoTickNow(); }, CRYPTO_TICK_MS);
}
function stopCryptoTicker() {
  if (cryptoTimer && typeof clearInterval !== 'undefined') clearInterval(cryptoTimer);
  cryptoTimer = null;
}

function cryptoCountdown(b) {
  const ms = b.expiresAt - Date.now();
  if (ms <= 0) return 'due';
  const s = Math.floor(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
}

function cryptoPanelHTML() {
  const cr = ensureCrypto();
  const price = cr.lastPrice;
  const priceLine = price
    ? `<b style="font-size:22px">${fmtMoney(price)}</b><div class="muted small">Last known · ${cr.lastSource} · updated ${new Date(cr.lastAt).toLocaleTimeString()} · free API, lags real time slightly — that lag is part of the game</div>`
    : `<b style="font-size:22px">Price unavailable</b><div class="muted small">The free price API could not be reached. No price is shown rather than an invented one — tap Refresh to try again. Bets stay open until a real price comes back.</div>`;
  // Controlled inputs: render FROM the state the player typed, so a
  // price refresh or frame-loop re-render preserves edits. The target
  // follows the live price until the player touches it (typing or a
  // quick-target button), then it sticks to what they set.
  const targetVal = (typeof UI !== 'undefined' && UI.cryptoTargetEdited && UI.cryptoTargetVal != null && UI.cryptoTargetVal !== '') ? UI.cryptoTargetVal : (price ? Math.round(price) : '');
  const stakeVal = (typeof UI !== 'undefined' && UI.cryptoStakeVal != null && UI.cryptoStakeVal !== '') ? UI.cryptoStakeVal : cr.lastStake;
  const windowVal = (typeof UI !== 'undefined' && UI.cryptoWindowVal != null) ? UI.cryptoWindowVal : 1;
  const pending = cr.bets.filter(b => !b.settled);
  const done = cr.bets.filter(b => b.settled).slice(0, 10);
  const betRow = b => `<div class="kv"><span>${b.dir === 'above' ? '▲' : '▼'} ${b.dir.toUpperCase()} ${fmtMoney(b.target)} · ${fmtMoney(b.stake, true)} · ${b.windowMin} min${b.settled ? ` · settled ${fmtMoney(b.settlePrice)}` : ` · ${cryptoCountdown(b)}`}</span><b>${b.settled ? (b.result === 'win' ? 'WON +'+fmtMoney(b.stake, true) : b.result === 'push' ? 'PUSH refunded' : 'LOST') : 'OPEN'}</b></div>`;
  // Live chart: every point is a price actually fetched from the public
  // API — no interpolation, no smoothing, no invented points. Under two
  // points there is no line to draw yet, so say so instead of faking one.
  const ticks = (cr.ticks || []).filter(t => t && isFinite(t.p));
  const tickChg = ticks.length >= 2 ? (ticks[ticks.length - 1].p / ticks[0].p - 1) : 0;
  const chartCard = `<div class="card in"><h4><span class="livedot"></span> LIVE · Bitcoin price — moving chart</h4>
    ${ticks.length >= 2 ? lineChart(ticks.map(t => t.p), { h: 160 }) : '<p class="muted small">Chart builds live — one real price point every 10 seconds while this panel is open. Keep it open a few seconds and the line starts moving.</p>'}
    <div class="stats3 box"><div><span>Now</span><b>${price ? fmtMoney(price) : '—'}</b></div><div><span>Since first point</span><b class="${upCls(tickChg)}">${ticks.length >= 2 ? fmtPct(tickChg) : '—'}</b></div><div><span>Points</span><b>${ticks.length} live</b></div></div>
    <p class="muted small">New point every 10 seconds from ${cr.lastSource || 'the free price API'} · each point is a real fetched BTC price, never simulated.</p></div>`;
  return panelShell('Crypto', 'In-game cash only · not in Stocks · real live BTC price only',
    `<div class="card in"><h4>${(typeof ICONS !== 'undefined' && ICONS.crypto) ? ICONS.crypto : ''} Bitcoin (BTC)</h4>${priceLine}
    <p class="muted small">Price is the real live BTC price from a free public API — wars, sanctions, GDP, growth and events never move it. Source: ${cr.lastSource || 'none yet'}.</p>
    <div class="row wrap"><button class="btn" data-a="cryptoRefresh">REFRESH PRICE</button><button class="btn" data-a="cryptoSettle">SETTLE DUE BETS</button></div></div>
    ${chartCard}
    <div class="card in"><h4>Place an above / under bet</h4><p class="muted small">Stake in-game cash. Win pays 2× your stake (stake back + equal winnings). An exact tie refunds your stake. Cash: ${fmtMoney(S.cash, true)}.</p>
    <div class="row"><span class="muted small" style="min-width:90px">Target price $</span><input id="cryptoTarget" class="search" type="number" min="1" step="1" value="${targetVal}" placeholder="e.g. 100000"></div>
    <div class="row wrap"><span class="muted small">Quick target:</span>${[-5, -1, 1, 5].map(p => `<button class="btn small" data-a="cryptoTarget" data-x="${p}">${p > 0 ? '+' : ''}${p}%</button>`).join('')}</div>
    <div class="row"><span class="muted small" style="min-width:90px">Time window</span><select id="cryptoWindow" class="search">${CRYPTO_WINDOWS.map(w => `<option value="${w}"${w === windowVal ? ' selected' : ''}>${w} minute${w === 1 ? '' : 's'}</option>`).join('')}</select></div>
    <div class="row"><span class="muted small" style="min-width:90px">Stake $</span><input id="cryptoStake" class="search" type="number" min="1" step="1" value="${stakeVal}"></div>
    <div class="row wrap"><button class="btn3d orange flex" data-a="cryptoPlace" data-x="above">BET ABOVE ▲</button><button class="btn3d orange flex" data-a="cryptoPlace" data-x="below">BET UNDER ▼</button></div></div>
    <div class="card in"><h4>Open bets (${pending.length})</h4>${pending.map(betRow).join('') || '<p class="muted small">No open bets. Bets settle when this panel opens after their window ends, or on Settle.</p>'}</div>
    <div class="card in"><h4>Recent results · Won ${cr.won} · Lost ${cr.lost}</h4>${done.map(betRow).join('') || '<p class="muted small">Nothing settled yet.</p>'}</div>
    <p class="muted small">Crypto is not a stock: nothing here appears in Markets, your portfolio, or any stock card. No real money is involved at any point.</p>`);
}
