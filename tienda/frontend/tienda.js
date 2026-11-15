requireAuth();
renderUserInfo();

let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');

async function cargarProductos() {
  try {
    productos = await apiFetch('/productos');
    llenarCategorias();
    renderProductos();
    renderCarrito();
  } catch (e) {
    alert(e.message);
  }
}

function llenarCategorias() {
  const select = document.getElementById('categoria');
  const cats = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
  select.innerHTML = '<option value="">Todas las categorías</option>' +
    cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function renderProductos() {
  const search = (document.getElementById('search').value || '').toLowerCase();
  const cat = document.getElementById('categoria').value;

  const filtrados = productos.filter(p => {
    const okSearch = p.nombre.toLowerCase().includes(search);
    const okCat = !cat || p.categoria === cat;
    return okSearch && okCat;
  });

  const cont = document.getElementById('productos');
  if (!filtrados.length) {
    cont.innerHTML = '<p style="text-align:center;padding:2rem;color:#7f8c8d">No hay productos.</p>';
    return;
  }

  cont.innerHTML = filtrados.map(p => `
    <div class="producto-card">
      <h3>${p.nombre}</h3>
      <p class="desc">${p.descripcion || 'Sin descripción'}</p>
      ${p.categoria ? `<span class="cat">${p.categoria}</span>` : ''}
      <div class="precio">$${Number(p.precio).toFixed(2)}</div>
      <div class="stock ${p.stock <= 0 ? 'agotado' : ''}">
        ${p.stock <= 0 ? '❌ Agotado' : `Stock: ${p.stock}`}
      </div>
      <button onclick="agregarAlCarrito(${p.id})"
              ${p.stock <= 0 ? 'disabled' : ''}>
        Agregar al carrito
      </button>
    </div>
  `).join('');
}

function agregarAlCarrito(id) {
  const prod = productos.find(p => p.id === id);
  if (!prod) return;

  const item = carrito.find(i => i.producto_id === id);
  if (item) {
    if (item.cantidad >= prod.stock) {
      alert('No hay más stock disponible');
      return;
    }
    item.cantidad++;
  } else {
    carrito.push({
      producto_id: id,
      cantidad: 1,
      nombre: prod.nombre,
      precio: Number(prod.precio)
    });
  }
  guardarCarrito();
  renderCarrito();
}

function quitarDelCarrito(id) {
  carrito = carrito.filter(i => i.producto_id !== id);
  guardarCarrito();
  renderCarrito();
}

function vaciarCarrito() {
  if (!carrito.length) return;
  if (!confirm('¿Vaciar el carrito?')) return;
  carrito = [];
  guardarCarrito();
  renderCarrito();
}

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function renderCarrito() {
  const cont = document.getElementById('carrito-items');
  const totalEl = document.getElementById('carrito-total');
  const badge = document.getElementById('badge-count');

  if (!carrito.length) {
    cont.innerHTML = '<p style="color:#7f8c8d;text-align:center">Carrito vacío</p>';
    totalEl.textContent = '$0.00';
    badge.textContent = '0';
    return;
  }

  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const items = carrito.reduce((s, i) => s + i.cantidad, 0);

  cont.innerHTML = carrito.map(i => `
    <div class="carrito-item">
      <span>${i.nombre} x${i.cantidad}</span>
      <span>
        $${(i.precio * i.cantidad).toFixed(2)}
        <button onclick="quitarDelCarrito(${i.producto_id})">✕</button>
      </span>
    </div>
  `).join('');

  totalEl.textContent = '$' + total.toFixed(2);
  badge.textContent = items;
}

async function realizarPedido() {
  if (!carrito.length) return alert('El carrito está vacío');

  try {
    const data = await apiFetch('/pedidos', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        items: carrito.map(i => ({
          producto_id: i.producto_id,
          cantidad: i.cantidad
        }))
      })
    });

    alert(`✅ Pedido #${data.id} creado correctamente`);
    carrito = [];
    guardarCarrito();
    await cargarProductos();
  } catch (e) {
    alert('❌ ' + e.message);
  }
}

cargarProductos();
