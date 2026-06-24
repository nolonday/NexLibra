import { useEffect, useState } from "react";
import {
  getAllReservations,
  updateReservationStatus,
} from "../../api/localApi";

const ReservationsManager = () => {
  const [reservations, setReservations] = useState([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialDataUrl = (label, bg = "#c4b5fd") => {
    const letter = (label || "?").trim().charAt(0).toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' dy='0.35em' text-anchor='middle' font-family='Inter, Roboto, Arial, sans-serif' font-size='60' fill='#ffffff'>${letter}</text></svg>`;
    const encoded =
      typeof window !== "undefined"
        ? window.btoa(unescape(encodeURIComponent(svg)))
        : "";
    return `data:image/svg+xml;base64,${encoded}`;
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllReservations();
      setReservations(data);
      setFiltered(data);
    } finally {
      setLoading(false);
    }
  };

  const handleFind = () => {
    const q = (query || "").toLowerCase();
    if (!q) return setFiltered(reservations);
    setFiltered(
      reservations.filter((r) =>
        ((r.user_name || r.user_email || "") + " " + (r.book_title || ""))
          .toLowerCase()
          .includes(q),
      ),
    );
  };

  useEffect(() => {
    const t = setTimeout(() => {
      const q = (query || "").toLowerCase();
      if (!q) return setFiltered(reservations);
      setFiltered(
        reservations.filter((r) =>
          ((r.user_name || r.user_email || "") + " " + (r.book_title || ""))
            .toLowerCase()
            .includes(q),
        ),
      );
    }, 300);
    return () => clearTimeout(t);
  }, [query, reservations]);

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    await updateReservationStatus(id, newStatus);
    load();
  };

  const statusColors = {
    Активно: "bg-yellow-100 text-yellow-700",
    Отменена: "bg-red-100 text-red-700",
    Выдана: "bg-blue-100 text-blue-700",
    Завершена: "bg-green-100 text-green-700",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            Управление бронированиями
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-300 mt-1">
            {reservations.length} бронирований
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по читателю или книге"
            className="w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border glass focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all placeholder-gray-400 sm:w-80"
          />
          <button
            onClick={handleFind}
            className="px-6 py-2.5 sm:py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:opacity-95 transition-colors shadow-lg shadow-purple-200"
          >
            Найти
          </button>
          {/* Reset button removed: live-filtering applied */}
        </div>
      </div>
      {/* Mobile list */}
      <div className="space-y-3 md:hidden">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="glass rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
                </div>
              </div>
            ))
          : filtered.map((r) => (
              <div
                key={r.id}
                className="glass rounded-xl shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-start gap-3">
                  {r.user_photo_url ? (
                    <img
                      src={r.user_photo_url}
                      alt={r.user_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-sm">
                      👤
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {r.user_name || r.user_email}
                    </div>
                    <div className="text-sm text-gray-700">
                      {r.book_title || "Книга"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Создано: {new Date(r.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Истекает: {new Date(r.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status] || "bg-gray-100"}`}
                    >
                      {r.status}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-right">
                  {r.status === "Активно" && (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleStatusChange(r.id, "Выдана")}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Выдать
                      </button>
                      <button
                        onClick={() => handleStatusChange(r.id, "Отменена")}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Отменить
                      </button>
                    </div>
                  )}
                  {r.status === "Выдана" && (
                    <button
                      onClick={() => handleStatusChange(r.id, "Завершена")}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Вернуть
                    </button>
                  )}
                </div>
              </div>
            ))}
      </div>

      <div className="hidden md:block glass rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  ID
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Читатель
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Книга
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Создано
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Истекает
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Статус
                </th>
                <th className="p-4 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
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
                      <td className="p-4 text-sm">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28" />
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
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                      </td>
                      <td className="p-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        </div>
                      </td>
                    </tr>
                  ))
                : filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/10"
                    >
                      <td className="p-4 text-sm text-gray-700">{r.id}</td>
                      <td className="p-4 text-sm text-gray-900 dark:text-gray-200">
                        <div className="flex items-center gap-3">
                          {r.user_photo_url ? (
                            <img
                              src={r.user_photo_url}
                              alt={r.user_name}
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = initialDataUrl(
                                  r.user_name || r.user_email,
                                );
                              }}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <img
                              src={initialDataUrl(r.user_name || r.user_email)}
                              alt={r.user_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {r.user_name || r.user_email}
                            </div>
                            <div className="text-xs text-gray-500">
                              {r.user_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-900 font-medium dark:text-gray-200">
                        {r.book_title || "Книга"}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(r.expires_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status] || "bg-gray-100"}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {r.status === "Активно" && (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleStatusChange(r.id, "Выдана")}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Выдать
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(r.id, "Отменена")
                              }
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Отменить
                            </button>
                          </div>
                        )}
                        {r.status === "Выдана" && (
                          <button
                            onClick={() =>
                              handleStatusChange(r.id, "Завершена")
                            }
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Вернуть
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReservationsManager;
