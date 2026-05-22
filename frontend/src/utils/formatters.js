export const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export const fmtDateOnly = (d) =>
  d ? new Date(d).toLocaleDateString('es-MX') : '—';

export const fmtNum = (n) =>
  n !== null && n !== undefined ? Number(n).toLocaleString('es-MX') : '—';
