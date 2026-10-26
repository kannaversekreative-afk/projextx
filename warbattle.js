// ---------- battle grid mini-game engine (shared by war invasions and the
// standalone Mini Games lobby) ----------
// One engine, two paths. The war path uses in-game cash (S.cash) for the
// toolbar and, on a win, wins the war with NO troops lost in the main
// game. The standalone path uses its own battle fund, has no country
// attached, and can be replayed round after round. No DOM here: the
// engine is pure data, so it can be driven by a panel, a modal, or a
// headless harness.
//
// Board: tiles in row-major order. The first half belongs to the enemy
// (top), the second half to the player (bottom). Each side starts with
// 50 units in one corner tile: player bottom-left, enemy top-right.
// Every tile its side owns generates 1 unit per second for that side
// (plus structure bonuses). Capacity per tile starts at 100.

// Costs table — the one obvious place to retune every toolbar price.
// In the war path these are in-game cash. In the standalone path they
// are battle credits from the standalone fund below.
const BATTLE_ITEMS = [
  // Structures: placed on a tile you own. One structure per tile.
  { id: 'city', name: 'City', icon: '🏙️', kind: 'structure', cost: 25000000, desc: 'Capacity +200 on this tile' },
  { id: 'port', name: 'Port', icon: '⚓', kind: 'structure', cost: 15000000, desc: 'Generation +1, capacity +50' },
  { id: 'factory', name: 'Factory', icon: '🏭', kind: 'structure', cost: 20000000, desc: 'Generation +2 on this tile' },
  { id: 'defense', name: 'Defense', icon: '🛡️', kind: 'structure', cost: 10000000, desc: 'Defenders on this tile count double' },
  { id: 'sam', name: 'SAM', icon: '🚀', kind: 'structure', cost: 30000000, desc: 'Weapon damage halved on this tile' },
  { id: 'silo', name: 'Silo', icon: '🏗️', kind: 'structure', cost: 40000000, desc: 'Unlocks Atom, H-Bomb, MIRV, Mega' },
  { id: 'warship', name: 'Warship', icon: '🚢', kind: 'structure', cost: 35000000, desc: 'Attacks from this tile hit +20' },
  { id: 'airfield', name: 'Airfield', icon: '✈️', kind: 'structure', cost: 20000000, desc: 'Unlocks Strike' },
  // Troops: bought units, placed on a tile you own.
  { id: 'troops', name: 'Troops', icon: '🪖', kind: 'buy', cost: 2000000, desc: '+50 units on the selected tile' },
  // Weapons: fired at an enemy tile. Cost is per shot.
  { id: 'slug', name: 'Slug', icon: '🔩', kind: 'weapon', cost: 2000000, dmg: 5, range: 'adjacent', desc: '5 damage, adjacent enemy tile' },
  { id: 'artillery', name: 'Artillery', icon: '💥', kind: 'weapon', cost: 5000000, dmg: 10, range: 'adjacent', desc: '10 damage, adjacent enemy tile' },
  { id: 'strike', name: 'Strike', icon: '🎯', kind: 'weapon', cost: 15000000, dmg: 25, range: 'any', requires: 'airfield', desc: '25 damage, any enemy tile' },
  { id: 'railgun', name: 'Railgun', icon: '⚡', kind: 'weapon', cost: 25000000, dmg: 40, range: 'any', desc: '40 damage, any enemy tile' },
  { id: 'atom', name: 'Atom', icon: '☢️', kind: 'weapon', cost: 50000000, dmg: 50, range: 'any', requires: 'silo', desc: '50 damage, any enemy tile' },
  { id: 'mirv', name: 'MIRV', icon: '🎆', kind: 'weapon', cost: 80000000, dmg: 30, range: 'any', requires: 'silo', splash: true, desc: '30 damage to target and adjacent enemy tiles' },
  { id: 'hbomb', name: 'H-Bomb', icon: '💣', kind: 'weapon', cost: 100000000, dmg: 100, range: 'any', requires: 'silo', desc: '100 damage, any enemy tile' },
  { id: 'mega', name: 'Mega', icon: '🌋', kind: 'weapon', cost: 200000000, dmg: 200, range: 'any', requires: 'silo', desc: '200 damage, any enemy tile' },
  { id: 'scatter', name: 'Scatter', icon: '✨', kind: 'weapon', cost: 10000000, dmg: 15, range: 'any', splashWeak: true, desc: '15 damage to target, 5 to adjacent enemy tiles' },
];
const BATTLE_ITEM_BY_ID = {};
BATTLE_ITEMS.forEach(i => { BATTLE_ITEM_BY_ID[i.id] = i; });
// Standalone battle fund: enough for several toolbar buys (Mega is the
// most expensive item at 200M). Replenished fresh every round.
const BATTLE_STANDALONE_FUND = 200000000;
const BATTLE_START_UNITS = 50;
// Size/shape options for the standalone lobby. War invasions stay 6x6
// grid unless the player picks another size in Settings.
const BATTLE_SIZE_OPTIONS = [
  { id: '4x4', label: '4 × 4', w: 4, h: 4, shape: 'grid' },
  { id: '6x6', label: '6 × 6', w: 6, h: 6, shape: 'grid' },
  { id: '8x8', label: '8 × 8', w: 8, h: 8, shape: 'grid' },
  { id: '10x10', label: '10 × 10', w: 10, h: 10, shape: 'grid' },
  { id: 'wide8x6', label: 'Wide 8 × 6', w: 8, h: 6, shape: 'grid' },
  { id: 'tall6x8', label: 'Tall 6 × 8', w: 6, h: 8, shape: 'grid' },
  { id: 'wide10x6', label: 'Wide 10 × 6', w: 10, h: 6, shape: 'grid' },
  { id: 'tall6x10', label: 'Tall 6 × 10', w: 6, h: 10, shape: 'grid' },
  { id: 'ring8x8', label: 'Ring 8 × 8', w: 8, h: 8, shape: 'ring' },
];
function battleSizeOption(id) {
  return BATTLE_SIZE_OPTIONS.find(o => o.id === id) || BATTLE_SIZE_OPTIONS[1];
}
// Tiles for a board. 'grid' = every cell. 'ring' = border cells only
// (same tile engine, just fewer tiles — the middle is empty ground).
function battleTiles(w, h, shape) {
  const tiles = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (shape === 'ring' && x > 0 && y > 0 && x < w - 1 && y < h - 1) continue;
    tiles.push({ x, y });
  }
  return tiles;
}
function makeBattle(opts) {
  opts = opts || {};
  const size = battleSizeOption(opts.size || '6x6');
  const cells = battleTiles(size.w, size.h, size.shape);
  const half = Math.floor(cells.length / 2);
  const tiles = cells.map((c, i) => ({
    x: c.x, y: c.y, owner: i < half ? 'enemy' : 'player',
    units: 0, cap: 100, gen: 1, defMult: 1, sam: false, silo: false,
    airfield: false, warship: false, structure: null,
  }));
  // Corner starts: player bottom-left, enemy top-right (of their half).
  const playerTiles = tiles.filter(t => t.owner === 'player');
  const enemyTiles = tiles.filter(t => t.owner === 'enemy');
  const playerCorner = playerTiles.reduce((a, t) => (t.y > a.y || (t.y === a.y && t.x < a.x)) ? t : a, playerTiles[0]);
  const enemyCorner = enemyTiles.reduce((a, t) => (t.y < a.y || (t.y === a.y && t.x > a.x)) ? t : a, enemyTiles[0]);
  playerCorner.units = BATTLE_START_UNITS;
  enemyCorner.units = BATTLE_START_UNITS;
  const b = {
    w: size.w, h: size.h, shape: size.shape, sizeId: size.id,
    tiles, status: 'playing', selected: tiles.indexOf(playerCorner),
    weapon: null, mode: opts.mode || 'standalone',
    target: opts.target || null, plan: opts.plan || null,
    // War path: funds come from S.cash at spend time. Standalone: its own fund.
    funds: opts.mode === 'war' ? null : BATTLE_STANDALONE_FUND,
    enemyFunds: opts.mode === 'war' ? (opts.enemyFunds || BATTLE_STANDALONE_FUND) : BATTLE_STANDALONE_FUND,
    resolved: false,
  };
  return b;
}
function battleTileIndex(b, x, y) {
  for (let i = 0; i < b.tiles.length; i++) if (b.tiles[i].x === x && b.tiles[i].y === y) return i;
  return -1;
}
function battleAdjacent(b, a, c) {
  const ta = b.tiles[a], tc = b.tiles[c];
  if (!ta || !tc) return false;
  return Math.abs(ta.x - tc.x) + Math.abs(ta.y - tc.y) === 1;
}
function battleCounts(b) {
  let pt = 0, et = 0, pu = 0, eu = 0;
  b.tiles.forEach(t => { if (t.owner === 'player') { pt++; pu += t.units; } else { et++; eu += t.units; } });
  return { playerTiles: pt, enemyTiles: et, playerUnits: pu, enemyUnits: eu };
}
function battleUpdateStatus(b) {
  if (b.status !== 'playing') return b.status;
  const c = battleCounts(b);
  if (c.enemyTiles === 0) b.status = 'won';
  else if (c.playerTiles === 0) b.status = 'lost';
  return b.status;
}
// Funds: war path spends real in-game cash; standalone spends its fund.
function battleFunds(b) {
  if (b.mode === 'war') return (typeof S !== 'undefined' && S) ? S.cash : 0;
  return b.funds;
}
function battleSpend(b, amount) {
  if (b.mode === 'war') {
    if (typeof S === 'undefined' || !S || S.cash < amount) return false;
    S.cash = Math.max(0, S.cash - amount); return true;
  }
  if (b.funds < amount) return false;
  b.funds -= amount; return true;
}
function battleSideHasStructure(b, side, structure) {
  return b.tiles.some(t => t.owner === side && t.structure === structure);
}
// Move units from one tile to an adjacent tile. Own -> own: transfer.
// Own -> enemy: attack. Returns err string or null.
function battleMove(b, from, to, amount) {
  if (b.status !== 'playing') return 'Battle is over.';
  const f = b.tiles[from], t = b.tiles[to];
  if (!f || !t) return 'No such tile.';
  if (f.owner !== 'player') return 'Move from your own tile.';
  if (!battleAdjacent(b, from, to)) return 'Tiles must be next to each other.';
  amount = Math.min(amount, f.units);
  if (amount <= 0) return 'No units to move.';
  if (t.owner === 'player') {
    const room = Math.max(0, t.cap - t.units);
    const moved = Math.min(amount, room);
    if (moved <= 0) return 'That tile is full.';
    f.units -= moved; t.units += moved;
    return null;
  }
  // Attack: warship on the attacking tile adds +20, Defense doubles defenders.
  const attack = amount + (f.warship ? 20 : 0);
  const defense = t.units * (t.defMult || 1);
  f.units -= amount;
  if (attack > defense) {
    t.owner = 'player'; t.units = Math.min(t.cap, Math.max(1, attack - defense));
    battleUpdateStatus(b);
  } else {
    t.units = Math.max(0, t.units - attack / (t.defMult || 1));
  }
  return null;
}
// Buy a structure or troops on a tile you own. Returns err or null.
function battleBuy(b, itemId, tileIdx) {
  if (b.status !== 'playing') return 'Battle is over.';
  const item = BATTLE_ITEM_BY_ID[itemId];
  if (!item || (item.kind !== 'structure' && item.kind !== 'buy')) return 'Not a build item.';
  const t = b.tiles[tileIdx];
  if (!t || t.owner !== 'player') return 'Build on your own tile.';
  if (item.kind === 'structure' && t.structure) return 'That tile already has a structure.';
  if (!battleSpend(b, item.cost)) return 'Not enough cash.';
  if (item.kind === 'buy') { t.units = Math.min(t.cap, t.units + 50); return null; }
  t.structure = item.id;
  if (item.id === 'city') t.cap += 200;
  if (item.id === 'port') { t.cap += 50; t.gen += 1; }
  if (item.id === 'factory') t.gen += 2;
  if (item.id === 'defense') t.defMult = 2;
  if (item.id === 'sam') t.sam = true;
  if (item.id === 'silo') t.silo = true;
  if (item.id === 'warship') t.warship = true;
  if (item.id === 'airfield') t.airfield = true;
  return null;
}
// Fire a weapon at an enemy tile. Returns err or null.
function battleWeapon(b, itemId, tileIdx, side) {
  side = side || 'player';
  if (b.status !== 'playing') return 'Battle is over.';
  const item = BATTLE_ITEM_BY_ID[itemId];
  if (!item || item.kind !== 'weapon') return 'Not a weapon.';
  const t = b.tiles[tileIdx];
  if (!t || t.owner !== (side === 'player' ? 'enemy' : 'player')) return 'Fire at an enemy tile.';
  if (item.range === 'adjacent') {
    const from = side === 'player' ? b.selected : null;
    if (side === 'player' && (from == null || !battleAdjacent(b, from, tileIdx))) return 'That weapon only reaches a tile next to your selected tile.';
  }
  if (item.requires && !battleSideHasStructure(b, side, item.requires)) {
    return 'You need a ' + BATTLE_ITEM_BY_ID[item.requires].name + ' first.';
  }
  // Spending: the player spends cash/fund; the AI spends its own fund.
  if (side === 'player') { if (!battleSpend(b, item.cost)) return 'Not enough cash.'; }
  else { if (b.enemyFunds < item.cost) return 'Enemy cannot afford that.'; b.enemyFunds -= item.cost; }
  const hit = (tile, dmg) => {
    if (!tile || tile.owner !== (side === 'player' ? 'enemy' : 'player')) return;
    const eff = tile.sam ? dmg / 2 : dmg;
    if (eff >= tile.units) { tile.owner = side; tile.units = 0; }
    else tile.units -= eff;
  };
  hit(t, item.dmg);
  if (item.splash || item.splashWeak) {
    const splash = item.splash ? item.dmg : 5;
    b.tiles.forEach((ot, i) => { if (i !== tileIdx && battleAdjacent(b, tileIdx, i)) hit(ot, splash); });
  }
  battleUpdateStatus(b);
  return null;
}
// Generation: every owned tile gains gen units per second, up to capacity.
function battleTick(b, dt) {
  if (b.status !== 'playing' || !dt || dt <= 0) return;
  b.tiles.forEach(t => { t.units = Math.min(t.cap, t.units + t.gen * dt); });
  battleUpdateStatus(b);
}
// Simple enemy AI, one turn: attack weak neighbours, move toward the
// player, buy troops on its corner, and fire cheap weapons when it pays.
function battleAITurn(b) {
  if (b.status !== 'playing') return;
  const playerCorner = b.tiles[b.selected] || b.tiles.find(t => t.owner === 'player');
  const aiTiles = b.tiles.map((t, i) => ({ t, i })).filter(x => x.t.owner === 'enemy').sort((a, b2) => b2.t.units - a.t.units);
  aiTiles.forEach(({ t, i }) => {
    if (b.status !== 'playing' || t.units <= 0) return;
    // Adjacent player tile? Attack with half the units (all if overwhelming).
    const adjPlayer = b.tiles.map((ot, oi) => ({ ot, oi })).filter(x => x.ot.owner === 'player' && battleAdjacent(b, i, x.oi)).sort((a, b2) => a.ot.units - b2.ot.units)[0];
    if (adjPlayer) {
      const amount = t.units > adjPlayer.ot.units * 2 ? t.units : Math.floor(t.units / 2);
      if (amount > 0) {
        const attack = amount, defense = adjPlayer.ot.units * (adjPlayer.ot.defMult || 1);
        t.units -= amount;
        if (attack > defense) { adjPlayer.ot.owner = 'enemy'; adjPlayer.ot.units = Math.min(adjPlayer.ot.cap, Math.max(1, attack - defense)); }
        else adjPlayer.ot.units = Math.max(0, adjPlayer.ot.units - attack / (adjPlayer.ot.defMult || 1));
      }
      return;
    }
    // Otherwise move half toward the player's corner tile.
    if (playerCorner) {
      const adjOwn = b.tiles.map((ot, oi) => ({ ot, oi })).filter(x => x.ot.owner === 'enemy' && battleAdjacent(b, i, x.oi));
      if (adjOwn.length) {
        const best = adjOwn.sort((a, b2) => (Math.abs(a.ot.x - playerCorner.x) + Math.abs(a.ot.y - playerCorner.y)) - (Math.abs(b2.ot.x - playerCorner.x) + Math.abs(b2.ot.y - playerCorner.y)))[0];
        const moved = Math.min(Math.floor(t.units / 2), Math.max(0, best.ot.cap - best.ot.units));
        if (moved > 0) { t.units -= moved; best.ot.units += moved; }
      }
    }
  });
  // AI buys troops on its corner if it can afford them.
  const corner = b.tiles.filter(t => t.owner === 'enemy').reduce((a, t) => (t.y < a.y || (t.y === a.y && t.x > a.x)) ? t : a, null);
  if (corner && b.enemyFunds >= BATTLE_ITEM_BY_ID.troops.cost) { b.enemyFunds -= BATTLE_ITEM_BY_ID.troops.cost; corner.units = Math.min(corner.cap, corner.units + 50); }
  // AI fires artillery at the weakest player tile when it is cheap to do so.
  const weak = b.tiles.filter(t => t.owner === 'player').sort((a, b2) => a.units - b2.units)[0];
  if (weak && weak.units < 20 && b.enemyFunds >= BATTLE_ITEM_BY_ID.artillery.cost) {
    b.enemyFunds -= BATTLE_ITEM_BY_ID.artillery.cost;
    const idx = b.tiles.indexOf(weak);
    const dmg = weak.sam ? 5 : 10;
    if (dmg >= weak.units) { weak.owner = 'enemy'; weak.units = 0; } else weak.units -= dmg;
    void idx;
  }
  battleUpdateStatus(b);
}
