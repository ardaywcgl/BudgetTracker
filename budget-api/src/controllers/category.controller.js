const prisma = require("../prismaClient");

module.exports = {
  getAll: async (req, res) => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });
      res.json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kategori listelenemedi" });
    }
  },

  create: async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Kategori adı gerekli" });
      }

      const category = await prisma.category.create({
        data: { name },
      });

      res.status(201).json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kategori oluşturulamadı" });
    }
  },

  update: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Kategori adı gerekli" });
      }

      const updated = await prisma.category.update({
        where: { id },
        data: { name },
      });

      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kategori güncellenemedi" });
    }
  },

  remove: async (req, res) => {
    try {
      const id = Number(req.params.id);

      await prisma.category.delete({
        where: { id },
      });

      res.json({ message: "Kategori silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kategori silinemedi" });
    }
  },
};
