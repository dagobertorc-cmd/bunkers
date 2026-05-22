import { Menu, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';
import { logout } from '../../services/auth.service';

export default function Navbar() {
  const { user, clearAuth } = useAuth();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-4">
      <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
        <Menu size={20} />
      </button>
      <span className="font-semibold text-gray-800 hidden sm:block">Bunkers de Refacciones</span>
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} />
          <span className="hidden sm:block">{user?.nombre}</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{user?.rol}</span>
        </div>
        <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors" title="Cerrar sesión">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
