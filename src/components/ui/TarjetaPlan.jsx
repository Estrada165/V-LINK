import React from 'react';
import { useNavigate } from 'react-router-dom';

const fmtFecha = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Lima'
  });
};

export default function TarjetaPlan({ estadoPlan }) {
  const navigate = useNavigate();
  if (!estadoPlan) return null;

  const { activo, por_vencer, dias_restantes, fecha_fin, plan } = estadoPlan;

  if (plan === 'enterprise') return null;
  if (plan === null || plan === undefined) return null;

  if (!activo) {
    return (
      <div style={{ padding: '16px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>SUSCRIPCIÓN</p>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-secondary)' }}>Sin plan activo — acceso limitado</p>
          </div>
          <button onClick={() => navigate('/plan')}
            style={{ padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: '#fff', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
            ACTIVAR PLAN →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 18px', background: por_vencer ? 'var(--accent-soft)' : 'var(--green-soft)', border: `1px solid ${por_vencer ? 'var(--accent-border)' : 'var(--green-border)'}`, borderRadius: 12, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: por_vencer ? 'var(--accent)' : 'var(--green)' }} />
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: por_vencer ? 'var(--accent)' : 'var(--green)', letterSpacing: '0.1em' }}>
              PLAN ACTIVO {por_vencer ? '— VENCE PRONTO' : ''}
            </p>
          </div>
          <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-secondary)' }}>
            {dias_restantes} días restantes · próxima facturación {fmtFecha(fecha_fin)}
          </p>
        </div>
        {por_vencer && (
          <button onClick={() => navigate('/plan')}
            style={{ padding: '8px 16px', background: 'var(--amber)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9, color: '#000', fontWeight: 600, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
            RENOVAR →
          </button>
        )}
      </div>

      {por_vencer && (
        <div style={{ marginTop: 10, height: 4, background: 'var(--bg-base)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.round((dias_restantes / 30) * 100)}%`, background: 'var(--accent)', borderRadius: 2 }} />
        </div>
      )}
    </div>
  );
}