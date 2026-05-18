require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet    = require('helmet');

try {
  if (typeof globalThis !== 'undefined' && !globalThis.WebSocket) {
    globalThis.WebSocket = require('ws');
  }
} catch (_) {}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10kb' }));


const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Intenta en un minuto.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera 15 minutos.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Límite de registros alcanzado. Espera 1 hora.' },
});

app.use('/api', generalLimiter);


const ROLES_VALIDOS      = ['admin', 'supervisor', 'tecnico', 'usuario'];
const ESTADOS_ALERTA     = ['activo', 'resuelto'];
const ESTADOS_INFORME    = ['enviado', 'revisado', 'archivado'];
const CAMPOS_VEHICULO    = ['marca', 'modelo', 'placa', 'cilindraje', 'anio', 'color'];
const TABLAS_BACKUP      = ['usuario', 'vehiculo', 'alerta', 'ruta', 'contacto_emergencia', 'configuracion_sistema'];
const BCRYPT_ROUNDS      = 8;
const DUMMY_HASH         = '$2b$10$rhRAZMCBeKFz9J9EHJs3wO.sx0HVeNaLpVbNrDDlPCb0l9AKP3MjS';
const CONFIG_DEFAULTS    = {
  modo_seguridad:      'armado',
  umbral_apagado_ms:   10,
  radio_proximidad_cm: 45,
  alertas_movimiento:  true,
  rastreo_continuo:    true,
};


function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores' });
  }
  next();
}

function requireSupervisor(req, res, next) {
  if (!['admin', 'supervisor'].includes(req.user?.rol)) {
    return res.status(403).json({ error: 'Requiere rol supervisor o superior' });
  }
  next();
}

function requireTecnico(req, res, next) {
  if (!['admin', 'supervisor', 'tecnico'].includes(req.user?.rol)) {
    return res.status(403).json({ error: 'Requiere rol técnico o superior' });
  }
  next();
}

function puedeVerTodo(rol) {
  return ['admin', 'supervisor'].includes(rol);
}


const registrarAccion = async (id_usuario, accion, detalle, req) => {
  try {
    await supabase.from('auditoria').insert([{
      id_usuario,
      accion,
      detalle,
      ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    }]);
  } catch (_) {}
};

const calcularSaludBD = (latencia, conectada) => {
  if (!conectada) return 0;
  if (latencia < 100) return 95;
  if (latencia < 300) return 75;
  if (latencia < 500) return 55;
  return 35;
};

const calcularSaludBackend = (latencia) => {
  if (latencia < 50)  return 98;
  if (latencia < 150) return 85;
  if (latencia < 300) return 65;
  return 45;
};

const calcularPesoHeatmap = (tipo, fechaHora) => {
  const t = (tipo || '').toLowerCase();
  const pesoTipo = (t.includes('robo') || t.includes('emergencia')) ? 1.0
    : (t.includes('sospech') || t.includes('accidente')) ? 0.7
    : 0.4;

  const diasAtras = (Date.now() - new Date(fechaHora).getTime()) / (1000 * 60 * 60 * 24);
  const pesoTiempo = diasAtras <= 1 ? 1.0 : diasAtras <= 7 ? 0.8 : diasAtras <= 30 ? 0.5 : 0.25;

  return pesoTipo * pesoTiempo;
};

const obtenerVehiculosDelUsuario = async (idUsuario) => {
  const { data } = await supabase.from('vehiculo').select('id_vehiculo').eq('id_usuario', idUsuario);
  return (data || []).map(v => v.id_vehiculo);
};


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date() });
});


app.post('/api/auth/register', registerLimiter, async (req, res) => {
  const { nombre_completo, correo_electronico, telefono, direccion, password } = req.body;

  if (!nombre_completo || !correo_electronico || !password) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Contraseña mínimo 8 caracteres' });
  }

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const { data, error } = await supabase
    .from('usuario')
    .insert([{ nombre_completo, correo_electronico, telefono, direccion, password_hash: hash, rol: 'usuario', activo: false }])
    .select('id_usuario, nombre_completo, correo_electronico, rol, activo')
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Correo ya registrado' });
    return res.status(500).json({ error: 'Error al registrar' });
  }

  res.status(201).json({
    message: 'Cuenta creada. El administrador activará tu cuenta en breve.',
    user: data,
  });
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { correo_electronico, password } = req.body;

  if (!correo_electronico || !password) {
    return res.status(400).json({ error: 'Credenciales requeridas' });
  }

  const { data: usuario } = await supabase
    .from('usuario')
    .select('id_usuario, nombre_completo, correo_electronico, rol, area, password_hash, telefono, direccion, activo, plan_suscripcion')
    .eq('correo_electronico', correo_electronico)
    .single();

  const hashAComparar      = usuario ? usuario.password_hash : DUMMY_HASH;
  const credencialesValidas = await bcrypt.compare(password, hashAComparar);

  if (!usuario || !credencialesValidas) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }
  if (!usuario.activo && usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Cuenta pendiente de activación. Contacta al administrador.' });
  }

  const token = jwt.sign(
    { id: usuario.id_usuario, rol: usuario.rol, area: usuario.area || null },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  const { password_hash: _, ...datosPublicos } = usuario;
  await registrarAccion(usuario.id_usuario, 'login', 'Inicio de sesión', req);
  res.json({ token, user: datosPublicos });
});

