import React, { useState } from 'react';
import AnimatedRing from '../components/ring/AnimatedRing';
import ThemeToggle from '../components/ui/ThemeToggle';
import { mockVehicle } from '../mocks/mockData';

/* ─── Atoms ─────────────────────────────────────────────────── */
const Card = ({ children, style={} }) => (
  <div className="mg-card" style={{padding:'18px 20px',...style}}>{children}</div>
);

const Label = ({ children }) => (
  <p style={{fontFamily:'JetBrains Mono',fontSize:9,letterSpacing:'0.15em',
    color:'var(--text-muted)',marginBottom:13}}>{children}</p>
);

const Divider = () => (
  <div style={{height:1,background:'var(--border)',margin:'14px 0'}}/>
);

const Toggle = ({ value, onChange, color='var(--accent)' }) => (
  <button onClick={()=>onChange(!value)} style={{
    width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',
    background:value?color:'var(--border-mid)',position:'relative',
    transition:'background .28s',flexShrink:0,
    boxShadow:value?`0 0 8px ${color}55`:'none',
  }}>
    <div style={{position:'absolute',top:3,left:value?23:3,width:18,height:18,
      borderRadius:'50%',background:'#fff',transition:'left .25s ease'}}/>
  </button>
);

const Slider = ({ value, onChange, min=0, max=100, unit='' }) => (
  <div style={{display:'flex',alignItems:'center',gap:12}}>
    <input type="range" min={min} max={max} value={value}
      onChange={e=>onChange(Number(e.target.value))}
      style={{flex:1,height:2}}/>
    <span style={{fontFamily:'JetBrains Mono',fontSize:13,color:'var(--text-primary)',
      minWidth:54,textAlign:'right'}}>{value}{unit}</span>
  </div>
);

/* ─── BLE device card ───────────────────────────────────────── */
const BleIcon = ({connected}) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
    stroke={connected?'var(--cyan)':'var(--text-muted)'} strokeWidth="1.5" style={{transition:'stroke .4s',flexShrink:0}}>
    <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
  </svg>
);

