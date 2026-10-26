'use strict';
// Airport — an airport in every country. Fly to any city by tapping
// continent, then country, then city. The departures board shows the
// distance in km from where you are now, and tapping a city flies you
// there and opens it. Every country has an airport, so the picker is
// the whole world, not just your home country.
function airportContinents() {
  const seen = {};
  W.playable.forEach(k => { if (k.cont) seen[k.cont] = (seen[k.cont] || 0) + 1; });
  return Object.keys(seen).sort().map(c => ({ name: c, count: seen[c] }));
}
function airportCountries(cont) {
  return W.playable.filter(k => k.cont === cont).sort((a, b) => a.name.localeCompare(b.name));
}
function airportCities(a3) {
  // Every city in the country, capital first, then major cities by size.
  return W.cities.filter(c => c.a3 === a3)
    .sort((a, b) => (b.isCapital ? 1 : 0) - (a.isCapital ? 1 : 0) || (b.pop || 0) - (a.pop || 0))
    .map(c => ({ id: c.id, name: c.name, kind: c.isCapital ? 'Capital' : (c.isMajor ? 'Major city' : 'City') }));
}
function airportFromCity() {
  // The city the player is standing in wins: opening departures from inside
  // a city shows that city's airport, not the home capital's.
  if (typeof CityView !== 'undefined' && CityView.isOpen && CityView.isOpen() && CityView.city
    && !(typeof MARS_CITY_ID !== 'undefined' && CityView.city.id === MARS_CITY_ID)) return CityView.city;
  if (S.airportFrom != null && W.cities[S.airportFrom]) return W.cities[S.airportFrom];
  return W.cities[W.byA3[S.home].capital];
}
function airportDistanceKm(a, b) {
  if (!a || !b) return 0;
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLon = (b.lon - a.lon) * Math.PI / 180;
  const h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
function airportFly(cityId) {
  const from = airportFromCity();
  const c = W.cities[cityId]; if (!c) return 'City not found.';
  const km = airportDistanceKm(from, c);
  S.airportFrom = cityId;
  closePanel();
  MapView.flyToCountry(c.a3);
  toast(`Flying to ${c.name} — ${km.toLocaleString()} km`, 'good');
  enterCity(cityId);
  return null;
}
