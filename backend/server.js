require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const ws      = require('ws');

// Compatibilidad WebSocket Node 18/20
try {
  if (typeof globalThis !== 'undefined' && !globalThis.WebSocket) {
    globalThis.WebSocket = require('ws');
  }
} catch(e) {}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();

app.use(cors({
  origin: (origin, cb) => {
    const allowed = [
      'http://localhost:3000',
      'https://v-link-eight.vercel.app',
      process.env.FRONTEND_ORIGIN,
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error('CORS bloqueado: ' + origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token requerido' });
  try { req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token inválido o expirado' }); }
}
function requireAdmin(req, res, next) {
  if (req.user?.rol !== 'admin') return res.status(403).json({ error: 'Solo administradores' });
  next();
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── REGISTRO — cuenta queda inactiva hasta que admin la active ──
app.post('/api/auth/register', async (req, res) => {
  const { nombre_completo, correo_electronico, telefono, direccion, password } = req.body;
  if (!nombre_completo || !correo_electronico || !password)
    return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Contraseña mínimo 8 caracteres' });

  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('usuario')
    .insert([{ nombre_completo, correo_electronico, telefono, direccion, password_hash: hash, rol: 'usuario', activo: false }])
    .select('id_usuario, nombre_completo, correo_electronico, rol, activo').single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Correo ya registrado' });
    return res.status(500).json({ error: 'Error al registrar: ' + error.message });
  }
  res.status(201).json({ message: 'Cuenta creada. Espera que el administrador active tu cuenta.', user: data });
});

// ── LOGIN ────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { correo_electronico, password } = req.body;
  if (!correo_electronico || !password) return res.status(400).json({ error: 'Credenciales requeridas' });

  const { data: user } = await supabase.from('usuario')
    .select('id_usuario, nombre_completo, correo_electronico, rol, password_hash, telefono, direccion, activo, plan_suscripcion')
    .eq('correo_electronico', correo_electronico).single();

  const dummy = '$2b$10$rhRAZMCBeKFz9J9EHJs3wO.sx0HVeNaLpVbNrDDlPCb0l9AKP3MjS';
  const valid = await bcrypt.compare(password, user ? user.password_hash : dummy);

  if (!user || !valid) return res.status(401).json({ error: 'Credenciales incorrectas' });
  if (!user.activo && user.rol !== 'admin')
    return res.status(403).json({ error: 'Cuenta pendiente de activación. Contacta al administrador.' });

  const token = jwt.sign({ id: user.id_usuario, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '12h' });
  const { password_hash: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

app.patch('/api/auth/change-password', requireAuth, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(400).json({ error: 'Faltan campos' });
  if (new_password.length < 8) return res.status(400).json({ error: 'Mínimo 8 caracteres' });
  const { data: u } = await supabase.from('usuario').select('password_hash').eq('id_usuario', req.user.id).single();
  if (!await bcrypt.compare(current_password, u.password_hash)) return res.status(401).json({ error: 'Contraseña actual incorrecta' });
  await supabase.from('usuario').update({ password_hash: await bcrypt.hash(new_password, 10) }).eq('id_usuario', req.user.id);
  res.json({ message: 'Contraseña actualizada' });
});

// ── PROFILE ──────────────────────────────────────────────────
app.get('/api/users/me', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('usuario')
    .select('id_usuario, nombre_completo, correo_electronico, telefono, direccion, rol, fecha_registro, plan_suscripcion, activo')
    .eq('id_usuario', req.user.id).single();
  if (error) return res.status(404).json({ error: 'No encontrado' });
  res.json(data);
});

app.patch('/api/users/me', requireAuth, async (req, res) => {
  const { nombre_completo, telefono, direccion } = req.body;
  const updates = {};
  if (nombre_completo !== undefined) updates.nombre_completo = nombre_completo;
  if (telefono !== undefined) updates.telefono = telefono;
  if (direccion !== undefined) updates.direccion = direccion;
  const { data, error } = await supabase.from('usuario').update(updates).eq('id_usuario', req.user.id)
    .select('id_usuario, nombre_completo, correo_electronico, telefono, direccion, rol, activo').single();
  if (error) return res.status(500).json({ error: 'Error al actualizar' });
  res.json(data);
});

// ── ADMIN — USUARIOS ─────────────────────────────────────────
app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('usuario')
    .select('id_usuario, nombre_completo, correo_electronico, rol, telefono, fecha_registro, plan_suscripcion, activo')
    .order('fecha_registro', { ascending: false });
  if (error) return res.status(500).json({ error: 'Error' });
  res.json(data);
});

// Activar o desactivar usuario
app.patch('/api/admin/users/:id/toggle-active', requireAuth, requireAdmin, async (req, res) => {
  const { activo } = req.body;
  const updates = { activo };
  if (activo) updates.fecha_activacion = new Date().toISOString();
  const { data, error } = await supabase.from('usuario').update(updates)
    .eq('id_usuario', req.params.id).select('id_usuario, nombre_completo, activo, fecha_activacion').single();
  if (error) return res.status(500).json({ error: 'Error' });
  res.json(data);
});

// Resetear contraseña
app.patch('/api/admin/users/:id/reset-password', requireAuth, requireAdmin, async (req, res) => {
  const { new_password } = req.body;
  if (!new_password || new_password.length < 8) return res.status(400).json({ error: 'Mínimo 8 caracteres' });
  await supabase.from('usuario').update({ password_hash: await bcrypt.hash(new_password, 10) }).eq('id_usuario', req.params.id);
  res.json({ message: 'Contraseña reseteada' });
});

// Cambiar rol
app.patch('/api/admin/users/:id/role', requireAuth, requireAdmin, async (req, res) => {
  const { rol } = req.body;
  if (!['admin', 'usuario'].includes(rol)) return res.status(400).json({ error: 'Rol inválido' });
  const { data, error } = await supabase.from('usuario').update({ rol }).eq('id_usuario', req.params.id)
    .select('id_usuario, nombre_completo, rol').single();
  if (error) return res.status(500).json({ error: 'Error' });
  res.json(data);
});

// Eliminar usuario
app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  const { error } = await supabase.from('usuario').delete().eq('id_usuario', req.params.id);
  if (error) return res.status(500).json({ error: 'Error' });
  res.json({ message: 'Usuario eliminado' });
});

// ── VEHICLES ─────────────────────────────────────────────────
app.get('/api/vehicles', requireAuth, async (req, res) => {
  let q = supabase.from('vehiculo').select('*');
  if (req.user.rol !== 'admin') q = q.eq('id_usuario', req.user.id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: 'Error' });
  res.json(data || []);
});

