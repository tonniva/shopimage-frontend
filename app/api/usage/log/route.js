import { prisma } from "@/lib/prisma";
import { createServerSupabase } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * Log usage to Prisma database
 * Works with Supabase authentication
 */
export async function POST(req) {
  try {
    const { email, count = 1, bytes = 0, status = "ok" } = await req.json();

    // Verify user is authenticated via Supabase
    const supabase = await createServerSupabase();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    
    if (!supabaseUser?.email) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    // Use $queryRawUnsafe to avoid prepared statement cache issues
    const users = await prisma.$queryRawUnsafe(
      `SELECT * FROM "User" WHERE email = $1 LIMIT 1`,
      email || supabaseUser.email
    );

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        ok: false, 
        error: "USER_NOT_FOUND",
        message: "User not found in database. Please login again."
      }, { status: 404 });
    }

    const user = users[0];

    // Create usage log using $executeRawUnsafe
    const result = await prisma.$executeRawUnsafe(
      `INSERT INTO "UsageLog" (id, "userId", date, count, bytes, status)
       VALUES (gen_random_uuid()::text, $1, NOW(), $2, $3, $4)`,
      user.id,
      count,
      bytes,
      status
    );

    console.log(`✅ Usage logged: ${user.email} - ${count} conversions`);

    return NextResponse.json({ 
      ok: true,
      usageLog: {
        count,
        date: new Date(),
      }
    });

  } catch (error) {
    console.error("❌ Error logging usage:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "SERVER_ERROR",
      message: error.message 
    }, { status: 500 });
  }
}
