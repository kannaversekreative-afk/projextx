// ---------- the person ----------
// You play a person, not a country. You start at 18. Leader and legacy
// starts give $250,000 of your own money; flow (employee life-path)
// starts give $5,000 — you get a job, save, go to college, and unlock
// cities from earnings, with no daily free cash grants. Age is just
// a stat: it advances with the years and never kills you or retires you.
// Three wallets:
//   personal — your money (person panel),
//   business — S.cash, the money shown in the top-left pill,
//   office — the budget of whatever office you hold (the nation
//     treasury for a president, a city budget for a mayor, and so on).
// Four meters: visibility (how much you're seen), fame (how widely
// known), popularity (how liked), public opinion (what people think
// of your leadership). Elections are won on fame, popularity, and
// public opinion — three separate scores.
// The Cabinet is always there: 10 advisor spots, from family and
// friends up to kings of the world. Advisors have ratings, can be
// right or wrong, sell inside info for money, and getting caught can
// mean a fine, an arrest, or impeachment.
function defaultPerson() {
  return {
    cash: 250000,
    vis: 5, fame: 5, pop: 50, opin: 50,
    job: { track: 'civilian', rank: 0, weeks: 0 },
    office: null,
    degrees: [],
    college: null,
    cabinet: [],
    cabCands: null,
    tips: [],
    flaggedUntil: 0,
    runCooldownUntil: 0,
    ranOnce: false,
  };
}
// Assistant-decided values (Nicholas: "idk, up to you" for Q1, "you decide" for Q5).
// Employee life path: an employee starts with $5,000 personal money.
// Next city unlock: $25,000. These are the life-path values; existing
// leader/tycoon starts ($250,000 personal) are unchanged.
const EMPLOYEE_START_CASH = 5000;
const CITY_UNLOCK_COST = 25000;
// College, across from the capital. Associate unlocks manager-level
// work and a mayor run; Bachelor unlocks analyst work, governor and
// congress runs; Master unlocks director work and a president run.
const COLLEGE_DEGREES = [
  { id: 'assoc', name: 'Associate Degree', weeks: 104, cost: 10000, req: null },
  { id: 'bachelor', name: "Bachelor's Degree", weeks: 208, cost: 25000, req: 'assoc' },
  { id: 'master', name: "Master's Degree", weeks: 104, cost: 20000, req: 'bachelor' }
];
function clampMeter(v) { return Math.max(0, Math.min(100, Math.round(v || 0))); }
function ensurePerson() {
  if (typeof S === 'undefined' || !S) return defaultPerson();
  if (!S.person) S.person = defaultPerson();
  const d = defaultPerson(), p = S.person;
  for (const k in d) if (p[k] == null) p[k] = d[k];
  if (!p.job) p.job = { track: 'civilian', rank: 0, weeks: 0 };
  if (!Array.isArray(p.cabinet)) p.cabinet = [];
  if (!Array.isArray(p.tips)) p.tips = [];
  p.vis = clampMeter(p.vis); p.fame = clampMeter(p.fame); p.pop = clampMeter(p.pop); p.opin = clampMeter(p.opin);
  if (S.you && !S.you.look && typeof randLook === 'function') S.you.look = randLook();
  return p;
}
function personAge() { return 18 + Math.floor(((typeof S !== 'undefined' && S ? S.day : 0) || 0) / 365); }

// The title shown behind the player's name in the top HUD pill:
// elected office first, then CEO of a company they control, then
// Leader in a leader game, then their job title, else Citizen.
function personTitle() {
  const P = ensurePerson();
  if (P.office && P.office.title) return P.office.title;
  try { if (typeof mine === 'function' && mine().length) return 'CEO'; } catch (e) {}
  if (typeof S !== 'undefined' && S && S.leader) return 'Leader';
  if (P.job) { try { return jobTitle(P.job); } catch (e) {} }
  return 'Citizen';
}

