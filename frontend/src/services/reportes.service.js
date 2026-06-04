import api from './api';

const descargar = async (url, params = {}) => {
  const res = await api.get(url, { params, responseType: 'blob' });
  const href = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = href;
  a.download = res.headers['content-disposition']?.split('filename="')[1]?.replace('"', '') || 'reporte.xlsx';
  a.click();
  URL.revokeObjectURL(href);
};

export const exportarInventario  = (params) => descargar('/reportes/inventario',    params);
export const exportarMovimientos = (params) => descargar('/reportes/movimientos',   params);
export const exportarStockCritico = (params) => descargar('/reportes/stock-critico', params);
