function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');

  document.getElementById('form-login').classList
    .toggle('hidden', tab !== 'login');
  document.getElementById('form-registro').classList
    .toggle('hidden', tab !== 'registro');
  document.getElementById('msg').textContent = '';
}

function showMsg(text, type = 'error') {
  const el = document.getElementById('msg');
  el.textContent = text;
  el.className = 'msg ' + type;
}

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-pass').value;

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('rol', data.rol);
    localStorage.setItem('nombre', data.nombre);

    window.location.href = data.rol === 'admin' ? 'admin.html' : 'tienda.html';
  } catch (e) {
    showMsg(e.message);
  }
}

async function registro() {
  const nombre = document.getElementById('reg-nombre').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-pass').value;

  try {
    await apiFetch('/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    showMsg('✅ Cuenta creada. Ahora inicia sesión.', 'ok');
    setTimeout(() => switchTab('login'), 1200);
  } catch (e) {
    showMsg(e.message);
  }
}

// Si ya hay sesión, redirige
if (localStorage.getItem('token')) {
  const rol = localStorage.getItem('rol');
  window.location.href = rol === 'admin' ? 'admin.html' : 'tienda.html';
}
