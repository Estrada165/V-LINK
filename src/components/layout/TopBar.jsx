import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Panel de Control',
  '/map': 'Mapa Táctico',
  '/routes': 'Historial de Rutas',
  '/settings': 'Ajustes de Hardware',
};

export default function TopBar({ vehicle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'MOTOGUARD';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
      style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1a1a1a' }}
    >
      {/* Logo */}
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="#e03030" strokeWidth="1.5" fill="rgba(224,48,48,0.1)" />
          <path d="M12 22V12M2 7l10 5 10-5" stroke="#e03030" strokeWidth="1" opacity="0.6" />
        </svg>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#f0f0f0', letterSpacing: '0.15em' }}>
          MOTOGUARD
        </span>
      </button>

      {/* Title */}
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#6b6b6b', letterSpacing: '0.1em' }}>
        {title.toUpperCase()}
      </span>

      {/* Right: status + alert */}
      <div className="flex items-center gap-3">
        {vehicle?.connected && (
          <div className="flex items-center gap-1.5">
            <div
              className="rounded-full"
              style={{ width: 6, height: 6, background: '#1db954', boxShadow: '0 0 6px #1db954' }}
            />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', letterSpacing: '0.1em' }}>
              EN LÍNEA
            </span>
          </div>
        )}
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b', position: 'relative' }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span
            className="absolute -top-1 -right-1 rounded-full flex items-center justify-center"
            style={{ width: 14, height: 14, background: '#e03030', fontSize: '8px', fontFamily: 'JetBrains Mono', color: '#fff' }}
          >
            3
          </span>
        </button>
      </div>
    </header>
  );
}