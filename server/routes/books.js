const router = require("express").Router();
const booksController = require("../controllers/booksController");

router.get("/", booksController.getBooks);
router.get("/genres", booksController.getGenres);
router.get("/years", booksController.getYears);
router.get("/:id", booksController.getBookById);

module.exports = router;
