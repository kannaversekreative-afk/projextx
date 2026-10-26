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
  const cap = W.cities[W.byA3[a3].capital];
  const out = cap ? [{ id: cap.id, name: cap.name, kind: 'Capital' }] : [];
  // Your personal star city lives in your home country: it is a city
  // you can fly to too.
  if (a3 === S.home) {
    const mc = myCityPos();
    if (mc) out.push({ id: -1, name: (S.myCity && S.myCity.name) || 'Your City', kind: 'Your city ★' });
  }
  return out;
}
function airportFromCity() {
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
  if (cityId === -1) {
    // Flying to your own star city: centre the map on it, open it.
    const mc = myCityPos();
    if (mc) { MapView.flyToXY(mc.x, mc.y, 4); S.airportFrom = W.byA3[S.home].capital; }
    closePanel();
    openPanel('mycity');
    return null;
  }
  const c = W.cities[cityId]; if (!c) return 'City not found.';
  const km = airportDistanceKm(from, c);
  S.airportFrom = cityId;
  closePanel();
  MapView.flyToCountry(c.a3);
  toast(`Flying to ${c.name} — ${km.toLocaleString()} km`, 'good');
  enterCity(cityId);
  return null;
}
