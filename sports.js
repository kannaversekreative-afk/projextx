// Sports leagues as businesses — original teams, players and leagues only.
// No real team names, logos or artwork. Teams are businesses: they earn
// tickets, broadcasting and sponsor money, pay players and admin costs,
// and keep the rest as net income. A team has NO stock at first. Only when
// the owner chooses an IPO does it get public shares, traded in its own
// Finance tab (not the world market).
'use strict';

const SPORT_LEAGUES = [
  { id: 'foot', name: 'World Football League', short: 'Football', icon: '🏈',
    positions: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K'] },
  { id: 'base', name: 'World Baseball League', short: 'Baseball', icon: '⚾',
    positions: ['SP', 'RP', 'CP', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'] },
  { id: 'basket', name: 'World Basketball League', short: 'Basketball', icon: '🏀',
    positions: ['PG', 'SG', 'SF', 'PF', 'C'] },
];
// Country clubs for the football + baseball leagues: 6 teams, country + mascot
// (Japan Fighters / USA Eagles style). Same clubs in both leagues, so a club
// is recognisable in either sport. Basketball keeps the old city teams.
// The 6th club is USA (the example given); swap it for Japan in one word if
// wanted. New games only for the new leagues; see ensureSports migration.
const COUNTRY_CLUBS = [
  { a3: 'ZAF', country: 'South Africa', mascot: 'Lions', abbr: 'ZAF', c1: '#007A4D', c2: '#FFB612' },
  { a3: 'EGY', country: 'Egypt', mascot: 'Pharaohs', abbr: 'EGY', c1: '#CE1126', c2: '#C09300' },
  { a3: 'IND', country: 'India', mascot: 'Tigers', abbr: 'IND', c1: '#FF9933', c2: '#000080' },
  { a3: 'SGP', country: 'Singapore', mascot: 'Merlions', abbr: 'SGP', c1: '#ED2939', c2: '#FFFFFF' },
  { a3: 'TUR', country: 'Turkey', mascot: 'Stars', abbr: 'TUR', c1: '#E30A17', c2: '#FFFFFF' },
  { a3: 'USA', country: 'USA', mascot: 'Eagles', abbr: 'USA', c1: '#0A3161', c2: '#FFFFFF' },
];
// Shared team identities with the Mini Games (baseball minigame uses the same
// 30 names, abbreviations, colours and shield logos). The two games are NOT
// connected: no shared saves or state, just the same teams to recognise.
// Worl teams keep their real city for stadium/mechanics; the team NAME is the
// shared mascot-only name, like pro football nicknames. New games only: old
// saves keep the city + mascot names they were created with.
const SHARED_SPORT_TEAMS = [
  ['Admirals','ADM','#1d4f91','#f2c14e'],['Barons','BAR','#9b1c2e','#f4f1ea'],
  ['Bluejays','BLJ','#0f6b4f','#e8b33a'],['Bombers','BOM','#2b2d42','#ef5b5b'],
  ['Captains','CAP','#5b2a86','#f2a541'],['Clippers','CLI','#00627a','#ff8c42'],
  ['Copperheads','COP','#7a1f1f','#c9a227'],['Dukes','DUK','#14213d','#fca311'],
  ['Express','EXP','#2d6a4f','#d8f3dc'],['Foxhounds','FOX','#3a0ca3','#4cc9f0'],
  ['Gulls','GUL','#b5179e','#f7f7f7'],['Herons','HER','#264653','#e9c46a'],
  ['Ironmen','IRN','#c1121f','#003049'],['Jackalopes','JCK','#023e8a','#90e0ef'],
  ['Knights','KNI','#6a040f','#ffba08'],['Larks','LAR','#1b4332','#95d5b2'],
  ['Lumberjacks','LUM','#3d405b','#f2cc8f'],['Mallards','MAL','#0b6e4f','#f0a202'],
  ['Mariners','MAR','#283618','#dda15e'],['Miners','MIN','#9d0208','#e5e5e5'],
  ['Monarchs','MON','#073b4c','#06d6a0'],['Mudcats','MUD','#5f0f40','#fb8b24'],
  ['Nighthawks','NHK','#22223b','#c9ada7'],['Owls','OWL','#1a759f','#d9ed92'],
  ['Pelicans','PEL','#7b2cbf','#e0aaff'],['Pilots','PIL','#d62828','#fcbf49'],
  ['Pioneers','PIO','#003566','#ffc300'],['Quakes','QUA','#8338ec','#ffbe0b'],
  ['Rattlers','RAT','#0a9396','#ee9b00'],['Redbirds','RDB','#370617','#f48c06'],
];
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
function makeCountryTeam(league, city, club, usedNames) {
  const cityName = city.name;
  const name = club.country + ' ' + club.mascot;
  const cap = clamp(Math.round(18000 + Math.sqrt(city.pop) * 12), 20000, 55000);
  const team = { id: league.id + '-' + city.id, league: league.id, cityId: city.id, a3: city.a3,
    name, mascot: club.mascot, color: club.c1, c1: club.c1, c2: club.c2, abbr: club.abbr, logo: club.abbr, cityName, country: club.a3,
    stadium: { name: cityName + ' Park', capacity: cap, level: 1 },
    owner: 'AI', value: 0, wins: 0, losses: 0, history: [], champions: 0,
    players: [], finance: null, finHist: [], ipo: null, lastNet: 0, profitStreak: 0, board: [], weekNets: [], weekStreak: 0, rating5: 3.0 };
  for (let i = 0; i < 12; i++) team.players.push(makeSportPlayer(league, usedNames, 20, 34, 58, 88));
  team.value = 120000000 + Math.round(rand() * 200000000);
  return team;
}
function makeSportTeam(league, city, entry, usedNames) {
  const cityName = city.name;
  const name = entry[0], mascot = entry[0], color = entry[2];
  const cap = clamp(Math.round(18000 + Math.sqrt(city.pop) * 12), 20000, 55000);
  const team = { id: league.id + '-' + city.id, league: league.id, cityId: city.id, a3: city.a3,
    name, mascot, color, c1: entry[2], c2: entry[3], abbr: entry[1], logo: entry[1], cityName,
    stadium: { name: cityName + ' Park', capacity: cap, level: 1 },
    owner: 'AI', value: 0, wins: 0, losses: 0, history: [], champions: 0,
    players: [], finance: null, finHist: [], ipo: null, lastNet: 0, profitStreak: 0, board: [], weekNets: [], weekStreak: 0, rating5: 3.0 };
  for (let i = 0; i < 12; i++) team.players.push(makeSportPlayer(league, usedNames, 20, 34, 58, 88));
  team.value = 120000000 + Math.round(rand() * 200000000);
  return team;
}
function ensureSports() {
  if (!S) return null;
  if (!S.sports) {
    const used = new Set();
    const leagues = SPORT_LEAGUES.map(l => {
      if (l.id === 'foot' || l.id === 'base') {
        const teams = COUNTRY_CLUBS.map(club => {
          const cap = W.cities[W.byA3[club.a3] ? W.byA3[club.a3].capital : -1];
          return cap ? makeCountryTeam(l, cap, club, used) : null;
        }).filter(Boolean);
        return { id: l.id, name: l.name, short: l.short, icon: l.icon, teams,
          freeAgents: [], draftClass: [], seasonYear: yearOf(S.day), champion: null };
      }
      const cities = sportTeamCities();
      const teams = cities.map((c, i) => makeSportTeam(l, c, SHARED_SPORT_TEAMS[i % SHARED_SPORT_TEAMS.length], used));
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
  const baseLg = S.sports.leagues.find(l => l.id === 'base');
  const needsNewLeagues = !S.sports.leagues.some(l => l.id === 'foot') || !baseLg || baseLg.teams.length !== 6 || !baseLg.teams[0].country;
  const anyOwned = S.sports.leagues.some(lg => lg.teams.some(tm => tm.owner === 'you'));
  if (needsNewLeagues && !anyOwned) { S.sports = null; return ensureSports(); }
  S.sports.leagues.forEach(lg => {
    if (!lg.freeAgents) lg.freeAgents = [];
    if (!lg.draftClass) lg.draftClass = [];
    lg.teams.forEach(t => {
      if (!t.finHist) t.finHist = [];
      if (!Array.isArray(t.board)) t.board = [];
      if (!Array.isArray(t.weekNets)) t.weekNets = [];
      if (!isFinite(t.weekStreak)) t.weekStreak = 0;
      if (!isFinite(t.rating5)) t.rating5 = 3.0;
      if (!t.history) t.history = [];
      if (!t.abbr) t.abbr = t.logo || t.name.slice(0, 3).toUpperCase();
      if (!t.c1) t.c1 = t.color; if (!t.c2) t.c2 = '#ffffff';
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
  if (leagueId === 'foot') return { YDS: Math.max(0, Math.round((p.rating - 45) * 12 + gauss() * 60)), TD: Math.max(0, Math.round((p.rating - 50) * 0.25 + gauss() * 2)) };
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
  const rb = team.rating5 ? clamp(0.85 + team.rating5 * 0.06, 0.85, 1.15) : 1;
  const attendance = Math.round(Math.min(team.stadium.capacity * 0.98, team.stadium.capacity * clamp(0.35 + winPct * 0.45 + teamAvgStars(team) * 0.03, 0.3, 0.98) * rb));
  const ticketPrice = Math.round(28 * market);
  const tickets = attendance * homeGames * ticketPrice;
  const concessions = Math.round(tickets * 0.35);
  const broadcast = Math.round((18000000 + Math.min(60000000, popM * 900000)) * market / 1.4);
  const sponsors = Math.round((9000000 + winPct * 22000000 + teamAvgStars(team) * 2500000) * rb);
  const revenue = tickets + concessions + broadcast + sponsors;
  const payroll = team.players.reduce((a, p) => a + p.salary, 0);
  const admin = 12000000 + team.stadium.level * 1500000;
  const net = revenue - payroll - admin;
  return { revenue, tickets, concessions, broadcast, sponsors, payroll, admin, net, attendance, winPct, games };
}

function teamRating(t, fin) {
  fin = fin || sportFinance(t);
  const perf = clamp((fin.winPct || 0.5) * 5, 1, 5);
  const like = clamp(teamAvgStars(t), 1, 5);
  const fans = clamp(fin.attendance / Math.max(1, t.stadium.capacity) * 5, 1, 5);
  const margin = fin.revenue > 0 ? fin.net / fin.revenue : 0;
  const prof = clamp(3 + margin * 10, 1, 5);
  const att = clamp(fin.attendance / 35000 * 5, 1, 5);
  const rating = Math.round(clamp(0.25 * perf + 0.20 * like + 0.20 * fans + 0.20 * prof + 0.15 * att, 1, 5) * 10) / 10;
  return { rating, perf, like, fans, prof, att, fin };
}
function teamValueFromRating(t, fin, rating) {
  fin = fin || sportFinance(t); rating = rating != null ? rating : teamRating(t, fin).rating;
  return Math.max(50000000, Math.round(fin.revenue * (1.5 + rating * 0.8) + t.stadium.capacity * 8000 + t.champions * 40000000));
}
// Weekly, not yearly: called from businessWeek. Updates rating and value,
// tracks the weekly profit streak, and returns the owned teams' weekly net
// so businessWeek can pay it in cash. It does NOT pay cash itself.
function sportWeek() {
  if (!S || !S.sports) return 0;
  let total = 0;
  S.sports.leagues.forEach(lg => lg.teams.forEach(t => {
    const fin = sportFinance(t), r = teamRating(t, fin);
    t.rating5 = r.rating; t.value = teamValueFromRating(t, fin, r.rating); t.finance = fin;
    if (t.owner === 'you') {
      const bc = (typeof boardWeeklyCost === 'function') ? boardWeeklyCost(t) : 0;
      const boost = (typeof boardBoost === 'function') ? boardBoost(t) : 0;
      const stadiumRent = Math.round(((t.stadium && t.stadium.capacity) || 0) * 2);
      t.stadiumRent = stadiumRent;
      const weeklyNet = Math.round(fin.net / 52 - bc + Math.max(0, fin.net / 52) * boost - stadiumRent);
      t.weekNets.push(weeklyNet); if (t.weekNets.length > 4) t.weekNets.shift();
      let streak = 0; for (let i = t.weekNets.length - 1; i >= 0; i--) { if (t.weekNets[i] > 0) streak++; else break; }
      t.weekStreak = streak; if (t.wallet === 'private') ensurePerson().cash += weeklyNet; else total += weeklyNet;
    }
  }));
  return total;
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
      const rr = teamRating(t, fin); t.rating5 = rr.rating; t.value = teamValueFromRating(t, fin, rr.rating);
      const place = [...lg.teams].sort((a, b) => b.wins - a.wins).findIndex(x => x.id === t.id) + 1;
      t.history.unshift({ year, place, wins: t.wins, losses: t.losses, champion: false });
      if (t.history.length > 6) t.history.length = 6;
      // Weekly cash is already paid in sportWeek. Do not pay the annual net again here.
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
function buySportTeam(id, w) {
  const t = sportTeam(id); if (!t) return 'Team not found.';
  if (t.owner === 'you') return 'You already own this team.';
  w = w || curWallet();
  if (walletCash(w) < t.value) return `Costs ${fmtMoney(t.value, true)}. You have ${fmtMoney(walletCash(w), true)} in this wallet.`;
  walletPay(w, t.value); t.owner = 'you'; t.wallet = w;
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
  const w = t.wallet || 'company';
  if (walletCash(w) < bonus) return `Signing bonus ${fmtMoney(bonus, true)} needed.`;
  walletPay(w, bonus); lg.freeAgents = lg.freeAgents.filter(x => x.id !== playerId);
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
  const w = t.wallet || 'company';
  if (sweet > walletCash(w)) return 'You do not have that cash to offer.';
  if (gap > 2 && sweet < gap * 500000) return `They want at least ${fmtMoney(gap * 500000, true)} cash on top for that gap.`;
  walletPay(w, sweet); if (sweet) { /* cash goes to the other club, not to the player */ }
  t.players = t.players.filter(p => p.id !== outId); t.players.push(inn);
  target.players = target.players.filter(p => p.id !== inId); target.players.push(out);
  return null;
}
function upgradeStadium(teamId) {
  const t = sportTeam(teamId); if (!t || t.owner !== 'you') return 'Only your own team.';
  const cost = 40000000 * t.stadium.level;
  const w = t.wallet || 'company'; if (walletCash(w) < cost) return `Stadium upgrade costs ${fmtMoney(cost, true)} in this wallet.`;
  walletPay(w, cost); t.stadium.level++; t.stadium.capacity = Math.round(t.stadium.capacity * 1.15);
  return null;
}
function sportIpoEligible(t) {
  if (!t || t.owner !== 'you' || t.ipo) return false;
  const bf = (typeof boardFull === 'function') ? boardFull(t) : true;
  return bf && (t.weekStreak || 0) >= 2;
}
function sportIpo(teamId, pct) {
  const t = sportTeam(teamId); if (!t) return 'Team not found.';
  if (t.ipo) return 'This team is already public. Trade its shares in Finance.';
  if (t.owner !== 'you') return 'You must own the team first.';
  if ((typeof boardFull === 'function') && !boardFull(t)) return 'IPO needs a full board room: hire all 5 board seats in Offices first.';
  if ((t.weekStreak || 0) < 2) return `IPO needs 2 profitable weeks in a row. Current weekly streak: ${t.weekStreak || 0}.`;
  pct = clamp(pct != null ? pct : 1, 0.01, 1);
  const totalShares = 1000000, price = Math.max(1, Math.round(t.value / totalShares));
  const gross = Math.round(t.value * pct), fee = Math.round(gross * 0.07), proceeds = gross - fee;
  walletAdd(t.wallet || 'company', proceeds);
  t.ipo = { totalShares, price, publicShares: Math.round(totalShares * pct), yourShares: Math.round(totalShares * (1 - pct)) };
  if (pct >= 0.999) t.owner = 'public';
  news('Sports', `${t.name} went public at ${fmtMoney(price)} a share. You sold ${Math.round(pct * 100)}% for ${fmtMoney(proceeds, true)} after a 7% fee.`, t.a3);
  return null;
}
function sportTradeShares(teamId, side, qty) {
  const t = sportTeam(teamId); if (!t || !t.ipo) return 'This team is not public yet.';
  qty = Math.floor(qty); if (!qty || qty <= 0) return 'Enter a share count.';
  const price = Math.max(1, Math.round(t.value / t.ipo.totalShares));
  t.ipo.price = price;
  const w = t.wallet || 'company';
  if (side === 'buy') {
    const cost = qty * price;
    if (walletCash(w) < cost) return `Costs ${fmtMoney(cost, true)}.`;
    if (qty > t.ipo.publicShares) return 'Not that many public shares available.';
    walletPay(w, cost); t.ipo.publicShares -= qty; t.ipo.yourShares += qty;
  } else {
    if (qty > t.ipo.yourShares) return 'You do not own that many shares.';
    walletAdd(w, qty * price); t.ipo.yourShares -= qty; t.ipo.publicShares += qty;
  }
  return null;
}
