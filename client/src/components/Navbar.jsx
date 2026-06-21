import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass-strong sticky top-0 z-50 py-3">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight"
        >
          NexLibra
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-4 lg:gap-6 items-center text-gray-700 font-medium">
          <Link
            to="/catalog"
            className="hover:text-purple-600 transition-colors"
          >
            Каталог
          </Link>
          {user ? (
            <>
              <Link
                to="/profile"
                className="hover:text-purple-600 transition-colors"
              >
                Личный кабинет
              </Link>
              {(user.role === "Библиотекарь" ||
                user.role === "Администратор") && (
                <Link
                  to="/admin"
                  className="hover:text-purple-600 transition-colors"
                >
                  Админка
                </Link>
              )}
              <button
                onClick={logout}
                className="text-red-400 hover:text-red-600 transition-colors font-medium"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:text-purple-600 transition-colors"
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:opacity-95 transition-shadow shadow-lg shadow-purple-200"
              >
                Регистрация
              </Link>
            </>
          )}
          {/* Theme toggle */}
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
              <svg
                className="w-5 h-5 text-gray-800"
                viewBox="0 0 24 24"
                fill="none"
              >
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
        </nav>

        {/* Mobile burger */}
        <div className="md:hidden">
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="p-2.5 rounded-md bg-white/10 hover:bg-white/20 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800">
          <div className="px-4 pt-4 pb-6 space-y-1">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => toggleTheme()}
                aria-label="Toggle theme"
                className="p-2.5 rounded-md bg-white/10 hover:bg-white/20 min-w-[44px] min-h-[44px]"
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </button>
            </div>
            <Link
              to="/catalog"
              onClick={() => setOpen(false)}
              className="block py-3 text-gray-800 dark:text-gray-100 font-medium"
            >
              Каталог
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="block py-3 text-gray-800 dark:text-gray-100"
                >
                  Личный кабинет
                </Link>
                {(user.role === "Библиотекарь" ||
                  user.role === "Администратор") && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="block py-3 text-gray-800 dark:text-gray-100"
                  >
                    Админка
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="w-full text-left py-3 text-red-500"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block py-3 text-gray-800 dark:text-gray-100"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="block py-3 px-4 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-full text-center"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
