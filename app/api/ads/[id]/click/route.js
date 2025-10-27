import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Track ad click
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    
    // Increment click count
    await prisma.advertisement.update({
      where: { id },
      data: {
        clicks: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking ad click:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track click' },
      { status: 500 }
    );
  }
}


