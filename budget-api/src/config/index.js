// src/config/index.js
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn(
    "⚠️  UYARI: JWT_SECRET environment variable tanımlı değil! 'dev_secret' kullanılıyor. Production'da mutlaka güçlü bir secret tanımlayın!"
  );
}

module.exports = {
  JWT_SECRET: JWT_SECRET || "dev_secret",
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || "file:./prisma/dev.db",
  NODE_ENV: process.env.NODE_ENV || "development",
};

