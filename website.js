'use strict';
// Website maker — the weekly loop, thought through.
// Every business gets a website, and every website starts random.
// Hidden inside each business is ONE ideal configuration — one exact
// combination of 6 choices that customers love. That combination gives
// exactly 5.0 stars. Every other combination gives less, in proportion
// to how many choices match: rating = 1 + 4 x (matches / 6).
// So 3 matches = 3.0 stars, 5 matches = 4.3 stars, 6 matches = 5.0 stars.
// 
// Why it works as a weekly game, not a one-click brute force:
//  - Changes are free, but they do NOT go live instantly. A change you
//    make this week is pending, and goes live next week, when the
//    customers react. That is the "adjusts every week" loop.
//  - Each week customers give small feedback: one complaint about a
//    choice that is still wrong, and one praise for a choice that is
//    right (if any). Complaints hint at the dimension ("the checkout
//    feels confusing") but never name the ideal choice. Praise tells
//    you which dimensions to stop touching.
//  - Rating is shown live, so you can see progress, but the only way
//    to learn is to try a change, wait a week, read the feedback.
//  - At 5.0 stars the site pays more: online revenue x1.3, versus
//    x0.82 at 1.0 star. At tier 0 (no website) there is no site, so
//    no multiplier — you need a website first, then you perfect it.
//  - AI companies get a random site and a random rating too, so the
//    web browser shows stars for everyone, but only your companies
//    get feedback and a maker.
var SITE_DIMS = [
  { id: 'layout', name: 'Layout', options: ['Shop first', 'Story first', 'Single page', 'Grid gallery', 'Minimal'] },
  { id: 'colour', name: 'Colour', options: ['Blue', 'Green', 'Orange', 'Purple', 'Dark', 'Cream'] },
  { id: 'hero', name: 'Hero', options: ['Big photo', 'Video', 'Product showcase', 'Founder story', 'Discount banner'] },
  { id: 'font', name: 'Font', options: ['Modern', 'Classic', 'Playful', 'Bold'] },
  { id: 'checkout', name: 'Checkout', options: ['One-click', 'Standard', 'Guest only', 'Membership'] },
  { id: 'section', name: 'First section', options: ['Reviews first', 'Deals first', 'About first', 'Blog first', 'FAQ first'] },
];
function siteRandomConfig() {
  const out = {};
  SITE_DIMS.forEach(d => { out[d.id] = d.options[Math.floor(Math.random() * d.options.length)]; });
  return out;
}
function ensureSite(c) {
  if (!c.web) c.web = { tier: 0, ads: {}, addons: {} };
  if (!c.web.site) {
    const ideal = siteRandomConfig();
    let current = siteRandomConfig(), tries = 0;
    // Start with at least 2 wrong choices, so there is work to do.
    while (tries++ < 20 && siteMatchCount(current, ideal) > 4) current = siteRandomConfig();
    c.web.site = { ideal, current, pending: null, feedback: [], fiveStar: false };
  }
  if (!c.web.site.feedback) c.web.site.feedback = [];
  return c.web.site;
}
function siteMatchCount(current, ideal) {
  if (!current || !ideal) return 0;
  return SITE_DIMS.reduce((n, d) => n + (current[d.id] === ideal[d.id] ? 1 : 0), 0);
}
function siteRating(c) {
  const site = ensureSite(c);
  return Math.round((1 + 4 * siteMatchCount(site.current, site.ideal) / SITE_DIMS.length) * 10) / 10;
}
function siteRatingFactor(c) {
  if (!c.web || !c.web.tier) return 1;
  return 0.7 + (siteRating(c) / 5) * 0.6;
}
var SITE_FEEDBACK = {
  layout: { bad: ['"I could not find the shop on the homepage, it felt buried."', '"The homepage is confusing, I left before buying."', '"Too much scrolling before I saw what you sell."'], good: ['"The homepage layout is so clear, I found everything in seconds."', '"Love how easy the homepage is to use."'] },
  colour: { bad: ['"The colours feel off for a shop like this."', '"The site colours put me off, they do not fit what you sell."'], good: ['"The colours look just right for this shop."', '"Love the look of the site, the colours suit it."'] },
  hero: { bad: ['"The top of the homepage did not grab me."', '"I did not know what you were offering from the top of the page."'], good: ['"The top of the homepage sold me straight away."', '"That opening section is perfect."'] },
  font: { bad: ['"The text is hard to read, it does not feel right."', '"The writing style on the site feels wrong for this shop."'], good: ['"The site reads beautifully, easy on the eyes."'] },
  checkout: { bad: ['"Checkout felt confusing, I nearly gave up."', '"Paying on the site was a hassle."', '"Checkout took too many steps."'], good: ['"Checkout was so smooth, I will buy again."', '"Paying took seconds, lovely."'] },
  section: { bad: ['"I wanted to see customer reviews / deals first, not this."', '"The first section below the hero was not what I was looking for."'], good: ['"The first thing I saw below the hero was exactly what I wanted."'] },
};
function websiteWeek() {
  if (!S || !S.co) return;
  Object.values(S.co).forEach(c => {
    if (!controlled(c.a3)) return;
    const site = ensureSite(c);
    // Pending changes go live this week.
    if (site.pending) { site.current = site.pending; site.pending = null; }
    const matches = SITE_DIMS.filter(d => site.current[d.id] === site.ideal[d.id]);
    const wrong = SITE_DIMS.filter(d => site.current[d.id] !== site.ideal[d.id]);
    const notes = [];
    if (wrong.length) {
      const d = wrong[Math.floor(Math.random() * wrong.length)];
      const texts = SITE_FEEDBACK[d.id].bad;
      notes.push({ text: texts[Math.floor(Math.random() * texts.length)], dim: d.id, good: false });
    }
    if (matches.length) {
      const d = matches[Math.floor(Math.random() * matches.length)];
      const texts = SITE_FEEDBACK[d.id].good;
      notes.push({ text: texts[Math.floor(Math.random() * texts.length)], dim: d.id, good: true });
    }
    if (!notes.length) notes.push({ text: '"No feedback this week."', dim: null, good: true });
    site.feedback = notes.concat(site.feedback).slice(0, 6);
    const rating = siteRating(c);
    if (rating >= 5 && !site.fiveStar) {
      site.fiveStar = true;
      news('Web', `${c.name} hit 5.0 stars on its website — customers love it.`, c.a3);
      mail('Website', `${c.name} is now 5 stars`, `Customers gave ${c.name} a perfect 5.0 star website rating. Online sales are now at their best.`);
    }
  });
}
function setSitePending(a3, dimId, value) {
  const c = S.co[a3]; if (!c) return 'Company not found.';
  const site = ensureSite(c);
  const dim = SITE_DIMS.find(d => d.id === dimId); if (!dim || !dim.options.includes(value)) return 'Bad choice.';
  if (!site.pending) site.pending = Object.assign({}, site.current);
  site.pending[dimId] = value;
  return null;
}
