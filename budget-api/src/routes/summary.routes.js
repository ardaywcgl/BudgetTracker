const express = require("express");
const router = express.Router();
const SummaryController = require("../controllers/summary.controller");
const auth = require("../middleware/auth");

// Aylık özet + kategori bazlı özet
router.get("/monthly", auth, SummaryController.monthly);

module.exports = router;
