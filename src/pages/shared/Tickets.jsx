import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ticketService, adminService, vehicleService } from '../../services/api';
import { fmtDateTime } from '../../utils/dateUtils';
import ThemeToggle from '../../components/ui/ThemeToggle';
import Portal from '../../components/ui/Portal';

const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '16px 18px', ...style }}>{children}</div>
);

const Label = ({ children }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)', marginBottom: 12 }}>{children}</p>
);

const CajaError = ({ msg }) => msg ? (
  <div style={{ padding: '8px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, marginBottom: 12 }}>
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)' }}>{msg}</span>
  </div>
) : null;

const Spinner = ({ size = 24, color = 'var(--accent)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
    style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const COLORES_ESTADO = {
  pendiente:   { color: 'var(--text-muted)', bg: 'var(--bg-surface)',  border: 'var(--border)'        },
  asignado:    { color: 'var(--amber)',       bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
  en_proceso:  { color: 'var(--cyan)',        bg: 'var(--cyan-soft)',   border: 'var(--cyan-border)'   },
  resuelto:    { color: 'var(--green)',       bg: 'var(--green-soft)',  border: 'var(--green-border)'  },
  cerrado:     { color: 'var(--text-faint)',  bg: 'var(--bg-surface)',  border: 'var(--border)'        },
};

const COLORES_PRIORIDAD = {
  alta:  { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  media: { color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
  baja:  { color: 'var(--green)',  bg: 'var(--green-soft)',  border: 'var(--green-border)'  },
};

const ETIQUETAS_TIPO = {
  calibracion:  'Calibración',
  instalacion:  'Instalación',
  falla_sensor: 'Falla sensor',
  falla_ble:    'Falla BLE',
  otro:         'Otro',
};

const BadgeEstado = ({ estado }) => {
  const c = COLORES_ESTADO[estado] || COLORES_ESTADO.pendiente;
  return (
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, letterSpacing: '0.08em', color: c.color, background: c.bg, border: `1px solid ${c.border}`, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>
      {(estado || '').replace('_', ' ').toUpperCase()}
    </span>
  );
};

const BadgePrioridad = ({ prioridad }) => {
  const c = COLORES_PRIORIDAD[prioridad] || COLORES_PRIORIDAD.media;
  return (
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, letterSpacing: '0.08em', color: c.color, background: c.bg, border: `1px solid ${c.border}`, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>
      {(prioridad || '').toUpperCase()}
    </span>
  );
};

const estiloInput = {
  width: '100%', padding: '10px 12px',
  background: 'var(--bg-input)', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text-primary)',
  fontFamily: 'DM Sans', fontSize: 13, outline: 'none',
  boxSizing: 'border-box',
};

function ModalCrearTicket({ vehiculos, onClose, onCreado }) {
  const [form, setForm] = useState({ tipo: 'falla_sensor', titulo: '', descripcion: '', id_vehiculo: '' });
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const crear = async () => {
    if (!form.titulo.trim() || !form.descripcion.trim())
      return setError('Título y descripción son obligatorios');
    setCargando(true);
    try {
      await ticketService.create({
        tipo:        form.tipo,
        titulo:      form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        id_vehiculo: form.id_vehiculo || null,
      });
      onCreado();
    } catch (e) { setError(e.error || 'Error al crear ticket'); setCargando(false); }
  };

  return (
    <Portal>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div className="mg-card" style={{ width: '100%', maxWidth: 480, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: 'var(--text-primary)', letterSpacing: '0.1em', lineHeight: 1 }}>NUEVO TICKET</h3>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>Reporta un problema con tu anillo o vehículo</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

        <CajaError msg={error} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>TIPO DE PROBLEMA</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {Object.entries(ETIQUETAS_TIPO).map(([key, label]) => {
                const activo = form.tipo === key;
                return (
                  <button key={key} onClick={() => set('tipo', key)} style={{ padding: '9px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.06em', transition: 'all .15s', background: activo ? 'var(--accent-soft)' : 'var(--bg-surface)', border: `1px solid ${activo ? 'var(--accent-border)' : 'var(--border)'}`, color: activo ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>TÍTULO *</p>
            <input value={form.titulo} onChange={e => set('titulo', e.target.value)}
              placeholder="Ej: El anillo no se conecta por BLE"
              style={estiloInput}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>

          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>DESCRIPCIÓN *</p>
            <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              placeholder="Describe el problema con el mayor detalle posible: cuándo ocurre, qué has intentado, si es frecuente..." rows={4}
              style={{ ...estiloInput, resize: 'vertical', minHeight: 90 }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>

          {vehiculos.length > 0 && (
            <div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>VEHÍCULO AFECTADO (opcional)</p>
              <select value={form.id_vehiculo} onChange={e => set('id_vehiculo', e.target.value)}
                style={{ ...estiloInput, cursor: 'pointer' }}>
                <option value="">Sin vehículo específico</option>
                {vehiculos.map(v => (
                  <option key={v.id_vehiculo} value={v.id_vehiculo}>{v.marca} {v.modelo} — {v.placa}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} disabled={cargando} style={{ flex: 1, padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>
            CANCELAR
          </button>
          <button onClick={crear} disabled={cargando} style={{ flex: 2, padding: '12px', background: cargando ? 'var(--bg-surface)' : 'var(--accent)', border: `1px solid ${cargando ? 'var(--border)' : '#ff5040'}`, borderRadius: 9, cursor: cargando ? 'wait' : 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: cargando ? 'var(--text-muted)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {cargando ? <><Spinner size={12} color="var(--text-muted)" />CREANDO...</> : 'ENVIAR TICKET →'}
          </button>
        </div>
        </div>
      </div>
    </Portal>
  );
}

function ModalAsignar({ ticket, tecnicos, onClose, onAsignado }) {
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
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginBottom: 18 }}>
            {ticket.titulo}
          </p>

          <CajaError msg={error} />

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
            <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>
              CANCELAR
            </button>
            <button onClick={asignar} disabled={cargando} style={{ flex: 2, padding: '12px', background: cargando ? 'var(--bg-surface)' : 'var(--amber)', border: 'none', borderRadius: 9, cursor: cargando ? 'wait' : 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: cargando ? 'var(--text-muted)' : '#000', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {cargando ? <><Spinner size={12} color="var(--text-muted)" />ASIGNANDO...</> : 'ASIGNAR →'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function ModalDetalle({ ticket, puedeAsignar, tecnicos, onClose, onActualizado }) {
  const [mostrarAsignar, setMostrarAsignar] = useState(false);

  const yaAsignado = ['asignado', 'en_proceso'].includes(ticket.estado);

  return (
    <Portal>
      <>
        <div style={{ position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="mg-card" style={{ width: '100%', maxWidth: 520, padding: 26, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>#{ticket.id_ticket}</span>
                  <BadgeEstado estado={ticket.estado} />
                  <BadgePrioridad prioridad={ticket.prioridad} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{ticket.titulo}</h3>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                ['Tipo',     ETIQUETAS_TIPO[ticket.tipo] || ticket.tipo],
                ['Creado',   fmtDateTime(ticket.fecha_creacion)],
                ['Usuario',  ticket.usuario_afectado?.nombre_completo || '—'],
                ['Vehículo', ticket.vehiculo ? `${ticket.vehiculo.marca} ${ticket.vehiculo.modelo} · ${ticket.vehiculo.placa}` : '—'],
                ['Técnico',  ticket.tecnico?.nombre_completo || 'Sin asignar'],
                ['Asignado', ticket.fecha_asignacion ? fmtDateTime(ticket.fecha_asignacion) : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', marginBottom: 3 }}>{k.toUpperCase()}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-secondary)' }}>{v}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>DESCRIPCIÓN</p>
              <div style={{ padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{ticket.descripcion}</p>
              </div>
            </div>

            {ticket.notas_tecnico && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>NOTAS DEL TÉCNICO</p>
                <div style={{ padding: '12px 14px', background: 'var(--cyan-soft)', borderRadius: 8, border: '1px solid var(--cyan-border)' }}>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{ticket.notas_tecnico}</p>
                </div>
              </div>
            )}

            {ticket.fecha_resolucion && (
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--green)', marginBottom: 14 }}>
                Resuelto el {fmtDateTime(ticket.fecha_resolucion)}
              </p>
            )}

            {puedeAsignar && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ticket.estado === 'resuelto' ? (
                  <button onClick={async () => {
                    try {
                      await ticketService.estado(ticket.id_ticket, { estado: 'cerrado' });
                      onActualizado(); onClose();
                    } catch {}
                  }} style={{ width: '100%', padding: '11px', borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.08em', background: 'var(--green-soft)', border: '1px solid var(--green-border)', color: 'var(--green)' }}>
                    CONFIRMAR Y CERRAR TICKET →
                  </button>
                ) : (
                  <button onClick={() => setMostrarAsignar(true)} disabled={yaAsignado}
                    style={{ width: '100%', padding: '11px', borderRadius: 9, cursor: yaAsignado ? 'not-allowed' : 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.08em', background: yaAsignado ? 'var(--bg-surface)' : 'var(--amber-soft)', border: `1px solid ${yaAsignado ? 'var(--border)' : 'var(--amber-border)'}`, color: yaAsignado ? 'var(--text-faint)' : 'var(--amber)' }}>
                    {yaAsignado ? 'TICKET EN CURSO — no se puede reasignar' : 'ASIGNAR A TÉCNICO →'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {mostrarAsignar && (
          <ModalAsignar
            ticket={ticket}
            tecnicos={tecnicos}
            onClose={() => setMostrarAsignar(false)}
            onAsignado={() => { setMostrarAsignar(false); onActualizado(); onClose(); }}
          />
        )}
      </>
    </Portal>
  );
}

export default function Tickets() {
  const { currentUser } = useAuth();
  const rol = currentUser?.rol || 'usuario';

  const [tickets,         setTickets]         = useState([]);
  const [tecnicos,        setTecnicos]        = useState([]);
  const [vehiculos,       setVehiculos]        = useState([]);
  const [cargando,        setCargando]         = useState(true);
  const [filtroEstado,    setFiltroEstado]     = useState('todos');
  const [ticketDetalle,   setTicketDetalle]    = useState(null);
  const [mostrarCrear,    setMostrarCrear]     = useState(false);
  const [mensaje,         setMensaje]          = useState('');

  const puedeCrear   = rol === 'usuario';
  const puedeAsignar = rol === 'admin' || rol === 'supervisor';

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [tks, tecns] = await Promise.all([
        ticketService.getAll(),
        puedeAsignar ? adminService.getTecnicos() : Promise.resolve([]),
      ]);
      setTickets(Array.isArray(tks) ? tks : []);
      if (puedeAsignar) {
        const lista = Array.isArray(tecns) ? tecns : (Array.isArray(tecns?.users) ? tecns.users : []);
        setTecnicos(lista.filter(u => u.rol === 'tecnico'));
      }
      if (puedeCrear) {
        const vehs = await vehicleService.getMine();
        setVehiculos(Array.isArray(vehs) ? vehs : []);
      }
    } catch (e) { console.error(e); }
    setCargando(false);
  }, [puedeAsignar, puedeCrear]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const mostrarMensaje = (texto) => { setMensaje(texto); setTimeout(() => setMensaje(''), 3000); };

  const ticketsFiltrados = filtroEstado === 'todos'
    ? tickets
    : tickets.filter(t => t.estado === filtroEstado);

  const contadores = {
    pendiente:  tickets.filter(t => t.estado === 'pendiente').length,
    asignado:   tickets.filter(t => t.estado === 'asignado').length,
    en_proceso: tickets.filter(t => t.estado === 'en_proceso').length,
    resuelto:   tickets.filter(t => t.estado === 'resuelto').length,
  };

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>TICKETS DE SOPORTE</h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            {puedeCrear   && 'Reporta problemas con tu anillo o vehículo'}
            {puedeAsignar && 'Gestión y asignación de tickets'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {mensaje && (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, padding: '6px 12px', borderRadius: 8, color: 'var(--green)', background: 'var(--green-soft)', border: '1px solid var(--green-border)' }}>
              {mensaje}
            </span>
          )}
          {puedeCrear && (
            <button onClick={() => setMostrarCrear(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: '#fff', boxShadow: '0 0 12px rgba(224,48,48,0.25)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              NUEVO TICKET
            </button>
          )}
          <ThemeToggle compact />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { etiqueta: 'PENDIENTES',  valor: contadores.pendiente,  color: 'var(--text-muted)'  },
          { etiqueta: 'ASIGNADOS',   valor: contadores.asignado,   color: 'var(--amber)'        },
          { etiqueta: 'EN PROCESO',  valor: contadores.en_proceso, color: 'var(--cyan)'         },
          { etiqueta: 'RESUELTOS',   valor: contadores.resuelto,   color: 'var(--green)'        },
          { etiqueta: 'TOTAL',       valor: tickets.length,        color: 'var(--text-primary)' },
        ].map(s => (
          <Card key={s.etiqueta} style={{ padding: '14px 16px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>{s.etiqueta}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 300, color: s.color }}>{s.valor}</span>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <Label>LISTA DE TICKETS</Label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(puedeAsignar
              ? ['todos', 'pendiente', 'asignado', 'en_proceso', 'resuelto', 'cerrado']
              : ['todos', 'pendiente', 'en_proceso', 'resuelto']
            ).map(f => (
              <button key={f} onClick={() => setFiltroEstado(f)} style={{ padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 7, letterSpacing: '0.06em', transition: 'all .15s', background: filtroEstado === f ? 'var(--accent-soft)' : 'var(--bg-surface)', border: `1px solid ${filtroEstado === f ? 'var(--accent-border)' : 'var(--border)'}`, color: filtroEstado === f ? 'var(--accent)' : 'var(--text-muted)' }}>
                {f === 'todos' ? 'TODOS' : f.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <Spinner />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', display: 'block', marginTop: 10 }}>CARGANDO...</span>
          </div>
        ) : ticketsFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 12px' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)' }}>
              {filtroEstado === 'todos' ? 'Sin tickets registrados' : `Sin tickets en estado "${filtroEstado.replace('_', ' ')}"`}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: puedeAsignar ? 600 : 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {(puedeAsignar
                    ? ['#', 'TÍTULO', 'TIPO', 'USUARIO', 'TÉCNICO', 'PRIORIDAD', 'ESTADO', 'FECHA', '']
                    : ['#', 'TÍTULO', 'TIPO', 'ESTADO', 'FECHA', '']
                  ).map(h => (
                    <th key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '8px 10px', textAlign: 'left', fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ticketsFiltrados.map((t, i) => (
                  <tr key={t.id_ticket}
                    style={{ borderBottom: i < ticketsFiltrados.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setTicketDetalle(t)}>
                    <td style={{ padding: '11px 10px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-faint)' }}>#{t.id_ticket}</span>
                    </td>
                    <td style={{ padding: '11px 10px', maxWidth: 200 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.titulo}</p>
                    </td>
                    <td style={{ padding: '11px 10px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>{ETIQUETAS_TIPO[t.tipo] || t.tipo}</span>
                    </td>
                    {puedeAsignar && (
                      <>
                        <td style={{ padding: '11px 10px' }}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{t.usuario_afectado?.nombre_completo || '—'}</span>
                        </td>
                        <td style={{ padding: '11px 10px' }}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: t.tecnico ? 'var(--text-secondary)' : 'var(--text-faint)' }}>
                            {t.tecnico?.nombre_completo || 'Sin asignar'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 10px' }}>
                          <BadgePrioridad prioridad={t.prioridad} />
                        </td>
                      </>
                    )}
                    <td style={{ padding: '11px 10px' }}>
                      <BadgeEstado estado={t.estado} />
                    </td>
                    <td style={{ padding: '11px 10px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDateTime(t.fecha_creacion)}</span>
                    </td>
                    <td style={{ padding: '11px 10px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {mostrarCrear && (
        <ModalCrearTicket
          vehiculos={vehiculos}
          onClose={() => setMostrarCrear(false)}
          onCreado={() => { setMostrarCrear(false); mostrarMensaje('Ticket creado correctamente'); cargarDatos(); }}
        />
      )}

      {ticketDetalle && (
        <ModalDetalle
          ticket={ticketDetalle}
          puedeAsignar={puedeAsignar}
          tecnicos={tecnicos}
          onClose={() => setTicketDetalle(null)}
          onActualizado={() => { mostrarMensaje('Ticket actualizado'); cargarDatos(); }}
        />
      )}
    </div>
  );
}