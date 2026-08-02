// Behaviour for the Projects panel only.

export default async function init(root) {
  const url = new URL('./projects.json', import.meta.url);
  const projects = await fetch(url).then((r) => r.json());

  // Newest first, so adding an entry anywhere in the file still sorts right.
  projects.sort((a, b) => b.year - a.year);

  root.querySelector('[data-projects]').innerHTML = projects
    .map((project) => {
      const tags = (project.tags || [])
        .map((tag) => `<span class="proj-tag">${tag}</span>`)
        .join('');

      const title = project.link
        ? `<a href="${project.link}" target="_blank" rel="noopener">${project.title}</a>`
        : project.title;

      return `
        <article class="card proj-card">
          <div class="proj-head">
            <h3 class="proj-title">${title}</h3>
            <span class="proj-year">${project.year}</span>
          </div>
          <p class="proj-blurb">${project.blurb}</p>
          <div class="proj-tags">${tags}</div>
        </article>`;
    })
    .join('');
}
