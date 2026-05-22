const TYPES = {
  error:   'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  success: 'bg-green-50 text-green-800 border-green-200',
  info:    'bg-blue-50 text-blue-800 border-blue-200',
};

export default function Alert({ type = 'info', message }) {
  if (!message) return null;
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm ${TYPES[type]}`}>
      {message}
    </div>
  );
}
