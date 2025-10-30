import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Priority: DIRECT_URL > POOLER_URL (Session Mode) > DATABASE_URL
// IMPORTANT: Prisma มีปัญหา prepared statements กับ Pooler (ทั้ง Session และ Transaction Mode)
// แนะนำให้ใช้ DIRECT_URL เป็นหลัก เพื่อหลีกเลี่ยงปัญหา prepared statements

// IMPORTANT: ปัญหา prepared statements (42P05, 26000) เกิดจาก Pooler
// วิธีแก้ที่ดีที่สุด: ใช้ DIRECT_URL แทน POOLER_URL

let directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
let poolerUrl = process.env.POOLER_URL;
// ใช้ DIRECT_URL เป็นหลักเพื่อหลีกเลี่ยงปัญหา prepared statements
let databaseUrl = directUrl || poolerUrl;

// ตรวจสอบและแก้ไข Transaction Mode (pgbouncer=true) → ต้องใช้ Session Mode
if (databaseUrl && databaseUrl.includes('postgresql://')) {
  try {
    const url = new URL(databaseUrl);
    
    // ถ้ามี pgbouncer=true (Transaction Mode) → ไม่รองรับ prepared statements
    // เปลี่ยนเป็น Session Mode (ลบ pgbouncer=true) หรือใช้ Direct URL
    if (url.searchParams.get('pgbouncer') === 'true') {
      console.warn('⚠️ WARNING: Found pgbouncer=true (Transaction Mode) - Not compatible with Prisma prepared statements!');
      console.warn('⚠️ Removing pgbouncer=true parameter and using Session Mode instead');
      
      // ลบ pgbouncer=true
      url.searchParams.delete('pgbouncer');
      
      // ถ้าไม่มี connection string อื่น หรือต้องการใช้ direct URL
      if (directUrl && !poolerUrl) {
        console.warn('⚠️ Falling back to DIRECT_URL to avoid prepared statement errors');
        databaseUrl = directUrl;
      } else {
        databaseUrl = url.toString();
        console.log('✅ Fixed: Using Session Mode (removed pgbouncer=true)');
      }
    }
    
    // แปลง URL string เป็น URL object อีกครั้ง (ถ้า databaseUrl เปลี่ยน)
    const finalUrl = new URL(databaseUrl);
    
    // ตรวจสอบว่าใช้ Pooler หรือไม่ (port 6543 หรือมี pooler.supabase.com)
    const isUsingPooler = databaseUrl.includes('pooler.supabase.com') || finalUrl.port === '6543';
    
    if (!finalUrl.searchParams.has('connection_limit')) {
      if (isUsingPooler) {
        // Pooler (Pro Plan Large = 800 connections) - ใช้ 150 (ปลอดภัย, เหลือ buffer)
        finalUrl.searchParams.set('connection_limit', '150');
        console.warn('⚠️ Using Supabase Connection Pooler - Prisma อาจมีปัญหา prepared statements');
        console.warn('⚠️ แนะนำให้ใช้ DIRECT_URL แทน POOLER_URL');
        console.log('🔌 Using Supabase Connection Pooler (Session Mode) - Pro Plan (150/800 connections available)');
      } else {
        // Direct connection (Pro Plan Large = 160 connections) - ใช้ 100 (ปลอดภัย)
        finalUrl.searchParams.set('connection_limit', '100');
        console.log('✅ Using Direct Database Connection - Pro Plan (100/160 connections available)');
        console.log('✅ Direct URL ไม่มีปัญหา prepared statements - Recommended!');
      }
    } else {
      // Log current configuration
      const currentLimit = finalUrl.searchParams.get('connection_limit');
      if (isUsingPooler) {
        console.warn(`⚠️ Using Supabase Connection Pooler with custom limit: ${currentLimit}`);
        console.warn('⚠️ แนะนำให้ใช้ DIRECT_URL แทน POOLER_URL');
      } else {
        console.log(`✅ Using Direct Connection with custom limit: ${currentLimit} - Recommended!`);
      }
    }
    
    // Set pool timeout
    if (!finalUrl.searchParams.has('pool_timeout')) {
      finalUrl.searchParams.set('pool_timeout', '10'); // 10 seconds
    }
    
    // Set connect timeout
    if (!finalUrl.searchParams.has('connect_timeout')) {
      finalUrl.searchParams.set('connect_timeout', '10'); // 10 seconds
    }
    
    // ตรวจสอบอีกครั้งว่าไม่มี pgbouncer=true
    if (finalUrl.searchParams.get('pgbouncer') === 'true') {
      finalUrl.searchParams.delete('pgbouncer');
      console.warn('⚠️ Removed pgbouncer=true parameter (not compatible with Prisma)');
    }
    
    databaseUrl = finalUrl.toString();
  } catch (e) {
    console.warn('Could not parse database URL for connection pooling:', e.message);
  }
}

