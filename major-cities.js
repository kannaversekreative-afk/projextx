// Major cities, not towns: the most popular cities in each country.
// These are added to the world alongside each capital. Metro populations
// are approximate and are used as weights to split a country's real
// population and GDP across its cities (see world.js), so the cities
// together always add up to the country total. Capitals are NOT listed
// here — they already exist in world-data.js and must not be duplicated.
'use strict';
const MAJOR_CITIES = [
  // China (capital Beijing already in data)
  {n:'Shanghai', c:'CHN', code:'SHA', lat:31.23, lon:121.47, pop:24000000, port:1},
  {n:'Guangzhou', c:'CHN', code:'CAN', lat:23.13, lon:113.26, pop:14000000, port:1},
  {n:'Shenzhen', c:'CHN', code:'SZX', lat:22.54, lon:114.06, pop:13000000, port:1},
  {n:'Chengdu', c:'CHN', code:'CTU', lat:30.57, lon:104.07, pop:16000000, port:0},
  {n:'Chongqing', c:'CHN', code:'CKG', lat:29.56, lon:106.55, pop:15000000, port:0},
  {n:'Tianjin', c:'CHN', code:'TSN', lat:39.13, lon:117.20, pop:13000000, port:1},
  {n:'Wuhan', c:'CHN', code:'WUH', lat:30.59, lon:114.30, pop:11000000, port:0},
  {n:"Xi'an", c:'CHN', code:'XIY', lat:34.27, lon:108.95, pop:12000000, port:0},
  {n:'Hangzhou', c:'CHN', code:'HGH', lat:30.27, lon:120.15, pop:10000000, port:1},
  {n:'Nanjing', c:'CHN', code:'NKG', lat:32.06, lon:118.80, pop:8000000, port:0},
  {n:'Shenyang', c:'CHN', code:'SHE', lat:41.80, lon:123.43, pop:8000000, port:0},
  {n:'Harbin', c:'CHN', code:'HRB', lat:45.75, lon:126.53, pop:10000000, port:0},
  {n:'Dalian', c:'CHN', code:'DLC', lat:38.91, lon:121.61, pop:6000000, port:1},
  {n:'Qingdao', c:'CHN', code:'TAO', lat:36.07, lon:120.38, pop:9000000, port:1},
  {n:'Jinan', c:'CHN', code:'TNA', lat:36.65, lon:117.00, pop:8000000, port:0},
  {n:'Zhengzhou', c:'CHN', code:'CGO', lat:34.75, lon:113.62, pop:10000000, port:0},
  {n:'Changsha', c:'CHN', code:'CSX', lat:28.23, lon:112.94, pop:9000000, port:0},
  {n:'Kunming', c:'CHN', code:'KMG', lat:25.04, lon:102.71, pop:7000000, port:0},
  {n:'Suzhou', c:'CHN', code:'SUZ', lat:31.30, lon:120.62, pop:12000000, port:0},
  {n:'Ningbo', c:'CHN', code:'NGB', lat:29.87, lon:121.55, pop:8000000, port:1},
  // India (capital New Delhi already in data)
  {n:'Mumbai', c:'IND', code:'BOM', lat:19.08, lon:72.88, pop:21000000, port:1},
  {n:'Kolkata', c:'IND', code:'CCU', lat:22.57, lon:88.36, pop:14000000, port:1},
  {n:'Chennai', c:'IND', code:'MAA', lat:13.08, lon:80.28, pop:11000000, port:1},
  {n:'Bengaluru', c:'IND', code:'BLR', lat:12.97, lon:77.59, pop:11000000, port:0},
  {n:'Hyderabad', c:'IND', code:'HYD', lat:17.39, lon:78.49, pop:10000000, port:0},
  {n:'Ahmedabad', c:'IND', code:'AMD', lat:23.02, lon:72.57, pop:8000000, port:0},
  {n:'Pune', c:'IND', code:'PNQ', lat:18.52, lon:73.86, pop:7000000, port:0},
  {n:'Surat', c:'IND', code:'STV', lat:21.17, lon:72.83, pop:6000000, port:1},
  {n:'Jaipur', c:'IND', code:'JAI', lat:26.91, lon:75.79, pop:4000000, port:0},
  {n:'Lucknow', c:'IND', code:'LKO', lat:26.85, lon:80.95, pop:3000000, port:0},
  {n:'Kanpur', c:'IND', code:'KNU', lat:26.45, lon:80.33, pop:3000000, port:0},
  {n:'Nagpur', c:'IND', code:'NAG', lat:21.15, lon:79.09, pop:2500000, port:0},
  {n:'Indore', c:'IND', code:'IDR', lat:22.72, lon:75.86, pop:3000000, port:0},
  {n:'Bhopal', c:'IND', code:'BHO', lat:23.26, lon:77.41, pop:2000000, port:0},
  {n:'Patna', c:'IND', code:'PTN', lat:25.59, lon:85.14, pop:2000000, port:0},
  {n:'Vadodara', c:'IND', code:'BDQ', lat:22.31, lon:73.18, pop:2000000, port:0},
  {n:'Varanasi', c:'IND', code:'VNS', lat:25.32, lon:82.97, pop:1500000, port:0},
  {n:'Amritsar', c:'IND', code:'ATQ', lat:31.63, lon:74.87, pop:1200000, port:0},
  // Italy (capital Rome already in data)
  {n:'Milan', c:'ITA', code:'MIL', lat:45.46, lon:9.19, pop:5200000, port:0},
  {n:'Naples', c:'ITA', code:'NAP', lat:40.85, lon:14.27, pop:3100000, port:1},
  {n:'Turin', c:'ITA', code:'TRN', lat:45.07, lon:7.69, pop:2200000, port:0},
  {n:'Genoa', c:'ITA', code:'GOA', lat:44.41, lon:8.93, pop:1500000, port:1},
  {n:'Bologna', c:'ITA', code:'BLQ', lat:44.49, lon:11.34, pop:1000000, port:0},
  {n:'Florence', c:'ITA', code:'FLR', lat:43.77, lon:11.25, pop:1000000, port:0},
  {n:'Venice', c:'ITA', code:'VCE', lat:45.44, lon:12.32, pop:600000, port:1},
  {n:'Palermo', c:'ITA', code:'PMO', lat:38.12, lon:13.36, pop:1300000, port:1},
  {n:'Bari', c:'ITA', code:'BRI', lat:41.12, lon:16.87, pop:1200000, port:1},
  {n:'Catania', c:'ITA', code:'CTA', lat:37.50, lon:15.09, pop:1100000, port:1},
  // Turkey (capital Ankara already in data)
  {n:'Istanbul', c:'TUR', code:'IST', lat:41.01, lon:28.98, pop:15500000, port:1},
  {n:'Izmir', c:'TUR', code:'IZM', lat:38.42, lon:27.14, pop:4400000, port:1},
  {n:'Bursa', c:'TUR', code:'BUR', lat:40.19, lon:29.06, pop:3100000, port:1},
  {n:'Antalya', c:'TUR', code:'ANT', lat:36.89, lon:30.71, pop:2600000, port:1},
  {n:'Adana', c:'TUR', code:'ADA', lat:37.00, lon:35.32, pop:2200000, port:1},
  {n:'Gaziantep', c:'TUR', code:'GZT', lat:37.07, lon:37.38, pop:2100000, port:0},
  {n:'Konya', c:'TUR', code:'KYA', lat:37.87, lon:32.48, pop:2300000, port:0},
  {n:'Trabzon', c:'TUR', code:'TZX', lat:41.00, lon:39.72, pop:800000, port:1},
  // South Africa (capital Pretoria already in data)
  {n:'Johannesburg', c:'ZAF', code:'JNB', lat:-26.20, lon:28.05, pop:4800000, port:0},
  {n:'Cape Town', c:'ZAF', code:'CPT', lat:-33.92, lon:18.42, pop:4900000, port:1},
  {n:'Durban', c:'ZAF', code:'DUR', lat:-29.85, lon:31.02, pop:4000000, port:1},
  {n:'Gqeberha', c:'ZAF', code:'PLZ', lat:-34.00, lon:25.60, pop:1300000, port:1},
  {n:'Bloemfontein', c:'ZAF', code:'BFN', lat:-29.12, lon:26.22, pop:800000, port:0},
  {n:'Nelspruit', c:'ZAF', code:'NLP', lat:-25.47, lon:30.97, pop:700000, port:0},
  // Egypt (capital Cairo already in data)
  {n:'Alexandria', c:'EGY', code:'ALY', lat:31.20, lon:29.92, pop:5300000, port:1},
  {n:'Giza', c:'EGY', code:'GIZ', lat:30.01, lon:31.21, pop:4500000, port:0},
  {n:'Shubra El Kheima', c:'EGY', code:'SHB', lat:30.12, lon:31.24, pop:1200000, port:0},
  {n:'Port Said', c:'EGY', code:'PSD', lat:31.26, lon:32.30, pop:750000, port:1},
  {n:'Suez', c:'EGY', code:'SUZ2', lat:30.60, lon:32.27, pop:700000, port:1},
  {n:'Luxor', c:'EGY', code:'LXR', lat:25.69, lon:32.64, pop:500000, port:0},
  {n:'Aswan', c:'EGY', code:'ASW', lat:24.09, lon:32.90, pop:350000, port:0},
  {n:'Hurghada', c:'EGY', code:'HRG', lat:27.23, lon:33.84, pop:300000, port:1},
  // United Arab Emirates (capital Abu Dhabi already in data)
  {n:'Dubai', c:'ARE', code:'DXB', lat:25.20, lon:55.27, pop:3600000, port:1},
];



