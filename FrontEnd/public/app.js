// This file controls what the website shows and does.
// It helps people sign in, upload files, and see their saved documents.
// Demo note: the original backend API calls were removed from this version.
// Added for the demo: a browser-only flow that stores users and documents
// in localStorage using simple arrays instead of a database.
// To restore the backend version later, comment out the demo-only sections below
// and uncomment the older fetch-based handlers that call /api/auth and /api/documents.
const state = { token: localStorage.getItem('token') || '', user: null };

const authSection = document.getElementById('authSection');
const vaultSection = document.getElementById('vaultSection');
const logoutBtn = document.getElementById('logoutBtn');
const authForm = document.getElementById('authForm');
const uploadForm = document.getElementById('uploadForm');
const documentList = document.getElementById('documentList');
// Demo addition: local storage key for the sample users and documents.
const storageKey = 'documentVaultDemoData';

// Demo addition: load the in-browser demo data from localStorage.
function loadDemoData() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : { users: [], documents: [] };
  } catch (error) {
    console.warn('Unable to read demo data, resetting it.', error);
    return { users: [], documents: [] };
  }
}

// Demo addition: save the in-browser demo data back to localStorage.
function saveDemoData(data) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

// Demo addition: the app now uses an in-memory array-style data object
// populated from localStorage for the demo experience.
// Backend restore note: if you want the real backend again, comment out this
// demo data block and uncomment the older fetch-based auth/document logic below.
let demoData = loadDemoData();

function toggleViews() {
  authSection.classList.toggle('hidden', !!state.token);
  vaultSection.classList.toggle('hidden', !state.token);
  logoutBtn.classList.toggle('hidden', !state.token);
}

// Demo version: this function uses local demo data.
// Backend restore note: comment out this demo function and uncomment the older
// version that uses fetch('/api/auth/me') with a Bearer token.
function loadUser() {
  if (!state.token) {
    toggleViews();
    return;
  }

  const user = demoData.users.find((entry) => entry.token === state.token);
  if (user) {
    state.user = user;
    toggleViews();
    loadDocuments();
  } else {
    localStorage.removeItem('token');
    state.token = '';
    state.user = null;
    toggleViews();
  }
}

// Demo version: this function uses local demo data.
// Backend restore note: comment out this demo function and uncomment the older
// version that uses fetch(`/api/auth/${action}`) for register/login.
function handleAuth(action) {
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password || (action === 'register' && !username)) {
    alert('Please complete the form before continuing.');
    return;
  }

  if (action === 'register') {
    const existingUser = demoData.users.find((entry) => entry.email === email || entry.username === username);
    if (existingUser) {
      alert('That username or email is already in use.');
      return;
    }

    const user = {
      id: `user-${Date.now()}`,
      username,
      email,
      password
    };

    const token = `demo-${Date.now()}`;
    user.token = token;
    demoData.users.push(user);
    saveDemoData(demoData);

    localStorage.setItem('token', token);
    state.token = token;
    state.user = user;
    toggleViews();
    loadDocuments();
    return;
  }

  const user = demoData.users.find((entry) => entry.email === email && entry.password === password);
  if (!user) {
    alert('Invalid email or password.');
    return;
  }

  const token = `demo-${Date.now()}`;
  user.token = token;
  saveDemoData(demoData);

  localStorage.setItem('token', token);
  state.token = token;
  state.user = user;
  toggleViews();
  loadDocuments();
}

// Demo version: this function reads from the local demo arrays.
// Backend restore note: comment out this demo function and uncomment the older
// version that calls fetch('/api/documents') and renders the server response.
function loadDocuments() {
  if (!state.token || !state.user) return;

  const documents = demoData.documents.filter((doc) => doc.userId === state.user.id);

  documentList.innerHTML = documents.length
    ? documents
        .map((doc) => `
          <div class="document-item">
            <div>
              <strong>${doc.title}</strong>
              <div>${doc.originalName}</div>
            </div>
            <div>
              ${doc.fileData ? `<a href="${doc.fileData}" target="_blank">Open</a>` : '<span>Stored locally</span>'}
              <button class="secondary" data-id="${doc.id}" onclick="deleteDocument('${doc.id}')">Delete</button>
            </div>
          </div>
        `)
        .join('')
    : '<p>No documents yet.</p>';
}

// Demo version: this function removes documents from the local demo array.
// Backend restore note: comment out this demo function and uncomment the older
// version that calls fetch(`/api/documents/${id}`, { method: 'DELETE' }).
function deleteDocument(id) {
  demoData.documents = demoData.documents.filter((doc) => doc.id !== id);
  saveDemoData(demoData);
  loadDocuments();
}

window.deleteDocument = deleteDocument;

// Demo version: this upload handler stores files in browser memory via FileReader.
// Backend restore note: comment out this demo handler and uncomment the older
// version that sends FormData to /api/documents with a Bearer token.
uploadForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!state.token || !state.user) {
    alert('Please sign in first.');
    return;
  }

  const title = document.getElementById('docTitle').value.trim();
  const description = document.getElementById('docDescription').value.trim();
  const file = document.getElementById('docFile').files[0];

  if (!title || !file) {
    alert('Please add a title and choose a file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const documentEntry = {
      id: `doc-${Date.now()}`,
      title,
      description,
      originalName: file.name,
      fileData: reader.result,
      userId: state.user.id
    };

    demoData.documents.push(documentEntry);
    saveDemoData(demoData);
    uploadForm.reset();
    loadDocuments();
  };

  reader.readAsDataURL(file);
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
