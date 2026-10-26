// World events, diplomacy, the military, the daily loop, rewards and scoring.
'use strict';

function getRel(a, b) { const c = S.countries[a]; return c && b in c.rel ? c.rel[b] : 20; }
function setRel(a, b, v) {
  v = clamp(Math.round(v), -100, 100);
  if (S.countries[a]) S.countries[a].rel[b] = v;
  if (S.countries[b]) S.countries[b].rel[a] = v;
}
function shockCountry(a3, kind, scale) {
  const e = EVENT_SECTORS[kind], c = S.co[a3]; if (!e || !c) return;
  c.shock += ((e[c.sector] || 0) + (e.all || 0)) * (scale || 1) * (0.7 + rand() * 0.6);
}
function shockSector(sector, pct) { for (const a3 in S.co) if (S.co[a3].sector === sector) S.co[a3].shock += pct * (0.6 + rand() * 0.8); }

// ---------- military ----------
function milPower(a3) {
  const c = country(a3); let p = c.mil;
  for (const b in MILITARY) p *= 1 + c.milLv[b] * MILITARY[b].power;
  return p * (0.6 + c.stab / 250);
}
function milCost(branch) {
  const lv = country(S.home).milLv[branch], d = MILITARY[branch];
  if (lv >= d.levels.length - 1) return null;
  return Math.round(d.cost[lv + 1] * Math.max(0.12, Math.pow(W.byA3[S.home].gdp0 / 2e6, 0.35)) / 1e5) * 1e5;
}
function upgradeMilitary(branch) {
  const cost = milCost(branch); if (cost == null) return 'Already at the top level.';
  if (S.cash < cost) return `Costs ${fmtMoney(cost, true)}.`;
  S.cash -= cost; country(S.home).milLv[branch]++;
  S.xp += 150; news('Nation', `${cname(S.home)}'s ${MILITARY[branch].name.toLowerCase()} now fields ${MILITARY[branch].levels[country(S.home).milLv[branch]].toLowerCase()}.`, S.home);
  return null;
}
function milRank(a3) { const list = Object.keys(S.countries).sort((a, b) => milPower(b) - milPower(a)); return list.indexOf(a3) + 1; }
// ---------- war, new model ----------
// No buying peace. War is declared from a War Plan, not from a button that
// starts a years-long front war. The player orchestrates the attack first
// (commit forces, pick an approach, upgrade, research, sell stock for funds),
// then clicks SUBMIT and the game decides a winner right there.
// The winner is not just the stronger army: it is army power times how long
// each side can last — treasury, economy, people, stability and debt.
// You can declare war only once every 10 years (3650 days).
const WAR_COOLDOWN_DAYS = 3650;
function warOdds(att, def) { const a = milPower(att), d = milPower(def) * 1.15; return a / (a + d); }
function warCooldownLeft() {
  if (S.lastWarDay == null) return 0;
  const cd = (S.mode === 'domination') ? 365 : WAR_COOLDOWN_DAYS;
  return Math.max(0, S.lastWarDay + cd - S.day);
}
function canAttack(target) {
  if (target === S.home) return 'That is your own country.';
  const h = country(S.home), t = country(target);
  if (!t) return 'Not a country you can invade.';
  if (h.occ) return 'Your country is occupied.';
  if (t.occ === S.home) return 'You already occupy it.';
  if (t.war) return `${cname(target)} is already at war.`;
  const left = warCooldownLeft();
  if (left > 0) return `You can declare war again in ${Math.ceil(left / 365)} year${Math.ceil(left / 365) === 1 ? '' : 's'}.`;
  return null;
}
function treasuryOf(a3) { return a3 === S.home ? S.cash : (country(a3).treasury || 0); }
function approachList(target) {
  const h = country(S.home), neighbour = W.byA3[S.home].nb.includes(target), coastal = !!W.byA3[target].coastal;
  return [
    { id: 'land', name: 'Land border', ok: neighbour, why: neighbour ? 'Neighbour: direct land attack.' : 'Not a land neighbour.' , bonus: 0.15 },
    { id: 'sea', name: 'Sea landing', ok: coastal && h.milLv.navy >= 1, why: !coastal ? 'Target has no coast.' : h.milLv.navy < 1 ? 'You need a navy first.' : 'Landing from your military port.', bonus: 0.10 },
    { id: 'air', name: 'Air strike', ok: h.milLv.air >= 1, why: h.milLv.air < 1 ? 'You need an air force first.' : 'Strike from the air.', bonus: 0.10 },
    { id: 'combined', name: 'Combined arms', ok: h.milLv.army >= 2 && h.milLv.navy >= 2 && h.milLv.air >= 2 && (neighbour || coastal), why: !(neighbour || coastal) ? 'No land border and no coast to land on.' : 'Needs Army, Navy and Air all at level 2 or more.', bonus: 0.20 },
  ];
}
// War score for one side. commit: {army, navy, air} as 0-100. approachBonus
// and researchBonus are multipliers for the attacker only; the defender
// fights at full commitment with no approach bonus.
function warScore(a3, commit, approachBonus, researchBonus, baseBonus) {
  const cs = country(a3), k = W.byA3[a3];
  const gdpDollars = Math.max(1, cs.gdp * 1e6), treasury = Math.max(0, treasuryOf(a3));
  const power0 = milPower(a3);
  const commitF = commit ? (commit.army * 0.4 + commit.navy * 0.3 + commit.air * 0.3) / 100 : 1;
  const power = power0 * Math.max(0, commitF) * (approachBonus || 1) * (researchBonus || 1) * (baseBonus || 1);
  // How long can this side last? Weeks of war its treasury can pay for.
  const weeklyCost = Math.max(1, power0 * 50000);
  const weeks = treasury / weeklyCost;
  const endurance = clamp(weeks / 104, 0.25, 2.5);
  const gdpPc = gdpDollars / Math.max(1, cs.pop);
  const supplies = clamp(Math.sqrt(gdpPc / 20000), 0.3, 2) * clamp(cs.stab / 50, 0.3, 1.5) * (1 - Math.min(0.5, (cs.debt || 0) / gdpDollars * 0.3));
  const popF = 0.8 + 0.2 * clamp(Math.log10(Math.max(1, cs.pop)) / 8, 0, 1.3);
  const effective = power * endurance * supplies * popF;
  return { power, power0, weeks, endurance, supplies, popF, effective, treasury, gdpDollars, gdpPc, stab: cs.stab, debtRatio: (cs.debt || 0) / gdpDollars, milLv: cs.milLv };
}
function warPlanScore(plan) {
  const att = warScore(S.home, { army: plan.army, navy: plan.navy, air: plan.air }, 1 + (plan.approachBonus || 0), plan.research ? 1.15 : 1, 1 + 0.05 * purchasedBaseCount(S.home));
  const def = warScore(plan.target, null, 1, 1, 1);
  const winP = att.effective / Math.max(1e-9, att.effective + def.effective);
  return { att, def, winP };
}
function researchWarCost() { return Math.round(Math.max(5e6, W.byA3[S.home].gdp0 * 1e6 * 0.001) / 1e5) * 1e5; }
function researchWar(plan) {
  const cost = researchWarCost(); if (S.cash < cost) return `Costs ${fmtMoney(cost, true)}.`;
  if (plan.research) return 'Already researched for this attack.';
  S.cash -= cost; plan.research = true; return null;
}
function sellForWar() {
  // Sell 25% of every open holding at its current price, for war funds.
  let raised = 0, any = false;
  for (const a3 in S.holdings) { const h = S.holdings[a3]; if (!h || h.qty <= 0) continue; const c = S.co[a3]; if (!c || !c.listed) continue; const qty = Math.floor(h.qty * 0.25); if (qty <= 0) continue; const proceeds = qty * c.price; h.qty -= qty; if (h.qty <= 0) delete S.holdings[a3]; S.cash += proceeds; raised += proceeds; any = true; }
  if (!any) return 'Nothing to sell: you hold no listed stocks.';
  return null;
}
function baseCost() {
  const n = purchasedBaseCount(S.home);
  return Math.round(200e6 * Math.max(0.3, Math.pow(W.byA3[S.home].gdp0 / 500000, 0.35)) * (1 + n * 0.5) / 1e5) * 1e5;
}
function buyBase() {
  const cost = baseCost(); if (S.cash < cost) return `Costs ${fmtMoney(cost, true)}.`;
  if (!S.facilities) S.facilities = {}; if (!S.facilities[S.home]) S.facilities[S.home] = { bases: [] };
  const f = facilitiesFor(S.home); const cap = W.cities[W.byA3[S.home].capital];
  const n = (S.facilities[S.home].bases || []).length, ang = (n * 1.1) + 0.5, radius = 48 + n * 16;
  const xy = { x: cap.x + Math.cos(ang) * radius, y: cap.y + Math.sin(ang) * radius * 0.6 };
  S.facilities[S.home].bases.push(xy); S.cash -= cost; S.xp += 100;
  news('Nation', `New military base built in ${cname(S.home)}. It adds +5% to your war power.`, S.home);
  return null;
}
// Instant resolution: the player submits a plan, the game decides now.
function resolveWar(plan) {
  const err = canAttack(plan.target); if (err) return err;
  const { att, def, winP } = warPlanScore(plan);
  const roll = winP + gauss() * 0.12;
  const attackerWins = roll >= 0.5;
  S.lastWarDay = S.day; S.stats.wars++;
  const attCost = Math.min(S.cash, country(S.home).gdp * 1e6 * 0.02 + att.power0 * 10000);
  const defCs = country(plan.target);
  S.cash = Math.max(0, S.cash - attCost);
  defCs.treasury = Math.max(0, (defCs.treasury || 0) * 0.9);
  setRel(S.home, plan.target, -100);
  for (const a3 in S.countries) if (a3 !== S.home && a3 !== plan.target && rand() < 0.4) setRel(S.home, a3, getRel(S.home, a3) - 10);
  if (W.byA3[S.home].gdp0 > 200000 && rand() < 0.6) { country(S.home).fx.push({ g: -0.01, until: S.day + 730, sanction: true }); shockCountry(S.home, 'sanctions'); news('World', `The world sanctions ${cname(S.home)} over the attack.`, S.home); }
  const result = { target: plan.target, attackerWins, winP, att, def, cost: attCost };
  S.lastWarResult = result;
  if (attackerWins) {
    shockCountry(plan.target, 'invasion'); shockCountry(S.home, 'peace', 0.5);
    country(plan.target).occ = S.home; country(plan.target).occSince = S.day;
    if (S.mode === 'domination' && typeof onDominationCapture === 'function') { try { onDominationCapture(plan.target); } catch (e) {} }
    occupy(S.home, plan.target);
    news('War', `Victory. ${cname(S.home)} defeated ${cname(plan.target)} and now occupies it.`, plan.target);
  } else {
    country(S.home).stab = clamp(country(S.home).stab - 15, 0, 100);
    shockCountry(S.home, 'unrest', 1.2); shockCountry(plan.target, 'peace', 1.5); setRel(S.home, plan.target, -20);
    news('War', `${cname(plan.target)} drove back the invasion from ${cname(S.home)}.`, plan.target);
  }
  return null;
}

