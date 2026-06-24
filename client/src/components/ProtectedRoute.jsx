import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Spinner from "./Spinner";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-linear-to-br from-purple-100 to-indigo-100">
            <Spinner className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-lg font-medium text-gray-800 dark:text-gray-100">Проверка сессии...</div>
          <div className="text-sm text-gray-500 mt-2">Подождите, мы загружаем ваш профиль</div>
        </div>
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
