import React, { useState, useEffect } from 'react';
import ThemeToggle from '../components/ui/ThemeToggle';
import { adminService, alertService, routeService } from '../services/api';
import api from '../services/api';

const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '16px 18px', ...style }}>{children}</div>
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

// Modal para resetear contraseña
function ResetPasswordModal({ user, onClose, onSave }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (pwd.length < 8) { setErr('Mínimo 8 caracteres'); return; }
    setLoading(true);
    try {
      await adminService.resetPassword(user.id_usuario, pwd);
      onSave();
    } catch (e) { setErr(e.error || 'Error'); }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="mg-card" style={{ width: '100%', maxWidth: 360, padding: 24 }}>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text-primary)', marginBottom: 6 }}>RESETEAR CONTRASEÑA</h3>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginBottom: 16 }}>{user.nombre_completo}</p>
        {err && <div style={{ padding: '8px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, marginBottom: 12 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)' }}>{err}</span>
        </div>}
        <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Nueva contraseña (mín. 8 chars)"
          style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 13, outline: 'none', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>CANCELAR</button>
          <button onClick={handle} disabled={loading} style={{ flex: 2, padding: '10px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: '#fff', letterSpacing: '0.1em' }}>
            {loading ? 'GUARDANDO...' : 'RESETEAR'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardAdmin() {
  const [users,   setUsers]   = useState([]);
  const [alerts,  setAlerts]  = useState([]);
  const [routes,  setRoutes]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetUser, setResetUser] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [u, a, r] = await Promise.all([
        adminService.getAllUsers(),
        alertService.getAll(),
        routeService.getAll(),
      ]);
      setUsers(u);
      setAlerts(a.slice(0, 5));
      setRoutes(r.slice(0, 4));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (user) => {
    try {
      await api.patch(`/admin/users/${user.id_usuario}/toggle-active`, { activo: !user.activo });
      setActionMsg(`${user.nombre_completo} ${!user.activo ? 'activado' : 'desactivado'}`);
      setTimeout(() => setActionMsg(''), 3000);
      await load();
    } catch (e) { console.error(e); }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`¿Eliminar a ${user.nombre_completo}? Esta acción no se puede deshacer.`)) return;
    try {
      await adminService.deleteUser(user.id_usuario);
      await load();
    } catch (e) { console.error(e); }
  };

  const pending  = users.filter(u => !u.activo && u.rol !== 'admin');
  const active   = users.filter(u => u.activo);
  const inactive = users.filter(u => !u.activo);

  // Stats reales
  const pendingAlerts = alerts.filter(a => a.estado_alerta === 'pendiente').length;

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.14em', color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', padding: '3px 8px', borderRadius: 4 }}>
              ADMINISTRADOR
            </span>
            {pending.length > 0 && (
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.1em', color: 'var(--amber)', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', padding: '3px 8px', borderRadius: 4 }}>
                {pending.length} PENDIENTE{pending.length > 1 ? 'S' : ''} DE ACTIVAR
              </span>
            )}
          </div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>PANEL DE CONTROL</h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            {users.length} usuarios · {active.length} activos · {alerts.length} alertas
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {actionMsg && (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--green)', background: 'var(--green-soft)', border: '1px solid var(--green-border)', padding: '6px 12px', borderRadius: 8 }}>
              {actionMsg}
            </span>
          )}
          <ThemeToggle compact />
        </div>
      </div>

      {/* Stats reales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'USUARIOS TOTAL',   value: users.length,         color: 'var(--text-primary)' },
          { label: 'ACTIVOS',          value: active.length,        color: 'var(--green)' },
          { label: 'PENDIENTES',       value: pending.length,       color: pending.length > 0 ? 'var(--amber)' : 'var(--text-muted)' },
          { label: 'ALERTAS ACTIVAS',  value: pendingAlerts,        color: pendingAlerts > 0 ? 'var(--accent)' : 'var(--green)' },
          { label: 'RUTAS REGISTRADAS',value: routes.length,        color: 'var(--cyan)' },
          { label: 'INCIDENCIAS HOY',  value: alerts.length,        color: 'var(--text-primary)' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '14px 16px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{s.label}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 300, color: s.color }}>{s.value}</span>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'start' }}>

        {/* GESTIÓN DE USUARIOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, gridColumn: 'span 2' }}>
          <Card>
            <Label>GESTIÓN DE USUARIOS</Label>

            {/* Pendientes de activar — destacados */}
            {pending.length > 0 && (
              <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', borderRadius: 10 }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--amber)', letterSpacing: '0.12em', marginBottom: 10 }}>
                  CUENTAS PENDIENTES DE ACTIVACIÓN
                </p>
                {pending.map(u => (
                  <div key={u.id_usuario} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--amber-border)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--amber)' }}>{u.nombre_completo[0]}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.nombre_completo}</p>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{u.correo_electronico}</p>
                    </div>
                    <button onClick={() => toggleActive(u)} style={{
                      padding: '7px 14px', background: 'var(--green)', border: 'none', borderRadius: 7,
                      cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: '#fff', letterSpacing: '0.08em', flexShrink: 0,
                    }}>
                      ACTIVAR
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tabla de todos los usuarios */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['USUARIO', 'CORREO', 'ROL', 'ESTADO', 'REGISTRO', 'ACCIONES'].map(h => (
                      <th key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '8px 10px', textAlign: 'left', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id_usuario} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: u.rol === 'admin' ? 'var(--accent-soft)' : 'var(--bg-surface)', border: `1px solid ${u.rol === 'admin' ? 'var(--accent-border)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: u.rol === 'admin' ? 'var(--accent)' : 'var(--text-muted)' }}>{u.nombre_completo[0]}</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{u.nombre_completo}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>{u.correo_electronico}</span>
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: u.rol === 'admin' ? 'var(--accent)' : 'var(--cyan)', background: u.rol === 'admin' ? 'var(--accent-soft)' : 'var(--cyan-soft)', border: `1px solid ${u.rol === 'admin' ? 'var(--accent-border)' : 'var(--cyan-border)'}`, padding: '2px 7px', borderRadius: 4 }}>
                          {u.rol.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Dot color={u.activo ? 'var(--green)' : 'var(--text-muted)'} size={6} />
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: u.activo ? 'var(--green)' : 'var(--text-muted)' }}>
                            {u.activo ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>
                          {u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString('es-PE') : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        {u.rol !== 'admin' && (
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            <button onClick={() => toggleActive(u)} style={{
                              padding: '5px 10px', borderRadius: 6, cursor: 'pointer', border: 'none',
                              background: u.activo ? 'var(--amber-soft)' : 'var(--green-soft)',
                              fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.08em',
                              color: u.activo ? 'var(--amber)' : 'var(--green)',
                            }}>
                              {u.activo ? 'DESACTIVAR' : 'ACTIVAR'}
                            </button>
                            <button onClick={() => setResetUser(u)} style={{
                              padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                              background: 'var(--bg-surface)', border: '1px solid var(--border)',
                              fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.08em',
                            }}>
                              RESET PWD
                            </button>
                            <button onClick={() => deleteUser(u)} style={{
                              padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                              background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                              fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--accent)', letterSpacing: '0.08em',
                            }}>
                              ELIMINAR
                            </button>
                          </div>
                        )}
                        {u.rol === 'admin' && (
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <Empty msg="Sin usuarios registrados" />}
            </div>
          </Card>
        </div>

        {/* ALERTAS REALES */}
        <Card>
          <Label>ALERTAS RECIENTES</Label>
          {alerts.length === 0
            ? <Empty msg="Sin alertas registradas" />
            : alerts.map((a, i) => {
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
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>
                        {a.estado_alerta?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })
          }
        </Card>

        {/* RUTAS REALES */}
        <Card>
          <Label>RUTAS RECIENTES — TODOS</Label>
          {routes.length === 0
            ? <Empty msg="Sin rutas registradas" />
            : routes.map((r, i) => (
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
              ))
          }
        </Card>
      </div>

      {/* Modal reset password */}
      {resetUser && (
        <ResetPasswordModal
          user={resetUser}
          onClose={() => setResetUser(null)}
          onSave={() => { setResetUser(null); setActionMsg('Contraseña reseteada correctamente'); setTimeout(() => setActionMsg(''), 3000); }}
        />
      )}
    </div>
  );
}