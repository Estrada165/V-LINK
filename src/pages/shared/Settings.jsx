import React, { useState, useEffect } from 'react';
import AnimatedRing from '../../components/ring/AnimatedRing';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { vehicleService, configService, planService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '18px 20px', ...style }}>{children}</div>
);

const Label = ({ children }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 13 }}>{children}</p>
);

const Divisor = () => <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />;

const Toggle = ({ value, onChange }) => (
  <button onClick={() => onChange(!value)} style={{
    padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
    background: value ? 'var(--green-soft)' : 'var(--bg-surface)',
    border: `1px solid ${value ? 'var(--green-border)' : 'var(--border)'}`,
    fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.08em',
    color: value ? 'var(--green)' : 'var(--text-muted)',
    display: 'flex', alignItems: 'center', gap: 6,
    transition: 'all .2s', flexShrink: 0,
  }}>
    <div style={{ width: 6, height: 6, borderRadius: '50%', background: value ? 'var(--green)' : 'var(--text-faint)', transition: 'background .2s' }} />
    {value ? 'ACTIVADO' : 'DESACTIVADO'}
  </button>
);

const Slider = ({ value, onChange, min = 0, max = 100, unit = '', desactivado = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: desactivado ? 0.4 : 1 }}>
    <input type="range" min={min} max={max} value={value}
      onChange={e => !desactivado && onChange(Number(e.target.value))}
      disabled={desactivado}
      style={{ flex: 1, height: 2, cursor: desactivado ? 'not-allowed' : 'pointer' }} />
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-primary)', minWidth: 54, textAlign: 'right' }}>
      {value}{unit}
    </span>
  </div>
);

const BotonGuardar = ({ onGuardar, guardado, cargando, label = 'GUARDAR' }) => (
  <button onClick={onGuardar} disabled={cargando} style={{
    width: '100%', padding: '11px', borderRadius: 10, cursor: cargando ? 'wait' : 'pointer',
    background: guardado ? 'var(--green-soft)' : cargando ? 'var(--bg-surface)' : 'var(--accent)',
    border: `1px solid ${guardado ? 'var(--green-border)' : cargando ? 'var(--border)' : '#ff5040'}`,
    fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em',
    color: guardado ? 'var(--green)' : cargando ? 'var(--text-muted)' : '#fff',
    transition: 'all .3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  }}>
    {guardado
      ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>GUARDADO</>
      : label}
  </button>
);

const BadgeHardware = () => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', borderRadius: 4 }}>
    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--amber)' }} />
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--amber)', letterSpacing: '0.08em' }}>PENDIENTE DE HARDWARE</span>
  </div>
);

const SeccionApariencia = () => (
  <Card>
    <Label>APARIENCIA</Label>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Tema de la interfaz</p>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>Oscuro recomendado para uso nocturno</p>
      </div>
      <ThemeToggle />
    </div>
  </Card>
);

const SeccionNotificaciones = ({ alertas, setAlertas, gps, setGps }) => (
  <Card>
    <Label>NOTIFICACIONES</Label>
    {[
      { label: 'Alertas de movimiento', sub: 'Notificar cuando se detecte vibración o desplazamiento', val: alertas, set: setAlertas },
      { label: 'Rastreo GPS continuo',  sub: 'Actualización de ubicación cada 5 segundos',             val: gps,     set: setGps    },
    ].map((item, i, arr) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>{item.sub}</p>
        </div>
        <Toggle value={item.val} onChange={item.set} />
      </div>
    ))}
  </Card>
);

