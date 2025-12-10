const express = require("express");
const router = express.Router();
const RecordController = require("../controllers/record.controller");
const auth = require("../middleware/auth");

// Kullanıcının tüm kayıtları (isteğe bağlı filtre ile)
router.get("/", auth, RecordController.getAll);

// Tek kayıt
router.get("/:id", auth, RecordController.getOne);

// Yeni kayıt
router.post("/", auth, RecordController.create);

// Kayıt güncelle
router.put("/:id", auth, RecordController.update);

// Kayıt sil
router.delete("/:id", auth, RecordController.remove);

module.exports = router;
