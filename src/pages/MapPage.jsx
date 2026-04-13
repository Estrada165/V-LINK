import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockVehicle, mockRiskZones } from '../mocks/mockData';
import Card from '../components/ui/Card';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom motorcycle marker
const motoIcon = new L.DivIcon({
  html: `
    <div style="
      width:36px; height:36px;
      background:#e03030;
      border:2px solid #ff6060;
      border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 0 16px rgba(224,48,48,0.6);
    ">
      <svg viewBox="0 0 24 16" width="18" height="12" fill="none" stroke="#fff" stroke-width="1.5">
        <ellipse cx="4" cy="12" rx="3.5" ry="3.5" stroke-width="1.5"/>
        <ellipse cx="20" cy="12" rx="3.5" ry="3.5" stroke-width="1.5"/>
        <path d="M7.5 12 L12 4 L17 4 L20 8.5" stroke-linecap="round"/>
        <path d="M7.5 12 L10 12 L12 4" stroke-linecap="round"/>
        <path d="M10 12 L15 12" stroke-linecap="round"/>
      </svg>
    </div>
  `,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const alertIcon = new L.DivIcon({
  html: `<div style="width:10px;height:10px;background:#e03030;border-radius:50%;box-shadow:0 0 12px #e03030;border:1px solid #ff6060"></div>`,
  className: '',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 15); }, [center, map]);
  return null;
}

export default function MapPage() {
  const [reportSent, setReportSent] = useState(false);
  const center = [mockVehicle.location.lat, mockVehicle.location.lng];

  const handleReport = () => {
    setReportSent(true);
    setTimeout(() => setReportSent(false), 3000);
  };

  return (
    <div className="flex flex-col pt-14 pb-20 min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Map */}
      <div className="relative flex-1" style={{ minHeight: '55vh' }}>
        <MapContainer
          center={center}
          zoom={15}
          style={{ width: '100%', height: '100%', minHeight: '55vh' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <RecenterMap center={center} />

          {/* Vehicle marker */}
          <Marker position={center} icon={motoIcon}>
            <Popup>
              <div style={{ fontFamily: 'DM Sans', color: '#f0f0f0', background: '#161616', padding: 8, borderRadius: 8 }}>
                <strong>{mockVehicle.name}</strong><br />
                <span style={{ fontSize: 11, color: '#6b6b6b' }}>{mockVehicle.location.address}</span>
              </div>
            </Popup>
          </Marker>

          {/* Risk zones */}
          {mockRiskZones.map(zone => (
            <React.Fragment key={zone.id}>
              <Circle
                center={[zone.lat, zone.lng]}
                radius={200}
                pathOptions={{
                  color: zone.color,
                  fillColor: zone.color,
                  fillOpacity: 0.08,
                  weight: 1,
                  dashArray: '4 4',
                }}
              />
              <Marker position={[zone.lat, zone.lng]} icon={alertIcon} />
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Legend overlay */}
        <div
          className="absolute bottom-4 left-4 z-10 rounded-xl p-3"
          style={{ background: 'rgba(10,10,10,0.9)', border: '1px solid #1f1f1f', backdropFilter: 'blur(8px)' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#6b6b6b', letterSpacing: '0.12em', marginBottom: 8 }}>
            LEYENDA TÁCTICA
          </p>
          {[['#e03030', 'RIESGO CRÍTICO'], ['#ffb400', 'RIESGO MODERADO'], ['#1db954', 'ZONA SEGURA']].map(([color, label]) => (
            <div key={label} className="flex items-center gap-2 mb-1">
              <div className="rounded-sm" style={{ width: 10, height: 10, background: color, opacity: 0.8 }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#a0a0a0', letterSpacing: '0.08em' }}>{label}</span>
            </div>
          ))}
          <div className="mt-2 pt-2" style={{ borderTop: '1px solid #1f1f1f' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#6b6b6b' }}>
              USUARIOS ONLINE <span style={{ color: '#1db954' }}>● 1,204</span>
            </span>
          </div>
        </div>

        {/* Report button */}
        <div className="absolute bottom-4 right-4 z-10">
          <button
            onClick={handleReport}
            className="flex items-center gap-2 rounded-xl px-4 py-3 transition-all duration-200"
            style={{
              background: reportSent ? '#1a3a1a' : '#e03030',
              border: `1px solid ${reportSent ? '#1db954' : '#ff4040'}`,
              color: '#fff',
              fontFamily: 'JetBrains Mono',
              fontSize: '10px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              boxShadow: reportSent ? '0 0 12px rgba(29,185,84,0.3)' : '0 0 16px rgba(224,48,48,0.4)',
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              {reportSent
                ? <polyline points="20 6 9 17 4 12" />
                : <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
              }
            </svg>
            {reportSent ? 'REPORTADO' : 'REPORTAR INCIDENCIA'}
          </button>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        {/* Last location */}
        <Card className="flex items-center justify-between px-4 py-3">
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#6b6b6b', letterSpacing: '0.12em', marginBottom: 3 }}>
              ÚLTIMA UBICACIÓN
            </p>
            <p style={{ fontSize: '14px', color: '#f0f0f0', fontWeight: 500 }}>
              {mockVehicle.location.address}
            </p>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#e03030" strokeWidth="1.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </Card>

        {/* Risk zones */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', letterSpacing: '0.12em' }}>
              ZONAS DE RIESGO CERCANAS
            </span>
            <span
              className="rounded px-2 py-0.5"
              style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', background: 'rgba(224,48,48,0.12)', color: '#e03030', border: '1px solid #e0303030' }}
            >
              {mockRiskZones.length} Alertas
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {mockRiskZones.map(zone => (
              <Card key={zone.id} className="flex items-center gap-3 px-4 py-3">
                <div className="rounded" style={{ width: 3, height: 36, background: zone.color, flexShrink: 0 }} />
                <div className="flex-1">
                  <p style={{ fontSize: '13px', color: '#f0f0f0', fontWeight: 500 }}>{zone.name}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#6b6b6b', marginTop: 2 }}>{zone.distance}</p>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#6b6b6b' }}>{zone.time}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}