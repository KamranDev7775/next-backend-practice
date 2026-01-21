import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaClient: PrismaClient;

try {
  prismaClient = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ["query", "error"] : ["error"]
  });
} catch (error) {
  console.error('Prisma client initialization failed:', error);
  throw error;
}

export const prisma = globalForPrisma.prisma ?? prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
