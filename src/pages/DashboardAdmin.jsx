import React, { useState } from 'react';
import ThemeToggle from '../components/ui/ThemeToggle';
import { mockTelemetry, mockUsers, mockAlerts, mockRoutes } from '../mocks/mockData';

/* ── atoms ───────────────────────────────────────────────── */
const Card = ({ children, style = {}, onClick }) => (
  <div className={`mg-card${onClick ? ' mg-card-hover' : ''}`}
    onClick={onClick}
    style={{ padding: '16px 18px', ...style, cursor: onClick ? 'pointer' : 'default' }}>
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
const Stat = ({ label, value, sub, color = 'var(--text-primary)', accent }) => (
  <Card>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>{label}</span>
      {accent && <div style={{ width: 2, height: 18, background: color, borderRadius: 1, opacity: .5 }} />}
    </div>
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 300, color, letterSpacing: '-0.02em' }}>{value}</span>
    {sub && <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginTop: 3, letterSpacing: '0.08em' }}>{sub}</p>}
  </Card>
);
const Sparkline = ({ data = [] }) => {
  const vals = data.map(d => d.value);
  const max = Math.max(...vals) || 1, min = Math.min(...vals) || 0;
  const W = 200, H = 34;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * W},${H - ((d.value - min) / (max - min || 1)) * H}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".75" />
    </svg>
  );
};

/* ── system health bar ───────────────────────────────────── */
const HealthBar = ({ label, value, color }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color }}>{value}%</span>
    </div>
    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2 }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 2, boxShadow: `0 0 5px ${color}`, transition: 'width .7s' }} />
    </div>
  </div>
);

/* ── all users table ─────────────────────────────────────── */
const ALL_USERS = [
  { id: 1, name: 'Carlos Mendoza', device: 'Kawasaki Z900',   plate: 'ABC-123', status: 'online',  alerts: 2, battery: 87 },
  { id: 2, name: 'Elena Ríos',     device: 'Honda CB500',     plate: 'XYZ-456', status: 'online',  alerts: 0, battery: 62 },
  { id: 3, name: 'Javier Soler',   device: 'Yamaha MT-07',    plate: 'DEF-789', status: 'offline', alerts: 1, battery: 34 },
  { id: 4, name: 'Ana Torres',     device: 'Kawasaki Ninja',  plate: 'GHI-012', status: 'online',  alerts: 0, battery: 91 },
  { id: 5, name: 'Luis Vargas',    device: 'Honda CRF',       plate: 'JKL-345', status: 'offline', alerts: 3, battery: 15 },
];

