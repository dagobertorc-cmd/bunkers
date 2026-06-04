import { AlertTriangle } from 'lucide-react';

export default function StockCritico({ data = [] }) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2"
          style={{ color: 'var(--text-primary)' }}>
        <AlertTriangle size={16} className="text-red-400" />
        Stock Crítico
      </h3>
      <div className="space-y-1">
        {data.map((i) => (
          <div
            key={i.id}
            className="flex items-center gap-3 py-2.5 px-1 rounded transition-colors"
            style={{ borderBottom: '1px solid var(--divider)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate"
                 style={{ color: 'var(--text-primary)' }}>{i.producto}</p>
              <p className="text-xs"
                 style={{ color: 'var(--text-faint)' }}>{i.bunker}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-bold text-red-400">{i.cantidad}</span>
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}> / {i.stock_minimo}</span>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-sm text-green-400/70 text-center py-6">Todo en orden ✓</p>
        )}
      </div>
    </div>
  );
}
