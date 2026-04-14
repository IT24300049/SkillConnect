export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={currentPage <= 1 ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
      >
        Previous
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} style={{ color: '#64748b', padding: '0 4px' }}>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={currentPage === p ? 'btn-primary' : 'btn-secondary'}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={currentPage >= totalPages ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
      >
        Next
      </button>
    </div>
  );
}
