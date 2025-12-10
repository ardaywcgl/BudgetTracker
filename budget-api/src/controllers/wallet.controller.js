// src/controllers/wallet.controller.js
const prisma = require("../prismaClient");
const { getUserId } = require("../utils/helpers");

// GET /api/wallets
const getWallets = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı bilgisi bulunamadı" });
    }

    const wallets = await prisma.wallet.findMany({
      where: { userId: Number(userId) },
      orderBy: { id: "asc" },
    });

    return res.json(wallets);
  } catch (err) {
    console.error("getWallets error:", err);
    return res.status(500).json({
      error: "Cüzdanlar alınırken bir hata oluştu",
      message: err.message,
    });
  }
};

const ALLOWED_TYPES = ["cash", "bank_account", "credit_card"];

function parseBalance(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return num;
}

// POST /api/wallets
const createWallet = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı bilgisi bulunamadı" });
    }

    const { name, type, balance } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "name ve type zorunlu" });
    }

    if (!ALLOWED_TYPES.includes(type)) {
      return res
        .status(400)
        .json({ error: `Geçersiz type. Sadece ${ALLOWED_TYPES.join(", ")} geçerli.` });
    }

    const parsedBalance = parseBalance(balance, 0);
    if (parsedBalance === null) {
      return res.status(400).json({ error: "balance sayısal olmalı" });
    }

    const wallet = await prisma.wallet.create({
      data: {
        name,
        type,
        balance: parsedBalance,
        userId: Number(userId),
      },
    });

    return res.status(201).json(wallet);
  } catch (err) {
    console.error("createWallet error:", err);
    return res.status(500).json({
      error: "Cüzdan oluşturulurken bir hata oluştu",
      message: err.message,
      code: err.code,
      meta: err.meta,
    });
  }
};

// PUT /api/wallets/:id
const updateWallet = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { name, type, balance } = req.body || {};

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    }

    const walletId = Number(id);

    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId: Number(userId) },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Cüzdan bulunamadı" });
    }

    let updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) {
      if (!ALLOWED_TYPES.includes(type)) {
        return res
          .status(400)
          .json({ error: `Geçersiz type. Sadece ${ALLOWED_TYPES.join(", ")} geçerli.` });
      }
      updateData.type = type;
    }
    if (balance !== undefined) {
      const parsedBalance = parseBalance(balance, wallet.balance);
      if (parsedBalance === null) {
        return res.status(400).json({ error: "balance sayısal olmalı" });
      }
      updateData.balance = parsedBalance;
    }

    const updated = await prisma.wallet.update({
      where: { id: walletId },
      data: updateData,
    });

    return res.json(updated);
  } catch (err) {
    console.error("updateWallet error:", err);
    return res.status(500).json({
      error: "Cüzdan güncellenirken bir hata oluştu",
      message: err.message,
      code: err.code,
      meta: err.meta,
    });
  }
};

// DELETE /api/wallets/:id
const deleteWallet = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    }

    const walletId = Number(id);

    // Önce gerçekten sana ait bir cüzdan mı kontrol et
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId: Number(userId) },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Cüzdan bulunamadı" });
    }

    // Bu cüzdana bağlı kayıtları sil (Record tablosunda walletId var)
    await prisma.record.deleteMany({
      where: { walletId: walletId },
    });

    // Son olarak cüzdanı sil
    await prisma.wallet.delete({
      where: { id: walletId },
    });

    return res.json({ message: "Cüzdan ve ona bağlı kayıtlar silindi" });
  } catch (err) {
    console.error("deleteWallet error:", err);
    return res.status(500).json({
      error: "Cüzdan silinirken bir hata oluştu",
      message: err.message,
      code: err.code,
      meta: err.meta,
    });
  }
};
module.exports = {
  getWallets,
  createWallet,
  deleteWallet,
  updateWallet,
};
