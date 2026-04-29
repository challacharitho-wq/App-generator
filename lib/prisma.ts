import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL + "?pgbouncer=true&connection_limit=1",
        },
      },
    });
  }

  return globalForPrisma.prisma;
}

export default getPrismaClient;
