import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok:false, error:"UNAUTHORIZED" }, { status:401 });

  const { count = 1, bytes = 0, status = "ok" } = await req.json().catch(()=>({}));
  await prisma.usageLog.create({ data: { userId: session.user.id, count, bytes, status }});
  return NextResponse.json({ ok:true });
}