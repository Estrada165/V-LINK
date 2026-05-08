import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { alertService, heatmapService, vehicleService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import { fmtDateTime } from '../utils/dateUtils';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

const sevColor = (tipo) => {
  if (!tipo) return '#f0a500';
  const t = tipo.toLowerCase();
  if (t.includes('robo') || t.includes('emergencia')) return '#e03030';
  if (t.includes('sospech') || t.includes('accidente') || t.includes('peligr')) return '#f0a500';
  return '#20c45a';
};

const getAgeLabel = (fecha) => {
  if (!fecha) return '';
  const mins = (Date.now() - new Date(fecha).getTime()) / 60000;
  if (mins < 60)    return `Hace ${Math.round(mins)} min`;
  if (mins < 1440)  return `Hace ${Math.round(mins/60)}h`;
  if (mins < 10080) return `Hace ${Math.round(mins/1440)} días`;
  return fmtDateTime(fecha);
};

const getAgeBadge = (fecha) => {
  if (!fecha) return { label:'', color:'var(--text-muted)', bg:'var(--bg-surface)' };
  const dias = (Date.now() - new Date(fecha).getTime()) / (1000*60*60*24);
  if (dias <= 1)  return { label:'HOY',    color:'var(--accent)',     bg:'var(--accent-soft)' };
  if (dias <= 7)  return { label:'SEMANA', color:'var(--amber)',      bg:'var(--amber-soft)' };
  if (dias <= 30) return { label:'MES',    color:'var(--cyan)',       bg:'var(--cyan-soft)' };
  return               { label:'ANTIGUO', color:'var(--text-muted)', bg:'var(--bg-surface)' };
};

const motoIcon = new L.DivIcon({
  html:`<div style="width:40px;height:40px;background:#e03030;border:2px solid #ff6060;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(224,48,48,.7);">
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

/* ── Heatmap ────────────────────────────────────────────────── */
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
        ctx.clearRect(0,0,sz.x,sz.y);
        L.DomUtil.setPosition(this._canvas, m.containerPointToLayerPoint([0,0]));
        points.forEach(({ lat, lng, weight }) => {
          const pt = m.latLngToContainerPoint([lat, lng]);
          const r = 35 + weight * 40;
          const g = ctx.createRadialGradient(pt.x,pt.y,0,pt.x,pt.y,r);
          const col = weight > 0.65 ? '224,48,48' : weight > 0.35 ? '240,165,0' : '32,196,90';
          const a = Math.min(weight * 0.6, 0.55);
          g.addColorStop(0, `rgba(${col},${a})`);
          g.addColorStop(0.5, `rgba(${col},${a*0.4})`);
          g.addColorStop(1, `rgba(${col},0)`);
          ctx.beginPath(); ctx.fillStyle = g; ctx.arc(pt.x,pt.y,r,0,Math.PI*2); ctx.fill();
        });
      },
    });
    const layer = new CanvasLayer(); layerRef.current = layer; layer.addTo(map);
    return () => { if (layerRef.current) { layerRef.current.remove(); layerRef.current = null; } };
  }, [map, points]);
  return null;
}

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 15, { duration: 1.5 }); }, [center, map]);
  return null;
}

function ClickHandler({ onMapClick, active }) {
  useMapEvents({ click: (e) => { if (active) onMapClick(e.latlng); } });
  return null;
}

/* ── Delete Modal ───────────────────────────────────────────── */
function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:3000, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="mg-card" style={{ width:'100%', maxWidth:300, padding:24, textAlign:'center' }}>
        <div style={{ width:50, height:50, borderRadius:'50%', background:'var(--accent-soft)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </div>
        <h3 style={{ fontFamily:'Bebas Neue', fontSize:22, color:'var(--text-primary)', letterSpacing:'0.1em', marginBottom:8 }}>ELIMINAR REPORTE</h3>
        <p style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'var(--text-muted)', marginBottom:4, lineHeight:1.6 }}>
          ¿Eliminar este reporte del mapa?
        </p>
        <p style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--text-faint)', marginBottom:20, lineHeight:1.6 }}>
          Desaparecerá para todos los usuarios y no se puede deshacer.
        </p>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel} disabled={loading} style={{ flex:1, padding:'11px', borderRadius:9, cursor:'pointer', background:'var(--bg-surface)', border:'1px solid var(--border)', fontFamily:'JetBrains Mono', fontSize:10, color:'var(--text-muted)', letterSpacing:'0.08em' }}>
            CANCELAR
          </button>
          <button onClick={onConfirm} disabled={loading} style={{
            flex:2, padding:'11px', borderRadius:9, cursor: loading ? 'wait' : 'pointer',
            background: loading ? 'var(--bg-surface)' : 'var(--accent)',
            border: `1px solid ${loading ? 'var(--border)' : '#ff5040'}`,
            fontFamily:'JetBrains Mono', fontSize:10, letterSpacing:'0.08em',
            color: loading ? 'var(--text-muted)' : '#fff',
            display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'all .2s',
          }}>
            {loading
              ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:'spin-cw 1s linear infinite', transformOrigin:'center' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>ELIMINANDO...</>
              : 'SÍ, ELIMINAR'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Report modal ───────────────────────────────────────────── */
function ReportModal({ latlng, vehicleId, onConfirm, onCancel }) {
  const [category, setCategory] = useState('Robo');
  const [desc,     setDesc]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const cats = ['Robo','Presencia sospechosa','Accidente','Zona peligrosa','Otro'];

  const handle = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    try {
      await alertService.report({ id_vehiculo: vehicleId || null, tipo_incidencia:`${category}: ${desc}`, latitud: latlng.lat, longitud: latlng.lng });
      onConfirm();
    } catch (e) { console.error(e); setLoading(false); }
  };

  return (
    <div style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="mg-card" style={{ width:'100%', maxWidth:330, padding:22 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
          <div>
            <h3 style={{ fontFamily:'Bebas Neue', fontSize:20, color:'var(--text-primary)', letterSpacing:'0.1em', lineHeight:1 }}>REPORTAR INCIDENCIA</h3>
            <p style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--text-muted)', marginTop:3 }}>{latlng.lat.toFixed(5)}, {latlng.lng.toFixed(5)}</p>
          </div>
          <button onClick={onCancel} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <p style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--text-muted)', letterSpacing:'0.1em', marginBottom:8 }}>TIPO</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding:'5px 9px', borderRadius:6, cursor:'pointer', fontFamily:'JetBrains Mono', fontSize:8, transition:'all .15s',
              background: category===c ? 'var(--accent-soft)' : 'var(--bg-surface)',
              border: `1px solid ${category===c ? 'var(--accent-border)' : 'var(--border)'}`,
              color: category===c ? 'var(--accent)' : 'var(--text-muted)',
            }}>{c}</button>
          ))}
        </div>
        <p style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--text-muted)', letterSpacing:'0.1em', marginBottom:6 }}>DESCRIPCIÓN *</p>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe lo que ocurre..." rows={3}
          style={{ width:'100%', padding:'9px 11px', background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', resize:'none', fontFamily:'DM Sans', fontSize:13, outline:'none', marginBottom:6 }}
          onFocus={e => e.target.style.borderColor='var(--accent-border)'}
          onBlur={e  => e.target.style.borderColor='var(--border)'} />
        <p style={{ fontFamily:'JetBrains Mono', fontSize:7, color:'var(--text-faint)', marginBottom:12 }}>
          Visible para todos · Se desactiva automáticamente a los 30 días
        </p>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onCancel} style={{ flex:1, padding:'10px', borderRadius:8, cursor:'pointer', background:'var(--bg-surface)', border:'1px solid var(--border)', color:'var(--text-muted)', fontFamily:'JetBrains Mono', fontSize:9 }}>CANCELAR</button>
          <button onClick={handle} disabled={!desc.trim()||loading} style={{
            flex:2, padding:'10px', borderRadius:8, cursor: desc.trim()&&!loading?'pointer':'not-allowed',
            background: desc.trim()&&!loading?'var(--accent)':'var(--bg-surface)',
            border: `1px solid ${desc.trim()&&!loading?'#ff5040':'var(--border)'}`,
            color: desc.trim()&&!loading?'#fff':'var(--text-faint)',
            fontFamily:'JetBrains Mono', fontSize:9, transition:'all .2s',
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
    display:'flex', alignItems:'center', gap:6, padding:'7px 11px',
    background: active?'var(--accent-soft)':'var(--nav-bg)', backdropFilter:'blur(12px)',
    border: `1px solid ${active?'var(--accent-border)':'var(--border)'}`,
    borderRadius:10, cursor:'pointer', color: active?'var(--accent)':'var(--text-muted)',
    fontFamily:'JetBrains Mono', fontSize:8, letterSpacing:'0.08em', transition:'all .2s', whiteSpace:'nowrap',
  }}>{children}</button>
);

const TIME_FILTERS = [
  { key:'today',   label:'HOY',      days:1 },
  { key:'week',    label:'SEMANA',   days:7 },
  { key:'month',   label:'MES',      days:30 },
  { key:'quarter', label:'TRIMESTRE',days:90 },
  { key:'all',     label:'TODO',     days:9999 },
];

/* ── MapPage ─────────────────────────────────────────────────── */
export default function MapPage() {
  const { currentUser, isAdmin } = useAuth();
  const [allIncidents, setAllIncidents] = useState([]);
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
  const [timeFilter,   setTimeFilter]   = useState('week');
  const [deleteModal,  setDeleteModal]  = useState(null); // id de alerta a eliminar
  const [deletingId,   setDeletingId]   = useState(false);
  const watchRef = useRef(null);
  const DEFAULT = [-5.1945, -80.6328];

  /* ── Filtro por tiempo ────────────────────────────────────── */
  useEffect(() => {
    const tf = TIME_FILTERS.find(f => f.key === timeFilter);
    if (!tf) return;
    const cutoff = Date.now() - tf.days * 24 * 60 * 60 * 1000;
    setIncidents(allIncidents.filter(a => !a.fecha_hora || new Date(a.fecha_hora).getTime() >= cutoff));
  }, [timeFilter, allIncidents]);

  const getCityName = async (lat, lng) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`);
      const d = await r.json();
      const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || '';
      setCityName(city ? `${city}, ${d.address?.state || ''}` : d.address?.state || '');
    } catch { setCityName(''); }
  };

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocError('Geolocalización no soportada'); return; }
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc); setFlyTo([loc.lat, loc.lng]); getCityName(loc.lat, loc.lng);
      },
      (err) => {
        if (err.code === 1) setLocError('Permiso denegado. Actívalo en el navegador.');
        else setLocError('No se pudo obtener la ubicación.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [inc, heat, vehs] = await Promise.all([alertService.getAll(), heatmapService.getPoints(), vehicleService.getAll()]);
      setAllIncidents(inc.filter(a => a.latitud && a.longitud));
      setHeatPoints(heat);
      setVehicles(vehs);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); requestLocation(); }, [loadData, requestLocation]);

  useEffect(() => {
    if (tracking) {
      watchRef.current = navigator.geolocation?.watchPosition(
        (pos) => { const loc = { lat:pos.coords.latitude, lng:pos.coords.longitude }; setUserLocation(loc); setFlyTo([loc.lat,loc.lng]); getCityName(loc.lat,loc.lng); },
        () => {}, { enableHighAccuracy:true, maximumAge:5000 }
      );
    } else {
      if (watchRef.current !== null) { navigator.geolocation?.clearWatch(watchRef.current); watchRef.current = null; }
    }
    return () => { if (watchRef.current !== null) navigator.geolocation?.clearWatch(watchRef.current); };
  }, [tracking]);

  /* ── Delete ───────────────────────────────────────────────── */
  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeleteModal(id);
  };

  const confirmDelete = async () => {
    setDeletingId(true);
    try {
      await alertService.delete(deleteModal);
      setDeleteModal(null);
      setSelected(null);
      await loadData();
    } catch (err) {
      alert(err.error || 'Error al eliminar');
    }
    setDeletingId(false);
  };

  const handleConfirmReport = async () => {
    setReportModal(false); setClickedLL(null); setReportMode(false);
    setReported(true); await loadData();
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ animation:'spin-cw 1s linear infinite', transformOrigin:'center', display:'block', margin:'0 auto 10px' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:10, color:'var(--text-muted)' }}>CARGANDO MAPA...</span>
            </div>
          </div>
        ) : (
          <MapContainer center={mapCenter} zoom={14} style={{ width:'100%', height:'100%' }} zoomControl={false} attributionControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            {showHeat && heatPoints.length > 0 && <HeatmapLayer points={heatPoints}/>}
            {flyTo && <FlyTo center={flyTo}/>}
            <ClickHandler onMapClick={(ll) => { setClickedLL(ll); setReportModal(true); }} active={reportMode}/>
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
            {incidents.map(a => (
              <Marker key={a.id_alerta} position={[parseFloat(a.latitud), parseFloat(a.longitud)]} icon={incidentDot(sevColor(a.tipo_incidencia))} eventHandlers={{ click: () => setSelected(a) }}>
                <Popup>
                  <div style={{ fontFamily:'DM Sans', fontSize:12, minWidth:150 }}>
                    <strong style={{ color: sevColor(a.tipo_incidencia) }}>{a.tipo_incidencia}</strong>
                    <p style={{ color:'#888', marginTop:4, fontFamily:'JetBrains Mono', fontSize:9 }}>{getAgeLabel(a.fecha_hora)}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Location error */}
        {locError && (
          <div style={{ position:'absolute', top:10, left:'50%', transform:'translateX(-50%)', zIndex:1500, background:'var(--amber-soft)', border:'1px solid var(--amber-border)', borderRadius:10, padding:'10px 14px', maxWidth:300, textAlign:'center' }}>
            <p style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--amber)' }}>{locError}</p>
            <button onClick={requestLocation} style={{ marginTop:6, padding:'4px 10px', background:'var(--amber)', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'JetBrains Mono', fontSize:8, color:'#000' }}>REINTENTAR</button>
          </div>
        )}

        {/* CONTROLS TOP LEFT */}
        <div style={{ position:'absolute', top:10, left:10, zIndex:1000, display:'flex', flexDirection:'column', gap:6 }}>
          <MapBtn active={tracking} onClick={() => setTracking(t => !t)}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
            {tracking ? 'ACTIVO' : 'SEGUIMIENTO'}
          </MapBtn>
          <MapBtn active={showHeat} onClick={() => setShowHeat(h => !h)}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/></svg>
            {showHeat ? 'CALOR ON' : 'CALOR OFF'}
          </MapBtn>
          <MapBtn active={reportMode} onClick={() => setReportMode(r => !r)}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {reportMode ? 'CLIC...' : 'REPORTAR'}
          </MapBtn>
          <MapBtn active={false} onClick={() => { if (userLocation) setFlyTo([userLocation.lat, userLocation.lng]); else requestLocation(); }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/></svg>
            MI UBICACIÓN
          </MapBtn>
        </div>

        {/* TOP RIGHT */}
        <div style={{ position:'absolute', top:10, right:10, zIndex:1000, display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
          <ThemeToggle compact/>
          <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 9px', background:'var(--nav-bg)', backdropFilter:'blur(12px)', border:'1px solid var(--border)', borderRadius:8 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 5px var(--green)' }}/>
            <span style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--text-muted)' }}>{incidents.length} reporte{incidents.length!==1?'s':''}</span>
          </div>
        </div>

        {/* LEGEND */}
        <div style={{ position:'absolute', bottom:12, left:10, zIndex:1000, background:'var(--nav-bg)', backdropFilter:'blur(12px)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 12px' }}>
          <p style={{ fontFamily:'JetBrains Mono', fontSize:7, color:'var(--text-muted)', letterSpacing:'0.1em', marginBottom:6 }}>LEYENDA</p>
          {[['#e03030','Riesgo crítico (Robo)'],['#f0a500','Riesgo moderado'],['#20c45a','Zona segura']].map(([c,l]) => (
            <div key={l} style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
              <div style={{ width:16, height:3, background:c, borderRadius:2 }}/>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:7, color:'var(--text-secondary)' }}>{l}</span>
            </div>
          ))}
        </div>

        {/* REPORT BUTTON */}
        {!reportMode && (
          <div style={{ position:'absolute', bottom:12, right:10, zIndex:1000 }}>
            <button onClick={() => {
              if (userLocation) { setClickedLL({ lat:userLocation.lat, lng:userLocation.lng }); setReportModal(true); }
              else { requestLocation(); setReportMode(true); }
            }} style={{
              display:'flex', alignItems:'center', gap:7, padding:'10px 14px',
              background: reported?'var(--green-soft)':'var(--accent)',
              border: `1px solid ${reported?'var(--green-border)':'#ff5040'}`,
              borderRadius:12, cursor:'pointer', color: reported?'var(--green)':'#fff',
              fontFamily:'JetBrains Mono', fontSize:9, letterSpacing:'0.08em',
              boxShadow: reported?'none':'0 0 16px var(--accent-glow)', transition:'all .3s',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {reported?<polyline points="20 6 9 17 4 12"/>:<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}
              </svg>
              {reported?'ENVIADO':'REPORTAR'}
            </button>
          </div>
        )}

        {/* SELECTED INCIDENT */}
        {selected && (
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:1100, background:'var(--bg-card)', border:`1px solid ${sevColor(selected.tipo_incidencia)}44`, borderRadius:14, padding:'16px 18px', minWidth:220, maxWidth:270, boxShadow:`0 4px 20px ${sevColor(selected.tipo_incidencia)}25` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, flex:1, minWidth:0 }}>
                <div style={{ width:4, height:32, background:sevColor(selected.tipo_incidencia), borderRadius:2, flexShrink:0 }}/>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:500, color:'var(--text-primary)', wordBreak:'break-word' }}>{selected.tipo_incidencia}</p>
                  <p style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--text-muted)', marginTop:2 }}>{getAgeLabel(selected.fecha_hora)}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', flexShrink:0, marginLeft:6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:8, color:sevColor(selected.tipo_incidencia), background:`${sevColor(selected.tipo_incidencia)}15`, border:`1px solid ${sevColor(selected.tipo_incidencia)}30`, padding:'2px 7px', borderRadius:4 }}>
                REPORTADO
              </span>
              {isAdmin && (
                <button onClick={(e) => handleDeleteClick(e, selected.id_alerta)} style={{ padding:'4px 10px', background:'var(--accent-soft)', border:'1px solid var(--accent-border)', borderRadius:6, cursor:'pointer', fontFamily:'JetBrains Mono', fontSize:8, color:'var(--accent)' }}>
                  ELIMINAR
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM PANEL */}
      <div style={{ background:'var(--bg-surface)', borderTop:'1px solid var(--border)', padding:'10px 14px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <div>
              <p style={{ fontFamily:'JetBrains Mono', fontSize:7, color:'var(--text-muted)', letterSpacing:'0.1em', marginBottom:1 }}>
                {cityName ? cityName.toUpperCase() : 'UBICACIÓN'}
              </p>
              <p style={{ fontSize:11, fontWeight:500, color:'var(--text-primary)' }}>
                {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Activa la ubicación'}
              </p>
            </div>
          </div>
          {!userLocation && (
            <button onClick={requestLocation} style={{ padding:'5px 10px', background:'var(--accent-soft)', border:'1px solid var(--accent-border)', borderRadius:7, cursor:'pointer', fontFamily:'JetBrains Mono', fontSize:8, color:'var(--accent)' }}>ACTIVAR</button>
          )}
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8, flexWrap:'wrap' }}>
          <span style={{ fontFamily:'JetBrains Mono', fontSize:7, color:'var(--text-muted)', letterSpacing:'0.08em', flexShrink:0 }}>PERÍODO:</span>
          {TIME_FILTERS.map(f => (
            <button key={f.key} onClick={() => setTimeFilter(f.key)} style={{
              padding:'3px 8px', borderRadius:5, cursor:'pointer', transition:'all .15s',
              fontFamily:'JetBrains Mono', fontSize:7, letterSpacing:'0.05em',
              background: timeFilter===f.key?'var(--accent-soft)':'var(--bg-card)',
              border: `1px solid ${timeFilter===f.key?'var(--accent-border)':'var(--border)'}`,
              color: timeFilter===f.key?'var(--accent)':'var(--text-muted)',
            }}>{f.label}</button>
          ))}
          <span style={{ fontFamily:'JetBrains Mono', fontSize:7, color:'var(--text-faint)', marginLeft:'auto' }}>{incidents.length} resultado{incidents.length!==1?'s':''}</span>
        </div>

        {/* Lista incidencias */}
        {incidents.length === 0 ? (
          <p style={{ fontFamily:'JetBrains Mono', fontSize:8, color:'var(--text-faint)', textAlign:'center', padding:'6px 0' }}>
            Sin incidencias en este período
          </p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:5, maxHeight:110, overflowY:'auto' }}>
            {incidents.map(a => {
              const age = getAgeBadge(a.fecha_hora);
              return (
                <div key={a.id_alerta} onClick={() => setSelected(a)}
                  style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 9px', borderRadius:7, cursor:'pointer', background:'var(--bg-card)', border:'1px solid var(--border)', transition:'all .15s', position:'relative' }}>
                  <div style={{ width:3, height:24, background:sevColor(a.tipo_incidencia), borderRadius:2, flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:10, fontWeight:500, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.tipo_incidencia}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:3, marginTop:2 }}>
                      <span style={{ fontFamily:'JetBrains Mono', fontSize:6, color:age.color, background:age.bg, padding:'1px 4px', borderRadius:3 }}>{age.label}</span>
                      <span style={{ fontFamily:'JetBrains Mono', fontSize:6, color:'var(--text-faint)' }}>{getAgeLabel(a.fecha_hora)}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <button onClick={(e) => handleDeleteClick(e, a.id_alerta)} style={{ padding:'2px 4px', background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)', fontSize:10, flexShrink:0 }}>✕</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALS */}
      {reportModal && (
        <ReportModal
          latlng={clickedLL || { lat: userLocation?.lat||DEFAULT[0], lng: userLocation?.lng||DEFAULT[1] }}
          vehicleId={vehicle?.id_vehiculo}
          onConfirm={handleConfirmReport}
          onCancel={() => { setReportModal(false); setClickedLL(null); }}
        />
      )}

      {deleteModal && (
        <DeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal(null)}
          loading={deletingId}
        />
      )}
    </div>
  );
}