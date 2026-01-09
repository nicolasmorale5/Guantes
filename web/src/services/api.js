// =============================================
// FRONTEND-ONLY API - Uses localStorage
// =============================================

// Default data
const DEFAULT_DIVISAS = [
  { id: 1, codigo: 'USD', nombre: 'Dólar Estadounidense', simbolo: '$', activo: 1 },
  { id: 2, codigo: 'EUR', nombre: 'Euro', simbolo: '€', activo: 1 },
  { id: 3, codigo: 'MXN', nombre: 'Peso Mexicano', simbolo: '$', activo: 1 },
  { id: 4, codigo: 'GBP', nombre: 'Libra Esterlina', simbolo: '£', activo: 1 },
  { id: 5, codigo: 'CAD', nombre: 'Dólar Canadiense', simbolo: 'C$', activo: 1 },
  { id: 6, codigo: 'JPY', nombre: 'Yen Japonés', simbolo: '¥', activo: 1 },
  { id: 7, codigo: 'BRL', nombre: 'Real Brasileño', simbolo: 'R$', activo: 1 },
  { id: 8, codigo: 'COP', nombre: 'Peso Colombiano', simbolo: '$', activo: 1 },
  { id: 9, codigo: 'ARS', nombre: 'Peso Argentino', simbolo: '$', activo: 1 },
  { id: 10, codigo: 'CLP', nombre: 'Peso Chileno', simbolo: '$', activo: 1 }
];

const DEFAULT_TASAS = [
  { id: 1, divisa_origen: 'USD', divisa_destino: 'COP', tasa_compra: 4150.00, tasa_venta: 4250.00, actualizado_en: new Date().toISOString() },
  { id: 2, divisa_origen: 'EUR', divisa_destino: 'COP', tasa_compra: 4500.00, tasa_venta: 4620.00, actualizado_en: new Date().toISOString() },
  { id: 3, divisa_origen: 'GBP', divisa_destino: 'COP', tasa_compra: 5200.00, tasa_venta: 5350.00, actualizado_en: new Date().toISOString() },
  { id: 4, divisa_origen: 'CAD', divisa_destino: 'COP', tasa_compra: 3050.00, tasa_venta: 3150.00, actualizado_en: new Date().toISOString() },
  { id: 5, divisa_origen: 'MXN', divisa_destino: 'COP', tasa_compra: 240.00, tasa_venta: 255.00, actualizado_en: new Date().toISOString() },
  { id: 6, divisa_origen: 'BRL', divisa_destino: 'COP', tasa_compra: 830.00, tasa_venta: 870.00, actualizado_en: new Date().toISOString() },
  { id: 7, divisa_origen: 'ARS', divisa_destino: 'COP', tasa_compra: 4.80, tasa_venta: 5.20, actualizado_en: new Date().toISOString() },
  { id: 8, divisa_origen: 'CLP', divisa_destino: 'COP', tasa_compra: 4.60, tasa_venta: 4.90, actualizado_en: new Date().toISOString() },
  { id: 9, divisa_origen: 'COP', divisa_destino: 'USD', tasa_compra: 0.000230, tasa_venta: 0.000240, actualizado_en: new Date().toISOString() },
  { id: 10, divisa_origen: 'COP', divisa_destino: 'EUR', tasa_compra: 0.000210, tasa_venta: 0.000220, actualizado_en: new Date().toISOString() }
];

const DEFAULT_OFICINAS = [
  {
    id: 1,
    nombre: 'Sucursal Riomar',
    direccion: 'Cl. 93 #46-90 Local 2, Riomar, Barranquilla, Atlántico, Colombia',
    telefono: '+57 605 123 4567',
    horario: 'Lun-Vie: 8:00-18:00, Sáb: 9:00-13:00',
    latitud: 11.0041,
    longitud: -74.8141,
    activo: 1
  },
  {
    id: 2,
    nombre: 'Aeropuerto Ernesto Cortissoz',
    direccion: 'Aeropuerto Internacional Ernesto Cortissoz, Soledad, Atlántico, Colombia',
    telefono: '+57 605 234 5678',
    horario: 'Lun-Dom: 5:00-22:00',
    latitud: 10.8896,
    longitud: -74.7808,
    activo: 1
  }
];

const ADMIN_CREDENTIALS = {
  email: 'admin@guantesdeoro.com',
  password: 'admin123',
  nombre: 'Administrador',
  rol: 'admin'
};

