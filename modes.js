'use strict';
// Worl Mode (roguelike run) and Domination (20-player battle).
// Both are leader games: treasury, debt, stability, population, GDP.
// Real online PvP is not live yet, so Domination rivals are 19 AI
// players with names, territories and points that act like players.
// Worl Mode rivals are AI leaders competing on a leaderboard.
// All hooks are guarded by S.mode, so World mode is untouched.

var WORL_GOALS = [
  { id: 'gdpDouble', text: 'Double your GDP' },
  { id: 'control3', text: 'Occupy 3 countries' },
  { id: 'stab90', text: 'Reach 90 stability' },
  { id: 'top3', text: 'Reach top 3 on the rival leaderboard' },
  { id: 'survive15', text: 'Survive 15 years' },
  { id: 'treasury', text: 'Hold a treasury worth 20% of your starting GDP' },
];
function worlGoalCheck(g) {
  if (!S) return false;
  const cs = country(S.home), start = S.worl && S.worl.startGdp ? S.worl.startGdp : 1;
  if (g.id === 'gdpDouble') return cs.gdp >= start * 2;
  if (g.id === 'control3') return Object.keys(S.countries).filter(a => S.countries[a].occ === S.home).length >= 3;
  if (g.id === 'stab90') return cs.stab >= 90;
  if (g.id === 'top3') return worlRank() <= 3;
  if (g.id === 'survive15') return (S.worl ? S.worl.years : 0) >= 15;
  if (g.id === 'treasury') return S.cash >= start * 1e6 * 0.20;
  return false;
}
function worlRivals() {
  if (!S) return [];
  const home = S.home;
  const list = W.playable.filter(k => k.a3 !== home).map(k => {
    const cs = country(k.a3); return { a3: k.a3, name: k.name, flag: k.flag, gdp: cs ? cs.gdp : k.gdp0, pop: cs ? cs.pop : k.pop0 };
  }).sort((a, b) => b.gdp - a.gdp).slice(0, 9);
  const me = { a3: home, name: cname(home), flag: W.byA3[home].flag, gdp: country(home).gdp, pop: country(home).pop, you: true };
  return [me].concat(list).sort((a, b) => b.gdp - a.gdp);
}
function worlRank() {
  const list = worlRivals(); const i = list.findIndex(r => r.you); return i >= 0 ? i + 1 : 10;
}
function ensureWorl() {
  if (!S.worl) {
    const goal = WORL_GOALS[Math.floor(Math.random() * WORL_GOALS.length)];
    const twist = ['Oil Rush', 'Debt Crisis', 'Tech Boom', 'Tourist Wave', 'Harvest Failure', 'Trade Windfall'][Math.floor(Math.random() * 6)];
    S.worl = { goal: goal.id, goalText: goal.text, twist: twist, years: 0, wins: 0, startGdp: country(S.home).gdp, shuffleCont: null };
  }
  return S.worl;
}
function applyWorlStart() {
  // Shuffled world: flag it so all business/stock naming uses the
  // separate random pool (see random-names.js), not the real World's.
  if (typeof S !== 'undefined' && S) S.randomWorld = true;
  const w = ensureWorl();
  const cs = country(S.home);
  // Random start, not the standard 5% / 54% / ~70 stability.
  const trePct = 0.02 + Math.random() * 0.08, debtPct = 0.20 + Math.random() * 0.70;
  S.cash = cs.gdp * 1e6 * trePct; cs.treasury = S.cash; cs.debt = cs.gdp * 1e6 * debtPct; cs.stab = Math.round(45 + Math.random() * 50);
  // Shuffled world: every country gets a random wealth multiplier, one
  // random continent gets a bonus. The map looks the same, power does not.
  const conts = [...new Set(W.playable.map(k => k.cont))];
  w.shuffleCont = conts[Math.floor(Math.random() * conts.length)];
  W.playable.forEach(k => {
    const c = country(k.a3); if (!c) return;
    let m = 0.6 + Math.random() * 1.0; if (k.cont === w.shuffleCont) m *= 1.2;
    c.gdp *= m; c.treasury *= m;
  });
  if (w.twist === 'Oil Rush') { cs.gdp *= 1.15; S.cash += cs.gdp * 1e6 * 0.03; }
  if (w.twist === 'Debt Crisis') { cs.debt *= 1.3; cs.stab = Math.max(20, cs.stab - 15); }
  if (w.twist === 'Tech Boom') { cs.gdp *= 1.10; cs.stab = Math.min(95, cs.stab + 5); }
  if (w.twist === 'Harvest Failure') { cs.stab = Math.max(20, cs.stab - 10); }
  w.startGdp = cs.gdp;
}
// Random World (Offline): a GENERATED world (see random-world.js) —
// random landmass, countries, cities, populations, GDPs and company /
// stock names — but WITHOUT rivals, a win goal, or situation cards.
// It is an endless sandbox like World, just generated. The only thing
// still randomised at start, on top of the generated world, is your own
// starting treasury / debt / stability. Countries' GDPs are NOT
// shuffled here: they were generated random already, and shuffling
// them again would double-randomise the generated economies.
function applyRandomStart() {
  if (typeof S !== 'undefined' && S) S.randomWorld = true;
  const cs = country(S.home);
  const trePct = 0.02 + Math.random() * 0.08, debtPct = 0.20 + Math.random() * 0.70;
  S.cash = cs.gdp * 1e6 * trePct; cs.treasury = S.cash; cs.debt = cs.gdp * 1e6 * debtPct; cs.stab = Math.round(45 + Math.random() * 50);
}
// Situation cards: data only, so a pending card survives a save.
var WORL_SITUATIONS = [
  { id: 'border', title: 'Army on the border', text: 'A neighbour masses troops on your border. What do you do?',
    choices: [
      { label: 'Pay them off', desc: 'Costs treasury, keeps the peace.', eff: { cashPct: -0.05, stab: 5 } },
      { label: 'Mobilise', desc: 'Costs treasury, boosts your war power for a year.', eff: { cashPct: -0.03, stab: -3, mil: 1 } },
      { label: 'Ignore them', desc: 'Free, but risky: 50% chance they invade and hurt stability.', eff: { stab: 0 }, risk: { stab: -20, cashPct: -0.05 } },
    ] },
  { id: 'oil', title: 'Oil discovered', text: 'Geologists find oil under your land. How do you use it?',
    choices: [
      { label: 'Drill it now', desc: 'Big treasury boost, small stability hit.', eff: { cashPct: 0.12, stab: -3 } },
      { label: 'Save it for later', desc: 'Small GDP boost, no downside.', eff: { gdpPct: 0.03 } },
      { label: 'Sell the rights', desc: 'Instant cash, no GDP gain.', eff: { cashPct: 0.08 } },
    ] },
  { id: 'flood', title: 'Flood hits the coast', text: 'A flood washes out coastal towns. Respond fast.',
    choices: [
      { label: 'Rebuild everything', desc: 'Costs treasury, restores stability.', eff: { cashPct: -0.08, stab: 8 } },
      { label: 'Patch it up', desc: 'Cheap, partial recovery.', eff: { cashPct: -0.03, stab: 2 } },
      { label: 'Do nothing', desc: 'Free, stability falls.', eff: { stab: -12 } },
    ] },
  { id: 'tech', title: 'A tech startup booms', text: 'A homegrown startup goes global. Back it or tax it?',
    choices: [
      { label: 'Back it', desc: 'Costs treasury, GDP jumps.', eff: { cashPct: -0.04, gdpPct: 0.08 } },
      { label: 'Tax it hard', desc: 'Treasury up, GDP flat.', eff: { cashPct: 0.06 } },
      { label: 'Leave it alone', desc: 'Small GDP boost.', eff: { gdpPct: 0.03 } },
    ] },
  { id: 'refugees', title: 'Refugees arrive', text: 'People fleeing a war next door ask to settle here.',
    choices: [
      { label: 'Welcome them', desc: 'Population grows, stability dips, then GDP grows.', eff: { popPct: 0.04, stab: -4, gdpPct: 0.02 } },
      { label: 'Turn them away', desc: 'No change, stability up a little.', eff: { stab: 3 } },
      { label: 'Settle them in new towns', desc: 'Costs treasury, population and GDP both grow.', eff: { cashPct: -0.05, popPct: 0.03, gdpPct: 0.03 } },
    ] },
  { id: 'strike', title: 'Workers strike', text: 'Factory workers demand higher pay. How do you answer?',
    choices: [
      { label: 'Raise pay', desc: 'Costs treasury, stability jumps.', eff: { cashPct: -0.04, stab: 10 } },
      { label: 'Negotiate', desc: 'Small cost, small gain.', eff: { cashPct: -0.02, stab: 4 } },
      { label: 'Break the strike', desc: 'Free, stability crashes.', eff: { stab: -15 } },
    ] },
  { id: 'plague', title: 'Sickness spreads', text: 'A sickness moves through the cities. Act now.',
    choices: [
      { label: 'Fund hospitals', desc: 'Costs treasury, saves population and stability.', eff: { cashPct: -0.07, stab: 6 } },
      { label: 'Quarantine', desc: 'GDP dips, stability holds.', eff: { gdpPct: -0.03, stab: 2 } },
      { label: 'Ignore it', desc: 'Population and stability fall.', eff: { popPct: -0.02, stab: -10 } },
    ] },
  { id: 'tourism', title: 'Tourists flood in', text: 'Your country goes viral as a holiday spot.',
    choices: [
      { label: 'Build hotels', desc: 'Costs treasury, GDP and treasury both grow.', eff: { cashPct: -0.03, gdpPct: 0.05 } },
      { label: 'Tax tourists', desc: 'Treasury up, no GDP gain.', eff: { cashPct: 0.05 } },
      { label: 'Let it happen', desc: 'Small GDP boost, free.', eff: { gdpPct: 0.02 } },
    ] },
  { id: 'coup', title: 'Coup rumour', text: 'Whispers of a coup reach your office. How do you respond?',
    choices: [
      { label: 'Arrest the plotters', desc: 'Stability up, but a small treasury cost.', eff: { cashPct: -0.02, stab: 8 } },
      { label: 'Reform fast', desc: 'Big stability gain, GDP dip.', eff: { stab: 12, gdpPct: -0.02 } },
      { label: 'Ignore the whispers', desc: 'Risky: 50% chance stability crashes.', eff: { stab: 0 }, risk: { stab: -25 } },
    ] },
  { id: 'trade', title: 'Trade deal offered', text: 'A big neighbour offers a trade deal with strings attached.',
    choices: [
      { label: 'Sign it', desc: 'GDP up, stability up a little.', eff: { gdpPct: 0.06, stab: 3 } },
      { label: 'Sign, but protect locals', desc: 'Smaller GDP gain, no downside.', eff: { gdpPct: 0.03 } },
      { label: 'Refuse', desc: 'No change.', eff: {} },
    ] },
  { id: 'quake', title: 'Earthquake', text: 'An earthquake shakes the capital region.',
    choices: [
      { label: 'Full rebuild', desc: 'Costs treasury, stability recovers.', eff: { cashPct: -0.09, stab: 10 } },
      { label: 'Emergency aid only', desc: 'Cheaper, partial recovery.', eff: { cashPct: -0.03, stab: 3 } },
      { label: 'Wait for foreign aid', desc: 'Free, stability falls.', eff: { stab: -12 } },
    ] },
  { id: 'sports', title: 'Your team reaches a final', text: 'The whole country is watching. Seize the moment?',
    choices: [
      { label: 'Fund a victory parade', desc: 'Costs a little, stability jumps.', eff: { cashPct: -0.01, stab: 8 } },
      { label: 'Sell the broadcast rights', desc: 'Treasury up.', eff: { cashPct: 0.04 } },
      { label: 'Do nothing', desc: 'Small stability gain, free.', eff: { stab: 3 } },
    ] },
];
function drawSituation() {
  const s = WORL_SITUATIONS[Math.floor(Math.random() * WORL_SITUATIONS.length)];
  S.pendingSituation = s.id;
  return s;
}
function applySituation(choiceIdx) {
  const id = S.pendingSituation; if (!id) return 'No situation to answer.';
  const s = WORL_SITUATIONS.find(x => x.id === id); if (!s) { S.pendingSituation = null; return 'Situation expired.'; }
  const ch = s.choices[choiceIdx]; if (!ch) return 'Pick a choice.';
  const cs = country(S.home);
  const applyEff = (eff) => {
    if (!eff) return;
    if (eff.cashPct) S.cash = Math.max(0, S.cash + cs.gdp * 1e6 * eff.cashPct);
    if (eff.gdpPct) cs.gdp *= 1 + eff.gdpPct;
    if (eff.popPct) cs.pop *= 1 + eff.popPct;
    if (eff.stab) cs.stab = Math.max(0, Math.min(100, cs.stab + eff.stab));
    if (eff.mil) { cs.milLv.army = Math.min(5, cs.milLv.army + 1); cs.milLv.navy = Math.min(5, cs.milLv.navy + 1); }
  };
  applyEff(ch.eff);
  let risky = '';
  if (ch.risk && Math.random() < 0.5) { applyEff(ch.risk); risky = ' The risk hit.'; }
  cs.treasury = S.cash;
  S.pendingSituation = null;
  S.worl.situations = (S.worl.situations || 0) + 1;
  return `You chose: ${ch.label}.${risky}`;
}
function worlYearEnd() {
  if (!S.worl) ensureWorl();
  S.worl.years = (S.worl.years || 0) + 1;
  // Rivals grow or shrink randomly each year, so the leaderboard moves.
  worlRivals().forEach(r => { if (r.you) return; const cs = country(r.a3); if (cs) cs.gdp *= 1 + (Math.random() - 0.45) * 0.08; });
  if (!S.worl.won && worlGoalCheck(WORL_GOALS.find(g => g.id === S.worl.goal))) {
    S.worl.won = true; S.worl.wins = (S.worl.wins || 0) + 1;
    S.pendingVictory = S.worl.goalText;
  } else {
    drawSituation();
  }
}
// ---------- Domination ----------
function ensureDomination() {
  if (!S.domination) {
    const rivals = W.playable.filter(k => k.a3 !== S.home).sort((a, b) => b.gdp0 - a.gdp0).slice(0, 19).map(k => ({ a3: k.a3, name: k.name, flag: k.flag, territories: [k.a3], alive: true, points: 0 }));
    S.domination = { rivals: rivals, points: 0, territories: 1, lastStand: 0, won: false, rounds: 0 };
  }
  return S.domination;
}
function dominationTerritories() {
  return 1 + Object.keys(S.countries).filter(a => S.countries[a].occ === S.home).length;
}
function dominationStandings() {
  const d = ensureDomination();
  const me = { a3: S.home, name: cname(S.home), flag: W.byA3[S.home].flag, territories: dominationTerritories(), points: d.points, you: true, alive: true };
  const rows = [me].concat(d.rivals.filter(r => r.alive).map(r => ({ a3: r.a3, name: r.name, flag: r.flag, territories: r.territories.length, points: r.points, alive: true })));
  return rows.sort((a, b) => b.points - a.points || b.territories - a.territories);
}
function dominationRound() {
  const d = ensureDomination(); d.rounds = (d.rounds || 0) + 1;
  // Points: territories squared x 10 per year, so holding more pays more.
  const myT = dominationTerritories(); d.territories = myT; d.points += myT * myT * 10;
  d.rivals.forEach(r => { if (!r.alive) return; r.points += r.territories.length * r.territories.length * 10; });
  // Last Stand: at 500+ points, hold it for 3 years to win early.
  if (!d.won && d.points >= 500) {
    d.lastStand = (d.lastStand || 0) + 1;
    if (d.lastStand >= 3) { d.won = true; S.pendingVictory = 'Domination: you held 500+ points for 3 years.'; }
  } else d.lastStand = 0;
  if (!d.won && d.points >= 1000) { d.won = true; S.pendingVictory = 'Domination: 1000 points.'; }
  if (!d.won && myT >= 10) { d.won = true; S.pendingVictory = 'Domination: 10 territories controlled.'; }
  // AI rounds: only 2 rivals attack per round, so the board does not
  // collapse in a year. They may take a neighbour rival's land, or
  // one of your occupied lands (never your capital, which is protected).
  const attackers = d.rivals.filter(r => r.alive).sort(() => Math.random() - 0.5).slice(0, 2);
  attackers.forEach(r => {
    const k = W.byA3[r.a3]; if (!k) return;
    const targets = k.nb.filter(n => {
      const c = S.countries[n]; if (!c || c.occ === r.a3) return false;
      if (n === S.home) return false; // capital protected
      if (c.occ === S.home) return true; // your occupied land is fair game
      return d.rivals.some(x => x.alive && x.territories.includes(n));
    });
    if (!targets.length) return;
    const t = targets[Math.floor(Math.random() * targets.length)];
    const att = milPower(r.a3), def = milPower(t);
    if (att * (0.5 + Math.random()) > def * (0.5 + Math.random())) {
      const prevOcc = S.countries[t].occ;
      S.countries[t].occ = r.a3;
      if (prevOcc === S.home) { /* player loses that land */ }
      else { const prev = d.rivals.find(x => x.territories.includes(t)); if (prev) prev.territories = prev.territories.filter(x => x !== t); }
      r.territories.push(t);
      if (t === r.a3) { /* no-op */ }
      // If a rival lost its last territory, it is out.
      d.rivals.forEach(x => { if (x.alive && x.territories.length === 0 && !S.countries[x.a3] ) x.alive = false; });
      // A rival whose home was taken is out, even if it had other lands:
      // those lands go to the winner.
      const homeOwner = d.rivals.find(x => x.a3 === t);
      if (homeOwner && homeOwner !== r) { homeOwner.alive = false; r.territories = [...new Set(r.territories.concat(homeOwner.territories.filter(x => x !== t)))]; homeOwner.territories = []; }
      news('Domination', `${r.name} captured ${cname(t)}.`, t);
    }
  });
  // Last alive check: if every rival is out, you win.
  if (!d.won && d.rivals.every(r => !r.alive)) { d.won = true; S.pendingVictory = 'Domination: last player standing.'; }
}
function onDominationCapture(target) {
  if (!S.domination) return;
  const d = S.domination;
  const rival = d.rivals.find(r => r.a3 === target);
  if (rival) { rival.alive = false; d.points += 100; rival.territories = []; news('Domination', `${rival.name} is out. +100 points.`, target); }
  d.territories = dominationTerritories();
}
function modeLabel() {
  if (S.mode === 'worl') return 'Worl Mode';
  if (S.mode === 'domination') return 'Domination';
  return 'World';
}
