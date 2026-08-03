// Behaviour for the Achievements panel only.

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );

export default async function init(root) {
  const url = new URL('./achievements.json', import.meta.url);
  const items = await fetch(url).then((r) => r.json());

  // "sort" is a plain number so entries order correctly no matter how the
  // human-readable "year" is written ("Feb 2025", "2013 - 2018", and so on).
  items.sort((a, b) => (b.sort || 0) - (a.sort || 0));

  root.querySelector('[data-achievements]').innerHTML = items
    .map(
      (item) => `
      <li class="ach-item">
        <span class="ach-year">${escape(item.year)}</span>
        <span class="ach-body">
          <span class="ach-title">${escape(item.title)}</span>
          <span class="ach-issuer">${escape(item.issuer)}</span>
          ${item.note ? `<span class="ach-note">${escape(item.note)}</span>` : ''}
        </span>
        ${item.kind ? `<span class="ach-kind">${escape(item.kind)}</span>` : '<span></span>'}
      </li>`
    )
    .join('');
}
