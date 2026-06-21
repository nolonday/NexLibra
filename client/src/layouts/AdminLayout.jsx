import { Outlet, Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={() => toggleTheme()}
      aria-label="Toggle theme"
      className="ml-2 p-2 rounded-full bg-white/10 hover:bg-white/20"
    >
      {theme === "dark" ? (
        <svg
          className="w-5 h-5 text-yellow-300"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const [open, setOpen] = useState(false);

  const initialDataUrl = (name, bg = "#7c3aed") => {
    const letter = (name || "?").trim().charAt(0).toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' dy='0.35em' text-anchor='middle' font-family='Inter, Roboto, Arial, sans-serif' font-size='60' fill='#ffffff'>${letter}</text></svg>`;
    const encoded =
      typeof window !== "undefined"
        ? window.btoa(unescape(encodeURIComponent(svg)))
        : Buffer.from(svg).toString("base64");
    return `data:image/svg+xml;base64,${encoded}`;
  };

  const closeMenu = () => setOpen(false);

  const navLinkClass =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all";

  return (
    <div className="flex h-[100dvh] bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <aside
        className={`glass-strong dark:glass-strong flex flex-col shrink-0 ${
          open
            ? "fixed left-0 top-0 bottom-0 z-40 w-72 max-w-[85vw]"
            : "hidden md:flex w-72"
        }`}
      >
        <div className="p-4 sm:p-6 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
            N
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800 dark:text-gray-100">
              NexLibra
            </div>
            <div className="text-xs text-gray-500">Панель управления</div>
          </div>
          {open && (
            <button
              onClick={closeMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600"
              aria-label="Закрыть меню"
            >
              ✕
            </button>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link to="/admin" onClick={closeMenu} className={navLinkClass}>
            <svg
              className="w-5 h-5 text-purple-600"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 13h4v7H3zM10 8h4v12h-4zM17 3h4v17h-4z"
                fill="currentColor"
              />
            </svg>
            Панель
          </Link>
          <Link to="/admin/books" onClick={closeMenu} className={navLinkClass}>
            <svg
              className="w-5 h-5 text-purple-600"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 5a2 2 0 012-2h13v16H5a2 2 0 01-2-2V5zM7 5v14"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Книги
          </Link>
          <Link
            to="/admin/reservations"
            onClick={closeMenu}
            className={navLinkClass}
          >
            <svg
              className="w-5 h-5 text-purple-600"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M8 7h8M8 12h8M8 17h5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
            Бронирования
          </Link>
          {user?.role === "Администратор" && (
            <Link
              to="/admin/users"
              onClick={closeMenu}
              className={navLinkClass}
            >
              <svg
                className="w-5 h-5 text-purple-600"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5S14.343 11 16 11zM8 11c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11z"
                  fill="currentColor"
                />
                <path
                  d="M2 20a6 6 0 0112 0v1H2v-1zM12 20a6 6 0 0112 0v1h-12v-1z"
                  fill="currentColor"
                  opacity="0.9"
                />
              </svg>
              Пользователи
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-300">Тема</div>
            <ThemeToggle />
          </div>

          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-700 transition-colors"
          >
            ← На главную
          </Link>
          <div className="flex items-center gap-3">
            {user?.photo_url ? (
              <img
                src={user.photo_url}
                alt={user?.name || user?.email}
                className="w-9 h-9 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = initialDataUrl(
                    user?.name || user?.email,
                  );
                }}
              />
            ) : (
              <img
                src={initialDataUrl(user?.name || user?.email)}
                alt={user?.name || user?.email}
                className="w-9 h-9 rounded-full object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">
                {user?.email}
              </div>
              <div className="text-xs text-gray-500">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Выйти из системы
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 glass-strong flex items-center justify-between px-4 py-3 safe-area-top">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setOpen(true)}
            className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Открыть меню"
          >
            ☰
          </button>
          <div className="font-bold truncate">NexLibra</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate max-w-[100px]">
            {user?.role}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="md:hidden h-14" />
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Outlet />
        </div>
      </main>

      {/* Overlay close area for mobile menu */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={closeMenu}
          aria-hidden
        />
      )}
    </div>
  );
};

export default AdminLayout;
