// Elections: every jurisdiction votes on its own calendar.
// No global election day: each country's national, regional,
// legislature and city races run on cycles whose offsets are seeded
// from the jurisdiction itself, so dates differ by country AND by
// level (a nation's presidential race, its governor race and its
// mayors never share a day by default). Results are seeded per race
// (like the Tawk slate), so they are stable all season and change
// next cycle. Fictional candidates only — never real politicians.
// A race's voting season is the 28 days before election day, so a
// player advancing a week at a time can always reach it.
'use strict';

function electionCycle(scope) { return scope === 'legislature' ? 730 : 1460; }
function electionOffset(jurKey, scope) {
  const h = (typeof corpHash === 'function') ? corpHash(jurKey + ':' + scope) : 0;
  return h % electionCycle(scope);
}
// Election days for a jurisdiction: ...prev, next... around `day`.
// Day 0 is Jan 1, 2026; election days are offset + k * cycle.
function electionDays(jurKey, scope, day) {
  const cyc = electionCycle(scope), off = electionOffset(jurKey, scope);
  const k = Math.floor((day - off) / cyc);
  const prev = off + k * cyc;
  return { prev, next: prev + cyc };
}
// The race that matters right now: the open season of the next
// election, or the last finished race plus the next date.
function electionRace(jurKey, scope, day) {
  const d = electionDays(jurKey, scope, day), seasonStart = d.next - 28;
  if (day >= seasonStart) return { day: d.next, status: 'open', pctIn: Math.min(0.99, (day - seasonStart) / 28), next: d.next };
  return { day: d.prev, status: 'final', pctIn: 1, next: d.next };
}
function electionCandidates(jurKey, scope, electDay) {
  const rnd = (typeof corpRand === 'function' && typeof corpHash === 'function') ? corpRand(corpHash('race:' + jurKey + ':' + scope + ':' + electDay)) : Math.random;
  const first = (typeof FIRST_NAMES !== 'undefined') ? FIRST_NAMES : ['Alex', 'Sam', 'Jordan'];
  const last = (typeof LAST_NAMES !== 'undefined') ? LAST_NAMES : ['Smith', 'Jones', 'Brown'];
  const used = new Set(), names = [];
  while (names.length < 3) {
    const n = first[Math.floor(rnd() * first.length)] + ' ' + last[Math.floor(rnd() * last.length)];
    if (!used.has(n)) { used.add(n); names.push(n); }
  }
  const w = names.map(() => 0.25 + rnd() * 0.5), tot = w.reduce((a, b) => a + b, 0);
  const shares = w.map(x => Math.round(x / tot * 970) / 10);
  const other = Math.max(0.5, Math.round((100 - shares.reduce((a, b) => a + b, 0)) * 10) / 10);
  const cands = names.map((name, i) => ({ name, share: shares[i] }));
  return { cands, other, winner: cands.reduce((a, b) => b.share > a.share ? b : a) };
}
function electionVoteKey(jurKey, scope, electDay) { return jurKey + '|' + scope + '|' + electDay; }
function electionVotes() { if (!S.votes) S.votes = {}; return S.votes; }
// Office the player would hold for a scope, to show incumbency.
function electionOfficeId(scope) {
  return scope === 'nation' ? 'head' : scope === 'region' ? 'governor' : scope === 'legislature' ? 'congress' : 'mayor';
}
function electionScopeTitle(a3, scope, cityName) {
  if (scope === 'city') return cityName ? `Mayor of ${cityName}` : 'Mayor';
  if (scope === 'region') return 'Governor';
  if (scope === 'legislature') return (typeof isMonarchy === 'function' && isMonarchy(a3)) ? 'Parliament' : 'Congress';
  return (typeof isMonarchy === 'function' && isMonarchy(a3)) ? 'Head of state' : 'President';
}
// One race card: candidates + shares + % in + VOTE buttons while the
// season is open. `jurKey` is an a3 for national/regional/legislature
// races, or `a3:cityId` for a mayoral race.
function electRaceCardHTML(jurKey, a3, scope, label) {
  const day = S.day, race = electionRace(jurKey, scope, day);
  const P = (typeof ensurePerson === 'function') ? ensurePerson() : null;
  const isHome = a3 === S.home;
  const incumbent = isHome && P && P.office && P.office.id === electionOfficeId(scope) && P.office.termEnd > day;
  let head = `<b>${esc(label)}</b><span style="color:#8b949e;font-size:13px">${race.status === 'open' ? `🗳️ Voting open — closes ${fmtDate(race.day)} · ${Math.round(race.pctIn * 100)}% in` : `Next election ${fmtDate(race.next)}`}</span>`;
  if (incumbent) return `<div class="elect-card"><div class="row between">${head}</div><p style="color:#8b949e">You hold this office until ${fmtDate(P.office.termEnd)}. Re-election runs through the Offices list below.</p></div>`;
  const res = electionCandidates(jurKey, scope, race.day);
  const voted = electionVotes()[electionVoteKey(jurKey, scope, race.day)];
  const rows = res.cands.map((c, i) => {
    const win = race.status === 'final' && res.winner.name === c.name;
    const isVoted = voted === i;
    const btn = race.status === 'open'
      ? (voted != null ? (isVoted ? '<span style="color:#3fb950;font-weight:800">✓ Voted</span>' : '') : `<button class="elect-vote" data-a="electVote" data-x="${jurKey}|${scope}|${race.day}|${i}">VOTE</button>`)
      : (win ? '<span style="font-weight:800">✓</span>' : '');
    return `<div class="elect-row"><span><span class="elect-dot" style="background:${['#2f7cf6', '#e5484d', '#12a150'][i]}"></span>${esc(c.name)}${isVoted ? ' (you)' : ''}</span><span>${c.share.toFixed(1)}% ${btn}</span></div>`;
  }).join('');
  return `<div class="elect-card"><div class="row between">${head}</div>${rows}<div class="elect-row"><span>Other</span><span>${res.other.toFixed(1)}%</span></div><div style="color:#8b949e;font-size:13px">${race.status === 'final' ? `100% in · Winner: ${esc(res.winner.name)}` : `${Math.round(race.pctIn * 100)}% in · Leading: ${esc(res.cands.reduce((a, b) => b.share > a.share ? b : a).name)}`}</div></div>`;
}
