import { Link } from "react-router";

const NotFound = () => (
  <div className="text-center mt-12 sm:mt-20 fade-in glass-strong max-w-lg mx-auto p-6 sm:p-10 rounded-2xl sm:rounded-3xl">
    <span className="text-5xl sm:text-7xl">📚</span>
    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mt-4">
      404
    </h1>
    <p className="text-lg sm:text-xl text-gray-500 mb-6">Страница не найдена</p>
    <Link
      to="/"
      className="inline-block px-6 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:opacity-95 transition-opacity"
    >
      На главную
    </Link>
  </div>
);

export default NotFound;
