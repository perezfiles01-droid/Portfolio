// Behaviour for the Background panel only.
// It fetches its own background.json and fills in background.html.
//
// The portrait lives in the Hero panel now, so this panel is education,
// experience, and the metadata beside it.

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );

export default async function init(root) {
  const url = new URL('./background.json', import.meta.url);
  const data = await fetch(url, { cache: 'no-cache' }).then((r) => r.json());

  root.querySelector('[data-role]').textContent = data.role;
  root.querySelector('[data-summary]').textContent = data.summary;

  root.querySelector('[data-meta]').innerHTML = (data.meta || [])
    .map((row) => `<li>${escape(row.field)} <span>${escape(row.value)}</span></li>`)
    .join('');

  // Each entry is a button followed by its own drawer, so opening one is a
  // single class change and the keyboard gets it for free.
  root.querySelector('[data-timeline]').innerHTML = data.timeline
    .map((entry, i) => {
      const id = `bg-drawer-${i}`;
      const tags = (entry.tags || [])
        .map((tag) => `<li>${escape(tag)}</li>`)
        .join('');

      return `
        <button class="bg-row" type="button" aria-expanded="false" aria-controls="${id}">
          <span class="bg-year">${escape(entry.period)}</span>
          <span class="bg-title">${escape(entry.role)}<span class="bg-org">${escape(entry.org)}</span></span>
          <span class="bg-plus" aria-hidden="true">+</span>
        </button>
        <div class="bg-drawer" id="${id}" data-open="false">
          <div>
            <p>${escape(entry.detail)}</p>
            ${tags ? `<ul class="bg-fields">${tags}</ul>` : ''}
          </div>
        </div>`;
    })
    .join('');

  root.querySelectorAll('.bg-row').forEach((row) => {
    row.addEventListener('click', () => {
      const open = row.getAttribute('aria-expanded') === 'true';
      row.setAttribute('aria-expanded', String(!open));
      row.nextElementSibling.dataset.open = String(!open);
    });
  });
}
