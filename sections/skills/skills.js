// Behaviour for the Skills panel only.

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );

export default async function init(root) {
  const url = new URL('./skills.json', import.meta.url);
  const data = await fetch(url, { cache: 'no-cache' }).then((r) => r.json());

  root.querySelector('[data-intro]').textContent = data.intro;

  root.querySelector('[data-groups]').innerHTML = data.groups
    .map(
      (group) => `
      <section class="skill-group">
        <h3 class="skill-name">${escape(group.name)}</h3>
        <ul class="skill-items">
          ${group.items.map((item) => `<li>${escape(item)}</li>`).join('')}
        </ul>
      </section>`
    )
    .join('');
}
