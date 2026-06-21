import { Link } from "react-router-dom";

const BookCard = ({ book }) => {
  const statusColors = {
    "В наличии": "bg-green-100 text-green-700",
    Забронирована: "bg-yellow-100 text-yellow-700",
    Выдана: "bg-red-100 text-red-700",
    Недоступна: "bg-gray-200 text-gray-500",
  };

  const coverFallback = (title) => {
    const letter = (title || "📖").trim().charAt(0).toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='512' height='768'><rect width='100%' height='100%' fill='%23f3e8ff'/><text x='50%' y='50%' dy='0.35em' text-anchor='middle' font-family='Inter, Roboto, Arial, sans-serif' font-size='220' fill='%238b5cf6'>${letter}</text></svg>`;
    const encoded =
      typeof window !== "undefined"
        ? window.btoa(unescape(encodeURIComponent(svg)))
        : Buffer.from(svg).toString("base64");
    return `data:image/svg+xml;base64,${encoded}`;
  };

  return (
    <div className="glass rounded-2xl overflow-hidden fade-in flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow h-full">
      <div className="relative rounded-t-2xl overflow-hidden h-64 sm:h-80 md:h-96 bg-gray-50">
        {(() => {
          const src =
            (book.gallery_urls && book.gallery_urls[0]) ||
            book.cover_url ||
            coverFallback(book.title);
          return (
            <img
              src={src}
              alt={book.title}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = coverFallback(book.title);
              }}
              className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform"
            />
          );
        })()}

        <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-black/10 to-transparent" />
        <span
          className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${statusColors[book.status] || "bg-gray-100"}`}
        >
          {book.status}
        </span>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <h3
          title={book.title}
          className="font-semibold text-lg text-gray-900 leading-tight line-clamp-2"
        >
          {book.title}
        </h3>
        <p className="text-gray-500 text-sm mt-1 truncate" title={book.author}>
          {book.author}
        </p>
        <p
          className="text-gray-400 text-xs mt-2 truncate"
          title={`${book.genre} · ${book.year}`}
        >
          {book.genre} · {book.year}
        </p>

        <Link
          to={`/books/${book.id}`}
          className="mt-auto block text-center bg-linear-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-xl hover:opacity-95 transition-opacity shadow-md shadow-purple-200"
        >
          Подробнее
        </Link>
      </div>
    </div>
  );
};

export default BookCard;
