requireAuth();
renderUserInfo();

if (localStorage.getItem('rol') !== 'admin') {
  alert('Acceso denegado: solo administradores');
  window.location.href = 'tienda.html';
}

let productos = [];

async function cargarProductos() {
  try {
    productos = await apiFetch('/productos');
    renderTabla();
  } catch (e) {
    alert(e.message);
  }
}

function renderTabla() {
  const tbody = document.getElementById('tabla-productos');
  if (!productos.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem">Sin productos registrados</td></tr>';
    return;
  }

  tbody.innerHTML = productos.map(p => `
    <tr>
      <td>${p.id}</td>
      <td><strong>${p.nombre}</strong></td>
      <td>${p.descripcion || '-'}</td>
      <td>${p.categoria || '-'}</td>
      <td>$${Number(p.precio).toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn-edit" onclick="editar(${p.id})">✏️ Editar</button>
        <button class="btn-delete" onclick="eliminar(${p.id})">🗑️ Eliminar</button>
      </td>
    </tr>
  `).join('');
}

async function guardarProducto() {
  const id = document.getElementById('p-id').value;
  const body = {
    nombre: document.getElementById('p-nombre').value,
    descripcion: document.getElementById('p-desc').value,
    precio: Number(document.getElementById('p-precio').value),
    stock: Number(document.getElementById('p-stock').value),
    categoria: document.getElementById('p-categoria').value
  };

  try {
    if (id) {
      await apiFetch('/productos/' + id, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body)
      });
      alert('✅ Producto actualizado');
    } else {
      await apiFetch('/productos', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body)
      });
      alert('✅ Producto creado');
    }
    limpiarFormulario();
    await cargarProductos();
  } catch (e) {
    alert('❌ ' + e.message);
  }
}

function editar(id) {
  const p = productos.find(x => x.id === id);
  if (!p) return;

  document.getElementById('p-id').value = p.id;
  document.getElementById('p-nombre').value = p.nombre;
  document.getElementById('p-desc').value = p.descripcion || '';
  document.getElementById('p-precio').value = p.precio;
  document.getElementById('p-stock').value = p.stock;
  document.getElementById('p-categoria').value = p.categoria || '';
  document.getElementById('form-title').textContent = '✏️ Editar producto';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function eliminar(id) {
  if (!confirm('¿Eliminar este producto definitivamente?')) return;
  try {
    await apiFetch('/productos/' + id, {
      method: 'DELETE',
      headers: authHeaders()
    });
    alert('✅ Producto eliminado');
    await cargarProductos();
  } catch (e) {
    alert('❌ ' + e.message);
  }
}

function limpiarFormulario() {
  document.getElementById('form-producto').reset();
  document.getElementById('p-id').value = '';
  document.getElementById('form-title').textContent = '➕ Agregar producto';
}

cargarProductos();
