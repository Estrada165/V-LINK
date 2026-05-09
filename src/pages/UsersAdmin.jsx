import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';
import ThemeToggle from '../components/ui/ThemeToggle';
import { fmtDate } from '../utils/dateUtils';

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
const Spinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

function ResetPwdModal({ user, onClose, onDone }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (pwd.length < 8) { setErr('Mínimo 8 caracteres'); return; }
    setLoading(true);
    try { await adminService.resetPassword(user.id_usuario, pwd); onDone('Contraseña reseteada'); }
    catch (e) { setErr(e.error || 'Error'); setLoading(false); }
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
          <button onClick={handle} disabled={loading} style={{ flex: 2, padding: '10px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: '#fff', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {loading ? <><Spinner />GUARDANDO...</> : 'RESETEAR'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkModal({ count, action, onConfirm, onCancel, loading }) {
  const cfg = {
    activate:   { label: 'ACTIVAR',    color: 'var(--green)',  bg: 'var(--green-soft)',  border: 'var(--green-border)',  desc: 'podrán iniciar sesión inmediatamente.' },
    deactivate: { label: 'DESACTIVAR', color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)',  desc: 'perderán acceso al sistema.' },
    delete:     { label: 'ELIMINAR',   color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)', desc: 'serán eliminados permanentemente.' },
  }[action];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="mg-card" style={{ width: '100%', maxWidth: 360, padding: 28, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2">
            {action === 'activate' ? <polyline points="20 6 9 17 4 12"/>
              : action === 'deactivate' ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></>}
          </svg>
        </div>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 8 }}>{cfg.label} USUARIOS</h3>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
          {count} usuario{count !== 1 ? 's' : ''} seleccionado{count !== 1 ? 's' : ''}
        </p>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
          Los usuarios seleccionados {cfg.desc}
          {action === 'delete' && <><br/><span style={{ color: 'var(--accent)' }}>Esta acción no se puede deshacer.</span></>}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: 9, cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>CANCELAR</button>
          <button onClick={onConfirm} disabled={loading} style={{
            flex: 2, padding: '12px', borderRadius: 9, cursor: loading ? 'wait' : 'pointer',
            background: loading ? 'var(--bg-surface)' : cfg.bg,
            border: `1px solid ${loading ? 'var(--border)' : cfg.border}`,
            fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.08em',
            color: loading ? 'var(--text-muted)' : cfg.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s',
          }}>
            {loading ? <><Spinner />PROCESANDO...</> : `${cfg.label} ${count}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersAdmin() {
  const [users,       setUsers]       = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [resetUser,   setResetUser]   = useState(null);
  const [msg,         setMsg]         = useState('');
  const [msgType,     setMsgType]     = useState('success');
  const [searchInput, setSearchInput] = useState('');
  const [filter,      setFilter]      = useState('all');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [selected,    setSelected]    = useState(new Set());
  const [bulkModal,   setBulkModal]   = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // ── GUARD: garantiza que users siempre sea array ───────────
  const safeUsers = Array.isArray(users) ? users : [];

  const load = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const activoParam = params.filter === 'active'   ? 'true'
                        : params.filter === 'inactive' ? 'false'
                        : params.filter === 'pending'  ? 'false'
                        : '';
      const result = await adminService.getAllUsers({
        search: params.search   || '',
        activo: activoParam,
        desde:  params.dateFrom || '',
        hasta:  params.dateTo   || '',
        limit:  100,
      });
      // Normalizar siempre a array — compatible con versión vieja y nueva del backend
      const raw = Array.isArray(result) ? result : (Array.isArray(result?.users) ? result.users : []);
      const tot = Array.isArray(result) ? raw.length : (result?.total || raw.length);
      let filtered = raw;
      if (params.filter === 'pending') filtered = raw.filter(u => !u.activo && u.rol !== 'admin');
      if (params.filter === 'admin')   filtered = raw.filter(u => u.rol === 'admin');
      setUsers(filtered);
      setTotal(tot);
    } catch (e) { console.error(e); setUsers([]); setTotal(0); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      load({ search: searchInput, filter, dateFrom, dateTo });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, filter, dateFrom, dateTo, load]);

  const showMsg = (text, type = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 3500);
  };

  const toggleSelect = (id) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleSelectAll = () => {
    const ids = safeUsers.filter(u => u.rol !== 'admin').map(u => u.id_usuario);
    if (ids.every(id => selected.has(id))) setSelected(new Set());
    else setSelected(new Set(ids));
  };
  const clearSelection = () => setSelected(new Set());

  const selectableCount = safeUsers.filter(u => u.rol !== 'admin').length;
  const allSelected = selectableCount > 0 && safeUsers.filter(u => u.rol !== 'admin').every(u => selected.has(u.id_usuario));
  const pending = safeUsers.filter(u => !u.activo && u.rol !== 'admin');

  const toggle = async (user) => {
    try {
      await adminService.toggleActive(user.id_usuario, !user.activo);
      showMsg(`${user.nombre_completo} ${!user.activo ? 'activado' : 'desactivado'}`);
      load({ search: searchInput, filter, dateFrom, dateTo });
    } catch (e) { console.error(e); }
  };

  const remove = async (user) => {
    if (!window.confirm(`¿Eliminar a ${user.nombre_completo}?`)) return;
    try {
      await adminService.deleteUser(user.id_usuario);
      showMsg('Usuario eliminado', 'warning');
      load({ search: searchInput, filter, dateFrom, dateTo });
    } catch (e) { console.error(e); }
  };

  const handleBulkConfirm = async () => {
    setBulkLoading(true);
    const ids = [...selected];
    try {
      const result = await adminService.bulkAction(ids, bulkModal);
      showMsg(result.message, bulkModal === 'delete' ? 'warning' : 'success');
      clearSelection();
      load({ search: searchInput, filter, dateFrom, dateTo });
    } catch (e) { showMsg(e.error || 'Error en la operación', 'warning'); }
    setBulkLoading(false);
    setBulkModal(null);
  };

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>GESTIÓN DE USUARIOS</h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            {total} registrados · {safeUsers.filter(u => u.activo).length} activos · {pending.length} pendientes
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {msg && (
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: 9, padding: '6px 12px', borderRadius: 8,
              color: msgType === 'success' ? 'var(--green)' : 'var(--amber)',
              background: msgType === 'success' ? 'var(--green-soft)' : 'var(--amber-soft)',
              border: `1px solid ${msgType === 'success' ? 'var(--green-border)' : 'var(--amber-border)'}`,
            }}>{msg}</span>
          )}
          <ThemeToggle compact />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'TOTAL',      value: total,                                             color: 'var(--text-primary)' },
          { label: 'ACTIVOS',    value: safeUsers.filter(u => u.activo).length,            color: 'var(--green)' },
          { label: 'INACTIVOS',  value: safeUsers.filter(u => !u.activo).length,           color: 'var(--text-muted)' },
          { label: 'PENDIENTES', value: pending.length,                                    color: pending.length > 0 ? 'var(--amber)' : 'var(--text-muted)' },
          { label: 'ADMINS',     value: safeUsers.filter(u => u.rol === 'admin').length,   color: 'var(--accent)' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '12px 14px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{s.label}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 300, color: s.color }}>{s.value}</span>
          </Card>
        ))}
      </div>

      {/* Pending banner */}
      {pending.length > 0 && (
        <Card style={{ marginBottom: 14, background: 'var(--amber-soft)', border: '1px solid var(--amber-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="anim-blink" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 6px var(--amber)', flexShrink: 0 }} />
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
              style={{ padding: '8px 16px', background: 'var(--green)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: '#fff', letterSpacing: '0.1em' }}>
              ACTIVAR TODOS ({pending.length}) →
            </button>
          </div>
        </Card>
      )}

      {/* Search + Filters */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px', minWidth: 180 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>BUSCAR EN BASE DE DATOS</p>
            <div style={{ position: 'relative' }}>
              {loading
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', pointerEvents: 'none' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              }
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Nombre, correo o teléfono..."
                style={{ width: '100%', padding: '9px 12px 9px 32px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 13, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>
          <div style={{ flex: '1 1 130px', minWidth: 120 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>DESDE</p>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ width: '100%', padding: '9px 10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 12, outline: 'none', cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div style={{ flex: '1 1 130px', minWidth: 120 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>HASTA</p>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ width: '100%', padding: '9px 10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 12, outline: 'none', cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>
          {(searchInput || dateFrom || dateTo) && (
            <button onClick={() => { setSearchInput(''); setDateFrom(''); setDateTo(''); }}
              style={{ padding: '9px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', alignSelf: 'flex-end' }}>
              LIMPIAR
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {[['all','TODOS'],['pending','PENDIENTES'],['active','ACTIVOS'],['inactive','INACTIVOS'],['admin','ADMINS']].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '5px 12px', borderRadius: 7, cursor: 'pointer',
              background: filter === key ? 'var(--accent-soft)' : 'var(--bg-surface)',
              border: `1px solid ${filter === key ? 'var(--accent-border)' : 'var(--border)'}`,
              fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.08em',
              color: filter === key ? 'var(--accent)' : 'var(--text-muted)', transition: 'all .18s',
            }}>{label}</button>
          ))}
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginLeft: 'auto' }}>
            {loading ? 'Buscando...' : `${safeUsers.length} resultado${safeUsers.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </Card>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', marginBottom: 12, background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)', flex: 1 }}>
            {selected.size} usuario{selected.size !== 1 ? 's' : ''} seleccionado{selected.size !== 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setBulkModal('activate')}   style={{ padding: '7px 14px', background: 'var(--green-soft)',  border: '1px solid var(--green-border)',  borderRadius: 7, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--green)',  letterSpacing: '0.08em' }}>ACTIVAR SELECCIÓN</button>
            <button onClick={() => setBulkModal('deactivate')} style={{ padding: '7px 14px', background: 'var(--amber-soft)',  border: '1px solid var(--amber-border)',  borderRadius: 7, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--amber)',  letterSpacing: '0.08em' }}>DESACTIVAR</button>
            <button onClick={() => setBulkModal('delete')}     style={{ padding: '7px 14px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 7, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.08em' }}>ELIMINAR</button>
            <button onClick={clearSelection} style={{ padding: '7px 10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>✕</button>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <Label>LISTA DE USUARIOS</Label>
        {loading && safeUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto 8px' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>BUSCANDO EN BD...</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '8px 12px', width: 36 }}>
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                      style={{ cursor: 'pointer', width: 15, height: 15, accentColor: 'var(--accent)' }} />
                  </th>
                  {['USUARIO','CORREO','TELÉFONO','ROL','ESTADO','REGISTRO','ACCIONES'].map(h => (
                    <th key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '8px 10px', textAlign: 'left', fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {safeUsers.map((u, i) => (
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
                    <td style={{ padding: '10px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: u.rol === 'admin' ? 'var(--accent-soft)' : 'var(--bg-surface)', border: `1px solid ${u.rol === 'admin' ? 'var(--accent-border)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: u.rol === 'admin' ? 'var(--accent)' : 'var(--text-muted)' }}>{u.nombre_completo?.[0]}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{u.nombre_completo}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 10px' }}><span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{u.correo_electronico}</span></td>
                    <td style={{ padding: '10px 10px' }}><span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{u.telefono || '—'}</span></td>
                    <td style={{ padding: '10px 10px' }}>
                      <Badge text={u.rol.toUpperCase()} color={u.rol === 'admin' ? 'var(--accent)' : 'var(--cyan)'} bg={u.rol === 'admin' ? 'var(--accent-soft)' : 'var(--cyan-soft)'} border={u.rol === 'admin' ? 'var(--accent-border)' : 'var(--cyan-border)'} />
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Dot active={u.activo} />
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: u.activo ? 'var(--green)' : 'var(--text-muted)' }}>
                          {u.activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(u.fecha_registro)}</span>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      {u.rol !== 'admin' ? (
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <button onClick={() => toggle(u)} style={{ padding: '4px 9px', borderRadius: 5, cursor: 'pointer', border: 'none', fontFamily: 'JetBrains Mono', fontSize: 7, letterSpacing: '0.06em', background: u.activo ? 'var(--amber-soft)' : 'var(--green-soft)', color: u.activo ? 'var(--amber)' : 'var(--green)' }}>
                            {u.activo ? 'DESACTIVAR' : 'ACTIVAR'}
                          </button>
                          <button onClick={() => setResetUser(u)} style={{ padding: '4px 9px', borderRadius: 5, cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>RESET PWD</button>
                          <button onClick={() => remove(u)} style={{ padding: '4px 9px', borderRadius: 5, cursor: 'pointer', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--accent)', letterSpacing: '0.06em' }}>ELIMINAR</button>
                        </div>
                      ) : (
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-faint)' }}>Protegido</span>
                      )}
                    </td>
                  </tr>
                ))}
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

      {resetUser && <ResetPwdModal user={resetUser} onClose={() => setResetUser(null)} onDone={(m) => { setResetUser(null); showMsg(m); }} />}
      {bulkModal  && <BulkModal count={selected.size} action={bulkModal} onConfirm={handleBulkConfirm} onCancel={() => setBulkModal(null)} loading={bulkLoading} />}
    </div>
  );
}