const SeccionInfoSistema = ({ extendida = false }) => (
  <Card>
    <Label>INFORMACIÓN DEL SISTEMA</Label>
    {[
      ['Versión',       'v2.4.1'                  ],
      ['Backend',       'Railway · Node.js 20'    ],
      ['Base de datos', 'Supabase PostgreSQL'      ],
      ...(extendida ? [
        ['BLE Hardware',  'Pendiente de fabricación'],
        ['Protocolo BLE', 'BLE 5.0 — ESP32'        ],
        ['Firmware',      'Pendiente de desarrollo' ],
      ] : []),
    ].map(([k, v]) => (
      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>{k}</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)' }}>{v}</span>
      </div>
    ))}
  </Card>
);

const SeccionPruebaConexion = () => {
  const [probando, setProbando] = useState(false);
  return (
    <Card>
      <Label>ESTADO DEL SISTEMA</Label>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="anim-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--green)', letterSpacing: '0.1em' }}>BACKEND EN LÍNEA</span>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-faint)' }}>v2.4.1</span>
      </div>
      <button onClick={() => { setProbando(true); setTimeout(() => setProbando(false), 2000); }}
        style={{ width: '100%', padding: '11px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em', transition: 'all .25s', background: probando ? 'var(--green-soft)' : 'var(--bg-surface)', border: `1px solid ${probando ? 'var(--green-border)' : 'var(--border)'}`, color: probando ? 'var(--green)' : 'var(--text-secondary)' }}>
        {probando
          ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>PROBANDO...</>
          : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>PRUEBA DE CONEXIÓN</>}
      </button>
    </Card>
  );
};

const SeccionBle = ({ estadoBle, manejarBle, vehiculoSel }) => (
  <Card>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
      <Label>CONEXIÓN BLUETOOTH LE</Label>
      <BadgeHardware />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
          {estadoBle === 'connected'
            ? (vehiculoSel ? `${vehiculoSel.marca} ${vehiculoSel.modelo}` : 'Anillo conectado')
            : estadoBle === 'scanning' ? 'Buscando...'
            : 'Sin anillo vinculado'}
        </p>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
          {estadoBle === 'connected' ? 'MG-RING · BLE 5.0' : 'El anillo físico debe estar encendido'}
        </p>
      </div>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
        stroke={estadoBle === 'connected' ? 'var(--cyan)' : 'var(--text-muted)'}
        strokeWidth="1.5" style={{ transition: 'stroke .4s', flexShrink: 0 }}>
        <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
      </svg>
    </div>
    {estadoBle === 'scanning' && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px 14px', background: 'var(--cyan-soft)', border: '1px solid var(--cyan-border)', borderRadius: 8 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.1em' }}>ESCANEANDO BLE...</span>
      </div>
    )}
    <button onClick={manejarBle} style={{ width: '100%', padding: '12px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em', transition: 'all .25s', background: estadoBle === 'connected' ? 'var(--accent-soft)' : 'var(--cyan-soft)', border: `1px solid ${estadoBle === 'connected' ? 'var(--accent-border)' : 'var(--cyan-border)'}`, color: estadoBle === 'connected' ? 'var(--accent)' : 'var(--cyan)' }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        {estadoBle === 'connected'
          ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
          : <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>}
      </svg>
      {estadoBle === 'connected' ? 'DESCONECTAR ANILLO' : estadoBle === 'scanning' ? 'BUSCANDO...' : 'CONECTAR ANILLO BLE'}
    </button>
    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginTop: 8, textAlign: 'center' }}>
      Requiere Chrome · Hardware físico pendiente de fabricación
    </p>
  </Card>
);

