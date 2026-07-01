import { useState, useEffect } from 'react';
import { Package, ArrowLeftRight, Bell, AlertTriangle } from 'lucide-react';
import KPICard           from '../components/dashboard/KPICard';
import MovimientosRecientes from '../components/dashboard/MovimientosRecientes';
import StockCritico      from '../components/dashboard/StockCritico';
import ConsumoPorBunker  from '../components/dashboard/ConsumoPorBunker';
import ProductosMasUsados from '../components/dashboard/ProductosMasUsados';
import Spinner           from '../components/ui/Spinner';
import { useAuth }       from '../hooks/useAuth';
import { useTheme }      from '../hooks/useTheme';
import { ROLES }         from '../utils/constants';
import {
  getKPIs, getConsumoPorBunker, getTopProductos, getMovimientosRecientes,
} from '../services/dashboard.service';
import { getCritico } from '../services/inventario.service';

export default function Dashboard() {
  const { hasRole } = useAuth();
  const isSupervisor = hasRole(ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.SUPERVISOR);

  const [kpis,      setKpis]      = useState(null);
  const [recientes, setRecientes] = useState([]);
  const [critico,   setCritico]   = useState([]);
  const [consumo,   setConsumo]   = useState([]);
  const [top,       setTop]       = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchRecientes = () =>
    getMovimientosRecientes(8).then(r => setRecientes(r.data.data || [])).catch(() => {});

  useEffect(() => {
    const requests = [
      fetchRecientes(),
      getCritico({}).then(r => setCritico(r.data.data || [])),
    ];
    if (isSupervisor) {
      requests.push(
        getKPIs().then(r => setKpis(r.data.data)),
        getConsumoPorBunker().then(r => setConsumo(r.data.data || [])),
        getTopProductos(8).then(r => setTop(r.data.data || [])),
      );
    }
    Promise.allSettled(requests).finally(() => setLoading(false));

    const interval = setInterval(fetchRecientes, 60_000);
    const onVisible = () => { if (document.visibilityState === 'visible') fetchRecientes(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupervisor]);

  const { t } = useTheme();

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: t.textFaint }}>Panel General</p>
          <h1 className="text-2xl font-bold" style={{ color: t.text }}>Dashboard</h1>
        </div>
        <div
          className="h-px flex-1 mx-6"
          style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.3), transparent)' }}
        />
      </div>

      {isSupervisor && kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Productos activos"   value={kpis.totalProductos}    icon={Package}        color="blue" />
          <KPICard title="Movimientos hoy"     value={kpis.totalMovHoy}       icon={ArrowLeftRight} color="green" />
          <KPICard title="Alertas pendientes"  value={kpis.alertasPendientes} icon={Bell}           color="yellow" />
          <KPICard title="Stock crítico"       value={kpis.stockCritico}      icon={AlertTriangle}  color="red" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MovimientosRecientes data={recientes} onRefresh={fetchRecientes} />
        <StockCritico data={critico} />
      </div>

      {isSupervisor && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConsumoPorBunker data={consumo} />
          <ProductosMasUsados data={top} />
        </div>
      )}
    </div>
  );
}
