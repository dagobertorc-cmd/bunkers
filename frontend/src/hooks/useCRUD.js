import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Generic CRUD hook.
 * @param {string} endpoint  - e.g. '/productos'
 * @param {object} params    - query params for list
 */
export function useCRUD(endpoint, params = {}) {
  const [data,    setData]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetch = useCallback(() => {
    setLoading(true);
    setError('');
    api.get(endpoint, { params })
      .then(r => {
        const payload = r.data.data;
        if (Array.isArray(payload)) { setData(payload); setTotal(payload.length); }
        else { setData(payload.data ?? []); setTotal(payload.total ?? 0); }
      })
      .catch(e => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  const create  = (body)      => api.post(endpoint, body).then(fetch);
  const update  = (id, body)  => api.put(`${endpoint}/${id}`, body).then(fetch);
  const remove  = (id)        => api.delete(`${endpoint}/${id}`).then(fetch);

  return { data, total, loading, error, refetch: fetch, create, update, remove };
}
