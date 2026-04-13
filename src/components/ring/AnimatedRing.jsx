import React, { useState } from 'react';

const statusConfig = {
  armed: {
    color: '#e03030',
    glow: 'rgba(224,48,48,0.4)',
    glowSoft: 'rgba(224,48,48,0.1)',
    label: 'ARMADO',
    sublabel: 'Sistema activo',
    dasharray: '220 40',
  },
  disarmed: {
    color: '#6b6b6b',
    glow: 'rgba(107,107,107,0.3)',
    glowSoft: 'rgba(107,107,107,0.08)',
    label: 'DESARMADO',
    sublabel: 'Sistema inactivo',
    dasharray: '120 140',
  },
  valet: {
    color: '#00c8c8',
    glow: 'rgba(0,200,200,0.4)',
    glowSoft: 'rgba(0,200,200,0.1)',
    label: 'MODO VALET',
    sublabel: 'Velocidad limitada',
    dasharray: '180 80',
  },
  emergency: {
    color: '#ff4444',
    glow: 'rgba(255,68,68,0.6)',
    glowSoft: 'rgba(255,68,68,0.15)',
    label: '¡EMERGENCIA!',
    sublabel: 'Ayuda en camino',
    dasharray: '260 0',
  },
};

export default function AnimatedRing({ status = 'armed', size = 220, onClick }) {
  const cfg = statusConfig[status] || statusConfig.armed;
  const r1 = size * 0.42;
  const r2 = size * 0.35;
  const r3 = size * 0.28;
  const cx = size / 2;

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer select-none"
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {/* Outer glow ping */}
      <div
        className="absolute rounded-full ping-anim pointer-events-none"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          background: cfg.glowSoft,
          border: `1px solid ${cfg.color}22`,
        }}
      />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute">
        {/* Background circle */}
        <circle
          cx={cx} cy={cx} r={r1}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
        {/* Outer rotating ring */}
        <circle
          cx={cx} cy={cx} r={r1}
          fill="none"
          stroke={cfg.color}
          strokeWidth="1.5"
          strokeDasharray="8 6"
          opacity="0.3"
          className="ring-outer"
          style={{ transformOrigin: `${cx}px ${cx}px` }}
        />
        {/* Main progress arc */}
        <circle
          cx={cx} cy={cx} r={r1}
          fill="none"
          stroke={cfg.color}
          strokeWidth="3"
          strokeDasharray={cfg.dasharray}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{
            filter: `drop-shadow(0 0 8px ${cfg.color})`,
            transition: 'stroke-dasharray 0.8s ease, stroke 0.5s ease',
          }}
        />
        {/* Middle ring */}
        <circle
          cx={cx} cy={cx} r={r2}
          fill="none"
          stroke="#1f1f1f"
          strokeWidth="1"
        />
        <circle
          cx={cx} cy={cx} r={r2}
          fill="none"
          stroke={cfg.color}
          strokeWidth="0.5"
          strokeDasharray="4 20"
          opacity="0.4"
          className="ring-inner"
          style={{ transformOrigin: `${cx}px ${cx}px` }}
        />
        {/* Inner fill */}
        <circle
          cx={cx} cy={cx} r={r3}
          fill="#111111"
          stroke={cfg.color}
          strokeWidth="0.5"
          strokeOpacity="0.2"
        />
      </svg>

      {/* Center icon - motorcycle SVG */}
      <div className="absolute flex flex-col items-center justify-center z-10" style={{ width: r3 * 1.8, height: r3 * 1.8 }}>
        <svg viewBox="0 0 64 40" width={r3 * 1.2} height={r3 * 0.75} fill="none">
          {/* Simple motorcycle silhouette */}
          <ellipse cx="12" cy="32" rx="10" ry="10" stroke={cfg.color} strokeWidth="2" fill="none" />
          <ellipse cx="52" cy="32" rx="10" ry="10" stroke={cfg.color} strokeWidth="2" fill="none" />
          <ellipse cx="12" cy="32" rx="4" ry="4" fill={cfg.color} opacity="0.3" />
          <ellipse cx="52" cy="32" rx="4" ry="4" fill={cfg.color} opacity="0.3" />
          <path d="M22 32 L36 16 L48 16 L52 22" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M22 32 L30 32 L36 16" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M30 32 L42 32" stroke={cfg.color} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M48 16 L54 14 L56 18 L50 20" stroke={cfg.color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
        <span
          className="font-mono text-center mt-1 font-light tracking-widest"
          style={{ fontSize: size * 0.058, color: cfg.color, letterSpacing: '0.15em' }}
        >
          {cfg.label}
        </span>
        <span
          className="font-sans text-center"
          style={{ fontSize: size * 0.038, color: '#6b6b6b', letterSpacing: '0.05em' }}
        >
          {cfg.sublabel}
        </span>
      </div>
    </div>
  );
}