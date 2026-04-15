import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const QUICK = [
  { label: 'Admin',   username: 'admin',   password: '12345',  role: 'admin', color: '#e03030' },
  { label: 'Usuario', username: 'usuario', password: '123456', role: 'user',  color: '#00d4d4' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = (u = username, p = password) => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const result = login(u, p);
      if (result.ok) {
        navigate(result.role === 'admin' ? '/dashboard' : '/dashboard');
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 800);
  };

  const fillQuick = (q) => {
    setUsername(q.username);
    setPassword(q.password);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid bg */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px),
                          linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
        backgroundSize: '48px 48px', opacity: 0.4,
      }}/>
      {/* Top glow */}
      <div style={{
        position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 300, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%)',
      }}/>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 360, padding: '0 24px' }} className="anim-fade">

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <svg viewBox="0 0 64 64" width="64" height="64">
            <polygon points="32,4 60,18 60,46 32,60 4,46 4,18"
              fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5"/>
            <polygon points="32,12 52,22 52,42 32,52 12,42 12,22"
              fill="none" stroke="var(--accent)" strokeWidth="0.5" opacity="0.4"/>
            {/* moto */}
            <circle cx="20" cy="42" r="7" fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
            <circle cx="44" cy="42" r="7" fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
            <path d="M27 42 L32 28 L40 28 L44 36" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M27 42 L30 42 L32 28" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M30 42 L38 42" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 38, letterSpacing: '0.25em', color: 'var(--text-primary)', lineHeight: 1 }}>
              MOTOGUARD
            </h1>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.18em', marginTop: 4 }}>
              SISTEMA DE SEGURIDAD VEHICULAR
            </p>
          </div>
        </div>

        {/* Quick access pills */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.14em', marginBottom: 8, textAlign: 'center' }}>
            ACCESO RÁPIDO — DEMO
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {QUICK.map(q => (
              <button key={q.label} onClick={() => fillQuick(q)} style={{
                flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                background: 'var(--bg-card)', border: `1px solid var(--border)`,
                transition: 'all .2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = q.color + '60'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: q.color, letterSpacing: '0.1em' }}>
                  {q.label.toUpperCase()}
                </span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>
                  {q.username} / {q.password}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="mg-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 6 }}>
              USUARIO
            </p>
            <input
              value={username} onChange={e => setUsername(e.target.value)}
              placeholder="admin · usuario"
              style={{
                width: '100%', padding: '11px 14px',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: 9, color: 'var(--text-primary)',
                fontFamily: 'JetBrains Mono', fontSize: 13, outline: 'none', transition: 'border .2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 6 }}>
              CONTRASEÑA
            </p>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••"
              style={{
                width: '100%', padding: '11px 14px',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: 9, color: 'var(--text-primary)',
                fontFamily: 'JetBrains Mono', fontSize: 13, outline: 'none', transition: 'border .2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{
              padding: '8px 12px', borderRadius: 8, marginBottom: 14,
              background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
            }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)' }}>{error}</span>
            </div>
          )}

          <button
            onClick={() => handleLogin()}
            disabled={loading || !username || !password}
            style={{
              width: '100%', padding: '13px',
              background: loading || (!username || !password) ? 'var(--bg-surface)' : 'var(--accent)',
              border: `1px solid ${loading ? 'var(--border)' : !username || !password ? 'var(--border)' : '#ff5040'}`,
              borderRadius: 10, cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
              fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: '0.15em',
              color: loading || !username || !password ? 'var(--text-muted)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all .25s',
              boxShadow: !loading && username && password ? '0 0 20px var(--accent-glow)' : 'none',
            }}
          >
            {loading
              ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>VERIFICANDO...</>
              : 'INICIAR SESIÓN'
            }
          </button>
        </div>

        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', textAlign: 'center', marginTop: 16, letterSpacing: '0.1em' }}>
          MOTOGUARD v2.4.1 · AES-256 · Piura, Perú
        </p>
      </div>
    </div>
  );
}