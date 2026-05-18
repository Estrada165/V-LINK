import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { adminService } from '../../services/api';
import { fmtDateTime, fmtDate } from '../../utils/dateUtils';

const Card = ({ children, style = {} }) => (
  <div className="mg-card" style={{ padding: '16px 18px', ...style }}>{children}</div>
);
const Label = ({ children }) => (
  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)', marginBottom: 12 }}>{children}</p>
);

const ESTADO_CFG = {
  enviado:   { color: 'var(--amber)', bg: 'var(--amber-soft)', border: 'var(--amber-border)', label: 'ENVIADO' },
  revisado:  { color: 'var(--green)', bg: 'var(--green-soft)', border: 'var(--green-border)', label: 'REVISADO' },
  archivado: { color: 'var(--text-muted)', bg: 'var(--bg-surface)', border: 'var(--border)', label: 'ARCHIVADO' },
};

function InformeModal({ informe, onClose, onEstadoChange }) {
  const [loading, setLoading] = useState(false);
  const ec = ESTADO_CFG[informe.estado] || ESTADO_CFG.enviado;

  const cambiarEstado = async (nuevoEstado) => {
    setLoading(true);
    try {
      await api.patch(`/informes/${informe.id_informe}`, { estado: nuevoEstado });
      onEstadoChange(informe.id_informe, nuevoEstado);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 580, maxHeight: '88vh', background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 14, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>

        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: ec.color, background: ec.bg, border: `1px solid ${ec.border}`, padding: '2px 8px', borderRadius: 4 }}>{ec.label}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--amber)', background: 'var(--amber-soft)', border: '1px solid var(--amber-border)', padding: '2px 8px', borderRadius: 4 }}>SUPERVISOR</span>
              </div>
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text-primary)', letterSpacing: '0.08em', lineHeight: 1.1 }}>{informe.titulo}</h3>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
                {informe.usuario?.nombre_completo || '—'} · {informe.usuario?.area ? `Área: ${informe.usuario.area}` : 'Sin área'}
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '14px 0', padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
            {[
              { label: 'PERÍODO', value: `${fmtDate(informe.periodo_desde)} → ${fmtDate(informe.periodo_hasta)}` },
              { label: 'INCIDENCIAS', value: informe.incidencias_count || 0 },
              { label: 'ENVIADO', value: fmtDateTime(informe.fecha_creacion) },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-faint)', display: 'block', marginBottom: 3, letterSpacing: '0.1em' }}>{item.label}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-secondary)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>RESUMEN DE ACTIVIDAD</p>
            <div style={{ padding: '14px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{informe.resumen}</p>
            </div>
          </div>
          {informe.observaciones && (
            <div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>OBSERVACIONES Y RECOMENDACIONES</p>
              <div style={{ padding: '14px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{informe.observaciones}</p>
              </div>
            </div>
          )}
          <div style={{ height: 4 }} />
        </div>

        <div style={{ padding: '14px 24px 20px', flexShrink: 0, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {informe.estado === 'enviado' && (
            <button onClick={() => cambiarEstado('revisado')} disabled={loading} style={{ flex: 2, padding: '10px', background: 'var(--green-soft)', border: '1px solid var(--green-border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--green)', letterSpacing: '0.08em' }}>
              {loading ? 'GUARDANDO...' : '✓ MARCAR COMO REVISADO'}
            </button>
          )}
          {informe.estado !== 'archivado' && (
            <button onClick={() => cambiarEstado('archivado')} disabled={loading} style={{ flex: 1, padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              ARCHIVAR
            </button>
          )}
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            CERRAR
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Informes() {
  const [informes,   setInformes]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [filterEstado, setFilterEstado] = useState('all');
  const [filterSup,    setFilterSup]    = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/informes').then(r => r.data);
      setInformes(Array.isArray(data) ? data : []);
    } catch(e) { console.error(e); setInformes([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleEstadoChange = (id, nuevoEstado) => {
    setInformes(prev => prev.map(inf => inf.id_informe === id ? { ...inf, estado: nuevoEstado } : inf));
    if (selected?.id_informe === id) setSelected(prev => ({ ...prev, estado: nuevoEstado }));
  };

  const safeInformes = Array.isArray(informes) ? informes : [];

  const supervisores = [...new Map(safeInformes.map(i => [i.id_autor, i.usuario])).entries()]
    .map(([id, u]) => ({ id, nombre: u?.nombre_completo || `Supervisor ${id}` }));

  const filtered = safeInformes.filter(inf => {
    if (filterEstado !== 'all' && inf.estado !== filterEstado) return false;
    if (filterSup !== 'all' && String(inf.id_autor) !== filterSup) return false;
    return true;
  });

  const pendientes = safeInformes.filter(i => i.estado === 'enviado').length;
  const revisados  = safeInformes.filter(i => i.estado === 'revisado').length;

  return (
    <div style={{ padding: '24px 28px' }} className="anim-fade">

      <div style={{ marginBottom: 20 }}>
        <h1 className="display" style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1 }}>INFORMES</h1>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>
          Informes enviados por supervisores · {safeInformes.length} total
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'TOTAL',     value: safeInformes.length, color: 'var(--text-primary)' },
          { label: 'PENDIENTES',value: pendientes,          color: pendientes > 0 ? 'var(--amber)' : 'var(--text-muted)' },
          { label: 'REVISADOS', value: revisados,           color: 'var(--green)' },
          { label: 'ARCHIVADOS',value: safeInformes.filter(i => i.estado === 'archivado').length, color: 'var(--text-muted)' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '12px 14px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{s.label}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 300, color: s.color }}>{s.value}</span>
          </Card>
        ))}
      </div>

      {pendientes > 0 && (
        <Card style={{ marginBottom: 14, background: 'var(--amber-soft)', border: '1px solid var(--amber-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="anim-blink" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 6px var(--amber)', flexShrink: 0 }} />
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
              {pendientes} informe{pendientes !== 1 ? 's' : ''} pendiente{pendientes !== 1 ? 's' : ''} de revisión
            </p>
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 160px' }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>ESTADO</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[['all','TODOS'],['enviado','ENVIADOS'],['revisado','REVISADOS'],['archivado','ARCHIVADOS']].map(([key, label]) => (
                <button key={key} onClick={() => setFilterEstado(key)} style={{ padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.06em', background: filterEstado === key ? 'var(--accent-soft)' : 'var(--bg-surface)', border: `1px solid ${filterEstado === key ? 'var(--accent-border)' : 'var(--border)'}`, color: filterEstado === key ? 'var(--accent)' : 'var(--text-muted)', transition: 'all .18s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {supervisores.length > 1 && (
            <div style={{ flex: '1 1 160px' }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>SUPERVISOR</p>
              <select value={filterSup} onChange={e => setFilterSup(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 10, outline: 'none', cursor: 'pointer' }}>
                <option value="all">TODOS</option>
                {supervisores.map(s => <option key={s.id} value={String(s.id)}>{s.nombre}</option>)}
              </select>
            </div>
          )}

          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', alignSelf: 'flex-end', paddingBottom: 4 }}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"
            style={{ animation: 'spin-cw 1s linear infinite', transformOrigin: 'center', display: 'block', margin: '0 auto 8px' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>CARGANDO INFORMES...</span>
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', padding: '30px 0' }}>
            {safeInformes.length === 0 ? 'Ningún supervisor ha enviado informes aún' : 'Sin resultados para este filtro'}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(inf => {
            const ec = ESTADO_CFG[inf.estado] || ESTADO_CFG.enviado;
            return (
              <Card key={inf.id_informe} style={{ cursor: 'pointer', transition: 'all .2s' }}
                onClick={() => setSelected(inf)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: ec.color, background: ec.bg, border: `1px solid ${ec.border}`, padding: '2px 8px', borderRadius: 4 }}>{ec.label}</span>
                      {inf.usuario?.area && (
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {inf.usuario.area}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inf.titulo}</p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>
                        Por: {inf.usuario?.nombre_completo || `Supervisor ${inf.id_autor}`}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>
                        {fmtDate(inf.periodo_desde)} → {fmtDate(inf.periodo_hasta)}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: inf.incidencias_count > 0 ? 'var(--accent)' : 'var(--text-faint)' }}>
                        {inf.incidencias_count} incidencia{inf.incidencias_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-faint)', marginBottom: 8 }}>{fmtDateTime(inf.fecha_creacion)}</p>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.06em' }}>VER →</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selected && (
        <InformeModal
          informe={selected}
          onClose={() => setSelected(null)}
          onEstadoChange={handleEstadoChange}
        />
      )}
    </div>
  );
}