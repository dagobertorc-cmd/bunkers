import { useAlertas } from '../hooks/useAlertas';
import Badge   from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { fmtDate } from '../utils/formatters';
import api from '../services/api';

export default function Alertas() {
  const { data, loading, refetch } = useAlertas(false);

  const marcarLeida = async (id) => {
    await api.put(`/alertas/${id}/leer`);
    refetch();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Alertas de Stock</h1>
      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {data.map(a => (
            <div key={a.id} className="card flex items-start gap-4">
              <Badge label={a.tipo_alerta} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{a.mensaje}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {a.producto} · {a.bunker} · Stock actual: <strong>{a.cantidad}</strong> / mín: {a.stock_minimo}
                </p>
                <p className="text-xs text-gray-400">{fmtDate(a.created_at)}</p>
              </div>
              <button className="btn-secondary text-xs px-3 py-1" onClick={() => marcarLeida(a.id)}>
                Marcar leída
              </button>
            </div>
          ))}
          {data.length === 0 && (
            <div className="card text-center text-green-600 py-8">No hay alertas pendientes</div>
          )}
        </div>
      )}
    </div>
  );
}
