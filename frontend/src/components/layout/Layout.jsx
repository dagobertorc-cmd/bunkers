import Sidebar from './Sidebar';
import Navbar  from './Navbar';
import { useUIStore } from '../../store/uiStore';

export default function Layout({ children }) {
  const open = useUIStore((s) => s.sidebarOpen);
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={open} />
      <div className={`transition-all duration-200 ${open ? 'ml-56' : 'ml-14'}`}>
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
