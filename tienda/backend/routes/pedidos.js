const router = require('express').Router();
const pool = require('../db');
const { verificarToken, soloAdmin } = require('../middleware/auth');

// POST /api/pedidos  (cliente) -- usa transacción
router.post('/', verificarToken, async (req, res) => {
  const { items } = req.body; // [{ producto_id, cantidad }]
  if (!items?.length)
    return res.status(400).json({ error: 'Sin items' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let total = 0;
    const detalles = [];

    for (const it of items) {
      const r = await client.query(
        'SELECT * FROM productos WHERE id=$1 FOR UPDATE',
        [it.producto_id]
      );
      const p = r.rows[0];
      if (!p) throw new Error('Producto no existe');
      if (p.stock < it.cantidad)
        throw new Error(`Stock insuficiente: ${p.nombre}`);

      total += Number(p.precio) * it.cantidad;
      detalles.push({ ...it, precio: p.precio });
    }

    const pedidoRes = await client.query(
      'INSERT INTO pedidos (usuario_id, total) VALUES ($1, $2) RETURNING id',
      [req.usuario.id, total]
    );
    const pedidoId = pedidoRes.rows[0].id;

    for (const d of detalles) {
      await client.query(
        `INSERT INTO detalle_pedido
         (pedido_id, producto_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [pedidoId, d.producto_id, d.cantidad, d.precio]
      );
      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2',
        [d.cantidad, d.producto_id]
      );
    }

    await client.query('COMMIT');
    res.json({ id: pedidoId });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: e.message });
  } finally {
    client.release();
  }
});

// GET /api/pedidos  (admin ve todos, cliente los suyos)
router.get('/', verificarToken, async (req, res) => {
  try {
    const sql = req.usuario.rol === 'admin'
      ? 'SELECT * FROM pedidos ORDER BY fecha DESC'
      : 'SELECT * FROM pedidos WHERE usuario_id=$1 ORDER BY fecha DESC';
    const params = req.usuario.rol === 'admin' ? [] : [req.usuario.id];
    const r = await pool.query(sql, params);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/pedidos/:id/estado  (admin)
router.patch('/:id/estado', verificarToken, soloAdmin, async (req, res) => {
  try {
    await pool.query(
      'UPDATE pedidos SET estado=$1 WHERE id=$2',
      [req.body.estado, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
