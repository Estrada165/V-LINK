import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import ThemeToggle from '../components/ui/ThemeToggle';

const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '16px 18px', ...style }}>{children}</div>
);
const Label = ({ children }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)', marginBottom: 12 }}>{children}</p>
);
const Dot = ({ active }) => (
  <div style={{ width: 7, height: 7, borderRadius: '50%', background: active ? 'var(--green)' : 'var(--text-muted)', boxShadow: active ? '0 0 5px var(--green)' : 'none', flexShrink: 0 }} />
);
const Badge = ({ text, color, bg, border }) => (
  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.1em', color, background: bg, border: `1px solid ${border}`, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>{text}</span>
);

function ResetPwdModal({ user, onClose, onDone }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (pwd.length < 8) { setErr('Mínimo 8 caracteres'); return; }
    setLoading(true);
    try {
      await adminService.resetPassword(user.id_usuario, pwd);
      onDone('Contraseña reseteada correctamente');
    } catch (e) { setErr(e.error || 'Error'); setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="mg-card" style={{ width: '100%', maxWidth: 360, padding: 24 }}>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '0.1em' }}>RESETEAR CONTRASEÑA</h3>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginBottom: 16 }}>{user.nombre_completo}</p>
        {err && <div style={{ padding: '8px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, marginBottom: 12 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)' }}>{err}</span>
        </div>}
        <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Nueva contraseña (mín. 8 chars)"
          style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 13, outline: 'none', marginBottom: 14 }}
          onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
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

