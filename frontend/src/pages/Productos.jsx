import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, List } from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import Modal         from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner       from '../components/ui/Spinner';
import Pagination    from '../components/ui/Pagination';
import Alert         from '../components/ui/Alert';
import { useAuth }   from '../hooks/useAuth';
import api           from '../services/api';

const UNIDADES = ['PZA','KG','LT','MT','CAJA','JGO','ROLLO','PIEZA'];

function ProductoForm({ initial = {}, categorias, onSave, onClose }) {
  const [form, setForm] = useState({
    codigo: '', nombre: '', descripcion: '', categoria_id: '',
    unidad_medida: 'PZA', marca: '', modelo: '', num_parte: '',
    ...initial,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Código *</label>
          <input className="input-field" required value={form.codigo} onChange={set('codigo')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Categoría *</label>
          <select className="input-field" required value={form.categoria_id} onChange={set('categoria_id')}>
            <option value="">Seleccionar…</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
          <input className="input-field" required value={form.nombre} onChange={set('nombre')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Marca</label>
          <input className="input-field" value={form.marca} onChange={set('marca')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Modelo</label>
          <input className="input-field" value={form.modelo} onChange={set('modelo')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Núm. parte</label>
          <input className="input-field" value={form.num_parte} onChange={set('num_parte')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Unidad</label>
          <select className="input-field" value={form.unidad_medida} onChange={set('unidad_medida')}>
            {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
          <textarea className="input-field" rows={2} value={form.descripcion} onChange={set('descripcion')} />
        </div>
      </div>
      <Alert type="error" message={error} />
      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
      </div>
    </form>
  );
}

function SerialesModal({ productoId, nombre, onClose }) {
  const [seriales, setSeriales] = useState([]);
  const [loading, setLoading]   = useState(true);
  useEffect(() => {
    api.get(`/productos/${productoId}/seriales`)
      .then(r => setSeriales(r.data.data || []))
      .finally(() => setLoading(false));
  }, [productoId]);

  return (
    <Modal open onClose={onClose} title={`Seriales — ${nombre}`} size="lg">
      {loading ? <Spinner /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>
              {['Serie','Condición','Bunker'].map(h => <th key={h} className="text-left px-3 py-2 font-medium text-gray-600">{h}</th>)}
            </tr></thead>
            <tbody>
              {seriales.map(s => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-mono text-xs">{s.serie}</td>
                  <td className="px-3 py-2">{s.condicion}</td>
                  <td className="px-3 py-2 text-gray-500">{s.bunker}</td>
                </tr>
              ))}
              {seriales.length === 0 && <tr><td colSpan={3} className="text-center py-6 text-gray-400">Sin números de serie registrados</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

export default function Productos() {
  const [page, setPage]     = useState(1);
  const [q, setQ]           = useState('');
  const [qInput, setQInput] = useState('');
  const [modal, setModal]   = useState(null); // null | 'create' | {edit: row} | {delete: row} | {seriales: row}
  const [delLoading, setDelLoading] = useState(false);

  const { isAdmin } = useAuth();
  const { data: categorias } = useCRUD('/categorias', { limit: 100 });
  const { data, total, loading, error, create, update, remove } = useCRUD('/productos', { page, limit: 25, q: q || undefined });

  const pages = Math.ceil(total / 25);

  const handleCreate = (form) => create(form);
  const handleEdit   = (form) => update(modal.edit.id, form);
  const handleDelete = async () => {
    setDelLoading(true);
    try { await remove(modal.delete.id); setModal(null); }
    catch { /* error shown in confirm */ }
    finally { setDelLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        {isAdmin() && (
          <button className="btn-primary flex items-center gap-2" onClick={() => setModal('create')}>
            <Plus size={16} /> Nuevo producto
          </button>
        )}
      </div>

      <form className="card p-4 flex gap-3" onSubmit={e => { e.preventDefault(); setQ(qInput); setPage(1); }}>
        <input className="input-field" placeholder="Buscar por nombre o código…" value={qInput} onChange={e => setQInput(e.target.value)} />
        <button type="submit" className="btn-secondary flex items-center gap-2"><Search size={15} /> Buscar</button>
        {q && <button type="button" className="btn-secondary" onClick={() => { setQ(''); setQInput(''); setPage(1); }}>Limpiar</button>}
      </form>

      <Alert type="error" message={error} />

      {loading ? <Spinner /> : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Código','Nombre','Categoría','Marca','Modelo','Unidad','Acciones'].map(h =>
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {data.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{p.codigo}</td>
                  <td className="px-4 py-3 font-medium">{p.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{p.categoria}</td>
                  <td className="px-4 py-3 text-gray-500">{p.marca ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.modelo ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.unidad_medida}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-blue-600" title="Ver seriales" onClick={() => setModal({ seriales: p })}>
                        <List size={15} />
                      </button>
                      {isAdmin() && <>
                        <button className="text-gray-400 hover:text-yellow-600" title="Editar" onClick={() => setModal({ edit: p })}>
                          <Pencil size={15} />
                        </button>
                        <button className="text-gray-400 hover:text-red-600" title="Eliminar" onClick={() => setModal({ delete: p })}>
                          <Trash2 size={15} />
                        </button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">Sin productos</td></tr>}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination page={page} pages={pages} onPage={setPage} />
          </div>
        </div>
      )}

      {modal === 'create' && (
        <Modal open onClose={() => setModal(null)} title="Nuevo Producto" size="lg">
          <ProductoForm categorias={categorias} onSave={handleCreate} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.edit && (
        <Modal open onClose={() => setModal(null)} title="Editar Producto" size="lg">
          <ProductoForm initial={modal.edit} categorias={categorias} onSave={handleEdit} onClose={() => setModal(null)} />
        </Modal>
      )}
      <ConfirmDialog
        open={!!modal?.delete}
        onClose={() => setModal(null)}
        onConfirm={handleDelete}
        loading={delLoading}
        title="Eliminar producto"
        message={`¿Eliminar "${modal?.delete?.nombre}"? El producto quedará inactivo.`}
      />
      {modal?.seriales && (
        <SerialesModal productoId={modal.seriales.id} nombre={modal.seriales.nombre} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
