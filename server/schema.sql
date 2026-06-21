CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'Читатель' CHECK (role IN ('Читатель', 'Библиотекарь', 'Администратор')),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address VARCHAR(500),
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  year INTEGER,
  isbn VARCHAR(50) UNIQUE,
  cover_url TEXT,
  status VARCHAR(50) DEFAULT 'В наличии' CHECK (status IN ('В наличии', 'Забронирована', 'Выдана', 'Недоступна')),
  description TEXT,
  popularity INTEGER DEFAULT 0
);

CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'Активно' CHECK (status IN ('Активно', 'Отменена', 'Выдана', 'Завершена')),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '3 days')
);