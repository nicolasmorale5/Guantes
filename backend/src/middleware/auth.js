const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'guantes_de_oro_secret_key_2024';

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

function verificarAdmin(req, res, next) {
  if (req.usuario && req.usuario.rol === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Se requieren permisos de administrador' });
  }
}

function generarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = { verificarToken, verificarAdmin, generarToken, JWT_SECRET };
