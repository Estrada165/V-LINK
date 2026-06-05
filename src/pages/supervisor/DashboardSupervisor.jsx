import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supervisorService, ticketService, adminService } from '../../services/api';
import api from '../../services/api';
import { fmtDateTime } from '../../utils/dateUtils';
import Portal from '../../components/ui/Portal';

const Card = ({ children, style = {}, onClick }) => (
  <div className={`mg-card${onClick ? ' mg-card-hover' : ''}`}
    onClick={onClick} style={{ padding: '16px 18px', ...style, cursor: onClick ? 'pointer' : 'default' }}>
    {children}
  </div>
);

const Label = ({ children, accion, onAccion }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)' }}>{children}</span>
    {accion && <button onClick={onAccion} style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>{accion}</button>}
  </div>
);

const PuntoDot = ({ color = 'var(--green)', pulso = false }) => (
  <div className={pulso ? 'anim-blink' : ''} style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
);

const Vacio = ({ msg }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '20px 0' }}>{msg}</p>
);

const Spinner = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const COLORES_ESTADO_TICKET = {
  pendiente:  { color: 'var(--text-muted)', bg: 'var(--bg-surface)', border: 'var(--border)'       },
  asignado:   { color: 'var(--amber)',      bg: 'var(--amber-soft)', border: 'var(--amber-border)'  },
  en_proceso: { color: 'var(--cyan)',       bg: 'var(--cyan-soft)',  border: 'var(--cyan-border)'   },
  resuelto:   { color: 'var(--green)',      bg: 'var(--green-soft)', border: 'var(--green-border)'  },
};

