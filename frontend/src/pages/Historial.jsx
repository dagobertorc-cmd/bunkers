import { useState } from 'react';
import { useMovimientos } from '../hooks/useMovimientos';
import Badge      from '../components/ui/Badge';
import Spinner    from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';
import { fmtDate } from '../utils/formatters';

export default function Historial() {
  const [page,      setPage]      = useState(1);
  const [fechaDesde,setFechaDesde]= useState('');
  const [fechaHasta,setFechaHasta]= useState('');

  const { data, total, loading } = useMovimientos({
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
    page,
    limit: 30,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Historial de Movimientos</h1>

      <div className="card p-4 flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desde</label>
          <input type="date" className="input-field" value={fechaDesde} onChange={e => { setFechaDesde(e.target.value); setPage(1); }} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hasta</label>
          <input type="date" className="input-field" value={fechaHasta} onChange={e => { setFechaHasta(e.target.value); setPage(1); }} />
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Fecha','Folio','Tipo','Producto','Cantidad','Bunker','Destino','Ingeniero','Ticket'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(m => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">{fmtDate(m.fecha_hora)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{m.folio}</td>
                  <td className="px-4 py-3"><Badge label={m.tipo_movimiento} /></td>
                  <td className="px-4 py-3">{m.producto}</td>
                  <td className="px-4 py-3 font-semibold">{m.cantidad}</td>
                  <td className="px-4 py-3">{m.bunker}</td>
                  <td className="px-4 py-3 text-gray-500">{m.tienda_destino ?? m.bunker_destino ?? '—'}</td>
                  <td className="px-4 py-3">{m.ingeniero}</td>
                  <td className="px-4 py-3 text-gray-500">{m.ticket ?? '—'}</td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-gray-400">Sin resultados</td></tr>}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination page={page} pages={Math.ceil(total / 30)} onPage={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
