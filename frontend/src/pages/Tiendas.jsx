import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { useCRUD }   from '../hooks/useCRUD';
import Modal         from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner       from '../components/ui/Spinner';
import Alert         from '../components/ui/Alert';
import Badge         from '../components/ui/Badge';
import { useAuth }   from '../hooks/useAuth';
import api           from '../services/api';

// ── Tienda form ───────────────────────────────────────────────────────────────
function TiendaForm({ initial = {}, bunkers, formatos, onSave, onClose }) {
  const [form, setForm] = useState({
    nombre:'', numero:'', ciudad:'', direccion:'', bunker_id:'', formato_id:'', ...initial,
  });
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
          <input className="input-field" required value={form.nombre} onChange={set('nombre')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Número (SAP)</label>
          <input className="input-field" value={form.numero} onChange={set('numero')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Ciudad *</label>
          <input className="input-field" required value={form.ciudad} onChange={set('ciudad')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Bunker *</label>
          <select className="input-field" required value={form.bunker_id} onChange={set('bunker_id')}>
            <option value="">Seleccionar…</option>
            {bunkers.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Formato</label>
          <select className="input-field" value={form.formato_id} onChange={set('formato_id')}>
            <option value="">Sin formato</option>
            {formatos.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
          <input className="input-field" value={form.direccion} onChange={set('direccion')} />
        </div>
      </div>
      <Alert type="error" message={error} />
      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
      </div>
    </form>
  );
}

// ── Ingeniero assignment modal ────────────────────────────────────────────────
function IngenieroModal({ tienda, onClose }) {
  const [asignados,    setAsignados]    = useState([]);
  const [ingenieros,   setIngenieros]   = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);

  const reload = () => {
    api.get(`/tiendas/${tienda.id}/ingenieros`).then(r => setAsignados(r.data.data || []));
  };

  useEffect(() => {
    Promise.all([
      api.get(`/tiendas/${tienda.id}/ingenieros`),
      api.get('/usuarios', { params: { limit: 100 } }),
    ]).then(([aRes, uRes]) => {
      setAsignados(aRes.data.data || []);
      const all = uRes.data.data?.data || [];
      setIngenieros(all.filter(u => u.rol === 'INGENIERO'));
    }).finally(() => setLoading(false));
  }, [tienda.id]);

  const asignar = async () => {
    if (!selectedUser) return;
    setSaving(true);
    await api.post(`/tiendas/${tienda.id}/ingenieros`, { usuario_id: selectedUser });
    setSelectedUser('');
    reload();
    setSaving(false);
  };

  const quitar = async (userId) => {
    await api.delete(`/tiendas/${tienda.id}/ingenieros/${userId}`);
    reload();
  };

  const yaAsignados = new Set(asignados.map(a => a.id));
  const disponibles = ingenieros.filter(i => !yaAsignados.has(i.id));

  return (
    <Modal open onClose={onClose} title={`Ingenieros — ${tienda.nombre}`} size="md">
      {loading ? <Spinner /> : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <select className="input-field flex-1" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
              <option value="">Asignar ingeniero…</option>
              {disponibles.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
            </select>
            <button className="btn-primary px-4" onClick={asignar} disabled={!selectedUser || saving}>
              {saving ? '…' : 'Asignar'}
            </button>
          </div>

          <div className="space-y-2">
            {asignados.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sin ingenieros asignados</p>
            )}
            {asignados.map(a => (
              <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{a.nombre}</p>
                  <p className="text-xs text-gray-400">{a.email}</p>
                </div>
                <button className="text-xs text-red-500 hover:text-red-700" onClick={() => quitar(a.id)}>
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Tiendas() {
  const [bunkerId,  setBunkerId]  = useState('');
  const [formatoId, setFormatoId] = useState('');
  const [bunkers,   setBunkers]   = useState([]);
  const [formatos,  setFormatos]  = useState([]);
  const [modal,     setModal]     = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const { isAdmin } = useAuth();

  const params = {};
  if (bunkerId)  params.bunker_id  = bunkerId;
  if (formatoId) params.formato_id = formatoId;

  const { data, loading, error, create, update, remove } = useCRUD('/tiendas', params);

  useEffect(() => {
    api.get('/bunkers').then(r => setBunkers(r.data.data || []));
    api.get('/formatos').then(r => setFormatos(r.data.data || []));
  }, []);

  const handleDelete = async () => {
    setDelLoading(true);
    try { await remove(modal.delete.id); setModal(null); }
    finally { setDelLoading(false); }
  };

  const fmtColor = { HEB: 'bg-orange-100 text-orange-700', MTA: 'bg-blue-100 text-blue-700', OTRO: 'bg-gray-100 text-gray-600' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tiendas</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{data.length} tiendas</span>
          {isAdmin() && (
            <button className="btn-primary flex items-center gap-2" onClick={() => setModal('create')}>
              <Plus size={16} /> Nueva tienda
            </button>
          )}
        </div>
      </div>

      <div className="card p-4 flex gap-3 flex-wrap">
        <select className="input-field max-w-xs" value={bunkerId} onChange={e => setBunkerId(e.target.value)}>
          <option value="">Todos los bunkers</option>
          {bunkers.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
        </select>
        <select className="input-field max-w-[160px]" value={formatoId} onChange={e => setFormatoId(e.target.value)}>
          <option value="">Todos los formatos</option>
          {formatos.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
        </select>
      </div>

      <Alert type="error" message={error} />

      {loading ? <Spinner /> : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['#','Nombre','Ciudad','Formato','Bunker','Acciones'].map(h =>
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {data.map(t => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{t.numero}</td>
                  <td className="px-4 py-3 font-medium">{t.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{t.ciudad}</td>
                  <td className="px-4 py-3">
                    {t.formato_nombre && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${fmtColor[t.formato_nombre] || 'bg-gray-100 text-gray-600'}`}>
                        {t.formato_nombre}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{t.bunker_nombre}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-blue-600" title="Ingenieros asignados" onClick={() => setModal({ ingenieros: t })}>
                        <Users size={15} />
                      </button>
                      {isAdmin() && <>
                        <button className="text-gray-400 hover:text-yellow-600" title="Editar" onClick={() => setModal({ edit: t })}>
                          <Pencil size={15} />
                        </button>
                        <button className="text-gray-400 hover:text-red-600" title="Eliminar" onClick={() => setModal({ delete: t })}>
                          <Trash2 size={15} />
                        </button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">Sin tiendas</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {modal === 'create' && (
        <Modal open onClose={() => setModal(null)} title="Nueva Tienda">
          <TiendaForm bunkers={bunkers} formatos={formatos} onSave={create} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.edit && (
        <Modal open onClose={() => setModal(null)} title="Editar Tienda">
          <TiendaForm initial={modal.edit} bunkers={bunkers} formatos={formatos}
            onSave={body => update(modal.edit.id, body)} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.ingenieros && (
        <IngenieroModal tienda={modal.ingenieros} onClose={() => setModal(null)} />
      )}
      <ConfirmDialog
        open={!!modal?.delete} onClose={() => setModal(null)}
        onConfirm={handleDelete} loading={delLoading}
        title="Desactivar tienda"
        message={`¿Desactivar la tienda "${modal?.delete?.nombre}"?`}
      />
    </div>
  );
}
