import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { planService } from '../../services/api';

const fmtFecha = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Lima'
  });
};

const FEATURES_PLAN = [
  'Todo lo del plan gratuito',
  'Vehículos ilimitados',
  'Configuración del anillo IoT',
  'Ver y gestionar alertas propias',
  'Historial de rutas completo',
  'Reportar incidencias en el mapa',
  'Contactos de emergencia ilimitados',
  'Tickets con prioridad media (más rápido)',
];

const FEATURES_SIN_PLAN = [
  'Acceso al dashboard',
  'Registrar 1 vehículo',
  '1 contacto de emergencia',
  'Ver mapa (solo lectura)',
  'Crear tickets de soporte (prioridad baja)',
  'Perfil y cambio de contraseña',
  'Ajustes de apariencia',
];

const METODOS_PAGO = [
  { id: 'yape',       label: 'Yape',       tipo: 'billetera', color: '#6C1D8E', icon: '📱' },
  { id: 'plin',       label: 'Plin',       tipo: 'billetera', color: '#00A859', icon: '📱' },
  { id: 'visa',       label: 'Visa',       tipo: 'tarjeta',   color: '#1A1F71', icon: '💳' },
  { id: 'mastercard', label: 'Mastercard', tipo: 'tarjeta',   color: '#EB001B', icon: '💳' },
  { id: 'bcp',        label: 'BCP',        tipo: 'banco',     color: '#004B8D', icon: '🏦' },
  { id: 'interbank',  label: 'Interbank',  tipo: 'banco',     color: '#00A050', icon: '🏦' },
];

const COLOR_METODO = {
  yape: '#6C1D8E', plin: '#00A859', visa: '#1A1F71',
  mastercard: '#EB001B', bcp: '#004B8D', interbank: '#00A050',
};

function TarjetaEstadoPlan({ estado, onRenovar, onActivar }) {
  if (!estado) return null;
  const { activo, por_vencer, dias_restantes, fecha_fin, fecha_inicio, precio } = estado;

  if (!activo) {
    return (
      <div style={{ padding: '20px 22px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text-faint)' }} />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SIN PLAN ACTIVO</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'DM Sans', marginBottom: 14, lineHeight: 1.5 }}>
          Activa tu plan para acceder a todas las funciones de MOTOGUARD V-LINK.
        </p>
        <button onClick={onActivar} style={{ padding: '10px 20px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: '#fff', letterSpacing: '0.08em' }}>
          ACTIVAR PLAN — S/. {precio?.toFixed(2)}/mes →
        </button>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((dias_restantes / 30) * 100));
  const colorBarra = por_vencer ? 'var(--accent)' : 'var(--green)';

  return (
    <div style={{ padding: '20px 22px', background: por_vencer ? 'var(--accent-soft)' : 'var(--green-soft)', border: `1px solid ${por_vencer ? 'var(--accent-border)' : 'var(--green-border)'}`, borderRadius: 12, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: colorBarra, boxShadow: `0 0 8px ${colorBarra}` }} />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: por_vencer ? 'var(--accent)' : 'var(--green)', letterSpacing: '0.1em' }}>
            PLAN ACTIVO {por_vencer ? '— VENCE PRONTO' : ''}
          </span>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
          {dias_restantes} <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)' }}>días restantes</span>
        </span>
      </div>

      <div style={{ height: 6, background: 'var(--bg-base)', borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: colorBarra, borderRadius: 3, transition: 'width 1s ease' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', marginBottom: 2 }}>ACTIVO DESDE</p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-secondary)' }}>{fmtFecha(fecha_inicio)}</p>
        </div>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', marginBottom: 2 }}>PRÓXIMA FACTURACIÓN</p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-secondary)' }}>{fmtFecha(fecha_fin)}</p>
        </div>
      </div>

      {por_vencer && (
        <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.1)', borderRadius: 8, marginBottom: 12 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)' }}>
            ⚠ Tu plan vence en {dias_restantes} días. Renueva para no perder el acceso.
          </p>
        </div>
      )}

      <button onClick={onRenovar} style={{ padding: '10px 20px', background: 'var(--amber)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: '#000', fontWeight: 600, letterSpacing: '0.08em' }}>
        RENOVAR PLAN — S/. {precio?.toFixed(2)}/mes →
      </button>
    </div>
  );
}

