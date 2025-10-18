import { prisma } from "@/lib/prisma";
import { createServerSupabase } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * Get usage statistics for current user
 * Returns today and month counts from Prisma database
 */
export async function GET(req) {
  try {
    // Verify user is authenticated via Supabase
    const supabase = await createServerSupabase();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    
    if (!supabaseUser?.email) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    // Use $queryRawUnsafe to avoid prepared statement cache issues
    const users = await prisma.$queryRawUnsafe(
      `SELECT * FROM "User" WHERE email = $1 LIMIT 1`,
      supabaseUser.email
    );

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        ok: false, 
        error: "USER_NOT_FOUND",
        message: "User not found in database. Please login again."
      }, { status: 404 });
    }

    const user = users[0];

    // Get today's stats
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayLogs = await prisma.$queryRawUnsafe(
      `SELECT * FROM "UsageLog" WHERE "userId" = $1 AND date >= $2 AND date <= $3`,
      user.id,
      startOfDay,
      endOfDay
    );

    const todayCount = todayLogs.reduce((sum, log) => sum + log.count, 0);

    // Get this month's stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthLogs = await prisma.$queryRawUnsafe(
      `SELECT * FROM "UsageLog" WHERE "userId" = $1 AND date >= $2`,
      user.id,
      startOfMonth
    );

    const monthCount = monthLogs.reduce((sum, log) => sum + log.count, 0);

    // Get user plan and quotas
    const plan = user.plan || "FREE";
    const quotaDay = plan === "PRO" ? 100 : plan === "BUSINESS" ? 500 : 20;
    const quotaMonth = plan === "PRO" ? 5000 : plan === "BUSINESS" ? 20000 : 1000;

    console.log(`✅ Usage stats for ${user.email}: today=${todayCount}, month=${monthCount}`);

    return NextResponse.json({
      ok: true,
      stats: {
        todayCount,
        monthCount,
        plan: plan.toLowerCase(),
        quotaDay,
        quotaMonth,
      },
    });

  } catch (error) {
    console.error("❌ Error getting usage stats:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "SERVER_ERROR",
      message: error.message 
    }, { status: 500 });
  }
}
