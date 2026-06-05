import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { vehicleService, contactService, planService } from '../../services/api';
import ThemeToggle from '../../components/ui/ThemeToggle';

const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '18px 20px', ...style }}>{children}</div>
);

const Label = ({ children }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 12 }}>{children}</p>
);

const Divisor = () => <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />;

const CampoInput = ({ label, valor, onChange, tipo = 'text', placeholder = '', soloLectura = false, filtro }) => {
  const [foco, setFoco] = useState(false);
  const handleChange = (e) => {
    if (!onChange) return;
    const v = filtro ? filtro(e.target.value) : e.target.value;
    onChange(v);
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: foco ? 'var(--accent)' : 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6, transition: 'color .15s' }}>{label}</p>
      <input
        type={tipo} value={valor || ''} onChange={handleChange}
        placeholder={placeholder} readOnly={soloLectura}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        style={{
          width: '100%', padding: '10px 12px',
          background: soloLectura ? 'var(--bg-surface)' : 'var(--bg-input)',
          border: `1px solid ${foco ? 'var(--accent-border)' : 'var(--border)'}`,
          borderRadius: 8, color: soloLectura ? 'var(--text-muted)' : 'var(--text-primary)',
          fontFamily: 'DM Sans', fontSize: 13, outline: 'none', transition: 'border .15s',
          cursor: soloLectura ? 'not-allowed' : 'auto', boxSizing: 'border-box',
        }}
      />
    </div>
  );
};