app.post('/api/vehicles', requireAuth, async (req, res) => {
  const { marca, modelo, placa, cilindraje, anio, color } = req.body;
  if (!marca || !modelo || !placa) return res.status(400).json({ error: 'Marca, modelo y placa obligatorios' });
  const { data, error } = await supabase.from('vehiculo')
    .insert([{ id_usuario: req.user.id, marca, modelo, placa, cilindraje, anio, color }])
    .select().single();
  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Placa ya registrada' });
    return res.status(500).json({ error: 'Error: ' + error.message });
  }
  res.status(201).json(data);
});

app.patch('/api/vehicles/:id', requireAuth, async (req, res) => {
  const updates = {};
  ['marca','modelo','placa','cilindraje','anio','color'].forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  let q = supabase.from('vehiculo').update(updates).eq('id_vehiculo', req.params.id);
  if (req.user.rol !== 'admin') q = q.eq('id_usuario', req.user.id);
  const { data, error } = await q.select().single();
  if (error || !data) return res.status(404).json({ error: 'No encontrado o sin permiso' });
  res.json(data);
});

app.delete('/api/vehicles/:id', requireAuth, async (req, res) => {
  let q = supabase.from('vehiculo').delete().eq('id_vehiculo', req.params.id);
  if (req.user.rol !== 'admin') q = q.eq('id_usuario', req.user.id);
  const { error } = await q;
  if (error) return res.status(500).json({ error: 'Error' });
  res.json({ message: 'Eliminado' });
});

// ── ALERTS ───────────────────────────────────────────────────
app.get('/api/alerts', requireAuth, async (req, res) => {
  let q = supabase.from('alerta').select('*').order('fecha_hora', { ascending: false }).limit(50);
  if (req.user.rol !== 'admin') {
    const { data: veh } = await supabase.from('vehiculo').select('id_vehiculo').eq('id_usuario', req.user.id);
    const ids = (veh || []).map(v => v.id_vehiculo);
    if (!ids.length) return res.json([]);
    q = q.in('id_vehiculo', ids);
  }
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: 'Error' });
  res.json(data || []);
});

app.post('/api/alerts', requireAuth, async (req, res) => {
  const { id_vehiculo, tipo_incidencia, latitud, longitud } = req.body;
  if (!tipo_incidencia || latitud === undefined || longitud === undefined)
    return res.status(400).json({ error: 'Faltan campos' });
  const { data, error } = await supabase.from('alerta')
    .insert([{ id_vehiculo, tipo_incidencia, latitud, longitud, estado_alerta: 'pendiente' }])
    .select().single();
  if (error) return res.status(500).json({ error: 'Error' });
  res.status(201).json(data);
});

