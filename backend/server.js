require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

// Compatibilidad WebSocket Node 18 — ANTES de importar Supabase
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

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

/* ── Middlewares ──────────────────────────────────────────── */
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

/* ── Health ───────────────────────────────────────────────── */
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

/* ── AUTH ─────────────────────────────────────────────────── */
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
  if (!await bcrypt.compare(current_password, u.password_hash))
    return res.status(401).json({ error: 'Contraseña actual incorrecta' });
  await supabase.from('usuario').update({ password_hash: await bcrypt.hash(new_password, 10) }).eq('id_usuario', req.user.id);
  res.json({ message: 'Contraseña actualizada' });
});

/* ── PROFILE ──────────────────────────────────────────────── */
app.get('/api/users/me', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('usuario')
    .select('id_usuario, nombre_completo, correo_electronico, telefono, direccion, rol, fecha_registro, plan_suscripcion, activo, fecha_activacion')
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

/* ── ADMIN — USUARIOS ─────────────────────────────────────── */
app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('usuario')
    .select('id_usuario, nombre_completo, correo_electronico, rol, telefono, fecha_registro, plan_suscripcion, activo, fecha_activacion')
    .order('fecha_registro', { ascending: false });
  if (error) return res.status(500).json({ error: 'Error' });
  res.json(data);
});

app.patch('/api/admin/users/:id/toggle-active', requireAuth, requireAdmin, async (req, res) => {
  const { activo } = req.body;
  const updates = { activo };
  if (activo) updates.fecha_activacion = new Date().toISOString();
  const { data, error } = await supabase.from('usuario').update(updates)
    .eq('id_usuario', req.params.id).select('id_usuario, nombre_completo, activo, fecha_activacion').single();
  if (error) return res.status(500).json({ error: 'Error' });
  res.json(data);
});

app.patch('/api/admin/users/:id/reset-password', requireAuth, requireAdmin, async (req, res) => {
  const { new_password } = req.body;
  if (!new_password || new_password.length < 8) return res.status(400).json({ error: 'Mínimo 8 caracteres' });
  await supabase.from('usuario').update({ password_hash: await bcrypt.hash(new_password, 10) }).eq('id_usuario', req.params.id);
  res.json({ message: 'Contraseña reseteada' });
});

app.patch('/api/admin/users/:id/role', requireAuth, requireAdmin, async (req, res) => {
  const { rol } = req.body;
  if (!['admin', 'usuario'].includes(rol)) return res.status(400).json({ error: 'Rol inválido' });
  const { data, error } = await supabase.from('usuario').update({ rol }).eq('id_usuario', req.params.id)
    .select('id_usuario, nombre_completo, rol').single();
  if (error) return res.status(500).json({ error: 'Error' });
  res.json(data);
});

app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  const { error } = await supabase.from('usuario').delete().eq('id_usuario', req.params.id);
  if (error) return res.status(500).json({ error: 'Error' });
  res.json({ message: 'Usuario eliminado' });
});

/* ── ADMIN — BACKUP ───────────────────────────────────────── */
app.get('/api/admin/backup', requireAuth, requireAdmin, async (req, res) => {
  const tables = ['usuario', 'vehiculo', 'alerta', 'ruta', 'contacto_emergencia', 'configuracion_sistema'];
  const backup = { exportado_en: new Date().toISOString(), tablas: {} };

  for (const table of tables) {
    const { data } = await supabase.from(table).select('*');
    backup.tablas[table] = data || [];
  }

  const fecha = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Disposition', `attachment; filename=motoguard_backup_${fecha}.json`);
  res.setHeader('Content-Type', 'application/json');
  res.json(backup);
});

/* ── VEHICLES ─────────────────────────────────────────────── */
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
  ['marca','modelo','placa','cilindraje','anio','color'].forEach(k => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });
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

/* ── ALERTS ───────────────────────────────────────────────── */
app.get('/api/alerts', requireAuth, async (req, res) => {
  let q = supabase.from('alerta').select('*').order('fecha_hora', { ascending: false }).limit(100);
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

 // POST /api/alerts — nuevo estado: 'activo' en lugar de 'pendiente'
const { data, error } = await supabase.from('alerta')
  .insert([{ id_vehiculo, tipo_incidencia, latitud, longitud, estado_alerta: 'activo', id_usuario: req.user.id }])
  .select().single();
  if (error) return res.status(500).json({ error: 'Error: ' + error.message });
  res.status(201).json(data);
});

