// Behaviour for the "Get to know me" panel only.
//
// A carousel of moments. Each slide carries one or more pictures; where a
// slide has several, they sit side by side and the one you point at or click
// grows while the others give way. Pictures are never cropped: they are fitted
// inside their frame, so what changes is how much room each one is given.
//
// A picture with no file yet shows a labelled held space, so the layout can be
// seen and agreed before the photographs arrive.

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );

// Accepts either the newer "images" array or a single legacy "image" string.
function picturesOf(slide) {
  if (Array.isArray(slide.images) && slide.images.length) return slide.images;
  if (slide.image) return [{ src: slide.image, alt: slide.imageAlt || '' }];
  return [{ src: '', alt: '' }];
}

function shotMarkup(picture, i, many) {
  const inner = picture.src
    ? `<img class="jr-img" src="${escape(picture.src)}" alt="${escape(picture.alt || '')}" loading="lazy">`
    : `<span class="jr-placeholder"><span>Image to come</span></span>`;

  // With one picture there is nothing to trade room with, so it is a plain
  // frame rather than a control that does nothing when pressed.
  return many
    ? `<button class="jr-shot" type="button" data-shot="${i}" aria-pressed="${i === 0}"
               aria-label="Enlarge: ${escape(picture.alt || `picture ${i + 1}`)}">${inner}</button>`
    : `<div class="jr-shot jr-solo">${inner}</div>`;
}

export default async function init(root) {
  const url = new URL('./journey.json', import.meta.url);
  const data = await fetch(url, { cache: 'no-cache' }).then((r) => r.json());

  const track = root.querySelector('[data-track]');
  const dots = root.querySelector('[data-dots]');
  const slides = data.slides;

  track.innerHTML = slides
    .map((slide, i) => {
      const pictures = picturesOf(slide);
      const many = pictures.length > 1;

      return `
        <figure class="jr-slide" id="jr-slide-${i}" role="tabpanel" aria-label="${escape(slide.title)}">
          <div class="jr-media${many ? ' jr-media-many' : ''}">
            ${pictures.map((p, n) => shotMarkup(p, n, many)).join('')}
          </div>
          <figcaption class="jr-caption">
            <span class="jr-label">${escape(slide.label)}</span>
            <h3 class="jr-title">${escape(slide.title)}</h3>
            <p class="jr-text">${escape(slide.text)}</p>
          </figcaption>
        </figure>`;
    })
    .join('');

  // Clicking a picture keeps it enlarged. Hovering only previews, and the
  // pressed one comes back when the pointer leaves.
  track.querySelectorAll('.jr-media-many').forEach((media) => {
    const shots = [...media.querySelectorAll('[data-shot]')];
    shots.forEach((shot) => {
      shot.addEventListener('click', () => {
        shots.forEach((s) => s.setAttribute('aria-pressed', String(s === shot)));
      });
    });
  });

  dots.innerHTML = slides
    .map(
      (slide, i) =>
        `<button class="jr-dot" type="button" role="tab" data-go="${i}"
                 aria-controls="jr-slide-${i}" aria-selected="${i === 0}"
                 aria-label="${escape(slide.title)}"></button>`
    )
    .join('');

  let index = 0;

  function show(next) {
    // wrap around at both ends, so the arrows never dead-end
    index = (next + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;

    dots.querySelectorAll('.jr-dot').forEach((dot, i) => {
      dot.setAttribute('aria-selected', String(i === index));
    });
    track.querySelectorAll('.jr-slide').forEach((slide, i) => {
      // only the visible slide should be reachable by keyboard or screen reader
      slide.inert = i !== index;
      slide.setAttribute('aria-hidden', String(i !== index));
    });
  }

  root.querySelector('[data-prev]').addEventListener('click', () => show(index - 1));
  root.querySelector('[data-next]').addEventListener('click', () => show(index + 1));

  dots.addEventListener('click', (event) => {
    const dot = event.target.closest('[data-go]');
    if (dot) show(Number(dot.dataset.go));
  });

  // Left and right arrows move through the slides once the carousel has focus.
  root.querySelector('.jr-stage').addEventListener('keydown', (event) => {
    if (event.target.closest('[data-shot]')) return;
    if (event.key === 'ArrowLeft') { show(index - 1); event.preventDefault(); }
    if (event.key === 'ArrowRight') { show(index + 1); event.preventDefault(); }
  });

  show(0);
}
