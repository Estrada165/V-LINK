import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { adminService } from '../../services/api';
import api from '../../services/api';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { fmtDate } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';

const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '16px 18px', ...style }}>{children}</div>
);
const Dot = ({ active }) => (
  <div style={{ width: 7, height: 7, borderRadius: '50%', background: active ? 'var(--green)' : 'var(--text-muted)', boxShadow: active ? '0 0 5px var(--green)' : 'none', flexShrink: 0 }} />
);
const Spinner = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', flexShrink: 0 }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
const PinIcon = ({ size = 10, color = 'var(--amber)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const ROL_COLORS = {
  admin:      { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  supervisor: { color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
  tecnico:    { color: 'var(--cyan)',   bg: 'var(--cyan-soft)',   border: 'var(--cyan-border)'   },
  usuario:    { color: 'var(--green)',  bg: 'var(--green-soft)',  border: 'var(--green-border)'  },
};

const Portal = ({ children }) => createPortal(
  <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}>
    {children}
  </div>,
  document.body
);

const inputSt = {
  width: '100%', padding: '10px 12px', background: 'var(--bg-input)',
  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)',
  fontFamily: 'DM Sans', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

function ResetPwdModal({ user, onClose, onDone }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (pwd.length < 8) return setErr('Mínimo 8 caracteres');
    setLoading(true);
    try { await adminService.resetPassword(user.id_usuario, pwd); onDone('Contraseña actualizada'); }
    catch (e) { setErr(e.error || 'Error'); setLoading(false); }
  };
  return (
    <Portal>
      <div style={{ width: '100%', maxWidth: 360, background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '0.1em' }}>RESETEAR CONTRASEÑA</h3>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginBottom: 16 }}>{user.nombre_completo}</p>
        {err && <div style={{ padding: '8px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, marginBottom: 12 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)' }}>{err}</span>
        </div>}
        <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Nueva contraseña"
          style={{ ...inputSt, marginBottom: 14 }}
          onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>CANCELAR</button>
          <button onClick={handle} disabled={loading} style={{ flex: 2, padding: '10px', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {loading ? <><Spinner/>GUARDANDO...</> : 'ACTUALIZAR →'}
          </button>
        </div>
      </div>
    </Portal>
  );
}

function AreaModal({ user, onClose, onDone }) {
  const [area, setArea] = useState(user.area || '');
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { await api.patch(`/admin/users/${user.id_usuario}/area`, { area }); onDone('Área actualizada'); }
    catch { setLoading(false); }
  };
  return (
    <Portal>
      <div style={{ width: '100%', maxWidth: 360, background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--amber)', marginBottom: 4, letterSpacing: '0.1em' }}>ÁREA ASIGNADA</h3>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginBottom: 16 }}>{user.nombre_completo}</p>
        <input value={area} onChange={e => setArea(e.target.value)} placeholder="Ej: Piura Norte, Zona Centro..."
          style={{ ...inputSt, marginBottom: 14 }}
          onFocus={e => e.target.style.borderColor = 'var(--amber-border)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>CANCELAR</button>
          <button onClick={handle} disabled={loading} style={{ flex: 2, padding: '10px', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {loading ? <><Spinner/>GUARDANDO...</> : 'GUARDAR →'}
          </button>
        </div>
      </div>
    </Portal>
  );
}

function BulkModal({ count, action, onConfirm, onCancel, loading }) {
  const cfg = {
    activate:   { label: 'Activar', color: 'var(--green)',  bg: 'var(--green-soft)',  border: 'var(--green-border)'  },
    deactivate: { label: 'Desactivar', color: 'var(--amber)', bg: 'var(--amber-soft)', border: 'var(--amber-border)' },
    delete:     { label: 'Eliminar', color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  }[action];
  return (
    <Portal>
      <div style={{ width: '100%', maxWidth: 340, background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: cfg.color, letterSpacing: '0.1em', marginBottom: 8 }}>
          {cfg.label.toUpperCase()} {count} USUARIOS
        </h3>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Esta acción {action === 'delete' ? 'no se puede deshacer y eliminará' : 'afectará'} a {count} usuario{count !== 1 ? 's' : ''} seleccionado{count !== 1 ? 's' : ''}.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>CANCELAR</button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 2, padding: '10px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {loading ? <><Spinner/>PROCESANDO...</> : `CONFIRMAR →`}
          </button>
        </div>
      </div>
    </Portal>
  );
}

function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm]     = useState({ nombre_completo: '', correo_electronico: '', telefono: '', password: '', rol: 'tecnico', area: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const rc = ROL_COLORS[form.rol];

  const handleCreate = async () => {
    if (!form.nombre_completo || !form.correo_electronico || !form.password)
      return setErr('Nombre, correo y contraseña son obligatorios');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.correo_electronico.trim()))
      return setErr('Formato de correo inválido');
    if (form.password.length < 8) return setErr('Contraseña mínimo 8 caracteres');
    setLoading(true);
    try {
      await api.post('/admin/users/create', { ...form, area: form.rol === 'supervisor' ? form.area : null });
      onCreated();
    } catch (e) { setErr(e.error || e.message || 'Error al crear usuario'); setLoading(false); }
  };

  return (
    <Portal>
      <div style={{ width: '100%', maxWidth: 440, maxHeight: '90vh', background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 14, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <div style={{ padding: '20px 22px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text-primary)', letterSpacing: '0.1em' }}>CREAR MIEMBRO</h3>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: rc.color, background: rc.bg, border: `1px solid ${rc.border}`, padding: '2px 8px', borderRadius: 4, transition: 'all .2s' }}>
                {form.rol.toUpperCase()}
              </span>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginBottom: 14 }}>
            Usuarios normales se registran solos — aquí solo técnicos y supervisores
          </p>
          {err && <div style={{ padding: '8px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, marginBottom: 12 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)' }}>{err}</span>
          </div>}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.1em' }}>ROL</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { key: 'tecnico', label: 'Técnico', desc: 'Gestión de dispositivos IoT',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                { key: 'supervisor', label: 'Supervisor', desc: 'Gestión de alertas por área',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
              ].map(r => {
                const rrc = ROL_COLORS[r.key];
                const active = form.rol === r.key;
                return (
                  <button key={r.key} onClick={() => set('rol', r.key)} style={{ padding: '12px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all .2s', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6, background: active ? rrc.bg : 'var(--bg-surface)', border: `1.5px solid ${active ? rrc.border : 'var(--border)'}` }}>
                    <span style={{ color: active ? rrc.color : 'var(--text-muted)' }}>{r.icon}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: active ? rrc.color : 'var(--text-secondary)', letterSpacing: '0.06em', fontWeight: active ? 600 : 400 }}>{r.label.toUpperCase()}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>NOMBRE COMPLETO</p>
            <input value={form.nombre_completo} onChange={e => set('nombre_completo', e.target.value.replace(/[0-9!@#$%^&*()_+=[\]{};':"\\|,.<>/?]/g, ''))} placeholder="Nombre completo" style={inputSt}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>CORREO</p>
              <input type="email" value={form.correo_electronico} onChange={e => set('correo_electronico', e.target.value.replace(/\s/g, ''))} placeholder="correo@ejemplo.com" style={inputSt}
                onFocus={e => e.target.style.borderColor = 'var(--accent-border)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>TELÉFONO</p>
              <input value={form.telefono} onChange={e => set('telefono', e.target.value.replace(/\D/g, '').slice(0, 9))} placeholder="9XXXXXXXX" style={inputSt}
                onFocus={e => e.target.style.borderColor = 'var(--accent-border)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>

          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>CONTRASEÑA INICIAL</p>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mínimo 8 caracteres" style={inputSt}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          {form.rol === 'supervisor' && (
            <div style={{ padding: '12px 14px', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <PinIcon size={12} color="var(--amber)" />
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--amber)', letterSpacing: '0.1em' }}>ÁREA ASIGNADA</p>
              </div>
              <input value={form.area} onChange={e => set('area', e.target.value)} placeholder="Ej: Piura Norte, Zona Centro..."
                style={{ ...inputSt, background: 'var(--bg-input)' }}
                onFocus={e => e.target.style.borderColor = 'var(--amber-border)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginTop: 6 }}>
                El supervisor solo verá alertas de usuarios en esta área
              </p>
            </div>
          )}
          <div style={{ height: 4 }} />
        </div>

        <div style={{ padding: '14px 22px 20px', flexShrink: 0, display: 'flex', gap: 10, borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} disabled={loading} style={{ flex: 1, padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>CANCELAR</button>
          <button onClick={handleCreate} disabled={loading} style={{ flex: 2, padding: '12px', background: loading ? 'var(--bg-surface)' : rc.bg, border: `1px solid ${loading ? 'var(--border)' : rc.border}`, borderRadius: 9, cursor: loading ? 'wait' : 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: loading ? 'var(--text-muted)' : rc.color, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s' }}>
            {loading ? <><Spinner/>CREANDO...</> : `CREAR ${form.rol.toUpperCase()} →`}
          </button>
        </div>
      </div>
    </Portal>
  );
}

export default function UsersAdmin() {
  const { currentUser } = useAuth();
  const [users,       setUsers]       = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [filter,      setFilter]      = useState('all');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [selected,    setSelected]    = useState(new Set());
  const [msg,         setMsg]         = useState('');
  const [msgType,     setMsgType]     = useState('success');
  const [resetUser,   setResetUser]   = useState(null);
  const [areaUser,    setAreaUser]    = useState(null);
  const [bulkModal,   setBulkModal]   = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showCreate,  setShowCreate]  = useState(false);

  const load = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers(params);
      const list = Array.isArray(data) ? data : (Array.isArray(data?.users) ? data.users : []);
      setUsers(list);
      setTotal(list.length);
    } catch { setUsers([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load({ search: searchInput, filter, dateFrom, dateTo }), 350);
    return () => clearTimeout(t);
  }, [searchInput, filter, dateFrom, dateTo, load]);

  const safeUsers = Array.isArray(users) ? users : [];
  const showMsg = (text, type = 'success') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 3500); };
  const toggleSelect = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => {
    const ids = safeUsers.filter(u => u.rol !== 'admin').map(u => u.id_usuario);
    setSelected(ids.every(id => selected.has(id)) ? new Set() : new Set(ids));
  };
  const allSelected = safeUsers.filter(u => u.rol !== 'admin').length > 0 && safeUsers.filter(u => u.rol !== 'admin').every(u => selected.has(u.id_usuario));
  const pending = safeUsers.filter(u => !u.activo && u.rol !== 'admin');

  const toggle = async (user) => {
    try { await adminService.toggleActive(user.id_usuario, !user.activo); showMsg(`${user.nombre_completo} ${!user.activo ? 'activado' : 'desactivado'}`); load({ search: searchInput, filter, dateFrom, dateTo }); }
    catch {}
  };
  const remove = async (user) => {
    if (!window.confirm(`¿Eliminar a ${user.nombre_completo}?`)) return;
    try { await adminService.deleteUser(user.id_usuario); showMsg('Usuario eliminado', 'warning'); load({ search: searchInput, filter, dateFrom, dateTo }); }
    catch {}
  };
  const handleBulkConfirm = async () => {
    setBulkLoading(true);
    try { const r = await adminService.bulkAction([...selected], bulkModal); showMsg(r.message, bulkModal === 'delete' ? 'warning' : 'success'); setSelected(new Set()); load({ search: searchInput, filter, dateFrom, dateTo }); }
    catch (e) { showMsg(e.error || 'Error', 'warning'); }
    setBulkLoading(false); setBulkModal(null);
  };

  const iSt = { width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '20px 16px 40px' }} className="anim-fade">

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>GESTIÓN DE USUARIOS</h1>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
            {total} registrados · {safeUsers.filter(u => u.activo).length} activos · {pending.length} pendientes
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {msg && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, padding: '6px 12px', borderRadius: 8, color: msgType === 'success' ? 'var(--green)' : 'var(--amber)', background: msgType === 'success' ? 'var(--green-soft)' : 'var(--amber-soft)', border: `1px solid ${msgType === 'success' ? 'var(--green-border)' : 'var(--amber-border)'}` }}>{msg}</span>}
          <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: '#fff', boxShadow: '0 0 12px rgba(224,48,48,0.25)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            CREAR MIEMBRO
          </button>
          <ThemeToggle compact />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'TOTAL',        value: total,                                               color: 'var(--text-primary)' },
          { label: 'ACTIVOS',      value: safeUsers.filter(u => u.activo).length,              color: 'var(--green)'        },
          { label: 'PENDIENTES',   value: pending.length,                                      color: pending.length > 0 ? 'var(--amber)' : 'var(--text-muted)' },
          { label: 'SUPERVISORES', value: safeUsers.filter(u => u.rol === 'supervisor').length, color: 'var(--amber)'       },
          { label: 'TÉCNICOS',     value: safeUsers.filter(u => u.rol === 'tecnico').length,    color: 'var(--cyan)'        },
        ].map(s => (
          <Card key={s.label} style={{ padding: '12px 14px' }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 300, color: s.color, lineHeight: 1 }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {pending.length > 0 && (
        <Card style={{ marginBottom: 14, background: 'var(--amber-soft)', border: '1px solid var(--amber-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="anim-blink" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 6px var(--amber)', flexShrink: 0 }}/>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {pending.length} cuenta{pending.length !== 1 ? 's' : ''} pendiente{pending.length !== 1 ? 's' : ''} de activación
                </p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                  {pending.slice(0, 3).map(u => u.nombre_completo).join(', ')}{pending.length > 3 ? ` y ${pending.length - 3} más` : ''}
                </p>
              </div>
            </div>
            <button onClick={() => { setSelected(new Set(pending.map(u => u.id_usuario))); setBulkModal('activate'); }}
              style={{ padding: '8px 16px', background: 'var(--green)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: '#fff' }}>
              ACTIVAR TODOS ({pending.length}) →
            </button>
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, alignItems: 'end' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>BUSCAR EN BASE DE DATOS</p>
            <div style={{ position: 'relative' }}>
              {loading
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', animation: 'spin-cw 1s linear infinite', pointerEvents: 'none' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              }
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Nombre, correo o teléfono..."
                style={{ ...iSt, paddingLeft: 32 }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>DESDE</p>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={iSt}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>HASTA</p>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={iSt}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          {(searchInput || dateFrom || dateTo) && (
            <button onClick={() => { setSearchInput(''); setDateFrom(''); setDateTo(''); }}
              style={{ padding: '9px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)' }}>
              LIMPIAR
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {[['all','TODOS'],['pending','PENDIENTES'],['active','ACTIVOS'],['inactive','INACTIVOS']].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} style={{ padding: '5px 12px', borderRadius: 7, cursor: 'pointer', background: filter === key ? 'var(--accent-soft)' : 'var(--bg-surface)', border: `1px solid ${filter === key ? 'var(--accent-border)' : 'var(--border)'}`, fontFamily: 'JetBrains Mono', fontSize: 8, color: filter === key ? 'var(--accent)' : 'var(--text-muted)', transition: 'all .18s' }}>
              {label}
            </button>
          ))}
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginLeft: 'auto' }}>
            {loading ? 'Buscando...' : `${safeUsers.length} resultado${safeUsers.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </Card>

      {selected.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', marginBottom: 12, background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)', flex: 1 }}>
            {selected.size} usuario{selected.size !== 1 ? 's' : ''} seleccionado{selected.size !== 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setBulkModal('activate')}   style={{ padding: '7px 14px', background: 'var(--green-soft)',  border: '1px solid var(--green-border)',  borderRadius: 7, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--green)'  }}>ACTIVAR</button>
            <button onClick={() => setBulkModal('deactivate')} style={{ padding: '7px 14px', background: 'var(--amber-soft)',  border: '1px solid var(--amber-border)',  borderRadius: 7, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--amber)'  }}>DESACTIVAR</button>
            <button onClick={() => setBulkModal('delete')}     style={{ padding: '7px 14px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 7, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)' }}>ELIMINAR</button>
            <button onClick={() => setSelected(new Set())} style={{ padding: '7px 10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>✕</button>
          </div>
        </div>
      )}

      <Card>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)', marginBottom: 12 }}>LISTA DE USUARIOS</p>
        {loading && safeUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
              style={{ animation: 'spin-cw 1s linear infinite', display: 'block', margin: '0 auto 8px' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>BUSCANDO EN BD...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '8px 12px', width: 36 }}>
                    <input type="checkbox" checked={allSelected} onChange={toggleAll}
                      style={{ cursor: 'pointer', width: 15, height: 15, accentColor: 'var(--accent)' }} />
                  </th>
                  {['USUARIO','CORREO','TELÉFONO','ROL','ESTADO','REGISTRO','ACCIONES'].map(h => (
                    <th key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '8px 10px', textAlign: 'left', fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {safeUsers.map((u, i) => {
                  const rc = ROL_COLORS[u.rol] || ROL_COLORS.usuario;
                  return (
                    <tr key={u.id_usuario}
                      style={{ borderBottom: i < safeUsers.length - 1 ? '1px solid var(--border)' : 'none', background: selected.has(u.id_usuario) ? 'var(--accent-soft)' : 'transparent', transition: 'background .15s' }}
                      onMouseEnter={e => { if (!selected.has(u.id_usuario)) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { if (!selected.has(u.id_usuario)) e.currentTarget.style.background = 'transparent'; }}>
                      <td style={{ padding: '10px 12px' }}>
                        {u.rol !== 'admin' && (
                          <input type="checkbox" checked={selected.has(u.id_usuario)} onChange={() => toggleSelect(u.id_usuario)}
                            style={{ cursor: 'pointer', width: 15, height: 15, accentColor: 'var(--accent)' }} />
                        )}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: rc.bg, border: `1px solid ${rc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: rc.color }}>{u.nombre_completo?.[0]}</span>
                          </div>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{u.nombre_completo}</p>
                            {u.area && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <PinIcon size={9} color="var(--amber)" />
                                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--amber)' }}>{u.area}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px' }}><span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{u.correo_electronico}</span></td>
                      <td style={{ padding: '10px' }}><span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{u.telefono || '—'}</span></td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: rc.color, background: rc.bg, border: `1px solid ${rc.border}`, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                          {u.rol.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Dot active={u.activo} />
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: u.activo ? 'var(--green)' : 'var(--text-muted)' }}>{u.activo ? 'ACTIVO' : 'INACTIVO'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(u.fecha_registro)}</span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        {u.rol === 'admin' ? (
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-faint)' }}>Protegido</span>
                        ) : u.id_usuario === currentUser?.id_usuario ? (
                          <button onClick={() => setResetUser(u)} title="Cambiar contraseña"
                            style={{ padding: '5px 10px', borderRadius: 6, cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>
                            CLAVE
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'nowrap' }}>
                            <button onClick={() => toggle(u)} title={u.activo ? 'Desactivar' : 'Activar'}
                              style={{ padding: '5px 8px', borderRadius: 6, cursor: 'pointer', border: 'none', background: u.activo ? 'var(--amber-soft)' : 'var(--green-soft)', color: u.activo ? 'var(--amber)' : 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {u.activo
                                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                              }
                            </button>
                            {u.rol === 'supervisor' && (
                              <button onClick={() => setAreaUser(u)} title="Editar área"
                                style={{ padding: '5px 8px', borderRadius: 6, cursor: 'pointer', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                              </button>
                            )}
                            <button onClick={() => setResetUser(u)} title="Cambiar contraseña"
                              style={{ padding: '5px 8px', borderRadius: 6, cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </button>
                            <button onClick={() => remove(u)} title="Eliminar"
                              style={{ padding: '5px 8px', borderRadius: 6, cursor: 'pointer', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {safeUsers.length === 0 && !loading && (
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '30px 0' }}>
                {searchInput || dateFrom || dateTo ? 'Sin resultados para esta búsqueda' : 'Sin usuarios'}
              </p>
            )}
          </div>
        )}
      </Card>

      {resetUser  && <ResetPwdModal user={resetUser} onClose={() => setResetUser(null)} onDone={(m) => { setResetUser(null); showMsg(m); }} />}
      {areaUser   && <AreaModal user={areaUser} onClose={() => setAreaUser(null)} onDone={(m) => { setAreaUser(null); showMsg(m); load({ search: searchInput, filter, dateFrom, dateTo }); }} />}
      {bulkModal  && <BulkModal count={selected.size} action={bulkModal} onConfirm={handleBulkConfirm} onCancel={() => setBulkModal(null)} loading={bulkLoading} />}
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); showMsg('Miembro creado correctamente'); load({ search: searchInput, filter, dateFrom, dateTo }); }} />}
    </div>
  );
}