function ModalSimularPago({ tipo, precio, fechaFin, onClose, onConfirmar }) {
  const [paso,         setPaso]         = useState(1);
  const [metodoPago,   setMetodoPago]   = useState(null);
  const [error,        setError]        = useState('');

  const handlePagar = async () => {
    if (!metodoPago) return setError('Selecciona un método de pago');
    setError('');
    setPaso(2);
    await new Promise(r => setTimeout(r, 2500));
    setPaso(3);
    await new Promise(r => setTimeout(r, 1000));
    onConfirmar(metodoPago);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div className="mg-card" style={{ width: '100%', maxWidth: 460, padding: 28, margin: 'auto' }}>

        {paso === 1 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div>
                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text-primary)', letterSpacing: '0.1em', lineHeight: 1 }}>PASARELA DE PAGO</h3>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>SIMULACIÓN · Culqi Perú</p>
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-secondary)' }}>Plan MOTOGUARD V-LINK</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 16, color: 'var(--text-primary)', fontWeight: 700 }}>S/. {precio?.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>FACTURACIÓN MENSUAL</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>
                  {tipo === 'renovar' ? `RENOVACIÓN · hasta ${fmtFecha(fechaFin)}` : 'NUEVA SUSCRIPCIÓN'}
                </span>
              </div>
            </div>

            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>
              SELECCIONA TU MÉTODO DE PAGO
            </p>

            <div style={{ marginBottom: 8 }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-faint)', marginBottom: 8 }}>BILLETERAS DIGITALES</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {METODOS_PAGO.filter(m => m.tipo === 'billetera').map(m => (
                  <button key={m.id} onClick={() => { setMetodoPago(m.id); setError(''); }}
                    style={{ padding: '10px 14px', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s', background: metodoPago === m.id ? 'var(--amber-soft)' : 'var(--bg-surface)', border: `2px solid ${metodoPago === m.id ? 'var(--amber-border)' : 'var(--border)'}` }}>
                    <img src={`/logos/${m.id}.png`} alt={m.label}
                      style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }}
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <span style={{ display: 'none', width: 28, height: 28, borderRadius: 6, background: `${COLOR_METODO[m.id]}22`, alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{m.icon}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: metodoPago === m.id ? 'var(--amber)' : 'var(--text-secondary)', letterSpacing: '0.06em' }}>{m.label}</span>
                    {metodoPago === m.id && <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                ))}
              </div>

              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-faint)', marginBottom: 8 }}>TARJETAS</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {METODOS_PAGO.filter(m => m.tipo === 'tarjeta').map(m => (
                  <button key={m.id} onClick={() => { setMetodoPago(m.id); setError(''); }}
                    style={{ padding: '10px 14px', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s', background: metodoPago === m.id ? 'var(--amber-soft)' : 'var(--bg-surface)', border: `2px solid ${metodoPago === m.id ? 'var(--amber-border)' : 'var(--border)'}` }}>
                    <img src={`/logos/${m.id}.png`} alt={m.label}
                      style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }}
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <span style={{ display: 'none', width: 28, height: 28, borderRadius: 6, background: `${COLOR_METODO[m.id]}22`, alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{m.icon}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: metodoPago === m.id ? 'var(--amber)' : 'var(--text-secondary)', letterSpacing: '0.06em' }}>{m.label}</span>
                    {metodoPago === m.id && <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                ))}
              </div>

              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-faint)', marginBottom: 8 }}>BANCA ONLINE</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {METODOS_PAGO.filter(m => m.tipo === 'banco').map(m => (
                  <button key={m.id} onClick={() => { setMetodoPago(m.id); setError(''); }}
                    style={{ padding: '10px 14px', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s', background: metodoPago === m.id ? 'var(--amber-soft)' : 'var(--bg-surface)', border: `2px solid ${metodoPago === m.id ? 'var(--amber-border)' : 'var(--border)'}` }}>
                    <img src={`/logos/${m.id}.png`} alt={m.label}
                      style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }}
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <span style={{ display: 'none', width: 28, height: 28, borderRadius: 6, background: `${COLOR_METODO[m.id]}22`, alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{m.icon}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: metodoPago === m.id ? 'var(--amber)' : 'var(--text-secondary)', letterSpacing: '0.06em' }}>{m.label}</span>
                    {metodoPago === m.id && <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ padding: '8px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, marginBottom: 12 }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)' }}>{error}</span>
              </div>
            )}

            <div style={{ padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 16 }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--amber)', marginBottom: 4, letterSpacing: '0.06em' }}>⚠ ENTORNO DE SIMULACIÓN</p>
              <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Este formulario simula el flujo de una pasarela de pago real. <strong style={{ color: 'var(--text-secondary)' }}>No se procesan pagos reales, no se realizan cargos a ninguna tarjeta o billetera, y ninguna transacción financiera ocurre.</strong> Los datos ingresados son ficticios y no son almacenados ni enviados a ningún procesador de pagos.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>
                CANCELAR
              </button>
              <button onClick={handlePagar} style={{ flex: 2, padding: '12px', background: metodoPago ? 'var(--amber)' : 'var(--bg-surface)', border: `1px solid ${metodoPago ? 'var(--amber-border)' : 'var(--border)'}`, borderRadius: 9, cursor: metodoPago ? 'pointer' : 'not-allowed', fontFamily: 'JetBrains Mono', fontSize: 10, color: metodoPago ? '#000' : 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.08em' }}>
                PAGAR S/. {precio?.toFixed(2)} →
              </button>
            </div>
          </>
        )}

        {paso === 2 && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" style={{ animation: 'spin-cw 1s linear infinite', display: 'block', margin: '0 auto 16px' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 8 }}>PROCESANDO PAGO</h3>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginBottom: 4 }}>
              Conectando con {METODOS_PAGO.find(m => m.id === metodoPago)?.label}...
            </p>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>Validando transacción</p>
          </div>
        )}

        {paso === 3 && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--green-soft)', border: '2px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: 'var(--green)', letterSpacing: '0.1em', marginBottom: 8 }}>¡PAGO EXITOSO!</h3>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>Activando tu plan...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlanPage() {
  const navigate = useNavigate();
  const [estado,     setEstado]     = useState(null);
  const [cargando,   setCargando]   = useState(true);
  const [modalTipo,  setModalTipo]  = useState(null);
  const [exito,      setExito]      = useState(null);

  const cargar = useCallback(async () => {
    try { const d = await planService.estado(); setEstado(d); } catch {}
    setCargando(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const confirmarPago = async (metodoPago) => {
    try {
      const res = await planService.simularPago(modalTipo, metodoPago);
      setExito(res);
      setModalTipo(null);
      await cargar();
    } catch (e) { console.error(e); }
  };

  if (cargando) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ animation: 'spin-cw 1s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 60px' }}>

      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 9, marginBottom: 16 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          VOLVER AL DASHBOARD
        </button>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'var(--text-primary)', letterSpacing: '0.1em', lineHeight: 1, marginBottom: 4 }}>PLAN DE SUSCRIPCIÓN</h1>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>MOTOGUARD V-LINK · Facturación mensual el mismo día de cada mes</p>
      </div>

      {exito && (
        <div style={{ padding: '14px 16px', background: 'var(--green-soft)', border: '1px solid var(--green-border)', borderRadius: 10, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--green)' }}>{exito.mensaje}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
            {[
              ['REFERENCIA', exito.referencia],
              ['MONTO', `S/. ${exito.monto?.toFixed(2)}`],
              ['MÉTODO', exito.metodo_pago?.toUpperCase()],
            ].map(([k, v]) => (
              <div key={k}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', marginBottom: 2 }}>{k}</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-secondary)' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <TarjetaEstadoPlan
        estado={estado}
        onRenovar={() => setModalTipo('renovar')}
        onActivar={() => setModalTipo('activar')}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <div className="mg-card" style={{ padding: '18px 20px' }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 10 }}>SIN PLAN</p>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: 'var(--text-faint)', letterSpacing: '0.05em', marginBottom: 14 }}>GRATUITO</p>
          {FEATURES_SIN_PLAN.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{f}</span>
            </div>
          ))}
        </div>

        <div className="mg-card" style={{ padding: '18px 20px', border: '1px solid var(--accent-border)', background: 'var(--accent-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--accent)', letterSpacing: '0.1em' }}>PLAN MOTOGUARD</p>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, background: 'var(--accent)', padding: '2px 6px', borderRadius: 4, color: '#fff' }}>RECOMENDADO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>S/. 29.90</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>/mes</span>
          </div>
          {FEATURES_PLAN.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mg-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--amber)', letterSpacing: '0.08em', marginBottom: 4 }}>AVISO IMPORTANTE — SIMULACIÓN</p>
          <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            El proceso de pago mostrado en esta plataforma es una <strong style={{ color: 'var(--text-secondary)' }}>simulación académica</strong>. No se integra ninguna pasarela de pago real, no se procesan transacciones financieras y ningún cobro es efectuado. Los métodos de pago mostrados (billeteras digitales, tarjetas y banca online) representan cómo funcionaría el flujo en un entorno de producción real.
          </p>
        </div>
      </div>

      {modalTipo && (
        <ModalSimularPago
          tipo={modalTipo}
          precio={estado?.precio}
          fechaFin={estado?.fecha_fin}
          onClose={() => setModalTipo(null)}
          onConfirmar={confirmarPago}
        />
      )}
    </div>
  );
}