import React from 'react';

const modes = [
  {
    key: 'armed',
    label: 'ARMADO',
    sublabel: 'Presiona para inmovilizar',
    color: '#e03030',
    bg: 'rgba(224,48,48,0.12)',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    key: 'valet',
    label: 'MODO VALET',
    sublabel: 'Velocidad limitada',
    color: '#00c8c8',
    bg: 'rgba(0,200,200,0.1)',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    key: 'emergency',
    label: 'EMERGENCIA',
    sublabel: 'Llama a servicios',
    color: '#ff4444',
    bg: 'rgba(255,68,68,0.15)',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export default function SecurityModes({ activeMode, onModeChange }) {
  return (
    <div className="flex flex-col gap-3">
      {modes.map(mode => {
        const isActive = activeMode === mode.key;
        return (
          <button
            key={mode.key}
            onClick={() => onModeChange(mode.key === activeMode ? 'disarmed' : mode.key)}
            className="flex items-center gap-4 rounded-xl text-left transition-all duration-300"
            style={{
              background: isActive ? mode.bg : '#161616',
              border: `1px solid ${isActive ? mode.color + '40' : '#1f1f1f'}`,
              padding: '16px 20px',
              cursor: 'pointer',
              boxShadow: isActive ? `0 0 20px ${mode.color}20` : 'none',
              transform: isActive ? 'scale(1.01)' : 'scale(1)',
            }}
          >
            <div style={{ color: isActive ? mode.color : '#6b6b6b', transition: 'color 0.3s' }}>
              {mode.icon}
            </div>
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  letterSpacing: '0.12em',
                  color: isActive ? mode.color : '#a0a0a0',
                  transition: 'color 0.3s',
                }}
              >
                {mode.label}
              </span>
              <span style={{ fontSize: '11px', color: '#6b6b6b', marginTop: 2 }}>
                {mode.sublabel}
              </span>
            </div>
            {isActive && (
              <div className="ml-auto">
                <div
                  className="rounded-full"
                  style={{ width: 8, height: 8, background: mode.color, boxShadow: `0 0 8px ${mode.color}` }}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}