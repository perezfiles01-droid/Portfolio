// Behaviour for the Contact panel only.

export default async function init(root) {
  const url = new URL('./contact.json', import.meta.url);
  const data = await fetch(url).then((r) => r.json());

  root.querySelector('[data-intro]').textContent = data.intro;
  root.querySelector('[data-location]').textContent = data.location;
  root.querySelector('[data-note]').textContent = data.note;

  const email = root.querySelector('[data-email]');
  email.textContent = data.email;
  email.href = `mailto:${data.email}`;

  // Copy to clipboard, with the button itself reporting what happened.
  const button = root.querySelector('[data-copy]');
  const label = root.querySelector('[data-copy-label]');
  let timer;

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(data.email);
      label.textContent = 'Copied';
    } catch {
      // Clipboard access can be refused, on older browsers or over plain
      // HTTP. Say so rather than pretending it worked.
      label.textContent = 'Press Ctrl+C';
    }
    button.dataset.done = 'true';
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = 'Copy';
      delete button.dataset.done;
    }, 2000);
  });
}
