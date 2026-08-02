// The stitcher.
//
// A browser only ever opens one page: index.html. It does not go looking
// through your folders. This file is what walks the list of sections below,
// pulls each one's markup, styling and behaviour out of its own folder, and
// assembles them into the single page the visitor sees.
//
// To add a new panel: create sections/<name>/ with <name>.html, <name>.css,
// <name>.js and <name>.json, add a slot in index.html, and add the name here.

const SECTIONS = ['background', 'projects', 'achievements'];

async function loadSection(name) {
  const slot = document.querySelector(`[data-section="${name}"]`);
  if (!slot) {
    console.warn(`No slot in index.html for section "${name}".`);
    return;
  }

  const base = `sections/${name}/${name}`;

  // 1. The markup. fetch asks the server for the file the same way the
  //    browser asked for index.html; .text() hands back its contents.
  const response = await fetch(`${base}.html`);
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
