const router = require('express').Router();
const pool = require('../db');
const { verificarToken, soloAdmin } = require('../middleware/auth');

// GET /api/productos  (público)
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM productos ORDER BY id');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/productos  (admin)
router.post('/', verificarToken, soloAdmin, async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, stock, categoria)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [nombre, descripcion, precio, stock, categoria]
    );
    res.json({ id: r.rows[0].id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/productos/:id  (admin)
router.put('/:id', verificarToken, soloAdmin, async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria } = req.body;
  try {
    await pool.query(
      `UPDATE productos
       SET nombre=$1, descripcion=$2, precio=$3, stock=$4, categoria=$5
       WHERE id=$6`,
      [nombre, descripcion, precio, stock, categoria, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/productos/:id  (admin)
router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM productos WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
