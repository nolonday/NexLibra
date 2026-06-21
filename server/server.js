const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require("path");
const fs = require("fs");
const authRoutes = require("./routes/auth");
const booksRoutes = require("./routes/books");
const reservationsRoutes = require("./routes/reservations");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, "public", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/admin", adminRoutes);

try {
  require("./jobs/expireReservations");
} catch (e) {
  console.error("Failed to start expireReservations job:", e);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
