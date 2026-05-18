import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { routeService, adminService } from '../../services/api';

const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '16px 18px', ...style }}>{children}</div>
);

const Label = ({ children }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 12 }}>{children}</p>
);

const Spinner = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
    style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto 8px' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const COLORES_ESTADO = {
  completado: ['var(--green)',      'var(--green-soft)',  'var(--green-border)'  ],
  alerta:     ['var(--accent)',     'var(--accent-soft)', 'var(--accent-border)' ],
  en_curso:   ['var(--cyan)',       'var(--cyan-soft)',   'var(--cyan-border)'   ],
  cancelado:  ['var(--text-muted)', 'var(--bg-surface)',  'var(--border)'        ],
};

const BadgeEstado = ({ estado }) => {
  const [c, bg, b] = COLORES_ESTADO[estado] || COLORES_ESTADO.cancelado;
  return (
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.08em', color: c, background: bg, border: `1px solid ${b}`, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
      {(estado || 'desconocido').toUpperCase()}
    </span>
  );
};

const TablaRutas = ({ rutas }) => {
  if (rutas.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 12px' }}>
        <path d="M3 12h18"/><path d="M3 6l6 6-6 6"/>
      </svg>
      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)' }}>Sin rutas registradas</p>
    </div>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px 80px 90px', gap: 8, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 4, minWidth: 500 }}>
        {['FECHA', 'TRAYECTO', 'DISTANCIA', 'DURACIÓN', 'ESTADO'].map(h => (
          <span key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{h}</span>
        ))}
      </div>
      {rutas.map((r, i) => {
        const duracionMin = r.fecha_inicio && r.fecha_fin
          ? Math.round((new Date(r.fecha_fin) - new Date(r.fecha_inicio)) / 60000)
          : null;
        return (
          <div key={r.id_ruta} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px 80px 90px', gap: 8, alignItems: 'center', padding: '12px 0', borderBottom: i < rutas.length - 1 ? '1px solid var(--border)' : 'none', minWidth: 500 }}>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-secondary)' }}>
                {r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
              </p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                {r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''}
              </p>
            </div>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.origen || 'Inicio'}
              </p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                → {r.destino || 'Destino'}
              </p>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 300, color: 'var(--text-primary)' }}>
              {r.distancia_km ? `${parseFloat(r.distancia_km).toFixed(1)} km` : '—'}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)' }}>
              {duracionMin !== null ? `${duracionMin}m` : '—'}
            </span>
            <BadgeEstado estado={r.estado_viaje} />
          </div>
        );
      })}
    </div>
  );
};

function VistaUsuario() {
  const [rutas,    setRutas]    = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try { setRutas(await routeService.getAll()); }
      catch (e) { console.error(e); }
      setCargando(false);
    };
    cargar();
  }, []);

  const kmTotales   = rutas.reduce((acc, r) => acc + (parseFloat(r.distancia_km) || 0), 0);
  const conAlertas  = rutas.filter(r => r.estado_viaje === 'alerta').length;
  const completadas = rutas.filter(r => r.estado_viaje === 'completado').length;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>HISTORIAL DE RUTAS</h1>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
          Rutas registradas por tu vehículo
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { etiqueta: 'TOTAL RUTAS', valor: rutas.length,                 color: 'var(--text-primary)'                                 },
          { etiqueta: 'KM TOTALES',  valor: `${kmTotales.toFixed(1)} km`, color: 'var(--cyan)'                                         },
          { etiqueta: 'CON ALERTAS', valor: conAlertas,                   color: conAlertas > 0 ? 'var(--accent)' : 'var(--text-muted)' },
          { etiqueta: 'COMPLETADAS', valor: completadas,                  color: 'var(--green)'                                        },
        ].map(s => (
          <Card key={s.etiqueta} style={{ padding: '14px 16px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>{s.etiqueta}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 300, color: s.color }}>{s.valor}</span>
          </Card>
        ))}
      </div>

      <Card>
        <Label>RUTAS REGISTRADAS</Label>
        {cargando
          ? <div style={{ textAlign: 'center', padding: '30px 0' }}><Spinner /></div>
          : <TablaRutas rutas={rutas} />}
      </Card>

      {rutas.length === 0 && !cargando && (
        <Card style={{ marginTop: 16, background: 'var(--cyan-soft)', border: '1px solid var(--cyan-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.07em' }}>
              Las rutas se registrarán automáticamente con GPS real cuando el anillo BLE esté conectado
            </p>
          </div>
        </Card>
      )}
    </>
  );
}

