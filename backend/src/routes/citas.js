const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

const router = express.Router();

// Generar código de cita único
function generarCodigoCita() {
  const fecha = new Date();
  const año = fecha.getFullYear().toString().slice(-2);
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GO${año}${mes}-${random}`;
}

// Crear nueva cita (público)
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const {
      nombre_cliente,
      telefono_cliente,
      email_cliente,
      oficina_id,
      fecha,
      hora,
      divisa_origen,
      divisa_destino,
      monto,
      notas
    } = req.body;

    // Validaciones
    if (!nombre_cliente || !telefono_cliente || !oficina_id || !fecha || !hora ||
        !divisa_origen || !divisa_destino || !monto) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });
    }

    // Verificar que la oficina existe
    const oficina = db.prepare('SELECT id FROM oficinas WHERE id = ? AND activo = 1').get(oficina_id);
    if (!oficina) {
      return res.status(404).json({ error: 'Oficina no encontrada' });
    }

    // Verificar disponibilidad (máximo 3 citas por hora por oficina)
    const citasEnHorario = db.prepare(`
      SELECT COUNT(*) as count FROM citas
      WHERE oficina_id = ? AND fecha = ? AND hora = ? AND estado != 'cancelada'
    `).get(oficina_id, fecha, hora);

    if (citasEnHorario.count >= 3) {
      return res.status(400).json({ error: 'No hay disponibilidad en ese horario. Por favor seleccione otro.' });
    }

    const codigoCita = generarCodigoCita();

    const resultado = db.prepare(`
      INSERT INTO citas (
        codigo_cita, nombre_cliente, telefono_cliente, email_cliente,
        oficina_id, fecha, hora, divisa_origen, divisa_destino, monto, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      codigoCita, nombre_cliente, telefono_cliente, email_cliente,
      oficina_id, fecha, hora, divisa_origen, divisa_destino, monto, notas
    );

    // Obtener la tasa actual para mostrar al cliente
    const tasa = db.prepare(`
      SELECT tasa_venta FROM tasas_cambio
      WHERE divisa_origen = ? AND divisa_destino = ?
    `).get(divisa_origen, divisa_destino);

    const montoEstimado = tasa ? parseFloat(monto) * tasa.tasa_venta : null;

    res.status(201).json({
      mensaje: 'Cita agendada exitosamente',
      cita: {
        codigo: codigoCita,
        fecha,
        hora,
        monto_estimado: montoEstimado ? Math.round(montoEstimado * 100) / 100 : 'Por confirmar'
      }
    });
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Consultar cita por código (público)
router.get('/consultar/:codigo', (req, res) => {
  try {
    const db = getDb();
    const { codigo } = req.params;
    const cita = db.prepare(`
      SELECT
        c.*,
        o.nombre as oficina_nombre,
        o.direccion as oficina_direccion,
        o.telefono as oficina_telefono
      FROM citas c
      LEFT JOIN oficinas o ON c.oficina_id = o.id
      WHERE c.codigo_cita = ?
    `).get(codigo);

    if (!cita) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    res.json(cita);
  } catch (error) {
    console.error('Error al consultar cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cancelar cita (público - con código)
router.post('/cancelar/:codigo', (req, res) => {
  try {
    const db = getDb();
    const { codigo } = req.params;

    const cita = db.prepare('SELECT * FROM citas WHERE codigo_cita = ?').get(codigo);

    if (!cita) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    if (cita.estado === 'cancelada') {
      return res.status(400).json({ error: 'La cita ya fue cancelada' });
    }

    if (cita.estado === 'completada') {
      return res.status(400).json({ error: 'No se puede cancelar una cita completada' });
    }

    db.prepare("UPDATE citas SET estado = 'cancelada' WHERE codigo_cita = ?").run(codigo);

    res.json({ mensaje: 'Cita cancelada exitosamente' });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener horarios disponibles para una fecha y oficina
router.get('/disponibilidad/:oficina_id/:fecha', (req, res) => {
  try {
    const db = getDb();
    const { oficina_id, fecha } = req.params;

    // Horarios disponibles (de 9:00 a 18:00, cada 30 minutos)
    const todosHorarios = [];
    for (let h = 9; h < 18; h++) {
      todosHorarios.push(`${h.toString().padStart(2, '0')}:00`);
      todosHorarios.push(`${h.toString().padStart(2, '0')}:30`);
    }

    // Obtener citas existentes para esa fecha y oficina
    const citasExistentes = db.prepare(`
      SELECT hora, COUNT(*) as count FROM citas
      WHERE oficina_id = ? AND fecha = ? AND estado != 'cancelada'
      GROUP BY hora
    `).all(oficina_id, fecha);

    const horariosOcupados = {};
    citasExistentes.forEach(c => {
      horariosOcupados[c.hora] = c.count;
    });

    // Filtrar horarios disponibles (máximo 3 por slot)
    const horariosDisponibles = todosHorarios.filter(h => {
      return !horariosOcupados[h] || horariosOcupados[h] < 3;
    });

    res.json({
      fecha,
      horarios: horariosDisponibles
    });
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === Rutas administrativas ===

// Obtener todas las citas (admin)
router.get('/', verificarToken, verificarAdmin, (req, res) => {
  try {
    const db = getDb();
    const { fecha, estado, oficina_id } = req.query;
    let query = `
      SELECT
        c.*,
        o.nombre as oficina_nombre
      FROM citas c
      LEFT JOIN oficinas o ON c.oficina_id = o.id
      WHERE 1=1
    `;
    const params = [];

    if (fecha) {
      query += ' AND c.fecha = ?';
      params.push(fecha);
    }

    if (estado) {
      query += ' AND c.estado = ?';
      params.push(estado);
    }

    if (oficina_id) {
      query += ' AND c.oficina_id = ?';
      params.push(oficina_id);
    }

    query += ' ORDER BY c.fecha DESC, c.hora ASC';

    const citas = db.prepare(query).all(...params);
    res.json(citas);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar estado de cita (admin)
router.put('/:id/estado', verificarToken, verificarAdmin, (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'confirmada', 'completada', 'cancelada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const resultado = db.prepare('UPDATE citas SET estado = ? WHERE id = ?').run(estado, id);

    if (resultado.changes === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    res.json({ mensaje: 'Estado actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Estadísticas de citas (admin)
router.get('/estadisticas/resumen', verificarToken, verificarAdmin, (req, res) => {
  try {
    const db = getDb();
    const hoy = new Date().toISOString().split('T')[0];

    const citasHoy = db.prepare(`
      SELECT COUNT(*) as count FROM citas WHERE fecha = ? AND estado != 'cancelada'
    `).get(hoy);

    const citasPendientes = db.prepare(`
      SELECT COUNT(*) as count FROM citas WHERE estado = 'pendiente'
    `).get();

    const citasCompletadas = db.prepare(`
      SELECT COUNT(*) as count FROM citas WHERE estado = 'completada'
    `).get();

    const citasPorOficina = db.prepare(`
      SELECT o.nombre, COUNT(c.id) as total
      FROM oficinas o
      LEFT JOIN citas c ON o.id = c.oficina_id AND c.estado != 'cancelada'
      WHERE o.activo = 1
      GROUP BY o.id
    `).all();

    res.json({
      citas_hoy: citasHoy.count,
      citas_pendientes: citasPendientes.count,
      citas_completadas: citasCompletadas.count,
      citas_por_oficina: citasPorOficina
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
