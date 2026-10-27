// ---------- city unlock ----------
// You start with only ONE city unlocked, and pay for the next city.
// Cost, decided by the assistant (Nicholas: "idk, up to you"): $25,000,
// paid from business cash — the same wallet expansion costs use.
// Scope, on purpose, so this does not break other modes:
// - Only flow games (new tycoon games, S.flow) use city unlock.
//   Leader games inherit a whole country, Worl Mode and Random World
//   have their own maps, and old saves (no unlockedCities list) stay
//   fully open — this never locks a city you already had.
// - Only home-country cities are gated. Foreign expansion still
//   follows the existing flow rule (office + full board), on top.
// - The starting city is the largest non-capital city in your home
//   country (for the USA, New York — not Washington, D.C., which is
//   government-only). The capital itself costs $25,000 like any
//   other city, which is the progression into politics.
function startingCityFor(a3) {
  const cities = (W.cities || []).filter(c => c.a3 === a3);
  if (!cities.length) return null;
  const cap = W.byA3[a3] ? W.byA3[a3].capital : null;
  const playable = cities.filter(c => c.id !== cap);
  const pool = playable.length ? playable : cities;
  pool.sort((x, y) => y.pop - x.pop);
  return pool[0].id;
}
function isCityUnlocked(cityId) {
  if (!S) return true;
  if (S.leader) return true;
  if (!S.flow) return true;
  if (!Array.isArray(S.unlockedCities)) return true;
  const city = W.cities[cityId];
  if (!city || city.a3 !== S.home) return true;
  return S.unlockedCities.includes(cityId);
}
function unlockCity(cityId) {
  const city = W.cities[cityId];
  if (!city) return 'That city does not exist.';
  if (isCityUnlocked(cityId)) return 'That city is already unlocked.';
  const cost = (typeof CITY_UNLOCK_COST !== 'undefined') ? CITY_UNLOCK_COST : 25000;
  if (S.cash < cost) return `Unlocking ${city.name} costs ${fmtMoney(cost, true)} from business cash (you have ${fmtMoney(S.cash, true)}).`;
  S.cash -= cost;
  if (!Array.isArray(S.unlockedCities)) S.unlockedCities = [];
  S.unlockedCities.push(cityId);
  if (typeof news === 'function') news('Business', `You unlocked ${city.name} for ${fmtMoney(cost, true)}.`, city.a3);
  return null;
}
