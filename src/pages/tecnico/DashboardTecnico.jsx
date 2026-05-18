import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tecnicoService, ticketService } from '../../services/api';
import { fmtDateTime } from '../../utils/dateUtils';

const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '16px 18px', ...style }}>{children}</div>
);

const Label = ({ children }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)', marginBottom: 12 }}>{children}</p>
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

const colorPorTipoAlerta = (tipo = '') => {
  const t = tipo.toLowerCase();
  if (t.includes('robo'))       return 'var(--accent)';
  if (t.includes('movimiento')) return 'var(--amber)';
  return 'var(--cyan)';
};

export default function DashboardTecnico() {
  const navigate = useNavigate();

  const [alertas,        setAlertas]        = useState([]);
  const [tickets,        setTickets]        = useState([]);
  const [cargando,       setCargando]       = useState(true);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [a, tks] = await Promise.all([
        tecnicoService.getAlerts(),
        ticketService.getAll(),
      ]);
      setAlertas(Array.isArray(a) ? a : []);
      setTickets(Array.isArray(tks) ? tks : []);
    } catch {}
    setCargando(false);
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const alertasActivas    = alertas.filter(a => a.estado_alerta === 'activo');
  const ticketsActivos    = tickets.filter(t => ['asignado', 'en_proceso'].includes(t.estado));
  const ticketsResueltos  = tickets.filter(t => t.estado === 'resuelto');

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6 }}>PANEL TÉCNICO</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div className="anim-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 5px var(--green)' }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>Sistema operativo</span>
            </div>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>
              {ticketsActivos.length} ticket{ticketsActivos.length !== 1 ? 's' : ''} activo{ticketsActivos.length !== 1 ? 's' : ''}
              {alertasActivas.length > 0 && ` · ${alertasActivas.length} alertas visibles`}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { etiqueta: 'ASIGNADOS',  valor: tickets.filter(t => t.estado === 'asignado').length,   color: 'var(--amber)'        },
          { etiqueta: 'EN PROCESO', valor: tickets.filter(t => t.estado === 'en_proceso').length,  color: 'var(--cyan)'         },
          { etiqueta: 'RESUELTOS',  valor: ticketsResueltos.length,                               color: 'var(--green)'        },
          { etiqueta: 'TOTAL',      valor: tickets.length,                                        color: 'var(--text-primary)' },
        ].map(s => (
          <Card key={s.etiqueta} style={{ padding: '14px 16px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{s.etiqueta}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 300, color: s.color }}>{s.valor}</span>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

        <Card>
          <Label>MIS TICKETS ACTIVOS</Label>
          {cargando ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
                style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto 8px' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </div>
          ) : ticketsActivos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green-soft)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--green)' }}>Sin tickets activos</p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginTop: 6 }}>Los tickets se asignan por el supervisor o administrador</p>
            </div>
          ) : ticketsActivos.slice(0, 5).map((t, i) => {
            const ce = COLORES_ESTADO_TICKET[t.estado] || COLORES_ESTADO_TICKET.pendiente;
            const cp = COLORES_PRIORIDAD[t.prioridad]  || COLORES_PRIORIDAD.media;
            return (
              <div key={t.id_ticket} style={{ padding: '10px 0', borderBottom: i < Math.min(ticketsActivos.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-faint)' }}>#{t.id_ticket}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: ce.color, background: ce.bg, border: `1px solid ${ce.border}`, padding: '1px 6px', borderRadius: 3 }}>
                        {t.estado.replace('_', ' ').toUpperCase()}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: cp.color, background: cp.bg, border: `1px solid ${cp.border}`, padding: '1px 6px', borderRadius: 3 }}>
                        {t.prioridad?.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.titulo}</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginTop: 2 }}>
                      {t.usuario_afectado?.nombre_completo || '—'}
                      {t.vehiculo ? ` · ${t.vehiculo.marca} ${t.vehiculo.modelo}` : ''}
                    </p>
                  </div>
                </div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>{fmtDateTime(t.fecha_creacion)}</p>
              </div>
            );
          })}
          {ticketsActivos.length > 0 && (
            <button onClick={() => navigate('/tickets-tecnico')} style={{ marginTop: 12, width: '100%', padding: '9px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.1em' }}>
              VER TODOS MIS TICKETS →
            </button>
          )}
        </Card>

        {alertasActivas.length > 0 && (
          <Card>
            <Label>ALERTAS ACTIVAS — Solo lectura</Label>
            {alertasActivas.slice(0, 4).map((a, i) => {
              const color = colorPorTipoAlerta(a.tipo_incidencia);
              return (
                <div key={a.id_alerta} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: i < Math.min(alertasActivas.length, 4) - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                  <div className="anim-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{a.tipo_incidencia}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginLeft: 10 }}>
                      {a.fecha_hora ? fmtDateTime(a.fecha_hora) : ''}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-faint)', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 4, flexShrink: 0 }}>SOLO LECTURA</span>
                </div>
              );
            })}
            <button onClick={() => navigate('/map')} style={{ marginTop: 12, width: '100%', padding: '9px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.1em' }}>
              VER EN MAPA →
            </button>
          </Card>
        )}

      </div>
    </div>
  );
}