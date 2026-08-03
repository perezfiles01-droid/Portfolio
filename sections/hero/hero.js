// Behaviour for the Hero panel only: the copy, the portrait, the button,
// and the aurora drifting behind the type.
//
// The aurora itself lives in assets/aurora.js because the page behind the
// content panels uses the same code with a dimmer preset.

import { aurora, HERO_FIELDS } from '../../assets/aurora.js';

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );

export default async function init(root) {
  const url = new URL('./hero.json', import.meta.url);
  const data = await fetch(url, { cache: 'no-cache' }).then((r) => r.json());

  root.querySelector('[data-eyebrow]').textContent = data.eyebrow;
  root.querySelector('[data-display]').textContent = data.display;
  root.querySelector('[data-name]').textContent = data.name;
  root.querySelector('[data-sub]').textContent = data.sub;
  root.querySelector('[data-hint]').textContent = data.scrollHint || '';
  root.querySelector('[data-cta-label]').textContent = data.cta.label;

  root.querySelector('[data-stats]').innerHTML = (data.stats || [])
    .map(
      (stat) => `
      <li>
        <span class="hero-stat-value">${escape(stat.value)}</span>
        <span class="hero-stat-label">${escape(stat.label)}</span>
      </li>`
    )
    .join('');

  // ---- portrait ---------------------------------------------------
  // Shown only once the file actually loads, so a missing image leaves a
  // clean single-column hero rather than a broken frame.
  if (data.photo) {
    const figure = root.querySelector('[data-portrait]');
    const img = root.querySelector('[data-photo]');
    img.alt = data.photoAlt || '';
    img.addEventListener('load', () => { figure.hidden = false; });
    img.src = data.photo;
  }

  // ---- the button -------------------------------------------------
  // An anchor would do this without JavaScript, but a button lets the
  // scroll target live in hero.json with the rest of the content.
  root.querySelector('[data-cta]').addEventListener('click', () => {
    document.getElementById(data.cta.target)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    });
  });

  aurora(root.querySelector('[data-aurora]'), HERO_FIELDS);
}
