import { useEffect, useState } from 'react';
import ConsumoPorBunker  from '../components/dashboard/ConsumoPorBunker';
import ProductosMasUsados from '../components/dashboard/ProductosMasUsados';
import Spinner from '../components/ui/Spinner';
import { getConsumoPorBunker, getTopProductos } from '../services/dashboard.service';

export default function Reportes() {
  const [consumo,  setConsumo]  = useState([]);
  const [top,      setTop]      = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getConsumoPorBunker().then(r => setConsumo(r.data.data || [])),
      getTopProductos(15).then(r => setTop(r.data.data || [])),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsumoPorBunker data={consumo} />
        <ProductosMasUsados data={top} />
      </div>
    </div>
  );
}
