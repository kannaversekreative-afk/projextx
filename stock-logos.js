// Logos for ALL stocks — simple flat modern marks, one per sector group.
// A company row shows its group's mark in white on the company's own color,
// so every stock has a logo without a unique drawing per company.
// Coffee stocks already carry their own colored logo in COFFEE_STOCKS;
// stockLogoSVG returns that first, so they are not overwritten.
// Sector groups come from LEADER_SECTORS (leader.js): food, energy, mfg,
// tech, transport, service, finance.
const STOCK_GROUP_LOGOS = {
  food: '<svg viewBox="0 0 40 40"><circle cx="20" cy="21" r="11" fill="#fff"/><path d="M20 10c0-3 2-4 4-4" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
  energy: '<svg viewBox="0 0 40 40"><path d="M22 4 10 22h7l-3 14L30 18h-7z" fill="#fff"/></svg>',
  mfg: '<svg viewBox="0 0 40 40"><path d="M6 32V14l7 5V14l7 5V14l7 5V14l7 5v13z" fill="#fff"/><rect x="6" y="32" width="28" height="3" fill="#fff"/></svg>',
  tech: '<svg viewBox="0 0 40 40"><rect x="11" y="11" width="18" height="18" rx="3" fill="#fff"/><rect x="17" y="17" width="6" height="6" fill="#0f172a"/></svg>',
  transport: '<svg viewBox="0 0 40 40"><path d="M4 10 36 20 14 24l6 10-4 1-5-10L4 10z" fill="#fff"/></svg>',
  service: '<svg viewBox="0 0 40 40"><path d="M20 33 8 21a7 7 0 0 1 10-9 7 7 0 0 1 12 5c0 6-4 11-10 16z" fill="#fff"/></svg>',
  finance: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="#fff"/><circle cx="20" cy="20" r="6" fill="none" stroke="#0f172a" stroke-width="2.5"/></svg>'
};
function stockLogoSVG(c) {
  if (c && c.logo) return c.logo;
  try {
    const sec = (typeof SECTORS !== 'undefined' && c && c.sector) ? SECTORS[c.sector] : null;
    const g = sec && sec.g;
    if (g && STOCK_GROUP_LOGOS[g]) return STOCK_GROUP_LOGOS[g];
  } catch (e) {}
  return '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="11" fill="#fff"/></svg>';
}
