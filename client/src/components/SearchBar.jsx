import { useState } from "react";

const SearchBar = ({
  onSearch,
  onOpenFilters,
  filtersOpen,
  activeCount = 0,
  value, // controlled value from parent
  onChange, // controlled change handler
}) => {
  const [localQuery, setLocalQuery] = useState("");

  // keep local state in sync if parent controls value
  const effectiveValue = value !== undefined ? value : localQuery;

  const handleInput = (v) => {
    if (onChange) onChange(v);
    else setLocalQuery(v);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(effectiveValue);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 mb-4 fade-in sm:items-center"
    >
      <div className="relative flex-1 min-w-0 w-full">
        <input
          type="text"
          value={effectiveValue}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Поиск по названию или автору..."
          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border glass focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all placeholder-gray-400"
        />
      </div>

      <div className="flex gap-2 sm:gap-3 shrink-0">
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-3 rounded-2xl border glass text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 sm:hidden ${filtersOpen ? "ring-2 ring-purple-300" : ""}`}
            aria-label="Открыть фильтры"
          >
            <span className="flex items-center justify-center gap-2">
              <span>Фильтры</span>
              {activeCount > 0 && (
                <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                  {activeCount}
                </span>
              )}
            </span>
          </button>
        )}

        <button
          type="submit"
          className="flex-1 sm:flex-none px-6 py-2.5 sm:py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:opacity-95 transition-colors shadow-lg shadow-purple-200"
        >
          Найти
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
