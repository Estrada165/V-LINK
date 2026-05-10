import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('mg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
      return Promise.reject({ offline: true, error: 'Sin conexión al servidor.' });
    }
    if (err.response?.status === 401) {
      localStorage.removeItem('mg_token');
      localStorage.removeItem('mg_user');
      window.location.href = '/';
    }
    return Promise.reject(err.response?.data || err);
  }
);

/* ── AUTH ──────────────────────────────────────────────────── */
export const authService = {
  login: async (correo_electronico, password) => {
    const r = await api.post('/auth/login', { correo_electronico, password });
    localStorage.setItem('mg_token', r.data.token);
    localStorage.setItem('mg_user', JSON.stringify(r.data.user));
    return r.data;
  },
  register: async (payload) => {
    const r = await api.post('/auth/register', payload);
    return r.data;
  },
  logout: () => {
    localStorage.removeItem('mg_token');
    localStorage.removeItem('mg_user');
  },
  getCurrentUser: () => {
    try { return JSON.parse(localStorage.getItem('mg_user')); } catch { return null; }
  },
};

/* ── PROFILE ────────────────────────────────────────────────── */
export const profileService = {
  getMe:   ()        => api.get('/users/me').then(r => r.data),
  update:  (payload) => api.patch('/users/me', payload).then(r => r.data),
};

/* ── VEHICLES ───────────────────────────────────────────────── */
export const vehicleService = {
  getAll:  ()         => api.get('/vehicles').then(r => r.data),      // admin: todos
  getMine: ()         => api.get('/vehicles/mine').then(r => r.data), // siempre los propios
  create:  (payload)  => api.post('/vehicles', payload).then(r => r.data),
  update:  (id, data) => api.patch(`/vehicles/${id}`, data).then(r => r.data),
  delete:  (id)       => api.delete(`/vehicles/${id}`).then(r => r.data),
};

/* ── ALERTS ─────────────────────────────────────────────────── */
export const alertService = {
  getAll:  ()     => api.get('/alerts').then(r => r.data),
  report:  (data) => api.post('/alerts', data).then(r => r.data),
  update:  (id, estado_alerta) => api.patch(`/alerts/${id}`, { estado_alerta }).then(r => r.data),
  delete:  (id)   => api.delete(`/alerts/${id}`).then(r => r.data),
};

/* ── HEATMAP ────────────────────────────────────────────────── */
export const heatmapService = {
  getPoints: () => api.get('/heatmap').then(r => r.data),
};

/* ── ROUTES ─────────────────────────────────────────────────── */
export const routeService = {
  getAll: () => api.get('/routes').then(r => r.data),
};

/* ── EMERGENCY CONTACTS ─────────────────────────────────────── */
export const contactService = {
  getAll:  ()     => api.get('/emergency-contacts').then(r => r.data),
  create:  (data) => api.post('/emergency-contacts', data).then(r => r.data),
  delete:  (id)   => api.delete(`/emergency-contacts/${id}`).then(r => r.data),
};

/* ── ADMIN ──────────────────────────────────────────────────── */
export const adminService = {
  // Búsqueda en BD con parámetros
  getAllUsers: (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    );
    const q = new URLSearchParams(clean).toString();
    return api.get(`/admin/users${q ? '?' + q : ''}`).then(r => r.data);
  },

  // Acción masiva — 1 sola petición para N usuarios
  bulkAction: (ids, action) =>
    api.post('/admin/users/bulk-action', { ids: [...ids], action }).then(r => r.data),

  // Stats del dashboard en 1 petición
  getStats: () => api.get('/admin/stats').then(r => r.data),

  // Acciones individuales
  toggleActive:  (id, activo) => api.patch(`/admin/users/${id}/toggle-active`, { activo }).then(r => r.data),
  resetPassword: (id, pwd)    => api.patch(`/admin/users/${id}/reset-password`, { new_password: pwd }).then(r => r.data),
  changeRole:    (id, rol)    => api.patch(`/admin/users/${id}/role`, { rol }).then(r => r.data),
  deleteUser:    (id)         => api.delete(`/admin/users/${id}`).then(r => r.data),
};

/* ── CONFIG ─────────────────────────────────────────────────── */
export const configService = {
  get:  async (vehiculoId) => {
    try { return await api.get(`/config/${vehiculoId}`).then(r => r.data); }
    catch { return {}; }
  },
  save: (data) => api.post('/config', data).then(r => r.data),
};

/* ── HEALTH ─────────────────────────────────────────────────── */
export const healthService = {
  check: async () => {
    try { await api.get('/health'); return true; } catch { return false; }
  },
};

export default api;