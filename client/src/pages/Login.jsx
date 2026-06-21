import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/profile");
    } catch (err) {
      setError("Неверный email или пароль");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 sm:mt-10 glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-8 fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Вход
      </h1>
      {error && (
        <div className="text-red-500 bg-red-50 p-2 rounded-xl mb-4 text-center">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
          required
        />
        <button
          type="submit"
          className="w-full py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-95 transition-opacity shadow-md"
        >
          Войти
        </button>
      </form>
      <p className="mt-4 text-center text-gray-500 text-sm">
        Нет аккаунта?{" "}
        <a href="/register" className="text-purple-600 hover:underline">
          Регистрация
        </a>
      </p>
    </div>
  );
};

export default Login;
