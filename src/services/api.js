import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
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
      return Promise.reject({ offline: true, error: 'Sin conexión al servidor. Verifica que el backend esté corriendo en el puerto 4000.' });
    }
    if (err.response?.status === 401) {
      localStorage.removeItem('mg_token');
      localStorage.removeItem('mg_user');
      window.location.href = '/';
    }
    return Promise.reject(err.response?.data || err);
  }
);

export const authService = {
  login: async (correo_electronico, password) => {
    const r = await api.post('/auth/login', { correo_electronico, password });
    localStorage.setItem('mg_token', r.data.token);
    localStorage.setItem('mg_user', JSON.stringify(r.data.user));
    return r.data;
  },
  register: async (payload) => {
    const r = await api.post('/auth/register', payload);
    return r.data;  // no guardamos token — usuario inactivo hasta activación
  },
  logout: () => {
    localStorage.removeItem('mg_token');
    localStorage.removeItem('mg_user');
  },
  getCurrentUser: () => {
    try { return JSON.parse(localStorage.getItem('mg_user')); } catch { return null; }
  },
};

export const profileService = {
  getMe:   ()        => api.get('/users/me').then(r => r.data),
  update:  (payload) => api.patch('/users/me', payload).then(r => r.data),
};

export const vehicleService = {
  getAll:  ()         => api.get('/vehicles').then(r => r.data),
  create:  (payload)  => api.post('/vehicles', payload).then(r => r.data),
  update:  (id, data) => api.patch(`/vehicles/${id}`, data).then(r => r.data),
  delete:  (id)       => api.delete(`/vehicles/${id}`).then(r => r.data),
};

export const alertService = {
  getAll:  ()     => api.get('/alerts').then(r => r.data),
  report:  (data) => api.post('/alerts', data).then(r => r.data),
  update:  (id, estado_alerta) => api.patch(`/alerts/${id}`, { estado_alerta }).then(r => r.data),
  delete:  (id)   => api.delete(`/alerts/${id}`).then(r => r.data),
};

export const heatmapService = {
  getPoints: () => api.get('/heatmap').then(r => r.data),
};

export const routeService = {
  getAll: () => api.get('/routes').then(r => r.data),
};

export const contactService = {
  getAll:  ()     => api.get('/emergency-contacts').then(r => r.data),
  create:  (data) => api.post('/emergency-contacts', data).then(r => r.data),
  delete:  (id)   => api.delete(`/emergency-contacts/${id}`).then(r => r.data),
};

export const adminService = {
  getAllUsers:     ()           => api.get('/admin/users').then(r => r.data),
  toggleActive:   (id, activo) => api.patch(`/admin/users/${id}/toggle-active`, { activo }).then(r => r.data),
  resetPassword:  (id, pwd)    => api.patch(`/admin/users/${id}/reset-password`, { new_password: pwd }).then(r => r.data),
  changeRole:     (id, rol)    => api.patch(`/admin/users/${id}/role`, { rol }).then(r => r.data),
  deleteUser:     (id)         => api.delete(`/admin/users/${id}`).then(r => r.data),
};

export const configService = {
  get: async (vehiculoId) => {
    try {
      const r = await api.get(`/config/${vehiculoId}`);
      return r.data;
    } catch {
      return {}; // sin config aún, usar defaults del frontend
    }
  },
  save: (data) => api.post('/config', data).then(r => r.data),
};

export const healthService = {
  check: async () => {
    try { await api.get('/health'); return true; } catch { return false; }
  },
};


export default api;