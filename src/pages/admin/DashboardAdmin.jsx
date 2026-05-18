import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { adminService, alertService, ticketService } from '../../services/api';
import api from '../../services/api';

const Card = ({ children, style = {}, onClick }) => (
  <div className={`mg-card${onClick ? ' mg-card-hover' : ''}`} onClick={onClick}
    style={{ padding: '16px 18px', ...style, cursor: onClick ? 'pointer' : 'default' }}>
    {children}
  </div>
);

const Label = ({ children, accion, onAccion }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)' }}>{children}</span>
    {accion && (
      <button onClick={onAccion} style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
        {accion}
      </button>
    )}
  </div>
);

const PuntoDot = ({ color = 'var(--green)', pulso = false, tamano = 7 }) => (
  <div className={pulso ? 'anim-blink' : ''}
    style={{ width: tamano, height: tamano, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
);

const Vacio = ({ mensaje }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '20px 0' }}>{mensaje}</p>
);

const Spinner = ({ size = 24, color = 'var(--accent)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
    style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const colorEstadoSalud = (estado) =>
  estado === 'ok' ? 'var(--green)' : estado === 'degraded' ? 'var(--amber)' : 'var(--accent)';

const textoEstadoSalud = (estado) =>
  estado === 'ok' ? 'SISTEMA OPERATIVO' : estado === 'degraded' ? 'SISTEMA DEGRADADO' : 'ERROR DE CONEXIÓN';

function BarraSalud({ etiqueta, valor, subetiqueta, tooltip }) {
  const [mostrarTooltip, setMostrarTooltip] = useState(false);

  const colorBarra = valor >= 70 ? 'var(--green)'
                   : valor >= 40 ? 'var(--amber)'
                   : 'var(--accent)';

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)' }}>{etiqueta}</span>
            {tooltip && (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <span
                  onMouseEnter={() => setMostrarTooltip(true)}
                  onMouseLeave={() => setMostrarTooltip(false)}
                  style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', cursor: 'help', width: 14, height: 14, borderRadius: '50%', border: '1px solid var(--border-mid)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  ?
                </span>
                {mostrarTooltip && (
                  <div style={{ position: 'absolute', left: 18, top: -4, zIndex: 100, whiteSpace: 'nowrap', background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 6, padding: '6px 10px', fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                    {tooltip}
                  </div>
                )}
              </div>
            )}
          </div>
          {subetiqueta && (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', display: 'block', marginTop: 1 }}>{subetiqueta}</span>
          )}
        </div>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: colorBarra, marginLeft: 8, flexShrink: 0 }}>{valor}%</span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, valor))}%`, background: colorBarra, borderRadius: 2, boxShadow: `0 0 6px ${colorBarra}`, transition: 'width 1s ease-out' }} />
      </div>
    </div>
  );
}

export default function DashboardAdmin({ pendingCount = 0 }) {
  const navigate = useNavigate();

  const [usuarios,      setUsuarios]      = useState([]);
  const [alertas,       setAlertas]       = useState([]);
  const [auditoria,     setAuditoria]     = useState([]);
  const [tickets,       setTickets]       = useState([]);
  const [saludSistema,  setSaludSistema]  = useState(null);
  const [cargando,      setCargando]      = useState(true);
  const [cargandoSalud, setCargandoSalud] = useState(true);

  const safeUsuarios  = Array.isArray(usuarios)  ? usuarios  : [];
  const safeAlertas   = Array.isArray(alertas)   ? alertas   : [];
  const safeAuditoria = Array.isArray(auditoria) ? auditoria : [];
  const safeTickets   = Array.isArray(tickets)   ? tickets   : [];

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [resUsuarios, resAlertas, resTks, resAud] = await Promise.all([
          adminService.getAllUsers(),
          alertService.getAll(),
          ticketService.getAll(),
          adminService.getAuditoria({ limit: 6 }),
        ]);
        const listaUsuarios = Array.isArray(resUsuarios)
          ? resUsuarios
          : (Array.isArray(resUsuarios?.users) ? resUsuarios.users : []);
        setUsuarios(listaUsuarios);
        setAlertas(Array.isArray(resAlertas) ? resAlertas.slice(0, 6) : []);
        setTickets(Array.isArray(resTks)     ? resTks                  : []);
        setAuditoria(Array.isArray(resAud)   ? resAud                  : []);
      } catch (e) { console.error(e); }
      setCargando(false);
    };
    cargarDatos();
  }, []);

  const cargarSalud = useCallback(async () => {
    setCargandoSalud(true);
    try {
      const { data } = await api.get('/admin/health');
      setSaludSistema(data);
    } catch {
      setSaludSistema({
        status:   'error',
        backend:  { health: 0, latency_ms: null, uptime: '—' },
        database: { health: 0, connected: false },
        memory:   { health: 0, used_mb: 0, total_mb: 0 },
      });
    }
    setCargandoSalud(false);
  }, []);

  useEffect(() => {
    cargarSalud();
    const intervalo = setInterval(cargarSalud, 30000);
    return () => clearInterval(intervalo);
  }, [cargarSalud]);

  const usuariosPendientes  = safeUsuarios.filter(u => !u.activo && u.rol !== 'admin');
  const usuariosActivos     = safeUsuarios.filter(u => u.activo);
  const alertasActivas      = safeAlertas.filter(a => a.estado_alerta === 'activo').length;
  const ticketsPendientes   = safeTickets.filter(t => t.estado === 'pendiente').length;
  const ticketsEnCurso      = safeTickets.filter(t => ['asignado', 'en_proceso'].includes(t.estado)).length;

  if (cargando) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner />
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', display: 'block', marginTop: 10 }}>CARGANDO...</span>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          {pendingCount > 0 && (
            <button onClick={() => navigate('/users')} style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.1em', color: 'var(--amber)', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', padding: '3px 10px', borderRadius: 4, cursor: 'pointer', marginBottom: 6, display: 'inline-block' }}>
              {pendingCount} PENDIENTE{pendingCount > 1 ? 'S' : ''} DE ACTIVAR →
            </button>
          )}
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>PANEL DE CONTROL</h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            {safeUsuarios.length} usuarios · {usuariosActivos.length} activos · {safeAlertas.length} alertas
          </span>
        </div>
        <ThemeToggle compact />
      </div>

      {usuariosPendientes.length > 0 && (
        <Card onClick={() => navigate('/users')}
          style={{ marginBottom: 20, background: 'var(--amber-soft)', border: '1px solid var(--amber-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="anim-blink" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 8px var(--amber)', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {usuariosPendientes.length} cuenta{usuariosPendientes.length > 1 ? 's' : ''} pendiente{usuariosPendientes.length > 1 ? 's' : ''} de activación
                </p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {usuariosPendientes.map(u => u.nombre_completo).join(', ')}
                </p>
              </div>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.1em' }}>IR A USUARIOS →</span>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { etiqueta: 'USUARIOS',          valor: safeUsuarios.length,   color: 'var(--text-primary)' },
          { etiqueta: 'ACTIVOS',           valor: usuariosActivos.length, color: 'var(--green)' },
          { etiqueta: 'PENDIENTES',        valor: pendingCount,           color: pendingCount > 0 ? 'var(--amber)' : 'var(--text-muted)' },
          { etiqueta: 'ALERTAS ACTIVAS',   valor: alertasActivas,         color: alertasActivas > 0 ? 'var(--accent)' : 'var(--green)' },
          { etiqueta: 'TICKETS ABIERTOS',  valor: ticketsPendientes,      color: ticketsPendientes > 0 ? 'var(--amber)' : 'var(--text-muted)' },
          { etiqueta: 'TICKETS EN CURSO',  valor: ticketsEnCurso,         color: ticketsEnCurso > 0 ? 'var(--cyan)' : 'var(--text-muted)' },
        ].map(s => (
          <Card key={s.etiqueta} style={{ padding: '14px 16px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{s.etiqueta}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 300, color: s.color }}>{s.valor}</span>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)' }}>SALUD DEL SISTEMA</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {cargandoSalud && <Spinner size={10} color="var(--text-muted)" />}
              <button onClick={cargarSalud} style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                ACTUALIZAR
              </button>
            </div>
          </div>

          {saludSistema ? (
            <>
              <BarraSalud
                etiqueta="Backend Railway"
                subetiqueta={saludSistema.backend?.latency_ms != null
                  ? `${saludSistema.backend.latency_ms}ms · uptime ${saludSistema.backend.uptime} · Hobby 8vCPU / 8GB`
                  : 'Sin datos'}
                valor={saludSistema.backend?.health || 0}
                tooltip="Verde <50ms · Amarillo <300ms · Rojo >300ms"
              />
              <BarraSalud
                etiqueta="Supabase PostgreSQL"
                subetiqueta={saludSistema.database?.latency_ms != null
                  ? `${saludSistema.database.latency_ms}ms · ${saludSistema.database.counts?.usuarios || 0} usuarios · Free 500MB`
                  : 'Sin conexión'}
                valor={saludSistema.database?.health || 0}
                tooltip="Verde <100ms · Amarillo <500ms · Rojo >500ms"
              />
              <BarraSalud
                etiqueta="Memoria Node.js"
                subetiqueta={`${saludSistema.memory?.used_mb || 0}MB usado / ${saludSistema.memory?.total_mb || 0}MB heap`}
                valor={saludSistema.memory?.health || 0}
                tooltip="Heap de Node.js. Fluctúa con el garbage collector"
              />

              <div style={{
                marginTop: 14, padding: '8px 12px', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: saludSistema.status === 'ok' ? 'var(--green-soft)' : saludSistema.status === 'degraded' ? 'var(--amber-soft)' : 'var(--accent-soft)',
                border: `1px solid ${saludSistema.status === 'ok' ? 'var(--green-border)' : saludSistema.status === 'degraded' ? 'var(--amber-border)' : 'var(--accent-border)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PuntoDot color={colorEstadoSalud(saludSistema.status)} pulso={saludSistema.status === 'ok'} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: colorEstadoSalud(saludSistema.status) }}>
                    {textoEstadoSalud(saludSistema.status)}
                  </span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>
                  {new Date(saludSistema.timestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {saludSistema.database?.counts && (
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  {[
                    { etiqueta: 'Usuarios',  valor: saludSistema.database.counts.usuarios  },
                    { etiqueta: 'Alertas',   valor: saludSistema.database.counts.alertas   },
                    { etiqueta: 'Motos',     valor: saludSistema.database.counts.vehiculos },
                  ].map(item => (
                    <div key={item.etiqueta} style={{ padding: '6px 8px', background: 'var(--bg-surface)', borderRadius: 6, textAlign: 'center' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: 'var(--text-primary)', display: 'block' }}>{item.valor}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)' }}>{item.etiqueta}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spinner />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', display: 'block', marginTop: 8 }}>OBTENIENDO MÉTRICAS...</span>
            </div>
          )}
        </Card>

        <Card>
          <Label accion="VER MAPA →" onAccion={() => navigate('/map')}>ALERTAS RECIENTES</Label>
          {safeAlertas.length === 0 ? <Vacio mensaje="Sin alertas registradas" /> : safeAlertas.map((alerta, i) => {
            const tipo  = (alerta.tipo_incidencia || '').toLowerCase();
            const color = tipo.includes('robo') ? 'var(--accent)' : tipo.includes('movimiento') ? 'var(--amber)' : 'var(--green)';
            return (
              <div key={alerta.id_alerta} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < safeAlertas.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <PuntoDot color={color} tamano={6} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{alerta.tipo_incidencia}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>
                      {alerta.fecha_hora ? new Date(alerta.fecha_hora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{alerta.estado_alerta?.toUpperCase()}</span>
                </div>
              </div>
            );
          })}
        </Card>

        <Card>
          <Label accion="VER TODO →" onAccion={() => navigate('/audit')}>ACTIVIDAD RECIENTE</Label>
          {safeAuditoria.length === 0 ? <Vacio mensaje="Sin actividad registrada" /> : safeAuditoria.slice(0, 6).map((log, i) => {
            const COLORES_ACCION = {
              login:            'var(--green)',
              crear_ticket:     'var(--cyan)',
              asignar_ticket:   'var(--amber)',
              eliminar_usuario: 'var(--accent)',
              activar_usuario:  'var(--green)',
              crear_usuario:    'var(--cyan)',
            };
            const color = COLORES_ACCION[log.accion] || 'var(--text-muted)';
            return (
              <div key={log.id_auditoria} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < Math.min(safeAuditoria.length, 6) - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 500 }}>{log.usuario?.nombre_completo || `Usuario ${log.id_usuario}`}</span>
                    {' · '}
                    <span style={{ color }}>{(log.accion || '').replace(/_/g, ' ')}</span>
                  </p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginTop: 1 }}>
                    {log.fecha_hora ? new Date(log.fecha_hora).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                </div>
              </div>
            );
          })}
        </Card>

        <Card>
          <Label accion="VER TODOS →" onAccion={() => navigate('/tickets')}>
            TICKETS RECIENTES {safeTickets.length > 0 && `(${safeTickets.length})`}
          </Label>
          {safeTickets.length === 0 ? <Vacio mensaje="Sin tickets registrados" /> : safeTickets.slice(0, 5).map((t, i) => {
            const COLORES = {
              pendiente:  { color: 'var(--text-muted)', bg: 'var(--bg-surface)', border: 'var(--border)'       },
              asignado:   { color: 'var(--amber)',      bg: 'var(--amber-soft)', border: 'var(--amber-border)'  },
              en_proceso: { color: 'var(--cyan)',       bg: 'var(--cyan-soft)',  border: 'var(--cyan-border)'   },
              resuelto:   { color: 'var(--green)',      bg: 'var(--green-soft)', border: 'var(--green-border)'  },
              cerrado:    { color: 'var(--text-faint)', bg: 'var(--bg-surface)', border: 'var(--border)'        },
            };
            const ce = COLORES[t.estado] || COLORES.pendiente;
            return (
              <div key={t.id_ticket} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < Math.min(safeTickets.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-faint)' }}>#{t.id_ticket}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: ce.color, background: ce.bg, border: `1px solid ${ce.border}`, padding: '1px 6px', borderRadius: 3 }}>
                      {t.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.titulo}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginTop: 1 }}>
                    {t.usuario_afectado?.nombre_completo || '—'}
                    {t.tecnico ? ` → ${t.tecnico.nombre_completo}` : ' → Sin asignar'}
                  </p>
                </div>
              </div>
            );
          })}
        </Card>

      </div>
    </div>
  );
}