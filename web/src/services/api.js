const API_URL = '/api';

// Helper para manejar respuestas
async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }
  return data;
}

// Helper para obtener headers con token
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

// === Auth ===
export const auth = {
  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
    }
    return data;
  },

  async verificar() {
    const response = await fetch(`${API_URL}/auth/verificar`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
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
    const response = await fetch(`${API_URL}/divisas`);
    return handleResponse(response);
  },

  async obtenerTasas() {
    const response = await fetch(`${API_URL}/divisas/tasas`);
    return handleResponse(response);
  },

  async obtenerTasa(origen, destino) {
    const response = await fetch(`${API_URL}/divisas/tasas/${origen}/${destino}`);
    return handleResponse(response);
  },

  async convertir(origen, destino, monto, tipo = 'venta') {
    const response = await fetch(`${API_URL}/divisas/convertir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origen, destino, monto, tipo })
    });
    return handleResponse(response);
  },

  async actualizarTasa(id, tasa_compra, tasa_venta) {
    const response = await fetch(`${API_URL}/divisas/tasas/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tasa_compra, tasa_venta })
    });
    return handleResponse(response);
  },

  async crearTasa(divisa_origen, divisa_destino, tasa_compra, tasa_venta) {
    const response = await fetch(`${API_URL}/divisas/tasas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ divisa_origen, divisa_destino, tasa_compra, tasa_venta })
    });
    return handleResponse(response);
  },

  async eliminarTasa(id) {
    const response = await fetch(`${API_URL}/divisas/tasas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// === Oficinas ===
export const oficinas = {
  async obtenerTodas() {
    const response = await fetch(`${API_URL}/oficinas`);
    return handleResponse(response);
  },

  async obtenerPorId(id) {
    const response = await fetch(`${API_URL}/oficinas/${id}`);
    return handleResponse(response);
  },

  async crear(datos) {
    const response = await fetch(`${API_URL}/oficinas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(datos)
    });
    return handleResponse(response);
  },

  async actualizar(id, datos) {
    const response = await fetch(`${API_URL}/oficinas/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(datos)
    });
    return handleResponse(response);
  },

  async eliminar(id) {
    const response = await fetch(`${API_URL}/oficinas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// === Citas ===
export const citas = {
  async crear(datos) {
    const response = await fetch(`${API_URL}/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    return handleResponse(response);
  },

  async consultar(codigo) {
    const response = await fetch(`${API_URL}/citas/consultar/${codigo}`);
    return handleResponse(response);
  },

  async cancelar(codigo) {
    const response = await fetch(`${API_URL}/citas/cancelar/${codigo}`, {
      method: 'POST'
    });
    return handleResponse(response);
  },

  async obtenerDisponibilidad(oficina_id, fecha) {
    const response = await fetch(`${API_URL}/citas/disponibilidad/${oficina_id}/${fecha}`);
    return handleResponse(response);
  },

  // Admin
  async obtenerTodas(filtros = {}) {
    const params = new URLSearchParams(filtros);
    const response = await fetch(`${API_URL}/citas?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async actualizarEstado(id, estado) {
    const response = await fetch(`${API_URL}/citas/${id}/estado`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado })
    });
    return handleResponse(response);
  },

  async obtenerEstadisticas() {
    const response = await fetch(`${API_URL}/citas/estadisticas/resumen`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export default { auth, divisas, oficinas, citas };
