import React, { useState, useEffect, useCallback } from 'react';
import { ticketService } from '../../services/api';
import { fmtDateTime } from '../../utils/dateUtils';
import ThemeToggle from '../../components/ui/ThemeToggle';

const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '16px 18px', ...style }}>{children}</div>
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
  pendiente:  { color: 'var(--text-muted)', bg: 'var(--bg-surface)', border: 'var(--border)'        },
  asignado:   { color: 'var(--amber)',      bg: 'var(--amber-soft)', border: 'var(--amber-border)'  },
  en_proceso: { color: 'var(--cyan)',       bg: 'var(--cyan-soft)',  border: 'var(--cyan-border)'   },
  resuelto:   { color: 'var(--green)',      bg: 'var(--green-soft)', border: 'var(--green-border)'  },
  cerrado:    { color: 'var(--text-faint)', bg: 'var(--bg-surface)', border: 'var(--border)'        },
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

function ModalActualizar({ ticket, onClose, onActualizado }) {
  const [estado,     setEstado]     = useState(ticket.estado === 'asignado' ? 'en_proceso' : ticket.estado);
  const [notas,      setNotas]      = useState(ticket.notas_tecnico || '');
  const [cargando,   setCargando]   = useState(false);
  const [error,      setError]      = useState('');

  const estadosPermitidos = ticket.estado === 'resuelto'
    ? ['resuelto']
    : ['en_proceso', 'resuelto'];

  const actualizar = async () => {
    if (estado === 'resuelto' && !notas.trim())
      return setError('Agrega una nota antes de marcar como resuelto');
    setCargando(true);
    try {
      await ticketService.estado(ticket.id_ticket, { estado, notas_tecnico: notas.trim() || undefined });
      onActualizado();
    } catch (e) { setError(e.error || 'Error al actualizar'); setCargando(false); }
  };

  const yaResuelto = ticket.estado === 'resuelto';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="mg-card" style={{ width: '100%', maxWidth: 480, padding: 26 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text-primary)', letterSpacing: '0.1em', lineHeight: 1 }}>
              {yaResuelto ? 'TICKET RESUELTO' : 'ACTUALIZAR TICKET'}
            </h3>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>#{ticket.id_ticket} · {ticket.titulo}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <CajaError msg={error} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!yaResuelto && (
            <div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.1em' }}>ESTADO</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {estadosPermitidos.map(e => {
                  const c   = COLORES_ESTADO[e];
                  const act = estado === e;
                  return (
                    <button key={e} onClick={() => setEstado(e)} style={{ flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.06em', transition: 'all .15s', background: act ? c.bg : 'var(--bg-surface)', border: `1px solid ${act ? c.border : 'var(--border)'}`, color: act ? c.color : 'var(--text-muted)' }}>
                      {e.replace('_', ' ').toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>
              NOTAS TÉCNICAS {estado === 'resuelto' ? '*' : '(opcional)'}
            </p>
            <textarea value={notas} onChange={e => setNotas(e.target.value)}
              readOnly={yaResuelto}
              placeholder={yaResuelto ? '' : 'Describe lo que hiciste, qué encontraste, cómo lo resolviste...'}
              rows={4}
              style={{ ...estiloInput, resize: 'vertical', minHeight: 100, cursor: yaResuelto ? 'default' : 'text', background: yaResuelto ? 'var(--bg-surface)' : 'var(--bg-input)', color: yaResuelto ? 'var(--text-muted)' : 'var(--text-primary)' }}
              onFocus={e => !yaResuelto && (e.target.style.borderColor = 'var(--accent-border)')}
              onBlur={e  => (e.target.style.borderColor = 'var(--border)')} />
            {estado === 'resuelto' && !yaResuelto && (
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--amber)', marginTop: 5 }}>
                Las notas son obligatorias al marcar como resuelto
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>
            {yaResuelto ? 'CERRAR' : 'CANCELAR'}
          </button>
          {!yaResuelto && (
            <button onClick={actualizar} disabled={cargando} style={{ flex: 2, padding: '12px', background: cargando ? 'var(--bg-surface)' : estado === 'resuelto' ? 'var(--green)' : 'var(--cyan)', border: 'none', borderRadius: 9, cursor: cargando ? 'wait' : 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: cargando ? 'var(--text-muted)' : '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {cargando
                ? <><Spinner size={12} color="var(--text-muted)" />GUARDANDO...</>
                : estado === 'resuelto' ? 'MARCAR RESUELTO' : 'GUARDAR CAMBIOS'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TarjetaTicket({ ticket, onClick }) {
  const cp = COLORES_PRIORIDAD[ticket.prioridad] || COLORES_PRIORIDAD.media;
  const yaResuelto = ticket.estado === 'resuelto' || ticket.estado === 'cerrado';

  return (
    <div onClick={onClick} style={{ padding: '14px 16px', background: 'var(--bg-card)', border: `1px solid ${yaResuelto ? 'var(--border)' : cp.border}`, borderRadius: 10, cursor: 'pointer', transition: 'all .15s', opacity: yaResuelto ? 0.65 : 1 }}
      onMouseEnter={e => !yaResuelto && (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-faint)' }}>#{ticket.id_ticket}</span>
            <BadgeEstado estado={ticket.estado} />
            <BadgePrioridad prioridad={ticket.prioridad} />
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ticket.titulo}
          </p>
        </div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>{fmtDateTime(ticket.fecha_creacion)}</span>
        </div>
        {ticket.tipo && (
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>{ETIQUETAS_TIPO[ticket.tipo] || ticket.tipo}</span>
        )}
      </div>

      {ticket.usuario_afectado && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>{ticket.usuario_afectado.nombre_completo?.[0]}</span>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{ticket.usuario_afectado.nombre_completo}</span>
          {ticket.vehiculo && (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>· {ticket.vehiculo.marca} {ticket.vehiculo.modelo}</span>
          )}
        </div>
      )}

      <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {ticket.descripcion}
      </p>
    </div>
  );
}

export default function TicketsTecnico() {

  const [tickets,       setTickets]       = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [filtro,        setFiltro]        = useState('activos');
  const [ticketActivo,  setTicketActivo]  = useState(null);
  const [mensaje,       setMensaje]       = useState('');

  const cargarTickets = useCallback(async () => {
    setCargando(true);
    try {
      const data = await ticketService.getAll();
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setCargando(false);
  }, []);

  useEffect(() => { cargarTickets(); }, [cargarTickets]);

  const mostrarMensaje = (texto) => { setMensaje(texto); setTimeout(() => setMensaje(''), 3000); };

  const ticketsFiltrados = tickets.filter(t => {
    if (filtro === 'activos')   return ['asignado', 'en_proceso'].includes(t.estado);
    if (filtro === 'resueltos') return ['resuelto', 'cerrado'].includes(t.estado);
    return true;
  });

  const contadorActivos   = tickets.filter(t => ['asignado', 'en_proceso'].includes(t.estado)).length;
  const contadorResueltos = tickets.filter(t => ['resuelto', 'cerrado'].includes(t.estado)).length;

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>MIS TICKETS</h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            {contadorActivos > 0
              ? `${contadorActivos} ticket${contadorActivos !== 1 ? 's' : ''} activo${contadorActivos !== 1 ? 's' : ''} asignado${contadorActivos !== 1 ? 's' : ''}`
              : 'Sin tickets activos'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {mensaje && (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, padding: '6px 12px', borderRadius: 8, color: 'var(--green)', background: 'var(--green-soft)', border: '1px solid var(--green-border)' }}>
              {mensaje}
            </span>
          )}
          <ThemeToggle compact />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { etiqueta: 'ASIGNADOS',  valor: tickets.filter(t => t.estado === 'asignado').length,   color: 'var(--amber)' },
          { etiqueta: 'EN PROCESO', valor: tickets.filter(t => t.estado === 'en_proceso').length,  color: 'var(--cyan)'  },
          { etiqueta: 'RESUELTOS',  valor: contadorResueltos,                                      color: 'var(--green)' },
          { etiqueta: 'TOTAL',      valor: tickets.length,                                         color: 'var(--text-primary)' },
        ].map(s => (
          <Card key={s.etiqueta} style={{ padding: '14px 16px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>{s.etiqueta}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 300, color: s.color }}>{s.valor}</span>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'activos',   label: `ACTIVOS (${contadorActivos})`   },
          { key: 'resueltos', label: `RESUELTOS (${contadorResueltos})` },
          { key: 'todos',     label: `TODOS (${tickets.length})`       },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)} style={{ padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.08em', transition: 'all .15s', background: filtro === f.key ? 'var(--accent-soft)' : 'var(--bg-card)', border: `1px solid ${filtro === f.key ? 'var(--accent-border)' : 'var(--border)'}`, color: filtro === f.key ? 'var(--accent)' : 'var(--text-muted)' }}>
            {f.label}
          </button>
        ))}
      </div>

      {cargando ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <div style={{ textAlign: 'center' }}>
            <Spinner />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', display: 'block', marginTop: 10 }}>CARGANDO TICKETS...</span>
          </div>
        </div>
      ) : ticketsFiltrados.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 14px' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', marginBottom: 6 }}>
              {filtro === 'activos' ? 'Sin tickets activos asignados' : filtro === 'resueltos' ? 'Sin tickets resueltos' : 'Sin tickets'}
            </p>
            {filtro === 'activos' && (
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-faint)' }}>
                Los tickets se asignan por el supervisor o administrador
              </p>
            )}
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {ticketsFiltrados.map(t => (
            <TarjetaTicket key={t.id_ticket} ticket={t} onClick={() => setTicketActivo(t)} />
          ))}
        </div>
      )}

      {ticketActivo && (
        <ModalActualizar
          ticket={ticketActivo}
          onClose={() => setTicketActivo(null)}
          onActualizado={() => {
            setTicketActivo(null);
            mostrarMensaje('Ticket actualizado correctamente');
            cargarTickets();
          }}
        />
      )}
    </div>
  );
}