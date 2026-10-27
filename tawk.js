'use strict';
// Tawk: the in-game social app, X-style dark feed. Every real company
// has an account, and so do board members, world leaders, employees
// and store managers — plus you. The feed is generated fresh each day
// (seeded, so it is stable within a day); your posts, likes, reposts,
// bookmarks and follows are saved. Paying advertisers appear as
// sponsored posts while you scroll.
//
// Company posts are grounded in what the company actually does: its
// sector, its own product line (stable per company), its real
// locations, its real earnings reports and corporate events, and its
// real board members. Layout follows the X-style reference (dark
// feed, tabs, action row, Ad labels); all names, posts and art are
// original in-game content.
function tawkState() {
  if (!S.tawk) S.tawk = { posts: [], liked: {}, followed: {}, reposted: {}, bookmarked: {}, muted: [], chats: {}, saved: {} };
  if (!Array.isArray(S.tawk.posts)) S.tawk.posts = [];
  if (!S.tawk.liked) S.tawk.liked = {};
  if (!S.tawk.followed) S.tawk.followed = {};
  if (!S.tawk.reposted) S.tawk.reposted = {};
  if (!S.tawk.bookmarked) S.tawk.bookmarked = {};
  if (!Array.isArray(S.tawk.muted)) S.tawk.muted = [];
  if (!S.tawk.chats) S.tawk.chats = {};
  if (!S.tawk.saved) S.tawk.saved = {};
  return S.tawk;
}
function tawkMuted(p) {
  const words = (tawkState().muted || []);
  if (!words.length) return false;
  const txt = (p.text || '').toLowerCase();
  return words.some(w => w && txt.includes(String(w).toLowerCase()));
}
function tawkHandle(name) {
  const h = (name || 'user').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, '_');
  return '@' + (h || 'user');
}
function tawkCompact(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}
function tawkAccounts() {
  const accts = [];
  const youName = (S.you && S.you.name) || 'Founder';
  accts.push({ id: 'you', name: youName, handle: tawkHandle(youName), icon: '👤', type: 'you' });
  for (const a3 in (S.co || {})) {
    const c = S.co[a3];
    const secIcon = (typeof SECTORS !== 'undefined' && SECTORS[c.sector]) ? SECTORS[c.sector].icon : '🏢';
    accts.push({ id: 'co:' + a3, name: c.name, handle: '@' + (c.sym || a3).toLowerCase(), icon: secIcon, type: 'company', a3, verified: true });
    const rnd = (typeof corpRand === 'function' && typeof corpHash === 'function') ? corpRand(corpHash('leader' + a3)) : Math.random;
    const ln = HOLDER_FIRST[Math.floor(rnd() * HOLDER_FIRST.length)] + ' ' + HOLDER_LAST[Math.floor(rnd() * HOLDER_LAST.length)];
    const mon = (typeof isMonarchy === 'function') ? isMonarchy(a3) : false;
    const title = mon ? (rnd() < 0.5 ? 'King' : 'Queen') : (rnd() < 0.5 ? 'President' : 'Prime Minister');
    accts.push({ id: 'ldr:' + a3, name: ln, handle: tawkHandle(ln), icon: '👑', type: 'leader', a3, title, verified: true });
    try {
      const b = (typeof ensureBoard === 'function') ? ensureBoard(c) : [];
      b.forEach(m => accts.push({ id: 'bd:' + a3 + ':' + m.role, name: m.name, handle: tawkHandle(m.name), icon: '💼', type: 'exec', a3, role: m.role, company: c.name }));
    } catch (e) {}
    for (let i = 0; i < 2; i++) {
      const r2 = (typeof corpRand === 'function' && typeof corpHash === 'function') ? corpRand(corpHash('emp' + a3 + i)) : Math.random;
      const en = HOLDER_FIRST[Math.floor(r2() * HOLDER_FIRST.length)] + ' ' + HOLDER_LAST[Math.floor(r2() * HOLDER_LAST.length)];
      accts.push({ id: 'emp:' + a3 + ':' + i, name: en, handle: tawkHandle(en), icon: '🙂', type: 'employee', a3, company: c.name });
    }
  }
  for (const id in (S.stores || {})) {
    const s = S.stores[id];
    if (s && s.manager && s.manager.name) accts.push({ id: 'mgr:' + id, name: s.manager.name, handle: tawkHandle(s.manager.name), icon: '🏪', type: 'employee', store: s.name || id });
  }
  return accts;
}
// One stable product line per company, from its real sector group.
function tawkProductFor(c) {
  const rnd = (typeof corpRand === 'function' && typeof corpHash === 'function') ? corpRand(corpHash('prod' + c.a3)) : Math.random;
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const g = (typeof SECTORS !== 'undefined' && SECTORS[c.sector]) ? SECTORS[c.sector].g : '';
  const model = pick(['One', 'Pro', 'Max', 'Air', 'Plus', 'X', 'Nova', 'Prime', 'Lite', 'Ultra']);
  if (g === 'food') return `${c.name} ${pick(['Signature Dish', 'House Special', 'Daily Plate', 'Fresh Box', 'Chef Pick'])}`;
  if (g === 'service') return `${c.name} ${pick(['Plus', 'Premium', 'Care Plan', 'Membership'])}`;
  if (g === 'finance') return `${c.name} ${pick(['Gold Card', 'Everyday Account', 'Wealth Plan'])}`;
  if (g === 'transport') return `${c.name} ${pick(['Express', 'Direct', 'Sky Class'])}`;
  return `${c.name} ${model}`;
}
// A real city the company operates in: first location, else HQ city.
function tawkCityFor(c, rnd) {
  const locs = (c.locs || []).map(l => l.city).filter(Boolean);
  const cid = locs.length ? locs[0] : c.city;
  const city = (W.cities || []).find(x => x.id === cid);
  if (city) return city.name;
  return cname(c.a3);
}
function tawkPostFor(a, rnd) {
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  let text = '';
  if (a.type === 'company') {
    const c = S.co[a.a3];
    const prod = tawkProductFor(c), city = tawkCityFor(c, rnd);
    if (c && c.lastReport && S.day - c.lastReport.day <= 21) {
      const r = c.lastReport;
      text = `${c.name} reports ${r.q} earnings: ${fmtMoney(r.earnings, true)} — ${r.surprise >= 0 ? 'beating' : 'missing'} expectations by ${Math.abs(Math.round(r.surprise * 100))}%.`;
    } else if (c && c.lastEvent && S.day - c.lastEvent.day <= 30) {
      text = `${c.name} announces ${c.lastEvent.short}.`;
    } else {
      text = pick([
        `Introducing ${prod} — our newest in ${c.sector}. What do you think?`,
        `${prod} is now available in ${city}.`,
        `We just restocked ${prod} in ${city}. Get yours before it sells out.`,
        `Now open in ${city}! Come say hi. — ${c.name}`,
        `${prod} — built by ${c.name}, loved in ${cname(a.a3)}.`,
        `Big week at ${c.name}. ${c.sector} is moving.`,
        `${c.name} is hiring across ${cname(a.a3)}.`,
      ]);
    }
  } else if (a.type === 'leader') {
    const nb = (W.byA3[a.a3] && W.byA3[a.a3].nb) || [];
    const neigh = nb.length ? cname(nb[Math.floor(rnd() * nb.length)]) : 'our neighbours';
    text = pick([
      `${a.title} addresses the nation: growth, jobs, and stability first.`,
      `Trade talks with ${neigh} continue this week.`,
      `${cname(a.a3)} will invest in infrastructure and schools.`,
      `${a.title}: "${cname(a.a3)} is open for business."`,
    ]);
  } else if (a.type === 'exec') {
    const c = S.co[a.a3];
    const prod = c ? tawkProductFor(c) : a.company;
    text = pick([
      `"${prod} is the best thing we've built." — ${a.name}, ${a.role} at ${a.company}`,
      `"${a.company} is just getting started."`,
      `Hiring. If you build, come talk to us. — ${a.name}, ${a.role}`,
      `${a.company} board update: steady hands, big plans.`,
    ]);
  } else {
    const c = a.a3 ? S.co[a.a3] : null;
    const prod = c ? tawkProductFor(c) : (a.company || a.store || 'work');
    const city = c ? tawkCityFor(c, rnd) : '';
    const place = a.company || a.store || 'work';
    text = pick([
      `Working on ${prod} at ${place}${city ? ` in ${city}` : ''}.`,
      `${place} crew checking in${city ? ` from ${city}` : ''}.`,
      `Love this job. ${place} forever.`,
      `Shift done. ${place} never sleeps.`,
    ]);
  }
  return { id: 'd' + S.day + ':' + a.id, acct: a, text, hour: Math.floor(rnd() * 24), likes: Math.floor(rnd() * 5000), sponsored: false };
}
function tawkDailyPosts() {
  const accts = tawkAccounts();
  const rnd = (typeof corpRand === 'function' && typeof corpHash === 'function') ? corpRand(corpHash('tawkday' + S.day)) : Math.random;
  // Seeded shuffle: without it the 60-post cap always favours the same
  // early countries and the player's home country never appears.
  for (let i = accts.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const tmp = accts[i]; accts[i] = accts[j]; accts[j] = tmp; }
  const posts = [];
  for (const a of accts) {
    let p = 0;
    if (a.type === 'company') p = 0.30;
    else if (a.type === 'leader') p = 0.20;
    else if (a.type === 'exec') p = 0.04;
    else if (a.type === 'employee') p = 0.05;
    else continue;
    if (rnd() > p) continue;
    posts.push(tawkPostFor(a, rnd));
    if (posts.length >= 60) break;
  }
  return posts;
}
function tawkSponsoredPost(ad) {
  const c = S.co[ad.ref];
  const acct = c
    ? { id: 'co:' + ad.ref, name: c.name, handle: '@' + (c.sym || ad.ref).toLowerCase(), icon: (SECTORS[c.sector] || {}).icon || '🏢', type: 'company', a3: ad.ref, verified: true }
    : { id: 'co:' + ad.ref, name: ad.name, handle: '@' + (ad.sym || 'ad').toLowerCase(), icon: '🏢', type: 'company', a3: ad.ref, verified: true };
  // Sponsored likes are seeded by day + ad, not Math.random: a random
  // like count changed the Tawk HTML on every 1.5s phone re-render,
  // so the whole Tawk screen was rewritten and jumped around.
  const adRnd = (typeof corpRand === 'function' && typeof corpHash === 'function') ? corpRand(corpHash('tawkad' + S.day + ad.ref)) : Math.random;
  return { id: 'ad:' + S.day + ':' + ad.ref, acct, text: adLineFor(ad, 'tawk') + ' — Sponsored', hour: -1, likes: Math.floor(adRnd() * 300), sponsored: true };
}
// --- Tawk Sports: the week's live slate from the game's real teams ---
// The season engine tracks wins/losses only, no per-game scores, so the
// week's scoreboard is generated from the real teams' real roster
// strength, seeded per game-week: stable all week, a new slate next week.
function tawkSportWeek() { return Math.floor(S.day / 7); }
function tawkRoundPairings(teams, round) {
  const n = teams.length, idx = teams.map((_, i) => i);
  const rest = idx.slice(1), rot = rest.map((_, i) => rest[(i + round) % rest.length]);
  const order = [idx[0]].concat(rot), pairs = [];
  for (let i = 0; i < n / 2; i++) pairs.push([order[i], order[n - 1 - i]]);
  return pairs;
}
function tawkSportGames(lgId, weekOff) {
  if (typeof ensureSports !== 'function') return [];
  ensureSports();
  const lg = (S.sports.leagues || []).find(l => l.id === lgId);
  if (!lg || !lg.teams || lg.teams.length < 2) return [];
  // weekOff shifts the slate: -1 = last week (Final), 0 = this week
  // (live), +1 = next week (Upcoming). Callers that omit it get the
  // current week, exactly as before.
  const week = tawkSportWeek() + (weekOff || 0), round = ((week % 9) + 9) % 9;
  const pairs = tawkRoundPairings(lg.teams, round);
  return pairs.map((pr, gi) => {
    const home = lg.teams[pr[0]], away = lg.teams[pr[1]];
    const gid = lgId + '-w' + week + '-g' + gi;
    const rnd = (typeof corpRand === 'function' && typeof corpHash === 'function') ? corpRand(corpHash('tawkgame' + gid)) : Math.random;
    const hs0 = (typeof teamStrength === 'function') ? teamStrength(home) : 60;
    const as0 = (typeof teamStrength === 'function') ? teamStrength(away) : 60;
    const diff = hs0 - as0;
    let hs, as, period;
    if (lgId === 'foot') {
      hs = clamp(Math.round(21 + diff * 0.4 + (rnd() * 16 - 8)), 3, 45);
      as = clamp(Math.round(21 - diff * 0.4 + (rnd() * 16 - 8)), 3, 45);
      if (hs === as) { if (diff >= 0) hs += 3; else as += 3; }
      period = 'Q' + (1 + Math.floor(rnd() * 4)) + ' ' + String(Math.floor(rnd() * 15)).padStart(2, '0') + ':' + String(Math.floor(rnd() * 60)).padStart(2, '0');
    } else if (lgId === 'basket') {
      hs = clamp(Math.round(98 + diff * 0.6 + (rnd() * 22 - 11)), 78, 148);
      as = clamp(Math.round(98 - diff * 0.6 + (rnd() * 22 - 11)), 78, 148);
      if (hs === as) hs += 2;
      period = 'Q' + (1 + Math.floor(rnd() * 4)) + ' ' + String(Math.floor(rnd() * 12)).padStart(2, '0') + ':' + String(Math.floor(rnd() * 60)).padStart(2, '0');
    } else {
      hs = clamp(Math.round(4.5 + diff * 0.05 + (rnd() * 6 - 3)), 0, 15);
      as = clamp(Math.round(4.5 - diff * 0.05 + (rnd() * 6 - 3)), 0, 15);
      if (hs === as) { if (diff >= 0) hs += 1; else as += 1; }
      const inn = 1 + Math.floor(rnd() * 9);
      period = (rnd() < 0.5 ? 'Top ' : 'Bot ') + inn + (inn === 1 ? 'st' : inn === 2 ? 'nd' : inn === 3 ? 'rd' : 'th');
    }
    return { id: gid, lg: lgId, lgName: lg.name, home, away, hs, as, period, watchers: 800 + Math.floor(rnd() * 44000) };
  });
}
function tawkTeamHandle(t) { return '@' + (t.cityName + '_' + t.mascot).toLowerCase().replace(/[^a-z0-9_]/g, ''); }
function tawkEnsureChat(g) {
  const t = tawkState();
  if (!t.chats[g.id]) {
    const rnd = (typeof corpRand === 'function' && typeof corpHash === 'function') ? corpRand(corpHash('tawkchat' + g.id)) : Math.random;
    const fan = () => {
      const fn = HOLDER_FIRST[Math.floor(rnd() * HOLDER_FIRST.length)] + ' ' + HOLDER_LAST[Math.floor(rnd() * HOLDER_LAST.length)];
      return { name: fn, handle: tawkHandle(fn), icon: '🙂' };
    };
    const f1 = fan(), f2 = fan();
    const hm = g.home, am = g.away, lead = g.hs > g.as ? hm : am;
    const ls = Math.max(g.hs, g.as), ts = Math.min(g.hs, g.as);
    const msgs = [
      { acct: { name: hm.name, handle: tawkTeamHandle(hm), icon: hm.logo, color: hm.color }, text: `Game day in ${hm.cityName}! ${hm.mascot} are ready.`, time: '3h' },
      { acct: { name: am.name, handle: tawkTeamHandle(am), icon: am.logo, color: am.color }, text: `${am.name} have arrived in ${hm.cityName}. Let's play.`, time: '2h' },
      { acct: f1, text: `${hm.mascot} by ${Math.abs(g.hs - g.as)} tonight, calling it now.`, time: '1h' },
      { acct: { name: lead.name, handle: tawkTeamHandle(lead), icon: lead.logo, color: lead.color }, text: `${lead.mascot} up ${ls}-${ts} in ${g.period}.`, time: '45m' },
      { acct: f2, text: `This ${hm.name} vs ${am.name} game is unreal.`, time: '20m' },
    ];
    t.chats[g.id] = { game: { id: g.id, lg: g.lg, lgName: g.lgName, home: hm.name, away: am.name, homeIcon: hm.logo, awayIcon: am.logo, homeColor: hm.color, awayColor: am.color, hs: g.hs, as: g.as, period: g.period }, msgs, seen: msgs.length, day: S.day };
  }
  return t.chats[g.id];
}
function tawkTopics() {
  const counts = {};
  tawkDailyPosts().forEach(p => {
    if (p.acct.type === 'company') counts[p.acct.name] = (counts[p.acct.name] || 0) + 1;
    if (/earnings/i.test(p.text)) counts['Earnings'] = (counts['Earnings'] || 0) + 1;
  });
  return Object.keys(counts).map(k => ({ label: k, n: counts[k] })).sort((a, b) => b.n - a.n).slice(0, 8);
}
function tawkFeed(tab) {
  const t = tawkState();
  const daily = tawkDailyPosts().filter(p => !tawkMuted(p));
  const followed = t.followed || {};
  let organic = daily;
  if (tab === 'following') organic = daily.filter(p => followed[p.acct.id]);
  else organic.sort((a, b) => ((followed[b.acct.id] ? 1 : 0) - (followed[a.acct.id] ? 1 : 0)));
  const youAcct = { id: 'you', name: (S.you && S.you.name) || 'Founder', handle: tawkHandle((S.you && S.you.name) || 'Founder'), icon: '👤', type: 'you' };
  const mine = (t.posts || []).map(p => ({ id: p.id, acct: youAcct, text: p.text, hour: -1, likes: p.likes || 0, sponsored: false, mine: true }));
  let feed = (tab === 'following' ? [] : mine).concat(organic);
  const ads = (typeof activeAds === 'function') ? activeAds('tawk') : [];
  const adPool = tab === 'following' ? ads.filter(a => followed['co:' + a.ref]) : ads;
  if (adPool.length) {
    const out = [];
    feed.forEach((p, i) => { out.push(p); if ((i + 1) % 5 === 0) out.push(tawkSponsoredPost(adPool[Math.floor(i / 5) % adPool.length])); });
    feed = out;
  }
  return feed.slice(0, 80);
}
function tawkPostCard(p) {
  const t = tawkState();
  const liked = !!t.liked[p.id], reposted = !!t.reposted[p.id], saved = !!t.bookmarked[p.id];
  const likes = p.likes + (liked ? 1 : 0);
  const replies = Math.floor(p.likes * 0.02), reposts = Math.floor(p.likes * 0.05) + (reposted ? 1 : 0);
  const followed = !!t.followed[p.acct.id];
  const time = p.hour < 0 ? 'now' : `${Math.max(1, 24 - p.hour)}h`;
  const c = p.acct.a3 ? S.co[p.acct.a3] : null;
  const preview = (p.acct.type === 'company' && c) ? `<div class="tawk-card"><span class="tawk-card-ic">${p.acct.icon}</span><div class="tawk-card-txt"><b>${esc(c.name)}</b><span>${esc(c.sector)} · ${esc(c.sym)}</span></div><button class="tawk-visit" data-a="stock" data-x="${c.a3}">Visit</button></div>` : '';
  return `<div class="tawk-post"><span class="tawk-ic">${p.acct.icon}</span><div class="tawk-post-main">
  <div class="tawk-post-head"><b>${esc(p.acct.name)}</b>${p.acct.verified ? '<span class="tawk-verified">✓</span>' : ''}<span class="tawk-handle">${esc(p.acct.handle)} · ${time}</span>${p.sponsored ? '<span class="ad-tag">Ad</span>' : ''}</div>
  <p class="tawk-text">${esc(p.text)}</p>${preview}
  <div class="tawk-actions">
  <button data-a="tawkReply" data-x="${p.id}">💬 ${tawkCompact(replies)}</button>
  <button data-a="tawkRepost" data-x="${p.id}" data-reposts="${Math.floor(p.likes * 0.05)}">🔁 ${tawkCompact(reposts)}${reposted ? ' ✓' : ''}</button>
  <button data-a="tawkLike" data-x="${p.id}" data-likes="${p.likes}">${liked ? '❤️' : '🤍'} ${tawkCompact(likes)}</button>
  <button data-a="tawkBookmark" data-x="${p.id}">${saved ? '🔖 ✓' : '🔖'}</button>
  ${p.acct.id !== 'you' ? `<button data-a="tawkFollow" data-x="${p.acct.id}">${followed ? 'Following ✓' : 'Follow'}</button>` : ''}
  ${c ? `<button data-a="stock" data-x="${c.a3}">Visit</button>` : ''}
  </div></div></div>`;
}
function tawkSportsHTML() {
  const lgId = UI.tawkSport || 'base';
  const leagues = (typeof SPORT_LEAGUES !== 'undefined') ? SPORT_LEAGUES : [{ id: 'base', name: 'World Baseball League', short: 'Baseball', icon: '⚾' }, { id: 'basket', name: 'World Basketball League', short: 'Basketball', icon: '🏀' }];
  const games = tawkSportGames(lgId);
  const chips = leagues.map(l => `<button class="tawk-chip ${l.id === lgId ? 'on' : ''}" data-a="tawkSportLeague" data-x="${l.id}">${l.icon} ${l.short}</button>`).join('');
  const cards = games.map(g => {
    const h = g.home, a = g.away;
    return `<div class="tawk-game"><div class="tawk-game-top"><span class="tawk-live">● LIVE</span><span>${esc(g.period)}</span></div>
    <div class="tawk-game-row"><span class="tawk-team-ic" style="background:${h.color}">${h.logo}</span><b>${esc(h.name)}</b><b class="tawk-score">${g.hs}</b></div>
    <div class="tawk-game-row"><span class="tawk-team-ic" style="background:${a.color}">${a.logo}</span><b>${esc(a.name)}</b><b class="tawk-score">${g.as}</b></div>
    <div class="tawk-game-foot"><span>📶 ${tawkCompact(g.watchers)} watching</span><button class="tawk-join" data-a="tawkJoinChat" data-x="${g.id}">Join chat</button></div></div>`;
  }).join('');
  const lgName = (leagues.find(l => l.id === lgId) || {}).name || '';
  return `<div class="tawk-sports"><h4 class="tawk-sec">Sports · ${esc(lgName)}</h4><div class="tawk-chips">${chips}</div>${cards || '<p class="tawk-empty">No games this week.</p>'}</div>`;
}
function tawkExploreHTML() {
  const tab = UI.tawkExploreTab || 'explore';
  const q = (UI.tawkQuery || '').trim();
  const topics = tawkTopics();
  const tabs = [['explore', 'Explore'], ['trending', 'Trending'], ['news', 'News'], ['sports', 'Sports']].map(([id, label]) => `<button class="tawk-tab ${tab === id ? 'on' : ''}" data-a="tawkExploreTab" data-x="${id}">${label}</button>`).join('');
  let body = '';
  if (tab === 'sports') body = tawkSportsHTML();
  else if (tab === 'news') {
    const rows = (S.news || []).slice(0, 30).map(n => `<div class="tawk-notif"><span class="tawk-ic">📰</span><div class="tawk-row-txt"><b>${esc(n.cat)}</b><span>${esc(n.text)}</span><span class="tawk-handle">Day ${n.d}</span></div></div>`).join('');
    body = rows || '<p class="tawk-empty">No news yet.</p>';
  } else if (tab === 'trending') {
    body = topics.map((tp, i) => `<button class="tawk-topic" data-a="tawkTopic" data-x="${i}"><b>${esc(tp.label)}</b><span>${tp.n} posts today</span></button>`).join('') || '<p class="tawk-empty">Nothing trending today.</p>';
  } else {
    const chips = topics.map((tp, i) => `<button class="tawk-chip" data-a="tawkTopic" data-x="${i}">${esc(tp.label)}</button>`).join('');
    let results = '';
    if (q) {
      const ql = q.toLowerCase();
      results = tawkDailyPosts().filter(p => !tawkMuted(p) && p.text.toLowerCase().includes(ql)).map(tawkPostCard).join('') || '<p class="tawk-empty">No posts match that.</p>';
    }
    body = `<div class="tawk-compose"><input id="tawkSearch" class="tawk-input" value="${esc(UI.tawkQuery || '')}" placeholder="Search Tawk"><button class="tawk-postbtn" data-a="tawkSearch">Search</button></div>
    <h4 class="tawk-sec">Trending on Tawk</h4><div class="tawk-chips">${chips}</div>${q ? `<h4 class="tawk-sec">Posts about “${esc(q)}”</h4>${results}` : '<p class="tawk-empty">Search for a topic, or tap a trend above.</p>'}`;
  }
  return `<div class="tawk-tabs">${tabs}</div>${body}`;
}
function tawkChatListHTML() {
  const t = tawkState();
  const list = Object.keys(t.chats || {}).map(id => t.chats[id]).sort((a, b) => (b.day || 0) - (a.day || 0));
  if (!list.length) return '<p class="tawk-empty">No chats yet — open Sports and hit Join chat on a live game.</p>';
  return list.map(c => {
    const g = c.game, last = c.msgs[c.msgs.length - 1];
    const unread = Math.max(0, c.msgs.length - (c.seen || 0));
    return `<button class="tawk-chat-row" data-a="tawkChatOpen" data-x="${g.id}"><span class="tawk-ic" style="background:${g.homeColor}">${g.homeIcon}</span><div class="tawk-row-txt"><b>${esc(g.home)} ${g.hs} – ${g.as} ${esc(g.away)}</b><span>${last ? esc(last.acct.name) + ': ' + esc(last.text).slice(0, 60) : ''}</span></div>${unread ? `<b class="tawk-badge">${unread}</b>` : ''}</button>`;
  }).join('');
}
function tawkGameChatHTML() {
  const t = tawkState();
  const c = t.chats[UI.tawkGame];
  if (!c) return '<p class="tawk-empty">That chat is gone.</p>';
  const g = c.game;
  const msgs = c.msgs.map(m => `<div class="tawk-msg"><span class="tawk-ic" ${m.acct.color ? `style="background:${m.acct.color}"` : ''}>${m.acct.icon}</span><div class="tawk-msg-main"><div class="tawk-post-head"><b>${esc(m.acct.name)}</b><span class="tawk-handle">${esc(m.acct.handle)} · ${esc(m.time || '')}</span></div><p class="tawk-text">${esc(m.text)}</p></div></div>`).join('');
  return `<div class="tawk-gamechat"><button class="tawk-back" data-a="tawkChatBack">← Chats</button>
  <div class="tawk-game-head"><b>${esc(g.home)} ${g.hs} – ${g.as} ${esc(g.away)}</b><span>${esc(g.lgName)} · ${esc(g.period)}</span></div>
  ${msgs}
  <div class="tawk-compose"><span class="tawk-ic">👤</span><input id="tawkChatText" class="tawk-input" maxlength="280" value="${esc(UI.tawkChatDraft || '')}" placeholder="Message the chat…"><button class="tawk-postbtn" data-a="tawkChatPost">Send</button></div></div>`;
}
function tawkNotifsHTML(notifs) {
  if (!notifs.length) return '<p class="tawk-empty">Nothing yet — follow accounts and their posts will show up here.</p>';
  return notifs.map(p => `<div class="tawk-notif"><span class="tawk-ic">${p.acct.icon}</span><div class="tawk-row-txt"><b>${esc(p.acct.name)}${p.acct.verified ? ' ✓' : ''}</b><span>${esc(p.text).slice(0, 90)}</span><span class="tawk-handle">${p.hour < 0 ? 'now' : Math.max(1, 24 - p.hour) + 'h'}</span></div></div>`).join('');
}
function tawkProfileHTML() {
  const t = tawkState();
  const followed = t.followed || {};
  const youName = (S.you && S.you.name) || 'Founder';
  const title = (typeof personTitle === 'function') ? personTitle() : '';
  const following = tawkAccounts().filter(a => followed[a.id]);
  const who = tawkAccounts().filter(a => a.id !== 'you' && !followed[a.id] && (a.type === 'company' || a.type === 'leader')).slice(0, 8);
  const whoCards = who.map(a => `<div class="tawk-who-card"><span class="tawk-ic big">${a.icon}</span><b>${esc(a.name)}</b><span>${esc(a.handle)}</span><span class="tawk-handle">${esc(a.type === 'company' ? ((S.co[a.a3] || {}).sector || '') : (a.title || ''))}</span><button data-a="tawkFollow" data-x="${a.id}">Follow</button></div>`).join('');
  const youAcct = { id: 'you', name: youName, handle: tawkHandle(youName), icon: '👤', type: 'you' };
  return `<div class="tawk-profile"><span class="tawk-ic big">👤</span><b>${esc(youName)}</b><span>${esc(tawkHandle(youName))}</span>${title ? `<span class="tawk-handle">${esc(title)}</span>` : ''}<div class="tawk-stats"><span><b>${(t.posts || []).length}</b> Posts</span><span><b>${following.length}</b> Following</span></div></div>
  <h4 class="tawk-sec">Who to follow</h4><div class="tawk-who">${whoCards || '<p class="tawk-empty">You follow everyone.</p>'}</div>
  <h4 class="tawk-sec">Your posts</h4>${(t.posts || []).length ? t.posts.map(p => tawkPostCard({ id: p.id, acct: youAcct, text: p.text, hour: -1, likes: p.likes || 0, sponsored: false, mine: true })).join('') : '<p class="tawk-empty">You have not posted yet.</p>'}
  <h4 class="tawk-sec">Following</h4>${following.map(a => `<div class="tawk-row"><span class="tawk-ic">${a.icon}</span><div class="tawk-row-txt"><b>${esc(a.name)}</b><span>${esc(a.handle)}</span></div><button data-a="tawkFollow" data-x="${a.id}">Following ✓</button></div>`).join('') || '<p class="tawk-empty">Nobody followed yet.</p>'}`;
}
function tawkBookmarksHTML() {
  const t = tawkState();
  const saved = Object.keys(t.bookmarked || {}).filter(id => t.bookmarked[id]).map(id => (t.saved || {})[id]).filter(Boolean);
  if (!saved.length) return '<p class="tawk-empty">Nothing saved yet — tap 🔖 on any post to save it here.</p>';
  return saved.map(tawkPostCard).join('');
}
function tawkSettingsHTML() {
  const t = tawkState();
  const rows = (t.muted || []).map((w, i) => `<div class="tawk-set-row"><span>${esc(w)}</span><button data-a="tawkMuteRemove" data-x="${i}">Remove</button></div>`).join('');
  return `<p class="tawk-empty">Muted words hide matching posts from your feed and alerts.</p>
  <div class="tawk-compose"><input id="tawkMuteWord" class="tawk-input" placeholder="Word to mute"><button class="tawk-postbtn" data-a="tawkMuteAdd">Mute</button></div>
  ${rows || '<p class="tawk-empty">No muted words.</p>'}`;
}
function tawkPanelHTML() {
  const t = tawkState();
  const tab = UI.tawkTab || 'foryou';
  const view = UI.tawkView || 'feed';
  const followed = t.followed || {};
  const notifs = tawkDailyPosts().filter(p => followed[p.acct.id] && !tawkMuted(p));
  const youName = (S.you && S.you.name) || 'Founder';
  const following = tawkAccounts().filter(a => followed[a.id]);
  let body = '';
  if (view === 'explore') body = tawkExploreHTML();
  else if (view === 'sports') body = tawkSportsHTML();
  else if (view === 'chat') body = tawkChatListHTML();
  else if (view === 'gamechat') body = tawkGameChatHTML();
  else if (view === 'notifs') body = tawkNotifsHTML(notifs);
  else if (view === 'profile') body = tawkProfileHTML();
  else if (view === 'bookmarks') body = tawkBookmarksHTML();
  else if (view === 'settings') body = tawkSettingsHTML();
  else {
    const feed = tawkFeed(tab);
    body = `<div class="tawk-compose"><span class="tawk-ic">👤</span><input id="tawkText" class="tawk-input" maxlength="280" value="${esc(UI.tawkDraft || '')}" placeholder="What's happening?"><button class="tawk-postbtn" data-a="tawkPost">Post</button></div>
    <div class="tawk-tabs"><button class="tawk-tab ${tab === 'foryou' ? 'on' : ''}" data-a="tawkTab" data-x="foryou">For you</button><button class="tawk-tab ${tab === 'following' ? 'on' : ''}" data-a="tawkTab" data-x="following">Following</button></div>
    ${feed.map(tawkPostCard).join('') || '<p class="tawk-empty">No posts yet — follow accounts to fill the Following tab, or post something yourself.</p>'}`;
  }
  const drawer = UI.tawkDrawer ? `<button class="tawk-drawer-back" data-a="tawkDrawerClose" aria-label="Close menu"></button><div class="tawk-drawer">
  <div class="tawk-drawer-head"><span class="tawk-ic big">👤</span><b>${esc(youName)}</b><span>${esc(tawkHandle(youName))}</span><span><b>${following.length}</b> Following</span><button class="tawk-drawer-x" data-a="tawkDrawerClose">✕</button></div>
  <button class="tawk-drawer-row" data-a="tawkDrawerNav" data-x="profile">👤 Profile</button>
  <button class="tawk-drawer-row" data-a="tawkDrawerNav" data-x="bookmarks">🔖 Bookmarks</button>
  <button class="tawk-drawer-row" data-a="tawkDrawerNav" data-x="settings">🔇 Muted words</button></div>` : '';
  return panelShell('Tawk', 'The world, talking.',
    `<div class="tawk"><div class="tawk-head"><button class="tawk-avatarbtn" data-a="tawkDrawer" aria-label="Menu">👤</button><div class="tawk-logo">🦅 Tawk</div><button class="tawk-plus" data-a="tawkFocus" aria-label="Compose">＋</button></div>
    ${body}
    ${drawer}
    <div class="tawk-nav"><button class="${view === 'feed' ? 'on' : ''}" data-a="tawkView" data-x="feed">🏠<span>Home</span></button><button class="${view === 'explore' ? 'on' : ''}" data-a="tawkView" data-x="explore">🔍<span>Explore</span></button><button class="${view === 'sports' ? 'on' : ''}" data-a="tawkView" data-x="sports">🏆<span>Sports</span></button><button class="${view === 'notifs' ? 'on' : ''}" data-a="tawkView" data-x="notifs">🔔<span>Alerts</span>${notifs.length ? `<b class="tawk-badge">${notifs.length}</b>` : ''}</button><button class="${view === 'chat' ? 'on' : ''}" data-a="tawkView" data-x="chat">💬<span>Chat</span></button></div></div>`);
}
