import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { alertService, heatmapService, vehicleService } from '../services/api';
import ThemeToggle from '../components/ui/ThemeToggle';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

/* ── Severity ───────────────────────────────────────────────── */
const sevColor = (tipo) => {
  if (!tipo) return '#f0a500';
  const t = tipo.toLowerCase();
  if (t.includes('robo') || t.includes('emergencia')) return '#e03030';
  if (t.includes('movimiento') || t.includes('sospech')) return '#f0a500';
  return '#20c45a';
};

/* ── Icons ──────────────────────────────────────────────────── */
const motoIcon = new L.DivIcon({
  html: `<div style="width:40px;height:40px;background:#e03030;border:2px solid #ff6060;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(224,48,48,.7);">
    <svg viewBox="0 0 32 22" width="22" height="15" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round">
      <circle cx="5" cy="17" r="4"/><circle cx="27" cy="17" r="4"/>
      <path d="M9 17L14 7L22 7L27 13"/><path d="M9 17L12 17L14 7"/><path d="M12 17L19 17"/>
    </svg>
  </div>`,
  className:'', iconSize:[40,40], iconAnchor:[20,20],
});

const incidentDot = (color) => new L.DivIcon({
  html:`<div style="width:14px;height:14px;background:${color};border-radius:50%;box-shadow:0 0 10px ${color};border:2px solid #fff;"></div>`,
  className:'', iconSize:[14,14], iconAnchor:[7,7],
});

/* ── Heatmap canvas ─────────────────────────────────────────── */
function HeatmapLayer({ points }) {
  const map = useMap();
  const layerRef = useRef(null);
  useEffect(() => {
    if (layerRef.current) { layerRef.current.remove(); layerRef.current = null; }
    if (!points.length) return;
    const CanvasLayer = L.Layer.extend({
      onAdd(m) {
        this._map = m;
        const sz = m.getSize();
        this._canvas = L.DomUtil.create('canvas');
        this._canvas.width = sz.x; this._canvas.height = sz.y;
        Object.assign(this._canvas.style, { position:'absolute', top:0, left:0, zIndex:400, pointerEvents:'none' });
        m.getPanes().overlayPane.appendChild(this._canvas);
        m.on('moveend zoomend resize', this._draw, this);
        this._draw();
      },
      onRemove(m) {
        m.off('moveend zoomend resize', this._draw, this);
        if (this._canvas?.parentNode) this._canvas.parentNode.removeChild(this._canvas);
      },
      _draw() {
        const m = this._map; const sz = m.getSize();
        this._canvas.width = sz.x; this._canvas.height = sz.y;
        const ctx = this._canvas.getContext('2d');
        ctx.clearRect(0, 0, sz.x, sz.y);
        L.DomUtil.setPosition(this._canvas, m.containerPointToLayerPoint([0,0]));
        points.forEach(({ lat, lng, weight }) => {
          const pt = m.latLngToContainerPoint([lat, lng]);
          const r = 40 + weight * 30;
          const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
          const col = weight > 0.7 ? '224,48,48' : weight > 0.4 ? '240,165,0' : '32,196,90';
          const a = weight * 0.55;
          g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(0.4, `rgba(${col},${a*0.5})`); g.addColorStop(1, `rgba(${col},0)`);
          ctx.beginPath(); ctx.fillStyle = g; ctx.arc(pt.x, pt.y, r, 0, Math.PI*2); ctx.fill();
        });
      },
    });
    const layer = new CanvasLayer(); layerRef.current = layer; layer.addTo(map);
    return () => { if (layerRef.current) { layerRef.current.remove(); layerRef.current = null; } };
  }, [map, points]);
  return null;
}

/* ── Move map to location ───────────────────────────────────── */
function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 15, { duration: 1.5 }); }, [center, map]);
  return null;
}

/* ── Click to report ────────────────────────────────────────── */
function ClickHandler({ onMapClick, active }) {
  useMapEvents({ click: (e) => { if (active) onMapClick(e.latlng); } });
  return null;
}