app.patch('/api/auth/change-password', requireAuth, async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Faltan campos' });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: 'Mínimo 8 caracteres' });
  }

  const { data: usuario } = await supabase
    .from('usuario')
    .select('password_hash')
    .eq('id_usuario', req.user.id)
    .single();

  const passwordCorrecta = await bcrypt.compare(current_password, usuario.password_hash);
  if (!passwordCorrecta) {
    return res.status(401).json({ error: 'Contraseña actual incorrecta' });
  }

  const nuevoHash = await bcrypt.hash(new_password, BCRYPT_ROUNDS);
  await supabase.from('usuario').update({ password_hash: nuevoHash }).eq('id_usuario', req.user.id);
  await registrarAccion(req.user.id, 'cambio_password', 'Contraseña actualizada', req);
  res.json({ message: 'Contraseña actualizada' });
});


app.get('/api/users/me', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('usuario')
    .select('id_usuario, nombre_completo, correo_electronico, telefono, direccion, rol, area, fecha_registro, plan_suscripcion, activo, fecha_activacion')
    .eq('id_usuario', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'No encontrado' });
  res.json(data);
});

app.patch('/api/users/me', requireAuth, async (req, res) => {
  const camposPermitidos = ['nombre_completo', 'telefono', 'direccion'];
  const actualizaciones  = {};

  camposPermitidos.forEach(campo => {
    if (req.body[campo] !== undefined) actualizaciones[campo] = req.body[campo];
  });

  const { data, error } = await supabase
    .from('usuario')
    .update(actualizaciones)
    .eq('id_usuario', req.user.id)
    .select('id_usuario, nombre_completo, correo_electronico, telefono, direccion, rol, activo')
    .single();

  if (error) return res.status(500).json({ error: 'Error al actualizar' });
  await registrarAccion(req.user.id, 'actualizar_perfil', `Campos: ${Object.keys(actualizaciones).join(', ')}`, req);
  res.json(data);
});


app.get('/api/admin/stats', requireAuth, requireAdmin, async (req, res) => {
  const [usuariosRes, alertasRes, vehiculosRes, rutasRes] = await Promise.all([
    supabase.from('usuario').select('id_usuario, activo, rol', { count: 'exact' }),
    supabase.from('alerta').select('id_alerta, estado_alerta, fecha_hora', { count: 'exact' }),
    supabase.from('vehiculo').select('id_vehiculo', { count: 'exact' }),
    supabase.from('ruta').select('id_ruta', { count: 'exact' }),
  ]);

  const usuarios = usuariosRes.data || [];
  const alertas  = alertasRes.data  || [];
  const hoy      = new Date().toISOString().split('T')[0];

  res.json({
    usuarios: {
      total:        usuariosRes.count || 0,
      activos:      usuarios.filter(u => u.activo).length,
      pendientes:   usuarios.filter(u => !u.activo && u.rol !== 'admin').length,
      admins:       usuarios.filter(u => u.rol === 'admin').length,
      supervisores: usuarios.filter(u => u.rol === 'supervisor').length,
      tecnicos:     usuarios.filter(u => u.rol === 'tecnico').length,
    },
    alertas: {
      total:   alertasRes.count || 0,
      activas: alertas.filter(a => a.estado_alerta === 'activo').length,
      hoy:     alertas.filter(a => a.fecha_hora?.startsWith(hoy)).length,
    },
    vehiculos: vehiculosRes.count || 0,
    rutas:     rutasRes.count     || 0,
  });
});