export default function UsersAdmin() {
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [resetUser, setResetUser] = useState(null);
  const [msg,       setMsg]       = useState('');
  const [filter,    setFilter]    = useState('all'); // all | pending | active | inactive

  const load = async () => {
    setLoading(true);
    try { setUsers(await adminService.getAllUsers()); }
    catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const toggle = async (user) => {
    try {
      await adminService.toggleActive(user.id_usuario, !user.activo);
      showMsg(`${user.nombre_completo} ${!user.activo ? 'activado' : 'desactivado'}`);
      await load();
    } catch (e) { console.error(e); }
  };

  const remove = async (user) => {
    if (!window.confirm(`¿Eliminar a ${user.nombre_completo}? Esta acción no se puede deshacer.`)) return;
    try { await adminService.deleteUser(user.id_usuario); showMsg('Usuario eliminado'); await load(); }
    catch (e) { console.error(e); }
  };

  const pending  = users.filter(u => !u.activo && u.rol !== 'admin');
  const filtered = filter === 'all'      ? users
                 : filter === 'pending'  ? users.filter(u => !u.activo && u.rol !== 'admin')
                 : filter === 'active'   ? users.filter(u => u.activo)
                 :                         users.filter(u => !u.activo);

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>GESTIÓN DE USUARIOS</h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            {users.length} registrados · {users.filter(u => u.activo).length} activos · {pending.length} pendientes
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {msg && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--green)', background: 'var(--green-soft)', border: '1px solid var(--green-border)', padding: '6px 12px', borderRadius: 8 }}>{msg}</span>}
          <ThemeToggle compact />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'TOTAL',     value: users.length,                              color: 'var(--text-primary)' },
          { label: 'ACTIVOS',   value: users.filter(u => u.activo).length,        color: 'var(--green)' },
          { label: 'INACTIVOS', value: users.filter(u => !u.activo).length,       color: 'var(--text-muted)' },
          { label: 'PENDIENTES',value: pending.length,                            color: pending.length > 0 ? 'var(--amber)' : 'var(--text-muted)' },
          { label: 'ADMINS',    value: users.filter(u => u.rol === 'admin').length,color: 'var(--accent)' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '12px 16px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{s.label}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 300, color: s.color }}>{s.value}</span>
          </Card>
        ))}
      </div>

      {/* Cuentas pendientes — sección destacada */}
      {pending.length > 0 && (
        <Card style={{ marginBottom: 16, background: 'var(--amber-soft)', border: '1px solid var(--amber-border)' }}>
          <Label>CUENTAS PENDIENTES DE ACTIVACIÓN</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map(u => (
              <div key={u.id_usuario} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--amber-border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--amber)' }}>{u.nombre_completo[0]}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{u.nombre_completo}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    {u.correo_electronico} · {u.telefono || 'Sin teléfono'}
                  </p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-faint)', marginTop: 1 }}>
                    Registrado: {u.fecha_registro ? new Date(u.fecha_registro).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => toggle(u)} style={{ padding: '9px 20px', background: 'var(--green)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: '#fff', letterSpacing: '0.1em', boxShadow: '0 0 12px rgba(32,196,90,0.3)' }}>
                    ACTIVAR
                  </button>
                  <button onClick={() => remove(u)} style={{ padding: '9px 14px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.1em' }}>
                    RECHAZAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['all','TODOS'],['pending','PENDIENTES'],['active','ACTIVOS'],['inactive','INACTIVOS']].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
            background: filter === key ? 'var(--accent-soft)' : 'var(--bg-card)',
            border: `1px solid ${filter === key ? 'var(--accent-border)' : 'var(--border)'}`,
            fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em',
            color: filter === key ? 'var(--accent)' : 'var(--text-muted)', transition: 'all .2s',
          }}>{label}</button>
        ))}
      </div>

      {/* Tabla de usuarios */}
      <Card>
        <Label>LISTA DE USUARIOS</Label>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto 8px' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>CARGANDO...</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['USUARIO','CORREO','TELÉFONO','ROL','ESTADO','REGISTRO','ACCIONES'].map(h => (
                    <th key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '8px 12px', textAlign: 'left', fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id_usuario} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: u.rol === 'admin' ? 'var(--accent-soft)' : 'var(--bg-surface)', border: `1px solid ${u.rol === 'admin' ? 'var(--accent-border)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: u.rol === 'admin' ? 'var(--accent)' : 'var(--text-muted)' }}>{u.nombre_completo[0]}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{u.nombre_completo}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px' }}><span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>{u.correo_electronico}</span></td>
                    <td style={{ padding: '12px 12px' }}><span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>{u.telefono || '—'}</span></td>
                    <td style={{ padding: '12px 12px' }}>
                      <Badge text={u.rol.toUpperCase()} color={u.rol === 'admin' ? 'var(--accent)' : 'var(--cyan)'} bg={u.rol === 'admin' ? 'var(--accent-soft)' : 'var(--cyan-soft)'} border={u.rol === 'admin' ? 'var(--accent-border)' : 'var(--cyan-border)'} />
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Dot active={u.activo} />
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: u.activo ? 'var(--green)' : 'var(--text-muted)' }}>
                          {u.activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString('es-PE') : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      {u.rol !== 'admin' ? (
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <button onClick={() => toggle(u)} style={{ padding: '5px 10px', borderRadius: 6, cursor: 'pointer', border: 'none', fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.08em', background: u.activo ? 'var(--amber-soft)' : 'var(--green-soft)', color: u.activo ? 'var(--amber)' : 'var(--green)' }}>
                            {u.activo ? 'DESACTIVAR' : 'ACTIVAR'}
                          </button>
                          <button onClick={() => setResetUser(u)} style={{ padding: '5px 10px', borderRadius: 6, cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                            RESET PWD
                          </button>
                          <button onClick={() => remove(u)} style={{ padding: '5px 10px', borderRadius: 6, cursor: 'pointer', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--accent)', letterSpacing: '0.08em' }}>
                            ELIMINAR
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>Cuenta protegida</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '30px 0' }}>
                Sin usuarios en este filtro
              </p>
            )}
          </div>
        )}
      </Card>

      {resetUser && (
        <ResetPwdModal
          user={resetUser}
          onClose={() => setResetUser(null)}
          onDone={(m) => { setResetUser(null); showMsg(m); }}
        />
      )}
    </div>
  );
}