// ---------- wars ----------
function startWar(att, def, byPlayer) {
  const w = { id: uid(), a: att, b: def, start: S.day, front: 50, player: !!byPlayer };
  S.wars.push(w); country(att).war = w.id; country(def).war = w.id;
  shockCountry(att, 'war', 0.8); shockCountry(def, 'war', 1.3);
  W.byA3[att].nb.concat(W.byA3[def].nb).forEach(n => { if (S.countries[n] && n !== att && n !== def) { shockCountry(n, 'unrest', 0.3); setRel(n, att, getRel(n, att) - 10); } });
  shockSector('Energy', 0.03); S.oil = Math.min(2.5, S.oil + 0.12);
  news('War', `WAR: ${cname(att)} attacks ${cname(def)}.${byPlayer ? ' You gave the order.' : ''} Markets in both countries plunge.`, att);
  live(`War: ${cname(att)} vs ${cname(def)}`, 9999, 'War', att);
  if (W.byA3[att].gdp0 > 200000 && rand() < 0.6) { country(att).fx.push({ g: -0.01, until: S.day + 730, sanction: true }); shockCountry(att, 'sanctions'); news('World', `The world sanctions ${cname(att)} over the attack.`, att); }
}
function endWar(w, text, cat) {
  S.wars = S.wars.filter(x => x !== w); country(w.a).war = null; country(w.b).war = null;
  S.live = S.live.filter(e => !(e.cat === 'War' && e.title === `War: ${cname(w.a)} vs ${cname(w.b)}`));
  news(cat || 'War', text, w.a);
}
function warDay(w) {
  const A = country(w.a), B = country(w.b);
  A.drift = Math.min(A.drift, -0.0008); B.drift = Math.min(B.drift, -0.0018);
  A.pop *= 1 - 0.004 / 365; B.pop *= 1 - 0.015 / 365;
  w.front += (warOdds(w.a, w.b) - 0.5) * 3.2 + gauss() * 2.4;
  const len = S.day - w.start;
  if (w.front >= 100) {
    endWar(w, `${cname(w.a)} has defeated and occupied ${cname(w.b)}.`);
    B.occ = w.a; B.occSince = S.day; shockCountry(w.b, 'invasion'); shockCountry(w.a, 'peace', 0.5);
    occupy(w.a, w.b);
    live(`Occupation of ${cname(w.b)}`, 9999, 'War', w.b);
  } else if (w.front <= 0) {
    endWar(w, `${cname(w.b)} drives back the invasion. ${cname(w.a)} retreats.`);
    shockCountry(w.b, 'peace', 1.5); shockCountry(w.a, 'unrest', 1.2); A.stab -= 15; setRel(w.a, w.b, -20);
  } else if (!w.player && rand() < 0.002 + len / 25000) {
    endWar(w, `Ceasefire: ${cname(w.a)} and ${cname(w.b)} sign a peace deal. Markets rally.`, 'World');
    shockCountry(w.a, 'peace'); shockCountry(w.b, 'peace', 1.4); setRel(w.a, w.b, 0);
  }
}
// The winner takes the loser's company. If that's you, it's yours.
function occupy(winner, loser) {
  const c = S.co[loser];
  if (winner === S.home) {
    S.holdings[loser] = { qty: c.shares, cost: 0 }; c.listed = false; c.ai = false; S.stats.takeovers++; S.xp += 800;
    news('War', `Victory. ${c.name} in ${cname(loser)} is now yours, and its ${fmtPop(country(loser).pop)} people count toward your nation.`, loser);
  } else if (controlled(loser) && loser !== S.home) {
    delete S.holdings[loser]; c.ai = true; c.listed = true;
    news('War', `${cname(winner)} seized ${c.name}. You lost your stake.`, loser);
  } else if (loser === S.home) {
    const lost = Math.floor(c.locs.length / 2); for (let i = 0; i < lost; i++) closeLoc(c, c.locs[c.locs.length - 1].id);
    news('War', `Your country has fallen. Occupying forces closed ${lost} of your locations.`, loser);
  }
  S.props.forEach(p => { if (W.cities[p.city].a3 === loser) p.value *= 0.6; });
}