const SeccionSensores = ({ distancia, setDistancia, demora, setDemora, brillo, setBrillo }) => (
  <Card>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
      <Label>PARÁMETROS DEL DISPOSITIVO</Label>
      <BadgeHardware />
    </div>
    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--amber)', marginBottom: 14, lineHeight: 1.6 }}>
      Estos valores se enviarán al anillo cuando el hardware esté disponible. No tienen efecto actualmente.
    </p>

    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Distancia de separación BLE</p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
            Distancia máxima entre anillo y teléfono antes de activar alerta
          </p>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--amber)', alignSelf: 'center' }}>{distancia} m</span>
      </div>
      <Slider value={distancia} onChange={setDistancia} min={1} max={30} unit=" m" />
    </div>

    <Divisor />

    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Demora antes de activar relay</p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
            Tiempo de espera antes de cortar el motor al detectar separación
          </p>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--cyan)', alignSelf: 'center' }}>{demora} s</span>
      </div>
      <Slider value={demora} onChange={setDemora} min={1} max={30} unit=" s" />
    </div>

    <Divisor />

    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Brillo del anillo LED</p>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-secondary)' }}>{brillo}%</span>
      </div>
      <Slider value={brillo} onChange={setBrillo} min={10} max={100} unit="%" />
    </div>
  </Card>
);

const DOS_COLUMNAS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, alignItems: 'start' };

function SettingsTecnico() {
  return (
    <div style={DOS_COLUMNAS}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SeccionApariencia />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SeccionPruebaConexion />
        <SeccionInfoSistema extendida />
      </div>
    </div>
  );
}

function SettingsSupervisor() {
  return (
    <div style={{ maxWidth: 480 }}>
      <SeccionApariencia />
    </div>
  );
}

function SettingsAdmin() {
  return (
    <div style={DOS_COLUMNAS}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SeccionApariencia />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SeccionPruebaConexion />
        <SeccionInfoSistema extendida />
      </div>
    </div>
  );
}

const MAPA_MODO_BD = { armed: 'armado', disarmed: 'desarmado', valet: 'valet', emergency: 'emergencia' };
const MAPA_MODO_UI = { armado: 'armed', desarmado: 'disarmed', valet: 'valet', emergencia: 'emergency' };

