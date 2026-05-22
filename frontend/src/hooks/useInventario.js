import { useState, useEffect, useCallback } from 'react';
import { getInventario, getCritico } from '../services/inventario.service';

export const useInventario = (params = {}) => {
  const [data,    setData]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInventario(params);
      setData(res.data.data.data);
      setTotal(res.data.data.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, total, loading, error, refetch: fetch };
};

export const useStockCritico = (bunkerId) => {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCritico(bunkerId ? { bunker_id: bunkerId } : {})
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bunkerId]);

  return { data, loading };
};
