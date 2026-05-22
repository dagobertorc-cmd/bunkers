import { useState, useEffect } from 'react';
import { useNavigate }       from 'react-router-dom';
import { Plus, Eye, XCircle, CheckCircle, ClipboardList } from 'lucide-react';
import { useCRUD }    from '../hooks/useCRUD';
import Badge          from '../components/ui/Badge';
import Modal          from '../components/ui/Modal';
import Spinner        from '../components/ui/Spinner';
import Pagination     from '../components/ui/Pagination';
import Alert          from '../components/ui/Alert';
import { useAuth }    from '../hooks/useAuth';
import api            from '../services/api';

const ESTADOS = ['PENDIENTE','EN_PROCESO','SURTIDA','CANCELADA'];

function DetalleModal({ id, onClose, onUpdated }) {
  const [req, setReq]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [cantidades, setCantidades] = useState({});
  const { isAdmin, hasRole } = useAuth();
  const canAtender = isAdmin() || hasRole('SUPERVISOR');

  useEffect(() => {
    setLoading(true);
    api.get(`/requisiciones/${id}`)
      .then(r => {
        setReq(r.data.data);
        const init = {};
        (r.data.data.items || []).forEach(i => { init[i.id] = i.cantidad_surtida; });
        setCantidades(init);
      })
      .catch(e => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEstado = async (estado) => {
    setSaving(true);
    setError('');
    try {
      const items = req.items.map(i => ({
        id: i.id,
        cantidad_surtida: cantidades[i.id] ?? i.cantidad_surtida,
      }));
      await api.put(`/requisiciones/${id}`, { estado, items });
      onUpdated();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = async () => {
    if (!confirm('¿Cancelar esta requisición?')) return;
    setSaving(true);
    try {
      await api.post(`/requisiciones/${id}/cancelar`);
      onUpdated();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (!req) return <Alert type="error" message={error || 'No encontrado'} />;

  const isPending  = req.estado === 'PENDIENTE';
  const isProcess  = req.estado === 'EN_PROCESO';
  const isEditable = isPending || isProcess;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-lg p-3">
        <div><span className="text-gray-500">Folio</span><p className="font-mono font-semibold">{req.folio}</p></div>
        <div><span className="text-gray-500">Estado</span><p><Badge label={req.estado} /></p></div>
        <div><span className="text-gray-500">Bunker</span><p className="font-medium">{req.bunker}</p></div>
        <div><span className="text-gray-500">Solicitante</span><p>{req.solicitante}</p></div>
        {req.fecha_requerida && <div><span className="text-gray-500">Fecha requerida</span><p>{req.fecha_requerida}</p></div>}
        {req.observaciones && <div className="col-span-2"><span className="text-gray-500">Observaciones</span><p>{req.observaciones}</p></div>}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Producto','Código','Pedido','Stock CREARH', canAtender && isEditable ? 'Surtido' : 'Surtido'].map(h =>
                <th key={h} className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap">{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {req.items.map(item => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-3 py-2">{item.producto}<br/><span className="text-xs text-gray-400">{item.marca} {item.modelo}</span></td>
                <td className="px-3 py-2 font-mono text-xs text-blue-600">{item.codigo}</td>
                <td className="px-3 py-2 font-bold">{item.cantidad_pedida} {item.unidad_medida}</td>
                <td className={`px-3 py-2 font-medium ${item.stock_crearh === 0 ? 'text-red-600' : item.stock_crearh < item.cantidad_pedida ? 'text-yellow-600' : 'text-green-600'}`}>
                  {item.stock_crearh}
                </td>
                <td className="px-3 py-2">
                  {canAtender && isEditable ? (
                    <input
                      type="number" min="0" max={item.cantidad_pedida}
                      className="input-field w-20 py-1"
                      value={cantidades[item.id] ?? 0}
                      onChange={e => setCantidades(p => ({ ...p, [item.id]: Number(e.target.value) }))}
                    />
                  ) : (
                    <span>{item.cantidad_surtida}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Alert type="error" message={error} />

      {canAtender && isEditable && (
        <div className="flex gap-2 flex-wrap">
          {isPending && (
            <button className="btn-primary flex items-center gap-2" disabled={saving}
              onClick={() => handleEstado('EN_PROCESO')}>
              <CheckCircle size={16} /> Iniciar proceso
            </button>
          )}
          {isProcess && (
            <button className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700" disabled={saving}
              onClick={() => handleEstado('SURTIDA')}>
              <CheckCircle size={16} /> Marcar como surtida
            </button>
          )}
          <button className="btn-secondary flex items-center gap-2 text-red-600 hover:text-red-700" disabled={saving}
            onClick={handleCancelar}>
            <XCircle size={16} /> Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

export default function Requisiciones() {
  const [page,       setPage]       = useState(1);
  const [bunkerId,   setBunkerId]   = useState('');
  const [estado,     setEstado]     = useState('');
  const [bunkers,    setBunkers]    = useState([]);
  const [detalleId,  setDetalleId]  = useState(null);
  const { isAdmin, hasRole, user }  = useAuth();
  const navigate = useNavigate();

  const { data, total, loading, error, refetch } = useCRUD(
    '/requisiciones',
    { bunker_id: bunkerId || undefined, estado: estado || undefined, page, limit: 20 }
  );

  useEffect(() => {
    api.get('/bunkers').then(r => setBunkers((r.data.data || []).filter(b => !b.es_crearh)));
  }, []);

  const pages = Math.ceil(total / 20);
  const canCreate = hasRole('SUPERADMIN','ADMIN','SUPERVISOR','INGENIERO');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <ClipboardList size={22} className="text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Requisiciones</h1>
            <p className="text-sm text-gray-500">Pedidos de abasto de bunkers a CREARH</p>
          </div>
        </div>
        {canCreate && (
          <button className="btn-primary flex items-center gap-2"
            onClick={() => navigate('/requisiciones/nueva')}>
            <Plus size={16} /> Nueva Requisición
          </button>
        )}
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <select className="input-field max-w-xs" value={bunkerId}
          onChange={e => { setBunkerId(e.target.value); setPage(1); }}>
          <option value="">Todos los bunkers</option>
          {bunkers.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
        </select>
        <select className="input-field max-w-[180px]" value={estado}
          onChange={e => { setEstado(e.target.value); setPage(1); }}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <Alert type="error" message={error} />

      {loading ? <Spinner /> : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Folio','Bunker','Solicitante','Productos','Estado','Fecha requerida','Creada',''].map(h =>
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {data.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold">{r.folio}</td>
                  <td className="px-4 py-3">{r.bunker}</td>
                  <td className="px-4 py-3 text-gray-500">{r.solicitante}</td>
                  <td className="px-4 py-3 text-center">{r.num_items}</td>
                  <td className="px-4 py-3"><Badge label={r.estado} /></td>
                  <td className="px-4 py-3 text-gray-500">{r.fecha_requerida ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.created_at).toLocaleDateString('es-MX')}</td>
                  <td className="px-4 py-3">
                    <button
                      className="text-gray-400 hover:text-blue-600"
                      title="Ver detalle"
                      onClick={() => setDetalleId(r.id)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">
                  {estado || bunkerId ? 'Sin resultados para estos filtros' : 'No hay requisiciones aún'}
                </td></tr>
              )}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination page={page} pages={pages} onPage={setPage} />
          </div>
        </div>
      )}

      {detalleId && (
        <Modal open onClose={() => setDetalleId(null)} title="Detalle de Requisición" size="xl">
          <DetalleModal id={detalleId} onClose={() => setDetalleId(null)} onUpdated={refetch} />
        </Modal>
      )}
    </div>
  );
}
