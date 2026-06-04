import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pencil, AlertTriangle } from 'lucide-react';
import { useCRUD }   from '../hooks/useCRUD';
import Modal         from '../components/ui/Modal';
import Spinner       from '../components/ui/Spinner';
import Pagination    from '../components/ui/Pagination';
import Alert         from '../components/ui/Alert';
import { useAuth }   from '../hooks/useAuth';
import api           from '../services/api';

function EditStockModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    stock_minimo: item.stock_minimo,
    stock_maximo: item.stock_maximo ?? '',
    ubicacion:    item.ubicacion ?? '',
  });
  const [error,  setError]  = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put(`/inventario/${item.id}`, form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-3 text-sm">
        <p className="font-medium">{item.producto}</p>
        <p className="text-gray-500">{item.bunker} · Stock actual: <strong>{item.cantidad} {item.unidad_medida}</strong></p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Stock mínimo *</label>
          <input type="number" min="0" className="input-field" required
            value={form.stock_minimo} onChange={e => setForm(f => ({ ...f, stock_minimo: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Stock máximo</label>
          <input type="number" min="0" className="input-field"
            value={form.stock_maximo} onChange={e => setForm(f => ({ ...f, stock_maximo: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Ubicación (estante / cajón)</label>
          <input className="input-field"
            value={form.ubicacion} onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))} />
        </div>
      </div>
      <Alert type="error" message={error} />
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
      </div>
    </form>
  );
}

export default function Inventario() {
  const [searchParams] = useSearchParams();
  const [page,     setPage]     = useState(1);
  const [bunkerId, setBunkerId] = useState(searchParams.get('bunker_id') || '');
  const [bunkers,  setBunkers]  = useState([]);
  const [editItem, setEditItem] = useState(null);
  const { isAdmin } = useAuth();

  const { data, total, loading, error, refetch } = useCRUD(
    '/inventario',
    { bunker_id: bunkerId || undefined, page, limit: 30 }
  );

  useEffect(() => {
    api.get('/bunkers').then(r => setBunkers(r.data.data || []));
  }, []);

  const pages = Math.ceil(total / 30);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <span className="text-sm text-gray-500">{total} registros</span>
      </div>

      <div className="card p-4 flex gap-3 flex-wrap">
        <select className="input-field max-w-xs" value={bunkerId} onChange={e => { setBunkerId(e.target.value); setPage(1); }}>
          <option value="">Todos los bunkers</option>
          {bunkers.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
        </select>
      </div>

      <Alert type="error" message={error} />

      {loading ? <Spinner /> : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ borderBottom: '1px solid var(--divider)', backgroundColor: 'var(--bg-card-2)' }}>
              <tr>{['Bunker','Producto','Categoría','Cantidad','Mín','Máx','Ubicación','Acciones'].map(h =>
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {data.map(i => (
                <tr key={i.id}
                  className={`border-b transition-colors ${i.cantidad <= i.stock_minimo ? 'bg-red-500/10' : ''}`}
                  style={{ borderColor: 'var(--divider)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--row-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = i.cantidad <= i.stock_minimo ? 'rgba(239,68,68,0.10)' : 'transparent'}
                >
                  <td className="px-4 py-3 whitespace-nowrap font-medium" style={{ color: 'var(--text-primary)' }}>{i.bunker}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{i.producto}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{i.categoria}</td>
                  <td className={`px-4 py-3 font-bold flex items-center gap-1 ${
                    i.cantidad === 0 ? 'text-red-700' : i.cantidad <= i.stock_minimo ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {i.cantidad <= i.stock_minimo && <AlertTriangle size={13} />}
                    {i.cantidad} {i.unidad_medida}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-faint)' }}>{i.stock_minimo}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-faint)' }}>{i.stock_maximo ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-faint)' }}>{i.ubicacion ?? '—'}</td>
                  <td className="px-4 py-3">
                    {isAdmin() && (
                      <button className="hover:text-yellow-400 transition-colors"
                              style={{ color: 'var(--text-faint)' }}
                              title="Editar stock mínimo" onClick={() => setEditItem(i)}>
                        <Pencil size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-gray-400">Sin resultados</td></tr>}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination page={page} pages={pages} onPage={setPage} />
          </div>
        </div>
      )}

      {editItem && (
        <Modal open onClose={() => setEditItem(null)} title="Editar Stock Mínimo / Ubicación">
          <EditStockModal item={editItem} onClose={() => setEditItem(null)} onSaved={refetch} />
        </Modal>
      )}
    </div>
  );
}