// ---------- world ----------
function worldDay() {
  const keys = Object.keys(S.countries);
  if (rand() < 0.22) {
    let a, b;
    const hot = []; for (const x of keys) for (const y in S.countries[x].rel) if (x < y && S.countries[x].rel[y] < 0 && !S.countries[x].occ) hot.push([x, y]);
    if (hot.length && rand() < 0.5) [a, b] = pick(hot);
    else { a = pick(keys); const n = Object.keys(S.countries[a].rel); if (n.length) b = pick(n); }
    if (b && !country(a).occ && !country(b).occ) {
      const before = getRel(a, b), after = before - 6 - rand() * 14;
      setRel(a, b, after);
      if (before > -35 && after <= -35) { news('World', `Tensions rise between ${cname(a)} and ${cname(b)}. Troops gather at the border.`, a === S.home || b === S.home ? S.home : a); live(`Border standoff: ${cname(a)} – ${cname(b)}`, 30, 'World', a); shockCountry(a, 'unrest', 0.4); shockCountry(b, 'unrest', 0.4); }
    }
  }
  for (const x of keys) { const r = S.countries[x].rel; for (const y in r) r[y] += (25 - r[y]) * 0.0025; }
  for (const x of keys) {
    const cx = S.countries[x]; if (cx.war || cx.occ) continue;
    for (const y in cx.rel) {
      const cy = S.countries[y]; if (!cy || cy.war || cy.occ || cx.rel[y] > -55 || rand() > 0.006) continue;
      if (x === S.home || y === S.home) continue;
      const [att, def] = milPower(x) * (0.5 + rand()) > milPower(y) * (0.5 + rand()) ? [x, y] : [y, x];
      startWar(att, def); break;
    }
  }
  S.wars.slice().forEach(warDay);
  keys.forEach(countryDay);
  S.oil += (1 - S.oil) * 0.01 + gauss() * 0.012; S.oil = clamp(S.oil, 0.4, 2.6);
  S.trade += ((S.pandemic > S.day ? 0.75 : 1) - S.trade) * 0.02;
  if (rand() < 0.035) { const a = pick(keys), b = pick(keys); if (a !== b && getRel(a, b) > 10 && !country(a).war && !country(b).war) { setRel(a, b, getRel(a, b) + 12); [a, b].forEach(k => { shockCountry(k, 'tradeDeal'); country(k).fx.push({ g: 0.004, until: S.day + 730 }); }); news('World', `${cname(a)} and ${cname(b)} sign a major trade deal.`, a === S.home || b === S.home ? S.home : a); } }
  if (rand() < 0.012) {
    const tot = W.cities.reduce((t, c) => t + Math.sqrt(c.pop), 0); let r = rand() * tot, city = W.cities[0];
    for (const c of W.cities) { r -= Math.sqrt(c.pop); if (r <= 0) { city = c; break; } }
    const kind = pick(DISASTERS), weeks = 2 + Math.floor(rand() * 4);
    S.cityHit[city.id] = S.day + weeks * 7; shockCountry(city.a3, 'disaster', 1);
    S.props.filter(p => p.city === city.id).forEach(p => { p.value *= 0.85; p.cond = Math.max(0.2, p.cond - 0.2); });
    news('World', `${kind} strikes ${city.name}, ${cname(city.a3)}. Businesses close for ${weeks} weeks.`, city.a3);
    live(`${kind} recovery: ${city.name}`, weeks * 7, 'World', city.a3);
  }
  if (S.pandemic <= S.day && rand() < 1 / 5500) {
    const days = 120 + Math.floor(rand() * 200); S.pandemic = S.day + days;
    shockSector('Airline', -0.25); shockSector('Shipping', -0.08); shockSector('Retail', -0.06); shockSector('Tech', 0.06);
    news('World', 'A new virus spreads worldwide. Borders close and travel collapses.'); live('Global pandemic', days, 'World');
  }
  // Hackers go after online stores without protection.
  for (const a3 in S.co) { const c = S.co[a3]; if (c.web.tier >= 2 && !c.web.addons.security && !(c.web.down > S.day) && rand() < 0.0007) { c.web.down = S.day + 14; if (controlled(a3)) { news('Business', `Hackers took ${c.name}'s website offline for two weeks. Buy cybersecurity in the Web tab.`, a3); mail('Security team', `${c.name} website is down`, 'Attackers broke into the online store. Sales stop for 14 days. Cybersecurity prevents this.'); } } }
  S.live = S.live.filter(e => e.until > S.day);
}
function countryDay(a3) {
  const c = S.countries[a3], k = W.byA3[a3];
  const gdpPc = c.gdp * 1e6 / c.pop;
  let g = c.growth + c.fx.reduce((a, f) => a + f.g, 0);
  if (c.war) g -= 0.04; if (c.occ) g -= 0.06; if (c.unrest > S.day) g -= 0.015;
  if (a3 === S.home) g += homeBonus('gdp');
  c.gdp *= 1 + g / 365;
  c.growth += (clamp(0.045 - 0.012 * Math.log10(gdpPc / 1000), 0.006, 0.06) - c.growth) * 0.002 + gauss() * 0.0004;
  let pg = clamp(0.028 - 0.012 * Math.log10(gdpPc / 700), -0.004, 0.03) + (c.stab - 50) / 6000;
  if (c.occ) pg -= 0.02; if (c.war) pg -= 0.01;
  if (!c.war && !c.occ && c.stab > 55 && k.nb.some(n => S.countries[n] && (S.countries[n].war || S.countries[n].occ))) pg += 0.004;
  if (a3 === S.home) pg += homeBonus('pop') + homeCo().locs.reduce((a, l) => a + l.staff, 0) / c.pop * 30;
  c.pop *= 1 + pg / 365;
  c.drift *= 0.97; c.fx = c.fx.filter(f => f.until > S.day);
  c.stab = clamp(c.stab + (55 + k.wealth * 10 - c.stab) * 0.002 + gauss() * 0.4 + (a3 === S.home ? homeBonus('stab') / 365 : 0), 0, 100);
  if (c.stab < 32 && c.unrest <= S.day && rand() < 0.003) { c.unrest = S.day + 30 + Math.floor(rand() * 60); shockCountry(a3, 'unrest'); news('World', `Mass protests paralyse ${k.name}.`, a3); live(`Protests in ${k.name}`, c.unrest - S.day, 'World', a3); }
  if (c.stab < 18 && rand() < 0.0015) { shockCountry(a3, 'coup'); c.stab = 40; news('War', `Military coup in ${k.name}. The government has fallen.`, a3); }
  if (S.day >= c.nextElect) {
    c.nextElect = S.day + 1400 + Math.floor(rand() * 400);
    const good = rand() < 0.5 + (c.stab - 50) / 200;
    if (k.gdp0 > 60000 || a3 === S.home) { shockCountry(a3, good ? 'electionGood' : 'electionBad'); news('World', `${k.name} election: ${good ? 'a business-friendly government wins' : 'a populist landslide spooks investors'}.`, a3); }
    c.tax = clamp(c.tax + (good ? -0.02 : 0.03), 0.08, 0.45); c.fx.push({ g: good ? 0.004 : -0.003, until: S.day + 1400 });
  }
  if (rand() < 0.00025) { const kind = pick(['techBoom', 'discovery', 'tourism']); shockCountry(a3, kind); c.fx.push({ g: 0.012, until: S.day + 900 }); c.boom = S.day + 365; if (kind === 'discovery') S.oil = Math.max(0.5, S.oil - 0.05); if (k.gdp0 > 30000 || a3 === S.home) news('World', { techBoom: `Tech boom in ${k.name}: startups everywhere.`, discovery: `Huge oil and mineral discovery in ${k.name}.`, tourism: `Tourism boom: everyone wants to visit ${k.name}.` }[kind], a3); }
  if (c.occ && rand() < 0.0012) {
    const occupier = c.occ;
    news('World', `${k.name} is liberated from ${cname(occupier)}. Celebrations in the streets.`, a3);
    shockCountry(a3, 'liberation'); c.occ = null; c.stab = 45; S.live = S.live.filter(e => e.title !== `Occupation of ${k.name}`);
    if (occupier === S.home && controlled(a3)) { delete S.holdings[a3]; S.co[a3].listed = true; S.co[a3].ai = true; news('War', `You lost ${S.co[a3].name} when ${k.name} was liberated.`, a3); }
  }
}
function homeBonus(kind) { let v = 0; country(S.home).proj.forEach(p => { if (p.until > S.day) { const d = PROJECTS.find(x => x.id === p.id); v += d[kind] || 0; } }); return v; }
function countryStatus(a3) {
  const c = country(a3); if (!c) return { t: 'Not playable', cls: 'grey' };
  if (c.occ) return { t: `Occupied by ${cname(c.occ)}`, cls: 'red' };
  if (c.war) { const w = S.wars.find(x => x.id === c.war); return { t: `At war with ${cname(w.a === a3 ? w.b : w.a)}`, cls: 'red' }; }
  if (c.unrest > S.day) return { t: 'Mass protests', cls: 'orange' };
  const tense = Object.entries(c.rel).filter(([, v]) => v < -35);
  if (tense.length) return { t: `Tension with ${cname(tense[0][0])}`, cls: 'orange' };
  if (c.boom > S.day) return { t: 'Economic boom', cls: 'green' };
  return { t: 'Stable', cls: 'green' };
}

