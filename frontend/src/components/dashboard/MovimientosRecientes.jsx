import Badge from '../ui/Badge';
import { fmtDate } from '../../utils/formatters';

export default function MovimientosRecientes({ data = [] }) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider"
          style={{ color: 'var(--text-primary)' }}>
        Movimientos Recientes
      </h3>
      <div className="space-y-1">
        {data.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 py-2.5 px-1 rounded last:border-0 transition-colors"
            style={{ borderBottom: '1px solid var(--divider)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Badge label={m.tipo} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate"
                 style={{ color: 'var(--text-primary)' }}>{m.producto}</p>
              <p className="text-xs"
                 style={{ color: 'var(--text-faint)' }}>{m.bunker} · {m.ingeniero}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold"
                 style={{ color: 'var(--text-primary)' }}>{m.cantidad}</p>
              <p className="text-xs"
                 style={{ color: 'var(--text-faint)' }}>{fmtDate(m.fecha_hora)}</p>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-sm text-center py-6"
             style={{ color: 'var(--text-faint)' }}>Sin movimientos</p>
        )}
      </div>
    </div>
  );
}
