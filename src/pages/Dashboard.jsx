import React, { useState } from 'react';
import AnimatedRing from '../components/ring/AnimatedRing';
import ThemeToggle from '../components/ui/ThemeToggle';
import { mockVehicle, mockAlerts, mockTelemetry, mockRoutes } from '../mocks/mockData';

/* ─── Atoms ─────────────────────────────────────────────────── */
const Card = ({ children, style={}, onClick }) => (
  <div className={`mg-card${onClick?' mg-card-hover':''}`}
    onClick={onClick} style={{padding:'16px 18px',...style,cursor:onClick?'pointer':'default'}}>
    {children}
  </div>
);

const Label = ({ children, action, onAction }) => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
    <span style={{fontFamily:'JetBrains Mono',fontSize:9,letterSpacing:'0.14em',color:'var(--text-muted)'}}>{children}</span>
    {action && <button onClick={onAction} style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--accent)',
      background:'none',border:'none',cursor:'pointer',letterSpacing:'0.1em'}}>{action}</button>}
  </div>
);

const Dot = ({ color='var(--green)', pulse=false, size=7 }) => (
  <div className={pulse?'anim-blink':''} style={{width:size,height:size,borderRadius:'50%',
    background:color,boxShadow:`0 0 6px ${color}`,flexShrink:0}}/>
);

const Pill = ({ label, color, bg, border }) => (
  <span style={{fontFamily:'JetBrains Mono',fontSize:8,letterSpacing:'0.1em',
    color,background:bg,border:`1px solid ${border}`,padding:'2px 8px',borderRadius:4}}>
    {label}
  </span>
);

