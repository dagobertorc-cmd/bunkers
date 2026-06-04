import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Wrench, Package } from 'lucide-react';
import { useCRUD }   from '../hooks/useCRUD';
import Modal         from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner       from '../components/ui/Spinner';
import Alert         from '../components/ui/Alert';
import { useAuth }   from '../hooks/useAuth';

function BunkerForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({ nombre:'', ciudad:'', direccion:'', responsable:'', telefono:'', ...initial });
  const [ingenieros, setIngenieros] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    api.get('/usuarios', { params: { limit: 200 } })
      .then(r => {
        const all = r.data.data?.data ?? r.data.data ?? [];
        setIngenieros(all.filter(u => u.rol === 'INGENIERO' || u.rol_id === 4));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
          <input className="input-field" required value={form.nombre} onChange={set('nombre')} /></div>
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Ciudad *</label>
          <input className="input-field" required value={form.ciudad} onChange={set('ciudad')} /></div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Responsable</label>
          <select className="input-field" value={form.responsable} onChange={set('responsable')}>
            <option value="">Sin asignar</option>
            {ingenieros.map(u => (
              <option key={u.id} value={u.nombre}>{u.nombre}</option>
            ))}
          </select>
        </div>
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
          <input className="input-field" value={form.telefono} onChange={set('telefono')} /></div>
        <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
          <textarea className="input-field" rows={2} value={form.direccion} onChange={set('direccion')} /></div>
      </div>
      <Alert type="error" message={error} />
      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
      </div>
    </form>
  );
}

export default function Bunkers() {
  const [modal, setModal] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const { isAdmin } = useAuth();
  const { data, loading, error, create, update, remove } = useCRUD('/bunkers');
  const navigate = useNavigate();

  const handleDelete = async () => {
    setDelLoading(true);
    try { await remove(modal.delete.id); setModal(null); }
    finally { setDelLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Bunkers</h1>
        {isAdmin() && (
          <button className="btn-primary flex items-center gap-2" onClick={() => setModal('create')}>
            <Plus size={16} /> Nuevo bunker
          </button>
        )}
      </div>

      <Alert type="error" message={error} />
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.filter(b => !b.es_crearh).map(b => (
            <div
              key={b.id}
              className="card group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
              style={{ padding: '1rem' }}
              onClick={() => navigate(`/inventario?bunker_id=${b.id}`)}
            >
              {/* ── Cabecera: icono + nombre + acciones ── */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}
                  >
                    <Wrench size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm leading-tight truncate"
                        style={{ color: 'var(--text-primary)' }}>
                      {b.nombre}
                    </h3>
                    <p className="text-xs mt-0.5 truncate"
                       style={{ color: 'var(--text-muted)' }}>
                      {b.ciudad}
                    </p>
                  </div>
                </div>

                {isAdmin() && (
                  <div className="flex gap-0.5 flex-shrink-0 pt-0.5"
                       onClick={e => e.stopPropagation()}>
                    <button
                      title="Editar"
                      className="p-1.5 rounded-lg hover:text-yellow-400 transition-colors"
                      style={{ color: 'var(--text-faint)' }}
                      onClick={e => { e.stopPropagation(); setModal({ edit: b }); }}>
                      <Pencil size={13} />
                    </button>
                    <button
                      title="Eliminar"
                      className="p-1.5 rounded-lg hover:text-red-400 transition-colors"
                      style={{ color: 'var(--text-faint)' }}
                      onClick={e => { e.stopPropagation(); setModal({ delete: b }); }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* ── Separador ── */}
              <div className="my-3" style={{ height: '1px', background: 'var(--divider)' }} />

              {/* ── Info inferior ── */}
              <div className="flex-1 space-y-1">
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-label)' }}>Responsable: </span>
                  {b.responsable || '—'}
                </p>
                {b.telefono && (
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {b.telefono}
                  </p>
                )}
              </div>

              {/* ── Ver inventario (aparece en hover) ── */}
              <div className="flex items-center gap-1.5 mt-3 text-xs font-medium
                              opacity-0 group-hover:opacity-100 transition-opacity"
                   style={{ color: '#60a5fa' }}>
                <Package size={12} />
                <span>Ver inventario</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === 'create' && (
        <Modal open onClose={() => setModal(null)} title="Nuevo Bunker">
          <BunkerForm onSave={create} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.edit && (
        <Modal open onClose={() => setModal(null)} title="Editar Bunker">
          <BunkerForm initial={modal.edit} onSave={body => update(modal.edit.id, body)} onClose={() => setModal(null)} />
        </Modal>
      )}
      <ConfirmDialog
        open={!!modal?.delete} onClose={() => setModal(null)}
        onConfirm={handleDelete} loading={delLoading}
        title="Desactivar bunker"
        message={`¿Desactivar el bunker "${modal?.delete?.nombre}"?`}
      />
    </div>
  );
}
