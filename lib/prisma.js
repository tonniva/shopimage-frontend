import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Priority: POOLER_URL (Session Mode) > DIRECT_URL > DATABASE_URL
// Pooler (Session Mode) รองรับ connections เยอะกว่าและรองรับ prepared statements
let databaseUrl = process.env.POOLER_URL || process.env.DIRECT_URL || process.env.DATABASE_URL;

// Add connection pool parameters
if (databaseUrl && databaseUrl.includes('postgresql://')) {
  try {
    const url = new URL(databaseUrl);
    
    // ตรวจสอบว่าใช้ Pooler หรือไม่ (port 6543 หรือมี pooler.supabase.com)
    const isUsingPooler = databaseUrl.includes('pooler.supabase.com') || url.port === '6543';
    
    if (!url.searchParams.has('connection_limit')) {
      if (isUsingPooler) {
        // Pooler (Pro Plan Large = 800 connections) - ใช้ 150 (ปลอดภัย, เหลือ buffer)
        url.searchParams.set('connection_limit', '150');
        console.log('🔌 Using Supabase Connection Pooler - Pro Plan (150/800 connections available)');
      } else {
        // Direct connection (Pro Plan Large = 160 connections) - ใช้ 100 (ปลอดภัย)
        url.searchParams.set('connection_limit', '100');
        console.log('🔌 Using Direct Database Connection - Pro Plan (100/160 connections available)');
      }
    } else {
      // Log current configuration
      const currentLimit = url.searchParams.get('connection_limit');
      if (isUsingPooler) {
        console.log(`🔌 Using Supabase Connection Pooler with custom limit: ${currentLimit}`);
      } else {
        console.log(`🔌 Using Direct Connection with custom limit: ${currentLimit}`);
      }
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