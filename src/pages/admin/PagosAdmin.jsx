import React, { useState, useEffect, useCallback } from 'react';
import { pagoService } from '../../services/api';

const fmtDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima'
  });
};

const fmtFecha = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Lima'
  });
};

const ETIQUETA_METODO = {
  yape: 'Yape', plin: 'Plin', visa: 'Visa',
  mastercard: 'Mastercard', bcp: 'BCP', interbank: 'Interbank',
};

const COLOR_METODO = {
  yape: '#6C1D8E', plin: '#00A859', visa: '#1A1F71',
  mastercard: '#EB001B', bcp: '#004B8D', interbank: '#00A050',
};

const BadgeMetodo = ({ metodo }) => (
  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, padding: '3px 8px', borderRadius: 5, background: `${COLOR_METODO[metodo] || '#555'}22`, color: COLOR_METODO[metodo] || 'var(--text-muted)', border: `1px solid ${COLOR_METODO[metodo] || '#555'}44` }}>
    {ETIQUETA_METODO[metodo] || metodo}
  </span>
);

const BadgeTipo = ({ tipo }) => {
  const colores = {
    activacion:  { bg: 'var(--green-soft)',  border: 'var(--green-border)',  color: 'var(--green)',  label: 'Activación'  },
    renovacion:  { bg: 'var(--cyan-soft)',   border: 'var(--cyan-border)',   color: 'var(--cyan)',   label: 'Renovación'  },
  };
  const c = colores[tipo] || { bg: 'var(--bg-surface)', border: 'var(--border)', color: 'var(--text-muted)', label: tipo };
  return (
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, padding: '3px 8px', borderRadius: 5, background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
      {c.label}
    </span>
  );
};

const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '16px 18px', ...style }}>{children}</div>
);

export default function PagosAdmin() {
  const [datos,      setDatos]      = useState({ pagos: [], total_recaudado: 0, count: 0 });
  const [subs,       setSubs]       = useState({ stats: {} });
  const [cargando,   setCargando]   = useState(true);
  const [busqueda,   setBusqueda]   = useState('');
  const [filtMetodo, setFiltMetodo] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [pagosData, subsData] = await Promise.all([
        pagoService.getAll({ search: busqueda, metodo: filtMetodo }),
        pagoService.getSuscripciones(),
      ]);
      setDatos(pagosData);
      setSubs(subsData);
    } catch (e) { console.error(e); }
    setCargando(false);
  }, [busqueda, filtMetodo]);

  useEffect(() => {
    const t = setTimeout(cargar, 400);
    return () => clearTimeout(t);
  }, [cargar]);

  const stats = subs.stats || {};

  return (
    <div style={{ padding: '20px 16px 40px' }} className="anim-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>
          PAGOS Y SUSCRIPCIONES
        </h1>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>
          Historial de transacciones y estado de suscripciones
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'TOTAL RECAUDADO', valor: `S/. ${datos.total_recaudado?.toFixed(2) || '0.00'}`, color: 'var(--green)' },
          { label: 'TRANSACCIONES',   valor: datos.count || 0,        color: 'var(--cyan)'  },
          { label: 'PLANES ACTIVOS',  valor: stats.activos || 0,      color: 'var(--green)' },
          { label: 'PLANES VENCIDOS', valor: stats.vencidos || 0,     color: 'var(--accent)'},
          { label: 'SIN PLAN',        valor: stats.sin_plan || 0,     color: 'var(--amber)' },
        ].map(s => (
          <Card key={s.label}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: s.color, letterSpacing: '0.05em', lineHeight: 1 }}>{s.valor}</p>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por usuario, correo o referencia..."
              style={{ width: '100%', padding: '9px 10px 9px 32px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <select value={filtMetodo} onChange={e => setFiltMetodo(e.target.value)}
            style={{ padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 10, cursor: 'pointer' }}>
            <option value="">Todos los métodos</option>
            {Object.entries(ETIQUETA_METODO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ animation: 'spin-cw 1s linear infinite', display: 'block', margin: '0 auto 10px' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>CARGANDO...</span>
          </div>
        ) : datos.pagos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)' }}>Sin transacciones registradas</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['REFERENCIA', 'USUARIO', 'FECHA Y HORA', 'MONTO', 'MÉTODO', 'TIPO', 'PLAN VENCE'].map(h => (
                    <th key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '8px 10px', textAlign: 'left', fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos.pagos.map((p, i) => (
                  <tr key={p.id_pago}
                    style={{ borderBottom: i < datos.pagos.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '11px 10px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--cyan)' }}>{p.referencia}</span>
                    </td>
                    <td style={{ padding: '11px 10px' }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{p.usuario?.nombre_completo || '—'}</p>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>{p.usuario?.correo_electronico}</p>
                    </td>
                    <td style={{ padding: '11px 10px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{fmtDateTime(p.fecha_pago)}</span>
                    </td>
                    <td style={{ padding: '11px 10px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>S/. {parseFloat(p.monto).toFixed(2)}</span>
                    </td>
                    <td style={{ padding: '11px 10px' }}>
                      <BadgeMetodo metodo={p.metodo_pago} />
                    </td>
                    <td style={{ padding: '11px 10px' }}>
                      <BadgeTipo tipo={p.tipo_operacion} />
                    </td>
                    <td style={{ padding: '11px 10px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {fmtFecha(p.usuario?.fecha_fin_plan)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
}