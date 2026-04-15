import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Sun = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
    <line x1="4.2" y1="4.2" x2="6.4" y2="6.4"/><line x1="17.6" y1="17.6" x2="19.8" y2="19.8"/>
    <line x1="4.2" y1="19.8" x2="6.4" y2="17.6"/><line x1="17.6" y1="6.4" x2="19.8" y2="4.2"/>
  </svg>
);
const Moon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function ThemeToggle({ compact = false }) {
  const { isDark, toggle } = useTheme();
  if (compact) {
    return (
      <button onClick={toggle} title={isDark ? 'Modo claro' : 'Modo oscuro'}
        style={{ width:34,height:34,borderRadius:8,cursor:'pointer',background:'var(--bg-card)',
          border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',
          color:'var(--text-muted)',transition:'all .2s',flexShrink:0 }}>
        {isDark ? <Sun/> : <Moon/>}
      </button>
    );
  }
  return (
    <button onClick={toggle} style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 14px',
      background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,cursor:'pointer',transition:'all .25s' }}>
      <div style={{ width:38,height:20,borderRadius:10,position:'relative',flexShrink:0,
        background:isDark?'var(--border-mid)':'var(--accent-soft)',
        border:`1px solid ${isDark?'var(--border-strong)':'var(--accent-border)'}`,transition:'all .3s' }}>
        <div style={{ position:'absolute',top:2,left:isDark?2:18,width:14,height:14,borderRadius:'50%',
          transition:'left .28s ease',background:isDark?'var(--text-muted)':'var(--accent)',
          display:'flex',alignItems:'center',justifyContent:'center' }}>
          {isDark ? <Moon/> : <Sun/>}
        </div>
      </div>
      <span style={{ fontFamily:'JetBrains Mono',fontSize:9,letterSpacing:'0.12em',color:'var(--text-muted)' }}>
        {isDark ? 'MODO OSCURO' : 'MODO CLARO'}
      </span>
    </button>
  );
}