const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { SECRET } = require('../middleware/auth');

// Registro
router.post('/registro', (req, res) => {
  const { nombre, email, password, rol } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ error: 'Datos incompletos' });
  const hash = bcrypt.hashSync(password, 10);
  try {
    const info = db.prepare(
      'INSERT INTO usuarios (nombre,email,password,rol) VALUES (?,?,?,?)'
    ).run(nombre, email, hash, rol || 'cliente');
    res.json({ id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: 'Email ya registrado' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM usuarios WHERE email=?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Credenciales inválidas' });
  const token = jwt.sign(
    { id: user.id, rol: user.rol, nombre: user.nombre }, SECRET, { expiresIn: '8h' }
  );
  res.json({ token, rol: user.rol, nombre: user.nombre });
});

module.exports = router;
