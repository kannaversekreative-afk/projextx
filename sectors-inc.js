// Worl Inc. sectors + business types.
// Nicholas's 9 sectors, with his screenshot buildings as the first
// buildable set. Starter numbers only — he tunes costs and income.
// Income is per second at level 1; each upgrade level multiplies it by
// the level (level 2 earns 2x, level 3 earns 3x, up to level 5).
// Two screenshot buildings do not fit his 9 sectors (City Hall,
// Sports Stadium) — they live under "Special" until he places them.
const INC_SECTORS = [
  { id: 'residential', name: 'Residential', blurb: 'Homes people live in.', types: [
    { id: 'residential', name: 'Residential Complex', cost: 40000, income: 12 } ] },
  { id: 'commercial', name: 'Commercial', blurb: 'Shops and food people buy from.', types: [
    { id: 'store', name: 'Store', cost: 5000, income: 2 },
    { id: 'office', name: 'Office', cost: 25000, income: 8 },
    { id: 'mall', name: 'Mall', cost: 80000, income: 30 },
    { id: 'commercialbldg', name: 'Commercial Building', cost: 60000, income: 22 },
    { id: 'auction', name: 'Auction House', cost: 20000, income: 7 } ] },
  { id: 'industrial', name: 'Industrial', blurb: 'Factories and warehouses.', types: [
    { id: 'factory', name: 'Factory', cost: 100000, income: 40 },
    { id: 'industrial', name: 'Industrial Complex', cost: 120000, income: 45 } ] },
  { id: 'transportation', name: 'Transportation', blurb: 'Moving people and goods.', types: [
    { id: 'auto', name: 'Auto Dealership', cost: 30000, income: 11 } ] },
  { id: 'farming', name: 'Farming', blurb: 'Food from the land.', types: [] },
  { id: 'mining', name: 'Mining', blurb: 'Ore and stone from the ground.', types: [] },
  { id: 'technology', name: 'Technology', blurb: 'Software and electronics.', types: [] },
  { id: 'energy', name: 'Energy', blurb: 'Power for everything.', types: [] },
  { id: 'finance', name: 'Finance', blurb: 'Money working for money.', types: [
    { id: 'bank', name: 'Bank', cost: 50000, income: 20 } ] },
];
const INC_SPECIAL = [
  { id: 'cityhall', name: 'City Hall', cost: 150000, income: 50 },
  { id: 'stadium', name: 'Sports Stadium', cost: 200000, income: 70 },
];
function incSectorById(id) {
  if (id === 'special') return { id: 'special', name: 'Special', blurb: 'Buildings that do not fit a sector yet.', types: INC_SPECIAL };
  return INC_SECTORS.find(s => s.id === id) || null;
}
function incTypeById(sec, tid) { return (sec && sec.types.find(t => t.id === tid)) || null; }
