import { useEffect, useState } from "react";
import { getBooks, updateBook, createBook } from "../../api/localApi";
import Modal from "../../components/Modal";

const BooksManager = () => {
  const [books, setBooks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    genre: "",
    year: "",
    isbn: "",
    status: "В наличии",
    cover_url: "",
    description: "",
  });

  useEffect(() => {
    getBooks({ limit: 999 }).then((res) => setBooks(res.books));
  }, []);

  const coverFallback = (title) => {
    const letter = (title || "📖").trim().charAt(0).toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='384'><rect width='100%' height='100%' fill='%23ede9fe'/><text x='50%' y='50%' dy='0.35em' text-anchor='middle' font-family='Inter, Roboto, Arial, sans-serif' font-size='120' fill='%238b5cf6'>${letter}</text></svg>`;
    const encoded =
      typeof window !== "undefined"
        ? window.btoa(unescape(encodeURIComponent(svg)))
        : Buffer.from(svg).toString("base64");
    return `data:image/svg+xml;base64,${encoded}`;
  };

  const openEdit = (book) => {
    setEditing(book);
    setForm({ ...book });
  };

  const handleSave = async () => {
    if (editing?.id) {
      await updateBook(editing.id, form);
    } else {
      await createBook(form);
    }
    setEditing(null);
    getBooks({ limit: 999 }).then((res) => setBooks(res.books));
  };

  const statusBadge = (status) => {
    const colors = {
      "В наличии": "bg-emerald-100 text-emerald-700",
      Забронирована: "bg-amber-100 text-amber-700",
      Выдана: "bg-rose-100 text-rose-700",
      Недоступна: "bg-gray-100 text-gray-600",
    };
    return `inline-block px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100"}`;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            Книги
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-300 mt-1">
            {books.length} книг
          </div>
        </div>
        <button
          onClick={() =>
            openEdit({
              title: "",
              author: "",
              genre: "",
              year: "",
              isbn: "",
              status: "В наличии",
              cover_url: "",
              description: "",
            })
          }
          className="w-full sm:w-auto px-4 py-2.5 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-95 transition-shadow shadow-sm"
        >
          + Добавить книгу
        </button>
      </div>

      {/* Mobile list */}
      <div className="space-y-3 md:hidden">
        {books.map((book) => (
          <div
            key={book.id}
            className="glass rounded-2xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-16 rounded bg-linear-to-br from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg">📖</span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {book.title}
                </div>
                <div className="text-xs text-gray-500">{book.author}</div>
                <div className="text-xs text-gray-500">ISBN: {book.isbn}</div>
              </div>
              <div className="text-right">
                <div className={statusBadge(book.status)}>{book.status}</div>
                <div className="mt-2">
                  <button
                    onClick={() => openEdit(book)}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    Редактировать
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block glass rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Книга
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Автор
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Жанр
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Статус
                </th>
                <th className="p-4 text-center text-sm font-medium text-gray-500 dark:text-gray-300">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr
                  key={book.id}
                  className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded bg-linear-to-br from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                        {book.cover_url ? (
                          <img
                            src={book.cover_url}
                            alt={book.title}
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = coverFallback(book.title);
                            }}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={coverFallback(book.title)}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {book.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          ISBN: {book.isbn}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-200">
                    {book.author}
                  </td>
                  <td className="p-4 text-sm text-gray-500 dark:text-gray-300">
                    {book.genre}
                  </td>
                  <td className="p-4">
                    <span className={statusBadge(book.status)}>
                      {book.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => openEdit(book)}
                      className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                    >
                      Редактировать
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Редактировать книгу" : "Новая книга"}
      >
        <div className="space-y-3">
          <input
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="Название"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="Автор"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
          <input
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="Жанр"
            value={form.genre}
            onChange={(e) => setForm({ ...form, genre: e.target.value })}
          />
          <input
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="Год"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          />
          <input
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="ISBN"
            value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
          />
          <input
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="URL обложки"
            value={form.cover_url}
            onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
          />
          <textarea
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="Описание"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="В наличии">В наличии</option>
            <option value="Забронирована">Забронирована</option>
            <option value="Выдана">Выдана</option>
            <option value="Недоступна">Недоступна</option>
          </select>
          <button
            onClick={handleSave}
            className="w-full py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-95 transition-opacity"
          >
            Сохранить
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BooksManager;
