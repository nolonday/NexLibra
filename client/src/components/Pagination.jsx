const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const makeRange = (start, end) => {
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  };

  let pages = [];
  if (totalPages <= 7) {
    pages = makeRange(1, totalPages);
  } else {
    const left = Math.max(2, page - 2);
    const right = Math.min(totalPages - 1, page + 2);
    pages = [1];
    if (left > 2) pages.push("left-ellipsis");
    pages = pages.concat(makeRange(left, right));
    if (right < totalPages - 1) pages.push("right-ellipsis");
    pages.push(totalPages);
  }

  const baseBtn =
    "px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all glass min-w-[2.5rem]";
  const activeBtn =
    "bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-md";
  const inactiveBtn =
    "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50";
  const navBtn =
    "px-3 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 min-w-[2.5rem]";

  return (
    <div className="mt-6">
      {/* Compact mobile pagination */}
      <div className="flex sm:hidden items-center justify-center gap-4">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`${navBtn} ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label="Предыдущая страница"
        >
          ‹
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium tabular-nums">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={`${navBtn} ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label="Следующая страница"
        >
          ›
        </button>
      </div>

      {/* Full pagination on sm+ */}
      <div className="hidden sm:flex flex-wrap justify-center items-center gap-2 sm:gap-3">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`${navBtn} ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label="Previous page"
        >
          ‹
        </button>

        {pages.map((p, idx) => {
          if (p === "left-ellipsis" || p === "right-ellipsis") {
            return (
              <span key={p + idx} className="px-1 text-gray-400">
                …
              </span>
            );
          }

          const isActive = p === page;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`${baseBtn} ${isActive ? activeBtn : inactiveBtn}`}
              aria-current={isActive ? "page" : undefined}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={`${navBtn} ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
