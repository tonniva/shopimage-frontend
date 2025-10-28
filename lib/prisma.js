import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Use DIRECT_URL to avoid PgBouncer prepared statement conflicts
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Clean disconnect on module reload
if (process.env.NODE_ENV === 'development') {
  if (module.hot) {
    module.hot.dispose(async () => {
      await prisma.$disconnect();
    });
  }
}