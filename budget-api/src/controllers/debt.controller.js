// src/controllers/debt.controller.js
const prisma = require("../prismaClient");
const { simulateLoan, simulateCreditCard } = require("../services/debt.service");
const { getUserId } = require("../utils/helpers");

// GET /api/debts  → sadece giriş yapan kullanıcının borçları
const getDebts = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    }

    const debts = await prisma.debt.findMany({
      where: { userId: Number(userId) },
      include: {
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(debts);
  } catch (err) {
    console.error("getDebts error:", err);
    return res
      .status(500)
      .json({ error: "Borçlar alınırken bir hata oluştu", message: err.message });
  }
};

// POST /api/debts  → kullanıcıya ait yeni borç oluştur
const createDebt = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı bulunamadı (userId yok)" });
    }

    console.log("createDebt body:", req.body);

    let {
      name,
      type,            // "loan" | "credit_card"
      principal,
      interestRate,
      termMonths,
      minPaymentRate,
    } = req.body || {};

    if (!name || !type || principal == null || interestRate == null) {
      return res.status(400).json({ error: "Eksik alanlar var" });
    }

    const allowedTypes = ["loan", "credit_card"];
    if (!allowedTypes.includes(type)) {
      return res
        .status(400)
        .json({ error: `Geçersiz type. Sadece ${allowedTypes.join(", ")} geçerli.` });
    }

    principal = Number(principal);
    interestRate = Number(interestRate);
    if (termMonths != null) termMonths = Number(termMonths);
    if (minPaymentRate != null) minPaymentRate = Number(minPaymentRate);

    const debt = await prisma.debt.create({
      data: {
        name,
        type,
        principal,
        interestRate,
        termMonths: type === "loan" ? termMonths : null,
        minPaymentRate: type === "credit_card" ? minPaymentRate : null,
        currentBalance: principal,
        userId: Number(userId),
      },
    });

    return res.status(201).json(debt);
  } catch (err) {
    console.error("createDebt error:", err);
    return res.status(500).json({
      error: "Borç oluşturulurken bir hata oluştu",
      message: err.message,
      code: err.code,
      meta: err.meta,
    });
  }
};

// POST /api/debts/:id/payments  → borca ödeme ekle
const addDebtPayment = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { amount } = req.body || {};

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    }

    if (!amount || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ error: "Geçerli bir ödeme tutarı gir" });
    }

    const debt = await prisma.debt.findFirst({
      where: { id: Number(id), userId: Number(userId) },
    });

    if (!debt) {
      return res.status(404).json({ error: "Borç bulunamadı" });
    }

    const numericAmount = Number(amount);

    const payment = await prisma.debtPayment.create({
      data: {
        debtId: debt.id,
        amount: numericAmount,
      },
    });

    const newBalance = Number(debt.currentBalance) - numericAmount;

    await prisma.debt.update({
      where: { id: debt.id },
      data: { currentBalance: newBalance < 0 ? 0 : newBalance },
    });

    return res.status(201).json({ payment, newBalance });
  } catch (err) {
    console.error("addDebtPayment error:", err);
    return res.status(500).json({
      error: "Ödeme eklenirken bir hata oluştu",
      message: err.message,
      code: err.code,
      meta: err.meta,
    });
  }
};

// POST /api/debts/:id/simulate  → borç simülasyonu
const simulateDebt = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { monthlyPayment } = req.body || {};

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    }

    const debt = await prisma.debt.findFirst({
      where: { id: Number(id), userId: Number(userId) },
    });

    if (!debt) {
      return res.status(404).json({ error: "Borç bulunamadı" });
    }

    if (debt.type === "loan") {
      const result = simulateLoan({
        principal: Number(debt.currentBalance ?? debt.principal),
        interestRate: Number(debt.interestRate),
        termMonths: debt.termMonths || 12,
      });

      return res.json({
        type: "loan",
        ...result,
      });
    }

    if (!monthlyPayment) {
      return res
        .status(400)
        .json({ error: "monthlyPayment alanı gerekli" });
    }

    const result = simulateCreditCard({
      balance: Number(debt.currentBalance ?? debt.principal),
      monthlyInterestRate: Number(debt.interestRate),
      monthlyPayment: Number(monthlyPayment),
    });

    return res.json({
      type: "credit_card",
      ...result,
    });
  } catch (err) {
    console.error("simulateDebt error:", err);
    return res.status(500).json({
      error: "Borç simülasyonu yapılırken bir hata oluştu",
      message: err.message,
      code: err.code,
      meta: err.meta,
    });
  }
};
// DELETE /api/debts/:id
const deleteDebt = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    }

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "Geçersiz borç ID'si" });
    }

    const debtId = Number(id);

    // Bu borç gerçekten bu kullanıcıya mı ait?
    const debt = await prisma.debt.findFirst({
      where: { id: debtId, userId: Number(userId) },
      include: {
        payments: true,
      },
    });

    if (!debt) {
      return res.status(404).json({ error: "Borç bulunamadı veya bu borç size ait değil" });
    }

    // Önce bu borca bağlı ödemeleri sil
    if (debt.payments && debt.payments.length > 0) {
      await prisma.debtPayment.deleteMany({
        where: { debtId: debtId },
      });
    }

    // Sonra borcun kendisini sil
    await prisma.debt.delete({
      where: { id: debtId },
    });

    return res.json({ message: "Borç ve ödemeleri başarıyla silindi" });
  } catch (err) {
    console.error("deleteDebt error:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      meta: err.meta,
      stack: err.stack,
    });
    return res.status(500).json({
      error: "Borç silinirken bir hata oluştu",
      message: err.message,
      code: err.code,
      meta: err.meta,
    });
  }
};


module.exports = {
  getDebts,
  createDebt,
  addDebtPayment,
  simulateDebt,
  deleteDebt,
};
