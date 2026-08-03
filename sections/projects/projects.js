// Behaviour for the Projects panel only.
//
// Projects are grouped rather than filtered. With this few of them a tag
// filter was work for the reader without a payoff; the grouping says the same
// thing at a glance and needs no clicking.

import { icon } from '../../assets/icons.js';

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );

export default async function init(root) {
  const url = new URL('./projects.json', import.meta.url);
  const data = await fetch(url, { cache: 'no-cache' }).then((r) => r.json());

  root.querySelector('[data-intro]').textContent = data.intro;

  root.querySelector('[data-groups]').innerHTML = data.groups
    .map(
      (group, g) => `
      <section class="proj-group">
        <h3 class="proj-group-name">
          <span class="proj-group-icon">${icon(group.icon || 'briefcase')}</span>
          ${escape(group.name)}
          <span class="proj-group-count">${group.items.length}</span>
        </h3>

        <div class="proj-grid">
          ${group.items
            .map((project, i) => {
              const id = `proj-${g}-${i}`;
              return `
              <article class="proj-card">
                <button class="proj-head" type="button" aria-expanded="false" aria-controls="${id}">
                  <span class="proj-title">${escape(project.title)}</span>
                  <span class="proj-plus" aria-hidden="true">+</span>
                </button>
                <p class="proj-client">${escape(project.client)}</p>
                <p class="proj-blurb">${escape(project.blurb)}</p>
                <div class="proj-drawer" id="${id}" data-open="false">
                  <div><p>${escape(project.detail)}</p></div>
                </div>
                <p class="proj-role">${escape(project.period)}</p>
              </article>`;
            })
            .join('')}
        </div>
      </section>`
    )
    .join('');

  root.querySelectorAll('.proj-head').forEach((head) => {
    head.addEventListener('click', () => {
      const open = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', String(!open));
      head.parentElement.querySelector('.proj-drawer').dataset.open = String(!open);
    });
  });
}
