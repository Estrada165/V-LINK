import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login              from './pages/auth/Login';
import DashboardAdmin     from './pages/admin/DashboardAdmin';
import UsersAdmin         from './pages/admin/UsersAdmin';
import AuditLog           from './pages/admin/AuditLog';
import Informes           from './pages/admin/Informes';
import PagosAdmin         from './pages/admin/PagosAdmin';
import DashboardSupervisor from './pages/supervisor/DashboardSupervisor';
import DashboardTecnico   from './pages/tecnico/DashboardTecnico';
import TicketsTecnico     from './pages/tecnico/TicketsTecnico';
import DashboardUser      from './pages/shared/DashboardUser';
import MapPage            from './pages/shared/MapPage';
import RoutesPage         from './pages/shared/Routes';
import Settings           from './pages/shared/Settings';
import Profile            from './pages/shared/Profile';
import Tickets            from './pages/shared/Tickets';
import PlanPage           from './pages/shared/PlanPage';
import NotFound           from './pages/shared/NotFound';

const ICONOS = {
  dashboard: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3"  y="3"  width="7" height="7" rx="1.5"/>
      <rect x="14" y="3"  width="7" height="7" rx="1.5"/>
      <rect x="3"  y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  mapa: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="3 7 9 4 15 7 21 4 21 17 15 20 9 17 3 20"/>
      <line x1="9" y1="4" x2="9" y2="17"/>
      <line x1="15" y1="7" x2="15" y2="20"/>
    </svg>
  ),
  rutas: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 12h18"/>
      <path d="M3 6l6 6-6 6"/>
    </svg>
  ),
  ajustes: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  perfil: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  usuarios: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  auditoria: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  informes: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="12" y1="9"  x2="8" y2="9"/>
    </svg>
  ),
  tickets: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
    </svg>
  ),
  pagos: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
};

const NAV_POR_ROL = {
  admin: [
    { ruta: '/dashboard', etiqueta: 'DASHBOARD', Icono: ICONOS.dashboard },
    { ruta: '/users',     etiqueta: 'USUARIOS',  Icono: ICONOS.usuarios  },
    { ruta: '/audit',     etiqueta: 'AUDITORÍA', Icono: ICONOS.auditoria },
    { ruta: '/informes',  etiqueta: 'INFORMES',  Icono: ICONOS.informes  },
    { ruta: '/pagos',     etiqueta: 'PAGOS',     Icono: ICONOS.pagos     },
    { ruta: '/tickets',   etiqueta: 'TICKETS',   Icono: ICONOS.tickets   },
    { ruta: '/map',       etiqueta: 'MAPAS',     Icono: ICONOS.mapa      },
    { ruta: '/routes',    etiqueta: 'RUTAS',     Icono: ICONOS.rutas     },
    { ruta: '/settings',  etiqueta: 'AJUSTES',   Icono: ICONOS.ajustes   },
    { ruta: '/profile',   etiqueta: 'PERFIL',    Icono: ICONOS.perfil    },
  ],
  supervisor: [
    { ruta: '/dashboard', etiqueta: 'DASHBOARD', Icono: ICONOS.dashboard },
    { ruta: '/users',     etiqueta: 'USUARIOS',  Icono: ICONOS.usuarios  },
    { ruta: '/tickets',   etiqueta: 'TICKETS',   Icono: ICONOS.tickets   },
    { ruta: '/informes',  etiqueta: 'INFORMES',  Icono: ICONOS.informes  },
    { ruta: '/pagos',     etiqueta: 'PAGOS',     Icono: ICONOS.pagos     },
    { ruta: '/audit',     etiqueta: 'AUDITORÍA', Icono: ICONOS.auditoria },
    { ruta: '/map',       etiqueta: 'MAPAS',     Icono: ICONOS.mapa      },
    { ruta: '/routes',    etiqueta: 'RUTAS',     Icono: ICONOS.rutas     },
    { ruta: '/settings',  etiqueta: 'AJUSTES',   Icono: ICONOS.ajustes   },
    { ruta: '/profile',   etiqueta: 'PERFIL',    Icono: ICONOS.perfil    },
  ],
  tecnico: [
    { ruta: '/dashboard',        etiqueta: 'DASHBOARD',   Icono: ICONOS.dashboard },
    { ruta: '/tickets-tecnico',  etiqueta: 'MIS TICKETS', Icono: ICONOS.tickets   },
    { ruta: '/map',              etiqueta: 'MAPAS',       Icono: ICONOS.mapa      },
    { ruta: '/settings',         etiqueta: 'AJUSTES',     Icono: ICONOS.ajustes   },
    { ruta: '/profile',          etiqueta: 'PERFIL',      Icono: ICONOS.perfil    },
  ],
  usuario: [
    { ruta: '/dashboard', etiqueta: 'DASHBOARD', Icono: ICONOS.dashboard },
    { ruta: '/map',       etiqueta: 'MAPAS',     Icono: ICONOS.mapa      },
    { ruta: '/routes',    etiqueta: 'RUTAS',     Icono: ICONOS.rutas     },
    { ruta: '/tickets',   etiqueta: 'TICKETS',   Icono: ICONOS.tickets   },
    { ruta: '/plan',      etiqueta: 'MI PLAN',   Icono: ICONOS.pagos     },
    { ruta: '/settings',  etiqueta: 'AJUSTES',   Icono: ICONOS.ajustes   },
    { ruta: '/profile',   etiqueta: 'PERFIL',    Icono: ICONOS.perfil    },
  ],
};

