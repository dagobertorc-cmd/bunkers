import { AlertTriangle } from 'lucide-react';

export default function StockCritico({ data = [] }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <AlertTriangle size={18} className="text-red-500" />
        Stock Crítico
      </h3>
      <div className="space-y-2">
        {data.map((i) => (
          <div key={i.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{i.producto}</p>
              <p className="text-xs text-gray-500">{i.bunker}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-red-600">{i.cantidad}</span>
              <span className="text-xs text-gray-400"> / {i.stock_minimo}</span>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-sm text-green-600 text-center py-4">Todo en orden</p>}
      </div>
    </div>
  );
}
