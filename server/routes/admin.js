const router = require("express").Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/auth");
const { adminOnly, staffOnly } = require("../middleware/auth");
const booksController = require("../controllers/booksController"); // for updateBook

router.get("/users", authMiddleware, adminOnly, adminController.getAllUsers);
router.put(
  "/users/:id/role",
  authMiddleware,
  adminOnly,
  adminController.updateUserRole,
);
router.put("/users/:id", authMiddleware, adminOnly, adminController.updateUser);

router.get(
  "/reservations",
  authMiddleware,
  staffOnly,
  adminController.getAllReservations,
);
router.put(
  "/reservations/:id",
  authMiddleware,
  staffOnly,
  adminController.updateReservationStatus,
);

router.put("/books/:id", authMiddleware, staffOnly, booksController.updateBook);
router.post("/books", authMiddleware, staffOnly, booksController.createBook);
module.exports = router;
