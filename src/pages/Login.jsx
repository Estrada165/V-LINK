import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate('/dashboard'), 1200);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#0a0a0a' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(224,48,48,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(224,48,48,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 600,
          height: 300,
          background: 'radial-gradient(ellipse at center, rgba(224,48,48,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <polygon points="40,4 74,22 74,58 40,76 6,58 6,22" fill="rgba(224,48,48,0.08)" stroke="#e03030" strokeWidth="1" />
              <polygon points="40,14 64,27 64,53 40,66 16,53 16,27" fill="none" stroke="#e03030" strokeWidth="0.5" strokeOpacity="0.4" />
              {/* Motorcycle */}
              <ellipse cx="26" cy="52" rx="8" ry="8" stroke="#e03030" strokeWidth="1.5" fill="none" />
              <ellipse cx="54" cy="52" rx="8" ry="8" stroke="#e03030" strokeWidth="1.5" fill="none" />
              <path d="M34 52 L42 36 L52 36 L54 44" stroke="#e03030" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M34 52 L38 52 L42 36" stroke="#e03030" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M38 52 L46 52" stroke="#e03030" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col items-center">
            <h1
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '36px',
                letterSpacing: '0.25em',
                color: '#f0f0f0',
                lineHeight: 1,
              }}
            >
              MOTOGUARD
            </h1>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '10px',
                color: '#6b6b6b',
                letterSpacing: '0.2em',
              }}
            >
              SISTEMA DE SEGURIDAD VEHICULAR
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
          <div>
            <label
              style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', letterSpacing: '0.15em', display: 'block', marginBottom: 6 }}
            >
              CORREO ELECTRÓNICO
            </label>
            <input
              type="email"
              defaultValue="admin@motoguard.io"
              className="w-full rounded-lg px-4 py-3 outline-none transition-all duration-200"
              style={{
                background: '#161616',
                border: '1px solid #1f1f1f',
                color: '#f0f0f0',
                fontSize: '14px',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = '#e0303060'}
              onBlur={e => e.target.style.borderColor = '#1f1f1f'}
            />
          </div>
          <div>
            <label
              style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', letterSpacing: '0.15em', display: 'block', marginBottom: 6 }}
            >
              CONTRASEÑA
            </label>
            <input
              type="password"
              defaultValue="••••••••"
              className="w-full rounded-lg px-4 py-3 outline-none"
              style={{
                background: '#161616',
                border: '1px solid #1f1f1f',
                color: '#f0f0f0',
                fontSize: '14px',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = '#e0303060'}
              onBlur={e => e.target.style.borderColor = '#1f1f1f'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-4 mt-2 transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              background: loading ? '#2a0a0a' : '#e03030',
              color: '#fff',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              letterSpacing: '0.15em',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 24px rgba(224,48,48,0.3)',
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                VERIFICANDO...
              </>
            ) : 'INICIAR SESIÓN'}
          </button>
        </form>

        {/* Footer */}
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#2a2a2a', letterSpacing: '0.1em' }}>
            MOTOGUARD v2.4.1 · SISTEMA CIFRADO AES-256
          </span>
        </div>
      </div>
    </div>
  );
}