// ---------- nation ----------
function projectCost(d) { return Math.round(d.cost * Math.max(0.3, Math.pow(W.byA3[S.home].gdp0 / 500000, 0.35)) / 10000) * 10000; }
function fundProject(id) {
  const d = PROJECTS.find(x => x.id === id), c = country(S.home), cost = projectCost(d);
  if (S.cash < cost) return `Costs ${fmtMoney(cost, true)}.`;
  if (c.proj.some(p => p.id === id && p.until > S.day)) return 'Already running.';
  S.cash -= cost; c.proj.push({ id, until: S.day + d.years * 365 });
  S.xp += 150; news('Nation', `You funded ${d.name.toLowerCase()} in ${cname(S.home)}.`, S.home);
  return null;
}
function diplomacyCost(a3) { return Math.round(Math.max(100000, W.byA3[a3].gdp0 * 0.6) / 1000) * 1000; }
function diplomacy(a3) {
  const cost = diplomacyCost(a3); if (S.cash < cost) return `Costs ${fmtMoney(cost, true)}.`;
  S.cash -= cost; setRel(S.home, a3, Math.min(90, getRel(S.home, a3) + 20));
  news('Nation', `Your diplomats improved relations between ${cname(S.home)} and ${cname(a3)}.`, S.home);
  return null;
}

