import React, { useState } from 'react';
import AnimatedRing from '../components/ring/AnimatedRing';
import SecurityModes from '../components/ui/SecurityModes';
import AlertCard from '../components/alerts/AlertCard';
import Card from '../components/ui/Card';
import { mockVehicle, mockAlerts, mockTelemetry, mockRoutes } from '../mocks/mockData';

const StatBox = ({ label, value, sub, color }) => (
  <Card className="flex flex-col items-center justify-center p-5 gap-1 text-center">
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '26px', color: color || '#f0f0f0', fontWeight: 300, letterSpacing: '-0.02em' }}>{value}</span>
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#6b6b6b', letterSpacing: '0.12em' }}>{label}</span>
    {sub && <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#2a2a2a', letterSpacing: '0.08em' }}>{sub}</span>}
  </Card>
);

// Mini sparkline SVG
const Sparkline = ({ data }) => {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const W = 200, H = 40;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((d.value - min) / (max - min)) * H;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke="#e03030" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      <polyline points={`0,${H} ${pts} ${W},${H}`} fill="url(#sg)" strokeWidth="0"/>
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e03030" stopOpacity="0.15"/><stop offset="100%" stopColor="#e03030" stopOpacity="0"/></linearGradient></defs>
    </svg>
  );
};

export default function Dashboard() {
  const [mode, setMode] = useState(mockVehicle.status);
  const pendingAlerts = mockAlerts.filter(a => a.status === 'pendiente').length;

  return (
    <div style={{ padding: '24px 28px', maxWidth: '100%' }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '32px', letterSpacing: '0.1em', color: '#f0f0f0', lineHeight: 1 }}>
            {mockVehicle.name}
          </h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#6b6b6b', letterSpacing: '0.1em' }}>
            {mockVehicle.plate} · {mockVehicle.location.address}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(29,185,84,0.06)', border: '1px solid rgba(29,185,84,0.12)', borderRadius: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1db954', boxShadow: '0 0 8px #1db954' }}/>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#1db954', letterSpacing: '0.12em' }}>CONECTADO</span>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatBox label="LATENCIA" value={mockTelemetry.latency} sub="PRIMERA RESP." color="#00c8c8" />
        <StatBox label="ALERTAS ACTIVAS" value={pendingAlerts} sub="INTERVENCIÓN REQ." color={pendingAlerts > 0 ? '#e03030' : '#1db954'} />
        <StatBox label="SLA UPTIME" value={mockTelemetry.slaPerformance} sub="EN CUMPLIMIENTO" color="#1db954" />
        <StatBox label="DISPOSITIVOS" value={mockTelemetry.activeDevices.toLocaleString()} sub="ACTIVOS GLOBAL" color="#f0f0f0" />
      </div>

      {/* ── Main 3-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: 16, alignItems: 'start' }}>

        {/* LEFT: Ring + battery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card className="p-6 flex flex-col items-center gap-4">
            <AnimatedRing status={mode} size={220} />
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#6b6b6b', letterSpacing: '0.1em' }}>BATERÍA</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#1db954' }}>{mockVehicle.battery}%</span>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: '#1f1f1f' }}>
                <div style={{ height: '100%', width: `${mockVehicle.battery}%`, borderRadius: 2, background: '#1db954', boxShadow: '0 0 6px #1db954', transition: 'width 0.7s ease' }}/>
              </div>
            </div>
          </Card>

          {/* Mini telemetry chart */}
          <Card className="p-4">
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#6b6b6b', letterSpacing: '0.12em', marginBottom: 10 }}>TELEMETRÍA GLOBAL</p>
            <Sparkline data={mockTelemetry.chartData} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#2a2a2a' }}>00:00</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#2a2a2a' }}>24:00</span>
            </div>
          </Card>
        </div>

        {/* CENTER: Security modes + alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card className="p-5">
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', letterSpacing: '0.15em', marginBottom: 14 }}>MODOS DE SEGURIDAD</p>
            <SecurityModes activeMode={mode} onModeChange={setMode} />
          </Card>

          <Card className="p-5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', letterSpacing: '0.15em' }}>ALERTAS RECIENTES</p>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#e03030', cursor: 'pointer' }}>VER TODO →</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mockAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)}
            </div>
          </Card>
        </div>

        {/* RIGHT: Routes + users */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card className="p-5">
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', letterSpacing: '0.15em', marginBottom: 14 }}>RUTAS RECIENTES</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mockRoutes.map(r => (
                <div key={r.id} style={{ paddingBottom: 10, borderBottom: '1px solid #1a1a1a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#a0a0a0' }}>{r.date}</span>
                    <span style={{
                      fontFamily: 'JetBrains Mono', fontSize: '8px',
                      color: r.status === 'COMPLETADO' ? '#1db954' : '#e03030',
                      background: r.status === 'COMPLETADO' ? 'rgba(29,185,84,0.08)' : 'rgba(224,48,48,0.08)',
                      border: `1px solid ${r.status === 'COMPLETADO' ? 'rgba(29,185,84,0.2)' : 'rgba(224,48,48,0.2)'}`,
                      padding: '1px 6px', borderRadius: 4,
                    }}>{r.status}</span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#f0f0f0' }}>{r.distance}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', marginLeft: 8 }}>{r.duration}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', letterSpacing: '0.15em', marginBottom: 14 }}>GESTIÓN DE USUARIOS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'Carlos Mendoza', device: 'Kawasaki-98881', status: 'VINCULADO' },
                { name: 'Elena Ríos',     device: 'Renault-77126',  status: 'VINCULADO' },
                { name: 'Javier Soler',  device: 'NUEVO DISP.',    status: 'PENDIENTE' },
              ].map(u => (
                <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1f1f1f', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#6b6b6b' }}>{u.name[0]}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', color: '#f0f0f0', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', marginTop: 1 }}>{u.device}</p>
                  </div>
                  <span style={{
                    fontFamily: 'JetBrains Mono', fontSize: '8px',
                    color: u.status === 'VINCULADO' ? '#1db954' : '#ffb400',
                    flexShrink: 0,
                  }}>● {u.status}</span>
                </div>
              ))}
            </div>
            <button style={{ marginTop: 14, width: '100%', padding: '8px', background: 'rgba(224,48,48,0.06)', border: '1px solid rgba(224,48,48,0.12)', borderRadius: 8, color: '#e03030', fontFamily: 'JetBrains Mono', fontSize: '9px', letterSpacing: '0.12em', cursor: 'pointer' }}>
              + VINCULAR NUEVO DISPOSITIVO
            </button>
          </Card>
        </div>
      </div>

      {/* ── Bottom stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
        {[
          { label: 'GPC PRECISION', value: mockTelemetry.uptime, sub: '0.7% ACTIVE', color: '#f0f0f0' },
          { label: 'SLA PERFORMANCE', value: mockTelemetry.slaPerformance, sub: '% COMPLETED', color: '#1db954' },
          { label: 'DATA TRANSFER', value: mockTelemetry.dataTransfer, sub: 'EN MES/MES', color: '#00c8c8' },
          { label: 'ACTIVE SESSIONS', value: mockTelemetry.activeSessions, sub: '2 YEAR TOTAL', color: '#f0f0f0' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#6b6b6b', letterSpacing: '0.1em' }}>{s.label}</p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: '18px', color: s.color, fontWeight: 300, marginTop: 3 }}>{s.value}</p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#2a2a2a', marginTop: 2 }}>{s.sub}</p>
            </div>
            <div style={{ width: 2, height: 32, background: s.color, borderRadius: 1, opacity: 0.4 }}/>
          </Card>
        ))}
      </div>

      {/* ── Mobile styles override ── */}
      <style>{`
        @media (max-width: 767px) {
          .desktop-grid { display: block !important; }
        }
      `}</style>
    </div>
  );
}