app.patch('/api/alerts/:id', requireAuth, requireAdmin, async (req, res) => {
  const { estado_alerta } = req.body;
  if (!['pendiente','activo','resuelto'].includes(estado_alerta))
    return res.status(400).json({ error: 'Estado inválido' });
  const { data, error } = await supabase.from('alerta')
    .update({ estado_alerta }).eq('id_alerta', req.params.id).select().single();
  if (error) return res.status(500).json({ error: 'Error' });
  res.json(data);
});

app.delete('/api/alerts/:id', requireAuth, async (req, res) => {
  console.log('DELETE ALERTS HIT - id:', req.params.id, 'user:', req.user.id, 'rol:', req.user.rol);
  if (req.user.rol === 'admin') {
    await supabase.from('alerta').delete().eq('id_alerta', req.params.id);
    return res.json({ message: 'Eliminado' });
  }
  const { error } = await supabase.from('alerta').delete()
    .eq('id_alerta', req.params.id)
    .eq('id_usuario', req.user.id);
  if (error) return res.status(500).json({ error: 'Error' });
  res.json({ message: 'Eliminado' });
});
// GET /api/heatmap — peso por tipo Y antigüedad
app.get('/api/heatmap', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('alerta')
    .select('latitud, longitud, tipo_incidencia, estado_alerta, fecha_hora')
    .not('latitud', 'is', null).not('longitud', 'is', null)
    .eq('estado_alerta', 'activo')  // solo activos en el heatmap
    .limit(500);
  if (error) return res.status(500).json({ error: 'Error' });

  const ahora = Date.now();
  res.json((data || []).map(a => {
    const t = (a.tipo_incidencia || '').toLowerCase();
    const peso_tipo = t.includes('robo') || t.includes('emergencia') ? 1.0
                    : t.includes('sospech') || t.includes('accidente') ? 0.7 : 0.4;
    
    // Peso por antigüedad — más reciente = más peso
    const diasAtras = (ahora - new Date(a.fecha_hora).getTime()) / (1000 * 60 * 60 * 24);
    const peso_tiempo = diasAtras <= 1 ? 1.0      // último día — máximo
                      : diasAtras <= 7 ? 0.8      // última semana
                      : diasAtras <= 30 ? 0.5     // último mes
                      : 0.25;                      // más antiguo — mínimo

    return {
      lat: parseFloat(a.latitud),
      lng: parseFloat(a.longitud),
      weight: peso_tipo * peso_tiempo,
    };
  }));
});

/* ── ROUTES ───────────────────────────────────────────────── */
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

/* ── EMERGENCY CONTACTS ───────────────────────────────────── */
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

/* ── CONFIG ───────────────────────────────────────────────── */
app.get('/api/config/:vehiculoId', requireAuth, async (req, res) => {
  const { data } = await supabase.from('configuracion_sistema')
    .select('*').eq('id_vehiculo', req.params.vehiculoId).single();
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

app.post('/api/config', requireAuth, async (req, res) => {
  const { id_vehiculo, modo_seguridad, umbral_apagado_ms, radio_proximidad_cm, alertas_movimiento, rastreo_continuo } = req.body;
  if (!id_vehiculo) return res.status(400).json({ error: 'id_vehiculo requerido' });

  if (req.user.rol !== 'admin') {
    const { data: veh } = await supabase.from('vehiculo')
      .select('id_vehiculo').eq('id_vehiculo', id_vehiculo).eq('id_usuario', req.user.id).single();
    if (!veh) return res.status(403).json({ error: 'Sin permiso' });
  }

  const { data, error } = await supabase.from('configuracion_sistema')
    .upsert([{ id_vehiculo, modo_seguridad, umbral_apagado_ms, radio_proximidad_cm, alertas_movimiento, rastreo_continuo }],
      { onConflict: 'id_vehiculo' })
    .select().single();
  if (error) return res.status(500).json({ error: 'Error: ' + error.message });
  res.json(data);
});

/* ── IoT endpoint (preparado para anillo BLE) ─────────────── */
app.post('/api/iot/telemetry', async (req, res) => {
  const apiKey = req.headers['x-device-api-key'];
  if (apiKey !== process.env.IOT_API_KEY)
    return res.status(401).json({ error: 'API key inválida' });
  // Se implementará cuando el hardware esté disponible
  res.status(202).json({ received: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`MOTOGUARD API en puerto ${PORT}`));
