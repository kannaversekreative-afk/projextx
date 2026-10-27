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
  if (!S.tawk) S.tawk = { posts: [], liked: {}, followed: {}, reposted: {}, bookmarked: {} };
  if (!Array.isArray(S.tawk.posts)) S.tawk.posts = [];
  if (!S.tawk.liked) S.tawk.liked = {};
  if (!S.tawk.followed) S.tawk.followed = {};
  if (!S.tawk.reposted) S.tawk.reposted = {};
  if (!S.tawk.bookmarked) S.tawk.bookmarked = {};
  return S.tawk;
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
  return { id: 'ad:' + S.day + ':' + ad.ref, acct, text: adLineFor(ad, 'tawk') + ' — Sponsored', hour: -1, likes: Math.floor(Math.random() * 300), sponsored: true };
}
function tawkFeed(tab) {
  const t = tawkState();
  const daily = tawkDailyPosts();
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
function tawkPanelHTML() {
  const t = tawkState();
  const tab = UI.tawkTab || 'foryou';
  const view = UI.tawkView || 'feed';
  const daily = tawkDailyPosts();
  const followed = t.followed || {};
  const notifs = daily.filter(p => followed[p.acct.id]);
  const youName = (S.you && S.you.name) || 'Founder';
  let body = '';
  if (view === 'search') {
    const q = (UI.tawkQuery || '').trim().toLowerCase();
    const results = q ? tawkAccounts().filter(a => a.id !== 'you' && (a.name.toLowerCase().includes(q) || a.handle.toLowerCase().includes(q))).slice(0, 30) : [];
    body = `<div class="tawk-compose"><input id="tawkSearch" class="tawk-input" value="${esc(UI.tawkQuery || '')}" placeholder="Search companies, leaders, employees"><button class="tawk-postbtn" data-a="tawkSearch">Search</button></div>
    ${q ? (results.map(a => `<div class="tawk-row"><span class="tawk-ic">${a.icon}</span><div class="tawk-row-txt"><b>${esc(a.name)}</b><span>${esc(a.handle)}</span></div><button data-a="tawkFollow" data-x="${a.id}">${followed[a.id] ? 'Following ✓' : 'Follow'}</button></div>`).join('') || '<p class="tawk-empty">No accounts match that search.</p>') : '<p class="tawk-empty">Search for companies, leaders, board members and employees.</p>'}`;
  } else if (view === 'notifs') {
    body = notifs.length ? notifs.map(tawkPostCard).join('') : '<p class="tawk-empty">Nothing yet — follow accounts and their posts will show up here.</p>';
  } else if (view === 'profile') {
    const following = tawkAccounts().filter(a => followed[a.id]);
    body = `<div class="tawk-profile"><span class="tawk-ic big">👤</span><b>${esc(youName)}</b><span>${esc(tawkHandle(youName))}</span><div class="tawk-stats"><span><b>${(t.posts || []).length}</b> Posts</span><span><b>${following.length}</b> Following</span></div></div>
    <h4 class="tawk-sec">Your posts</h4>${(t.posts || []).length ? t.posts.map(p => tawkPostCard({ id: p.id, acct: { id: 'you', name: youName, handle: tawkHandle(youName), icon: '👤', type: 'you' }, text: p.text, hour: -1, likes: p.likes || 0, sponsored: false, mine: true })).join('') : '<p class="tawk-empty">You have not posted yet.</p>'}
    <h4 class="tawk-sec">Following</h4>${following.map(a => `<div class="tawk-row"><span class="tawk-ic">${a.icon}</span><div class="tawk-row-txt"><b>${esc(a.name)}</b><span>${esc(a.handle)}</span></div><button data-a="tawkFollow" data-x="${a.id}">Following ✓</button></div>`).join('') || '<p class="tawk-empty">Nobody followed yet.</p>'}`;
  } else {
    const feed = tawkFeed(tab);
    body = `<div class="tawk-compose"><span class="tawk-ic">👤</span><input id="tawkText" class="tawk-input" maxlength="280" value="${esc(UI.tawkDraft || '')}" placeholder="What's happening?"><button class="tawk-postbtn" data-a="tawkPost">Post</button></div>
    <div class="tawk-tabs"><button class="tawk-tab ${tab === 'foryou' ? 'on' : ''}" data-a="tawkTab" data-x="foryou">For you</button><button class="tawk-tab ${tab === 'following' ? 'on' : ''}" data-a="tawkTab" data-x="following">Following</button></div>
    ${feed.map(tawkPostCard).join('') || '<p class="tawk-empty">No posts yet — follow accounts to fill the Following tab, or post something yourself.</p>'}`;
  }
  return panelShell('Tawk', 'The world, talking.',
    `<div class="tawk"><div class="tawk-head"><span class="tawk-ic">👤</span><div class="tawk-logo">🦅 Tawk</div><button class="tawk-plus" data-a="tawkFocus" aria-label="Compose">＋</button></div>
    ${body}
    <div class="tawk-nav"><button class="${view === 'feed' ? 'on' : ''}" data-a="tawkView" data-x="feed">🏠<span>Home</span></button><button class="${view === 'search' ? 'on' : ''}" data-a="tawkView" data-x="search">🔍<span>Search</span></button><button class="${view === 'notifs' ? 'on' : ''}" data-a="tawkView" data-x="notifs">🔔<span>Alerts</span>${notifs.length ? `<b class="tawk-badge">${notifs.length}</b>` : ''}</button><button class="${view === 'profile' ? 'on' : ''}" data-a="tawkView" data-x="profile">👤<span>Profile</span></button></div></div>`);
}
