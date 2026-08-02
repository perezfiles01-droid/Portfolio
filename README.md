# Portfolio

A public portfolio site served straight from this repository by GitHub Pages.
No build step, no framework, no server. Every panel of the site lives in its
own folder, so changing one part never means touching the others.

## How it is put together

A browser only ever opens one file: `index.html`. It does not go looking
through the folders here on its own. `assets/app.js` is the piece that walks a
list of section names, pulls each section's markup, styling, and data out of
its own folder, and assembles the single page a visitor sees.

```
index.html              the shell: header, nav, and one empty slot per panel
assets/
  styles.css            colors, fonts, spacing, header and footer
  app.js                the stitcher that loads every section
sections/
  background/
    background.html     markup for this panel
    background.css      styling used only by this panel
    background.js       fills the markup in from the json
    background.json     the content itself
  projects/             same four files
  achievements/         same four files
images/                 pictures referenced by any panel
```

## Everyday edits

Changing content is the common case, and it only ever means editing one JSON
file. To add a project, add an entry to `sections/projects/projects.json`.
Commit, push, and the live site updates in about a minute. The HTML, the CSS,
and `app.js` stay untouched.

Changing how one panel looks means editing that panel's `.css` file. Changing
the site-wide look, such as the color palette or the nav bar, means editing
`assets/styles.css` or `index.html`, because things shared by everything have
to live somewhere.

## Adding a whole new panel

Say you want a Certifications panel.

1. Create `sections/certifications/` with `certifications.html`,
   `certifications.css`, `certifications.js`, and `certifications.json`.
   Copying the `achievements` folder and renaming is the fastest start.
2. Add a slot in `index.html`:
   `<section id="certifications" data-section="certifications"></section>`
3. Add `'certifications'` to the `SECTIONS` list at the top of `assets/app.js`.

Nothing else changes. Reordering panels means reordering the slots in
`index.html`. Deleting a panel means deleting its folder and its slot.

## Running it locally

Opening `index.html` by double-clicking it will show blank panels. Browsers
refuse to let a page read local files, and `fetch` fails without a clear
error. Serve the folder instead:

```
python3 -m http.server
```

Then visit http://localhost:8000.

## Publishing

This repository is published with GitHub Pages from the `main` branch, root
folder. Settings > Pages if you ever need to change it.

Pages caches aggressively, so after pushing a change do a hard refresh
(Ctrl+Shift+R, or Cmd+Shift+R) before assuming something is broken.

## What this setup does not do

The site is read-only. Data lives in files in this repository, and only
someone who can push to the repository can change it. That covers a portfolio
completely. Anything visitors write, such as a contact form that stores
messages, needs a service outside GitHub, because GitHub Pages hands out files
and does not run code of its own.