const COLORES_PRIORIDAD = {
  alta:  { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  media: { color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
  baja:  { color: 'var(--green)',  bg: 'var(--green-soft)',  border: 'var(--green-border)'  },
};

const estiloInput = { width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

function ModalInforme({ onClose, onGuardado }) {
  const [form, setForm] = useState({ titulo: '', periodo_desde: '', periodo_hasta: '', resumen: '', observaciones: '', incidencias_count: 0 });
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const guardar = async () => {
    if (!form.titulo || !form.periodo_desde || !form.periodo_hasta || !form.resumen)
      return setError('Título, período y resumen son obligatorios');
    setCargando(true);
    try {
      await api.post('/informes', form);
      onGuardado();
    } catch(e) { setError(e.error || 'Error al guardar'); setCargando(false); }
  };

  return (
    <Portal>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
        <div className="mg-card" style={{ width: '100%', maxWidth: 520, padding: 28, margin: 'auto' }}>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 4 }}>NUEVO INFORME</h3>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginBottom: 20 }}>El informe será visible para el administrador</p>

        {error && (
          <div style={{ padding: '8px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, marginBottom: 14 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)' }}>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>TÍTULO DEL INFORME</p>
            <input value={form.titulo} onChange={e => set('titulo', e.target.value)}
              placeholder="Ej: Informe semanal zona norte — mayo 2026"
              style={estiloInput}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>PERÍODO DESDE</p>
              <input type="date" value={form.periodo_desde} onChange={e => set('periodo_desde', e.target.value)}
                style={estiloInput}
                onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>PERÍODO HASTA</p>
              <input type="date" value={form.periodo_hasta} onChange={e => set('periodo_hasta', e.target.value)}
                style={estiloInput}
                onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>

          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>N° DE INCIDENCIAS</p>
            <input type="number" min="0" value={form.incidencias_count}
              onChange={e => set('incidencias_count', parseInt(e.target.value) || 0)}
              style={estiloInput}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>

          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>RESUMEN DE ACTIVIDAD *</p>
            <textarea value={form.resumen} onChange={e => set('resumen', e.target.value)}
              placeholder="Describe las actividades, incidencias y estado general del período..." rows={4}
              style={{ ...estiloInput, resize: 'vertical', minHeight: 90 }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>

          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>OBSERVACIONES Y RECOMENDACIONES</p>
            <textarea value={form.observaciones} onChange={e => set('observaciones', e.target.value)}
              placeholder="Observaciones adicionales, recomendaciones para el administrador..." rows={3}
              style={{ ...estiloInput, resize: 'vertical', minHeight: 70 }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} disabled={cargando} style={{ flex: 1, padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>
            CANCELAR
          </button>
          <button onClick={guardar} disabled={cargando} style={{ flex: 2, padding: '12px', background: cargando ? 'var(--bg-surface)' : 'var(--amber)', border: 'none', borderRadius: 9, cursor: cargando ? 'wait' : 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: cargando ? 'var(--text-muted)' : '#000', letterSpacing: '0.08em', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {cargando ? <><Spinner/>ENVIANDO...</> : 'ENVIAR AL ADMINISTRADOR →'}
          </button>
        </div>
      </div>
      </div>
    </Portal>
  );
}

function ModalAsignarTicket({ ticket, tecnicos, onClose, onAsignado }) {
  const [idTecnico, setIdTecnico] = useState('');
  const [prioridad, setPrioridad] = useState(ticket.prioridad || 'media');
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState('');

  const asignar = async () => {
    if (!idTecnico) return setError('Selecciona un técnico');
    setCargando(true);
    try {
      await ticketService.asignar(ticket.id_ticket, { id_tecnico_asignado: Number(idTecnico), prioridad });
      onAsignado();
    } catch (e) { setError(e.error || 'Error al asignar'); setCargando(false); }
  };

  return (
    <Portal>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div className="mg-card" style={{ width: '100%', maxWidth: 400, padding: 26 }}>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 4 }}>ASIGNAR TICKET</h3>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginBottom: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            #{ticket.id_ticket} · {ticket.titulo}
        </p>

        {error && (
          <div style={{ padding: '8px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, marginBottom: 14 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)' }}>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>TÉCNICO</p>
            <select value={idTecnico} onChange={e => setIdTecnico(e.target.value)}
              style={{ ...estiloInput, cursor: 'pointer' }}>
              <option value="">Seleccionar técnico...</option>
              {tecnicos.map(t => (
                <option key={t.id_usuario} value={t.id_usuario}>{t.nombre_completo}</option>
              ))}
            </select>
          </div>

          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.1em' }}>PRIORIDAD</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['alta', 'media', 'baja'].map(p => {
                const c = COLORES_PRIORIDAD[p];
                const activo = prioridad === p;
                return (
                  <button key={p} onClick={() => setPrioridad(p)} style={{ flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, transition: 'all .15s', background: activo ? c.bg : 'var(--bg-surface)', border: `1px solid ${activo ? c.border : 'var(--border)'}`, color: activo ? c.color : 'var(--text-muted)' }}>
                    {p.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>CANCELAR</button>
            <button onClick={asignar} disabled={cargando} style={{ flex: 2, padding: '12px', background: cargando ? 'var(--bg-surface)' : 'var(--amber)', border: 'none', borderRadius: 9, cursor: cargando ? 'wait' : 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: cargando ? 'var(--text-muted)' : '#000', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {cargando ? <><Spinner/>ASIGNANDO...</> : 'ASIGNAR →'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

const colorPorAccion = (accion) => ({
  login:            'var(--green)',
  cambio_password:  'var(--amber)',
  eliminar_usuario: 'var(--accent)',
  activar_usuario:  'var(--green)',
})[accion] || 'var(--text-muted)';

const colorPorTipoAlerta = (tipo = '') => {
  const t = tipo.toLowerCase();
  if (t.includes('robo'))       return 'var(--accent)';
  if (t.includes('movimiento')) return 'var(--amber)';
  return 'var(--cyan)';
};

export default function DashboardSupervisor() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [alertas,      setAlertas]      = useState([]);
  const [informes,     setInformes]     = useState([]);
  const [auditoria,    setAuditoria]    = useState([]);
  const [tickets,      setTickets]      = useState([]);
  const [tecnicos,     setTecnicos]     = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando,     setCargando]     = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [resolviendo,  setResolviendo]  = useState(null);
  const [mensaje,      setMensaje]      = useState('');
  const [ticketAsignar, setTicketAsignar] = useState(null);

  const area = currentUser?.area || 'Sin área asignada';

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [a, s, aud, tks, tecns] = await Promise.all([
        supervisorService.getAlerts(),
        supervisorService.getStats(),
        supervisorService.getAuditoria({ limit: 20 }),
        ticketService.getAll(),
        adminService.getTecnicos(),
      ]);
      setAlertas(Array.isArray(a) ? a : []);
      setEstadisticas(s);
      setAuditoria(Array.isArray(aud) ? aud : []);
      setTickets(Array.isArray(tks) ? tks : []);
      const listaTecnicos = Array.isArray(tecns) ? tecns : (Array.isArray(tecns?.users) ? tecns.users : []);
      setTecnicos(listaTecnicos.filter(u => u.rol === 'tecnico'));
      try {
        const inf = await api.get('/informes').then(r => r.data);
        setInformes(Array.isArray(inf) ? inf : []);
      } catch {}
    } catch(e) { console.error(e); }
    setCargando(false);
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const mostrarMensaje = (texto) => { setMensaje(texto); setTimeout(() => setMensaje(''), 3000); };

  const resolverAlerta = async (alerta) => {
    setResolviendo(alerta.id_alerta);
    try {
      await supervisorService.resolveAlert(alerta.id_alerta);
      mostrarMensaje('Alerta marcada como resuelta');
      cargarDatos();
    } catch(e) { console.error(e); }
    setResolviendo(null);
  };

  const alertasActivas   = alertas.filter(a => a.estado_alerta === 'activo');
  const alertasResueltas = alertas.filter(a => a.estado_alerta === 'resuelto');
  const ticketsPendientes = tickets.filter(t => t.estado === 'pendiente');

  if (cargando) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2"
          style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto 10px' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>CARGANDO...</span>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px 16px 40px' }} className="anim-fade">

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6 }}>PANEL DE CONTROL</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>{area}</span>
            </div>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>
              {alertasActivas.length} alertas activas · {ticketsPendientes.length} tickets pendientes
            </span>
            {mensaje && (
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--green)', background: 'var(--green-soft)', border: '1px solid var(--green-border)', padding: '3px 10px', borderRadius: 4 }}>{mensaje}</span>
            )}
          </div>
        </div>
        <button onClick={() => setMostrarModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'var(--amber)', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: '#000', fontWeight: 600 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          NUEVO INFORME
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { etiqueta: 'ALERTAS ACTIVAS',    valor: alertasActivas.length,               color: alertasActivas.length > 0 ? 'var(--accent)' : 'var(--green)' },
          { etiqueta: 'RESUELTAS',          valor: alertasResueltas.length,             color: 'var(--green)'        },
          { etiqueta: 'TICKETS PENDIENTES', valor: ticketsPendientes.length,            color: ticketsPendientes.length > 0 ? 'var(--amber)' : 'var(--text-muted)' },
          { etiqueta: 'INFORMES ENVIADOS',  valor: informes.length,                     color: 'var(--amber)'        },
          { etiqueta: 'USUARIOS ACTIVOS',   valor: estadisticas?.usuarios?.activos || 0, color: 'var(--cyan)'       },
        ].map(s => (
          <Card key={s.etiqueta} style={{ padding: '14px 16px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{s.etiqueta}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 300, color: s.color }}>{s.valor}</span>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

        <Card>
          <Label accion="VER MAPA →" onAccion={() => navigate('/map')}>
            ALERTAS ACTIVAS {alertasActivas.length > 0 && `(${alertasActivas.length})`}
          </Label>
          {alertasActivas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green-soft)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--green)' }}>Sin alertas activas</p>
            </div>
          ) : alertasActivas.slice(0, 6).map((a, i) => {
            const color = colorPorTipoAlerta(a.tipo_incidencia);
            return (
              <div key={a.id_alerta} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < Math.min(alertasActivas.length, 6) - 1 ? '1px solid var(--border)' : 'none' }}>
                <PuntoDot color={color} pulso />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{a.tipo_incidencia}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
                      {a.fecha_hora ? new Date(a.fecha_hora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>
                    {a.latitud ? `${parseFloat(a.latitud).toFixed(4)}, ${parseFloat(a.longitud).toFixed(4)}` : 'Sin coordenadas'}
                  </span>
                </div>
                <button onClick={() => resolverAlerta(a)} disabled={resolviendo === a.id_alerta}
                  style={{ padding: '4px 8px', background: 'var(--green-soft)', border: '1px solid var(--green-border)', borderRadius: 5, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--green)', flexShrink: 0 }}>
                  {resolviendo === a.id_alerta ? '...' : 'RESOLVER'}
                </button>
              </div>
            );
          })}
        </Card>

        <Card>
          <Label accion="VER TODOS →" onAccion={() => navigate('/tickets')}>
            TICKETS PENDIENTES {ticketsPendientes.length > 0 && `(${ticketsPendientes.length})`}
          </Label>
          {ticketsPendientes.length === 0 ? (
            <Vacio msg="Sin tickets pendientes de asignar" />
          ) : ticketsPendientes.slice(0, 5).map((t, i) => {
            const yaAsignado = ['asignado', 'en_proceso'].includes(t.estado);
            const ce = COLORES_ESTADO_TICKET[t.estado] || COLORES_ESTADO_TICKET.pendiente;
            return (
              <div key={t.id_ticket} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < Math.min(ticketsPendientes.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-faint)' }}>#{t.id_ticket}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: ce.color, background: ce.bg, border: `1px solid ${ce.border}`, padding: '1px 6px', borderRadius: 3 }}>
                      {t.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.titulo}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginTop: 2 }}>
                    {t.usuario_afectado?.nombre_completo || '—'} · {fmtDateTime(t.fecha_creacion)}
                  </p>
                </div>
                <button onClick={() => setTicketAsignar(t)} disabled={yaAsignado}
                  style={{ padding: '4px 8px', background: yaAsignado ? 'var(--bg-surface)' : 'var(--amber-soft)', border: `1px solid ${yaAsignado ? 'var(--border)' : 'var(--amber-border)'}`, borderRadius: 5, cursor: yaAsignado ? 'not-allowed' : 'pointer', fontFamily: 'JetBrains Mono', fontSize: 7, color: yaAsignado ? 'var(--text-faint)' : 'var(--amber)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {yaAsignado ? 'ASIGNADO' : 'ASIGNAR →'}
                </button>
              </div>
            );
          })}
        </Card>

        <Card>
          <Label accion="NUEVO →" onAccion={() => setMostrarModal(true)}>MIS INFORMES</Label>
          {informes.length === 0 ? <Vacio msg="No has enviado informes aún" /> : informes.slice(0, 5).map((inf, i) => {
            const colorEstado = inf.estado === 'revisado' ? 'var(--green)' : inf.estado === 'archivado' ? 'var(--text-muted)' : 'var(--amber)';
            const bgEstado    = inf.estado === 'revisado' ? 'var(--green-soft)' : inf.estado === 'archivado' ? 'var(--bg-surface)' : 'var(--amber-soft)';
            const bEstado     = inf.estado === 'revisado' ? 'var(--green-border)' : inf.estado === 'archivado' ? 'var(--border)' : 'var(--amber-border)';
            return (
              <div key={inf.id_informe} style={{ padding: '10px 0', borderBottom: i < Math.min(informes.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inf.titulo}</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginTop: 2 }}>
                      {inf.periodo_desde} → {inf.periodo_hasta} · {inf.incidencias_count} incidencias
                    </p>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, padding: '2px 8px', borderRadius: 4, flexShrink: 0, color: colorEstado, background: bgEstado, border: `1px solid ${bEstado}` }}>
                    {inf.estado?.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginTop: 4 }}>{fmtDateTime(inf.fecha_creacion)}</p>
              </div>
            );
          })}
        </Card>

        <Card>
          <Label accion="VER TODO →" onAccion={() => navigate('/audit')}>ACTIVIDAD RECIENTE</Label>
          {auditoria.length === 0 ? <Vacio msg="Sin actividad registrada" /> : auditoria.slice(0, 8).map((log, i) => {
            const color = colorPorAccion(log.accion);
            return (
              <div key={log.id_auditoria} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < 7 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 500 }}>{log.usuario?.nombre_completo || `Usuario ${log.id_usuario}`}</span>
                    {' · '}
                    <span style={{ color }}>{log.accion?.replace(/_/g, ' ')}</span>
                  </p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>{fmtDateTime(log.fecha_hora)}</p>
                </div>
              </div>
            );
          })}
        </Card>

        <Card>
          <Label>ACCIONES RÁPIDAS</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { etiqueta: 'Ver mapa de incidencias', ruta: '/map',     color: 'var(--cyan)'           },
              { etiqueta: 'Gestión de tickets',      ruta: '/tickets', color: 'var(--amber)'          },
              { etiqueta: 'Historial de rutas',      ruta: '/routes',  color: 'var(--text-secondary)' },
              { etiqueta: 'Registro de auditoría',   ruta: '/audit',   color: 'var(--text-secondary)' },
              { etiqueta: 'Mi perfil',               ruta: '/profile', color: 'var(--text-secondary)' },
            ].map(({ etiqueta, ruta, color }) => (
              <button key={ruta} onClick={() => navigate(ruta)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 8, cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color, fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, transition: 'all .2s' }}>
                {etiqueta}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
            <button onClick={() => setMostrarModal(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 8, cursor: 'pointer', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', color: 'var(--amber)', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500 }}>
              Crear nuevo informe
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </Card>
      </div>

      {mostrarModal && (
        <ModalInforme
          onClose={() => setMostrarModal(false)}
          onGuardado={() => { setMostrarModal(false); mostrarMensaje('Informe enviado al administrador'); cargarDatos(); }}
        />
      )}

      {ticketAsignar && (
        <ModalAsignarTicket
          ticket={ticketAsignar}
          tecnicos={tecnicos}
          onClose={() => setTicketAsignar(null)}
          onAsignado={() => { setTicketAsignar(null); mostrarMensaje('Ticket asignado correctamente'); cargarDatos(); }}
        />
      )}
    </div>
  );
}