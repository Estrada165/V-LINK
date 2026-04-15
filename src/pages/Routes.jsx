import React, { useState } from 'react';
import { mockRoutes, mockRoutePaths } from '../mocks/mockData';

const Card = ({ children, style = {}, onClick }) => (
  <div className={`mg-card${onClick ? ' mg-card-hover' : ''}`}
    onClick={onClick}
    style={{ padding: '16px 18px', ...style, cursor: onClick ? 'pointer' : 'default' }}>
    {children}
  </div>
);

const Label = ({ children }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 12 }}>
    {children}
  </p>
);

// Fixed badge — no overflow
const StatusBadge = ({ status }) => {
  const isOk = status === 'COMPLETADO';
  return (
    <span style={{
      display: 'inline-block',
      fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.08em',
      color: isOk ? 'var(--green)' : 'var(--accent)',
      background: isOk ? 'var(--green-soft)' : 'var(--accent-soft)',
      border: `1px solid ${isOk ? 'var(--green-border)' : 'var(--accent-border)'}`,
      padding: '3px 8px', borderRadius: 4,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {status}
    </span>
  );
};

const SeverityBadge = ({ severity }) => {
  const map = {
    high:   ['var(--accent)',  'var(--accent-soft)',  'var(--accent-border)',  'CRÍTICO'],
    medium: ['var(--amber)',   'var(--amber-soft)',   'var(--amber-border)',   'MODERADO'],
    low:    ['var(--green)',   'var(--green-soft)',   'var(--green-border)',   'SEGURO'],
  };
  const [c, bg, b, label] = map[severity] || map.low;
  return (
    <span style={{
      display: 'inline-block',
      fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.08em',
      color: c, background: bg, border: `1px solid ${b}`,
      padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {label}
    </span>
  );
};

export default function Routes() {
  const [activeTab, setActiveTab] = useState('history'); // history | map-routes

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>
            RUTAS
          </h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            Historial y zonas de ruta en Piura
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, gap: 4 }}>
          {[['history','Historial'],['map-routes','Rutas del mapa']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              padding: '7px 16px', borderRadius: 7, cursor: 'pointer',
              fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em',
              background: activeTab === key ? 'var(--bg-card)' : 'transparent',
              border: activeTab === key ? '1px solid var(--border)' : '1px solid transparent',
              color: activeTab === key ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all .2s',
            }}>
              {label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'history' && (
        <>
          {/* Route rows */}
          <Card style={{ marginBottom: 16 }}>
            <Label>HISTORIAL COMPLETO</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 80px 60px 90px',
                gap: 8, paddingBottom: 10,
                borderBottom: '1px solid var(--border)',
                marginBottom: 4,
              }}>
                {['FECHA', 'TRAYECTO', 'DISTANCIA', 'ALERTAS', 'ESTADO'].map(h => (
                  <span key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    {h}
                  </span>
                ))}
              </div>

              {mockRoutes.map((route, i) => (
                <div key={route.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 80px 60px 90px',
                  gap: 8, alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: i < mockRoutes.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-secondary)' }}>{route.date}</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{route.duration}</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {route.origin}
                    </p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      → {route.destination}
                    </p>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 300, color: 'var(--text-primary)' }}>
                    {route.distance}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: route.alerts > 0 ? 'var(--accent)' : 'var(--text-muted)', textAlign: 'center' }}>
                    {route.alerts}
                  </span>
                  {/* Fixed: badge contained in its column */}
                  <div>
                    <StatusBadge status={route.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
            {[
              { label: 'TOTAL RUTAS',   value: mockRoutes.length, color: 'var(--text-primary)' },
              { label: 'KM TOTALES',    value: '21.1 km', color: 'var(--cyan)' },
              { label: 'CON ALERTAS',   value: '1', color: 'var(--accent)' },
              { label: 'TIEMPO TOTAL',  value: '1h 31m', color: 'var(--amber)' },
            ].map(s => (
              <Card key={s.label} style={{ padding: '14px 16px' }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>{s.label}</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 300, color: s.color }}>{s.value}</p>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'map-routes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            RUTAS FICTICIAS REGISTRADAS EN PIURA
          </p>
          {mockRoutePaths.map(route => (
            <Card key={route.id} style={{ borderLeft: `3px solid ${route.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Route color line visual */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{ width: 12, height: 3, background: route.color, borderRadius: 2, opacity: 1 - i * 0.15 }} />
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{route.label}</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                      {route.points.length} puntos · Piura, Perú
                    </p>
                  </div>
                </div>
                <SeverityBadge severity={route.severity} />
              </div>
            </Card>
          ))}

          <Card style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.07em' }}>
                Las rutas se sincronizan con el mapa de calor en tiempo real
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}