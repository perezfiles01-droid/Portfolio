// Behaviour for the Hero panel only: the copy, the portrait, the button,
// and the slow aurora drifting behind everything.

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );

export default async function init(root) {
  const url = new URL('./hero.json', import.meta.url);
  const data = await fetch(url).then((r) => r.json());

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

  aurora(root.querySelector('[data-aurora]'));
}

// ---------------------------------------------------------------------
// Aurora: a handful of large, very soft colour fields drifting slowly
// past each other. Drawn on a canvas because gradients this large are
// cheaper to move here than as blurred DOM elements, and it keeps the
// whole effect inside this one folder.
// ---------------------------------------------------------------------
function aurora(canvas) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Deliberately few, deliberately desaturated. An aurora that shouts
  // stops reading as professional.
  const fields = [
    { hue: '56, 132, 148', x: 0.22, y: 0.30, r: 0.70, ax: 0.055, ay: 0.045, sx: 0.00013, sy: 0.00017, a: 0.52 },
    { hue: '46,  78, 150', x: 0.72, y: 0.24, r: 0.62, ax: 0.070, ay: 0.038, sx: 0.00009, sy: 0.00021, a: 0.46 },
    { hue: '232,163,  61', x: 0.52, y: 0.78, r: 0.52, ax: 0.060, ay: 0.050, sx: 0.00016, sy: 0.00011, a: 0.22 },
    { hue: '30, 120, 120', x: 0.88, y: 0.72, r: 0.46, ax: 0.045, ay: 0.055, sx: 0.00019, sy: 0.00008, a: 0.28 },
  ];

  let width = 0;
  let height = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    const reach = Math.max(width, height);

    for (const f of fields) {
      const cx = (f.x + Math.sin(time * f.sx) * f.ax) * width;
      const cy = (f.y + Math.cos(time * f.sy) * f.ay) * height;
      const r = f.r * reach;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(${f.hue}, ${f.a})`);
      grad.addColorStop(0.55, `rgba(${f.hue}, ${f.a * 0.32})`);
      grad.addColorStop(1, `rgba(${f.hue}, 0)`);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  resize();
  draw(0);

  if (still) return;

  let frame = 0;
  let running = true;

  const loop = (time) => {
    if (running) draw(time);
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);

  window.addEventListener('resize', () => {
    resize();
    draw(performance.now());
  });

  // Stop painting once the hero has scrolled away, and when the tab is
  // hidden. No reason to burn battery on something nobody is looking at.
  new IntersectionObserver(
    ([entry]) => { running = entry.isIntersecting; },
    { threshold: 0 }
  ).observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else frame = requestAnimationFrame(loop);
  });
}
