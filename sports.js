// Sports leagues as businesses — original teams, players and leagues only.
// No real team names, logos or artwork. Teams are businesses: they earn
// tickets, broadcasting and sponsor money, pay players and admin costs,
// and keep the rest as net income. A team has NO stock at first. Only when
// the owner chooses an IPO does it get public shares, traded in its own
// Finance tab (not the world market).
'use strict';

const SPORT_LEAGUES = [
  { id: 'base', name: 'World Baseball League', short: 'Baseball', icon: '⚾',
    positions: ['SP', 'RP', 'CP', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'] },
  { id: 'basket', name: 'World Basketball League', short: 'Basketball', icon: '🏀',
    positions: ['PG', 'SG', 'SF', 'PF', 'C'] },
];
const SPORT_MASCOTS = ['Wolves', 'Falcons', 'Sharks', 'Eagles', 'Lions', 'Bears', 'Hawks', 'Tigers', 'Panthers', 'Storm', 'Comets', 'Rangers', 'Vipers', 'Ospreys', 'Cyclones', 'Mustangs', 'Otters', 'Foxes', 'Bisons', 'Jaguars'];
const SPORT_COLORS = ['#2f7cf6', '#e5484d', '#12a150', '#7c4dff', '#e0812b', '#0ea5b7', '#d63384', '#1f5fd0', '#8a5a2b', '#334155'];
const SPORT_LOGOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'M', 'R', 'S', 'T', 'W', '★', '◆'];
const FIRST_NAMES = ['James', 'Marcus', 'Liam', 'Noah', 'Ethan', 'Lucas', 'Owen', 'Caleb', 'Diego', 'Kenji', 'Felix', 'Hugo', 'Mateo', 'Andre', 'Tomas', 'Ravi', 'Yusuf', 'Leo', 'Max', 'Eli', 'Jonas', 'Victor', 'Sam', 'Dario', 'Nico', 'Rene', 'Omar', 'Ivan', 'Piotr', 'Anders'];
const LAST_NAMES = ['Harris', 'Ramirez', 'Jackson', 'Diaz', 'Chen', 'Martinez', 'Anderson', 'Hernandez', 'Kim', 'Patel', 'Garcia', 'Smith', 'Lopez', 'Tanaka', 'Novak', 'Silva', 'Costa', 'Weber', 'Larsen', 'Moreau', 'Ali', 'Khan', 'Fischer', 'Rossi', 'Dubois', 'Santos', 'Okafor', 'Lindqvist', 'Petrov', 'Nagy'];

function sportPlayerName(used) {
  let n;
  do { n = pick(FIRST_NAMES) + ' ' + pick(LAST_NAMES); } while (used && used.has(n));
  if (used) used.add(n);
  return n;
}
function sportSalary(rating) {
  // Annual salary in dollars. A 55-rated role player is ~$500k, a 90+ star ~$9M.
  return Math.round((200000 + Math.max(0, rating - 50) * 175000 + Math.max(0, rating - 80) * 150000) / 10000) * 10000;
}
function makeSportPlayer(league, used, ageMin, ageMax, ratingMin, ratingMax) {
  const rating = clamp(Math.round(ratingMin + rand() * (ratingMax - ratingMin)), 40, 99);
  const age = ageMin + Math.floor(rand() * (ageMax - ageMin + 1));
  const pos = pick(league.positions);
  const p = { id: uid(), name: sportPlayerName(used), age, pos, rating,
    stars: Math.round(rating / 20 * 2) / 2, salary: sportSalary(rating),
    yrs: 1 + Math.floor(rand() * 5), stats: {} };
  return p;
}
function teamStrength(t) {
  if (!t.players.length) return 50;
  const rs = t.players.map(p => p.rating).sort((a, b) => b - a).slice(0, 9);
  return rs.reduce((a, b) => a + b, 0) / rs.length;
}
function teamAvgStars(t) {
  if (!t.players.length) return 0;
  return t.players.reduce((a, p) => a + p.stars, 0) / t.players.length;
}
function sportTeamCities() {
  // Home capital first, then the biggest other capitals, so every game
  // has a stadium in the player's own capital and in famous cities.
  const caps = W.playable.map(k => W.cities[k.capital]).filter(Boolean);
  caps.sort((a, b) => b.pop - a.pop);
  const homeCap = W.cities[W.byA3[S.home].capital];
  const out = homeCap ? [homeCap] : [];
  for (const c of caps) if (out.length < 10 && !out.includes(c)) out.push(c);
  return out;
}
function makeSportTeam(league, city, mascot, color, usedNames) {
  const cityName = city.name;
  const name = cityName + ' ' + mascot;
  const cap = clamp(Math.round(18000 + Math.sqrt(city.pop) * 12), 20000, 55000);
  const team = { id: league.id + '-' + city.id, league: league.id, cityId: city.id, a3: city.a3,
    name, mascot, color, logo: mascot[0], cityName,
    stadium: { name: cityName + ' Park', capacity: cap, level: 1 },
    owner: 'AI', value: 0, wins: 0, losses: 0, history: [], champions: 0,
    players: [], finance: null, finHist: [], ipo: null, lastNet: 0, profitStreak: 0 };
  for (let i = 0; i < 12; i++) team.players.push(makeSportPlayer(league, usedNames, 20, 34, 58, 88));
  team.value = 120000000 + Math.round(rand() * 200000000);
  return team;
}
function ensureSports() {
  if (!S) return null;
  if (!S.sports) {
    const used = new Set();
    const leagues = SPORT_LEAGUES.map(l => {
      const cities = sportTeamCities();
      const teams = cities.map((c, i) => makeSportTeam(l, c, SPORT_MASCOTS[(i * 3) % SPORT_MASCOTS.length], SPORT_COLORS[i % SPORT_COLORS.length], used));
      return { id: l.id, name: l.name, short: l.short, icon: l.icon, teams,
        freeAgents: [], draftClass: [], seasonYear: yearOf(S.day), champion: null };
    });
    leagues.forEach(lg => {
      const lgDef = SPORT_LEAGUES.find(x => x.id === lg.id);
      for (let i = 0; i < 24; i++) lg.freeAgents.push(makeSportPlayer(lgDef, used, 21, 36, 55, 90));
    });
    S.sports = { leagues, tab: 'base', teamId: null, draftYear: yearOf(S.day) };
  }
  if (!S.sports.leagues) S.sports.leagues = [];
  S.sports.leagues.forEach(lg => {
    if (!lg.freeAgents) lg.freeAgents = [];
    if (!lg.draftClass) lg.draftClass = [];
    lg.teams.forEach(t => {
      if (!t.finHist) t.finHist = [];
      if (!t.history) t.history = [];
      if (t.value == null || !isFinite(t.value)) t.value = 150000000;
      t.players.forEach(p => { if (!p.stats) p.stats = {}; if (!isFinite(p.salary)) p.salary = sportSalary(p.rating || 60); });
    });
  });
  return S.sports;
}
function sportLeague(id) { ensureSports(); return S.sports.leagues.find(l => l.id === id); }
function sportTeam(id) { ensureSports(); for (const lg of S.sports.leagues) { const t = lg.teams.find(x => x.id === id); if (t) return t; } return null; }
function teamForCity(cityId) { ensureSports(); for (const lg of S.sports.leagues) { const t = lg.teams.find(x => x.cityId === cityId); if (t) return t; } return null; }
function ownedSportTeams() { ensureSports(); const out = []; S.sports.leagues.forEach(lg => lg.teams.forEach(t => { if (t.owner === 'you') out.push(t); })); return out; }

function sportSeasonStats(leagueId, p, games) {
  if (leagueId === 'base') {
    if (['SP', 'RP', 'CP'].includes(p.pos)) {
      const era = clamp(5.6 - p.rating * 0.035 + gauss() * 0.4, 1.2, 6.5);
      return { W: Math.round(games * 0.08 + p.rating * 0.08), L: Math.round(games * 0.05), SV: p.pos === 'CP' ? Math.round(10 + p.rating * 0.3) : 0, SO: Math.round(games * 0.8 + p.rating * 0.5), ERA: +era.toFixed(2) };
    }
    const avg = clamp(0.210 + p.rating * 0.0011 + gauss() * 0.015, 0.180, 0.360);
    return { AVG: +avg.toFixed(3), HR: Math.max(0, Math.round((p.rating - 55) * 0.7 + gauss() * 5)), RBI: Math.max(0, Math.round((p.rating - 50) * 1.2 + gauss() * 10)), SB: Math.max(0, Math.round(rand() * 20)) };
  }
  return { PTS: +(Math.max(2, (p.rating - 40) * 0.38 + gauss() * 2)).toFixed(1), REB: +(Math.max(1, (p.rating - 45) * 0.12 + gauss())).toFixed(1), AST: +(Math.max(0.5, (p.rating - 50) * 0.10 + gauss())).toFixed(1) };
}
function sportGameWinProb(a, b, home) {
  const d = teamStrength(a) - teamStrength(b) + (home ? 3 : 0);
  return clamp(1 / (1 + Math.exp(-d / 8)), 0.05, 0.95);
}
function sportPlaySeries(a, b, need) {
  let wa = 0, wb = 0;
  while (wa < need && wb < need) { if (rand() < sportGameWinProb(a, b, wa + wb === 0)) wa++; else wb++; }
  return wa > wb ? a : b;
}
function sportFinance(team) {
  const lgTeams = sportLeague(team.league).teams;
  const games = (lgTeams.length - 1) * 2, homeGames = games / 2;
  const winPct = (team.wins + team.losses) ? team.wins / (team.wins + team.losses) : 0.5;
  const city = W.cities[team.cityId], popM = city ? city.pop / 1e6 : 10;
  const market = clamp(0.6 + popM / 20, 0.6, 2.2);
  const attendance = Math.round(team.stadium.capacity * clamp(0.35 + winPct * 0.45 + teamAvgStars(team) * 0.03, 0.3, 0.98));
  const ticketPrice = Math.round(28 * market);
  const tickets = attendance * homeGames * ticketPrice;
  const concessions = Math.round(tickets * 0.35);
  const broadcast = Math.round((18000000 + Math.min(60000000, popM * 900000)) * market / 1.4);
  const sponsors = Math.round(9000000 + winPct * 22000000 + teamAvgStars(team) * 2500000);
  const revenue = tickets + concessions + broadcast + sponsors;
  const payroll = team.players.reduce((a, p) => a + p.salary, 0);
  const admin = 12000000 + team.stadium.level * 1500000;
  const net = revenue - payroll - admin;
  return { revenue, tickets, concessions, broadcast, sponsors, payroll, admin, net, attendance, winPct, games };
}
function sportSeason() {
  // One full season per league, run at year end. Settles owned teams
  // into the player's cash: net income in, payroll already inside net.
  if (!S || !S.sports) return;
  const year = yearOf(S.day);
  S.sports.leagues.forEach(lg => {
    const lgDef = SPORT_LEAGUES.find(x => x.id === lg.id);
    lg.teams.forEach(t => { t.wins = 0; t.losses = 0; });
    for (let i = 0; i < lg.teams.length; i++) for (let j = i + 1; j < lg.teams.length; j++) {
      const a = lg.teams[i], b = lg.teams[j];
      for (let g = 0; g < 2; g++) {
        const home = g === 0 ? a : b, away = g === 0 ? b : a;
        if (rand() < sportGameWinProb(home, away, true)) { home.wins++; away.losses++; } else { away.wins++; home.losses++; }
      }
    }
    lg.teams.forEach(t => {
      t.players.forEach(p => { p.stats = sportSeasonStats(lg.id, p, 20); });
      const fin = sportFinance(t);
      t.finance = fin; t.lastNet = fin.net;
      t.finHist.unshift({ year, revenue: fin.revenue, payroll: fin.payroll, admin: fin.admin, net: fin.net, wins: t.wins, losses: t.losses });
      if (t.finHist.length > 5) t.finHist.length = 5;
      t.profitStreak = fin.net > 0 ? (t.profitStreak || 0) + 1 : 0;
      t.value = Math.max(50000000, Math.round(fin.net * 10 + t.stadium.capacity * 8000 + t.champions * 40000000 + 60000000));
      const place = [...lg.teams].sort((a, b) => b.wins - a.wins).findIndex(x => x.id === t.id) + 1;
      t.history.unshift({ year, place, wins: t.wins, losses: t.losses, champion: false });
      if (t.history.length > 6) t.history.length = 6;
      if (t.owner === 'you' && fin.net !== 0) S.cash += fin.net;
    });
    const sorted = [...lg.teams].sort((a, b) => b.wins - a.wins);
    const semi1 = sportPlaySeries(sorted[0], sorted[3], 2), semi2 = sportPlaySeries(sorted[1], sorted[2], 2);
    const champ = sportPlaySeries(semi1, semi2, 2);
    champ.champions++; champ.value = Math.round(champ.value * 1.15);
    if (champ.history[0]) champ.history[0].champion = true;
    lg.champion = champ.id; lg.seasonYear = year;
    // Age players, retire old ones, refill AI rosters from the draft class.
    const used = new Set();
    lg.teams.forEach(t => t.players.forEach(p => used.add(p.name)));
    lg.draftClass = [];
    for (let i = 0; i < 24; i++) lg.draftClass.push(makeSportPlayer(lgDef, used, 19, 22, 58, 86));
    lg.teams.forEach(t => {
      t.players = t.players.filter(p => {
        p.age++; p.yrs = Math.max(0, p.yrs - 1);
        if (p.age < 26) p.rating = clamp(p.rating + Math.floor(rand() * 3), 40, 99);
        else if (p.age > 32) p.rating = clamp(p.rating - (1 + Math.floor(rand() * 3)), 40, 99);
        else p.rating = clamp(p.rating + (rand() < 0.5 ? -1 : 1), 40, 99);
        p.stars = Math.round(p.rating / 20 * 2) / 2; p.salary = sportSalary(p.rating);
        return p.age < 40 && p.rating >= 42;
      });
    });
    // Draft: worst team picks first, AI teams take the best available.
    const order = [...lg.teams].sort((a, b) => a.wins - b.wins);
    for (const t of order) {
      while (t.players.length < 12 && lg.draftClass.length) {
        const best = lg.draftClass.reduce((a, b) => b.rating > a.rating ? b : a);
        lg.draftClass = lg.draftClass.filter(p => p.id !== best.id);
        best.salary = sportSalary(best.rating); best.yrs = 4; t.players.push(best);
      }
    }
    if (ownedSportTeams().length) {
      const mine = ownedSportTeams().filter(t => t.league === lg.id);
      if (mine.length) news('Sports', `${lg.name} ${year}: ${mine.map(t => `${t.name} ${t.wins}-${t.losses}, net ${fmtMoney(t.lastNet, true)}`).join('; ')}. ${champ.name} won the championship.`, mine[0].a3);
    }
  });
  S.sports.draftYear = year;
}
function buySportTeam(id) {
  const t = sportTeam(id); if (!t) return 'Team not found.';
  if (t.owner === 'you') return 'You already own this team.';
  if (S.cash < t.value) return `Costs ${fmtMoney(t.value, true)}. You have ${fmtMoney(S.cash, true)}.`;
  S.cash -= t.value; t.owner = 'you';
  news('Sports', `You bought ${t.name} for ${fmtMoney(t.value, true)}.`, t.a3);
  return null;
}
function renameSportTeam(id, name) {
  const t = sportTeam(id); if (!t || t.owner !== 'you') return 'Only your own team can be renamed.';
  const n = (name || '').trim(); if (!n) return 'Enter a team name.';
  t.name = n; return null;
}
function setSportLogo(id, logo, color) {
  const t = sportTeam(id); if (!t || t.owner !== 'you') return 'Only your own team.';
  if (logo) t.logo = logo; if (color) t.color = color; return null;
}
function signFreeAgent(teamId, playerId) {
  const t = sportTeam(teamId); if (!t || t.owner !== 'you') return 'Only your own team can sign players.';
  const lg = sportLeague(t.league), p = lg.freeAgents.find(x => x.id === playerId);
  if (!p) return 'That player is no longer available.';
  if (t.players.length >= 16) return 'Roster is full (16). Trade or release a player first.';
  const bonus = Math.round(p.salary * p.yrs * 0.10);
  if (S.cash < bonus) return `Signing bonus ${fmtMoney(bonus, true)} needed.`;
  S.cash -= bonus; lg.freeAgents = lg.freeAgents.filter(x => x.id !== playerId);
  t.players.push(p); return null;
}
function draftSportPlayer(teamId, playerId) {
  const t = sportTeam(teamId); if (!t || t.owner !== 'you') return 'Only your own team drafts.';
  const lg = sportLeague(t.league), p = lg.draftClass.find(x => x.id === playerId);
  if (!p) return 'That player is no longer in the draft class.';
  if (t.players.length >= 16) return 'Roster is full (16).';
  lg.draftClass = lg.draftClass.filter(x => x.id !== playerId);
  p.salary = sportSalary(p.rating); p.yrs = 4; t.players.push(p); return null;
}
function tradeSportPlayer(teamId, outId, targetId, inId, cashOffer) {
  const t = sportTeam(teamId), target = sportTeam(targetId);
  if (!t || !target || t.owner !== 'you') return 'Only your own team trades.';
  const out = t.players.find(p => p.id === outId), inn = target.players.find(p => p.id === inId);
  if (!out || !inn) return 'Player not found.';
  const gap = inn.rating - out.rating, sweet = cashOffer || 0;
  if (sweet > S.cash) return 'You do not have that cash to offer.';
  if (gap > 2 && sweet < gap * 500000) return `They want at least ${fmtMoney(gap * 500000, true)} cash on top for that gap.`;
  S.cash -= sweet; if (sweet) { /* cash goes to the other club, not to the player */ }
  t.players = t.players.filter(p => p.id !== outId); t.players.push(inn);
  target.players = target.players.filter(p => p.id !== inId); target.players.push(out);
  return null;
}
function upgradeStadium(teamId) {
  const t = sportTeam(teamId); if (!t || t.owner !== 'you') return 'Only your own team.';
  const cost = 40000000 * t.stadium.level;
  if (S.cash < cost) return `Stadium upgrade costs ${fmtMoney(cost, true)}.`;
  S.cash -= cost; t.stadium.level++; t.stadium.capacity = Math.round(t.stadium.capacity * 1.15);
  return null;
}
function sportIpoEligible(t) {
  return t.owner === 'you' && !t.ipo && t.value >= 200000000 && (t.profitStreak || 0) >= 2;
}
function sportIpo(teamId) {
  const t = sportTeam(teamId); if (!t) return 'Team not found.';
  if (!sportIpoEligible(t)) return 'Not IPO-ready yet: you must own it, it must be worth $200M+, and it needs 2 profitable seasons in a row.';
  const totalShares = 1000000, price = Math.max(1, Math.round(t.value / totalShares));
  const proceeds = Math.round(totalShares * 0.30 * price);
  S.cash += proceeds;
  t.ipo = { totalShares, price, publicShares: Math.round(totalShares * 0.30), yourShares: Math.round(totalShares * 0.70) };
  news('Sports', `${t.name} went public at ${fmtMoney(price)} a share. You sold 30% for ${fmtMoney(proceeds, true)} and kept 70%.`, t.a3);
  return null;
}
function sportTradeShares(teamId, side, qty) {
  const t = sportTeam(teamId); if (!t || !t.ipo) return 'This team is not public yet.';
  qty = Math.floor(qty); if (!qty || qty <= 0) return 'Enter a share count.';
  const price = Math.max(1, Math.round(t.value / t.ipo.totalShares));
  t.ipo.price = price;
  if (side === 'buy') {
    const cost = qty * price;
    if (S.cash < cost) return `Costs ${fmtMoney(cost, true)}.`;
    if (qty > t.ipo.publicShares) return 'Not that many public shares available.';
    S.cash -= cost; t.ipo.publicShares -= qty; t.ipo.yourShares += qty;
  } else {
    if (qty > t.ipo.yourShares) return 'You do not own that many shares.';
    S.cash += qty * price; t.ipo.yourShares -= qty; t.ipo.publicShares += qty;
  }
  return null;
}
