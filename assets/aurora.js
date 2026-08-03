// A slow aurora, drawn on a canvas.
//
// Shared because two places want it: the hero uses a bright, close preset,
// and the page behind the content panels uses a dimmer, slower one. Keeping
// one implementation means the two never drift apart.
//
// Each field is a large radial gradient drifting on its own sine wave. They
// are composited with "lighter" so where they overlap they add, the way real
// light does, rather than one covering another.

// How the fields move. Colour comes from the theme, so the same drift can be
// worn in any scheme without duplicating the geometry.
const HERO_GEOM = [
  { x: 0.22, y: 0.30, r: 0.70, ax: 0.055, ay: 0.045, sx: 0.00013, sy: 0.00017, a: 0.52 },
  { x: 0.72, y: 0.24, r: 0.62, ax: 0.070, ay: 0.038, sx: 0.00009, sy: 0.00021, a: 0.46 },
  { x: 0.52, y: 0.78, r: 0.52, ax: 0.060, ay: 0.050, sx: 0.00016, sy: 0.00011, a: 0.34 },
  { x: 0.88, y: 0.72, r: 0.46, ax: 0.045, ay: 0.055, sx: 0.00019, sy: 0.00008, a: 0.28 },
];

// Larger, slower and dimmer. This one sits behind reading matter, so it has
// to stay well under the text rather than compete with it.
const PAGE_GEOM = [
  { x: 0.18, y: 0.18, r: 0.95, ax: 0.075, ay: 0.060, sx: 0.000052, sy: 0.000071, a: 0.46 },
  { x: 0.82, y: 0.42, r: 0.85, ax: 0.085, ay: 0.070, sx: 0.000064, sy: 0.000045, a: 0.40 },
  { x: 0.42, y: 0.78, r: 0.90, ax: 0.070, ay: 0.055, sx: 0.000041, sy: 0.000083, a: 0.34 },
  { x: 0.70, y: 0.92, r: 0.60, ax: 0.060, ay: 0.050, sx: 0.000075, sy: 0.000038, a: 0.16 },
];

const dress = (geom, hues) =>
  geom.map((g, i) => ({ ...g, hue: hues[i % hues.length] }));

export const heroFields = (hues) => dress(HERO_GEOM, hues);
export const pageFields = (hues) => dress(PAGE_GEOM, hues);

export function aurora(canvas, fields) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (!width || !height) return;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(time) {
    if (!width || !height) return;
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

  let frame = requestAnimationFrame(function loop(time) {
    if (running) draw(time);
    frame = requestAnimationFrame(loop);
  });
  let running = true;

  window.addEventListener('resize', () => {
    resize();
    draw(performance.now());
  });

  // Stop painting when the canvas is off screen or the tab is hidden. No
  // reason to burn battery on something nobody is looking at.
  new IntersectionObserver(
    ([entry]) => { running = entry.isIntersecting; },
    { threshold: 0 }
  ).observe(canvas);

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
  });
}
