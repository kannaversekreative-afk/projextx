// real-companies.js — parody company table for Worl.
//
// IMPORTANT: every name below is a PARODY. Each one evokes a real company
// (same sector, similar sound or a joke — e.g. Apple becomes Banana, Burger
// King becomes Burger Shuck) without using the real trademark, and every
// ticker is derived from the parody name, never a real ticker. Real
// company names and real tickers are deliberately NOT used anywhere here.
//
// hq is the real HQ city of the company the parody evokes. Cities are
// places, not brands, so keeping the real HQ city is what gives each
// company a real location in the world.
//
// Entry format: { name, sym, sector, hq }.
// sector must be one of the exact LEADER_SECTORS names in leader.js.
// Countries or sector combos not covered here fall back to the existing
// fictional company generator — this table adds flavour, it never blocks
// a country from having companies.
'use strict';

const REAL_COMPANIES = {
  AFG: [
    { name: 'KabulTel', sym: 'KBTL', sector: 'Telecom – Mobile', hq: 'Kabul' },
    { name: 'Verdant Grove', sym: 'VGRO', sector: 'Crop Farming', hq: 'Kabul' },
  ],
  AGO: [
    { name: 'SonanOil', sym: 'SNOL', sector: 'Oil Extraction', hq: 'Luanda' },
  ],
  ALB: [
    { name: 'AlbaTel', sym: 'ALBT', sector: 'Telecom – Mobile', hq: 'Tirana' },
    { name: 'Balkan Gems', sym: 'BGEM', sector: 'Tourism Services', hq: 'Tirana' },
  ],
  AND: [
    { name: 'AndorraBank', sym: 'ANDB', sector: 'Finance – Banking', hq: 'Andorra la Vella' },
  ],
  ARE: [
    { name: 'EmirAir', sym: 'EMRA', sector: 'Airlines – Passenger', hq: 'Dubai' },
    { name: 'DubaiPorts', sym: 'DBPT', sector: 'Ports & Airports Services', hq: 'Dubai' },
    { name: 'Emirates National Oil', sym: 'EMNO', sector: 'Oil Extraction', hq: 'Abu Dhabi' },
    { name: 'Gulf Gas Emirates', sym: 'GGAS', sector: 'Natural Gas', hq: 'Abu Dhabi' },
  ],
  ARG: [
    { name: 'ArgOil', sym: 'ARGO', sector: 'Oil Extraction', hq: 'Buenos Aires' },
    { name: 'FreeMarket', sym: 'FRMK', sector: 'Retail – General', hq: 'Buenos Aires' },
    { name: 'TechTent', sym: 'TCHT', sector: 'Steel Production', hq: 'Buenos Aires' },
    { name: 'Pampa Grain Co.', sym: 'PGRA', sector: 'Crop Farming', hq: 'Buenos Aires' },
    { name: 'Crescendo Ranches', sym: 'CRSC', sector: 'Livestock Farming', hq: 'Buenos Aires' },
    { name: 'Arco Dulce', sym: 'ARDL', sector: 'Food Processing', hq: 'Arroyito' },
  ],
  ARM: [
    { name: 'ArmeniaTel', sym: 'ARMT', sector: 'Telecom – Mobile', hq: 'Yerevan' },
    { name: 'Kajaran Copper Combine', sym: 'KCCO', sector: 'Mining – Metals', hq: 'Kajaran' },
  ],
  ATG: [
    { name: 'Leeward Air', sym: 'LWDA', sector: 'Airlines – Passenger', hq: 'St. John\'s' },
    { name: 'St. John Bay Resort', sym: 'SJBY', sector: 'Tourism Services', hq: 'St. John\'s' },
  ],
  AUS: [
    { name: 'Broken Hill', sym: 'BRKH', sector: 'Mining – Metals', hq: 'Melbourne' },
    { name: 'CommonBank', sym: 'CMBK', sector: 'Finance – Banking', hq: 'Sydney' },
    { name: 'WoolMart', sym: 'WLMT', sector: 'Retail – Grocery', hq: 'Sydney' },
    { name: 'Flying Kangaroo', sym: 'FLKR', sector: 'Airlines – Passenger', hq: 'Sydney' },
    { name: 'Pale Haven', sym: 'PHVN', sector: 'Coal & Peat', hq: 'Sydney' },
    { name: 'SeedCorp', sym: 'SDCO', sector: 'Crop Farming', hq: 'Sydney' },
    { name: 'Journey Hub', sym: 'JHUB', sector: 'Tourism Services', hq: 'Brisbane' },
  ],
  AUT: [
    { name: 'OeMV', sym: 'OEMV', sector: 'Oil Refining & Fuels', hq: 'Vienna' },
    { name: 'FirstBank', sym: 'FSTB', sector: 'Finance – Banking', hq: 'Vienna' },
    { name: 'CrimsonBull', sym: 'CRMB', sector: 'Beverages & Tobacco', hq: 'Fuschl am See' },
    { name: 'Androck Industries', sym: 'ANDR', sector: 'Machinery – Industrial', hq: 'Graz' },
  ],
  AZE: [
    { name: 'CaspianOil', sym: 'CPOI', sector: 'Oil Extraction', hq: 'Baku' },
    { name: 'Caspian State Oil', sym: 'CSOL', sector: 'Natural Gas', hq: 'Baku' },
  ],
  BDI: [
    { name: 'OnaTel', sym: 'ONTL', sector: 'Telecom – Mobile', hq: 'Bujumbura' },
    { name: 'Kayanza Coffee Washers', sym: 'KCWS', sector: 'Crop Farming', hq: 'Kayanza' },
  ],
  BEL: [
    { name: 'InBrew', sym: 'INBW', sector: 'Beverages & Tobacco', hq: 'Leuven' },
    { name: 'KBSee', sym: 'KBSE', sector: 'Finance – Banking', hq: 'Brussels' },
    { name: 'Solva', sym: 'SLVA', sector: 'Chemicals – Basic', hq: 'Brussels' },
    { name: 'CureBel', sym: 'CUBE', sector: 'Pharmaceuticals', hq: 'Brussels' },
  ],
  BEN: [
    { name: 'BeninTel', sym: 'BNTL', sector: 'Telecom – Mobile', hq: 'Cotonou' },
    { name: 'Bohicon Gin Mills', sym: 'BGML', sector: 'Crop Farming', hq: 'Bohicon' },
  ],
  BFA: [
    { name: 'BurkinaTel', sym: 'BKTL', sector: 'Telecom – Mobile', hq: 'Ouagadougou' },
    { name: 'Burkina Fibre Works', sym: 'BFWK', sector: 'Crop Farming', hq: 'Bobo-Dioulasso' },
  ],
  BGD: [
    { name: 'VillagePhone', sym: 'VLGP', sector: 'Telecom – Mobile', hq: 'Dhaka' },
    { name: 'BeximTex', sym: 'BXMT', sector: 'Textiles', hq: 'Dhaka' },
    { name: 'Dhaka Threads', sym: 'DHTR', sector: 'Apparel & Footwear', hq: 'Dhaka' },
    { name: 'SeedBridge', sym: 'SDBG', sector: 'Crop Farming', hq: 'Dhaka' },
  ],
  BGR: [
    { name: 'VivaTel', sym: 'VVTL', sector: 'Telecom – Mobile', hq: 'Sofia' },
    { name: 'Sofia Pastries', sym: 'SFPT', sector: 'Food Processing', hq: 'Sofia' },
  ],
  BHR: [
    { name: 'GulfWings', sym: 'GFWG', sector: 'Airlines – Passenger', hq: 'Muharraq' },
    { name: 'Awali Petroleum', sym: 'AWPT', sector: 'Oil Extraction', hq: 'Awali' },
    { name: 'Manama First Bank', sym: 'MFBK', sector: 'Finance – Banking', hq: 'Manama' },
  ],
  BHS: [
    { name: 'BahamaAir', sym: 'BHMA', sector: 'Airlines – Passenger', hq: 'Nassau' },
    { name: 'Nassau Star Resorts', sym: 'NSRT', sector: 'Tourism Services', hq: 'Nassau' },
  ],
  BIH: [
    { name: 'BosnaTel', sym: 'BSTL', sector: 'Telecom – Mobile', hq: 'Sarajevo' },
    { name: 'Zenica Steel', sym: 'ZENI', sector: 'Steel Production', hq: 'Zenica' },
  ],
  BLR: [
    { name: 'BelKali', sym: 'BLKL', sector: 'Fertilizers & Pesticides', hq: 'Minsk' },
    { name: 'Minsk Truck Works', sym: 'MTWK', sector: 'Machinery – Industrial', hq: 'Minsk' },
  ],
  BLZ: [
    { name: 'BelizeTel', sym: 'BLZT', sector: 'Telecom – Mobile', hq: 'Belize City' },
    { name: 'San Ignacio Rainforest Resort', sym: 'SIRR', sector: 'Tourism Services', hq: 'San Ignacio' },
  ],
  BOL: [
    { name: 'BoliviaOil', sym: 'BLOL', sector: 'Oil Extraction', hq: 'La Paz' },
    { name: 'Saint Crystal Mines', sym: 'SCRY', sector: 'Mining – Metals', hq: 'La Paz' },
  ],
  BRA: [
    { name: 'BraOil', sym: 'BRLO', sector: 'Oil Extraction', hq: 'Rio de Janeiro' },
    { name: 'Valley Mining', sym: 'VLMN', sector: 'Mining – Metals', hq: 'Rio de Janeiro' },
    { name: 'ItaYou', sym: 'ITYU', sector: 'Finance – Banking', hq: 'Sao Paulo' },
    { name: 'BrazAir', sym: 'BZAR', sector: 'Aerospace', hq: 'Sao Jose dos Campos' },
    { name: 'SabeSp', sym: 'SBSP', sector: 'Water Supply', hq: 'Sao Paulo' },
    { name: 'Agrícola Sul', sym: 'AGSU', sector: 'Crop Farming', hq: 'Porto Alegre' },
    { name: 'Jumbo Beef Co.', sym: 'JBCO', sector: 'Livestock Farming', hq: 'São Paulo' },
  ],
  BRB: [
    { name: 'BajanPower', sym: 'BJNP', sector: 'Electricity Distribution', hq: 'Bridgetown' },
    { name: 'Pelican Ocean Hotels', sym: 'PLOH', sector: 'Tourism Services', hq: 'Christ Church' },
  ],
  BRN: [
    { name: 'Brunei Royal Air', sym: 'BRAR', sector: 'Airlines – Passenger', hq: 'Bandar Seri Begawan' },
    { name: 'Brunei Clam Oil', sym: 'BCLO', sector: 'Oil Extraction', hq: 'Seria' },
    { name: 'Brunei Frost Gas', sym: 'BFGS', sector: 'Natural Gas', hq: 'Lumut' },
  ],
  BTN: [
    { name: 'DragonPower', sym: 'DRGP', sector: 'Electricity Generation', hq: 'Thimphu' },
  ],
  BWA: [
    { name: 'Botswana Diamonds', sym: 'BTDM', sector: 'Mining – Non-metals', hq: 'Gaborone' },
    { name: 'Botswana Diamond Works', sym: 'BDWK', sector: 'Mining – Metals', hq: 'Gaborone' },
  ],
  CAF: [
    { name: 'Telecel', sym: 'TLCL', sector: 'Telecom – Mobile', hq: 'Bangui' },
    { name: 'Bangui Gold Resources', sym: 'BGDR', sector: 'Mining – Metals', hq: 'Bangui' },
  ],
  CAN: [
    { name: 'Royal Crown Bank', sym: 'RCBK', sector: 'Finance – Banking', hq: 'Toronto' },
    { name: 'ShopiFly', sym: 'SHPF', sector: 'Software & AI', hq: 'Ottawa' },
    { name: 'CanRail', sym: 'CNRL', sector: 'Rail Transport', hq: 'Montreal' },
    { name: 'Tims Donuts', sym: 'TMDN', sector: 'Restaurants & Bars', hq: 'Toronto' },
    { name: 'MagnaParts', sym: 'MGNP', sector: 'Vehicles – Parts', hq: 'Aurora' },
    { name: 'North Sun Energy', sym: 'NSUN', sector: 'Oil Extraction', hq: 'Calgary' },
    { name: 'Tecktonic Mining', sym: 'TCTN', sector: 'Mining – Metals', hq: 'Vancouver' },
    { name: 'BC Timber Co.', sym: 'BCTM', sector: 'Forestry & Timber', hq: 'Vancouver' },
  ],
  CHE: [
    { name: 'NestEgg', sym: 'NSTG', sector: 'Food Processing', hq: 'Vevey' },
    { name: 'Roach', sym: 'ROCH', sector: 'Pharmaceuticals', hq: 'Basel' },
    { name: 'NewArtis', sym: 'NWAT', sector: 'Pharmaceuticals', hq: 'Basel' },
    { name: 'UnionBankSwiss', sym: 'UBNK', sector: 'Finance – Banking', hq: 'Zurich' },
    { name: 'KuehNagel', sym: 'KHNL', sector: 'Logistics & Warehousing', hq: 'Schindellegi' },
    { name: 'Zurich Counsel', sym: 'ZRCN', sector: 'Professional – Legal & Accounting', hq: 'Zürich' },
  ],
  CHL: [
    { name: 'CopperChile', sym: 'CPCL', sector: 'Mining – Metals', hq: 'Santiago' },
    { name: 'Frutihort Berries', sym: 'FRTH', sector: 'Crop Farming', hq: 'Santiago' },
    { name: 'Chanca Seafood', sym: 'CHSF', sector: 'Fishing & Aquaculture', hq: 'Santiago' },
  ],
  CHN: [
    { name: 'WeiWay', sym: 'WEWY', sector: 'Telecom – Mobile', hq: 'Shenzhen' },
    { name: 'TenPence', sym: 'TPNC', sector: 'Software & AI', hq: 'Shenzhen' },
    { name: 'FortyThieves', sym: 'FTTV', sector: 'Retail – General', hq: 'Hangzhou' },
    { name: 'DreamDrive', sym: 'DRDV', sector: 'Vehicles – Cars & Trucks', hq: 'Shenzhen' },
    { name: 'Great Wall Bank', sym: 'GWBK', sector: 'Finance – Banking', hq: 'Beijing' },
    { name: 'Little Rice Electronics', sym: 'LREC', sector: 'Consumer Electronics', hq: 'Beijing' },
    { name: 'Younger Garments', sym: 'YGRM', sector: 'Textiles', hq: 'Ningbo' },
    { name: 'Godly Coal', sym: 'GDCL', sector: 'Coal & Peat', hq: 'Beijing' },
    { name: 'Central Chips', sym: 'CCHP', sector: 'Semiconductors', hq: 'Shanghai' },
    { name: 'Treasure Steel', sym: 'TRES', sector: 'Steel Production', hq: 'Shanghai' },
  ],
  CIV: [
    { name: 'IvoireTel', sym: 'IVTL', sector: 'Telecom – Mobile', hq: 'Abidjan' },
    { name: 'Abidjan Palm & Sugar', sym: 'APSG', sector: 'Crop Farming', hq: 'Abidjan' },
  ],
  CMR: [
    { name: 'CamOil', sym: 'CMOL', sector: 'Oil Extraction', hq: 'Yaounde' },
  ],
  COD: [
    { name: 'GecaMines', sym: 'GCMN', sector: 'Mining – Metals', hq: 'Lubumbashi' },
  ],
  COG: [
    { name: 'CongoPetro', sym: 'CGPT', sector: 'Oil Extraction', hq: 'Brazzaville' },
  ],
  COL: [
    { name: 'ColOil', sym: 'CLOL', sector: 'Oil Extraction', hq: 'Bogota' },
    { name: 'Verde Coffee Co.', sym: 'VRDC', sector: 'Crop Farming', hq: 'Medellín' },
  ],
  COM: [
    { name: 'ComorosTel', sym: 'CMTL', sector: 'Telecom – Mobile', hq: 'Moroni' },
    { name: 'Garden of Peace Moroni', sym: 'GPMR', sector: 'Tourism Services', hq: 'Moroni' },
  ],
  CPV: [
    { name: 'CapeAir', sym: 'CPAR', sector: 'Airlines – Passenger', hq: 'Sal' },
    { name: 'Santa Maria Sands Hotel', sym: 'SMHS', sector: 'Tourism Services', hq: 'Santa Maria' },
  ],
  CRI: [
    { name: 'CostaPower', sym: 'CSPW', sector: 'Electricity Distribution', hq: 'San Jose' },
    { name: 'Disfruta Group', sym: 'DSFG', sector: 'Tourism Services', hq: 'San José' },
  ],
  CUB: [
    { name: 'CubaCel', sym: 'CUCL', sector: 'Telecom – Mobile', hq: 'Havana' },
    { name: 'Seagull Tourism Group', sym: 'SGTG', sector: 'Tourism Services', hq: 'Havana' },
  ],
  CYP: [
    { name: 'CyprusBank', sym: 'CYBK', sector: 'Finance – Banking', hq: 'Nicosia' },
    { name: 'Cyprus Crown Hotels', sym: 'CCHT', sector: 'Tourism Services', hq: 'Nicosia' },
  ],
  CZE: [
    { name: 'Shkoda', sym: 'SHKD', sector: 'Vehicles – Cars & Trucks', hq: 'Mlada Boleslav' },
  ],
  DEU: [
    { name: 'Volky', sym: 'VLKY', sector: 'Vehicles – Cars & Trucks', hq: 'Wolfsburg' },
    { name: 'Bimmer', sym: 'BMMR', sector: 'Vehicles – Cars & Trucks', hq: 'Munich' },
    { name: 'Zeemens', sym: 'ZMNS', sector: 'Machinery – Industrial', hq: 'Munich' },
    { name: 'Sappy', sym: 'SAPY', sector: 'Software & AI', hq: 'Walldorf' },
    { name: 'AlliAnts', sym: 'ALNT', sector: 'Insurance', hq: 'Munich' },
    { name: 'Ruhr Power', sym: 'RUHR', sector: 'Coal & Peat', hq: 'Essen' },
    { name: 'Ludwig Chemicals', sym: 'LUDC', sector: 'Chemicals – Basic', hq: 'Ludwigshafen' },
  ],
  DJI: [
    { name: 'DjibTel', sym: 'DJTL', sector: 'Telecom – Mobile', hq: 'Djibouti City' },
    { name: 'Red Sea Gateway Ports', sym: 'RSGP', sector: 'Ports & Airports Services', hq: 'Djibouti' },
  ],
  DMA: [
    { name: 'DominicaTel', sym: 'DMTL', sector: 'Telecom – Mobile', hq: 'Roseau' },
    { name: 'Fort Youth Hotel', sym: 'FTYH', sector: 'Tourism Services', hq: 'Roseau' },
  ],
  DNK: [
    { name: 'Mersk', sym: 'MRSK', sector: 'Shipping – Freight', hq: 'Copenhagen' },
    { name: 'NovoNord', sym: 'NVND', sector: 'Pharmaceuticals', hq: 'Bagsvaerd' },
    { name: 'DanishCrown', sym: 'DNCR', sector: 'Meat Processing', hq: 'Randers' },
    { name: 'VestaWind', sym: 'VSTW', sector: 'Renewable Energy Technology', hq: 'Aarhus' },
  ],
  DOM: [
    { name: 'SantoTel', sym: 'SNTL', sector: 'Telecom – Mobile', hq: 'Santo Domingo' },
    { name: 'Hotel del Paraiso', sym: 'HDPO', sector: 'Tourism Services', hq: 'Santo Domingo' },
  ],
  DZA: [
    { name: 'AlgerOil', sym: 'ALGO', sector: 'Oil Extraction', hq: 'Algiers' },
    { name: 'Sahara Natural Gas', sym: 'SNGS', sector: 'Natural Gas', hq: 'Algiers' },
  ],
  ECU: [
    { name: 'EcuOil', sym: 'ECOL', sector: 'Oil Extraction', hq: 'Quito' },
  ],
  EGY: [
    { name: 'NileAir', sym: 'NLAR', sector: 'Airlines – Passenger', hq: 'Cairo' },
    { name: 'Nile Natural Gas', sym: 'NNGS', sector: 'Natural Gas', hq: 'Cairo' },
    { name: 'El Gouna Developers', sym: 'EGDN', sector: 'Tourism Services', hq: 'Cairo' },
  ],
  ERI: [
    { name: 'EriTel', sym: 'ERTL', sector: 'Telecom – Mobile', hq: 'Asmara' },
    { name: 'Bisha Gold & Copper', sym: 'BGCP', sector: 'Mining – Metals', hq: 'Asmara' },
  ],
  ESP: [
    { name: 'SaintAnder', sym: 'SADR', sector: 'Finance – Banking', hq: 'Santander' },
    { name: 'Zora', sym: 'ZORA', sector: 'Apparel & Footwear', hq: 'Arteixo' },
    { name: 'TeleSpania', sym: 'TLSP', sector: 'Telecom – Mobile', hq: 'Madrid' },
    { name: 'IberPower', sym: 'IBPR', sector: 'Electricity Generation', hq: 'Bilbao' },
    { name: 'Fomento', sym: 'FMNT', sector: 'Waste & Recycling', hq: 'Madrid' },
    { name: 'Melon Resorts', sym: 'MLON', sector: 'Tourism Services', hq: 'Palma de Mallorca' },
    { name: 'Basque Spuds', sym: 'BSPU', sector: 'Crop Farming', hq: 'Vitoria-Gasteiz' },
    { name: 'Sofa Motors', sym: 'SOFM', sector: 'Vehicles – Cars & Trucks', hq: 'Martorell' },
  ],
  EST: [
    { name: 'Boltt', sym: 'BLTT', sector: 'Road Transport & Trucking', hq: 'Tallinn' },
    { name: 'Zap Rides', sym: 'ZAPR', sector: 'Software & AI', hq: 'Tallinn' },
  ],
  ETH: [
    { name: 'Ethiopia Air', sym: 'ETAR', sector: 'Airlines – Passenger', hq: 'Addis Ababa' },
    { name: 'Sidama Highlands Coffee', sym: 'SHCF', sector: 'Crop Farming', hq: 'Addis Ababa' },
  ],
  FIN: [
    { name: 'Nokla', sym: 'NKLA', sector: 'Telecom – Mobile', hq: 'Espoo' },
    { name: 'Stora', sym: 'STRA', sector: 'Forestry & Timber', hq: 'Helsinki' },
  ],
  FJI: [
    { name: 'FijiAir', sym: 'FJAR', sector: 'Airlines – Passenger', hq: 'Nadi' },
    { name: 'Daisy Holidays', sym: 'DHOL', sector: 'Tourism Services', hq: 'Nadi' },
  ],
  FRA: [
    { name: 'LuxeHouse', sym: 'LXHS', sector: 'Apparel & Footwear', hq: 'Paris' },
    { name: 'Totally Energy', sym: 'TTLE', sector: 'Oil Refining & Fuels', hq: 'Courbevoie' },
    { name: 'AirCoach', sym: 'ARCC', sector: 'Aerospace', hq: 'Toulouse' },
    { name: 'Paris National Bank', sym: 'PNBK', sector: 'Finance – Banking', hq: 'Paris' },
    { name: 'VeoLia', sym: 'VLEA', sector: 'Water Supply', hq: 'Paris' },
    { name: 'Paris Stays', sym: 'FRST', sector: 'Tourism Services', hq: 'Issy-les-Moulineaux' },
    { name: 'Parisian Pills', sym: 'PPIL', sector: 'Pharmaceuticals', hq: 'Paris' },
  ],
  FSM: [
    { name: 'MicronTel', sym: 'MCTL', sector: 'Telecom – Mobile', hq: 'Palikir' },
    { name: 'Island Tuna', sym: 'ITUN', sector: 'Fishing & Aquaculture', hq: 'Pohnpei' },
  ],
  GAB: [
    { name: 'GabOil', sym: 'GBOL', sector: 'Oil Extraction', hq: 'Libreville' },
  ],
  GBR: [
    { name: 'Shelly', sym: 'SHLY', sector: 'Oil Extraction', hq: 'London' },
    { name: 'BritAsia Bank', sym: 'BABK', sector: 'Finance – Banking', hq: 'London' },
    { name: 'StarZeneca', sym: 'STZN', sector: 'Pharmaceuticals', hq: 'Cambridge' },
    { name: 'UniLeaver', sym: 'UNLV', sector: 'Food Processing', hq: 'London' },
    { name: 'SevernWater', sym: 'SVWN', sector: 'Water Supply', hq: 'Coventry' },
    { name: 'Pea Advisory', sym: 'PEAD', sector: 'Professional – Consulting', hq: 'London' },
  ],
  GEO: [
    { name: 'GeorgiaRail', sym: 'GGRL', sector: 'Rail Transport', hq: 'Tbilisi' },
    { name: 'Tbilisi Hospitality Group', sym: 'THGP', sector: 'Tourism Services', hq: 'Tbilisi' },
  ],
  GHA: [
    { name: 'GhanaTel', sym: 'GHTL', sector: 'Telecom – Mobile', hq: 'Accra' },
    { name: 'Good Cocoa Farmers Union', sym: 'GCFU', sector: 'Crop Farming', hq: 'Kumasi' },
  ],
  GIN: [
    { name: 'GuineaTel', sym: 'GNTL', sector: 'Telecom – Mobile', hq: 'Conakry' },
    { name: 'Kamsar Bauxite Works', sym: 'KMBW', sector: 'Mining – Metals', hq: 'Kamsar' },
  ],
  GMB: [
    { name: 'GamTel', sym: 'GMTL', sector: 'Telecom – Mobile', hq: 'Banjul' },
    { name: 'Banjul Groundnut Traders', sym: 'BGTR', sector: 'Crop Farming', hq: 'Banjul' },
  ],
  GNB: [
    { name: 'GBTel', sym: 'GBTL', sector: 'Telecom – Mobile', hq: 'Bissau' },
    { name: 'Bissau Cashew Traders', sym: 'BSCT', sector: 'Crop Farming', hq: 'Bissau' },
  ],
  GNQ: [
    { name: 'GePetro', sym: 'GPTR', sector: 'Oil Extraction', hq: 'Malabo' },
  ],
  GRC: [
    { name: 'HellasTel', sym: 'HLTL', sector: 'Telecom – Mobile', hq: 'Athens' },
    { name: 'Greco Stays', sym: 'GRST', sector: 'Tourism Services', hq: 'Rethymno' },
  ],
  GRD: [
    { name: 'GrenadaTel', sym: 'GRTL', sector: 'Telecom – Mobile', hq: 'St. George\'s' },
    { name: 'Spice Isle Resort', sym: 'SPIR', sector: 'Tourism Services', hq: 'St. George\'s' },
  ],
  GTM: [
    { name: 'GuateTel', sym: 'GTTL', sector: 'Telecom – Mobile', hq: 'Guatemala City' },
    { name: 'Magda Sugar Mills', sym: 'MGDA', sector: 'Crop Farming', hq: 'Guatemala City' },
  ],
  GUY: [
    { name: 'GuyanaTel', sym: 'GYTL', sector: 'Telecom – Mobile', hq: 'Georgetown' },
    { name: 'Xenon Guyana Oil', sym: 'XENO', sector: 'Oil Extraction', hq: 'Georgetown' },
  ],
  HND: [
    { name: 'HonduTel', sym: 'HNTL', sector: 'Telecom – Mobile', hq: 'Tegucigalpa' },
    { name: 'El Gato Textiles', sym: 'EGAT', sector: 'Textiles', hq: 'Choloma' },
  ],
  HRV: [
    { name: 'CroTel', sym: 'CRTL', sector: 'Telecom – Mobile', hq: 'Zagreb' },
    { name: 'Adria Riviera', sym: 'ADRR', sector: 'Tourism Services', hq: 'Poreč' },
  ],
  HTI: [
    { name: 'HaitiCom', sym: 'HTCM', sector: 'Telecom – Mobile', hq: 'Port-au-Prince' },
    { name: 'Rebelle Coffee', sym: 'RBLL', sector: 'Crop Farming', hq: 'Port-au-Prince' },
  ],
  HUN: [
    { name: 'MolOil', sym: 'MLOL', sector: 'Oil Refining & Fuels', hq: 'Budapest' },
    { name: 'Danube Motors', sym: 'DNBM', sector: 'Vehicles – Cars & Trucks', hq: 'Esztergom' },
  ],
  IDN: [
    { name: 'IndoTel', sym: 'IDTL', sector: 'Telecom – Mobile', hq: 'Jakarta' },
    { name: 'CentralAsia Bank', sym: 'CABK', sector: 'Finance – Banking', hq: 'Jakarta' },
    { name: 'IndoNoodles', sym: 'INDL', sector: 'Food Processing', hq: 'Jakarta' },
    { name: 'Nusantara Metals', sym: 'NMET', sector: 'Mining – Metals', hq: 'Jakarta' },
    { name: 'Star Agro', sym: 'SAGR', sector: 'Crop Farming', hq: 'Jakarta' },
    { name: 'Tabalong Energy', sym: 'TBEN', sector: 'Coal & Peat', hq: 'Jakarta' },
  ],
  IND: [
    { name: 'Dependence', sym: 'DPND', sector: 'Oil Refining & Fuels', hq: 'Mumbai' },
    { name: 'InfoCousin', sym: 'INFC', sector: 'Software & AI', hq: 'Bengaluru' },
    { name: 'HomeBank', sym: 'HMBK', sector: 'Finance – Banking', hq: 'Mumbai' },
    { name: 'TractorKing', sym: 'TRKR', sector: 'Machinery – Agricultural', hq: 'Mumbai' },
    { name: 'YashRaj', sym: 'YSRJ', sector: 'Entertainment – Film & Music', hq: 'Mumbai' },
    { name: 'Ahmedabad Weaves', sym: 'AHWV', sector: 'Textiles', hq: 'Ahmedabad' },
    { name: 'Moon Pharma', sym: 'MNPH', sector: 'Pharmaceuticals', hq: 'Mumbai' },
    { name: 'Coal Bharat', sym: 'CBHR', sector: 'Coal & Peat', hq: 'Kolkata' },
  ],
  IRL: [
    { name: 'Ryans Air', sym: 'RYAR', sector: 'Airlines – Passenger', hq: 'Dublin' },
    { name: 'Guinnes', sym: 'GNSS', sector: 'Beverages & Tobacco', hq: 'Dublin' },
    { name: 'Accentur', sym: 'ACNT', sector: 'Professional – Consulting', hq: 'Dublin' },
    { name: 'Alchemist Labs', sym: 'ALCH', sector: 'Pharmaceuticals', hq: 'Dublin' },
  ],
  IRN: [
    { name: 'PersiaOil', sym: 'PRSO', sector: 'Oil Extraction', hq: 'Tehran' },
    { name: 'Persian Gas Co', sym: 'PGCO', sector: 'Natural Gas', hq: 'Tehran' },
  ],
  IRQ: [
    { name: 'IraqTel', sym: 'IQTL', sector: 'Telecom – Mobile', hq: 'Baghdad' },
    { name: 'Baghdad Crude Company', sym: 'BGCC', sector: 'Oil Extraction', hq: 'Baghdad' },
    { name: 'Basra Energy Works', sym: 'BSEW', sector: 'Natural Gas', hq: 'Basra' },
  ],
  ISL: [
    { name: 'IceAir', sym: 'ICAR', sector: 'Airlines – Passenger', hq: 'Reykjavik' },
    { name: 'Iceland Catch', sym: 'ICAT', sector: 'Fishing & Aquaculture', hq: 'Akureyri' },
  ],
  ISR: [
    { name: 'Tevva', sym: 'TVVA', sector: 'Pharmaceuticals', hq: 'Tel Aviv' },
    { name: 'GateGuard', sym: 'GTGD', sector: 'Cybersecurity', hq: 'Tel Aviv' },
    { name: 'Elbitt', sym: 'ELBT', sector: 'Defence Equipment', hq: 'Haifa' },
    { name: 'Cyber Shield Software', sym: 'CSHD', sector: 'Software & AI', hq: 'Tel Aviv' },
  ],
  ITA: [
    { name: 'Prancing Pony', sym: 'PRPN', sector: 'Vehicles – Cars & Trucks', hq: 'Maranello' },
    { name: 'Energetica', sym: 'ENRG', sector: 'Oil Extraction', hq: 'Rome' },
    { name: 'Intense Bank', sym: 'INTB', sector: 'Finance – Banking', hq: 'Turin' },
    { name: 'Fabbrica', sym: 'FBBR', sector: 'Vehicles – Cars & Trucks', hq: 'Turin' },
    { name: 'Milan Stays', sym: 'MLST', sector: 'Tourism Services', hq: 'Milan' },
    { name: 'Panda Couture', sym: 'PNDC', sector: 'Apparel & Footwear', hq: 'Milan' },
  ],
  JAM: [
    { name: 'JamTel', sym: 'JMTL', sector: 'Telecom – Mobile', hq: 'Kingston' },
    { name: 'Flipflops Resorts', sym: 'FLFL', sector: 'Tourism Services', hq: 'Montego Bay' },
  ],
  JOR: [
    { name: 'Jordan Royal Air', sym: 'JRAR', sector: 'Airlines – Passenger', hq: 'Amman' },
    { name: 'Amman Grand Hotels', sym: 'AGHT', sector: 'Tourism Services', hq: 'Amman' },
  ],
  JPN: [
    { name: 'ToyAuto', sym: 'TYAT', sector: 'Vehicles – Cars & Trucks', hq: 'Toyota City' },
    { name: 'Sonny', sym: 'SNNY', sector: 'Consumer Electronics', hq: 'Tokyo' },
    { name: 'Ninbendo', sym: 'NNDO', sector: 'Entertainment – Gaming & Sports', hq: 'Kyoto' },
    { name: 'SquishyBank', sym: 'SQBK', sector: 'Telecom – Mobile', hq: 'Tokyo' },
    { name: 'ThreeDiamonds', sym: 'TDMD', sector: 'Machinery – Industrial', hq: 'Tokyo' },
    { name: 'RoboFan', sym: 'RBFN', sector: 'Robotics & Automation', hq: 'Oshino' },
  ],
  KAZ: [
    { name: 'KazOil', sym: 'KZOL', sector: 'Oil Extraction', hq: 'Astana' },
    { name: 'Kazakh Copper', sym: 'KZCP', sector: 'Mining – Metals', hq: 'Karaganda' },
  ],
  KEN: [
    { name: 'SafariCom', sym: 'SFCM', sector: 'Telecom – Mobile', hq: 'Nairobi' },
    { name: 'Kenya Safari Lodges', sym: 'KSLG', sector: 'Tourism Services', hq: 'Nairobi' },
  ],
  KGZ: [
    { name: 'KyrgyzMobile', sym: 'KGMB', sector: 'Telecom – Mobile', hq: 'Bishkek' },
    { name: 'Tor Gold', sym: 'TGLD', sector: 'Mining – Metals', hq: 'Bishkek' },
  ],
  KHM: [
    { name: 'CamboTel', sym: 'CBTL', sector: 'Telecom – Mobile', hq: 'Phnom Penh' },
    { name: 'Grand Union Garments', sym: 'GUGM', sector: 'Textiles', hq: 'Phnom Penh' },
  ],
  KIR: [
    { name: 'KiribatiTel', sym: 'KRTL', sector: 'Telecom – Mobile', hq: 'Tarawa' },
    { name: 'Tarawa Tuna', sym: 'TATU', sector: 'Fishing & Aquaculture', hq: 'Tarawa' },
  ],
  KNA: [
    { name: 'KittTel', sym: 'KTTL', sector: 'Telecom – Mobile', hq: 'Basseterre' },
    { name: 'Ocean Veranda Inn', sym: 'OCVR', sector: 'Tourism Services', hq: 'Basseterre' },
  ],
  KOR: [
    { name: 'ThreeStars', sym: 'TSTR', sector: 'Consumer Electronics', hq: 'Suwon' },
    { name: 'Hundai', sym: 'HNDI', sector: 'Vehicles – Cars & Trucks', hq: 'Seoul' },
    { name: 'LuckyStar', sym: 'LKST', sector: 'Consumer Electronics', hq: 'Seoul' },
    { name: 'SkyNix', sym: 'SKNX', sector: 'Semiconductors', hq: 'Icheon' },
    { name: 'Keea', sym: 'KEEA', sector: 'Vehicles – Cars & Trucks', hq: 'Seoul' },
  ],
  KWT: [
    { name: 'KuwaitOil', sym: 'KWOL', sector: 'Oil Extraction', hq: 'Kuwait City' },
  ],
  LAO: [
    { name: 'LaoTel', sym: 'LOTL', sector: 'Telecom – Mobile', hq: 'Vientiane' },
    { name: 'Laos Light', sym: 'LALT', sector: 'Electricity Generation', hq: 'Vientiane' },
  ],
  LBN: [
    { name: 'BeirutTel', sym: 'BRTL', sector: 'Telecom – Mobile', hq: 'Beirut' },
    { name: 'Beirut City Bank', sym: 'BCBK', sector: 'Finance – Banking', hq: 'Beirut' },
  ],
  LBR: [
    { name: 'LoneStarTel', sym: 'LSTL', sector: 'Telecom – Mobile', hq: 'Monrovia' },
    { name: 'Liberia Iron Works', sym: 'LIWK', sector: 'Mining – Metals', hq: 'Monrovia' },
  ],
  LBY: [
    { name: 'LibyaOil', sym: 'LBYO', sector: 'Oil Extraction', hq: 'Tripoli' },
  ],
  LCA: [
    { name: 'LuciaTel', sym: 'LCTL', sector: 'Telecom – Mobile', hq: 'Castries' },
    { name: 'Trade Wind Landing', sym: 'TWLD', sector: 'Tourism Services', hq: 'Castries' },
  ],
  LIE: [
    { name: 'Hillti', sym: 'HLTI', sector: 'Machinery – Industrial', hq: 'Schaan' },
    { name: 'Alpine Trust', sym: 'ALPT', sector: 'Finance – Banking', hq: 'Vaduz' },
  ],
  LKA: [
    { name: 'LankaTel', sym: 'LKTL', sector: 'Telecom – Mobile', hq: 'Colombo' },
    { name: 'Colombo Cloth', sym: 'CLCL', sector: 'Textiles', hq: 'Colombo' },
  ],
  LSO: [
    { name: 'MaseruTel', sym: 'MSTL', sector: 'Telecom – Mobile', hq: 'Maseru' },
    { name: 'Maseru Textile Works', sym: 'MSTW', sector: 'Textiles', hq: 'Maseru' },
  ],
  LTU: [
    { name: 'LitTel', sym: 'LTTL', sector: 'Telecom – Mobile', hq: 'Vilnius' },
    { name: 'Samogitian Dairy', sym: 'SMDY', sector: 'Food Processing', hq: 'Telšiai' },
  ],
  LUX: [
    { name: 'MittalSteel', sym: 'MTST', sector: 'Steel Production', hq: 'Luxembourg City' },
    { name: 'CargoLux', sym: 'CGLX', sector: 'Airlines – Cargo', hq: 'Luxembourg City' },
    { name: 'State Savings Lux', sym: 'SSLX', sector: 'Finance – Banking', hq: 'Luxembourg' },
  ],
  LVA: [
    { name: 'RigaTel', sym: 'RGTL', sector: 'Telecom – Mobile', hq: 'Riga' },
    { name: 'Riga Plywood', sym: 'RGPL', sector: 'Forestry & Timber', hq: 'Riga' },
  ],
  MAR: [
    { name: 'MarocTel', sym: 'MRCT', sector: 'Telecom – Mobile', hq: 'Rabat' },
    { name: 'Atlas Phosphate Group', sym: 'APGP', sector: 'Mining – Non-metals', hq: 'Casablanca' },
  ],
  MCO: [
    { name: 'MonacoTel', sym: 'MNCT', sector: 'Telecom – Mobile', hq: 'Monaco' },
    { name: 'Monte Carlo Bank', sym: 'MCBK', sector: 'Finance – Banking', hq: 'Monte Carlo' },
  ],
  MDA: [
    { name: 'ChisinauTel', sym: 'CHTL', sector: 'Telecom – Mobile', hq: 'Chisinau' },
    { name: 'Moldova Grains', sym: 'MDGR', sector: 'Crop Farming', hq: 'Chișinău' },
  ],
  MDG: [
    { name: 'MadaTel', sym: 'MDTL', sector: 'Telecom – Mobile', hq: 'Antananarivo' },
    { name: 'Antalaha Vanilla Estates', sym: 'AVES', sector: 'Crop Farming', hq: 'Antalaha' },
  ],
  MDV: [
    { name: 'DhiraTel', sym: 'DHTL', sector: 'Telecom – Mobile', hq: 'Male' },
    { name: 'Universe Resorts', sym: 'UVRS', sector: 'Tourism Services', hq: 'Malé' },
  ],
  MEX: [
    { name: 'AmeriMobile', sym: 'AMMB', sector: 'Telecom – Mobile', hq: 'Mexico City' },
    { name: 'CementMex', sym: 'CMMX', sector: 'Construction – Infrastructure', hq: 'Monterrey' },
    { name: 'Femza', sym: 'FMZA', sector: 'Beverages & Tobacco', hq: 'Monterrey' },
    { name: 'Bumbo Bread', sym: 'BMBR', sector: 'Bakery & Confectionery', hq: 'Mexico City' },
    { name: 'Dino Motors', sym: 'DNMO', sector: 'Vehicles – Cars & Trucks', hq: 'Ciudad Sahagún' },
    { name: 'Sterling Electronics', sym: 'STEG', sector: 'Consumer Electronics', hq: 'Mexico City' },
    { name: 'Fiesta Mexicana Hotels', sym: 'FMXH', sector: 'Tourism Services', hq: 'Mexico City' },
  ],
  MHL: [
    { name: 'MarshallTel', sym: 'MHTL', sector: 'Telecom – Mobile', hq: 'Majuro' },
    { name: 'Majuro Tuna', sym: 'MJTU', sector: 'Fishing & Aquaculture', hq: 'Majuro' },
  ],
  MKD: [
    { name: 'MacedoniaTel', sym: 'MKTL', sector: 'Telecom – Mobile', hq: 'Skopje' },
    { name: 'Eurosewn', sym: 'ESWN', sector: 'Textiles', hq: 'Skopje' },
  ],
  MLI: [
    { name: 'MaliTel', sym: 'MLTL', sector: 'Telecom – Mobile', hq: 'Bamako' },
    { name: 'Bamako Gold Mines', sym: 'BGDM', sector: 'Mining – Metals', hq: 'Bamako' },
  ],
  MLT: [
    { name: 'VallettaTel', sym: 'VLTL', sector: 'Telecom – Mobile', hq: 'Valletta' },
    { name: 'Floriana Hotels', sym: 'FLHT', sector: 'Tourism Services', hq: 'Floriana' },
  ],
  MMR: [
    { name: 'MyanmarTel', sym: 'MMTL', sector: 'Telecom – Mobile', hq: 'Naypyidaw' },
    { name: 'Myanmar Harvest', sym: 'MMHV', sector: 'Crop Farming', hq: 'Yangon' },
  ],
  MNE: [
    { name: 'MonteTel', sym: 'MNTL', sector: 'Telecom – Mobile', hq: 'Podgorica' },
    { name: 'Budva Coast', sym: 'BDVC', sector: 'Tourism Services', hq: 'Budva' },
  ],
  MNG: [
    { name: 'MongolTel', sym: 'MGTL', sector: 'Telecom – Mobile', hq: 'Ulaanbaatar' },
    { name: 'Orkhon Mines', sym: 'OKMN', sector: 'Mining – Metals', hq: 'Erdenet' },
  ],
  MOZ: [
    { name: 'MozTel', sym: 'MZTL', sector: 'Telecom – Mobile', hq: 'Maputo' },
    { name: 'Maputo Gas & Oil', sym: 'MGOL', sector: 'Natural Gas', hq: 'Maputo' },
  ],
  MRT: [
    { name: 'MauriTel', sym: 'MRTL', sector: 'Telecom – Mobile', hq: 'Nouakchott' },
    { name: 'Nouadhibou Iron Ore', sym: 'NIRO', sector: 'Mining – Metals', hq: 'Nouadhibou' },
  ],
  MUS: [
    { name: 'MauriceTel', sym: 'MUTL', sector: 'Telecom – Mobile', hq: 'Port Louis' },
    { name: 'Curepipe Beach Resorts', sym: 'CBRS', sector: 'Tourism Services', hq: 'Curepipe' },
  ],
  MWI: [
    { name: 'MalawiTel', sym: 'MWTL', sector: 'Telecom – Mobile', hq: 'Lilongwe' },
    { name: 'Lilongwe Leaf Company', sym: 'LLLC', sector: 'Crop Farming', hq: 'Lilongwe' },
  ],
  MYS: [
    { name: 'Petrona', sym: 'PTRN', sector: 'Oil Extraction', hq: 'Kuala Lumpur' },
    { name: 'Senai Circuits', sym: 'SNCT', sector: 'Consumer Electronics', hq: 'Senai' },
    { name: 'Penang Chips', sym: 'PNCH', sector: 'Semiconductors', hq: 'Petaling Jaya' },
  ],
  NAM: [
    { name: 'NamTel', sym: 'NMTL', sector: 'Telecom – Mobile', hq: 'Windhoek' },
    { name: 'Windhoek Diamond Co', sym: 'WNDC', sector: 'Mining – Metals', hq: 'Windhoek' },
  ],
  NER: [
    { name: 'NigerTel', sym: 'NRTL', sector: 'Telecom – Mobile', hq: 'Niamey' },
    { name: 'Niger Uranium Mines', sym: 'NIUM', sector: 'Mining – Metals', hq: 'Niamey' },
  ],
  NGA: [
    { name: 'Dango Cement', sym: 'DGCM', sector: 'Construction – Infrastructure', hq: 'Lagos' },
    { name: 'Abuja National Petroleum', sym: 'ANPT', sector: 'Oil Extraction', hq: 'Abuja' },
    { name: 'Lagos Sugar Refinery', sym: 'LSRF', sector: 'Crop Farming', hq: 'Lagos' },
    { name: 'Lagos Cement & Lime', sym: 'LCLM', sector: 'Mining – Non-metals', hq: 'Lagos' },
  ],
  NIC: [
    { name: 'NicaTel', sym: 'NCTL', sector: 'Telecom – Mobile', hq: 'Managua' },
    { name: 'Managua Weaves', sym: 'MNWV', sector: 'Textiles', hq: 'Managua' },
  ],
  NLD: [
    { name: 'LithoMaster', sym: 'LTHM', sector: 'Semiconductors', hq: 'Veldhoven' },
    { name: 'Fillips', sym: 'FLLP', sector: 'Medical Devices', hq: 'Amsterdam' },
    { name: 'OrangeBank', sym: 'ORBK', sector: 'Finance – Banking', hq: 'Amsterdam' },
    { name: 'GreenBottle', sym: 'GRNB', sector: 'Beverages & Tobacco', hq: 'Amsterdam' },
    { name: 'BookIt', sym: 'BKIT', sector: 'Tourism Services', hq: 'Amsterdam' },
    { name: 'Amsterdam Coatings', sym: 'AMCT', sector: 'Chemicals – Basic', hq: 'Amsterdam' },
    { name: 'ParcelNL', sym: 'PCNL', sector: 'Logistics & Warehousing', hq: 'The Hague' },
  ],
  NOR: [
    { name: 'NorthSea Oil', sym: 'NSOL', sector: 'Oil Extraction', hq: 'Stavanger' },
    { name: 'NorseBank', sym: 'NRSB', sector: 'Finance – Banking', hq: 'Oslo' },
    { name: 'NordicTel', sym: 'NDTL', sector: 'Telecom – Mobile', hq: 'Fornebu' },
    { name: 'MowiFish', sym: 'MWFS', sector: 'Fishing & Aquaculture', hq: 'Bergen' },
    { name: 'Equinox Energy', sym: 'EQNX', sector: 'Natural Gas', hq: 'Stavanger' },
  ],
  NPL: [
    { name: 'NepalTel', sym: 'NPTL', sector: 'Telecom – Mobile', hq: 'Kathmandu' },
    { name: 'Horizon Harvest', sym: 'HHVT', sector: 'Crop Farming', hq: 'Kathmandu' },
  ],
  NRU: [
    { name: 'NauruCom', sym: 'NRCM', sector: 'Telecom – Mobile', hq: 'Yaren' },
    { name: 'Phosphate Isle', sym: 'PHIS', sector: 'Mining – Non-metals', hq: 'Yaren' },
  ],
  NZL: [
    { name: 'KiwiAir', sym: 'KWAR', sector: 'Airlines – Passenger', hq: 'Auckland' },
    { name: 'RocketWorks', sym: 'RKTW', sector: 'Space & Satellites', hq: 'Auckland' },
    { name: 'Fontera', sym: 'FNTR', sector: 'Dairy Products', hq: 'Auckland' },
  ],
  OMN: [
    { name: 'OmanWings', sym: 'OMWG', sector: 'Airlines – Passenger', hq: 'Muscat' },
    { name: 'Oman Desert Oil', sym: 'ODOL', sector: 'Oil Extraction', hq: 'Muscat' },
    { name: 'Oman Gas Fields', sym: 'OGFL', sector: 'Natural Gas', hq: 'Muscat' },
  ],
  PAK: [
    { name: 'PakTel', sym: 'PKTL', sector: 'Telecom – Mobile', hq: 'Islamabad' },
    { name: 'Lahore Looms', sym: 'LHLM', sector: 'Textiles', hq: 'Lahore' },
  ],
  PAN: [
    { name: 'PanamaAir', sym: 'PNAR', sector: 'Airlines – Passenger', hq: 'Panama City' },
  ],
  PER: [
    { name: 'PeruTel', sym: 'PRTL', sector: 'Telecom – Mobile', hq: 'Lima' },
    { name: 'Buena Fortuna Mines', sym: 'BFRM', sector: 'Mining – Metals', hq: 'Lima' },
    { name: 'Sunfield Farms', sym: 'SNFL', sector: 'Crop Farming', hq: 'Lima' },
  ],
  PHL: [
    { name: 'JolliBee', sym: 'JLBL', sector: 'Restaurants & Bars', hq: 'Pasig' },
    { name: 'ManilaWater', sym: 'MNWA', sector: 'Water Supply', hq: 'Manila' },
    { name: 'PhilTel', sym: 'PHTL', sector: 'Telecom – Internet', hq: 'Makati' },
    { name: 'Linked Micro', sym: 'LKMC', sector: 'Consumer Electronics', hq: 'Biñan' },
    { name: 'The Nest Resorts', sym: 'TNRS', sector: 'Tourism Services', hq: 'Makati' },
  ],
  PLW: [
    { name: 'PalauTel', sym: 'PLTL', sector: 'Telecom – Mobile', hq: 'Melekeok' },
    { name: 'Koror Paradise Resort', sym: 'PPRR', sector: 'Tourism Services', hq: 'Koror' },
  ],
  PNG: [
    { name: 'PapuaTel', sym: 'PPTL', sector: 'Telecom – Mobile', hq: 'Port Moresby' },
    { name: 'River Tedi Mining', sym: 'RTMN', sector: 'Mining – Metals', hq: 'Tabubil' },
  ],
  POL: [
    { name: 'Orlin', sym: 'ORLN', sector: 'Oil Refining & Fuels', hq: 'Plock' },
    { name: 'PeKaO Bank', sym: 'PKBK', sector: 'Finance – Banking', hq: 'Warsaw' },
    { name: 'RedProjekt', sym: 'RPRJ', sector: 'Entertainment – Gaming & Sports', hq: 'Warsaw' },
    { name: 'Sunbus', sym: 'SUNB', sector: 'Vehicles – Cars & Trucks', hq: 'Bolechowo' },
    { name: 'Wadowice Foods', sym: 'WDFD', sector: 'Food Processing', hq: 'Wadowice' },
    { name: 'Polish Mining Group', sym: 'PMGP', sector: 'Coal & Peat', hq: 'Katowice' },
  ],
  PRK: [
    { name: 'Koryo Air', sym: 'KRAR', sector: 'Airlines – Passenger', hq: 'Pyongyang' },
    { name: 'North Iron', sym: 'NTRN', sector: 'Mining – Metals', hq: 'Musan' },
  ],
  PRT: [
    { name: 'PortuPower', sym: 'PTPR', sector: 'Electricity Generation', hq: 'Lisbon' },
    { name: 'Lisbon Resorts', sym: 'LSRT', sector: 'Tourism Services', hq: 'Lisbon' },
  ],
  PRY: [
    { name: 'ParaTel', sym: 'PYTL', sector: 'Telecom – Mobile', hq: 'Asuncion' },
    { name: 'Highfield Farms', sym: 'HFLD', sector: 'Crop Farming', hq: 'Asunción' },
  ],
  PSE: [
    { name: 'PalestineTel', sym: 'PSEL', sector: 'Telecom – Mobile', hq: 'Ramallah' },
    { name: 'Jenin Olive Fair Trade', sym: 'JOFT', sector: 'Crop Farming', hq: 'Jenin' },
  ],
  QAT: [
    { name: 'QatariWings', sym: 'QTWG', sector: 'Airlines – Passenger', hq: 'Doha' },
    { name: 'QatarGas', sym: 'QTGS', sector: 'Natural Gas', hq: 'Doha' },
    { name: 'Doha Energy Corporation', sym: 'DECO', sector: 'Oil Extraction', hq: 'Doha' },
    { name: 'Doha Petrochemicals', sym: 'DPCH', sector: 'Chemicals – Basic', hq: 'Doha' },
  ],
  ROU: [
    { name: 'PetroRom', sym: 'PTRO', sector: 'Oil Refining & Fuels', hq: 'Bucharest' },
    { name: 'Carpathian Cars', sym: 'CRPC', sector: 'Vehicles – Cars & Trucks', hq: 'Mioveni' },
  ],
  RUS: [
    { name: 'Gas Giant', sym: 'GSGN', sector: 'Natural Gas', hq: 'Saint Petersburg' },
    { name: 'RosOil', sym: 'RSOL', sector: 'Oil Extraction', hq: 'Moscow' },
    { name: 'SavingsBank', sym: 'SVBK', sector: 'Finance – Banking', hq: 'Moscow' },
    { name: 'LookOil', sym: 'LKOI', sector: 'Oil Extraction', hq: 'Moscow' },
    { name: 'Siberian Coal', sym: 'SBCL', sector: 'Coal & Peat', hq: 'Moscow' },
    { name: 'Arctic Nickel', sym: 'ARNK', sector: 'Mining – Metals', hq: 'Moscow' },
  ],
  RWA: [
    { name: 'RwandaTel', sym: 'RWTL', sector: 'Telecom – Mobile', hq: 'Kigali' },
    { name: 'Kigali Highland Tea', sym: 'KHGT', sector: 'Crop Farming', hq: 'Kigali' },
  ],
  SAU: [
    { name: 'ArabianOil', sym: 'ARBO', sector: 'Oil Extraction', hq: 'Dhahran' },
    { name: 'SaudiChem', sym: 'SCHM', sector: 'Chemicals – Basic', hq: 'Riyadh' },
    { name: 'AlRaji', sym: 'ALRJ', sector: 'Finance – Banking', hq: 'Riyadh' },
    { name: 'Dhahran Gas Company', sym: 'DGAS', sector: 'Natural Gas', hq: 'Dhahran' },
    { name: 'Dhahran Refining Co', sym: 'DRFC', sector: 'Oil Refining & Fuels', hq: 'Dhahran' },
  ],
  SDN: [
    { name: 'SudaTel', sym: 'SDTL', sector: 'Telecom – Mobile', hq: 'Khartoum' },
    { name: 'Khartoum Sugar Estates', sym: 'KHSE', sector: 'Crop Farming', hq: 'Khartoum' },
  ],
  SEN: [
    { name: 'DakarTel', sym: 'DKTL', sector: 'Telecom – Mobile', hq: 'Dakar' },
    { name: 'Dakar Fish Farms', sym: 'DFFM', sector: 'Fishing & Aquaculture', hq: 'Dakar' },
  ],
  SGP: [
    { name: 'DevBankSG', sym: 'DBSG', sector: 'Finance – Banking', hq: 'Singapore' },
    { name: 'SingMobile', sym: 'SGMB', sector: 'Telecom – Mobile', hq: 'Singapore' },
    { name: 'PalmKing', sym: 'PLMK', sector: 'Food Processing', hq: 'Singapore' },
    { name: 'OlamAgri', sym: 'OLAG', sector: 'Crop Farming', hq: 'Singapore' },
    { name: 'Singapore Precision', sym: 'SGPR', sector: 'Semiconductors', hq: 'Singapore' },
    { name: 'Ocean International Lines', sym: 'OILN', sector: 'Shipping – Freight', hq: 'Singapore' },
  ],
  SLB: [
    { name: 'SolomonTel', sym: 'SLTL', sector: 'Telecom – Mobile', hq: 'Honiara' },
    { name: 'Sun Tuna', sym: 'SNTU', sector: 'Fishing & Aquaculture', hq: 'Noro' },
  ],
  SLE: [
    { name: 'SierraTel', sym: 'SRTL', sector: 'Telecom – Mobile', hq: 'Freetown' },
    { name: 'Freetown Rutile Mines', sym: 'FRTM', sector: 'Mining – Metals', hq: 'Freetown' },
  ],
  SLV: [
    { name: 'SalvaTel', sym: 'SVTL', sector: 'Telecom – Mobile', hq: 'San Salvador' },
    { name: 'Bloom Uniforms', sym: 'BLMU', sector: 'Textiles', hq: 'San Salvador' },
  ],
  SMR: [
    { name: 'MarinoTel', sym: 'SMTL', sector: 'Telecom – Mobile', hq: 'San Marino' },
    { name: 'Faetano Bank', sym: 'FTNB', sector: 'Finance – Banking', hq: 'Faetano' },
  ],
  SOM: [
    { name: 'Hormud', sym: 'HRMD', sector: 'Telecom – Mobile', hq: 'Mogadishu' },
    { name: 'Mogadishu Livestock Traders', sym: 'MLTR', sector: 'Livestock Farming', hq: 'Mogadishu' },
  ],
  SRB: [
    { name: 'SerbiaTel', sym: 'SRBT', sector: 'Telecom – Mobile', hq: 'Belgrade' },
    { name: 'Belgrade Frozen Foods', sym: 'BGFF', sector: 'Food Processing', hq: 'Belgrade' },
  ],
  SSD: [
    { name: 'SudanSouthTel', sym: 'SSTL', sector: 'Telecom – Mobile', hq: 'Juba' },
    { name: 'Juba Nile Petroleum', sym: 'JNPT', sector: 'Oil Extraction', hq: 'Juba' },
  ],
  STP: [
    { name: 'SaoTel', sym: 'STTL', sector: 'Telecom – Mobile', hq: 'Sao Tome' },
    { name: 'Sao Tome Quality Cocoa', sym: 'STQC', sector: 'Crop Farming', hq: 'São Tomé' },
  ],
  SUR: [
    { name: 'SuriTel', sym: 'SUTL', sector: 'Telecom – Mobile', hq: 'Paramaribo' },
    { name: 'Rosegold Mines', sym: 'RSGM', sector: 'Mining – Metals', hq: 'Paramaribo' },
  ],
  SVK: [
    { name: 'BratislavaTel', sym: 'BTTL', sector: 'Telecom – Mobile', hq: 'Bratislava' },
    { name: 'Bratislava Motors', sym: 'BRMO', sector: 'Vehicles – Cars & Trucks', hq: 'Bratislava' },
  ],
  SVN: [
    { name: 'LjubljanaTel', sym: 'LJTL', sector: 'Telecom – Mobile', hq: 'Ljubljana' },
    { name: 'Novo Pharma', sym: 'NVPH', sector: 'Pharmaceuticals', hq: 'Novo Mesto' },
  ],
  SWE: [
    { name: 'Volva', sym: 'VLVA', sector: 'Vehicles – Cars & Trucks', hq: 'Gothenburg' },
    { name: 'Erikson', sym: 'ERKS', sector: 'Telecom – Mobile', hq: 'Stockholm' },
    { name: 'Ikeea', sym: 'IKEE', sector: 'Furniture & Consumer Goods', hq: 'Almhult' },
    { name: 'Hennes', sym: 'HNNS', sector: 'Apparel & Footwear', hq: 'Stockholm' },
    { name: 'Sickla Tools', sym: 'SCKT', sector: 'Machinery – Industrial', hq: 'Nacka' },
  ],
  SWZ: [
    { name: 'SwaziTel', sym: 'SZTL', sector: 'Telecom – Mobile', hq: 'Mbabane' },
    { name: 'Simunye Sugar Corporation', sym: 'SSGC', sector: 'Crop Farming', hq: 'Simunye' },
  ],
  SYC: [
    { name: 'SeyTel', sym: 'SYTL', sector: 'Telecom – Mobile', hq: 'Victoria' },
    { name: 'Victoria Island Tours', sym: 'VITO', sector: 'Tourism Services', hq: 'Victoria' },
  ],
  SYR: [
    { name: 'SyriaTel', sym: 'SYRT', sector: 'Telecom – Mobile', hq: 'Damascus' },
    { name: 'Damascus Petroleum Co', sym: 'DMPC', sector: 'Oil Extraction', hq: 'Damascus' },
  ],
  TCD: [
    { name: 'ChadTel', sym: 'TDTL', sector: 'Telecom – Mobile', hq: 'Ndjamena' },
    { name: 'N\'Djamena Hydrocarbons', sym: 'NDHC', sector: 'Oil Extraction', hq: 'N\'Djamena' },
  ],
  TGO: [
    { name: 'TogoCom', sym: 'TGCM', sector: 'Telecom – Mobile', hq: 'Lome' },
    { name: 'Atakpame Cotton Co', sym: 'ATCC', sector: 'Crop Farming', hq: 'Atakpamé' },
  ],
  THA: [
    { name: 'ThaiOil', sym: 'THOL', sector: 'Oil Extraction', hq: 'Bangkok' },
    { name: 'Seven11', sym: 'SVEN', sector: 'Retail – General', hq: 'Bangkok' },
    { name: 'SiamCement', sym: 'SMCM', sector: 'Construction – Infrastructure', hq: 'Bangkok' },
    { name: 'MinorHotels', sym: 'MNHL', sector: 'Hotels', hq: 'Bangkok' },
    { name: 'Major Hotels', sym: 'MJHT', sector: 'Tourism Services', hq: 'Bangkok' },
    { name: 'Prosper Foods', sym: 'PRFD', sector: 'Food Processing', hq: 'Bangkok' },
  ],
  TJK: [
    { name: 'TajikTel', sym: 'TJTL', sector: 'Telecom – Mobile', hq: 'Dushanbe' },
    { name: 'Tursun Aluminium', sym: 'TRAL', sector: 'Mining – Metals', hq: 'Tursunzoda' },
  ],
  TKM: [
    { name: 'TurkmenTel', sym: 'TKTL', sector: 'Telecom – Mobile', hq: 'Ashgabat' },
    { name: 'Turkmen Flame', sym: 'TKFL', sector: 'Natural Gas', hq: 'Ashgabat' },
  ],
  TLS: [
    { name: 'TimorTel', sym: 'TLTL', sector: 'Telecom – Mobile', hq: 'Dili' },
    { name: 'Timor Gulf', sym: 'TMGF', sector: 'Oil Extraction', hq: 'Dili' },
  ],
  TON: [
    { name: 'TongaTel', sym: 'TNTL', sector: 'Telecom – Mobile', hq: "Nuku'alofa" },
    { name: 'Pacific Sunset Fishing', sym: 'PSFS', sector: 'Fishing & Aquaculture', hq: 'Nuku\'alofa' },
  ],
  TTO: [
    { name: 'TriniTel', sym: 'TTTL', sector: 'Telecom – Mobile', hq: 'Port of Spain' },
    { name: 'TriniGas', sym: 'TRGS', sector: 'Natural Gas', hq: 'Couva' },
  ],
  TUN: [
    { name: 'TunisiaTel', sym: 'TSTL', sector: 'Telecom – Mobile', hq: 'Tunis' },
    { name: 'Tunis Textile Mills', sym: 'TTML', sector: 'Textiles', hq: 'Tunis' },
  ],
  TUR: [
    { name: 'TurkAir', sym: 'TKAR', sector: 'Airlines – Passenger', hq: 'Istanbul' },
    { name: 'Kotch', sym: 'KTCH', sector: 'Finance – Investment', hq: 'Istanbul' },
    { name: 'TurkMobile', sym: 'TKMB', sector: 'Telecom – Mobile', hq: 'Istanbul' },
    { name: 'Istanbul Denim Co', sym: 'IDNC', sector: 'Textiles', hq: 'Istanbul' },
    { name: 'Antalya All-Inclusive Resorts', sym: 'AAIR', sector: 'Tourism Services', hq: 'Antalya' },
  ],
  TUV: [
    { name: 'TuvaluTel', sym: 'TVTL', sector: 'Telecom – Mobile', hq: 'Funafuti' },
    { name: 'Funafuti Fish', sym: 'FNFT', sector: 'Fishing & Aquaculture', hq: 'Funafuti' },
  ],
  TWN: [
    { name: 'TaiSemi', sym: 'TSMI', sector: 'Semiconductors', hq: 'Hsinchu' },
    { name: 'FoxLink', sym: 'FXLK', sector: 'Electronics – Components', hq: 'New Taipei City' },
    { name: 'MediaTekk', sym: 'MDTK', sector: 'Semiconductors', hq: 'Hsinchu' },
    { name: 'Asuss', sym: 'ASUU', sector: 'Consumer Electronics', hq: 'Taipei' },
  ],
  TZA: [
    { name: 'TanzaTel', sym: 'TZTL', sector: 'Telecom – Mobile', hq: 'Dar es Salaam' },
    { name: 'Arusha Safari Lodges', sym: 'ASLG', sector: 'Tourism Services', hq: 'Arusha' },
  ],
  UGA: [
    { name: 'UgandaTel', sym: 'UGTL', sector: 'Telecom – Mobile', hq: 'Kampala' },
    { name: 'Jinja Cane Estates', sym: 'JNCE', sector: 'Crop Farming', hq: 'Kakira' },
  ],
  UKR: [
    { name: 'NaftoGaz', sym: 'NFTG', sector: 'Natural Gas', hq: 'Kyiv' },
    { name: 'Kyiv Sunflower', sym: 'KYSN', sector: 'Crop Farming', hq: 'Kyiv' },
    { name: 'Kryvyi Steel', sym: 'KRST', sector: 'Steel Production', hq: 'Kryvyi Rih' },
    { name: 'Kyiv Poultry', sym: 'KYPL', sector: 'Food Processing', hq: 'Kyiv' },
  ],
  URY: [
    { name: 'Antell', sym: 'ANTL', sector: 'Telecom – Mobile', hq: 'Montevideo' },
    { name: 'Puppy Pampas Ranches', sym: 'PPRC', sector: 'Livestock Farming', hq: 'Montevideo' },
  ],
  USA: [
    { name: 'Banana', sym: 'BNNA', sector: 'Consumer Electronics', hq: 'Cupertino' },
    { name: 'Microhard', sym: 'MCRH', sector: 'Software & AI', hq: 'Redmond' },
    { name: 'Goggle', sym: 'GGLE', sector: 'Data Centers & Cloud', hq: 'Mountain View' },
    { name: 'Amazone', sym: 'AMZE', sector: 'Retail – General', hq: 'Seattle' },
    { name: 'Burger Shuck', sym: 'BSHK', sector: 'Restaurants & Bars', hq: 'Miami' },
    { name: 'Veda Semiconductors', sym: 'VEDA', sector: 'Semiconductors', hq: 'Santa Clara' },
    { name: 'St. Louis Coal Co.', sym: 'SLCC', sector: 'Coal & Peat', hq: 'St. Louis' },
    { name: 'Morgan Pursuit Bank', sym: 'MPBK', sector: 'Finance – Banking', hq: 'New York' },
    { name: 'Flying B Aerospace', sym: 'FLBA', sector: 'Aerospace', hq: 'Arlington' },
  ],
  UZB: [
    { name: 'UzbekTel', sym: 'UZTL', sector: 'Telecom – Mobile', hq: 'Tashkent' },
    { name: 'Uzbek Flame Gas', sym: 'UZFG', sector: 'Natural Gas', hq: 'Tashkent' },
    { name: 'Kyzylkum Mining', sym: 'KZMN', sector: 'Mining – Metals', hq: 'Navoiy' },
  ],
  VAT: [
    { name: 'Vatican Voice', sym: 'VTVC', sector: 'Entertainment – Film & Music', hq: 'Vatican City' },
  ],
  VCT: [
    { name: 'VincentTel', sym: 'VCTL', sector: 'Telecom – Mobile', hq: 'Kingstown' },
    { name: 'Youth Island Resort', sym: 'YTHI', sector: 'Tourism Services', hq: 'Calliaqua' },
  ],
  VEN: [
    { name: 'PetroVene', sym: 'PTVN', sector: 'Oil Extraction', hq: 'Caracas' },
  ],
  VNM: [
    { name: 'VietMobile', sym: 'VTMB', sector: 'Telecom – Mobile', hq: 'Hanoi' },
    { name: 'Hanoi Textiles', sym: 'HNTX', sector: 'Textiles', hq: 'Hanoi' },
    { name: 'Hanoi Smart', sym: 'HNSM', sector: 'Consumer Electronics', hq: 'Hanoi' },
    { name: 'Golden Gia Lai', sym: 'GGLL', sector: 'Crop Farming', hq: 'Pleiku' },
  ],
  VUT: [
    { name: 'VanuatuTel', sym: 'VUTL', sector: 'Telecom – Mobile', hq: 'Port Vila' },
    { name: 'Hideaway Island Resort', sym: 'HDIR', sector: 'Tourism Services', hq: 'Port Vila' },
  ],
  WSM: [
    { name: 'SamoaTel', sym: 'WSTL', sector: 'Telecom – Mobile', hq: 'Apia' },
    { name: 'Samoa Shores Hotel', sym: 'SMSH', sector: 'Tourism Services', hq: 'Apia' },
  ],
  YEM: [
    { name: 'YemenTel', sym: 'YMTL', sector: 'Telecom – Mobile', hq: "Sana'a" },
    { name: 'Sanaa Petroleum Co', sym: 'SNPC', sector: 'Oil Extraction', hq: 'Sanaa' },
  ],
  ZAF: [
    { name: 'Naspas', sym: 'NSPA', sector: 'Software & AI', hq: 'Cape Town' },
    { name: 'OilCoal', sym: 'OLCL', sector: 'Chemicals – Basic', hq: 'Johannesburg' },
    { name: 'StanBank', sym: 'STNB', sector: 'Finance – Banking', hq: 'Johannesburg' },
    { name: 'ExxaroCoal', sym: 'EXXC', sector: 'Coal & Peat', hq: 'Pretoria' },
    { name: 'Johannesburg Platinum Mines', sym: 'JPLM', sector: 'Mining – Metals', hq: 'Johannesburg' },
    { name: 'Tongaat Sugar & Starch', sym: 'TSSG', sector: 'Crop Farming', hq: 'Tongaat' },
  ],
  ZMB: [
    { name: 'ZamTel', sym: 'ZMTL', sector: 'Telecom – Mobile', hq: 'Lusaka' },
    { name: 'Lusaka Copper Holdings', sym: 'LCHP', sector: 'Mining – Metals', hq: 'Lusaka' },
  ],
  ZWE: [
    { name: 'HarareTel', sym: 'HRTL', sector: 'Telecom – Mobile', hq: 'Harare' },
    { name: 'Harare Platinum Mines', sym: 'HPLM', sector: 'Mining – Metals', hq: 'Harare' },
  ],
};
