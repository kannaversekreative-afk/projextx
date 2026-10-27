// ---------- Worl News ----------
// The news APP: today's stories, sections, and search, all from the
// game's own news feed (S.news) and company wire (S.corpNews).
// This is separate from the newspaper (The Ticker Times): the paper
// stays exactly as it is for the weekly stocks section and the yearly
// editions, and this app links to it. No News+ tab, no Audio tab -
// the bottom bar is only Today / Following / Search.
function newsRow(n) {
  return `<div class="wnews-row"><span class="wnews-cat">${esc(n.cat)}</span><b>${esc(n.text)}</b><small>${fmtDate(n.d)}</small></div>`;
}
function newsPanelHTML() {
  const view = UI.newsView || 'today';
  const all = (S.news || []).slice();
  let body = '';
  if (view === 'following' && UI.newsSection) {
    const list = UI.newsSection === '__all' ? all : all.filter(n => n.cat === UI.newsSection);
    body = `<button class="wnews-back" data-a="newsView" data-x="following">← Sections</button>
    <h3 class="wnews-h">${UI.newsSection === '__all' ? 'All stories' : esc(UI.newsSection)}</h3>
    <div class="wnews-list">${list.map(newsRow).join('') || '<p class="wnews-empty">Nothing here yet.</p>'}</div>`;
  } else if (view === 'following') {
    const cats = [];
    all.forEach(n => { const c = cats.find(x => x.cat === n.cat); if (c) c.count++; else cats.push({ cat: n.cat, count: 1 }); });
    body = `<h3 class="wnews-h">Following</h3>
    <button class="wnews-secrow" data-a="newsPaper">📰 The Ticker Times<span>Yearly paper · weekly stocks</span></button>
    <button class="wnews-secrow" data-a="newsSection" data-x="__all">📋 All stories<span>${all.length} stories</span></button>
    <p class="wnews-label">Sections</p>
    ${cats.map(c => `<button class="wnews-secrow" data-a="newsSection" data-x="${esc(c.cat)}">${esc(c.cat)}<span>${c.count} ${c.count === 1 ? 'story' : 'stories'}</span></button>`).join('') || '<p class="wnews-empty">No sections yet — stories appear as the world moves.</p>'}`;
  } else if (view === 'search') {
    const q = (UI.newsQuery || '').trim().toLowerCase();
    const res = q ? all.filter(n => n.text.toLowerCase().includes(q) || n.cat.toLowerCase().includes(q)) : [];
    body = `<div class="wnews-searchrow"><input id="newsSearch" class="wnews-input" placeholder="Search stories" value="${esc(UI.newsQuery || '')}" autocomplete="off"><button class="wnews-gobtn" data-a="newsSearch">Search</button></div>
    ${q ? `<h3 class="wnews-h">${res.length} result${res.length === 1 ? '' : 's'} for "${esc(UI.newsQuery)}"</h3><div class="wnews-list">${res.map(newsRow).join('')}</div>` : '<p class="wnews-empty">Search the world\'s stories.</p>'}`;
  } else {
    const hero = all[0];
    const rest = all.slice(1, 16);
    const corp = (S.corpNews || []).slice(0, 5);
    body = `${hero ? `<div class="wnews-hero"><span class="wnews-cat">${esc(hero.cat)}</span><b>${esc(hero.text)}</b><small>${fmtDate(hero.d)}</small></div>` : ''}
    <h3 class="wnews-h">Top Stories</h3>
    <div class="wnews-list">${rest.map(newsRow).join('') || '<p class="wnews-empty">No stories yet.</p>'}</div>
    ${corp.length ? `<h3 class="wnews-h">Company News</h3><div class="wnews-list">${corp.map(n => `<div class="wnews-row"><span class="wnews-cat">Business</span><b>${esc(n.text)}</b><small>${fmtDate(n.d)}</small></div>`).join('')}</div>` : ''}`;
  }
  return panelShell('News', 'Worl News — what is happening in your world',
    `<div class="wnews"><div class="wnews-head"><b>📰 Worl News</b><span>${fmtDate(S.day)}</span></div>
    ${body}
    <div class="wnews-nav"><button class="${view === 'today' ? 'on' : ''}" data-a="newsView" data-x="today">📰<span>Today</span></button><button class="${view === 'following' ? 'on' : ''}" data-a="newsView" data-x="following">📚<span>Following</span></button><button class="${view === 'search' ? 'on' : ''}" data-a="newsView" data-x="search">🔍<span>Search</span></button></div></div>`);
}
