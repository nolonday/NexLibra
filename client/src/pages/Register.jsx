import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { register, uploadAvatar } from "../api/localApi";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/Spinner";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let avatarUrl = photoUrl;
      if (photoFile) {
        const dataUrl = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.onerror = rej;
          reader.readAsDataURL(photoFile);
        });
        const uploadRes = await uploadAvatar(photoFile.name, dataUrl);
        avatarUrl = uploadRes.url;
      }

      await register(email, password, name, phone, address, avatarUrl);
      await login(email, password);
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 sm:mt-10 glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-8 fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Регистрация
      </h1>
      {error && (
        <div className="text-red-500 bg-red-50 p-2 rounded-xl mb-4 text-center">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
          required
        />
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
          placeholder="Пароль (мин. 6 символов)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
          required
        />
        <input
          type="tel"
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <input
          type="text"
          placeholder="Адрес"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <input
          type="url"
          placeholder="URL фото (опционально)"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />

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
              if (f.size > 2 * 1024 * 1024) {
                setError("Файл слишком большой (макс 2MB)");
                return;
              }
              setPhotoFile(f);
              setPhotoUrl("");
            }
          }}
          onClick={() => inputRef.current && inputRef.current.click()}
          className={`mt-2 w-full rounded-2xl p-4 border-2 transition-all cursor-pointer ${
            dragOver
              ? "border-purple-400 bg-purple-50"
              : "border-dashed border-gray-300 bg-white/50"
          }`}
        >
          {!photoFile ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-2xl">
                📤
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  Перетащите фото или нажмите, чтобы выбрать
                </div>
                <div className="text-sm text-gray-500">
                  Поддерживаются изображения, макс 2MB
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <img
                  src={URL.createObjectURL(photoFile)}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded-md shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-medium text-gray-800 truncate">
                    {photoFile.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {(photoFile.size / 1024).toFixed(0)} KB
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoFile(null);
                  }}
                  className="w-full sm:w-auto px-3 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Удалить
                </button>
              </div>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (f) {
                if (f.size > 2 * 1024 * 1024) {
                  setError("Файл слишком большой (макс 2MB)");
                  return;
                }
                setPhotoFile(f);
                setPhotoUrl("");
              }
            }}
            className="hidden"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-95 transition-opacity shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Spinner className="w-5 h-5" />
              Регистрация...
            </>
          ) : (
            "Зарегистрироваться"
          )}
        </button>
      </form>
    </div>
  );
};

export default Register;
