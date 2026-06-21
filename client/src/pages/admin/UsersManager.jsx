import { useEffect, useState } from "react";
import { getAllUsers, updateUserRole } from "../../api/localApi";

const UsersManager = () => {
  const [users, setUsers] = useState([]);

  const initialDataUrl = (name, bg = "#7c3aed") => {
    const letter = (name || "?").trim().charAt(0).toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' dy='0.35em' text-anchor='middle' font-family='Inter, Roboto, Arial, sans-serif' font-size='60' fill='#ffffff'>${letter}</text></svg>`;
    const encoded =
      typeof window !== "undefined"
        ? window.btoa(unescape(encodeURIComponent(svg)))
        : Buffer.from(svg).toString("base64");
    return `data:image/svg+xml;base64,${encoded}`;
  };

  useEffect(() => {
    getAllUsers().then(setUsers);
  }, []);

  const changeRole = async (userId, newRole) => {
    await updateUserRole(userId, newRole);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
  };

  const roleBadge = (role) => {
    const colors = {
      Администратор: "bg-purple-100 text-purple-700",
      Библиотекарь: "bg-blue-100 text-blue-700",
      Читатель: "bg-gray-100 text-gray-600",
    };
    return `inline-block px-3 py-1 rounded-full text-xs font-medium ${colors[role] || "bg-gray-100"}`;
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            Пользователи
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            {users.length} пользователей
          </div>
        </div>
      </div>

      {/* Mobile list */}
      <div className="space-y-3 md:hidden">
        {users.map((u) => (
          <div
            key={u.id}
            className="glass rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {u.photo_url ? (
                  <img
                    src={u.photo_url}
                    alt={u.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {getInitials(u.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {u.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {u.email}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {u.phone || "—"}
                  </div>
                </div>
              </div>
              <select
                value={u.role}
                onChange={(e) => changeRole(u.id, e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              >
                <option value="Читатель">Читатель</option>
                <option value="Библиотекарь">Библиотекарь</option>
                <option value="Администратор">Администратор</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block glass rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-left text-sm font-medium text-gray-500">
                  Пользователь
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-500">
                  Email
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-500">
                  Телефон
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-500">
                  Роль
                </th>
                <th className="p-4 text-center text-sm font-medium text-gray-500">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {u.photo_url ? (
                        <img
                          src={u.photo_url}
                          alt={u.name}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = initialDataUrl(u.name);
                          }}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <img
                          src={initialDataUrl(u.name)}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {u.name}
                        </div>
                        <div className="text-xs text-gray-500">ID: {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-700">{u.email}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {u.phone || "—"}
                  </td>
                  <td className="p-4">
                    <span className={roleBadge(u.role)}>{u.role}</span>
                  </td>
                  <td className="p-4 text-center">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all cursor-pointer"
                    >
                      <option value="Читатель">Читатель</option>
                      <option value="Библиотекарь">Библиотекарь</option>
                      <option value="Администратор">Администратор</option>
                    </select>
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

export default UsersManager;