app.get('/api/admin/users', requireAuth, requireSupervisor, async (req, res) => {
  const { search, activo, desde, hasta, page = 1, limit = 100 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let consulta = supabase
    .from('usuario')
    .select('id_usuario, nombre_completo, correo_electronico, rol, area, telefono, fecha_registro, plan_suscripcion, activo, fecha_activacion', { count: 'exact' })
    .order('fecha_registro', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (search?.trim()) {
    consulta = consulta.or(`nombre_completo.ilike.%${search}%,correo_electronico.ilike.%${search}%,telefono.ilike.%${search}%`);
  }
  if (activo !== undefined && activo !== '') consulta = consulta.eq('activo', activo === 'true');
  if (desde) consulta = consulta.gte('fecha_registro', desde);
  if (hasta) consulta = consulta.lte('fecha_registro', hasta + 'T23:59:59');

  const { data, error, count } = await consulta;
  if (error) return res.status(500).json({ error: 'Error al obtener usuarios' });

  res.json({
    users: data || [],
    total: count || 0,
    page:  parseInt(page),
    pages: Math.ceil((count || 0) / parseInt(limit)),
  });
});

app.post('/api/admin/users/create', requireAuth, requireAdmin, async (req, res) => {
  const { nombre_completo, correo_electronico, telefono, direccion, password, rol, area } = req.body;

  if (!nombre_completo || !correo_electronico || !password) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
  }
  if (password.length < 8) return res.status(400).json({ error: 'Mínimo 8 caracteres' });
  if (!ROLES_VALIDOS.includes(rol)) return res.status(400).json({ error: 'Rol inválido' });

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const { data, error } = await supabase
    .from('usuario')
    .insert([{
      nombre_completo,
      correo_electronico,
      telefono,
      direccion,
      password_hash:    hash,
      rol,
      area:             rol === 'supervisor' ? area : null,
      activo:           true,
      fecha_activacion: new Date().toISOString(),
    }])
    .select('id_usuario, nombre_completo, correo_electronico, rol, activo')
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Correo ya registrado' });
    return res.status(500).json({ error: 'Error al crear usuario' });
  }

  await registrarAccion(req.user.id, 'crear_usuario', `${rol}: ${correo_electronico}`, req);
  res.status(201).json(data);
});

app.post('/api/admin/users/bulk-action', requireAuth, requireAdmin, async (req, res) => {
  const { ids, action } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Lista de IDs requerida' });
  }
  if (!['activate', 'deactivate', 'delete'].includes(action)) {
    return res.status(400).json({ error: 'Acción inválida' });
  }

  const { data: admins } = await supabase
    .from('usuario')
    .select('id_usuario')
    .in('id_usuario', ids)
    .eq('rol', 'admin');

  if (admins?.length > 0) {
    return res.status(403).json({ error: 'No se pueden modificar cuentas de administrador' });
  }

  const operaciones = {
    activate:   () => supabase.from('usuario').update({ activo: true, fecha_activacion: new Date().toISOString() }).in('id_usuario', ids),
    deactivate: () => supabase.from('usuario').update({ activo: false }).in('id_usuario', ids),
    delete:     () => supabase.from('usuario').delete().in('id_usuario', ids),
  };

  const { error } = await operaciones[action]();
  if (error) return res.status(500).json({ error: error.message });

  const etiquetas = { activate: 'activados', deactivate: 'desactivados', delete: 'eliminados' };
  await registrarAccion(req.user.id, `bulk_${action}`, `IDs: ${ids.join(',')}`, req);

  res.json({
    message:  `${ids.length} usuario${ids.length !== 1 ? 's' : ''} ${etiquetas[action]}`,
    affected: ids.length,
  });
});

app.patch('/api/admin/users/:id/toggle-active', requireAuth, requireSupervisor, async (req, res) => {
  const { activo } = req.body;
  const actualizaciones = { activo };
  if (activo) actualizaciones.fecha_activacion = new Date().toISOString();

  const { data, error } = await supabase
    .from('usuario')
    .update(actualizaciones)
    .eq('id_usuario', req.params.id)
    .select('id_usuario, nombre_completo, activo, fecha_activacion')
    .single();

  if (error) return res.status(500).json({ error: 'Error al actualizar estado' });

  const accion = activo ? 'activar_usuario' : 'desactivar_usuario';
  await registrarAccion(req.user.id, accion, `Usuario ID: ${req.params.id}`, req);
  res.json(data);
});

