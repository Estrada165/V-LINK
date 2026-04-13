import React from 'react';
import Badge from '../ui/Badge';

const severityIcon = {
  high: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#e03030" strokeWidth="1.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  medium: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffb400" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  low: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1db954" strokeWidth="1.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

export default function AlertCard({ alert }) {
  return (
    <div
      className="flex items-center gap-3 py-3 px-4 rounded-xl"
      style={{ background: '#161616', border: '1px solid #1f1f1f' }}
    >
      <div className="flex-shrink-0">{severityIcon[alert.severity]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span style={{ fontSize: '13px', color: '#f0f0f0', fontWeight: 500 }}>{alert.type}</span>
          <Badge label={alert.status} />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#6b6b6b' }}>
            {alert.time}
          </span>
          {alert.distance && (
            <>
              <span style={{ color: '#2a2a2a' }}>·</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#6b6b6b' }}>
                {alert.distance}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}