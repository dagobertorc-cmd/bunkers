import Badge from '../ui/Badge';
import { fmtDate } from '../../utils/formatters';

export default function MovimientosRecientes({ data = [] }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4">Movimientos Recientes</h3>
      <div className="space-y-2">
        {data.map((m) => (
          <div key={m.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <Badge label={m.tipo} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{m.producto}</p>
              <p className="text-xs text-gray-500">{m.bunker} · {m.ingeniero}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-gray-900">{m.cantidad}</p>
              <p className="text-xs text-gray-400">{fmtDate(m.fecha_hora)}</p>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin movimientos</p>}
      </div>
    </div>
  );
}
