const API = 'http://192.168.1.73:3000/api';

// Verifica que haya sesión; si no, redirige a login
function requireAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return null;
  }
  return token;
}

// Headers con token
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  };
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Pinta info del usuario y links según rol
function renderUserInfo() {
  const nombre = localStorage.getItem('nombre') || '';
  const rol = localStorage.getItem('rol') || '';
  const info = document.getElementById('user-info');
  if (info) info.textContent = `👤 ${nombre} (${rol})`;

  const navAdmin = document.getElementById('nav-admin');
  if (navAdmin) navAdmin.style.display = rol === 'admin' ? 'inline-block' : 'none';
}

// Wrapper de fetch con manejo de errores
async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error en el servidor');
  return data;
}
