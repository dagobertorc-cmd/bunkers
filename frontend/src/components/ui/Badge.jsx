import { BADGE_COLOR } from '../../utils/constants';

export default function Badge({ label }) {
  const cls = BADGE_COLOR[label] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
