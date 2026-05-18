import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { vehicleService, contactService } from '../../services/api';
import ThemeToggle from '../../components/ui/ThemeToggle';

const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '18px 20px', ...style }}>{children}</div>
);

const Label = ({ children }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 12 }}>{children}</p>
);

const Divisor = () => <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />;

const CampoInput = ({ label, valor, onChange, tipo = 'text', placeholder = '', soloLectura = false }) => (
  <div style={{ marginBottom: 14 }}>
    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</p>
    <input
      type={tipo} value={valor || ''} onChange={e => onChange && onChange(e.target.value)}
      placeholder={placeholder} readOnly={soloLectura}
      style={{
        width: '100%', padding: '10px 12px',
        background: soloLectura ? 'var(--bg-surface)' : 'var(--bg-input)',
        border: '1px solid var(--border)', borderRadius: 8,
        color: soloLectura ? 'var(--text-muted)' : 'var(--text-primary)',
        fontFamily: 'DM Sans', fontSize: 13, outline: 'none', transition: 'border .2s',
        cursor: soloLectura ? 'not-allowed' : 'auto',
        boxSizing: 'border-box',
      }}
      onFocus={e => !soloLectura && (e.target.style.borderColor = 'var(--accent-border)')}
      onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
    />
  </div>
);

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

  useEffect(() => {
    if (currentUser) {
      setPerfil({ nombre_completo: currentUser.nombre_completo || '', telefono: currentUser.telefono || '', direccion: currentUser.direccion || '' });
    }
    if (esUsuario) { cargarVehiculos(); cargarContactos(); }
  }, [currentUser, esUsuario]);

  const cargarVehiculos = async () => {
    try { setVehiculos(await vehicleService.getMine()); } catch {}
  };

  const cargarContactos = async () => {
    try { setContactos(await contactService.getAll()); } catch {}
  };

  const guardarPerfil = async () => {
    setCargandoPerfil(true); setErrPerfil('');
    try {
      await updateProfile(perfil);
      setGuardadoPerfil(true);
      setTimeout(() => setGuardadoPerfil(false), 2500);
    } catch (e) { setErrPerfil(e.error || 'Error al guardar perfil'); }
    setCargandoPerfil(false);
  };

  const cambiarContrasena = async () => {
    setErrPwd('');
    if (contrasena.nueva.length < 8) { setErrPwd('Mínimo 8 caracteres'); return; }
    if (contrasena.nueva !== contrasena.confirmar) { setErrPwd('Las contraseñas no coinciden'); return; }
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
    if (!nuevoVehiculo.marca || !nuevoVehiculo.modelo || !nuevoVehiculo.placa) {
      setErrVeh('Marca, modelo y placa son obligatorios'); return;
    }
    setCargandoVeh(true);
    try {
      await vehicleService.create(nuevoVehiculo);
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

  const inicialesUsuario = (currentUser?.nombre_completo || 'U')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>MI PERFIL</h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            {currentUser?.correo_electronico} ·{' '}
            <span style={{ color: colores.color }}>{colores.etiqueta}</span>
          </span>
        </div>
        <ThemeToggle compact />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: colores.bg, border: `2px solid ${colores.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: colores.color }}>{inicialesUsuario}</span>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{currentUser?.nombre_completo}</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{currentUser?.correo_electronico}</p>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.12em', color: colores.color, background: colores.bg, border: `1px solid ${colores.border}`, padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginTop: 5 }}>
                  {colores.etiqueta}
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Plan',  currentUser?.plan_suscripcion || 'básico'],
                ['Desde', currentUser?.fecha_registro ? new Date(currentUser.fecha_registro).toLocaleDateString('es-PE') : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', marginBottom: 3 }}>{k.toUpperCase()}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-secondary)' }}>{v}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <Label>DATOS PERSONALES</Label>
            <CajaError msg={errPerfil} />
            <CampoInput label="NOMBRE COMPLETO"    valor={perfil.nombre_completo} onChange={v => setPerfil(p => ({ ...p, nombre_completo: v }))} />
            <CampoInput label="CORREO ELECTRÓNICO" valor={currentUser?.correo_electronico} soloLectura />
            <CampoInput label="TELÉFONO"           valor={perfil.telefono}  onChange={v => setPerfil(p => ({ ...p, telefono: v }))}  placeholder="+51 9XX XXX XXX" />
            {esUsuario && (
              <CampoInput label="DIRECCIÓN" valor={perfil.direccion} onChange={v => setPerfil(p => ({ ...p, direccion: v }))} placeholder="Av. Principal 123, Piura" />
            )}
            <BotonGuardar onGuardar={guardarPerfil} guardado={guardadoPerfil} cargando={cargandoPerfil} />
          </Card>

          <Card>
            <Label>CAMBIAR CONTRASEÑA</Label>
            <CajaError msg={errPwd} />
            <CampoInput label="CONTRASEÑA ACTUAL"          tipo="password" valor={contrasena.actual}    onChange={v => setContrasena(p => ({ ...p, actual: v }))} />
            <CampoInput label="NUEVA CONTRASEÑA (mín. 8)"  tipo="password" valor={contrasena.nueva}     onChange={v => setContrasena(p => ({ ...p, nueva: v }))} />
            <CampoInput label="CONFIRMAR NUEVA CONTRASEÑA" tipo="password" valor={contrasena.confirmar} onChange={v => setContrasena(p => ({ ...p, confirmar: v }))} />
            <BotonGuardar onGuardar={cambiarContrasena} guardado={guardadoPwd} cargando={cargandoPwd} label="CAMBIAR CONTRASEÑA" />
          </Card>

          <button onClick={logout} style={{ width: '100%', padding: '11px', borderRadius: 10, cursor: 'pointer', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.12em', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            CERRAR SESIÓN
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {esUsuario ? (
            <>
              <Card>
                <Label>MIS VEHÍCULOS</Label>
                <CajaError msg={errVeh} />

                {vehiculos.length === 0 && (
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '16px 0' }}>
                    Sin vehículos registrados
                  </p>
                )}

                {vehiculos.map(v => (
                  <div key={v.id_vehiculo} style={{ marginBottom: 10 }}>
                    {editandoVeh?.id_vehiculo === v.id_vehiculo ? (
                      <div style={{ padding: 14, background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <CampoInput label="MARCA"  valor={editandoVeh.marca}      onChange={val => setEditandoVeh(p => ({ ...p, marca: val }))} />
                          <CampoInput label="MODELO" valor={editandoVeh.modelo}     onChange={val => setEditandoVeh(p => ({ ...p, modelo: val }))} />
                          <CampoInput label="PLACA"  valor={editandoVeh.placa}      onChange={val => setEditandoVeh(p => ({ ...p, placa: val }))} />
                          <CampoInput label="AÑO"    valor={editandoVeh.anio}       onChange={val => setEditandoVeh(p => ({ ...p, anio: val }))} />
                          <CampoInput label="COLOR"  valor={editandoVeh.color}      onChange={val => setEditandoVeh(p => ({ ...p, color: val }))} />
                          <CampoInput label="CC"     valor={editandoVeh.cilindraje} onChange={val => setEditandoVeh(p => ({ ...p, cilindraje: val }))} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={editarVehiculo} style={{ flex: 2, padding: '9px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#fff', fontFamily: 'JetBrains Mono', fontSize: 9 }}>GUARDAR</button>
                          <button onClick={() => setEditandoVeh(null)} style={{ flex: 1, padding: '9px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 9 }}>CANCELAR</button>
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
                            {v.placa}{v.anio ? ` · ${v.anio}` : ''}{v.color ? ` · ${v.color}` : ''}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setEditandoVeh({ ...v })} style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 8 }}>EDITAR</button>
                          <button onClick={() => eliminarVehiculo(v.id_vehiculo)} style={{ padding: '6px 10px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 6, cursor: 'pointer', color: 'var(--accent)', fontFamily: 'JetBrains Mono', fontSize: 8 }}>ELIMINAR</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <Divisor />
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 10 }}>AGREGAR VEHÍCULO</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <CampoInput label="MARCA*"        valor={nuevoVehiculo.marca}      onChange={v => setNuevoVehiculo(p => ({ ...p, marca: v }))}      placeholder="Kawasaki" />
                  <CampoInput label="MODELO*"       valor={nuevoVehiculo.modelo}     onChange={v => setNuevoVehiculo(p => ({ ...p, modelo: v }))}     placeholder="Z900"    />
                  <CampoInput label="PLACA*"        valor={nuevoVehiculo.placa}      onChange={v => setNuevoVehiculo(p => ({ ...p, placa: v }))}      placeholder="ABC-123" />
                  <CampoInput label="AÑO"           valor={nuevoVehiculo.anio}       onChange={v => setNuevoVehiculo(p => ({ ...p, anio: v }))}       placeholder="2022"    />
                  <CampoInput label="COLOR"         valor={nuevoVehiculo.color}      onChange={v => setNuevoVehiculo(p => ({ ...p, color: v }))}      placeholder="Negro"   />
                  <CampoInput label="CILINDRAJE CC" valor={nuevoVehiculo.cilindraje} onChange={v => setNuevoVehiculo(p => ({ ...p, cilindraje: v }))} placeholder="900"     />
                </div>
                <BotonGuardar onGuardar={agregarVehiculo} guardado={guardadoVeh} cargando={cargandoVeh} label="+ AGREGAR VEHÍCULO" />
              </Card>

              <Card>
                <Label>CONTACTOS DE EMERGENCIA</Label>
                <CajaError msg={errContacto} />
                {contactos.length === 0 && (
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '12px 0' }}>
                    Sin contactos registrados
                  </p>
                )}
                {contactos.map(c => (
                  <div key={c.id_contacto} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{c.nombre}</p>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{c.telefono}</p>
                    </div>
                    <button onClick={() => eliminarContacto(c.id_contacto)} style={{ padding: '5px 10px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 6, cursor: 'pointer', color: 'var(--accent)', fontFamily: 'JetBrains Mono', fontSize: 8 }}>
                      ELIMINAR
                    </button>
                  </div>
                ))}
                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <CampoInput label="NOMBRE"   valor={nuevoContacto.nombre}   onChange={v => setNuevoContacto(p => ({ ...p, nombre: v }))}   placeholder="Juan Pérez"      />
                  <CampoInput label="TELÉFONO" valor={nuevoContacto.telefono} onChange={v => setNuevoContacto(p => ({ ...p, telefono: v }))} placeholder="+51 9XX XXX XXX" />
                </div>
                <BotonGuardar onGuardar={agregarContacto} guardado={guardadoContacto} label="+ AGREGAR CONTACTO" />
              </Card>
            </>
          ) : (
            <Card style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <Label>INFORMACIÓN DE CUENTA</Label>
              {[
                ['Rol',    colores.etiqueta                                                        ],
                ['Correo', currentUser?.correo_electronico || '—'                                 ],
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
        </div>
      </div>
    </div>
  );
}