import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login          from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardUser  from './pages/DashboardUser';
import MapPage        from './pages/MapPage';
import RoutesPage     from './pages/Routes';
import Settings       from './pages/Settings';
import Profile        from './pages/Profile';
import UsersAdmin     from './pages/UsersAdmin';

/* ── Icons ──────────────────────────────────────────────────── */
const IC = {
  dashboard: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  map:       () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="3 7 9 4 15 7 21 4 21 17 15 20 9 17 3 20"/><line x1="9" y1="4" x2="9" y2="17"/><line x1="15" y1="7" x2="15" y2="20"/></svg>,
  routes:    () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18"/><path d="M3 6l6 6-6 6"/></svg>,
  settings:  () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  profile:   () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  users:     () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

const NAV_ADMIN = [
  { path: '/dashboard', label: 'DASHBOARD', Icon: IC.dashboard },
  { path: '/users',     label: 'USUARIOS',  Icon: IC.users },
  { path: '/map',       label: 'MAPAS',     Icon: IC.map },
  { path: '/routes',    label: 'RUTAS',     Icon: IC.routes },
  { path: '/settings',  label: 'AJUSTES',   Icon: IC.settings },
  { path: '/profile',   label: 'PERFIL',    Icon: IC.profile },
];
const NAV_USER = [
  { path: '/dashboard', label: 'DASHBOARD', Icon: IC.dashboard },
  { path: '/map',       label: 'MAPAS',     Icon: IC.map },
  { path: '/routes',    label: 'RUTAS',     Icon: IC.routes },
  { path: '/settings',  label: 'AJUSTES',   Icon: IC.settings },
  { path: '/profile',   label: 'PERFIL',    Icon: IC.profile },
];

const pageTitles = {
  '/dashboard': 'Panel de Control',
  '/users':     'Gestión de Usuarios',
  '/map':       'Mapa Táctico · Piura',
  '/routes':    'Rutas',
  '/settings':  'Ajustes',
  '/profile':   'Mi Perfil',
};

/* ── Protected Route ─────────────────────────────────────────── */
function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" />;
  if (adminOnly && currentUser.rol !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

/* ── Sidebar ─────────────────────────────────────────────────── */
function Sidebar({ pendingCount = 0 }) {
  const { currentUser, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const navItems  = isAdmin ? NAV_ADMIN : NAV_USER;

  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      transition: 'background .35s, border-color .35s',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--sidebar-border)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg viewBox="0 0 32 32" width="26" height="26">
            <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1"/>
          </svg>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 19, letterSpacing: '0.2em', color: 'var(--text-primary)' }}>MOTOGUARD</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '5px 10px',
          background: isAdmin ? 'var(--accent-soft)' : 'var(--cyan-soft)',
          border: `1px solid ${isAdmin ? 'var(--accent-border)' : 'var(--cyan-border)'}`, borderRadius: 7 }}>
          <div className="anim-blink" style={{ width: 5, height: 5, borderRadius: '50%',
            background: isAdmin ? 'var(--accent)' : 'var(--cyan)',
            boxShadow: `0 0 5px ${isAdmin ? 'var(--accent)' : 'var(--cyan)'}` }}/>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8,
            color: isAdmin ? 'var(--accent)' : 'var(--cyan)', letterSpacing: '0.12em' }}>
            {isAdmin ? 'ADMINISTRADOR' : 'USUARIO'}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {navItems.map(({ path, label, Icon }) => {
          const active = location.pathname === path;
          const isPending = path === '/users' && pendingCount > 0;
          return (
            <button key={path} onClick={() => navigate(path)} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
              borderRadius: 9, cursor: 'pointer', textAlign: 'left', transition: 'all .2s',
              background: active ? 'var(--accent-soft)' : 'transparent',
              border: active ? '1px solid var(--accent-border)' : '1px solid transparent',
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em',
            }}>
              <span style={{ color: active ? 'var(--accent)' : 'inherit', transition: 'color .2s', flexShrink: 0 }}><Icon /></span>
              <span style={{ flex: 1 }}>{label}</span>
              {isPending && (
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#000', fontWeight: 700 }}>{pendingCount}</span>
                </span>
              )}
              {active && !isPending && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 4px var(--accent)' }}/>}
            </button>
          );
        })}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '14px 10px', borderTop: '1px solid var(--sidebar-border)' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%',
              background: isAdmin ? 'var(--accent-soft)' : 'var(--cyan-soft)',
              border: `1px solid ${isAdmin ? 'var(--accent-border)' : 'var(--cyan-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: isAdmin ? 'var(--accent)' : 'var(--cyan)' }}>
                {(currentUser?.nombre_completo || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.nombre_completo || 'Usuario'}
              </p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.correo_electronico || ''}
              </p>
            </div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} style={{
          width: '100%', padding: '8px', borderRadius: 8, cursor: 'pointer',
          background: 'none', border: '1px solid var(--border)',
          fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em',
          color: 'var(--text-muted)', transition: 'all .2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          CERRAR SESIÓN
        </button>
      </div>
    </aside>
  );
}

/* ── Bottom nav mobile ───────────────────────────────────────── */
function BottomNav() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = isAdmin ? NAV_ADMIN : NAV_USER;
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'var(--nav-bg)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border)', display: 'flex' }}>
      {navItems.map(({ path, label, Icon }) => {
        const active = location.pathname === path;
        return (
          <button key={path} onClick={() => navigate(path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '9px 0', background: 'none', border: 'none', borderTop: active ? '1px solid var(--accent)' : '1px solid transparent', color: active ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer' }}>
            <Icon />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, letterSpacing: '0.08em' }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ── Desktop top bar ─────────────────────────────────────────── */
function DesktopTopBar() {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || '';
  const name = (currentUser?.nombre_completo || 'Usuario').split(' ')[0].toUpperCase();

  return (
    <header style={{ height: 52, background: 'var(--nav-bg)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, transition: 'background .35s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="var(--accent)" strokeWidth="1"><polygon points="7,1 13,4 13,10 7,13 1,10 1,4"/></svg>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>MOTOGUARD</span>
        <span style={{ color: 'var(--text-faint)', margin: '0 4px', fontSize: 13 }}>›</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>{title.toUpperCase()}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)' }}>SLA 99.98%</span>
        <button onClick={() => navigate('/profile')} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
          background: isAdmin ? 'var(--accent-soft)' : 'var(--cyan-soft)',
          border: `1px solid ${isAdmin ? 'var(--accent-border)' : 'var(--cyan-border)'}`,
          borderRadius: 6, cursor: 'pointer',
        }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: isAdmin ? 'var(--accent)' : 'var(--cyan)', letterSpacing: '0.1em' }}>
            {name}
          </span>
        </button>
      </div>
    </header>
  );
}

/* ── Mobile top bar ──────────────────────────────────────────── */
function MobileTopBar() {
  const navigate = useNavigate();
  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--nav-bg)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg viewBox="0 0 24 24" width="18" height="18"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1"/></svg>
        <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: '0.2em', color: 'var(--text-primary)' }}>MOTOGUARD</span>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div className="anim-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 5px var(--green)' }}/>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>EN LÍNEA</span>
      </div>
    </header>
  );
}

/* ── Responsive layout ───────────────────────────────────────── */
function AppLayout({ children, pendingCount }) {
  const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= 768);
  React.useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar pendingCount={pendingCount} />
        <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <DesktopTopBar />
          <main style={{ flex: 1, background: 'var(--bg-base)', overflowY: 'auto' }}>{children}</main>
        </div>
      </div>
    );
  }
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <MobileTopBar />
      <main style={{ paddingTop: 52, paddingBottom: 72 }}>{children}</main>
      <BottomNav />
    </div>
  );
}

/* ── Dashboard wrapper (cuenta pendientes para badge) ─────────── */
function DashboardWrapper() {
  const { isAdmin } = useAuth();
  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      try {
        const { adminService } = await import('./services/api');
        const users = await adminService.getAllUsers();
        setPendingCount(users.filter(u => !u.activo && u.rol !== 'admin').length);
      } catch {}
    };
    load();
    const interval = setInterval(load, 30000); // refrescar cada 30s
    return () => clearInterval(interval);
  }, [isAdmin]);

  return (
    <AppLayout pendingCount={pendingCount}>
      {isAdmin ? <DashboardAdmin pendingCount={pendingCount} /> : <DashboardUser />}
    </AppLayout>
  );
}

/* ── App ─────────────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardWrapper /></ProtectedRoute>} />
            <Route path="/users"     element={<ProtectedRoute adminOnly><AppLayout pendingCount={0}><UsersAdmin /></AppLayout></ProtectedRoute>} />
            <Route path="/map"       element={<ProtectedRoute><AppLayout pendingCount={0}><MapPage /></AppLayout></ProtectedRoute>} />
            <Route path="/routes"    element={<ProtectedRoute><AppLayout pendingCount={0}><RoutesPage /></AppLayout></ProtectedRoute>} />
            <Route path="/settings"  element={<ProtectedRoute><AppLayout pendingCount={0}><Settings /></AppLayout></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><AppLayout pendingCount={0}><Profile /></AppLayout></ProtectedRoute>} />
            <Route path="*"          element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}