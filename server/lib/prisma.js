let prisma = null;

try {
  const { PrismaClient } = require("@prisma/client");
  const globalForPrisma = globalThis;

  prisma =
    globalForPrisma.__prismaClient ||
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__prismaClient = prisma;
  }
} catch (error) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("[prisma] Prisma client initialization skipped:", error.message);
  }
}

module.exports = { prisma };
