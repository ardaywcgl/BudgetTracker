// src/prismaClient.js
const { PrismaClient } = require("@prisma/client");

// Singleton pattern: Tek bir PrismaClient instance'ı kullan
const prisma = new PrismaClient();

module.exports = prisma;
