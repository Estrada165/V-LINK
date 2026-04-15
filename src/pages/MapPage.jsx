import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup,
  Circle, Polyline, useMap, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  mockVehicle, mockRiskZones, mockHeatPoints,
  mockRoutePaths, mockIncidents,
} from '../mocks/mockData';
import ThemeToggle from '../components/ui/ThemeToggle';

/* ── fix leaflet icons ─────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

/* ── custom markers ────────────────────────────────────── */
const motoIcon = new L.DivIcon({
  html: `<div style="width:40px;height:40px;background:#e03030;border:2px solid #ff6060;
    border-radius:50%;display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 18px rgba(224,48,48,.7);">
    <svg viewBox="0 0 32 22" width="22" height="15" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round">
      <circle cx="5" cy="17" r="4"/><circle cx="27" cy="17" r="4"/>
      <path d="M9 17L14 7L22 7L27 13"/><path d="M9 17L12 17L14 7"/>
      <path d="M12 17L19 17"/><path d="M22 7L24 5L26 7"/>
    </svg>
  </div>`,
  className: '', iconSize: [40, 40], iconAnchor: [20, 20],
});

const incidentIcon = (color = '#e03030') => new L.DivIcon({
  html: `<div style="width:14px;height:14px;background:${color};border-radius:50%;
    box-shadow:0 0 10px ${color};border:2px solid #fff;"></div>`,
  className: '', iconSize: [14, 14], iconAnchor: [7, 7],
});

/* ── heatmap layer via Canvas ──────────────────────────── */
function HeatmapLayer({ points }) {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) map.removeLayer(canvasRef.current);

    const CanvasLayer = L.Layer.extend({
      onAdd(m) {
        this._map = m;
        const size = m.getSize();
        this._canvas = L.DomUtil.create('canvas');
        this._canvas.width  = size.x;
        this._canvas.height = size.y;
        Object.assign(this._canvas.style, {
          position: 'absolute', top: 0, left: 0,
          zIndex: 400, pointerEvents: 'none',
        });
        m.getPanes().overlayPane.appendChild(this._canvas);
        m.on('moveend zoomend resize', this._draw, this);
        this._draw();
      },
      onRemove(m) {
        m.off('moveend zoomend resize', this._draw, this);
        if (this._canvas && this._canvas.parentNode)
          this._canvas.parentNode.removeChild(this._canvas);
      },
      _draw() {
        const m = this._map;
        const size = m.getSize();
        this._canvas.width  = size.x;
        this._canvas.height = size.y;
        const ctx = this._canvas.getContext('2d');
        ctx.clearRect(0, 0, size.x, size.y);

        const topLeft = m.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);

        points.forEach(({ lat, lng, weight }) => {
          const pt = m.latLngToContainerPoint([lat, lng]);
          const r  = 40 + weight * 30;
          const g  = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);

          // color by weight
          const alpha = weight * 0.55;
          if (weight > 0.7) {
            g.addColorStop(0,   `rgba(224,48,48,${alpha})`);
            g.addColorStop(0.4, `rgba(224,48,48,${alpha * 0.5})`);
            g.addColorStop(1,   'rgba(224,48,48,0)');
          } else if (weight > 0.4) {
            g.addColorStop(0,   `rgba(240,165,0,${alpha})`);
            g.addColorStop(0.4, `rgba(240,165,0,${alpha * 0.5})`);
            g.addColorStop(1,   'rgba(240,165,0,0)');
          } else {
            g.addColorStop(0,   `rgba(32,196,90,${alpha})`);
            g.addColorStop(0.4, `rgba(32,196,90,${alpha * 0.5})`);
            g.addColorStop(1,   'rgba(32,196,90,0)');
          }

          ctx.beginPath();
          ctx.fillStyle = g;
          ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
          ctx.fill();
        });
      },
    });

    const layer = new CanvasLayer();
    canvasRef.current = layer;
    layer.addTo(map);
    return () => { layer.remove(); };
  }, [map, points]);

  return null;
}

/* ── recenter ──────────────────────────────────────────── */
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 15); }, [center, map]);
  return null;
}

/* ── click to place new incident ───────────────────────── */
function ClickHandler({ onMapClick }) {
  useMapEvents({ click: e => onMapClick(e.latlng) });
  return null;
}