const TITULOS_PAGINA = {
  '/dashboard':       'Panel de Control',
  '/users':           'Gestión de Usuarios',
  '/audit':           'Registro de Auditoría',
  '/informes':        'Informes de Supervisores',
  '/tickets':         'Tickets de Soporte',
  '/tickets-tecnico': 'Mis Tickets',
  '/map':             'Mapa Táctico',
  '/routes':          'Rutas',
  '/settings':        'Ajustes',
  '/profile':         'Mi Perfil',
  '/pagos':           'Pagos y Suscripciones',
  '/plan':            'Mi Plan',
};

const COLORES_ROL = {
  admin:      { fg: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)', etiqueta: 'ADMINISTRADOR' },
  supervisor: { fg: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)',  etiqueta: 'SUPERVISOR'    },
  tecnico:    { fg: 'var(--cyan)',   bg: 'var(--cyan-soft)',   border: 'var(--cyan-border)',   etiqueta: 'TÉCNICO'       },
  usuario:    { fg: 'var(--green)',  bg: 'var(--green-soft)',  border: 'var(--green-border)',  etiqueta: 'USUARIO'       },
};

function RutaProtegida({ children, roles = [] }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" />;
  if (roles.length > 0 && !roles.includes(currentUser.rol)) return <Navigate to="/dashboard" />;
  return children;
}

function ItemNav({ ruta, etiqueta, Icono, activo, conBadge, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 8, width: '100%',
      background: activo ? 'var(--accent-soft)' : 'transparent',
      border: `1px solid ${activo ? 'var(--accent-border)' : 'transparent'}`,
      cursor: 'pointer', transition: 'all .18s', textAlign: 'left', position: 'relative',
      color: activo ? 'var(--accent)' : 'var(--text-muted)',
    }}
      onMouseEnter={e => !activo && (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={e => !activo && (e.currentTarget.style.background = 'transparent')}>
      <span style={{ flexShrink: 0 }}><Icono /></span>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', flex: 1 }}>{etiqueta}</span>
      {conBadge && (
        <div className="anim-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 6px var(--amber)' }} />
      )}
    </button>
  );
}

