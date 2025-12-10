const prisma = require("../prismaClient");

module.exports = {
  monthly: async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Kullanıcı bulunamadı (token yok veya geçersiz)" });
      }

      const now = new Date();
      const year = req.query.year ? Number(req.query.year) : now.getFullYear();
      const month = req.query.month
        ? Number(req.query.month)
        : now.getMonth() + 1;

      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);

      const records = await prisma.record.findMany({
        where: {
          userId,
          date: { gte: start, lt: end },
        },
        include: { category: true },
      });

      let totalIncome = 0;
      let totalExpense = 0;

      const byCategoryMap = new Map();

      for (const r of records) {
        if (r.type === "income") totalIncome += r.amount;
        if (r.type === "expense") totalExpense += r.amount;

        const key = r.categoryId;
        if (!byCategoryMap.has(key)) {
          byCategoryMap.set(key, {
            categoryId: r.categoryId,
            categoryName: r.category?.name ?? "Bilinmiyor",
            income: 0,
            expense: 0,
          });
        }
        const item = byCategoryMap.get(key);
        if (r.type === "income") item.income += r.amount;
        if (r.type === "expense") item.expense += r.amount;
      }

      const byCategory = Array.from(byCategoryMap.values()).map((c) => ({
        ...c,
        net: c.income - c.expense,
      }));

      res.json({
        year,
        month,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        byCategory,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Özet alınamadı" });
    }
  },
};
