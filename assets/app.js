// The stitcher, plus the two page-wide behaviours.
//
// A browser only ever opens one page: index.html. It does not go looking
// through your folders. This file walks the list of sections below, pulls
// each one's markup, styling and behaviour out of its own folder, and
// assembles them into the single page the visitor sees.
//
// To add a new panel: create sections/<name>/ with <name>.html, <name>.css,
// <name>.js and <name>.json, add a slot in index.html, and add the name here.

import { aurora, PAGE_FIELDS } from './aurora.js';

const SECTIONS = ['hero', 'background', 'projects', 'skills', 'achievements', 'contact'];

async function loadSection(name) {
  const slot = document.querySelector(`[data-section="${name}"]`);
  if (!slot) {
    console.warn(`No slot in index.html for section "${name}".`);
    return;
  }

  const base = `sections/${name}/${name}`;

  // 1. The markup. fetch asks the server for the file the same way the
  //    browser asked for index.html; .text() hands back its contents.
  const response = await fetch(`${base}.html`, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`${base}.html returned ${response.status}`);
  slot.innerHTML = await response.text();

  // 2. The styling that only this panel uses.
  document.head.insertAdjacentHTML(
    'beforeend',
    `<link rel="stylesheet" href="${base}.css">`
  );

  // 3. The behaviour. The module fetches its own .json and fills in the
  //    markup, so everything the panel needs stays inside its own folder.
  const url = new URL(`../${base}.js`, import.meta.url);
  const module = await import(url);
  if (typeof module.default === 'function') {
    await module.default(slot);
  }
}

// Sections load in parallel, and one broken panel does not take the rest of
// the page down with it.
await Promise.all(
  SECTIONS.map((name) =>
    loadSection(name).catch((error) => {
      console.error(`Section "${name}" failed to load:`, error);
      const slot = document.querySelector(`[data-section="${name}"]`);
      if (slot) slot.innerHTML = `<p class="load-error">Could not load the ${name} section.</p>`;
    })
  )
);

// ---------------------------------------------------------------
// Scroll spy: the console bar highlights whichever section you are
// looking at. Clicking a tab still just jumps to that anchor, so the
// nav keeps working if this never runs.
// ---------------------------------------------------------------

const tabs = new Map(
  [...document.querySelectorAll('.tab')].map((tab) => [tab.hash.slice(1), tab])
);

function markCurrent(id) {
  tabs.forEach((tab, key) => {
    if (key === id) tab.setAttribute('aria-current', 'true');
    else tab.removeAttribute('aria-current');
  });
}

const spy = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (visible) markCurrent(visible.target.id);
  },
  // the band sits just under the sticky bar, so a section counts as
  // "current" once its top edge passes the bar
  { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
);

// ---------------------------------------------------------------
// Reveal on scroll. The class is added here rather than in the HTML so
// nothing is ever hidden by a script that failed to load.
// ---------------------------------------------------------------

const reveal = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  },
  { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
);

document.querySelectorAll('[data-section]').forEach((section) => {
  spy.observe(section);
  // the hero is the first thing on screen, so it should not fade in
  if (section.hasAttribute('data-no-reveal')) return;
  section.classList.add('reveal');
  reveal.observe(section);
});

// The ambient layer behind the content panels, dimmer and slower than the
// hero's so it stays well under the reading matter.
aurora(document.querySelector('[data-page-aurora]'), PAGE_FIELDS);