app.patch('/api/admin/users/:id/reset-password', requireAuth, requireAdmin, async (req, res) => {
  const { new_password } = req.body;

  if (!new_password || new_password.length < 8) {
    return res.status(400).json({ error: 'Mínimo 8 caracteres' });
  }

  const nuevoHash = await bcrypt.hash(new_password, BCRYPT_ROUNDS);
  await supabase.from('usuario').update({ password_hash: nuevoHash }).eq('id_usuario', req.params.id);
  await registrarAccion(req.user.id, 'reset_password', `Usuario ID: ${req.params.id}`, req);
  res.json({ message: 'Contraseña reseteada' });
});

app.patch('/api/admin/users/:id/role', requireAuth, requireAdmin, async (req, res) => {
  const { rol } = req.body;

  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  const { data, error } = await supabase
    .from('usuario')
    .update({ rol })
    .eq('id_usuario', req.params.id)
    .select('id_usuario, nombre_completo, rol')
    .single();

  if (error) return res.status(500).json({ error: 'Error al cambiar rol' });
  await registrarAccion(req.user.id, 'cambio_rol', `Usuario ${req.params.id} → ${rol}`, req);
  res.json(data);
});

app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  const { error } = await supabase.from('usuario').delete().eq('id_usuario', req.params.id);
  if (error) return res.status(500).json({ error: 'Error al eliminar' });

  await registrarAccion(req.user.id, 'eliminar_usuario', `Usuario ID: ${req.params.id}`, req);
  res.json({ message: 'Usuario eliminado' });
});

app.get('/api/admin/auditoria', requireAuth, requireSupervisor, async (req, res) => {
  const { id_usuario, accion, limit = 100 } = req.query;

  let consulta = supabase
    .from('auditoria')
    .select('*, usuario(nombre_completo, correo_electronico, rol)')
    .order('fecha_hora', { ascending: false })
    .limit(parseInt(limit));

  if (id_usuario) consulta = consulta.eq('id_usuario', id_usuario);
  if (accion)     consulta = consulta.eq('accion', accion);

  const { data, error } = await consulta;
  if (error) return res.status(500).json({ error: 'Error al obtener auditoría' });
  res.json(data || []);
});

