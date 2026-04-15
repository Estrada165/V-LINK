import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedRing from '../components/ring/AnimatedRing';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { mockVehicle, mockAlerts, mockRoutes, mockTelemetry } from '../mocks/mockData';

/* ── atoms ───────────────────────────────────────────────── */
const Card = ({ children, style = {}, onClick }) => (
  <div className={`mg-card${onClick ? ' mg-card-hover' : ''}`}
    onClick={onClick} style={{ padding: '16px 18px', ...style, cursor: onClick ? 'pointer' : 'default' }}>
    {children}
  </div>
);
const Label = ({ children, action, onAction }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)' }}>{children}</span>
    {action && <button onClick={onAction} style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}>{action}</button>}
  </div>
);
const Dot = ({ color = 'var(--green)', pulse = false, size = 7 }) => (
  <div className={pulse ? 'anim-blink' : ''} style={{ width: size, height: size, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
);

/* ── security modes ──────────────────────────────────────── */
const MODES = {
  armed:    { label: 'ARMADO',     color: 'var(--accent)', desc: 'Protección activa', Icon: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
  disarmed: { label: 'DESARMADO', color: 'var(--text-muted)', desc: 'Sin protección', Icon: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> },
  valet:    { label: 'VALET',     color: 'var(--cyan)',   desc: 'Velocidad limitada', Icon: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l3 3"/></svg> },
  emergency:{ label: 'EMERGENCIA',color: '#ff2222',       desc: 'Ayuda en camino',   Icon: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
};

const ModeBtn = ({ mKey, active, onClick }) => {
  const m = MODES[mKey];
  return (
    <button onClick={() => onClick(mKey)} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
      background: active ? 'var(--accent-soft)' : 'var(--bg-surface)',
      border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
      borderRadius: 10, cursor: 'pointer', transition: 'all .22s', textAlign: 'left',
    }}>
      <span style={{ color: active ? m.color : 'var(--text-muted)', transition: 'color .22s' }}><m.Icon /></span>
      <div>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: active ? m.color : 'var(--text-muted)', display: 'block' }}>{m.label}</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginTop: 1, display: 'block' }}>{m.desc}</span>
      </div>
      {active && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: m.color, boxShadow: `0 0 5px ${m.color}` }} />}
    </button>
  );
};

const sev = {
  high:   ['var(--accent)', 'var(--accent-soft)',  'var(--accent-border)'],
  medium: ['var(--amber)',  'var(--amber-soft)',   'var(--amber-border)'],
  low:    ['var(--green)',  'var(--green-soft)',   'var(--green-border)'],
};

const AlertRow = ({ alert, last }) => {
  const [c, bg, b] = sev[alert.severity] || sev.low;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <Dot color={c} pulse={alert.status === 'pendiente'} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{alert.type}</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: c, background: bg, border: `1px solid ${b}`, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.1em' }}>
            {alert.status.toUpperCase()}
          </span>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>
          {alert.time}{alert.distance ? ` · ${alert.distance}` : ''}
        </span>
      </div>
    </div>
  );
};

/* ── Dashboard User ──────────────────────────────────────── */
export default function DashboardUser() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('armed');
  const toggle = k => setMode(k === mode ? 'disarmed' : k);
  const myAlerts = mockAlerts; // in real app: filtered by user

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 4 }}>
            BIENVENIDO, {currentUser?.name.split(' ')[0].toUpperCase()}
          </p>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>
            {mockVehicle.name}
          </h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            {mockVehicle.plate} · {mockVehicle.location.address}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--green-soft)', border: '1px solid var(--green-border)', borderRadius: 8 }}>
            <Dot pulse />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--green)', letterSpacing: '0.1em' }}>CONECTADO</span>
          </div>
          <ThemeToggle compact />
        </div>
      </div>

      {/* Main layout — responsive */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, alignItems: 'start' }}>

        {/* Ring + battery + quick stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <AnimatedRing status={mode} size={210} />
            {/* Battery */}
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>BATERÍA ANILLO</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--green)' }}>{mockVehicle.battery}%</span>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: 'var(--border)' }}>
                <div style={{ height: '100%', width: `${mockVehicle.battery}%`, borderRadius: 2, background: 'var(--green)', boxShadow: '0 0 5px var(--green)', transition: 'width .7s' }} />
              </div>
            </div>
          </Card>

          {/* Quick links */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'VER EN MAPA', path: '/map', color: 'var(--cyan)' },
              { label: 'MIS RUTAS',   path: '/routes', color: 'var(--text-secondary)' },
              { label: 'AJUSTES',     path: '/settings', color: 'var(--amber)' },
              { label: 'MI PERFIL',   path: '/profile', color: 'var(--text-secondary)' },
            ].map(q => (
              <button key={q.path} onClick={() => navigate(q.path)} style={{
                padding: '12px 10px', borderRadius: 10, cursor: 'pointer',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em',
                color: q.color, transition: 'all .2s',
              }}>
                {q.label}
              </button>
            ))}
          </div>

          {/* Signal info */}
          <Card style={{ padding: '12px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, textAlign: 'center' }}>
              {[
                { label: 'SEÑAL BLE', value: 'Fuerte', color: 'var(--green)' },
                { label: 'GPS',       value: 'Activo', color: 'var(--cyan)' },
                { label: 'LATENCIA',  value: mockTelemetry.latency, color: 'var(--text-secondary)' },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Modes + alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <Label>MODOS DE SEGURIDAD</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.keys(MODES).map(k => (
                <ModeBtn key={k} mKey={k} active={mode === k} onClick={toggle} />
              ))}
            </div>
          </Card>

          <Card>
            <Label action="VER TODO →">MIS ALERTAS</Label>
            {myAlerts.map((a, i) => <AlertRow key={a.id} alert={a} last={i === myAlerts.length - 1} />)}
          </Card>
        </div>

        {/* My routes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <Label action="VER TODAS →" onAction={() => navigate('/routes')}>MIS RUTAS RECIENTES</Label>
            {mockRoutes.map((r, i) => (
              <div key={r.id} style={{ padding: '10px 0', borderBottom: i < mockRoutes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)' }}>{r.date}</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono', fontSize: 8,
                    color: r.status === 'COMPLETADO' ? 'var(--green)' : 'var(--accent)',
                    background: r.status === 'COMPLETADO' ? 'var(--green-soft)' : 'var(--accent-soft)',
                    border: `1px solid ${r.status === 'COMPLETADO' ? 'var(--green-border)' : 'var(--accent-border)'}`,
                    padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap',
                  }}>{r.status}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 300, color: 'var(--text-primary)' }}>{r.distance}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{r.duration}</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                  {r.origin} → {r.destination}
                </span>
              </div>
            ))}
          </Card>

          {/* My vehicle summary */}
          <Card>
            <Label>MI VEHÍCULO</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 32 22" width="26" height="18" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="5" cy="17" r="4"/><circle cx="27" cy="17" r="4"/>
                  <path d="M9 17L14 7L22 7L27 13"/><path d="M9 17L12 17L14 7"/><path d="M12 17L19 17"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{mockVehicle.name}</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{mockVehicle.plate} · Piura, Perú</p>
              </div>
            </div>
            <button onClick={() => navigate('/settings')} style={{
              width: '100%', padding: '10px', borderRadius: 8, cursor: 'pointer',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em',
              color: 'var(--text-muted)', transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              CONFIGURAR DISPOSITIVO
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}