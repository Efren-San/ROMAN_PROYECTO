const API = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let rol = localStorage.getItem('rol');
let carrito = [];

function renderAuth() {
  document.getElementById('auth').innerHTML = token
    ? `<span>Hola, ${localStorage.getItem('nombre')} (${rol})</span>
       <button onclick="logout()">Salir</button>`
    : `<input id="email" placeholder="Email">
       <input id="pass" type="password" placeholder="Contraseña">
       <button onclick="login()">Login</button>
       <button onclick="registro()">Registrarse</button>`;

  document.getElementById('admin-panel').style.display =
    rol === 'admin' ? 'block' : 'none';
}

async function login() {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('email').value,
      password: document.getElementById('pass').value
    })
  });
  const d = await r.json();
  if (d.token) {
    localStorage.setItem('token', d.token);
    localStorage.setItem('rol', d.rol);
    localStorage.setItem('nombre', d.nombre);
    location.reload();
  } else alert(d.error);
}

async function registro() {
  const r = await fetch(`${API}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Usuario',
      email: document.getElementById('email').value,
      password: document.getElementById('pass').value
    })
  });
  const d = await r.json();
  alert(d.id ? 'Registrado. Ahora inicia sesión.' : d.error);
}

function logout() { localStorage.clear(); location.reload(); }

async function cargarProductos() {
  const r = await fetch(`${API}/productos`);
  const prods = await r.json();
  document.getElementById('productos').innerHTML = prods.map(p => `
    <div class="card">
      <h3>${p.nombre}</h3>
      <p>${p.descripcion || ''}</p>
      <p><b>$${p.precio}</b> · Stock: ${p.stock}</p>
      <button onclick="agregar(${p.id},'${p.nombre}',${p.precio})">
        Agregar al carrito
      </button>
      ${rol === 'admin'
        ? `<button onclick="eliminar(${p.id})">Eliminar</button>`
        : ''}
    </div>`).join('');
}

async function crearProducto() {
  const body = {
    nombre: document.getElementById('p-nombre').value,
    descripcion: document.getElementById('p-desc').value,
    precio: Number(document.getElementById('p-precio').value),
    stock: Number(document.getElementById('p-stock').value),
    categoria: document.getElementById('p-cat').value
  };
  const r = await fetch(`${API}/productos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(body)
  });
  const d = await r.json();
  if (d.id) { alert('Producto creado'); cargarProductos(); }
  else alert(d.error);
}

function agregar(id, nombre, precio) {
  carrito.push({ producto_id: id, cantidad: 1, nombre, precio });
  renderCarrito();
}

function renderCarrito() {
  const total = carrito.reduce((s, i) => s + i.precio, 0);
  document.getElementById('carrito').innerHTML = `
    <h2>Carrito ($${total.toFixed(2)})</h2>
    ${carrito.map(i => `<p>${i.nombre} x${i.cantidad}</p>`).join('')}
    ${carrito.length
      ? '<button onclick="comprar()">Realizar pedido</button>'
      : '<p>Vacío</p>'}`;
}

async function comprar() {
  const r = await fetch(`${API}/pedidos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ items: carrito })
  });
  const d = await r.json();
  if (d.id) {
    alert('Pedido #' + d.id + ' creado');
    carrito = [];
    renderCarrito();
    cargarProductos();
  } else alert(d.error);
}

async function eliminar(id) {
  if (!confirm('¿Eliminar producto?')) return;
  await fetch(`${API}/productos/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  cargarProductos();
}

renderAuth();
cargarProductos();
renderCarrito();
