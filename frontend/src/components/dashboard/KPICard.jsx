import { useTheme } from '../../hooks/useTheme';

const THEMES = {
  blue:   { icon: 'bg-blue-500/20   text-blue-400',   glow: 'rgba(59,130,246,0.20)',  border: 'rgba(59,130,246,0.30)',  accent: '#3b82f6' },
  green:  { icon: 'bg-green-500/20  text-green-400',  glow: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.28)',  accent: '#10b981' },
  yellow: { icon: 'bg-yellow-500/20 text-yellow-400', glow: 'rgba(234,179,8,0.15)',   border: 'rgba(234,179,8,0.28)',   accent: '#eab308' },
  red:    { icon: 'bg-red-500/20    text-red-400',    glow: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.28)',   accent: '#ef4444' },
};

export default function KPICard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const { t } = useTheme();
  const th = THEMES[color] ?? THEMES.blue;

  return (
    <div
      className="relative rounded-xl p-5 flex items-start gap-4 transition-all duration-200 hover:-translate-y-px"
      style={t.kpiCard(th.glow, th.border)}
    >
      <div className={`p-3 rounded-xl flex-shrink-0 ${th.icon}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider font-medium"
           style={{ color: 'var(--text-label)' }}>
          {title}
        </p>
        <p className="text-3xl font-bold mt-1 leading-none"
           style={{ color: 'var(--text-primary)' }}>
          {value ?? '—'}
        </p>
        {subtitle && (
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-faint)' }}>{subtitle}</p>
        )}
      </div>
      <div
        className="absolute bottom-0 left-4 right-4 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${th.accent}55, transparent)` }}
      />
    </div>
  );
}
