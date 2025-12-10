// src/app.js
const express = require("express");
const cors = require("cors");

const summaryRoutes  = require("./routes/summary.routes");
const authRoutes     = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const recordRoutes   = require("./routes/record.routes");
const walletRoutes   = require("./routes/wallet.routes");
const debtRoutes     = require("./routes/debt.routes");

const app = express(); // ✅ ÖNCE app'i OLUŞTUR

app.use(cors());
app.use(express.json());

// ✅ SONRA app.use'lar
app.use("/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/debts", debtRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Budget API çalışıyor!" });
});

module.exports = app;
