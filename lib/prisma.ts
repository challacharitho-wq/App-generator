import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getPrismaDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  const url = new URL(databaseUrl);
  url.searchParams.set("pgbouncer", "true");
  url.searchParams.set("connection_limit", "1");

  return url.toString();
}

export function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: getPrismaDatabaseUrl(),
        },
      },
    });
  }

  return globalForPrisma.prisma;
}

export default getPrismaClient;
