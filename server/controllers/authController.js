const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const fs = require("fs");
const path = require("path");

const generateAvatarDataUrl = (name) => {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  const bg = "%23a78bfa"; // purple-400 hex (escaped # as %23 for URL encoding)
  const fg = "%23ffffff";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' dy='0.35em' text-anchor='middle' font-family='Inter, Roboto, Arial, sans-serif' font-size='110' fill='${fg}'>${letter}</text></svg>`;
  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
};

exports.register = async (req, res) => {
  try {
    const { email, password, name, phone, address, photo_url } = req.body;
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Email, пароль и имя обязательны" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Пароль должен содержать не менее 6 символов" });
    }
    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "Email уже используется" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const avatarToSave =
      photo_url && photo_url.trim() !== ""
        ? photo_url
        : generateAvatarDataUrl(name);
    const result = await pool.query(
      "INSERT INTO users (email, password, role, name, phone, address, photo_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, role, name, phone, address, photo_url",
      [
        email,
        hashed,
        "Читатель",
        name,
        phone || "",
        address || "",
        avatarToSave,
      ],
    );
    const user = result.rows[0];
    // автоматически логиним (выдаём токен)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        address: user.address,
        photo_url: user.photo_url,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role, name, phone, address, photo_url FROM users WHERE id = $1",
      [req.user.id],
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

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, photo_url } = req.body;
    const result = await pool.query(
      "UPDATE users SET name = $1, phone = $2, address = $3, photo_url = $4 WHERE id = $5 RETURNING id, email, role, name, phone, address, photo_url",
      [name, phone || "", address || "", photo_url || "", req.user.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Пользователь не найден" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const { filename, data } = req.body || {};
    if (!filename || !data)
      return res.status(400).json({ message: "filename and data required" });

    const uploadDir = path.join(__dirname, "..", "public", "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });

    const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(uploadDir, safeName);

    // strip data url prefix if present
    const base64 = data.replace(/^data:.*;base64,/, "");
    // simple size guard: base64 length roughly 4/3 of binary
    const maxBase64Length = 6 * 1024 * 1024; // ~6MB base64 (~4.5MB binary)
    if (base64.length > maxBase64Length) {
      return res
        .status(413)
        .json({ message: "Файл слишком большой (макс ~5MB)" });
    }

    const buffer = Buffer.from(base64, "base64");

    // detect mime type from data prefix if present
    const mimeMatch = (data.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/) ||
      [])[1];
    const allowed = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
    ];
    if (mimeMatch && !allowed.includes(mimeMatch)) {
      return res.status(415).json({ message: "Неподдерживаемый тип файла" });
    }

    // Try to optimize/resize image if sharp is available
    let finalName = safeName;
    try {
      let sharp;
      try {
        sharp = require("sharp");
      } catch (e) {
        sharp = null;
      }

      if (sharp) {
        // determine output extension
        const outName = safeName.replace(/\.[^.]+$/, "") + ".webp";
        const outPath = path.join(uploadDir, outName);
        await sharp(buffer)
          .resize({ width: 1400, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(outPath);
        finalName = outName;
      } else {
        // fallback: write original buffer
        fs.writeFileSync(filePath, buffer);
      }
    } catch (e) {
      console.error("Image processing failed, saving original:", e);
      // attempt to save original if processing fails
      try {
        fs.writeFileSync(filePath, buffer);
      } catch (writeErr) {
        console.error("Failed to save uploaded file:", writeErr);
        return res.status(500).json({ message: "Не удалось сохранить файл" });
      }
    }

    const url = `${req.protocol}://${req.get("host")}/uploads/${finalName}`;
    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка при загрузке файла" });
  }
};
