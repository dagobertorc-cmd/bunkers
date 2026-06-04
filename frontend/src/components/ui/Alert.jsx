const TYPES = {
  error:   'bg-red-900/30   text-red-400    border-red-700/40',
  warning: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/40',
  success: 'bg-green-900/30 text-green-400  border-green-700/40',
  info:    'bg-blue-900/30  text-blue-400   border-blue-700/40',
};

export default function Alert({ type = 'info', message }) {
  if (!message) return null;
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm ${TYPES[type]}`}>
      {message}
    </div>
  );
}
