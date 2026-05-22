export default function ProductosMasUsados({ data = [] }) {
  const max = Math.max(...data.map(d => d.total_salidas), 1);
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4">Top Productos</h3>
      <div className="space-y-3">
        {data.map((p, i) => (
          <div key={p.id ?? p.producto}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 truncate">{i + 1}. {p.producto}</span>
              <span className="text-gray-500 font-medium ml-2">{p.total_salidas}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(p.total_salidas / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin datos</p>}
      </div>
    </div>
  );
}
