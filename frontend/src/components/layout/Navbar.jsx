import { Menu, LogOut, User, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';
import { useTheme } from '../../hooks/useTheme';
import { logout } from '../../services/auth.service';
import logo from '../../assets/logo_bunkers.png';
import hebLogo from '../../assets/heb-logo.png';

const ROLE_COLORS = {
  SUPERADMIN: 'bg-purple-900/60 text-purple-300 border border-purple-700/40',
  ADMIN:      'bg-blue-900/40   text-blue-300   border border-blue-700/40',
  SUPERVISOR: 'bg-teal-900/50   text-teal-300   border border-teal-700/40',
  INGENIERO:  'bg-slate-800/60  text-slate-300  border border-slate-700/40',
  CONSULTA:   'bg-gray-800/60   text-gray-300   border border-gray-700/40',
};

const ROLE_COLORS_LIGHT = {
  SUPERADMIN: 'bg-purple-100 text-purple-700 border border-purple-200',
  ADMIN:      'bg-blue-100   text-blue-700   border border-blue-200',
  SUPERVISOR: 'bg-teal-100   text-teal-700   border border-teal-200',
  INGENIERO:  'bg-slate-100  text-slate-700  border border-slate-200',
  CONSULTA:   'bg-gray-100   text-gray-600   border border-gray-200',
};

export default function Navbar() {
  const { user, clearAuth }  = useAuth();
  const toggleSidebar  = useUIStore((s) => s.toggleSidebar);
  const toggleTheme    = useUIStore((s) => s.toggleTheme);
  const { t, isDark }  = useTheme();
  const navigate       = useNavigate();

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    clearAuth();
    navigate('/login');
  };

  const roleCls = isDark
    ? (ROLE_COLORS[user?.rol]      ?? ROLE_COLORS.CONSULTA)
    : (ROLE_COLORS_LIGHT[user?.rol] ?? ROLE_COLORS_LIGHT.CONSULTA);

  return (
    <header
      className="relative h-14 flex items-center px-4 gap-4 transition-all duration-300"
      style={t.navbar}
    >
      {/* Hamburger */}
      <button
        onClick={toggleSidebar}
        className="p-1 rounded-md transition-colors"
        style={{ color: t.navMuted }}
        onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
        onMouseLeave={e => e.currentTarget.style.color = t.navMuted}
      >
        <Menu size={20} />
      </button>

      {/* Logo mobile */}
      <img
        src={logo}
        alt="Bunkers"
        className="h-7 w-auto object-contain sm:hidden"
        style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.35))' }}
      />

      {/* Título desktop */}
      <span className="font-semibold hidden sm:block tracking-wide text-sm"
            style={{ color: t.navText }}>
        Sistema de Gestión · Refacciones
      </span>

      {/* Logo HEB centrado */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-none">
        <img
          src={hebLogo}
          alt="H-E-B"
          className="h-9 w-auto object-contain"
          style={{ mixBlendMode: 'normal' }}
        />
      </div>

      <div className="flex-1" />

      {/* ── Botón tema ── */}
      <button
        onClick={toggleTheme}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200"
        style={{
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(37,99,235,0.08)',
          border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(37,99,235,0.20)',
          color: isDark ? '#fbbf24' : '#2563eb',
        }}
        title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      >
        {isDark
          ? <Sun  size={15} className="flex-shrink-0" />
          : <Moon size={15} className="flex-shrink-0" />
        }
        <span className="text-xs font-medium hidden sm:inline">
          {isDark ? 'Claro' : 'Oscuro'}
        </span>
      </button>

      {/* Usuario */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            boxShadow: '0 0 10px rgba(59,130,246,0.3)',
          }}
        >
          <User size={14} className="text-white" />
        </div>
        <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
          <span className="text-sm font-medium" style={{ color: t.navText }}>
            {user?.nombre}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleCls}`}>
            {user?.rol}
          </span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="p-1.5 rounded-md transition-colors ml-1 hover:bg-red-500/10"
        style={{ color: t.navMuted }}
        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
        onMouseLeave={e => e.currentTarget.style.color = t.navMuted}
        title="Cerrar sesión"
      >
        <LogOut size={17} />
      </button>
    </header>
  );
}
