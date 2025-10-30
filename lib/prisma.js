import { PrismaClient } from "@prisma/client";

// ✅ ใช้ global singleton กัน memory leak (Next.js dev reload)
const globalForPrisma = globalThis;

// ✅ ลำดับการเลือก connection
//    1. POOLER_URL (6543) ถ้ามี
//    2. DIRECT_URL (5432)
//    3. DATABASE_URL (default)
let databaseUrl =
  process.env.POOLER_URL ||
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("❌ No DATABASE_URL or DIRECT_URL found in environment variables");
}

try {
  // ✅ ตรวจว่าเป็น URL จริง
  const url = new URL(databaseUrl);

  // ✅ ตรวจว่าใช้ Pooler หรือ Direct
  const isUsingPooler =
    databaseUrl.includes("pooler.supabase.com") || url.port === "6543";

  // ✅ ตั้งค่า connection_limit
  if (!url.searchParams.has("connection_limit")) {
    if (isUsingPooler) {
      url.searchParams.set("connection_limit", "10"); // ปลอดภัยกว่า 150 สำหรับ Vercel
      console.log("🔌 Using Supabase Pooler (limit=10)");
    } else {
      url.searchParams.set("connection_limit", "5");
      console.log("🔌 Using Direct DB Connection (limit=5)");
    }
  }

  // ✅ ตั้งค่า timeout และ ssl
  url.searchParams.set("pool_timeout", "15");
  url.searchParams.set("connect_timeout", "15");
  url.searchParams.set("sslmode", "require");

  databaseUrl = url.toString();
} catch (e) {
  console.warn("⚠️ Could not parse database URL:", e.message);
}

// ✅ ใช้ Prisma singleton (แค่ตัวเดียว)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
    datasources: {
      db: { url: databaseUrl },
    },
  });

// ✅ เก็บไว้ใน global (เฉพาะ dev)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ✅ helper สำหรับ retry connection error (P1001)
export async function withRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === "P1001" && i < maxRetries - 1) {
        const wait = delay * Math.pow(2, i);
        console.log(
          `⚠️ Prisma connection failed (P1001), retrying in ${wait}ms (${i + 1}/${maxRetries})`
        );
        await new Promise((res) => setTimeout(res, wait));
        continue;
      }
      throw error;
    }
  }
  throw new Error("❌ Database connection failed after retries");
}

// ✅ ปิด connection เวลา hot reload (เฉพาะ dev)
if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.dispose(async () => {
    await prisma.$disconnect();
  });
}