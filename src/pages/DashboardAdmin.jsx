import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle';
import { adminService, alertService, routeService } from '../services/api';
import api from '../services/api';

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

/* ── Health Bar con datos reales ────────────────────────────── */
const HealthBar = ({ label, value, sublabel, tooltip, color }) => {
  const [showTip, setShowTip] = useState(false);
  const barColor = value >= 70 ? 'var(--green)'
                 : value >= 40 ? 'var(--amber)'
                 : 'var(--accent)';
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)' }}>{label}</span>
            {/* Botón ? con tooltip */}
            {tooltip && (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <span
                  onMouseEnter={() => setShowTip(true)}
                  onMouseLeave={() => setShowTip(false)}
                  style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', cursor: 'help',
                    width: 14, height: 14, borderRadius: '50%', border: '1px solid var(--border-mid)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>?</span>
                {showTip && (
                  <div style={{
                    position: 'absolute', left: 18, top: -4, zIndex: 100, whiteSpace: 'nowrap',
                    background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
                    borderRadius: 6, padding: '6px 10px',
                    fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }}>{tooltip}</div>
                )}
              </div>
            )}
          </div>
          {sublabel && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', display: 'block', marginTop: 1 }}>{sublabel}</span>}
        </div>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: barColor, marginLeft: 8, flexShrink: 0 }}>{value}%</span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, value))}%`, background: barColor, borderRadius: 2, boxShadow: `0 0 6px ${barColor}`, transition: 'width 1s ease-out' }} />
      </div>
    </div>
  );
};

export default function DashboardAdmin({ pendingCount = 0 }) {
  const navigate = useNavigate();
  const [users,   setUsers]   = useState([]);
  const [alerts,  setAlerts]  = useState([]);
  const [routes,  setRoutes]  = useState([]);
  const [health,  setHealth]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(true);

  const safeUsers  = Array.isArray(users)  ? users  : [];
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const safeRoutes = Array.isArray(routes) ? routes : [];

  /* ── Cargar datos principales ─────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [uRes, a, r] = await Promise.all([
          adminService.getAllUsers(),
          alertService.getAll(),
          routeService.getAll(),
        ]);
        const rawUsers = Array.isArray(uRes) ? uRes : (Array.isArray(uRes?.users) ? uRes.users : []);
        setUsers(rawUsers);
        setAlerts(Array.isArray(a) ? a.slice(0, 6) : []);
        setRoutes(Array.isArray(r) ? r.slice(0, 4) : []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  /* ── Cargar métricas de salud reales ──────────────────────── */
  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const { data } = await api.get('/admin/health');
      setHealth(data);
    } catch (e) {
      // Si falla, mostrar estado degradado
      setHealth({ status: 'error', backend: { health: 0, latency_ms: null, uptime: '—' }, database: { health: 0, connected: false }, memory: { health: 0, used_mb: 0, total_mb: 0 } });
    }
    setHealthLoading(false);
  }, []);

  useEffect(() => {
    loadHealth();
    // Actualizar cada 30 segundos
    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, [loadHealth]);

  const pendingUsers  = safeUsers.filter(u => !u.activo && u.rol !== 'admin');
  const activeUsers   = safeUsers.filter(u => u.activo);
  const activeAlerts  = safeAlerts.filter(a => a.estado_alerta === 'activo').length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
          style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto 10px' }}>
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
            {safeUsers.length} usuarios · {activeUsers.length} activos · {safeAlerts.length} alertas
          </span>
        </div>
        <ThemeToggle compact />
      </div>

      {/* Aviso pendientes */}
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
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.1em' }}>IR A USUARIOS →</span>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'USUARIOS TOTAL',  value: safeUsers.length,   color: 'var(--text-primary)' },
          { label: 'ACTIVOS',         value: activeUsers.length,  color: 'var(--green)' },
          { label: 'PENDIENTES',      value: pendingCount,        color: pendingCount > 0 ? 'var(--amber)' : 'var(--text-muted)' },
          { label: 'ALERTAS ACTIVAS', value: activeAlerts,        color: activeAlerts > 0 ? 'var(--accent)' : 'var(--green)' },
          { label: 'RUTAS',           value: safeRoutes.length,   color: 'var(--cyan)' },
          { label: 'INCIDENCIAS',     value: safeAlerts.length,   color: 'var(--text-primary)' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '14px 16px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{s.label}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 300, color: s.color }}>{s.value}</span>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

        {/* ── SALUD DEL SISTEMA — DATOS REALES ─────────────────── */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)' }}>SALUD DEL SISTEMA</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {healthLoading && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
                  style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              )}
              <button onClick={loadHealth} style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                ACTUALIZAR
              </button>
            </div>
          </div>

          {health ? (
            <>
              <HealthBar
                label="Backend Railway"
                sublabel={health.backend?.latency_ms != null ? `${health.backend.latency_ms}ms · uptime ${health.backend.uptime}` : 'Sin datos'}
                value={health.backend?.health || 0}
                tooltip="Verde <50ms · Amarillo <300ms · Rojo >300ms"
              />
              <HealthBar
                label="Supabase BD"
                sublabel={health.database?.latency_ms != null ? `${health.database.latency_ms}ms latencia · ${health.database.counts?.usuarios || 0} usuarios` : 'Sin conexión'}
                value={health.database?.health || 0}
                tooltip="Verde <100ms · Amarillo <500ms · Rojo >500ms"
              />
              <HealthBar
                label="Memoria Node.js"
                sublabel={`${health.memory?.used_mb || 0}MB / ${health.memory?.total_mb || 0}MB heap`}
                value={health.memory?.health || 0}
                tooltip="Heap usado/total. Fluctúa por garbage collector"
              />

              {/* Estado general */}
              <div style={{ marginTop: 14, padding: '8px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: health.status === 'ok' ? 'var(--green-soft)' : health.status === 'degraded' ? 'var(--amber-soft)' : 'var(--accent-soft)',
                border: `1px solid ${health.status === 'ok' ? 'var(--green-border)' : health.status === 'degraded' ? 'var(--amber-border)' : 'var(--accent-border)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Dot
                    color={health.status === 'ok' ? 'var(--green)' : health.status === 'degraded' ? 'var(--amber)' : 'var(--accent)'}
                    pulse={health.status === 'ok'}
                  />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em',
                    color: health.status === 'ok' ? 'var(--green)' : health.status === 'degraded' ? 'var(--amber)' : 'var(--accent)',
                  }}>
                    {health.status === 'ok' ? 'SISTEMA OPERATIVO' : health.status === 'degraded' ? 'SISTEMA DEGRADADO' : 'ERROR DE CONEXIÓN'}
                  </span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>
                  {new Date(health.timestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {/* Info BD */}
              {health.database?.counts && (
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  {[
                    { label: 'Usuarios', value: health.database.counts.usuarios },
                    { label: 'Alertas',  value: health.database.counts.alertas },
                    { label: 'Motos',    value: health.database.counts.vehiculos },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '6px 8px', background: 'var(--bg-surface)', borderRadius: 6, textAlign: 'center' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: 'var(--text-primary)', display: 'block' }}>{item.value}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
                style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto 8px' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>OBTENIENDO MÉTRICAS...</span>
            </div>
          )}
        </Card>

        {/* Alertas */}
        <Card>
          <Label action="VER MAPA →" onAction={() => navigate('/map')}>ALERTAS RECIENTES</Label>
          {safeAlerts.length === 0 ? <Empty msg="Sin alertas registradas" /> : safeAlerts.map((a, i) => {
            const t = (a.tipo_incidencia || '').toLowerCase();
            const c = t.includes('robo') ? 'var(--accent)' : t.includes('movimiento') ? 'var(--amber)' : 'var(--green)';
            return (
              <div key={a.id_alerta} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < safeAlerts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <Dot color={c} size={6} />
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

        {/* Rutas */}
        <Card>
          <Label action="VER TODAS →" onAction={() => navigate('/routes')}>RUTAS RECIENTES</Label>
          {safeRoutes.length === 0 ? <Empty msg="Sin rutas registradas" /> : safeRoutes.map((r, i) => (
            <div key={r.id_ruta} style={{ padding: '9px 0', borderBottom: i < safeRoutes.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)' }}>
                  {r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString('es-PE') : '—'}
                </span>
                <span style={{
                  fontFamily: 'JetBrains Mono', fontSize: 8,
                  color: r.estado_viaje === 'completado' ? 'var(--green)' : 'var(--amber)',
                  background: r.estado_viaje === 'completado' ? 'var(--green-soft)' : 'var(--amber-soft)',
                  border: `1px solid ${r.estado_viaje === 'completado' ? 'var(--green-border)' : 'var(--amber-border)'}`,
                  padding: '1px 6px', borderRadius: 4,
                }}>{r.estado_viaje?.toUpperCase()}</span>
              </div>
              {r.distancia_km && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 300, color: 'var(--text-primary)' }}>{parseFloat(r.distancia_km).toFixed(1)} km</span>}
            </div>
          ))}
        </Card>

        {/* Acciones rápidas */}
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
                color, fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, transition: 'all .2s',
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