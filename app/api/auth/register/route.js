import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";

export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password || password.length < 6)
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "อีเมลนี้มีอยู่แล้ว" }, { status: 409 });

  const passwordHash = await hash(password, 10);
  await prisma.user.create({ data: { email, passwordHash, plan: "FREE" } });
  return NextResponse.json({ ok: true });
}