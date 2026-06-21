const pool = require("../db");

exports.createReservation = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { bookId } = req.body;
    const userId = req.user.id;

    // Check active reservations limit (max 3)
    const activeRes = await client.query(
      "SELECT COUNT(*) FROM reservations WHERE user_id = $1 AND status = 'Активно'",
      [userId],
    );
    if (parseInt(activeRes.rows[0].count) >= 3) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Нельзя забронировать больше 3 книг одновременно" });
    }

    // Check book availability
    const book = await client.query(
      "SELECT * FROM books WHERE id = $1 FOR UPDATE",
      [bookId],
    );
    if (book.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Книга не найдена" });
    }
    if (book.rows[0].status !== "В наличии") {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Книга недоступна для бронирования" });
    }

    // Create reservation
    const reservation = await client.query(
      "INSERT INTO reservations (user_id, book_id, status, expires_at) VALUES ($1, $2, 'Активно', NOW() + INTERVAL '3 days') RETURNING *",
      [userId, bookId],
    );

    // Update book status
    await client.query(
      "UPDATE books SET status = 'Забронирована' WHERE id = $1",
      [bookId],
    );

    await client.query("COMMIT");
    res.status(201).json(reservation.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  } finally {
    client.release();
  }
};

exports.cancelReservation = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { id } = req.params;
    const userId = req.user.id;

    const reservation = await client.query(
      "SELECT * FROM reservations WHERE id = $1 AND user_id = $2 FOR UPDATE",
      [id, userId],
    );
    if (reservation.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Бронирование не найдено" });
    }
    if (reservation.rows[0].status !== "Активно") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Бронирование не активно" });
    }

    // Cancel reservation
    await client.query(
      "UPDATE reservations SET status = 'Отменена' WHERE id = $1",
      [id],
    );
    // Return book to available status
    await client.query("UPDATE books SET status = 'В наличии' WHERE id = $1", [
      reservation.rows[0].book_id,
    ]);

    await client.query("COMMIT");
    res.json({ message: "Бронирование отменено" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  } finally {
    client.release();
  }
};

exports.getActiveReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT r.*, b.title as book_title, b.author as book_author
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       WHERE r.user_id = $1 AND r.status = 'Активно'`,
      [userId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.getReservationHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT r.*, b.title as book_title, b.author as book_author
       FROM reservations r
       JOIN books b ON r.book_id = b.id
       WHERE r.user_id = $1 AND r.status != 'Активно'
       ORDER BY r.created_at DESC`,
      [userId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
