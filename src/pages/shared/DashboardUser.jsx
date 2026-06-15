import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedRing from '../../components/ring/AnimatedRing';
import ThemeToggle from '../../components/ui/ThemeToggle';
import TarjetaPlan from '../../components/ui/TarjetaPlan';
import { useAuth } from '../../context/AuthContext';
import api, { vehicleService, alertService, routeService, ticketService, planService } from '../../services/api';
import { fmtDateTime } from '../../utils/dateUtils';

const Card = ({ children, style = {}, onClick }) => (
  <div className={`mg-card${onClick ? ' mg-card-hover' : ''}`} onClick={onClick}
    style={{ padding: '16px 18px', ...style, cursor: onClick ? 'pointer' : 'default' }}>
    {children}
  </div>
);

const Label = ({ children, action, onAction }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)' }}>{children}</span>
    {action && (
      <button onClick={onAction} style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
        {action}
      </button>
    )}
  </div>
);

const Dot = ({ color = 'var(--green)', pulse = false, size = 7 }) => (
  <div className={pulse ? 'anim-blink' : ''}
    style={{ width: size, height: size, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
);

const Vacio = ({ msg }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '20px 0' }}>{msg}</p>
);

const IconoMoto = ({ color = 'var(--accent)' }) => (
  <svg viewBox="0 0 32 22" width="22" height="15" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <circle cx="5" cy="17" r="4"/><circle cx="27" cy="17" r="4"/>
    <path d="M9 17L14 7L22 7L27 13"/><path d="M9 17L12 17L14 7"/><path d="M12 17L19 17"/>
  </svg>
);

const MODOS = {
  armed:     { label: 'ARMADO',     color: 'var(--accent)',     desc: 'Protección activa',  ringStatus: 'armed'     },
  disarmed:  { label: 'DESARMADO',  color: 'var(--text-muted)', desc: 'Sin protección',     ringStatus: 'disarmed'  },
  valet:     { label: 'MODO VALET', color: 'var(--cyan)',       desc: 'Velocidad limitada', ringStatus: 'valet'     },
  emergency: { label: 'EMERGENCIA', color: '#ff2222',           desc: 'Ayuda en camino',    ringStatus: 'emergency' },
};

const COLORES_SEVERIDAD = { high: 'var(--accent)', medium: 'var(--amber)', low: 'var(--green)' };

const severidadDeAlerta = (tipo = '') => {
  const t = tipo.toLowerCase();
  if (t.includes('robo'))       return 'high';
  if (t.includes('movimiento')) return 'medium';
  return 'low';
};

const estiloEstadoViaje = (estado) => ({
  color:      estado === 'completado' ? 'var(--green)' : estado === 'alerta' ? 'var(--accent)' : 'var(--amber)',
  background: estado === 'completado' ? 'var(--green-soft)' : estado === 'alerta' ? 'var(--accent-soft)' : 'var(--amber-soft)',
  border:     `1px solid ${estado === 'completado' ? 'var(--green-border)' : estado === 'alerta' ? 'var(--accent-border)' : 'var(--amber-border)'}`,
});

const ETIQUETAS_TIPO = {
  calibracion:  'Calibración',
  instalacion:  'Instalación',
  falla_sensor: 'Falla sensor',
  falla_ble:    'Falla BLE',
  otro:         'Otro',
};

