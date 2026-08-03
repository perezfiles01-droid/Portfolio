// The admin.
//
// Reads the same JSON files the site reads, builds a form from the schema,
// and writes the edited files back to GitHub. The site itself is untouched:
// it keeps reading plain files, so if this admin ever breaks, the portfolio
// carries on and the files can still be edited by hand.

import { FILES } from './schema.js?v=3';
import { token, whoAmI, putText, putBinary, repo } from './github.js?v=3';

const $ = (sel, root = document) => root.querySelector(sel);

const state = {
  data: {},      // id -> parsed json
  dirty: new Set(),
  current: FILES[0].id,
};

// ---------------------------------------------------------------- helpers

// "cta.label" reaches into nested objects, so the schema can name a field
// that lives one level down without needing a group for it.
const getIn = (obj, path) =>
  path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

const setIn = (obj, path, value) => {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k) => (o[k] = o[k] || {}), obj);
  target[last] = value;
};

function markDirty(id) {
  state.dirty.add(id);
  render();
}

function blankFrom(fields) {
  const item = {};
  for (const f of fields) {
    if (f.type === 'list') item[f.key] = [];
    else if (f.type === 'strings') item[f.key] = [];
    else item[f.key] = '';
  }
  return item;
}

// ---------------------------------------------------------------- fields

function fieldRow(field, value, onChange) {
  const wrap = document.createElement('label');
  wrap.className = 'field';

  const label = document.createElement('span');
  label.className = 'field-label';
  label.textContent = field.label;
  wrap.append(label);

  let input;

  if (field.type === 'textarea') {
    input = document.createElement('textarea');
    input.rows = 4;
    input.value = value ?? '';
    input.addEventListener('input', () => onChange(input.value));
  } else if (field.type === 'select') {
    input = document.createElement('select');
    for (const option of field.options) {
      const o = document.createElement('option');
      o.value = option;
      o.textContent = option;
      input.append(o);
    }
    input.value = value ?? field.options[0];
    input.addEventListener('change', () => onChange(input.value));
  } else if (field.type === 'strings') {
    input = document.createElement('textarea');
    input.rows = Math.max(3, (value || []).length + 1);
    input.value = (value || []).join('\n');
    input.placeholder = 'One per line';
    input.addEventListener('input', () =>
      onChange(input.value.split('\n').map((s) => s.trim()).filter(Boolean))
    );
  } else if (field.type === 'image') {
    return imageField(field, value, onChange);
  } else {
    input = document.createElement('input');
    input.type = 'text';
    input.value = value ?? '';
    input.addEventListener('input', () => onChange(input.value));
  }

  wrap.append(input);
  if (field.help) {
    const help = document.createElement('span');
    help.className = 'field-help';
    help.textContent = field.help;
    wrap.append(help);
  }
  return wrap;
}

function imageField(field, value, onChange) {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  wrap.innerHTML = `<span class="field-label">${field.label}</span>`;

  const row = document.createElement('div');
  row.className = 'image-row';

  const preview = document.createElement('div');
  preview.className = 'image-preview';
  const setPreview = (path) => {
    preview.innerHTML = path
      ? `<img src="${path}" alt="">`
      : '<span>none</span>';
  };
  setPreview(value);

  const input = document.createElement('input');
  input.type = 'text';
  input.value = value ?? '';
  input.placeholder = 'images/example.jpg';
  input.addEventListener('input', () => { onChange(input.value); setPreview(input.value); });

  const pick = document.createElement('input');
  pick.type = 'file';
  pick.accept = 'image/*';
  pick.hidden = true;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn small';
  button.textContent = 'Upload';
  button.addEventListener('click', () => pick.click());

  pick.addEventListener('change', async () => {
    const file = pick.files[0];
    if (!file) return;
    if (!token.get()) return say('Sign in first, then upload.', true);

    // Named after the file itself, lowercased and with spaces removed, so the
    // path is predictable and cannot break on a capital letter later.
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
    const path = `images/${safe}`;

    button.disabled = true;
    button.textContent = 'Uploading';
    try {
      await putBinary(path, await file.arrayBuffer(), `Add ${path} from the admin`);
      input.value = path;
      onChange(path);
      setPreview(path);
      say(`Uploaded ${path}.`);
    } catch (error) {
      say(error.message, true);
    } finally {
      button.disabled = false;
      button.textContent = 'Upload';
      pick.value = '';
    }
  });

  row.append(input, button, pick);
  wrap.append(row, preview);
  if (field.help) {
    const help = document.createElement('span');
    help.className = 'field-help';
    help.textContent = field.help;
    wrap.append(help);
  }
  return wrap;
}

