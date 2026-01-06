const express = require('express');
const { db } = require('../config/database');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

const router = express.Router();

// Obtener todas las oficinas
router.get('/', (req, res) => {
  try {
    const oficinas = db.prepare('SELECT * FROM oficinas WHERE activo = 1 ORDER BY nombre').all();
    res.json(oficinas);
  } catch (error) {
    console.error('Error al obtener oficinas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener oficina por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const oficina = db.prepare('SELECT * FROM oficinas WHERE id = ? AND activo = 1').get(id);

    if (!oficina) {
      return res.status(404).json({ error: 'Oficina no encontrada' });
    }

    res.json(oficina);
  } catch (error) {
    console.error('Error al obtener oficina:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear oficina (requiere admin)
router.post('/', verificarToken, verificarAdmin, (req, res) => {
  try {
    const { nombre, direccion, telefono, horario, latitud, longitud } = req.body;

    if (!nombre || !direccion) {
      return res.status(400).json({ error: 'Nombre y dirección son requeridos' });
    }

    const resultado = db.prepare(`
      INSERT INTO oficinas (nombre, direccion, telefono, horario, latitud, longitud)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(nombre, direccion, telefono, horario, latitud, longitud);

    res.status(201).json({
      mensaje: 'Oficina creada exitosamente',
      id: resultado.lastInsertRowid
    });
  } catch (error) {
    console.error('Error al crear oficina:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar oficina (requiere admin)
router.put('/:id', verificarToken, verificarAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono, horario, latitud, longitud } = req.body;

    const resultado = db.prepare(`
      UPDATE oficinas
      SET nombre = COALESCE(?, nombre),
          direccion = COALESCE(?, direccion),
          telefono = COALESCE(?, telefono),
          horario = COALESCE(?, horario),
          latitud = COALESCE(?, latitud),
          longitud = COALESCE(?, longitud)
      WHERE id = ?
    `).run(nombre, direccion, telefono, horario, latitud, longitud, id);

    if (resultado.changes === 0) {
      return res.status(404).json({ error: 'Oficina no encontrada' });
    }

    res.json({ mensaje: 'Oficina actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar oficina:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Desactivar oficina (requiere admin)
router.delete('/:id', verificarToken, verificarAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const resultado = db.prepare('UPDATE oficinas SET activo = 0 WHERE id = ?').run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({ error: 'Oficina no encontrada' });
    }

    res.json({ mensaje: 'Oficina desactivada exitosamente' });
  } catch (error) {
    console.error('Error al desactivar oficina:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
