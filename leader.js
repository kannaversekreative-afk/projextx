// Country Leader game — 97 sectors, 2–3 businesses per country, leader economy.
// Loaded after world-events.js, before mapview.js. All top-level functions
// are globals, so sim.js / world-events.js / ui.js can call them at runtime.
// Original companies, people and sector names are fictional.
'use strict';

// ---------- 97 sectors ----------
// Each entry: name, group, icon, colour, and market parameters. Full
// SECTORS entries (loc, fleet, tag, products) are generated below from
// the group template, so companyWeek / locEconomics / fleetEconomics keep
// working without hand-writing 78 full definitions.
const LEADER_SECTORS = [
  // A. Food & agriculture (10)
  { n: 'Crop Farming', g: 'food', icon: '🌾', c: '#7a9a2e', growth: 0.02, vol: 0.018, beta: 0.8, div: 0.03 },
  { n: 'Livestock Farming', g: 'food', icon: '🐄', c: '#8a6d3b', growth: 0.02, vol: 0.018, beta: 0.8, div: 0.03 },
  { n: 'Fishing & Aquaculture', g: 'food', icon: '🎣', c: '#2f7cf6', growth: 0.02, vol: 0.02, beta: 0.9, div: 0.03 },
  { n: 'Forestry & Timber', g: 'food', icon: '🌲', c: '#2e7d32', growth: 0.015, vol: 0.018, beta: 0.8, div: 0.03 },
  { n: 'Food Processing', g: 'food', icon: '🥫', c: '#e0812b', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Beverages & Tobacco', g: 'food', icon: '🥤', c: '#7c4dff', growth: 0.025, vol: 0.016, beta: 0.8, div: 0.04 },
  { n: 'Dairy Products', g: 'food', icon: '🥛', c: '#f5b301', growth: 0.025, vol: 0.016, beta: 0.8, div: 0.035 },
  { n: 'Meat Processing', g: 'food', icon: '🥩', c: '#e5484d', growth: 0.025, vol: 0.018, beta: 0.85, div: 0.03 },
  { n: 'Bakery & Confectionery', g: 'food', icon: '🍞', c: '#d4a017', growth: 0.03, vol: 0.016, beta: 0.8, div: 0.035 },
  { n: 'Animal Feed', g: 'food', icon: '🌽', c: '#a67c00', growth: 0.02, vol: 0.016, beta: 0.8, div: 0.03 },
  // B. Energy & resources (10)
  { n: 'Oil Extraction', g: 'energy', icon: '🛢️', c: '#111827', growth: 0.02, vol: 0.028, beta: 1.1, div: 0.05, to: 2080 },
  { n: 'Oil Refining & Fuels', g: 'energy', icon: '⛽', c: '#e0812b', growth: 0.025, vol: 0.022, beta: 0.9, div: 0.045, to: 2080 },
  { n: 'Natural Gas', g: 'energy', icon: '🔥', c: '#0ea5b7', growth: 0.025, vol: 0.024, beta: 1.0, div: 0.045 },
  { n: 'Coal & Peat', g: 'energy', icon: '⚫', c: '#374151', growth: 0.0, vol: 0.022, beta: 0.9, div: 0.04, to: 2050 },
  { n: 'Mining – Metals', g: 'energy', icon: '⛏️', c: '#6b7280', growth: 0.02, vol: 0.024, beta: 1.0, div: 0.035 },
  { n: 'Mining – Non-metals', g: 'energy', icon: '🪨', c: '#9ca3af', growth: 0.02, vol: 0.02, beta: 0.9, div: 0.035 },
  { n: 'Electricity Generation', g: 'energy', icon: '⚡', c: '#f5b301', growth: 0.03, vol: 0.016, beta: 0.7, div: 0.045 },
  { n: 'Electricity Distribution', g: 'energy', icon: '🔌', c: '#f59e0b', growth: 0.025, vol: 0.014, beta: 0.7, div: 0.04 },
  { n: 'Water Supply', g: 'energy', icon: '💧', c: '#2f7cf6', growth: 0.02, vol: 0.012, beta: 0.6, div: 0.04 },
  { n: 'Waste & Recycling', g: 'energy', icon: '♻️', c: '#12a150', growth: 0.03, vol: 0.016, beta: 0.8, div: 0.03 },
  // C. Materials & chemicals (10)
  { n: 'Chemicals – Basic', g: 'mfg', icon: '🧪', c: '#7c4dff', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.035 },
  { n: 'Fertilizers & Pesticides', g: 'mfg', icon: '🌱', c: '#12a150', growth: 0.025, vol: 0.02, beta: 0.9, div: 0.035 },
  { n: 'Pharmaceuticals', g: 'mfg', icon: '💊', c: '#e5484d', growth: 0.05, vol: 0.022, beta: 1.0, div: 0.02 },
  { n: 'Plastics & Rubber', g: 'mfg', icon: '🧴', c: '#0ea5b7', growth: 0.03, vol: 0.02, beta: 0.9, div: 0.035 },
  { n: 'Steel Production', g: 'mfg', icon: '🏭', c: '#374151', growth: 0.025, vol: 0.022, beta: 1.0, div: 0.035 },
  { n: 'Metal Fabrication', g: 'mfg', icon: '🔩', c: '#6b7280', growth: 0.03, vol: 0.02, beta: 0.9, div: 0.035 },
  { n: 'Glass & Ceramics', g: 'mfg', icon: '🏺', c: '#2f7cf6', growth: 0.025, vol: 0.018, beta: 0.85, div: 0.035 },
  { n: 'Paper & Packaging', g: 'mfg', icon: '📦', c: '#8a6d3b', growth: 0.02, vol: 0.016, beta: 0.8, div: 0.04 },
  { n: 'Textiles', g: 'mfg', icon: '🧵', c: '#e5484d', growth: 0.02, vol: 0.018, beta: 0.85, div: 0.035 },
  { n: 'Apparel & Footwear', g: 'mfg', icon: '👟', c: '#ff6b2c', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  // D. Machines & tech (14)
  { n: 'Machinery – Industrial', g: 'tech', icon: '⚙️', c: '#374151', growth: 0.035, vol: 0.02, beta: 1.0, div: 0.03 },
  { n: 'Machinery – Agricultural', g: 'tech', icon: '🚜', c: '#7a9a2e', growth: 0.03, vol: 0.02, beta: 0.9, div: 0.03 },
  { n: 'Electronics – Components', g: 'tech', icon: '🔌', c: '#2f7cf6', growth: 0.05, vol: 0.024, beta: 1.2, div: 0.015 },
  { n: 'Semiconductors', g: 'tech', icon: '💾', c: '#7c4dff', growth: 0.08, vol: 0.028, beta: 1.3, div: 0.01 },
  { n: 'Consumer Electronics', g: 'tech', icon: '📱', c: '#111827', growth: 0.05, vol: 0.024, beta: 1.2, div: 0.02 },
  { n: 'Vehicles – Cars & Trucks', g: 'tech', icon: '🚗', c: '#e5484d', growth: 0.03, vol: 0.022, beta: 1.1, div: 0.025 },
  { n: 'Vehicles – Parts', g: 'tech', icon: '🔧', c: '#6b7280', growth: 0.03, vol: 0.02, beta: 1.0, div: 0.03 },
  { n: 'Aerospace', g: 'tech', icon: '🚀', c: '#2f7cf6', growth: 0.04, vol: 0.024, beta: 1.1, div: 0.02 },
  { n: 'Defence Equipment', g: 'tech', icon: '🛡️', c: '#374151', growth: 0.03, vol: 0.02, beta: 0.9, div: 0.03 },
  { n: 'Robotics & Automation', g: 'tech', icon: '🤖', c: '#7c4dff', growth: 0.07, vol: 0.026, beta: 1.25, div: 0.01 },
  { n: 'Medical Devices', g: 'tech', icon: '🩺', c: '#12a150', growth: 0.05, vol: 0.02, beta: 1.0, div: 0.02 },
  { n: 'Furniture & Consumer Goods', g: 'tech', icon: '🛋️', c: '#8a6d3b', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.035 },
  { n: 'Batteries & Energy Storage', g: 'tech', icon: '🔋', c: '#12a150', growth: 0.07, vol: 0.026, beta: 1.2, div: 0.01 },
  { n: 'Renewable Energy Technology', g: 'tech', icon: '🌞', c: '#f5b301', growth: 0.06, vol: 0.024, beta: 1.15, div: 0.015 },
  // E. Construction & transport (10)
  { n: 'Construction – Residential', g: 'transport', icon: '🏠', c: '#e0812b', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Construction – Infrastructure', g: 'transport', icon: '🏗️', c: '#374151', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Shipping – Freight', g: 'transport', icon: '🚢', c: '#0ea5b7', growth: 0.03, vol: 0.022, beta: 1.15, div: 0.035 },
  { n: 'Shipping – Passenger', g: 'transport', icon: '🛳️', c: '#2f7cf6', growth: 0.025, vol: 0.02, beta: 1.0, div: 0.03 },
  { n: 'Airlines – Passenger', g: 'transport', icon: '✈️', c: '#2f7cf6', growth: 0.04, vol: 0.022, beta: 1.3, div: 0.01 },
  { n: 'Airlines – Cargo', g: 'transport', icon: '🛫', c: '#7c4dff', growth: 0.035, vol: 0.022, beta: 1.2, div: 0.02 },
  { n: 'Rail Transport', g: 'transport', icon: '🚆', c: '#111827', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Road Transport & Trucking', g: 'transport', icon: '🚛', c: '#e0812b', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.035 },
  { n: 'Logistics & Warehousing', g: 'transport', icon: '📦', c: '#8a6d3b', growth: 0.04, vol: 0.018, beta: 0.95, div: 0.03 },
  { n: 'Ports & Airports Services', g: 'transport', icon: '⚓', c: '#0ea5b7', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.035 },
  // F. Consumer services (12)
  { n: 'Retail – Grocery', g: 'service', icon: '🛒', c: '#12a150', growth: 0.03, vol: 0.013, beta: 0.75, div: 0.03 },
  { n: 'Retail – General', g: 'service', icon: '🛍️', c: '#e5484d', growth: 0.04, vol: 0.016, beta: 0.85, div: 0.025 },
  { n: 'Hotels', g: 'service', icon: '🏨', c: '#2f7cf6', growth: 0.035, vol: 0.02, beta: 1.0, div: 0.025 },
  { n: 'Restaurants & Bars', g: 'service', icon: '🍽️', c: '#ff6b2c', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Healthcare Services', g: 'service', icon: '🏥', c: '#12a150', growth: 0.04, vol: 0.016, beta: 0.8, div: 0.025 },
  { n: 'Education – Schools', g: 'service', icon: '🏫', c: '#f5b301', growth: 0.025, vol: 0.012, beta: 0.7, div: 0.03 },
  { n: 'Education – Higher', g: 'service', icon: '🎓', c: '#7c4dff', growth: 0.03, vol: 0.014, beta: 0.75, div: 0.025 },
  { n: 'Entertainment – Film & Music', g: 'service', icon: '🎬', c: '#e5484d', growth: 0.04, vol: 0.022, beta: 1.1, div: 0.02 },
  { n: 'Entertainment – Gaming & Sports', g: 'service', icon: '🎮', c: '#7c4dff', growth: 0.05, vol: 0.024, beta: 1.15, div: 0.015 },
  { n: 'Tourism Services', g: 'service', icon: '🏖️', c: '#2f7cf6', growth: 0.035, vol: 0.022, beta: 1.0, div: 0.025 },
  { n: 'Personal Services', g: 'service', icon: '💇', c: '#ff6b2c', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Real Estate – Residential', g: 'service', icon: '🏘️', c: '#8a6d3b', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.035 },
  // G. Business, tech & finance (12)
  { n: 'Software & AI', g: 'tech', icon: '💻', c: '#7c4dff', growth: 0.09, vol: 0.026, beta: 1.3, div: 0 },
  { n: 'Data Centers & Cloud', g: 'tech', icon: '🖥️', c: '#2f7cf6', growth: 0.08, vol: 0.024, beta: 1.25, div: 0.01 },
  { n: 'Telecom – Mobile', g: 'tech', icon: '📶', c: '#0ea5b7', growth: 0.04, vol: 0.02, beta: 1.0, div: 0.025 },
  { n: 'Telecom – Internet', g: 'tech', icon: '🌐', c: '#2f7cf6', growth: 0.05, vol: 0.02, beta: 1.05, div: 0.02 },
  { n: 'Finance – Banking', g: 'finance', icon: '🏦', c: '#12a150', growth: 0.04, vol: 0.02, beta: 1.0, div: 0.04 },
  { n: 'Finance – Investment', g: 'finance', icon: '📈', c: '#12a150', growth: 0.05, vol: 0.024, beta: 1.15, div: 0.03 },
  { n: 'Insurance', g: 'finance', icon: '🛡️', c: '#374151', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.04 },
  { n: 'Professional – Legal & Accounting', g: 'finance', icon: '⚖️', c: '#6b7280', growth: 0.03, vol: 0.014, beta: 0.8, div: 0.035 },
  { n: 'Professional – Consulting', g: 'finance', icon: '💼', c: '#6b7280', growth: 0.04, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Marketing & Advertising', g: 'finance', icon: '📣', c: '#ff6b2c', growth: 0.04, vol: 0.02, beta: 1.0, div: 0.025 },
  { n: 'Space & Satellites', g: 'tech', icon: '🛰️', c: '#111827', growth: 0.06, vol: 0.026, beta: 1.2, div: 0.01 },
  { n: 'Cybersecurity', g: 'tech', icon: '🔒', c: '#e5484d', growth: 0.08, vol: 0.024, beta: 1.2, div: 0.01 },
  // J. Future & frontier (19) — the tech-driven economy arrives over
  // time (from = first year) instead of existing at game start in 2026.
  // Rockets & Launch and Additive Manufacturing exist in 2026; the rest
  // arrive 2028–2050. See sectorEraWeek for arrivals, formation, decay.
  { n: 'Rockets & Launch Services', g: 'tech', icon: '🚀', c: '#0ea5b7', growth: 0.09, vol: 0.05, beta: 1.4, div: 0, from: 2026 },
  { n: 'Additive Manufacturing', g: 'mfg', icon: '🖨️', c: '#6b7280', growth: 0.07, vol: 0.03, beta: 1.2, div: 0.01, from: 2026 },
  { n: 'AI Agents', g: 'tech', icon: '🤖', c: '#7c4dff', growth: 0.13, vol: 0.05, beta: 1.4, div: 0, from: 2028 },
  { n: 'Drone Delivery', g: 'transport', icon: '🚁', c: '#2f7cf6', growth: 0.09, vol: 0.04, beta: 1.3, div: 0, from: 2028 },
  { n: 'Vertical Farming', g: 'food', icon: '🌿', c: '#12a150', growth: 0.07, vol: 0.03, beta: 1.1, div: 0.01, from: 2028 },
  { n: 'Immersive Worlds', g: 'tech', icon: '🥽', c: '#ff6b2c', growth: 0.09, vol: 0.05, beta: 1.4, div: 0, from: 2028 },
  { n: 'Humanoid Robotics', g: 'tech', icon: '🦾', c: '#e5484d', growth: 0.11, vol: 0.05, beta: 1.4, div: 0, from: 2030 },
  { n: 'Autonomous Vehicles', g: 'tech', icon: '🚘', c: '#111827', growth: 0.08, vol: 0.04, beta: 1.3, div: 0.01, from: 2030 },
  { n: 'Cellular Agriculture', g: 'food', icon: '🧫', c: '#e0812b', growth: 0.08, vol: 0.04, beta: 1.2, div: 0, from: 2030 },
  { n: 'Carbon Capture', g: 'energy', icon: '🌬️', c: '#0ea5b7', growth: 0.08, vol: 0.035, beta: 1.1, div: 0.01, from: 2030 },
  { n: 'Quantum Computing', g: 'tech', icon: '⚛️', c: '#7c4dff', growth: 0.12, vol: 0.06, beta: 1.5, div: 0, from: 2032 },
  { n: 'Synthetic Biology', g: 'tech', icon: '🧬', c: '#12a150', growth: 0.11, vol: 0.05, beta: 1.4, div: 0, from: 2032 },
  { n: 'Space Mining', g: 'tech', icon: '☄️', c: '#374151', growth: 0.12, vol: 0.07, beta: 1.6, div: 0, from: 2035 },
  { n: 'Orbital Manufacturing', g: 'tech', icon: '🛰️', c: '#2f7cf6', growth: 0.10, vol: 0.06, beta: 1.5, div: 0, from: 2035 },
  { n: 'Nanotechnology', g: 'tech', icon: '🔬', c: '#6b7280', growth: 0.10, vol: 0.05, beta: 1.4, div: 0, from: 2035 },
  { n: 'Brain–Computer Interfaces', g: 'tech', icon: '🧠', c: '#ff6b2c', growth: 0.12, vol: 0.06, beta: 1.5, div: 0, from: 2038 },
  { n: 'Lunar Infrastructure', g: 'tech', icon: '🌙', c: '#9ca3af', growth: 0.11, vol: 0.06, beta: 1.5, div: 0, from: 2040 },
  { n: 'Fusion Energy', g: 'energy', icon: '☀️', c: '#f5b301', growth: 0.10, vol: 0.05, beta: 1.3, div: 0.01, from: 2040 },
  { n: 'Mars Services', g: 'tech', icon: '🔴', c: '#e5484d', growth: 0.14, vol: 0.08, beta: 1.7, div: 0, from: 2050 },
  { n: 'Grain Milling', g: 'food', icon: '🌾', c: '#b58900', growth: 0.02, vol: 0.016, beta: 0.8, div: 0.035 },
  { n: 'Vegetable Oils & Fats', g: 'food', icon: '🫒', c: '#7a9a2e', growth: 0.02, vol: 0.016, beta: 0.8, div: 0.035 },
  { n: 'Starch Products', g: 'food', icon: '🌽', c: '#d4a017', growth: 0.02, vol: 0.016, beta: 0.8, div: 0.03 },
  { n: 'Sugar Refining', g: 'food', icon: '🍬', c: '#f5b301', growth: 0.015, vol: 0.016, beta: 0.8, div: 0.035 },
  { n: 'Fruit & Vegetable Processing', g: 'food', icon: '🥫', c: '#e0812b', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Seafood Processing', g: 'food', icon: '🦐', c: '#2f7cf6', growth: 0.025, vol: 0.018, beta: 0.85, div: 0.03 },
  { n: 'Coffee & Tea Processing', g: 'food', icon: '☕', c: '#8a6d3b', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Spice & Condiments', g: 'food', icon: '🌶️', c: '#e5484d', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Snack Foods', g: 'food', icon: '🥨', c: '#d4a017', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Pet Food', g: 'food', icon: '🐾', c: '#a67c00', growth: 0.035, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Infant & Dietary Foods', g: 'food', icon: '🍼', c: '#f5b301', growth: 0.04, vol: 0.018, beta: 0.9, div: 0.025 },
  { n: 'Pasta & Noodle Manufacturing', g: 'food', icon: '🍝', c: '#e0812b', growth: 0.025, vol: 0.016, beta: 0.8, div: 0.03 },
  { n: 'Wine Production', g: 'food', icon: '🍷', c: '#7c2d12', growth: 0.025, vol: 0.018, beta: 0.85, div: 0.03 },
  { n: 'Brewing', g: 'food', icon: '🍺', c: '#d4a017', growth: 0.02, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Poultry Farming', g: 'food', icon: '🐔', c: '#f5b301', growth: 0.02, vol: 0.016, beta: 0.8, div: 0.03 },
  { n: 'Floriculture & Nurseries', g: 'food', icon: '🌸', c: '#e5484d', growth: 0.025, vol: 0.018, beta: 0.85, div: 0.025 },
  { n: 'Seed & Seedling Production', g: 'food', icon: '🌱', c: '#12a150', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Beekeeping & Honey', g: 'food', icon: '🐝', c: '#f5b301', growth: 0.02, vol: 0.018, beta: 0.8, div: 0.03 },
  { n: 'Cannabis Cultivation', g: 'food', icon: '🌿', c: '#2e7d32', growth: 0.06, vol: 0.03, beta: 1.2, div: 0.01 },
  { n: 'Agricultural Support Services', g: 'food', icon: '🚜', c: '#7a9a2e', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Algae Cultivation', g: 'food', icon: '🧫', c: '#0ea5b7', growth: 0.05, vol: 0.024, beta: 1.1, div: 0.01 },
  { n: 'Uranium Mining', g: 'energy', icon: '☢️', c: '#374151', growth: 0.02, vol: 0.026, beta: 1.1, div: 0.03 },
  { n: 'Iron Ore Mining', g: 'energy', icon: '⛏️', c: '#6b7280', growth: 0.02, vol: 0.024, beta: 1, div: 0.035 },
  { n: 'Gold & Precious Metals Mining', g: 'energy', icon: '🥇', c: '#d4a017', growth: 0.02, vol: 0.026, beta: 1.05, div: 0.03 },
  { n: 'Copper Mining', g: 'energy', icon: '🟠', c: '#e0812b', growth: 0.025, vol: 0.024, beta: 1.05, div: 0.03 },
  { n: 'Bauxite & Aluminium Ore', g: 'energy', icon: '🪨', c: '#9ca3af', growth: 0.02, vol: 0.022, beta: 0.95, div: 0.03 },
  { n: 'Quarrying & Aggregates', g: 'energy', icon: '🏔️', c: '#8a6d3b', growth: 0.02, vol: 0.018, beta: 0.9, div: 0.035 },
  { n: 'Salt Mining', g: 'energy', icon: '🧂', c: '#e5e7eb', growth: 0.015, vol: 0.016, beta: 0.8, div: 0.035 },
  { n: 'Gemstone & Diamond Mining', g: 'energy', icon: '💎', c: '#2f7cf6', growth: 0.02, vol: 0.026, beta: 1.1, div: 0.025 },
  { n: 'Oil & Gas Support Services', g: 'energy', icon: '🛢️', c: '#111827', growth: 0.025, vol: 0.024, beta: 1.1, div: 0.03 },
  { n: 'Mining Support Services', g: 'energy', icon: '⚒️', c: '#6b7280', growth: 0.02, vol: 0.02, beta: 0.95, div: 0.03 },
  { n: 'Gas Distribution', g: 'energy', icon: '🔥', c: '#0ea5b7', growth: 0.02, vol: 0.014, beta: 0.7, div: 0.04 },
  { n: 'District Heating & Cooling', g: 'energy', icon: '🌡️', c: '#e0812b', growth: 0.02, vol: 0.014, beta: 0.7, div: 0.04 },
  { n: 'Hydroelectric Power', g: 'energy', icon: '💧', c: '#2f7cf6', growth: 0.02, vol: 0.014, beta: 0.7, div: 0.04 },
  { n: 'Solar Power Generation', g: 'energy', icon: '☀️', c: '#f5b301', growth: 0.05, vol: 0.02, beta: 1, div: 0.02 },
  { n: 'Wind Power Generation', g: 'energy', icon: '🌬️', c: '#0ea5b7', growth: 0.05, vol: 0.02, beta: 1, div: 0.02 },
  { n: 'Nuclear Power Generation', g: 'energy', icon: '⚛️', c: '#7c4dff', growth: 0.02, vol: 0.016, beta: 0.75, div: 0.04 },
  { n: 'Geothermal Power', g: 'energy', icon: '🌋', c: '#e5484d', growth: 0.04, vol: 0.02, beta: 0.95, div: 0.025 },
  { n: 'Tidal & Wave Power', g: 'energy', icon: '🌊', c: '#2f7cf6', growth: 0.06, vol: 0.026, beta: 1.15, div: 0.01 },
  { n: 'Biomass Power', g: 'energy', icon: '🪵', c: '#8a6d3b', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Waste-to-Energy Plants', g: 'energy', icon: '♻️', c: '#12a150', growth: 0.035, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Electricity Transmission', g: 'energy', icon: '🔌', c: '#f59e0b', growth: 0.02, vol: 0.012, beta: 0.7, div: 0.04 },
  { n: 'Wastewater Treatment', g: 'energy', icon: '🚿', c: '#0ea5b7', growth: 0.02, vol: 0.012, beta: 0.7, div: 0.04 },
  { n: 'Hazardous Waste Management', g: 'energy', icon: '☣️', c: '#374151', growth: 0.025, vol: 0.018, beta: 0.85, div: 0.03 },
  { n: 'Biofuels', g: 'energy', icon: '🌽', c: '#7a9a2e', growth: 0.04, vol: 0.022, beta: 1.05, div: 0.02 },
  { n: 'Nuclear Fuel Processing', g: 'energy', icon: '⚛️', c: '#7c4dff', growth: 0.02, vol: 0.02, beta: 0.9, div: 0.03 },
  { n: 'Hydrogen Production', g: 'energy', icon: '💨', c: '#0ea5b7', growth: 0.07, vol: 0.028, beta: 1.2, div: 0.01 },
  { n: 'EV Charging Networks', g: 'energy', icon: '🔌', c: '#12a150', growth: 0.08, vol: 0.026, beta: 1.2, div: 0.01 },
  { n: 'Chemicals – Specialty', g: 'mfg', icon: '🧪', c: '#7c4dff', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.03 },
  { n: 'Industrial Gases', g: 'mfg', icon: '💨', c: '#0ea5b7', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.035 },
  { n: 'Paints & Coatings', g: 'mfg', icon: '🎨', c: '#e5484d', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.035 },
  { n: 'Soaps & Cleaning Products', g: 'mfg', icon: '🧼', c: '#2f7cf6', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Cosmetics & Toiletries', g: 'mfg', icon: '💄', c: '#ff6b2c', growth: 0.035, vol: 0.018, beta: 0.95, div: 0.03 },
  { n: 'Explosives', g: 'mfg', icon: '💥', c: '#e5484d', growth: 0.02, vol: 0.022, beta: 0.95, div: 0.03 },
  { n: 'Tyre Manufacturing', g: 'mfg', icon: '🛞', c: '#374151', growth: 0.025, vol: 0.02, beta: 0.95, div: 0.03 },
  { n: 'Plastics Products', g: 'mfg', icon: '🧴', c: '#0ea5b7', growth: 0.03, vol: 0.02, beta: 0.9, div: 0.035 },
  { n: 'Cement, Lime & Plaster', g: 'mfg', icon: '🏗️', c: '#9ca3af', growth: 0.02, vol: 0.018, beta: 0.9, div: 0.035 },
  { n: 'Concrete Products', g: 'mfg', icon: '🧱', c: '#8a6d3b', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.035 },
  { n: 'Clay Building Materials', g: 'mfg', icon: '🏺', c: '#e0812b', growth: 0.02, vol: 0.018, beta: 0.85, div: 0.035 },
  { n: 'Glass Manufacturing', g: 'mfg', icon: '🪟', c: '#2f7cf6', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.035 },
  { n: 'Non-ferrous Metal Production', g: 'mfg', icon: '🔩', c: '#6b7280', growth: 0.025, vol: 0.022, beta: 1, div: 0.03 },
  { n: 'Metal Casting & Forging', g: 'mfg', icon: '⚒️', c: '#374151', growth: 0.025, vol: 0.02, beta: 0.95, div: 0.03 },
  { n: 'Tools & Hardware', g: 'mfg', icon: '🔧', c: '#6b7280', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.035 },
  { n: 'Sawmilling & Wood Products', g: 'mfg', icon: '🪵', c: '#8a6d3b', growth: 0.02, vol: 0.018, beta: 0.85, div: 0.035 },
  { n: 'Wood Panels & Veneer', g: 'mfg', icon: '🪚', c: '#a67c00', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Paper Manufacturing', g: 'mfg', icon: '📄', c: '#e5e7eb', growth: 0.015, vol: 0.016, beta: 0.8, div: 0.04 },
  { n: 'Packaging Products', g: 'mfg', icon: '📦', c: '#8a6d3b', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Commercial Printing', g: 'mfg', icon: '🖨️', c: '#374151', growth: 0.015, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Carpets & Rugs', g: 'mfg', icon: '🧶', c: '#e5484d', growth: 0.02, vol: 0.018, beta: 0.85, div: 0.03 },
  { n: 'Technical Textiles', g: 'mfg', icon: '🦺', c: '#f5b301', growth: 0.035, vol: 0.02, beta: 0.95, div: 0.025 },
  { n: 'Leather Tanning & Dressing', g: 'mfg', icon: '👜', c: '#8a6d3b', growth: 0.02, vol: 0.018, beta: 0.85, div: 0.03 },
  { n: 'Luggage & Leather Goods', g: 'mfg', icon: '🧳', c: '#a67c00', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Jewellery Manufacturing', g: 'mfg', icon: '💍', c: '#d4a017', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.025 },
  { n: 'Musical Instruments', g: 'mfg', icon: '🎸', c: '#e0812b', growth: 0.025, vol: 0.02, beta: 0.9, div: 0.025 },
  { n: 'Sports Equipment Manufacturing', g: 'mfg', icon: '🏋️', c: '#e5484d', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Toy Manufacturing', g: 'mfg', icon: '🧸', c: '#ff6b2c', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.025 },
  { n: 'Optical & Photographic Equipment', g: 'mfg', icon: '📷', c: '#2f7cf6', growth: 0.03, vol: 0.022, beta: 1, div: 0.02 },
  { n: 'Watches & Clocks', g: 'mfg', icon: '⌚', c: '#374151', growth: 0.02, vol: 0.02, beta: 0.9, div: 0.03 },
  { n: 'Electric Motors & Generators', g: 'mfg', icon: '⚙️', c: '#6b7280', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.03 },
  { n: 'Electrical Wiring & Lighting', g: 'mfg', icon: '💡', c: '#f5b301', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Domestic Appliances', g: 'mfg', icon: '🧺', c: '#0ea5b7', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Communication Equipment', g: 'mfg', icon: '📡', c: '#2f7cf6', growth: 0.04, vol: 0.022, beta: 1.05, div: 0.02 },
  { n: 'Computers & Office Equipment', g: 'mfg', icon: '🖥️', c: '#374151', growth: 0.03, vol: 0.022, beta: 1.05, div: 0.02 },
  { n: 'Measuring & Control Instruments', g: 'mfg', icon: '📏', c: '#7c4dff', growth: 0.035, vol: 0.02, beta: 1, div: 0.025 },
  { n: 'Engines & Turbines', g: 'mfg', icon: '🌀', c: '#6b7280', growth: 0.03, vol: 0.02, beta: 1, div: 0.03 },
  { n: 'Pumps & Valves', g: 'mfg', icon: '🚰', c: '#0ea5b7', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.03 },
  { n: 'Construction & Mining Machinery', g: 'mfg', icon: '🏗️', c: '#f5b301', growth: 0.03, vol: 0.02, beta: 1, div: 0.03 },
  { n: 'Machine Tools', g: 'mfg', icon: '⚙️', c: '#6b7280', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.03 },
  { n: 'Lifting & Handling Equipment', g: 'mfg', icon: '🪝', c: '#374151', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.03 },
  { n: 'Motorcycles & Bicycles', g: 'mfg', icon: '🏍️', c: '#e5484d', growth: 0.025, vol: 0.02, beta: 0.95, div: 0.025 },
  { n: 'Vehicle Bodies & Trailers', g: 'mfg', icon: '🚚', c: '#6b7280', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Railway Locomotives & Stock', g: 'mfg', icon: '🚂', c: '#374151', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Shipbuilding', g: 'mfg', icon: '🚢', c: '#2f7cf6', growth: 0.025, vol: 0.02, beta: 0.95, div: 0.03 },
  { n: 'Synthetic Fibres', g: 'mfg', icon: '🧵', c: '#7c4dff', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.03 },
  { n: 'Composite Materials', g: 'mfg', icon: '🛠️', c: '#6b7280', growth: 0.05, vol: 0.024, beta: 1.1, div: 0.015 },
  { n: 'Elevators & Escalators', g: 'mfg', icon: '🛗', c: '#374151', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Bearings, Gears & Drives', g: 'mfg', icon: '⚙️', c: '#6b7280', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.03 },
  { n: 'Wire & Cable Manufacturing', g: 'mfg', icon: '🔌', c: '#f59e0b', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.03 },
  { n: 'HVAC & Refrigeration Equipment', g: 'mfg', icon: '❄️', c: '#0ea5b7', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.03 },
  { n: 'Laboratory Equipment', g: 'mfg', icon: '🔬', c: '#7c4dff', growth: 0.04, vol: 0.022, beta: 1.05, div: 0.02 },
  { n: 'Fire Safety Equipment', g: 'mfg', icon: '🧯', c: '#e5484d', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Stationery & Office Supplies', g: 'mfg', icon: '✏️', c: '#f5b301', growth: 0.02, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Prefabricated Buildings', g: 'mfg', icon: '🏡', c: '#e0812b', growth: 0.04, vol: 0.022, beta: 1, div: 0.025 },
  { n: 'Electronics Contract Manufacturing', g: 'mfg', icon: '🔌', c: '#2f7cf6', growth: 0.04, vol: 0.024, beta: 1.1, div: 0.02 },
  { n: 'Publishing', g: 'tech', icon: '📚', c: '#7c4dff', growth: 0.02, vol: 0.02, beta: 0.95, div: 0.025 },
  { n: 'Video Game Development', g: 'tech', icon: '🕹️', c: '#7c4dff', growth: 0.06, vol: 0.026, beta: 1.2, div: 0.01 },
  { n: 'Internet Portals & Search', g: 'tech', icon: '🔍', c: '#2f7cf6', growth: 0.05, vol: 0.024, beta: 1.15, div: 0.01 },
  { n: 'IT Services & Consulting', g: 'tech', icon: '💻', c: '#2f7cf6', growth: 0.04, vol: 0.02, beta: 1, div: 0.025 },
  { n: 'Custom Software Development', g: 'tech', icon: '⌨️', c: '#7c4dff', growth: 0.045, vol: 0.02, beta: 1, div: 0.02 },
  { n: 'E-commerce Marketplaces', g: 'tech', icon: '🛒', c: '#ff6b2c', growth: 0.06, vol: 0.026, beta: 1.2, div: 0.01 },
  { n: 'Social Media Platforms', g: 'tech', icon: '💬', c: '#0ea5b7', growth: 0.05, vol: 0.026, beta: 1.2, div: 0.01 },
  { n: 'Video Streaming Services', g: 'tech', icon: '📺', c: '#e5484d', growth: 0.05, vol: 0.024, beta: 1.15, div: 0.01 },
  { n: 'Online Learning Platforms', g: 'tech', icon: '📖', c: '#f5b301', growth: 0.06, vol: 0.024, beta: 1.1, div: 0.01 },
  { n: 'Digital Health & Telemedicine', g: 'tech', icon: '🩺', c: '#12a150', growth: 0.07, vol: 0.026, beta: 1.15, div: 0.01 },
  { n: 'Biotechnology Research', g: 'tech', icon: '🧬', c: '#12a150', growth: 0.07, vol: 0.028, beta: 1.25, div: 0.01 },
  { n: 'Semiconductor Equipment', g: 'tech', icon: '🔬', c: '#7c4dff', growth: 0.06, vol: 0.026, beta: 1.2, div: 0.01 },
  { n: 'Photonics & Lasers', g: 'tech', icon: '🔦', c: '#f5b301', growth: 0.06, vol: 0.026, beta: 1.2, div: 0.01 },
  { n: 'Geospatial & Mapping Services', g: 'tech', icon: '🗺️', c: '#12a150', growth: 0.045, vol: 0.022, beta: 1.05, div: 0.02 },
  { n: 'Drone Manufacturing', g: 'tech', icon: '🚁', c: '#2f7cf6', growth: 0.07, vol: 0.028, beta: 1.25, div: 0.01 },
  { n: 'VR & AR Hardware', g: 'tech', icon: '👓', c: '#7c4dff', growth: 0.07, vol: 0.028, beta: 1.25, div: 0.01 },
  { n: 'Property Technology Platforms', g: 'tech', icon: '🏘️', c: '#e0812b', growth: 0.06, vol: 0.026, beta: 1.2, div: 0.01 },
  { n: 'Online Travel Platforms', g: 'tech', icon: '🌍', c: '#2f7cf6', growth: 0.05, vol: 0.024, beta: 1.15, div: 0.01 },
  { n: 'Food Delivery Platforms', g: 'tech', icon: '🛵', c: '#ff6b2c', growth: 0.06, vol: 0.026, beta: 1.2, div: 0.01 },
  { n: 'Ride-Hailing Platforms', g: 'tech', icon: '🚕', c: '#f5b301', growth: 0.05, vol: 0.024, beta: 1.15, div: 0.01 },
  { n: 'Digital Advertising Platforms', g: 'tech', icon: '📢', c: '#ff6b2c', growth: 0.05, vol: 0.024, beta: 1.1, div: 0.015 },
  { n: 'Exoskeletons & Wearable Robotics', g: 'tech', icon: '🦾', c: '#e5484d', growth: 0.08, vol: 0.03, beta: 1.3, div: 0.01 },
  { n: 'Space Tourism', g: 'tech', icon: '🚀', c: '#111827', growth: 0.08, vol: 0.032, beta: 1.35, div: 0 },
  { n: 'Earth Observation & Satellite Imagery', g: 'tech', icon: '🛰️', c: '#2f7cf6', growth: 0.06, vol: 0.026, beta: 1.2, div: 0.01 },
  { n: 'Semiconductor Design', g: 'tech', icon: '💾', c: '#7c4dff', growth: 0.07, vol: 0.028, beta: 1.25, div: 0.01 },
  { n: 'Construction – Commercial', g: 'transport', icon: '🏢', c: '#e0812b', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Construction – Industrial', g: 'transport', icon: '🏭', c: '#374151', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Demolition & Site Preparation', g: 'transport', icon: '🧨', c: '#e5484d', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Building Installation Services', g: 'transport', icon: '🔧', c: '#6b7280', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Building Finishing Trades', g: 'transport', icon: '🖌️', c: '#e0812b', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Construction Equipment Rental', g: 'transport', icon: '🚜', c: '#f5b301', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Pipeline Transport', g: 'transport', icon: '🛢️', c: '#111827', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Urban Transit & Buses', g: 'transport', icon: '🚌', c: '#f5b301', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Taxi Services', g: 'transport', icon: '🚖', c: '#f5b301', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Intercity Bus Transport', g: 'transport', icon: '🚍', c: '#2f7cf6', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Inland Water Transport', g: 'transport', icon: '🚤', c: '#0ea5b7', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Aircraft Maintenance & Repair', g: 'transport', icon: '✈️', c: '#2f7cf6', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.03 },
  { n: 'Ship Repair & Maintenance', g: 'transport', icon: '⚓', c: '#0ea5b7', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Vehicle Repair Services', g: 'transport', icon: '🔧', c: '#6b7280', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Vehicle Rental & Leasing', g: 'transport', icon: '🔑', c: '#f5b301', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Parking & Garage Services', g: 'transport', icon: '🅿️', c: '#374151', growth: 0.02, vol: 0.014, beta: 0.8, div: 0.035 },
  { n: 'Courier & Postal Services', g: 'transport', icon: '📬', c: '#e5484d', growth: 0.035, vol: 0.018, beta: 0.95, div: 0.03 },
  { n: 'Freight Forwarding', g: 'transport', icon: '📦', c: '#8a6d3b', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Cold Storage & Cold Chain', g: 'transport', icon: '🧊', c: '#0ea5b7', growth: 0.035, vol: 0.018, beta: 0.95, div: 0.03 },
  { n: 'Moving & Storage Services', g: 'transport', icon: '🚚', c: '#e0812b', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Charter & Private Aviation', g: 'transport', icon: '🛩️', c: '#2f7cf6', growth: 0.035, vol: 0.022, beta: 1.05, div: 0.02 },
  { n: 'Ambulance & Medical Transport', g: 'transport', icon: '🚑', c: '#e5484d', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Scaffolding & Access Services', g: 'transport', icon: '🏗️', c: '#f5b301', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Dredging & Marine Construction', g: 'transport', icon: '⚓', c: '#0ea5b7', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Foundation & Piling Works', g: 'transport', icon: '🏗️', c: '#9ca3af', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Retail – Electronics & Appliances', g: 'service', icon: '📺', c: '#2f7cf6', growth: 0.035, vol: 0.018, beta: 0.95, div: 0.025 },
  { n: 'Retail – Clothing', g: 'service', icon: '👗', c: '#e5484d', growth: 0.03, vol: 0.018, beta: 0.95, div: 0.025 },
  { n: 'Retail – Home Furnishings', g: 'service', icon: '🪑', c: '#8a6d3b', growth: 0.025, vol: 0.016, beta: 0.9, div: 0.03 },
  { n: 'Retail – Pharmacy', g: 'service', icon: '⚕️', c: '#12a150', growth: 0.03, vol: 0.013, beta: 0.75, div: 0.03 },
  { n: 'Retail – Books & Media', g: 'service', icon: '📚', c: '#7c4dff', growth: 0.01, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Retail – Sporting Goods', g: 'service', icon: '⚽', c: '#12a150', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.025 },
  { n: 'Retail – Luxury Goods', g: 'service', icon: '👑', c: '#d4a017', growth: 0.035, vol: 0.02, beta: 1, div: 0.02 },
  { n: 'Retail – Auto Parts', g: 'service', icon: '🔧', c: '#6b7280', growth: 0.025, vol: 0.016, beta: 0.9, div: 0.03 },
  { n: 'Retail – Hardware & Garden', g: 'service', icon: '🪴', c: '#7a9a2e', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Retail – Convenience', g: 'service', icon: '🏪', c: '#f5b301', growth: 0.025, vol: 0.013, beta: 0.8, div: 0.03 },
  { n: 'Retail – Secondhand Goods', g: 'service', icon: '♻️', c: '#12a150', growth: 0.035, vol: 0.018, beta: 0.9, div: 0.02 },
  { n: 'Wholesale – Food & Drink', g: 'service', icon: '🥫', c: '#e0812b', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Wholesale – Consumer Goods', g: 'service', icon: '📦', c: '#8a6d3b', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Wholesale – Industrial Equipment', g: 'service', icon: '⚙️', c: '#374151', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Wholesale – Building Materials', g: 'service', icon: '🧱', c: '#8a6d3b', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Vacation Rentals & Resorts', g: 'service', icon: '🏝️', c: '#2f7cf6', growth: 0.035, vol: 0.022, beta: 1, div: 0.025 },
  { n: 'Fast Food Restaurants', g: 'service', icon: '🍔', c: '#ff6b2c', growth: 0.03, vol: 0.016, beta: 0.9, div: 0.03 },
  { n: 'Coffee Shops & Cafés', g: 'service', icon: '☕', c: '#8a6d3b', growth: 0.035, vol: 0.016, beta: 0.9, div: 0.025 },
  { n: 'Food Trucks & Street Food', g: 'service', icon: '🌮', c: '#e0812b', growth: 0.035, vol: 0.02, beta: 0.95, div: 0.02 },
  { n: 'Catering Services', g: 'service', icon: '🎉', c: '#ff6b2c', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Hospitals & Clinics', g: 'service', icon: '🏥', c: '#12a150', growth: 0.03, vol: 0.014, beta: 0.75, div: 0.03 },
  { n: 'Dental Clinics', g: 'service', icon: '🦷', c: '#2f7cf6', growth: 0.03, vol: 0.014, beta: 0.8, div: 0.03 },
  { n: 'Veterinary Services', g: 'service', icon: '🐶', c: '#e0812b', growth: 0.035, vol: 0.016, beta: 0.85, div: 0.025 },
  { n: 'Home Care Services', g: 'service', icon: '❤️', c: '#e5484d', growth: 0.04, vol: 0.014, beta: 0.8, div: 0.025 },
  { n: 'Diagnostic Laboratories', g: 'service', icon: '🔬', c: '#7c4dff', growth: 0.04, vol: 0.018, beta: 0.95, div: 0.02 },
  { n: 'Mental Health & Counselling', g: 'service', icon: '🧠', c: '#7c4dff', growth: 0.045, vol: 0.016, beta: 0.85, div: 0.02 },
  { n: 'Fitness Centers & Gyms', g: 'service', icon: '💪', c: '#e5484d', growth: 0.03, vol: 0.018, beta: 0.95, div: 0.02 },
  { n: 'Spas & Wellness Centers', g: 'service', icon: '💆', c: '#0ea5b7', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.025 },
  { n: 'Vocational & Technical Training', g: 'service', icon: '🔧', c: '#6b7280', growth: 0.025, vol: 0.012, beta: 0.7, div: 0.03 },
  { n: 'Tutoring Services', g: 'service', icon: '📝', c: '#f5b301', growth: 0.035, vol: 0.014, beta: 0.8, div: 0.025 },
  { n: 'Early Childhood Education', g: 'service', icon: '🧒', c: '#ff6b2c', growth: 0.03, vol: 0.012, beta: 0.7, div: 0.03 },
  { n: 'Museums & Cultural Sites', g: 'service', icon: '🏛️', c: '#8a6d3b', growth: 0.02, vol: 0.014, beta: 0.75, div: 0.03 },
  { n: 'Zoos & Botanical Gardens', g: 'service', icon: '🦁', c: '#12a150', growth: 0.025, vol: 0.018, beta: 0.85, div: 0.025 },
  { n: 'Theme Parks & Attractions', g: 'service', icon: '🎢', c: '#e5484d', growth: 0.035, vol: 0.022, beta: 1.05, div: 0.02 },
  { n: 'Gambling & Casinos', g: 'service', icon: '🎰', c: '#374151', growth: 0.03, vol: 0.022, beta: 1, div: 0.03 },
  { n: 'Performing Arts & Theatres', g: 'service', icon: '🎭', c: '#7c4dff', growth: 0.02, vol: 0.018, beta: 0.85, div: 0.025 },
  { n: 'Real Estate – Commercial', g: 'service', icon: '🏬', c: '#374151', growth: 0.025, vol: 0.018, beta: 0.95, div: 0.04 },
  { n: 'Real Estate Agencies & Management', g: 'service', icon: '🏘️', c: '#8a6d3b', growth: 0.025, vol: 0.016, beta: 0.9, div: 0.035 },
  { n: 'Cleaning & Janitorial Services', g: 'service', icon: '🧹', c: '#0ea5b7', growth: 0.025, vol: 0.014, beta: 0.85, div: 0.03 },
  { n: 'Security & Investigation Services', g: 'service', icon: '🛡️', c: '#374151', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Landscaping Services', g: 'service', icon: '🌳', c: '#12a150', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Pest Control Services', g: 'service', icon: '🐛', c: '#7a9a2e', growth: 0.025, vol: 0.014, beta: 0.85, div: 0.035 },
  { n: 'Staffing & Recruitment', g: 'service', icon: '👥', c: '#6b7280', growth: 0.03, vol: 0.018, beta: 0.95, div: 0.03 },
  { n: 'Travel Agencies & Tour Operators', g: 'service', icon: '✈️', c: '#2f7cf6', growth: 0.025, vol: 0.02, beta: 1, div: 0.025 },
  { n: 'Laundry & Dry Cleaning', g: 'service', icon: '👔', c: '#2f7cf6', growth: 0.02, vol: 0.014, beta: 0.8, div: 0.035 },
  { n: 'Funeral Services', g: 'service', icon: '⚰️', c: '#374151', growth: 0.015, vol: 0.012, beta: 0.7, div: 0.035 },
  { n: 'Pet Care Services', g: 'service', icon: '🐱', c: '#ff6b2c', growth: 0.04, vol: 0.016, beta: 0.9, div: 0.025 },
  { n: 'Electronics Repair Services', g: 'service', icon: '🔧', c: '#6b7280', growth: 0.02, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Appliance & Home Repair', g: 'service', icon: '🛠️', c: '#6b7280', growth: 0.02, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Industrial Repair & Installation', g: 'service', icon: '⚙️', c: '#374151', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Translation Services', g: 'service', icon: '🌐', c: '#2f7cf6', growth: 0.03, vol: 0.014, beta: 0.85, div: 0.03 },
  { n: 'Photography Services', g: 'service', icon: '📸', c: '#e5484d', growth: 0.02, vol: 0.018, beta: 0.9, div: 0.025 },
  { n: 'Event Management Services', g: 'service', icon: '🎪', c: '#ff6b2c', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.025 },
  { n: 'Call Centers & Business Support', g: 'service', icon: '📞', c: '#0ea5b7', growth: 0.02, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Self-Storage Facilities', g: 'service', icon: '🗄️', c: '#8a6d3b', growth: 0.03, vol: 0.014, beta: 0.8, div: 0.035 },
  { n: 'Co-working Spaces', g: 'service', icon: '💻', c: '#2f7cf6', growth: 0.035, vol: 0.02, beta: 1, div: 0.02 },
  { n: 'Residential Care Facilities', g: 'service', icon: '👴', c: '#8a6d3b', growth: 0.03, vol: 0.014, beta: 0.75, div: 0.03 },
  { n: 'Retail – Pet Supplies', g: 'service', icon: '🐕', c: '#e0812b', growth: 0.035, vol: 0.016, beta: 0.9, div: 0.025 },
  { n: 'Retail – Toys & Games', g: 'service', icon: '🎲', c: '#e5484d', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.025 },
  { n: 'Retail – Office Supplies', g: 'service', icon: '📎', c: '#f5b301', growth: 0.015, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Retail – Liquor & Tobacco', g: 'service', icon: '🍾', c: '#7c2d12', growth: 0.02, vol: 0.014, beta: 0.8, div: 0.035 },
  { n: 'Florists & Flower Shops', g: 'service', icon: '💐', c: '#e5484d', growth: 0.02, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Vending Machine Services', g: 'service', icon: '🍫', c: '#8a6d3b', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Auction Houses', g: 'service', icon: '🔨', c: '#8a6d3b', growth: 0.025, vol: 0.02, beta: 0.95, div: 0.025 },
  { n: 'Tattoo & Piercing Studios', g: 'service', icon: '🖋️', c: '#374151', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.02 },
  { n: 'Records Management & Shredding', g: 'service', icon: '🗂️', c: '#6b7280', growth: 0.025, vol: 0.014, beta: 0.85, div: 0.03 },
  { n: 'Locksmith Services', g: 'service', icon: '🔐', c: '#f5b301', growth: 0.02, vol: 0.014, beta: 0.8, div: 0.03 },
  { n: 'Tailoring & Clothing Repair', g: 'service', icon: '✂️', c: '#e5484d', growth: 0.015, vol: 0.014, beta: 0.8, div: 0.03 },
  { n: 'Furniture Repair & Restoration', g: 'service', icon: '🪑', c: '#8a6d3b', growth: 0.02, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Party & Event Rental', g: 'service', icon: '🎈', c: '#ff6b2c', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.025 },
  { n: 'Medical Equipment Rental', g: 'service', icon: '🦽', c: '#0ea5b7', growth: 0.035, vol: 0.016, beta: 0.85, div: 0.025 },
  { n: 'Recreational Equipment Rental', g: 'service', icon: '🚲', c: '#12a150', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.025 },
  { n: 'Uniform & Linen Rental', g: 'service', icon: '🥼', c: '#2f7cf6', growth: 0.025, vol: 0.014, beta: 0.85, div: 0.035 },
  { n: 'Payroll Services', g: 'service', icon: '💵', c: '#12a150', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Tax Preparation Services', g: 'service', icon: '🧾', c: '#374151', growth: 0.025, vol: 0.014, beta: 0.8, div: 0.03 },
  { n: 'Campgrounds & RV Parks', g: 'service', icon: '🏕️', c: '#2e7d32', growth: 0.03, vol: 0.02, beta: 0.95, div: 0.025 },
  { n: 'Marina & Boatyard Services', g: 'service', icon: '⛵', c: '#2f7cf6', growth: 0.025, vol: 0.018, beta: 0.9, div: 0.025 },
  { n: 'Golf Courses & Country Clubs', g: 'service', icon: '⛳', c: '#12a150', growth: 0.02, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Bowling & Entertainment Centers', g: 'service', icon: '🎳', c: '#e5484d', growth: 0.02, vol: 0.018, beta: 0.9, div: 0.025 },
  { n: 'Movie Theatres', g: 'service', icon: '🍿', c: '#e5484d', growth: 0.015, vol: 0.02, beta: 1, div: 0.02 },
  { n: 'Payment Processing & Cards', g: 'finance', icon: '💳', c: '#12a150', growth: 0.05, vol: 0.022, beta: 1.1, div: 0.02 },
  { n: 'Cryptocurrency Exchanges', g: 'finance', icon: '🪙', c: '#f5b301', growth: 0.07, vol: 0.034, beta: 1.4, div: 0 },
  { n: 'Asset & Wealth Management', g: 'finance', icon: '💹', c: '#12a150', growth: 0.04, vol: 0.02, beta: 1.05, div: 0.03 },
  { n: 'Pension Funds', g: 'finance', icon: '💰', c: '#374151', growth: 0.025, vol: 0.014, beta: 0.7, div: 0.04 },
  { n: 'Reinsurance', g: 'finance', icon: '🛡️', c: '#374151', growth: 0.025, vol: 0.016, beta: 0.85, div: 0.04 },
  { n: 'Insurance Brokers & Agents', g: 'finance', icon: '🤝', c: '#6b7280', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.035 },
  { n: 'Financial Data & Ratings', g: 'finance', icon: '📊', c: '#2f7cf6', growth: 0.045, vol: 0.02, beta: 1, div: 0.02 },
  { n: 'Venture Capital & Private Equity', g: 'finance', icon: '💸', c: '#7c4dff', growth: 0.05, vol: 0.026, beta: 1.25, div: 0.01 },
  { n: 'Consumer Credit & Leasing', g: 'finance', icon: '💵', c: '#12a150', growth: 0.03, vol: 0.02, beta: 1, div: 0.035 },
  { n: 'Microfinance Institutions', g: 'finance', icon: '🏦', c: '#12a150', growth: 0.04, vol: 0.022, beta: 0.95, div: 0.025 },
  { n: 'Architecture & Engineering', g: 'finance', icon: '📐', c: '#0ea5b7', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.03 },
  { n: 'Research & Development Services', g: 'finance', icon: '🔬', c: '#7c4dff', growth: 0.045, vol: 0.022, beta: 1.05, div: 0.02 },
  { n: 'Market Research & Polling', g: 'finance', icon: '📋', c: '#7c4dff', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Public Relations', g: 'finance', icon: '🎤', c: '#ff6b2c', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.025 },
  { n: 'HR Consulting', g: 'finance', icon: '💼', c: '#6b7280', growth: 0.03, vol: 0.016, beta: 0.85, div: 0.03 },
  { n: 'Environmental Consulting', g: 'finance', icon: '🌿', c: '#12a150', growth: 0.04, vol: 0.018, beta: 0.95, div: 0.025 },
  { n: 'Design Services', g: 'finance', icon: '✏️', c: '#e5484d', growth: 0.03, vol: 0.018, beta: 0.9, div: 0.025 },
  { n: 'Securities & Commodity Exchanges', g: 'finance', icon: '📈', c: '#12a150', growth: 0.035, vol: 0.02, beta: 1, div: 0.03 },
  { n: 'Debt Collection Agencies', g: 'finance', icon: '📞', c: '#374151', growth: 0.02, vol: 0.018, beta: 0.9, div: 0.035 },];
const LEADER_SECTOR_BY_NAME = {};
LEADER_SECTORS.forEach(s => { LEADER_SECTOR_BY_NAME[s.n] = s; });

// Expand SECTORS (old 5) with the 97, so companyWeek / locEconomics /
// fleetEconomics work for any leader sector. Loc/fleet templates are by
// group: transport sectors get a fleet, others get a location template.
(function expandSectors() {
  if (typeof SECTORS === 'undefined') return;
  // Foot traffic is NOT worth the same everywhere: what matters is
  // capture x ticket per visitor. A restaurant visitor spends a small
  // ticket often; a general-retail visitor (phones, appliances) spends
  // a big ticket rarely. The old single Shop template (ticket 40 for
  // every food/service sector) made a coffee location earn exactly what
  // a phone-retail location earned at equal traffic. These per-sector
  // [ticket, capture] pairs fix that; revenue per visitor is ticket x
  // capture, so Restaurants (16 x 0.30 = 4.80) now earns clearly less
  // than Retail – General (90 x 0.14 = 12.60) at the same foot traffic.
  const TRAFFIC_TICKET = {
    'Crop Farming': [14, 0.15], 'Livestock Farming': [20, 0.10], 'Fishing & Aquaculture': [18, 0.15],
    'Forestry & Timber': [25, 0.08], 'Food Processing': [28, 0.12], 'Beverages & Tobacco': [18, 0.22],
    'Dairy Products': [16, 0.20], 'Meat Processing': [32, 0.10], 'Bakery & Confectionery': [12, 0.32],
    'Animal Feed': [22, 0.08],
    'Retail – Grocery': [48, 0.32], 'Retail – General': [90, 0.14], 'Hotels': [130, 0.05],
    'Restaurants & Bars': [16, 0.30], 'Healthcare Services': [70, 0.12],
    'Education – Schools': [30, 0.08], 'Education – Higher': [30, 0.08],
    'Entertainment – Film & Music': [14, 0.28], 'Entertainment – Gaming & Sports': [28, 0.16],
    'Tourism Services': [95, 0.08], 'Personal Services': [35, 0.20], 'Real Estate – Residential': [400, 0.01],
    'Cellular Agriculture': [35, 0.10], 'Vertical Farming': [20, 0.25],
    'Grain Milling': [22, 0.12],
    'Vegetable Oils & Fats': [24, 0.12],
    'Starch Products': [18, 0.1],
    'Sugar Refining': [20, 0.1],
    'Fruit & Vegetable Processing': [26, 0.14],
    'Seafood Processing': [30, 0.14],
    'Coffee & Tea Processing': [18, 0.18],
    'Spice & Condiments': [14, 0.16],
    'Snack Foods': [12, 0.22],
    'Pet Food': [28, 0.2],
    'Infant & Dietary Foods': [32, 0.18],
    'Pasta & Noodle Manufacturing': [16, 0.16],
    'Wine Production': [34, 0.16],
    'Brewing': [22, 0.18],
    'Poultry Farming': [20, 0.12],
    'Floriculture & Nurseries': [24, 0.2],
    'Seed & Seedling Production': [26, 0.1],
    'Beekeeping & Honey': [18, 0.14],
    'Cannabis Cultivation': [40, 0.18],
    'Agricultural Support Services': [30, 0.1],
    'Algae Cultivation': [28, 0.1],
    'Retail – Electronics & Appliances': [85, 0.14],
    'Retail – Clothing': [45, 0.18],
    'Retail – Home Furnishings': [90, 0.12],
    'Retail – Pharmacy': [25, 0.22],
    'Retail – Books & Media': [22, 0.16],
    'Retail – Sporting Goods': [55, 0.15],
    'Retail – Luxury Goods': [160, 0.1],
    'Retail – Auto Parts': [48, 0.14],
    'Retail – Hardware & Garden': [42, 0.16],
    'Retail – Convenience': [12, 0.3],
    'Retail – Secondhand Goods': [20, 0.18],
    'Wholesale – Food & Drink': [60, 0.1],
    'Wholesale – Consumer Goods': [55, 0.1],
    'Wholesale – Industrial Equipment': [120, 0.08],
    'Wholesale – Building Materials': [95, 0.08],
    'Vacation Rentals & Resorts': [140, 0.15],
    'Fast Food Restaurants': [12, 0.3],
    'Coffee Shops & Cafés': [6, 0.3],
    'Food Trucks & Street Food': [12, 0.25],
    'Catering Services': [45, 0.12],
    'Hospitals & Clinics': [120, 0.1],
    'Dental Clinics': [90, 0.12],
    'Veterinary Services': [65, 0.14],
    'Home Care Services': [55, 0.1],
    'Diagnostic Laboratories': [40, 0.12],
    'Mental Health & Counselling': [70, 0.12],
    'Fitness Centers & Gyms': [30, 0.2],
    'Spas & Wellness Centers': [55, 0.16],
    'Vocational & Technical Training': [45, 0.1],
    'Tutoring Services': [35, 0.14],
    'Early Childhood Education': [50, 0.1],
    'Museums & Cultural Sites': [18, 0.22],
    'Zoos & Botanical Gardens': [22, 0.22],
    'Theme Parks & Attractions': [65, 0.2],
    'Gambling & Casinos': [45, 0.18],
    'Performing Arts & Theatres': [38, 0.18],
    'Real Estate – Commercial': [120, 0.06],
    'Real Estate Agencies & Management': [85, 0.08],
    'Cleaning & Janitorial Services': [35, 0.12],
    'Security & Investigation Services': [60, 0.08],
    'Landscaping Services': [40, 0.12],
    'Pest Control Services': [45, 0.1],
    'Staffing & Recruitment': [55, 0.08],
    'Travel Agencies & Tour Operators': [65, 0.12],
    'Laundry & Dry Cleaning': [18, 0.2],
    'Funeral Services': [120, 0.06],
    'Pet Care Services': [30, 0.16],
    'Electronics Repair Services': [45, 0.14],
    'Appliance & Home Repair': [55, 0.12],
    'Industrial Repair & Installation': [80, 0.08],
    'Translation Services': [40, 0.1],
    'Photography Services': [50, 0.14],
    'Event Management Services': [60, 0.12],
    'Call Centers & Business Support': [30, 0.08],
    'Self-Storage Facilities': [45, 0.12],
    'Co-working Spaces': [25, 0.16],
    'Residential Care Facilities': [90, 0.08],
    'Retail – Pet Supplies': [30, 0.2],
    'Retail – Toys & Games': [35, 0.18],
    'Retail – Office Supplies': [20, 0.18],
    'Retail – Liquor & Tobacco': [28, 0.2],
    'Florists & Flower Shops': [30, 0.2],
    'Vending Machine Services': [5, 0.35],
    'Auction Houses': [90, 0.1],
    'Tattoo & Piercing Studios': [55, 0.14],
    'Records Management & Shredding': [40, 0.08],
    'Locksmith Services': [50, 0.12],
    'Tailoring & Clothing Repair': [35, 0.14],
    'Furniture Repair & Restoration': [45, 0.12],
    'Party & Event Rental': [40, 0.14],
    'Medical Equipment Rental': [50, 0.1],
    'Recreational Equipment Rental': [25, 0.18],
    'Uniform & Linen Rental': [35, 0.1],
    'Payroll Services': [45, 0.08],
    'Tax Preparation Services': [60, 0.12],
    'Campgrounds & RV Parks': [35, 0.18],
    'Marina & Boatyard Services': [55, 0.12],
    'Golf Courses & Country Clubs': [60, 0.16],
    'Bowling & Entertainment Centers': [22, 0.22],
    'Movie Theatres': [16, 0.25] };
  const locFor = (g, n) => {
    if (g === 'food' || g === 'service') {
      const t = TRAFFIC_TICKET[n] || [40, 0.08];
      return { name: 'Shop', mode: 'traffic', capture: t[1], ticket: t[0], cogs: 0.5, throughput: 200, wage: 700, staff: 3, buildout: 120000 };
    }
    return g === 'transport' ? { name: 'Depot', mode: 'size', perStaff: 1500, wage: 850, staffPerSize: 8, buildout: 200000 }
    : { name: 'Office', mode: 'size', perStaff: 2500, wage: 1300, staffPerSize: 10, buildout: 240000 };
  };
  const fleetFor = n => n === 'Airlines – Passenger' || n === 'Airlines – Cargo' ? SECTORS.Airline.fleet
    : n === 'Shipping – Freight' || n === 'Shipping – Passenger' ? SECTORS.Shipping.fleet
    : n === 'Oil Extraction' || n === 'Oil Refining & Fuels' ? SECTORS.Energy.fleet : null;
  LEADER_SECTORS.forEach(s => {
    if (SECTORS[s.n]) return;
    SECTORS[s.n] = { icon: s.icon, color: s.c, pe: 16, growth: s.growth, vol: s.vol, beta: s.beta, div: s.div,
      tag: s.n + '.', products: [s.n], loc: locFor(s.g, s.n), fleet: fleetFor(s.n) };
    if (typeof SUFFIX !== 'undefined' && !SUFFIX[s.n]) SUFFIX[s.n] = [' Co.', ' Group', ' Industries', ' Ltd.', ' Corp.'];
    // SECTOR_LIST was built from the original 5 sectors at data load time.
    // If it is not expanded here, marketDay looks up sec[newSector] as
    // undefined, every leader-sector stock return becomes NaN, and the
    // World Index poisons to NaN forever. That was the live NaN bug.
    if (typeof SECTOR_LIST !== 'undefined' && !SECTOR_LIST.includes(s.n)) SECTOR_LIST.push(s.n);
  });
})();

// ---------- realism sector picking ----------
// Candidate pool per country: domestic sectors first, then specialisations.
// Randomness is only which 2–3 from the pool, never a random sector globally.
const LEADER_SPECIAL = {
  TWN: ['Semiconductors', 'Electronics – Components', 'Consumer Electronics'],
  KOR: ['Semiconductors', 'Vehicles – Cars & Trucks', 'Consumer Electronics'],
  JPN: ['Vehicles – Cars & Trucks', 'Machinery – Industrial', 'Robotics & Automation'],
  DEU: ['Vehicles – Cars & Trucks', 'Machinery – Industrial', 'Chemicals – Basic'],
  CHN: ['Textiles', 'Consumer Electronics', 'Semiconductors', 'Steel Production'],
  USA: ['Software & AI', 'Semiconductors', 'Finance – Banking', 'Aerospace'],
  GBR: ['Finance – Banking', 'Pharmaceuticals', 'Professional – Consulting'],
  CHE: ['Finance – Banking', 'Pharmaceuticals', 'Professional – Legal & Accounting'],
  SAU: ['Oil Extraction', 'Oil Refining & Fuels', 'Chemicals – Basic'],
  RUS: ['Oil Extraction', 'Natural Gas', 'Mining – Metals'],
  QAT: ['Natural Gas', 'Oil Extraction', 'Chemicals – Basic'],
  NGA: ['Oil Extraction', 'Crop Farming', 'Mining – Non-metals'],
  AUS: ['Mining – Metals', 'Crop Farming', 'Tourism Services'],
  CHL: ['Mining – Metals', 'Crop Farming', 'Fishing & Aquaculture'],
  BRA: ['Crop Farming', 'Livestock Farming', 'Mining – Metals'],
  ARG: ['Crop Farming', 'Livestock Farming', 'Food Processing'],
  UKR: ['Crop Farming', 'Steel Production', 'Food Processing'],
  IND: ['Textiles', 'Software & AI', 'Pharmaceuticals', 'Coal & Peat'],
  BGD: ['Textiles', 'Apparel & Footwear', 'Crop Farming'],
  VNM: ['Textiles', 'Consumer Electronics', 'Crop Farming'],
  MEX: ['Vehicles – Cars & Trucks', 'Consumer Electronics', 'Tourism Services'],
  CAN: ['Oil Extraction', 'Mining – Metals', 'Forestry & Timber'],
  NOR: ['Oil Extraction', 'Natural Gas', 'Fishing & Aquaculture'],
  SGP: ['Semiconductors', 'Finance – Banking', 'Shipping – Freight'],
  NLD: ['Semiconductors', 'Chemicals – Basic', 'Logistics & Warehousing'],
  ISR: ['Software & AI', 'Cybersecurity', 'Pharmaceuticals'],
  FRA: ['Aerospace', 'Tourism Services', 'Pharmaceuticals'],
  ITA: ['Vehicles – Cars & Trucks', 'Tourism Services', 'Apparel & Footwear'],
  ESP: ['Tourism Services', 'Crop Farming', 'Vehicles – Cars & Trucks'],
  IRQ: ['Oil Extraction', 'Natural Gas'],
  IRN: ['Oil Extraction', 'Natural Gas'],
  VEN: ['Oil Extraction'],
  ARE: ['Oil Extraction', 'Natural Gas'],
  KWT: ['Oil Extraction'],
  LBY: ['Oil Extraction'],
  DZA: ['Natural Gas', 'Oil Extraction'],
  AZE: ['Oil Extraction', 'Natural Gas'],
  KAZ: ['Oil Extraction', 'Mining – Metals', 'Coal & Peat'],
  ZAF: ['Mining – Metals', 'Crop Farming'],
  THA: ['Tourism Services', 'Food Processing'],
  MYS: ['Consumer Electronics', 'Semiconductors'],
  IDN: ['Mining – Metals', 'Crop Farming', 'Coal & Peat'],
  PHL: ['Consumer Electronics', 'Tourism Services'],
  POL: ['Vehicles – Cars & Trucks', 'Food Processing', 'Coal & Peat'],
  TUR: ['Textiles', 'Tourism Services'],
  EGY: ['Natural Gas', 'Tourism Services'],
  COL: ['Oil Extraction', 'Crop Farming'],
  PER: ['Mining – Metals', 'Crop Farming'],
  UZB: ['Natural Gas', 'Mining – Metals'],
  TKM: ['Natural Gas'],
  BHR: ['Oil Extraction', 'Finance – Banking'],
  OMN: ['Oil Extraction', 'Natural Gas'],
  BRN: ['Oil Extraction', 'Natural Gas'],
};
const LEADER_MUST = {
  RUS: ['Oil Extraction', 'Natural Gas', 'Coal & Peat'],
  SAU: ['Oil Extraction', 'Natural Gas'],
  QAT: ['Natural Gas', 'Oil Extraction'],
  NOR: ['Oil Extraction', 'Natural Gas'],
  IRQ: ['Oil Extraction'],
  IRN: ['Oil Extraction', 'Natural Gas'],
  VEN: ['Oil Extraction'],
  ARE: ['Oil Extraction', 'Natural Gas'],
  KWT: ['Oil Extraction'],
  LBY: ['Oil Extraction'],
  DZA: ['Natural Gas', 'Oil Extraction'],
  AZE: ['Oil Extraction', 'Natural Gas'],
  KAZ: ['Oil Extraction', 'Mining – Metals'],
  NGA: ['Oil Extraction'],
  CAN: ['Oil Extraction', 'Mining – Metals'],
  AUS: ['Mining – Metals', 'Coal & Peat'],
  CHL: ['Mining – Metals'],
  ZAF: ['Mining – Metals', 'Coal & Peat'],
  BRA: ['Crop Farming'],
  TWN: ['Semiconductors'],
  KOR: ['Semiconductors', 'Vehicles – Cars & Trucks'],
  JPN: ['Vehicles – Cars & Trucks', 'Machinery – Industrial'],
  DEU: ['Vehicles – Cars & Trucks', 'Machinery – Industrial', 'Coal & Peat'],
  CHN: ['Consumer Electronics', 'Textiles', 'Coal & Peat'],
  USA: ['Software & AI', 'Semiconductors', 'Coal & Peat'],
  GBR: ['Finance – Banking'],
  CHE: ['Finance – Banking', 'Pharmaceuticals'],
  SGP: ['Semiconductors', 'Finance – Banking'],
  NLD: ['Semiconductors'],
  ISR: ['Software & AI', 'Cybersecurity'],
  FRA: ['Aerospace'],
  ITA: ['Tourism Services'],
  ESP: ['Tourism Services'],
  IND: ['Software & AI'],
  BGD: ['Textiles'],
  VNM: ['Textiles', 'Consumer Electronics'],
  MEX: ['Vehicles – Cars & Trucks'],
  UKR: ['Crop Farming'],
  ARG: ['Crop Farming'],
  THA: ['Tourism Services'],
  MYS: ['Consumer Electronics'],
  IDN: ['Mining – Metals'],
  AFG: ['Crop Farming'],
  AGO: ['Oil Extraction'],
  ALB: ['Tourism Services'],
  AND: ['Finance – Banking'],
  ATG: ['Tourism Services'],
  AUT: ['Machinery – Industrial'],
  BEL: ['Pharmaceuticals'],
  BEN: ['Crop Farming'],
  BFA: ['Crop Farming'],
  BGR: ['Food Processing'],
  BHR: ['Oil Extraction'],
  BHS: ['Tourism Services'],
  BIH: ['Steel Production'],
  BLR: ['Machinery – Industrial'],
  BLZ: ['Tourism Services'],
  BOL: ['Mining – Metals'],
  BRB: ['Tourism Services'],
  BRN: ['Oil Extraction'],
  BTN: ['Electricity Generation'],
  BWA: ['Mining – Metals'],
  CAF: ['Mining – Metals'],
  CIV: ['Crop Farming'],
  CMR: ['Oil Extraction'],
  COD: ['Mining – Metals'],
  COG: ['Oil Extraction'],
  COL: ['Oil Extraction'],
  COM: ['Tourism Services'],
  CPV: ['Tourism Services'],
  CRI: ['Tourism Services'],
  CUB: ['Tourism Services'],
  CYP: ['Tourism Services'],
  CZE: ['Vehicles – Cars & Trucks'],
  DJI: ['Ports & Airports Services'],
  DMA: ['Tourism Services'],
  DNK: ['Pharmaceuticals'],
  DOM: ['Tourism Services'],
  ECU: ['Oil Extraction'],
  EGY: ['Natural Gas'],
  ERI: ['Mining – Metals'],
  EST: ['Software & AI'],
  ETH: ['Crop Farming'],
  FIN: ['Forestry & Timber'],
  FJI: ['Tourism Services'],
  FSM: ['Fishing & Aquaculture'],
  GAB: ['Oil Extraction'],
  GEO: ['Tourism Services'],
  GHA: ['Crop Farming'],
  GIN: ['Mining – Metals'],
  GMB: ['Crop Farming'],
  GNB: ['Crop Farming'],
  GNQ: ['Oil Extraction'],
  GRC: ['Tourism Services'],
  GRD: ['Tourism Services'],
  GTM: ['Crop Farming'],
  GUY: ['Oil Extraction'],
  HND: ['Textiles'],
  HRV: ['Tourism Services'],
  HTI: ['Crop Farming'],
  HUN: ['Vehicles – Cars & Trucks'],
  IRL: ['Pharmaceuticals'],
  ISL: ['Fishing & Aquaculture'],
  JAM: ['Tourism Services'],
  JOR: ['Tourism Services'],
  KEN: ['Tourism Services'],
  KGZ: ['Mining – Metals'],
  KHM: ['Textiles'],
  KIR: ['Fishing & Aquaculture'],
  KNA: ['Tourism Services'],
  LAO: ['Electricity Generation'],
  LBN: ['Finance – Banking'],
  LBR: ['Mining – Metals'],
  LCA: ['Tourism Services'],
  LIE: ['Finance – Banking'],
  LKA: ['Textiles'],
  LSO: ['Textiles'],
  LTU: ['Food Processing'],
  LUX: ['Finance – Banking'],
  LVA: ['Forestry & Timber'],
  MAR: ['Mining – Non-metals'],
  MCO: ['Finance – Banking'],
  MDA: ['Crop Farming'],
  MDG: ['Crop Farming'],
  MDV: ['Tourism Services'],
  MHL: ['Fishing & Aquaculture'],
  MKD: ['Textiles'],
  MLI: ['Mining – Metals'],
  MLT: ['Tourism Services'],
  MMR: ['Crop Farming'],
  MNE: ['Tourism Services'],
  MNG: ['Mining – Metals'],
  MOZ: ['Natural Gas'],
  MRT: ['Mining – Metals'],
  MUS: ['Tourism Services'],
  MWI: ['Crop Farming'],
  NAM: ['Mining – Metals'],
  NER: ['Mining – Metals'],
  NIC: ['Textiles'],
  NRU: ['Mining – Non-metals'],
  NZL: ['Dairy Products'],
  OMN: ['Oil Extraction'],
  PAK: ['Textiles'],
  PAN: ['Ports & Airports Services'],
  PER: ['Mining – Metals'],
  PHL: ['Consumer Electronics'],
  PLW: ['Tourism Services'],
  PNG: ['Mining – Metals'],
  POL: ['Vehicles – Cars & Trucks'],
  PRK: ['Mining – Metals'],
  PRT: ['Tourism Services'],
  PRY: ['Crop Farming'],
  PSE: ['Crop Farming'],
  ROU: ['Vehicles – Cars & Trucks'],
  RWA: ['Crop Farming'],
  SDN: ['Crop Farming'],
  SEN: ['Fishing & Aquaculture'],
  SLB: ['Fishing & Aquaculture'],
  SLE: ['Mining – Metals'],
  SLV: ['Textiles'],
  SMR: ['Finance – Banking'],
  SOM: ['Livestock Farming'],
  SRB: ['Food Processing'],
  SSD: ['Oil Extraction'],
  STP: ['Crop Farming'],
  SUR: ['Mining – Metals'],
  SVK: ['Vehicles – Cars & Trucks'],
  SVN: ['Pharmaceuticals'],
  SWE: ['Machinery – Industrial'],
  SWZ: ['Crop Farming'],
  SYC: ['Tourism Services'],
  SYR: ['Oil Extraction'],
  TCD: ['Oil Extraction'],
  TGO: ['Crop Farming'],
  TJK: ['Mining – Metals'],
  TKM: ['Natural Gas'],
  TLS: ['Oil Extraction'],
  TON: ['Fishing & Aquaculture'],
  TTO: ['Natural Gas'],
  TUN: ['Textiles'],
  TUR: ['Textiles'],
  TUV: ['Fishing & Aquaculture'],
  TZA: ['Tourism Services'],
  UGA: ['Crop Farming'],
  URY: ['Livestock Farming'],
  UZB: ['Natural Gas'],
  VAT: ['Tourism Services'],
  VCT: ['Tourism Services'],
  VUT: ['Tourism Services'],
  WSM: ['Tourism Services'],
  YEM: ['Oil Extraction'],
  ZMB: ['Mining – Metals'],
  ZWE: ['Mining – Metals'],
  NPL: ['Crop Farming'],
  BDI: ['Crop Farming'],
  ARM: ['Mining – Metals'],
};
function mustHaveForCountry(a3) { return (LEADER_MUST[a3] || []).filter(n => LEADER_SECTOR_BY_NAME[n]); }
// Game year: day 0 = Jan 1, 2026.
function gameYear() { const d = (typeof S !== 'undefined' && S && isFinite(S.day)) ? S.day : 0; return 2026 + Math.floor(d / 365); }
// Sector pool for a country in a given year. year defaults to the current
// game year; new games pass 2026 explicitly (a stale S from a previous
// save must never leak its year into a fresh world). Future sectors join
// rich countries at arrival, mid countries 12 years later; dead sectors
// (past their to year) drop out.
function sectorPoolForCountry(k, year) {
  const yr = (year != null) ? year : gameYear();
  const pool = [];
  mustHaveForCountry(k.a3).forEach(n => pool.push(n));
  pool.push('Retail – Grocery', 'Construction – Residential', 'Food Processing');
  const gdpPc = k.gdp0 * 1e6 / Math.max(1, k.pop0);
  if (LEADER_SPECIAL[k.a3]) pool.push(...LEADER_SPECIAL[k.a3]);
  if (k.coastal) pool.push('Fishing & Aquaculture', 'Shipping – Freight', 'Ports & Airports Services');
  else pool.push('Rail Transport', 'Road Transport & Trucking');
  if (gdpPc > 30000) pool.push('Software & AI', 'Finance – Banking', 'Professional – Consulting');
  else if (gdpPc > 10000) pool.push('Machinery – Industrial', 'Consumer Electronics');
  else pool.push('Crop Farming', 'Textiles', 'Apparel & Footwear');
  if (k.wealth > 1.2) pool.push('Data Centers & Cloud', 'Pharmaceuticals');
  if (k.wealth < 0.6) pool.push('Livestock Farming', 'Mining – Non-metals');
  // Era-gated future sectors: rich countries at arrival, mid countries later.
  const futureFor = (name, from) => { if (yr >= from && gdpPc > 30000) pool.push(name); else if (yr >= from + 12 && gdpPc > 10000) pool.push(name); };
  futureFor('Rockets & Launch Services', 2026);
  futureFor('Additive Manufacturing', 2026);
  futureFor('AI Agents', 2028);
  futureFor('Drone Delivery', 2028);
  futureFor('Vertical Farming', 2028);
  futureFor('Immersive Worlds', 2028);
  futureFor('Humanoid Robotics', 2030);
  futureFor('Autonomous Vehicles', 2030);
  futureFor('Cellular Agriculture', 2030);
  futureFor('Carbon Capture', 2030);
  futureFor('Quantum Computing', 2032);
  futureFor('Synthetic Biology', 2032);
  futureFor('Space Mining', 2035);
  futureFor('Orbital Manufacturing', 2035);
  futureFor('Nanotechnology', 2035);
  futureFor('Brain–Computer Interfaces', 2038);
  futureFor('Lunar Infrastructure', 2040);
  futureFor('Fusion Energy', 2040);
  futureFor('Mars Services', 2050);
  // Dedupe, keep order, only sectors that exist and are alive in yr.
  const out = []; pool.forEach(n => { const s = LEADER_SECTOR_BY_NAME[n]; if (s && !out.includes(n) && !(s.to && yr > s.to)) out.push(n); });
  return out;
}
// ---------- parody company table (real-companies.js) ----------
// REAL_COMPANIES[a3] lists parody companies (parody name + ticker, real
// HQ city) per sector. A generated company in a covered sector takes the
// parody instead of a fictional name. Random worlds never use it.
function parodyFor(a3, sector, usedNames, usedSyms) {
  const list = (typeof REAL_COMPANIES !== 'undefined' && REAL_COMPANIES[a3]) || [];
  return list.find(e => e.sector === sector && !(usedNames && usedNames.has(e.name)) && !(usedSyms && usedSyms.has(e.sym))) || null;
}
// HQ city resolution: exact game-city name match in the country
// (accents/punctuation ignored), else the country's largest city.
function hqCityId(a3, hq) {
  if (!hq || typeof W === 'undefined' || !W || !W.cities) return null;
  const inCountry = W.cities.filter(c => c.a3 === a3);
  if (!inCountry.length) return null;
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, '').trim();
  const exact = inCountry.find(c => norm(c.name) === norm(hq));
  if (exact) return exact.id;
  return inCountry.slice().sort((x, y) => y.pop - x.pop)[0].id;
}

// Open pool: ANY era-alive sector, for CPU generation. Unlike the
// realism pool (must-haves, specialisations, wealth/coastal tiers —
// still used for districts, displays and arrival eligibility), this has
// no country restrictions: any country may have any sector. Era rules
// still apply (nothing before its from year, nothing after its to year).
// Start counts stay small (2–3 businesses); growth comes later, from
// the diversification pass in sectorEraWeek.
function openSectorPool(year) {
  const yr = (year != null) ? year : gameYear();
  return LEADER_SECTORS.filter(s => (!s.from || s.from <= yr) && (!s.to || s.to >= yr)).map(s => s.n);
}

function inheritDifficulty(k) {
  const gdpPc = k.gdp0 * 1e6 / Math.max(1, k.pop0);
  if (k.gdp0 > 1e6) return 'Powerful';
  if (gdpPc > 20000) return 'Stable';
  if (gdpPc > 5000) return 'Developing';
  return 'Struggling';
}

// ---------- extra businesses: real businesses AND separate stocks ----------
// Flagship companies (S.co) stay full companies. Extras are real economic
// businesses: they earn, pay tax, employ people, and affect the country —
// AND each one is now its own listed stock in Markets (its own price,
// shares, chart and holdings), tradable long only (buy/sell, no shorts,
// no takeovers — those stay flagship-only). Their holdings live in
// S.holdingsX keyed by extra id, so they can never collide with a
// flagship holding keyed by country.
function makeExtraBusiness(k, sector, usedNames, usedSyms, idx) {
  const info = LEADER_SECTOR_BY_NAME[sector] || { growth: 0.03, vol: 0.02, icon: '🏢', c: '#374151' };
  let brand, name, sym;
  // Shuffled world only: separate random pool (see random-names.js).
  if (typeof genRandomCompany === 'function' && isRandomWorld()) { const g = genRandomCompany(sector, usedNames, usedSyms); if (g) { brand = g.brand; name = g.name; sym = g.sym; } }
  if (!name) { do { brand = pick(BRAND_A) + pick(BRAND_B); } while (usedNames.has(brand)); usedNames.add(brand); name = brand + pick(SUFFIX[sector] || [' Co.']); sym = tickerFor(brand, usedSyms); }
  // Parody table: an extra in a covered sector takes its parody name/ticker.
  if (!isRandomWorld() && typeof parodyFor === 'function') {
    const p = parodyFor(k.a3, sector, usedNames, usedSyms);
    if (p) { name = p.name; sym = p.sym; usedNames.add(name); usedSyms.add(sym); }
  }
  const gdpDollars = k.gdp0 * 1e6;
  const value = Math.max(1e6, gdpDollars * 0.008 / 3 * (0.7 + rand() * 0.6));
  const p0 = +(8 + rand() * 190).toFixed(2);
  return { id: k.a3 + '-' + idx, a3: k.a3, sector, name, sym,
    icon: info.icon, color: info.c, value, revenue: value * 0.12, profit: value * 0.012,
    employees: Math.max(10, Math.round(value / Math.max(5000, gdpDollars / Math.max(1, k.pop0)) / 8)),
    tax: 0, week: { profit: 0, tax: 0, rev: 0 }, rating: 3.4 + rand() * 0.5,
    listed: true, price: p0, p0, shares: Math.max(1e5, Math.round(value / p0)), vol: info.vol || 0.02,
    h: { d: [], w: [], m: [], v: [] }, dayVol: 0, tradedToday: 0 };
}
// Migration for saves made before extras became stocks: give an old
// extra its price, shares and chart from its economic value.
function ensureExtraStock(b) {
  if (!b) return b;
  if (b.listed == null) b.listed = true;
  if (!isFinite(b.price) || b.price <= 0) { b.p0 = +(8 + Math.random() * 190).toFixed(2); b.price = b.p0; }
  if (!isFinite(b.p0) || b.p0 <= 0) b.p0 = b.price;
  if (!isFinite(b.shares) || b.shares <= 0) b.shares = Math.max(1e5, Math.round(Math.max(1e6, b.value || 1e6) / b.price));
  if (!isFinite(b.vol) || b.vol <= 0) b.vol = 0.02;
  if (!b.h || !Array.isArray(b.h.d)) b.h = { d: [], w: [], m: [], v: [] };
  return b;
}
// Trade an extra stock, long only. Returns an error string, or null.
function tradeExtra(id, side, qty, w) {
  const b = S.extra && S.extra[id]; if (!b) return 'Business not found.';
  ensureExtraStock(b);
  qty = Math.floor(+qty); if (!(qty > 0)) return 'Enter how many shares.';
  if (typeof marketOpen === 'function' && !marketOpen()) return 'Markets are closed on weekends.';
  w = w || curWallet();
  const map = holdMapX(w);
  const pos = map[id] || { qty: 0, cost: 0 };
  if (side === 'buy') {
    if (qty * b.price > walletCash(w)) return 'Not enough cash in this wallet.';
    if (holdQtyX(id) + qty > b.shares) return 'You can’t buy more shares than exist.';
    pos.cost = (pos.cost * pos.qty + qty * b.price) / (pos.qty + qty); pos.qty += qty; walletPay(w, qty * b.price);
  } else if (side === 'sell') {
    if (pos.qty < qty) return 'You don’t own that many shares in this wallet.';
    pos.qty -= qty; walletAdd(w, qty * b.price);
  } else return 'Extra stocks trade buy and sell only.';
  if (pos.qty === 0) delete map[id]; else map[id] = pos;
  b.tradedToday = (b.tradedToday || 0) + qty;
  if (typeof impactFor === 'function') { try { const imp = impactFor(b, qty * b.price); b.price = Math.max(0.5, b.price * Math.exp((side === 'buy' ? 1 : -1) * imp)); } catch (e) {} }
  if (typeof S !== 'undefined' && S.stats) S.stats.trades = (S.stats.trades || 0) + 1;
  return null;
}

function businessesInCountry(a3) {
  const out = [];
  if (S.co[a3]) out.push(S.co[a3]);
  if (S.extra) Object.values(S.extra).forEach(b => { if (b.a3 === a3) out.push(b); });
  return out;
}

// ---------- leader economy, straight accounting ----------
// Called weekly from businessWeek (see stepDay hook in ui.js / world-events).
// For every country:
//   revenue = corporate tax (flagship + extras) + income tax + VAT + trade tax
//   spending = pay people (wages) + services + military upkeep + debt interest
//   treasury += revenue - spending
//   if treasury < 0: debt += -treasury, treasury = 0, stability falls
// Home treasury is S.cash, so player spending (military, projects,
// diplomacy) already deducted from S.cash is counted once: we sync
// treasury from S.cash at the start of the home week, then add the net.
// ---------- bilateral trade ----------
// Each country trades with its neighbours (up to 5, biggest first) plus
// the 2 biggest economies it does not neighbour. A link's weekly volume
// is that pair's share of each side's total trade, averaged, so a
// country's total trade stays near its old aggregate (weekly GDP x 20%)
// while now being attributable to named partners. War between a pair
// zeroes their link; occupation of either side cuts it to 30%.
function buildTradeLinks() {
  const links = {};
  const playable = (W.playable || []).filter(a => S.countries[a]);
  const byGdp = [...playable].sort((a, b) => (S.countries[b].gdp || 0) - (S.countries[a].gdp || 0));
  const partnersOf = (a3) => {
    const k = W.byA3[a3]; if (!k) return [];
    const nbs = (k.nb || []).filter(n => S.countries[n] && W.byA3[n] && W.byA3[n].playable)
      .sort((x, y) => (S.countries[y].gdp || 0) - (S.countries[x].gdp || 0)).slice(0, 5);
    const top = byGdp.filter(b => b !== a3 && !nbs.includes(b)).slice(0, 2);
    return nbs.map(p => ({ p, w: 1.0 })).concat(top.map(p => ({ p, w: 0.6 })));
  };
  const atWar = (a, b) => (S.wars || []).some(w => (w.a === a && w.b === b) || (w.a === b && w.b === a));
  const alloc = {};
  for (const a3 of playable) {
    const cs = S.countries[a3], total = (cs.gdp * 1e6) / 52 * 0.2, ps = partnersOf(a3);
    let wsum = 0; const wts = ps.map(({ p, w }) => {
      const rel = (typeof getRel === 'function') ? getRel(a3, p) : 0;
      const rf = Math.max(0.2, Math.min(1.2, 0.2 + (rel + 100) / 200));
      const wv = w * rf; wsum += wv; return { p, wv };
    });
    alloc[a3] = {};
    for (const { p, wv } of wts) alloc[a3][p] = wsum > 0 ? total * wv / wsum : 0;
  }
  for (const a3 of playable) {
    for (const p in alloc[a3]) {
      const key = a3 < p ? a3 + '|' + p : p + '|' + a3;
      if (links[key]) continue;
      // Each side keeps its own allocation (volA for the sorted key's
      // first country, volB for the second), so a country's summed links
      // equal its own trade total exactly. The displayed pair volume is
      // the average of the two sides' flows.
      const ka = key.split('|')[0], kb = key.split('|')[1];
      let volA = alloc[ka][kb] || 0, volB = alloc[kb][ka] || 0;
      if (atWar(a3, p)) { volA = 0; volB = 0; }
      else if ((S.countries[a3].occ && S.countries[a3].occ !== a3) || (S.countries[p].occ && S.countries[p].occ !== p)) { volA *= 0.3; volB *= 0.3; }
      links[key] = { a: key.split('|')[0], b: key.split('|')[1], vol: Math.round((volA + volB) / 2), volA: Math.round(volA), volB: Math.round(volB) };
    }
  }
  return links;
}
// ---------- sector eras: businesses are born and die with their sector ----------
// Sectors carry optional from (first year) and to (last year new
// businesses form). Each week: announce newly arrived sectors once,
// form new businesses in sectors that arrived this year (one yearly
// pass, 50% per eligible country — no per-business news spam), decay
// businesses in dead sectors (-10%/yr), and close CPU businesses a
// decade past their sector's end (2%/week). Player majority-owned
// businesses are NEVER auto-closed; they decay but stay yours.
function sectorEraWeek() {
  if (!S || !S.leader || !S.extra) return;
  const yr = gameYear();
  S.sectorArrived = S.sectorArrived || {};
  // First run (old saves included): silently mark everything already
  // arrived, so a catch-up burst of arrival news never fires at once.
  if (S.sectorEraYear == null) {
    S.sectorEraYear = yr;
    LEADER_SECTORS.forEach(s => { if (s.from && s.from > 2026 && yr >= s.from) S.sectorArrived[s.n] = yr; });
  }
  LEADER_SECTORS.forEach(s => {
    if (s.from && s.from > 2026 && yr >= s.from && !S.sectorArrived[s.n]) {
      S.sectorArrived[s.n] = yr;
      if (typeof news === 'function') news('Economy', s.n + ' has arrived — new businesses are forming in it around the world.');
    }
  });
  // Formation: once, on the first week of a new year, in sectors that
  // arrived that year, only in countries whose pool includes them.
  // Diversification (same yearly pass): each country has a 25% chance to
  // gain ONE more business in any diversifiable sector it doesn't
  // already have — so CPU countries start with a few sectors and grow
  // more over time. Diversifiable = alive, and either established
  // (from <= 2026 or none) or past its 12-year rich-only window, so new
  // tech still spreads rich-first. Player companies are never touched.
  if (yr !== S.sectorEraYear) {
    S.sectorEraYear = yr;
    const arrived = LEADER_SECTORS.filter(s => s.from === yr).map(s => s.n);
    if (arrived.length) W.playable.forEach(k => {
      const pool = sectorPoolForCountry(k, yr);
      const fit = arrived.filter(n => pool.includes(n));
      if (!fit.length || rand() >= 0.5) return;
      const usedNames = new Set(Object.values(S.extra).map(b => b.name));
      const usedSyms = new Set(Object.values(S.extra).map(b => b.sym));
      const ex = makeExtraBusiness(k, pick(fit), usedNames, usedSyms, 'f' + ((S.extraSeq = (S.extraSeq || 1000) + 1)));
      S.extra[ex.id] = ex;
    });
    const usedNames = new Set(Object.values(S.extra).map(b => b.name));
    const usedSyms = new Set(Object.values(S.extra).map(b => b.sym));
    Object.values(S.co || {}).forEach(c => { usedNames.add(c.name); usedSyms.add(c.sym); });
    W.playable.forEach(k => {
      if (rand() >= 0.25) return;
      const present = new Set();
      if (S.co[k.a3]) present.add(S.co[k.a3].sector);
      Object.values(S.extra).forEach(b => { if (b.a3 === k.a3) present.add(b.sector); });
      const cands = LEADER_SECTORS.filter(s => (!s.from || s.from <= 2026 || yr >= s.from + 12) && (!s.to || s.to >= yr) && !present.has(s.n)).map(s => s.n);
      if (!cands.length) return;
      const ex = makeExtraBusiness(k, pick(cands), usedNames, usedSyms, 'f' + ((S.extraSeq = (S.extraSeq || 1000) + 1)));
      S.extra[ex.id] = ex;
      usedNames.add(ex.name); usedSyms.add(ex.sym);
    });
  }
  // Decay + closure for dead sectors.
  Object.values(S.extra).forEach(b => {
    const s = LEADER_SECTOR_BY_NAME[b.sector]; if (!s || !s.to || yr <= s.to) return;
    b.value = Math.max(1e5, b.value * (1 - 0.10 / 52));
    if (yr > s.to + 10) {
      const held = holdQtyX(b.id);
      if (held > (b.shares || 0) / 2) return;
      if (rand() < 0.02) { delete S.extra[b.id]; if (S.holdingsX) delete S.holdingsX[b.id]; if (S.holdingsXP) delete S.holdingsXP[b.id]; if (typeof news === 'function') news('Economy', b.name + ' has closed as ' + b.sector + ' fades away.'); }
    }
  });
}

function leaderWeek() {
  if (!S || !S.leader) return;
  sectorEraWeek();
  S.tradeLinks = buildTradeLinks();
  let homeRev = 0, homeSpend = 0, homeTrade = 0;
  for (const a3 in S.countries) {
    const cs = S.countries[a3], k = W.byA3[a3]; if (!k) continue;
    if (cs.treasury == null) cs.treasury = cs.gdp * 1e6 * 0.05;
    if (cs.debt == null) cs.debt = cs.gdp * 1e6 * 0.54;
    if (a3 === S.home) cs.treasury = S.cash;
    const gdpDollars = cs.gdp * 1e6;
    // Corporate tax: flagship week.tax + extras week.tax (computed below).
    let corpTax = 0;
    const flag = S.co[a3]; if (flag && flag.week) corpTax += flag.week.tax || 0;
    // Extras: simple weekly simulation, straight: profit -> tax -> treasury.
    // Their stock price moves with profit and sector volatility, and one
    // weekly close is pushed into their chart each week.
    if (S.extra) Object.values(S.extra).forEach(b => {
      if (b.a3 !== a3) return;
      ensureExtraStock(b);
      const info = LEADER_SECTOR_BY_NAME[b.sector] || { growth: 0.03, vol: 0.02 };
      // Weekly profit = value * annual return / 52, with sector growth and noise.
      b.profit = b.value * (0.06 + info.growth) / 52 * (0.7 + rand() * 0.6);
      b.revenue = Math.max(0, b.profit / 0.15);
      b.tax = Math.max(0, b.profit) * cs.tax;
      b.week = { profit: Math.round(b.profit), tax: Math.round(b.tax), rev: Math.round(b.revenue) };
      b.value = Math.max(1e5, b.value + b.profit * 0.5);
      b.price = Math.max(0.5, b.price * Math.exp(gauss() * (b.vol || 0.02) * 0.25 + (b.profit / Math.max(1, b.value)) * 0.5));
      // Quarterly earnings, same as flagships: accumulate the
      // quarter's profit; the report jumps the price on the surprise.
      b.qProfit = (b.qProfit || 0) + b.profit;
      if (typeof isQuarterEnd === 'function' && isQuarterEnd(S.day) && typeof extraQuarterlyReport === 'function') extraQuarterlyReport(b);
      if (typeof pushHist === 'function') pushHist(b.h, b.price, S.day, b.tradedToday || 0);
      b.tradedToday = 0;
      corpTax += b.tax;
    });
    const weeklyGdp = gdpDollars / 52;
    const incomeTax = weeklyGdp * 0.5 * (cs.incTax || 0.20);
    const vat = weeklyGdp * 0.6 * (cs.vat || 0.05);
    // Bilateral trade: this country's trade tax now comes from its named
    // trade links (see buildTradeLinks), not an aggregate. Trade balance
    // is NOT invented here: export and import values already flow through
    // business revenues; the government part of trade is the tax below.
    let tradeVol = 0; const myLinks = [];
    for (const key in S.tradeLinks) { const L = S.tradeLinks[key]; if (L.a === a3) { tradeVol += L.volA; myLinks.push({ p: L.b, vol: L.volA }); } else if (L.b === a3) { tradeVol += L.volB; myLinks.push({ p: L.a, vol: L.volB }); } }
    myLinks.sort((x, y) => y.vol - x.vol);
    const tradeTax = tradeVol * 0.04;
    const revenue = corpTax + incomeTax + vat + tradeTax;
    const payPeople = weeklyGdp * 0.08;
    const services = weeklyGdp * 0.06;
    let milUpkeep = 0;
    if (typeof MILITARY !== 'undefined') for (const br in MILITARY) { const lv = (cs.milLv && cs.milLv[br]) || 0; if (lv > 0) milUpkeep += MILITARY[br].cost[lv] * 0.02 / 52; }
    const rate = 0.04 + (cs.debt / Math.max(1, gdpDollars)) * 0.02;
    const interest = cs.debt * rate / 52;
    const spending = payPeople + services + milUpkeep + interest;
    const net = revenue - spending;
    cs.treasury += net;
    cs.lastWeek = { revenue: Math.round(revenue), corpTax: Math.round(corpTax), incomeTax: Math.round(incomeTax), vat: Math.round(vat), tradeTax: Math.round(tradeTax), tradeVol: Math.round(tradeVol), tradePartners: myLinks.slice(0, 8), payPeople: Math.round(payPeople), services: Math.round(services), milUpkeep: Math.round(milUpkeep), interest: Math.round(interest), spending: Math.round(spending), net: Math.round(net), debt: Math.round(cs.debt), treasury: Math.round(cs.treasury) };
    if (cs.treasury < 0) { const shortfall = -cs.treasury; cs.debt += shortfall; cs.treasury = spending * 0.5; cs.debt += spending * 0.5; cs.stab = clamp(cs.stab - 0.1, 0, 100); }
    else if (cs.treasury > gdpDollars * 0.1) cs.stab = clamp(cs.stab + 0.05, 0, 100);
    if (a3 === S.home) { S.cash = cs.treasury; homeRev = revenue; homeSpend = spending; }
  }
  S.week = S.week || {};
  S.week.leader = { revenue: Math.round(homeRev), spending: Math.round(homeSpend) };
}
