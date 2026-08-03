// Colour schemes.
//
// A theme is a handful of custom properties plus the colours the aurora
// drifts in. Everything on the site draws through those properties, so
// changing them changes the whole page without touching any component.
//
// Applied as inline properties on the root element, which beat the defaults
// declared in assets/styles.css.

export const THEMES = [
  {
    id: 'console-amber',
    name: 'Console amber',
    note: 'Deep blue-black with a warm amber signal. The original.',
    tokens: {
      ground: '#080d11', panel: '#0d1721', ink: '#dbe4ea',
      'ink-dim': '#a9b8c1', muted: '#72858f', signal: '#e8a33d', line: '#1b262f',
    },
    auroraHero: [' 56,132,148', ' 46, 78,150', '232,163, 61', ' 30,120,120'],
    auroraPage: [' 46, 78,150', ' 56,132,148', ' 88, 62,140', '232,163, 61'],
  },
  {
    id: 'deep-teal',
    name: 'Deep teal',
    note: 'Cooler and calmer, with a sea-green signal.',
    tokens: {
      ground: '#05100f', panel: '#0b1c1c', ink: '#d8e8e5',
      'ink-dim': '#a4bdb9', muted: '#6d8a86', signal: '#4ecdb0', line: '#152b29',
    },
    auroraHero: [' 40,140,130', ' 30, 90,130', ' 78,205,176', ' 24,110,110'],
    auroraPage: [' 30, 90,130', ' 40,140,130', ' 46,120,160', ' 78,205,176'],
  },
  {
    id: 'violet-ink',
    name: 'Violet ink',
    note: 'Indigo ground with a soft violet signal. Quieter, more editorial.',
    tokens: {
      ground: '#0a0813', panel: '#161231', ink: '#e2ddf2',
      'ink-dim': '#b4adcd', muted: '#867ea3', signal: '#a78bfa', line: '#241d40',
    },
    auroraHero: [' 96, 74,180', ' 60, 66,170', '167,139,250', ' 74, 52,140'],
    auroraPage: [' 60, 66,170', ' 96, 74,180', ' 46, 90,170', '167,139,250'],
  },
  {
    id: 'ember',
    name: 'Ember',
    note: 'Near-black and warm, with a burnt orange signal.',
    tokens: {
      ground: '#0d0906', panel: '#1c1410', ink: '#efe3d8',
      'ink-dim': '#c2ab9c', muted: '#8d7767', signal: '#f0784a', line: '#2c1f18',
    },
    auroraHero: ['180, 70, 40', '140, 60, 90', '240,120, 74', '120, 50, 30'],
    auroraPage: ['140, 60, 90', '180, 70, 40', ' 90, 50,110', '240,120, 74'],
  },
  {
    id: 'forest',
    name: 'Forest',
    note: 'Dark green ground with a fresh signal. Natural rather than technical.',
    tokens: {
      ground: '#06100a', panel: '#0d1d14', ink: '#dcebe0',
      'ink-dim': '#a8c2ae', muted: '#6f8c77', signal: '#7fd67f', line: '#152c1e',
    },
    auroraHero: [' 46,130, 80', ' 30, 96,110', '127,214,127', ' 26,110, 70'],
    auroraPage: [' 30, 96,110', ' 46,130, 80', ' 70,140, 60', '127,214,127'],
  },
  {
    id: 'slate',
    name: 'Slate',
    note: 'Almost monochrome, with a cool steel signal. The most restrained.',
    tokens: {
      ground: '#0b0e12', panel: '#161b22', ink: '#dfe5ec',
      'ink-dim': '#adb7c2', muted: '#78838f', signal: '#8ab4f8', line: '#212831',
    },
    auroraHero: [' 70, 96,130', ' 54, 70,110', '138,180,248', ' 60, 84,116'],
    auroraPage: [' 54, 70,110', ' 70, 96,130', ' 84, 96,140', '138,180,248'],
  },
];

const DEFAULT = THEMES[0];

let active = DEFAULT;

export function getTheme(id) {
  return THEMES.find((t) => t.id === id) || DEFAULT;
}

export function getActive() {
  return active;
}

export function applyTheme(id) {
  active = getTheme(id);
  const root = document.documentElement;
  for (const [name, value] of Object.entries(active.tokens)) {
    root.style.setProperty(`--${name}`, value);
  }
  root.dataset.theme = active.id;
  return active;
}

// Reads the saved choice. Falls back to the default rather than failing, so a
// missing or malformed file can never leave the site uncoloured.
export async function loadTheme(url = 'theme.json') {
  try {
    const saved = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-cache' }).then((r) => r.json());
    return applyTheme(saved.id);
  } catch {
    return applyTheme(DEFAULT.id);
  }
}
