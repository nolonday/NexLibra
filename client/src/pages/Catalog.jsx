import { useEffect, useState } from "react";
import { getBooks, getGenres } from "../api/localApi";
import BookCard from "../components/BookCard";
import SearchBar from "../components/SearchBar";
import FilterModal from "../components/FilterModal";
import Pagination from "../components/Pagination";
import api from "../api/axios";

const Catalog = () => {
  const [books, setBooks] = useState([]);
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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
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
    };
    load();
    return () => {
      mounted = false;
    };
  }, [page, search, genre, sort, yearFrom, yearTo, status]);

  useEffect(() => {
    getGenres().then(setGenresList);
    api.get("/books/years").then((r) => {
      const min = r.data.minYear;
      const max = r.data.maxYear;
      setYearsRange({ min, max });
      const defaultFrom = Math.max(min || 1900, 1866);
      const defaultTo = Math.min(max || new Date().getFullYear(), 1966);
      setYearFrom(defaultFrom);
      setYearTo(defaultTo);
    });
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
          Найдено {totalItems} книг
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
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
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
