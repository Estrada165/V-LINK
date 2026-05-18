import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';

const CampoInput = ({ label, tipo = 'text', valor, onChange, placeholder = '', requerido }) => (
  <div style={{ marginBottom: 14 }}>
    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 6 }}>
      {label}{requerido && <span style={{ color: 'var(--accent)', marginLeft: 4 }}>*</span>}
    </p>
    <input
      type={tipo} value={valor} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '11px 14px',
        background: 'var(--bg-input)', border: '1px solid var(--border)',
        borderRadius: 9, color: 'var(--text-primary)',
        fontFamily: 'DM Sans', fontSize: 13, outline: 'none', transition: 'border .2s',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
      onBlur={e  => e.target.style.borderColor = 'var(--border)'}
    />
  </div>
);

const SpinnerInline = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

function ModalRegistro({ onClose }) {
  const [form, setForm] = useState({ nombre_completo: '', correo_electronico: '', telefono: '', password: '', confirmar: '' });
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [exitoso, setExitoso] = useState(false);

  const set = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const validar = () => {
    const e = {};
    if (!form.nombre_completo.trim())        e.nombre_completo    = 'El nombre es obligatorio';
    if (!form.correo_electronico.includes('@')) e.correo_electronico = 'Correo inválido';
    if (form.password.length < 8)            e.password           = 'Mínimo 8 caracteres';
    if (form.password !== form.confirmar)    e.confirmar          = 'Las contraseñas no coinciden';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleRegistro = async () => {
    if (!validar()) return;
    setLoading(true);
    setErrores({});
    try {
      const { nombre_completo, correo_electronico, telefono, password } = form;
      await authService.register({ nombre_completo, correo_electronico, telefono, password });
      setExitoso(true);
    } catch (err) {
      setErrores({ general: err.error || 'Error al registrar. Intenta de nuevo.' });
    }
    setLoading(false);
  };

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  };

  if (exitoso) {
    return (
      <div style={overlayStyle}>
        <div className="mg-card" style={{ width: '100%', maxWidth: 380, padding: 32, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-soft)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '0.1em' }}>CUENTA CREADA</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>
            Tu cuenta está pendiente de activación.
          </p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
            El administrador revisará tu solicitud y activará tu cuenta. Una vez activa podrás iniciar sesión.
          </p>
          <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 10, cursor: 'pointer', background: 'var(--accent)', border: 'none', fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em', color: '#fff' }}>
            ENTENDIDO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div className="mg-card" style={{ width: '100%', maxWidth: 420, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <h2 className="display" style={{ fontSize: 26, color: 'var(--text-primary)', lineHeight: 1 }}>CREAR CUENTA</h2>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.08em' }}>Sistema de seguridad vehicular</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {errores.general && (
          <div style={{ padding: '10px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, marginBottom: 14 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)' }}>{errores.general}</span>
          </div>
        )}

        <CampoInput label="NOMBRE COMPLETO"     valor={form.nombre_completo}    onChange={set('nombre_completo')}    requerido />
        {errores.nombre_completo    && <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', marginTop: -10, marginBottom: 10 }}>{errores.nombre_completo}</p>}

        <CampoInput label="CORREO ELECTRÓNICO"  valor={form.correo_electronico} onChange={set('correo_electronico')} tipo="email" requerido />
        {errores.correo_electronico && <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', marginTop: -10, marginBottom: 10 }}>{errores.correo_electronico}</p>}

        <CampoInput label="TELÉFONO (opcional)" valor={form.telefono}           onChange={set('telefono')}           placeholder="+51 9XX XXX XXX" />

        <CampoInput label="CONTRASEÑA"          valor={form.password}           onChange={set('password')}           tipo="password" requerido />
        {errores.password           && <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', marginTop: -10, marginBottom: 10 }}>{errores.password}</p>}

        <CampoInput label="CONFIRMAR CONTRASEÑA" valor={form.confirmar}         onChange={set('confirmar')}          tipo="password" requerido />
        {errores.confirmar          && <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', marginTop: -10, marginBottom: 10 }}>{errores.confirmar}</p>}

        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginBottom: 16, lineHeight: 1.6 }}>
          Tu cuenta será revisada y activada por el administrador antes de que puedas acceder al sistema.
        </p>

        <button onClick={handleRegistro} disabled={loading} style={{
          width: '100%', padding: '13px', borderRadius: 10,
          background: loading ? 'var(--bg-surface)' : 'var(--accent)',
          border: `1px solid ${loading ? 'var(--border)' : '#ff5040'}`,
          cursor: loading ? 'wait' : 'pointer',
          fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: '0.15em',
          color: loading ? 'var(--text-muted)' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .25s',
        }}>
          {loading ? <><SpinnerInline />REGISTRANDO...</> : 'CREAR CUENTA'}
        </button>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [correo,        setCorreo]        = useState('');
  const [password,      setPassword]      = useState('');
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  const handleLogin = async () => {
    if (!correo || !password) { setError('Completa todos los campos'); return; }
    setLoading(true);
    setError('');
    try {
      await login(correo, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.offline ? 'Sin conexión al servidor. Verifica que el backend esté corriendo.' : err.error || 'Credenciales incorrectas');
    }
    setLoading(false);
  };

  const formularioCompleto = correo && password && !loading;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`, backgroundSize: '48px 48px', opacity: 0.4 }}/>
      <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, pointerEvents: 'none', background: 'radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%)' }}/>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 360, padding: '0 24px' }} className="anim-fade">

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <svg viewBox="0 0 64 64" width="64" height="64">
            <polygon points="32,4 60,18 60,46 32,60 4,46 4,18" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5"/>
            <polygon points="32,12 52,22 52,42 32,52 12,42 12,22" fill="none" stroke="var(--accent)" strokeWidth="0.5" opacity="0.4"/>
            <circle cx="20" cy="42" r="7" fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
            <circle cx="44" cy="42" r="7" fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
            <path d="M27 42L32 28L40 28L44 36" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M27 42L30 42L32 28" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M30 42L38 42" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 38, letterSpacing: '0.25em', color: 'var(--text-primary)', lineHeight: 1 }}>MOTOGUARD</h1>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.18em', marginTop: 4 }}>SISTEMA DE SEGURIDAD VEHICULAR</p>
          </div>
        </div>

        <div className="mg-card" style={{ padding: 24 }}>
          <CampoInput label="CORREO ELECTRÓNICO" tipo="email"    valor={correo}   onChange={setCorreo}   placeholder="tu@correo.com" requerido />
          <CampoInput label="CONTRASEÑA"          tipo="password" valor={password} onChange={setPassword} placeholder="••••••••"      requerido />

          {error && (
            <div style={{ padding: '8px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, marginBottom: 14 }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)' }}>{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={!formularioCompleto}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: 13, borderRadius: 10,
              background: formularioCompleto ? 'var(--accent)' : 'var(--bg-surface)',
              border: `1px solid ${formularioCompleto ? '#ff5040' : 'var(--border)'}`,
              cursor: formularioCompleto ? 'pointer' : 'not-allowed',
              fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: '0.15em',
              color: formularioCompleto ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all .25s', marginBottom: 12,
              boxShadow: formularioCompleto ? '0 0 20px var(--accent-glow)' : 'none',
            }}>
            {loading ? <><SpinnerInline />VERIFICANDO...</> : 'INICIAR SESIÓN'}
          </button>

          <button onClick={() => setMostrarRegistro(true)} style={{
            width: '100%', padding: '10px', borderRadius: 10,
            background: 'transparent', border: '1px solid var(--border)',
            cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10,
            letterSpacing: '0.12em', color: 'var(--text-muted)', transition: 'all .2s',
          }}>
            CREAR CUENTA NUEVA
          </button>
        </div>

        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', textAlign: 'center', marginTop: 16, letterSpacing: '0.1em' }}>
          MOTOGUARD · Piura, Perú
        </p>
      </div>

      {mostrarRegistro && <ModalRegistro onClose={() => setMostrarRegistro(false)} />}
    </div>
  );
}