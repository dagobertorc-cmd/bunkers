import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';

function agruparPorBunker(data) {
  return data.reduce((acc, item) => {
    if (!acc[item.bunker]) acc[item.bunker] = [];
    acc[item.bunker].push(item);
    return acc;
  }, {});
}

function BunkerRow({ bunker, items }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 py-2 px-2 rounded-lg transition-colors text-left"
        style={{ background: open ? 'var(--row-hover)' : 'transparent' }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'var(--row-hover)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        {open
          ? <ChevronDown size={14} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
          : <ChevronRight size={14} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
        }
        <span className="flex-1 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-primary)' }}>
          {bunker}
        </span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/15 text-red-400">
          {items.length} {items.length === 1 ? 'producto' : 'productos'}
        </span>
      </button>

      {open && (
        <div className="mt-1 mb-2">
          {items.map((i) => (
            <div
              key={i.id}
              className="flex items-center gap-3 py-2 px-3 rounded transition-colors"
              style={{ borderBottom: '1px solid var(--divider)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <p className="flex-1 text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {i.producto}
              </p>
              <div className="text-right flex-shrink-0">
                <span className="text-sm font-bold text-red-400">{i.cantidad}</span>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}> / {i.stock_minimo}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StockCritico({ data = [] }) {
  const grupos  = agruparPorBunker(data);
  const bunkers = Object.keys(grupos);

  return (
    <div className="card">
      <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2"
          style={{ color: 'var(--text-primary)' }}>
        <AlertTriangle size={16} className="text-red-400" />
        Stock Crítico por Bunker
      </h3>

      {bunkers.length === 0 && (
        <p className="text-sm text-green-400/70 text-center py-6">Todo en orden ✓</p>
      )}

      <div className="space-y-1">
        {bunkers.map((bunker) => (
          <BunkerRow key={bunker} bunker={bunker} items={grupos[bunker]} />
        ))}
      </div>
    </div>
  );
}
