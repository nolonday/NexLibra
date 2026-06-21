import { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import RangeSlider from "./RangeSlider";

const FilterModal = ({
  open,
  onClose,
  genres = [],
  genre,
  setGenre,
  yearsRange,
  yearFrom,
  yearTo,
  setYearFrom,
  setYearTo,
  status,
  setStatus,
  sort,
  setSort,
  onApply,
  onReset,
  desktopVisible = true,
}) => {
  const closeRef = useRef(null);
  const panelRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        // focus trap
        const el = panelRef.current;
        if (!el) return;
        const focusable = el.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", onKey);
    // focus first control inside panel
    setTimeout(() => {
      const el = panelRef.current;
      const focusable = el?.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      (focusable && focusable[0]?.focus()) || closeRef.current?.focus();
    }, 0);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Desktop: render as a static sidebar panel (if desktopVisible)
  const panelClass = `w-full md:w-72 rounded-2xl shadow-lg p-4 border ${
    theme === "dark"
      ? "bg-gradient-to-b from-gray-900/85 to-gray-800/70 border-gray-700 text-gray-100"
      : "bg-white/90 border-gray-200 text-gray-800"
  } backdrop-blur-sm`;

  const inputClass = `w-full p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-300 ${
    theme === "dark"
      ? "bg-gray-800/90 border-gray-700 text-gray-100"
      : "bg-white border-gray-200 text-gray-800"
  }`;

  const smallLabel = "block text-sm font-medium mb-2";

  const Panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filters-title"
      className={panelClass}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 id="filters-title" className="text-sm font-semibold">
            Фильтры
          </h4>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Фильтруйте и сортируйте каталог
          </div>
        </div>
        <button
          ref={closeRef}
          onClick={onClose}
          className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 py-1 md:hidden"
          aria-label="Закрыть"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className={smallLabel + " text-gray-700 dark:text-gray-300"}>
            Жанр
          </label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className={inputClass}
          >
            <option value="">Все жанры</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={smallLabel + " text-gray-700 dark:text-gray-300"}>
            Год
          </label>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch mb-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">
                От
              </label>
              <input
                type="number"
                value={yearFrom ?? yearsRange.min}
                min={yearsRange.min}
                max={yearsRange.max}
                onChange={(e) => setYearFrom(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-800/90 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-800"
                }`}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">
                До
              </label>
              <input
                type="number"
                value={yearTo ?? yearsRange.max}
                min={yearsRange.min}
                max={yearsRange.max}
                onChange={(e) => setYearTo(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-800/90 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-800"
                }`}
              />
            </div>
          </div>
          <RangeSlider
            min={yearsRange.min}
            max={yearsRange.max}
            value={[yearFrom ?? yearsRange.min, yearTo ?? yearsRange.max]}
            onChange={(v) => {
              setYearFrom(v[0]);
              setYearTo(v[1]);
            }}
          />
        </div>

        <div>
          <label className={smallLabel + " text-gray-700 dark:text-gray-300"}>
            Статус
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputClass}
          >
            <option value="Все">Все</option>
            <option value="В наличии">В наличии</option>
          </select>
        </div>

        <div>
          <label className={smallLabel + " text-gray-700 dark:text-gray-300"}>
            Сортировка
          </label>
          <select
            value={sort ?? ""}
            onChange={(e) => setSort?.(e.target.value)}
            className={inputClass}
          >
            <option value="">По умолчанию</option>
            <option value="new">По новизне</option>
            <option value="alpha">По алфавиту</option>
            <option value="popular">По популярности</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-3">
        <button
          onClick={() => {
            onReset?.();
            if (!desktopVisible) onClose?.();
          }}
          className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            theme === "dark"
              ? "bg-transparent border border-gray-700 text-gray-200 hover:bg-gray-800"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Сброс
        </button>

        <button
          onClick={() => {
            onApply?.();
            if (!desktopVisible) onClose?.();
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-white transition-shadow bg-linear-to-r from-purple-600 to-indigo-600 shadow-md hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          Применить
        </button>
      </div>
    </div>
  );

  // If desktopVisible, render panel inline for md+ screens; for mobile, render as slide-over when open
  return (
    <>
      {/* Desktop static pane: always visible on md */}
      <div className="hidden md:block">{Panel}</div>

      {/* Mobile slide-over */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden
          />
          <div className="absolute right-0 top-0 bottom-0 w-[min(90vw,24rem)] p-3 sm:p-4 overflow-y-auto">
            <div className="min-h-full flex flex-col">
              {Panel}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterModal;