// ---------- offices ----------
const MONARCHY = { GBR: 1, SAU: 1, ESP: 1, SWE: 1, NOR: 1, DNK: 1, NLD: 1, BEL: 1, MAR: 1, JOR: 1, THA: 1, JPN: 1, KWT: 1, QAT: 1, ARE: 1, BHR: 1, OMN: 1, MYS: 1, CAM: 1, BTN: 1, LSO: 1, SWZ: 1, TON: 1, LUX: 1, MCO: 1, LIE: 1 };
function isMonarchy(a3) { return !!MONARCHY[a3]; }
function officeList() {
  const mon = isMonarchy(S.home);
  const cap = (W.byA3[S.home] && W.cities[W.byA3[S.home].capital]) || null;
  const list = [
    { id: 'mayor', title: cap ? `Mayor of ${cap.name}` : 'Mayor', scope: 'city', req: { fame: 15, pop: 40, opin: 40 }, salary: 2000, termDays: 1460, base: 30 },
    { id: 'governor', title: 'Governor', scope: 'region', req: { fame: 30, pop: 50, opin: 50 }, salary: 3500, termDays: 1460, base: 45 },
    { id: 'congress', title: mon ? 'Member of Parliament' : 'Member of Congress', scope: 'legislature', req: { fame: 45, pop: 55, opin: 55 }, salary: 5000, termDays: 730, base: 55 },
  ];
  if (mon) list.push({ id: 'prince', title: 'Crown Prince', scope: 'royal', req: { fame: 60, pop: 60, opin: 60 }, salary: 8000, termDays: 1460, base: 65 });
  list.push({ id: 'head', title: mon ? (S.home === 'JPN' ? 'Emperor' : 'King') : 'President', scope: 'nation', req: { fame: 75, pop: 65, opin: 65 }, salary: 15000, termDays: mon ? 3650 : 1460, base: 75 });
  return list;
}
function officeTreasury(o) {
  if (!o) return 0;
  if (o.scope === 'nation') { const cs = (typeof country === 'function') ? country(S.home) : null; return cs ? (cs.treasury || 0) : 0; }
  return o.treasury || 0;
}
function officeAddTreasury(o, amt) {
  if (!o) return;
  if (o.scope === 'nation') { const cs = (typeof country === 'function') ? country(S.home) : null; if (cs) cs.treasury = Math.max(0, (cs.treasury || 0) + amt); }
  else o.treasury = Math.max(0, (o.treasury || 0) + amt);
}
function officeScopeGdp(o) {
  const gdp = (W.byA3[S.home] ? W.byA3[S.home].gdp0 * 1e6 : 1e9);
  if (o.scope === 'city') { const cap = (W.byA3[S.home] && W.cities[W.byA3[S.home].capital]) || null; return (cap && cap.gdpAlloc ? cap.gdpAlloc : gdp * 0.05); }
  if (o.scope === 'region') return gdp * 0.3;
  return gdp;
}
function officeTreasuryStart(o) {
  const gdp = (W.byA3[S.home] ? W.byA3[S.home].gdp0 * 1e6 : 1e9);
  if (o.scope === 'nation') return officeTreasury(o);
  if (o.scope === 'city') return Math.round(officeScopeGdp(o) * 0.01);
  if (o.scope === 'region') return Math.round(gdp * 0.02);
  return Math.round(gdp * 0.01);
}

// ---------- government-only capitals ----------
// A capital is not a commercial city: it houses the government. No new
// stores, no building purchases there — but everything already built
// keeps working. The government buildings below are the capital's
// content: police, fire, the country's agencies, the leader's house,
// the military base, and the port (coastal countries only).
function isGovCity(city) {
  if (!city || typeof W === 'undefined') return false;
  const k = W.byA3[city.a3];
  return !!(k && k.capital === city.id);
}
function govBuildingsFor(a3) {
  const ag = agencyOf(a3);
  const mon = isMonarchy(a3);
  const k = W.byA3[a3];
  const list = [
    { id: 'capitol', icon: '🏛️', name: 'Capitol', desc: 'The seat of government.', effect: 'Prestige of the capital.', link: 'capital' },
    { id: 'residence', icon: '🏠', name: a3 === 'USA' ? 'White House' : a3 === 'JPN' ? 'Imperial Palace' : mon ? 'Royal Palace' : 'Presidential Palace', desc: mon ? 'Where the monarch lives.' : 'Where the head of state lives.', effect: 'Hold the top office to gain +0.3 popularity a week from living here.', link: 'elections' },
    { id: 'police', icon: '🚔', name: 'Police Headquarters', desc: 'Law enforcement for the capital.', effect: '+0.1 stability a week for your home country.', link: null },
    { id: 'fire', icon: '🚒', name: 'Fire Station', desc: 'Fire and rescue for the capital.', effect: '+0.1 stability a week for your home country.', link: null },
    { id: 'agency-dom', icon: '🕵️', name: ag[0] + ' Headquarters', desc: 'Domestic intelligence.', effect: 'Tips from your advisors cost 10% less.', link: null },
  ];
  if (ag[1] !== ag[0]) list.push({ id: 'agency-for', icon: '🕵️', name: ag[1] + ' Headquarters', desc: 'Foreign intelligence.', effect: 'Tips from your advisors cost 10% less.', link: null });
  list.push({ id: 'military', icon: '🎖️', name: 'Military Base', desc: 'The armed forces command.', effect: 'Opens the Military panel.', link: 'military' });
  if (k && k.coastal) list.push({ id: 'port', icon: '⚓', name: 'Port', desc: 'The capital port.', effect: 'Opens the airport departures board.', link: 'departures' });
  return list;
}