function SettingsUsuario() {
  const navigate = useNavigate();

  const [vehiculos,    setVehiculos]    = useState([]);
  const [vehiculoSel,  setVehiculoSel]  = useState(null);
  const [cargandoVehs, setCargandoVehs] = useState(true);
  const [modoAnillo,   setModoAnillo]   = useState('armed');
  const [distancia,    setDistancia]    = useState(5);
  const [demora,       setDemora]       = useState(5);
  const [brillo,       setBrillo]       = useState(70);
  const [alertas,      setAlertas]      = useState(true);
  const [gps,          setGps]          = useState(true);
  const [guardadoCfg,  setGuardadoCfg]  = useState(false);
  const [cargandoCfg,  setCargandoCfg]  = useState(false);
  const [estadoBle,    setEstadoBle]    = useState('disconnected');
  const [planActivo,   setPlanActivo]   = useState(false);

  const modosAnillo = [
    { key: 'armed',     label: 'Armado',     hex: 'var(--accent)'     },
    { key: 'disarmed',  label: 'Desarmado',  hex: 'var(--text-muted)' },
    { key: 'valet',     label: 'Valet',      hex: 'var(--cyan)'       },
    { key: 'emergency', label: 'Emergencia', hex: '#ff2222'           },
  ];

  useEffect(() => {
    const cargar = async () => {
      setCargandoVehs(true);
      try {
        const [vehs, plan] = await Promise.all([
          vehicleService.getMine(),
          planService.estado().catch(() => null),
        ]);
        setVehiculos(vehs || []);
        if (vehs?.length > 0) setVehiculoSel(vehs[0]);
        setPlanActivo(plan?.activo === true);
      } catch (e) { console.error(e); }
      setCargandoVehs(false);
    };
    cargar();
  }, []);

  useEffect(() => {
    if (!vehiculoSel) return;
    const cargarConfig = async () => {
      setModoAnillo('armed'); setDistancia(5); setDemora(5); setBrillo(70); setAlertas(true); setGps(true);
      try {
        const cfg = await configService.get(vehiculoSel.id_vehiculo);
        if (cfg.modo_seguridad)                   setModoAnillo(MAPA_MODO_UI[cfg.modo_seguridad] || 'armed');
        if (cfg.umbral_apagado_ms)                setDemora(Math.round(cfg.umbral_apagado_ms / 1000) || 5);
        if (cfg.radio_proximidad_cm)              setDistancia(Math.round(cfg.radio_proximidad_cm / 100) || 5);
        if (cfg.alertas_movimiento !== undefined) setAlertas(cfg.alertas_movimiento);
        if (cfg.rastreo_continuo   !== undefined) setGps(cfg.rastreo_continuo);
      } catch {}
    };
    cargarConfig();
  }, [vehiculoSel]);

  const guardarConfig = async () => {
    if (!vehiculoSel) return;
    setCargandoCfg(true);
    try {
      await configService.save({
        id_vehiculo:         vehiculoSel.id_vehiculo,
        modo_seguridad:      MAPA_MODO_BD[modoAnillo],
        umbral_apagado_ms:   demora * 1000,
        radio_proximidad_cm: distancia * 100,
        alertas_movimiento:  alertas,
        rastreo_continuo:    gps,
      });
      setGuardadoCfg(true);
      setTimeout(() => setGuardadoCfg(false), 2500);
    } catch (e) { console.error(e); }
    setCargandoCfg(false);
  };

  const manejarBle = () => {
    if (estadoBle === 'connected') { setEstadoBle('disconnected'); return; }
    setEstadoBle('scanning');
    if ('bluetooth' in navigator) {
      navigator.bluetooth.requestDevice({ filters: [{ namePrefix: 'MOTOGUARD' }], optionalServices: ['battery_service'] })
        .then(device => { setEstadoBle('connected'); console.log('BLE:', device.name); })
        .catch(() => setEstadoBle('disconnected'));
    } else { setTimeout(() => setEstadoBle('disconnected'), 2000); }
  };

  if (!cargandoVehs && vehiculos.length === 0) {
    return (
      <div style={DOS_COLUMNAS}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card style={{ background: 'var(--amber-soft)', border: '1px solid var(--amber-border)' }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>Sin vehículo registrado</p>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginBottom: 14 }}>
              Registra tu moto en Mi Perfil para acceder a la configuración del dispositivo.
            </p>
            <button onClick={() => navigate('/profile')} style={{ padding: '10px 18px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: '#fff' }}>
              IR A MI PERFIL →
            </button>
          </Card>
          <SeccionNotificaciones alertas={alertas} setAlertas={setAlertas} gps={gps} setGps={setGps} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SeccionApariencia />
          <SeccionBle estadoBle={estadoBle} manejarBle={manejarBle} vehiculoSel={null} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {vehiculos.length > 0 && (
        <div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.14em', marginBottom: 10 }}>SELECCIONAR VEHÍCULO</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {vehiculos.map(v => {
              const activo = vehiculoSel?.id_vehiculo === v.id_vehiculo;
              return (
                <button key={v.id_vehiculo} onClick={() => setVehiculoSel(v)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, cursor: 'pointer', transition: 'all .2s', background: activo ? 'var(--accent-soft)' : 'var(--bg-card)', border: `1px solid ${activo ? 'var(--accent-border)' : 'var(--border)'}` }}>
                  <svg viewBox="0 0 32 22" width="20" height="14" fill="none" stroke={activo ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="5" cy="17" r="4"/><circle cx="27" cy="17" r="4"/>
                    <path d="M9 17L14 7L22 7L27 13"/><path d="M9 17L12 17L14 7"/><path d="M12 17L19 17"/>
                  </svg>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: activo ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{v.marca} {v.modelo}</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>{v.placa}{v.anio ? ` · ${v.anio}` : ''}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={DOS_COLUMNAS}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SeccionBle estadoBle={estadoBle} manejarBle={manejarBle} vehiculoSel={vehiculoSel} />

          {vehiculoSel && !planActivo && (
            <div style={{ padding: '16px 18px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', marginBottom: 4 }}>CONFIGURACIÓN BLOQUEADA</p>
                <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  La configuración del anillo IoT requiere un plan activo.
                </p>
                <button onClick={() => navigate('/plan')} style={{ padding: '6px 14px', background: 'var(--accent)', border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: '#fff', letterSpacing: '0.06em' }}>
                  ACTIVAR PLAN →
                </button>
              </div>
            </div>
          )}

          {vehiculoSel && planActivo && (
            <Card>
              <Label>MODO DE SEGURIDAD — {vehiculoSel.marca} {vehiculoSel.modelo}</Label>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <AnimatedRing status={modoAnillo} size={160} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, width: '100%' }}>
                  {modosAnillo.map(m => (
                    <button key={m.key} onClick={() => setModoAnillo(m.key)} style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', transition: 'all .2s', background: modoAnillo === m.key ? 'var(--accent-soft)' : 'var(--bg-surface)', border: `1px solid ${modoAnillo === m.key ? 'var(--accent-border)' : 'var(--border)'}`, color: modoAnillo === m.key ? m.hex : 'var(--text-muted)' }}>
                      {m.label.toUpperCase()}
                    </button>
                  ))}
                </div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', textAlign: 'center' }}>
                  El control físico del modo estará disponible al conectar el anillo BLE
                </p>
              </div>
            </Card>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {vehiculoSel && planActivo && (
            <SeccionSensores
              distancia={distancia} setDistancia={setDistancia}
              demora={demora}       setDemora={setDemora}
              brillo={brillo}       setBrillo={setBrillo}
            />
          )}

          <SeccionNotificaciones alertas={alertas} setAlertas={setAlertas} gps={gps} setGps={setGps} />
          <SeccionApariencia />

          {vehiculoSel && (
            <Card>
              <Label>DATOS DEL VEHÍCULO</Label>
              {[
                ['Marca / Modelo', `${vehiculoSel.marca} ${vehiculoSel.modelo}`                          ],
                ['Placa',          vehiculoSel.placa      || '—'                                         ],
                ['Año',            vehiculoSel.anio       || '—'                                         ],
                ['Color',          vehiculoSel.color      || '—'                                         ],
                ['Cilindraje',     vehiculoSel.cilindraje ? `${vehiculoSel.cilindraje} cc` : '—'         ],
                ['BLE Hardware',   'Pendiente de fabricación'                                            ],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)' }}>{v}</span>
                </div>
              ))}
            </Card>
          )}

          {vehiculoSel && planActivo && (
            <BotonGuardar onGuardar={guardarConfig} guardado={guardadoCfg} cargando={cargandoCfg} label="GUARDAR CONFIGURACIÓN" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { currentUser } = useAuth();
  const rol = currentUser?.rol || 'usuario';

  const ETIQUETAS_ROL = {
    admin:      { label: 'Apariencia y estado del sistema',   color: 'var(--accent)' },
    supervisor: { label: 'Preferencias de apariencia',        color: 'var(--amber)'  },
    tecnico:    { label: 'Apariencia e información técnica',  color: 'var(--cyan)'   },
    usuario:    { label: 'Configuración del dispositivo IoT', color: 'var(--green)'  },
  };

  const etiqueta = ETIQUETAS_ROL[rol] || { label: 'Ajustes', color: 'var(--text-muted)' };

  return (
    <div style={{ padding: '20px 16px 40px' }} className="anim-fade">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>AJUSTES</h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>{etiqueta.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: etiqueta.color, background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: 6 }}>
            {rol.toUpperCase()}
          </span>
          <ThemeToggle compact />
        </div>
      </div>

      {rol === 'admin'      && <SettingsAdmin />}
      {rol === 'supervisor' && <SettingsSupervisor />}
      {rol === 'tecnico'    && <SettingsTecnico />}
      {rol === 'usuario'    && <SettingsUsuario />}
    </div>
  );
}