// ---------- weekly business for every company ----------
function businessWeek() {
  let mineProfit = 0;
  for (const a3 in S.co) {
    const c = S.co[a3], w = companyWeek(c);
    if (controlled(a3)) {
      const bc = (typeof boardWeeklyCost === 'function') ? boardWeeklyCost(c) : 0;
      const netP = w.profit - bc;
      c.weekProfitStreak = netP > 0 ? (c.weekProfitStreak || 0) + 1 : 0;
      if (!Array.isArray(c.weekNets)) c.weekNets = [];
      c.weekNets.push(Math.round(netP)); if (c.weekNets.length > 4) c.weekNets.shift();
      mineProfit += netP * stake(a3);
    } else aiWeek(c);
  }
  let teamProfit = 0;
  if (typeof sportWeek === 'function') { try { teamProfit = sportWeek() || 0; } catch (e) {} }
  const rent = propsWeek();
  let interest = 0, overdraft = 0;
  if (S.loan > 0) interest = S.loan * 0.08 / 52;
  if (S.cash < 0) overdraft = -S.cash * 0.2 / 52;
  const profit = mineProfit + rent + teamProfit - interest - overdraft;
  S.cash += profit;
  const own = mine(); let satW = 0, satN = 0;
  own.forEach(c => c.locs.forEach(l => { satW += l.sat * Math.max(1, l.cust); satN += Math.max(1, l.cust); }));
  if (satN > 1) S.rating = +(satW / satN).toFixed(2);
  S.week = { profit, companies: mineProfit, rent, interest, overdraft };
  if (S.leader && typeof leaderWeek === 'function') leaderWeek();
  if (typeof storesWeek === 'function') { try { storesWeek(); } catch (e) {} }
  if (typeof loansWeek === 'function') { try { loansWeek(); } catch (e) {} }
  S.stats.bestWeek = Math.max(S.stats.bestWeek, profit);
  if (profit > 0) S.xp += Math.min(150, Math.sqrt(profit) / 4);
  // Monthly: lots churn; rival companies sometimes bid for yours.
  if (dateOf(S.day).getUTCDate() <= 7) {
    for (const cid in S.lotState) for (const t in S.lotState[cid]) { if (S.lotState[cid][t] === 'taken' && rand() < 0.1) delete S.lotState[cid][t]; }
    own.forEach(c => {
      if (c.a3 === S.home || rand() > 0.025) return;
      const buyer = pick(Object.values(S.co).filter(x => !controlled(x.a3) && companyValue(x) > companyValue(c)));
      if (!buyer) return;
      const price = companyFairTotal(c) * (1.2 + rand() * 0.45);
      mail(buyer.name, `Offer to buy ${c.name}`, `${buyer.name} of ${cname(buyer.a3)} offers ${fmtMoney(price, true)} for 100% of ${c.name}. You would receive ${fmtMoney(price * stake(c.a3), true)} for your stake.`, { a3: c.a3, price, until: S.day + 30 });
      news('Business', `${buyer.name} made an offer for ${c.name}. Check your mail in the Web tab.`, c.a3);
    });
  }
}