const BotonGuardar = ({ onGuardar, guardado, cargando, label = 'GUARDAR CAMBIOS' }) => (
  <button onClick={onGuardar} disabled={cargando} style={{
    width: '100%', padding: '12px', borderRadius: 10, cursor: cargando ? 'wait' : 'pointer',
    background: guardado ? 'var(--green-soft)' : cargando ? 'var(--bg-surface)' : 'var(--accent)',
    border: `1px solid ${guardado ? 'var(--green-border)' : cargando ? 'var(--border)' : '#ff5040'}`,
    fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em',
    color: guardado ? 'var(--green)' : cargando ? 'var(--text-muted)' : '#fff',
    transition: 'all .3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  }}>
    {guardado
      ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>GUARDADO</>
      : label}
  </button>
);

const CajaError = ({ msg }) => msg ? (
  <div style={{ padding: '8px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, marginBottom: 12 }}>
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)' }}>{msg}</span>
  </div>
) : null;

const COLORES_ROL = {
  admin:      { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)', etiqueta: 'ADMINISTRADOR' },
  supervisor: { color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)',  etiqueta: 'SUPERVISOR'    },
  tecnico:    { color: 'var(--cyan)',   bg: 'var(--cyan-soft)',   border: 'var(--cyan-border)',   etiqueta: 'TÉCNICO'       },
  usuario:    { color: 'var(--green)',  bg: 'var(--green-soft)',  border: 'var(--green-border)',  etiqueta: 'USUARIO'       },
};

export default function Profile() {
  const { currentUser, updateProfile, logout } = useAuth();
  const rol = currentUser?.rol || 'usuario';
  const esUsuario = rol === 'usuario';
  const colores   = COLORES_ROL[rol] || COLORES_ROL.usuario;

  const [perfil,           setPerfil]           = useState({ nombre_completo: '', telefono: '', direccion: '' });
  const [guardadoPerfil,   setGuardadoPerfil]   = useState(false);
  const [cargandoPerfil,   setCargandoPerfil]   = useState(false);
  const [errPerfil,        setErrPerfil]        = useState('');

  const [contrasena,       setContrasena]       = useState({ actual: '', nueva: '', confirmar: '' });
  const [guardadoPwd,      setGuardadoPwd]      = useState(false);
  const [cargandoPwd,      setCargandoPwd]      = useState(false);
  const [errPwd,           setErrPwd]           = useState('');

  const [vehiculos,        setVehiculos]        = useState([]);
  const [nuevoVehiculo,    setNuevoVehiculo]    = useState({ marca: '', modelo: '', placa: '', cilindraje: '', anio: '', color: '' });
  const [editandoVeh,      setEditandoVeh]      = useState(null);
  const [cargandoVeh,      setCargandoVeh]      = useState(false);
  const [errVeh,           setErrVeh]           = useState('');
  const [guardadoVeh,      setGuardadoVeh]      = useState(false);

  const [contactos,        setContactos]        = useState([]);
  const [nuevoContacto,    setNuevoContacto]    = useState({ nombre: '', telefono: '' });
  const [guardadoContacto, setGuardadoContacto] = useState(false);
  const [errContacto,      setErrContacto]      = useState('');
  const [planActivo,       setPlanActivo]       = useState(false);

  useEffect(() => {
    if (currentUser) {
      setPerfil({ nombre_completo: currentUser.nombre_completo || '', telefono: currentUser.telefono || '', direccion: currentUser.direccion || '' });
    }
    if (esUsuario) {
      cargarVehiculos();
      cargarContactos();
      planService.estado().then(d => setPlanActivo(d?.activo === true)).catch(() => {});
    }
  }, [currentUser, esUsuario]);

  const cargarVehiculos = async () => {
    try { setVehiculos(await vehicleService.getMine()); } catch {}
  };

  const cargarContactos = async () => {
    try { setContactos(await contactService.getAll()); } catch {}
  };

  const guardarPerfil = async () => {
    setErrPerfil('');
    const nombre = perfil.nombre_completo?.trim();
    const tel    = perfil.telefono?.trim();

    if (!nombre)                                          return setErrPerfil('El nombre es obligatorio');
    if (nombre.length < 3)                                return setErrPerfil('El nombre debe tener al menos 3 caracteres');
    if (/\d/.test(nombre))                                return setErrPerfil('El nombre no puede contener números');
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(nombre))    return setErrPerfil('El nombre solo puede contener letras');
    if (tel && !/^\d+$/.test(tel))                        return setErrPerfil('El teléfono solo debe contener números');
    if (tel && !/^9\d{8}$/.test(tel))                     return setErrPerfil('El teléfono debe empezar con 9 y tener 9 dígitos');

    setCargandoPerfil(true);
    try {
      await updateProfile(perfil);
      setGuardadoPerfil(true);
      setTimeout(() => setGuardadoPerfil(false), 2500);
    } catch (e) { setErrPerfil(e.error || 'Error al guardar perfil'); }
    setCargandoPerfil(false);
  };

  const cambiarContrasena = async () => {
    setErrPwd('');
    if (!contrasena.actual)                return setErrPwd('Ingresa tu contraseña actual');
    if (contrasena.nueva.length < 8)       return setErrPwd('La nueva contraseña debe tener al menos 8 caracteres');
    if (contrasena.nueva !== contrasena.confirmar) return setErrPwd('Las contraseñas no coinciden');
    setCargandoPwd(true);
    try {
      const api = (await import('../../services/api')).default;
      await api.patch('/auth/change-password', { current_password: contrasena.actual, new_password: contrasena.nueva });
      setGuardadoPwd(true);
      setContrasena({ actual: '', nueva: '', confirmar: '' });
      setTimeout(() => setGuardadoPwd(false), 2500);
    } catch (e) { setErrPwd(e.error || 'Contraseña actual incorrecta'); }
    setCargandoPwd(false);
  };

  const agregarVehiculo = async () => {
    setErrVeh('');
    const marca  = nuevoVehiculo.marca?.trim();
    const modelo = nuevoVehiculo.modelo?.trim();
    const placa  = nuevoVehiculo.placa?.trim().toUpperCase();
    const anio   = nuevoVehiculo.anio;
    const cc     = nuevoVehiculo.cilindraje;

    if (!marca)                                           return setErrVeh('La marca es obligatoria');
    if (!modelo)                                          return setErrVeh('El modelo es obligatorio');
    if (!placa)                                           return setErrVeh('La placa es obligatoria');
    if (!/^[A-Z]{3}-\d{3}$/.test(placa))                 return setErrVeh('Placa inválida. Formato: ABC-123');
    if (anio && !/^\d{4}$/.test(String(anio)))            return setErrVeh('El año debe tener 4 dígitos');
    if (anio && (parseInt(anio) < 1990 || parseInt(anio) > new Date().getFullYear() + 1))
                                                          return setErrVeh(`El año debe estar entre 1990 y ${new Date().getFullYear() + 1}`);
    if (cc && !/^\d+$/.test(String(cc)))                  return setErrVeh('El cilindraje solo acepta números');
    if (cc && (parseInt(cc) < 50 || parseInt(cc) > 3000)) return setErrVeh('El cilindraje debe estar entre 50 y 3000 cc');

    setCargandoVeh(true);
    try {
      await vehicleService.create({ ...nuevoVehiculo, placa });
      setNuevoVehiculo({ marca: '', modelo: '', placa: '', cilindraje: '', anio: '', color: '' });
      await cargarVehiculos();
      setGuardadoVeh(true);
      setTimeout(() => setGuardadoVeh(false), 2500);
    } catch (e) { setErrVeh(e.error || 'Error al agregar vehículo'); }
    setCargandoVeh(false);
  };

  const editarVehiculo = async () => {
    if (!editandoVeh) return;
    setCargandoVeh(true);
    try {
      await vehicleService.update(editandoVeh.id_vehiculo, editandoVeh);
      setEditandoVeh(null);
      await cargarVehiculos();
    } catch (e) { setErrVeh(e.error || 'Error al actualizar'); }
    setCargandoVeh(false);
  };

  const eliminarVehiculo = async (id) => {
    if (!window.confirm('¿Eliminar este vehículo?')) return;
    try { await vehicleService.delete(id); await cargarVehiculos(); }
    catch (e) { setErrVeh(e.error || 'Error'); }
  };

  const agregarContacto = async () => {
    setErrContacto('');
    if (!nuevoContacto.nombre || !nuevoContacto.telefono) { setErrContacto('Nombre y teléfono obligatorios'); return; }
    try {
      await contactService.create({ ...nuevoContacto, orden_prioridad: contactos.length + 1 });
      setNuevoContacto({ nombre: '', telefono: '' });
      await cargarContactos();
      setGuardadoContacto(true);
      setTimeout(() => setGuardadoContacto(false), 2500);
    } catch (e) { setErrContacto(e.error || 'Error'); }
  };

  const eliminarContacto = async (id) => {
    try { await contactService.delete(id); await cargarContactos(); } catch {}
  };

  const [tab, setTab] = useState('perfil');
  const inicialesUsuario = (currentUser?.nombre_completo || 'U')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const TABS_USUARIO = [
    { id: 'perfil',    label: 'PERFIL'     },
    { id: 'seguridad', label: 'CONTRASEÑA' },
    { id: 'vehiculos', label: 'VEHÍCULOS'  },
    { id: 'contactos', label: 'CONTACTOS'  },
  ];
  const TABS_OTROS = [
    { id: 'perfil',    label: 'PERFIL'     },
    { id: 'seguridad', label: 'CONTRASEÑA' },
  ];
  const tabs = esUsuario ? TABS_USUARIO : TABS_OTROS;

  return (
    <div style={{ padding: '20px 16px 40px', maxWidth: 680, margin: '0 auto' }} className="anim-fade">

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: colores.bg, border: `2px solid ${colores.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, color: colores.color }}>{inicialesUsuario}</span>
          </div>
          <div>
            <h1 className="display" style={{ fontSize: 26, color: 'var(--text-primary)', lineHeight: 1 }}>{currentUser?.nombre_completo || 'MI PERFIL'}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{currentUser?.correo_electronico}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: colores.color, background: colores.bg, border: `1px solid ${colores.border}`, padding: '1px 7px', borderRadius: 4 }}>{colores.etiqueta}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--accent)', letterSpacing: '0.08em' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            SALIR
          </button>
          <ThemeToggle compact />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', whiteSpace: 'nowrap', transition: 'all .18s', flexShrink: 0, background: tab === t.id ? 'var(--accent-soft)' : 'var(--bg-surface)', border: `1px solid ${tab === t.id ? 'var(--accent-border)' : 'var(--border)'}`, color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'perfil' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!esUsuario && (
            <Card style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <Label>INFORMACIÓN DE CUENTA</Label>
              {[
                ['Rol',    colores.etiqueta],
                ['Correo', currentUser?.correo_electronico || '—'],
                ['Desde',  currentUser?.fecha_registro ? new Date(currentUser.fecha_registro).toLocaleDateString('es-PE') : '—'],
                ...(rol === 'supervisor' && currentUser?.area ? [['Área', currentUser.area]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: k === 'Área' ? 'var(--amber)' : k === 'Rol' ? colores.color : 'var(--text-secondary)' }}>{v}</span>
                </div>
              ))}
            </Card>
          )}
          {esUsuario && (
            <Card style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                {[
                  ['PLAN',   currentUser?.plan_suscripcion === 'basico' ? 'Activo' : 'Sin plan', planActivo ? 'var(--green)' : 'var(--text-muted)'],
                  ['VEHÍCULOS', vehiculos.length, 'var(--cyan)'],
                  ['CONTACTOS', contactos.length, 'var(--amber)'],
                  ['DESDE', currentUser?.fecha_registro ? new Date(currentUser.fecha_registro).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—', 'var(--text-secondary)'],
                ].map(([k, v, c]) => (
                  <div key={k} style={{ padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.1em' }}>{k}</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: c, fontWeight: 600, lineHeight: 1 }}>{v}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <Card>
            <Label>DATOS PERSONALES</Label>
            <CajaError msg={errPerfil} />
            <CampoInput label="NOMBRE COMPLETO" valor={perfil.nombre_completo}
              onChange={v => setPerfil(p => ({ ...p, nombre_completo: v.replace(/[0-9!@#$%^&*()_+=[\]{};':"\\|,.<>/?]/g, '') }))} />
            <CampoInput label="CORREO ELECTRÓNICO" valor={currentUser?.correo_electronico} soloLectura />
            <CampoInput label="TELÉFONO" valor={perfil.telefono}
              onChange={v => setPerfil(p => ({ ...p, telefono: v.replace(/\D/g, '').slice(0, 9) }))}
              placeholder="9XXXXXXXX"
              filtro={v => v.replace(/\D/g, '').slice(0, 9)} />
            {esUsuario && (
              <CampoInput label="DIRECCIÓN" valor={perfil.direccion}
                onChange={v => setPerfil(p => ({ ...p, direccion: v }))}
                placeholder="Av. Principal 123, Piura" />
            )}
            <BotonGuardar onGuardar={guardarPerfil} guardado={guardadoPerfil} cargando={cargandoPerfil} />
          </Card>
        </div>
      )}

      {tab === 'seguridad' && (
        <Card>
          <Label>CAMBIAR CONTRASEÑA</Label>
          <CajaError msg={errPwd} />
          <CampoInput label="CONTRASEÑA ACTUAL"          tipo="password" valor={contrasena.actual}    onChange={v => setContrasena(p => ({ ...p, actual: v }))} />
          <CampoInput label="NUEVA CONTRASEÑA (mín. 8)"  tipo="password" valor={contrasena.nueva}     onChange={v => setContrasena(p => ({ ...p, nueva: v }))}     placeholder="Mínimo 8 caracteres" />
          <CampoInput label="CONFIRMAR NUEVA CONTRASEÑA" tipo="password" valor={contrasena.confirmar} onChange={v => setContrasena(p => ({ ...p, confirmar: v }))} placeholder="Repite la nueva contraseña" />
          {contrasena.nueva && contrasena.confirmar && contrasena.nueva !== contrasena.confirmar && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: -8, marginBottom: 12 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)' }}>Las contraseñas no coinciden</span>
            </div>
          )}
          <BotonGuardar onGuardar={cambiarContrasena} guardado={guardadoPwd} cargando={cargandoPwd} label="CAMBIAR CONTRASEÑA" />
        </Card>
      )}

      {tab === 'vehiculos' && esUsuario && (
        <Card>
          <Label>MIS VEHÍCULOS</Label>
          <CajaError msg={errVeh} />
          {vehiculos.length === 0 && (
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '16px 0' }}>Sin vehículos registrados</p>
          )}
          {vehiculos.map(v => (
            <div key={v.id_vehiculo} style={{ marginBottom: 10 }}>
              {editandoVeh?.id_vehiculo === v.id_vehiculo ? (
                <div style={{ padding: 14, background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                    <CampoInput label="MARCA"  valor={editandoVeh.marca}      onChange={val => setEditandoVeh(p => ({ ...p, marca: val }))} />
                    <CampoInput label="MODELO" valor={editandoVeh.modelo}     onChange={val => setEditandoVeh(p => ({ ...p, modelo: val }))} />
                    <CampoInput label="PLACA"  valor={editandoVeh.placa}      onChange={val => setEditandoVeh(p => ({ ...p, placa: val.toUpperCase() }))} placeholder="ABC-123" />
                    <CampoInput label="AÑO"    valor={editandoVeh.anio}       onChange={val => setEditandoVeh(p => ({ ...p, anio: val.replace(/\D/g, '').slice(0,4) }))} />
                    <CampoInput label="COLOR"  valor={editandoVeh.color}      onChange={val => setEditandoVeh(p => ({ ...p, color: val.replace(/[0-9]/g, '') }))} />
                    <CampoInput label="CC"     valor={editandoVeh.cilindraje} onChange={val => setEditandoVeh(p => ({ ...p, cilindraje: val.replace(/\D/g, '') }))} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={editarVehiculo} style={{ flex: 2, padding: '9px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#fff', fontFamily: 'JetBrains Mono', fontSize: 9 }}>GUARDAR</button>
                    <button onClick={() => setEditandoVeh(null)} style={{ flex: 1, padding: '9px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 9 }}>CANCELAR</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 32 22" width="22" height="15" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round">
                      <circle cx="5" cy="17" r="4"/><circle cx="27" cy="17" r="4"/>
                      <path d="M9 17L14 7L22 7L27 13"/><path d="M9 17L12 17L14 7"/><path d="M12 17L19 17"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{v.marca} {v.modelo}</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                      {v.placa}{v.anio ? ` · ${v.anio}` : ''}{v.color ? ` · ${v.color}` : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => setEditandoVeh({ ...v })} style={{ padding: '5px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 8 }}>EDITAR</button>
                    <button onClick={() => eliminarVehiculo(v.id_vehiculo)} style={{ padding: '5px 8px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 6, cursor: 'pointer', color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <Divisor />
          {!planActivo && vehiculos.length >= 1 ? (
            <div style={{ padding: '12px 14px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)' }}>
                Plan gratuito: máximo 1 vehículo.{' '}
                <button onClick={() => window.location.href='/plan'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontFamily: 'JetBrains Mono', fontSize: 9, padding: 0, textDecoration: 'underline' }}>Activa el plan →</button>
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 10 }}>AGREGAR VEHÍCULO</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                <CampoInput label="MARCA*"        valor={nuevoVehiculo.marca}      onChange={v => setNuevoVehiculo(p => ({ ...p, marca: v }))}      placeholder="Kawasaki" />
                <CampoInput label="MODELO*"       valor={nuevoVehiculo.modelo}     onChange={v => setNuevoVehiculo(p => ({ ...p, modelo: v }))}     placeholder="Z900"    />
                <CampoInput label="PLACA*"        valor={nuevoVehiculo.placa}      onChange={v => setNuevoVehiculo(p => ({ ...p, placa: v.toUpperCase() }))} placeholder="ABC-123" />
                <CampoInput label="AÑO"           valor={nuevoVehiculo.anio}       onChange={v => setNuevoVehiculo(p => ({ ...p, anio: v.replace(/\D/g, '').slice(0, 4) }))} placeholder="2022" />
                <CampoInput label="COLOR"         valor={nuevoVehiculo.color}      onChange={v => setNuevoVehiculo(p => ({ ...p, color: v.replace(/[0-9]/g, '') }))} placeholder="Negro" />
                <CampoInput label="CILINDRAJE CC" valor={nuevoVehiculo.cilindraje} onChange={v => setNuevoVehiculo(p => ({ ...p, cilindraje: v.replace(/\D/g, '') }))} placeholder="900" />
              </div>
              <BotonGuardar onGuardar={agregarVehiculo} guardado={guardadoVeh} cargando={cargandoVeh} label="+ AGREGAR VEHÍCULO" />
            </>
          )}
        </Card>
      )}

      {tab === 'contactos' && esUsuario && (
        <Card>
          <Label>CONTACTOS DE EMERGENCIA</Label>
          <CajaError msg={errContacto} />
          {contactos.length === 0 && (
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '12px 0' }}>Sin contactos registrados</p>
          )}
          {contactos.map(c => (
            <div key={c.id_contacto} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{c.nombre}</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{c.telefono}</p>
              </div>
              <button onClick={() => eliminarContacto(c.id_contacto)} style={{ padding: '5px 8px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 6, cursor: 'pointer', color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              </button>
            </div>
          ))}
          {!planActivo && contactos.length >= 1 ? (
            <div style={{ padding: '10px 14px', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', borderRadius: 8, marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--amber)' }}>
                Plan gratuito: máximo 1 contacto.{' '}
                <button onClick={() => window.location.href='/plan'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amber)', fontFamily: 'JetBrains Mono', fontSize: 9, padding: 0, textDecoration: 'underline' }}>Activa el plan →</button>
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                <CampoInput label="NOMBRE*"   valor={nuevoContacto.nombre}
                  onChange={v => setNuevoContacto(p => ({ ...p, nombre: v.replace(/[0-9]/g, '') }))}
                  placeholder="Juan Pérez" />
                <CampoInput label="TELÉFONO*" valor={nuevoContacto.telefono}
                  onChange={v => setNuevoContacto(p => ({ ...p, telefono: v.replace(/\D/g, '').slice(0, 9) }))}
                  placeholder="9XXXXXXXX" />
              </div>
              <BotonGuardar onGuardar={agregarContacto} guardado={guardadoContacto} label="+ AGREGAR CONTACTO" />
            </>
          )}
        </Card>
      )}
    </div>
  );
}