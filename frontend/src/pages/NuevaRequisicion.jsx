import { useState, useEffect, useCallback } from 'react';
import { useNavigate }  from 'react-router-dom';
import { Plus, Trash2, Search, ArrowLeft } from 'lucide-react';
import Alert    from '../components/ui/Alert';
import Spinner  from '../components/ui/Spinner';
import { useAuth } from '../hooks/useAuth';
import api      from '../services/api';

function ProductoPicker({ onAdd, addedIds }) {
  const [buscar,    setBuscar]    = useState('');
  const [buscarQ,   setBuscarQ]   = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading,   setLoading]   = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!buscar.trim()) return;
    setBuscarQ(buscar);
    setLoading(true);
    try {
      const r = await api.get('/inventario/crearh', { params: { buscar, limit: 30 } });
      setResultados(r.data.data?.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="input-field flex-1"
          placeholder="Buscar producto en CREARH por nombre o código…"
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
        />
        <button type="submit" className="btn-primary flex items-center gap-1 px-3" disabled={loading}>
          <Search size={15} /> Buscar
        </button>
      </form>
      {loading && <Spinner />}
      {resultados.length > 0 && (
        <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 bg-white rounded border border-gray-200">
          {resultados.map(p => {
            const alreadyAdded = addedIds.has(p.producto_id);
            return (
              <div key={p.producto_id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                <div className="text-sm">
                  <span className="font-medium">{p.producto}</span>
                  {p.marca && <span className="text-gray-400 ml-2 text-xs">{p.marca} {p.modelo}</span>}
                  <span className={`ml-2 text-xs font-medium ${p.cantidad === 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Stock: {p.cantidad} {p.unidad_medida}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={alreadyAdded}
                  className={`text-xs px-2 py-1 rounded ${alreadyAdded ? 'text-gray-300 cursor-not-allowed' : 'btn-primary py-1 px-2 text-xs'}`}
                  onClick={() => !alreadyAdded && onAdd(p)}
                >
                  {alreadyAdded ? 'Agregado' : '+ Agregar'}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {buscarQ && resultados.length === 0 && !loading && (
        <p className="text-sm text-gray-400 text-center py-2">Sin resultados en CREARH para "{buscarQ}"</p>
      )}
    </div>
  );
}

export default function NuevaRequisicion() {
  const navigate  = useNavigate();
  const { user, isAdmin, hasRole } = useAuth();

  const [bunkers,   setBunkers]   = useState([]);
  const [bunkerId,  setBunkerId]  = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [fechaReq, setFechaReq] = useState('');
  const [items,     setItems]     = useState([]);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    api.get('/bunkers').then(r => {
      const foraneos = (r.data.data || []).filter(b => !b.es_crearh);
      setBunkers(foraneos);
      // Pre-select if user belongs to a specific bunker
      if (user?.bunker_id && !isAdmin()) {
        const own = foraneos.find(b => b.id === user.bunker_id);
        if (own) setBunkerId(String(own.id));
      }
    });
  }, []);

  const addedIds = new Set(items.map(i => i.producto_id));

  const handleAdd = (producto) => {
    setItems(prev => [...prev, {
      producto_id:     producto.producto_id,
      producto:        producto.producto,
      unidad_medida:   producto.unidad_medida,
      marca:           producto.marca,
      modelo:          producto.modelo,
      stock_crearh:    producto.cantidad,
      cantidad_pedida: 1,
      observaciones:   '',
    }]);
  };

  const handleRemove = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bunkerId) { setError('Selecciona el bunker solicitante'); return; }
    if (items.length === 0) { setError('Agrega al menos un producto'); return; }
    setSaving(true);
    setError('');
    try {
      await api.post('/requisiciones', {
        bunker_id:      Number(bunkerId),
        observaciones:  observaciones || null,
        fecha_requerida: fechaReq || null,
        items: items.map(i => ({
          producto_id:    i.producto_id,
          cantidad_pedida: Number(i.cantidad_pedida),
          observaciones:  i.observaciones || null,
        })),
      });
      navigate('/requisiciones');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const canSelectBunker = isAdmin() || hasRole('SUPERVISOR');

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <button className="text-gray-400 hover:text-gray-700" onClick={() => navigate('/requisiciones')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Requisición</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header */}
        <div className="card p-4 space-y-4">
          <h2 className="font-semibold text-gray-700">Información general</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className={canSelectBunker ? '' : 'col-span-2'}>
              <label className="block text-xs font-medium text-gray-700 mb-1">Bunker solicitante *</label>
              {canSelectBunker ? (
                <select className="input-field" required value={bunkerId}
                  onChange={e => setBunkerId(e.target.value)}>
                  <option value="">Selecciona bunker…</option>
                  {bunkers.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                </select>
              ) : (
                <p className="input-field bg-gray-50 text-gray-600 cursor-not-allowed">
                  {bunkers.find(b => b.id === Number(bunkerId))?.nombre || '—'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha requerida</label>
              <input type="date" className="input-field" value={fechaReq}
                onChange={e => setFechaReq(e.target.value)}
                min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea rows={2} className="input-field resize-none" placeholder="Notas adicionales…"
                value={observaciones} onChange={e => setObservaciones(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Product picker */}
        <div className="card p-4 space-y-3">
          <h2 className="font-semibold text-gray-700">Productos a solicitar</h2>
          <ProductoPicker onAdd={handleAdd} addedIds={addedIds} />

          {items.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{['Producto','Stock CREARH','Cantidad *','Notas',''].map(h =>
                    <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap">{h}</th>
                  )}</tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.producto_id} className="border-t border-gray-100">
                      <td className="px-3 py-2">
                        {item.producto}
                        {(item.marca || item.modelo) && (
                          <><br /><span className="text-xs text-gray-400">{item.marca} {item.modelo}</span></>
                        )}
                      </td>
                      <td className={`px-3 py-2 font-medium text-xs ${item.stock_crearh === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.stock_crearh} {item.unidad_medida}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number" min="1" required
                          className="input-field w-20 py-1"
                          value={item.cantidad_pedida}
                          onChange={e => handleItemChange(idx, 'cantidad_pedida', e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          className="input-field w-36 py-1 text-xs"
                          placeholder="Opcional…"
                          value={item.observaciones}
                          onChange={e => handleItemChange(idx, 'observaciones', e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button type="button" className="text-gray-400 hover:text-red-600"
                          onClick={() => handleRemove(idx)}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Alert type="error" message={error} />

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving ? 'Guardando…' : <><Plus size={16} /> Crear Requisición</>}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/requisiciones')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
