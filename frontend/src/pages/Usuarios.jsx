import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCRUD }   from '../hooks/useCRUD';
import Modal         from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge         from '../components/ui/Badge';
import Spinner       from '../components/ui/Spinner';
import Alert         from '../components/ui/Alert';
import { fmtDate }   from '../utils/formatters';
import { useAuth }   from '../hooks/useAuth';
import api           from '../services/api';

const ROLES_LISTA = ['SUPERADMIN','ADMIN','SUPERVISOR','INGENIERO','CONSULTA'];

function UsuarioForm({ initial = {}, bunkers, onSave, onClose, isNew }) {
  const [form, setForm] = useState({
    nombre:'', email:'', password:'', rol_id:'', bunker_id:'', telefono:'', activo:1, ...initial
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setSaving(false); }
  };

  // need rol_id from role name for new users
  const [roles, setRoles] = useState([]);
  useEffect(() => { api.get('/categorias').then(() => {}); }, []); // warm cache
  useEffect(() => {
    // inline fetch roles from a quick API query
    api.get('/usuarios', { params: { limit: 1 } }).catch(() => {});
    // fetch roles via direct endpoint not yet exposed — use hardcoded list
    setRoles(ROLES_LISTA.map((n, i) => ({ id: i + 1, nombre: n })));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
          <input className="input-field" required value={form.nombre} onChange={set('nombre')} /></div>
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" className="input-field" required value={form.email} onChange={set('email')} /></div>
        <div><label className="block text-xs font-medium text-gray-700 mb-1">{isNew ? 'Password *' : 'Nuevo password'}</label>
          <input type="password" className="input-field" required={isNew} value={form.password} onChange={set('password')} /></div>
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Rol *</label>
          <select className="input-field" required value={form.rol_id} onChange={set('rol_id')}>
            <option value="">Seleccionar…</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select></div>
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Bunker</label>
          <select className="input-field" value={form.bunker_id} onChange={set('bunker_id')}>
            <option value="">Sin asignar</option>
            {bunkers.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
          </select></div>
        <div><label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
          <input className="input-field" value={form.telefono} onChange={set('telefono')} /></div>
        {!isNew && <div><label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
          <select className="input-field" value={form.activo} onChange={e => setForm(f => ({ ...f, activo: parseInt(e.target.value) }))}>
            <option value={1}>Activo</option><option value={0}>Inactivo</option>
          </select></div>}
      </div>
      <Alert type="error" message={error} />
      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
      </div>
    </form>
  );
}

export default function Usuarios() {
  const [bunkers, setBunkers] = useState([]);
  const [modal, setModal]     = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const { hasRole } = useAuth();
  const isSuperadmin = hasRole('SUPERADMIN');
  const isAdmin      = hasRole('SUPERADMIN', 'ADMIN');

  const { data, loading, error, create, update, remove } = useCRUD('/usuarios', { limit: 50 });

  useEffect(() => { api.get('/bunkers').then(r => setBunkers(r.data.data || [])); }, []);

  const handleDelete = async () => {
    setDelLoading(true);
    try { await remove(modal.delete.id); setModal(null); }
    finally { setDelLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        {isAdmin && (
          <button className="btn-primary flex items-center gap-2" onClick={() => setModal('create')}>
            <Plus size={16} /> Nuevo usuario
          </button>
        )}
      </div>

      <Alert type="error" message={error} />
      {loading ? <Spinner /> : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Nombre','Email','Rol','Bunker','Último login','Estado','Acciones'].map(h =>
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {data.map(u => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3"><Badge label={u.rol} /></td>
                  <td className="px-4 py-3 text-gray-500">{u.bunker ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{fmtDate(u.ultimo_login)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {isAdmin && (
                        <button className="text-gray-400 hover:text-yellow-600" onClick={() => setModal({ edit: u })}>
                          <Pencil size={15} />
                        </button>
                      )}
                      {isSuperadmin && (
                        <button className="text-gray-400 hover:text-red-600" onClick={() => setModal({ delete: u })}>
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal === 'create' && (
        <Modal open onClose={() => setModal(null)} title="Nuevo Usuario" size="lg">
          <UsuarioForm bunkers={bunkers} onSave={create} onClose={() => setModal(null)} isNew />
        </Modal>
      )}
      {modal?.edit && (
        <Modal open onClose={() => setModal(null)} title="Editar Usuario" size="lg">
          <UsuarioForm initial={modal.edit} bunkers={bunkers} isNew={false}
            onSave={body => update(modal.edit.id, body)} onClose={() => setModal(null)} />
        </Modal>
      )}
      <ConfirmDialog
        open={!!modal?.delete} onClose={() => setModal(null)}
        onConfirm={handleDelete} loading={delLoading}
        title="Desactivar usuario"
        message={`¿Desactivar al usuario "${modal?.delete?.nombre}"?`}
      />
    </div>
  );
}
