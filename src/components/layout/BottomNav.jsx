import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  {
    path: '/dashboard',
    label: 'DASHBOARD',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    path: '/map',
    label: 'MAPAS',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="3 7 9 4 15 7 21 4 21 17 15 20 9 17 3 20" />
        <line x1="9" y1="4" x2="9" y2="17" />
        <line x1="15" y1="7" x2="15" y2="20" />
      </svg>
    ),
  },
  {
    path: '/routes',
    label: 'RUTAS',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 12h18M3 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    path: '/settings',
    label: 'AJUSTES',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ background: '#0e0e0e', borderTop: '1px solid #1a1a1a' }}>
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {navItems.map(item => {
          const active = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-all duration-200"
              style={{
                color: active ? '#f0f0f0' : '#6b6b6b',
                borderTop: active ? '1px solid #e03030' : '1px solid transparent',
                background: 'none',
                border: 'none',
                borderTop: active ? '1px solid #e03030' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              {item.icon}
              <span style={{ fontSize: '9px', letterSpacing: '0.12em', fontFamily: 'JetBrains Mono, monospace', fontWeight: 400 }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}