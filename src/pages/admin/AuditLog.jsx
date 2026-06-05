import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/api';
import { fmtDateTime } from '../../utils/dateUtils';

const Card = ({ children, style = {}, onClick }) => (
  <div className="mg-card" onClick={onClick}
    style={{ padding: '16px 18px', ...style, cursor: onClick ? 'pointer' : 'default' }}>
    {children}
  </div>
);

const COLORES_ACCION = {
  login:                { color: 'var(--green)',  bg: 'var(--green-soft)',  border: 'var(--green-border)'  },
  cambio_password:      { color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
  actualizar_perfil:    { color: 'var(--cyan)',   bg: 'var(--cyan-soft)',   border: 'var(--cyan-border)'   },
  eliminar_usuario:     { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  cambio_rol:           { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  reset_password:       { color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
  activar_usuario:      { color: 'var(--green)',  bg: 'var(--green-soft)',  border: 'var(--green-border)'  },
  desactivar_usuario:   { color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
  backup:               { color: 'var(--cyan)',   bg: 'var(--cyan-soft)',   border: 'var(--cyan-border)'   },
  crear_vehiculo:       { color: 'var(--green)',  bg: 'var(--green-soft)',  border: 'var(--green-border)'  },
  eliminar_vehiculo:    { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  crear_ticket:         { color: 'var(--cyan)',   bg: 'var(--cyan-soft)',   border: 'var(--cyan-border)'   },
  asignar_ticket:       { color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
  actualizar_ticket:    { color: 'var(--cyan)',   bg: 'var(--cyan-soft)',   border: 'var(--cyan-border)'   },
  eliminar_ticket:      { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  activar_plan:         { color: 'var(--green)',  bg: 'var(--green-soft)',  border: 'var(--green-border)'  },
  renovar_plan:         { color: 'var(--cyan)',   bg: 'var(--cyan-soft)',   border: 'var(--cyan-border)'   },
  cancelar_plan:        { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  reportar_incidencia:  { color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
};

const ETIQUETAS_ACCION = {
  login:                'Inicio de sesión',
  cambio_password:      'Cambio de contraseña',
  actualizar_perfil:    'Actualizó perfil',
  eliminar_usuario:     'Eliminó usuario',
  cambio_rol:           'Cambió rol',
  reset_password:       'Reseteó contraseña',
  activar_usuario:      'Activó usuario',
  desactivar_usuario:   'Desactivó usuario',
  backup:               'Descargó backup',
  crear_vehiculo:       'Registró vehículo',
  eliminar_vehiculo:    'Eliminó vehículo',
  bulk_activate:        'Activación masiva',
  bulk_deactivate:      'Desactivación masiva',
  bulk_delete:          'Eliminación masiva',
  cambio_estado_alerta: 'Cambió estado alerta',
  crear_usuario:        'Creó usuario',
  crear_informe:        'Creó informe',
  crear_ticket:         'Creó ticket',
  asignar_ticket:       'Asignó ticket',
  actualizar_ticket:    'Actualizó ticket',
  eliminar_ticket:      'Eliminó ticket',
  actualizar_area:      'Actualizó área',
  activar_plan:         'Activó plan',
  renovar_plan:         'Renovó plan',
  cancelar_plan:        'Canceló plan',
  reportar_incidencia:  'Reportó incidencia',
};

const FALLBACK = { color: 'var(--text-muted)', bg: 'var(--bg-surface)', border: 'var(--border)' };
const colorAccion = (a) => COLORES_ACCION[a] || FALLBACK;

export default function AuditLog() {
  const [registros,  setRegistros]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [busqueda,   setBusqueda]   = useState('');
  const [filtroAcc,  setFiltroAcc]  = useState('');
  const [desde,      setDesde]      = useState('');
  const [hasta,      setHasta]      = useState('');
  const [conteos,    setConteos]    = useState({});

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (filtroAcc) params.accion = filtroAcc;
      const data = Array.isArray(await adminService.getAuditoria(params))
        ? await adminService.getAuditoria(params)
        : [];

      const todos = Array.isArray(data) ? data : [];
      let filtrados = todos;
      if (busqueda.trim()) {
        const t = busqueda.toLowerCase();
        filtrados = filtrados.filter(r =>
          r.usuario?.nombre_completo?.toLowerCase().includes(t) ||
          r.usuario?.correo_electronico?.toLowerCase().includes(t)
        );
      }
      if (desde) filtrados = filtrados.filter(r => r.fecha_hora >= desde);
      if (hasta) filtrados = filtrados.filter(r => r.fecha_hora <= hasta + 'T23:59:59');

      setRegistros(filtrados);
      const c = {};
      todos.forEach(r => { c[r.accion] = (c[r.accion] || 0) + 1; });
      setConteos(c);
    } catch { setRegistros([]); }
    setLoading(false);
  }, [filtroAcc, busqueda, desde, hasta]);

  useEffect(() => { cargar(); }, [cargar]);

  const frecuentes = Object.entries(conteos).sort(([, a], [, b]) => b - a).slice(0, 5);
  const hayFiltros = busqueda || filtroAcc || desde || hasta;

  const inputSt = {
    padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 13,
    outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '20px 16px 40px' }} className="anim-fade">

      <div style={{ marginBottom: 20 }}>
        <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>AUDITORÍA</h1>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
          Registro de actividad del sistema · {registros.length} eventos
        </p>
      </div>

      {frecuentes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
          {frecuentes.map(([accion, cantidad]) => {
            const c = colorAccion(accion);
            const activo = filtroAcc === accion;
            return (
              <Card key={accion} onClick={() => setFiltroAcc(activo ? '' : accion)}
                style={{ padding: '12px 14px', background: activo ? c.bg : undefined, border: activo ? `1px solid ${c.border}` : undefined, transition: 'all .2s' }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: c.color, letterSpacing: '0.1em', marginBottom: 4 }}>
                  {(ETIQUETAS_ACCION[accion] || accion).toUpperCase()}
                </p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 300, color: c.color, lineHeight: 1 }}>{cantidad}</p>
              </Card>
            );
          })}
        </div>
      )}

      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, alignItems: 'end' }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>BUSCAR USUARIO</p>
            <div style={{ position: 'relative' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre o correo..."
                style={{ ...inputSt, paddingLeft: 30 }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>ACCIÓN</p>
            <select value={filtroAcc} onChange={e => setFiltroAcc(e.target.value)}
              style={{ ...inputSt, fontFamily: 'JetBrains Mono', fontSize: 10, cursor: 'pointer' }}>
              <option value="">TODAS LAS ACCIONES</option>
              {Object.entries(ETIQUETAS_ACCION).map(([k, v]) => (
                <option key={k} value={k}>{v.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>DESDE</p>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)} style={inputSt}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>HASTA</p>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} style={inputSt}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          {hayFiltros && (
            <button onClick={() => { setBusqueda(''); setFiltroAcc(''); setDesde(''); setHasta(''); }}
              style={{ padding: '9px 14px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)' }}>
              LIMPIAR
            </button>
          )}
        </div>
      </Card>

      <Card>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)', marginBottom: 12 }}>
          REGISTRO DE ACTIVIDAD
        </p>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
              style={{ animation: 'spin-cw 1s linear infinite', display: 'block', margin: '0 auto 8px' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </div>
        ) : registros.length === 0 ? (
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '30px 0' }}>
            Sin registros para este filtro
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['FECHA Y HORA', 'USUARIO', 'ROL', 'ACCIÓN', 'DETALLE', 'IP'].map(h => (
                    <th key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '8px 10px', textAlign: 'left', fontWeight: 400, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registros.map((r, i) => {
                  const c = colorAccion(r.accion);
                  return (
                    <tr key={r.id_auditoria}
                      style={{ borderBottom: i < registros.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-secondary)' }}>
                          {fmtDateTime(r.fecha_hora)}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          {r.usuario?.nombre_completo || `Usuario ${r.id_usuario}`}
                        </p>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginTop: 1 }}>
                          {r.usuario?.correo_electronico || ''}
                        </p>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>
                          {(r.usuario?.rol || '—').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: c.color, background: c.bg, border: `1px solid ${c.border}`, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                          {(ETIQUETAS_ACCION[r.accion] || r.accion).toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px', maxWidth: 200 }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.detalle || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>
                          {r.ip_address || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}