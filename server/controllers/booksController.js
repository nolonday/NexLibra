const pool = require("../db");

exports.getBooks = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 12,
      search,
      genre,
      sort,
      year_from,
      year_to,
      status,
    } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    let query = "SELECT * FROM books WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR author ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (genre) {
      query += ` AND genre = $${paramIndex}`;
      params.push(genre);
      paramIndex++;
    }

    if (year_from) {
      query += ` AND year >= $${paramIndex}`;
      params.push(parseInt(year_from));
      paramIndex++;
    }
    if (year_to) {
      query += ` AND year <= $${paramIndex}`;
      params.push(parseInt(year_to));
      paramIndex++;
    }

    if (status && status !== "Все") {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    let orderClause = " ORDER BY id DESC";
    if (sort === "popular") orderClause = " ORDER BY popularity DESC";
    if (sort === "alpha") orderClause = " ORDER BY title ASC";
    if (sort === "new") orderClause = " ORDER BY year DESC NULLS LAST";

    const countQuery = `SELECT COUNT(*) FROM (${query}) AS filtered`;
    const totalRes = await pool.query(countQuery, params);
    const totalItems = parseInt(totalRes.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const offset = (page - 1) * limit;
    query += orderClause + ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const books = result.rows.map((b) => {
      let gallery = [];
      try {
        if (b.cover_url) {
          const parsed = JSON.parse(b.cover_url);
          if (Array.isArray(parsed)) gallery = parsed;
          else gallery = [String(b.cover_url)];
        }
      } catch (e) {
        if (b.cover_url) gallery = [b.cover_url];
      }
      return { ...b, gallery_urls: gallery };
    });

    res.json({ books, totalPages, page, totalItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.getYears = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT MIN(year) as min_year, MAX(year) as max_year FROM books WHERE year IS NOT NULL",
    );
    const min = result.rows[0].min_year;
    const max = result.rows[0].max_year;
    res.json({
      minYear: min || 1900,
      maxYear: max || new Date().getFullYear(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Книга не найдена" });
    }
    const b = result.rows[0];
    let gallery = [];
    try {
      if (b.cover_url) {
        const parsed = JSON.parse(b.cover_url);
        if (Array.isArray(parsed)) gallery = parsed;
        else gallery = [String(b.cover_url)];
      }
    } catch (e) {
      if (b.cover_url) gallery = [b.cover_url];
    }
    res.json({ ...b, gallery_urls: gallery });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.getGenres = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL",
    );
    res.json({ genres: result.rows.map((row) => row.genre) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      author,
      genre,
      year,
      isbn,
      cover_url,
      status,
      description,
      popularity,
    } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(title);
    }
    if (author !== undefined) {
      fields.push(`author = $${idx++}`);
      values.push(author);
    }
    if (genre !== undefined) {
      fields.push(`genre = $${idx++}`);
      values.push(genre);
    }
    if (year !== undefined) {
      fields.push(`year = $${idx++}`);
      values.push(year);
    }
    if (isbn !== undefined) {
      fields.push(`isbn = $${idx++}`);
      values.push(isbn);
    }
    if (cover_url !== undefined) {
      fields.push(`cover_url = $${idx++}`);
      values.push(cover_url);
    }
    if (req.body.gallery_urls !== undefined) {
      fields.push(`cover_url = $${idx++}`);
      values.push(JSON.stringify(req.body.gallery_urls || []));
    }
    if (status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(status);
    }
    if (description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (popularity !== undefined) {
      fields.push(`popularity = $${idx++}`);
      values.push(popularity);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "Нет данных для обновления" });
    }

    values.push(id);
    const query = `UPDATE books SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Книга не найдена" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      year,
      isbn,
      cover_url,
      description,
      popularity,
    } = req.body;
    if (!title || !author) {
      return res.status(400).json({ message: "Название и автор обязательны" });
    }
    const finalCover = req.body.gallery_urls
      ? JSON.stringify(req.body.gallery_urls)
      : cover_url;
    const result = await pool.query(
      `INSERT INTO books (title, author, genre, year, isbn, cover_url, status, description, popularity)
       VALUES ($1, $2, $3, $4, $5, $6, 'В наличии', $7, $8) RETURNING *`,
      [
        title,
        author,
        genre,
        year,
        isbn,
        finalCover,
        description,
        popularity || 0,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM books WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Книга не найдена" });
    }
    res.json({ message: "Книга удалена", book: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
