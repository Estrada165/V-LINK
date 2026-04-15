import React, { useState } from 'react';
import ThemeToggle from '../components/ui/ThemeToggle';

const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '18px 20px', ...style }}>{children}</div>
);
const Label = ({ children }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 13 }}>
    {children}
  </p>
);
const Divider = () => <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />;

const Field = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
  <div style={{ marginBottom: 14 }}>
    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>
      {label}
    </p>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '10px 12px',
        background: 'var(--bg-input)', border: '1px solid var(--border)',
        borderRadius: 8, color: 'var(--text-primary)',
        fontFamily: 'DM Sans, sans-serif', fontSize: 13,
        outline: 'none', transition: 'border-color .2s',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
      onBlur={e  => e.target.style.borderColor = 'var(--border)'}
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 14 }}>
    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>
      {label}
    </p>
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      width: '100%', padding: '10px 12px',
      background: 'var(--bg-input)', border: '1px solid var(--border)',
      borderRadius: 8, color: 'var(--text-primary)',
      fontFamily: 'DM Sans, sans-serif', fontSize: 13,
      outline: 'none', cursor: 'pointer',
    }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const SaveBtn = ({ onSave, saved }) => (
  <button onClick={onSave} style={{
    width: '100%', padding: '12px',
    background: saved ? 'var(--green-soft)' : 'var(--accent)',
    border: `1px solid ${saved ? 'var(--green-border)' : '#ff5040'}`,
    borderRadius: 10, cursor: 'pointer',
    fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em',
    color: saved ? 'var(--green)' : '#fff',
    transition: 'all .3s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  }}>
    {saved
      ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>GUARDADO</>
      : 'GUARDAR CAMBIOS'
    }
  </button>
);

export default function Profile() {
  // Personal
  const [name,    setName]    = useState('Carlos Mendoza');
  const [email,   setEmail]   = useState('carlos@motoguard.io');
  const [phone,   setPhone]   = useState('+51 912 345 678');
  const [address, setAddress] = useState('Av. Grau 342, Piura');

  // Vehicle
  const [brand,   setBrand]   = useState('Kawasaki');
  const [model,   setModel]   = useState('Z900');
  const [plate,   setPlate]   = useState('ABC-123');
  const [year,    setYear]    = useState('2022');
  const [color,   setColor]   = useState('Negro mate');
  const [engCC,   setEngCC]   = useState('900');

  // Emergency contacts
  const [contact1, setContact1] = useState('María Mendoza · +51 945 678 901');
  const [contact2, setContact2] = useState('Juan Pérez · +51 934 567 890');

  const [savedPersonal,  setSavedPersonal]  = useState(false);
  const [savedVehicle,   setSavedVehicle]   = useState(false);
  const [savedEmergency, setSavedEmergency] = useState(false);

  const handleSave = (setSaved) => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const brands = ['Kawasaki','Honda','Yamaha','Suzuki','Bajaj','TVS','Royal Enfield','KTM','Ducati','Otro'];

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>
            MI PERFIL
          </h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            Datos personales · vehículo · contactos de emergencia
          </span>
        </div>
        <ThemeToggle compact />
      </div>

      {/* Responsive 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Avatar + user summary */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              {/* Avatar placeholder */}
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'var(--accent-soft)', border: '2px solid var(--accent-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 26, color: 'var(--accent)', letterSpacing: '0.05em' }}>
                  {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }}>{name}</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{email}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 4px var(--green)' }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--green)', letterSpacing: '0.1em' }}>CUENTA ACTIVA</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Dispositivos', '1 vinculado'],
                ['Plan',         'Pro · activo'],
                ['Miembro desde','Oct 2023'],
                ['Zona',         'Piura, Perú'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 3 }}>{k.toUpperCase()}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-secondary)' }}>{v}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Personal data */}
          <Card>
            <Label>DATOS PERSONALES</Label>
            <Field label="NOMBRE COMPLETO"   value={name}    onChange={setName}    placeholder="Tu nombre"/>
            <Field label="CORREO ELECTRÓNICO" value={email}   onChange={setEmail}   type="email" placeholder="correo@ejemplo.com"/>
            <Field label="TELÉFONO"           value={phone}   onChange={setPhone}   placeholder="+51 9XX XXX XXX"/>
            <Field label="DIRECCIÓN"          value={address} onChange={setAddress} placeholder="Av. Principal 123, Ciudad"/>
            <SaveBtn onSave={() => handleSave(setSavedPersonal)} saved={savedPersonal} />
          </Card>

          {/* Emergency contacts */}
          <Card>
            <Label>CONTACTOS DE EMERGENCIA</Label>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '0.06em' }}>
              Se notifican automáticamente al activar modo emergencia
            </p>
            <Field label="CONTACTO 1" value={contact1} onChange={setContact1} placeholder="Nombre · +51 9XX XXX XXX"/>
            <Field label="CONTACTO 2" value={contact2} onChange={setContact2} placeholder="Nombre · +51 9XX XXX XXX"/>
            <SaveBtn onSave={() => handleSave(setSavedEmergency)} saved={savedEmergency} />
          </Card>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Vehicle data */}
          <Card>
            <Label>DATOS DEL VEHÍCULO</Label>

            {/* Vehicle preview card */}
            <div style={{
              padding: '16px', background: 'var(--bg-surface)',
              border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              {/* Mini moto icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg viewBox="0 0 32 22" width="26" height="18" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="5" cy="17" r="4"/><circle cx="27" cy="17" r="4"/>
                  <path d="M9 17L14 7L22 7L27 13"/><path d="M9 17L12 17L14 7"/>
                  <path d="M12 17L19 17"/><path d="M22 7L24 5L26 7"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {brand} {model} {year}
                </p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                  {plate} · {engCC}cc · {color}
                </p>
              </div>
            </div>

            <Select label="MARCA"  value={brand} onChange={setBrand} options={brands}/>
            <Field  label="MODELO" value={model} onChange={setModel} placeholder="Z900, CB500, MT-07..."/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="PLACA"  value={plate}  onChange={setPlate}  placeholder="ABC-123"/>
              <Field label="AÑO"    value={year}   onChange={setYear}   placeholder="2022"/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="CILINDRAJE (CC)" value={engCC}  onChange={setEngCC}  placeholder="900"/>
              <Field label="COLOR"           value={color}  onChange={setColor}  placeholder="Negro mate"/>
            </div>
            <SaveBtn onSave={() => handleSave(setSavedVehicle)} saved={savedVehicle} />
          </Card>

          {/* Account actions */}
          <Card>
            <Label>ACCIONES DE CUENTA</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Cambiar contraseña',    icon: 'lock',   color: 'var(--text-secondary)' },
                { label: 'Exportar mis datos',     icon: 'download', color: 'var(--cyan)' },
                { label: 'Vincular nuevo anillo',  icon: 'ble',    color: 'var(--cyan)' },
                { label: 'Cerrar sesión',          icon: 'logout', color: 'var(--accent)' },
              ].map(({ label, color }) => (
                <button key={label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  color, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
                  transition: 'all .2s',
                }}>
                  {label}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))}
            </div>
          </Card>

          {/* App version */}
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', letterSpacing: '0.1em' }}>
              MOTOGUARD v2.4.1 · CIFRADO AES-256 · Piura, Perú
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}