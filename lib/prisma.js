import { PrismaClient } from "@prisma/client";

// 🧠 ป้องกัน memory leak ใน Next.js dev mode
const globalForPrisma = globalThis;

// 🧩 1️⃣ ลำดับความสำคัญของ connection URL
//    - ใช้ POOLER_URL (port 6543) ก่อน ถ้ามี
//    - ถ้าไม่มี → ใช้ DIRECT_URL (port 5432)
//    - ถ้าไม่มี → fallback ไป DATABASE_URL
let databaseUrl =
  process.env.POOLER_URL ||
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("❌ No DATABASE_URL or DIRECT_URL found in environment variables");
}

try {
  const url = new URL(databaseUrl);

  // 🧩 2️⃣ ตรวจว่าใช้ Pooler หรือ Direct
  const isUsingPooler =
    databaseUrl.includes("pooler.supabase.com") || url.port === "6543";

  // 🧩 3️⃣ ตั้งค่าพารามิเตอร์การเชื่อมต่อให้เหมาะกับ Free plan
  if (!url.searchParams.has("connection_limit")) {
    // ⚠️ อย่าตั้งสูงกว่า 10 สำหรับ Vercel Free Plan
    url.searchParams.set("connection_limit", isUsingPooler ? "10" : "5");
  }

  if (!url.searchParams.has("pool_timeout"))
    url.searchParams.set("pool_timeout", "10");

  if (!url.searchParams.has("connect_timeout"))
    url.searchParams.set("connect_timeout", "10");

  // บังคับ SSL (จำเป็นสำหรับ Supabase)
  url.searchParams.set("sslmode", "require");

  // แปลงกลับเป็น string
  databaseUrl = url.toString();

  console.log(
    `🔌 Using ${
      isUsingPooler ? "Supabase Pooler" : "Direct Connection"
    } → ${url.host}:${url.port} (limit=${
      url.searchParams.get("connection_limit") || "-"
    })`
  );
} catch (e) {
  console.warn("⚠️ Could not parse database URL:", e.message);
}

// 🧩 4️⃣ สร้าง Prisma Client แบบ singleton
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
    datasources: {
      db: { url: databaseUrl },
    },
  });

// ✅ เก็บไว้ใน global (dev mode reuse)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// 🧩 5️⃣ helper สำหรับ retry connection error
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

// 🧩 6️⃣ ปิด connection เวลา hot reload (เฉพาะ dev)
if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.dispose(async () => {
    await prisma.$disconnect();
  });
}