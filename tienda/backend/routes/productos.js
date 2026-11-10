const router = require('express').Router();
const db = require('../db');
const { verificarToken, soloAdmin } = require('../middleware/auth');

// Listar (público)
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM productos').all());
});

// Crear (admin)
router.post('/', verificarToken, soloAdmin, (req, res) => {
  const { nombre, descripcion, precio, stock, categoria } = req.body;
  const info = db.prepare(
    'INSERT INTO productos (nombre,descripcion,precio,stock,categoria) VALUES (?,?,?,?,?)'
  ).run(nombre, descripcion, precio, stock, categoria);
  res.json({ id: info.lastInsertRowid });
});

// Actualizar (admin)
router.put('/:id', verificarToken, soloAdmin, (req, res) => {
  const { nombre, descripcion, precio, stock, categoria } = req.body;
  db.prepare(
    'UPDATE productos SET nombre=?,descripcion=?,precio=?,stock=?,categoria=? WHERE id=?'
  ).run(nombre, descripcion, precio, stock, categoria, req.params.id);
  res.json({ ok: true });
});

// Eliminar (admin)
router.delete('/:id', verificarToken, soloAdmin, (req, res) => {
  db.prepare('DELETE FROM productos WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
