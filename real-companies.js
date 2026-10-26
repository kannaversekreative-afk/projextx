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
  ],
  AGO: [
    { name: 'SonanOil', sym: 'SNOL', sector: 'Oil Extraction', hq: 'Luanda' },
  ],
  ALB: [
    { name: 'AlbaTel', sym: 'ALBT', sector: 'Telecom – Mobile', hq: 'Tirana' },
  ],
  AND: [
    { name: 'AndorraBank', sym: 'ANDB', sector: 'Finance – Banking', hq: 'Andorra la Vella' },
  ],
  ARE: [
    { name: 'EmirAir', sym: 'EMRA', sector: 'Airlines – Passenger', hq: 'Dubai' },
    { name: 'DubaiPorts', sym: 'DBPT', sector: 'Ports & Airports Services', hq: 'Dubai' },
  ],
  ARG: [
    { name: 'ArgOil', sym: 'ARGO', sector: 'Oil Extraction', hq: 'Buenos Aires' },
    { name: 'FreeMarket', sym: 'FRMK', sector: 'Retail – General', hq: 'Buenos Aires' },
    { name: 'TechTent', sym: 'TCHT', sector: 'Steel Production', hq: 'Buenos Aires' },
  ],
  ARM: [
    { name: 'ArmeniaTel', sym: 'ARMT', sector: 'Telecom – Mobile', hq: 'Yerevan' },
  ],
  ATG: [
    { name: 'Leeward Air', sym: 'LWDA', sector: 'Airlines – Passenger', hq: 'St. John\'s' },
  ],
  AUS: [
    { name: 'Broken Hill', sym: 'BRKH', sector: 'Mining – Metals', hq: 'Melbourne' },
    { name: 'CommonBank', sym: 'CMBK', sector: 'Finance – Banking', hq: 'Sydney' },
    { name: 'WoolMart', sym: 'WLMT', sector: 'Retail – Grocery', hq: 'Sydney' },
    { name: 'Flying Kangaroo', sym: 'FLKR', sector: 'Airlines – Passenger', hq: 'Sydney' },
  ],
  AUT: [
    { name: 'OeMV', sym: 'OEMV', sector: 'Oil Refining & Fuels', hq: 'Vienna' },
    { name: 'FirstBank', sym: 'FSTB', sector: 'Finance – Banking', hq: 'Vienna' },
    { name: 'CrimsonBull', sym: 'CRMB', sector: 'Beverages & Tobacco', hq: 'Fuschl am See' },
  ],
  AZE: [
    { name: 'CaspianOil', sym: 'CPOI', sector: 'Oil Extraction', hq: 'Baku' },
  ],
  BDI: [
    { name: 'OnaTel', sym: 'ONTL', sector: 'Telecom – Mobile', hq: 'Bujumbura' },
  ],
  BEL: [
    { name: 'InBrew', sym: 'INBW', sector: 'Beverages & Tobacco', hq: 'Leuven' },
    { name: 'KBSee', sym: 'KBSE', sector: 'Finance – Banking', hq: 'Brussels' },
    { name: 'Solva', sym: 'SLVA', sector: 'Chemicals – Basic', hq: 'Brussels' },
  ],
  BEN: [
    { name: 'BeninTel', sym: 'BNTL', sector: 'Telecom – Mobile', hq: 'Cotonou' },
  ],
  BFA: [
    { name: 'BurkinaTel', sym: 'BKTL', sector: 'Telecom – Mobile', hq: 'Ouagadougou' },
  ],
  BGD: [
    { name: 'VillagePhone', sym: 'VLGP', sector: 'Telecom – Mobile', hq: 'Dhaka' },
    { name: 'BeximTex', sym: 'BXMT', sector: 'Textiles', hq: 'Dhaka' },
  ],
  BGR: [
    { name: 'VivaTel', sym: 'VVTL', sector: 'Telecom – Mobile', hq: 'Sofia' },
  ],
  BHR: [
    { name: 'GulfWings', sym: 'GFWG', sector: 'Airlines – Passenger', hq: 'Muharraq' },
  ],
  BHS: [
    { name: 'BahamaAir', sym: 'BHMA', sector: 'Airlines – Passenger', hq: 'Nassau' },
  ],
  BIH: [
    { name: 'BosnaTel', sym: 'BSTL', sector: 'Telecom – Mobile', hq: 'Sarajevo' },
  ],
  BLR: [
    { name: 'BelKali', sym: 'BLKL', sector: 'Fertilizers & Pesticides', hq: 'Minsk' },
  ],
  BLZ: [
    { name: 'BelizeTel', sym: 'BLZT', sector: 'Telecom – Mobile', hq: 'Belize City' },
  ],
  BOL: [
    { name: 'BoliviaOil', sym: 'BLOL', sector: 'Oil Extraction', hq: 'La Paz' },
  ],
  BRA: [
    { name: 'BraOil', sym: 'BRLO', sector: 'Oil Extraction', hq: 'Rio de Janeiro' },
    { name: 'Valley Mining', sym: 'VLMN', sector: 'Mining – Metals', hq: 'Rio de Janeiro' },
    { name: 'ItaYou', sym: 'ITYU', sector: 'Finance – Banking', hq: 'Sao Paulo' },
    { name: 'BrazAir', sym: 'BZAR', sector: 'Aerospace', hq: 'Sao Jose dos Campos' },
    { name: 'SabeSp', sym: 'SBSP', sector: 'Water Supply', hq: 'Sao Paulo' },
  ],
  BRB: [
    { name: 'BajanPower', sym: 'BJNP', sector: 'Electricity Distribution', hq: 'Bridgetown' },
  ],
  BRN: [
    { name: 'Brunei Royal Air', sym: 'BRAR', sector: 'Airlines – Passenger', hq: 'Bandar Seri Begawan' },
  ],
  BTN: [
    { name: 'DragonPower', sym: 'DRGP', sector: 'Electricity Generation', hq: 'Thimphu' },
  ],
  BWA: [
    { name: 'Botswana Diamonds', sym: 'BTDM', sector: 'Mining – Non-metals', hq: 'Gaborone' },
  ],
  CAF: [
    { name: 'Telecel', sym: 'TLCL', sector: 'Telecom – Mobile', hq: 'Bangui' },
  ],
  CAN: [
    { name: 'Royal Crown Bank', sym: 'RCBK', sector: 'Finance – Banking', hq: 'Toronto' },
    { name: 'ShopiFly', sym: 'SHPF', sector: 'Software & AI', hq: 'Ottawa' },
    { name: 'CanRail', sym: 'CNRL', sector: 'Rail Transport', hq: 'Montreal' },
    { name: 'Tims Donuts', sym: 'TMDN', sector: 'Restaurants & Bars', hq: 'Toronto' },
    { name: 'MagnaParts', sym: 'MGNP', sector: 'Vehicles – Parts', hq: 'Aurora' },
  ],
  CHE: [
    { name: 'NestEgg', sym: 'NSTG', sector: 'Food Processing', hq: 'Vevey' },
    { name: 'Roach', sym: 'ROCH', sector: 'Pharmaceuticals', hq: 'Basel' },
    { name: 'NewArtis', sym: 'NWAT', sector: 'Pharmaceuticals', hq: 'Basel' },
    { name: 'UnionBankSwiss', sym: 'UBNK', sector: 'Finance – Banking', hq: 'Zurich' },
    { name: 'KuehNagel', sym: 'KHNL', sector: 'Logistics & Warehousing', hq: 'Schindellegi' },
  ],
  CHL: [
    { name: 'CopperChile', sym: 'CPCL', sector: 'Mining – Metals', hq: 'Santiago' },
  ],
  CHN: [
    { name: 'WeiWay', sym: 'WEWY', sector: 'Telecom – Mobile', hq: 'Shenzhen' },
    { name: 'TenPence', sym: 'TPNC', sector: 'Software & AI', hq: 'Shenzhen' },
    { name: 'FortyThieves', sym: 'FTTV', sector: 'Retail – General', hq: 'Hangzhou' },
    { name: 'DreamDrive', sym: 'DRDV', sector: 'Vehicles – Cars & Trucks', hq: 'Shenzhen' },
    { name: 'Great Wall Bank', sym: 'GWBK', sector: 'Finance – Banking', hq: 'Beijing' },
  ],
  CIV: [
    { name: 'IvoireTel', sym: 'IVTL', sector: 'Telecom – Mobile', hq: 'Abidjan' },
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
  ],
  COM: [
    { name: 'ComorosTel', sym: 'CMTL', sector: 'Telecom – Mobile', hq: 'Moroni' },
  ],
  CPV: [
    { name: 'CapeAir', sym: 'CPAR', sector: 'Airlines – Passenger', hq: 'Sal' },
  ],
  CRI: [
    { name: 'CostaPower', sym: 'CSPW', sector: 'Electricity Distribution', hq: 'San Jose' },
  ],
  CUB: [
    { name: 'CubaCel', sym: 'CUCL', sector: 'Telecom – Mobile', hq: 'Havana' },
  ],
  CYP: [
    { name: 'CyprusBank', sym: 'CYBK', sector: 'Finance – Banking', hq: 'Nicosia' },
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
  ],
  DJI: [
    { name: 'DjibTel', sym: 'DJTL', sector: 'Telecom – Mobile', hq: 'Djibouti City' },
  ],
  DMA: [
    { name: 'DominicaTel', sym: 'DMTL', sector: 'Telecom – Mobile', hq: 'Roseau' },
  ],
  DNK: [
    { name: 'Mersk', sym: 'MRSK', sector: 'Shipping – Freight', hq: 'Copenhagen' },
    { name: 'NovoNord', sym: 'NVND', sector: 'Pharmaceuticals', hq: 'Bagsvaerd' },
    { name: 'DanishCrown', sym: 'DNCR', sector: 'Meat Processing', hq: 'Randers' },
    { name: 'VestaWind', sym: 'VSTW', sector: 'Renewable Energy Technology', hq: 'Aarhus' },
  ],
  DOM: [
    { name: 'SantoTel', sym: 'SNTL', sector: 'Telecom – Mobile', hq: 'Santo Domingo' },
  ],
  DZA: [
    { name: 'AlgerOil', sym: 'ALGO', sector: 'Oil Extraction', hq: 'Algiers' },
  ],
  ECU: [
    { name: 'EcuOil', sym: 'ECOL', sector: 'Oil Extraction', hq: 'Quito' },
  ],
  EGY: [
    { name: 'NileAir', sym: 'NLAR', sector: 'Airlines – Passenger', hq: 'Cairo' },
  ],
  ERI: [
    { name: 'EriTel', sym: 'ERTL', sector: 'Telecom – Mobile', hq: 'Asmara' },
  ],
  ESP: [
    { name: 'SaintAnder', sym: 'SADR', sector: 'Finance – Banking', hq: 'Santander' },
    { name: 'Zora', sym: 'ZORA', sector: 'Apparel & Footwear', hq: 'Arteixo' },
    { name: 'TeleSpania', sym: 'TLSP', sector: 'Telecom – Mobile', hq: 'Madrid' },
    { name: 'IberPower', sym: 'IBPR', sector: 'Electricity Generation', hq: 'Bilbao' },
    { name: 'Fomento', sym: 'FMNT', sector: 'Waste & Recycling', hq: 'Madrid' },
  ],
  EST: [
    { name: 'Boltt', sym: 'BLTT', sector: 'Road Transport & Trucking', hq: 'Tallinn' },
  ],
  ETH: [
    { name: 'Ethiopia Air', sym: 'ETAR', sector: 'Airlines – Passenger', hq: 'Addis Ababa' },
  ],
  FIN: [
    { name: 'Nokla', sym: 'NKLA', sector: 'Telecom – Mobile', hq: 'Espoo' },
    { name: 'Stora', sym: 'STRA', sector: 'Forestry & Timber', hq: 'Helsinki' },
  ],
  FJI: [
    { name: 'FijiAir', sym: 'FJAR', sector: 'Airlines – Passenger', hq: 'Nadi' },
  ],
  FRA: [
    { name: 'LuxeHouse', sym: 'LXHS', sector: 'Apparel & Footwear', hq: 'Paris' },
    { name: 'Totally Energy', sym: 'TTLE', sector: 'Oil Refining & Fuels', hq: 'Courbevoie' },
    { name: 'AirCoach', sym: 'ARCC', sector: 'Aerospace', hq: 'Toulouse' },
    { name: 'Paris National Bank', sym: 'PNBK', sector: 'Finance – Banking', hq: 'Paris' },
    { name: 'VeoLia', sym: 'VLEA', sector: 'Water Supply', hq: 'Paris' },
  ],
  FSM: [
    { name: 'MicronTel', sym: 'MCTL', sector: 'Telecom – Mobile', hq: 'Palikir' },
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
  ],
  GEO: [
    { name: 'GeorgiaRail', sym: 'GGRL', sector: 'Rail Transport', hq: 'Tbilisi' },
  ],
  GHA: [
    { name: 'GhanaTel', sym: 'GHTL', sector: 'Telecom – Mobile', hq: 'Accra' },
  ],
  GIN: [
    { name: 'GuineaTel', sym: 'GNTL', sector: 'Telecom – Mobile', hq: 'Conakry' },
  ],
  GMB: [
    { name: 'GamTel', sym: 'GMTL', sector: 'Telecom – Mobile', hq: 'Banjul' },
  ],
  GNB: [
    { name: 'GBTel', sym: 'GBTL', sector: 'Telecom – Mobile', hq: 'Bissau' },
  ],
  GNQ: [
    { name: 'GePetro', sym: 'GPTR', sector: 'Oil Extraction', hq: 'Malabo' },
  ],
  GRC: [
    { name: 'HellasTel', sym: 'HLTL', sector: 'Telecom – Mobile', hq: 'Athens' },
  ],
  GRD: [
    { name: 'GrenadaTel', sym: 'GRTL', sector: 'Telecom – Mobile', hq: 'St. George\'s' },
  ],
  GTM: [
    { name: 'GuateTel', sym: 'GTTL', sector: 'Telecom – Mobile', hq: 'Guatemala City' },
  ],
  GUY: [
    { name: 'GuyanaTel', sym: 'GYTL', sector: 'Telecom – Mobile', hq: 'Georgetown' },
  ],
  HND: [
    { name: 'HonduTel', sym: 'HNTL', sector: 'Telecom – Mobile', hq: 'Tegucigalpa' },
  ],
  HRV: [
    { name: 'CroTel', sym: 'CRTL', sector: 'Telecom – Mobile', hq: 'Zagreb' },
  ],
  HTI: [
    { name: 'HaitiCom', sym: 'HTCM', sector: 'Telecom – Mobile', hq: 'Port-au-Prince' },
  ],
  HUN: [
    { name: 'MolOil', sym: 'MLOL', sector: 'Oil Refining & Fuels', hq: 'Budapest' },
  ],
  IDN: [
    { name: 'IndoTel', sym: 'IDTL', sector: 'Telecom – Mobile', hq: 'Jakarta' },
    { name: 'CentralAsia Bank', sym: 'CABK', sector: 'Finance – Banking', hq: 'Jakarta' },
    { name: 'IndoNoodles', sym: 'INDL', sector: 'Food Processing', hq: 'Jakarta' },
  ],
  IND: [
    { name: 'Dependence', sym: 'DPND', sector: 'Oil Refining & Fuels', hq: 'Mumbai' },
    { name: 'InfoCousin', sym: 'INFC', sector: 'Software & AI', hq: 'Bengaluru' },
    { name: 'HomeBank', sym: 'HMBK', sector: 'Finance – Banking', hq: 'Mumbai' },
    { name: 'TractorKing', sym: 'TRKR', sector: 'Machinery – Agricultural', hq: 'Mumbai' },
    { name: 'YashRaj', sym: 'YSRJ', sector: 'Entertainment – Film & Music', hq: 'Mumbai' },
  ],
  IRL: [
    { name: 'Ryans Air', sym: 'RYAR', sector: 'Airlines – Passenger', hq: 'Dublin' },
    { name: 'Guinnes', sym: 'GNSS', sector: 'Beverages & Tobacco', hq: 'Dublin' },
    { name: 'Accentur', sym: 'ACNT', sector: 'Professional – Consulting', hq: 'Dublin' },
  ],
  IRN: [
    { name: 'PersiaOil', sym: 'PRSO', sector: 'Oil Extraction', hq: 'Tehran' },
  ],
  IRQ: [
    { name: 'IraqTel', sym: 'IQTL', sector: 'Telecom – Mobile', hq: 'Baghdad' },
  ],
  ISL: [
    { name: 'IceAir', sym: 'ICAR', sector: 'Airlines – Passenger', hq: 'Reykjavik' },
  ],
  ISR: [
    { name: 'Tevva', sym: 'TVVA', sector: 'Pharmaceuticals', hq: 'Tel Aviv' },
    { name: 'GateGuard', sym: 'GTGD', sector: 'Cybersecurity', hq: 'Tel Aviv' },
    { name: 'Elbitt', sym: 'ELBT', sector: 'Defence Equipment', hq: 'Haifa' },
  ],
  ITA: [
    { name: 'Prancing Pony', sym: 'PRPN', sector: 'Vehicles – Cars & Trucks', hq: 'Maranello' },
    { name: 'Energetica', sym: 'ENRG', sector: 'Oil Extraction', hq: 'Rome' },
    { name: 'Intense Bank', sym: 'INTB', sector: 'Finance – Banking', hq: 'Turin' },
    { name: 'Fabbrica', sym: 'FBBR', sector: 'Vehicles – Cars & Trucks', hq: 'Turin' },
  ],
  JAM: [
    { name: 'JamTel', sym: 'JMTL', sector: 'Telecom – Mobile', hq: 'Kingston' },
  ],
  JOR: [
    { name: 'Jordan Royal Air', sym: 'JRAR', sector: 'Airlines – Passenger', hq: 'Amman' },
  ],
  JPN: [
    { name: 'ToyAuto', sym: 'TYAT', sector: 'Vehicles – Cars & Trucks', hq: 'Toyota City' },
    { name: 'Sonny', sym: 'SNNY', sector: 'Consumer Electronics', hq: 'Tokyo' },
    { name: 'Ninbendo', sym: 'NNDO', sector: 'Entertainment – Gaming & Sports', hq: 'Kyoto' },
    { name: 'SquishyBank', sym: 'SQBK', sector: 'Telecom – Mobile', hq: 'Tokyo' },
    { name: 'ThreeDiamonds', sym: 'TDMD', sector: 'Machinery – Industrial', hq: 'Tokyo' },
  ],
  KAZ: [
    { name: 'KazOil', sym: 'KZOL', sector: 'Oil Extraction', hq: 'Astana' },
  ],
  KEN: [
    { name: 'SafariCom', sym: 'SFCM', sector: 'Telecom – Mobile', hq: 'Nairobi' },
  ],
  KGZ: [
    { name: 'KyrgyzMobile', sym: 'KGMB', sector: 'Telecom – Mobile', hq: 'Bishkek' },
  ],
  KHM: [
    { name: 'CamboTel', sym: 'CBTL', sector: 'Telecom – Mobile', hq: 'Phnom Penh' },
  ],
  KIR: [
    { name: 'KiribatiTel', sym: 'KRTL', sector: 'Telecom – Mobile', hq: 'Tarawa' },
  ],
  KNA: [
    { name: 'KittTel', sym: 'KTTL', sector: 'Telecom – Mobile', hq: 'Basseterre' },
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
  ],
  LBN: [
    { name: 'BeirutTel', sym: 'BRTL', sector: 'Telecom – Mobile', hq: 'Beirut' },
  ],
  LBR: [
    { name: 'LoneStarTel', sym: 'LSTL', sector: 'Telecom – Mobile', hq: 'Monrovia' },
  ],
  LBY: [
    { name: 'LibyaOil', sym: 'LBYO', sector: 'Oil Extraction', hq: 'Tripoli' },
  ],
  LCA: [
    { name: 'LuciaTel', sym: 'LCTL', sector: 'Telecom – Mobile', hq: 'Castries' },
  ],
  LIE: [
    { name: 'Hillti', sym: 'HLTI', sector: 'Machinery – Industrial', hq: 'Schaan' },
  ],
  LKA: [
    { name: 'LankaTel', sym: 'LKTL', sector: 'Telecom – Mobile', hq: 'Colombo' },
  ],
  LSO: [
    { name: 'MaseruTel', sym: 'MSTL', sector: 'Telecom – Mobile', hq: 'Maseru' },
  ],
  LTU: [
    { name: 'LitTel', sym: 'LTTL', sector: 'Telecom – Mobile', hq: 'Vilnius' },
  ],
  LUX: [
    { name: 'MittalSteel', sym: 'MTST', sector: 'Steel Production', hq: 'Luxembourg City' },
    { name: 'CargoLux', sym: 'CGLX', sector: 'Airlines – Cargo', hq: 'Luxembourg City' },
  ],
  LVA: [
    { name: 'RigaTel', sym: 'RGTL', sector: 'Telecom – Mobile', hq: 'Riga' },
  ],
  MAR: [
    { name: 'MarocTel', sym: 'MRCT', sector: 'Telecom – Mobile', hq: 'Rabat' },
  ],
  MCO: [
    { name: 'MonacoTel', sym: 'MNCT', sector: 'Telecom – Mobile', hq: 'Monaco' },
  ],
  MDA: [
    { name: 'ChisinauTel', sym: 'CHTL', sector: 'Telecom – Mobile', hq: 'Chisinau' },
  ],
  MDG: [
    { name: 'MadaTel', sym: 'MDTL', sector: 'Telecom – Mobile', hq: 'Antananarivo' },
  ],
  MDV: [
    { name: 'DhiraTel', sym: 'DHTL', sector: 'Telecom – Mobile', hq: 'Male' },
  ],
  MEX: [
    { name: 'AmeriMobile', sym: 'AMMB', sector: 'Telecom – Mobile', hq: 'Mexico City' },
    { name: 'CementMex', sym: 'CMMX', sector: 'Construction – Infrastructure', hq: 'Monterrey' },
    { name: 'Femza', sym: 'FMZA', sector: 'Beverages & Tobacco', hq: 'Monterrey' },
    { name: 'Bumbo Bread', sym: 'BMBR', sector: 'Bakery & Confectionery', hq: 'Mexico City' },
  ],
  MHL: [
    { name: 'MarshallTel', sym: 'MHTL', sector: 'Telecom – Mobile', hq: 'Majuro' },
  ],
  MKD: [
    { name: 'MacedoniaTel', sym: 'MKTL', sector: 'Telecom – Mobile', hq: 'Skopje' },
  ],
  MLI: [
    { name: 'MaliTel', sym: 'MLTL', sector: 'Telecom – Mobile', hq: 'Bamako' },
  ],
  MLT: [
    { name: 'VallettaTel', sym: 'VLTL', sector: 'Telecom – Mobile', hq: 'Valletta' },
  ],
  MMR: [
    { name: 'MyanmarTel', sym: 'MMTL', sector: 'Telecom – Mobile', hq: 'Naypyidaw' },
  ],
  MNE: [
    { name: 'MonteTel', sym: 'MNTL', sector: 'Telecom – Mobile', hq: 'Podgorica' },
  ],
  MNG: [
    { name: 'MongolTel', sym: 'MGTL', sector: 'Telecom – Mobile', hq: 'Ulaanbaatar' },
  ],
  MOZ: [
    { name: 'MozTel', sym: 'MZTL', sector: 'Telecom – Mobile', hq: 'Maputo' },
  ],
  MRT: [
    { name: 'MauriTel', sym: 'MRTL', sector: 'Telecom – Mobile', hq: 'Nouakchott' },
  ],
  MUS: [
    { name: 'MauriceTel', sym: 'MUTL', sector: 'Telecom – Mobile', hq: 'Port Louis' },
  ],
  MWI: [
    { name: 'MalawiTel', sym: 'MWTL', sector: 'Telecom – Mobile', hq: 'Lilongwe' },
  ],
  MYS: [
    { name: 'Petrona', sym: 'PTRN', sector: 'Oil Extraction', hq: 'Kuala Lumpur' },
  ],
  NAM: [
    { name: 'NamTel', sym: 'NMTL', sector: 'Telecom – Mobile', hq: 'Windhoek' },
  ],
  NER: [
    { name: 'NigerTel', sym: 'NRTL', sector: 'Telecom – Mobile', hq: 'Niamey' },
  ],
  NGA: [
    { name: 'Dango Cement', sym: 'DGCM', sector: 'Construction – Infrastructure', hq: 'Lagos' },
  ],
  NIC: [
    { name: 'NicaTel', sym: 'NCTL', sector: 'Telecom – Mobile', hq: 'Managua' },
  ],
  NLD: [
    { name: 'LithoMaster', sym: 'LTHM', sector: 'Semiconductors', hq: 'Veldhoven' },
    { name: 'Fillips', sym: 'FLLP', sector: 'Medical Devices', hq: 'Amsterdam' },
    { name: 'OrangeBank', sym: 'ORBK', sector: 'Finance – Banking', hq: 'Amsterdam' },
    { name: 'GreenBottle', sym: 'GRNB', sector: 'Beverages & Tobacco', hq: 'Amsterdam' },
    { name: 'BookIt', sym: 'BKIT', sector: 'Tourism Services', hq: 'Amsterdam' },
  ],
  NOR: [
    { name: 'NorthSea Oil', sym: 'NSOL', sector: 'Oil Extraction', hq: 'Stavanger' },
    { name: 'NorseBank', sym: 'NRSB', sector: 'Finance – Banking', hq: 'Oslo' },
    { name: 'NordicTel', sym: 'NDTL', sector: 'Telecom – Mobile', hq: 'Fornebu' },
    { name: 'MowiFish', sym: 'MWFS', sector: 'Fishing & Aquaculture', hq: 'Bergen' },
  ],
  NPL: [
    { name: 'NepalTel', sym: 'NPTL', sector: 'Telecom – Mobile', hq: 'Kathmandu' },
  ],
  NRU: [
    { name: 'NauruCom', sym: 'NRCM', sector: 'Telecom – Mobile', hq: 'Yaren' },
  ],
  NZL: [
    { name: 'KiwiAir', sym: 'KWAR', sector: 'Airlines – Passenger', hq: 'Auckland' },
    { name: 'RocketWorks', sym: 'RKTW', sector: 'Space & Satellites', hq: 'Auckland' },
    { name: 'Fontera', sym: 'FNTR', sector: 'Dairy Products', hq: 'Auckland' },
  ],
  OMN: [
    { name: 'OmanWings', sym: 'OMWG', sector: 'Airlines – Passenger', hq: 'Muscat' },
  ],
  PAK: [
    { name: 'PakTel', sym: 'PKTL', sector: 'Telecom – Mobile', hq: 'Islamabad' },
  ],
  PAN: [
    { name: 'PanamaAir', sym: 'PNAR', sector: 'Airlines – Passenger', hq: 'Panama City' },
  ],
  PER: [
    { name: 'PeruTel', sym: 'PRTL', sector: 'Telecom – Mobile', hq: 'Lima' },
  ],
  PHL: [
    { name: 'JolliBee', sym: 'JLBL', sector: 'Restaurants & Bars', hq: 'Pasig' },
    { name: 'ManilaWater', sym: 'MNWA', sector: 'Water Supply', hq: 'Manila' },
    { name: 'PhilTel', sym: 'PHTL', sector: 'Telecom – Internet', hq: 'Makati' },
  ],
  PLW: [
    { name: 'PalauTel', sym: 'PLTL', sector: 'Telecom – Mobile', hq: 'Melekeok' },
  ],
  PNG: [
    { name: 'PapuaTel', sym: 'PPTL', sector: 'Telecom – Mobile', hq: 'Port Moresby' },
  ],
  POL: [
    { name: 'Orlin', sym: 'ORLN', sector: 'Oil Refining & Fuels', hq: 'Plock' },
    { name: 'PeKaO Bank', sym: 'PKBK', sector: 'Finance – Banking', hq: 'Warsaw' },
    { name: 'RedProjekt', sym: 'RPRJ', sector: 'Entertainment – Gaming & Sports', hq: 'Warsaw' },
  ],
  PRK: [
    { name: 'Koryo Air', sym: 'KRAR', sector: 'Airlines – Passenger', hq: 'Pyongyang' },
  ],
  PRT: [
    { name: 'PortuPower', sym: 'PTPR', sector: 'Electricity Generation', hq: 'Lisbon' },
  ],
  PRY: [
    { name: 'ParaTel', sym: 'PYTL', sector: 'Telecom – Mobile', hq: 'Asuncion' },
  ],
  PSE: [
    { name: 'PalestineTel', sym: 'PSEL', sector: 'Telecom – Mobile', hq: 'Ramallah' },
  ],
  QAT: [
    { name: 'QatariWings', sym: 'QTWG', sector: 'Airlines – Passenger', hq: 'Doha' },
    { name: 'QatarGas', sym: 'QTGS', sector: 'Natural Gas', hq: 'Doha' },
  ],
  ROU: [
    { name: 'PetroRom', sym: 'PTRO', sector: 'Oil Refining & Fuels', hq: 'Bucharest' },
  ],
  RUS: [
    { name: 'Gas Giant', sym: 'GSGN', sector: 'Natural Gas', hq: 'Saint Petersburg' },
    { name: 'RosOil', sym: 'RSOL', sector: 'Oil Extraction', hq: 'Moscow' },
    { name: 'SavingsBank', sym: 'SVBK', sector: 'Finance – Banking', hq: 'Moscow' },
    { name: 'LookOil', sym: 'LKOI', sector: 'Oil Extraction', hq: 'Moscow' },
  ],
  RWA: [
    { name: 'RwandaTel', sym: 'RWTL', sector: 'Telecom – Mobile', hq: 'Kigali' },
  ],
  SAU: [
    { name: 'ArabianOil', sym: 'ARBO', sector: 'Oil Extraction', hq: 'Dhahran' },
    { name: 'SaudiChem', sym: 'SCHM', sector: 'Chemicals – Basic', hq: 'Riyadh' },
    { name: 'AlRaji', sym: 'ALRJ', sector: 'Finance – Banking', hq: 'Riyadh' },
  ],
  SDN: [
    { name: 'SudaTel', sym: 'SDTL', sector: 'Telecom – Mobile', hq: 'Khartoum' },
  ],
  SEN: [
    { name: 'DakarTel', sym: 'DKTL', sector: 'Telecom – Mobile', hq: 'Dakar' },
  ],
  SGP: [
    { name: 'DevBankSG', sym: 'DBSG', sector: 'Finance – Banking', hq: 'Singapore' },
    { name: 'SingMobile', sym: 'SGMB', sector: 'Telecom – Mobile', hq: 'Singapore' },
    { name: 'PalmKing', sym: 'PLMK', sector: 'Food Processing', hq: 'Singapore' },
    { name: 'OlamAgri', sym: 'OLAG', sector: 'Crop Farming', hq: 'Singapore' },
  ],
  SLB: [
    { name: 'SolomonTel', sym: 'SLTL', sector: 'Telecom – Mobile', hq: 'Honiara' },
  ],
  SLE: [
    { name: 'SierraTel', sym: 'SRTL', sector: 'Telecom – Mobile', hq: 'Freetown' },
  ],
  SLV: [
    { name: 'SalvaTel', sym: 'SVTL', sector: 'Telecom – Mobile', hq: 'San Salvador' },
  ],
  SMR: [
    { name: 'MarinoTel', sym: 'SMTL', sector: 'Telecom – Mobile', hq: 'San Marino' },
  ],
  SOM: [
    { name: 'Hormud', sym: 'HRMD', sector: 'Telecom – Mobile', hq: 'Mogadishu' },
  ],
  SRB: [
    { name: 'SerbiaTel', sym: 'SRBT', sector: 'Telecom – Mobile', hq: 'Belgrade' },
  ],
  SSD: [
    { name: 'SudanSouthTel', sym: 'SSTL', sector: 'Telecom – Mobile', hq: 'Juba' },
  ],
  STP: [
    { name: 'SaoTel', sym: 'STTL', sector: 'Telecom – Mobile', hq: 'Sao Tome' },
  ],
  SUR: [
    { name: 'SuriTel', sym: 'SUTL', sector: 'Telecom – Mobile', hq: 'Paramaribo' },
  ],
  SVK: [
    { name: 'BratislavaTel', sym: 'BTTL', sector: 'Telecom – Mobile', hq: 'Bratislava' },
  ],
  SVN: [
    { name: 'LjubljanaTel', sym: 'LJTL', sector: 'Telecom – Mobile', hq: 'Ljubljana' },
  ],
  SWE: [
    { name: 'Volva', sym: 'VLVA', sector: 'Vehicles – Cars & Trucks', hq: 'Gothenburg' },
    { name: 'Erikson', sym: 'ERKS', sector: 'Telecom – Mobile', hq: 'Stockholm' },
    { name: 'Ikeea', sym: 'IKEE', sector: 'Furniture & Consumer Goods', hq: 'Almhult' },
    { name: 'Hennes', sym: 'HNNS', sector: 'Apparel & Footwear', hq: 'Stockholm' },
  ],
  SWZ: [
    { name: 'SwaziTel', sym: 'SZTL', sector: 'Telecom – Mobile', hq: 'Mbabane' },
  ],
  SYC: [
    { name: 'SeyTel', sym: 'SYTL', sector: 'Telecom – Mobile', hq: 'Victoria' },
  ],
  SYR: [
    { name: 'SyriaTel', sym: 'SYRT', sector: 'Telecom – Mobile', hq: 'Damascus' },
  ],
  TCD: [
    { name: 'ChadTel', sym: 'TDTL', sector: 'Telecom – Mobile', hq: 'Ndjamena' },
  ],
  TGO: [
    { name: 'TogoCom', sym: 'TGCM', sector: 'Telecom – Mobile', hq: 'Lome' },
  ],
  THA: [
    { name: 'ThaiOil', sym: 'THOL', sector: 'Oil Extraction', hq: 'Bangkok' },
    { name: 'Seven11', sym: 'SVEN', sector: 'Retail – General', hq: 'Bangkok' },
    { name: 'SiamCement', sym: 'SMCM', sector: 'Construction – Infrastructure', hq: 'Bangkok' },
    { name: 'MinorHotels', sym: 'MNHL', sector: 'Hotels', hq: 'Bangkok' },
  ],
  TJK: [
    { name: 'TajikTel', sym: 'TJTL', sector: 'Telecom – Mobile', hq: 'Dushanbe' },
  ],
  TKM: [
    { name: 'TurkmenTel', sym: 'TKTL', sector: 'Telecom – Mobile', hq: 'Ashgabat' },
  ],
  TLS: [
    { name: 'TimorTel', sym: 'TLTL', sector: 'Telecom – Mobile', hq: 'Dili' },
  ],
  TON: [
    { name: 'TongaTel', sym: 'TNTL', sector: 'Telecom – Mobile', hq: "Nuku'alofa" },
  ],
  TTO: [
    { name: 'TriniTel', sym: 'TTTL', sector: 'Telecom – Mobile', hq: 'Port of Spain' },
  ],
  TUN: [
    { name: 'TunisiaTel', sym: 'TSTL', sector: 'Telecom – Mobile', hq: 'Tunis' },
  ],
  TUR: [
    { name: 'TurkAir', sym: 'TKAR', sector: 'Airlines – Passenger', hq: 'Istanbul' },
    { name: 'Kotch', sym: 'KTCH', sector: 'Finance – Investment', hq: 'Istanbul' },
    { name: 'TurkMobile', sym: 'TKMB', sector: 'Telecom – Mobile', hq: 'Istanbul' },
  ],
  TUV: [
    { name: 'TuvaluTel', sym: 'TVTL', sector: 'Telecom – Mobile', hq: 'Funafuti' },
  ],
  TWN: [
    { name: 'TaiSemi', sym: 'TSMI', sector: 'Semiconductors', hq: 'Hsinchu' },
    { name: 'FoxLink', sym: 'FXLK', sector: 'Electronics – Components', hq: 'New Taipei City' },
    { name: 'MediaTekk', sym: 'MDTK', sector: 'Semiconductors', hq: 'Hsinchu' },
    { name: 'Asuss', sym: 'ASUU', sector: 'Consumer Electronics', hq: 'Taipei' },
  ],
  TZA: [
    { name: 'TanzaTel', sym: 'TZTL', sector: 'Telecom – Mobile', hq: 'Dar es Salaam' },
  ],
  UGA: [
    { name: 'UgandaTel', sym: 'UGTL', sector: 'Telecom – Mobile', hq: 'Kampala' },
  ],
  UKR: [
    { name: 'NaftoGaz', sym: 'NFTG', sector: 'Natural Gas', hq: 'Kyiv' },
  ],
  URY: [
    { name: 'Antell', sym: 'ANTL', sector: 'Telecom – Mobile', hq: 'Montevideo' },
  ],
  USA: [
    { name: 'Banana', sym: 'BNNA', sector: 'Consumer Electronics', hq: 'Cupertino' },
    { name: 'Microhard', sym: 'MCRH', sector: 'Software & AI', hq: 'Redmond' },
    { name: 'Goggle', sym: 'GGLE', sector: 'Data Centers & Cloud', hq: 'Mountain View' },
    { name: 'Amazone', sym: 'AMZE', sector: 'Retail – General', hq: 'Seattle' },
    { name: 'Burger Shuck', sym: 'BSHK', sector: 'Restaurants & Bars', hq: 'Miami' },
  ],
  UZB: [
    { name: 'UzbekTel', sym: 'UZTL', sector: 'Telecom – Mobile', hq: 'Tashkent' },
  ],
  VAT: [
    { name: 'Vatican Voice', sym: 'VTVC', sector: 'Entertainment – Film & Music', hq: 'Vatican City' },
  ],
  VCT: [
    { name: 'VincentTel', sym: 'VCTL', sector: 'Telecom – Mobile', hq: 'Kingstown' },
  ],
  VEN: [
    { name: 'PetroVene', sym: 'PTVN', sector: 'Oil Extraction', hq: 'Caracas' },
  ],
  VNM: [
    { name: 'VietMobile', sym: 'VTMB', sector: 'Telecom – Mobile', hq: 'Hanoi' },
  ],
  VUT: [
    { name: 'VanuatuTel', sym: 'VUTL', sector: 'Telecom – Mobile', hq: 'Port Vila' },
  ],
  WSM: [
    { name: 'SamoaTel', sym: 'WSTL', sector: 'Telecom – Mobile', hq: 'Apia' },
  ],
  YEM: [
    { name: 'YemenTel', sym: 'YMTL', sector: 'Telecom – Mobile', hq: "Sana'a" },
  ],
  ZAF: [
    { name: 'Naspas', sym: 'NSPA', sector: 'Software & AI', hq: 'Cape Town' },
    { name: 'OilCoal', sym: 'OLCL', sector: 'Chemicals – Basic', hq: 'Johannesburg' },
    { name: 'StanBank', sym: 'STNB', sector: 'Finance – Banking', hq: 'Johannesburg' },
    { name: 'ExxaroCoal', sym: 'EXXC', sector: 'Coal & Peat', hq: 'Pretoria' },
  ],
  ZMB: [
    { name: 'ZamTel', sym: 'ZMTL', sector: 'Telecom – Mobile', hq: 'Lusaka' },
  ],
  ZWE: [
    { name: 'HarareTel', sym: 'HRTL', sector: 'Telecom – Mobile', hq: 'Harare' },
  ],
};
