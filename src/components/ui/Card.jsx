import React from 'react';

export default function Card({ children, className = '', style = {}, onClick, glow }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: '#161616',
        border: '1px solid #1f1f1f',
        ...(glow && { boxShadow: `0 0 24px ${glow}` }),
        ...style,
      }}
    >
      {children}
    </div>
  );
}