requireAuth();
renderUserInfo();

const esAdmin = localStorage.getItem('rol') === 'admin';

async function cargarPedidos() {
  try {
    const pedidos = await apiFetch('/pedidos', { headers: authHeaders() });
    document.getElementById('titulo-pedidos').textContent =
      esAdmin ? '📋 Todos los pedidos' : '📋 Mis pedidos';
    renderPedidos(pedidos);
  } catch (e) {
    alert(e.message);
  }
}

function renderPedidos(pedidos) {
  const cont = document.getElementById('lista-pedidos');
  if (!pedidos.length) {
    cont.innerHTML = '<p style="text-align:center;color:#7f8c8d;padding:2rem">No hay pedidos.</p>';
    return;
  }

  cont.innerHTML = pedidos.map(p => `
    <div class="pedido-card">
      <h3>Pedido #${p.id}</h3>
      <div class="meta">
        <span>📅 ${new Date(p.fecha).toLocaleString()}</span>
        <span>💵 Total: $${Number(p.total).toFixed(2)}</span>
        <span class="estado estado-${p.estado}">${p.estado}</span>
      </div>
      ${esAdmin ? `
        <label>Cambiar estado: </label>
        <select onchange="cambiarEstado(${p.id}, this.value)">
          ${['pendiente','pagado','entregado','cancelado'].map(e =>
            `<option value="${e}" ${p.estado === e ? 'selected' : ''}>${e}</option>`
          ).join('')}
        </select>
      ` : ''}
    </div>
  `).join('');
}

async function cambiarEstado(id, estado) {
  try {
    await apiFetch('/pedidos/' + id + '/estado', {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ estado })
    });
    alert('✅ Estado actualizado');
    await cargarPedidos();
  } catch (e) {
    alert('❌ ' + e.message);
  }
}

cargarPedidos();