// ---------------------------------------------------------------- lists

function listBlock(field, array, fileId) {
  const box = document.createElement('div');
  box.className = 'list';

  const head = document.createElement('div');
  head.className = 'list-head';
  head.innerHTML = `<h3>${field.label}</h3>`;

  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'btn small';
  add.textContent = field.addLabel || 'Add';
  add.addEventListener('click', () => {
    array.push(blankFrom(field.fields));
    markDirty(fileId);
  });
  head.append(add);
  box.append(head);

  if (field.help) {
    const help = document.createElement('p');
    help.className = 'field-help';
    help.textContent = field.help;
    box.append(help);
  }

  array.forEach((item, index) => {
    const card = document.createElement('details');
    card.className = 'item';
    card.open = false;

    const summary = document.createElement('summary');
    summary.innerHTML = `<span class="item-title">${
      (field.titleKey && item[field.titleKey]) || `Item ${index + 1}`
    }</span>`;

    const tools = document.createElement('span');
    tools.className = 'item-tools';

    const move = (to) => {
      if (to < 0 || to >= array.length) return;
      [array[index], array[to]] = [array[to], array[index]];
      markDirty(fileId);
    };

    for (const [text, title, action] of [
      ['↑', 'Move up', () => move(index - 1)],
      ['↓', 'Move down', () => move(index + 1)],
      ['×', 'Remove', () => {
        if (!confirm('Remove this item?')) return;
        array.splice(index, 1);
        markDirty(fileId);
      }],
    ]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'icon-btn';
      b.textContent = text;
      b.title = title;
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); action(); });
      tools.append(b);
    }

    summary.append(tools);
    card.append(summary);

    const body = document.createElement('div');
    body.className = 'item-body';
    for (const sub of field.fields) {
      body.append(renderField(sub, item, fileId));
    }
    card.append(body);
    box.append(card);
  });

  if (!array.length) {
    const empty = document.createElement('p');
    empty.className = 'field-help';
    empty.textContent = 'Nothing here yet.';
    box.append(empty);
  }

  return box;
}

function renderField(field, holder, fileId) {
  if (field.type === 'list') {
    holder[field.key] = holder[field.key] || [];
    return listBlock(field, holder[field.key], fileId);
  }
  return fieldRow(field, getIn(holder, field.key), (value) => {
    setIn(holder, field.key, value);
    state.dirty.add(fileId);
    updateDirtyMarks();
  });
}

// ---------------------------------------------------------------- render

function updateDirtyMarks() {
  document.querySelectorAll('[data-tab-id]').forEach((tab) => {
    tab.classList.toggle('dirty', state.dirty.has(tab.dataset.tabId));
  });
  const count = state.dirty.size;
  $('#save').textContent = count ? `Publish ${count} change${count > 1 ? 's' : ''}` : 'Publish';
  $('#save').disabled = count === 0 || !token.get();
}

