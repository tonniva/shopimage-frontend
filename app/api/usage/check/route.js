import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PLAN_LIMITS, getPeriodRange } from "@/lib/quota";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok:false, error:"UNAUTHORIZED" }, { status:401 });

  const { files = 1 } = await req.json().catch(()=>({ files:1 }));
  const plan = session.user.plan || "FREE";
  const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;

  const { start, end } = getPeriodRange(limit.per, new Date());
  const used = await prisma.usageLog.aggregate({
    _sum: { count: true },
    where: { userId: session.user.id, date: { gte: start, lte: end }, status: "ok" },
  });
  const usedCount = used._sum.count || 0;
  const remain = Math.max(0, limit.max - usedCount);

  const allowed = files <= remain;
  return NextResponse.json({ ok:true, allowed, remain, plan, period:limit.per, limit: limit.max });
}