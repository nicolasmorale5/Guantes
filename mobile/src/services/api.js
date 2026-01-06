import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambiar esta URL por la URL de tu backend en producción
const API_URL = 'http://localhost:3001/api';

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }
  return data;
}

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('token');
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
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('usuario', JSON.stringify(data.usuario));
    }
    return data;
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
  },

  async getUsuario() {
    const usuario = await AsyncStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  async isAuthenticated() {
    const token = await AsyncStorage.getItem('token');
    return !!token;
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

  async convertir(origen, destino, monto, tipo = 'venta') {
    const response = await fetch(`${API_URL}/divisas/convertir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origen, destino, monto, tipo })
    });
    return handleResponse(response);
  }
};

// === Oficinas ===
export const oficinas = {
  async obtenerTodas() {
    const response = await fetch(`${API_URL}/oficinas`);
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
  }
};

export default { auth, divisas, oficinas, citas };
