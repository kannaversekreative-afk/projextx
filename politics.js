// ---------- office decisions: mayor, governor, congress ----------
// US-first, and each role does what that role actually does.
// - Mayor: community decisions, NOT laws. Yes/no choices, a step
//   above common sense: every yes has a good side AND a bad side,
//   and a reward in game state (treasury, stability, popularity,
//   public opinion, or budget growth). No is just skipping it.
// - Governor: laws. A governor signs state laws — tax, schools,
//   state police, environment. Laws cost budget or slow budget
//   growth, and move stability and meters.
// - Congress: law developing. A congressman develops federal bills
//   — infrastructure, healthcare, defense, tax reform. Same levers,
//   smaller and broader than a governor's state laws.
// Effects use levers the game already has: office treasury (your
// office budget), country stability, popularity, public opinion, and
// office budget growth. Companies are country-level in current data,
// so there is no region-specific company cost yet — that is a data
// limit, not a skipped decision.
// A decision can be taken once a year (365 days), so you cannot spam
// one decision to max a meter.
const OFFICE_DECISIONS = {
  mayor: [
    { id: 'police', name: 'Raise police funding', good: 'Stability +3, popularity +2 — safer streets', bad: 'Public opinion −2, costs 5% of your budget', costPct: 0.05, stab: 3, pop: 2, opin: -2 },
    { id: 'datacenter', name: 'Approve a data center', good: 'Popularity +3 (jobs) and your budget grows twice as fast for a year', bad: 'Public opinion −3 (power and water use), costs 10% of your budget', costPct: 0.10, pop: 3, opin: -3, incomeBoost: 365 },
    { id: 'housing', name: 'Approve new apartment housing', good: 'Popularity +4 (more homes), stability +1', bad: 'Public opinion −2 (traffic and construction), costs 5% of your budget', costPct: 0.05, pop: 4, opin: -2, stab: 1 },
    { id: 'transit', name: 'Expand bus routes', good: 'Popularity +3 (workers can reach jobs), stability +1', bad: 'Public opinion −1 (taxes), costs 5% of your budget', costPct: 0.05, pop: 3, opin: -1, stab: 1 }
  ],
  governor: [
    { id: 'taxcut', name: 'Sign a state tax cut into law', good: 'Popularity +5, public opinion +3', bad: 'Your budget grows half as fast for a year — the state takes in less', pop: 5, opin: 3, taxCut: 365 },
    { id: 'schools', name: 'Sign a school funding law', good: 'Popularity +3, public opinion +4, stability +2', bad: 'Costs 10% of your budget, and budget growth slows to 75% for a year', costPct: 0.10, pop: 3, opin: 4, stab: 2, schoolCut: 365 },
    { id: 'statepolice', name: 'Expand state police', good: 'Stability +4, popularity +1', bad: 'Public opinion −2, costs 10% of your budget', costPct: 0.10, pop: 1, opin: -2, stab: 4 },
    { id: 'environment', name: 'Sign a state environmental law', good: 'Public opinion +4, stability +1', bad: 'Popularity −2 (business complaints), costs 5% of your budget', costPct: 0.05, pop: -2, opin: 4, stab: 1 }
  ],
  congress: [
    { id: 'infrastructure', name: 'Develop a federal infrastructure bill', good: 'Popularity +4, stability +2', bad: 'Public opinion −2 (deficit worries), costs 5% of your budget', costPct: 0.05, pop: 4, opin: -2, stab: 2 },
    { id: 'healthcare', name: 'Develop a healthcare bill', good: 'Popularity +5, public opinion +3', bad: 'Costs 10% of your budget, stability −1 (political fight)', costPct: 0.10, pop: 5, opin: 3, stab: -1 },
    { id: 'defense', name: 'Develop a defense spending bill', good: 'Stability +3', bad: 'Popularity −2, public opinion −1, costs 10% of your budget', costPct: 0.10, pop: -2, opin: -1, stab: 3 },
    { id: 'taxreform', name: 'Develop a tax reform bill', good: 'Public opinion +4, popularity +2', bad: 'Your budget grows half as fast for a year', pop: 2, opin: 4, taxCut: 365 }
  ]
};
function officeDecisionsFor(office) {
  if (!office) return [];
  if (office.scope === 'city') return OFFICE_DECISIONS.mayor;
  if (office.scope === 'region') return OFFICE_DECISIONS.governor;
  if (office.scope === 'legislature') return OFFICE_DECISIONS.congress;
  return [];
}
function takeOfficeDecision(id) {
  const P = ensurePerson();
  const o = P.office;
  if (!o) return 'You hold no office.';
  const list = officeDecisionsFor(o);
  const d = list.find(x => x.id === id);
  if (!d) return 'That decision is not yours to make in this office.';
  if (!o.decisions) o.decisions = {};
  if (o.decisions[id] != null && S.day - o.decisions[id] < 365) return 'You already made that decision this year. You can make it again next year.';
  const treasury = officeTreasury(o);
  const cost = d.costPct ? Math.max(50000, Math.round(treasury * d.costPct)) : 0;
  if (cost && treasury < cost) return `That decision costs ${fmtMoney(cost, true)} from your office budget (you have ${fmtMoney(treasury, true)}).`;
  if (cost) officeAddTreasury(o, -cost);
  if (d.stab) { const cs = country(S.home); if (cs) cs.stab = Math.max(0, Math.min(100, (cs.stab || 50) + d.stab)); }
  if (d.pop) P.pop = Math.max(0, Math.min(100, P.pop + d.pop));
  if (d.opin) P.opin = Math.max(0, Math.min(100, P.opin + d.opin));
  if (d.incomeBoost) o.incomeBoostUntil = S.day + d.incomeBoost;
  if (d.taxCut) o.taxCutUntil = S.day + d.taxCut;
  if (d.schoolCut) o.schoolCutUntil = S.day + d.schoolCut;
  o.decisions[id] = S.day;
  if (typeof news === 'function') news('Person', `As ${o.title}, you ${d.name.toLowerCase()}.`, S.home);
  return null;
}
// College gate for running, matching the college degrees: mayor needs
// an Associate, governor and congress need a Bachelor, head needs a
// Master, crown prince needs a Bachelor.
function officeDegreeReq(officeId) {
  if (officeId === 'mayor') return 'assoc';
  if (officeId === 'governor' || officeId === 'congress' || officeId === 'prince') return 'bachelor';
  if (officeId === 'head') return 'master';
  return null;
}
