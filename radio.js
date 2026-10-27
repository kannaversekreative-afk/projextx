'use strict';
// Robot Radio: the in-game radio app. Stations come from real media
// companies (flagships have no media sectors, so company stations
// come from media EXTRAS), plus standard music stations and a Ticker
// news station. The DJ "says" the ads: ad breaks read out the paying
// radio advertisers, in character, as part of the show. (Text reads:
// the show pretends to say them; there is no audio stream.)
const RADIO_MEDIA_SECTORS = ['Entertainment – Film & Music', 'Entertainment – Gaming & Sports', 'Marketing & Advertising', 'Telecom – Mobile', 'Telecom – Internet'];
const RADIO_MUSIC = [
  ['Pulse Pop', 'Pop', 'DJ Poppy'], ['Iron Rock', 'Rock', 'DJ Axel'], ['Bassline', 'Hip-Hop', 'DJ Bass'],
  ['Velvet Jazz', 'Jazz', 'DJ Velvet'], ['Classical Crown', 'Classical', 'Maestro'], ['Neon Electronic', 'Electronic', 'DJ Neon'],
  ['Country Roads', 'Country', 'DJ Dusty'], ['World Beat', 'World', 'DJ Atlas'],
];
const RADIO_TITLES = ['Midnight Run', 'Paper Sun', 'Golden Hour', 'City Lights', 'Slow Wave', 'High Tide', 'Neon Sky', 'Dusty Road', 'Blue Static', 'Summer Signal', 'Iron Heart', 'Quiet Storm', 'Velvet Morning', 'Electric Rain', 'Harbor Song', 'Night Drive', 'Open Road', 'Crystal Lake', 'Wildfire', 'Second Dawn'];
const RADIO_ARTISTS = ['The Wanderers', 'Luna Vale', 'The Static', 'Mia Rivers', 'The Northlights', 'Kai Storm', 'The Velvetines', 'Juno Park', 'The Ironwoods', 'Sasha Blue', 'The Harbor Boys', 'Nina Cole', 'The Daybreakers', 'Omar Skye', 'The Paper Kites'];

