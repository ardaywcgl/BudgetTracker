const prisma = require("../prismaClient");

module.exports = {
  // Tüm kayıtlar (isteğe bağlı ay/yıl filtreli)
  getAll: async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Kullanıcı bulunamadı (token yok veya geçersiz)" });
      }

      const { year, month } = req.query;

      let where = { userId };

      if (year && month) {
        const y = Number(year);
        const m = Number(month);
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 1);
        where.date = { gte: start, lt: end };
      }

      const records = await prisma.record.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
      });

      res.json(records);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kayıtlar alınamadı" });
    }
  },

  // Tek kayıt
  getOne: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const id = Number(req.params.id);

      const record = await prisma.record.findFirst({
        where: { id, userId },
        include: { category: true },
      });

      if (!record) {
        return res.status(404).json({ error: "Kayıt bulunamadı" });
      }

      res.json(record);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kayıt alınamadı" });
    }
  },

  // Yeni kayıt
  create: async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Kullanıcı bulunamadı (token yok veya geçersiz)" });
      }

      const { amount, type, note, date, categoryId } = req.body;

      if (!amount || !type || !date || !categoryId) {
        return res.status(400).json({ error: "Eksik alanlar var" });
      }

      const newRecord = await prisma.record.create({
        data: {
          amount: parseFloat(amount),
          type,
          note,
          date: new Date(date),
          categoryId: Number(categoryId),
          userId: Number(userId),
        },
      });

      res.status(201).json(newRecord);
    } catch (error) {
      console.error(error);
      if (error.code === "P2003") {
        return res
          .status(400)
          .json({ error: "Kategori veya kullanıcı bulunamadı" });
      }
      res.status(500).json({ error: "Kayıt oluşturulamadı" });
    }
  },

  // Kayıt güncelle
  update: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const id = Number(req.params.id);
      const { amount, type, note, date, categoryId } = req.body;

      const existing = await prisma.record.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return res.status(404).json({ error: "Kayıt bulunamadı" });
      }

      const updated = await prisma.record.update({
        where: { id },
        data: {
          amount: amount !== undefined ? parseFloat(amount) : existing.amount,
          type: type ?? existing.type,
          note: note ?? existing.note,
          date: date ? new Date(date) : existing.date,
          categoryId:
            categoryId !== undefined ? Number(categoryId) : existing.categoryId,
        },
      });

      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kayıt güncellenemedi" });
    }
  },

  // Kayıt sil
  remove: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const id = Number(req.params.id);

      const existing = await prisma.record.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return res.status(404).json({ error: "Kayıt bulunamadı" });
      }

      await prisma.record.delete({
        where: { id },
      });

      res.json({ message: "Kayıt silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kayıt silinemedi" });
    }
  },
};
