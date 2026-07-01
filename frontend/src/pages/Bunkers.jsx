import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Wrench, Package, PackagePlus } from 'lucide-react';
import { useCRUD }    from '../hooks/useCRUD';
import Modal          from '../components/ui/Modal';
import ConfirmDialog  from '../components/ui/ConfirmDialog';
import Spinner        from '../components/ui/Spinner';
import Alert          from '../components/ui/Alert';
import { useAuth }    from '../hooks/useAuth';
import { createItem } from '../services/inventario.service';

/* ── Formulario bunker ── */
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

/* ── Modal agregar/modificar producto en inventario ── */
function InventarioModal({ bunker, onClose }) {
  const [productos,   setProductos]   = useState([]);
  const [buscar,      setBuscar]      = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [form, setForm] = useState({ cantidad: 0, stock_minimo: 0, stock_maximo: '', ubicacion: '' });
  const [error,  setError]  = useState('');
  const [saving, setSaving] = useState(false);
  const [step,   setStep]   = useState('buscar'); // 'buscar' | 'datos'

  useEffect(() => {
    if (buscar.length < 2) { setProductos([]); return; }
    const t = setTimeout(() => {
      api.get('/productos', { params: { q: buscar, limit: 20 } })
        .then(r => setProductos(r.data.data?.data ?? r.data.data ?? []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [buscar]);

  const elegir = (p) => {
    setSeleccionado(p);
    setStep('datos');
    setProductos([]);
    setBuscar('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createItem({
        bunker_id:   bunker.id,
        producto_id: seleccionado.id,
        cantidad:    Number(form.cantidad),
        stock_minimo: Number(form.stock_minimo),
        stock_maximo: form.stock_maximo !== '' ? Number(form.stock_maximo) : null,
        ubicacion:   form.ubicacion || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado bunker */}
      <div className="flex items-center gap-2 px-1">
        <Wrench size={14} style={{ color: '#60a5fa' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{bunker.nombre}</span>
      </div>

      {step === 'buscar' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-label)' }}>
              Buscar producto *
            </label>
            <input
              className="input-field"
              placeholder="Escribe al menos 2 caracteres…"
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              autoFocus
            />
          </div>
          {productos.length > 0 && (
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--divider)' }}>
              {productos.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => elegir(p)}
                  className="w-full text-left px-3 py-2.5 text-sm transition-colors"
                  style={{ borderBottom: '1px solid var(--divider)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.nombre}</span>
                  {(p.marca || p.modelo) && (
                    <span className="ml-2 text-xs" style={{ color: 'var(--text-faint)' }}>
                      {[p.marca, p.modelo].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {buscar.length >= 2 && productos.length === 0 && (
            <p className="text-xs text-center py-3" style={{ color: 'var(--text-faint)' }}>Sin resultados</p>
          )}
          <div className="flex justify-end pt-1">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </div>
      )}

      {step === 'datos' && seleccionado && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Producto seleccionado */}
          <div className="rounded-lg px-3 py-2.5 flex items-center justify-between"
               style={{ background: 'var(--bg-card-2)', border: '1px solid var(--divider)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{seleccionado.nombre}</p>
              {(seleccionado.marca || seleccionado.modelo) && (
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  {[seleccionado.marca, seleccionado.modelo].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <button type="button" className="text-xs underline" style={{ color: '#60a5fa' }}
                    onClick={() => { setSeleccionado(null); setStep('buscar'); }}>
              Cambiar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-label)' }}>Cantidad actual *</label>
              <input type="number" min="0" className="input-field" required
                value={form.cantidad}
                onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-label)' }}>Stock mínimo *</label>
              <input type="number" min="0" className="input-field" required
                value={form.stock_minimo}
                onChange={e => setForm(f => ({ ...f, stock_minimo: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-label)' }}>Stock máximo</label>
              <input type="number" min="0" className="input-field"
                value={form.stock_maximo}
                onChange={e => setForm(f => ({ ...f, stock_maximo: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-label)' }}>Ubicación</label>
              <input className="input-field" placeholder="Ej. Tarima 2987"
                value={form.ubicacion}
                onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))} />
            </div>
          </div>

          <Alert type="error" message={error} />

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Agregar al inventario'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ── Página principal ── */
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
              {/* Cabecera */}
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

                <div className="flex gap-0.5 flex-shrink-0 pt-0.5"
                     onClick={e => e.stopPropagation()}>
                  {/* Agregar producto */}
                  <button
                    title="Agregar producto al inventario"
                    className="p-1.5 rounded-lg hover:text-green-400 transition-colors"
                    style={{ color: 'var(--text-faint)' }}
                    onClick={e => { e.stopPropagation(); setModal({ agregar: b }); }}
                  >
                    <PackagePlus size={14} />
                  </button>

                  {/* Modificar → abre inventario filtrado */}
                  <button
                    title="Gestionar inventario"
                    className="p-1.5 rounded-lg hover:text-blue-400 transition-colors"
                    style={{ color: 'var(--text-faint)' }}
                    onClick={e => { e.stopPropagation(); navigate(`/inventario?bunker_id=${b.id}`); }}
                  >
                    <Package size={14} />
                  </button>

                  {isAdmin() && (
                    <>
                      <button
                        title="Editar bunker"
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
                    </>
                  )}
                </div>
              </div>

              {/* Separador */}
              <div className="my-3" style={{ height: '1px', background: 'var(--divider)' }} />

              {/* Info inferior */}
              <div className="flex-1 space-y-1">
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-label)' }}>Responsable: </span>
                  {b.responsable || '—'}
                </p>
                {b.telefono && (
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{b.telefono}</p>
                )}
              </div>

              {/* Ver inventario en hover */}
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
      {modal?.agregar && (
        <Modal open onClose={() => setModal(null)} title="Agregar producto al inventario">
          <InventarioModal bunker={modal.agregar} onClose={() => setModal(null)} />
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