/* ── Report modal ───────────────────────────────────────────── */
function ReportModal({ latlng, vehicleId, onConfirm, onCancel }) {
  const [category, setCategory] = useState('Robo');
  const [desc,     setDesc]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const cats = ['Robo', 'Presencia sospechosa', 'Accidente', 'Zona peligrosa', 'Otro'];

  const handle = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    try {
      await alertService.report({
        id_vehiculo:     vehicleId || null,
        tipo_incidencia: `${category}: ${desc}`,
        latitud:  latlng.lat,
        longitud: latlng.lng,
      });
      onConfirm();
    } catch (e) { console.error(e); setLoading(false); }
  };

  return (
    <div style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="mg-card" style={{ width:'100%', maxWidth:320, padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div>
            <h3 style={{ fontFamily:'Bebas Neue', fontSize:22, color:'var(--text-primary)', letterSpacing:'0.1em', lineHeight:1 }}>REPORTAR INCIDENCIA</h3>
            <p style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'var(--text-muted)', marginTop:4 }}>
              {latlng.lat.toFixed(5)}, {latlng.lng.toFixed(5)}
            </p>
          </div>
          <button onClick={onCancel} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <p style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--text-muted)', letterSpacing:'0.12em', marginBottom:8 }}>TIPO DE INCIDENCIA</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding:'5px 10px', borderRadius:6, cursor:'pointer',
              fontFamily:'JetBrains Mono', fontSize:9, letterSpacing:'0.08em', transition:'all .18s',
              background: category===c ? 'var(--accent-soft)' : 'var(--bg-surface)',
              border: `1px solid ${category===c ? 'var(--accent-border)' : 'var(--border)'}`,
              color: category===c ? 'var(--accent)' : 'var(--text-muted)',
            }}>{c}</button>
          ))}
        </div>

        <p style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--text-muted)', letterSpacing:'0.12em', marginBottom:8 }}>DESCRIPCIÓN *</p>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe lo que ocurre..." rows={3}
          style={{ width:'100%', padding:'10px 12px', background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', resize:'none', fontFamily:'DM Sans', fontSize:13, outline:'none', marginBottom:8 }}
          onFocus={e => e.target.style.borderColor='var(--accent-border)'}
          onBlur={e  => e.target.style.borderColor='var(--border)'} />

        <p style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--text-faint)', marginBottom:14 }}>
          Visible para todos los usuarios del mapa en tiempo real
        </p>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onCancel} style={{ flex:1, padding:'10px', borderRadius:8, cursor:'pointer', background:'var(--bg-surface)', border:'1px solid var(--border)', color:'var(--text-muted)', fontFamily:'JetBrains Mono', fontSize:9, letterSpacing:'0.1em' }}>CANCELAR</button>
          <button onClick={handle} disabled={!desc.trim()||loading} style={{
            flex:2, padding:'10px', borderRadius:8, cursor: desc.trim()&&!loading?'pointer':'not-allowed',
            background: desc.trim()&&!loading ? 'var(--accent)' : 'var(--bg-surface)',
            border: `1px solid ${desc.trim()&&!loading ? '#ff5040' : 'var(--border)'}`,
            color: desc.trim()&&!loading ? '#fff' : 'var(--text-faint)',
            fontFamily:'JetBrains Mono', fontSize:9, letterSpacing:'0.1em', transition:'all .22s',
          }}>
            {loading ? 'ENVIANDO...' : 'ENVIAR REPORTE'}
          </button>
        </div>
      </div>
    </div>
  );
}

const MapBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    display:'flex', alignItems:'center', gap:7, padding:'8px 12px',
    background: active ? 'var(--accent-soft)' : 'var(--nav-bg)', backdropFilter:'blur(12px)',
    border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
    borderRadius:10, cursor:'pointer', color: active ? 'var(--accent)' : 'var(--text-muted)',
    fontFamily:'JetBrains Mono', fontSize:9, letterSpacing:'0.1em', transition:'all .22s',
  }}>{children}</button>
);

