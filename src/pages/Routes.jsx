import React, { useState, useEffect } from 'react';
import { routeService } from '../services/api';

const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '16px 18px', ...style }}>{children}</div>
);
const Label = ({ children }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 12 }}>{children}</p>
);

const StatusBadge = ({ status }) => {
  const map = {
    completado: ['var(--green)',  'var(--green-soft)',  'var(--green-border)'],
    alerta:     ['var(--accent)', 'var(--accent-soft)', 'var(--accent-border)'],
    en_curso:   ['var(--cyan)',   'var(--cyan-soft)',   'var(--cyan-border)'],
    cancelado:  ['var(--text-muted)', 'var(--bg-surface)', 'var(--border)'],
  };
  const [c, bg, b] = map[status] || map.cancelado;
  return (
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.08em', color: c, background: bg, border: `1px solid ${b}`, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
      {(status || 'desconocido').toUpperCase()}
    </span>
  );
};

export default function Routes() {
  const [routes,  setRoutes]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try { setRoutes(await routeService.getAll()); }
      catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const totalKm = routes.reduce((acc, r) => acc + (parseFloat(r.distancia_km) || 0), 0);
  const withAlert = routes.filter(r => r.estado_viaje === 'alerta').length;

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>HISTORIAL DE RUTAS</h1>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
          Rutas registradas por tu vehículo
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'TOTAL RUTAS',  value: routes.length,           color: 'var(--text-primary)' },
          { label: 'KM TOTALES',   value: `${totalKm.toFixed(1)} km`, color: 'var(--cyan)' },
          { label: 'CON ALERTAS',  value: withAlert,               color: withAlert > 0 ? 'var(--accent)' : 'var(--text-muted)' },
          { label: 'COMPLETADAS',  value: routes.filter(r => r.estado_viaje === 'completado').length, color: 'var(--green)' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '14px 16px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>{s.label}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 300, color: s.color }}>{s.value}</span>
          </Card>
        ))}
      </div>

      {/* Routes list */}
      <Card>
        <Label>RUTAS REGISTRADAS</Label>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
              style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto 8px' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>CARGANDO...</span>
          </div>
        ) : routes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 12px' }}>
              <path d="M3 12h18"/><path d="M3 6l6 6-6 6"/>
            </svg>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)' }}>Sin rutas registradas</p>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-faint)', marginTop: 6 }}>
              Las rutas se registrarán automáticamente cuando el anillo BLE esté conectado
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px 80px 90px', gap: 8, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
              {['FECHA', 'TRAYECTO', 'DISTANCIA', 'DURACIÓN', 'ESTADO'].map(h => (
                <span key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{h}</span>
              ))}
            </div>

            {routes.map((r, i) => {
              const durMin = r.fecha_inicio && r.fecha_fin
                ? Math.round((new Date(r.fecha_fin) - new Date(r.fecha_inicio)) / 60000)
                : null;
              return (
                <div key={r.id_ruta} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px 80px 90px', gap: 8, alignItems: 'center', padding: '12px 0', borderBottom: i < routes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-secondary)' }}>
                      {r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                    </p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                      {r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.origen || 'Inicio'}
                    </p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      → {r.destino || 'Destino'}
                    </p>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 300, color: 'var(--text-primary)' }}>
                    {r.distancia_km ? `${parseFloat(r.distancia_km).toFixed(1)} km` : '—'}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)' }}>
                    {durMin !== null ? `${durMin}m` : '—'}
                  </span>
                  <StatusBadge status={r.estado_viaje} />
                </div>
              );
            })}
          </>
        )}
      </Card>

      {/* Info about future functionality */}
      {routes.length === 0 && (
        <Card style={{ marginTop: 16, background: 'var(--cyan-soft)', border: '1px solid var(--cyan-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.07em' }}>
              Las rutas se registrarán automáticamente con GPS real cuando el anillo BLE esté conectado al sistema
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}