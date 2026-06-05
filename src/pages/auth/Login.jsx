import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';

/* ═══════════════════════════════════════════════════
   VALIDACIONES — reglas por campo
═══════════════════════════════════════════════════ */
const REGLAS = {
  nombre_completo: (v) => {
    if (!v.trim())                                         return 'El nombre es obligatorio';
    if (v.trim().length < 3)                              return 'Mínimo 3 caracteres';
    if (/[0-9]/.test(v))                                  return 'No puede contener números';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(v.trim()))  return 'Solo letras y espacios';
    return null;
  },
  correo_electronico: (v) => {
    if (!v.trim())                                         return 'El correo es obligatorio';
    if (!v.includes('@'))                                 return 'Debe contener @  (ej: nombre@dominio.com)';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Formato inválido (ej: nombre@dominio.com)';
    return null;
  },
  telefono: (v) => {
    if (!v.trim()) return null; // opcional
    if (!/^\d+$/.test(v))    return 'Solo números — no uses letras, espacios ni guiones';
    if (!v.startsWith('9'))  return 'Debe empezar con 9 (ej: 987654321)';
    if (v.length !== 9)      return `Debe tener exactamente 9 dígitos (tienes ${v.length})`;
    return null;
  },
  password: (v) => {
    if (!v)            return 'La contraseña es obligatoria';
    if (v.length < 8)  return `Mínimo 8 caracteres (tienes ${v.length})`;
    return null;
  },
};

