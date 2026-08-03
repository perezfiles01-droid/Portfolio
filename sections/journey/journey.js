// Behaviour for the "Get to know me" panel only.
//
// A carousel of moments. Each slide is an image with a caption under it; a
// slide with no image yet shows a labelled placeholder instead, so the panel
// works from the moment it is added and the photos can arrive later.

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );

export default async function init(root) {
  const url = new URL('./journey.json', import.meta.url);
  const data = await fetch(url, { cache: 'no-cache' }).then((r) => r.json());

  root.querySelector('[data-intro]').textContent = data.intro;

  const track = root.querySelector('[data-track]');
  const dots = root.querySelector('[data-dots]');
  const slides = data.slides;

  track.innerHTML = slides
    .map((slide, i) => {
      const media = slide.image
        ? `<img class="jr-photo" src="${escape(slide.image)}" alt="${escape(slide.imageAlt || '')}" loading="lazy">`
        : `<div class="jr-placeholder" aria-hidden="true">
             <span>Image to come</span>
           </div>`;

      return `
        <figure class="jr-slide" id="jr-slide-${i}" role="tabpanel" aria-label="${escape(slide.title)}">
          <div class="jr-media">${media}</div>
          <figcaption class="jr-caption">
            <span class="jr-label">${escape(slide.label)}</span>
            <h3 class="jr-title">${escape(slide.title)}</h3>
            <p class="jr-text">${escape(slide.text)}</p>
          </figcaption>
        </figure>`;
    })
    .join('');

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
    if (event.key === 'ArrowLeft') { show(index - 1); event.preventDefault(); }
    if (event.key === 'ArrowRight') { show(index + 1); event.preventDefault(); }
  });

  show(0);
}
