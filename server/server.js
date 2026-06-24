const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require("path");
const fs = require("fs");
const authRoutes = require("./routes/auth");
const booksRoutes = require("./routes/books");
const reservationsRoutes = require("./routes/reservations");
const adminRoutes = require("./routes/admin");
const uploadsRoutes = require("./routes/uploads");
const coversRoutes = require("./routes/covers");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/covers", coversRoutes);

try {
  require("./jobs/expireReservations");
} catch (e) {
  console.error("Failed to start expireReservations job:", e);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
