import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedRing from '../components/ring/AnimatedRing';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { vehicleService, alertService, routeService } from '../services/api';

const Card = ({ children, style = {}, onClick }) => (
  <div className={`mg-card${onClick ? ' mg-card-hover' : ''}`}
    onClick={onClick} style={{ padding: '16px 18px', ...style, cursor: onClick ? 'pointer' : 'default' }}>
    {children}
  </div>
);
const Label = ({ children, action, onAction }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)' }}>{children}</span>
    {action && <button onClick={onAction} style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>{action}</button>}
  </div>
);
const Dot = ({ color = 'var(--green)', pulse = false, size = 7 }) => (
  <div className={pulse ? 'anim-blink' : ''} style={{ width: size, height: size, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
);
const Empty = ({ msg }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '20px 0' }}>{msg}</p>
);

const MODES = {
  armado:     { label: 'ARMADO',     color: 'var(--accent)',    desc: 'Protección activa',   ringStatus: 'armed' },
  desarmado:  { label: 'DESARMADO',  color: 'var(--text-muted)',desc: 'Sin protección',       ringStatus: 'disarmed' },
  valet:      { label: 'MODO VALET', color: 'var(--cyan)',      desc: 'Velocidad limitada',   ringStatus: 'valet' },
  emergencia: { label: 'EMERGENCIA', color: '#ff2222',          desc: 'Ayuda en camino',      ringStatus: 'emergency' },
};

const sevColor = { high: 'var(--accent)', medium: 'var(--amber)', low: 'var(--green)' };

export default function DashboardUser() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [vehicle,   setVehicle]   = useState(null);
  const [alerts,    setAlerts]    = useState([]);
  const [routes,    setRoutes]    = useState([]);
  const [mode,      setMode]      = useState('armado');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [vehs, alts, rts] = await Promise.all([
          vehicleService.getAll(),
          alertService.getAll(),
          routeService.getAll(),
        ]);
        setVehicle(vehs[0] || null);  // primer vehículo del usuario
        setAlerts(alts.slice(0, 4));
        setRoutes(rts.slice(0, 3));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const ringStatus = MODES[mode]?.ringStatus || 'disarmed';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
          style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto 12px' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>CARGANDO...</span>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 4 }}>
            BIENVENIDO, {(currentUser?.nombre_completo || '').split(' ')[0].toUpperCase()}
          </p>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>
            {vehicle ? `${vehicle.marca} ${vehicle.modelo}` : 'SIN VEHÍCULO'}
          </h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            {vehicle ? `${vehicle.placa} · ${vehicle.color || ''}` : 'Registra tu moto en Mi Perfil'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--green-soft)', border: '1px solid var(--green-border)', borderRadius: 8 }}>
            <Dot pulse />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--green)', letterSpacing: '0.1em' }}>SISTEMA ACTIVO</span>
          </div>
          <ThemeToggle compact />
        </div>
      </div>

      {/* Si no tiene vehículo */}
      {!vehicle && (
        <Card style={{ marginBottom: 20, background: 'var(--accent-soft)', border: '1px solid var(--accent-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>No tienes vehículos registrados</p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>Registra tu moto para usar todas las funciones</p>
            </div>
            <button onClick={() => navigate('/profile')} style={{
              padding: '10px 18px', background: 'var(--accent)', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: '#fff',
            }}>
              IR A MI PERFIL →
            </button>
          </div>
        </Card>
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, alignItems: 'start' }}>

        {/* LEFT: Ring + battery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <AnimatedRing status={ringStatus} size={210} />
            {vehicle && (
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
                    DISPOSITIVO BLE
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>
                    Pendiente vinculación
                  </span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: 'var(--border)' }}>
                  <div style={{ height: '100%', width: '0%', borderRadius: 2, background: 'var(--text-muted)' }} />
                </div>
              </div>
            )}
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
                fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: q.color, transition: 'all .2s',
              }}>
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: Security modes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <Label>MODOS DE SEGURIDAD</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(MODES).map(([key, m]) => {
                const active = mode === key;
                return (
                  <button key={key} onClick={() => setMode(key)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                    background: active ? 'var(--accent-soft)' : 'var(--bg-surface)',
                    border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
                    borderRadius: 10, cursor: 'pointer', transition: 'all .22s', textAlign: 'left',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0,
                      boxShadow: active ? `0 0 6px ${m.color}` : 'none' }} />
                    <div>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: active ? m.color : 'var(--text-muted)', display: 'block' }}>
                        {m.label}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', display: 'block' }}>{m.desc}</span>
                    </div>
                    {active && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: m.color, boxShadow: `0 0 5px ${m.color}` }} />}
                  </button>
                );
              })}
            </div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginTop: 10, letterSpacing: '0.06em', textAlign: 'center' }}>
              Control físico disponible al conectar anillo BLE
            </p>
          </Card>

          {/* My alerts */}
          <Card>
            <Label action="VER TODAS →" onAction={() => navigate('/map')}>MIS ALERTAS</Label>
            {alerts.length === 0
              ? <Empty msg="Sin alertas registradas" />
              : alerts.map((a, i) => {
                  const sevLevel = a.tipo_incidencia === 'Robo' ? 'high' : a.tipo_incidencia === 'Movimiento' ? 'medium' : 'low';
                  const c = sevColor[sevLevel];
                  return (
                    <div key={a.id_alerta} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < alerts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <Dot color={c} pulse={a.estado_alerta === 'pendiente'} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{a.tipo_incidencia}</span>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: c }}>{a.estado_alerta?.toUpperCase()}</span>
                        </div>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>
                          {a.fecha_hora ? new Date(a.fecha_hora).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
            }
          </Card>
        </div>

        {/* RIGHT: Routes + vehicle summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <Label action="VER TODAS →" onAction={() => navigate('/routes')}>MIS RUTAS RECIENTES</Label>
            {routes.length === 0
              ? <Empty msg="Sin rutas registradas" />
              : routes.map((r, i) => (
                  <div key={r.id_ruta} style={{ padding: '10px 0', borderBottom: i < routes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)' }}>
                        {r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString('es-PE') : ''}
                      </span>
                      <span style={{
                        fontFamily: 'JetBrains Mono', fontSize: 8,
                        color: r.estado_viaje === 'completado' ? 'var(--green)' : r.estado_viaje === 'alerta' ? 'var(--accent)' : 'var(--amber)',
                        background: r.estado_viaje === 'completado' ? 'var(--green-soft)' : r.estado_viaje === 'alerta' ? 'var(--accent-soft)' : 'var(--amber-soft)',
                        border: `1px solid ${r.estado_viaje === 'completado' ? 'var(--green-border)' : r.estado_viaje === 'alerta' ? 'var(--accent-border)' : 'var(--amber-border)'}`,
                        padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap',
                      }}>{r.estado_viaje?.toUpperCase()}</span>
                    </div>
                    {r.distancia_km && (
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 300, color: 'var(--text-primary)' }}>
                        {parseFloat(r.distancia_km).toFixed(1)} km
                      </span>
                    )}
                    {r.origen && r.destino && (
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                        {r.origen} → {r.destino}
                      </p>
                    )}
                  </div>
                ))
            }
          </Card>

          {/* Vehicle card */}
          {vehicle && (
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
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{vehicle.marca} {vehicle.modelo}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    {vehicle.placa} {vehicle.anio ? `· ${vehicle.anio}` : ''} {vehicle.color ? `· ${vehicle.color}` : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => navigate('/profile')} style={{
                width: '100%', padding: '9px', borderRadius: 8, cursor: 'pointer',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-muted)',
              }}>
                EDITAR EN MI PERFIL →
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}