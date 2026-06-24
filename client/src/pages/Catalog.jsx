import { useEffect, useState } from "react";
import { getBooks, getGenres } from "../api/localApi";
import BookCard from "../components/BookCard";
import SearchBar from "../components/SearchBar";
import FilterModal from "../components/FilterModal";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";
import api from "../api/axios";

const Catalog = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [genresList, setGenresList] = useState([]);
  const [status, setStatus] = useState("Все");
  const [sort, setSort] = useState("");
  const [yearFrom, setYearFrom] = useState();
  const [yearTo, setYearTo] = useState();
  const [yearsRange, setYearsRange] = useState({
    min: 1900,
    max: new Date().getFullYear(),
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reloadSignal, setReloadSignal] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getBooks({
          page,
          search,
          genre,
          limit: 16,
          sort,
          yearFrom,
          yearTo,
          status,
        });
        if (!mounted) return;
        setBooks(res.books);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalItems || 0);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [page, search, genre, sort, yearFrom, yearTo, status, reloadSignal]);

  useEffect(() => {
    getGenres().then(setGenresList);
    api.get("/books/years").then((r) => {
      const min = r.data.minYear;
      const max = r.data.maxYear;
      setYearsRange({ min, max });
      const defaultFrom = min || 1900;
      const defaultTo = max || new Date().getFullYear();
      setYearFrom(defaultFrom);
      setYearTo(defaultTo);
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window))
      return;
    const bc = new BroadcastChannel("nexlibra-books");
    const handler = (e) => {
      if (e.data === "books-updated") {
        setPage(1);
        setReloadSignal((s) => s + 1);
      }
    };
    bc.addEventListener("message", handler);
    return () => {
      bc.removeEventListener("message", handler);
      bc.close();
    };
  }, []);

  const resetFilters = () => {
    setSearch("");
    setGenre("");
    setStatus("Все");
    setSort("");
    setYearFrom(yearsRange.min);
    setYearTo(yearsRange.max);
    setPage(1);
  };

  const activeFiltersCount = () => {
    let c = 0;
    if (search && search.trim().length) c++;
    if (genre) c++;
    if (status && status !== "Все") c++;
    if (yearFrom !== undefined && yearTo !== undefined) {
      if (yearFrom !== yearsRange.min || yearTo !== yearsRange.max) c++;
    }
    return c;
  };

  return (
    <div className="fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Каталог книг
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-300 shrink-0">
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner className="w-4 h-4 text-purple-600" />
              <span>Загрузка каталога...</span>
            </div>
          ) : (
            `Найдено ${totalItems} книг`
          )}
        </div>
      </div>

      <div>
        {/* Top horizontal filter bar (search + sort) */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={(q) => {
                setPage(1);
                setSearch(q);
              }}
              onSearch={(q) => {
                setPage(1);
                setSearch(q);
              }}
              onOpenFilters={() => setFiltersOpen((v) => !v)}
              filtersOpen={filtersOpen}
              activeCount={activeFiltersCount()}
            />
          </div>
        </div>

        {/* Main area: sidebar (md+) + content */}
        <div className="md:flex md:items-start md:gap-6">
          <div className="md:shrink-0">
            <FilterModal
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              genres={genresList}
              genre={genre}
              setGenre={setGenre}
              yearsRange={yearsRange}
              yearFrom={yearFrom}
              yearTo={yearTo}
              setYearFrom={setYearFrom}
              setYearTo={setYearTo}
              status={status}
              setStatus={setStatus}
              sort={sort}
              setSort={setSort}
              onApply={() => {
                setPage(1);
              }}
              onReset={() => {
                resetFilters();
              }}
              desktopVisible={true}
            />
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="glass rounded-2xl overflow-hidden flex flex-col h-full">
                        <div className="bg-gray-200 dark:bg-gray-700 h-48 sm:h-56 md:h-64 w-full" />
                        <div className="p-4 space-y-2">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-2" />
                        </div>
                      </div>
                    </div>
                  ))
                : books.map((book) => <BookCard key={book.id} book={book} />)}
            </div>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* mobile slide-over removed — using inline compact panel near Filters button */}
    </div>
  );
};

export default Catalog;