function radioStations() {
  const stations = [{ id: 'news', name: 'Ticker News Radio', genre: 'News', dj: 'Dana Wire', desc: 'Headlines from around the world, all day.' }];
  for (const a3 in (S.co || {})) {
    const c = S.co[a3];
    if (RADIO_MEDIA_SECTORS.indexOf(c.sector) < 0) continue;
    const rnd = (typeof corpRand === 'function' && typeof corpHash === 'function') ? corpRand(corpHash('dj' + a3)) : Math.random;
    const dj = 'DJ ' + HOLDER_FIRST[Math.floor(rnd() * HOLDER_FIRST.length)];
    stations.push({ id: 'co:' + a3, name: c.name + ' FM', genre: c.sector, dj, a3, icon: (SECTORS[c.sector] || {}).icon || '📻', desc: `The ${c.name} station.` });
  }
  for (const id in (S.extra || {})) {
    const b = S.extra[id];
    if (RADIO_MEDIA_SECTORS.indexOf(b.sector) < 0) continue;
    const rnd = (typeof corpRand === 'function' && typeof corpHash === 'function') ? corpRand(corpHash('djx' + id)) : Math.random;
    stations.push({ id: 'ex:' + id, name: b.name + ' FM', genre: b.sector, dj: 'DJ ' + HOLDER_FIRST[Math.floor(rnd() * HOLDER_FIRST.length)], icon: (SECTORS[b.sector] || {}).icon || '📻', desc: `The ${b.name} station.` });
  }
  RADIO_MUSIC.forEach(([name, genre, dj]) => stations.push({ id: 'music:' + name, name, genre, dj, desc: genre + ' all day.' }));
  return stations;
}
function radioTrack(station, idx) {
  if (station.id === 'news') {
    const news = S.news || [];
    if (!news.length) return { title: 'No headlines yet today.', artist: 'Ticker News', len: 120 };
    const n = news[idx % news.length];
    return { title: n.text.length > 80 ? n.text.slice(0, 77) + '…' : n.text, artist: 'Ticker News', len: 120 };
  }
  const rnd = (typeof corpRand === 'function' && typeof corpHash === 'function') ? corpRand(corpHash('track' + station.id + idx)) : Math.random;
  return {
    title: RADIO_TITLES[Math.floor(rnd() * RADIO_TITLES.length)],
    artist: RADIO_ARTISTS[Math.floor(rnd() * RADIO_ARTISTS.length)],
    len: 150 + Math.floor(rnd() * 150),
  };
}
function radioFmt(s) { const m = Math.floor(s / 60), ss = s % 60; return `${m}:${ss < 10 ? '0' : ''}${ss}`; }
function radioState() {
  if (!S.radio) S.radio = { favs: {} };
  if (!S.radio.favs) S.radio.favs = {};
  return S.radio;
}
const RADIO_TILE_COLORS = ['#e5484d', '#2f7cf6', '#12a150', '#7c4dff', '#e0812b', '#0ea5b7', '#d63384', '#1f5fd0', '#8a5a2b', '#334155'];
function radioTileColor(id) {
  const rnd = (typeof corpRand === 'function' && typeof corpHash === 'function') ? corpRand(corpHash('tile' + id)) : Math.random;
  return RADIO_TILE_COLORS[Math.floor(rnd() * RADIO_TILE_COLORS.length)];
}
function radioInitials(name) {
  const parts = (name || 'R').split(' ').filter(Boolean).slice(0, 2);
  return (parts.map(w => w[0].toUpperCase()).join('') || 'R');
}
function radioFreq(id) {
  const rnd = (typeof corpRand === 'function' && typeof corpHash === 'function') ? corpRand(corpHash('freq' + id)) : Math.random;
  return (88.1 + Math.floor(rnd() * 198) / 10).toFixed(1);
}
function radioSub(s) {
  const freq = radioFreq(s.id);
  if (s.id === 'news') return 'FM ' + freq + ' · Worldwide';
  if (s.a3) {
    const c = S.co[s.a3];
    const city = c ? (W.cities || []).find(x => x.id === c.city) : null;
    return 'FM ' + freq + ' · ' + (city ? city.name : cname(s.a3));
  }
  if (s.id.startsWith('ex:')) {
    const b = (S.extra || {})[s.id.slice(3)];
    const city = b && b.city ? (W.cities || []).find(x => x.id === b.city) : null;
    return 'FM ' + freq + ' · ' + (city ? city.name : (b ? cname(b.a3) : 'Worldwide'));
  }
  return 'FM ' + freq + ' · ' + s.genre;
}
function radioTickStart() {
  // Same heartbeat rule as the web rail: the panel re-renders often,
  // so never restart a running timer — just keep ticking.
  if (UI.radioTimer) return;
  if (UI.radioSlept) return;
  UI.radioTimer = setInterval(() => {
    const tEl = document.getElementById('radioTime'), pEl = document.getElementById('radioProgress');
    if (!tEl || !pEl) { clearInterval(UI.radioTimer); UI.radioTimer = null; return; }
    if (UI.radioSleepUntil && Date.now() >= UI.radioSleepUntil) {
      clearInterval(UI.radioTimer); UI.radioTimer = null;
      UI.radioSleepUntil = null; UI.radioSleepMin = 0; UI.radioSlept = true; renderPanel(); return;
    }
    UI.radioT = (UI.radioT || 0) + 1;
    const stations = radioStations();
    const sel = stations.find(s => s.id === (UI.radioStation || 'news')) || stations[0];
    const track = radioTrack(sel, UI.radioTrack || 0);
    if (UI.radioT >= track.len) { UI.radioT = 0; UI.radioTrack = (UI.radioTrack || 0) + 1; renderPanel(); return; }
    tEl.innerText = `${radioFmt(UI.radioT)} / ${radioFmt(track.len)}`;
    pEl.style.width = Math.min(100, UI.radioT / track.len * 100) + '%';
  }, 1000);
}
function radioPanelHTML() {
  const r = radioState();
  const view = UI.radioView || 'home';
  const stations = radioStations();
  const sel = stations.find(s => s.id === (UI.radioStation || 'news')) || stations[0];
  const track = radioTrack(sel, UI.radioTrack || 0);
  const t = UI.radioT || 0;
  const ads = (typeof activeAds === 'function') ? activeAds('radio') : [];
  const ad = ads.length ? ads[(UI.radioAdIdx || 0) % ads.length] : null;
  const adRead = ad
    ? `🎙️ ${sel.dj} says: "A word from our sponsor — ${ad.name}: ${adLineFor(ad, 'radio')}"`
    : `🎙️ ${sel.dj} says: "This hour is brought to you by... nobody yet. Your company could be here."`;
  const sleepLine = UI.radioSleepUntil
    ? `<p class="rr-note">💤 Sleep timer on — playback stops in about ${Math.max(1, Math.ceil((UI.radioSleepUntil - Date.now()) / 60000))} min.</p>`
    : (UI.radioSlept ? '<p class="rr-note">💤 Sleep timer ended — pick a station or hit Next to resume.</p>' : '');
  const tile = (s) => `<div class="rr-tile-wrap"><button class="rr-tile" data-a="radioStation" data-x="${s.id}"><span class="rr-tile-art" style="background:${radioTileColor(s.id)}">${radioInitials(s.name)}</span><span class="rr-tile-name">${esc(s.name)}</span></button><button class="rr-heart" data-a="radioFav" data-x="${s.id}">${r.favs[s.id] ? '❤️' : '🤍'}</button>${s.id === sel.id ? '<span class="rr-onair">ON AIR</span>' : ''}</div>`;
  let body = '';
  if (view === 'favs') {
    const favs = stations.filter(s => r.favs[s.id]);
    body = `<div class="rr-head"><h3>Favorites</h3><span>⋯</span></div>` + (favs.length ? favs.map(s => `<div class="rr-favrow"><button class="rr-favplay" data-a="radioStation" data-x="${s.id}"><span class="rr-mini" style="background:${radioTileColor(s.id)}">${radioInitials(s.name)}</span><span class="rr-favtxt"><b>${esc(s.name)}</b><span>${esc(radioSub(s))}</span></span></button><button class="rr-heart static" data-a="radioFav" data-x="${s.id}">❤️</button></div>`).join('') : '<p class="rr-empty">No favorites yet — tap 🤍 on any station.</p>');
  } else if (view === 'premium') {
    const sleepBtns = [0, 15, 30, 60].map(m => `<button class="rr-chip ${(UI.radioSleepMin || 0) === m ? 'on' : ''}" data-a="radioSleep" data-x="${m}">${m === 0 ? 'Off' : m + ' min'}</button>`).join('');
    body = `<div class="rr-prem"><div class="rr-prem-ic">((•))</div><h3>Robot Radio Premium</h3><p class="rr-prem-sub">Everything's already unlocked. No paywall, no subscription.</p>
    <div class="rr-perks"><span>✓ All stations, free</span><span>✓ Favorites, free</span><span>✓ Ad breaks fund the stations — that's how companies get heard</span></div>
    <h4>Sleep timer</h4><div class="rr-chips">${sleepBtns}</div>${sleepLine}</div>`;
  } else {
    const q = (UI.radioQuery || '').trim().toLowerCase();
    const shown = q ? stations.filter(s => (s.name + ' ' + s.genre + ' ' + s.dj).toLowerCase().includes(q)) : stations;
    body = `<div class="rr-search"><input id="radioSearch" class="rr-search-input" value="${esc(UI.radioQuery || '')}" placeholder="Search stations"><button class="rr-search-btn" data-a="radioSearch">Search</button></div>
    <div class="rr-player"><h4>📻 Now playing · ${esc(sel.name)}</h4><p class="rr-muted">${esc(sel.genre)} · hosted by ${esc(sel.dj)}</p>
    <div class="rr-track"><b>${esc(track.title)}</b><span class="rr-muted"> — ${esc(track.artist)}</span></div>
    <div class="rr-bar"><div id="radioProgress" class="rr-bar-fill" style="width:${Math.min(100, t / track.len * 100)}%"></div></div>
    <div class="rr-row"><span class="rr-muted" id="radioTime">${radioFmt(t)} / ${radioFmt(track.len)}</span><button class="rr-btn" data-a="radioNext">Next track ⏭</button></div>${sleepLine}</div>
    <div class="rr-ad"><h4>🎙️ Ad break</h4><p>${esc(adRead)}</p><div class="rr-row">${ads.length ? '<button class="rr-btn ghost" data-a="radioAdNext">Hear another ad</button>' : ''}<button class="rr-btn ghost" data-a="panel" data-x="offices">Buy a radio ad</button></div></div>
    <h3 class="rr-sec">${q ? 'Results' : 'Top Stations'}</h3><div class="rr-grid">${shown.map(tile).join('') || '<p class="rr-empty">No stations match that search.</p>'}</div>`;
  }
  const nav = `<div class="rr-nav"><button class="${view === 'home' ? 'on' : ''}" data-a="radioView" data-x="home">🏠<span>Home</span></button><button class="${view === 'premium' ? 'on' : ''}" data-a="radioView" data-x="premium">((•))<span>Premium</span></button><button class="${view === 'favs' ? 'on' : ''}" data-a="radioView" data-x="favs">❤️<span>Favorites</span></button></div>`;
  setTimeout(radioTickStart, 0);
  return panelShell('Robot Radio', 'Stations from real companies, plus music and news. Ads are read out by the DJ.', `<div class="rradio">${body}${nav}</div>`);
}
