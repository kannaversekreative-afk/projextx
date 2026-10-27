// ---------- Karma ----------
// Your reputation as a score, like a credit score: 300-850, built
// only from real in-game stats — popularity, public opinion, fame,
// visibility, companies you control, the office you hold, and open
// loans dragging it down. One history entry per game year; tapping a
// year shows exactly why the score moved versus the previous year.
function karmaOfficeBonus(title) {
  if (!title) return 0;
  if (/President|King|Emperor/.test(title)) return 50;
  if (/Governor/.test(title)) return 30;
  if (/Mayor/.test(title)) return 15;
  return 0;
}
function karmaFactors() {
  const P = ensurePerson();
  const cos = (typeof mine === 'function') ? mine().length : 0;
  const office = (P.office && P.office.title) || '';
  const loans = Array.isArray(S.loans) ? S.loans.filter(l => l.weeksLeft > 0).length : 0;
  const pts = {
    pop: Math.round(P.pop * 1.5),
    opin: Math.round(P.opin * 1.5),
    fame: Math.round(P.fame),
    vis: Math.round(P.vis * 0.5),
    cos: Math.min(cos, 5) * 10,
    office: karmaOfficeBonus(office),
    loans: -Math.min(loans, 5) * 10,
  };
  const score = Math.max(300, Math.min(850, 300 + pts.pop + pts.opin + pts.fame + pts.vis + pts.cos + pts.office + pts.loans));
  return { pop: P.pop, opin: P.opin, fame: P.fame, vis: P.vis, cos, office, loans, pts, score };
}
function karmaBand(score) {
  if (score < 550) return 'Needs Work';
  if (score < 650) return 'Fair';
  if (score < 750) return 'Good';
  return 'Excellent';
}
function karmaState() {
  if (!S.karma || !Array.isArray(S.karma.hist)) S.karma = { hist: [] };
  return S.karma;
}
function karmaRecord() {
  const k = karmaState();
  const f = karmaFactors();
  const year = gameYear();
  let e = k.hist.find(h => h.year === year);
  if (!e) { e = { year }; k.hist.push(e); }
  e.score = f.score; e.pop = f.pop; e.opin = f.opin; e.fame = f.fame; e.vis = f.vis;
  e.cos = f.cos; e.office = f.office; e.loans = f.loans; e.pts = f.pts;
  k.hist.sort((a, b) => a.year - b.year);
  return f;
}
function karmaChart(hist) {
  const W = 320, H = 120, pad = 8;
  const xs = i => hist.length === 1 ? W / 2 : pad + i * (W - pad * 2) / (hist.length - 1);
  const ys = s => H - pad - (s - 300) / 550 * (H - pad * 2);
  const pts = hist.map((h, i) => `${xs(i).toFixed(1)},${ys(h.score).toFixed(1)}`).join(' ');
  const dots = hist.map((h, i) => `<circle cx="${xs(i).toFixed(1)}" cy="${ys(h.score).toFixed(1)}" r="4" fill="#2f7cf6"/>`).join('');
  return `<svg class="karma-chart" viewBox="0 0 ${W} ${H}" width="100%">${hist.length > 1 ? `<polyline points="${pts}" fill="none" stroke="#2f7cf6" stroke-width="2"/>` : ''}${dots}</svg>
  <div class="karma-axis"><span>${hist[0].year}</span><span>${hist[hist.length - 1].year}</span></div>`;
}
function karmaPanelHTML() {
  const f = karmaRecord();
  const k = karmaState();
  const hist = k.hist;
  const cur = hist[hist.length - 1];
  const prev = hist.length > 1 ? hist[hist.length - 2] : null;
  const delta = prev ? cur.score - prev.score : null;
  const deltaTxt = delta === null ? 'First year — no previous year to compare.' :
    delta === 0 ? 'No change since last year.' :
    (delta > 0 ? `+${delta} since last year.` : `${delta} since last year.`);
  const rows = hist.slice().reverse().map(h => {
    const p = hist[hist.indexOf(h) - 1];
    const d = p ? h.score - p.score : null;
    const open = UI.karmaYear === String(h.year);
    let detail = '';
    if (open) {
      const lines = [
        ['Popularity', h.pop, h.pts.pop, p ? h.pts.pop - p.pts.pop : null],
        ['Public opinion', h.opin, h.pts.opin, p ? h.pts.opin - p.pts.opin : null],
        ['Fame', h.fame, h.pts.fame, p ? h.pts.fame - p.pts.fame : null],
        ['Visibility', h.vis, h.pts.vis, p ? h.pts.vis - p.pts.vis : null],
        ['Companies controlled', h.cos, h.pts.cos, p ? h.pts.cos - p.pts.cos : null],
        ['Office', h.office || 'None', h.pts.office, p ? h.pts.office - p.pts.office : null],
        ['Open loans', h.loans, h.pts.loans, p ? h.pts.loans - p.pts.loans : null],
      ];
      detail = `<div class="karma-detail">${lines.map(([label, val, pt, ch]) => `<div class="kv"><span>${label}: ${esc(String(val))}</span><span>${pt >= 0 ? '+' : ''}${pt} pts${ch === null ? '' : ` (${ch >= 0 ? '+' : ''}${ch})`}</span></div>`).join('')}
      <p class="muted small">${p ? 'Change in points vs the previous year in brackets.' : 'First year — no previous year to compare.'}</p></div>`;
    }
    return `<div class="card in"><button class="karma-year" data-a="karmaYear" data-x="${h.year}"><b>${h.year}</b><span>${h.score} · ${karmaBand(h.score)}</span><span class="muted small">${d === null ? 'first year' : (d === 0 ? 'no change' : (d > 0 ? '+' + d : d))}</span></button>${detail}</div>`;
  }).join('');
  return panelShell('Karma', 'Your reputation score — built from what you actually do in the game',
    `<div class="karma-hero"><div class="karma-score">${f.score}</div><div class="karma-band">${karmaBand(f.score)}</div>
    <p class="muted small">${deltaTxt} Next update at the new year.</p></div>
    <div class="card in"><h4>Score over time</h4>${karmaChart(hist)}</div>
    <div class="card in"><h4>What feeds it now</h4>
    <div class="kv"><span>Popularity ${f.pop}</span><span>+${f.pts.pop} pts</span></div>
    <div class="kv"><span>Public opinion ${f.opin}</span><span>+${f.pts.opin} pts</span></div>
    <div class="kv"><span>Fame ${f.fame}</span><span>+${f.pts.fame} pts</span></div>
    <div class="kv"><span>Visibility ${f.vis}</span><span>+${f.pts.vis} pts</span></div>
    <div class="kv"><span>Companies controlled ${f.cos}</span><span>+${f.pts.cos} pts</span></div>
    <div class="kv"><span>Office ${f.office || 'None'}</span><span>+${f.pts.office} pts</span></div>
    <div class="kv"><span>Open loans ${f.loans}</span><span>${f.pts.loans} pts</span></div></div>
    <h4>See what changed</h4><p class="muted small">Tap a year to see why your score moved.</p>${rows}`);
}
