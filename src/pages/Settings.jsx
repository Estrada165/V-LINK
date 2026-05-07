import React, { useState, useEffect } from 'react';
import AnimatedRing from '../components/ring/AnimatedRing';
import ThemeToggle from '../components/ui/ThemeToggle';
import { vehicleService, configService } from '../services/api';
import { useNavigate } from 'react-router-dom';

/* ── Atoms ──────────────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '18px 20px', ...style }}>{children}</div>
);
const Label = ({ children }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 13 }}>{children}</p>
);
const Divider = () => <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />;

const Toggle = ({ value, onChange, color = 'var(--accent)' }) => (
  <button onClick={() => onChange(!value)} style={{
    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
    background: value ? color : 'var(--border-mid, #2a2a2a)',
    position: 'relative', transition: 'background .28s', flexShrink: 0,
    boxShadow: value ? `0 0 8px ${color}55` : 'none',
  }}>
    <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .25s ease' }} />
  </button>
);

const Slider = ({ value, onChange, min = 0, max = 100, unit = '' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <input type="range" min={min} max={max} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ flex: 1, height: 2 }} />
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-primary)', minWidth: 54, textAlign: 'right' }}>
      {value}{unit}
    </span>
  </div>
);

const SaveBtn = ({ onSave, saved, loading: l, label = 'GUARDAR' }) => (
  <button onClick={onSave} disabled={l} style={{
    width: '100%', padding: '11px', borderRadius: 10, cursor: l ? 'wait' : 'pointer',
    background: saved ? 'var(--green-soft)' : l ? 'var(--bg-surface)' : 'var(--accent)',
    border: `1px solid ${saved ? 'var(--green-border)' : l ? 'var(--border)' : '#ff5040'}`,
    fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em',
    color: saved ? 'var(--green)' : l ? 'var(--text-muted)' : '#fff',
    transition: 'all .3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  }}>
    {saved
      ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>GUARDADO</>
      : label}
  </button>
);

export default function Settings() {
  const navigate = useNavigate();

  // Vehicles
  const [vehicles,     setVehicles]     = useState([]);
  const [selectedVeh,  setSelectedVeh]  = useState(null);  // vehicle object
  const [loadingVehs,  setLoadingVehs]  = useState(true);

  // Config per vehicle
  const [ringMode,    setRingMode]    = useState('armed');
  const [threshold,   setThreshold]   = useState(10);
  const [proximity,   setProximity]   = useState(45);
  const [brightness,  setBrightness]  = useState(70);
  const [alerts,      setAlerts]      = useState(true);
  const [gps,         setGps]         = useState(true);
  const [savedConfig, setSavedConfig] = useState(false);
  const [loadingCfg,  setLoadingCfg]  = useState(false);

  // BLE
  const [bleState, setBleState] = useState('disconnected');
  const [testing,  setTesting]  = useState(false);

  const ringModes = [
    { key: 'armed',     label: 'Armado',     hex: 'var(--accent)' },
    { key: 'disarmed',  label: 'Desarmado',  hex: 'var(--text-muted)' },
    { key: 'valet',     label: 'Valet',      hex: 'var(--cyan)' },
    { key: 'emergency', label: 'Emergencia', hex: '#ff2222' },
  ];

  /* ── Load vehicles ────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      setLoadingVehs(true);
      try {
        const vehs = await vehicleService.getAll();
        setVehicles(vehs);
        if (vehs.length > 0) setSelectedVeh(vehs[0]);
      } catch (e) { console.error(e); }
      setLoadingVehs(false);
    };
    load();
  }, []);

  /* ── Load config when vehicle changes ─────────────────────── */
  useEffect(() => {
    if (!selectedVeh) return;
    const loadConfig = async () => {
      // Reset to defaults first
      setRingMode('armed'); setThreshold(10); setProximity(45);
      setBrightness(70); setAlerts(true); setGps(true);
      try {
        const cfg = await configService.get(selectedVeh.id_vehiculo);
        if (cfg.modo_seguridad) {
          const map = { armado: 'armed', desarmado: 'disarmed', valet: 'valet', emergencia: 'emergency' };
          setRingMode(map[cfg.modo_seguridad] || 'armed');
        }
        if (cfg.umbral_apagado_ms)    setThreshold(cfg.umbral_apagado_ms);
        if (cfg.radio_proximidad_cm)  setProximity(cfg.radio_proximidad_cm);
        if (cfg.alertas_movimiento !== undefined) setAlerts(cfg.alertas_movimiento);
        if (cfg.rastreo_continuo !== undefined)   setGps(cfg.rastreo_continuo);
      } catch { /* sin config aún para este vehículo */ }
    };
    loadConfig();
  }, [selectedVeh]);

  /* ── Save config ──────────────────────────────────────────── */
  const handleSaveConfig = async () => {
    if (!selectedVeh) return;
    setLoadingCfg(true);
    const modeMap = { armed: 'armado', disarmed: 'desarmado', valet: 'valet', emergency: 'emergencia' };
    try {
      await configService.save({
        id_vehiculo:         selectedVeh.id_vehiculo,
        modo_seguridad:      modeMap[ringMode],
        umbral_apagado_ms:   threshold,
        radio_proximidad_cm: proximity,
        alertas_movimiento:  alerts,
        rastreo_continuo:    gps,
      });
      setSavedConfig(true);
      setTimeout(() => setSavedConfig(false), 2500);
    } catch (e) { console.error(e); }
    setLoadingCfg(false);
  };

  /* ── BLE connect ──────────────────────────────────────────── */
  const handleBle = () => {
    if (bleState === 'connected') { setBleState('disconnected'); return; }
    setBleState('scanning');
    if ('bluetooth' in navigator) {
      navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'MOTOGUARD' }],
        optionalServices: ['battery_service'],
      })
        .then(device => { setBleState('connected'); console.log('BLE:', device.name); })
        .catch(() => setBleState('disconnected'));
    } else {
      setTimeout(() => setBleState('disconnected'), 2000);
    }
  };

  /* ── No vehicles ──────────────────────────────────────────── */
  if (!loadingVehs && vehicles.length === 0) {
    return (
      <div style={{ padding: '24px 28px' }}>
        <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 20 }}>AJUSTES</h1>
        <Card style={{ background: 'var(--amber-soft)', border: '1px solid var(--amber-border)' }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>Sin vehículo registrado</p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginBottom: 14 }}>
            Registra tu moto en Mi Perfil para poder configurar el sistema.
          </p>
          <button onClick={() => navigate('/profile')} style={{
            padding: '10px 18px', background: 'var(--accent)', border: 'none', borderRadius: 8,
            cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: '#fff',
          }}>
            IR A MI PERFIL →
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>AJUSTES</h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            Configuración del dispositivo IoT
          </span>
        </div>
        <ThemeToggle compact />
      </div>

      {/* ── Vehicle selector ────────────────────────────────────── */}
      {vehicles.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Label>SELECCIONAR VEHÍCULO</Label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {vehicles.map(v => (
              <button key={v.id_vehiculo} onClick={() => setSelectedVeh(v)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                borderRadius: 10, cursor: 'pointer', transition: 'all .2s',
                background: selectedVeh?.id_vehiculo === v.id_vehiculo ? 'var(--accent-soft)' : 'var(--bg-card)',
                border: `1px solid ${selectedVeh?.id_vehiculo === v.id_vehiculo ? 'var(--accent-border)' : 'var(--border)'}`,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: selectedVeh?.id_vehiculo === v.id_vehiculo ? 'var(--accent-soft)' : 'var(--bg-surface)', border: `1px solid ${selectedVeh?.id_vehiculo === v.id_vehiculo ? 'var(--accent-border)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 32 22" width="20" height="14" fill="none" stroke={selectedVeh?.id_vehiculo === v.id_vehiculo ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="5" cy="17" r="4"/><circle cx="27" cy="17" r="4"/>
                    <path d="M9 17L14 7L22 7L27 13"/><path d="M9 17L12 17L14 7"/><path d="M12 17L19 17"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: selectedVeh?.id_vehiculo === v.id_vehiculo ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {v.marca} {v.modelo}
                  </p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>
                    {v.placa} {v.anio ? `· ${v.anio}` : ''}
                  </p>
                </div>
                {selectedVeh?.id_vehiculo === v.id_vehiculo && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 5px var(--accent)', marginLeft: 4 }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Config content ─────────────────────────────────────── */}
      {selectedVeh && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* BLE */}
            <Card>
              <Label>CONEXIÓN BLUETOOTH LE</Label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {bleState === 'connected' ? `${selectedVeh.marca} ${selectedVeh.modelo}` : bleState === 'scanning' ? 'Buscando...' : 'Sin anillo vinculado'}
                  </p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                    {bleState === 'connected' ? 'MG-RING · BLE 5.0' : 'El anillo físico debe estar encendido'}
                  </p>
                </div>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
                  stroke={bleState === 'connected' ? 'var(--cyan)' : 'var(--text-muted)'}
                  strokeWidth="1.5" style={{ transition: 'stroke .4s', flexShrink: 0 }}>
                  <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
                </svg>
              </div>

              {bleState === 'scanning' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px 14px', background: 'var(--cyan-soft)', border: '1px solid var(--cyan-border)', borderRadius: 8 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.1em' }}>ESCANEANDO BLE...</span>
                </div>
              )}

              <button onClick={handleBle} style={{
                width: '100%', padding: '12px', borderRadius: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em', transition: 'all .25s',
                background: bleState === 'connected' ? 'var(--accent-soft)' : 'var(--cyan-soft)',
                border: `1px solid ${bleState === 'connected' ? 'var(--accent-border)' : 'var(--cyan-border)'}`,
                color: bleState === 'connected' ? 'var(--accent)' : 'var(--cyan)',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  {bleState === 'connected'
                    ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                    : <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>}
                </svg>
                {bleState === 'connected' ? 'DESCONECTAR ANILLO' : bleState === 'scanning' ? 'BUSCANDO...' : 'CONECTAR ANILLO BLE'}
              </button>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginTop: 8, textAlign: 'center', letterSpacing: '0.06em' }}>
                Requiere Chrome · Hardware BLE pendiente de fabricación
              </p>
            </Card>

            {/* Ring preview */}
            <Card>
              <Label>MODO ACTUAL — {selectedVeh.marca} {selectedVeh.modelo}</Label>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <AnimatedRing status={ringMode} size={160} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
                  {ringModes.map(m => (
                    <button key={m.key} onClick={() => setRingMode(m.key)} style={{
                      padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                      fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', transition: 'all .2s',
                      background: ringMode === m.key ? 'var(--accent-soft)' : 'var(--bg-surface)',
                      border: `1px solid ${ringMode === m.key ? 'var(--accent-border)' : 'var(--border)'}`,
                      color: ringMode === m.key ? m.hex : 'var(--text-muted)',
                    }}>
                      {m.label.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Connection test */}
            <Card>
              <Label>ESTADO DEL SISTEMA</Label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="anim-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--green)', letterSpacing: '0.1em' }}>BACKEND EN LÍNEA</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-faint)' }}>v2.4.1</span>
              </div>
              <button onClick={() => { setTesting(true); setTimeout(() => setTesting(false), 2000); }} style={{
                width: '100%', padding: '11px', borderRadius: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em', transition: 'all .25s',
                background: testing ? 'var(--green-soft)' : 'var(--bg-surface)',
                border: `1px solid ${testing ? 'var(--green-border)' : 'var(--border)'}`,
                color: testing ? 'var(--green)' : 'var(--text-secondary)',
              }}>
                {testing
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>PROBANDO...</>
                  : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>PRUEBA DE CONEXIÓN</>}
              </button>
            </Card>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Sensor calibration */}
            <Card>
              <Label>CALIBRACIÓN DE SENSORES</Label>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Umbral de apagado</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>Tiempo para activar relay del motor</p>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--amber)', alignSelf: 'center' }}>{threshold} ms</span>
                </div>
                <Slider value={threshold} onChange={setThreshold} min={1} max={50} unit=" ms" />
              </div>

              <Divider />

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Radio de proximidad</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>Distancia del sensor IR</p>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--cyan)', alignSelf: 'center' }}>{proximity} cm</span>
                </div>
                <Slider value={proximity} onChange={setProximity} min={10} max={150} unit=" cm" />
              </div>

              <Divider />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Brillo del anillo LED</p>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-secondary)' }}>{brightness}%</span>
                </div>
                <Slider value={brightness} onChange={setBrightness} min={10} max={100} unit="%" />
              </div>
            </Card>

            {/* Notifications */}
            <Card>
              <Label>NOTIFICACIONES</Label>
              {[
                { label: 'Alertas de movimiento', sub: 'Vibración o desplazamiento detectado', val: alerts, set: setAlerts, color: 'var(--accent)' },
                { label: 'Rastreo GPS continuo',  sub: 'Actualización de ubicación cada 5s',   val: gps,    set: setGps,    color: 'var(--green)' },
              ].map((item, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>{item.sub}</p>
                  </div>
                  <Toggle value={item.val} onChange={item.set} color={item.color} />
                </div>
              ))}
            </Card>

            {/* Appearance */}
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

            {/* Device info */}
            <Card>
              <Label>DATOS DEL VEHÍCULO SELECCIONADO</Label>
              {[
                ['Marca / Modelo', `${selectedVeh.marca} ${selectedVeh.modelo}`],
                ['Placa',          selectedVeh.placa || '—'],
                ['Año',            selectedVeh.anio  || '—'],
                ['Color',          selectedVeh.color || '—'],
                ['Cilindraje',     selectedVeh.cilindraje ? `${selectedVeh.cilindraje} cc` : '—'],
                ['BLE Hardware',   'Pendiente de fabricación'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{k}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)' }}>{v}</span>
                </div>
              ))}
            </Card>

            <SaveBtn onSave={handleSaveConfig} saved={savedConfig} loading={loadingCfg} label="GUARDAR CONFIGURACIÓN" />
          </div>
        </div>
      )}
    </div>
  );
}