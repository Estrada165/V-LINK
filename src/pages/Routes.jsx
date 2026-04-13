import React from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { mockRoutes } from '../mocks/mockData';

export default function Routes() {
  return (
    <div className="pt-14 pb-20 px-4 max-w-lg mx-auto animate-fade-in">
      <div className="py-5">
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '26px', letterSpacing: '0.1em', color: '#f0f0f0', lineHeight: 1 }}>
          HISTORIAL DE RUTAS
        </h2>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#6b6b6b', letterSpacing: '0.1em' }}>
          VER HISTORIAL COMPLETO →
        </span>
      </div>

      {/* Table header */}
      <div
        className="grid gap-2 px-4 pb-2"
        style={{
          gridTemplateColumns: '1fr 1fr 80px 70px 60px',
          borderBottom: '1px solid #1f1f1f',
        }}
      >
        {['FECHA/HORA', 'DESCRIPCIÓN', 'DISTANCIA', 'ALERTAS', 'ESTADO'].map(h => (
          <span key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#6b6b6b', letterSpacing: '0.1em' }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2 mt-2">
        {mockRoutes.map(route => (
          <Card key={route.id} className="grid gap-2 px-4 py-4 items-center"
            style={{ gridTemplateColumns: '1fr 1fr 80px 70px 60px' }}
          >
            <div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#f0f0f0' }}>{route.date}</p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', marginTop: 2 }}>{route.duration}</p>
            </div>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#a0a0a0' }}>{route.origin}</p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', marginTop: 2 }}>→ {route.destination}</p>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#f0f0f0' }}>{route.distance}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: route.alerts > 0 ? '#e03030' : '#6b6b6b' }}>
              {route.alerts}
            </span>
            <Badge label={route.status} />
          </Card>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        {[
          { label: 'TOTAL RUTAS', value: mockRoutes.length },
          { label: 'KM TOTALES', value: '159.9' },
          { label: 'CON ALERTAS', value: '1', color: '#e03030' },
        ].map(s => (
          <Card key={s.label} className="p-4 flex flex-col items-center gap-1">
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '22px', color: s.color || '#f0f0f0', fontWeight: 300 }}>
              {s.value}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#6b6b6b', letterSpacing: '0.1em', textAlign: 'center' }}>
              {s.label}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}