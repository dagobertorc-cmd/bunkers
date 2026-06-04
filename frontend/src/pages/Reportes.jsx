import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import ConsumoPorBunker   from '../components/dashboard/ConsumoPorBunker';
import ProductosMasUsados from '../components/dashboard/ProductosMasUsados';
import Spinner from '../components/ui/Spinner';
import { getConsumoPorBunker, getTopProductos } from '../services/dashboard.service';
import { exportarInventario, exportarMovimientos, exportarStockCritico } from '../services/reportes.service';
import { useTheme } from '../hooks/useTheme';

function ExportButton({ label, onClick, loading }) {
  const { t } = useTheme();
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
      style={{
        background: 'rgba(37,99,235,0.12)',
        border: '1px solid rgba(37,99,235,0.3)',
        color: t.accent ?? '#3b82f6',
      }}
    >
      <Download size={15} />
      {loading ? 'Generando...' : label}
    </button>
  );
}

export default function Reportes() {
  const [consumo,  setConsumo]  = useState([]);
  const [top,      setTop]      = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    Promise.allSettled([
      getConsumoPorBunker().then(r => setConsumo(r.data.data || [])),
      getTopProductos(15).then(r => setTop(r.data.data || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const handleExport = async (key, fn) => {
    setExporting(key);
    try { await fn(); } catch (e) { console.error(e); } finally { setExporting(''); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <div className="flex flex-wrap gap-2">
          <ExportButton
            label="Inventario Excel"
            loading={exporting === 'inv'}
            onClick={() => handleExport('inv', () => exportarInventario())}
          />
          <ExportButton
            label="Movimientos Excel"
            loading={exporting === 'mov'}
            onClick={() => handleExport('mov', () => exportarMovimientos())}
          />
          <ExportButton
            label="Stock Crítico Excel"
            loading={exporting === 'sc'}
            onClick={() => handleExport('sc', () => exportarStockCritico())}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsumoPorBunker data={consumo} />
        <ProductosMasUsados data={top} />
      </div>
    </div>
  );
}
