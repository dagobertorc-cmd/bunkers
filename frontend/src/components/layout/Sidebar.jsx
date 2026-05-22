import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ArrowLeftRight, History,
  Boxes, Store, Users, Ticket, Bell, BarChart2, Wrench, Upload,
  Warehouse, ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const NAV = [
  { to: '/',            label: 'Dashboard',    icon: LayoutDashboard, roles: null },
  { to: '/inventario',    label: 'Inventario',     icon: Package,       roles: null },
  { to: '/crearh',        label: 'CREARH',         icon: Warehouse,     roles: null },
  { to: '/requisiciones', label: 'Requisiciones',  icon: ClipboardList, roles: null },
  { to: '/movimientos',   label: 'Movimientos',    icon: ArrowLeftRight, roles: null },
  { to: '/historial',   label: 'Historial',    icon: History,         roles: null },
  { to: '/productos',   label: 'Productos',    icon: Boxes,           roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { to: '/bunkers',     label: 'Bunkers',      icon: Wrench,          roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { to: '/tiendas',     label: 'Tiendas',      icon: Store,           roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { to: '/tickets',     label: 'Tickets',      icon: Ticket,          roles: null },
  { to: '/alertas',     label: 'Alertas',      icon: Bell,            roles: null },
  { to: '/usuarios',    label: 'Usuarios',     icon: Users,           roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
  { to: '/reportes',    label: 'Reportes',     icon: BarChart2,       roles: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.SUPERVISOR] },
  { to: '/importar',    label: 'Importar',     icon: Upload,          roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
];

export default function Sidebar({ open }) {
  const { hasRole } = useAuth();

  const visible = NAV.filter(n => !n.roles || hasRole(...n.roles));

  return (
    <aside className={`
      fixed top-0 left-0 h-full bg-blue-900 text-white z-40 transition-all duration-200
      ${open ? 'w-56' : 'w-14'} flex flex-col
    `}>
      <div className="flex items-center gap-2 px-3 py-4 border-b border-blue-800">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-sm flex-shrink-0">B</div>
        {open && <span className="font-semibold text-sm leading-tight">Bunkers<br/><span className="text-blue-300 text-xs font-normal">Refacciones</span></span>}
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {visible.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-800'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {open && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