app.patch('/api/alerts/:id', requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('alerta').update({ estado_alerta: req.body.estado_alerta })
    .eq('id_alerta', req.params.id).select().single();
  if (error) return res.status(500).json({ error: 'Error' });
  res.json(data);
});

// ── HEATMAP ──────────────────────────────────────────────────
app.get('/api/heatmap', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('alerta')
    .select('latitud, longitud, tipo_incidencia').not('latitud', 'is', null).not('longitud', 'is', null).limit(500);
  if (error) return res.status(500).json({ error: 'Error' });
  res.json((data || []).map(a => ({
    lat: parseFloat(a.latitud), lng: parseFloat(a.longitud),
    weight: a.tipo_incidencia === 'Robo' ? 1.0 : a.tipo_incidencia === 'Movimiento' ? 0.7 : 0.4,
  })));
});

// ── ROUTES ───────────────────────────────────────────────────
app.get('/api/routes', requireAuth, async (req, res) => {
  let q = supabase.from('ruta').select('*').order('fecha_inicio', { ascending: false });
  if (req.user.rol !== 'admin') {
    const { data: veh } = await supabase.from('vehiculo').select('id_vehiculo').eq('id_usuario', req.user.id);
    const ids = (veh || []).map(v => v.id_vehiculo);
    if (!ids.length) return res.json([]);
    q = q.in('id_vehiculo', ids);
  }
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: 'Error' });
  res.json(data || []);
});

// ── EMERGENCY CONTACTS ───────────────────────────────────────
app.get('/api/emergency-contacts', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('contacto_emergencia')
    .select('*').eq('id_usuario', req.user.id).order('orden_prioridad');
  if (error) return res.status(500).json({ error: 'Error' });
  res.json(data || []);
});

app.post('/api/emergency-contacts', requireAuth, async (req, res) => {
  const { nombre, telefono, orden_prioridad } = req.body;
  if (!nombre || !telefono) return res.status(400).json({ error: 'Nombre y teléfono obligatorios' });
  const { data, error } = await supabase.from('contacto_emergencia')
    .insert([{ id_usuario: req.user.id, nombre, telefono, orden_prioridad: orden_prioridad || 1 }])
    .select().single();
  if (error) return res.status(500).json({ error: 'Error' });
  res.status(201).json(data);
});

app.delete('/api/emergency-contacts/:id', requireAuth, async (req, res) => {
  const { error } = await supabase.from('contacto_emergencia')
    .delete().eq('id_contacto', req.params.id).eq('id_usuario', req.user.id);
  if (error) return res.status(500).json({ error: 'Error' });
  res.json({ message: 'Eliminado' });
});

// ── Reemplaza estas 2 rutas en tu server.js ──────────────────

// GET /api/config/:vehiculoId
// Ahora devuelve objeto vacío si no existe (no 404)
app.get('/api/config/:vehiculoId', requireAuth, async (req, res) => {
  const { data } = await supabase
    .from('configuracion_sistema')
    .select('*')
    .eq('id_vehiculo', req.params.vehiculoId)
    .single();

  // Si no existe, devolver valores por defecto (no error)
  if (!data) {
    return res.json({
      id_vehiculo:         parseInt(req.params.vehiculoId),
      modo_seguridad:      'armado',
      umbral_apagado_ms:   10,
      radio_proximidad_cm: 45,
      alertas_movimiento:  true,
      rastreo_continuo:    true,
    });
  }
  res.json(data);
});

// POST /api/config
// Upsert — crea si no existe, actualiza si existe
app.post('/api/config', requireAuth, async (req, res) => {
  const {
    id_vehiculo, modo_seguridad,
    umbral_apagado_ms, radio_proximidad_cm,
    alertas_movimiento, rastreo_continuo
  } = req.body;

  if (!id_vehiculo) return res.status(400).json({ error: 'id_vehiculo requerido' });

  // Verificar que el vehículo pertenece al usuario (o es admin)
  if (req.user.rol !== 'admin') {
    const { data: veh } = await supabase
      .from('vehiculo')
      .select('id_vehiculo')
      .eq('id_vehiculo', id_vehiculo)
      .eq('id_usuario', req.user.id)
      .single();
    if (!veh) return res.status(403).json({ error: 'Vehículo no encontrado o sin permiso' });
  }

  const { data, error } = await supabase
    .from('configuracion_sistema')
    .upsert(
      {
        id_vehiculo,
        modo_seguridad,
        umbral_apagado_ms,
        radio_proximidad_cm,
        alertas_movimiento,
        rastreo_continuo,
      },
      { onConflict: 'id_vehiculo' }
    )
    .select()
    .single();

  if (error) {
    console.log('Config upsert error:', error);
    return res.status(500).json({ error: 'Error al guardar: ' + error.message });
  }
  res.json(data);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`MOTOGUARD API en puerto ${PORT}`));