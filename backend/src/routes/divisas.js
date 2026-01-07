const express = require('express');
const { getDb } = require('../config/database');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

const router = express.Router();

// Obtener todas las divisas
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const divisas = db.prepare('SELECT * FROM divisas WHERE activo = 1 ORDER BY codigo').all();
    res.json(divisas);
  } catch (error) {
    console.error('Error al obtener divisas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener tasas de cambio
router.get('/tasas', (req, res) => {
  try {
    const db = getDb();
    const tasas = db.prepare(`
      SELECT
        tc.*,
        do.nombre as nombre_origen,
        do.simbolo as simbolo_origen,
        dd.nombre as nombre_destino,
        dd.simbolo as simbolo_destino
      FROM tasas_cambio tc
      LEFT JOIN divisas do ON tc.divisa_origen = do.codigo
      LEFT JOIN divisas dd ON tc.divisa_destino = dd.codigo
      ORDER BY tc.divisa_origen, tc.divisa_destino
    `).all();
    res.json(tasas);
  } catch (error) {
    console.error('Error al obtener tasas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener tasa específica
router.get('/tasas/:origen/:destino', (req, res) => {
  try {
    const db = getDb();
    const { origen, destino } = req.params;
    const tasa = db.prepare(`
      SELECT * FROM tasas_cambio
      WHERE divisa_origen = ? AND divisa_destino = ?
    `).get(origen.toUpperCase(), destino.toUpperCase());

    if (!tasa) {
      return res.status(404).json({ error: 'Tasa no encontrada' });
    }

    res.json(tasa);
  } catch (error) {
    console.error('Error al obtener tasa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Calcular conversión
router.post('/convertir', (req, res) => {
  try {
    const db = getDb();
    const { origen, destino, monto, tipo } = req.body;

    if (!origen || !destino || !monto) {
      return res.status(400).json({ error: 'Origen, destino y monto son requeridos' });
    }

    const tasa = db.prepare(`
      SELECT * FROM tasas_cambio
      WHERE divisa_origen = ? AND divisa_destino = ?
    `).get(origen.toUpperCase(), destino.toUpperCase());

    if (!tasa) {
      return res.status(404).json({ error: 'Tasa de cambio no disponible para esta conversión' });
    }

    // tipo: 'compra' o 'venta' (desde la perspectiva del cliente)
    const tasaAplicar = tipo === 'compra' ? tasa.tasa_compra : tasa.tasa_venta;
    const resultado = parseFloat(monto) * tasaAplicar;

    res.json({
      origen,
      destino,
      monto_original: parseFloat(monto),
      tasa_aplicada: tasaAplicar,
      tipo: tipo || 'venta',
      monto_convertido: Math.round(resultado * 100) / 100
    });
  } catch (error) {
    console.error('Error al convertir:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar tasa de cambio (requiere admin)
router.put('/tasas/:id', verificarToken, verificarAdmin, (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { tasa_compra, tasa_venta } = req.body;

    if (!tasa_compra || !tasa_venta) {
      return res.status(400).json({ error: 'Tasa de compra y venta son requeridas' });
    }

    const resultado = db.prepare(`
      UPDATE tasas_cambio
      SET tasa_compra = ?, tasa_venta = ?, actualizado_en = CURRENT_TIMESTAMP, actualizado_por = ?
      WHERE id = ?
    `).run(tasa_compra, tasa_venta, req.usuario.id, id);

    if (resultado.changes === 0) {
      return res.status(404).json({ error: 'Tasa no encontrada' });
    }

    res.json({ mensaje: 'Tasa actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar tasa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva tasa de cambio (requiere admin)
router.post('/tasas', verificarToken, verificarAdmin, (req, res) => {
  try {
    const db = getDb();
    const { divisa_origen, divisa_destino, tasa_compra, tasa_venta } = req.body;

    if (!divisa_origen || !divisa_destino || !tasa_compra || !tasa_venta) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si ya existe
    const existe = db.prepare(`
      SELECT id FROM tasas_cambio WHERE divisa_origen = ? AND divisa_destino = ?
    `).get(divisa_origen, divisa_destino);

    if (existe) {
      return res.status(400).json({ error: 'Ya existe una tasa para este par de divisas' });
    }

    const resultado = db.prepare(`
      INSERT INTO tasas_cambio (divisa_origen, divisa_destino, tasa_compra, tasa_venta, actualizado_por)
      VALUES (?, ?, ?, ?, ?)
    `).run(divisa_origen, divisa_destino, tasa_compra, tasa_venta, req.usuario.id);

    res.status(201).json({
      mensaje: 'Tasa creada exitosamente',
      id: resultado.lastInsertRowid
    });
  } catch (error) {
    console.error('Error al crear tasa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar tasa de cambio (requiere admin)
router.delete('/tasas/:id', verificarToken, verificarAdmin, (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const resultado = db.prepare('DELETE FROM tasas_cambio WHERE id = ?').run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({ error: 'Tasa no encontrada' });
    }

    res.json({ mensaje: 'Tasa eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar tasa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
