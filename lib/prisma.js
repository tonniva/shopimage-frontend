import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Add pgbouncer parameter to disable prepared statements in development
const databaseUrl = process.env.DATABASE_URL + (
  process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL.includes('pgbouncer=true')
    ? (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1'
    : ''
);

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