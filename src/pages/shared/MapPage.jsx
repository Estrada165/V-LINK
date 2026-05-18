import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { alertService, heatmapService, vehicleService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { fmtDateTime } from '../../utils/dateUtils';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

const colorPorTipo = (tipo) => {
  if (!tipo) return '#f0a500';
  const t = tipo.toLowerCase();
  if (t.includes('robo') || t.includes('emergencia')) return '#e03030';
  if (t.includes('sospech') || t.includes('accidente') || t.includes('peligr')) return '#f0a500';
  return '#20c45a';
};

const tiempoTranscurrido = (fecha) => {
  if (!fecha) return '';
  const mins = (Date.now() - new Date(fecha).getTime()) / 60000;
  if (mins < 60)    return `Hace ${Math.round(mins)} min`;
  if (mins < 1440)  return `Hace ${Math.round(mins / 60)}h`;
  if (mins < 10080) return `Hace ${Math.round(mins / 1440)} días`;
  return fmtDateTime(fecha);
};

const badgePorFecha = (fecha) => {
  if (!fecha) return { label: '', color: 'var(--text-muted)', bg: 'var(--bg-surface)' };
  const dias = (Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24);
  if (dias <= 1)  return { label: 'HOY',     color: 'var(--accent)', bg: 'var(--accent-soft)' };
  if (dias <= 7)  return { label: 'SEMANA',  color: 'var(--amber)',  bg: 'var(--amber-soft)'  };
  if (dias <= 30) return { label: 'MES',     color: 'var(--cyan)',   bg: 'var(--cyan-soft)'   };
  return               { label: 'ANTIGUO', color: 'var(--text-muted)', bg: 'var(--bg-surface)' };
};

const iconoMoto = new L.DivIcon({
  html: `<div style="width:40px;height:40px;background:#e03030;border:2px solid #ff6060;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(224,48,48,.7);">
    <svg viewBox="0 0 32 22" width="22" height="15" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round">
      <circle cx="5" cy="17" r="4"/><circle cx="27" cy="17" r="4"/>
      <path d="M9 17L14 7L22 7L27 13"/><path d="M9 17L12 17L14 7"/><path d="M12 17L19 17"/>
    </svg>
  </div>`,
  className: '', iconSize: [40, 40], iconAnchor: [20, 20],
});

const iconoIncidente = (color) => new L.DivIcon({
  html: `<div style="width:14px;height:14px;background:${color};border-radius:50%;box-shadow:0 0 10px ${color};border:2px solid #fff;"></div>`,
  className: '', iconSize: [14, 14], iconAnchor: [7, 7],
});

function CapaHeatmap({ puntos }) {
  const mapa = useMap();
  const capaRef = useRef(null);

  useEffect(() => {
    if (capaRef.current) { capaRef.current.remove(); capaRef.current = null; }
    if (!puntos.length) return;

    const CapaCanvas = L.Layer.extend({
      onAdd(m) {
        this._map = m;
        const sz = m.getSize();
        this._canvas = L.DomUtil.create('canvas');
        this._canvas.width = sz.x;
        this._canvas.height = sz.y;
        Object.assign(this._canvas.style, { position: 'absolute', top: 0, left: 0, zIndex: 400, pointerEvents: 'none' });
        m.getPanes().overlayPane.appendChild(this._canvas);
        m.on('moveend zoomend resize', this._dibujar, this);
        this._dibujar();
      },
      onRemove(m) {
        m.off('moveend zoomend resize', this._dibujar, this);
        if (this._canvas?.parentNode) this._canvas.parentNode.removeChild(this._canvas);
      },
      _dibujar() {
        const m = this._map;
        const sz = m.getSize();
        this._canvas.width = sz.x;
        this._canvas.height = sz.y;
        const ctx = this._canvas.getContext('2d');
        ctx.clearRect(0, 0, sz.x, sz.y);
        L.DomUtil.setPosition(this._canvas, m.containerPointToLayerPoint([0, 0]));
        puntos.forEach(({ lat, lng, weight }) => {
          const pt  = m.latLngToContainerPoint([lat, lng]);
          const r   = 35 + weight * 40;
          const g   = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
          const col = weight > 0.65 ? '224,48,48' : weight > 0.35 ? '240,165,0' : '32,196,90';
          const a   = Math.min(weight * 0.6, 0.55);
          g.addColorStop(0,   `rgba(${col},${a})`);
          g.addColorStop(0.5, `rgba(${col},${a * 0.4})`);
          g.addColorStop(1,   `rgba(${col},0)`);
          ctx.beginPath(); ctx.fillStyle = g; ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2); ctx.fill();
        });
      },
    });

    const capa = new CapaCanvas();
    capaRef.current = capa;
    capa.addTo(mapa);
    return () => { if (capaRef.current) { capaRef.current.remove(); capaRef.current = null; } };
  }, [mapa, puntos]);

  return null;
}

