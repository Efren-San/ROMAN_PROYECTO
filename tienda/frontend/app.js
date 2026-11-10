const API = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let rol = localStorage.getItem('rol');
let carrito = [];

function renderAuth() {
  document.getElementById('auth').innerHTML = token
    ? `<p>Bienvenido ${localStorage.getItem('nombre')} (${rol})
       <button onclick="logout()">Salir</button></p>`
    : `<input id="email" placeholder="Email">
       <input id="pass" type="password" placeholder="Contraseña">
       <button onclick="login()">Login</button>
       <button onclick="registro()">Registrarse</button>`;
}

async function login() {
  const r = await fetch(`${API}/auth/login`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email: email.value, password: pass.value })
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
  await fetch(`${API}/auth/registro`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ nombre:'Usuario', email:email.value, password:pass.value })
  });
  alert('Registrado, ahora inicia sesión');
}

function logout() { localStorage.clear(); location.reload(); }

async function cargarProductos() {
  const r = await fetch(`${API}/productos`);
  const prods = await r.json();
  document.getElementById('productos').innerHTML = prods.map(p => `
    <div class="card">
      <h3>${p.nombre}</h3>
      <p>$${p.precio} - Stock: ${p.stock}</p>
      <button onclick="agregar(${p.id},'${p.nombre}',${p.precio})">Agregar al carrito</button>
      ${rol==='admin' ? `<button onclick="eliminar(${p.id})">Eliminar</button>` : ''}
    </div>`).join('');
}

function agregar(id, nombre, precio) {
  carrito.push({ producto_id:id, cantidad:1, nombre, precio });
  renderCarrito();
}

function renderCarrito() {
  const total = carrito.reduce((s,i)=>s+i.precio,0);
  document.getElementById('carrito').innerHTML = `
    <h2>Carrito ($${total.toFixed(2)})</h2>
    ${carrito.map(i=>`<p>${i.nombre} x${i.cantidad}</p>`).join('')}
    <button onclick="comprar()">Realizar pedido</button>`;
}

async function comprar() {
  const r = await fetch(`${API}/pedidos`, {
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body: JSON.stringify({ items: carrito })
  });
  const d = await r.json();
  if (d.id) { alert('Pedido #'+d.id+' creado'); carrito=[]; renderCarrito(); cargarProductos(); }
  else alert(d.error);
}

async function eliminar(id) {
  await fetch(`${API}/productos/${id}`, {
    method:'DELETE', headers:{'Authorization':'Bearer '+token}
  });
  cargarProductos();
}

renderAuth();
cargarProductos();
