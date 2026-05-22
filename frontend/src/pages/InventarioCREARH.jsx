import { useState, useEffect } from 'react';
import { Pencil, Warehouse } from 'lucide-react';
import { useCRUD }    from '../hooks/useCRUD';
import Modal          from '../components/ui/Modal';
import Spinner        from '../components/ui/Spinner';
import Pagination     from '../components/ui/Pagination';
import Alert          from '../components/ui/Alert';
import { useAuth }    from '../hooks/useAuth';
import api            from '../services/api';

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
        <p className="text-gray-500">{item.marca} {item.modelo} · Stock actual: <strong>{item.cantidad} {item.unidad_medida}</strong></p>
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
          <label className="block text-xs font-medium text-gray-700 mb-1">Ubicación (pasillo / estante)</label>
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

export default function InventarioCREARH() {
  const [page,       setPage]       = useState(1);
  const [buscar,     setBuscar]     = useState('');
  const [buscarQ,    setBuscarQ]    = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [editItem,   setEditItem]   = useState(null);
  const { isAdmin } = useAuth();

  const { data, total, loading, error, refetch } = useCRUD(
    '/inventario/crearh',
    { categoria_id: categoriaId || undefined, buscar: buscarQ || undefined, page, limit: 30 }
  );

  useEffect(() => {
    api.get('/categorias').then(r => setCategorias(r.data.data || []));
  }, []);

  const pages = Math.ceil(total / 30);

  const handleBuscar = (e) => {
    e.preventDefault();
    setBuscarQ(buscar);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Warehouse size={22} className="text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventario CREARH</h1>
            <p className="text-sm text-gray-500">Centro de distribución — Monterrey</p>
          </div>
        </div>
        <span className="text-sm text-gray-500">{total} productos</span>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <form onSubmit={handleBuscar} className="flex gap-2">
          <input
            className="input-field w-56"
            placeholder="Buscar por nombre o código…"
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
          />
          <button type="submit" className="btn-primary px-4">Buscar</button>
        </form>
        <select
          className="input-field max-w-xs"
          value={categoriaId}
          onChange={e => { setCategoriaId(e.target.value); setPage(1); }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      <Alert type="error" message={error} />

      {loading ? <Spinner /> : (
        <>
          {total === 0 && !buscarQ && !categoriaId ? (
            <div className="card p-12 text-center text-gray-400 space-y-3">
              <Warehouse size={40} className="mx-auto text-gray-300" />
              <p className="font-medium text-gray-500">CREARH aún no tiene inventario registrado</p>
              <p className="text-sm">Usa la sección <strong>Importar</strong> o registra productos manualmente desde <strong>Movimientos → Entrada</strong> seleccionando CREARH como bunker origen.</p>
            </div>
          ) : (
            <div className="card p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-emerald-50 border-b border-emerald-100">
                  <tr>{['Código','Producto','Categoría','Marca / Modelo','Cantidad','Mín','Máx','Ubicación', isAdmin() ? 'Acciones' : ''].filter(Boolean).map(h =>
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>
                  )}</tr>
                </thead>
                <tbody>
                  {data.map(i => (
                    <tr key={i.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i.cantidad <= i.stock_minimo ? 'bg-red-50/40' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-emerald-700">{i.codigo}</td>
                      <td className="px-4 py-3 font-medium">{i.producto}</td>
                      <td className="px-4 py-3 text-gray-500">{i.categoria}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{[i.marca, i.modelo].filter(Boolean).join(' ')}</td>
                      <td className={`px-4 py-3 font-bold ${
                        i.cantidad === 0 ? 'text-red-700' : i.cantidad <= i.stock_minimo ? 'text-yellow-700' : 'text-green-700'
                      }`}>
                        {i.cantidad} {i.unidad_medida}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{i.stock_minimo}</td>
                      <td className="px-4 py-3 text-gray-500">{i.stock_maximo ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{i.ubicacion ?? '—'}</td>
                      {isAdmin() && (
                        <td className="px-4 py-3">
                          <button
                            className="text-gray-400 hover:text-emerald-600"
                            title="Editar stock mínimo / ubicación"
                            onClick={() => setEditItem(i)}
                          >
                            <Pencil size={15} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr><td colSpan={9} className="text-center py-8 text-gray-400">Sin resultados</td></tr>
                  )}
                </tbody>
              </table>
              <div className="px-4 pb-4">
                <Pagination page={page} pages={pages} onPage={setPage} />
              </div>
            </div>
          )}
        </>
      )}

      {editItem && (
        <Modal open onClose={() => setEditItem(null)} title="Editar Stock Mínimo / Ubicación">
          <EditStockModal item={editItem} onClose={() => setEditItem(null)} onSaved={refetch} />
        </Modal>
      )}
    </div>
  );
}
