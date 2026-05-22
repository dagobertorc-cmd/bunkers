import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useMovimientos } from '../hooks/useMovimientos';
import Badge      from '../components/ui/Badge';
import Spinner    from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';
import { fmtDate } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

export default function Movimientos() {
  const [page, setPage] = useState(1);
  const [tipo, setTipo] = useState('');
  const { data, total, loading } = useMovimientos({ tipo: tipo || undefined, page, limit: 20 });
  const { canWrite } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Movimientos</h1>
        {canWrite() && (
          <Link to="/movimientos/nuevo" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nuevo
          </Link>
        )}
      </div>

      <div className="card p-4">
        <select className="input-field max-w-xs" value={tipo} onChange={e => { setTipo(e.target.value); setPage(1); }}>
          <option value="">Todos los tipos</option>
          {['ENTRADA','SALIDA','TRASLADO','AJUSTE','PRESTAMO','DEVOLUCION'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {loading ? <Spinner /> : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Folio','Tipo','Bunker','Producto','Cantidad','Ingeniero','Tienda Destino','Fecha'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(m => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{m.folio}</td>
                  <td className="px-4 py-3"><Badge label={m.tipo_movimiento} /></td>
                  <td className="px-4 py-3">{m.bunker}</td>
                  <td className="px-4 py-3">{m.producto}</td>
                  <td className="px-4 py-3 font-semibold">{m.cantidad}</td>
                  <td className="px-4 py-3">{m.ingeniero}</td>
                  <td className="px-4 py-3 text-gray-500">{m.tienda_destino ?? m.bunker_destino ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(m.fecha_hora)}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Sin movimientos</td></tr>
              )}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination page={page} pages={Math.ceil(total / 20)} onPage={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
