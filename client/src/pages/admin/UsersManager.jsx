import { useEffect, useState } from "react";
import { getAllUsers, updateUserRole, deleteUser } from "../../api/localApi";
import Spinner from "../../components/Spinner";

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);
  const [loading, setLoading] = useState(true);

  const initialDataUrl = (name, bg = "#7c3aed") => {
    const letter = (name || "?").trim().charAt(0).toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' dy='0.35em' text-anchor='middle' font-family='Inter, Roboto, Arial, sans-serif' font-size='60' fill='#ffffff'>${letter}</text></svg>`;
    const encoded =
      typeof window !== "undefined"
        ? window.btoa(unescape(encodeURIComponent(svg)))
        : "";
    return `data:image/svg+xml;base64,${encoded}`;
  };

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const res = await getAllUsers();
        setUsers(res);
        setFiltered(res);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleFind = () => {
    const q = (query || "").toLowerCase();
    if (!q) return setFiltered(users);
    setFiltered(users.filter(u => ((u.name||"")+" "+(u.email||"")).toLowerCase().includes(q)));
  };

  useEffect(() => {
    const t = setTimeout(() => {
      const q = (query || "").toLowerCase();
      if (!q) return setFiltered(users);
      setFiltered(users.filter(u => ((u.name||"")+" "+(u.email||"")).toLowerCase().includes(q)));
    }, 300);
    return () => clearTimeout(t);
  }, [query, users]);

   const changeRole = async (userId, newRole) => {
     setLoadingAction(userId);
     try {
       await updateUserRole(userId, newRole);
       setUsers((prev) =>
         prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
       );
     } catch (err) {
       console.error(err);
     } finally {
       setLoadingAction(null);
     }
   };

   const handleDelete = async (userId, userName) => {
     if (!window.confirm(`Вы уверены, что хотите удалить пользователя "${userName}"?`)) {
       return;
     }
     setLoadingAction(userId);
     try {
       await deleteUser(userId);
       setUsers((prev) => prev.filter((u) => u.id !== userId));
       alert('Пользователь удалён');
     } catch (err) {
       console.error(err);
       alert('Ошибка при удалении пользователя');
     } finally {
       setLoadingAction(null);
     }
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
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            Пользователи
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            {users.length} пользователей
          </div>
        </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти пользователя по имени или email"
              className="w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border glass focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all placeholder-gray-400 sm:w-72"
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
                 className="glass rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 animate-pulse"
               >
                 <div className="flex flex-col gap-3">
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                     <div className="flex-1 space-y-2">
                       <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                       <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                       <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                     </div>
                   </div>
                   <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                   <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                 </div>
               </div>
             ))
           : filtered.map((u) => (
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
                   disabled={loadingAction === u.id}
                   className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all disabled:opacity-70"
                 >
                   <option value="Читатель">Читатель</option>
                   <option value="Библиотекарь">Библиотекарь</option>
                   <option value="Администратор">Администратор</option>
                 </select>
                 <button
                   onClick={() => handleDelete(u.id, u.name)}
                   disabled={loadingAction === u.id}
                   className="w-full text-rose-600 hover:text-rose-800 text-sm font-medium disabled:opacity-70 flex items-center justify-center gap-2"
                 >
                   {loadingAction === u.id ? (
                     <>
                       <Spinner className="w-4 h-4" />
                       Удаление...
                     </>
                   ) : (
                     "Удалить"
                   )}
                 </button>
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
               {loading
                 ? Array.from({ length: 6 }).map((_, i) => (
                     <tr key={i} className="border-b border-gray-50 animate-pulse">
                       <td className="p-4">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                           <div className="space-y-2">
                             <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                             <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                           </div>
                         </div>
                       </td>
                       <td className="p-4">
                         <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                       </td>
                       <td className="p-4">
                         <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                       </td>
                       <td className="p-4">
                         <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24" />
                       </td>
                       <td className="p-4 text-center">
                         <div className="flex gap-2 justify-center">
                           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                         </div>
                       </td>
                     </tr>
                   ))
                 : filtered.map((u) => (
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
                       <div className="flex items-center gap-2 justify-center">
                         <select
                           value={u.role}
                           onChange={(e) => changeRole(u.id, e.target.value)}
                           disabled={loadingAction === u.id}
                           className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all cursor-pointer disabled:opacity-70"
                         >
                           <option value="Читатель">Читатель</option>
                           <option value="Библиотекарь">Библиотекарь</option>
                           <option value="Администратор">Администратор</option>
                         </select>
                         <button
                           onClick={() => handleDelete(u.id, u.name)}
                           disabled={loadingAction === u.id}
                           className="text-rose-600 hover:text-rose-800 font-medium text-sm disabled:opacity-70 flex items-center gap-1"
                         >
                           {loadingAction === u.id ? (
                             <Spinner className="w-4 h-4" />
                           ) : (
                             "Удалить"
                           )}
                         </button>
                       </div>
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