const estiloInput = { width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

function ModalReportarProblema({ vehiculos, onClose, onCreado }) {
  const [form, setForm]       = useState({ tipo: 'falla_ble', titulo: '', descripcion: '', id_vehiculo: '' });
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const enviar = async () => {
    if (!form.titulo.trim() || !form.descripcion.trim())
      return setError('Título y descripción son obligatorios');
    setCargando(true);
    try {
      await ticketService.create({ tipo: form.tipo, titulo: form.titulo.trim(), descripcion: form.descripcion.trim(), id_vehiculo: form.id_vehiculo || null });
      onCreado();
    } catch (e) { setError(e.error || 'Error al crear ticket'); setCargando(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="mg-card" style={{ width: '100%', maxWidth: 460, padding: 26, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text-primary)', letterSpacing: '0.1em', lineHeight: 1 }}>REPORTAR PROBLEMA</h3>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>El equipo técnico lo revisará lo antes posible</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {error && (
          <div style={{ padding: '8px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, marginBottom: 14 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)' }}>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.1em' }}>TIPO DE PROBLEMA</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {Object.entries(ETIQUETAS_TIPO).map(([key, label]) => {
                const activo = form.tipo === key;
                return (
                  <button key={key} onClick={() => set('tipo', key)} style={{ padding: '8px 10px', borderRadius: 7, cursor: 'pointer', textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.06em', transition: 'all .15s', background: activo ? 'var(--accent-soft)' : 'var(--bg-surface)', border: `1px solid ${activo ? 'var(--accent-border)' : 'var(--border)'}`, color: activo ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>TÍTULO *</p>
            <input value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ej: El anillo no aparece en el Bluetooth"
              style={estiloInput} onFocus={e => e.target.style.borderColor = 'var(--accent-border)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>DESCRIPCIÓN *</p>
            <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              placeholder="Describe el problema con detalle: cuándo ocurre, qué intentaste hacer, si es la primera vez..." rows={4}
              style={{ ...estiloInput, resize: 'vertical', minHeight: 80 }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          {vehiculos.length > 0 && (
            <div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.1em' }}>VEHÍCULO AFECTADO (opcional)</p>
              <select value={form.id_vehiculo} onChange={e => set('id_vehiculo', e.target.value)} style={{ ...estiloInput, cursor: 'pointer' }}>
                <option value="">Sin vehículo específico</option>
                {vehiculos.map(v => <option key={v.id_vehiculo} value={v.id_vehiculo}>{v.marca} {v.modelo} — {v.placa}</option>)}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} disabled={cargando} style={{ flex: 1, padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>CANCELAR</button>
          <button onClick={enviar} disabled={cargando} style={{ flex: 2, padding: '12px', background: cargando ? 'var(--bg-surface)' : 'var(--accent)', border: `1px solid ${cargando ? 'var(--border)' : '#ff5040'}`, borderRadius: 9, cursor: cargando ? 'wait' : 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: cargando ? 'var(--text-muted)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {cargando ? 'ENVIANDO...' : 'ENVIAR REPORTE →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardUser() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [vehiculos,      setVehiculos]      = useState([]);
  const [vehiculoActivo, setVehiculoActivo] = useState(null);
  const [alertas,        setAlertas]        = useState([]);
  const [rutas,          setRutas]          = useState([]);
  const [modo,           setModo]           = useState('armed');
  const [cargando,       setCargando]       = useState(true);
  const [mostrarTicket,  setMostrarTicket]  = useState(false);
  const [ticketEnviado,  setTicketEnviado]  = useState(false);
  const [estadoPlan,     setEstadoPlan]     = useState(null);
  const [dispositivo,    setDispositivo]    = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [vehs, alts, rts, plan, dispositivo] = await Promise.all([
          vehicleService.getAll(),
          alertService.getAll(),
          routeService.getAll(),
          planService.estado().catch(() => null),
          api.get('/devices/estado').then(r => r.data).catch(() => null),
        ]);
        setVehiculos(vehs);
        if (vehs.length > 0) setVehiculoActivo(vehs[0]);
        setAlertas(alts.slice(0, 4));
        setRutas(rts.slice(0, 3));
        setEstadoPlan(plan);
        setDispositivo(dispositivo);
      } catch (e) { console.error(e); }
      setCargando(false);
    };
    cargarDatos();
  }, []);

  const ringStatus = MODOS[modo]?.ringStatus || 'disarmed';
  const planActivo = estadoPlan?.activo === true;

  const BloqueoPlan = ({ children, feature }) => {
    if (planActivo) return children;
    return (
      <div style={{ position: 'relative', userSelect: 'none' }}>
        <div style={{ filter: 'blur(2px)', pointerEvents: 'none', opacity: 0.4 }}>{children}</div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: 12, backdropFilter: 'blur(1px)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ marginBottom: 6 }}>
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 8 }}>Requiere plan activo</p>
          <button onClick={() => navigate('/plan')} style={{ padding: '5px 12px', background: 'var(--accent)', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 8, color: '#fff', letterSpacing: '0.06em' }}>
            ACTIVAR →
          </button>
        </div>
      </div>
    );
  };

  if (cargando) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
          style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto 12px' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>CARGANDO...</span>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 4 }}>
            BIENVENIDO, {(currentUser?.nombre_completo || '').split(' ')[0].toUpperCase()}
          </p>
          <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>
            {vehiculoActivo ? `${vehiculoActivo.marca} ${vehiculoActivo.modelo}` : 'SIN VEHÍCULO'}
          </h1>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            {vehiculoActivo
              ? `${vehiculoActivo.placa}${vehiculoActivo.color ? ` · ${vehiculoActivo.color}` : ''}`
              : 'Registra tu moto en Mi Perfil'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setMostrarTicket(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.08em', color: 'var(--text-muted)', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><line x1="9" y1="12" x2="15" y2="12"/></svg>
            REPORTAR PROBLEMA
          </button>
          <ThemeToggle compact />
        </div>
      </div>

      <TarjetaPlan estadoPlan={estadoPlan} />

      {vehiculos.length > 1 && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.14em', marginBottom: 8 }}>SELECCIONAR VEHÍCULO</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {vehiculos.map(v => {
              const activo = vehiculoActivo?.id_vehiculo === v.id_vehiculo;
              return (
                <button key={v.id_vehiculo} onClick={() => setVehiculoActivo(v)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
                  borderRadius: 10, cursor: 'pointer', transition: 'all .2s',
                  background: activo ? 'var(--accent-soft)' : 'var(--bg-card)',
                  border: `1px solid ${activo ? 'var(--accent-border)' : 'var(--border)'}`,
                }}>
                  <IconoMoto color={activo ? 'var(--accent)' : 'var(--text-muted)'} />
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: activo ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {v.marca} {v.modelo}
                    </p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>{v.placa}</p>
                  </div>
                  {activo && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 5px var(--accent)', marginLeft: 4 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {vehiculos.length === 0 && (
        <Card style={{ marginBottom: 20, background: 'var(--accent-soft)', border: '1px solid var(--accent-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>No tienes vehículos registrados</p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>Registra tu moto para usar todas las funciones</p>
            </div>
            <button onClick={() => navigate('/profile')} style={{ padding: '10px 18px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: '#fff' }}>
              IR A MI PERFIL →
            </button>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, alignItems: 'start' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <AnimatedRing status={ringStatus} size={210} />
            {vehiculoActivo && (
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>DISPOSITIVO BLE</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: dispositivo?.conectado ? 'var(--green)' : 'var(--text-faint)', boxShadow: dispositivo?.conectado ? '0 0 5px var(--green)' : 'none', transition: 'all .3s' }} />
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: dispositivo?.conectado ? 'var(--green)' : 'var(--text-muted)' }}>
                      {dispositivo?.conectado ? 'CONECTADO' : dispositivo ? 'SIN SEÑAL' : 'Pendiente vinculación'}
                    </span>
                  </div>
                </div>
                {dispositivo?.conectado && dispositivo?.ultimo_ping && (
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginBottom: 6 }}>
                    Última señal: {new Date(dispositivo.ultimo_ping).toLocaleTimeString('es-PE', { timeZone: 'America/Lima' })}
                    {dispositivo?.bateria_pct != null && ` · Batería ${dispositivo.bateria_pct}%`}
                  </p>
                )}
                <div style={{ height: 3, borderRadius: 2, background: dispositivo?.conectado ? 'var(--green-soft)' : 'var(--border)', overflow: 'hidden' }}>
                  {dispositivo?.conectado && <div className="anim-blink" style={{ height: '100%', width: '100%', background: 'var(--green)', borderRadius: 2, opacity: 0.6 }} />}
                </div>
              </div>
            )}
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'VER EN MAPA', path: '/map',      color: 'var(--cyan)'           },
              { label: 'MIS RUTAS',   path: '/routes',   color: 'var(--text-secondary)' },
              { label: 'AJUSTES',     path: '/settings', color: 'var(--amber)'          },
              { label: 'MI PERFIL',   path: '/profile',  color: 'var(--text-secondary)' },
            ].map(q => (
              <button key={q.path} onClick={() => navigate(q.path)} style={{ padding: '12px 10px', borderRadius: 10, cursor: 'pointer', background: 'var(--bg-card)', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: q.color }}>
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <BloqueoPlan feature="modos">
          <Card>
            <Label>MODOS DE SEGURIDAD</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(MODOS).map(([clave, m]) => {
                const activo = modo === clave;
                return (
                  <button key={clave} onClick={() => setModo(clave)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                    background: activo ? 'var(--accent-soft)' : 'var(--bg-surface)',
                    border: `1px solid ${activo ? 'var(--accent-border)' : 'var(--border)'}`,
                    borderRadius: 10, cursor: 'pointer', transition: 'all .22s', textAlign: 'left',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0, boxShadow: activo ? `0 0 6px ${m.color}` : 'none' }} />
                    <div>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: activo ? m.color : 'var(--text-muted)', display: 'block' }}>{m.label}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', display: 'block' }}>{m.desc}</span>
                    </div>
                    {activo && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: m.color, boxShadow: `0 0 5px ${m.color}` }} />}
                  </button>
                );
              })}
            </div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginTop: 10, textAlign: 'center' }}>
              Control físico disponible al conectar anillo BLE
            </p>
          </Card>
          </BloqueoPlan>

          <BloqueoPlan feature="alertas">
          <Card>
            <Label action="VER TODAS →" onAction={() => navigate('/map')}>MIS ALERTAS</Label>
            {alertas.length === 0 ? <Vacio msg="Sin alertas registradas" /> :
              alertas.map((a, i) => {
                const sev   = severidadDeAlerta(a.tipo_incidencia);
                const color = COLORES_SEVERIDAD[sev];
                return (
                  <div key={a.id_alerta} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < alertas.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <Dot color={color} pulse={a.estado_alerta === 'pendiente'} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{a.tipo_incidencia}</span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color }}>{a.estado_alerta?.toUpperCase()}</span>
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{fmtDateTime(a.fecha_hora)}</span>
                    </div>
                  </div>
                );
              })
            }
          </Card>
          </BloqueoPlan>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <BloqueoPlan feature="rutas">
          <Card>
            <Label action="VER TODAS →" onAction={() => navigate('/routes')}>MIS RUTAS RECIENTES</Label>
            {rutas.length === 0 ? <Vacio msg="Sin rutas registradas" /> :
              rutas.map((r, i) => {
                const estilo = estiloEstadoViaje(r.estado_viaje);
                return (
                  <div key={r.id_ruta} style={{ padding: '10px 0', borderBottom: i < rutas.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)' }}>{fmtDateTime(r.fecha_inicio)}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, padding: '1px 6px', borderRadius: 4, ...estilo }}>
                        {r.estado_viaje?.toUpperCase()}
                      </span>
                    </div>
                    {r.distancia_km && (
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 300, color: 'var(--text-primary)' }}>
                        {parseFloat(r.distancia_km).toFixed(1)} km
                      </span>
                    )}
                  </div>
                );
              })
            }
          </Card>
          </BloqueoPlan>

          <BloqueoPlan feature="vehiculo">
          {vehiculoActivo && (
            <Card>
              <Label>VEHÍCULO ACTIVO</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconoMoto />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{vehiculoActivo.marca} {vehiculoActivo.modelo}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    {vehiculoActivo.placa}{vehiculoActivo.anio ? ` · ${vehiculoActivo.anio}` : ''}{vehiculoActivo.color ? ` · ${vehiculoActivo.color}` : ''}
                  </p>
                  {vehiculos.length > 1 && (
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', marginTop: 4 }}>
                      {vehiculos.indexOf(vehiculoActivo) + 1} de {vehiculos.length} vehículos
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => navigate('/profile')} style={{ width: '100%', padding: '9px', borderRadius: 8, cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                EDITAR EN MI PERFIL →
              </button>
            </Card>
          )}
          </BloqueoPlan>
        </div>

      </div>

      {ticketEnviado && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: 'var(--green-soft)', border: '1px solid var(--green-border)', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--green)' }}>Ticket enviado correctamente</span>
        </div>
      )}

      {mostrarTicket && (
        <ModalReportarProblema
          vehiculos={vehiculos}
          onClose={() => setMostrarTicket(false)}
          onCreado={() => { setMostrarTicket(false); setTicketEnviado(true); setTimeout(() => setTicketEnviado(false), 4000); }}
        />
      )}
    </div>
  );
}