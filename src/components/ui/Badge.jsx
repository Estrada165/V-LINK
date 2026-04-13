import React from 'react';

const colors = {
  high: { bg: 'rgba(224,48,48,0.12)', border: '#e0303030', text: '#e03030' },
  medium: { bg: 'rgba(255,180,0,0.1)', border: '#ffb40030', text: '#ffb400' },
  low: { bg: 'rgba(29,185,84,0.1)', border: '#1db95430', text: '#1db954' },
  active: { bg: 'rgba(224,48,48,0.12)', border: '#e0303030', text: '#e03030' },
  pendiente: { bg: 'rgba(255,180,0,0.1)', border: '#ffb40030', text: '#ffb400' },
  resuelto: { bg: 'rgba(29,185,84,0.1)', border: '#1db95430', text: '#1db954' },
  COMPLETADO: { bg: 'rgba(29,185,84,0.1)', border: '#1db95430', text: '#1db954' },
  ALERTA: { bg: 'rgba(224,48,48,0.12)', border: '#e0303030', text: '#e03030' },
  PENDIENTE: { bg: 'rgba(255,180,0,0.1)', border: '#ffb40030', text: '#ffb400' },
  VINCULADO: { bg: 'rgba(29,185,84,0.1)', border: '#1db95430', text: '#1db954' },
};

export default function Badge({ label, variant }) {
  const c = colors[variant || label] || colors.low;
  return (
    <span
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontSize: '9px',
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.1em',
        padding: '2px 8px',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}