/* ─── Sparkline ─────────────────────────────────────────────── */
const Sparkline = ({ data=[] }) => {
  const vals=data.map(d=>d.value);
  const max=Math.max(...vals)||1, min=Math.min(...vals)||0;
  const W=200,H=34;
  const pts=data.map((d,i)=>`${(i/(data.length-1))*W},${H-((d.value-min)/(max-min||1))*H}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{overflow:'visible'}}>
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.75"/>
    </svg>
  );
};

/* ─── Stat box ──────────────────────────────────────────────── */
const Stat = ({ label, value, sub, color='var(--text-primary)' }) => (
  <Card>
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:4}}>
      <span style={{fontFamily:'JetBrains Mono',fontSize:8,letterSpacing:'0.12em',color:'var(--text-muted)'}}>{label}</span>
      <div style={{width:2,height:20,background:color,borderRadius:1,opacity:.5}}/>
    </div>
    <span style={{fontFamily:'JetBrains Mono',fontSize:22,fontWeight:300,color,letterSpacing:'-0.02em'}}>{value}</span>
    {sub && <p style={{fontFamily:'JetBrains Mono',fontSize:8,color:'var(--text-faint)',marginTop:3,letterSpacing:'0.08em'}}>{sub}</p>}
  </Card>
);

/* ─── Alert row ─────────────────────────────────────────────── */
const sev = { high:['var(--accent)','var(--accent-soft)','var(--accent-border)'],
               medium:['var(--amber)','var(--amber-soft)','var(--amber-border)'],
               low:['var(--green)','var(--green-soft)','var(--green-border)'] };

const AlertRow = ({ alert, last }) => {
  const [c,bg,b] = sev[alert.severity]||sev.low;
  return (
    <div style={{display:'flex',alignItems:'center',gap:12,padding:'11px 0',
      borderBottom:last?'none':'1px solid var(--border)'}}>
      <Dot color={c} pulse={alert.status==='pendiente'}/>
      <div style={{flex:1}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
          <span style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>{alert.type}</span>
          <Pill label={alert.status.toUpperCase()} color={c} bg={bg} border={b}/>
        </div>
        <span style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--text-muted)'}}>
          {alert.time}{alert.distance?` · ${alert.distance}`:''}
        </span>
      </div>
    </div>
  );
};

/* ─── Mode buttons ──────────────────────────────────────────── */
const MODES = {
  armed:    { label:'ARMADO',      color:'var(--accent)', Icon:()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
  disarmed: { label:'DESARMADO',   color:'var(--text-muted)', Icon:()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> },
  valet:    { label:'MODO VALET',  color:'var(--cyan)', Icon:()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l3 3"/></svg> },
  emergency:{ label:'EMERGENCIA',  color:'#ff2222', Icon:()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
};

const ModeBtn = ({ mKey, active, onClick }) => {
  const m = MODES[mKey];
  return (
    <button onClick={()=>onClick(mKey)} style={{
      display:'flex',alignItems:'center',gap:10,padding:'11px 14px',
      background:active?'var(--accent-soft)':'var(--bg-surface)',
      border:`1px solid ${active?'var(--accent-border)':'var(--border)'}`,
      borderRadius:10,cursor:'pointer',transition:'all .22s',
      boxShadow:active?`0 0 14px var(--accent-soft)`:'none',
    }}>
      <span style={{color:active?m.color:'var(--text-muted)',transition:'color .22s'}}><m.Icon/></span>
      <span style={{fontFamily:'JetBrains Mono',fontSize:10,letterSpacing:'0.1em',
        color:active?m.color:'var(--text-muted)',transition:'color .22s'}}>{m.label}</span>
      {active && <div style={{marginLeft:'auto',width:5,height:5,borderRadius:'50%',
        background:m.color,boxShadow:`0 0 5px ${m.color}`}}/>}
    </button>
  );
};

/* ─── Dashboard ─────────────────────────────────────────────── */
export default function Dashboard() {
  const [mode, setMode] = useState('armed');
  const pending = mockAlerts.filter(a=>a.status==='pendiente').length;
  const toggle = k => setMode(k===mode?'disarmed':k);

  return (
    <div style={{padding:'24px 28px'}} className="anim-fade">

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',
        flexWrap:'wrap',gap:12,marginBottom:22}}>
        <div>
          <h1 className="display" style={{fontSize:30,color:'var(--text-primary)',lineHeight:1}}>
            {mockVehicle.name}
          </h1>
          <span style={{fontFamily:'JetBrains Mono',fontSize:10,color:'var(--text-muted)',letterSpacing:'0.07em'}}>
            {mockVehicle.plate} · {mockVehicle.location.address}
          </span>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',
            background:'var(--green-soft)',border:'1px solid var(--green-border)',borderRadius:8}}>
            <Dot pulse/>
            <span style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--green)',letterSpacing:'0.1em'}}>CONECTADO</span>
          </div>
          <ThemeToggle compact/>
        </div>
      </div>

      {/* Stats row — wraps on narrow screens */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:20}}>
        <Stat label="LATENCIA"        value={mockTelemetry.latency}          sub="PRIMERA RESP."     color="var(--cyan)"/>
        <Stat label="ALERTAS ACTIVAS" value={pending}                         sub="REQUIEREN ATENCIÓN" color={pending>0?'var(--accent)':'var(--green)'}/>
        <Stat label="SLA UPTIME"      value={mockTelemetry.slaPerformance}   sub="EN CUMPLIMIENTO"   color="var(--green)"/>
        <Stat label="DISPOSITIVOS"    value={mockTelemetry.activeDevices.toLocaleString()} sub="ACTIVOS GLOBAL"/>
      </div>

      {/* Main grid — 3 cols on wide, 1 col on mobile */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16,alignItems:'start'}}>

        {/* LEFT: ring + battery + chart */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
            <AnimatedRing status={mode} size={210}/>
            <div style={{width:'100%'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontFamily:'JetBrains Mono',fontSize:8,letterSpacing:'0.12em',color:'var(--text-muted)'}}>BATERÍA ANILLO</span>
                <span style={{fontFamily:'JetBrains Mono',fontSize:11,color:'var(--green)'}}>{mockVehicle.battery}%</span>
              </div>
              <div style={{height:3,borderRadius:2,background:'var(--border)'}}>
                <div style={{height:'100%',width:`${mockVehicle.battery}%`,borderRadius:2,
                  background:'var(--green)',boxShadow:'0 0 5px var(--green)',transition:'width .7s'}}/>
              </div>
            </div>
          </Card>

          <Card>
            <Label>TELEMETRÍA GLOBAL</Label>
            <Sparkline data={mockTelemetry.chartData}/>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
              <span style={{fontFamily:'JetBrains Mono',fontSize:8,color:'var(--text-faint)'}}>00:00</span>
              <span style={{fontFamily:'JetBrains Mono',fontSize:8,color:'var(--text-faint)'}}>24:00</span>
            </div>
          </Card>

          {/* Bottom mini stats */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[
              {label:'SLA',      value:mockTelemetry.slaPerformance, color:'var(--green)'},
              {label:'DATA',     value:mockTelemetry.dataTransfer,   color:'var(--cyan)'},
              {label:'SESIONES', value:mockTelemetry.activeSessions, color:'var(--text-primary)'},
              {label:'UPTIME',   value:mockTelemetry.uptime,         color:'var(--amber)'},
            ].map(s=>(
              <Card key={s.label} style={{padding:'12px 14px'}}>
                <span style={{fontFamily:'JetBrains Mono',fontSize:8,letterSpacing:'0.1em',color:'var(--text-muted)'}}>{s.label}</span>
                <p style={{fontFamily:'JetBrains Mono',fontSize:15,fontWeight:300,color:s.color,marginTop:4}}>{s.value}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CENTER: modes + alerts */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card>
            <Label>MODOS DE SEGURIDAD</Label>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {Object.keys(MODES).map(k=><ModeBtn key={k} mKey={k} active={mode===k} onClick={toggle}/>)}
            </div>
          </Card>

          <Card>
            <Label action="VER TODO →">ALERTAS RECIENTES</Label>
            {mockAlerts.map((a,i)=><AlertRow key={a.id} alert={a} last={i===mockAlerts.length-1}/>)}
          </Card>
        </div>

        {/* RIGHT: routes + users */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card>
            <Label>RUTAS RECIENTES</Label>
            {mockRoutes.map((r,i)=>(
              <div key={r.id} style={{padding:'10px 0',borderBottom:i<mockRoutes.length-1?'1px solid var(--border)':'none'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <span style={{fontFamily:'JetBrains Mono',fontSize:10,color:'var(--text-secondary)'}}>{r.date}</span>
                  <Pill label={r.status}
                    color={r.status==='COMPLETADO'?'var(--green)':'var(--accent)'}
                    bg={r.status==='COMPLETADO'?'var(--green-soft)':'var(--accent-soft)'}
                    border={r.status==='COMPLETADO'?'var(--green-border)':'var(--accent-border)'}/>
                </div>
                <span style={{fontFamily:'JetBrains Mono',fontSize:14,fontWeight:300,color:'var(--text-primary)'}}>{r.distance}</span>
                <span style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--text-muted)',marginLeft:8}}>{r.duration}</span>
              </div>
            ))}
          </Card>

          <Card>
            <Label>GESTIÓN DE USUARIOS</Label>
            {[
              {name:'Carlos Mendoza',device:'Kawasaki-98881',ok:true},
              {name:'Elena Ríos',    device:'Renault-77126', ok:true},
              {name:'Javier Soler', device:'NUEVO DISP.',   ok:false},
            ].map((u,i,arr)=>(
              <div key={u.name} style={{display:'flex',alignItems:'center',gap:10,
                padding:'10px 0',borderBottom:i<arr.length-1?'1px solid var(--border)':'none'}}>
                <div style={{width:30,height:30,borderRadius:'50%',background:'var(--bg-surface)',
                  border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{fontFamily:'JetBrains Mono',fontSize:11,color:'var(--text-muted)'}}>{u.name[0]}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:12,fontWeight:500,color:'var(--text-primary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{u.name}</p>
                  <p style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--text-muted)',marginTop:1}}>{u.device}</p>
                </div>
                <Dot color={u.ok?'var(--green)':'var(--amber)'} pulse={!u.ok}/>
              </div>
            ))}
            <button style={{marginTop:12,width:'100%',padding:'9px',
              background:'var(--accent-soft)',border:'1px solid var(--accent-border)',
              borderRadius:8,color:'var(--accent)',fontFamily:'JetBrains Mono',
              fontSize:9,letterSpacing:'0.12em',cursor:'pointer',transition:'all .2s'}}>
              + VINCULAR NUEVO DISPOSITIVO
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}