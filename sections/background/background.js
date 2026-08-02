// Behaviour for the Background panel only.
// It fetches its own background.json and fills in background.html.

export default async function init(root) {
  const url = new URL('./background.json', import.meta.url);
  const data = await fetch(url).then((r) => r.json());

  root.querySelector('[data-summary]').textContent = data.summary;

  // The photo is optional. If "photo" is empty in background.json, or the file
  // is missing, the slot stays empty and the summary simply takes the full
  // width. Nothing breaks while you are still getting the picture ready.
  const photoSlot = root.querySelector('[data-photo]');
  if (data.photo) {
    const img = document.createElement('img');
    img.className = 'bg-photo';
    img.src = data.photo;
    img.alt = data.photoAlt || '';
    img.loading = 'lazy';
    img.addEventListener('error', () => photoSlot.remove());
    photoSlot.append(img);
  } else {
    photoSlot.remove();
  }

  root.querySelector('[data-timeline]').innerHTML = data.timeline
    .map(
      (entry) => `
      <li class="bg-entry">
        <div class="bg-period">${entry.period}</div>
        <div>
          <h3 class="bg-role">${entry.role}</h3>
          <p class="bg-org">${entry.org}</p>
          <p class="bg-detail">${entry.detail}</p>
        </div>
      </li>`
    )
    .join('');
}
