import { useUIStore } from '../store/uiStore';

const DARK = {
  navbar: {
    background: 'linear-gradient(90deg, #070f22 0%, #081529 100%)',
    borderBottom: '1px solid rgba(59,130,246,0.18)',
    boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
  },
  navText:   '#e2e8f0',
  navMuted:  'rgba(147,197,253,0.55)',

  card: {
    background: 'rgba(13,30,61,0.85)',
    border: '1px solid rgba(29,78,216,0.18)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.40)',
  },
  cardHover: 'rgba(15,35,71,0.50)',

  kpiCard: (glow, border) => ({
    background: 'rgba(22,48,90,0.95)',
    border: `1px solid ${border}`,
    boxShadow: `0 4px 24px rgba(0,0,0,0.30), 0 0 20px ${glow}`,
  }),

  login: {
    background: 'rgba(8,21,41,0.80)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(59,130,246,0.25)',
    boxShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 40px rgba(59,130,246,0.12)',
  },

  text:       '#f1f5f9',
  textMuted:  '#93c5fd',
  textFaint:  'rgba(147,197,253,0.45)',
  textLabel:  'rgba(147,197,253,0.70)',
  divider:    'rgba(18,40,73,0.60)',
  rowHover:   'rgba(15,35,71,0.40)',
  badge:      'rgba(59,130,246,0.08)',
};

const LIGHT = {
  navbar: {
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  },
  navText:  '#111827',
  navMuted: '#6b7280',

  card: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  },
  cardHover: '#f8fafc',

  kpiCard: (glow, border) => ({
    background: '#ffffff',
    border: `1px solid ${border}`,
    boxShadow: `0 2px 12px rgba(0,0,0,0.08), 0 0 10px ${glow}`,
  }),

  login: {
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid #e2e8f0',
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
  },

  text:       '#111827',
  textMuted:  '#374151',
  textFaint:  '#9ca3af',
  textLabel:  '#6b7280',
  divider:    '#e5e7eb',
  rowHover:   '#f1f5f9',
  badge:      'rgba(37,99,235,0.06)',
};

export function useTheme() {
  const theme = useUIStore((s) => s.theme);
  return { theme, t: theme === 'dark' ? DARK : LIGHT, isDark: theme === 'dark' };
}
