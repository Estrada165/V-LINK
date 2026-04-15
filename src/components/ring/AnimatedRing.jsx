import React from 'react';

const CFG = {
  armed:     { hex:'#e03030', label:'ARMADO',      sub:'Sistema activo',    dash:'230 30',  dOuter:'8 5'  },
  disarmed:  { hex:'#686868', label:'DESARMADO',   sub:'Sin protección',    dash:'60 200',  dOuter:'3 11' },
  valet:     { hex:'#00d4d4', label:'MODO VALET',  sub:'Velocidad limitada',dash:'180 80',  dOuter:'6 6'  },
  emergency: { hex:'#ff2222', label:'EMERGENCIA',  sub:'Ayuda en camino',   dash:'260 0',   dOuter:'2 2'  },
};

export default function AnimatedRing({ status = 'armed', size = 220, onClick }) {
  const cfg = CFG[status] || CFG.armed;
  const cx  = size / 2;
  const R1  = cx * 0.87;   // outer arc
  const R2  = cx * 0.74;   // tick ring
  const R3  = cx * 0.59;   // glow fill
  const R4  = cx * 0.47;   // dark center
  const sc  = R4 / 58;     // moto scale factor — viewport 116×80 fits in 2*R4

  return (
    <div onClick={onClick} style={{ width:size, height:size, position:'relative', cursor: onClick?'pointer':'default', flexShrink:0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">

        {/* Ripple */}
        <circle cx={cx} cy={cx} r={R1*.93} fill="none" stroke={cfg.hex} strokeWidth="0.8" opacity="0.15" className="anim-ping"/>

        {/* Outer dashed orbit */}
        <circle cx={cx} cy={cx} r={R1} fill="none" stroke={cfg.hex} strokeWidth="0.7"
          strokeDasharray={cfg.dOuter} opacity="0.22" className="anim-cw"/>

        {/* Main progress arc */}
        <circle cx={cx} cy={cx} r={R1} fill="none" stroke={cfg.hex} strokeWidth="2.8"
          strokeDasharray={cfg.dash} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{filter:`drop-shadow(0 0 5px ${cfg.hex})`, transition:'stroke-dasharray .9s ease,stroke .5s'}}/>

        {/* Tick ring */}
        <circle cx={cx} cy={cx} r={R2} fill="none" stroke={cfg.hex}
          strokeWidth="0.5" strokeDasharray="1.5 9" opacity="0.30" className="anim-ccw"/>

        {/* Glow fill */}
        <circle cx={cx} cy={cx} r={R3} fill={cfg.hex} opacity="0.07" style={{transition:'fill .5s'}}/>
        <circle cx={cx} cy={cx} r={R3} fill="none" stroke={cfg.hex} strokeWidth="0.5" opacity="0.25"/>

        {/* Dark center */}
        <circle cx={cx} cy={cx} r={R4} fill="var(--bg-card)" style={{transition:'fill .3s'}}/>

        {/* ── Motorcycle ── centred in inner circle */}
        {/*  Design viewport: 0 0 116 80  */}
        <g transform={`translate(${cx - 58*sc}, ${cx - 44*sc}) scale(${sc})`}>

          {/* Rear wheel */}
          <circle cx="20" cy="64" r="15" fill="none" stroke={cfg.hex} strokeWidth="2.2"/>
          <circle cx="20" cy="64" r="9"  fill="none" stroke={cfg.hex} strokeWidth="0.8" opacity="0.35"/>
          <circle cx="20" cy="64" r="3"  fill={cfg.hex} opacity="0.60"/>
          {[0,60,120,180,240,300].map(a=>{
            const rad=a*Math.PI/180;
            const x1=20+9*Math.cos(rad), y1=64+9*Math.sin(rad);
            const x2=20+14*Math.cos(rad), y2=64+14*Math.sin(rad);
            return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={cfg.hex} strokeWidth="0.8" opacity="0.35"/>;
          })}

          {/* Front wheel */}
          <circle cx="96" cy="64" r="15" fill="none" stroke={cfg.hex} strokeWidth="2.2"/>
          <circle cx="96" cy="64" r="9"  fill="none" stroke={cfg.hex} strokeWidth="0.8" opacity="0.35"/>
          <circle cx="96" cy="64" r="3"  fill={cfg.hex} opacity="0.60"/>
          {[0,60,120,180,240,300].map(a=>{
            const rad=a*Math.PI/180;
            const x1=96+9*Math.cos(rad), y1=64+9*Math.sin(rad);
            const x2=96+14*Math.cos(rad), y2=64+14*Math.sin(rad);
            return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={cfg.hex} strokeWidth="0.8" opacity="0.35"/>;
          })}

          {/* Chain / swingarm */}
          <path d="M20 58 Q36 52 52 55" fill="none" stroke={cfg.hex} strokeWidth="1.8" strokeLinecap="round"/>

          {/* Main frame */}
          <path d="M52 55 L60 28 L76 24 L88 50" fill="none" stroke={cfg.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Down tube */}
          <path d="M60 28 L48 54" fill="none" stroke={cfg.hex} strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
          {/* Seat rail */}
          <path d="M52 55 L68 49 L88 50" fill="none" stroke={cfg.hex} strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>

          {/* Engine block */}
          <rect x="46" y="50" width="24" height="15" rx="3" fill={cfg.hex} opacity="0.10" stroke={cfg.hex} strokeWidth="0.8"/>
          {/* Cylinder */}
          <rect x="54" y="40" width="10" height="12" rx="2" fill={cfg.hex} opacity="0.08" stroke={cfg.hex} strokeWidth="0.7"/>

          {/* Fork legs */}
          <path d="M88 50 L90 28 L96 49" fill="none" stroke={cfg.hex} strokeWidth="1.8" strokeLinecap="round"/>
          {/* Triple tree */}
          <path d="M86 30 Q90 22 96 20" fill="none" stroke={cfg.hex} strokeWidth="1.6" strokeLinecap="round"/>

          {/* Handlebars */}
          <line x1="83" y1="24" x2="100" y2="18" stroke={cfg.hex} strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="100" cy="18" r="2.5" fill={cfg.hex} opacity="0.55"/>
          <circle cx="82"  cy="24" r="2"   fill={cfg.hex} opacity="0.35"/>

          {/* Tank */}
          <path d="M60 28 Q68 18 78 20 L80 32 Q70 35 60 32 Z" fill={cfg.hex} opacity="0.10" stroke={cfg.hex} strokeWidth="0.7"/>

          {/* Seat */}
          <path d="M52 45 Q62 39 74 39 Q79 39 81 44" fill="none" stroke={cfg.hex} strokeWidth="1.8" strokeLinecap="round"/>

          {/* Fairing / headlight */}
          <circle cx="98" cy="24" r="5"   fill="none" stroke={cfg.hex} strokeWidth="1.1" opacity="0.7"/>
          <circle cx="98" cy="24" r="2.5" fill={cfg.hex} opacity="0.28"/>

          {/* Exhaust */}
          <path d="M48 62 Q40 68 34 66 Q26 64 22 70" fill="none" stroke={cfg.hex} strokeWidth="1.4" strokeLinecap="round" opacity="0.45"/>

          {/* Rider silhouette */}
          <ellipse cx="64" cy="26" rx="7" ry="9" fill={cfg.hex} opacity="0.09" stroke={cfg.hex} strokeWidth="0.7"/>
          <ellipse cx="64" cy="16" rx="5" ry="5" fill={cfg.hex} opacity="0.09" stroke={cfg.hex} strokeWidth="0.7"/>
        </g>

        {/* Status label */}
        <text x={cx} y={cx + R4 + 18} textAnchor="middle"
          style={{fontFamily:'JetBrains Mono,monospace',fontSize:size*.052,fill:cfg.hex,letterSpacing:'0.15em',transition:'fill .5s'}}>
          {cfg.label}
        </text>
        <text x={cx} y={cx + R4 + 32} textAnchor="middle"
          style={{fontFamily:'DM Sans,sans-serif',fontSize:size*.036,fill:'var(--text-muted)'}}>
          {cfg.sub}
        </text>
      </svg>
    </div>
  );
}