/* ─── Settings ──────────────────────────────────────────────── */
export default function Settings() {
  const [ble,     setBle]     = useState(false);
  const [scanning,setScanning]= useState(false);
  const [ringMode,setRingMode]= useState('armed');
  const [alerts,  setAlerts]  = useState(true);
  const [vibr,    setVibr]    = useState(true);
  const [gps,     setGps]     = useState(true);
  const [threshold,setThr]    = useState(10);
  const [proximity,setProx]   = useState(45);
  const [brightness,setBright]= useState(70);
  const [testing, setTesting] = useState(false);

  const connectBle = () => {
    if (ble) { setBle(false); return; }
    setScanning(true);
    setTimeout(()=>{ setScanning(false); setBle(true); }, 2400);
  };
  const testConn = () => { setTesting(true); setTimeout(()=>setTesting(false),1800); };

  const RING_MODES = [
    {key:'armed',    label:'Armado',     hex:'var(--accent)'},
    {key:'disarmed', label:'Desarmado',  hex:'var(--text-muted)'},
    {key:'valet',    label:'Valet',      hex:'var(--cyan)'},
    {key:'emergency',label:'Emergencia', hex:'#ff2222'},
  ];

  return (
    <div style={{padding:'24px 28px'}} className="anim-fade">

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',
        flexWrap:'wrap',gap:12,marginBottom:24}}>
        <div>
          <h1 className="display" style={{fontSize:30,color:'var(--text-primary)',lineHeight:1}}>
            AJUSTES DE HARDWARE
          </h1>
          <span style={{fontFamily:'JetBrains Mono',fontSize:10,color:'var(--text-muted)',letterSpacing:'0.07em'}}>
            Configuración técnica · calibración IoT
          </span>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          {/* BLE status pill */}
          <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',
            background:ble?'var(--cyan-soft)':'var(--accent-soft)',
            border:`1px solid ${ble?'var(--cyan-border)':'var(--accent-border)'}`,borderRadius:8}}>
            <div className={ble?'anim-blink':''} style={{width:6,height:6,borderRadius:'50%',
              background:ble?'var(--cyan)':'var(--accent)',boxShadow:`0 0 5px ${ble?'var(--cyan)':'var(--accent)'}`}}/>
            <span style={{fontFamily:'JetBrains Mono',fontSize:9,
              color:ble?'var(--cyan)':'var(--accent)',letterSpacing:'0.1em'}}>
              {ble?'BLE CONECTADO':'SIN CONEXIÓN'}
            </span>
          </div>
          <ThemeToggle compact/>
        </div>
      </div>

      {/* Responsive 2-col grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16}}>

        {/* ── LEFT COLUMN ── */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>

          {/* BLE Connection */}
          <Card>
            <Label>CONEXIÓN BLUETOOTH LE</Label>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div>
                <p style={{fontSize:14,fontWeight:500,color:'var(--text-primary)'}}>
                  {ble ? mockVehicle.name : 'Sin dispositivo vinculado'}
                </p>
                <p style={{fontFamily:'JetBrains Mono',fontSize:10,color:'var(--text-muted)',marginTop:3}}>
                  {ble ? 'MG-RING-442 · Bluetooth LE 5.0' : 'Buscar dispositivos cercanos'}
                </p>
              </div>
              <BleIcon connected={ble}/>
            </div>

            {/* Scanning bar */}
            {scanning && (
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12,
                padding:'10px 14px',background:'var(--cyan-soft)',
                border:'1px solid var(--cyan-border)',borderRadius:8}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"
                  style={{animation:'spin-cw 1s linear infinite',transformOrigin:'center'}}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <span style={{fontFamily:'JetBrains Mono',fontSize:10,color:'var(--cyan)',letterSpacing:'0.1em'}}>
                  BUSCANDO DISPOSITIVOS BLE...
                </span>
              </div>
            )}

            {/* Connect button */}
            <button onClick={connectBle} style={{
              width:'100%',padding:'12px',borderRadius:10,cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              fontFamily:'JetBrains Mono',fontSize:11,letterSpacing:'0.12em',
              transition:'all .25s',
              background: ble ? 'var(--accent-soft)' : 'var(--cyan-soft)',
              border: `1px solid ${ble ? 'var(--accent-border)' : 'var(--cyan-border)'}`,
              color: ble ? 'var(--accent)' : 'var(--cyan)',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                {ble
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
                }
              </svg>
              {ble ? 'DESCONECTAR ANILLO' : scanning ? 'ESCANEANDO...' : 'CONECTAR ANILLO BLE'}
            </button>

            {/* Paired devices hint */}
            {!ble && !scanning && (
              <p style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--text-faint)',
                marginTop:10,textAlign:'center',letterSpacing:'0.08em'}}>
                Mantén el anillo encendido y cerca
              </p>
            )}
          </Card>

          {/* Ring preview */}
          <Card>
            <Label>VISTA PREVIA DEL ANILLO</Label>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
              <AnimatedRing status={ringMode} size={176}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,width:'100%'}}>
                {RING_MODES.map(m=>(
                  <button key={m.key} onClick={()=>setRingMode(m.key)} style={{
                    padding:'8px 10px',borderRadius:8,cursor:'pointer',
                    fontFamily:'JetBrains Mono',fontSize:9,letterSpacing:'0.1em',
                    transition:'all .2s',
                    background:ringMode===m.key?'var(--accent-soft)':'var(--bg-surface)',
                    border:`1px solid ${ringMode===m.key?'var(--accent-border)':'var(--border)'}`,
                    color:ringMode===m.key?m.hex:'var(--text-muted)',
                  }}>
                    {m.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* System test */}
          <Card>
            <Label>ESTADO DEL SISTEMA</Label>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div className="anim-blink" style={{width:7,height:7,borderRadius:'50%',
                  background:'var(--green)',boxShadow:'0 0 6px var(--green)'}}/>
                <span style={{fontFamily:'JetBrains Mono',fontSize:10,color:'var(--green)',letterSpacing:'0.1em'}}>EN LÍNEA</span>
              </div>
              <span style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--text-faint)'}}>v2.4.1</span>
            </div>
            <button onClick={testConn} disabled={testing} style={{
              width:'100%',padding:'11px',borderRadius:10,cursor:testing?'wait':'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              fontFamily:'JetBrains Mono',fontSize:11,letterSpacing:'0.12em',transition:'all .25s',
              background:testing?'var(--green-soft)':'var(--bg-surface)',
              border:`1px solid ${testing?'var(--green-border)':'var(--border)'}`,
              color:testing?'var(--green)':'var(--text-secondary)',
            }}>
              {testing
                ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{animation:'spin-cw 1s linear infinite',transformOrigin:'center'}}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>PROBANDO...</>
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>PRUEBA DE CONEXIÓN</>
              }
            </button>
          </Card>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>

          {/* Sensor calibration */}
          <Card>
            <Label>CALIBRACIÓN DE SENSORES</Label>

            <div style={{marginBottom:18}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                <div>
                  <p style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>Umbral de apagado</p>
                  <p style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--text-muted)',marginTop:2,letterSpacing:'0.06em'}}>
                    Tiempo mínimo para activar relay del motor
                  </p>
                </div>
                <span style={{fontFamily:'JetBrains Mono',fontSize:12,color:'var(--amber)',alignSelf:'center'}}>{threshold} ms</span>
              </div>
              <Slider value={threshold} onChange={setThr} min={1} max={50} unit=" ms"/>
            </div>

            <Divider/>

            <div style={{marginBottom:18}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                <div>
                  <p style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>Radio de proximidad</p>
                  <p style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--text-muted)',marginTop:2,letterSpacing:'0.06em'}}>
                    Distancia del sensor IR de aproximación
                  </p>
                </div>
                <span style={{fontFamily:'JetBrains Mono',fontSize:12,color:'var(--cyan)',alignSelf:'center'}}>{proximity} cm</span>
              </div>
              <Slider value={proximity} onChange={setProx} min={10} max={150} unit=" cm"/>
            </div>

            <Divider/>

            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                <p style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>Brillo del anillo LED</p>
                <span style={{fontFamily:'JetBrains Mono',fontSize:12,color:'var(--text-secondary)'}}>{brightness}%</span>
              </div>
              <Slider value={brightness} onChange={setBright} min={10} max={100} unit="%"/>
            </div>
          </Card>

          {/* Notifications */}
          <Card>
            <Label>NOTIFICACIONES Y ALERTAS</Label>
            {[
              {label:'Alertas de movimiento',  sub:'Vibración o desplazamiento detectado', val:alerts, set:setAlerts, color:'var(--accent)'},
              {label:'Vibración del anillo',   sub:'Feedback háptico en el dispositivo',   val:vibr,   set:setVibr,   color:'var(--cyan)'},
              {label:'Rastreo GPS continuo',   sub:'Actualización de ubicación cada 5s',   val:gps,    set:setGps,    color:'var(--green)'},
            ].map((item,i,arr)=>(
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'13px 0',borderBottom:i<arr.length-1?'1px solid var(--border)':'none'}}>
                <div>
                  <p style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>{item.label}</p>
                  <p style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--text-muted)',marginTop:3,letterSpacing:'0.05em'}}>{item.sub}</p>
                </div>
                <Toggle value={item.val} onChange={item.set} color={item.color}/>
              </div>
            ))}
          </Card>

          {/* Appearance */}
          <Card>
            <Label>APARIENCIA</Label>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <p style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>Tema de la interfaz</p>
                <p style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--text-muted)',marginTop:3,letterSpacing:'0.05em'}}>
                  Oscuro recomendado para uso nocturno
                </p>
              </div>
              <ThemeToggle/>
            </div>
          </Card>

          {/* Device info */}
          <Card>
            <Label>INFORMACIÓN DEL DISPOSITIVO</Label>
            {[
              ['Serial ID',        'MG-000-442-0'],
              ['Firmware',         'v2.4.1 · estable'],
              ['Protocolo',        'BLE 5.0 · MQTT 3.1'],
              ['Última sincronía', 'Hace 2 min'],
              ['Batería anillo',   `${mockVehicle.battery}%`],
              ['Señal',            'Fuerte · -58 dBm'],
            ].map(([k,v],i,arr)=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                padding:'9px 0',borderBottom:i<arr.length-1?'1px solid var(--border)':'none'}}>
                <span style={{fontFamily:'JetBrains Mono',fontSize:10,color:'var(--text-muted)',letterSpacing:'0.05em'}}>{k}</span>
                <span style={{fontFamily:'JetBrains Mono',fontSize:10,color:'var(--text-secondary)'}}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}