function Sidebar({ pendingCount = 0 }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const rol      = currentUser?.rol || 'usuario';
  const items    = NAV_POR_ROL[rol] || NAV_POR_ROL.usuario;
  const colores  = COLORES_ROL[rol] || COLORES_ROL.usuario;

  return (
    <aside style={{
      width: 220, minHeight: '100vh',
      background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      transition: 'background .35s, border-color .35s',
    }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--sidebar-border)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg viewBox="0 0 32 32" width="26" height="26">
            <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1"/>
          </svg>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 19, letterSpacing: '0.2em', color: 'var(--text-primary)' }}>MOTOGUARD</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '5px 10px', background: colores.bg, border: `1px solid ${colores.border}`, borderRadius: 7 }}>
          <div className="anim-blink" style={{ width: 5, height: 5, borderRadius: '50%', background: colores.fg, boxShadow: `0 0 5px ${colores.fg}` }}/>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: colores.fg, letterSpacing: '0.12em' }}>{colores.etiqueta}</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {items.map(({ ruta, etiqueta, Icono }) => (
          <ItemNav
            key={ruta}
            ruta={ruta}
            etiqueta={etiqueta}
            Icono={Icono}
            activo={location.pathname === ruta}
            conBadge={ruta === '/users' && pendingCount > 0}
            onClick={() => navigate(ruta)}
          />
        ))}
      </nav>

      <div style={{ padding: '14px 10px', borderTop: '1px solid var(--sidebar-border)' }}>
        <div style={{ padding: '10px 12px', marginBottom: 8, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.nombre_completo}
          </p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.correo_electronico}
          </p>
        </div>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 7, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.1em', transition: 'all .18s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-soft)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          CERRAR SESIÓN
        </button>
      </div>
    </aside>
  );
}

function NavMovil() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const rol   = currentUser?.rol || 'usuario';
  const items = NAV_POR_ROL[rol] || NAV_POR_ROL.usuario;

  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'var(--nav-bg)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border)', padding: '6px 0 10px' }}>
      <style>{`.mg-nav-scroll::-webkit-scrollbar{display:none}`}</style>
      <div className="mg-nav-scroll" style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', paddingLeft: 8, paddingRight: 8 }}>
        {items.map(({ ruta, etiqueta, Icono }) => {
          const activo = location.pathname === ruta;
          return (
            <button key={ruta} onClick={() => navigate(ruta)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: activo ? 'var(--accent)' : 'var(--text-muted)', padding: '4px 10px', borderRadius: 8, flexShrink: 0, minWidth: 56 }}>
              <Icono />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 7, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{etiqueta}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function BarraSuperiorEscritorio() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const rol     = currentUser?.rol || 'usuario';
  const colores = COLORES_ROL[rol] || COLORES_ROL.usuario;
  const titulo  = TITULOS_PAGINA[location.pathname] || '';
  const nombre  = (currentUser?.nombre_completo || 'Usuario').split(' ')[0].toUpperCase();

  return (
    <header style={{ height: 52, background: 'var(--nav-bg)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, transition: 'background .35s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="var(--accent)" strokeWidth="1">
          <polygon points="7,1 13,4 13,10 7,13 1,10 1,4"/>
        </svg>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>MOTOGUARD</span>
        <span style={{ color: 'var(--text-faint)', margin: '0 4px', fontSize: 13 }}>›</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>{titulo.toUpperCase()}</span>
      </div>
      <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: colores.bg, border: `1px solid ${colores.border}`, borderRadius: 6, cursor: 'pointer' }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: colores.fg, letterSpacing: '0.1em' }}>{nombre}</span>
      </button>
    </header>
  );
}

function BarraSuperiorMovil() {
  const navigate = useNavigate();
  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--nav-bg)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg viewBox="0 0 24 24" width="18" height="18">
          <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1"/>
        </svg>
        <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: '0.2em', color: 'var(--text-primary)' }}>MOTOGUARD</span>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div className="anim-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 5px var(--green)' }}/>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)' }}>EN LÍNEA</span>
      </div>
    </header>
  );
}

