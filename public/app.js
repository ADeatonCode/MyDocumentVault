const state = { token: localStorage.getItem('token') || '', user: null };

const authSection = document.getElementById('authSection');
const vaultSection = document.getElementById('vaultSection');
const logoutBtn = document.getElementById('logoutBtn');
const authForm = document.getElementById('authForm');
const uploadForm = document.getElementById('uploadForm');
const documentList = document.getElementById('documentList');

function toggleViews() {
  authSection.classList.toggle('hidden', !!state.token);
  vaultSection.classList.toggle('hidden', !state.token);
  logoutBtn.classList.toggle('hidden', !state.token);
}

async function loadUser() {
  if (!state.token) {
    toggleViews();
    return;
  }

  try {
    const response = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${state.token}` }
    });

    if (!response.ok) {
      throw new Error('Unauthorized');
    }

    state.user = await response.json();
    toggleViews();
    loadDocuments();
  } catch (error) {
    localStorage.removeItem('token');
    state.token = '';
    state.user = null;
    toggleViews();
  }
}

async function handleAuth(action) {
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const payload = action === 'register' ? { username, email, password } : { email, password };

  const response = await fetch(`/api/auth/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    alert(data.message || 'Authentication failed');
    return;
  }

  localStorage.setItem('token', data.token);
  state.token = data.token;
  state.user = data.user;
  toggleViews();
  loadDocuments();
}

async function loadDocuments() {
  if (!state.token) return;

  const response = await fetch('/api/documents', {
    headers: { Authorization: `Bearer ${state.token}` }
  });

  const documents = await response.json();
  if (!response.ok) return;

  documentList.innerHTML = documents.length
    ? documents.map((doc) => `
        <div class="document-item">
          <div>
            <strong>${doc.title}</strong>
            <div>${doc.originalName}</div>
          </div>
          <div>
            <a href="/uploads/${doc.filename}" target="_blank">Open</a>
            <button class="secondary" data-id="${doc._id}" onclick="deleteDocument('${doc._id}')">Delete</button>
          </div>
        </div>
      `).join('')
    : '<p>No documents yet.</p>';
}

async function deleteDocument(id) {
  const response = await fetch(`/api/documents/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${state.token}` }
  });

  if (response.ok) {
    loadDocuments();
  }
}

window.deleteDocument = deleteDocument;

uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData();
  formData.append('title', document.getElementById('docTitle').value.trim());
  formData.append('description', document.getElementById('docDescription').value.trim());
  formData.append('file', document.getElementById('docFile').files[0]);

  const response = await fetch('/api/documents', {
    method: 'POST',
    headers: { Authorization: `Bearer ${state.token}` },
    body: formData
  });

  if (response.ok) {
    uploadForm.reset();
    loadDocuments();
  } else {
    const data = await response.json();
    alert(data.message || 'Upload failed');
  }
});

document.getElementById('registerBtn').addEventListener('click', () => handleAuth('register'));
document.getElementById('loginBtn').addEventListener('click', () => handleAuth('login'));
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  state.token = '';
  state.user = null;
  toggleViews();
  documentList.innerHTML = '';
});

window.addEventListener('DOMContentLoaded', loadUser);
