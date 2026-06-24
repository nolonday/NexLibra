const express = require("express");
const router = express.Router();
const multer = require("multer");
const coversController = require("../controllers/coversController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), coversController.uploadCover);

module.exports = router;
