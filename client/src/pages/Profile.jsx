import { useEffect, useState, useRef } from "react";
import {
  getActiveReservations,
  getReservationHistory,
  cancelReservation,
} from "../api/localApi";
import { useAuth } from "../hooks/useAuth";
import { uploadAvatar, updateProfile } from "../api/localApi";
import Spinner from "../components/Spinner";

const Profile = () => {
  const { user } = useAuth();
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const { updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    photo_url: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const loadData = () => {
    getActiveReservations(user.id).then(setActive);
    getReservationHistory(user.id).then(setHistory);
  };

  const formatDate = (val) => {
    if (!val) return "—";
    const d = new Date(val);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString();
  };

  useEffect(() => {
    if (user) {
      loadData();
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        photo_url: user.photo_url || "",
      });
    }
  }, [user]);

  const handleCancel = async (id) => {
    await cancelReservation(id);
    loadData();
  };

  const startEdit = () => setEditing(true);

   const handleSave = async () => {
     setLoading(true);
     try {
       let photo_url = form.photo_url;
       if (photoFile) {
         const dataUrl = await new Promise((res, rej) => {
           const reader = new FileReader();
           reader.onload = () => res(reader.result);
           reader.onerror = rej;
           reader.readAsDataURL(photoFile);
         });
         const uploadRes = await uploadAvatar(photoFile.name, dataUrl);
         photo_url = uploadRes.url;
       }
       const updated = await updateProfile({
         name: form.name,
         phone: form.phone,
         address: form.address,
         photo_url,
       });
       updateUser(updated);
       setEditing(false);
       setPhotoFile(null);
     } catch (err) {
       console.error(err);
     } finally {
       setLoading(false);
     }
   };

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in">
      <div className="glass-strong rounded-2xl p-4 sm:p-6">
        {!editing ? (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/10 overflow-hidden flex items-center justify-center shrink-0">
              {user?.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user?.name || "avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-linear-to-br from-purple-100 to-indigo-100 text-3xl">
                  👤
                </div>
              )}
            </div>
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {user?.name}
                  </h1>
                  <p className="text-gray-600 mt-1">{user?.email}</p>
                  <p className="text-sm text-gray-400">Роль: {user?.role}</p>
                  {user?.phone && (
                    <p className="text-sm text-gray-600 mt-1">
                      Тел: {user.phone}
                    </p>
                  )}
                  {user?.address && (
                    <p className="text-sm text-gray-600">
                      Адрес: {user.address}
                    </p>
                  )}
                </div>
                <div className="sm:shrink-0">
                  <button
                    onClick={startEdit}
                    className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                  >
                    Изменить профиль
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white/10 overflow-hidden shrink-0">
                {photoFile ? (
                  <img
                    src={URL.createObjectURL(photoFile)}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : form.photo_url ? (
                  <img
                    src={form.photo_url}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-linear-to-br from-purple-100 to-indigo-100 text-3xl">
                    👤
                  </div>
                )}
              </div>
              <div className="flex-1 w-full">
                <input
                  className="w-full p-3 rounded-xl border border-gray-200"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  className="w-full p-3 rounded-xl border border-gray-200 mt-2"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <input
                  className="w-full p-3 rounded-xl border border-gray-200 mt-2"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
                <input
                  className="w-full p-3 rounded-xl border border-gray-200 mt-2"
                  value={form.photo_url}
                  onChange={(e) =>
                    setForm({ ...form, photo_url: e.target.value })
                  }
                  placeholder="URL фото (опционально)"
                />
              </div>
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
                  if (f.size > 2 * 1024 * 1024) return;
                  setPhotoFile(f);
                  setForm({ ...form, photo_url: "" });
                }
              }}
              onClick={() => inputRef.current && inputRef.current.click()}
              className={`mt-2 w-full rounded-2xl p-4 border-2 transition-all cursor-pointer ${dragOver ? "border-purple-400 bg-purple-50" : "border-dashed border-gray-300 bg-white/50"}`}
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
                    if (f.size > 2 * 1024 * 1024) return;
                    setPhotoFile(f);
                    setForm({ ...form, photo_url: "" });
                  }
                }}
                className="hidden"
              />
            </div>

             <div className="flex flex-col sm:flex-row gap-3 mt-4">
               <button
                 onClick={handleSave}
                 disabled={loading}
                 className="w-full sm:w-auto px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-95 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
               >
                 {loading ? (
                   <>
                     <Spinner className="w-4 h-4" />
                     Сохранение...
                   </>
                 ) : (
                   "Сохранить"
                 )}
               </button>
               <button
                 onClick={() => {
                   setEditing(false);
                   setPhotoFile(null);
                   setForm({
                     name: user.name || "",
                     phone: user.phone || "",
                     address: user.address || "",
                     photo_url: user.photo_url || "",
                   });
                 }}
                 disabled={loading}
                 className="w-full sm:w-auto px-4 py-2 bg-white border rounded-xl disabled:opacity-70"
               >
                 Отменить
               </button>
             </div>
          </div>
        )}
      </div>

      <section className="glass-strong rounded-2xl p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Активные бронирования
        </h2>
        {active.length === 0 ? (
          <p className="text-gray-400">Нет активных бронирований</p>
        ) : (
          <ul className="space-y-3">
            {active.map((b) => (
              <li
                key={b.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-white/40 rounded-xl"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
                    {b.book_title}
                  </p>
                  <p className="text-sm text-gray-500">
                    до {formatDate(b.expires_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleCancel(b.id)}
                  className="self-start sm:self-auto shrink-0 text-red-400 hover:text-red-600 font-medium py-1"
                >
                  Отменить
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass-strong rounded-2xl p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">История</h2>
        {history.length === 0 ? (
          <p className="text-gray-400">История пуста</p>
        ) : (
          <ul className="space-y-3">
            {history.map((b) => (
              <li key={b.id} className="p-3 bg-white/40 rounded-xl">
                <p className="font-medium">{b.book_title}</p>
                <p className="text-sm text-gray-500">{b.status}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Profile;