/* ── Main component ─────────────────────────────────────────── */
export default function MapPage() {
  const [incidents,    setIncidents]    = useState([]);
  const [heatPoints,   setHeatPoints]   = useState([]);
  const [vehicles,     setVehicles]     = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [cityName,     setCityName]     = useState('');
  const [locError,     setLocError]     = useState('');
  const [flyTo,        setFlyTo]        = useState(null);
  const [tracking,     setTracking]     = useState(false);
  const [showHeat,     setShowHeat]     = useState(true);
  const [reportMode,   setReportMode]   = useState(false);
  const [reportModal,  setReportModal]  = useState(false);
  const [clickedLL,    setClickedLL]    = useState(null);
  const [selected,     setSelected]     = useState(null);
  const [reported,     setReported]     = useState(false);
  const [loading,      setLoading]      = useState(true);
  const watchRef = useRef(null);

  // Default — Lima (si no hay geolocation)
  const DEFAULT = [-12.0464, -77.0428];

  /* ── Reverse geocode (city name) ──────────────────────────── */
  const getCityName = async (lat, lng) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`);
      const d = await r.json();
      const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || '';
      const state = d.address?.state || '';
      setCityName(city ? `${city}, ${state}` : state);
    } catch { setCityName(''); }
  };

  /* ── Get location ─────────────────────────────────────────── */
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocError('Tu navegador no soporta geolocalización'); return; }
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setFlyTo([loc.lat, loc.lng]);
        getCityName(loc.lat, loc.lng);
      },
      (err) => {
        if (err.code === 1) setLocError('Permiso de ubicación denegado. Actívalo en la barra de direcciones del navegador.');
        else setLocError('No se pudo obtener tu ubicación.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  /* ── Load data ────────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    try {
      const [inc, heat, vehs] = await Promise.all([
        alertService.getAll(),
        heatmapService.getPoints(),
        vehicleService.getAll(),
      ]);
      setIncidents(inc.filter(a => a.latitud && a.longitud));
      setHeatPoints(heat);
      setVehicles(vehs);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    requestLocation();
  }, [loadData, requestLocation]);

  /* ── Continuous tracking ──────────────────────────────────── */
  useEffect(() => {
    if (tracking) {
      watchRef.current = navigator.geolocation?.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setFlyTo([loc.lat, loc.lng]);
          getCityName(loc.lat, loc.lng);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    } else {
      if (watchRef.current !== null) {
        navigator.geolocation?.clearWatch(watchRef.current);
        watchRef.current = null;
      }
    }
    return () => { if (watchRef.current !== null) navigator.geolocation?.clearWatch(watchRef.current); };
  }, [tracking]);

  const handleConfirmReport = async () => {
    setReportModal(false); setClickedLL(null); setReportMode(false);
    setReported(true);
    await loadData();
    setTimeout(() => setReported(false), 3000);
  };

  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : DEFAULT;
  const vehicle   = vehicles[0] || null;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 56px)', overflow:'hidden', position:'relative' }}>

      {/* MAP */}
      <div style={{ flex:1, position:'relative', minHeight:0 }}>
        {loading ? (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-base)', zIndex:10 }}>
            <div style={{ textAlign:'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
                style={{ animation:'spin-cw 1s linear infinite', transformOrigin:'center', display:'block', margin:'0 auto 10px' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'var(--text-muted)' }}>CARGANDO MAPA...</span>
            </div>
          </div>
        ) : (
          <MapContainer center={mapCenter} zoom={14}
            style={{ width:'100%', height:'100%' }} zoomControl={false} attributionControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

            {showHeat && heatPoints.length > 0 && <HeatmapLayer points={heatPoints}/>}
            {flyTo && <FlyTo center={flyTo}/>}
            <ClickHandler onMapClick={(ll) => { setClickedLL(ll); setReportModal(true); }} active={reportMode}/>

            {/* User location */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={motoIcon}>
                <Popup>
                  <div style={{ fontFamily:'DM Sans', fontSize:12 }}>
                    <strong>Tu ubicación actual</strong>
                    {cityName && <p style={{ color:'#888', marginTop:4 }}>{cityName}</p>}
                    {vehicle && <p style={{ color:'#888', marginTop:2 }}>{vehicle.marca} {vehicle.modelo} · {vehicle.placa}</p>}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Incidents from DB */}
            {incidents.map(a => (
              <Marker key={a.id_alerta}
                position={[parseFloat(a.latitud), parseFloat(a.longitud)]}
                icon={incidentDot(sevColor(a.tipo_incidencia))}
                eventHandlers={{ click: () => setSelected(a) }}>
                <Popup>
                  <div style={{ fontFamily:'DM Sans', fontSize:12, minWidth:160 }}>
                    <strong style={{ color: sevColor(a.tipo_incidencia) }}>{a.tipo_incidencia}</strong>
                    <p style={{ color:'#888', marginTop:4, fontFamily:'JetBrains Mono', fontSize:10 }}>
                      {a.fecha_hora ? new Date(a.fecha_hora).toLocaleString('es-PE', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : ''}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Location error banner */}
        {locError && (
          <div style={{ position:'absolute', top:12, left:'50%', transform:'translateX(-50%)', zIndex:1500, background:'var(--amber-soft)', border:'1px solid var(--amber-border)', borderRadius:10, padding:'10px 16px', maxWidth:380, textAlign:'center' }}>
            <p style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'var(--amber)', letterSpacing:'0.08em' }}>{locError}</p>
            <button onClick={requestLocation} style={{ marginTop:8, padding:'5px 12px', background:'var(--amber)', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'JetBrains Mono', fontSize:9, color:'#000', letterSpacing:'0.08em' }}>
              INTENTAR DE NUEVO
            </button>
          </div>
        )}

        {/* Controls top left */}
        <div style={{ position:'absolute', top:12, left:12, zIndex:1000, display:'flex', flexDirection:'column', gap:8 }}>
          <MapBtn active={tracking} onClick={() => setTracking(t => !t)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
            {tracking ? 'SEGUIMIENTO ACTIVO' : 'SEGUIMIENTO OFF'}
          </MapBtn>
          <MapBtn active={showHeat} onClick={() => setShowHeat(h => !h)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/></svg>
            {showHeat ? 'CALOR ACTIVO' : 'CALOR OCULTO'}
          </MapBtn>
          <MapBtn active={reportMode} onClick={() => setReportMode(r => !r)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {reportMode ? 'CLIC EN MAPA...' : 'REPORTAR'}
          </MapBtn>
          {/* Center on my location */}
          <MapBtn active={false} onClick={() => { if (userLocation) setFlyTo([userLocation.lat, userLocation.lng]); else requestLocation(); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/></svg>
            MI UBICACIÓN
          </MapBtn>
        </div>

        {/* Top right */}
        <div style={{ position:'absolute', top:12, right:12, zIndex:1000, display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
          <ThemeToggle compact/>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', background:'var(--nav-bg)', backdropFilter:'blur(12px)', border:'1px solid var(--border)', borderRadius:8 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 5px var(--green)' }}/>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'var(--text-muted)' }}>
              {incidents.length} reporte{incidents.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ position:'absolute', bottom:16, left:12, zIndex:1000, background:'var(--nav-bg)', backdropFilter:'blur(12px)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 14px' }}>
          <p style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--text-muted)', letterSpacing:'0.13em', marginBottom:8 }}>LEYENDA</p>
          {[['#e03030','Riesgo crítico (Robo)'],['#f0a500','Riesgo moderado'],['#20c45a','Zona segura']].map(([c,l]) => (
            <div key={l} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
              <div style={{ width:22, height:3, background:c, borderRadius:2 }}/>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--text-secondary)' }}>{l}</span>
            </div>
          ))}
          {reportMode && <p style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--accent)', marginTop:8, letterSpacing:'0.06em' }}>Clic en el mapa para ubicar el reporte</p>}
        </div>

        {/* Report button */}
        {!reportMode && (
          <div style={{ position:'absolute', bottom:16, right:12, zIndex:1000 }}>
            <button onClick={() => {
              if (userLocation) { setClickedLL({ lat: userLocation.lat, lng: userLocation.lng }); setReportModal(true); }
              else { requestLocation(); setReportMode(true); }
            }} style={{
              display:'flex', alignItems:'center', gap:8, padding:'12px 18px',
              background: reported ? 'var(--green-soft)' : 'var(--accent)',
              border: `1px solid ${reported ? 'var(--green-border)' : '#ff5040'}`,
              borderRadius:12, cursor:'pointer', color: reported ? 'var(--green)' : '#fff',
              fontFamily:'JetBrains Mono', fontSize:10, letterSpacing:'0.1em',
              boxShadow: reported ? 'none' : '0 0 20px var(--accent-glow)', transition:'all .3s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {reported ? <polyline points="20 6 9 17 4 12"/> : <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}
              </svg>
              {reported ? 'REPORTADO' : 'REPORTAR INCIDENCIA'}
            </button>
          </div>
        )}

        {/* Selected incident popup */}
        {selected && (
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:1100, background:'var(--bg-card)', border:`1px solid ${sevColor(selected.tipo_incidencia)}44`, borderRadius:14, padding:'18px 22px', minWidth:240, boxShadow:`0 4px 24px ${sevColor(selected.tipo_incidencia)}30` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:4, height:36, background:sevColor(selected.tipo_incidencia), borderRadius:2 }}/>
                <div>
                  <p style={{ fontSize:13, fontWeight:500, color:'var(--text-primary)' }}>{selected.tipo_incidencia}</p>
                  <p style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'var(--text-muted)', marginTop:2 }}>
                    {selected.fecha_hora ? new Date(selected.fecha_hora).toLocaleString('es-PE', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:8, color:sevColor(selected.tipo_incidencia), background:`${sevColor(selected.tipo_incidencia)}15`, border:`1px solid ${sevColor(selected.tipo_incidencia)}30`, padding:'2px 8px', borderRadius:4 }}>
              {selected.estado_alerta?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* BOTTOM PANEL */}
      <div style={{ background:'var(--bg-surface)', borderTop:'1px solid var(--border)', padding:'14px 20px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <div>
              <p style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--text-muted)', letterSpacing:'0.12em', marginBottom:2 }}>
                {cityName ? cityName.toUpperCase() : 'UBICACIÓN ACTUAL'}
              </p>
              <p style={{ fontSize:13, fontWeight:500, color:'var(--text-primary)' }}>
                {userLocation ? `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}` : 'Esperando permiso de ubicación...'}
              </p>
            </div>
          </div>
          {!userLocation && (
            <button onClick={requestLocation} style={{ padding:'7px 14px', background:'var(--accent-soft)', border:'1px solid var(--accent-border)', borderRadius:8, cursor:'pointer', fontFamily:'JetBrains Mono', fontSize:9, color:'var(--accent)', letterSpacing:'0.1em' }}>
              ACTIVAR UBICACIÓN
            </button>
          )}
        </div>

        {/* Incidents list */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'var(--text-muted)', letterSpacing:'0.12em' }}>INCIDENCIAS EN EL MAPA</span>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--accent)', background:'var(--accent-soft)', border:'1px solid var(--accent-border)', padding:'2px 8px', borderRadius:4 }}>
              {incidents.length} total
            </span>
          </div>
          {incidents.length === 0 ? (
            <p style={{ fontFamily:'JetBrains Mono', fontSize:9, color:'var(--text-faint)', textAlign:'center', padding:'10px 0' }}>
              Sin incidencias reportadas — sé el primero en reportar
            </p>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))', gap:7, maxHeight:130, overflowY:'auto' }}>
              {incidents.map(a => (
                <button key={a.id_alerta} onClick={() => setSelected(a)}
                  className="mg-card mg-card-hover"
                  style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 12px', borderRadius:9, cursor:'pointer', textAlign:'left', background:'var(--bg-card)', border:'1px solid var(--border)', transition:'all .2s' }}>
                  <div style={{ width:3, height:28, background:sevColor(a.tipo_incidencia), borderRadius:2, flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:11, fontWeight:500, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.tipo_incidencia}</p>
                    <p style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--text-muted)', marginTop:1 }}>
                      {a.fecha_hora ? new Date(a.fecha_hora).toLocaleString('es-PE', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report modal */}
      {reportModal && (
        <ReportModal
          latlng={clickedLL || { lat: userLocation?.lat || DEFAULT[0], lng: userLocation?.lng || DEFAULT[1] }}
          vehicleId={vehicle?.id_vehiculo}
          onConfirm={handleConfirmReport}
          onCancel={() => { setReportModal(false); setClickedLL(null); }}
        />
      )}
    </div>
  );
}