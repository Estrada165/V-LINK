import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: 24, flexDirection: 'column', gap: 0,
    }}>
      {/* Logo */}
      <svg viewBox="0 0 64 64" width="52" height="52" style={{ marginBottom: 24, opacity: 0.4 }}>
        <polygon points="32,4 60,18 60,46 32,60 4,46 4,18" fill="rgba(224,48,48,0.12)" stroke="#e03030" strokeWidth="1.5"/>
        <polygon points="32,12 52,22 52,42 32,52 12,42 12,22" fill="none" stroke="#e03030" strokeWidth="0.5" opacity="0.4"/>
        <circle cx="20" cy="42" r="7" fill="none" stroke="#e03030" strokeWidth="1.5"/>
        <circle cx="44" cy="42" r="7" fill="none" stroke="#e03030" strokeWidth="1.5"/>
        <path d="M27 42L32 28L40 28L44 36" fill="none" stroke="#e03030" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M27 42L30 42L32 28" fill="none" stroke="#e03030" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M30 42L38 42" stroke="#e03030" strokeWidth="1" strokeLinecap="round"/>
      </svg>

      {/* Código */}
      <p style={{
        fontFamily: 'Bebas Neue', fontSize: 96, color: 'var(--accent)',
        letterSpacing: '0.08em', lineHeight: 1, marginBottom: 8,
        textShadow: '0 0 40px rgba(224,48,48,0.3)',
      }}>404</p>

      <h1 style={{
        fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text-primary)',
        letterSpacing: '0.2em', marginBottom: 10,
      }}>RUTA NO ENCONTRADA</h1>

      <p style={{
        fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)',
        marginBottom: 6, letterSpacing: '0.06em',
      }}>
        La ruta <span style={{ color: 'var(--accent)' }}>{location.pathname}</span> no existe en el sistema
      </p>

      <p style={{
        fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-faint)',
        marginBottom: 32, letterSpacing: '0.04em',
      }}>
        MOTOGUARD v2.4.1 · Sistema de Seguridad Vehicular
      </p>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 20px', borderRadius: 10, cursor: 'pointer',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em',
          color: 'var(--text-muted)', transition: 'all .2s',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          VOLVER ATRÁS
        </button>

        <button onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 20px', borderRadius: 10, cursor: 'pointer',
          background: 'var(--accent)', border: '1px solid #ff5040',
          fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em',
          color: '#fff', transition: 'all .2s',
          boxShadow: '0 0 16px rgba(224,48,48,0.3)',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          IR AL INICIO
        </button>
      </div>

      {/* Línea decorativa */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
        opacity: 0.4,
      }} />
    </div>
  );
}