import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { getBookById, createReservation } from "../api/localApi";
import { useAuth } from "../hooks/useAuth";
import Modal from "../components/Modal";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [message, setMessage] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    comment: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getBookById(id)
      .then(setBook)
      .catch(() => navigate("/404"));
  }, [id, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user || !book) return;
    setSending(true);
    try {
      await createReservation(user.id, book.id, { ...form });
      setMessage("Отправлено!");
      setTimeout(() => {
        setIsBookingOpen(false);
        setMessage("");
        setBook((prev) => ({ ...prev, status: "Забронирована" }));
      }, 1200);
    } catch (err) {
      setMessage(err?.message || "Ошибка");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 fade-in">
      <div className="mb-4 text-sm text-gray-500 overflow-hidden">
        <Link to="/">Главная</Link> / <Link to="/catalog">Каталог</Link> /{" "}
        <span className="text-gray-800 dark:text-gray-100 truncate inline-block max-w-[50vw] sm:max-w-none align-bottom">
          {book?.title}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-1">
          <div className="rounded-2xl bg-linear-to-br from-purple-100 to-blue-100 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full aspect-2/3 flex items-center justify-center bg-white/30">
              {book?.cover_url ? (
                <img
                  alt={book.title}
                  className="h-full w-full object-contain"
                  src={book.cover_url}
                  onError={(e) =>
                    (e.currentTarget.src = "/placeholder-book.png")
                  }
                />
              ) : (
                <span className="text-8xl">📖</span>
              )}
            </div>
            {book && (
              <div className="mt-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${book.status === "В наличии" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {book.status}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
            {book?.title}
          </h1>
          <p className="text-lg sm:text-xl text-purple-600 font-medium">
            {book?.author}
          </p>
          <p className="text-sm sm:text-base text-gray-500">
            {book?.genre} · {book?.year} · ISBN: {book?.isbn}
          </p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            {book?.description}
          </p>

          {user && book?.status === "В наличии" && (
            <>
              <button
                onClick={() => {
                  setForm((f) => ({
                    ...f,
                    name: user?.name || "",
                    email: user?.email || "",
                  }));
                  setIsBookingOpen(true);
                }}
                className="mt-4 w-full sm:w-auto px-8 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:opacity-95 transition-opacity shadow-lg shadow-purple-200"
              >
                Забронировать
              </button>

              <Modal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                title={`Бронирование — ${book?.title}`}
              >
                {message && (
                  <div className="text-sm text-purple-700 text-center">
                    {message}
                  </div>
                )}
                <form onSubmit={submit} className="space-y-3">
                  <div>
                    <label className="text-sm">Имя</label>
                    <input
                      className="w-full p-3 rounded-xl border glass"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm">Email</label>
                    <input
                      className="w-full p-3 rounded-xl border bg-gray-100 dark:bg-gray-800"
                      value={form.email}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm">Телефон (опционально)</label>
                    <input
                      className="w-full p-3 rounded-xl border glass"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm">Дата</label>
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        className="w-full p-3 rounded-xl border glass"
                        value={form.date}
                        onChange={(e) =>
                          setForm({ ...form, date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm">Время</label>
                      <input
                        type="time"
                        className="w-full p-3 rounded-xl border glass"
                        value={form.time}
                        onChange={(e) =>
                          setForm({ ...form, time: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm">Комментарий</label>
                    <textarea
                      className="w-full p-3 rounded-xl border glass"
                      value={form.comment}
                      onChange={(e) =>
                        setForm({ ...form, comment: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsBookingOpen(false)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-white border rounded-xl"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full sm:w-auto px-4 py-2.5 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:opacity-95 transition-opacity"
                    >
                      {sending ? "Отправка..." : "Отправить запрос"}
                    </button>
                  </div>
                  {message && (
                    <div className="text-sm text-purple-700">{message}</div>
                  )}
                </form>
              </Modal>
            </>
          )}

          {message && <p className="text-sm text-purple-700 mt-2">{message}</p>}

          <div className="mt-6 p-4 glass rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-linear-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-2xl shrink-0">
              ❓
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-800 dark:text-gray-100">
                Нужна помощь?
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Тел: +7 123 456-78-90 · info@nexlibra.local
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
