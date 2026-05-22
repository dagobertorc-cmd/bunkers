import { useState } from 'react';
import { Plus } from 'lucide-react';
import Badge      from '../components/ui/Badge';
import Spinner    from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';
import Modal      from '../components/ui/Modal';
import Alert      from '../components/ui/Alert';
import { fmtDate } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

function useTickets(params) {
  const [data,    setData]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const fetch = () => {
    setLoading(true);
    api.get('/tickets', { params })
      .then(r => { setData(r.data.data?.data || []); setTotal(r.data.data?.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useState(() => { fetch(); }, []); // eslint-disable-line
  return { data, total, loading, refetch: fetch };
}

export default function Tickets() {
  const [page,    setPage]    = useState(1);
  const [open,    setOpen]    = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState({ descripcion: '', prioridad: 'MEDIA' });
  const { canWrite } = useAuth();
  const { data, total, loading: listLoading, refetch } = useTickets({ page, limit: 20 });

  const crear = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/tickets', form);
      setOpen(false);
      setForm({ descripcion: '', prioridad: 'MEDIA' });
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        {canWrite() && (
          <button className="btn-primary flex items-center gap-2" onClick={() => setOpen(true)}>
            <Plus size={16} /> Nuevo ticket
          </button>
        )}
      </div>

      {listLoading ? <Spinner /> : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Número','Estado','Prioridad','Descripción','Tienda','Fecha'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(t => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{t.numero}</td>
                  <td className="px-4 py-3"><Badge label={t.estado} /></td>
                  <td className="px-4 py-3"><Badge label={t.prioridad} /></td>
                  <td className="px-4 py-3 max-w-xs truncate">{t.descripcion}</td>
                  <td className="px-4 py-3 text-gray-500">{t.tienda ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(t.created_at)}</td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">Sin tickets</td></tr>}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination page={page} pages={Math.ceil(total / 20)} onPage={setPage} />
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo Ticket">
        <form onSubmit={crear} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea className="input-field" rows={4} required
              value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
            <select className="input-field" value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))}>
              {['BAJA','MEDIA','ALTA','CRITICA'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <Alert type="error" message={error} />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creando...' : 'Crear ticket'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