function VistaAdmin() {
  const [busqueda,      setBusqueda]      = useState('');
  const [usuarios,      setUsuarios]      = useState([]);
  const [usuarioSel,    setUsuarioSel]    = useState(null);
  const [rutas,         setRutas]         = useState([]);
  const [cargandoUsers, setCargandoUsers] = useState(false);
  const [cargandoRutas, setCargandoRutas] = useState(false);
  const [buscado,       setBuscado]       = useState(false);

  const buscarUsuarios = useCallback(async () => {
    if (!busqueda.trim()) return;
    setCargandoUsers(true);
    setBuscado(true);
    setUsuarioSel(null);
    setRutas([]);
    try {
      const res = await adminService.getAllUsers({ search: busqueda.trim(), limit: 20 });
      const lista = Array.isArray(res) ? res : (res?.users || []);
      setUsuarios(lista.filter(u => u.rol === 'usuario'));
    } catch (e) { console.error(e); }
    setCargandoUsers(false);
  }, [busqueda]);

  const cargarRutas = useCallback(async (usuario) => {
    setUsuarioSel(usuario);
    setRutas([]);
    setCargandoRutas(true);
    try {
      const data = await routeService.getByUser(usuario.id_usuario);
      setRutas(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setCargandoRutas(false);
  }, []);

  const kmTotales   = rutas.reduce((acc, r) => acc + (parseFloat(r.distancia_km) || 0), 0);
  const completadas = rutas.filter(r => r.estado_viaje === 'completado').length;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>HISTORIAL DE RUTAS</h1>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
          Busca un usuario para ver sus rutas registradas
        </span>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Label>BUSCAR USUARIO</Label>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscarUsuarios()}
              placeholder="Nombre, correo o teléfono..."
              style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <button onClick={buscarUsuarios} disabled={cargandoUsers || !busqueda.trim()}
            style={{ padding: '10px 20px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: !busqueda.trim() ? 'not-allowed' : 'pointer', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: '#fff', opacity: !busqueda.trim() ? 0.5 : 1, transition: 'opacity .2s' }}>
            {cargandoUsers ? 'BUSCANDO...' : 'BUSCAR'}
          </button>
        </div>

        {buscado && !cargandoUsers && (
          <div style={{ marginTop: 14 }}>
            {usuarios.length === 0 ? (
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '12px 0' }}>
                Sin usuarios encontrados
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {usuarios.map(u => {
                  const activo = usuarioSel?.id_usuario === u.id_usuario;
                  return (
                    <button key={u.id_usuario} onClick={() => cargarRutas(u)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'all .15s', background: activo ? 'var(--accent-soft)' : 'var(--bg-surface)', border: `1px solid ${activo ? 'var(--accent-border)' : 'var(--border)'}` }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--green-soft)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--green)' }}>{u.nombre_completo?.[0]}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{u.nombre_completo}</p>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>{u.correo_electronico}</p>
                      </div>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Card>

      {usuarioSel && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
            {[
              { etiqueta: 'TOTAL RUTAS', valor: rutas.length,                 color: 'var(--text-primary)' },
              { etiqueta: 'KM TOTALES',  valor: `${kmTotales.toFixed(1)} km`, color: 'var(--cyan)'         },
              { etiqueta: 'COMPLETADAS', valor: completadas,                  color: 'var(--green)'        },
            ].map(s => (
              <Card key={s.etiqueta} style={{ padding: '14px 16px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>{s.etiqueta}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 300, color: s.color }}>{s.valor}</span>
              </Card>
            ))}
          </div>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--green-soft)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--green)' }}>{usuarioSel.nombre_completo?.[0]}</span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{usuarioSel.nombre_completo}</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>{usuarioSel.correo_electronico}</p>
              </div>
            </div>
            {cargandoRutas
              ? <div style={{ textAlign: 'center', padding: '30px 0' }}><Spinner /></div>
              : <TablaRutas rutas={rutas} />}
          </Card>
        </>
      )}
    </>
  );
}

export default function Routes() {
  const { currentUser } = useAuth();
  const esAdmin = ['admin', 'supervisor'].includes(currentUser?.rol);

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">
      {esAdmin ? <VistaAdmin /> : <VistaUsuario />}
    </div>
  );
}