/* ── atoms ─────────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '14px 16px', ...style }}>{children}</div>
);
const Dot = ({ color, pulse, size = 6 }) => (
  <div className={pulse ? 'anim-blink' : ''} style={{
    width: size, height: size, borderRadius: '50%',
    background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0,
  }} />
);
const MapBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px',
    background: active ? 'var(--accent-soft)' : 'var(--nav-bg)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
    borderRadius: 10, cursor: 'pointer',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em',
    transition: 'all .22s',
  }}>
    {children}
  </button>
);

/* ── Report modal ──────────────────────────────────────── */
function ReportModal({ latlng, onConfirm, onCancel }) {
  const [reason,   setReason]   = useState('');
  const [category, setCategory] = useState('Robo');

  const cats = ['Robo', 'Presencia sospechosa', 'Accidente', 'Zona peligrosa', 'Otro'];

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 2000,
      background: 'var(--overlay)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="mg-card" style={{
        width: 320, padding: '24px', margin: '0 16px',
        boxShadow: '0 8px 40px rgba(0,0,0,.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '0.12em', color: 'var(--text-primary)', lineHeight: 1 }}>
              REPORTAR INCIDENCIA
            </h3>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.08em' }}>
              {latlng ? `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}` : 'Ubicación actual'}
            </p>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Category pills */}
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 10 }}>
          TIPO DE INCIDENCIA
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
              fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.08em',
              transition: 'all .18s',
              background: category === c ? 'var(--accent-soft)' : 'var(--bg-surface)',
              border: `1px solid ${category === c ? 'var(--accent-border)' : 'var(--border)'}`,
              color: category === c ? 'var(--accent)' : 'var(--text-muted)',
            }}>{c}</button>
          ))}
        </div>

        {/* Reason input */}
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 8 }}>
          DESCRIPCIÓN
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Describe brevemente lo que ocurre..."
          rows={3}
          style={{
            width: '100%', padding: '10px 12px',
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text-primary)', resize: 'none',
            fontFamily: 'DM Sans, sans-serif', fontSize: 13,
            outline: 'none', transition: 'border-color .2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
          onBlur={e  => e.target.style.borderColor = 'var(--border)'}
        />

        {/* Note */}
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginTop: 8, letterSpacing: '0.06em' }}>
          Este reporte sera visible para todos los usuarios del mapa
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 10,
            letterSpacing: '0.1em',
          }}>
            CANCELAR
          </button>
          <button
            onClick={() => reason.trim() && onConfirm({ category, reason })}
            disabled={!reason.trim()}
            style={{
              flex: 2, padding: '10px', borderRadius: 8, cursor: reason.trim() ? 'pointer' : 'not-allowed',
              background: reason.trim() ? 'var(--accent)' : 'var(--bg-surface)',
              border: `1px solid ${reason.trim() ? '#ff5040' : 'var(--border)'}`,
              color: reason.trim() ? '#fff' : 'var(--text-faint)',
              fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em',
              transition: 'all .22s',
              boxShadow: reason.trim() ? '0 0 16px var(--accent-glow)' : 'none',
            }}
          >
            ENVIAR REPORTE
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MapPage ────────────────────────────────────────────── */
export default function MapPage() {
  const [showHeat,    setShowHeat]    = useState(true);
  const [showRoutes,  setShowRoutes]  = useState(true);
  const [tracking,    setTracking]    = useState(true);
  const [reportModal, setReportModal] = useState(false);
  const [clickedLatLng, setClickedLatLng] = useState(null);
  const [incidents,   setIncidents]   = useState(mockIncidents);
  const [selectedZone, setSelectedZone] = useState(null);
  const [activeRoute,  setActiveRoute]  = useState(null);

  const center = [mockVehicle.location.lat, mockVehicle.location.lng];

  const openReport = () => {
    setClickedLatLng(null);
    setReportModal(true);
  };

  const handleMapClick = (latlng) => {
    setClickedLatLng(latlng);
    setReportModal(true);
  };

  const handleConfirmReport = ({ category, reason }) => {
    const newInc = {
      id: `i${Date.now()}`,
      user: 'Tú',
      reason: `${category}: ${reason}`,
      lat: clickedLatLng ? clickedLatLng.lat : center[0],
      lng: clickedLatLng ? clickedLatLng.lng : center[1],
      time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      verified: 0,
    };
    setIncidents(prev => [newInc, ...prev]);
    setReportModal(false);
    setClickedLatLng(null);
  };

  const routeSeverityLabel = { high: 'RIESGO CRÍTICO', medium: 'RIESGO MODERADO', low: 'ZONA SEGURA' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', overflow: 'hidden', position: 'relative' }}>

      {/* ── Map ── */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapContainer center={center} zoom={15}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {tracking && <RecenterMap center={center} />}
          <ClickHandler onMapClick={handleMapClick} />

          {/* Heatmap */}
          {showHeat && <HeatmapLayer points={mockHeatPoints} />}

          {/* Routes */}
          {showRoutes && mockRoutePaths.map(route => (
            <Polyline key={route.id} positions={route.points}
              pathOptions={{
                color: route.color, weight: 5, opacity: 0.75,
                dashArray: route.severity === 'low' ? '8 4' : undefined,
              }}
              eventHandlers={{ click: () => setActiveRoute(activeRoute?.id === route.id ? null : route) }}
            />
          ))}

          {/* Risk zone circles */}
          {mockRiskZones.map(zone => (
            <React.Fragment key={zone.id}>
              <Circle center={[zone.lat, zone.lng]} radius={180}
                pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.06, weight: 1, dashArray: '5 6' }}
              />
            </React.Fragment>
          ))}

          {/* User incident markers */}
          {incidents.map(inc => (
            <Marker key={inc.id} position={[inc.lat, inc.lng]}
              icon={incidentIcon(inc.verified > 1 ? '#e03030' : '#f0a500')}
              eventHandlers={{ click: () => setSelectedZone(inc) }}>
              <Popup>
                <div style={{ fontFamily: 'DM Sans', fontSize: 12, minWidth: 160 }}>
                  <strong style={{ color: '#e03030' }}>{inc.reason}</strong>
                  <p style={{ color: '#888', marginTop: 4, fontFamily: 'JetBrains Mono', fontSize: 10 }}>
                    {inc.user} · {inc.time}
                  </p>
                  <p style={{ color: '#888', fontFamily: 'JetBrains Mono', fontSize: 9, marginTop: 2 }}>
                    {inc.verified} verificaciones
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Vehicle */}
          <Marker position={center} icon={motoIcon}>
            <Popup>
              <div style={{ fontFamily: 'DM Sans', fontSize: 12 }}>
                <strong>{mockVehicle.name}</strong>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#888', marginTop: 4 }}>
                  {mockVehicle.location.address}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* ── Overlay controls ── */}

        {/* Top left */}
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MapBtn active={showHeat} onClick={() => setShowHeat(h => !h)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
            </svg>
            {showHeat ? 'MAPA DE CALOR' : 'MAPA NORMAL'}
          </MapBtn>
          <MapBtn active={showRoutes} onClick={() => setShowRoutes(r => !r)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6l6 6-6 6" />
            </svg>
            {showRoutes ? 'RUTAS ACTIVAS' : 'RUTAS OCULTAS'}
          </MapBtn>
          <MapBtn active={tracking} onClick={() => setTracking(t => !t)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
            SEGUIMIENTO
          </MapBtn>
        </div>

        {/* Top right */}
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <ThemeToggle compact />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
            background: 'var(--nav-bg)', backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)', borderRadius: 8,
          }}>
            <Dot color="var(--green)" pulse size={6} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>
              1,204 <span style={{ color: 'var(--green)' }}>online</span>
            </span>
          </div>
        </div>

        {/* Active route info */}
        {activeRoute && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)', zIndex: 1100,
            background: 'var(--bg-card)', border: `1px solid ${activeRoute.color}44`,
            borderRadius: 12, padding: '16px 20px', minWidth: 220,
            boxShadow: `0 4px 24px ${activeRoute.color}30`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: activeRoute.color }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: activeRoute.color, letterSpacing: '0.1em' }}>
                    {routeSeverityLabel[activeRoute.severity]}
                  </span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{activeRoute.label}</p>
              </div>
              <button onClick={() => setActiveRoute(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Bottom legend */}
        <div style={{
          position: 'absolute', bottom: 16, left: 12, zIndex: 1000,
          background: 'var(--nav-bg)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px',
        }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.13em', marginBottom: 8 }}>
            LEYENDA
          </p>
          {[['#e03030','Riesgo crítico'],['#f0a500','Riesgo moderado'],['#20c45a','Zona segura']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <div style={{ width: 24, height: 3, background: c, borderRadius: 2 }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-secondary)' }}>{l}</span>
            </div>
          ))}
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', letterSpacing: '0.06em' }}>
            Haz clic en el mapa para reportar
          </p>
        </div>

        {/* Report button */}
        <div style={{ position: 'absolute', bottom: 16, right: 12, zIndex: 1000 }}>
          <button onClick={openReport} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px',
            background: 'var(--accent)', border: '1px solid #ff5040',
            borderRadius: 12, cursor: 'pointer', color: '#fff',
            fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em',
            boxShadow: '0 0 20px var(--accent-glow)', transition: 'all .25s',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            REPORTAR INCIDENCIA
          </button>
        </div>
      </div>

      {/* ── Bottom panel ── */}
      <div style={{
        background: 'var(--bg-surface)', borderTop: '1px solid var(--border)',
        padding: '14px 20px', flexShrink: 0,
      }}>
        {/* Last location */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 1 }}>
                ÚLTIMA UBICACIÓN CONOCIDA
              </p>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                {mockVehicle.location.address}
              </p>
            </div>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 5, background: 'none',
            border: 'none', cursor: 'pointer', color: 'var(--accent)',
            fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            NAVEGAR
          </button>
        </div>

        {/* Incidents + Zones */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
              INCIDENCIAS REPORTADAS
            </span>
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: 8,
              color: 'var(--accent)', background: 'var(--accent-soft)',
              border: '1px solid var(--accent-border)', padding: '2px 8px', borderRadius: 4,
            }}>
              {incidents.length} reportes
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {incidents.map(inc => (
              <button key={inc.id}
                className="mg-card mg-card-hover"
                onClick={() => setSelectedZone(inc)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                  textAlign: 'left', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', transition: 'all .2s',
                }}>
                <div style={{
                  width: 3, height: 32, borderRadius: 2, flexShrink: 0,
                  background: inc.verified > 1 ? '#e03030' : '#f0a500',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {inc.reason}
                  </p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                    {inc.user} · {inc.time}
                    {inc.verified > 0 && ` · ${inc.verified} verif.`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Report modal ── */}
      {reportModal && (
        <ReportModal
          latlng={clickedLatLng}
          onConfirm={handleConfirmReport}
          onCancel={() => { setReportModal(false); setClickedLatLng(null); }}
        />
      )}
    </div>
  );
}