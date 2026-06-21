const router = require("express").Router();
const reservationsController = require("../controllers/reservationsController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, reservationsController.createReservation);
router.get(
  "/active",
  authMiddleware,
  reservationsController.getActiveReservations,
);
router.get(
  "/history",
  authMiddleware,
  reservationsController.getReservationHistory,
);
router.delete("/:id", authMiddleware, reservationsController.cancelReservation);

module.exports = router;
