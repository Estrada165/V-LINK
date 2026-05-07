import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vehicleService, contactService } from '../services/api';
import ThemeToggle from '../components/ui/ThemeToggle';

/* ─── atoms ───────────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '18px 20px', ...style }}>{children}</div>
);
const Label = ({ children }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 12 }}>
    {children}
  </p>
);
const Divider = () => <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />;

const Field = ({ label, value, onChange, type = 'text', placeholder = '', readOnly = false }) => (
  <div style={{ marginBottom: 14 }}>
    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>
      {label}
    </p>
    <input
      type={type} value={value || ''} onChange={e => onChange && onChange(e.target.value)}
      placeholder={placeholder} readOnly={readOnly}
      style={{
        width: '100%', padding: '10px 12px',
        background: readOnly ? 'var(--bg-surface)' : 'var(--bg-input)',
        border: '1px solid var(--border)', borderRadius: 8,
        color: readOnly ? 'var(--text-muted)' : 'var(--text-primary)',
        fontFamily: 'DM Sans', fontSize: 13, outline: 'none', transition: 'border .2s',
        cursor: readOnly ? 'not-allowed' : 'auto',
      }}
      onFocus={e => !readOnly && (e.target.style.borderColor = 'var(--accent-border)')}
      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 14 }}>
    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</p>
    <select value={value || ''} onChange={e => onChange(e.target.value)} style={{
      width: '100%', padding: '10px 12px', background: 'var(--bg-input)',
      border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)',
      fontFamily: 'DM Sans', fontSize: 13, outline: 'none', cursor: 'pointer',
    }}>
      <option value="">Seleccionar...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const SaveBtn = ({ onSave, saved, loading, label = 'GUARDAR CAMBIOS' }) => (
  <button onClick={onSave} disabled={loading} style={{
    width: '100%', padding: '12px', borderRadius: 10, cursor: loading ? 'wait' : 'pointer',
    background: saved ? 'var(--green-soft)' : loading ? 'var(--bg-surface)' : 'var(--accent)',
    border: `1px solid ${saved ? 'var(--green-border)' : loading ? 'var(--border)' : '#ff5040'}`,
    fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em',
    color: saved ? 'var(--green)' : loading ? 'var(--text-muted)' : '#fff',
    transition: 'all .3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  }}>
    {saved ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>GUARDADO</> : label}
  </button>
);

const ErrBox = ({ msg }) => msg ? (
  <div style={{ padding: '8px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, marginBottom: 12 }}>
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)' }}>{msg}</span>
  </div>
) : null;

/* ─── Profile page ────────────────────────────────────────── */
export default function Profile() {
  const { currentUser, updateProfile, logout } = useAuth();

  // Profile state
  const [profile, setProfile] = useState({ nombre_completo: '', telefono: '', direccion: '' });
  const [savedProfile, setSavedProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [errProfile, setErrProfile] = useState('');

  // Password state
  const [pwd, setPwd] = useState({ current: '', new: '', confirm: '' });
  const [savedPwd, setSavedPwd] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [errPwd, setErrPwd] = useState('');

  // Vehicle state
  const [vehicles, setVehicles] = useState([]);
  const [newVehicle, setNewVehicle] = useState({ marca: '', modelo: '', placa: '', cilindraje: '', anio: '', color: '' });
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loadingVeh, setLoadingVeh] = useState(false);
  const [errVeh, setErrVeh] = useState('');
  const [savedVeh, setSavedVeh] = useState(false);

  // Contacts state
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ nombre: '', telefono: '' });
  const [savedContact, setSavedContact] = useState(false);
  const [errContact, setErrContact] = useState('');

  useEffect(() => {
    if (currentUser) {
      setProfile({
        nombre_completo: currentUser.nombre_completo || '',
        telefono: currentUser.telefono || '',
        direccion: currentUser.direccion || '',
      });
    }
    loadVehicles();
    loadContacts();
  }, [currentUser]);

  const loadVehicles = async () => {
    try { setVehicles(await vehicleService.getAll()); } catch {}
  };
  const loadContacts = async () => {
    try { setContacts(await contactService.getAll()); } catch {}
  };

  const handleSaveProfile = async () => {
    setLoadingProfile(true); setErrProfile('');
    try {
      await updateProfile(profile);
      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 2500);
    } catch (e) { setErrProfile(e.error || 'Error al guardar perfil'); }
    setLoadingProfile(false);
  };

  const handleChangePassword = async () => {
    setErrPwd('');
    if (pwd.new.length < 8) { setErrPwd('Mínimo 8 caracteres'); return; }
    if (pwd.new !== pwd.confirm) { setErrPwd('Las contraseñas no coinciden'); return; }
    setLoadingPwd(true);
    try {
      const api = (await import('../services/api')).default;
      await api.patch('/auth/change-password', { current_password: pwd.current, new_password: pwd.new });
      setSavedPwd(true); setPwd({ current: '', new: '', confirm: '' });
      setTimeout(() => setSavedPwd(false), 2500);
    } catch (e) { setErrPwd(e.error || 'Contraseña actual incorrecta'); }
    setLoadingPwd(false);
  };

  const handleAddVehicle = async () => {
    setErrVeh('');
    if (!newVehicle.marca || !newVehicle.modelo || !newVehicle.placa) {
      setErrVeh('Marca, modelo y placa son obligatorios'); return;
    }
    setLoadingVeh(true);
    try {
      await vehicleService.create(newVehicle);
      setNewVehicle({ marca: '', modelo: '', placa: '', cilindraje: '', anio: '', color: '' });
      await loadVehicles();
      setSavedVeh(true); setTimeout(() => setSavedVeh(false), 2500);
    } catch (e) { setErrVeh(e.error || 'Error al agregar vehículo'); }
    setLoadingVeh(false);
  };

  const handleEditVehicle = async () => {
    if (!editingVehicle) return;
    setLoadingVeh(true);
    try {
      await vehicleService.update(editingVehicle.id_vehiculo, editingVehicle);
      setEditingVehicle(null); await loadVehicles();
    } catch (e) { setErrVeh(e.error || 'Error al actualizar'); }
    setLoadingVeh(false);
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('¿Eliminar este vehículo?')) return;
    try { await vehicleService.delete(id); await loadVehicles(); } catch (e) { setErrVeh(e.error || 'Error'); }
  };

  const handleAddContact = async () => {
    setErrContact('');
    if (!newContact.nombre || !newContact.telefono) { setErrContact('Nombre y teléfono obligatorios'); return; }
    try {
      await contactService.create({ ...newContact, orden_prioridad: contacts.length + 1 });
      setNewContact({ nombre: '', telefono: '' });
      await loadContacts(); setSavedContact(true); setTimeout(() => setSavedContact(false), 2500);
    } catch (e) { setErrContact(e.error || 'Error'); }
  };

  const handleDeleteContact = async (id) => {
    try { await contactService.delete(id); await loadContacts(); } catch {}
  };

  const brands = ['Kawasaki','Honda','Yamaha','Suzuki','Bajaj','TVS','Royal Enfield','KTM','Ducati','Otro'];

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>MI PERFIL</h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            {currentUser?.correo_electronico} ·
            <span style={{ color: currentUser?.rol === 'admin' ? 'var(--accent)' : 'var(--cyan)', marginLeft: 6 }}>
              {currentUser?.rol?.toUpperCase()}
            </span>
          </span>
        </div>
        <ThemeToggle compact />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Avatar */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: currentUser?.rol === 'admin' ? 'var(--accent-soft)' : 'var(--cyan-soft)',
                border: `2px solid ${currentUser?.rol === 'admin' ? 'var(--accent-border)' : 'var(--cyan-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: currentUser?.rol === 'admin' ? 'var(--accent)' : 'var(--cyan)' }}>
                  {(currentUser?.nombre_completo || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{currentUser?.nombre_completo}</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{currentUser?.correo_electronico}</p>
                <span style={{
                  fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.12em',
                  color: currentUser?.rol === 'admin' ? 'var(--accent)' : 'var(--cyan)',
                  background: currentUser?.rol === 'admin' ? 'var(--accent-soft)' : 'var(--cyan-soft)',
                  border: `1px solid ${currentUser?.rol === 'admin' ? 'var(--accent-border)' : 'var(--cyan-border)'}`,
                  padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginTop: 5,
                }}>
                  {currentUser?.rol === 'admin' ? 'ADMINISTRADOR' : 'USUARIO'}
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Plan', currentUser?.plan_suscripcion || 'básico'],
                ['Desde', currentUser?.fecha_registro ? new Date(currentUser.fecha_registro).toLocaleDateString('es-PE') : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', marginBottom: 3 }}>{k.toUpperCase()}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-secondary)' }}>{v}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Personal data */}
          <Card>
            <Label>DATOS PERSONALES</Label>
            <ErrBox msg={errProfile} />
            <Field label="NOMBRE COMPLETO" value={profile.nombre_completo} onChange={v => setProfile(p => ({ ...p, nombre_completo: v }))} />
            <Field label="CORREO ELECTRÓNICO" value={currentUser?.correo_electronico} readOnly />
            <Field label="TELÉFONO" value={profile.telefono} onChange={v => setProfile(p => ({ ...p, telefono: v }))} placeholder="+51 9XX XXX XXX" />
            <Field label="DIRECCIÓN" value={profile.direccion} onChange={v => setProfile(p => ({ ...p, direccion: v }))} placeholder="Av. Principal 123, Piura" />
            <SaveBtn onSave={handleSaveProfile} saved={savedProfile} loading={loadingProfile} />
          </Card>

          {/* Password change */}
          <Card>
            <Label>CAMBIAR CONTRASEÑA</Label>
            <ErrBox msg={errPwd} />
            <Field label="CONTRASEÑA ACTUAL" type="password" value={pwd.current} onChange={v => setPwd(p => ({ ...p, current: v }))} />
            <Field label="NUEVA CONTRASEÑA (mín. 8 chars)" type="password" value={pwd.new} onChange={v => setPwd(p => ({ ...p, new: v }))} />
            <Field label="CONFIRMAR NUEVA CONTRASEÑA" type="password" value={pwd.confirm} onChange={v => setPwd(p => ({ ...p, confirm: v }))} />
            <SaveBtn onSave={handleChangePassword} saved={savedPwd} loading={loadingPwd} label="CAMBIAR CONTRASEÑA" />
          </Card>

          {/* Logout */}
          <button onClick={logout} style={{
            width: '100%', padding: '11px', borderRadius: 10, cursor: 'pointer',
            background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
            fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.12em', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            CERRAR SESIÓN
          </button>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* My vehicles */}
          <Card>
            <Label>MIS VEHÍCULOS</Label>
            <ErrBox msg={errVeh} />

            {/* Existing vehicles */}
            {vehicles.length === 0 && (
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '16px 0' }}>
                Sin vehículos registrados
              </p>
            )}
            {vehicles.map(v => (
              <div key={v.id_vehiculo} style={{ marginBottom: 10 }}>
                {editingVehicle?.id_vehiculo === v.id_vehiculo ? (
                  <div style={{ padding: 14, background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <Field label="MARCA" value={editingVehicle.marca} onChange={val => setEditingVehicle(p => ({ ...p, marca: val }))} />
                      <Field label="MODELO" value={editingVehicle.modelo} onChange={val => setEditingVehicle(p => ({ ...p, modelo: val }))} />
                      <Field label="PLACA" value={editingVehicle.placa} onChange={val => setEditingVehicle(p => ({ ...p, placa: val }))} />
                      <Field label="AÑO" value={editingVehicle.anio} onChange={val => setEditingVehicle(p => ({ ...p, anio: val }))} />
                      <Field label="COLOR" value={editingVehicle.color} onChange={val => setEditingVehicle(p => ({ ...p, color: val }))} />
                      <Field label="CC" value={editingVehicle.cilindraje} onChange={val => setEditingVehicle(p => ({ ...p, cilindraje: val }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={handleEditVehicle} style={{ flex: 2, padding: '9px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#fff', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em' }}>GUARDAR</button>
                      <button onClick={() => setEditingVehicle(null)} style={{ flex: 1, padding: '9px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em' }}>CANCELAR</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg viewBox="0 0 32 22" width="24" height="16" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round">
                        <circle cx="5" cy="17" r="4"/><circle cx="27" cy="17" r="4"/>
                        <path d="M9 17L14 7L22 7L27 13"/><path d="M9 17L12 17L14 7"/><path d="M12 17L19 17"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{v.marca} {v.modelo}</p>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                        {v.placa} {v.anio ? `· ${v.anio}` : ''} {v.color ? `· ${v.color}` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setEditingVehicle({ ...v })} style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 8 }}>EDITAR</button>
                      <button onClick={() => handleDeleteVehicle(v.id_vehiculo)} style={{ padding: '6px 10px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 6, cursor: 'pointer', color: 'var(--accent)', fontFamily: 'JetBrains Mono', fontSize: 8 }}>ELIMINAR</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Divider />
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 10 }}>
              AGREGAR VEHÍCULO
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Field label="MARCA*" value={newVehicle.marca} onChange={v => setNewVehicle(p => ({ ...p, marca: v }))} placeholder="Kawasaki" />
              <Field label="MODELO*" value={newVehicle.modelo} onChange={v => setNewVehicle(p => ({ ...p, modelo: v }))} placeholder="Z900" />
              <Field label="PLACA*" value={newVehicle.placa} onChange={v => setNewVehicle(p => ({ ...p, placa: v }))} placeholder="ABC-123" />
              <Field label="AÑO" value={newVehicle.anio} onChange={v => setNewVehicle(p => ({ ...p, anio: v }))} placeholder="2022" />
              <Field label="COLOR" value={newVehicle.color} onChange={v => setNewVehicle(p => ({ ...p, color: v }))} placeholder="Negro" />
              <Field label="CILINDRAJE CC" value={newVehicle.cilindraje} onChange={v => setNewVehicle(p => ({ ...p, cilindraje: v }))} placeholder="900" />
            </div>
            <SaveBtn onSave={handleAddVehicle} saved={savedVeh} loading={loadingVeh} label="+ AGREGAR VEHÍCULO" />
          </Card>

          {/* Emergency contacts */}
          <Card>
            <Label>CONTACTOS DE EMERGENCIA</Label>
            <ErrBox msg={errContact} />
            {contacts.map(c => (
              <div key={c.id_contacto} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{c.nombre}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{c.telefono}</p>
                </div>
                <button onClick={() => handleDeleteContact(c.id_contacto)} style={{ padding: '5px 10px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 6, cursor: 'pointer', color: 'var(--accent)', fontFamily: 'JetBrains Mono', fontSize: 8 }}>
                  ELIMINAR
                </button>
              </div>
            ))}
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Field label="NOMBRE" value={newContact.nombre} onChange={v => setNewContact(p => ({ ...p, nombre: v }))} placeholder="Juan Pérez" />
              <Field label="TELÉFONO" value={newContact.telefono} onChange={v => setNewContact(p => ({ ...p, telefono: v }))} placeholder="+51 9XX XXX XXX" />
            </div>
            <SaveBtn onSave={handleAddContact} saved={savedContact} label="+ AGREGAR CONTACTO" />
          </Card>
        </div>
      </div>
    </div>
  );
}