function LayoutApp({ children, pendingCount = 0 }) {
  const [esEscritorio, setEsEscritorio] = React.useState(window.innerWidth >= 768);

  React.useEffect(() => {
    const actualizar = () => setEsEscritorio(window.innerWidth >= 768);
    window.addEventListener('resize', actualizar);
    return () => window.removeEventListener('resize', actualizar);
  }, []);

  if (esEscritorio) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar pendingCount={pendingCount} />
        <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <BarraSuperiorEscritorio />
          <main style={{ flex: 1, background: 'var(--bg-base)', overflowY: 'auto' }}>{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <BarraSuperiorMovil />
      <main style={{ paddingTop: 52, paddingBottom: 72 }}>{children}</main>
      <NavMovil />
    </div>
  );
}

function EnvolturaDashboard() {
  const { currentUser } = useAuth();
  const [pendingCount, setPendingCount] = React.useState(0);
  const rol = currentUser?.rol;

  React.useEffect(() => {
    if (!['admin', 'supervisor'].includes(rol)) return;
    const cargarPendientes = async () => {
      try {
        const { adminService } = await import('./services/api');
        const resultado = await adminService.getAllUsers();
        const usuarios  = Array.isArray(resultado) ? resultado : (resultado.users || []);
        setPendingCount(usuarios.filter(u => !u.activo && u.rol !== 'admin').length);
      } catch {}
    };
    cargarPendientes();
    const intervalo = setInterval(cargarPendientes, 30000);
    return () => clearInterval(intervalo);
  }, [rol]);

  const dashboardPorRol = {
    admin:      <DashboardAdmin      pendingCount={pendingCount} />,
    supervisor: <DashboardSupervisor />,
    tecnico:    <DashboardTecnico />,
    usuario:    <DashboardUser />,
  };

  return (
    <LayoutApp pendingCount={pendingCount}>
      {dashboardPorRol[rol] || <DashboardUser />}
    </LayoutApp>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route path="/dashboard" element={
              <RutaProtegida>
                <EnvolturaDashboard />
              </RutaProtegida>
            } />

            <Route path="/users" element={
              <RutaProtegida roles={['admin', 'supervisor']}>
                <LayoutApp><UsersAdmin /></LayoutApp>
              </RutaProtegida>
            } />

            <Route path="/audit" element={
              <RutaProtegida roles={['admin', 'supervisor']}>
                <LayoutApp><AuditLog /></LayoutApp>
              </RutaProtegida>
            } />

            <Route path="/informes" element={
              <RutaProtegida roles={['admin', 'supervisor']}>
                <LayoutApp><Informes /></LayoutApp>
              </RutaProtegida>
            } />

            <Route path="/tickets" element={
              <RutaProtegida roles={['admin', 'supervisor', 'usuario']}>
                <LayoutApp><Tickets /></LayoutApp>
              </RutaProtegida>
            } />

            <Route path="/tickets-tecnico" element={
              <RutaProtegida roles={['tecnico']}>
                <LayoutApp><TicketsTecnico /></LayoutApp>
              </RutaProtegida>
            } />

            <Route path="/map"      element={<RutaProtegida><LayoutApp><MapPage    /></LayoutApp></RutaProtegida>} />
            <Route path="/routes"   element={<RutaProtegida><LayoutApp><RoutesPage /></LayoutApp></RutaProtegida>} />
            <Route path="/settings" element={<RutaProtegida><LayoutApp><Settings   /></LayoutApp></RutaProtegida>} />
            <Route path="/profile"  element={<RutaProtegida><LayoutApp><Profile    /></LayoutApp></RutaProtegida>} />

            <Route path="/plan" element={
              <RutaProtegida roles={['usuario']}>
                <LayoutApp><PlanPage /></LayoutApp>
              </RutaProtegida>
            } />

            <Route path="/pagos" element={
              <RutaProtegida roles={['admin', 'supervisor']}>
                <LayoutApp><PagosAdmin /></LayoutApp>
              </RutaProtegida>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}