app.get('/api/admin/health', requireAuth, requireAdmin, async (req, res) => {
  const inicio = Date.now();
  let latenciaBD = null, bdConectada = false;

  try {
    const t = Date.now();
    const { error } = await supabase.from('usuario').select('id_usuario').limit(1);
    latenciaBD  = Date.now() - t;
    bdConectada = !error;
  } catch (_) {}

  const memoria         = process.memoryUsage();
  const memUsadaMB      = Math.round(memoria.heapUsed  / 1024 / 1024);
  const memTotalMB      = Math.round(memoria.heapTotal / 1024 / 1024);
  const memPct          = Math.round((memoria.heapUsed / memoria.heapTotal) * 100);
  const uptimeSecs      = Math.round(process.uptime());
  const latenciaBackend = Date.now() - inicio;

  const [usuariosRes, alertasRes, vehiculosRes] = await Promise.all([
    supabase.from('usuario').select('id_usuario, activo', { count: 'exact' }),
    supabase.from('alerta').select('id_alerta', { count: 'exact' }),
    supabase.from('vehiculo').select('id_vehiculo', { count: 'exact' }),
  ]);

  res.json({
    status:   bdConectada ? 'ok' : 'degraded',
    backend:  {
      health:       calcularSaludBackend(latenciaBackend),
      latency_ms:   latenciaBackend,
      uptime:       `${Math.floor(uptimeSecs / 3600)}h ${Math.floor((uptimeSecs % 3600) / 60)}m`,
      node_version: process.version,
    },
    database: {
      health:     calcularSaludBD(latenciaBD, bdConectada),
      latency_ms: latenciaBD,
      connected:  bdConectada,
      counts: {
        usuarios:  usuariosRes.count  || 0,
        alertas:   alertasRes.count   || 0,
        vehiculos: vehiculosRes.count || 0,
      },
    },
    memory: {
      health:   100 - memPct,
      used_mb:  memUsadaMB,
      total_mb: memTotalMB,
      percent:  memPct,
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/admin/backup', requireAuth, requireAdmin, async (req, res) => {
  const backup = { exportado_en: new Date().toISOString(), tablas: {} };

  for (const tabla of TABLAS_BACKUP) {
    const { data } = await supabase.from(tabla).select('*');
    backup.tablas[tabla] = data || [];
  }

  await registrarAccion(req.user.id, 'backup', 'Descarga de backup completo', req);
  const fecha = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Disposition', `attachment; filename=motoguard_backup_${fecha}.json`);
  res.setHeader('Content-Type', 'application/json');
  res.json(backup);
});


app.get('/api/vehicles', requireAuth, async (req, res) => {
  let consulta = supabase.from('vehiculo').select('*');
  if (req.user.rol !== 'admin') consulta = consulta.eq('id_usuario', req.user.id);

  const { data, error } = await consulta;
  if (error) return res.status(500).json({ error: 'Error al obtener vehículos' });
  res.json(data || []);
});

app.get('/api/vehicles/mine', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('vehiculo')
    .select('*')
    .eq('id_usuario', req.user.id);

  if (error) return res.status(500).json({ error: 'Error al obtener vehículos' });
  res.json(data || []);
});

app.post('/api/vehicles', requireAuth, async (req, res) => {
  const { marca, modelo, placa, cilindraje, anio, color } = req.body;

  if (!marca || !modelo || !placa) {
    return res.status(400).json({ error: 'Marca, modelo y placa son obligatorios' });
  }

  const { data, error } = await supabase
    .from('vehiculo')
    .insert([{ id_usuario: req.user.id, marca, modelo, placa, cilindraje, anio, color }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Placa ya registrada' });
    return res.status(500).json({ error: 'Error al registrar vehículo' });
  }

  await registrarAccion(req.user.id, 'crear_vehiculo', `Placa: ${placa}`, req);
  res.status(201).json(data);
});

app.patch('/api/vehicles/:id', requireAuth, async (req, res) => {
  const actualizaciones = {};
  CAMPOS_VEHICULO.forEach(campo => {
    if (req.body[campo] !== undefined) actualizaciones[campo] = req.body[campo];
  });

  let consulta = supabase.from('vehiculo').update(actualizaciones).eq('id_vehiculo', req.params.id);
  if (req.user.rol !== 'admin') consulta = consulta.eq('id_usuario', req.user.id);

  const { data, error } = await consulta.select().single();
  if (error || !data) return res.status(404).json({ error: 'Vehículo no encontrado o sin permiso' });
  res.json(data);
});

app.delete('/api/vehicles/:id', requireAuth, async (req, res) => {
  let consulta = supabase.from('vehiculo').delete().eq('id_vehiculo', req.params.id);
  if (req.user.rol !== 'admin') consulta = consulta.eq('id_usuario', req.user.id);

  const { error } = await consulta;
  if (error) return res.status(500).json({ error: 'Error al eliminar vehículo' });

  await registrarAccion(req.user.id, 'eliminar_vehiculo', `ID: ${req.params.id}`, req);
  res.json({ message: 'Vehículo eliminado' });
});


app.get('/api/alerts', requireAuth, async (req, res) => {
  let consulta = supabase
    .from('alerta')
    .select('*')
    .order('fecha_hora', { ascending: false })
    .limit(100);

  if (!puedeVerTodo(req.user.rol)) {
    const vehiculoIds = await obtenerVehiculosDelUsuario(req.user.id);
    if (!vehiculoIds.length) return res.json([]);
    consulta = consulta.in('id_vehiculo', vehiculoIds);
  }

  const { data, error } = await consulta;
  if (error) return res.status(500).json({ error: 'Error al obtener alertas' });
  res.json(data || []);
});

app.post('/api/alerts', requireAuth, async (req, res) => {
  const { id_vehiculo, tipo_incidencia, latitud, longitud } = req.body;

  if (!tipo_incidencia || latitud === undefined || longitud === undefined) {
    return res.status(400).json({ error: 'tipo_incidencia, latitud y longitud son obligatorios' });
  }

  const { data, error } = await supabase
    .from('alerta')
    .insert([{ id_vehiculo, tipo_incidencia, latitud, longitud, estado_alerta: 'activo', id_usuario: req.user.id }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Error al registrar alerta' });
  res.status(201).json(data);
});

app.patch('/api/alerts/:id', requireAuth, requireSupervisor, async (req, res) => {
  const { estado_alerta } = req.body;

  if (!ESTADOS_ALERTA.includes(estado_alerta)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const { data, error } = await supabase
    .from('alerta')
    .update({ estado_alerta })
    .eq('id_alerta', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Error al actualizar alerta' });
  await registrarAccion(req.user.id, 'cambio_estado_alerta', `Alerta ${req.params.id} → ${estado_alerta}`, req);
  res.json(data);
});

app.delete('/api/alerts/:id', requireAuth, async (req, res) => {
  let consulta = supabase.from('alerta').delete().eq('id_alerta', req.params.id);
  if (!puedeVerTodo(req.user.rol)) consulta = consulta.eq('id_usuario', req.user.id);

  const { error } = await consulta;
  if (error) return res.status(500).json({ error: 'Error al eliminar alerta' });
  res.json({ message: 'Alerta eliminada' });
});


app.get('/api/heatmap', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('alerta')
    .select('latitud, longitud, tipo_incidencia, fecha_hora')
    .not('latitud', 'is', null)
    .not('longitud', 'is', null)
    .eq('estado_alerta', 'activo')
    .limit(500);

  if (error) return res.status(500).json({ error: 'Error al obtener datos del mapa' });

  const puntos = (data || []).map(alerta => ({
    lat:    parseFloat(alerta.latitud),
    lng:    parseFloat(alerta.longitud),
    weight: calcularPesoHeatmap(alerta.tipo_incidencia, alerta.fecha_hora),
  }));

  res.json(puntos);
});


app.get('/api/routes', requireAuth, async (req, res) => {
  let consulta = supabase.from('ruta').select('*, vehiculo:id_vehiculo(id_vehiculo, marca, modelo, placa, id_usuario)').order('fecha_inicio', { ascending: false });

  if (!puedeVerTodo(req.user.rol)) {
    const vehiculoIds = await obtenerVehiculosDelUsuario(req.user.id);
    if (!vehiculoIds.length) return res.json([]);
    consulta = consulta.in('id_vehiculo', vehiculoIds);
  } else if (req.query.id_usuario) {
    const { data: vehs } = await supabase
      .from('vehiculo')
      .select('id_vehiculo')
      .eq('id_usuario', req.query.id_usuario);
    const ids = (vehs || []).map(v => v.id_vehiculo);
    if (!ids.length) return res.json([]);
    consulta = consulta.in('id_vehiculo', ids);
  }

  const { data, error } = await consulta.limit(50);
  if (error) return res.status(500).json({ error: 'Error al obtener rutas' });
  res.json(data || []);
});


app.get('/api/emergency-contacts', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('contacto_emergencia')
    .select('*')
    .eq('id_usuario', req.user.id)
    .order('orden_prioridad');

  if (error) return res.status(500).json({ error: 'Error al obtener contactos' });
  res.json(data || []);
});

app.post('/api/emergency-contacts', requireAuth, async (req, res) => {
  const { nombre, telefono, orden_prioridad } = req.body;

  if (!nombre || !telefono) {
    return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' });
  }

  const { data, error } = await supabase
    .from('contacto_emergencia')
    .insert([{ id_usuario: req.user.id, nombre, telefono, orden_prioridad: orden_prioridad || 1 }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Error al crear contacto' });
  res.status(201).json(data);
});

app.delete('/api/emergency-contacts/:id', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('contacto_emergencia')
    .delete()
    .eq('id_contacto', req.params.id)
    .eq('id_usuario', req.user.id);

  if (error) return res.status(500).json({ error: 'Error al eliminar contacto' });
  res.json({ message: 'Contacto eliminado' });
});


app.get('/api/config/:vehiculoId', requireAuth, async (req, res) => {
  const { data } = await supabase
    .from('configuracion_sistema')
    .select('*')
    .eq('id_vehiculo', req.params.vehiculoId)
    .single();

  if (!data) {
    return res.json({ id_vehiculo: parseInt(req.params.vehiculoId), ...CONFIG_DEFAULTS });
  }
  res.json(data);
});

app.post('/api/config', requireAuth, async (req, res) => {
  const { id_vehiculo, modo_seguridad, umbral_apagado_ms, radio_proximidad_cm, alertas_movimiento, rastreo_continuo } = req.body;

  if (!id_vehiculo) return res.status(400).json({ error: 'id_vehiculo requerido' });

  if (req.user.rol !== 'admin') {
    const { data: vehiculo } = await supabase
      .from('vehiculo')
      .select('id_vehiculo')
      .eq('id_vehiculo', id_vehiculo)
      .eq('id_usuario', req.user.id)
      .single();

    if (!vehiculo) return res.status(403).json({ error: 'Sin permiso para este vehículo' });
  }

  const { data, error } = await supabase
    .from('configuracion_sistema')
    .upsert(
      [{ id_vehiculo, modo_seguridad, umbral_apagado_ms, radio_proximidad_cm, alertas_movimiento, rastreo_continuo }],
      { onConflict: 'id_vehiculo' }
    )
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Error al guardar configuración' });
  res.json(data);
});


app.post('/api/iot/telemetry', async (req, res) => {
  const claveDispositivo = req.headers['x-device-api-key'];

  if (claveDispositivo !== process.env.IOT_API_KEY) {
    return res.status(401).json({ error: 'API key inválida' });
  }

  res.status(202).json({ received: true });
});


app.get('/api/supervisor/stats', requireAuth, requireSupervisor, async (req, res) => {
  const [alertasRes, rutasRes, usuariosRes] = await Promise.all([
    supabase.from('alerta').select('id_alerta, estado_alerta, tipo_incidencia, fecha_hora', { count: 'exact' }),
    supabase.from('ruta').select('id_ruta, estado_viaje', { count: 'exact' }),
    supabase.from('usuario').select('id_usuario, activo, rol', { count: 'exact' }),
  ]);

  const alertas  = alertasRes.data  || [];
  const usuarios = usuariosRes.data || [];
  const hoy      = new Date().toISOString().split('T')[0];

  res.json({
    alertas: {
      total:   alertasRes.count || 0,
      activas: alertas.filter(a => a.estado_alerta === 'activo').length,
      hoy:     alertas.filter(a => a.fecha_hora?.startsWith(hoy)).length,
    },
    rutas:    { total: rutasRes.count || 0 },
    usuarios: {
      total:   usuariosRes.count || 0,
      activos: usuarios.filter(u => u.activo).length,
    },
  });
});


app.get('/api/tecnico/devices', requireAuth, requireTecnico, async (req, res) => {
  const { data, error } = await supabase
    .from('dispositivo_iot')
    .select('*, vehiculo(marca, modelo, placa, usuario(nombre_completo))');

  if (error) return res.status(500).json({ error: 'Error al obtener dispositivos' });
  res.json(data || []);
});


app.get('/api/informes', requireAuth, requireSupervisor, async (req, res) => {
  let consulta = supabase
    .from('informe')
    .select('*, usuario:id_autor(nombre_completo, correo_electronico, rol, area)')
    .order('fecha_creacion', { ascending: false });

  if (req.user.rol !== 'admin') {
    consulta = consulta.eq('id_autor', req.user.id);
  }

  const { data, error } = await consulta;
  if (error) return res.status(500).json({ error: 'Error al obtener informes' });
  res.json(data || []);
});

app.post('/api/informes', requireAuth, async (req, res) => {
  if (req.user.rol !== 'supervisor') {
    return res.status(403).json({ error: 'Solo supervisores pueden crear informes' });
  }

  const { titulo, periodo_desde, periodo_hasta, resumen, observaciones, incidencias_count } = req.body;

  if (!titulo || !periodo_desde || !periodo_hasta || !resumen) {
    return res.status(400).json({ error: 'Título, período y resumen son obligatorios' });
  }

  const { data, error } = await supabase
    .from('informe')
    .insert([{
      id_autor: req.user.id,
      titulo,
      periodo_desde,
      periodo_hasta,
      resumen,
      observaciones,
      incidencias_count: incidencias_count || 0,
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Error al crear informe' });
  await registrarAccion(req.user.id, 'crear_informe', `Informe: ${titulo}`, req);
  res.status(201).json(data);
});

app.patch('/api/informes/:id', requireAuth, requireAdmin, async (req, res) => {
  const { estado } = req.body;

  if (!ESTADOS_INFORME.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const { data, error } = await supabase
    .from('informe')
    .update({ estado })
    .eq('id_informe', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Error al actualizar informe' });
  res.json(data);
});


const TIPOS_TICKET   = ['calibracion', 'instalacion', 'falla_sensor', 'falla_ble', 'otro'];
const ESTADOS_TICKET = ['pendiente', 'asignado', 'en_proceso', 'resuelto', 'cerrado'];
const PRIORIDADES    = ['alta', 'media', 'baja'];

app.get('/api/tickets', requireAuth, async (req, res) => {
  const rol = req.user.rol;
  let consulta = supabase
    .from('ticket_soporte')
    .select(`
      *,
      usuario_afectado:id_usuario_afectado(id_usuario, nombre_completo, correo_electronico),
      tecnico:id_tecnico_asignado(id_usuario, nombre_completo),
      asignador:asignado_por(id_usuario, nombre_completo),
      vehiculo:id_vehiculo(id_vehiculo, marca, modelo, placa)
    `)
    .order('fecha_creacion', { ascending: false });

  if (rol === 'usuario')  consulta = consulta.eq('id_usuario_afectado', req.user.id);
  if (rol === 'tecnico')  consulta = consulta.eq('id_tecnico_asignado', req.user.id);

  const { data, error } = await consulta;
  if (error) return res.status(500).json({ error: 'Error al obtener tickets' });
  res.json(data || []);
});

app.post('/api/tickets', requireAuth, async (req, res) => {
  const { tipo, titulo, descripcion, id_vehiculo } = req.body;

  if (!tipo || !titulo || !descripcion)
    return res.status(400).json({ error: 'Tipo, título y descripción son obligatorios' });
  if (!TIPOS_TICKET.includes(tipo))
    return res.status(400).json({ error: 'Tipo de ticket inválido' });

  const { data, error } = await supabase
    .from('ticket_soporte')
    .insert([{
      id_usuario_afectado: req.user.id,
      id_vehiculo:         id_vehiculo || null,
      tipo,
      titulo,
      descripcion,
      estado:   'pendiente',
      prioridad: 'media',
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Error al crear ticket' });
  await registrarAccion(req.user.id, 'crear_ticket', `Ticket: ${titulo}`, req);
  res.status(201).json(data);
});

app.patch('/api/tickets/:id/asignar', requireAuth, requireSupervisor, async (req, res) => {
  const { id_tecnico_asignado, prioridad } = req.body;

  if (!id_tecnico_asignado)
    return res.status(400).json({ error: 'Se requiere un técnico' });

  const { data: ticket } = await supabase
    .from('ticket_soporte')
    .select('estado, id_tecnico_asignado')
    .eq('id_ticket', req.params.id)
    .single();

  if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

  if (['asignado', 'en_proceso'].includes(ticket.estado))
    return res.status(409).json({ error: 'El ticket ya está asignado. Espera a que el técnico lo resuelva.' });

  const camposActualizar = {
    id_tecnico_asignado,
    asignado_por:     req.user.id,
    estado:           'asignado',
    fecha_asignacion: new Date().toISOString(),
  };
  if (prioridad && PRIORIDADES.includes(prioridad)) camposActualizar.prioridad = prioridad;

  const { data, error } = await supabase
    .from('ticket_soporte')
    .update(camposActualizar)
    .eq('id_ticket', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Error al asignar ticket' });
  await registrarAccion(req.user.id, 'asignar_ticket', `Ticket #${req.params.id} → técnico ${id_tecnico_asignado}`, req);
  res.json(data);
});

app.patch('/api/tickets/:id/estado', requireAuth, async (req, res) => {
  const { estado, notas_tecnico } = req.body;
  const rol = req.user.rol;

  if (!ESTADOS_TICKET.includes(estado))
    return res.status(400).json({ error: 'Estado inválido' });

  const { data: ticket } = await supabase
    .from('ticket_soporte')
    .select('id_tecnico_asignado, estado')
    .eq('id_ticket', req.params.id)
    .single();

  if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

  if (rol === 'tecnico' && ticket.id_tecnico_asignado !== req.user.id)
    return res.status(403).json({ error: 'No tienes permiso para modificar este ticket' });

  if (rol === 'tecnico' && !['en_proceso', 'resuelto'].includes(estado))
    return res.status(403).json({ error: 'El técnico solo puede marcar en proceso o resuelto' });

  const camposActualizar = { estado };
  if (notas_tecnico)         camposActualizar.notas_tecnico    = notas_tecnico;
  if (estado === 'resuelto') camposActualizar.fecha_resolucion = new Date().toISOString();

  const { data, error } = await supabase
    .from('ticket_soporte')
    .update(camposActualizar)
    .eq('id_ticket', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Error al actualizar ticket' });
  await registrarAccion(req.user.id, 'actualizar_ticket', `Ticket #${req.params.id} → ${estado}`, req);
  res.json(data);
});

app.delete('/api/tickets/:id', requireAuth, requireAdmin, async (req, res) => {
  const { error } = await supabase
    .from('ticket_soporte')
    .delete()
    .eq('id_ticket', req.params.id);

  if (error) return res.status(500).json({ error: 'Error al eliminar ticket' });
  await registrarAccion(req.user.id, 'eliminar_ticket', `Ticket #${req.params.id}`, req);
  res.json({ ok: true });
});

app.patch('/api/admin/users/:id/area', requireAuth, requireSupervisor, async (req, res) => {
  const { area } = req.body;
  const { data, error } = await supabase
    .from('usuario')
    .update({ area: area || null })
    .eq('id_usuario', req.params.id)
    .select('id_usuario, nombre_completo, area')
    .single();

  if (error) return res.status(500).json({ error: 'Error al actualizar área' });
  await registrarAccion(req.user.id, 'actualizar_area', `Usuario #${req.params.id} → área: ${area || 'sin área'}`, req);
  res.json(data);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`MOTOGUARD API en puerto ${PORT}`));