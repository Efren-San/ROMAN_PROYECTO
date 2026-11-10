const jwt = require('jsonwebtoken');
const SECRET = 'clave_secreta_tienda';

function verificarToken(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Token requerido' });
  try {
    const token = header.split(' ')[1];
    req.usuario = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido' });
  }
}

function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin')
    return res.status(403).json({ error: 'Solo administradores' });
  next();
}

module.exports = { verificarToken, soloAdmin, SECRET };