// ---------- year end: rating, tax reactions ----------
/*
Rating, thought through (per business, once a year, never weekly):
  A business's star rating is customers' + investors' verdict on the year
  just finished, not a live mood. Four parts, all from numbers the game
  already tracks in companyWeek:
    40% customer satisfaction — average location satisfaction, weighted by
        customers served. Price, quality, wages, queues and reviews feed it.
    30% financial health — profit margin (margin 0% = 3 stars, +20% = 5,
        -20% = 1), blended with profit growth vs last year.
    15% value — the price the business charges. Normal price (~100%) = 3.5
        stars, cheap = higher, expensive = lower, even if margin looks good.
    15% reliability — website tier and fleet level, i.e. can it actually
        serve people, online and in person.
  A high rating then pays: rating already lifts demand in locEconomics
  (brand factor), fleet demand and online sales, so a well-rated business
  earns more, its fair value rises, and its stock is pulled up. A low
  rating does the reverse. Rating is NOT a free boost: raising price to
  lift margin cuts value and satisfaction, cutting price lifts satisfaction
  but cuts margin, and raising wages lifts satisfaction but cuts profit.
  Tax changes are reported in the same year-end report, with separate
  reactions from businesses, households and the government, so a tax rise
  is never just "rating down": it also raises government revenue.
*/
function ratingForYear(c) {
  const ys = c.yearStats || { satW: 0, satN: 0, rev: 0, profit: 0, weeks: 0 };
  const sat = ys.satN > 0 ? ys.satW / ys.satN : c.rating;
  const margin = ys.rev > 0 ? ys.profit / ys.rev : 0;
  const marginScore = clamp(3 + margin * 10, 1, 5);
  let growthScore = 3;
  if (c.lastYearProfit != null && Math.abs(c.lastYearProfit) > 0) growthScore = clamp(3 + (ys.profit - c.lastYearProfit) / Math.abs(c.lastYearProfit) * 5, 1, 5);
  const fin = 0.7 * marginScore + 0.3 * growthScore;
  const value = clamp(3.5 - (c.set.price - 1) * 2, 1, 5);
  const rel = clamp(3 + c.web.tier * 0.2 + (c.fleet ? 0.3 : 0), 1, 5);
  const newR = Math.round(clamp(0.40 * sat + 0.30 * fin + 0.15 * value + 0.15 * rel, 1, 5) * 10) / 10;
  const reasons = [];
  if (sat >= 4.2) reasons.push('Customers loved it — high satisfaction across its locations.');
  else if (sat <= 2.5) reasons.push('Customers complained — low satisfaction dragged it down.');
  else if (sat > c.rating + 0.2) reasons.push('Customers were happier than last year.');
  else if (sat < c.rating - 0.2) reasons.push('Customers were less happy than last year.');
  if (c.lastYearProfit != null && ys.profit > c.lastYearProfit * 1.1) reasons.push('Profits grew year on year, so investors bid it up.');
  else if (ys.profit < 0) reasons.push('It lost money this year, so investors marked it down.');
  else if (c.lastYearProfit != null && ys.profit < c.lastYearProfit * 0.9) reasons.push('Profits fell year on year, so investors cooled on it.');
  if (c.set.price >= 1.5) reasons.push('High prices hurt its value score, even though margins looked good.');
  else if (c.set.price <= 0.7) reasons.push('Low prices won customers, at the cost of margin.');
  if (c.set.wage >= 1.5) reasons.push('Higher wages kept staff, which helped service.');
  else if (c.set.wage <= 0.7) reasons.push('Low wages hurt service and staff retention.');
  if (!reasons.length) reasons.push('A steady year: no single change stood out.');
  return { newR, sat, margin, reasons };
}
function yearEnd(year) {
  if (S.mode === 'worl' && typeof worlYearEnd === 'function') { try { worlYearEnd(); } catch (e) {} }
  if (S.mode === 'domination' && typeof dominationRound === 'function') { try { dominationRound(); } catch (e) {} }
  if (typeof sportSeason === 'function') { try { sportSeason(); } catch (e) {} }
  const entries = [];
  for (const a3 in S.co) {
    const c = S.co[a3], old = c.rating, r = ratingForYear(c);
    c.rating = r.newR; c.ratingReasons = r.reasons;
    c.lastYearProfit = c.yearStats ? c.yearStats.profit : null;
    c.yearStats = { satW: 0, satN: 0, rev: 0, profit: 0, weeks: 0 };
    if (controlled(a3) || a3 === S.home) entries.push({ a3, name: c.name, sym: c.sym, old, new: r.newR, reasons: r.reasons });
  }
  const cs = country(S.home), prev = S.homeTaxPrev || { tax: cs.tax, incTax: cs.incTax, vat: cs.vat };
  const taxLines = [];
  const dCorp = cs.tax - prev.tax, dInc = (cs.incTax || 0.20) - (prev.incTax || 0.20), dVat = (cs.vat || 0.05) - (prev.vat || 0.05);
  if (Math.abs(dCorp) >= 0.01) taxLines.push(dCorp > 0 ? `Corporate tax rose ${Math.round(prev.tax * 100)}% to ${Math.round(cs.tax * 100)}%. Businesses grumbled, profits fell, and business ratings took a small hit.` : `Corporate tax fell ${Math.round(prev.tax * 100)}% to ${Math.round(cs.tax * 100)}%. Businesses kept more profit, which helped ratings.`);
  if (Math.abs(dInc) >= 0.01) taxLines.push(dInc > 0 ? `Income tax rose ${Math.round(prev.incTax * 100)}% to ${Math.round(cs.incTax * 100)}%. Households had less to spend, so shops saw fewer customers.` : `Income tax fell ${Math.round(prev.incTax * 100)}% to ${Math.round(cs.incTax * 100)}%. Households had more to spend, so demand rose.`);
  if (Math.abs(dVat) >= 0.01) taxLines.push(dVat > 0 ? `VAT rose ${Math.round(prev.vat * 100)}% to ${Math.round(cs.vat * 100)}%. Prices felt higher, so value ratings dipped.` : `VAT fell ${Math.round(prev.vat * 100)}% to ${Math.round(cs.vat * 100)}%. Prices felt lower, so value ratings lifted.`);
  if (!taxLines.length) taxLines.push('Tax rates did not change this year, so there was no tax reaction.');
  const taxRevYear = (cs.taxRev || 0) - (S.taxRevAtLastYearEnd || 0);
  S.taxRevAtLastYearEnd = cs.taxRev || 0;
  taxLines.push(`Government corporate-tax revenue this year: ${fmtMoney(taxRevYear, true)}.`);
  S.yearReport = { year, entries, taxLines, taxRev: taxRevYear };
  S.homeTaxPrev = { tax: cs.tax, incTax: cs.incTax, vat: cs.vat };
  const body = entries.map(e => `${e.name} (${e.sym}): ${e.old.toFixed(1)} star to ${e.new.toFixed(1)} star. ${e.reasons.join(' ')}`).join('\n') + '\nTax: ' + taxLines.join(' ');
  mail('Year in review', `Year ${year} in review`, body);
  if (entries.length) news('Business', `Year ${year} ratings are in: ${entries.map(e => `${e.name} ${e.new.toFixed(1)} star`).join(', ')}. See Messages for what people thought.`, S.home);
}
// Age up / down: year snapshots, kept in memory only (not in the save,
// or every save would balloon with old copies of the whole world).
// Age Up is free: push a snapshot of today, then run a full year.
// Age Down restores the last snapshot, i.e. the start of the year you
// just aged through. It only goes back as far as you aged in this
// session, up to 10 years, and never before the game started.
let YEAR_SNAPS = [];
function pushYearSnapshot() {
  try { YEAR_SNAPS.push(JSON.stringify(S)); } catch (e) {}
  if (YEAR_SNAPS.length > 10) YEAR_SNAPS.shift();
}
function ageUp() { pushYearSnapshot(); stepYear(); return null; }
function canAgeDown() { return YEAR_SNAPS.length > 0; }
function ageDown() {
  if (!YEAR_SNAPS.length) return 'No earlier year to go back to in this session. Age up first, then age down.';
  try { const prev = JSON.parse(YEAR_SNAPS.pop()); S = prev; } catch (e) { return 'Could not go back a year.'; }
  return null;
}
function stepWeek() { for (let i = 0; i < 7 && !S.over; i++) stepDay(); }
function stepYear() { const y0 = yearOf(S.day); while (!S.over && yearOf(S.day) === y0) stepDay(); }
function setTax(kind, value) {
  const cs = country(S.home); if (!cs) return 'No home nation.';
  const limits = { tax: [0.05, 0.50], incTax: [0, 0.40], vat: [0, 0.20] };
  if (!limits[kind]) return 'Unknown tax.';
  cs[kind] = clamp(value, limits[kind][0], limits[kind][1]);
  const label = kind === 'tax' ? 'Corporate tax' : kind === 'incTax' ? 'Income tax' : 'VAT';
  news('Nation', `${label} in ${cname(S.home)} is now ${Math.round(cs[kind] * 100)}%. Reactions will be reported at year end.`, S.home);
  return null;
}

