import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAlertas = (leida) => {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    const params = leida !== undefined ? { leida } : {};
    api.get('/alertas', { params })
      .then(r => setData(r.data.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [leida]); // eslint-disable-line
  return { data, loading, refetch: fetch };
};