export default function DashboardAdmin() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.14em',
              color: 'var(--accent)', background: 'var(--accent-soft)',
              border: '1px solid var(--accent-border)', padding: '3px 8px', borderRadius: 4,
            }}>ADMIN</span>
          </div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>
            PANEL DE CONTROL
          </h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            Telemetría global · gestión del sistema
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--green-soft)', border: '1px solid var(--green-border)', borderRadius: 8 }}>
            <Dot pulse />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--green)', letterSpacing: '0.1em' }}>SISTEMA OPERATIVO</span>
          </div>
          <ThemeToggle compact />
        </div>
      </div>

      {/* Global stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        <Stat label="LATENCIA"      value={mockTelemetry.latency}          sub="PRIMERA RESP."     color="var(--cyan)"   accent />
        <Stat label="DISPOSITIVOS"  value={mockTelemetry.activeDevices.toLocaleString()} sub="ACTIVOS GLOBAL" accent />
        <Stat label="SLA UPTIME"    value={mockTelemetry.slaPerformance}   sub="EN CUMPLIMIENTO"   color="var(--green)"  accent />
        <Stat label="SESIONES"      value={mockTelemetry.activeSessions}   sub="EN ESTE MOMENTO"   color="var(--amber)"  accent />
        <Stat label="ALERTAS HOY"   value="6"                               sub="4 PENDIENTES"      color="var(--accent)" accent />
        <Stat label="INCIDENCIAS"   value="9"                               sub="REPORTADAS HOY"    accent />
      </div>

      {/* Main 3-col */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, alignItems: 'start' }}>

        {/* LEFT: system health + chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <Card>
            <Label>SALUD DEL SISTEMA</Label>
            <HealthBar label="CPU Railway"      value={38} color="var(--green)" />
            <HealthBar label="Memoria RAM"      value={61} color="var(--cyan)" />
            <HealthBar label="BD Supabase"      value={22} color="var(--green)" />
            <HealthBar label="Ancho de banda"   value={74} color="var(--amber)" />
            <HealthBar label="Almacenamiento"   value={45} color="var(--green)" />
            <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--green-soft)', border: '1px solid var(--green-border)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Dot color="var(--green)" pulse />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--green)', letterSpacing: '0.1em' }}>SYSTEM HEALTHY</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginLeft: 'auto' }}>UPTIME {mockTelemetry.uptime}</span>
            </div>
          </Card>

          <Card>
            <Label>TELEMETRÍA 24H</Label>
            <Sparkline data={mockTelemetry.chartData} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>00:00</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>24:00</span>
            </div>
          </Card>

          {/* Bottom metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'SLA',      value: mockTelemetry.slaPerformance, color: 'var(--green)' },
              { label: 'DATA',     value: mockTelemetry.dataTransfer,   color: 'var(--cyan)' },
              { label: 'UPTIME',   value: mockTelemetry.uptime,         color: 'var(--amber)' },
              { label: 'ERRORES',  value: '0',                          color: 'var(--green)' },
            ].map(s => (
              <Card key={s.label} style={{ padding: '12px 14px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{s.label}</span>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 15, fontWeight: 300, color: s.color, marginTop: 4 }}>{s.value}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CENTER: all users */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <Label action="+ NUEVO USUARIO">GESTIÓN DE USUARIOS</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 50px 40px', gap: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                {['USUARIO', 'ESTADO', 'ALERTAS', 'BAT.'].map(h => (
                  <span key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{h}</span>
                ))}
              </div>
              {ALL_USERS.map((u, i) => (
                <button key={u.id} onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 70px 50px 40px',
                    gap: 8, alignItems: 'center', padding: '10px 0',
                    borderBottom: i < ALL_USERS.length - 1 ? '1px solid var(--border)' : 'none',
                    background: selectedUser?.id === u.id ? 'var(--accent-soft)' : 'none',
                    border: 'none', cursor: 'pointer', transition: 'background .2s',
                    borderRadius: selectedUser?.id === u.id ? 8 : 0,
                    textAlign: 'left',
                  }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.device}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Dot color={u.status === 'online' ? 'var(--green)' : 'var(--text-muted)'} pulse={u.status === 'online'} size={5} />
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: u.status === 'online' ? 'var(--green)' : 'var(--text-muted)' }}>
                      {u.status === 'online' ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: u.alerts > 0 ? 'var(--accent)' : 'var(--text-muted)', textAlign: 'center' }}>{u.alerts}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: u.battery < 30 ? 'var(--accent)' : 'var(--text-secondary)' }}>{u.battery}%</span>
                </button>
              ))}
            </div>

            {/* Selected user detail */}
            {selectedUser && (
              <div style={{ marginTop: 14, padding: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 10 }}>DETALLE · {selectedUser.name.toUpperCase()}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['Vehículo', selectedUser.device],
                    ['Placa',    selectedUser.plate],
                    ['Batería',  `${selectedUser.battery}%`],
                    ['Alertas',  selectedUser.alerts],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 7, border: '1px solid var(--border)' }}>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 2 }}>{k.toUpperCase()}</p>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-secondary)' }}>{v}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <button style={{ flex: 1, padding: '8px', borderRadius: 7, cursor: 'pointer', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', color: 'var(--accent)', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.08em' }}>
                    VER EN MAPA
                  </button>
                  <button style={{ flex: 1, padding: '8px', borderRadius: 7, cursor: 'pointer', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.08em' }}>
                    EDITAR USUARIO
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT: alerts + routes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <Card>
            <Label action="VER TODO →">ALERTAS GLOBALES</Label>
            {[
              { user: 'Carlos M.', type: 'Robo reportado',       time: '14:26', sev: 'high' },
              { user: 'Javier S.', type: 'Movimiento detectado', time: '13:48', sev: 'high' },
              { user: 'Luis V.',   type: 'Batería crítica',      time: '12:15', sev: 'medium' },
              { user: 'Carlos M.', type: 'Zona de riesgo',       time: '11:05', sev: 'low' },
            ].map((a, i, arr) => {
              const c = a.sev === 'high' ? 'var(--accent)' : a.sev === 'medium' ? 'var(--amber)' : 'var(--green)';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <Dot color={c} pulse={a.sev === 'high'} size={6} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{a.type}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{a.time}</span>
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{a.user}</span>
                  </div>
                </div>
              );
            })}
          </Card>

          <Card>
            <Label>RUTAS RECIENTES — TODOS</Label>
            {mockRoutes.map((r, i) => (
              <div key={r.id} style={{ padding: '9px 0', borderBottom: i < mockRoutes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)' }}>{r.date}</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono', fontSize: 8,
                    color: r.status === 'COMPLETADO' ? 'var(--green)' : 'var(--accent)',
                    background: r.status === 'COMPLETADO' ? 'var(--green-soft)' : 'var(--accent-soft)',
                    border: `1px solid ${r.status === 'COMPLETADO' ? 'var(--green-border)' : 'var(--accent-border)'}`,
                    padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap',
                  }}>{r.status}</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 300, color: 'var(--text-primary)' }}>{r.distance}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginLeft: 8 }}>{r.duration}</span>
              </div>
            ))}
          </Card>

          {/* Quick actions admin */}
          <Card>
            <Label>ACCIONES RÁPIDAS</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Exportar reporte global',  'var(--cyan)'],
                ['Enviar alerta masiva',     'var(--accent)'],
                ['Reiniciar servidor',       'var(--amber)'],
              ].map(([label, color]) => (
                <button key={label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  color, fontFamily: 'DM Sans', fontSize: 12, fontWeight: 500,
                  transition: 'all .2s',
                }}>
                  {label}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}