/* ═══════════════════════════════════════════════════
   FILTROS — bloquean caracteres inválidos en tiempo real
═══════════════════════════════════════════════════ */
const FILTROS = {
  nombre_completo:    (v) => v.replace(/[0-9!@#$%^&*()_+=[\]{};':"\\|,.<>/?`~]/g, ''),
  telefono:           (v) => v.replace(/\D/g, '').slice(0, 9),
  correo_electronico: (v) => v.replace(/\s/g, ''),
  password:           (v) => v,
  confirmar:          (v) => v,
};

/* ═══════════════════════════════════════════════════
   COMPONENTE — campo con validación en tiempo real
═══════════════════════════════════════════════════ */
function Campo({ id, label, tipo = 'text', valor, onChange, placeholder = '', requerido, errorForzado }) {
  const [tocado, setTocado] = useState(false);
  const [foco,   setFoco]   = useState(false);

  const handleChange = (e) => {
    const filtro = FILTROS[id] || ((v) => v);
    onChange(filtro(e.target.value));
  };

  const errorLocal = tocado && REGLAS[id] ? REGLAS[id](valor) : null;
  const error      = errorForzado || errorLocal;
  const valido     = tocado && !error && valor.trim() !== '';

  const borde = foco
    ? (error ? '#ff4433' : 'var(--accent-border)')
    : error  ? '#ff4433'
    : valido ? 'var(--green-border)'
    : 'var(--border)';

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <label style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: error ? '#ff4433' : 'var(--text-muted)', letterSpacing: '0.12em' }}>
          {label}{requerido && <span style={{ color: '#ff4433', marginLeft: 3 }}>*</span>}
        </label>
        {valido && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
      <input
        type={tipo}
        value={valor}
        onChange={handleChange}
        onFocus={() => setFoco(true)}
        onBlur={() => { setFoco(false); setTocado(true); }}
        placeholder={placeholder}
        autoComplete={tipo === 'password' ? 'new-password' : 'off'}
        style={{
          width: '100%', padding: '11px 14px', boxSizing: 'border-box',
          background: 'var(--bg-input)', border: `1.5px solid ${borde}`,
          borderRadius: 9, color: 'var(--text-primary)',
          fontFamily: 'DM Sans', fontSize: 13, outline: 'none',
          transition: 'border-color .15s',
        }}
      />
      {error && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'JetBrains Mono', fontSize: 9, color: '#ff4433', marginTop: 5 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SPINNER
═══════════════════════════════════════════════════ */
const Spinner = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    style={{ animation: 'spin-cw 1s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

/* ═══════════════════════════════════════════════════
   MODAL REGISTRO
═══════════════════════════════════════════════════ */
function ModalRegistro({ onClose }) {
  const [form,    setForm]    = useState({ nombre_completo: '', correo_electronico: '', telefono: '', password: '', confirmar: '' });
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [exitoso, setExitoso] = useState(false);

  const set = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const validarTodo = () => {
    const e = {};
    Object.keys(REGLAS).forEach(k => {
      const err = REGLAS[k](form[k] || '');
      if (err) e[k] = err;
    });
    if (!form.confirmar)
      e.confirmar = 'Confirma tu contraseña';
    else if (form.password !== form.confirmar)
      e.confirmar = 'Las contraseñas no coinciden';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleRegistro = async () => {
    if (!validarTodo()) return;
    setLoading(true);
    setErrores({});
    try {
      await authService.register({
        nombre_completo:    form.nombre_completo.trim(),
        correo_electronico: form.correo_electronico.trim().toLowerCase(),
        telefono:           form.telefono.trim() || undefined,
        password:           form.password,
      });
      setExitoso(true);
    } catch (err) {
      setErrores({ general: err.error || 'Error al registrar. Intenta de nuevo.' });
    }
    setLoading(false);
  };

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 9000,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  };

  if (exitoso) return (
    <div style={overlay}>
      <div className="mg-card" style={{ width: '100%', maxWidth: 380, padding: 32, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-soft)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '0.1em' }}>CUENTA CREADA</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>Tu cuenta está pendiente de activación.</p>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
          El administrador revisará tu solicitud y activará tu cuenta. Una vez activa podrás iniciar sesión.
        </p>
        <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 10, cursor: 'pointer', background: 'var(--accent)', border: 'none', fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em', color: '#fff' }}>
          ENTENDIDO
        </button>
      </div>
    </div>
  );

  return (
    <div style={overlay}>
      <div className="mg-card" style={{ width: '100%', maxWidth: 420, padding: 28, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 className="display" style={{ fontSize: 26, color: 'var(--text-primary)', lineHeight: 1 }}>CREAR CUENTA</h2>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.08em' }}>Sistema de seguridad vehicular</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
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

        <Campo id="nombre_completo"    label="NOMBRE COMPLETO"      valor={form.nombre_completo}    onChange={set('nombre_completo')}    placeholder="Ej: Juan Pérez"         requerido errorForzado={errores.nombre_completo} />
        <Campo id="correo_electronico" label="CORREO ELECTRÓNICO"   valor={form.correo_electronico} onChange={set('correo_electronico')} placeholder="tu@correo.com"          requerido errorForzado={errores.correo_electronico} tipo="email" />
        <Campo id="telefono"           label="TELÉFONO (opcional)"  valor={form.telefono}           onChange={set('telefono')}           placeholder="9XXXXXXXX"                        errorForzado={errores.telefono} />
        <Campo id="password"           label="CONTRASEÑA"           valor={form.password}           onChange={set('password')}           placeholder="Mín. 8 car."             requerido errorForzado={errores.password}           tipo="password" />

        <Campo id="confirmar" label="CONFIRMAR CONTRASEÑA" valor={form.confirmar} onChange={set('confirmar')} placeholder="Repite la contraseña" requerido tipo="password"
          errorForzado={form.confirmar && form.password !== form.confirmar ? 'Las contraseñas no coinciden' : errores.confirmar} />

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
          {loading ? <><Spinner />REGISTRANDO...</> : 'CREAR CUENTA'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PANTALLA LOGIN
═══════════════════════════════════════════════════ */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [correo,   setCorreo]   = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!correo.trim())                                             return setError('El correo es obligatorio');
    if (!correo.includes('@'))                                     return setError('El correo debe contener @');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim()))     return setError('Formato de correo inválido (ej: nombre@dominio.com)');
    if (!password)                                                  return setError('La contraseña es obligatoria');
    if (password.length < 8)                                       return setError('La contraseña debe tener al menos 8 caracteres');

    setLoading(true);
    try {
      await login(correo.trim().toLowerCase(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.offline
        ? 'Sin conexión al servidor. Verifica que el backend esté corriendo.'
        : err.error || 'Credenciales incorrectas');
    }
    setLoading(false);
  };

  const listo = correo && password && !loading;

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
          <Campo id="correo_electronico" label="CORREO ELECTRÓNICO" tipo="email"    valor={correo}   onChange={setCorreo}   placeholder="tu@correo.com" requerido />
          <Campo id="password"           label="CONTRASEÑA"          tipo="password" valor={password} onChange={setPassword} placeholder="••••••••"      requerido />

          {error && (
            <div style={{ padding: '8px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff4433" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)' }}>{error}</span>
            </div>
          )}

          <button onClick={handleLogin} disabled={!listo}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: 13, borderRadius: 10,
              background: listo ? 'var(--accent)' : 'var(--bg-surface)',
              border: `1px solid ${listo ? '#ff5040' : 'var(--border)'}`,
              cursor: listo ? 'pointer' : 'not-allowed',
              fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: '0.15em',
              color: listo ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all .25s', marginBottom: 12,
              boxShadow: listo ? '0 0 20px var(--accent-glow)' : 'none',
            }}>
            {loading ? <><Spinner />VERIFICANDO...</> : 'INICIAR SESIÓN'}
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
          MOTOGUARD v2.4.1 · Piura, Perú
        </p>
      </div>

      {mostrarRegistro && <ModalRegistro onClose={() => setMostrarRegistro(false)} />}
    </div>
  );
}