function VolarA({ centro, onFin }) {
  const mapa = useMap();
  useEffect(() => {
    if (!centro) return;
    mapa.flyTo(centro, 15, { duration: 1.5 });
    const t = setTimeout(() => onFin(), 1600);
    return () => clearTimeout(t);
  }, [centro, mapa, onFin]);
  return null;
}

function ManejadorClic({ onClic, activo }) {
  useMapEvents({ click: (e) => { if (activo) onClic(e.latlng); } });
  return null;
}

function ModalEliminar({ onConfirmar, onCancelar, cargando }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="mg-card" style={{ width: '100%', maxWidth: 300, padding: 24, textAlign: 'center' }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </div>
        <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 8 }}>ELIMINAR REPORTE</h3>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, lineHeight: 1.6 }}>¿Eliminar este reporte del mapa?</p>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginBottom: 20, lineHeight: 1.6 }}>Desaparecerá para todos los usuarios y no se puede deshacer.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancelar} disabled={cargando} style={{ flex: 1, padding: '11px', borderRadius: 9, cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>CANCELAR</button>
          <button onClick={onConfirmar} disabled={cargando} style={{ flex: 2, padding: '11px', borderRadius: 9, cursor: cargando ? 'wait' : 'pointer', background: cargando ? 'var(--bg-surface)' : 'var(--accent)', border: `1px solid ${cargando ? 'var(--border)' : '#ff5040'}`, fontFamily: 'JetBrains Mono', fontSize: 10, color: cargando ? 'var(--text-muted)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            {cargando ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>ELIMINANDO...</> : 'SÍ, ELIMINAR'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalReporte({ latlng, vehiculoId, onConfirmar, onCancelar }) {
  const [categoria,   setCategoria]   = useState('Robo');
  const [descripcion, setDescripcion] = useState('');
  const [cargando,    setCargando]    = useState(false);
  const categorias = ['Robo', 'Presencia sospechosa', 'Accidente', 'Zona peligrosa', 'Otro'];

  const enviar = async () => {
    if (!descripcion.trim()) return;
    setCargando(true);
    try {
      await alertService.report({ id_vehiculo: vehiculoId || null, tipo_incidencia: `${categoria}: ${descripcion}`, latitud: latlng.lat, longitud: latlng.lng });
      onConfirmar();
    } catch (e) { console.error(e); setCargando(false); }
  };

  const puedeEnviar = descripcion.trim() && !cargando;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="mg-card" style={{ width: '100%', maxWidth: 330, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 20, color: 'var(--text-primary)', letterSpacing: '0.1em', lineHeight: 1 }}>REPORTAR INCIDENCIA</h3>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginTop: 3 }}>{latlng.lat.toFixed(5)}, {latlng.lng.toFixed(5)}</p>
          </div>
          <button onClick={onCancelar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>TIPO</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {categorias.map(c => (
            <button key={c} onClick={() => setCategoria(c)} style={{ padding: '5px 9px', borderRadius: 6, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 8, transition: 'all .15s', background: categoria === c ? 'var(--accent-soft)' : 'var(--bg-surface)', border: `1px solid ${categoria === c ? 'var(--accent-border)' : 'var(--border)'}`, color: categoria === c ? 'var(--accent)' : 'var(--text-muted)' }}>
              {c}
            </button>
          ))}
        </div>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>DESCRIPCIÓN *</p>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Describe lo que ocurre..." rows={3}
          style={{ width: '100%', padding: '9px 11px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', resize: 'none', fontFamily: 'DM Sans', fontSize: 13, outline: 'none', marginBottom: 6 }}
          onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
          onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-faint)', marginBottom: 12 }}>Visible para todos · Se desactiva automáticamente a los 30 días</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancelar} style={{ flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 9 }}>CANCELAR</button>
          <button onClick={enviar} disabled={!puedeEnviar} style={{ flex: 2, padding: '10px', borderRadius: 8, cursor: puedeEnviar ? 'pointer' : 'not-allowed', background: puedeEnviar ? 'var(--accent)' : 'var(--bg-surface)', border: `1px solid ${puedeEnviar ? '#ff5040' : 'var(--border)'}`, color: puedeEnviar ? '#fff' : 'var(--text-faint)', fontFamily: 'JetBrains Mono', fontSize: 9, transition: 'all .2s' }}>
            {cargando ? 'ENVIANDO...' : 'ENVIAR REPORTE'}
          </button>
        </div>
      </div>
    </div>
  );
}

