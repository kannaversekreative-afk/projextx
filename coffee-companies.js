// Coffee business stocks — STOCKS ONLY.
// These 12 companies are not added to cities, locations, or stores yet.
// Price is 0 for all 12 until Nicholas updates it.
// Coffee companies buy beans from Roast-Works Inc. or Beanz Inc. (link recorded here, not enforced anywhere yet).
const COFFEE_STOCKS = [
  { name: 'Bean Brew', sym: 'BNBR', kind: 'coffee', sector: 'Coffee Shops & Cafés', product: 'coffee', price: 0, suppliers: ['Roast-Works Inc.', 'Beanz Inc.'] },
  { name: 'Nook Shack', sym: 'NKSK', kind: 'coffee', sector: 'Coffee Shops & Cafés', product: 'coffee', price: 0, suppliers: ['Roast-Works Inc.', 'Beanz Inc.'] },
  { name: "Drip n' Dash", sym: 'DPDS', kind: 'coffee', sector: 'Coffee Shops & Cafés', product: 'coffee', price: 0, suppliers: ['Roast-Works Inc.', 'Beanz Inc.'] },
  { name: 'Metropolitan Brew', sym: 'MTBR', kind: 'coffee', sector: 'Coffee Shops & Cafés', product: 'coffee', price: 0, suppliers: ['Roast-Works Inc.', 'Beanz Inc.'] },
  { name: 'Velo Coffee', sym: 'VLCF', kind: 'coffee', sector: 'Coffee Shops & Cafés', product: 'coffee', price: 0, suppliers: ['Roast-Works Inc.', 'Beanz Inc.'] },
  { name: 'Coffee', sym: 'COFF', kind: 'coffee', sector: 'Coffee Shops & Cafés', product: 'coffee', price: 0, suppliers: ['Roast-Works Inc.', 'Beanz Inc.'] },
  { name: 'Canopy Cofee', sym: 'CNCF', kind: 'coffee', sector: 'Coffee Shops & Cafés', product: 'coffee', price: 0, suppliers: ['Roast-Works Inc.', 'Beanz Inc.'] },
  { name: 'BrüüD', sym: 'BRUD', kind: 'coffee', sector: 'Coffee Shops & Cafés', product: 'coffee', price: 0, suppliers: ['Roast-Works Inc.', 'Beanz Inc.'] },
  { name: 'Summit Brew', sym: 'SMBR', kind: 'coffee', sector: 'Coffee Shops & Cafés', product: 'coffee', price: 0, suppliers: ['Roast-Works Inc.', 'Beanz Inc.'] },
  { name: 'Morning Brew', sym: 'MRBR', kind: 'coffee', sector: 'Coffee Shops & Cafés', product: 'coffee', price: 0, suppliers: ['Roast-Works Inc.', 'Beanz Inc.'] },
  { name: 'Roast-Works Inc.', sym: 'RWKS', kind: 'bean', sector: 'Coffee & Tea Processing', product: 'bean', price: 0, suppliers: [] },
  { name: 'Beanz Inc.', sym: 'BNZZ', kind: 'bean', sector: 'Coffee & Tea Processing', product: 'bean', price: 0, suppliers: [] }
];