// ---------- day loop ----------
function stepDay() {
  if (S.over) return;
  const trading = marketOpen();
  if (trading) marketDay();
  worldDay();
  if (trading) { for (const a3 in S.co) pushHist(S.co[a3].h, +S.co[a3].price.toFixed(2), S.day, S.co[a3].dayVol || 0); pushHist(S.idx.h, +S.idx.v.toFixed(2), S.day, 0); }
  if (S.day % 91 === 45) { let d = 0; for (const a3 in S.holdings) { const c = S.co[a3], h = S.holdings[a3]; if (h.qty > 0 && !controlled(a3) && c.listed) d += h.qty * c.price * SECTORS[c.sector].div / 4; } if (d > 1) { S.cash += d; news('Market', `Dividends paid: ${fmtMoney(d)}.`); } }
  S.props.forEach(p => { const c = country(W.cities[p.city].a3); p.value *= 1 + (c.growth * 0.6 + (c.war ? -0.1 : 0)) / 365 + gauss() * 0.001; });
  if (S.day % 7 === 6) businessWeek();
  S.day++;
  if (yearOf(S.day) !== yearOf(S.day - 1)) yearEnd(yearOf(S.day));
  if (S.day % 7 === 0) { S.nh.w.push([S.day, Math.round(netWorth()), +S.idx.v.toFixed(2)]); if (S.nh.w.length > 260) S.nh.w.shift(); }
  if (dateOf(S.day).getUTCDate() === 1) S.nh.m.push([S.day, Math.round(netWorth()), +S.idx.v.toFixed(2)]);
  S.netWorth = netWorth();
  S.nh.d.push([S.day, Math.round(S.netWorth)]); if (S.nh.d.length > 400) S.nh.d.shift();
  checkCareer();
  // No time limit: the game does NOT end at 100 years, or any age. It
  // only ends on bankruptcy below. A long life just means more chances
  // for a CPU superpower to try a takeover or a war.
  if (S.netWorth < -Math.max(2e6, S.stats.startNet)) { S.broke = (S.broke || 0) + 1; if (S.broke === 1) news('Business', 'Warning: you are close to bankruptcy. Close losing locations or sell assets.'); if (S.broke > 60) finishGame(true); } else S.broke = 0;
}

