import api from "./axios";

export const login = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const register = async (
  email,
  password,
  name,
  phone,
  address,
  photo_url,
) => {
  const { data } = await api.post("/auth/register", {
    email,
    password,
    name,
    phone,
    address,
    photo_url,
  });
  return data;
};

export const uploadAvatar = async (filename, dataUrl) => {
  const { data } = await api.post("/auth/upload", { filename, data: dataUrl });
  return data; // { url }
};

export const updateProfile = async (updates) => {
  const { data } = await api.put(`/auth/me`, updates);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const getBooks = async ({
  page = 1,
  limit = 16,
  search,
  genre,
  sort,
  yearFrom,
  yearTo,
  status,
} = {}) => {
  const params = { page, limit, search, genre, sort };
  if (yearFrom !== undefined) params.year_from = yearFrom;
  if (yearTo !== undefined) params.year_to = yearTo;
  if (status !== undefined) params.status = status;
  const { data } = await api.get("/books", { params });
  return data;
};

export const getBookById = async (id) => {
  const { data } = await api.get(`/books/${id}`);
  return data;
};

export const getGenres = async () => {
  const { data } = await api.get("/books/genres");
  return data.genres;
};

export const createReservation = async (userId, bookId) => {
  const { data } = await api.post("/reservations", { bookId });
  return data;
};

export const cancelReservation = async (reservationId) => {
  await api.delete(`/reservations/${reservationId}`);
};

export const getActiveReservations = async (userId) => {
  const { data } = await api.get("/reservations/active");
  return data;
};

export const getReservationHistory = async (userId) => {
  const { data } = await api.get("/reservations/history");
  return data;
};

export const updateBook = async (id, updates) => {
  const { data } = await api.put(`/admin/books/${id}`, updates);
  return data;
};
export const createBook = async (payload) => {
  const { data } = await api.post(`/admin/books`, payload);
  return data;
};

export const getAllUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data;
};

export const updateUserRole = async (userId, newRole) => {
  const { data } = await api.put(`/admin/users/${userId}/role`, {
    role: newRole,
  });
  return data;
};

export const adminUpdateUser = async (userId, updates) => {
  const { data } = await api.put(`/admin/users/${userId}`, updates);
  return data;
};

export const getAllReservations = async () => {
  const { data } = await api.get("/admin/reservations");
  return data;
};

export const updateReservationStatus = async (reservationId, newStatus) => {
  const { data } = await api.put(`/admin/reservations/${reservationId}`, {
    status: newStatus,
  });
  return data;
};