function render() {
  const nav = $('#tabs');
  nav.innerHTML = '';
  for (const file of FILES) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tab' + (file.id === state.current ? ' on' : '');
    tab.dataset.tabId = file.id;
    tab.textContent = file.label;
    tab.addEventListener('click', () => { state.current = file.id; render(); });
    nav.append(tab);
  }

  const file = FILES.find((f) => f.id === state.current);
  const data = state.data[file.id];
  const form = $('#form');
  form.innerHTML = '';

  if (!data) {
    form.innerHTML = '<p class="field-help">Loading…</p>';
    return;
  }

  if (file.help) {
    const help = document.createElement('p');
    help.className = 'panel-help';
    help.textContent = file.help;
    form.append(help);
  }

  if (file.root === 'array') {
    form.append(listBlock({ ...file.list, type: 'list' }, data, file.id));
  } else {
    for (const field of file.fields) form.append(renderField(field, data, file.id));
  }

  updateDirtyMarks();
}

// ---------------------------------------------------------------- saving

function say(message, bad = false) {
  const box = $('#say');
  box.textContent = message;
  box.className = 'say' + (bad ? ' bad' : ' good');
  box.hidden = false;
  clearTimeout(say.timer);
  say.timer = setTimeout(() => { box.hidden = true; }, 6000);
}

async function publish() {
  const ids = [...state.dirty];
  if (!ids.length) return;

  const button = $('#save');
  button.disabled = true;
  button.textContent = 'Publishing…';

  try {
    for (const id of ids) {
      const file = FILES.find((f) => f.id === id);
      const text = JSON.stringify(state.data[id], null, 2) + '\n';
      await putText(file.path, text, `Update ${file.label} from the admin`);
      state.dirty.delete(id);
    }
    say('Published. The site updates in about a minute.');
  } catch (error) {
    say(error.message, true);
  } finally {
    updateDirtyMarks();
  }
}

// ---------------------------------------------------------------- start

async function loadAll() {
  // Draw the shell first. The tabs and the sign in panel do not depend on any
  // content, so they should never be held hostage by a file that fails to
  // arrive. Before this, one bad fetch meant a completely blank page and
  // nothing to tell you why.
  render();

  const failed = [];
  await Promise.all(
    FILES.map(async (file) => {
      try {
      // Read straight from the site rather than through the API, so the forms
      // fill in before you sign in and a bad token cannot leave you staring
      // at an empty screen.
      // Relative to admin.html, which lives in the repo root beside sections/.
      // Do not add "../" here: on GitHub Pages the site is served from a
      // subfolder, and climbing out of it lands outside the site entirely.
      const response = await fetch(`${file.path}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`${file.path} returned ${response.status}`);
      state.data[file.id] = await response.json();
      } catch (error) {
        console.error(error);
        failed.push(file.label);
      }
    })
  );
  render();
  if (failed.length) say(`Could not load: ${failed.join(', ')}.`, true);
}

async function signIn(value) {
  token.set(value);
  try {
    const login = await whoAmI();
    $('#who').textContent = `Signed in as ${login}`;
    document.body.dataset.auth = 'yes';
    updateDirtyMarks();
    say(`Signed in as ${login}.`);
  } catch (error) {
    token.clear();
    say(error.message, true);
  }
}

$('#signin').addEventListener('submit', (event) => {
  event.preventDefault();
  const value = $('#token').value.trim();
  if (value) signIn(value);
  $('#token').value = '';
});

$('#signout').addEventListener('click', () => {
  token.clear();
  document.body.dataset.auth = 'no';
  $('#who').textContent = '';
  updateDirtyMarks();
});

$('#save').addEventListener('click', publish);

$('#reload').addEventListener('click', async () => {
  if (state.dirty.size && !confirm('Discard unsaved changes and reload?')) return;
  state.dirty.clear();
  await loadAll();
  say('Reloaded from the site.');
});

window.addEventListener('beforeunload', (event) => {
  if (state.dirty.size) event.preventDefault();
});

$('#view').href = `https://${repo.OWNER}.github.io/Portfolio/`;

try {
  await loadAll();
} catch (error) {
  console.error(error);
  render();
  say(`Could not load the content: ${error.message}`, true);
}

if (token.get()) signIn(token.get());