// ---------- career, rewards, shop ----------
function checkCareer() {
  const stage = CAREER[S.career]; if (!stage) return;
  stage.goals.forEach((g, i) => { const k = S.career + ':' + i; if (!S.goalsDone.includes(k) && g.f(S)) { S.goalsDone.push(k); S.xp += 200; news('Milestone', `Goal complete: ${g.t}.`); } });
  if (stage.goals.every((g, i) => S.goalsDone.includes(S.career + ':' + i))) {
    const reward = [100e3, 500e3, 2e6, 10e6, 50e6, 0][S.career];
    S.cash += reward; S.career++;
    news('Milestone', `Promoted to ${careerName()}${reward ? ` • +${fmtMoney(reward, true)} bonus` : ''}.`);
  }
}
function careerName() { return (CAREER[S.career] || { name: 'Legend' }).name; }
function dailyRewardInfo() {
  const t = todayStr(), y = new Date(Date.now() - DAY_MS), ys = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
  const streak = S.daily.last === t ? S.daily.streak : S.daily.last === ys ? S.daily.streak + 1 : 1;
  const scale = Math.max(1, Math.sqrt(Math.max(1, netWorth()) / 2e6));
  const amt = n => Math.round([50e3, 90e3, 140e3, 200e3, 300e3, 450e3, 700e3][(n - 1) % 7] * scale / 1000) * 1000;
  return { claimed: S.daily.last === t, streak, amount: amt(streak), tomorrow: amt(streak + 1) };
}
function claimDaily() { const i = dailyRewardInfo(); if (i.claimed) return 'Already claimed today.'; S.daily = { streak: i.streak, last: todayStr() }; S.cash += i.amount; return null; }
// No claim buttons: daily money goes straight to cash. Returns the amount added, or 0.
function autoCreditDaily() { const i = dailyRewardInfo(); if (i.claimed) return 0; S.daily = { streak: i.streak, last: todayStr() }; S.cash += i.amount; return i.amount; }
// Shop cash grant is also automatic, not claimed. Power-ups in the Shop stay as free daily picks.
function autoCreditShopCash() { if (S.shop.cash === todayStr()) return 0; const amt = Math.max(250000, netWorth() * 0.02); S.shop.cash = todayStr(); S.cash += amt; return amt; }
const shopReady = id => S.shop[id] !== todayStr();
function claimShop(id) {
  if (id === 'cash') return 'Cash grants are added to your cash automatically each day.';
  if (!shopReady(id)) return 'Come back tomorrow for another free one.';
  S.shop[id] = todayStr();
  if (id === 'rush') S.boosts.rush = S.day + 7;
  if (id === 'rating') mine().forEach(c => c.locs.forEach(l => l.boost = 1.5));
  if (id === 'intel') S.boosts.intel = S.day + 30;
  return null;
}
function finishGame(bankrupt) {
  const nw = netWorth();
  const score = Math.round(Math.max(0, Math.log10(Math.max(1e4, nw)) - 4) * 120 + popGrowth() * 300 + clamp(beatMarket(), -1, 5) * 150 + S.career * 60 + mine().length * 10);
  S.over = { bankrupt: !!bankrupt, day: S.day, nw, pop: popGrowth(), beat: beatMarket(), mkt: marketReturn(), mine: myReturn(), score, stage: careerName(), companies: mine().length };
  const b = storeGet(BOARD_KEY) || []; b.push({ score, nw: Math.round(nw), home: S.home, name: homeCo().name, date: Date.now() }); b.sort((x, y) => y.score - x.score); storeSet(BOARD_KEY, b.slice(0, 20));
}
// The world's most valuable companies, with you (your net worth) ranked among them.
function leaderboard() {
  const list = Object.values(S.co).filter(c => !controlled(c.a3)).map(c => ({ name: c.name, a3: c.a3, v: companyValue(c), color: c.color }));
  list.push({ name: S.you.name + ' (you)', a3: S.home, v: netWorth(), you: true, color: homeCo().color });
  return list.sort((a, b) => b.v - a.v);
}
