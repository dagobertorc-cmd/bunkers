import { useState, useEffect } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import Alert   from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import api     from '../services/api';

export default function Importar() {
  const [bunkers,  setBunkers]  = useState([]);
  const [bunkerId, setBunkerId] = useState('');
  const [file,     setFile]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState('');

  useEffect(() => { api.get('/bunkers').then(r => setBunkers(r.data.data || [])); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !bunkerId) return;
    setLoading(true);
    setError('');
    setResult(null);

    const fd = new FormData();
    fd.append('archivo', file);
    fd.append('bunker_id', bunkerId);

    try {
      const res = await api.post('/importar/xlsx', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Importar inventario desde Excel</h1>

      <div className="card space-y-4">
        <p className="text-sm text-gray-500">
          Sube un archivo <strong>.xlsx</strong> con columnas:<br />
          <code className="text-xs bg-gray-100 px-1 rounded">Cantidad · Nombre · Descripción · Fabricante · Modelo · Serie · Condición</code>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bunker destino *</label>
            <select className="input-field" required value={bunkerId} onChange={e => setBunkerId(e.target.value)}>
              <option value="">Seleccionar bunker…</option>
              {bunkers.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Archivo Excel (.xlsx) *</label>
            <input
              type="file" accept=".xlsx,.xls"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              onChange={e => setFile(e.target.files[0])}
              required
            />
          </div>

          <Alert type="error" message={error} />

          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading || !file || !bunkerId}>
            {loading ? <><Spinner size="sm" /> Importando…</> : <><Upload size={16} /> Importar inventario</>}
          </button>
        </form>
      </div>

      {result && (
        <div className="card border-green-200 bg-green-50">
          <div className="flex items-center gap-2 text-green-700 font-semibold mb-3">
            <CheckCircle size={18} /> Importación exitosa
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-600">Filas procesadas</dt>
            <dd className="font-medium">{result.filas}</dd>
            <dt className="text-gray-600">Grupos únicos</dt>
            <dd className="font-medium">{result.grupos}</dd>
            <dt className="text-gray-600">Productos nuevos</dt>
            <dd className="font-medium">{result.productosCreados}</dd>
            <dt className="text-gray-600">Inventario actualizado</dt>
            <dd className="font-medium">{result.inventarioActualizado}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}