// ---------- agencies: every country has its own ----------
const AGENCIES = { USA: ['FBI', 'CIA'], GBR: ['MI5', 'MI6'], RUS: ['FSB', 'SVR'], CHN: ['MSS', 'MSS'], FRA: ['DGSI', 'DGSE'], DEU: ['BfV', 'BND'], ISR: ['Shin Bet', 'Mossad'], IND: ['IB', 'RAW'], PAK: ['IB', 'ISI'], TUR: ['MIT', 'MIT'], IRN: ['MOIS', 'MOIS'], SAU: ['GIP', 'GIP'], EGY: ['GIS', 'GIS'], KOR: ['NIS', 'NIS'], JPN: ['PSIA', 'CIRO'], AUS: ['ASIO', 'ASIS'], CAN: ['CSIS', 'CSIS'], BRA: ['ABIN', 'ABIN'], ITA: ['AISI', 'AISE'], ESP: ['CNI', 'CNI'] };
function agencyOf(a3) { return AGENCIES[a3] || ['Domestic Intelligence', 'Foreign Intelligence']; }

// ---------- jobs ----------
function companyForJob(job) {
  if (!job || !job.company) return null;
  try {
    if (typeof S !== 'undefined' && S) {
      if (S.co && S.co[job.company]) return S.co[job.company];
      if (S.extra && S.extra[job.company]) return S.extra[job.company];
    }
  } catch (e) {}
  return null;
}
function companyValueForJob(job) {
  const c = companyForJob(job);
  if (!c) return 0;
  try { return typeof companyValue === 'function' ? companyValue(c) : (c.price || 0) * (c.shares || 0); } catch (e) { return 0; }
}
function jobLadder(track, company) {
  if (track === 'company') {
    const sec = company ? (company.sector || '') : '';
    const entry = sec.includes('Coffee') ? 'Barista' : (sec.includes('Restaurant') || sec.includes('Fast')) ? 'Cashier' : 'Entry Associate';
    return [
      { title: entry, salary: 400, fame: 0, weeks: 0 },
      { title: 'Shift Lead', salary: 650, fame: 5, weeks: 8 },
      { title: 'Store Manager', salary: 1100, fame: 10, weeks: 26 },
      { title: 'Analyst', salary: 2000, fame: 15, weeks: 52 },
      { title: 'Senior Analyst', salary: 3500, fame: 20, weeks: 78 },
      { title: 'Sr. Manager', salary: 6000, fame: 25, weeks: 104 },
      { title: 'Director', salary: 12000, fame: 35, weeks: 156 },
      { title: 'VP', salary: 25000, fame: 45, weeks: 208 },
      { title: 'CEO', salary: 60000, fame: 60, weeks: 260 }
    ];
  }
  const ag = agencyOf(S.home);
  if (track === 'agency-dom') return [{ title: ag[0] + ' Agent', salary: 1500, fame: 10, weeks: 0 }, { title: ag[0] + ' Special Agent', salary: 2500, fame: 25, weeks: 26 }, { title: ag[0] + ' Director', salary: 5000, fame: 45, weeks: 52 }];
  if (track === 'agency-for') return [{ title: ag[1] + ' Officer', salary: 1500, fame: 10, weeks: 0 }, { title: ag[1] + ' Senior Officer', salary: 2500, fame: 25, weeks: 26 }, { title: ag[1] + ' Director', salary: 5000, fame: 45, weeks: 52 }];
  if (track === 'military') return [{ title: 'Private', salary: 500, fame: 0, weeks: 0 }, { title: 'Sergeant', salary: 1000, fame: 10, weeks: 26 }, { title: 'Officer', salary: 2000, fame: 20, weeks: 52 }, { title: 'General', salary: 5000, fame: 40, weeks: 104 }];
  return [{ title: 'Factory worker', salary: 600, fame: 0, weeks: 0 }, { title: 'Shift lead', salary: 900, fame: 10, weeks: 4 }, { title: 'Supervisor', salary: 1400, fame: 15, weeks: 12 }, { title: 'Manager', salary: 2200, fame: 20, weeks: 26 }, { title: 'Executive', salary: 4000, fame: 30, weeks: 52 }];
}
function jobTitle(job) { const l = jobLadder(job.track, companyForJob(job)); return (l[job.rank] || l[0]).title; }
function jobSalary(job) { const l = jobLadder(job.track, companyForJob(job)); return (l[job.rank] || l[0]).salary; }
function promoteJob() {
  const P = ensurePerson();
  const l = jobLadder(P.job.track, companyForJob(P.job));
  if (P.job.rank >= l.length - 1) return 'Already at the top of this career.';
  const next = l[P.job.rank + 1];
  // Company career: time gets you to Analyst (rank 3). After that,
  // performance decides — and doubling the company jumps you, it
  // does not just level you up one step. Doubling is hard on purpose:
  // it needs the company's value to actually double since your last promotion.
  if (P.job.track === 'company') {
    if (P.job.weeks < next.weeks) return `Need ${next.weeks} weeks in this job for ${next.title} (you have ${P.job.weeks}).`;
    // Degree gates, matching the college card: Associate for manager
    // work (rank 2+), Bachelor for analyst work (rank 3+), Master for
    // director work (rank 6+). A jump is checked against the rank it
    // lands on, so a Sr. Manager still needs a Master to jump to VP.
    const degreeReqForRank = r => r >= 6 ? 'master' : r >= 3 ? 'bachelor' : r >= 2 ? 'assoc' : null;
    if (P.job.rank >= 3) {
      const cur = companyValueForJob(P.job), base = P.job.valueAtPromo || cur;
      if (!cur || cur < base * 2) return `Analyst-level promotion needs the company to double since your last promotion (now ${fmtMoney(cur, true)}, need ${fmtMoney(base * 2, true)}).`;
      const jump = Math.min(2, l.length - 1 - P.job.rank);
      const target = P.job.rank + jump;
      const deg = degreeReqForRank(target);
      if (deg && !(P.degrees || []).includes(deg)) {
        const degName = (typeof COLLEGE_DEGREES !== 'undefined' ? COLLEGE_DEGREES.find(x => x.id === deg) : null) || { name: deg };
        return `To jump to ${l[target].title} you need ${deg === 'assoc' ? 'an' : 'a'} ${degName.name} — go to college first.`;
      }
      P.job.rank += jump; P.job.weeks = 0; P.job.valueAtPromo = cur;
      if (typeof news === 'function') news('Person', `You jumped to ${l[P.job.rank].title} after doubling the company.`, S.home);
      return null;
    }
    const deg = degreeReqForRank(P.job.rank + 1);
    if (deg && !(P.degrees || []).includes(deg)) {
      const degName = (typeof COLLEGE_DEGREES !== 'undefined' ? COLLEGE_DEGREES.find(x => x.id === deg) : null) || { name: deg };
      return `To become ${next.title} you need ${deg === 'assoc' ? 'an' : 'a'} ${degName.name} — go to college first.`;
    }
    P.job.rank++; P.job.weeks = 0;
    if (P.job.rank === 3) P.job.valueAtPromo = companyValueForJob(P.job);
    if (typeof news === 'function') news('Person', `You were promoted to ${next.title}.`, S.home);
    return null;
  }
  if (P.fame < next.fame) return `Need ${next.fame} fame for ${next.title} (you have ${Math.round(P.fame)}).`;
  if (P.job.weeks < next.weeks) return `Need ${next.weeks} weeks in this career for ${next.title} (you have ${P.job.weeks}).`;
  P.job.rank++; P.job.weeks = 0;
  if (typeof news === 'function') news('Person', `You were promoted to ${next.title}.`, S.home);
  return null;
}
// Apply for a company job — NOT automatic. A company that is losing
// money is not hiring, and you cannot hold two company jobs at once.
// Entry jobs need no degree; the company you apply to is the one you work for.
function applyCompanyJob(key) {
  const P = ensurePerson();
  if (P.job && P.job.track === 'company') return 'You already have a company job. Quit it first to apply elsewhere.';
  let c = null;
  try {
    if (S.co && S.co[key]) c = S.co[key];
    else if (S.extra && S.extra[key]) c = S.extra[key];
  } catch (e) {}
  if (!c) return 'That company is not hiring right now.';
  const wk = c.week || {};
  if (wk.profit != null && wk.profit < 0) return `${c.name} is losing money and is not hiring right now.`;
  const v = companyValueForJob({ company: key });
  P.job = { track: 'company', rank: 0, weeks: 0, company: key, valueAtPromo: v, startValue: v };
  if (typeof news === 'function') news('Person', `You were hired at ${c.name}.`, S.home);
  return null;
}
// Analyst decisions: as Analyst (rank 3+) you make the CEO-like calls
// for the company you work for — price, quality, wage — at analyst pay,
// with no stock. These are the real settings the weekly simulation
// already uses (see locEconomics): price trades customers for margin,
// quality trades cost for satisfaction, wage trades cost for staff
// happiness. Bad calls shrink weekly profit, which shrinks company
// value, which is what gets you fired and what blocks promotion.
function setAnalystSetting(kind, value) {
  const P = ensurePerson();
  if (!P.job || P.job.track !== 'company') return 'You do not have a company job.';
  if (P.job.rank < 3) return 'Analyst decisions start at Analyst — work up to it first.';
  const c = companyForJob(P.job);
  if (!c) return 'Your company is gone.';
  if (kind !== 'price' && kind !== 'quality' && kind !== 'wage') return 'That is not a decision you can make.';
  const v = +value;
  if (!isFinite(v)) return 'Bad value.';
  if (!c.set) c.set = { price: 1, quality: 3, wage: 1 };
  c.set[kind] = v;
  P.job.decisions = (P.job.decisions || 0) + 1;
  P.job.lastDecision = { kind, value: v, day: S.day, companyValue: companyValueForJob(P.job) };
  if (typeof news === 'function') news('Person', `As Analyst at ${c.name}, you set ${kind} to ${v}.`, S.home);
  return null;
}
function enrollCollege(id) {
  const P = ensurePerson();
  const d = COLLEGE_DEGREES.find(x => x.id === id);
  if (!d) return 'That degree does not exist.';
  if (P.college) return `You are already studying for ${P.college.name}.`;
  if (!Array.isArray(P.degrees)) P.degrees = [];
  if (P.degrees.includes(id)) return `You already have a ${d.name}.`;
  if (d.req && !P.degrees.includes(d.req)) return `You need a ${COLLEGE_DEGREES.find(x => x.id === d.req).name} first.`;
  if (P.cash < d.cost) return `You need ${fmtMoney(d.cost, true)} for a ${d.name} (you have ${fmtMoney(P.cash, true)}).`;
  P.cash -= d.cost;
  P.college = { id: d.id, name: d.name, weeksLeft: d.weeks };
  if (typeof news === 'function') news('Person', `You enrolled in college for a ${d.name}.`, S.home);
  return null;
}
// Find a job: switch career track. Agency and military switches reuse
// their existing gates; switching to the civilian track is free.
function switchJob(track) {
  if (track === 'dom' || track === 'for') return joinAgency(track);
  if (track === 'military') return enlistMilitary();
  const P = ensurePerson();
  P.job = { track: 'civilian', rank: 0, weeks: 0 };
  return null;
}
function joinAgency(kind) {
  const P = ensurePerson();
  if (P.fame < 10) return 'Agencies want known faces: you need 10 fame first.';
  if (P.flaggedUntil > S.day) return 'Your record is flagged. Agencies will not take you right now.';
  P.job = { track: kind === 'for' ? 'agency-for' : 'agency-dom', rank: 0, weeks: 0 };
  return null;
}
function enlistMilitary() {
  const P = ensurePerson();
  P.job = { track: 'military', rank: 0, weeks: 0 };
  return null;
}