// Initialize localStorage with default data
function initializeData() {
  if (!localStorage.getItem('guantes_divisas')) {
    localStorage.setItem('guantes_divisas', JSON.stringify(DEFAULT_DIVISAS));
  }
  if (!localStorage.getItem('guantes_tasas')) {
    localStorage.setItem('guantes_tasas', JSON.stringify(DEFAULT_TASAS));
  }
  if (!localStorage.getItem('guantes_oficinas')) {
    localStorage.setItem('guantes_oficinas', JSON.stringify(DEFAULT_OFICINAS));
  }
  if (!localStorage.getItem('guantes_citas')) {
    localStorage.setItem('guantes_citas', JSON.stringify([]));
  }
}

// Initialize on load
initializeData();

// Helper functions
function getData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(items) {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

function generateCitaCode() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GO${year}${month}-${random}`;
}

// === Auth ===
export const auth = {
  async login(email, password) {
    // Simulate async
    await new Promise(resolve => setTimeout(resolve, 300));

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const token = 'local_' + Date.now();
      const usuario = {
        id: 1,
        email: ADMIN_CREDENTIALS.email,
        nombre: ADMIN_CREDENTIALS.nombre,
        rol: ADMIN_CREDENTIALS.rol
      };
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      return { token, usuario };
    }
    throw new Error('Credenciales inválidas');
  },

  async verificar() {
    const token = localStorage.getItem('token');
    if (token) {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      return { valido: true, usuario };
    }
    throw new Error('Token inválido');
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  getUsuario() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

// === Divisas ===
export const divisas = {
  async obtenerTodas() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getData('guantes_divisas').filter(d => d.activo);
  },

  async obtenerTasas() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getData('guantes_tasas');
  },

  async obtenerTasa(origen, destino) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const tasas = getData('guantes_tasas');
    const tasa = tasas.find(t => t.divisa_origen === origen && t.divisa_destino === destino);
    if (!tasa) throw new Error('Tasa no encontrada');
    return tasa;
  },

  async convertir(origen, destino, monto, tipo = 'venta') {
    await new Promise(resolve => setTimeout(resolve, 100));
    const tasas = getData('guantes_tasas');
    const tasa = tasas.find(t => t.divisa_origen === origen && t.divisa_destino === destino);

    if (!tasa) throw new Error('Tasa de cambio no disponible');

    const tasaUsada = tipo === 'compra' ? tasa.tasa_compra : tasa.tasa_venta;
    const resultado = parseFloat(monto) * tasaUsada;

    return {
      origen,
      destino,
      monto: parseFloat(monto),
      tipo,
      tasa_aplicada: tasaUsada,
      monto_convertido: resultado
    };
  },

  async actualizarTasa(id, tasa_compra, tasa_venta) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const tasas = getData('guantes_tasas');
    const index = tasas.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Tasa no encontrada');

    tasas[index] = {
      ...tasas[index],
      tasa_compra: parseFloat(tasa_compra),
      tasa_venta: parseFloat(tasa_venta),
      actualizado_en: new Date().toISOString()
    };
    setData('guantes_tasas', tasas);
    return tasas[index];
  },

  async crearTasa(divisa_origen, divisa_destino, tasa_compra, tasa_venta) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const tasas = getData('guantes_tasas');
    const newTasa = {
      id: generateId(tasas),
      divisa_origen,
      divisa_destino,
      tasa_compra: parseFloat(tasa_compra),
      tasa_venta: parseFloat(tasa_venta),
      actualizado_en: new Date().toISOString()
    };
    tasas.push(newTasa);
    setData('guantes_tasas', tasas);
    return newTasa;
  },

  async eliminarTasa(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const tasas = getData('guantes_tasas');
    const filtered = tasas.filter(t => t.id !== id);
    setData('guantes_tasas', filtered);
    return { mensaje: 'Tasa eliminada' };
  }
};

// === Oficinas ===
export const oficinas = {
  async obtenerTodas() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getData('guantes_oficinas').filter(o => o.activo);
  },

  async obtenerPorId(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const oficinas = getData('guantes_oficinas');
    const oficina = oficinas.find(o => o.id === parseInt(id));
    if (!oficina) throw new Error('Oficina no encontrada');
    return oficina;
  },

  async crear(datos) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const oficinas = getData('guantes_oficinas');
    const newOficina = {
      id: generateId(oficinas),
      ...datos,
      activo: 1
    };
    oficinas.push(newOficina);
    setData('guantes_oficinas', oficinas);
    return newOficina;
  },

  async actualizar(id, datos) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const oficinas = getData('guantes_oficinas');
    const index = oficinas.findIndex(o => o.id === parseInt(id));
    if (index === -1) throw new Error('Oficina no encontrada');

    oficinas[index] = { ...oficinas[index], ...datos };
    setData('guantes_oficinas', oficinas);
    return oficinas[index];
  },

  async eliminar(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const oficinas = getData('guantes_oficinas');
    const index = oficinas.findIndex(o => o.id === parseInt(id));
    if (index === -1) throw new Error('Oficina no encontrada');

    oficinas[index].activo = 0;
    setData('guantes_oficinas', oficinas);
    return { mensaje: 'Oficina eliminada' };
  }
};

// === Citas ===
export const citas = {
  async crear(datos) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const citas = getData('guantes_citas');

    // Check availability (max 3 per hour per office)
    const citasEnHora = citas.filter(c =>
      c.oficina_id === datos.oficina_id &&
      c.fecha === datos.fecha &&
      c.hora === datos.hora &&
      c.estado !== 'cancelada'
    );

    if (citasEnHora.length >= 3) {
      throw new Error('No hay disponibilidad en ese horario');
    }

    const newCita = {
      id: generateId(citas),
      codigo_cita: generateCitaCode(),
      nombre_cliente: datos.nombre_cliente,
      telefono_cliente: datos.telefono_cliente,
      email_cliente: datos.email_cliente || null,
      oficina_id: parseInt(datos.oficina_id),
      fecha: datos.fecha,
      hora: datos.hora,
      divisa_origen: datos.divisa_origen,
      divisa_destino: datos.divisa_destino,
      monto: parseFloat(datos.monto),
      estado: 'pendiente',
      notas: datos.notas || null,
      creado_en: new Date().toISOString()
    };

    citas.push(newCita);
    setData('guantes_citas', citas);

    // Get office info
    const oficina = getData('guantes_oficinas').find(o => o.id === newCita.oficina_id);

    return {
      ...newCita,
      oficina_nombre: oficina?.nombre || 'Oficina'
    };
  },

  async consultar(codigo) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const citas = getData('guantes_citas');
    const cita = citas.find(c => c.codigo_cita === codigo);
    if (!cita) throw new Error('Cita no encontrada');

    const oficina = getData('guantes_oficinas').find(o => o.id === cita.oficina_id);
    return { ...cita, oficina_nombre: oficina?.nombre || 'Oficina' };
  },

  async cancelar(codigo) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const citas = getData('guantes_citas');
    const index = citas.findIndex(c => c.codigo_cita === codigo);
    if (index === -1) throw new Error('Cita no encontrada');

    citas[index].estado = 'cancelada';
    setData('guantes_citas', citas);
    return { mensaje: 'Cita cancelada exitosamente' };
  },

  async obtenerDisponibilidad(oficina_id, fecha) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const citas = getData('guantes_citas');
    const horarios = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

    const disponibilidad = horarios.map(hora => {
      const citasEnHora = citas.filter(c =>
        c.oficina_id === parseInt(oficina_id) &&
        c.fecha === fecha &&
        c.hora === hora &&
        c.estado !== 'cancelada'
      );
      return {
        hora,
        disponible: citasEnHora.length < 3,
        espacios_disponibles: 3 - citasEnHora.length
      };
    });

    return disponibilidad;
  },

  // Admin
  async obtenerTodas(filtros = {}) {
    await new Promise(resolve => setTimeout(resolve, 100));
    let citas = getData('guantes_citas');
    const oficinas = getData('guantes_oficinas');

    // Apply filters
    if (filtros.estado) {
      citas = citas.filter(c => c.estado === filtros.estado);
    }
    if (filtros.fecha) {
      citas = citas.filter(c => c.fecha === filtros.fecha);
    }

    // Add office names
    return citas.map(c => ({
      ...c,
      oficina_nombre: oficinas.find(o => o.id === c.oficina_id)?.nombre || 'Oficina'
    })).sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
  },

  async actualizarEstado(id, estado) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const citas = getData('guantes_citas');
    const index = citas.findIndex(c => c.id === parseInt(id));
    if (index === -1) throw new Error('Cita no encontrada');

    citas[index].estado = estado;
    setData('guantes_citas', citas);
    return citas[index];
  },

  async obtenerEstadisticas() {
    await new Promise(resolve => setTimeout(resolve, 100));
    const citas = getData('guantes_citas');
    const hoy = new Date().toISOString().split('T')[0];

    return {
      total: citas.length,
      pendientes: citas.filter(c => c.estado === 'pendiente').length,
      confirmadas: citas.filter(c => c.estado === 'confirmada').length,
      completadas: citas.filter(c => c.estado === 'completada').length,
      canceladas: citas.filter(c => c.estado === 'cancelada').length,
      hoy: citas.filter(c => c.fecha === hoy).length
    };
  }
};

export default { auth, divisas, oficinas, citas };
