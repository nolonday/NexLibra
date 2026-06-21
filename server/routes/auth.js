const router = require("express").Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getMe);
router.post("/upload", authController.uploadAvatar);
router.put("/me", authMiddleware, authController.updateProfile);

module.exports = router;
