const pool = require("../db");

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role, name, phone, address, photo_url, created_at FROM users ORDER BY id",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["Читатель", "Библиотекарь", "Администратор"].includes(role)) {
      return res.status(400).json({ message: "Недопустимая роль" });
    }
    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role, name, phone, address, photo_url",
      [role, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, photo_url, role } = req.body;
    const result = await pool.query(
      "UPDATE users SET name = $1, phone = $2, address = $3, photo_url = $4, role = COALESCE($5, role) WHERE id = $6 RETURNING id, email, role, name, phone, address, photo_url",
      [
        name || null,
        phone || null,
        address || null,
        photo_url || null,
        role || null,
        id,
      ],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Пользователь не найден" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.email as user_email, u.name as user_name, u.photo_url as user_photo_url, b.title as book_title, b.cover_url as book_cover_url
       FROM reservations r
       JOIN users u ON r.user_id = u.id
       JOIN books b ON r.book_id = b.id
       ORDER BY r.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["Активно", "Отменена", "Выдана", "Завершена"].includes(status)) {
      return res.status(400).json({ message: "Недопустимый статус" });
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const reservation = await client.query(
        "SELECT * FROM reservations WHERE id = $1 FOR UPDATE",
        [id],
      );
      if (reservation.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Бронирование не найдено" });
      }
      const oldStatus = reservation.rows[0].status;
      const bookId = reservation.rows[0].book_id;

      await client.query("UPDATE reservations SET status = $1 WHERE id = $2", [
        status,
        id,
      ]);

      // Update book status accordingly
      if (status === "Выдана" && oldStatus === "Активно") {
        await client.query("UPDATE books SET status = 'Выдана' WHERE id = $1", [
          bookId,
        ]);
      } else if (status === "Завершена" && oldStatus === "Выдана") {
        await client.query(
          "UPDATE books SET status = 'В наличии' WHERE id = $1",
          [bookId],
        );
      } else if (status === "Отменена" && oldStatus === "Активно") {
        await client.query(
          "UPDATE books SET status = 'В наличии' WHERE id = $1",
          [bookId],
        );
      }

      await client.query("COMMIT");
      res.json({ message: "Статус обновлён" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
