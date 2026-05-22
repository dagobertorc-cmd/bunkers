import { useState, useEffect, useRef } from 'react';
import { useNavigate }   from 'react-router-dom';
import { useForm }       from 'react-hook-form';
import { Search, X }     from 'lucide-react';
import Alert             from '../components/ui/Alert';
import { createMovimiento } from '../services/movimientos.service';
import api               from '../services/api';

// ── Combobox component ──────────────────────────────────────────────────────
function ProductoCombobox({ productos, value, onChange, disabled }) {
  const [query,    setQuery]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);

  // Sync display when parent clears the value (e.g. bunker changed)
  useEffect(() => {
    if (!value) { setSelected(null); setQuery(''); }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = productos.filter(p => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.producto.toLowerCase().includes(q) ||
      p.codigo.toLowerCase().includes(q)   ||
      (p.marca  || '').toLowerCase().includes(q) ||
      (p.modelo || '').toLowerCase().includes(q)
    );
  });

  const handleSelect = (p) => {
    setSelected(p);
    setQuery('');
    setOpen(false);
    onChange(p.producto_id);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    onChange('');
  };

  const stockColor = (p) => {
    if (p.cantidad === 0)                return 'text-red-600';
    if (p.cantidad <= p.stock_minimo)    return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div ref={containerRef} className="relative">
      <div className={`input-field flex items-center gap-2 cursor-text p-0 overflow-hidden ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => { if (!disabled) setOpen(true); }}>

        {selected ? (
          /* Selected state */
          <div className="flex items-center justify-between w-full px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-xs text-blue-600 flex-shrink-0">{selected.codigo}</span>
              <span className="truncate text-sm">{selected.producto}</span>
              <span className={`text-xs font-semibold flex-shrink-0 ${stockColor(selected)}`}>
                ({selected.cantidad} {selected.unidad_medida})
              </span>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        ) : (
          /* Input state */
          <div className="flex items-center w-full px-3 py-2 gap-2">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              className="flex-1 outline-none text-sm bg-transparent"
              placeholder={disabled ? 'Selecciona un bunker primero…' : 'Buscar por nombre, código o marca…'}
              value={query}
              disabled={disabled}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
            />
          </div>
        )}
      </div>

      {open && !disabled && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-400 text-center">
              {query ? `Sin resultados para "${query}"` : 'Sin productos en este bunker'}
            </li>
          ) : (
            filtered.map(p => (
              <li key={p.producto_id}
                className="flex items-center justify-between px-3 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleSelect(p)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-600">{p.codigo}</span>
                    <span className="text-sm font-medium truncate">{p.producto}</span>
                  </div>
                  {(p.marca || p.modelo) && (
                    <span className="text-xs text-gray-400">{[p.marca, p.modelo].filter(Boolean).join(' · ')}</span>
                  )}
                </div>
                <span className={`text-xs font-semibold ml-3 flex-shrink-0 ${stockColor(p)}`}>
                  {p.cantidad} {p.unidad_medida}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function NuevoMovimiento() {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [bunkers,    setBunkers]    = useState([]);
  const [tiendas,    setTiendas]    = useState([]);
  const [productos,  setProductos]  = useState([]);   // inventory items for chosen bunker
  const [loadingProd, setLoadingProd] = useState(false);
  const [productoId, setProductoId] = useState('');   // controlled outside RHF
  const navigate = useNavigate();

  const tipo     = watch('tipo_movimiento_id');
  const bunkerId = watch('bunker_id');

  useEffect(() => {
    api.get('/bunkers').then(r => setBunkers(r.data.data || []));
    api.get('/tiendas').then(r => setTiendas(r.data.data || []));
  }, []);

  // Reload products whenever the origin bunker changes
  useEffect(() => {
    if (!bunkerId) { setProductos([]); setProductoId(''); setValue('producto_id', ''); return; }
    setLoadingProd(true);
    setProductoId('');
    setValue('producto_id', '');
    api.get('/inventario', { params: { bunker_id: bunkerId, limit: 500 } })
      .then(r => setProductos(r.data.data?.data || []))
      .catch(() => setProductos([]))
      .finally(() => setLoadingProd(false));
  }, [bunkerId]);

  const handleProductoChange = (id) => {
    setProductoId(id);
    setValue('producto_id', id, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    if (!productoId) { setError('Selecciona un producto'); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries({ ...data, producto_id: productoId })
        .forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (data.foto_evidencia?.[0]) fd.set('foto_evidencia', data.foto_evidencia[0]);
      await createMovimiento(fd);
      navigate('/movimientos');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar movimiento');
    } finally {
      setLoading(false);
    }
  };

  const TIPOS = [
    { id: 1, nombre: 'ENTRADA' }, { id: 2, nombre: 'SALIDA' },  { id: 3, nombre: 'TRASLADO' },
    { id: 4, nombre: 'AJUSTE' },  { id: 5, nombre: 'PRESTAMO' },{ id: 6, nombre: 'DEVOLUCION' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nuevo Movimiento</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-5">
        <div className="grid grid-cols-2 gap-4">

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select className="input-field" {...register('tipo_movimiento_id', { required: true })}>
              <option value="">Seleccionar…</option>
              {TIPOS.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
            {errors.tipo_movimiento_id && <span className="text-xs text-red-600">Requerido</span>}
          </div>

          {/* Bunker origen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bunker origen *</label>
            <select className="input-field" {...register('bunker_id', { required: true })}>
              <option value="">Seleccionar…</option>
              {bunkers.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
            {errors.bunker_id && <span className="text-xs text-red-600">Requerido</span>}
          </div>

          {/* Producto — full width combobox */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Producto *
              {loadingProd && <span className="ml-2 text-xs text-gray-400">Cargando…</span>}
              {bunkerId && !loadingProd && (
                <span className="ml-2 text-xs text-gray-400">({productos.length} productos en este bunker)</span>
              )}
            </label>
            <ProductoCombobox
              productos={productos}
              value={productoId}
              onChange={handleProductoChange}
              disabled={!bunkerId || loadingProd}
            />
            {/* hidden input so RHF can track required validation */}
            <input type="hidden" {...register('producto_id', { required: true })} value={productoId} />
            {errors.producto_id && !productoId && (
              <span className="text-xs text-red-600">Selecciona un producto</span>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
            <input type="number" min="1" className="input-field"
              {...register('cantidad', { required: true, min: 1 })} />
            {errors.cantidad && <span className="text-xs text-red-600">Requerido (mínimo 1)</span>}
          </div>

          {/* Tienda destino (SALIDA / PRESTAMO) */}
          {(String(tipo) === '2' || String(tipo) === '5') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tienda destino</label>
              <select className="input-field" {...register('tienda_destino_id')}>
                <option value="">Ninguna</option>
                {tiendas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
          )}

          {/* Bunker destino (TRASLADO) */}
          {String(tipo) === '3' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bunker destino</label>
              <select className="input-field" {...register('bunker_destino_id')}>
                <option value="">Seleccionar…</option>
                {bunkers.filter(b => String(b.id) !== String(bunkerId)).map(b =>
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                )}
              </select>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea className="input-field" rows={3} {...register('observaciones')} />
        </div>

        {/* Foto evidencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Foto de evidencia</label>
          <input type="file" accept="image/*" className="block text-sm" {...register('foto_evidencia')} />
        </div>

        <Alert type="error" message={error} />

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Guardando…' : 'Registrar movimiento'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/movimientos')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
