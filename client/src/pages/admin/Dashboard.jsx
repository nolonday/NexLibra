import { useEffect, useState } from "react";
import { getBooks, getAllUsers, getAllReservations } from "../../api/localApi";
import { useAuth } from "../../hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Администратор";
  const [stats, setStats] = useState({
    books: 0,
    users: 0,
    activeReservations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [books, reservations, users] = await Promise.all([
        getBooks({ limit: 999 }),
        getAllReservations(),
        isAdmin ? getAllUsers() : Promise.resolve([]),
      ]);
      setStats({
        books: books.books.length,
        users: users.length,
        activeReservations: reservations.filter((r) => r.status === "Активно")
          .length,
      });
      setLoading(false);
    };
    load();
  }, [isAdmin]);

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">
        Панель управления
      </h1>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 ${isAdmin ? "lg:grid-cols-3" : ""}`}
      >
        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-2">Книг в каталоге</p>
          {loading ? (
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
          ) : (
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
              {stats.books}
            </p>
          )}
        </div>
        {isAdmin && (
          <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 text-sm mb-2">Пользователей</p>
            {loading ? (
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
            ) : (
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                {stats.users}
              </p>
            )}
          </div>
        )}
        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
          <p className="text-gray-500 text-sm mb-2">Активных бронирований</p>
          {loading ? (
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
          ) : (
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
              {stats.activeReservations}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
