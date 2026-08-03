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

## What the site does

The look is a dark "records console": a deep blue-black ground, a single amber
signal colour, and monospace labels for anything that behaves like a field.
It commits to dark deliberately, so there is no light palette to keep in sync.

Beyond the structure above, a few behaviours are worth knowing about because
they are where a change is most likely to surprise you.

The console bar tracks your position. As you scroll, the tab for the section
you are looking at highlights itself. That is the scroll spy at the bottom of
`assets/app.js`, and it works off the `id` on each `<section>` in `index.html`
matching the `href` on each tab.

Timeline entries and project cards open on click. Each one is a button
followed by a drawer, and the drawer animates open by growing a CSS grid row
from `0fr` to `1fr`, which is the one reliable way to transition to a height
you do not know in advance.

The project tag filter builds itself. It reads every tag in
`sections/projects/projects.json` and makes a button for each, so adding a tag
to a project is all it takes to make that tag filterable.

Panels fade up as you reach them, and all motion is switched off for anyone
whose system asks for reduced motion.

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

## The admin

`admin.html` is a private editor for everything on the site. It shows a form
for each panel, and publishing writes the JSON files back to this repository
through GitHub's API. GitHub Pages rebuilds, and the site updates a minute
later. There is no server and nothing to pay for.

    https://perezfiles01-droid.github.io/Portfolio/admin.html

Reading and editing work without signing in. Publishing needs a token.

### Making the token

1. https://github.com/settings/personal-access-tokens/new
2. Token name: anything. Expiration: 90 days is sensible.
3. Repository access: **Only select repositories**, and pick `portfolio`.
4. Permissions: **Repository permissions > Contents > Read and write**. Nothing else.
5. Generate, copy it, paste it into the admin, and sign in.

The token is kept in that browser's local storage and is sent nowhere except
GitHub. Signing out erases it. It expires on its own, and a new one takes a
minute to make.

Treat it like a password. Anyone holding it can write to this repository,
which is why it is scoped to this one repository and to file contents only.
It cannot delete the repository, change settings, or touch anything else in
the account.

### What it can do

Every field on the site, plus adding, removing and reordering any repeating
item: carousel slides, timeline entries, projects, project groups, skills,
achievements. Pictures can be uploaded straight from the form, which puts the
file in `images/` and fills in the path.

A dot appears on a tab with unsaved changes, and the Publish button counts
them. Publishing writes one commit per changed file.

### If two edits collide

Publishing quotes the version of the file that was loaded. If the file
changed on GitHub in between, the write is refused and the admin says so,
rather than overwriting the other change. Reload and make the edit again.

### The admin is not a lock

The page is in a public repository, so anyone can open it. Without a token it
can only read what the site already shows publicly. Nothing sensitive lives
in it.

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
