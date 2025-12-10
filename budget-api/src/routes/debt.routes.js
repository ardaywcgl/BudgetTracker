// src/routes/debt.routes.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const debtController = require("../controllers/debt.controller");

// Spesifik route'lar önce tanımlanmalı (genel route'lardan önce)
// POST /api/debts/:id/payments
router.post("/:id/payments", auth, debtController.addDebtPayment);

// POST /api/debts/:id/simulate
router.post("/:id/simulate", auth, debtController.simulateDebt);

// Genel route'lar
// GET /api/debts
router.get("/", auth, debtController.getDebts);

// POST /api/debts
router.post("/", auth, debtController.createDebt);

// DELETE /api/debts/:id
router.delete("/:id", auth, debtController.deleteDebt);

module.exports = router;
