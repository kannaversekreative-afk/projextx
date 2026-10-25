// Headless smoke test: runs the simulation and prints economy and world stats.
// Usage: node trader/tools/simcheck.js [years=20] [home=USA]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = path.join(__dirname, '..');
const ctx = vm.createContext({ Math, Set, JSON, Date, console, atob, Uint8Array, Float32Array, Int32Array, String, Object, Array,
  Path2D: class { moveTo() {} lineTo() {} closePath() {} }, localStorage: { getItem: () => null, setItem: () => {} } });
vm.runInContext(['data.js', 'world-data.js', 'world.js', 'sim.js', 'world-events.js'].map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n') + '\nvar W, S;', ctx);
const years = +process.argv[2] || 20, home = process.argv[3] || 'USA';
console.log(vm.runInContext(`(() => {
  const t0 = Date.now(); W = buildWorld(); const tw = Date.now() - t0;
  S = newGame({ mode: 'infinite', home: '${home}', name: 'Tester' }); const tn = Date.now() - t0 - tw;
  const h = homeCo();
  const sec = {}; for (const a in S.co) sec[S.co[a].sector] = (sec[S.co[a].sector] || 0) + 1;
  const firstWeek = Object.values(S.co).map(c => c.week.profit); const losing = firstWeek.filter(p => p < 0).length;
  const caps = Object.values(S.co).map(c => companyValue(c)).sort((a, b) => b - a);
  const secP = () => { const o = {}; for (const a in S.co) { const c = S.co[a]; o[c.sector] = o[c.sector] || [0, 0, 0]; o[c.sector][0] += c.avg; o[c.sector][1]++; if (c.avg < 0) o[c.sector][2]++; } return Object.entries(o).map(([k, v]) => k + ' avg ' + fmtMoney(v[0] / v[1], true) + ' losing ' + v[2]).join(' | '); };
  const fvSum = () => Object.values(S.co).reduce((a, c) => a + companyFairTotal(c), 0);
  const p0 = secP(), f0 = fvSum();
  const t1 = Date.now(); const wars = new Set(); let occ = 0;
  for (let d = 0; d < 365 * ${years}; d++) {
    if (d % 30 === 0 && S.cash > buildCost(h, 0) * 2) { const lot = cityLots(h.city).filter(l => l.kind === 'lease').sort((a, b) => b.traffic - a.traffic)[0]; if (lot) leaseLot(S.home, lot.t, 0); }
    if (d === 200 && h.web.tier === 0) buyWebTier(S.home);
    stepDay(); S.wars.forEach(w => wars.add(w.a + '>' + w.b));
  }
  for (const a in S.countries) if (S.countries[a].occ) occ++;
  return JSON.stringify({ worldMs: tw, newGameMs: tn, simMs: Date.now() - t1, sectors: sec, losingAtStart: losing,
    biggest: caps.slice(0, 3).map(v => fmtMoney(v, true)), smallest: caps.slice(-3).map(v => fmtMoney(v, true)),
    home: h.name + ' (' + h.sector + ')', homeLocs: h.locs.length, homeFleet: h.fleet, homeWeek: Math.round(h.week.profit), homeLocProfits: h.locs.map(l => Math.round(l.profit)).join(','),
    netWorth: fmtMoney(netWorth(), true), cash: fmtMoney(S.cash, true), index: S.idx.v.toFixed(0), wars: wars.size, occupied: occ,
    pop: fmtPop(nationPop()) + ' ' + fmtPct(popGrowth()), career: careerName(), sectorsStart: p0, sectorsEnd: secP(), fairStart: fmtMoney(f0, true), fairEnd: fmtMoney(fvSum(), true), saveKB: Math.round(JSON.stringify(S).length / 1024), parts: Object.fromEntries(Object.keys(S).map(k => [k, Math.round(JSON.stringify(S[k]).length / 1024)]).filter(x => x[1] > 20)), coParts: (() => { const o = {}; for (const a in S.co) for (const k in S.co[a]) o[k] = (o[k] || 0) + JSON.stringify(S.co[a][k] || 0).length; return Object.fromEntries(Object.entries(o).filter(x => x[1] > 20000).map(x => [x[0], Math.round(x[1] / 1024)])); })() }, null, 1);
})()`, ctx));
