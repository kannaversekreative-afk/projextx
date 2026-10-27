'use strict';
// Robot Radio: the in-game radio app. Stations come from real
// companies — any flagship in a media sector gets its own station —
// plus standard music stations and a Ticker news station. The DJ
// "says" the ads: ad breaks read out the paying radio advertisers,
// in character, as part of the show. (Text reads: the show pretends
// to say them; there is no audio stream.)
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
function radioTickStart() {
  // Same heartbeat rule as the web rail: the panel re-renders often,
  // so never restart a running timer — just keep ticking.
  if (UI.radioTimer) return;
  UI.radioTimer = setInterval(() => {
    const tEl = document.getElementById('radioTime'), pEl = document.getElementById('radioProgress');
    if (!tEl || !pEl) { clearInterval(UI.radioTimer); UI.radioTimer = null; return; }
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
  const stations = radioStations();
  const sel = stations.find(s => s.id === (UI.radioStation || 'news')) || stations[0];
  const track = radioTrack(sel, UI.radioTrack || 0);
  const t = UI.radioT || 0;
  const ads = (typeof activeAds === 'function') ? activeAds('radio') : [];
  const ad = ads.length ? ads[(UI.radioAdIdx || 0) % ads.length] : null;
  const adRead = ad
    ? `🎙️ ${sel.dj} says: "A word from our sponsor — ${ad.name}: ${adLineFor(ad, 'radio')}"`
    : `🎙️ ${sel.dj} says: "This hour is brought to you by... nobody yet. Your company could be here."`;
  setTimeout(radioTickStart, 0);
  return panelShell('Robot Radio', 'Stations from real companies, plus music and news. Ads are read out by the DJ.',
    `<div class="card in"><h4>📻 Now playing · ${esc(sel.name)}</h4><p class="muted small">${esc(sel.genre)} · hosted by ${esc(sel.dj)}</p>
    <div><b>${esc(track.title)}</b><span class="muted"> — ${esc(track.artist)}</span></div>
    <div style="background:#dbeafe;height:10px;border-radius:5px;margin:8px 0"><div id="radioProgress" style="width:${Math.min(100, t / track.len * 100)}%;background:#2563eb;height:10px;border-radius:5px"></div></div>
    <div class="row wrap"><span class="muted small" id="radioTime">${radioFmt(t)} / ${radioFmt(track.len)}</span><button class="btn small" data-a="radioNext">Next track ⏭</button></div></div>
    <div class="card in"><h4>🎙️ Ad break</h4><p>${esc(adRead)}</p><div class="row wrap">${ads.length ? '<button class="btn small" data-a="radioAdNext">Hear another ad</button>' : ''}<button class="btn small" data-a="panel" data-x="ads">Buy a radio ad</button></div><p class="muted small">Ad reads rotate through the companies paying for radio this week.</p></div>
    <div class="card in"><h4>Stations</h4><div class="list">${stations.map(s => `<button class="srow" data-a="radioStation" data-x="${s.id}"><span class="avatar">${s.icon || '📻'}</span><span class="sname"><b>${esc(s.name)}</b><small>${esc(s.genre)} · ${esc(s.dj)}</small></span>${s.id === sel.id ? '<span class="tagp green">ON AIR</span>' : ''}</button>`).join('')}</div></div>`);
}