// ---------- cabinet: 10 advisor spots, always there ----------
const CAB_FIRST = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Robin', 'Avery', 'Quinn', 'Drew', 'Sky', 'Rowan', 'Emerson'];
const CAB_LAST = ['Marsh', 'Cole', 'Reed', 'Frost', 'Blake', 'Stone', 'Wells', 'Hart', 'Lane', 'Cross', 'Ash', 'Fox', 'Gray', 'Hale', 'Pike'];
function cabName() { return CAB_FIRST[Math.floor(Math.random() * CAB_FIRST.length)] + ' ' + CAB_LAST[Math.floor(Math.random() * CAB_LAST.length)]; }
function ownsBusiness() { return (S.stores && S.stores.length > 0) || (typeof mine === 'function' && mine().length > 0); }
function cabUnlocked(type) {
  const P = ensurePerson();
  if (type === 'business') return ownsBusiness();
  if (type === 'strategist') return !!P.ranOnce || !!P.office;
  if (type === 'general') { const cs = (typeof country === 'function') ? country(S.home) : null; return (P.job.track === 'military' && P.job.rank >= 2) || (cs && cs.milLv && cs.milLv.army >= 10); }
  if (type === 'spy') return P.job.track === 'agency-dom' || P.job.track === 'agency-for';
  if (type === 'leader') return P.fame >= 70;
  return true;
}
function cabUnlockWhy(type) {
  if (type === 'business') return 'Unlocks when you own a business.';
  if (type === 'strategist') return 'Unlocks when you run for office.';
  if (type === 'general') return 'Unlocks as a military Officer, or with Army Lv 10.';
  if (type === 'spy') return 'Unlocks in an agency career.';
  if (type === 'leader') return 'Unlocks at 70 fame.';
  return '';
}
const CAB_TYPES = {
  family: { name: 'Family member', cost: 0 },
  friend: { name: 'Friend', cost: 0 },
  financial: { name: 'Financial advisor', cost: 50000 },
  business: { name: 'Business advisor', cost: 100000 },
  lawyer: { name: 'Lawyer', cost: 200000 },
  strategist: { name: 'Political strategist', cost: 500000 },
  general: { name: 'General', cost: 500000 },
  spy: { name: 'Agency contact', cost: 1000000 },
  leader: { name: 'World leader', cost: 5000000 },
};
function cabCandidates(type) {
  const P = ensurePerson();
  if (!P.cabCands || P.cabCands.type !== type) {
    const list = [];
    for (let i = 0; i < 3; i++) list.push({ id: 'cab' + Date.now() + i + Math.floor(Math.random() * 1000), name: cabName(), type, rating: 30 + Math.floor(Math.random() * 66), star: Math.random() < 0.35, starCap: 85 + Math.floor(Math.random() * 14) });
    P.cabCands = { type, list };
  }
  return P.cabCands.list;
}
function hireCabinet(type, candId) {
  const P = ensurePerson();
  if (P.cabinet.length >= 10) return 'Your cabinet is full (10). Fire someone first.';
  if (!cabUnlocked(type)) return cabUnlockWhy(type);
  const c = cabCandidates(type).find(x => x.id === candId);
  if (!c) return 'Candidate not found.';
  const cost = CAB_TYPES[type].cost;
  if (P.cash < cost) return `Costs ${fmtMoney(cost, true)} of your personal money.`;
  P.cash -= cost;
  P.cabinet.push({ id: c.id, name: c.name, type, rating: c.rating, star: !!c.star, starCap: c.starCap || 98 });
  P.cabCands = null;
  return null;
}
function fireCabinet(id) {
  const P = ensurePerson();
  const i = P.cabinet.findIndex(x => x.id === id);
  if (i < 0) return 'Advisor not found.';
  P.cabinet.splice(i, 1); return null;
}
function cabHas(type) { return ensurePerson().cabinet.some(x => x.type === type); }
function tipStake() { const P = ensurePerson(); const base = Math.round(P.cash * 0.10 / 1000) * 1000; return Math.max(10000, Math.min(5000000, Math.round(base * 0.9 / 1000) * 1000)); }
function tipRisk() { let r = 0.12; if (cabHas('lawyer')) r *= 0.5; if (cabHas('spy')) r *= 0.5; return r; }
function tipChance(ad) { let c = 0.25 + (ad.rating || 50) / 200; if (cabHas('business')) c += 0.10; if (cabHas('spy')) c += 0.15; return Math.min(0.95, c); }
function buyCabTip(id) {
  const P = ensurePerson();
  const ad = P.cabinet.find(x => x.id === id);
  if (!ad) return 'Advisor not found.';
  const stake = tipStake();
  if (P.cash < stake) return `A tip costs ${fmtMoney(stake, true)} of your personal money.`;
  P.cash -= stake;
  P.tips.push({ advisor: ad.name, type: ad.type, stake, due: S.day + 7, chance: tipChance(ad), risk: tipRisk() });
  return null;
}
function resolveTips(P) {
  const due = P.tips.filter(t => S.day >= t.due);
  if (!due.length) return;
  P.tips = P.tips.filter(t => S.day < t.due);
  due.forEach(t => {
    const win = Math.random() < t.chance;
    if (win) {
      const pay = Math.round(t.stake * 2.5);
      P.cash += pay;
      if (typeof news === 'function') news('Person', `Inside tip from ${t.advisor} paid off: +${fmtMoney(pay, true)}.`, S.home);
    } else if (typeof news === 'function') news('Person', `Inside tip from ${t.advisor} was wrong. Stake lost.`, S.home);
    if (Math.random() < t.risk) {
      const fine = t.stake * 2;
      P.cash = Math.max(0, P.cash - fine);
      if (P.office) {
        const title = P.office.title; P.office = null;
        P.pop = Math.max(0, P.pop - 10); P.opin = Math.max(0, P.opin - 10); P.fame = Math.max(0, P.fame - 5); P.flaggedUntil = S.day + 365;
        if (typeof news === 'function') news('Person', `Caught taking inside info — impeached from ${title} and fined ${fmtMoney(fine, true)}. You cannot run for office for a year.`, S.home);
      } else {
        P.fame = Math.max(0, P.fame - 5); P.pop = Math.max(0, P.pop - 5); P.flaggedUntil = S.day + 365;
        if (typeof news === 'function') news('Person', `Caught taking inside info — arrested and fined ${fmtMoney(fine, true)}. You cannot run for office for a year.`, S.home);
      }
    }
  });
}

