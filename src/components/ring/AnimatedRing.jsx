import React from 'react';

const MODOS = {
  armed:     { hex: '#e03030', label: 'ARMADO',      sub: 'Sistema activo',     dash: '230 30', dOuter: '8 5'  },
  disarmed:  { hex: '#686868', label: 'DESARMADO',   sub: 'Sin protección',     dash: '60 200', dOuter: '3 11' },
  valet:     { hex: '#00d4d4', label: 'MODO VALET',  sub: 'Velocidad limitada', dash: '180 80', dOuter: '6 6'  },
  emergency: { hex: '#ff2222', label: 'EMERGENCIA',  sub: 'Ayuda en camino',    dash: '260 0',  dOuter: '2 2'  },
};

const ANGULOS_RAYOS = [0, 60, 120, 180, 240, 300];

function RayosRueda({ cx, cy, rInterno, rExterno, color }) {
  return ANGULOS_RAYOS.map(angulo => {
    const rad = angulo * Math.PI / 180;
    return (
      <line
        key={angulo}
        x1={cx + rInterno * Math.cos(rad)}
        y1={cy + rInterno * Math.sin(rad)}
        x2={cx + rExterno * Math.cos(rad)}
        y2={cy + rExterno * Math.sin(rad)}
        stroke={color} strokeWidth="0.8" opacity="0.35"
      />
    );
  });
}

function Rueda({ cx, cy, color }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="15" fill="none" stroke={color} strokeWidth="2.2"/>
      <circle cx={cx} cy={cy} r="9"  fill="none" stroke={color} strokeWidth="0.8" opacity="0.35"/>
      <circle cx={cx} cy={cy} r="3"  fill={color} opacity="0.60"/>
      <RayosRueda cx={cx} cy={cy} rInterno={9} rExterno={14} color={color} />
    </>
  );
}

function Moto({ color }) {
  return (
    <g>
      <Rueda cx={20} cy={64} color={color} />
      <Rueda cx={96} cy={64} color={color} />

      <path d="M20 58 Q36 52 52 55" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>

      <path d="M52 55 L60 28 L76 24 L88 50" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M60 28 L48 54" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
      <path d="M52 55 L68 49 L88 50" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>

      <rect x="46" y="50" width="24" height="15" rx="3" fill={color} opacity="0.10" stroke={color} strokeWidth="0.8"/>
      <rect x="54" y="40" width="10" height="12" rx="2" fill={color} opacity="0.08" stroke={color} strokeWidth="0.7"/>

      <path d="M88 50 L90 28 L96 49" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M86 30 Q90 22 96 20" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>

      <line x1="83" y1="24" x2="100" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="100" cy="18" r="2.5" fill={color} opacity="0.55"/>
      <circle cx="82"  cy="24" r="2"   fill={color} opacity="0.35"/>

      <path d="M60 28 Q68 18 78 20 L80 32 Q70 35 60 32 Z" fill={color} opacity="0.10" stroke={color} strokeWidth="0.7"/>
      <path d="M52 45 Q62 39 74 39 Q79 39 81 44" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>

      <circle cx="98" cy="24" r="5"   fill="none" stroke={color} strokeWidth="1.1" opacity="0.7"/>
      <circle cx="98" cy="24" r="2.5" fill={color} opacity="0.28"/>

      <path d="M48 62 Q40 68 34 66 Q26 64 22 70" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.45"/>

      <ellipse cx="64" cy="26" rx="7" ry="9" fill={color} opacity="0.09" stroke={color} strokeWidth="0.7"/>
      <ellipse cx="64" cy="16" rx="5" ry="5" fill={color} opacity="0.09" stroke={color} strokeWidth="0.7"/>
    </g>
  );
}

export default function AnimatedRing({ status = 'armed', size = 220, onClick }) {
  const modo = MODOS[status] || MODOS.armed;
  const cx   = size / 2;
  const R1   = cx * 0.87;
  const R2   = cx * 0.74;
  const R3   = cx * 0.59;
  const R4   = cx * 0.47;
  const sc   = R4 / 58;

  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size, position: 'relative', cursor: onClick ? 'pointer' : 'default', flexShrink: 0 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">

        <circle cx={cx} cy={cx} r={R1 * 0.93} fill="none" stroke={modo.hex} strokeWidth="0.8" opacity="0.15" className="anim-ping"/>

        <circle cx={cx} cy={cx} r={R1} fill="none" stroke={modo.hex} strokeWidth="0.7"
          strokeDasharray={modo.dOuter} opacity="0.22" className="anim-cw"/>

        <circle cx={cx} cy={cx} r={R1} fill="none" stroke={modo.hex} strokeWidth="2.8"
          strokeDasharray={modo.dash} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ filter: `drop-shadow(0 0 5px ${modo.hex})`, transition: 'stroke-dasharray .9s ease, stroke .5s' }}/>

        <circle cx={cx} cy={cx} r={R2} fill="none" stroke={modo.hex}
          strokeWidth="0.5" strokeDasharray="1.5 9" opacity="0.30" className="anim-ccw"/>

        <circle cx={cx} cy={cx} r={R3} fill={modo.hex} opacity="0.07" style={{ transition: 'fill .5s' }}/>
        <circle cx={cx} cy={cx} r={R3} fill="none" stroke={modo.hex} strokeWidth="0.5" opacity="0.25"/>

        <circle cx={cx} cy={cx} r={R4} fill="var(--bg-card)" style={{ transition: 'fill .3s' }}/>

        <g transform={`translate(${cx - 58 * sc}, ${cx - 44 * sc}) scale(${sc})`}>
          <Moto color={modo.hex} />
        </g>

        <text x={cx} y={cx + R4 + 18} textAnchor="middle"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: size * 0.052, fill: modo.hex, letterSpacing: '0.15em', transition: 'fill .5s' }}>
          {modo.label}
        </text>
        <text x={cx} y={cx + R4 + 32} textAnchor="middle"
          style={{ fontFamily: 'DM Sans, sans-serif', fontSize: size * 0.036, fill: 'var(--text-muted)' }}>
          {modo.sub}
        </text>
      </svg>
    </div>
  );
}