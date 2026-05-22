import api from './api';

export const getKPIs               = ()      => api.get('/dashboard/kpis');
export const getConsumoPorBunker   = ()      => api.get('/dashboard/consumo-bunker');
export const getTopProductos       = (limit) => api.get('/dashboard/top-productos', { params: { limit } });
export const getMovimientosRecientes = (limit) => api.get('/dashboard/movimientos-recientes', { params: { limit } });
