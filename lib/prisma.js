import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Use DIRECT_URL to avoid PgBouncer prepared statement conflicts
let databaseUrl = process.env.POOLER_URL || process.env.DIRECT_URL || process.env.DATABASE_URL;

// Add connection pool parameters if using DIRECT_URL
// Limit to 10 connections to avoid exceeding Supabase's 15 connection limit
// Reserve 5 connections for other processes/queries
if (databaseUrl && databaseUrl.includes('postgresql://')) {
  try {
    const url = new URL(databaseUrl);
    
    // Set connection limit (keep below 15 to avoid errors)
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', '10'); // Use max 10 out of 15 available
    }
    
    // Set pool timeout
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', '10'); // 10 seconds
    }
    
    // Set connect timeout
    if (!url.searchParams.has('connect_timeout')) {
      url.searchParams.set('connect_timeout', '10'); // 10 seconds
    }
    
    databaseUrl = url.toString();
  } catch (e) {
    console.warn('Could not parse database URL for connection pooling:', e.message);
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

// Retry helper function for connection errors (P1001)
export async function withRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      // Only retry on connection errors
      if (error.code === 'P1001' && i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i); // Exponential backoff
        console.log(`⚠️ Database connection error (P1001), retrying in ${waitTime}ms... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
}

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