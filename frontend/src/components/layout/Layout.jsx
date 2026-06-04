import Sidebar from './Sidebar';
import Navbar  from './Navbar';
import { useUIStore } from '../../store/uiStore';

export default function Layout({ children }) {
  const open = useUIStore((s) => s.sidebarOpen);
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)', transition: 'background-color 0.25s ease' }}>
      <Sidebar open={open} />
      <div className={`transition-all duration-200 ${open ? 'ml-56' : 'ml-14'}`}>
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
