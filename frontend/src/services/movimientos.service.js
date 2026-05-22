import api from './api';

export const getMovimientos = (params) => api.get('/movimientos', { params });
export const getMovimiento  = (id)     => api.get(`/movimientos/${id}`);
export const createMovimiento = (formData) =>
  api.post('/movimientos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
