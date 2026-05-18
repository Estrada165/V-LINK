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

const construirQuery = (params) => {
  const limpios = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const qs = new URLSearchParams(limpios).toString();
  return qs ? `?${qs}` : '';
};

export const authService = {
  login: async (correo_electronico, password) => {
    const { data } = await api.post('/auth/login', { correo_electronico, password });
    localStorage.setItem('mg_token', data.token);
    localStorage.setItem('mg_user', JSON.stringify(data.user));
    return data;
  },
  register:       (payload)                        => api.post('/auth/register', payload).then(r => r.data),
  logout:         ()                               => { localStorage.removeItem('mg_token'); localStorage.removeItem('mg_user'); },
  getCurrentUser: ()                               => { try { return JSON.parse(localStorage.getItem('mg_user')); } catch { return null; } },
  changePassword: (current_password, new_password) => api.patch('/auth/change-password', { current_password, new_password }).then(r => r.data),
};

export const profileService = {
  getMe:  ()        => api.get('/users/me').then(r => r.data),
  update: (payload) => api.patch('/users/me', payload).then(r => r.data),
};

export const vehicleService = {
  getAll:  ()         => api.get('/vehicles').then(r => r.data),
  getMine: ()         => api.get('/vehicles/mine').then(r => r.data),
  create:  (payload)  => api.post('/vehicles', payload).then(r => r.data),
  update:  (id, data) => api.patch(`/vehicles/${id}`, data).then(r => r.data),
  delete:  (id)       => api.delete(`/vehicles/${id}`).then(r => r.data),
};

export const alertService = {
  getAll:  ()                  => api.get('/alerts').then(r => r.data),
  report:  (data)              => api.post('/alerts', data).then(r => r.data),
  update:  (id, estado_alerta) => api.patch(`/alerts/${id}`, { estado_alerta }).then(r => r.data),
  delete:  (id)                => api.delete(`/alerts/${id}`).then(r => r.data),
};

export const heatmapService = {
  getPoints: () => api.get('/heatmap').then(r => r.data),
};

export const routeService = {
  getAll:      ()           => api.get('/routes').then(r => r.data),
  getByUser:   (id_usuario) => api.get(`/routes?id_usuario=${id_usuario}`).then(r => r.data),
};

export const contactService = {
  getAll:  ()     => api.get('/emergency-contacts').then(r => r.data),
  create:  (data) => api.post('/emergency-contacts', data).then(r => r.data),
  delete:  (id)   => api.delete(`/emergency-contacts/${id}`).then(r => r.data),
};

export const configService = {
  get: async (vehiculoId) => {
    try { return await api.get(`/config/${vehiculoId}`).then(r => r.data); }
    catch { return {}; }
  },
  save: (data) => api.post('/config', data).then(r => r.data),
};

export const adminService = {
  getStats:      ()            => api.get('/admin/stats').then(r => r.data),
  getHealth:     ()            => api.get('/admin/health').then(r => r.data),
  getAllUsers:    (params = {}) => api.get(`/admin/users${construirQuery(params)}`).then(r => r.data),
  createUser:    (payload)     => api.post('/admin/users/create', payload).then(r => r.data),
  bulkAction:    (ids, action) => api.post('/admin/users/bulk-action', { ids: [...ids], action }).then(r => r.data),
  toggleActive:  (id, activo)  => api.patch(`/admin/users/${id}/toggle-active`, { activo }).then(r => r.data),
  resetPassword: (id, pwd)     => api.patch(`/admin/users/${id}/reset-password`, { new_password: pwd }).then(r => r.data),
  changeRole:    (id, rol)     => api.patch(`/admin/users/${id}/role`, { rol }).then(r => r.data),
  updateArea:    (id, area)   => api.patch(`/admin/users/${id}/area`, { area }).then(r => r.data),
  backup:        ()            => api.get('/admin/backup').then(r => r.data),
  getAuditoria:  (params = {}) => api.get(`/admin/auditoria${construirQuery(params)}`).then(r => r.data),
  getTecnicos:   ()            => api.get('/admin/users?rol=tecnico&activo=true').then(r => r.data),
};

export const supervisorService = {
  getStats:     ()            => api.get('/supervisor/stats').then(r => r.data),
  getAuditoria: (params = {}) => adminService.getAuditoria(params),
  getAlerts:    ()            => alertService.getAll(),
  getRoutes:    ()            => routeService.getAll(),
  resolveAlert: (id)          => alertService.update(id, 'resuelto'),
};

export const tecnicoService = {
  getDevices: () => api.get('/tecnico/devices').then(r => r.data),
  getAlerts:  () => alertService.getAll(),
};

export const informesService = {
  getAll:       ()           => api.get('/informes').then(r => r.data),
  create:       (payload)    => api.post('/informes', payload).then(r => r.data),
  updateEstado: (id, estado) => api.patch(`/informes/${id}`, { estado }).then(r => r.data),
};

export const ticketService = {
  getAll:   (params = {}) => api.get(`/tickets${construirQuery(params)}`).then(r => r.data),
  create:   (payload)     => api.post('/tickets', payload).then(r => r.data),
  asignar:  (id, payload) => api.patch(`/tickets/${id}/asignar`, payload).then(r => r.data),
  estado:   (id, payload) => api.patch(`/tickets/${id}/estado`, payload).then(r => r.data),
  eliminar: (id)          => api.delete(`/tickets/${id}`).then(r => r.data),
};

export const healthService = {
  check: async () => {
    try { await api.get('/health'); return true; } catch { return false; }
  },
};

export default api;