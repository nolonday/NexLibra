import { useEffect, useRef, useState } from "react";
import { getBooks } from "../api/localApi";
import BookCard from "../components/BookCard";

const Home = () => {
  const [popular, setPopular] = useState([]);
  const carouselRef = useRef(null);

  useEffect(() => {
    getBooks({ sort: "popular", limit: 4 }).then((res) =>
      setPopular(res.books),
    );
  }, []);

  return (
    <div className="space-y-8 sm:space-y-12 fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-400 p-6 sm:p-10 text-white shadow-xl shadow-purple-200/50">
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
            Добро пожаловать в{" "}
            <span className="underline decoration-white/40">NexLibra</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-xl">
            Ваша цифровая библиотека с тысячами книг — ищите, бронируйте,
            читайте.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <a
              href="/catalog"
              role="button"
              className="w-full sm:w-auto text-center px-6 py-3 bg-white text-purple-700 font-semibold rounded-full hover:bg-gray-100 transition"
            >
              Перейти в каталог
            </a>
            <a
              href="/register"
              role="button"
              className="w-full sm:w-auto text-center px-6 py-3 border border-white/50 text-white rounded-full hover:bg-white/10 transition"
            >
              Регистрация
            </a>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-300/30 rounded-full blur-3xl translate-y-10 -translate-x-10"></div>
      </section>

      {/* Popular books - slider */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            Популярные книги
          </h2>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                const el = carouselRef.current;
                if (!el) return;
                const child = el.querySelector(".slide-item");
                const step = (child?.offsetWidth || el.clientWidth) + 16;
                el.scrollBy({ left: -step, behavior: "smooth" });
              }}
              className="p-2 rounded-lg bg-white/90 glass hover:scale-105 transition"
              aria-label="Prev"
            >
              ‹
            </button>
            <button
              onClick={() => {
                const el = carouselRef.current;
                if (!el) return;
                const child = el.querySelector(".slide-item");
                const step = (child?.offsetWidth || el.clientWidth) + 16;
                el.scrollBy({ left: step, behavior: "smooth" });
              }}
              className="p-2 rounded-lg bg-white/90 glass hover:scale-105 transition"
              aria-label="Next"
            >
              ›
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto pb-3 scroll-smooth hide-scrollbar"
        >
          {popular.map((book) => (
            <div key={book.id} className="slide-item">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="mt-8 sm:mt-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="glass p-6 rounded-2xl text-center">
            <svg
              className="mx-auto mb-3 w-12 h-12 text-purple-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M3 6v13a1 1 0 001 1h16V6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 6V4a4 4 0 118 0v2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h3 className="font-semibold mb-1">Тысячи книг</h3>
            <p className="text-sm text-gray-500">
              Большая коллекция для любого читателя
            </p>
          </div>

          <div className="glass p-6 rounded-2xl text-center">
            <svg
              className="mx-auto mb-3 w-12 h-12 text-purple-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 2v6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 10h8l-1 10H9L8 10z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h3 className="font-semibold mb-1">Мгновенное бронирование</h3>
            <p className="text-sm text-gray-500">
              Бронируйте онлайн — без очередей
            </p>
          </div>

          <div className="glass p-6 rounded-2xl text-center">
            <svg
              className="mx-auto mb-3 w-12 h-12 text-purple-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 2v6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h3 className="font-semibold mb-1">Читайте где угодно</h3>
            <p className="text-sm text-gray-500">
              Доступ с телефона, планшета или компьютера
            </p>
          </div>
        </div>
      </section>

      {/* CTA removed per user request */}
    </div>
  );
};

export default Home;
