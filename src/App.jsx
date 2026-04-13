import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import Routes2 from './pages/Routes';
import Settings from './pages/Settings';
import { mockVehicle } from './mocks/mockData';

const IconDashboard = () => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>);
const IconMap = () => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="3 7 9 4 15 7 21 4 21 17 15 20 9 17 3 20"/><line x1="9" y1="4" x2="9" y2="17"/><line x1="15" y1="7" x2="15" y2="20"/></svg>);
const IconRoutes = () => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18"/><path d="M3 6l6 6-6 6"/></svg>);
const IconSettings = () => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);

const navItems = [
  { path: '/dashboard', label: 'DASHBOARD', Icon: IconDashboard },
  { path: '/map',       label: 'MAPAS',     Icon: IconMap },
  { path: '/routes',   label: 'RUTAS',     Icon: IconRoutes },
  { path: '/settings', label: 'AJUSTES',   Icon: IconSettings },
];

function Sidebar({ vehicle }) {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <aside style={{ width: 220, minHeight: '100vh', background: '#0e0e0e', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg viewBox="0 0 32 32" width="28" height="28"><polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="rgba(224,48,48,0.1)" stroke="#e03030" strokeWidth="1"/><polygon points="16,7 25,12 25,20 16,25 7,20 7,12" fill="none" stroke="#e03030" strokeWidth="0.5" strokeOpacity="0.4"/></svg>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', letterSpacing: '0.2em', color: '#f0f0f0' }}>MOTOGUARD</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '6px 10px', background: 'rgba(29,185,84,0.06)', borderRadius: 8, border: '1px solid rgba(29,185,84,0.12)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1db954', boxShadow: '0 0 6px #1db954' }}/>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#1db954', letterSpacing: '0.12em' }}>EN LÍNEA</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#2a2a2a', marginLeft: 'auto' }}>v2.4.1</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(({ path, label, Icon }) => {
          const active = location.pathname === path;
          return (
            <button key={path} onClick={() => navigate(path)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: active ? 'rgba(224,48,48,0.08)' : 'transparent', border: active ? '1px solid rgba(224,48,48,0.15)' : '1px solid transparent', color: active ? '#f0f0f0' : '#6b6b6b', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', textAlign: 'left', transition: 'all 0.2s' }}>
              <span style={{ color: active ? '#e03030' : 'inherit' }}><Icon /></span>
              {label}
              {active && <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: '#e03030', boxShadow: '0 0 6px #e03030' }}/>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: '16px 12px', borderTop: '1px solid #1a1a1a' }}>
        <div style={{ background: '#161616', border: '1px solid #1f1f1f', borderRadius: 10, padding: '12px 14px' }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#6b6b6b', letterSpacing: '0.12em', marginBottom: 6 }}>VEHÍCULO ACTIVO</p>
          <p style={{ fontSize: '13px', color: '#f0f0f0', fontWeight: 500 }}>{vehicle?.name}</p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b', marginTop: 3 }}>{vehicle?.plate}</p>
          <div style={{ marginTop: 10, height: 2, borderRadius: 2, background: '#1f1f1f' }}>
            <div style={{ height: '100%', width: `${vehicle?.battery}%`, borderRadius: 2, background: '#1db954', boxShadow: '0 0 4px #1db954' }}/>
          </div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#6b6b6b', marginTop: 4 }}>Batería {vehicle?.battery}%</p>
        </div>
      </div>
    </aside>
  );
}

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: '#0e0e0e', borderTop: '1px solid #1a1a1a', display: 'flex' }}>
      {navItems.map(({ path, label, Icon }) => {
        const active = location.pathname === path;
        return (
          <button key={path} onClick={() => navigate(path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '10px 0', background: 'none', border: 'none', borderTop: active ? '1px solid #e03030' : '1px solid transparent', color: active ? '#f0f0f0' : '#6b6b6b', cursor: 'pointer' }}>
            <Icon />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', letterSpacing: '0.1em' }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const pageTitles = { '/dashboard': 'Panel de Control Operativo', '/map': 'Mapa Táctico', '/routes': 'Historial de Rutas', '/settings': 'Ajustes de Hardware' };

function DesktopTopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'Panel';
  return (
    <header style={{ height: 56, background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="#e03030" strokeWidth="1"><polygon points="8,1 15,4.5 15,11.5 8,15 1,11.5 1,4.5"/></svg>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#6b6b6b', letterSpacing: '0.1em' }}>MOTOGUARD</span>
        <span style={{ color: '#2a2a2a', margin: '0 4px', fontSize: 14 }}>›</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#a0a0a0', letterSpacing: '0.08em' }}>{title.toUpperCase()}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b' }}>SLA 99.98% · LATENCIA 1.24s</span>
        <button onClick={() => {}} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b', position: 'relative' }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, background: '#e03030', borderRadius: '50%', fontSize: '8px', fontFamily: 'JetBrains Mono', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(29,185,84,0.06)', borderRadius: 6, border: '1px solid rgba(29,185,84,0.1)' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1db954', boxShadow: '0 0 5px #1db954' }}/>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#1db954', letterSpacing: '0.1em' }}>ADMIN RUST</span>
        </div>
      </div>
    </header>
  );
}

function MobileTopBar() {
  const navigate = useNavigate();
  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg viewBox="0 0 24 24" width="18" height="18"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="rgba(224,48,48,0.1)" stroke="#e03030" strokeWidth="1"/></svg>
        <span style={{ fontFamily: 'Bebas Neue', fontSize: '16px', letterSpacing: '0.2em', color: '#f0f0f0' }}>MOTOGUARD</span>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1db954', boxShadow: '0 0 6px #1db954' }}/>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#6b6b6b' }}>EN LÍNEA</span>
      </div>
    </header>
  );
}

function AppLayout({ children }) {
  return (
    <>
      {/* ── DESKTOP (768px+) ── */}
      <div style={{ display: 'none' }} className="md-layout">
        <style>{`
          @media (min-width: 768px) {
            .md-layout { display: flex !important; min-height: 100vh; }
            .mobile-layout { display: none !important; }
          }
        `}</style>
        <Sidebar vehicle={mockVehicle} />
        <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <DesktopTopBar />
          <main style={{ flex: 1, background: '#0a0a0a', overflowY: 'auto' }}>
            {children}
          </main>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="mobile-layout" style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
        <MobileTopBar />
        <main style={{ flex: 1, paddingTop: 56, paddingBottom: 72 }}>
          {children}
        </main>
        <BottomNav />
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<Login />} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/map"       element={<AppLayout><MapPage /></AppLayout>} />
          <Route path="/routes"    element={<AppLayout><Routes2 /></AppLayout>} />
          <Route path="/settings"  element={<AppLayout><Settings /></AppLayout>} />
          <Route path="*"          element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}