// Prisma Client configuration
// IMPORTANT: ต้องใช้ Session Mode หรือ Direct URL เท่านั้น (ไม่ใช่ Transaction Mode)
let prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

// Export prisma with getter to ensure we always get the latest instance
export const prisma = new Proxy({}, {
  get: (target, prop) => {
    return prismaInstance[prop];
  }
});

// Force reconnect function to reset connection pool and clear prepared statements
async function forceReconnect() {
  try {
    console.log('🔄 Force disconnecting Prisma client to reset connection pool...');
    await prismaInstance.$disconnect();
    
    // Wait a bit before reconnecting
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Recreate Prisma client
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
    
    // Update global reference
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaInstance;
    }
    
    console.log('✅ Prisma client reconnected successfully');
  } catch (reconnectError) {
    console.error('❌ Error during force reconnect:', reconnectError);
    // Continue anyway - Prisma will create connection on next query
  }
}

// Retry helper function for connection errors (P1001) และ prepared statement errors (42P05)
export async function withRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      // Retry on connection errors (P1001)
      if (error.code === 'P1001' && i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i); // Exponential backoff
        console.log(`⚠️ Database connection error (P1001), retrying in ${waitTime}ms... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Retry on pool timeout (P2024: Timed out fetching a new connection)
      if (error.code === 'P2024' && i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i);
        console.warn(`⚠️ Pool timeout (P2024): waiting ${waitTime}ms then retry (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Retry on prepared statement errors (42P05, 26000) - เกิดจาก Pooler
      // 42P05: "prepared statement already exists" - Transaction Mode
      // 26000: "prepared statement does not exist" - Session Mode (after reconnect)
      const isPreparedStatementError = 
        error.code === '42P05' || 
        error.code === '26000' ||
        (error.message && error.message.includes('prepared statement'));
      
      if (isPreparedStatementError && i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i);
        console.error(`⚠️ Prepared statement error (${error.code || 'UNKNOWN'}) detected - Attempt ${i + 1}/${maxRetries}`);
        
        if (error.code === '42P05') {
          console.error(`⚠️ Error: "prepared statement already exists" - Transaction Mode (pgbouncer=true)`);
        } else if (error.code === '26000') {
          console.error(`⚠️ Error: "prepared statement does not exist" - Pooler issue after reconnect`);
        } else {
          console.error(`⚠️ Error: Prepared statement issue detected`);
        }
        
        console.error(`⚠️ SOLUTION: ใช้ DIRECT_URL แทน POOLER_URL ใน Vercel Environment Variables`);
        console.error(`⚠️ Force reconnecting to reset connection pool...`);
        
        // Force reconnect to clear prepared statements cache
        await forceReconnect();
        
        console.error(`⚠️ Retrying query in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      } else if (isPreparedStatementError) {
        // Last retry failed - throw with helpful message
        console.error(`❌ All retry attempts failed for prepared statement error`);
        throw new Error(
          'Prepared statement error - Please fix connection URL:\n' +
          '1. ใช้ DIRECT_URL แทน POOLER_URL ใน Vercel Environment Variables (แนะนำ)\n' +
          '2. หรือลบ POOLER_URL และใช้แค่ DIRECT_URL\n' +
          '3. DIRECT_URL ไม่มีปัญหา prepared statements\n' +
          `Original error: ${error.message || error.code}`
        );
      }
      
      throw error;
    }
  }
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaInstance;
}

// Clean disconnect on module reload
if (process.env.NODE_ENV === 'development') {
  if (module.hot) {
    module.hot.dispose(async () => {
      await prisma.$disconnect();
    });
  }
}