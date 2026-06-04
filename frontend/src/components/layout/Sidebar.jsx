import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ArrowLeftRight, History,
  Boxes, Store, Users, Ticket, Bell, BarChart2, Wrench, Upload,
  Warehouse, ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import logo from '../../assets/logo_bunkers.png';

const NAV = [
  { to: '/',            label: 'Dashboard',    icon: LayoutDashboard, roles: null },
  { to: '/inventario',    label: 'Inventario',     icon: Package,        roles: null },
  { to: '/crearh',        label: 'CREARH',         icon: Warehouse,      roles: null },
  { to: '/requisiciones', label: 'Requisiciones',  icon: ClipboardList,  roles: null },
  { to: '/movimientos',   label: 'Movimientos',    icon: ArrowLeftRight,  roles: null },
  { to: '/historial',     label: 'Historial',      icon: History,         roles: null },
  { to: '/productos',     label: 'Productos',      icon: Boxes,           roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { to: '/bunkers',       label: 'Bunkers',        icon: Wrench,          roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { to: '/tiendas',       label: 'Tiendas',        icon: Store,           roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { to: '/tickets',       label: 'Tickets',        icon: Ticket,          roles: null },
  { to: '/alertas',       label: 'Alertas',        icon: Bell,            roles: null },
  { to: '/usuarios',      label: 'Usuarios',       icon: Users,           roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { to: '/reportes',      label: 'Reportes',       icon: BarChart2,       roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.SUPERVISOR] },
  { to: '/importar',      label: 'Importar',       icon: Upload,          roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
];

export default function Sidebar({ open }) {
  const { hasRole } = useAuth();
  const visible = NAV.filter(n => !n.roles || hasRole(...n.roles));

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        transition-all duration-200
        ${open ? 'w-56' : 'w-14'}
      `}
      style={{
        background: 'linear-gradient(180deg, #0f2040 0%, #122347 100%)',
        borderRight: '1px solid rgba(59,130,246,0.20)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center justify-center px-3 py-5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(59,130,246,0.12)', minHeight: '90px' }}
      >
        {open ? (
          <img
            src={logo}
            alt="Bunkers de Refacciones"
            className="w-52 h-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 10px rgba(59,130,246,0.45))' }}
          />
        ) : (
          <img
            src={logo}
            alt="B"
            className="h-9 w-9 object-contain rounded"
            style={{
              objectPosition: 'center',
              filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.4))',
            }}
          />
        )}
      </div>

      {/* ── Navegación ── */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {visible.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 mx-2 my-0.5 rounded-lg text-sm
               transition-all duration-150 group
               ${isActive
                 ? 'text-white'
                 : 'text-blue-300/70 hover:text-blue-200 hover:bg-navy-800/60'
               }`
            }
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(90deg, rgba(37,99,235,0.35) 0%, rgba(37,99,235,0.10) 100%)',
              boxShadow: 'inset 3px 0 0 #3b82f6, 0 0 12px rgba(59,130,246,0.15)',
            } : {}}
          >
            <Icon size={18} className="flex-shrink-0" />
            {open && <span className="truncate">{label}</span>}
            {/* Tooltip en modo colapsado */}
            {!open && (
              <span
                className="absolute left-14 bg-navy-800 text-white text-xs px-2.5 py-1.5 rounded-lg
                           whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none
                           transition-opacity duration-150 z-50"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Línea decorativa inferior ── */}
      <div
        className="h-px mx-3 mb-2"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)' }}
      />
      <div className="px-3 pb-4 flex-shrink-0">
        {open && (
          <p className="text-xs text-blue-400/30 text-center tracking-widest">v1.0</p>
        )}
      </div>
    </aside>
  );
}
