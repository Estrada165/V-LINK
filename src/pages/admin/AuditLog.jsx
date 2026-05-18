import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/api';
import { fmtDateTime } from '../../utils/dateUtils';

const Card = ({ children, style = {}, onClick }) => (
  <div className="mg-card" onClick={onClick}
    style={{ padding: '16px 18px', ...style, cursor: onClick ? 'pointer' : 'default' }}>
    {children}
  </div>
);

const Label = ({ children }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)', marginBottom: 12 }}>
    {children}
  </p>
);

const COLORES_ACCION = {
  login:               { color: 'var(--green)',  bg: 'var(--green-soft)',  border: 'var(--green-border)'  },
  cambio_password:     { color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
  actualizar_perfil:   { color: 'var(--cyan)',   bg: 'var(--cyan-soft)',   border: 'var(--cyan-border)'   },
  eliminar_usuario:    { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  cambio_rol:          { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  reset_password:      { color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
  activar_usuario:     { color: 'var(--green)',  bg: 'var(--green-soft)',  border: 'var(--green-border)'  },
  desactivar_usuario:  { color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
  backup:              { color: 'var(--cyan)',   bg: 'var(--cyan-soft)',   border: 'var(--cyan-border)'   },
  crear_vehiculo:      { color: 'var(--green)',  bg: 'var(--green-soft)',  border: 'var(--green-border)'  },
  eliminar_vehiculo:   { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  crear_ticket:        { color: 'var(--cyan)',   bg: 'var(--cyan-soft)',   border: 'var(--cyan-border)'   },
  asignar_ticket:      { color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
  actualizar_ticket:   { color: 'var(--cyan)',   bg: 'var(--cyan-soft)',   border: 'var(--cyan-border)'   },
  eliminar_ticket:     { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  actualizar_area:     { color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
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
};

const COLOR_FALLBACK = { color: 'var(--text-muted)', bg: 'var(--bg-surface)', border: 'var(--border)' };

const colorDeAccion = (accion) => COLORES_ACCION[accion] || COLOR_FALLBACK;

export default function AuditLog() {
  const [registros,      setRegistros]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [busquedaUsuario,setBusquedaUsuario]= useState('');
  const [filtroAccion,   setFiltroAccion]   = useState('');
  const [fechaDesde,     setFechaDesde]     = useState('');
  const [fechaHasta,     setFechaHasta]     = useState('');
  const [conteos,        setConteos]        = useState({});

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (filtroAccion) params.accion = filtroAccion;

      const data = await adminService.getAuditoria(params);
      const todos = Array.isArray(data) ? data : [];

      let filtrados = todos;
      if (busquedaUsuario.trim()) {
        const termino = busquedaUsuario.toLowerCase();
        filtrados = filtrados.filter(r =>
          r.usuario?.nombre_completo?.toLowerCase().includes(termino) ||
          r.usuario?.correo_electronico?.toLowerCase().includes(termino)
        );
      }
      if (fechaDesde) filtrados = filtrados.filter(r => r.fecha_hora >= fechaDesde);
      if (fechaHasta) filtrados = filtrados.filter(r => r.fecha_hora <= fechaHasta + 'T23:59:59');

      setRegistros(filtrados);

      const nuevosConteos = {};
      todos.forEach(r => { nuevosConteos[r.accion] = (nuevosConteos[r.accion] || 0) + 1; });
      setConteos(nuevosConteos);
    } catch (e) { console.error(e); setRegistros([]); }
    setLoading(false);
  }, [filtroAccion, busquedaUsuario, fechaDesde, fechaHasta]);

  useEffect(() => { cargar(); }, [cargar]);

  const accionesFrecuentes = Object.entries(conteos).sort(([, a], [, b]) => b - a).slice(0, 4);
  const hayFiltros = busquedaUsuario || filtroAccion || fechaDesde || fechaHasta;

  const limpiarFiltros = () => {
    setBusquedaUsuario('');
    setFiltroAccion('');
    setFechaDesde('');
    setFechaHasta('');
  };

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      <div style={{ marginBottom: 20 }}>
        <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>AUDITORÍA</h1>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>
          Registro de actividad del sistema · {registros.length} eventos
        </span>
      </div>

      {accionesFrecuentes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 18 }}>
          {accionesFrecuentes.map(([accion, cantidad]) => {
            const colores = colorDeAccion(accion);
            const activo  = filtroAccion === accion;
            return (
              <Card key={accion} onClick={() => setFiltroAccion(activo ? '' : accion)}
                style={{ padding: '12px 14px', background: activo ? colores.bg : undefined, border: activo ? `1px solid ${colores.border}` : undefined, transition: 'all .2s' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, letterSpacing: '0.1em', color: colores.color, display: 'block', marginBottom: 4 }}>
                  {(ETIQUETAS_ACCION[accion] || accion).toUpperCase()}
                </span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 300, color: colores.color }}>{cantidad}</span>
              </Card>
            );
          })}
        </div>
      )}

      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 180px', minWidth: 160 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>BUSCAR USUARIO</p>
            <input value={busquedaUsuario} onChange={e => setBusquedaUsuario(e.target.value)} placeholder="Nombre o correo..."
              style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 13, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div style={{ flex: '1 1 160px', minWidth: 140 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>ACCIÓN</p>
            <select value={filtroAccion} onChange={e => setFiltroAccion(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 10, outline: 'none', cursor: 'pointer' }}>
              <option value="">TODAS</option>
              {Object.entries(ETIQUETAS_ACCION).map(([k, v]) => (
                <option key={k} value={k}>{v.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1 1 130px', minWidth: 120 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>DESDE</p>
            <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
              style={{ width: '100%', padding: '9px 10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 12, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div style={{ flex: '1 1 130px', minWidth: 120 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>HASTA</p>
            <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
              style={{ width: '100%', padding: '9px 10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 12, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>
          {hayFiltros && (
            <button onClick={limpiarFiltros}
              style={{ padding: '9px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', alignSelf: 'flex-end' }}>
              LIMPIAR
            </button>
          )}
        </div>
      </Card>

      <Card>
        <Label>REGISTRO DE ACTIVIDAD</Label>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
              style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto 8px' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
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
                {registros.map((registro, i) => {
                  const colores = colorDeAccion(registro.accion);
                  return (
                    <tr key={registro.id_auditoria}
                      style={{ borderBottom: i < registros.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-secondary)' }}>
                          {fmtDateTime(registro.fecha_hora)}
                        </span>
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          {registro.usuario?.nombre_completo || `Usuario ${registro.id_usuario}`}
                        </p>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginTop: 1 }}>
                          {registro.usuario?.correo_electronico || ''}
                        </p>
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>
                          {(registro.usuario?.rol || '—').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: colores.color, background: colores.bg, border: `1px solid ${colores.border}`, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                          {(ETIQUETAS_ACCION[registro.accion] || registro.accion).toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 10px', maxWidth: 200 }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {registro.detalle || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)' }}>
                          {registro.ip_address || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {registros.length === 0 && (
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '30px 0' }}>
                Sin registros para este filtro
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}