// Behaviour for the Achievements panel only.

export default async function init(root) {
  const url = new URL('./achievements.json', import.meta.url);
  const items = await fetch(url).then((r) => r.json());

  items.sort((a, b) => b.year - a.year);

  root.querySelector('[data-achievements]').innerHTML = items
    .map(
      (item) => `
      <li class="card ach-item">
        <div class="ach-main">
          <h3 class="ach-title">${item.title}</h3>
          <p class="ach-issuer">${item.issuer}</p>
          ${item.note ? `<p class="ach-note">${item.note}</p>` : ''}
        </div>
        <span class="ach-year">${item.year}</span>
      </li>`
    )
    .join('');
}
