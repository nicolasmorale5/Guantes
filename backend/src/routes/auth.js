const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { generarToken, verificarToken } = require('../middleware/auth');

const router = express.Router();

// Login de administrador
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const db = getDb();
    const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ? AND activo = 1').get(email);

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValida = bcrypt.compareSync(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar token
router.get('/verificar', verificarToken, (req, res) => {
  res.json({
    valido: true,
    usuario: req.usuario
  });
});

// Cambiar contraseña
router.post('/cambiar-password', verificarToken, (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    const db = getDb();
    const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);

    if (!bcrypt.compareSync(passwordActual, usuario.password)) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    const passwordHash = bcrypt.hashSync(passwordNueva, 10);
    db.prepare('UPDATE usuarios SET password = ? WHERE id = ?').run(passwordHash, req.usuario.id);

    res.json({ mensaje: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