// ---------- elections: fame + popularity + public opinion ----------
function runOffice(officeId) {
  const P = ensurePerson();
  const o = officeList().find(x => x.id === officeId);
  if (!o) return 'Office not found.';
  if (P.flaggedUntil > S.day) return `Your record is flagged for ${Math.ceil((P.flaggedUntil - S.day) / 365)} more year(s). You cannot run yet.`;
  if (P.runCooldownUntil > S.day && !(P.office && P.office.id === officeId)) return `You can run again in ${Math.ceil((P.runCooldownUntil - S.day) / 365)} year(s).`;
  const missing = [];
  if (P.fame < o.req.fame) missing.push(`${o.req.fame} fame`);
  if (P.pop < o.req.pop) missing.push(`${o.req.pop} popularity`);
  if (P.opin < o.req.opin) missing.push(`${o.req.opin} public opinion`);
  if (missing.length) return `To run for ${o.title} you need ${missing.join(', ')}.`;
  // College gate: you start young and unknown, so politics needs a
  // degree — Associate for mayor, Bachelor for governor/congress,
  // Master for head of state.
  const degReq = (typeof officeDegreeReq === 'function') ? officeDegreeReq(officeId) : null;
  if (degReq && !(P.degrees || []).includes(degReq)) {
    const degName = (typeof COLLEGE_DEGREES !== 'undefined' ? COLLEGE_DEGREES.find(x => x.id === degReq) : null) || { name: degReq };
    return `To run for ${o.title} you need ${degReq === 'assoc' ? 'an' : 'a'} ${degName.name} — go to college first.`;
  }
  const yourScore = 0.25 * P.fame + 0.40 * P.pop + 0.35 * P.opin;
  const opp = o.base - 5 + Math.random() * 20;
  const chaos = (Math.random() - 0.5) * 16;
  const yours = yourScore + chaos;
  const share = Math.round(100 * yours / Math.max(1, yours + opp));
  P.ranOnce = true;
  if (yours > opp) {
    const office = { id: o.id, title: o.title, scope: o.scope, salary: o.salary, termEnd: S.day + o.termDays, treasury: 0 };
    if (o.scope !== 'nation') office.treasury = officeTreasuryStart(o);
    P.office = office;
    P.runCooldownUntil = 0;
    if (typeof news === 'function') news('Person', `You won the election for ${o.title} with ${share}% of the vote!`, S.home);
    return null;
  }
  P.pop = Math.max(0, P.pop - 5); P.opin = Math.max(0, P.opin - 5);
  P.runCooldownUntil = S.day + 365;
  if (typeof news === 'function') news('Person', `You lost the race for ${o.title} with ${share}% of the vote.`, S.home);
  return `You lost with ${share}% of the vote. Popularity and public opinion each fell 5.`;
}
function campaignAction(kind) {
  const P = ensurePerson();
  const m = cabHas('strategist') ? 1.25 : 1;
  if (kind === 'rally') {
    if (P.cash < 25000) return 'A rally costs $25,000 of your personal money.';
    P.cash -= 25000;
    P.vis = Math.min(100, P.vis + Math.round(2 * m)); P.fame = Math.min(100, P.fame + Math.round(1 * m)); P.opin = Math.min(100, P.opin + Math.round(1 * m));
  } else if (kind === 'ads') {
    if (P.cash < 100000) return 'Campaign ads cost $100,000 of your personal money.';
    P.cash -= 100000;
    P.opin = Math.min(100, P.opin + Math.round(3 * m)); P.pop = Math.min(100, P.pop + Math.round(2 * m));
  } else if (kind === 'donate') {
    if (P.cash < 50000) return 'A donation costs $50,000 of your personal money.';
    P.cash -= 50000;
    P.pop = Math.min(100, P.pop + 3);
  } else return 'Unknown campaign action.';
  return null;
}
function announcePolicy() {
  const P = ensurePerson();
  if (!P.office) return 'You hold no office.';
  const cost = Math.max(1000000, Math.round(officeTreasury(P.office) * 0.01));
  if (officeTreasury(P.office) < cost) return `A policy announcement costs ${fmtMoney(cost, true)} from your office budget.`;
  officeAddTreasury(P.office, -cost);
  P.opin = Math.min(100, P.opin + 2); P.pop = Math.min(100, P.pop + 1);
  return null;
}
function transferToBusiness(amount) {
  const P = ensurePerson();
  const amt = amount === 'all' ? P.cash : Math.min(P.cash, +amount);
  if (amt <= 0) return 'No personal money to invest.';
  P.cash -= amt; S.cash += amt; S.invested = true; return null;
}
function transferToPersonal(amount) {
  const P = ensurePerson();
  const amt = amount === 'all' ? S.cash : Math.min(S.cash, +amount);
  if (amt <= 0) return 'No business money to pay yourself.';
  S.cash -= amt; P.cash += amt; return null;
}

