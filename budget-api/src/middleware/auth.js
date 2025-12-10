const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

module.exports = (req, res, next) => {
  // Authorization header: "Bearer token..."
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header eksik" });
  }

  const parts = authHeader.split(" ");

  // "Bearer <token>" formatı kontrolü
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ error: "Geçersiz Authorization formatı. 'Bearer <token>' olmalı" });
  }

  const token = parts[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // 🔴 EN ÖNEMLİ SATIR
    req.user = payload; // { userId, email, iat, exp }
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(401).json({ error: "Geçersiz veya süresi dolmuş token" });
  }
};
