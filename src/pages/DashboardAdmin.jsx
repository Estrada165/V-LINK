import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle';
import { adminService, alertService, routeService } from '../services/api';

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
const HealthBar = ({ label, value, color }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color }}>{value}%</span>
    </div>
    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2 }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 2, boxShadow: `0 0 5px ${color}` }} />
    </div>
  </div>
);

export default function DashboardAdmin({ pendingCount = 0 }) {
  const navigate = useNavigate();
  const [users,   setUsers]   = useState([]);
  const [alerts,  setAlerts]  = useState([]);
  const [routes,  setRoutes]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [u, a, r] = await Promise.all([
          adminService.getAllUsers(),
          alertService.getAll(),
          routeService.getAll(),
        ]);
        setUsers(u);
        setAlerts(a.slice(0, 6));
        setRoutes(r.slice(0, 4));
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const pendingUsers = users.filter(u => !u.activo && u.rol !== 'admin');
  const activeUsers  = users.filter(u => u.activo);
  const pendingAlerts = alerts.filter(a => a.estado_alerta === 'pendiente').length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto 10px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.14em', color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', padding: '3px 8px', borderRadius: 4 }}>ADMIN</span>
            {pendingCount > 0 && (
              <button onClick={() => navigate('/users')} style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.1em', color: 'var(--amber)', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', padding: '3px 10px', borderRadius: 4, cursor: 'pointer' }}>
                {pendingCount} PENDIENTE{pendingCount > 1 ? 'S' : ''} DE ACTIVAR →
              </button>
            )}
          </div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>PANEL DE CONTROL</h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            {users.length} usuarios · {activeUsers.length} activos · {alerts.length} alertas
          </span>
        </div>
        <ThemeToggle compact />
      </div>

      {/* Aviso pendientes — clickeable */}
      {pendingUsers.length > 0 && (
        <Card onClick={() => navigate('/users')} style={{ marginBottom: 20, background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="anim-blink" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 8px var(--amber)', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {pendingUsers.length} cuenta{pendingUsers.length > 1 ? 's' : ''} pendiente{pendingUsers.length > 1 ? 's' : ''} de activación
                </p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {pendingUsers.map(u => u.nombre_completo).join(', ')}
                </p>
              </div>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.1em' }}>
              IR A USUARIOS →
            </span>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'USUARIOS TOTAL',  value: users.length,         color: 'var(--text-primary)' },
          { label: 'ACTIVOS',         value: activeUsers.length,   color: 'var(--green)' },
          { label: 'PENDIENTES',      value: pendingCount,         color: pendingCount > 0 ? 'var(--amber)' : 'var(--text-muted)' },
          { label: 'ALERTAS ACTIVAS', value: pendingAlerts,        color: pendingAlerts > 0 ? 'var(--accent)' : 'var(--green)' },
          { label: 'RUTAS HOY',       value: routes.length,        color: 'var(--cyan)' },
          { label: 'INCIDENCIAS',     value: alerts.length,        color: 'var(--text-primary)' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '14px 16px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{s.label}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 300, color: s.color }}>{s.value}</span>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

        {/* System health */}
        <Card>
          <Label>SALUD DEL SISTEMA</Label>
          <HealthBar label="Backend Railway"  value={42} color="var(--green)" />
          <HealthBar label="Supabase BD"      value={28} color="var(--green)" />
          <HealthBar label="Memoria"          value={61} color="var(--cyan)" />
          <HealthBar label="Ancho de banda"   value={74} color="var(--amber)" />
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--green-soft)', border: '1px solid var(--green-border)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Dot color="var(--green)" pulse />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--green)', letterSpacing: '0.1em' }}>SISTEMA OPERATIVO</span>
          </div>
        </Card>

        {/* Alertas reales */}
        <Card>
          <Label action="VER MAPA →" onAction={() => navigate('/map')}>ALERTAS RECIENTES</Label>
          {alerts.length === 0 ? <Empty msg="Sin alertas registradas" /> : alerts.map((a, i) => {
            const c = a.tipo_incidencia === 'Robo' ? 'var(--accent)' : a.tipo_incidencia === 'Movimiento' ? 'var(--amber)' : 'var(--green)';
            return (
              <div key={a.id_alerta} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < alerts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <Dot color={c} pulse={a.estado_alerta === 'pendiente'} size={6} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{a.tipo_incidencia}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>
                      {a.fecha_hora ? new Date(a.fecha_hora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{a.estado_alerta?.toUpperCase()}</span>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Rutas reales */}
        <Card>
          <Label action="VER TODAS →" onAction={() => navigate('/routes')}>RUTAS RECIENTES</Label>
          {routes.length === 0 ? <Empty msg="Sin rutas registradas" /> : routes.map((r, i) => (
            <div key={r.id_ruta} style={{ padding: '9px 0', borderBottom: i < routes.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)' }}>
                  {r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString('es-PE') : '—'}
                </span>
                <span style={{
                  fontFamily: 'JetBrains Mono', fontSize: 8,
                  color: r.estado_viaje === 'completado' ? 'var(--green)' : r.estado_viaje === 'alerta' ? 'var(--accent)' : 'var(--amber)',
                  background: r.estado_viaje === 'completado' ? 'var(--green-soft)' : r.estado_viaje === 'alerta' ? 'var(--accent-soft)' : 'var(--amber-soft)',
                  border: `1px solid ${r.estado_viaje === 'completado' ? 'var(--green-border)' : r.estado_viaje === 'alerta' ? 'var(--accent-border)' : 'var(--amber-border)'}`,
                  padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap',
                }}>{r.estado_viaje?.toUpperCase()}</span>
              </div>
              {r.distancia_km && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 300, color: 'var(--text-primary)' }}>{parseFloat(r.distancia_km).toFixed(1)} km</span>}
              {r.origen && <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{r.origen} → {r.destino}</p>}
            </div>
          ))}
        </Card>

        {/* Acciones rápidas admin */}
        <Card>
          <Label>ACCIONES RÁPIDAS</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Gestionar usuarios',      path: '/users',    color: 'var(--amber)' },
              { label: 'Ver mapa de incidencias', path: '/map',      color: 'var(--cyan)' },
              { label: 'Historial de rutas',      path: '/routes',   color: 'var(--text-secondary)' },
              { label: 'Ajustes del sistema',     path: '/settings', color: 'var(--text-secondary)' },
            ].map(({ label, path, color }) => (
              <button key={path} onClick={() => navigate(path)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px', borderRadius: 8, cursor: 'pointer',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                color, fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500,
                transition: 'all .2s',
              }}>
                {label}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}