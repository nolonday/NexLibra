import { useEffect, useState, useRef, useContext } from "react";
import {
  getBooks,
  updateBook,
  createBook,
  deleteBook,
  uploadCover,
  getAllUsers,
  adminCreateReservation,
} from "../../api/localApi";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import { AuthContext } from "../../context/AuthContext";

const BooksManager = () => {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    getBooks({ limit: 999 }).then((res) => {
      setBooks(res.books);
      setFilteredBooks(res.books);
      setLoading(false);
    });
  }, []);

  const handleFind = () => {
    const q = (query || "").toLowerCase();
    if (!q) return setFilteredBooks(books);
    setFilteredBooks(
      books.filter((b) =>
        ((b.title || "") + " " + (b.author || "")).toLowerCase().includes(q),
      ),
    );
  };

  useEffect(() => {
    const t = setTimeout(() => {
      const q = (query || "").toLowerCase();
      if (!q) return setFilteredBooks(books);
      setFilteredBooks(
        books.filter((b) =>
          ((b.title || "") + " " + (b.author || "")).toLowerCase().includes(q),
        ),
      );
    }, 300);
    return () => clearTimeout(t);
  }, [query, books]);

  const coverFallback = (title) => {
    const letter = (title || "📖").trim().charAt(0).toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='384'><rect width='100%' height='100%' fill='%23ede9fe'/><text x='50%' y='50%' dy='0.35em' text-anchor='middle' font-family='Inter, Roboto, Arial, sans-serif' font-size='120' fill='%238b5cf6'>${letter}</text></svg>`;
    const encoded = window.btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${encoded}`;
  };

  const openEdit = (book) => {
    const normalized = {
      title: book.title || "",
      author: book.author || "",
      genre: book.genre || "",
      year: book.year || "",
      isbn: book.isbn || "",
      status: book.status || "В наличии",
      cover_url: book.cover_url || "",
      description: book.description || "",
      id: book.id,
    };
    setEditing(book);
    setForm(normalized);
    setPhotoFile(null);
    if (inputRef.current) inputRef.current.value = null;
  };

  const [photoFile, setPhotoFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [savingLoading, setSavingLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "Администратор";
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSavingLoading(true);
    try {
      let payload = { ...form };
      if (photoFile) {
        try {
          const uploadRes = await uploadCover(photoFile);
          payload = {
            ...payload,
            cover_url: uploadRes.secure_url || uploadRes.url,
          };
        } catch (uploadErr) {
          console.error("Cover upload failed", uploadErr);
          setError("Не удалось загрузить обложку. Попробуйте ещё раз.");
          setSavingLoading(false);
          return;
        }
      }

      if (editing?.id) {
        await updateBook(editing.id, payload);
      } else {
        await createBook(payload);
      }

      setEditing(null);
      setPhotoFile(null);
      getBooks({ limit: 999 }).then((res) => {
        setBooks(res.books);
        setFilteredBooks(res.books);
        try {
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            const bc = new BroadcastChannel("nexlibra-books");
            bc.postMessage("books-updated");
            bc.close();
          }
        } catch (err) {
          console.warn("BroadcastChannel unavailable", err);
        }
      });
    } catch (err) {
      console.error(err);
      setError("Ошибка при сохранении книги");
    } finally {
      setSavingLoading(false);
    }
  };

  const searchUsers = async (q) => {
    try {
      setUserQuery(q);
      const all = await getAllUsers();
      const filtered = all.filter((u) =>
        (u.name || u.email || "").toLowerCase().includes(q.toLowerCase()),
      );
      setUserResults(filtered.slice(0, 10));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReserveForUser = async () => {
    if (!selectedUser) return setError("Выберите пользователя");
    setSavingLoading(true);
    try {
      await adminCreateReservation(selectedUser.id, editing?.id || form.id);
      getBooks({ limit: 999 }).then((r) => {
        setBooks(r.books);
        try {
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            const bc = new BroadcastChannel("nexlibra-books");
            bc.postMessage("books-updated");
            bc.close();
          }
        } catch (err) {
          console.warn("BroadcastChannel unavailable", err);
        }
      });
      setError("");
      alert("Бронирование создано");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Ошибка при создании бронирования",
      );
    } finally {
      setSavingLoading(false);
    }
  };

  const confirmDelete = (book) => {
    setDeleteTarget(book);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBook(deleteTarget.id);
      const res = await getBooks({ limit: 999 });
      setBooks(res.books);
      setFilteredBooks(res.books);
      try {
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          const bc = new BroadcastChannel("nexlibra-books");
          bc.postMessage("books-updated");
          bc.close();
        }
      } catch (err) {
        console.warn("BroadcastChannel unavailable", err);
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Ошибка при удалении книги");
    } finally {
      setDeleting(false);
    }
  };

  const closeEdit = () => {
    setEditing(null);
    setUserQuery("");
    setUserResults([]);
    setSelectedUser(null);
    setPhotoFile(null);
    setError("");
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
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или автору"
            className="w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border glass focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all placeholder-gray-400 sm:w-80"
          />
          <button
            onClick={handleFind}
            className="px-6 py-2.5 sm:py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:opacity-95 transition-colors shadow-lg shadow-purple-200"
          >
            Найти
          </button>
          {/* Reset button removed: live-filtering applied */}
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
      </div>

      {/* Mobile list */}
      <div className="space-y-3 md:hidden">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="glass rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-16 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))
          : filteredBooks.map((book) => (
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
                    <div className="text-xs text-gray-500">
                      ISBN: {book.isbn}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={statusBadge(book.status)}>
                      {book.status}
                    </div>
                    <div className="mt-2 flex flex-col gap-1">
                      <button
                        onClick={() => openEdit(book)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        Редактировать
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => confirmDelete(book)}
                          className="text-rose-600 hover:text-rose-800 text-sm font-medium"
                        >
                          Удалить
                        </button>
                      )}
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
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 dark:border-gray-700 animate-pulse"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                      </td>
                      <td className="p-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24" />
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                        </div>
                      </td>
                    </tr>
                  ))
                : filteredBooks.map((book) => (
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
                          className="text-purple-600 hover:text-purple-800 font-medium text-sm mr-4"
                        >
                          Редактировать
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => confirmDelete(book)}
                            className="text-rose-600 hover:text-rose-800 font-medium text-sm"
                          >
                            Удалить
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!editing}
        onClose={closeEdit}
        title={editing?.id ? "Редактировать книгу" : "Новая книга"}
      >
        <div className="space-y-3">
          {error && (
            <div className="text-red-500 bg-red-50 p-2 rounded-xl mb-2 text-center">
              {error}
            </div>
          )}
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
          {/* URL input first (like registration) */}
          <div className="mt-2">
            <input
              type="url"
              placeholder="URL фото (опционально)"
              value={form.cover_url}
              onChange={(e) => {
                setForm({ ...form, cover_url: e.target.value });
                if (photoFile) setPhotoFile(null);
              }}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files && e.dataTransfer.files[0];
              if (f && f.type.startsWith("image/")) {
                if (f.size > 5 * 1024 * 1024) return;
                setPhotoFile(f);
                setForm({ ...form, cover_url: "" });
              }
            }}
            className={`mt-3 w-full rounded-2xl p-4 border-2 transition-all ${
              dragOver
                ? "border-purple-400 bg-purple-50"
                : "border-dashed border-gray-300 bg-white/50"
            }`}
          >
            {!photoFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-linear-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-2xl">
                    📤
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      Перетащите фото или нажмите, чтобы выбрать
                    </div>
                    <div className="text-sm text-gray-500">
                      Поддерживаются изображения, макс 5MB
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="book-cover-file"
                    className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Выбрать фото
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <img
                  src={URL.createObjectURL(photoFile)}
                  alt="preview"
                  className="w-20 h-28 object-cover rounded-md"
                />
                <div className="min-w-0">
                  <div className="font-medium text-gray-800 truncate">
                    {photoFile.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {(photoFile.size / 1024).toFixed(0)} KB
                  </div>
                </div>
                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={() => setPhotoFile(null)}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* hidden file input outside of clickable button */}
          <input
            id="book-cover-file"
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (f) {
                if (f.size > 5 * 1024 * 1024) return;
                setPhotoFile(f);
                setForm({ ...form, cover_url: "" });
              }
            }}
            className="hidden"
          />
          {/* preview of existing cover when no file selected */}
          {!photoFile && form.cover_url && (
            <div className="mt-3">
              <img
                src={form.cover_url}
                alt="cover"
                className="w-24 h-36 object-cover rounded-md"
              />
            </div>
          )}
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
          {/* Reservation block above, save button below (full-width) */}
          <div className="flex flex-col gap-3">
            <div className="w-full">
              <input
                type="text"
                placeholder="Поиск пользователя (имя или email)"
                value={userQuery}
                onChange={(e) => searchUsers(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              {userResults.length > 0 && (
                <ul className="max-h-40 overflow-auto bg-white border rounded-md mt-1">
                  {userResults.map((u) => (
                    <li
                      key={u.id}
                      className={`p-2 cursor-pointer hover:bg-gray-50 ${selectedUser?.id === u.id ? "bg-purple-50" : ""}`}
                      onClick={() => setSelectedUser(u)}
                    >
                      <div className="text-sm font-medium">
                        {u.name || u.email}
                      </div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={handleReserveForUser}
                disabled={savingLoading}
                className="mt-2 w-full py-2 bg-emerald-500 text-white rounded-xl disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {savingLoading ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    Бронирование...
                  </>
                ) : (
                  "Забронировать для пользователя"
                )}
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={savingLoading}
              className="w-full py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-95 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {savingLoading ? (
                <>
                  <Spinner className="w-5 h-5" />
                  Сохранение...
                </>
              ) : (
                "Сохранить"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Удалить книгу"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Вы уверены, что хотите удалить книгу{" "}
            <strong className="text-gray-900">{deleteTarget?.title}</strong>?
            Это действие нельзя будет отменить.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              disabled={deleting}
            >
              Отмена
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm hover:opacity-95 disabled:opacity-70 flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <Spinner className="w-4 h-4" />
                  Удаление...
                </>
              ) : (
                "Удалить"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BooksManager;