const BotonMapa = ({ activo, onClick, children }) => (
  <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 11px', background: activo ? 'var(--accent-soft)' : 'var(--nav-bg)', backdropFilter: 'blur(12px)', border: `1px solid ${activo ? 'var(--accent-border)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', color: activo ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.08em', transition: 'all .2s', whiteSpace: 'nowrap' }}>
    {children}
  </button>
);

const FILTROS_TIEMPO = [
  { key: 'today',   label: 'HOY',       dias: 1    },
  { key: 'week',    label: 'SEMANA',    dias: 7    },
  { key: 'month',   label: 'MES',       dias: 30   },
  { key: 'quarter', label: 'TRIMESTRE', dias: 90   },
  { key: 'all',     label: 'TODO',      dias: 9999 },
];

export default function MapPage() {
  const { currentUser } = useAuth();
  const puedeReportar = currentUser?.rol !== 'tecnico';

  const [todasIncidencias, setTodasIncidencias] = useState([]);
  const [incidencias,      setIncidencias]      = useState([]);
  const [puntosCalor,      setPuntosCalor]      = useState([]);
  const [vehiculos,        setVehiculos]        = useState([]);
  const [ubicacion,        setUbicacion]        = useState(null);
  const [nombreCiudad,     setNombreCiudad]     = useState('');
  const [errorUbic,        setErrorUbic]        = useState('');
  const [volarA,           setVolarA]           = useState(null);
  const [seguimiento,      setSeguimiento]      = useState(false);
  const [mostrarCalor,     setMostrarCalor]     = useState(true);
  const [modoReporte,      setModoReporte]      = useState(false);
  const [modalReporte,     setModalReporte]     = useState(false);
  const [coordsClic,       setCoordsClic]       = useState(null);
  const [seleccionada,     setSeleccionada]     = useState(null);
  const [reporteEnviado,   setReporteEnviado]   = useState(false);
  const [cargando,         setCargando]         = useState(true);
  const [filtroTiempo,     setFiltroTiempo]     = useState('week');
  const [modalEliminar,    setModalEliminar]    = useState(null);
  const [eliminando,       setEliminando]       = useState(false);
  const [esDesktop,        setEsDesktop]        = useState(window.innerWidth >= 768);

  const watchRef = useRef(null);
  const CENTRO_DEFAULT = [-5.1945, -80.6328];

  useEffect(() => {
    const actualizar = () => setEsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', actualizar);
    return () => window.removeEventListener('resize', actualizar);
  }, []);

  useEffect(() => {
    const filtro = FILTROS_TIEMPO.find(f => f.key === filtroTiempo);
    if (!filtro) return;
    const corte = Date.now() - filtro.dias * 24 * 60 * 60 * 1000;
    setIncidencias(todasIncidencias.filter(a => !a.fecha_hora || new Date(a.fecha_hora).getTime() >= corte));
  }, [filtroTiempo, todasIncidencias]);

  const obtenerCiudad = async (lat, lng) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`);
      const d = await r.json();
      const ciudad = d.address?.city || d.address?.town || d.address?.village || d.address?.county || '';
      setNombreCiudad(ciudad ? `${ciudad}, ${d.address?.state || ''}` : d.address?.state || '');
    } catch { setNombreCiudad(''); }
  };

  const solicitarUbicacion = useCallback(() => {
    if (!navigator.geolocation) { setErrorUbic('Geolocalización no soportada'); return; }
    setErrorUbic('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUbicacion(loc);
        setVolarA([loc.lat, loc.lng]);
        obtenerCiudad(loc.lat, loc.lng);
      },
      (err) => setErrorUbic(err.code === 1 ? 'Permiso denegado. Actívalo en el navegador.' : 'No se pudo obtener la ubicación.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const cargarDatos = useCallback(async () => {
    try {
      const [inc, calor, vehs] = await Promise.all([
        alertService.getAll(),
        heatmapService.getPoints(),
        vehicleService.getMine().catch(() => []),
      ]);
      setTodasIncidencias(Array.isArray(inc) ? inc.filter(a => a.latitud && a.longitud) : []);
      setPuntosCalor(Array.isArray(calor) ? calor : []);
      setVehiculos(Array.isArray(vehs) ? vehs : []);
    } catch (e) { console.error(e); }
    setCargando(false);
  }, []);

  useEffect(() => { cargarDatos(); solicitarUbicacion(); }, [cargarDatos, solicitarUbicacion]);

  useEffect(() => {
    if (seguimiento) {
      watchRef.current = navigator.geolocation?.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUbicacion(loc); setVolarA([loc.lat, loc.lng]); obtenerCiudad(loc.lat, loc.lng);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    } else {
      if (watchRef.current !== null) { navigator.geolocation?.clearWatch(watchRef.current); watchRef.current = null; }
    }
    return () => { if (watchRef.current !== null) navigator.geolocation?.clearWatch(watchRef.current); };
  }, [seguimiento]);

  const confirmarEliminar = async () => {
    setEliminando(true);
    try {
      await alertService.delete(modalEliminar);
      setModalEliminar(null);
      setSeleccionada(null);
      await cargarDatos();
    } catch (err) { alert(err.error || 'Error al eliminar'); }
    setEliminando(false);
  };

  const confirmarReporte = async () => {
    setModalReporte(false); setCoordsClic(null); setModoReporte(false);
    setReporteEnviado(true);
    await cargarDatos();
    setTimeout(() => setReporteEnviado(false), 3000);
  };

  const vehiculo = vehiculos[0] || null;

  return (
    <div style={{ display: 'flex', flexDirection: esDesktop ? 'row' : 'column', height: 'calc(100vh - 56px)', overflow: 'hidden', position: 'relative' }}>

      <div style={{ flex: 1, position: 'relative', minHeight: esDesktop ? 0 : '55vh', minWidth: 0 }}>
        {cargando ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto 10px' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>CARGANDO MAPA...</span>
            </div>
          </div>
        ) : (
          <MapContainer center={CENTRO_DEFAULT} zoom={14} style={{ width: '100%', height: '100%' }} zoomControl={false} attributionControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            {mostrarCalor && puntosCalor.length > 0 && <CapaHeatmap puntos={puntosCalor}/>}
            {volarA && <VolarA centro={volarA} onFin={() => setVolarA(null)}/>}
            <ManejadorClic onClic={(ll) => { setCoordsClic(ll); setModalReporte(true); }} activo={modoReporte}/>
            {ubicacion && (
              <Marker position={[ubicacion.lat, ubicacion.lng]} icon={iconoMoto}/>
            )}
            {incidencias.map(a => (
              <Marker key={a.id_alerta} position={[parseFloat(a.latitud), parseFloat(a.longitud)]} icon={iconoIncidente(colorPorTipo(a.tipo_incidencia))} eventHandlers={{ click: () => setSeleccionada(a) }}/>
            ))}
          </MapContainer>
        )}

        {errorUbic && (
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1500, background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', borderRadius: 10, padding: '10px 14px', maxWidth: 300, textAlign: 'center' }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--amber)' }}>{errorUbic}</p>
            <button onClick={solicitarUbicacion} style={{ marginTop: 6, padding: '4px 10px', background: 'var(--amber)', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 8, color: '#000' }}>REINTENTAR</button>
          </div>
        )}

        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <BotonMapa activo={seguimiento} onClick={() => setSeguimiento(s => !s)}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
            {seguimiento ? 'ACTIVO' : 'SEGUIMIENTO'}
          </BotonMapa>
          <BotonMapa activo={mostrarCalor} onClick={() => setMostrarCalor(h => !h)}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/></svg>
            {mostrarCalor ? 'CALOR ON' : 'CALOR OFF'}
          </BotonMapa>
          {puedeReportar && (
            <BotonMapa activo={modoReporte} onClick={() => setModoReporte(r => !r)}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              {modoReporte ? 'CLIC EN MAPA...' : 'REPORTAR'}
            </BotonMapa>
          )}
          <BotonMapa activo={false} onClick={() => { if (ubicacion) setVolarA([ubicacion.lat, ubicacion.lng]); else solicitarUbicacion(); }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/></svg>
            MI UBICACIÓN
          </BotonMapa>
        </div>

        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
          <ThemeToggle compact/>
        </div>

        <div style={{ position: 'absolute', bottom: 12, left: 10, zIndex: 1000, background: 'var(--nav-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>LEYENDA</p>
          {[['#e03030', 'Riesgo crítico (Robo)'], ['#f0a500', 'Riesgo moderado'], ['#20c45a', 'Zona segura']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <div style={{ width: 16, height: 3, background: c, borderRadius: 2 }}/>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-secondary)' }}>{l}</span>
            </div>
          ))}
        </div>

        {seleccionada && (
          <div style={{ position: 'absolute', top: '50%', left: esDesktop ? '40%' : '50%', transform: 'translate(-50%, -50%)', zIndex: 1100, background: 'var(--bg-card)', border: `1px solid ${colorPorTipo(seleccionada.tipo_incidencia)}44`, borderRadius: 14, padding: '16px 18px', minWidth: 220, maxWidth: 270, boxShadow: `0 4px 20px ${colorPorTipo(seleccionada.tipo_incidencia)}25` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 }}>
                <div style={{ width: 4, height: 32, background: colorPorTipo(seleccionada.tipo_incidencia), borderRadius: 2, flexShrink: 0 }}/>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{seleccionada.tipo_incidencia}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginTop: 2 }}>{tiempoTranscurrido(seleccionada.fecha_hora)}</p>
                </div>
              </div>
              <button onClick={() => setSeleccionada(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0, marginLeft: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: colorPorTipo(seleccionada.tipo_incidencia), background: `${colorPorTipo(seleccionada.tipo_incidencia)}15`, border: `1px solid ${colorPorTipo(seleccionada.tipo_incidencia)}30`, padding: '2px 7px', borderRadius: 4 }}>REPORTADO</span>
              {currentUser?.rol === 'admin' && (
                <button onClick={() => setModalEliminar(seleccionada.id_alerta)} style={{ padding: '4px 10px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 6, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--accent)' }}>ELIMINAR</button>
              )}
            </div>
          </div>
        )}

        {modalReporte && (
          <ModalReporte
            latlng={coordsClic || { lat: ubicacion?.lat || CENTRO_DEFAULT[0], lng: ubicacion?.lng || CENTRO_DEFAULT[1] }}
            vehiculoId={vehiculo?.id_vehiculo}
            onConfirmar={confirmarReporte}
            onCancelar={() => { setModalReporte(false); setCoordsClic(null); }}
          />
        )}

        {modalEliminar && (
          <ModalEliminar onConfirmar={confirmarEliminar} onCancelar={() => setModalEliminar(null)} cargando={eliminando}/>
        )}
      </div>

      <div style={{ width: esDesktop ? 280 : '100%', height: esDesktop ? '100%' : '45vh', flexShrink: 0, background: 'var(--bg-surface)', borderLeft: esDesktop ? '1px solid var(--border)' : 'none', borderTop: esDesktop ? 'none' : '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 1 }}>{nombreCiudad ? nombreCiudad.toUpperCase() : 'UBICACIÓN'}</p>
                <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {ubicacion ? `${ubicacion.lat.toFixed(4)}, ${ubicacion.lng.toFixed(4)}` : 'Activa la ubicación'}
                </p>
              </div>
            </div>
            {!ubicacion && (
              <button onClick={solicitarUbicacion} style={{ padding: '5px 10px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 7, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--accent)' }}>ACTIVAR</button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>PERÍODO:</span>
            {FILTROS_TIEMPO.map(f => (
              <button key={f.key} onClick={() => setFiltroTiempo(f.key)} style={{ padding: '3px 8px', borderRadius: 5, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 7, background: filtroTiempo === f.key ? 'var(--accent-soft)' : 'var(--bg-card)', border: `1px solid ${filtroTiempo === f.key ? 'var(--accent-border)' : 'var(--border)'}`, color: filtroTiempo === f.key ? 'var(--accent)' : 'var(--text-muted)' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '8px 14px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>INCIDENCIAS</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>{incidencias.length} reporte{incidencias.length !== 1 ? 's' : ''}</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 10px' }}>
          {incidencias.length === 0 ? (
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-faint)', textAlign: 'center', padding: '24px 0' }}>Sin incidencias en este período</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {incidencias.map(a => {
                const badge        = badgePorFecha(a.fecha_hora);
                const color        = colorPorTipo(a.tipo_incidencia);
                const esSelec      = seleccionada?.id_alerta === a.id_alerta;
                return (
                  <div key={a.id_alerta} onClick={() => setSeleccionada(esSelec ? null : a)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 9, cursor: 'pointer', background: esSelec ? 'var(--accent-soft)' : 'var(--bg-card)', border: `1px solid ${esSelec ? 'var(--accent-border)' : 'var(--border)'}`, transition: 'all .15s' }}>
                    <div style={{ width: 3, height: 34, background: color, borderRadius: 2, flexShrink: 0 }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.tipo_incidencia}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 6, color: badge.color, background: badge.bg, padding: '1px 5px', borderRadius: 3 }}>{badge.label}</span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-faint)' }}>{tiempoTranscurrido(a.fecha_hora)}</span>
                      </div>
                    </div>
                    {currentUser?.rol === 'admin' && (
                      <button onClick={(e) => { e.stopPropagation(); setModalEliminar(a.id_alerta); }}
                        style={{ padding: '3px 6px', background: 'none', border: '1px solid var(--border)', borderRadius: 5, cursor: 'pointer', color: 'var(--text-faint)', fontFamily: 'JetBrains Mono', fontSize: 8, flexShrink: 0 }}>✕</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ padding: '10px 14px 12px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {puedeReportar && (
            <button onClick={() => {
              if (ubicacion) { setCoordsClic({ lat: ubicacion.lat, lng: ubicacion.lng }); setModalReporte(true); }
              else { solicitarUbicacion(); setModoReporte(true); }
            }} style={{ width: '100%', padding: '10px', borderRadius: 10, cursor: 'pointer', background: reporteEnviado ? 'var(--green-soft)' : 'var(--accent)', border: `1px solid ${reporteEnviado ? 'var(--green-border)' : '#ff5040'}`, color: reporteEnviado ? 'var(--green)' : '#fff', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: reporteEnviado ? 'none' : '0 0 14px var(--accent-glow)', transition: 'all .3s' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {reporteEnviado ? <polyline points="20 6 9 17 4 12"/> : <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}
              </svg>
              {reporteEnviado ? 'ENVIADO' : 'REPORTAR INCIDENCIA'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}