// src/routes/wallet.routes.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const walletController = require("../controllers/wallet.controller");

// GET /api/wallets
router.get("/", auth, walletController.getWallets);

// POST /api/wallets
router.post("/", auth, walletController.createWallet);

// PUT /api/wallets/:id
router.put("/:id", auth, walletController.updateWallet);

// DELETE /api/wallets/:id
router.delete("/:id", auth, walletController.deleteWallet);

module.exports = router;