// ---------- weekly ----------
function personWeek() {
  const P = ensurePerson();
  const salary = P.office ? P.office.salary : jobSalary(P.job);
  P.cash += salary;
  if (salary > 0 && typeof bankFeedPush === 'function') bankFeedPush({ d: S.day, text: '+ salary', amt: Math.round(salary) });
  P.job.weeks++;
  // College: weeks tick down, degree lands when they run out.
  if (P.college) {
    P.college.weeksLeft--;
    if (P.college.weeksLeft <= 0) {
      if (!Array.isArray(P.degrees)) P.degrees = [];
      P.degrees.push(P.college.id);
      if (typeof news === 'function') news('Person', `You earned your ${P.college.name}.`, S.home);
      P.college = null;
    }
  }
  // Company career firing: if the company you work for has lost more
  // than half its value since you were hired, you are fired. This is
  // the proxy until analyst decision-making lands — then your own
  // decisions will be what loses (or makes) the money.
  if (P.job && P.job.track === 'company') {
    const c = companyForJob(P.job);
    if (!c) {
      P.job = { track: 'civilian', rank: 0, weeks: 0 };
      if (typeof news === 'function') news('Person', 'Your company job ended — that company is gone.', S.home);
    } else if (P.job.startValue && companyValueForJob(P.job) < P.job.startValue * 0.5) {
      const name = c.name;
      P.job = { track: 'civilian', rank: 0, weeks: 0 };
      if (typeof news === 'function') news('Person', `You were fired from ${name} after the company lost more than half its value.`, S.home);
    }
  }
  if (P.office) {
    const o = P.office;
    let income = Math.round(officeScopeGdp(o) * 0.00002);
    if (o.incomeBoostUntil > S.day) income *= 2;
    if (o.taxCutUntil > S.day) income = Math.round(income * 0.5);
    if (o.schoolCutUntil > S.day) income = Math.round(income * 0.75);
    officeAddTreasury(o, income);
    P.fame = Math.min(100, P.fame + 0.1);
    if (S.day >= o.termEnd) {
      const title = o.title; P.office = null;
      if (typeof news === 'function') news('Person', `Your term as ${title} ended.`, S.home);
    }
  }
  // Home capital institutions: police + fire keep the country steady,
  // and living in the leader's house while head of state lifts popularity.
  const cs = (typeof country === 'function') ? country(S.home) : null;
  if (cs) cs.stab = Math.max(0, Math.min(100, (cs.stab || 50) + 0.2));
  if (P.office && P.office.id === 'head') P.pop = Math.min(100, P.pop + 0.3);
  P.cabinet.forEach(ad => {
    if (ad.type === 'family') P.pop = Math.min(100, P.pop + 0.3);
    else if (ad.type === 'friend') P.fame = Math.min(100, P.fame + 0.3);
    else if (ad.type === 'financial') P.cash += Math.round(100 * ((ad.rating || 50) / 25));
    else if (ad.type === 'business') P.vis = Math.min(100, P.vis + 0.3);
    else if (ad.type === 'strategist') P.opin = Math.min(100, P.opin + 0.5);
    else if (ad.type === 'general') P.fame = Math.min(100, P.fame + 0.3);
    else if (ad.type === 'leader') P.opin = Math.min(100, P.opin + 1);
    if (ad.star && ad.rating < (ad.starCap || 98) && Math.random() < 0.5) ad.rating++;
  });
  resolveTips(P);
  if (S.week && S.week.profit > 0) P.fame = Math.min(100, P.fame + 0.2);
  P.vis = clampMeter(P.vis); P.fame = clampMeter(P.fame); P.pop = clampMeter(P.pop); P.opin = clampMeter(P.opin);
}
