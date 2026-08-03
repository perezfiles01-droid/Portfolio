// Talking to GitHub.
//
// Everything the admin saves goes through GitHub's contents API: read a file
// to learn its current sha, then write the new contents quoting that sha.
// The sha is how GitHub knows you edited the version you actually saw. If
// somebody changed the file in between, the write is refused rather than
// quietly overwriting their work.

const OWNER = 'perezfiles01-droid';
const REPO = 'portfolio';
const BRANCH = 'main';
const API = 'https://api.github.com';

const TOKEN_KEY = 'portfolio-admin-token';

export const token = {
  get: () => localStorage.getItem(TOKEN_KEY) || '',
  set: (value) => localStorage.setItem(TOKEN_KEY, value.trim()),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

function headers() {
  return {
    Authorization: `Bearer ${token.get()}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function call(path, options = {}) {
  const response = await fetch(`${API}${path}`, { ...options, headers: headers() });

  if (response.status === 401) throw new Error('That token was refused. Check it, or make a new one.');
  if (response.status === 403) throw new Error('That token is not allowed to write to this repository.');
  if (response.status === 404 && options.method !== 'PUT') return null;
  if (response.status === 409) {
    throw new Error('This file changed on GitHub since you loaded it. Reload the admin and make the change again.');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `GitHub returned ${response.status}.`);
  }
  return response.json();
}

// btoa only handles single byte values, so text is encoded to bytes first.
// Without this an accent or a dash outside Latin-1 throws.
function toBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export async function whoAmI() {
  const user = await call('/user');
  return user && user.login;
}

async function shaOf(path) {
  const file = await call(`/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`);
  return file ? file.sha : undefined;
}

export async function putText(path, text, message) {
  const bytes = new TextEncoder().encode(text);
  return call(`/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: toBase64(bytes),
      sha: await shaOf(path),
      branch: BRANCH,
    }),
  });
}

export async function putBinary(path, arrayBuffer, message) {
  return call(`/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: toBase64(new Uint8Array(arrayBuffer)),
      sha: await shaOf(path),
      branch: BRANCH,
    }),
  });
}

export const repo = { OWNER, REPO, BRANCH };
