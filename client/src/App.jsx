import { Routes, Route } from "react-router";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import BookDetail from "./pages/BookDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
import BooksManager from "./pages/admin/BooksManager";
import UsersManager from "./pages/admin/UsersManager";
import ProtectedRoute from "./components/ProtectedRoute";
import ReservationsManager from "./pages/admin/ReservationsManager"; // <-- добавить

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={["Читатель", "Библиотекарь", "Администратор"]}
            >
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["Библиотекарь", "Администратор"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/reservations" element={<ReservationsManager />} />
        <Route path="/admin/books" element={<BooksManager />} />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["Администратор"]}>
              <UsersManager />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
