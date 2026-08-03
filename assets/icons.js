// A small set of line icons, shared by the panels that use them.
//
// Inline SVG rather than an icon font or a sprite file: there are only a
// handful, they inherit the surrounding colour through currentColor, and
// there is nothing extra for the browser to fetch.
//
// All are drawn on a 24 by 24 grid with a 1.6 stroke, so they sit together
// without one looking heavier than the rest.

const PATHS = {
  briefcase:
    '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
  cap:
    '<path d="M12 4 2 9l10 5 10-5-10-5Z"/><path d="M6 11v5c0 1.2 2.7 3 6 3s6-1.8 6-3v-5"/>',
  pin:
    '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  badge:
    '<path d="M12 3l2.1 4.3 4.7.7-3.4 3.3.8 4.7L12 13.8 7.8 16l.8-4.7L5.2 8l4.7-.7L12 3Z"/>',
  building:
    '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1"/>',
  seal:
    '<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 21l5-2.5L17 21l-1.5-7"/>',
  chart:
    '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  gear:
    '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v2.6M12 19.4V22M22 12h-2.6M4.6 12H2M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8M19.1 19.1l-1.8-1.8M6.7 6.7 4.9 4.9"/>',
  monitor:
    '<rect x="2.5" y="4" width="19" height="12.5" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/>',
  users:
    '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16.5 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.4A6.5 6.5 0 0 1 21.5 20"/>',
};

export function icon(name) {
  const path = PATHS[name];
  if (!path) return '';
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" focusable="false">${path}</svg>`;
}
