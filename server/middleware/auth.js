const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Недействительный токен" });
  }
};

module.exports.staffOnly = (req, res, next) => {
  if (!["Библиотекарь", "Администратор"].includes(req.user.role)) {
    return res.status(403).json({ message: "Доступ запрещён" });
  }
  next();
};

module.exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "Администратор") {
    return res.status(403).json({ message: "Доступ запрещён" });
  }
  next();
};
