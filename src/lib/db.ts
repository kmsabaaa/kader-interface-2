import { PrismaClient } from "@prisma/client";

// Ensure we don't leak connections in development and cap them in production
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        // We append pooling parameters to the URL if they aren't there
        url: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + 'connection_limit=10&pool_timeout=20'
      },
    },
    log: ["error", "warn"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;
