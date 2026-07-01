import api from './api';

export const getInventario = (params) => api.get('/inventario', { params });
export const getCritico    = (params) => api.get('/inventario/critico', { params });
export const createItem    = (data)   => api.post('/inventario', data);
export const updateItem    = (id, data) => api.put(`/inventario/${id}`, data);
