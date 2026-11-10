const router = require('express').Router();
const db = require('../db');
const { verificarToken, soloAdmin } = require('../middleware/auth');

// Crear pedido (cliente)
router.post('/', verificarToken, (req, res) => {
  const { items } = req.body; // [{producto_id, cantidad}]
  if (!items?.length) return res.status(400).json({ error: 'Sin items' });

  const crearPedido = db.transaction(() => {
    let total = 0;
    const detalles = items.map(it => {
      const p = db.prepare('SELECT * FROM productos WHERE id=?').get(it.producto_id);
      if (!p) throw new Error('Producto no existe');
      if (p.stock < it.cantidad) throw new Error(`Stock insuficiente: ${p.nombre}`);
      total += p.precio * it.cantidad;
      return { ...it, precio: p.precio };
    });
    const info = db.prepare(
      'INSERT INTO pedidos (usuario_id,total) VALUES (?,?)'
    ).run(req.usuario.id, total);

    for (const d of detalles) {
      db.prepare(
        'INSERT INTO detalle_pedido (pedido_id,producto_id,cantidad,precio_unitario) VALUES (?,?,?,?)'
      ).run(info.lastInsertRowid, d.producto_id, d.cantidad, d.precio);
      db.prepare('UPDATE productos SET stock=stock-? WHERE id=?')
        .run(d.cantidad, d.producto_id);
    }
    return info.lastInsertRowid;
  });

  try {
    const id = crearPedido();
    res.json({ id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Listar pedidos (admin ve todos, cliente ve los suyos)
router.get('/', verificarToken, (req, res) => {
  const sql = req.usuario.rol === 'admin'
    ? 'SELECT * FROM pedidos ORDER BY fecha DESC'
    : 'SELECT * FROM pedidos WHERE usuario_id=? ORDER BY fecha DESC';
  const params = req.usuario.rol === 'admin' ? [] : [req.usuario.id];
  res.json(db.prepare(sql).all(...params));
});

// Cambiar estado (admin)
router.patch('/:id/estado', verificarToken, soloAdmin, (req, res) => {
  db.prepare('UPDATE pedidos SET estado=? WHERE id=?')
    .run(req.body.estado, req.params.id);
  res.json({ ok: true });
});

module.exports = router;
