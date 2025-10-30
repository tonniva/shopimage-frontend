import { PrismaClient } from "@prisma/client";

// ✅ เก็บ instance เดียวใน global เพื่อกันสร้าง PrismaClient ซ้ำเวลา hot reload
const globalForPrisma = globalThis;

let databaseUrl =
  process.env.POOLER_URL ||
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("❌ No DATABASE_URL found in environment variables");
}

// ✅ ตรวจและเติม parameter ที่จำเป็น
if (databaseUrl.includes("postgresql://")) {
  try {
    const url = new URL(databaseUrl);

    // ตรวจว่าเป็น Pooler หรือไม่
    const isUsingPooler =
      databaseUrl.includes("pooler.supabase.com") || url.port === "6543";

    // ตั้ง connection limit
    if (!url.searchParams.has("connection_limit")) {
      if (isUsingPooler) {
        url.searchParams.set("connection_limit", "150");
        console.log("🔌 Using Supabase Connection Pooler (limit=150)");
      } else {
        url.searchParams.set("connection_limit", "100");
        console.log("🔌 Using Direct DB Connection (limit=100)");
      }
    }

    // timeout และ SSL
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "10");
    }
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "10");
    }
    if (!url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "require");
    }

    // แปลงกลับเป็น string
    databaseUrl = url.toString();
  } catch (e) {
    console.warn("⚠️ Could not parse database URL:", e.message);
  }
}

// ✅ สร้าง Prisma client ตัวเดียว (re-use ได้)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    datasources: {
      db: { url: databaseUrl },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ✅ helper สำหรับ retry ถ้า Prisma ต่อ DB ไม่ได้
export async function withRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === "P1001" && i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i);
        console.log(
          `⚠️ Prisma connection failed (P1001), retrying in ${waitTime}ms (${i + 1}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  throw new Error("❌ Database connection failed after retries");
}

// ✅ ปิด connection ตอน reload ใน dev mode
if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.dispose(async () => {
    await prisma.$disconnect();
  });
}