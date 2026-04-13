import React, { useState } from 'react';
import Card from '../components/ui/Card';
import AnimatedRing from '../components/ring/AnimatedRing';
import { mockVehicle } from '../mocks/mockData';

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className="relative rounded-full transition-all duration-300"
    style={{
      width: 44, height: 24,
      background: value ? '#e03030' : '#2a2a2a',
      border: 'none',
      cursor: 'pointer',
      boxShadow: value ? '0 0 8px rgba(224,48,48,0.4)' : 'none',
    }}
  >
    <div
      className="absolute rounded-full transition-all duration-300"
      style={{
        width: 18, height: 18,
        background: '#f0f0f0',
        top: 3,
        left: value ? 23 : 3,
      }}
    />
  </button>
);

const Slider = ({ value, onChange, min = 0, max = 100 }) => (
  <input
    type="range" min={min} max={max} value={value}
    onChange={e => onChange(Number(e.target.value))}
    className="w-full"
    style={{
      accentColor: '#e03030',
      height: 2,
      cursor: 'pointer',
    }}
  />
);

export default function Settings() {
  const [alerts, setAlerts] = useState(true);
  const [threshold, setThreshold] = useState(10.5);
  const [testing, setTesting] = useState(false);

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => setTesting(false), 2000);
  };

  return (
    <div className="pt-14 pb-20 px-4 max-w-lg mx-auto animate-fade-in">
      <div className="py-5">
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '26px', letterSpacing: '0.1em', color: '#f0f0f0', lineHeight: 1 }}>
          AJUSTES DE HARDWARE
        </h2>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#6b6b6b', letterSpacing: '0.1em' }}>
          Configuración técnica y calibración del dispositivo IoT
        </span>
      </div>

      {/* System status */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', letterSpacing: '0.12em' }}>
            ESTADO DEL SISTEMA
          </span>
          <div className="flex items-center gap-2">
            <div className="rounded-full" style={{ width: 6, height: 6, background: '#1db954', boxShadow: '0 0 6px #1db954' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#1db954' }}>EN LÍNEA</span>
          </div>
        </div>
        <button
          onClick={handleTest}
          disabled={testing}
          className="w-full py-3 rounded-lg transition-all duration-300"
          style={{
            background: testing ? '#1a2a1a' : 'rgba(29,185,84,0.1)',
            border: `1px solid ${testing ? '#1db954' : '#1db95440'}`,
            color: testing ? '#1db954' : '#1db954',
            fontFamily: 'JetBrains Mono',
            fontSize: '11px',
            letterSpacing: '0.12em',
            cursor: testing ? 'wait' : 'pointer',
          }}
        >
          {testing ? '● PROBANDO CONEXIÓN...' : '◎ PRUEBA DE CONEXIÓN'}
        </button>
      </Card>

      {/* Ring preview */}
      <Card className="p-6 mb-4 flex flex-col items-center gap-3">
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', letterSpacing: '0.12em' }}>
          VINCULAR NUEVO ANILLO
        </span>
        <AnimatedRing status="armed" size={140} />
        <div className="text-center">
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b' }}>ID · Bluetooth LE</p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#2a2a2a', marginTop: 2 }}>ÁNGULO ACTIVO · 43.2°</p>
        </div>
      </Card>

      {/* Threshold slider */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ffb400" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#f0f0f0' }}>
              Umbral de Apagado
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', color: '#f0f0f0', fontWeight: 300 }}>
              {threshold.toFixed(1)}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b' }}>ms</span>
          </div>
        </div>
        <Slider value={threshold} onChange={setThreshold} min={0} max={100} />
        <div className="flex justify-between mt-1">
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#2a2a2a' }}>0ms</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#2a2a2a' }}>100ms</span>
        </div>
      </Card>

      {/* Alerts toggle */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#e03030" strokeWidth="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <div>
              <p style={{ fontSize: '13px', color: '#f0f0f0', fontWeight: 500 }}>Alertas de Batería Roja</p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', marginTop: 2 }}>
                Notifica cuando cae todo el día
              </p>
            </div>
          </div>
          <Toggle value={alerts} onChange={setAlerts} />
        </div>
      </Card>

      {/* Serial info */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#6b6b6b" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#f0f0f0' }}>Serial ID</span>
        </div>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#6b6b6b', letterSpacing: '0.05em' }}>
          MG-000-442-0
        </p>
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #1f1f1f' }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#2a2a2a', letterSpacing: '0.1em' }}>
            FIRMWARE v2.4.1 · ÚLTIMA SYNC HACE 2 MIN
          </span>
        </div>
      </Card>
    </div>
  );
}