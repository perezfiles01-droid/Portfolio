// Behaviour for the Projects panel only.

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );

export default async function init(root) {
  const url = new URL('./projects.json', import.meta.url);
  const projects = await fetch(url).then((r) => r.json());

  // Newest first, so adding an entry anywhere in the file still sorts right.
  projects.sort((a, b) => b.year - a.year);

  // ---- cards ----------------------------------------------------
  root.querySelector('[data-projects]').innerHTML = projects
    .map((project, i) => {
      const id = `proj-detail-${i}`;
      const tags = (project.tags || [])
        .map((tag) => `<li>${escape(tag)}</li>`)
        .join('');

      const link = project.link
        ? `<a class="proj-link" href="${escape(project.link)}" target="_blank" rel="noopener">Open <span aria-hidden="true">&rarr;</span></a>`
        : '';

      const detail = project.detail
        ? `<div class="proj-drawer" id="${id}" data-open="false"><div><p>${escape(project.detail)}</p>${link}</div></div>`
        : '';

      return `
        <article class="proj-card" data-tags="${escape((project.tags || []).join('|'))}">
          <button class="proj-head" type="button" aria-expanded="false"
                  ${project.detail ? `aria-controls="${id}"` : 'disabled'}>
            <span class="proj-title">${escape(project.title)}</span>
            <span class="proj-year">${escape(project.year)}</span>
          </button>
          <p class="proj-blurb">${escape(project.blurb)}</p>
          ${detail}
          <ul class="proj-tags">${tags}</ul>
        </article>`;
    })
    .join('');

  root.querySelectorAll('.proj-head:not([disabled])').forEach((head) => {
    head.addEventListener('click', () => {
      const open = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', String(!open));
      head.parentElement.querySelector('.proj-drawer').dataset.open = String(!open);
    });
  });

  // ---- tag filter -----------------------------------------------
  // The tags already live in projects.json, so the filter builds itself from
  // whatever is in there. Add a tag to a project and it appears here too.
  const allTags = [...new Set(projects.flatMap((p) => p.tags || []))].sort();
  const filters = root.querySelector('[data-filters]');
  const cards = [...root.querySelectorAll('.proj-card')];
  const empty = root.querySelector('[data-empty]');

  filters.innerHTML = ['All', ...allTags]
    .map(
      (tag, i) =>
        `<button class="proj-filter" type="button" data-tag="${escape(tag)}" aria-pressed="${i === 0}">${escape(tag)}</button>`
    )
    .join('');

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('.proj-filter');
    if (!button) return;

    const tag = button.dataset.tag;
    filters.querySelectorAll('.proj-filter').forEach((b) => {
      b.setAttribute('aria-pressed', String(b === button));
    });

    let shown = 0;
    cards.forEach((card) => {
      const match = tag === 'All' || card.dataset.tags.split('|').includes(tag);
      card.hidden = !match;
      if (match) shown += 1;
    });
    empty.hidden = shown > 0;
  });
}
