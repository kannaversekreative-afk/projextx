// Major cities, not towns: the most popular cities in each country.
// These are added to the world alongside each capital. Metro populations
// are approximate and are used as weights to split a country's real
// population and GDP across its cities (see world.js), so the cities
// together always add up to the country total. Capitals are NOT listed
// here — they already exist in world-data.js and must not be duplicated.
'use strict';
const MAJOR_CITIES = [
  // USA
  {n:'New York', c:'USA', code:'NYC', lat:40.71, lon:-74.01, pop:19500000, port:1},
  {n:'Miami', c:'USA', code:'MIA', lat:25.76, lon:-80.19, pop:6200000, port:1},
  // China (capital Beijing already in data)
  {n:'Shanghai', c:'CHN', code:'SHA', lat:31.23, lon:121.47, pop:24000000, port:1},
  // India (capital New Delhi already in data)
  {n:'Mumbai', c:'IND', code:'BOM', lat:19.08, lon:72.88, pop:21000000, port:1},
  // Canada (capital Ottawa already in data)
  {n:'Toronto', c:'CAN', code:'YYZ', lat:43.65, lon:-79.38, pop:6200000, port:1},
  // Turkey (capital Ankara already in data)
  {n:'Istanbul', c:'TUR', code:'IST', lat:41.01, lon:28.98, pop:15500000, port:1},
  {n:'Cape Town', c:'ZAF', code:'CPT', lat:-33.92, lon:18.42, pop:4900000, port:1},
  // United Arab Emirates (capital Abu Dhabi already in data)
  {n:'Dubai', c:'ARE', code:'DXB', lat:25.20, lon:55.27, pop:3600000, port:1},
];



