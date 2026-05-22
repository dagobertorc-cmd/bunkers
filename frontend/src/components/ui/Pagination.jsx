export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-sm text-gray-500">Página {page} de {pages}</span>
      <div className="flex gap-2">
        <button
          className="btn-secondary text-sm px-3 py-1"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >Anterior</button>
        <button
          className="btn-secondary text-sm px-3 py-1"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >Siguiente</button>
      </div>
    </div>
  );
}
