import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET() {
  try {
    // trivial roundtrip
    const r = await prisma.$queryRaw`select 1 as ok`;
    return NextResponse.json({ ok: true, r }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (e) {
    return NextResponse.json({ ok: false, message: e?.message || 'unknown' }, { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }
}


