import { useState, useEffect, useCallback } from 'react';
import { getMovimientos } from '../services/movimientos.service';

export const useMovimientos = (params = {}) => {
  const [data,    setData]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMovimientos(params);
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
