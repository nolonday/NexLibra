const pool = require("./db");
const bcrypt = require("bcrypt");

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Очистка таблиц (осторожно!)
    await client.query("DELETE FROM reservations");
    await client.query("DELETE FROM books");
    await client.query("DELETE FROM users");

    // Создаём пользователей
    const adminPass = await bcrypt.hash("admin123", 10);
    const libPass = await bcrypt.hash("lib123", 10);
    const userPass = await bcrypt.hash("user123", 10);

    const users = await client.query(
      `
      INSERT INTO users (email, password, role, name, phone, address, photo_url) VALUES
      ('admin@lib.ru', $1, 'Администратор', 'Главный Админ', '+7 (900) 000-0000', '', ''),
      ('lib@lib.ru', $2, 'Библиотекарь', 'Анна Сотрудник', '+7 (900) 111-1111', '', ''),
      ('user@lib.ru', $3, 'Читатель', 'Иван Петров', '+7 (900) 222-2222', '', '')
      RETURNING id
    `,
      [adminPass, libPass, userPass],
    );

    // Книги
    await client.query(`
      INSERT INTO books (title, author, genre, year, isbn, status, description, popularity) VALUES
      ('Мастер и Маргарита', 'Михаил Булгаков', 'Роман', 1966, '978-5-699-12014-7', 'В наличии', 'Один из самых известных романов XX века...', 95),
      ('1984', 'Джордж Оруэлл', 'Антиутопия', 1949, '978-0-452-28423-4', 'Забронирована', 'История о тоталитарном обществе...', 90),
      ('Преступление и наказание', 'Фёдор Достоевский', 'Роман', 1866, '978-5-389-04946-9', 'В наличии', 'Психологический роман о бедном студенте...', 88),
      ('Война и мир', 'Лев Толстой', 'Роман-эпопея', 1869, '978-5-17-087910-6', 'Выдана', 'Масштабное повествование...', 85),
      ('Убить пересмешника', 'Харпер Ли', 'Роман', 1960, '978-0-06-112008-4', 'В наличии', 'Трогательная история о расовых предрассудках...', 82)
    `);

    await client.query("COMMIT");
    console.log("Seed completed");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
